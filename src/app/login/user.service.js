import User from './user.js';

class UserService {

  constructor($log, $timeout) {
    'ngInject';

    this._$log = $log;
    this._$timeout = $timeout;
  }

  getUser(userKey) {
    return new Promise((resolve, reject) => {
      let ref = new Firebase(`https://altman.firebaseio.com/users/${userKey}`);
      ref.once('value', (snapshot) => {
        resolve(User.fromSnapshot(snapshot));
      });
    });
  }

  getCurrentUser() {
    return new Promise((resolve) => {
      let ref = new Firebase('https://altman.firebaseio.com');
      let authData = ref.getAuth();

      let userRef = new Firebase(`https://altman.firebaseio.com/users/${authData.uid}`);
      userRef.once('value', (snapshot) => {
        resolve(User.fromSnapshot(snapshot));
      });
    });
  }

  updateStar(userKey, dishKey, star) {
    return new Promise((resolve) => {
      let starredRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/starred`);
      let starred = {};
      starred[dishKey] = star;
      starredRef.update(starred, () => resolve());
    });
  }

}

export default UserService;
