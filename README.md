# SatyaScan

## AI-Powered Document & Identity Verification for Border Checkpoints

SatyaScan is an AI-assisted document and identity verification platform built for **Smart India Hackathon 2026 – Problem Statement 26188** under the **Ministry of Home Affairs / Sashastra Seema Bal (SSB)**.

The system is designed to support border-checkpoint personnel by bringing document capture, OCR, document validation, tampering detection, biometric verification, risk assessment, and officer review into a single workflow.

> **Note:** SatyaScan is a decision-support and verification platform intended for development, demonstration, and SIH evaluation. Final action on flagged cases remains with authorized personnel.

---

## Table of Contents

- [Overview](#overview)
- [How SatyaScan Works](#how-satyascan-works)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Python AI Engine](#python-ai-engine)
- [AI Integration Modes](#ai-integration-modes)
- [Demo Accounts](#demo-accounts)
- [API Overview](#api-overview)
- [Verification Verdicts](#verification-verdicts)
- [Testing](#testing)
- [Security & Development Notes](#security--development-notes)
- [SIH Reference](#sih-reference)

---

## Overview

Identity verification at a border checkpoint can require several independent checks:

- Is the submitted document readable?
- Can the required identity fields be extracted?
- Does the document format pass validation?
- Does the document show signs of tampering?
- Does the person's face match the photograph on the identity document?
- Does the result require manual review?

SatyaScan combines these checks into a unified verification workflow.

The platform consists of:

- A **React frontend** for document submission, identity verification, review, and administration.
- A **Node.js / Express backend** responsible for authentication, document processing, business logic, persistence, and APIs.
- A **PostgreSQL database** managed with Prisma ORM.
- An optional **Python AI engine** that performs OCR, document analysis, tampering detection, and biometric verification.

---

## How SatyaScan Works

The verification flow is designed around multiple stages:

```text
Document / Identity Input
          │
          ▼
   Document Capture
          │
          ▼
     OCR Extraction
          │
          ▼
  Format / Field Validation
          │
          ▼
 Tampering / Forensic Analysis
          │
          ▼
     Risk Assessment
          │
          ├───────────────┐
          │               │
          ▼               ▼
        PASS            REVIEW
          │               │
          │        Officer Review
          │               │
          └───────┬───────┘
                  ▼
           Final Verification
                  │
                  ▼
             Audit Record


Key Features
Document Verification
SatyaScan supports document categories including:
- Passport
- Aadhaar / National ID
- PAN Card
- Driving Licence
- Voter ID
- Permit


OCR & Field Extraction
The AI pipeline can extract and process identity information such as:
- Name
- Document number
- Date of birth
- Nationality
- Expiry date
- Gender
- Address
- Issuing authority


Document Validation
The verification process includes document-format and field validation where supported by the selected document type.
Tampering Detection
The AI engine includes document-forensics functionality for detecting suspicious manipulation and image anomalies.
Face Verification
A live selfie can be compared with the face shown on the identity document as part of the identity-verification workflow.
Risk Assessment
Verification results are converted into a final risk-based verdict:
- PASS
- REVIEW
- FAIL
Officer Review
Cases requiring manual inspection can be routed to authorized officers.
Officers can:
- View flagged submissions
- Inspect verification results
- Approve submissions
- Reject submissions
- Add review notes
- Review previous decisions
Administration
Administrative functionality includes:
- User management
- Pending-user approval
- Audit-log access
- System statistics
- Verification/review monitoring
Real-Time Processing Updates
SatyaScan uses Socket.IO for real-time status communication between the backend and frontend during processing.
User Roles
Role	Responsibility
SUBMITTER	Upload documents and start verification
OFFICER	Review flagged submissions and make decisions
ADMIN	Manage users, audit records, and system-level statistics




System Architecture
┌───────────────────────────┐
│       React Client        │
│ React + Vite + Tailwind   │
└─────────────┬─────────────┘
              │
       REST API / Socket.IO
              │
              ▼
┌───────────────────────────┐
│      Node.js Server       │
│ Express + Prisma + Auth   │
└──────────┬─────────┬──────┘
           │         │
           │         │ REST
           │         ▼
           │   ┌────────────────────┐
           │   │   Python AI Engine │
           │   │      FastAPI       │
           │   │ OCR / Forensics /  │
           │   │ Biometric Analysis │
           │   └────────────────────┘
           │
           ▼
┌───────────────────────────┐
│      PostgreSQL 16        │
│      Prisma ORM           │
└───────────────────────────┘

Technology Stack
Frontend
- React 18
- Vite
- Tailwind CSS
- shadcn/ui / Radix UI
- React Router
- Axios
- React Hook Form
- Zod
- Socket.IO Client
- Recharts
- React Webcam
- MediaPipe
- Framer Motion
Backend
- Node.js
- Express 5
- Prisma ORM
- PostgreSQL 16
- Socket.IO
- JWT authentication
- Multer
- Zod
- Helmet
- Express Rate Limit
AI Engine
- Python
- FastAPI
- OCR / document-processing components
- OpenCV
- InsightFace
- PyTorch / TorchVision
- timm
- ONNX Runtime
- Pytest



Repository Structure
SatyaScan/
├── client/                  # React frontend
├── server/                  # Node.js / Express backend
│   ├── prisma/              # Prisma schema, migrations and seed
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── sockets/
│       └── utils/
├── pyai/                    # Python AI engine
│   ├── api/
│   ├── config/
│   ├── datasets/
│   ├── models/
│   ├── tests/
│   └── training/
├── docker-compose.yml       # PostgreSQL + Adminer
├── package.json             # Root development scripts
├── package-lock.json
├── .env.example
└── README.md

Prerequisites
Install the following before running SatyaScan locally:
- Node.js 18+ or Node.js 20+
- npm
- Docker Desktop / Docker Engine
- Python 3.10+ for the AI engine
Local Setup
1. Clone the repository
git clone https://github.com/royy-05/SatyaScan.git
cd SatyaScan

2. Start PostgreSQL
From the repository root:
docker compose up -d

This starts:
- PostgreSQL 16 on localhost:5433
- Adminer on http://localhost:8080
The database is configured with:
Database: satyascan_db
User:     satyascan
Password: satyascan_pass
Host:     localhost
Port:     5433

3. Configure and start the backend
Open a terminal in the repository root:
cd server
npm install

Create the server environment file:
cp .env.example .env

Then run the database migration:
npm run prisma:migrate

Seed the local development database:
npm run prisma:seed

Start the backend:
npm run dev

The backend is configured to run on port 4000 in the repository environment examples.
4. Configure and start the frontend
Open a second terminal:
cd client
npm install

Create the client environment file:
cp .env.example .env

Set the client API and Socket.IO URLs to match the backend:
VITE_API_URL="http://localhost:4000/api/v1"
VITE_SOCKET_URL="http://localhost:4000"

Then start the frontend:
npm run dev

The frontend will normally be available at:
http://localhost:5173

On Windows PowerShell, if cp is unavailable, use:
Copy-Item .env.example .env


5. Run the Node application from the root
The repository also provides root-level development scripts.
From the project root:
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev

npm run dev starts the frontend and backend together.


Python AI Engine
The pyai/ directory contains the separate AI service.
Its responsibilities include document scanning, OCR/field processing, tampering analysis, biometric verification, model training utilities, and AI pipeline tests.
AI service structure
pyai/
├── api/          # FastAPI endpoints
├── config/       # thresholds and configuration
├── datasets/     # synthetic data generation
├── models/       # model wrappers
├── tests/        # pytest tests
└── training/     # training/evaluation scripts

Run the Python AI Engine
From the repository root:
cd pyai

Create a virtual environment:
python -m venv .venv

Windows
.venv\Scripts\activate

Linux / macOS
source .venv/bin/activate

Install the dependencies:
pip install -r requirements.txt

Start the FastAPI service:
uvicorn api.server:app --reload --port 8000

The AI service will then be available at:
http://localhost:8000

AI Service Endpoints
The Python service exposes two primary endpoints:
POST /scan
Used for document scanning and analysis.
The backend sends the document image to this endpoint when live AI mode is enabled.
POST /verify
Used for biometric identity verification using the document identity image and selfie data.
AI Integration Modes
SatyaScan can operate with either the backend's internal stub result or the separate Python AI engine.
Stub Mode
Set the following in server/.env:
PYTHON_AI_URL=""

This keeps the application independent of the Python service and uses the backend's built-in deterministic verification result.
Stub mode is useful for:
- Frontend development
- Backend development
- UI demonstrations
- Fast local testing
Live AI Mode
Set:
PYTHON_AI_URL="http://localhost:8000"

The Node.js backend will then communicate with the Python AI service.
Make sure the Python service is running before starting live AI verification.
Demo Accounts
The Prisma seed script creates approved local development accounts for each application role.
Role	Email	Password
Admin	admin@satyascan.local	Admin@123
Officer	officer@satyascan.local	Officer@123
Submitter	submitter@satyascan.local	Submitter@123


These credentials are for local development and demonstration only. Never use them in a production deployment.

API Overview
The backend exposes versioned APIs under:
/api/v1

Main API groups include:
/api/v1/auth
/api/v1/documents
/api/v1/reviews
/api/v1/admin
/api/v1/config

Health endpoints include:
GET /health
GET /ready
GET /api/v1/health

Verification Verdicts
SatyaScan uses three primary verification outcomes:
Verdict	Meaning
PASS	Verification completed without a significant detected issue
REVIEW	The submission requires manual officer review
FAIL	Verification indicates a high-risk or failed condition


The verification result also stores layer-level information and the overall verification score.
Testing
Backend linting
From server/:
npm run lint

Frontend linting
From client/:
npm run lint

Run both frontend and backend linting
From the repository root:
npm run lint

Python AI tests
From pyai/:
pytest tests/test_pipeline.py -v

The Python test suite covers core pipeline functionality including risk calculations, parsing logic, and biometric-related behavior.
Security & Development Notes
SatyaScan includes application-level security and monitoring mechanisms such as:
- JWT access and refresh-token authentication
- Role-based access control
- Input validation
- Security headers
- Request rate limiting
- Document file hashing
- Device fingerprint tracking
- Velocity/event tracking
- Audit logging
The AI repository uses synthetic data for development and testing.
Do not upload or process real citizen identity documents or personally identifiable information in an untrusted development environment.


SIH Reference
Smart India Hackathon 2026
- Problem Statement: 26188
- Ministry: Ministry of Home Affairs
- Organization: Sashastra Seema Bal (SSB)
- Project: SatyaScan
- Focus: AI-assisted document and identity verification for border checkpoints
Project Status
SatyaScan is being developed as a Smart India Hackathon 2026 project.
The current repository provides the frontend, backend, database integration, verification workflow, optional Python AI engine, and local development setup.
Production deployment, government-system integrations, production-grade storage, infrastructure hardening, and other operational requirements may require additional implementation before real-world deployment.
