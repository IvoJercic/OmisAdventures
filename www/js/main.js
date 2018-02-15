
// Initialize Firebase
config = {
  apiKey: "AIzaSyDEWHXgThtIV2T4eftbpNe5Ys7Ks6sje34",
  authDomain: "adventure-omis.firebaseapp.com",
  databaseURL: "https://adventure-omis.firebaseio.com",
  projectId: "adventure-omis",
  storageBucket: "adventure-omis.appspot.com",
  messagingSenderId: "1027254016044"
};
firebase.initializeApp(config);

//OVO JE ZA PRIKAZAT I SAKRIT FOOTER KAD SE OTVORI TIPKOVNICA
$(document).on('focus', 'input, textarea', function () {
  $("#footer").hide();
});

$(document).on('blur', 'input, textarea', function () {
  $("#footer").show();
});
