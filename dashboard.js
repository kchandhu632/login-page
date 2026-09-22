/**
 * Aura — Dashboard Interaction & Firebase Realtime Database Sync
 */

document.addEventListener('DOMContentLoaded', () => {
  const htmlElement = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const signOutBtn = document.getElementById('signOutBtn');

  const authLoadingState = document.getElementById('authLoadingState');
  const dashboardContent = document.getElementById('dashboardContent');

  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userAvatar = document.getElementById('userAvatar');
  const userUid = document.getElementById('userUid');
  const authProvider = document.getElementById('authProvider');
  const isEmailVerified = document.getElementById('isEmailVerified');
  const accountCreated = document.getElementById('accountCreated');
  const lastLoginTime = document.getElementById('lastLoginTime');

  const userNoteInput = document.getElementById('userNoteInput');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const dbSyncStatus = document.getElementById('dbSyncStatus');
  const dbLastSaved = document.getElementById('dbLastSaved');
  const dbJsonPreview = document.getElementById('dbJsonPreview');
  const toastContainer = document.getElementById('toastContainer');

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

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('aura_theme', newTheme);
    showToast('Theme updated', `Switched to ${newTheme} mode`, 'info');
  });

  initializeTheme();

  // =========================================================================
  // Authentication Guard & User Population
  // =========================================================================
  if (!auth) {
    showToast('Error', 'Firebase Auth could not be loaded.', 'error');
    return;
  }

  auth.onAuthStateChanged((user) => {
    if (!user) {
      // User is not signed in -> redirect immediately back to login page
      window.location.replace('index.html');
      return;
    }

    // Authenticated user exists -> render details
    const displayName = user.displayName || user.email.split('@')[0];
    const initial = displayName.charAt(0).toUpperCase();

    userName.textContent = displayName;
    userEmail.textContent = user.email || 'No email associated';
    userAvatar.textContent = initial;
    userUid.textContent = user.uid;

    const providerId = user.providerData?.[0]?.providerId || 'password';
    authProvider.textContent = providerId === 'password' ? 'Email & Password' : providerId;

    isEmailVerified.textContent = user.emailVerified ? 'Verified' : 'Unverified';
    if (user.emailVerified) {
      isEmailVerified.classList.add('verified-text');
    }

    accountCreated.textContent = user.metadata?.creationTime
      ? new Date(user.metadata.creationTime).toLocaleString()
      : 'N/A';

    lastLoginTime.textContent = user.metadata?.lastSignInTime
      ? new Date(user.metadata.lastSignInTime).toLocaleString()
      : 'Just now';

    // Reveal main dashboard
    authLoadingState.classList.add('hidden');
    dashboardContent.classList.remove('hidden');

    // Sync with Firebase Realtime Database
    setupRealtimeDatabase(user);
  });

  // =========================================================================
  // Firebase Realtime Database (RTDB) Integration
  // =========================================================================
  function setupRealtimeDatabase(user) {
    if (!database) {
      dbSyncStatus.textContent = 'Firebase Database SDK not found';
      return;
    }

    const userRef = database.ref('users/' + user.uid);

    // Initial listener for real-time data sync
    userRef.on('value', (snapshot) => {
      const val = snapshot.val();
      if (val) {
        dbJsonPreview.textContent = JSON.stringify(val, null, 2);
        if (val.statusNote && document.activeElement !== userNoteInput) {
          userNoteInput.value = val.statusNote;
        }
        if (val.updatedAt) {
          dbLastSaved.textContent = 'Last synced: ' + new Date(val.updatedAt).toLocaleTimeString();
        }
        dbSyncStatus.textContent = '● Realtime DB Live Sync active';
        dbSyncStatus.className = 'db-sync-text sync-online';
      } else {
        // Record does not exist yet; populate initial record
        const initialRecord = {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          createdAt: new Date().toISOString(),
          statusNote: 'Welcome to Aura Minimalist Dashboard!'
        };
        userRef.set(initialRecord).catch((err) => {
          console.warn('Database note: check Firebase RTDB rules if permission is denied.', err);
        });
      }
    }, (error) => {
      console.warn('Firebase RTDB listener error:', error);
      dbSyncStatus.textContent = 'Permission notice: ' + error.message;
      dbSyncStatus.className = 'db-sync-text sync-warn';
      dbJsonPreview.textContent = `// RTDB Notice: ${error.message}\n// If using default closed security rules, set rules to read/write for authenticated users in Firebase Console.`;
    });

    // Save Note / Status to Realtime Database
    saveNoteBtn.addEventListener('click', () => {
      const noteText = userNoteInput.value.trim();
      setButtonLoading(saveNoteBtn, true);

      userRef.update({
        statusNote: noteText,
        updatedAt: new Date().toISOString()
      }).then(() => {
        setButtonLoading(saveNoteBtn, false);
        showToast('Updated!', 'Note successfully saved to Firebase Realtime Database', 'success');
      }).catch((err) => {
        setButtonLoading(saveNoteBtn, false);
        showToast('Database Notice', err.message, 'error');
      });
    });
  }

  // =========================================================================
  // Sign Out Flow
  // =========================================================================
  signOutBtn.addEventListener('click', () => {
    signOutBtn.disabled = true;
    showToast('Signing out', 'Closing secure session...', 'info');

    auth.signOut()
      .then(() => {
        setTimeout(() => {
          window.location.replace('index.html');
        }, 350);
      })
      .catch((err) => {
        signOutBtn.disabled = false;
        showToast('Sign out error', err.message, 'error');
      });
  });

  // =========================================================================
  // UI Helpers: Button Loader & Toast
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
