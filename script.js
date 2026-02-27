import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// REPLACE WITH YOUR CONFIG
  const firebaseConfig = {
    apiKey: "AIzaSyAN7fPizBFDc4Jb1Nlj4Z6Q10MiABc4or0",
    authDomain: "cloud-pos-b284f.firebaseapp.com",
    projectId: "cloud-pos-b284f",
    storageBucket: "cloud-pos-b284f.firebasestorage.app",
    messagingSenderId: "736972898234",
    appId: "1:736972898234:web:e548e9e7a95a34c283a783",
    measurementId: "G-TVX352VNGT"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// UI Elements
const authDiv = document.getElementById('auth-container');
const appDiv = document.getElementById('app-container');
const salesFeed = document.getElementById('sales-feed');

// --- AUTH LOGIC ---
document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);
document.getElementById('logout-btn').onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        authDiv.classList.add('hidden');
        appDiv.classList.remove('hidden');
        document.getElementById('user-display').innerText = `Staff: ${user.displayName}`;
        document.getElementById('sys-status').innerText = "Online";
        loadSalesHistory();
    } else {
        authDiv.classList.remove('hidden');
        appDiv.classList.add('hidden');
        document.getElementById('sys-status').innerText = "Logged Out";
    }
});

// --- POS LOGIC ---
let cart = [];
window.addToCart = (name, price) => {
    cart.push({name, price});
    renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items');
    list.innerHTML = cart.map(i => `
        <div class="cart-item">
            <span>${i.name}</span>
            <span>$${i.price.toFixed(2)}</span>
        </div>
    `).join('');
    const total = cart.reduce((s, i) => s + i.price, 0);
    document.getElementById('total-val').innerText = total.toFixed(2);
}

document.getElementById('checkout-btn').onclick = async () => {
    if(cart.length === 0) return alert("Cart is empty!");
    
    try {
        await addDoc(collection(db, "sales"), {
            staff: auth.currentUser.displayName,
            total: cart.reduce((s, i) => s + i.price, 0),
            timestamp: serverTimestamp()
        });
        alert("Sale Completed!");
        cart = [];
        renderCart();
    } catch(e) {
        alert("Database Error: " + e.message);
    }
};

// --- DATA LOGIC ---
function loadSalesHistory() {
    const q = query(collection(db, "sales"), orderBy("timestamp", "desc"), limit(5));
    onSnapshot(q, (snapshot) => {
        salesFeed.innerHTML = snapshot.docs.map(doc => {
            const data = doc.data();
            return `<div class="history-item">Order: $${data.total?.toFixed(2)} by ${data.staff}</div>`;
        }).join('');
    });
}
