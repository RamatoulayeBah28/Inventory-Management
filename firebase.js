// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdqvIU4_2QicqMgaa0NYJn-9EBZt5ryz4",
  authDomain: "inventorymanagement-6f11c.firebaseapp.com",
  projectId: "inventorymanagement-6f11c",
  storageBucket: "inventorymanagement-6f11c.appspot.com",
  messagingSenderId: "649035680262",
  appId: "1:649035680262:web:855cd16a99a583d2f1d187"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}