// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC_1SmJU9O_ozTE51vpRFYIuTOSQN-ORhY",
    authDomain: "chat-web3-5e600.firebaseapp.com",
    projectId: "chat-web3-5e600",
    storageBucket: "chat-web3-5e600.firebasestorage.app",
    messagingSenderId: "849516935944",
    appId: "1:849516935944:web:547c9287ea8f37ecb64abd",
    measurementId: "G-RLHR0LSYWQ"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);