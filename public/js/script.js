var vueApp = new Vue({
  el: '#page-top',
  data: {
    punchlineVisible: false,
    subject: "all",
    joke: null,
    jokeid: "",
    usercontent: null,
    user: null
  }
})

var metadata = undefined;
var count = 0;

document.addEventListener('DOMContentLoaded', function() {
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

  try {
    let app = firebase.app();
    let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');

    firebase.auth().onAuthStateChanged(function(user) {
      window.user = user; // user is undefined if no user signed in
      vueApp.user = user;
      if (user && user.emailVerified) {

        $("#signInContainer").hide();
        $("#signOutContainer").show();
      }
      else if (user && !user.emailVerified) {
        user.sendEmailVerification().then(function() {
          alert("Please verify your email by clicking the link in the email you received.  You didn't get an email?  Then resend here, and check your spam folder.");
        }).catch(function(error) {
          alert("Unfortuantely an error occurred, please contact support.");
        });        
      }
      else {
        $("#signOutContainer").hide();
        $("#signInContainer").show();            
      }
    });

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("subject")) {
      vueApp.subject = urlParams.get("subject");
    }

    if (urlParams.has("jokeid")) {
      vueApp.jokeid = urlParams.get("jokeid");
    }

    setHeader(undefined);

    var db = firebase.firestore();
    var docRef = db.collection("metadata").doc(vueApp.subject);

    docRef.get().then(function(doc) {
      if (doc.exists) {
        metadata = doc.data();
        loadRandomJoke();
      }
    });

    
  } catch (e) {
    console.error(e);
  }
});

function setHeader(jokeId) {

  var idText = "";
  if (jokeId) {
    idText = " #" + jokeId;
  }

  if (vueApp.subject != "all") {
    $("#header-text").text("֍ " + vueApp.subject.charAt(0).toUpperCase() + vueApp.subject.slice(1) + " Joke " + idText + " ֎");    
  }
  else {
    $("#header-text").text("֍ Random Joke " + idText + " ֎");
  }      
}

function sendJoke() {
  // Add a new document with a generated id.
  firebase.firestore().collection("submissions").add({
    user: window.user.uid, 
    email: window.user.email,
    joke: $("#joke-submit-text").val()
  })
  .then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
  })
  .catch(function(error) {
    console.error("Error adding document: ", error);
  });

  $("#joke-submit-text").val("");
  //$("#jokeLabel").text("");
  //$("#joke-form").get(0).reset();
}

function register() {
  firebase.auth().createUserWithEmailAndPassword($("#register-email").val(), $("#register-pw").val()).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert("There was an error with the registration. " + error.message + " " + error.code);
    // ...
  });
}

function signin() {
  var email = $("#signin-email").val();
  var pw = $("#signin-pw").val();      
  firebase.auth().signInWithEmailAndPassword($("#signin-email").val(), $("#signin-pw").val()).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    alert("There was an error with the signin. " + error.message + " " + error.code);
    // ...
  });
}

function signout() {
  firebase.auth().signOut().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    alert("There was an error with the signout. " + error.message + " " + error.code);
    // ...
  });
}

function punchlineClick(e) {
  $(".punchline").attr("title", "");
  $(".punchline").removeClass("punchline");
  $("#reveal-div").remove();
  $("#laughing-head").addClass("animated tada");
  $("#new-button").show();
  vueApp.punchlineVisible = true;
}

function loadRandomJoke() {
  $("#joke-header").hide();
  window.scrollTo(0,0);
  $("#header-text").addClass("animated bounce");

  var count = metadata.Count;
  var random = Math.floor(Math.random() * count) + 1;
        
  var randomId = random.toString();
  if (metadata.Docs != undefined) {
    randomId--;
    randomId = metadata.Docs[randomId];
  }

  vueApp.jokeid = randomId.toString();
  var randomJokeRef = firebase.firestore().collection("jokes").doc(vueApp.jokeid);
  
  randomJokeRef.get().then(function(joke) {
    setHeader(randomId);
    setJoke(joke.data());
  }).catch(function(error) {
    console.error("Error getting document:", error);

    $.get("./testdata/joke1.json", function(data) {
      setJoke(data);
    });
  });

  // Now set usercontent
  var userContentRef = firebase.firestore().collection("usercontent").doc(vueApp.jokeid);
  
  userContentRef.get().then(function(userContent) {
    if (userContent.exists) {
      vueApp.usercontent = userContent.data();
    }
    else {
      vueApp.usercontent = {
        Smiles: 0,
        UserPunchlines: {}
      };
  
      // Add a new document in collection "usercontent"
      firebase.firestore().collection("usercontent").doc(vueApp.jokeid).set(vueApp.usercontent)
      .then(function() {
        console.log("Document successfully written!");
      })
      .catch(function(error) {
        console.error("Error writing document: ", error);
      });    
    }
  }).catch(function(error) {

  });

}

function setJoke(joke) {
  var elements = "";

  for (var i in joke.Fields) {
    var field = joke.Fields[i];

    var pclass = "";
    if (field.Punchline == true) pclass = " punchline' title='Press to reveal..";

    if (field.Position == "left")
      elements += "<div class='row'><div onclick='punchlineClick(this);' class='col-md" + pclass + "' style='padding: 30px;'><div class='speech-bubble-" + field.Position + "'>" + field.Text + "</div></div><div class='col-md'></div></div>";
    else if (field.Position == "right")
      elements += "<div class='row'><div class='col-md'></div><div onclick='punchlineClick(this);' class='col-md" + pclass + "' style='padding: 30px;'><div class='speech-bubble-" + field.Position + "'>" + field.Text + "</div></div></div>";

    if (field.Punchline == true)
      elements += "<span id='reveal-div' onclick='punchlineClick();' class='badge badge-secondary'>Press to reveal..</span>";
  }

  document.getElementById('joke-header-container').innerHTML = elements;
  $("#laughing-head").removeClass("animated tada");

  if (joke.Stars == undefined) joke.Stars = 0;

  vueApp.joke = joke;
  vueApp.punchlineVisible = false;

  // $(".lds-grid").fadeOut();
  setTimeout(function() {
    $("#header-text").removeClass("animated bounce");
  }, 1000);
  $("#joke-header").fadeIn();      
}


