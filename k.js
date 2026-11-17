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

// GET APPROXIMATE LOGIN LOCATION

function getLoginLocation() {
  console.log("GET LOCATION FUNCTION STARTED!");
  return fetch("https://ipapi.co/json/")
    .then(function(response) {
      if (!response.ok) {
        throw new Error("IP API error: " + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      console.log("LOCATION DATA:", data);

      return {
        city: data.city || "Unknown",
        region: data.region || "Unknown",
        country: data.country_name || "Unknown"
      };
    })
    .catch(function(error) {
      console.error("LOCATION FETCH ERROR:", error);

      return {
        city: "Unavailable",
        region: "Unavailable",
        country: "Unavailable"
      };
    });
}


function sendLoginNotification(email, status, userName) {

  getLoginLocation().then(function(location) {

    emailjs.send(
      "service_r18bmed",
      "template_ku0tbwr",
      {
        user_name: userName || email.split("@")[0],
        user_email: email,
        login_date: new Date().toLocaleString(),
        login_status: status,
        login_city: location.city,
        login_region: location.region,
        login_country: location.country
      }
    )
    .then(function(response) {
      console.log("EMAIL SENT!", response.status);
    })
    .catch(function(error) {
      console.error("EMAIL ERROR:", error);
    });

  });
}

// LOGIN





function login() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value;
  let message = document.getElementById("message");

  if (!email || !password) {
    message.innerText = "Please enter your email and password!";
    return;
  }

  let strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!*])[A-Za-z\d@#$!*]{8,}$/;

  if (!strongPassword.test(password)) {
    message.innerText =
      "Password must have 8 characters, uppercase, lowercase, number, and special character!";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(function(userCredential) {
      let firebaseUser = userCredential.user;

      let user = {
        email: firebaseUser.email,
        loginDate: new Date().toLocaleString()
      };

      localStorage.setItem("currentUser", JSON.stringify(user));

      // HIDE LOGIN AND SIGNUP
      document.getElementById("loginPage").style.display = "none";
      document.getElementById("signupPage").style.display = "none";

      // SHOW DASHBOARD
      document.getElementById("dashboard").style.display = "block";

      // UPDATE WELCOME MESSAGE
      document.getElementById("welcome").innerText =
        "Welcome, " + (firebaseUser.displayName || firebaseUser.email) + "!";

      sendLoginNotification(
        email,
        "SUCCESSFUL",
        firebaseUser.displayName
      );
    })
    .catch(function(error) {
      console.error("Firebase Login Error:", error);

      sendLoginNotification(email, "FAILED");

      message.innerText = "Invalid email or password!";
    });
}



// SHOW SIGN UP PAGE
function showSignup() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("signupPage").style.display = "block";
}

// SHOW LOGIN PAGE
function showLogin() {
  document.getElementById("signupPage").style.display = "none";
  document.getElementById("loginPage").style.display = "block";
}

// SIGN UP

// SIGN UP
function signup() {
  let name = document.getElementById("signupName").value.trim();
  let email = document.getElementById("signupEmail").value.trim();
  let password = document.getElementById("signupPassword").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  let message = document.getElementById("signupMessage");

  if (!name || !email || !password || !confirmPassword) {
    message.innerText = "Please complete all fields!";
    return;
  }

  let strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!*])[A-Za-z\d@#$!*]{8,}$/;

  if (!strongPassword.test(password)) {
    message.innerText =
      "Password needs 8 characters, uppercase, lowercase, number, and special character!";
    return;
  }

  if (password !== confirmPassword) {
    message.innerText = "Passwords do not match!";
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(function(userCredential) {

      return userCredential.user.updateProfile({
        displayName: name
      });

    })
    .then(function() {
      return auth.signOut();
    })
    .then(function() {
      document.getElementById("signupName").value = "";
      document.getElementById("signupEmail").value = "";
      document.getElementById("signupPassword").value = "";
      document.getElementById("confirmPassword").value = "";

      showLogin();

      document.getElementById("message").innerText =
        "Account created successfully! Please log in.";
    })
    .catch(function(error) {
      console.error("Sign Up Error:", error);
      message.innerText = error.message;
    });
}

