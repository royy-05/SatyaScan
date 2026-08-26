# SIH26188 - AI-Based Fake Identity & Document Screening System

This repository contains the AI Engine for the Ministry of Home Affairs (MHA) problem statement SIH26188.

## Project Structure
- `api/`: FastAPI server endpoints
- `config/`: Configuration parameters (thresholds, weights)
- `datasets/`: Scripts to download benchmarks and generate synthetic IDs
- `models/`: Wrappers for PaddleOCR, InsightFace, and Timms models
- `tests/`: Pytest suite
- `training/`: Training and evaluation scripts for the Tampering Classifier

## Setup Instructions

1. **Install Dependencies**
   It is highly recommended to use a virtual environment with Python 3.10.
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate Synthetic Data**
   Since real KYC data cannot be used, we generate synthetic IDs.
   ```bash
   python datasets/generator/synthetic_ids.py --count 100
   python datasets/generator/tamper_injector.py
   ```

3. **Train the Models (Optional)**
   Fine-tune the EfficientNet-B4 model on the synthetic tampered data.
   ```bash
   python training/train_tampering_classifier.py --epochs 5 --batch_size 16
   ```

4. **Run the Test Suite**
   Validate that the risk calculations, MRZ parsers, and biometric logic function properly.
   ```bash
   pytest tests/test_pipeline.py -v
   ```

5. **Start the API Server**
   Start the FastAPI server to expose endpoints (`/scan`, `/verify`) for the inspection frontend.
   ```bash
   uvicorn api.server:app --reload --port 8000
   ```

## Disclaimer
This project uses synthetic data to comply with DPDP Act and IT Act regulations regarding Personally Identifiable Information (PII). No real citizen data is included or should be processed in untrusted environments.
