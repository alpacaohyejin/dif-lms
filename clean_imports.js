const fs = require('fs');
let content = fs.readFileSync('c:/Users/오예진/Desktop/AX교육/dif-web/js/app.js', 'utf8');

content = content.replace(/import \{ collection, getDocs, addDoc, updateDoc, doc, deleteDoc, setDoc, getDoc, onSnapshot, query, orderBy(?:, where)? \} from "https:\/\/www\.gstatic\.com\/firebasejs\/10\.9\.0\/firebase-firestore\.js";/g, '');

content = content.replace(/import \{ getFirestore, collection, getDocs, addDoc, doc, setDoc, deleteDoc, updateDoc, onSnapshot \} from "https:\/\/www\.gstatic\.com\/firebasejs\/10\.9\.0\/firebase-firestore\.js";/, 'import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, setDoc, getDoc, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";');

fs.writeFileSync('c:/Users/오예진/Desktop/AX교육/dif-web/js/app.js', content);
