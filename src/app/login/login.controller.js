class LoginController {

  constructor($firebaseAuth, $log) {
    'ngInject';

    this._$firebaseAuth = $firebaseAuth;
    this._$log = $log;
  }

  authenticateWithGoogle() {
    "use strict";

    let ref = new Firebase("https://altman.firebaseio.com");

    //no idea why it doesn't work without AngularFire
    // cf. http://stackoverflow.com/questions/30048507/firebase-and-angularfire-getting-email-from-google-authentication-works-with

    //ref.authWithOAuthRedirect("google", function (error) {
    //  this._$log.debug("Login Failed!", error);
    //}, {remember: 'sessionOnly', scope : 'email'});

    var provider = 'google';
    var scope = {remember: 'sessionOnly', scope: 'email'};
    var auth = this._$firebaseAuth(ref);
    auth.$authWithOAuthRedirect(provider, scope).then(function (authObject) {
      this._$log.debug("Login success!", authObject);
    }, function (error) {
      this._$log.debug("Login failed!", error);
    });


  }
}

export default LoginController;











//ref.unauth();
//with popup

//let authData = ref.getAuth();

//if (authData) {
//  $log.debug("User already authenticated :", authData);
//}
//else {
//  ref.authWithOAuthPopup("google", function (error, authData) {
//    if (error) {
//      $log.debug("Login Failed!", error);
//    }
//    else {
//      $log.debug("Authenticated successfully with payload:", authData);
//
//      ref.child("users").child(authData.uid).set({
//        provider: authData.provider,
//        name: getName(authData)
//      });
//    }
//  }, { remember: 'default' });
//}
