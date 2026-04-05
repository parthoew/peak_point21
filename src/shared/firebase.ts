import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAa412fvVZRLeHUQM02D0og0bj7FGwxeXM",
  authDomain: "pro-tour-c0366.firebaseapp.com",
  databaseURL: "https://pro-tour-c0366-default-rtdb.firebaseio.com",
  projectId: "pro-tour-c0366",
  storageBucket: "pro-tour-c0366.firebasestorage.app",
  messagingSenderId: "428381094601",
  appId: "1:428381094601:web:1c07a96bdf60c7ed050318"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
