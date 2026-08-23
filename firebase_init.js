import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query, where, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";
// Firebase Configuration from user
const firebaseConfig = {
    apiKey: "AIzaSyBGwi1qVYW-PLP1zBR1isuqbc88036um8M",
    authDomain: "dif-lms.firebaseapp.com",
    projectId: "dif-lms",
    storageBucket: "dif-lms.firebasestorage.app",
    messagingSenderId: "489106448984",
    appId: "1:489106448984:web:2a177a1b96831f531a602d",
    measurementId: "G-VSXHEN17J1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);