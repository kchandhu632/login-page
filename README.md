# Aura — Minimalistic Authentication with Firebase

A clean, modern, and accessible login and registration web application connected directly to **Firebase Authentication** and **Firebase Realtime Database** (`aura-b6cf4`). Upon successful login, users are automatically redirected to a dedicated **Dashboard** page (`dashboard.html`) equipped with session guards, real-time database synchronization, and sign-out functionality.

---

## ✨ Features

- 🔥 **Live Firebase Authentication**:
  - **Email/Password Sign-In**: Authenticates existing accounts against Firebase Auth with friendly error message mapping.
  - **Email/Password Sign-Up**: Creates new Firebase Auth accounts, sets `displayName`, and saves user profiles to Firebase Realtime Database at `/users/{uid}`.
  - **Google OAuth**: One-click Google Sign-in with popup authorization.
  - **Password Reset**: Directly triggers Firebase password recovery emails.
- 🚀 **Two-Page Redirect Architecture**:
  - `index.html`: Login & registration portal with instant redirect to `dashboard.html` if already authenticated.
  - `dashboard.html`: Dedicated protected landing page with an authentication guard (unauthenticated users are automatically bounced back to `index.html`).
- ⚡ **Realtime Database Synchronization**:
  - Live two-way sync with `https://aura-b6cf4-default-rtdb.firebaseio.com`.
  - Displays user profile JSON snapshot and allows editing personal status notes saved in real time.
- 🌓 **Adaptive Light & Dark Mode**:
  - Shared design tokens and smooth transitions across both pages, persisted in `localStorage`.
- 📊 **Security & Micro-interactions**:
  - Real-time 4-segment password strength meter, password visibility toggle, field error highlighting, and card shake feedback.

---

## 🚀 How to Run

### Direct Browser Access (Zero Build Tools Needed)
The application uses official Firebase Compat CDN libraries, ensuring it runs cleanly whether opened directly from the file system or hosted on a web server:
- Open [index.html](file:///C:/Users/kchan/.gemini/antigravity/scratch/minimal-login/index.html) in your browser.

### Local Server (Optional)
Using Python:
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000`.

---

## 📁 Project Structure

```
minimal-login/
├── index.html          # Authentication portal (Sign In, Sign Up, Forgot Password)
├── dashboard.html      # Protected user dashboard (landing page after login)
├── firebase-config.js  # Firebase SDK configuration (aura-b6cf4)
├── app.js              # Auth logic, validation, and redirect triggers
├── dashboard.js        # Auth guard, profile loading, and Realtime Database sync
├── style.css           # Design tokens, Dark/Light modes, responsive styling
└── README.md           # Documentation
```

---

## ⚙️ Firebase Console Configuration

To get the most out of your Firebase project (`aura-b6cf4`):

1. **Enable Sign-in Providers**:
   - Go to [Firebase Console > Authentication > Sign-in method](https://console.firebase.google.com/project/aura-b6cf4/authentication/providers).
   - Ensure **Email/Password** is enabled.
   - If using Google Sign-In, ensure **Google** is enabled.

2. **Realtime Database Rules**:
   - Go to [Firebase Console > Realtime Database > Rules](https://console.firebase.google.com/project/aura-b6cf4/database/aura-b6cf4-default-rtdb/rules).
   - For authenticated users to read and write their own data, use:
     ```json
     {
       "rules": {
         "users": {
           "$uid": {
             ".read": "auth != null && auth.uid == $uid",
             ".write": "auth != null && auth.uid == $uid"
           }
         }
       }
     }
     ```
   - (For local testing before enabling strict rules, `.read: true, .write: true` can be temporarily used in test mode).
