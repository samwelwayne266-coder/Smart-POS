import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// State
let cart = [];

// DOM Elements
const authDiv = document.getElementById('auth-container');
const appDiv = document.getElementById('app-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const checkoutBtn = document.getElementById('checkout-btn');

// Auth Logic
loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        authDiv.classList.add('hidden');
        appDiv.classList.remove('hidden');
    } else {
        authDiv.classList.remove('hidden');
        appDiv.classList.add('hidden');
    }
});

// POS Logic
window.addToCart = (name, price) => {
    cart.push({ name, price });
    renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');
    list.innerHTML = cart.map(item => `<li>${item.name} - $${item.price.toFixed(2)}</li>`).join('');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalEl.innerText = total.toFixed(2);
}

// Save to Firebase
checkoutBtn.onclick = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    
    try {
        await addDoc(collection(db, "sales"), {
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price, 0),
            timestamp: new Date(),
            userId: auth.currentUser.uid
        });
        alert("Sale Sync'd to Cloud!");
        cart = [];
        renderCart();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};