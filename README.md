# 🏠 Smart Home Simulator

A full-stack IoT simulation platform built with .NET 10, React, and MQTT.

## 🛠 Tech Stack

- **Backend:** C# .NET 10 Web API (Clean Architecture)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4
- **Infrastructure:** MQTT Broker (Mosquitto), Docker Compose
- **Communication:** WebSockets (Frontend ↔ Broker) & TCP (Backend ↔ Broker)

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
1.  **Docker Desktop** (Make sure it is running!)
2.  **.NET 10 SDK**
3.  **Node.js** (v18 or newer)

## 🚀 Getting Started

Follow these steps in order to start the simulator.

### 1. Start the Infrastructure (MQTT Broker)
Open a terminal in the root folder and run:
```bash
docker compose up -d
```
This spins up the Mosquitto Broker on ports 1883 (TCP) and 9001 (WebSockets).

### 2. Start the Backend (API)
Open a new terminal in the root folder:
```bash
cd backend/src/SmartHome.Api
dotnet run
```
API will be available at http://localhost:5xxx

### 3. Start the Frontend (Dashboard)
Open a new terminal in the root folder:
```bash
cd frontend
npm run dev
```
Dashboard will be available at http://localhost:5173

### 🛑 Stopping the Infrastructure
To stop the Docker containers and save resources:
```bash
docker compose down
```