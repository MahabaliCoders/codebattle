import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyCuzH1qysSST5rn7vL0cePCtYUIEzJ9uNs",
  authDomain: "eventplanner-387be.firebaseapp.com",
  projectId: "eventplanner-387be",
  storageBucket: "eventplanner-387be.firebasestorage.app",
  messagingSenderId: "97366282597",
  appId: "1:97366282597:web:07b3d1e410b8868fd0918c",
  measurementId: "G-QK027VYDB4"
};

// Initialize Firebase (Check if already initialized for hot-reloading)
const isAppNewlyCreated = getApps().length === 0;
const app = isAppNewlyCreated ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with Offline Persistence (the 'perfect' way for HMR)
let db;
if (isAppNewlyCreated) {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} else {
  db = getFirestore(app);
}

// Initialize Analytics safely
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(err => {
  // Silently handle analytics failures (e.g. ad blockers)
});

export { app, auth, db, analytics };
