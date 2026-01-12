import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCOC3CblgOB9Jqq22daVcv-czNrC5I3U0",
  authDomain: "belezabto3-0.firebaseapp.com",
  projectId: "belezabto3-0",
  storageBucket: "belezabto3-0.firebasestorage.app",
  messagingSenderId: "38059564151",
  appId: "1:38059564151:web:a3032707b30ee624f23a72"
};

const app = initializeApp(FirebaseConfig);

// Exportamos o auth para o formulário de login conseguir usar
export const auth = getAuth(app); 
export default app;