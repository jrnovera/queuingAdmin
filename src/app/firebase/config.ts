// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBW4b_j--atuUTJCHWAxqRxpwJD2ZJ1T5A",
  authDomain: "queuing-bd0b4.firebaseapp.com",
  projectId: "queuing-bd0b4",
  storageBucket: "queuing-bd0b4.firebasestorage.app",
  messagingSenderId: "40222817161",
  appId: "1:40222817161:web:cb6692ec8e453ced0fbf58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
