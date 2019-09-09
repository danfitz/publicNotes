import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCav1xXCm20HAkwzA25poJcjSUZXEDfFts",
  authDomain: "df-public-notes.firebaseapp.com",
  databaseURL: "https://df-public-notes.firebaseio.com",
  projectId: "df-public-notes",
  storageBucket: "",
  messagingSenderId: "575740011344",
  appId: "1:575740011344:web:b65d1ee879004c9fb40255"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;