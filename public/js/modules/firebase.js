import {FBKEY, FBDOMAIN, FBPROJID, FBSTORAGEB, FBMESSAGESENDERID, FBAPPID, FBMEASURMENTID} from "../utils/constants.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";// Your web app's Firebase configuration
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { addUser } from "./apis.js";
import { navToDashboard } from "./navigator.js";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FBKEY,
  authDomain: FBDOMAIN,
  projectId: FBPROJID,
  storageBucket: FBSTORAGEB,
  messagingSenderId: FBMESSAGESENDERID,
  appId: FBAPPID,
  measurementId: FBMEASURMENTID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export async function signUP(name, email, password){
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        addUser(user.uid, user.email, [], name, "asdas.png");
        navToDashboard();
    })
    .catch((error) => {
        const errorCode = error.code;
        if(errorCode == "auth/invalid-email"){
            alert("Invalid Email");
        }
        if(errorCode == "auth/email-already-in-use"){
            alert("Email already registered")
        }
        else{
            alert("Something Went Wrong");
        }
    })
}

export async function signIn(email, password){
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        navToDashboard();
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode + errorMessage);
        alert("Invalid Email or Password");
    })
}