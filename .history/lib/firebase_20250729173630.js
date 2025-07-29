// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1LtI3PL45VN8kmtkjHLJkSJUxQtW0fts",
  authDomain: "comandas-multiples.firebaseapp.com",
  projectId: "comandas-multiples",
  storageBucket: "comandas-multiples.firebasestorage.app",
  messagingSenderId: "904018062842",
  appId: "1:904018062842:web:7db46c62161e7c89768843",
  measurementId: "G-FTGLFVRKHX",
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
