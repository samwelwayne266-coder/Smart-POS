import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Debug helper
const log = (msg) => { document.getElementById('debug-log').innerText = msg; };

// Auth handlers
document.getElementById('login-btn').onclick = () => {
    log("Opening popup...");
    signInWithPopup(auth, provider).catch(err => {
        log("ERROR: " + err.message);
        console.error(err);
    });
};

document.getElementById('logout-btn').onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('user-display').innerText = `Staff: ${user.displayName}`;
        document.getElementById('sys-status').innerText = "Online & Authenticated";
    } else {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('sys-status').innerText = "Waiting for Login";
    }
});

// POS Logic
let cart = [];
window.addToCart = (name, price) => {
    cart.push({name, price});
    render();
};

function render() {
    const list = document.getElementById('cart-items');
    list.innerHTML = cart.map(i => `<div>${i.name} - $${i.price.toFixed(2)}</div>`).join('');
    const total = cart.reduce((s, i) => s + i.price, 0);
    document.getElementById('total-val').innerText = total.toFixed(2);
}

document.getElementById('checkout-btn').onclick = async () => {
    if(cart.length === 0) return;
    try {
        await addDoc(collection(db, "sales"), {
            items: cart,
            total: cart.reduce((s, i) => s + i.price, 0),
            time: new Date()
        });
        alert("Success!");
        cart = [];
        render();
    } catch(e) { log("DB Error: " + e.message); }
};
