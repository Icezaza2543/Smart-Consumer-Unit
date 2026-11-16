// REPLACE WITH YOUR web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_apiKey",
  authDomain: "YOUR_authDomain",
  databaseURL: "YOUR_databaseURL",
  projectId: "YOUR_projectId",
  storageBucket: "YOUR_storageBucket",
  messagingSenderId: "YOUR_messagingSenderId",
  appId: "YOUR_appId"
};

// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Make auth and database references
const auth = firebase.auth();
const db = firebase.database();
