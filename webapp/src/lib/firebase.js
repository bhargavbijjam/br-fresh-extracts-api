import { getApps, initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseConfigured = requiredConfig.every(Boolean);

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const buildRecaptchaVerifier = (containerId, mode = 'invisible') => {
  if (typeof window === 'undefined') return null;
  try {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  } catch { /* ignore stale verifier */ }
  const size = mode === 'visible' ? 'normal' : 'invisible';
  const verifier = new RecaptchaVerifier(auth, containerId, {
    size,
    callback: () => { /* reCAPTCHA solved */ },
    'expired-callback': () => {
      try { verifier.clear(); } catch { /* ignore */ }
      window.recaptchaVerifier = null;
    },
  });
  window.recaptchaVerifier = verifier;
  return verifier;
};
