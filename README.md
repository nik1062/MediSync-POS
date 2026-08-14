# MediSync: Doctor-Patient Consultation & POS Platform

> A comprehensive full-stack ecosystem for modern healthcare facilities, bridging the gap between clinics, doctors, and patients through real-time communication and seamless digital experiences.

**Created by:** Nikunj Kumar and Ansh Dubey

---

## 🌟 Ecosystem Overview

The MediSync platform is divided into three primary components, working together to deliver a unified healthcare experience:

### 1. Patient Mobile App (Flutter)
A high-fidelity mobile application built with **Flutter 3.x** and **Dart**.
- **Tech Stack:** Flutter, Riverpod (State Management), GoRouter (Navigation), Dio (Networking), Socket.io-client (Real-time), Flutter Local Notifications.
- **Key Features:**
  - 🏥 **Home Discovery:** Find top doctors and clinics by specialty or proximity.
  - 📅 **Appointment Booking & Checkout:** Real-time slot selection, digital payments, and multi-patient support (Family Members).
  - ⏱️ **Live Queue HUD:** Real-time frosted-glass HUD tracking wait times, queue position, and token numbers using WebSockets.
  - 🗂️ **Digital Health Vault:** Longitudinal timeline of lab results, diagnostic markers, and vaccinations.
  - 💊 **Prescription & Pill Reminders:** Interactive digital Rx viewer and scheduled medication reminders.

### 2. Clinic POS / Admin Web App (React)
A robust dashboard and point-of-sale system for clinic staff and administration.
- **Tech Stack:** React, Vite, Tailwind CSS.
- **Key Features:** Patient check-ins, payment collection, queue management, and clinic profile configuration.

### 3. Backend System (Node.js)
The central nervous system of the platform handling data, authentication, and real-time events.
- **Tech Stack:** Node.js, Express, PostgreSQL (with SQLite for local development), Socket.io.
- **Key Features:** Secure JWT authentication, UUID v4 based routing, RESTful APIs, and real-time Socket.io namespace emissions for live queue updates.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (v3.19+)
- npm or yarn

### 1. Starting the Backend
```bash
cd backend
npm install
npm run dev
```
*The backend server will start locally (default: `http://localhost:5000`). Database syncs automatically.*

### 2. Running the Patient App (Flutter)
```bash
cd patient_app
flutter pub get
flutter run
```
*Available on iOS, Android, and Web.*

### 3. Running the Clinic Web App (React)
```bash
# In the root or POS directory
npm install
npm run dev
```

---

## 📁 Repository Structure
```text
doctor-patient-consultation-fullstack/
├── backend/                              # Node.js Express API & Database
├── patient_app/                          # Flutter Patient Mobile App
│   ├── lib/
│   │   ├── core/                         # Routing, Theme, Network configs
│   │   ├── features/                     # Feature-first architecture (Auth, Booking, Queue, Records)
│   │   ├── models/                       # Data entities (Patient, Appointment)
│   │   └── providers/                    # Riverpod state managers
├── stitch_medisync_patient_app_mobile/   # Raw HTML/Tailwind high-fidelity mockups
├── .gitignore
└── README.md
```

---

## ✨ Roadmap & Future Features
- **Teleconsultation (WebRTC):** Direct video calls between doctors and patients.
- **AI Diagnostics Assistant:** Automated health insights based on lab reports uploaded to the Health Vault.
- **Biometric App Lock:** FaceID / Fingerprint security for the Patient app.

## 📄 License
All rights reserved. This is a proprietary startup project.