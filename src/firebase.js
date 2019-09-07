import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyB9SlZcq4FufOGPQgjlcOl_IkX4SS-ToL0",
    authDomain: "notetaking-app-e60b0.firebaseapp.com",
    databaseURL: "https://notetaking-app-e60b0.firebaseio.com",
    projectId: "notetaking-app-e60b0",
    storageBucket: "",
    messagingSenderId: "515141019002",
    appId: "1:515141019002:web:efe43d0ed6ad6380f5e2c3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;