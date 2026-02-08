import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';
// import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBG8nNEkW9EruZZZVjTlvZlOaIY1Cqn7MM",
    authDomain: "tilted-maze-game.firebaseapp.com",
    projectId: "tilted-maze-game",
    storageBucket: "tilted-maze-game.firebasestorage.app",
    messagingSenderId: "302479368305",
    appId: "1:302479368305:web:680496b5747b83a464bbd0",
    measurementId: "G-XF5J3G3QEY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
// export const db = getFirestore(app);