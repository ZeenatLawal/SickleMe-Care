# SickleMe Care+

A health management app for individuals with sickle cell disease. Track symptoms, manage medications, and receive crisis risk predictions based on tracked health data.

## Key Features

- **Health Tracking**: Pain, mood, hydration, and medication monitoring
- **Smart Notifications**: Daily reminders and risk assessments
- **Crisis Prediction**: Machine learning-powered risk analysis
- **Weather Integration**: Weather-based health risk alerts

## Technology

- React Native with Expo
- Firebase (Authentication & Database)
- Random Forest ML algorithm
- OpenWeatherMap API

## Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**

   - Create `.env.local` file with Firebase and OpenWeatherMap API keys
   - Add `google-services.json` to root directory

3. **Start the development server**
   ```bash
   npx expo start
   ```

## Files Included

- **Source Code**: Complete React Native application
- **APK File**: Ready-to-install Android application
- **Documentation**: Setup and usage instructions

## Project Structure

```
app/                 # Main app screens and navigation
├── (auth)/         # Authentication screens
├── (tabs)/         # Main tab navigation
└── education/      # Educational content

backend/            # Firebase backend functions
├── auth.ts         # Authentication logic
├── medications.ts  # Medication management
├── users.ts        # User data management
└── firebase.ts     # Firebase configuration

components/         # Reusable UI components
├── shared/         # Shared components
└── ui/            # UI-specific components

utils/              # Utility functions
├── context/        # React contexts
├── ml/            # Prediction algorithm
├── weather/       # Weather service integration
└── notifications.ts # Notification management

types/              # TypeScript type definitions

data/              # JSON files
```

## Main Components

- **Authentication**: Email/password login with Firebase
- **Health Tracking**: Pain, mood, hydration, medication logging
- **ML Predictions**: Random Forest algorithm for crisis risk assessment
- **Notifications**: Smart reminders and daily health check-ins
- **Weather Integration**: Location-based health risk factors

## Technical Implementation

- **Frontend**: React Native with TypeScript
- **State Management**: React Context API
- **Navigation**: Expo Router with file-based routing
- **Database**: Firebase Firestore for real-time data
- **Authentication**: Firebase Auth with email/password
- **Machine Learning**: Custom Random Forest implementation
- **Notifications**: Expo Notifications with background scheduling
- **Weather Data**: OpenWeatherMap API integration

---

**SickleMe Care+** - Mobile health management for sickle cell disease patients.
