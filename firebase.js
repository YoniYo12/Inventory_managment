// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbsUzrhIgmTfZvhqov2vZ9x_IDmLnS9wk",
  authDomain: "inventory-managment-60035.firebaseapp.com",
  projectId: "inventory-managment-60035",
  storageBucket: "inventory-managment-60035.appspot.com",
  messagingSenderId: "818722794200",
  appId: "1:818722794200:web:a477038a236c4106db85ad",
  measurementId: "G-M786MK6BTM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const storage = getStorage(app)

export {firestore, storage};