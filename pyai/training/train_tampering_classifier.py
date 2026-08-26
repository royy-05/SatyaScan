import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T
from PIL import Image
import timm
import glob
import yaml
import argparse
import json
import gc
from tqdm import tqdm

# Multi-Core CPU Optimization for AMD Ryzen 5
torch.set_num_threads(6)
torch.set_num_interop_threads(6)

class TamperingDataset(Dataset):
    def __init__(self, clean_dir, tampered_dir, transform=None):
        self.clean_images = glob.glob(os.path.join(clean_dir, "*.jpg")) + glob.glob(os.path.join(clean_dir, "*.png")) + glob.glob(os.path.join(clean_dir, "*.tif"))
        self.tampered_images = glob.glob(os.path.join(tampered_dir, "*.jpg")) + glob.glob(os.path.join(tampered_dir, "*.png")) + glob.glob(os.path.join(tampered_dir, "*.tif"))
        self.all_images = self.clean_images + self.tampered_images
        
        # 0 for clean, 1 for tampered
        self.labels = [0]*len(self.clean_images) + [1]*len(self.tampered_images)
        self.transform = transform

    def __len__(self):
        return len(self.all_images)

    def __getitem__(self, idx):
        img_path = self.all_images[idx]
        image = Image.open(img_path).convert('RGB')
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
            
        return image, label

def train_model(epochs=10, batch_size=32):
    with open("config/config.yaml", "r") as f:
        cfg = yaml.safe_load(f)
        data_dir = cfg["paths"]["synthetic_data_output"]

    clean_dir = os.path.join(data_dir, "clean")
    tampered_dir = os.path.join(data_dir, "tampered")
    
    if not os.path.exists(clean_dir) or not os.path.exists(tampered_dir):
        print(f"Data directories not found in {data_dir}. Please set up data first.")
        return

    device = torch.device('cpu') # Enforce CPU for this stable run
    print(f"Starting optimized CPU training on {device}")

    # Image Resolution: 224x224 patches for resnet34
    transform = T.Compose([
        T.Resize((224, 224)),
        T.RandomHorizontalFlip(),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    dataset = TamperingDataset(clean_dir, tampered_dir, transform=transform)
    
    if len(dataset) == 0:
        print("Dataset is empty. Please add images to clean and tampered folders.")
        return
        
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])

    # DataLoader parameters optimized for memory and CPU
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0, pin_memory=False)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0, pin_memory=False)

    print("Loading resnet34...")
    model = timm.create_model('resnet34', pretrained=True, num_classes=2)
    
    # Freeze the first two convolutional layer blocks (layer1, layer2)
    for name, param in model.named_parameters():
        if 'layer1' in name or 'layer2' in name or 'conv1' in name or 'bn1' in name:
            param.requires_grad = False
        else:
            param.requires_grad = True # Unfreeze layer3, layer4, and fc head
            
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=5e-4, weight_decay=1e-4)

    best_val_acc = 0.0
    metrics = []

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        train_correct = 0
        train_total = 0
        
        # TQDM Progress tracking
        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs} [Train]")
        for inputs, labels in pbar:
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += float(loss.item()) # Accumulate scalar only
            
            _, predicted = torch.max(outputs.data, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()
            
            pbar.set_postfix({'Loss': f"{loss.item():.4f}", 'Batch Acc': f"{100 * (predicted == labels).sum().item() / labels.size(0):.2f}%"})

        avg_train_loss = running_loss / len(train_loader)
        train_acc = 100 * train_correct / train_total

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        val_loss = 0.0
        
        with torch.no_grad():
            for inputs, labels in tqdm(val_loader, desc=f"Epoch {epoch+1}/{epochs} [Val]"):
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                val_loss += float(loss.item())
                
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()

        avg_val_loss = val_loss / len(val_loader)
        val_acc = 100 * val_correct / val_total
        
        print(f"\nEpoch [{epoch+1}/{epochs}] Summary:")
        print(f"Train Loss: {avg_train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"Val Loss:   {avg_val_loss:.4f} | Val Acc:   {val_acc:.2f}%\n")
        
        metrics.append({
            "epoch": epoch + 1,
            "train_loss": avg_train_loss,
            "train_acc": train_acc,
            "val_loss": avg_val_loss,
            "val_acc": val_acc
        })

        os.makedirs("models/weights", exist_ok=True)
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), "models/weights/tampering_classifier.pth")
            print(">>> New best model saved! <<<")
            
        # Explicit garbage collection to prevent RAM leaks
        del inputs, labels, outputs, loss
        gc.collect()

    with open("training_metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)
        
    print(f"Training complete. Best Validation Accuracy: {best_val_acc:.2f}%")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=32)
    args = parser.parse_args()
    
    train_model(args.epochs, args.batch_size)
