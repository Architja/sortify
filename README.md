# EcoSentinel - AI-Powered Smart City Waste Management Platform

![EcoSentinel Banner](https://via.placeholder.com/1200x400/22c55e/ffffff?text=EcoSentinel+Smart+City+Platform)

A production-grade, full-stack AI-powered Smart Waste Management System. EcoSentinel simulates a network of smart IoT garbage bins deployed across a city, allows real-time monitoring, and lets users upload or capture garbage images for AI-based waste type detection and hazard analysis.

## Features

- **Real-time Smart Bin Dashboard:** Monitor bin fill levels and statuses using Firestore real-time listeners.
- **Interactive Map:** View bin locations on a Leaflet map with custom status markers.
- **AI Garbage Detection:** Upload or snap photos of waste. Powered by Gemini 2.0 Flash API to classify waste categories and identify hazards.
- **Analytics Dashboard:** Recharts-powered dashboard showing scan volume, hazard breakdown, and waste distribution.
- **Admin Panel & Collection Management:** Admins can manage users, view collection history, and export data as CSV.
- **Notifications & Alerts:** Real-time push alerts for overflowing bins and hazardous waste detections.
- **PWA Support:** Installable on mobile devices with offline caching via Vite PWA.
- **Cloud Functions:** Automated bin level simulation and critical alert email dispatch.

## Environment Variables

Create a `.env.local` file in the root directory:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | Firebase Console -> Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Firebase Console -> Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console -> Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket| Firebase Console -> Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Firebase Sender ID| Firebase Console -> Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Firebase Console -> Project Settings |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key | Google AI Studio |

## Local Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` file
4. Start the development server:
   ```bash
   npm run dev
   ```

## Firebase Setup Guide

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password and Google OAuth).
3. Enable **Firestore Database** (Create in production mode, then apply the provided rules).
4. Enable **Storage**.
5. Upgrade to the Blaze plan to enable **Cloud Functions**.
6. Set up Firestore Security Rules (copy contents from `firestore.rules`).
7. Required Firestore Indexes:
   - Collection: `alerts`, Fields: `read` (Ascending), `createdAt` (Descending)
   - Collection: `collections`, Fields: `collectedAt` (Descending)

## Deployment

### Deploying Cloud Functions
```bash
cd functions
npm install
npm run deploy
```

### Deploying the React App (Firebase Hosting)
```bash
npm run build
firebase deploy --only hosting
```

## Architecture

```
Frontend (React 18 + Vite) <---> Firebase Auth
         |                 <---> Firestore (Real-time DB)
         |                 <---> Firebase Storage
         v
 Gemini 2.0 Flash API (AI Vision)
         ^
         |
 Firebase Cloud Functions (Background Simulation & Email Alerts)
```

## Known Limitations and Future Improvements

- **Offline Mode:** While PWA caching is enabled, Firestore offline persistence is basic. Full offline syncing for collections could be added.
- **Routing:** Real-time routing for waste collection trucks based on full bins.
- **Hardware Integration:** Connect the platform to real IoT sensors via MQTT instead of Cloud Function simulation.
