// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJF7cVmhXcUf9gUcRDZWg7q1G6UCHuAOY",
  authDomain: "satta-matka-online-play.firebaseapp.com",
  projectId: "satta-matka-online-play",
  storageBucket: "satta-matka-online-play.appspot.com",
  messagingSenderId: "392008501621",
  appId: "1:392008501621:web:21d4331c3083da2b98ab3c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };