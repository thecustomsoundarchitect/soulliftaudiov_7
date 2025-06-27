import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAy_j8eY964GwySbwz8Ixhqr4Uwq-2ijhI",
  authDomain: "emotional-978ec.firebaseapp.com",
  projectId: "emotional-978ec",
  storageBucket: "emotional-978ec.appspot.com",
  messagingSenderId: "310774535075",
  appId: "1:310774535075:web:1e6fd614d3dfde11e1c016",
  measurementId: "G-LF4GE0RZT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Enable persistence for auth state
auth.useDeviceLanguage();

export { app, auth, db, storage, googleProvider };