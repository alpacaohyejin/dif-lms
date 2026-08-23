const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

content = content.replace(/import \{.*?\} from "https:\/\/www\.gstatic\.com\/firebasejs\/10\.9\.0\/firebase-firestore\.js";/g, '');

content = 'import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, setDoc, getDoc, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";\n' + content;

fs.writeFileSync('js/app.js', content);
