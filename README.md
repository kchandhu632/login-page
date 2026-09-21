# Aura — Minimalistic Authentication Web Application

A clean, modern, and accessible login and registration web application designed with a sleek minimalist aesthetic inspired by Linear, Vercel, and Apple design systems.

---

## ✨ Features

- 🌓 **Adaptive Light & Dark Mode**: Seamless toggling with smooth transitions and `localStorage` persistence (plus system preference auto-detection).
- 🔄 **Sign In & Sign Up Modes**: Instant tab switching with smooth transitions and dynamic headers/footers.
- 👁️ **Password Visibility Toggles**: Interactive show/hide password buttons with crisp SVG icons.
- 📊 **Dynamic Password Strength Meter**: Real-time 4-stage visual indicator (Weak, Fair, Good, Strong) based on length, casing, numbers, and special characters.
- ⚡ **Interactive Form Validation**: Client-side validation with inline error messages, real-time input error clearing, and card shake feedback.
- 🔑 **Password Reset Modal**: Accessible forgot password modal with backdrop blur, email validation, and keyboard support (`Escape` to close).
- 🌐 **OAuth / Social Login Mock**: Styled single-click authorization buttons for Google, GitHub, and Apple.
- 🔔 **Toast Notification System**: Floating, auto-dismissing toast alerts for feedback and status updates.
- 👤 **Session Dashboard Simulation**: Full authenticated user dashboard with verified session status and sign-out flow.

---

## 🚀 Getting Started

### 1. Open in Browser
No build steps or dependencies required! You can open `index.html` directly:
- Double-click on `index.html` in your file explorer, or
- Right click and choose **Open with > Chrome / Edge / Firefox / Safari**, or
- Open your browser and navigate to `file:///C:/Users/kchan/.gemini/antigravity/scratch/minimal-login/index.html`.

### 2. Run with a Local Static Server (Optional)
If you prefer running a local server:

Using Python:
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000`.

Using Node / npx:
```bash
npx serve .
```

---

## 📁 Project Structure

```
minimal-login/
├── index.html     # Semantic HTML5 layout with accessible forms and modals
├── style.css      # CSS variables, modern dark/light styling, and micro-interactions
├── app.js         # State handling, form validation, theme switching, and mock auth
└── README.md      # Documentation and integration guide
```

---

## 🔌 Connecting to a Real Backend

To wire this UI into a real authentication backend:

### Option A: REST API / Express / Django / FastAPI
In `app.js`, replace the `setTimeout` inside `signInForm.addEventListener('submit', ...)`:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: emailVal, password: passVal })
});
const data = await response.json();
if (response.ok) {
  loginUser(data.user);
} else {
  showToast('Authentication Failed', data.message || 'Invalid credentials', 'error');
}
```

### Option B: Supabase
```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('SUPABASE_URL', 'SUPABASE_ANON_KEY');

const { data, error } = await supabase.auth.signInWithPassword({
  email: emailVal,
  password: passVal,
});
```

### Option C: Firebase Auth
```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth();
await signInWithEmailAndPassword(auth, emailVal, passVal);
```
