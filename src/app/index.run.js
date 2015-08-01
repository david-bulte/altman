function runBlock($log) {
  'ngInject';

  var ref = new Firebase("https://altman.firebaseio.com");
  var authData = ref.getAuth();

  if (authData) {
    $log.debug("User already authenticated :", authData);
  }
  else {
    ref.authWithOAuthPopup("google", function (error, authData) {
      if (error) {
        $log.debug("Login Failed!", error);
      }
      else {
        $log.debug("Authenticated successfully with payload:", authData);

        ref.child("users").child(authData.uid).set({
          provider: authData.provider,
          name: getName(authData)
        });

      }
    }, {
      remember: 'default'
    });
  }

  function getName(authData) {
    switch (authData.provider) {
      case 'google':
        return authData.google.displayName;
      case 'twitter':
        return authData.twitter.displayName;
      case 'facebook':
        return authData.facebook.displayName;
    }
  }

}

export default runBlock;
