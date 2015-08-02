class LoginController {

  constructor() {
    'ngInject';

  }

  authenticateWithGoogle() {
    "use strict";

    let ref = new Firebase("https://altman.firebaseio.com");

    ref.authWithOAuthRedirect("google", function (error) {
      "use strict";
      $log.debug("Login Failed!", error);
    }, {remember: 'sessionOnly'});
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
