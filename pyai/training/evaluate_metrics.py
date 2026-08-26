import torch
import yaml
import os
import timm
from train_tampering_classifier import TamperingDataset
from torch.utils.data import DataLoader
import torchvision.transforms as T

def evaluate():
    with open("config/config.yaml", "r") as f:
        cfg = yaml.safe_load(f)
        model_name = cfg["models"]["tampering"]["model_name"]
        data_dir = cfg["paths"]["synthetic_data_output"]
        weights_path = cfg["models"]["tampering"]["weights_path"]

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    if not os.path.exists(weights_path):
        print(f"Weights not found at {weights_path}. Train the model first.")
        return

    model = timm.create_model(model_name, pretrained=False, num_classes=2)
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model = model.to(device)
    model.eval()

    clean_dir = os.path.join(data_dir, "clean")
    tampered_dir = os.path.join(data_dir, "tampered")
    
    transform = T.Compose([
        T.Resize((380, 380)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    dataset = TamperingDataset(clean_dir, tampered_dir, transform=transform)
    if len(dataset) == 0:
        print("Dataset is empty.")
        return
        
    loader = DataLoader(dataset, batch_size=16, shuffle=False)

    y_true = []
    y_scores = []
    y_pred = []

    print("Evaluating...")
    with torch.no_grad():
        for inputs, labels in loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            
            _, predicted = torch.max(outputs.data, 1)
            
            y_true.extend(labels.cpu().numpy())
            y_scores.extend(probs[:, 1].cpu().numpy())
            y_pred.extend(predicted.cpu().numpy())

    try:
        from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score, confusion_matrix
        
        auc = roc_auc_score(y_true, y_scores)
        f1 = f1_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred)
        rec = recall_score(y_true, y_pred)
        cm = confusion_matrix(y_true, y_pred)

        print("\n--- Evaluation Metrics ---")
        print(f"ROC-AUC:   {auc:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print("Confusion Matrix:")
        print(cm)
    except ImportError:
        print("scikit-learn not installed. Cannot compute advanced metrics.")
        correct = sum([1 for i, j in zip(y_true, y_pred) if i == j])
        print(f"Accuracy: {correct / len(y_true):.4f}")

if __name__ == "__main__":
    evaluate()
