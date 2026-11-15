// Firebase SDK'larını ve senin config bilgilerini içe aktarıyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Seninkinden aldığımız Firebase Yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyCz5KvCtJFPgmk-7bLWY-aIoGz1MXMGrWg",
    authDomain: "wrts-46aaf.firebaseapp.com",
    databaseURL: "https://wrts-46aaf-default-rtdb.firebaseio.com",
    projectId: "wrts-46aaf",
    storageBucket: "wrts-46aaf.firebasestorage.app",
    messagingSenderId: "627981661221",
    appId: "1:627981661221:web:5635a97ba39a9032cb7bcc",
    measurementId: "G-X75D7H3N9X"
};

// Firebase Başlatma
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// HTML Elementleri
const authScreen = document.getElementById('auth-screen');
const authForm = document.getElementById('auth-form');
const googleLoginBtn = document.getElementById('google-login');
const logoutBtn = document.getElementById('logout-btn');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const chatContainer = document.getElementById('chat-container');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');

let currentUser = null;

// Oturum Durumunu Kontrol Et
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authScreen.classList.add('hidden'); // Giriş ekranını gizle
        userNameEl.textContent = user.displayName || user.email.split('@')[0];
        userAvatarEl.src = user.photoURL || 'https://via.placeholder.com/40';
    } else {
        currentUser = null;
        authScreen.classList.remove('hidden'); // Giriş ekranını göster
    }
});

// E-posta ile Giriş / Kayıt Ol
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        // Hesap yoksa otomatik oluştur
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            alert('Hata: ' + err.message);
        }
    }
});

// Google ile Giriş
googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        alert('Google ile giriş hatası: ' + error.message);
    }
});

// Çıkış Yap
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Mesaj Gönderme
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text || !currentUser) return;

    const messagesRef = ref(db, 'messages');
    push(messagesRef, {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email.split('@')[0],
        avatar: currentUser.photoURL || 'https://via.placeholder.com/40',
        text: text,
        timestamp: Date.now()
    });

    msgInput.value = '';
});

// Mesajları Canlı Dinleme
const messagesRef = ref(db, 'messages');
onChildAdded(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const isMe = currentUser && data.uid === currentUser.uid;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'flex-col', isMe ? 'items-end' : 'items-start');

    messageDiv.innerHTML = `
        <div class="text-xs text-slate-400 mb-1">${data.name}</div>
        <div class="${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'} px-4 py-2 rounded-2xl shadow-sm max-w-xs break-words">
            ${data.text}
        </div>
    `;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});