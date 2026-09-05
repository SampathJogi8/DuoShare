import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcSNtMLiJMF_I6FMMRF2DfCQrUP_5h0Ro",
  authDomain: "room-expense-888.firebaseapp.com",
  databaseURL: "https://room-expense-888-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "room-expense-888",
  storageBucket: "room-expense-888.firebasestorage.app",
  messagingSenderId: "428032292632",
  appId: "1:428032292632:web:0374353902454490b2906d",
  measurementId: "G-PZVV285W9F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export const db = getFirestore(app);

