/**
 * Aura — Minimalistic Authentication Web Application
 * Live Firebase Authentication & Realtime Database Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // Element References
  // =========================================================================
  const htmlElement = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  const authCard = document.getElementById('authCard');
  const formTitle = document.getElementById('formTitle');
  const formSubtitle = document.getElementById('formSubtitle');
  const footerText = document.getElementById('footerText');
  const switchToSignUpBtn = document.getElementById('switchToSignUp');

  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  const signInSubmitBtn = document.getElementById('signInSubmitBtn');
  const signUpSubmitBtn = document.getElementById('signUpSubmitBtn');

  // Sign In fields
  const signInEmail = document.getElementById('signInEmail');
  const signInPassword = document.getElementById('signInPassword');
  const signInEmailError = document.getElementById('signInEmailError');
  const signInPasswordError = document.getElementById('signInPasswordError');

  // Sign Up fields
  const signUpName = document.getElementById('signUpName');
  const signUpEmail = document.getElementById('signUpEmail');
  const signUpPassword = document.getElementById('signUpPassword');
  const signUpConfirmPassword = document.getElementById('signUpConfirmPassword');
  const acceptTerms = document.getElementById('acceptTerms');

  const signUpNameError = document.getElementById('signUpNameError');
  const signUpEmailError = document.getElementById('signUpEmailError');
  const signUpPasswordError = document.getElementById('signUpPasswordError');
  const signUpConfirmError = document.getElementById('signUpConfirmError');
  const termsError = document.getElementById('termsError');

  // Strength Meter
  const strengthBars = [
    document.getElementById('bar1'),
    document.getElementById('bar2'),
    document.getElementById('bar3'),
    document.getElementById('bar4')
  ];
  const strengthLabel = document.getElementById('strengthLabel');

  // Social Buttons
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const githubLoginBtn = document.getElementById('githubLoginBtn');
  const appleLoginBtn = document.getElementById('appleLoginBtn');

  // Forgot Password Modal
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelResetBtn = document.getElementById('cancelResetBtn');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const resetEmail = document.getElementById('resetEmail');
  const resetEmailError = document.getElementById('resetEmailError');
  const submitResetBtn = document.getElementById('submitResetBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  let currentMode = 'signin';

  // =========================================================================
  // Theme Management
  // =========================================================================
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('aura_theme');
    if (savedTheme) {
      htmlElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      htmlElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  };

  const toggleTheme = () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('aura_theme', newTheme);
    showToast('Theme updated', `Switched to ${newTheme} mode`, 'info');
  };

  themeToggle.addEventListener('click', toggleTheme);
  initializeTheme();

  // =========================================================================
  // Active Auth Check (Redirect to Dashboard if already logged in)
  // =========================================================================
  if (auth) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is already authenticated -> redirect directly to dashboard
        window.location.replace('dashboard.html');
      }
    });
  }

  // =========================================================================
  // Tab Switching
  // =========================================================================
  const setMode = (mode) => {
    currentMode = mode;
    clearErrors();

    if (mode === 'signin') {
      tabSignIn.classList.add('active');
      tabSignIn.setAttribute('aria-selected', 'true');
      tabSignUp.classList.remove('active');
      tabSignUp.setAttribute('aria-selected', 'false');

      signInForm.classList.remove('hidden');
      signUpForm.classList.add('hidden');

      formTitle.textContent = 'Welcome back';
      formSubtitle.textContent = 'Enter your credentials to access your account';

      footerText.innerHTML = `Don't have an account? <button type="button" id="switchToSignUp" class="inline-link bold">Sign up</button>`;
      document.getElementById('switchToSignUp').addEventListener('click', () => setMode('signup'));
    } else {
      tabSignUp.classList.add('active');
      tabSignUp.setAttribute('aria-selected', 'true');
      tabSignIn.classList.remove('active');
      tabSignIn.setAttribute('aria-selected', 'false');

      signUpForm.classList.remove('hidden');
      signInForm.classList.add('hidden');

      formTitle.textContent = 'Create an account';
      formSubtitle.textContent = 'Join Aura and get started in seconds';

      footerText.innerHTML = `Already have an account? <button type="button" id="switchToSignIn" class="inline-link bold">Sign in</button>`;
      document.getElementById('switchToSignIn').addEventListener('click', () => setMode('signin'));
    }
  };

  tabSignIn.addEventListener('click', () => setMode('signin'));
  tabSignUp.addEventListener('click', () => setMode('signup'));
  switchToSignUpBtn.addEventListener('click', () => setMode('signup'));

  // =========================================================================
  // Password Visibility Toggle
  // =========================================================================
  document.querySelectorAll('.toggle-password-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeShow = btn.querySelector('.eye-show');
      const eyeHide = btn.querySelector('.eye-hide');

      if (input.type === 'password') {
        input.type = 'text';
        eyeShow.style.display = 'none';
        eyeHide.style.display = 'block';
        btn.setAttribute('aria-label', 'Hide password');
        btn.setAttribute('title', 'Hide password');
      } else {
        input.type = 'password';
        eyeShow.style.display = 'block';
        eyeHide.style.display = 'none';
        btn.setAttribute('aria-label', 'Show password');
        btn.setAttribute('title', 'Show password');
      }
    });
  });

  // =========================================================================
  // Password Strength Meter
  // =========================================================================
  const evaluatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Enter a password', class: '' };

    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) score++;

    if (pass.length < 6) score = Math.min(score, 1);

    switch (score) {
      case 1:
        return { score: 1, text: 'Weak password', class: 'weak' };
      case 2:
        return { score: 2, text: 'Fair strength', class: 'fair' };
      case 3:
        return { score: 3, text: 'Good password', class: 'good' };
      case 4:
        return { score: 4, text: 'Strong & secure', class: 'strong' };
      default:
        return { score: 0, text: 'Too short (min 8 chars)', class: 'weak' };
    }
  };

  signUpPassword.addEventListener('input', () => {
    const val = signUpPassword.value;
    const result = evaluatePasswordStrength(val);

    strengthLabel.textContent = result.text;
    strengthBars.forEach((bar, index) => {
      bar.className = 'strength-bar';
      if (val.length > 0 && index < result.score) {
        bar.classList.add(result.class);
      }
    });
  });

  // =========================================================================
  // Validation Helpers
  // =========================================================================
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const showError = (inputElement, errorElement, message) => {
    inputElement.classList.add('input-error');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
  };

  const clearErrors = () => {
    document.querySelectorAll('.form-input').forEach((input) => input.classList.remove('input-error'));
    document.querySelectorAll('.field-error').forEach((err) => {
      err.textContent = '';
      err.classList.remove('visible');
    });
  };

  [signInEmail, signInPassword, signUpName, signUpEmail, signUpPassword, signUpConfirmPassword, resetEmail].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const errSpan = input.closest('.form-group')?.querySelector('.field-error');
        if (errSpan) {
          errSpan.textContent = '';
          errSpan.classList.remove('visible');
        }
      });
    }
  });

  const triggerShake = (element) => {
    element.classList.remove('shake-error');
    void element.offsetWidth;
    element.classList.add('shake-error');
    setTimeout(() => element.classList.remove('shake-error'), 400);
  };

  // Convert Firebase error codes into friendly human-readable explanations
  const parseFirebaseError = (errorCode, defaultMessage) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use at least 6-8 characters.';
      case 'auth/invalid-email':
        return 'The email address format is not valid.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful attempts. Please try again later.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in your Firebase Console.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'Popup blocked by browser. Please allow popups for authentication.';
      default:
        return defaultMessage || 'Authentication failed. Please try again.';
    }
  };

  // =========================================================================
  // Live Firebase Sign In
  // =========================================================================
  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    let valid = true;
    const emailVal = signInEmail.value.trim();
    const passVal = signInPassword.value;

    if (!emailVal) {
      showError(signInEmail, signInEmailError, 'Email address is required');
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      showError(signInEmail, signInEmailError, 'Please enter a valid email address');
      valid = false;
    }

    if (!passVal) {
      showError(signInPassword, signInPasswordError, 'Password is required');
      valid = false;
    }

    if (!valid) {
      triggerShake(authCard);
      return;
    }

    setButtonLoading(signInSubmitBtn, true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(emailVal, passVal);
      const user = userCredential.user;

      showToast('Authenticated!', `Welcome back! Redirecting to dashboard...`, 'success');

      // Seamless redirect to dashboard
      setTimeout(() => {
        window.location.replace('dashboard.html');
      }, 500);

    } catch (error) {
      setButtonLoading(signInSubmitBtn, false);
      const friendlyMsg = parseFirebaseError(error.code, error.message);
      showError(signInPassword, signInPasswordError, friendlyMsg);
      showToast('Login Failed', friendlyMsg, 'error');
      triggerShake(authCard);
    }
  });

  // =========================================================================
  // Live Firebase Sign Up & Realtime Database Record
  // =========================================================================
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    let valid = true;
    const nameVal = signUpName.value.trim();
    const emailVal = signUpEmail.value.trim();
    const passVal = signUpPassword.value;
    const confirmVal = signUpConfirmPassword.value;

    if (!nameVal) {
      showError(signUpName, signUpNameError, 'Full name is required');
      valid = false;
    }

    if (!emailVal) {
      showError(signUpEmail, signUpEmailError, 'Email address is required');
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      showError(signUpEmail, signUpEmailError, 'Please enter a valid email address');
      valid = false;
    }

    if (!passVal) {
      showError(signUpPassword, signUpPasswordError, 'Password is required');
      valid = false;
    } else if (passVal.length < 6) {
      showError(signUpPassword, signUpPasswordError, 'Password must be at least 6 characters');
      valid = false;
    }

    if (passVal !== confirmVal) {
      showError(signUpConfirmPassword, signUpConfirmError, 'Passwords do not match');
      valid = false;
    }

    if (!acceptTerms.checked) {
      termsError.textContent = 'You must agree to the Terms & Privacy Policy';
      termsError.classList.add('visible');
      valid = false;
    }

    if (!valid) {
      triggerShake(authCard);
      return;
    }

    setButtonLoading(signUpSubmitBtn, true);

    try {
      // 1. Create account in Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(emailVal, passVal);
      const user = userCredential.user;

      // 2. Set user display name
      await user.updateProfile({
        displayName: nameVal
      });

      // 3. Save user profile record to Firebase Realtime Database
      if (database) {
        try {
          await database.ref('users/' + user.uid).set({
            uid: user.uid,
            name: nameVal,
            email: emailVal,
            createdAt: new Date().toISOString(),
            statusNote: 'Account created with Aura Minimalist Auth'
          });
        } catch (dbErr) {
          console.warn('Realtime Database write note (check security rules if restricted):', dbErr);
        }
      }

      showToast('Account Created!', `Welcome, ${nameVal}! Redirecting to dashboard...`, 'success');

      // Redirect to dashboard
      setTimeout(() => {
        window.location.replace('dashboard.html');
      }, 600);

    } catch (error) {
      setButtonLoading(signUpSubmitBtn, false);
      const friendlyMsg = parseFirebaseError(error.code, error.message);
      showError(signUpEmail, signUpEmailError, friendlyMsg);
      showToast('Registration Error', friendlyMsg, 'error');
      triggerShake(authCard);
    }
  });

  // =========================================================================
  // Google OAuth Login
  // =========================================================================
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      showToast('Connecting', 'Opening Google sign-in...', 'info');
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Optionally record in Realtime Database
        if (database) {
          database.ref('users/' + user.uid).update({
            uid: user.uid,
            name: user.displayName || 'Google User',
            email: user.email,
            lastLogin: new Date().toISOString()
          }).catch(() => {});
        }

        showToast('Signed In', `Welcome, ${user.displayName || user.email}! Redirecting...`, 'success');
        setTimeout(() => {
          window.location.replace('dashboard.html');
        }, 500);

      } catch (error) {
        const friendlyMsg = parseFirebaseError(error.code, error.message);
        showToast('Google Sign-In', friendlyMsg, 'error');
      }
    });
  }

  // GitHub & Apple fallbacks
  if (githubLoginBtn) {
    githubLoginBtn.addEventListener('click', () => {
      showToast('Provider Notice', 'To enable GitHub login, configure the GitHub Provider in your Firebase Console.', 'info');
    });
  }

  if (appleLoginBtn) {
    appleLoginBtn.addEventListener('click', () => {
      showToast('Provider Notice', 'To enable Apple login, configure Apple Provider in your Firebase Console.', 'info');
    });
  }

  // =========================================================================
  // Forgot Password Modal (Firebase Password Reset)
  // =========================================================================
  const openModal = () => {
    forgotPasswordModal.classList.remove('hidden');
    resetEmail.value = signInEmail.value || '';
    resetEmail.focus();
  };

  const closeModal = () => {
    forgotPasswordModal.classList.add('hidden');
    resetEmail.classList.remove('input-error');
    resetEmailError.textContent = '';
    resetEmailError.classList.remove('visible');
  };

  forgotPasswordLink.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelResetBtn.addEventListener('click', closeModal);

  forgotPasswordModal.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !forgotPasswordModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailVal = resetEmail.value.trim();

    if (!emailVal || !isValidEmail(emailVal)) {
      showError(resetEmail, resetEmailError, 'Please enter a valid email address');
      return;
    }

    setButtonLoading(submitResetBtn, true);

    try {
      await auth.sendPasswordResetEmail(emailVal);
      setButtonLoading(submitResetBtn, false);
      closeModal();
      showToast('Reset Link Sent', `Password reset instructions sent to ${emailVal}`, 'success');
      resetEmail.value = '';
    } catch (error) {
      setButtonLoading(submitResetBtn, false);
      const friendlyMsg = parseFirebaseError(error.code, error.message);
      showError(resetEmail, resetEmailError, friendlyMsg);
      showToast('Reset Failed', friendlyMsg, 'error');
    }
  });

  // =========================================================================
  // Helper: Button Loading State
  // =========================================================================
  function setButtonLoading(btn, isLoading) {
    if (isLoading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  // =========================================================================
  // Toast Notifications System
  // =========================================================================
  function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      `;
    } else if (type === 'error') {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      `;
    } else {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      `;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss notification">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 200);
    };

    closeBtn.addEventListener('click', dismiss);
    toastContainer.appendChild(toast);
    setTimeout(dismiss, 4200);
  }
});
