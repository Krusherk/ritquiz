import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove, push, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyB6LmoUIf4FZEMrgNfeYugO1EQb1sJij30",
    authDomain: "quiz-73945.firebaseapp.com",
    projectId: "quiz-73945",
    storageBucket: "quiz-73945.firebasestorage.app",
    messagingSenderId: "108598824396",
    appId: "1:108598824396:web:9c45d2c8d989783ccc6169",
    measurementId: "G-N5RDDF1D07",
    databaseURL: "https://quiz-73945-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export {
    db,
    analytics,
    ref,
    set,
    get,
    update,
    remove,
    push,
    onValue,
    query,
    orderByChild,
    limitToLast
};
