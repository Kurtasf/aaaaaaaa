
const EMAIL_NOTIFICATIONS_DISABLED = false;

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
  publicKey: "9gKHyE7RdKUjDC-SW"
});

    // Automatically return to dashboard
    if (typeof openDashboard === "function") {
      openDashboard();
    }

  } else {

    localStorage.removeItem("currentUser");

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("signupPage").style.display = "none";
    document.getElementById("loginPage").style.display = "block";

  }

});


// GET DEVICE LOCATION
function getLoginLocation() {
  return new Promise(function(resolve) {
    if (!navigator.geolocation) {
      resolve({
        street: "Unavailable",
        barangay: "Unavailable",
        city: "Unavailable",
        region: "Unavailable",
        country: "Unavailable",
        latitude: "Unavailable",
        longitude: "Unavailable",
        accuracy: "Unavailable"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        fetch(
          "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
          latitude + "&lon=" + longitude + "&addressdetails=1"
        )
        .then(function(response) {
          if (!response.ok) {
            throw new Error("Geocoding failed");
          }
          return response.json();
        })
        .then(function(data) {
          let address = data.address || {};

          resolve({
            street: [
              address.house_number,
              address.road
            ].filter(Boolean).join(" ") || "Unavailable",

            barangay:
              address.suburb ||
              address.neighbourhood ||
              address.quarter ||
              address.village ||
              "Unavailable",

            city:
              address.city ||
              address.town ||
              address.municipality ||
              "Unavailable",

            region:
              address.state ||
              address.province ||
              "Unavailable",

            country: address.country || "Unavailable",
            latitude: latitude,
            longitude: longitude,
            accuracy: Math.round(position.coords.accuracy)
          });
        })
        .catch(function(error) {
          console.error("ADDRESS ERROR:", error);

          resolve({
            street: "Unavailable",
            barangay: "Unavailable",
            city: "Unavailable",
            region: "Unavailable",
            country: "Unavailable",
            latitude: latitude,
            longitude: longitude,
            accuracy: Math.round(position.coords.accuracy)
          });
        });
      },

      function(error) {
        console.error("GPS ERROR:", error.message);

        resolve({
          street: "Permission denied or unavailable",
          barangay: "Unavailable",
          city: "Unavailable",
          region: "Unavailable",
          country: "Unavailable",
          latitude: "Unavailable",
          longitude: "Unavailable",
          accuracy: "Unavailable"
        });
      },

      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  });
}


function sendLoginNotification(email, status, userName) {
  console.log("Starting login notification...");

  getLoginLocation()
    .then(function(location) {
      console.log("Location received:", location);

      if (!EMAIL_NOTIFICATIONS_ENABLED) {
        console.log("Email notifications are disabled.");
        return;
      }

      return emailjs.send(
        "service_hd2xf9m",
        "template_abw4dun",
        {
          user_name: userName || email.split("@")[0],
          user_email: email,
          login_date: new Date().toLocaleString(),
          login_status: status,
          login_street: location.street || "Unknown",
          login_barangay: location.barangay || "Unknown",
          login_city: location.city || "Unknown",
          login_region: location.region || "Unknown",
          login_country: location.country || "Unknown",
          login_latitude: location.latitude || "Unknown",
          login_longitude: location.longitude || "Unknown",
          login_accuracy: location.accuracy || "Unknown"
        }
      );
    })
    .then(function(response) {
      if (response) {
        console.log("EMAIL SENT!", response.status);
      }
    })
    .catch(function(error) {
      console.error("LOGIN NOTIFICATION ERROR:", error);
    });
}

async function sendLoginNotification(user) {
  try {
    console.log("SEND LOGIN NOTIFICATION FUNCTION CALLED!");

    const idToken = await user.getIdToken();

    const response = await fetch(
      "https://tool-borrowing-admin.ietisysteminv.workers.dev/notify-login",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      }
    );

    const result = await response.text();

    console.log("Notification status:", response.status);
    console.log("Notification response:", result);

  } catch (error) {
    console.error("Login notification error:", error);
  }
}

// SHOW SIGN UP PAGE
function showSignup() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("signupPage").style.display = "block";
}


// LOGIN FUNCTION


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

    const firebaseUser = userCredential.user;

    // Send login notification
    sendLoginNotification(firebaseUser);

    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      loginDate: new Date().toLocaleString()
    };

    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );

    message.innerText = "";
      
      // Save Firestore notification
      return db.collection("login_notifications").add({
        userUid: firebaseUser.uid,
        userEmail: firebaseUser.email,
        userName: firebaseUser.displayName || "Unknown User",
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(function() {
        console.log("LOGIN NOTIFICATION SAVED!");
      })
      .catch(function(error) {
        console.error("FIRESTORE SAVE ERROR:", error);
      });

    })

    .catch(function(error) {

      console.error("AUTHENTICATION ERROR:", error);

      message.innerText = "Invalid email or password!";

      sendLoginNotification(
        email,
        "FAILED",
        email.split("@")[0]
      );

    });
}


// SHOW LOGIN PAGE
function showLogin() {
  document.getElementById("signupPage").style.display = "none";
  document.getElementById("loginPage").style.display = "block";
}

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


// CHECK AND RESTORE FIREBASE LOGIN SESSION

auth.onAuthStateChanged(async function(firebaseUser) {

  const dashboard = document.getElementById("dashboard");
  const signupPage = document.getElementById("signupPage");
  const loginPage = document.getElementById("loginPage");

  if (firebaseUser) {

    console.log("Firebase authenticated:", firebaseUser.uid);

    let savedUser = {};

    try {
      savedUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
    } catch (error) {
      savedUser = {};
    }

    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      loginDate: savedUser.loginDate ||
        new Date().toLocaleString()
    };

    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );

    loginPage.style.display = "none";
    signupPage.style.display = "none";
    dashboard.style.display = "block";

    openDashboard();

  } else {

    console.log("No active Firebase session.");

    if (typeof stopToolsSync === "function") {
      stopToolsSync();
      stopToolsSync = null;
    }

    localStorage.removeItem("currentUser");

    dashboard.style.display = "none";
    signupPage.style.display = "none";
    loginPage.style.display = "block";
  }

});


// OPEN DASHBOARD
function openDashboard() {
  console.log("OPEN DASHBOARD CALLED");

  const ids = [
    "loginPage",
    "signupPage",
    "dashboard",
    "welcome",
    "notification",
    "adminPanel",
    "addToolSection"
  ];

  ids.forEach(id => {
    const element = document.getElementById(id);

    console.log(
      "HTML ID:",
      id,
      element ? "FOUND" : "NOT FOUND"
    );
  });

  const loginPage = document.getElementById("loginPage");
  const signupPage = document.getElementById("signupPage");
  const dashboard = document.getElementById("dashboard");
  const welcome = document.getElementById("welcome");
  const notification = document.getElementById("notification");
  const adminPanel = document.getElementById("adminPanel");
  const addToolSection = document.getElementById("addToolSection");

  if (
    !loginPage || !signupPage || !dashboard ||
    !welcome || !notification || !adminPanel ||
    !addToolSection
  ) {
    console.error("STOPPED: Missing HTML element.");
    return;
  }

  const savedUser = localStorage.getItem("currentUser");

  if (!savedUser) {
    console.error("currentUser missing!");
    return;
  }

  const user = JSON.parse(savedUser);
  const adminUID = "3lzOvXcSwveDgD0cEP9T0i0lvgs2";

  const isAdmin =
    auth.currentUser &&
    auth.currentUser.uid === adminUID;

  loginPage.style.display = "none";
  signupPage.style.display = "none";
  dashboard.style.display = "block";

  welcome.innerText = "Welcome, " + user.email + "!";

  notification.innerText =
    "A login was detected for " + user.email +
    " at " + (user.loginDate || "Unknown");

  adminPanel.style.display = isAdmin ? "block" : "none";
  addToolSection.style.display = isAdmin ? "block" : "none";

  if (typeof stopToolsSync === "undefined" || !stopToolsSync) {
    startToolsSync();
  }

  loadRecords();
}



async function enableLoginNotifications() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Notification permission was not granted.");
      return;
    }

    const messaging = firebase.messaging();

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await messaging.getToken({
      vapidKey: "BPyt1ytDkRXpdEDkIHmGrjR_--6MPje20iT76u7MePGKKunbgICulP1m5k7OgUQZD0jmiHvQ1g4wbNcZdhgdBbY",
      serviceWorkerRegistration: registration
    });

    if (!token) {
      alert("Unable to get FCM token.");
      return;
    }

    const user = firebase.auth().currentUser;

    if (!user) {
      alert("Please log in first.");
      return;
    }

    await firebase.firestore()
      .collection("adminPushTokens")
      .doc(user.uid)
      .set({
        token: token,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    alert("Phone connected! Login notifications enabled.");

    console.log("FCM TOKEN REGISTERED!");

    // Listen for incoming foreground messages
    messaging.onMessage(async (payload) => {
      console.log("FCM FOREGROUND MESSAGE RECEIVED:", payload);

      alert("FCM MESSAGE RECEIVED ON ADMIN PHONE!");

      const title =
        payload.notification?.title || "Tool Borrowing System";

      const body =
        payload.notification?.body || "New login detected.";

      try {
        await registration.showNotification(title, {
          body: body,
          icon: "/favicon.ico"
        });

        console.log("NOTIFICATION DISPLAYED!");

      } catch (error) {
        console.error("SHOW NOTIFICATION ERROR:", error);
      }
    });

    // Local notification test
    await registration.showNotification(
      "LOCAL TEST NOTIFICATION",
      {
        body: "Your admin phone can display notifications."
      }
    );

    console.log("LOCAL TEST NOTIFICATION SENT!");

  } catch (error) {
    console.error("Notification setup error:", error);
    alert("Notification setup failed: " + error.message);
  }
}




window.login = login;
window.showSignup = showSignup;
window.signup = signup;
