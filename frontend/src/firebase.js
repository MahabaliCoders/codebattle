// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuzH1qysSST5rn7vL0cePCtYUIEzJ9uNs",
  authDomain: "eventplanner-387be.firebaseapp.com",
  projectId: "eventplanner-387be",
  storageBucket: "eventplanner-387be.firebasestorage.app",
  messagingSenderId: "97366282597",
  appId: "1:97366282597:web:07b3d1e410b8868fd0918c",
  measurementId: "G-QK027VYDB4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };
