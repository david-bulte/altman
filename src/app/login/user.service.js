class UserService {

  constructor($log, $timeout) {
    'ngInject';

    this._$log = $log;
    this._$timeout = $timeout;
  }

  getCurrentUser() {
    return new Promise((resolve) => {
      let ref = new Firebase('https://altman.firebaseio.com');
      let authData = ref.getAuth();

      let userRef = new Firebase(`https://altman.firebaseio.com/users/${authData.uid}`);
      userRef.once('value', (snapshot) => {
        let user = snapshot.val();
        user.key = snapshot.key();
        resolve(user);
      });
    });
  }

}

export default UserService;
