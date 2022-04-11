import firebase from 'firebase'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAV_YURXSE9frpqcCqobLd2R_eFCIGpM-E",
    authDomain: "fb-mern-dd527.firebaseapp.com",
    projectId: "fb-mern-dd527",
    storageBucket: "fb-mern-dd527.appspot.com",
    messagingSenderId: "909053028388",
    appId: "1:909053028388:web:cbfeaa4c4ea44c7a25d0b1",
    measurementId: "G-T88TMJDT4Q"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()
const db = firebase.firestore()

export { auth, provider }
export default db