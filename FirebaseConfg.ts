// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDe2LJzWY-AWSLo9-SeGwctR_vrWvzj6tE",
  authDomain: "taskmanagerapp-741b8.firebaseapp.com",
  projectId: "taskmanagerapp-741b8",
  storageBucket: "taskmanagerapp-741b8.appspot.com",
  messagingSenderId: "668761338902",
  appId: "1:668761338902:web:6e1f0f93b9a12390233137"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);