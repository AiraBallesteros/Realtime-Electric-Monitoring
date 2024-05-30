import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0SGJO0C4-RRvRQTTf4lOLZ3l0gp5i9qo",
  authDomain: "powervue-62794.firebaseapp.com",
  projectId: "powervue-62794",
  storageBucket: "powervue-62794.appspot.com",
  messagingSenderId: "565100359631",
  appId: "1:565100359631:web:fa411362acca58f4156cba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage =getStorage(app);
