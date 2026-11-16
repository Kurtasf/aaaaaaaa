// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDUnnPmQuaxNsLMCsojkuR97elIlx8gu78",
  authDomain: "tool-borrowing-system-f5a20.firebaseapp.com",
  projectId: "tool-borrowing-system-f5a20",
  storageBucket: "tool-borrowing-system-f5a20.firebasestorage.app",
  messagingSenderId: "697542470395",
  appId: "1:697542470395:web:f9081769f54796cff35e5e"
};

// INITIALIZE FIREBASE
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

console.log("Firebase connected successfully!");

emailjs.init({
  publicKey: "_Hej9uDEINoUUd79P"
});

function sendLoginNotification(email, status) {

  emailjs.send(
    "service_r18bmed",
    "template_ku0tbwr",
    {
      user_email: email,
      login_date: new Date().toLocaleString(),
      login_status: status
    }
  )
  .then(function(response) {
    console.log("EMAIL SENT!", response.status);
    alert("Email notification sent!");
  })
  .catch(function(error) {
    console.error("EMAIL ERROR:", error);
    alert("Email failed! Check Console.");
  });

}

// LOGIN



function login() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value;

  if (!email || !password) {
    document.getElementById("message").innerText =
      "Please enter your email and password!";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(function(userCredential) {
      let user = {
        email: userCredential.user.email,
        loginDate: new Date().toLocaleString()
      };

      localStorage.setItem("currentUser", JSON.stringify(user));

      sendLoginNotification(email, "SUCCESSFUL");

      openDashboard();
    })
    .catch(function(error) {
      console.error("Firebase Login Error:", error);

      sendLoginNotification(email, "FAILED");

      document.getElementById("message").innerText =
        "Invalid email or password!";
    });
}

