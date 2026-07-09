// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5MHYHzqt2q_zli_CQW4buOF0gv6RtyTA",
    authDomain: "wayline-f3392.firebaseapp.com",
    projectId: "wayline-f3392",
    storageBucket: "wayline-f3392.firebasestorage.app",
    messagingSenderId: "912526305125",
    appId: "1:912526305125:web:f54bee80952dea63a7238c",
    measurementId: "G-0XW2N69J2J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;