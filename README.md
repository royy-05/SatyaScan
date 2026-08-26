# SatyaScan: AI-Powered Border Verification System

SatyaScan is an enterprise document and identity verification web application designed for border checkpoints (SIH 2026 problem statement 26188, Ministry of Home Affairs / SSB).

## Architecture

- **Client**: React 18, Vite, Tailwind CSS, shadcn/ui, Socket.IO Client, Axios, React Hook Form, Zod
- **Server**: Node.js, Express 5, Prisma ORM, Socket.IO, JWT Auth, Multer, Zod, Helmet, Express Rate Limit
- **Database**: PostgreSQL 16 in Docker
- **AI Service Integration**: REST API contract with optional Python AI service (`PYTHON_AI_URL`). Stubbed by default for fast local development.

---

## Prerequisites

- Node.js (v18+ or v20+)
- Docker Desktop / Docker Engine

---

## Quick Start Guide

### 1. Start Database Container
```bash
docker compose up -d
```
This starts PostgreSQL 16 on host port `5433` (mapped from container port 5432) and Adminer DB GUI on port `8080`.

### 2. Configure & Seed Server
```bash
cd server
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### 3. Configure & Launch Client
In a separate terminal:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Alternatively, from the root folder, run:
```bash
npm run db:up
npm run dev
```

---

## Default Admin Credentials

- **Email**: `admin@satyascan.local`
- **Password**: `Admin@123`

---

## Python AI Service Integration

SatyaScan supports both stub mode and real AI service integration.

- **Stub Mode (Default)**: When `PYTHON_AI_URL` is empty in `server/.env`, the system uses an internal mock verification engine that produces deterministic multi-layer verification scores (OCR, Validation, Tampering, Face Verification).
- **Live AI Mode**: Set `PYTHON_AI_URL="http://localhost:8000"` in `server/.env`. The backend will stream multipart image data to `${PYTHON_AI_URL}/verify` and record live AI responses seamlessly.
