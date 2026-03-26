import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhWH6r0NZx1j2uhhYSYcWXqPJIyx2M8es",
  authDomain: "todo-app-4d6cb.firebaseapp.com",
  projectId: "todo-app-4d6cb",
  storageBucket: "todo-app-4d6cb.firebasestorage.app",
  messagingSenderId: "577945111790",
  appId: "1:577945111790:web:6e760808a315f8eadb77ff",
  measurementId: "G-ZCG4YJ9ZT0"};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Persist auth state across page reloads
setPersistence(auth, browserLocalPersistence).catch(() => {
  // ignore persistence errors (e.g., non-browser environment)
})