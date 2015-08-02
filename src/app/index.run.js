function runBlock($log, $location, $rootScope) {
  'ngInject';

  let ref = new Firebase('https://altman.firebaseio.com');

  //only needed when authenticating via redirect
  ref.onAuth(function (authData) {
    "use strict";

    if (authData) {

      $log.debug("User already authenticated :", authData);

      let userRef = new Firebase('https://altman.firebaseio.com/users/' + authData.uid);
      userRef.once('value', (snapshot) => {

        let redirectPage = (snapshot.val() === null) ? '/welcome' : '/weekmenu';
        $location.path(redirectPage);
        $rootScope.$apply();

      });

      //ref.child("users").child(authData.uid).set({
      //  provider: authData.provider,
      //  name: getName(authData)
      //});

      //$location.path('/weekmenu');
      //$rootScope.$apply();
    }
    else {

      $log.debug('User unknown - redirecting to login page');

      $location.path('/login');
    }
  });

}

export default runBlock;
