function runBlock($log, $location, $rootScope) {
  'ngInject';

  let ref = new Firebase('https://altman.firebaseio.com');

  //only needed when authenticating via redirect
  ref.onAuth(function (authData) {

    if (authData) {

      $log.debug("User already authenticated :", authData);

      let userRef = new Firebase('https://altman.firebaseio.com/users/' + authData.uid);
      userRef.once('value', (snapshot) => {

        let userExists = snapshot.val() !== null;
        let redirectPage = !userExists ? '/welcome' : '/weekmenu';
        $location.path(redirectPage);
        $rootScope.$apply();

      });

    }
    else {

      $log.debug('User unknown - redirecting to login page');
      $location.path('/login');
    }
  });

}

export default runBlock;
