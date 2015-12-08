import User from './user.js';

class UserService {

    constructor($log, $timeout) {
        'ngInject';

        this._$log = $log;
        this._$timeout = $timeout;
    }

    register() {
        return new Promise((resolve) => {

            let usersRef = new Firebase('https://altman.firebaseio.com/users');

            let authData = usersRef.getAuth();
            this.userData = getUserData(authData);

            this._$log.debug(`registering ${authData.uid}`);

            let user = {
                provider: authData.provider,
                name: this.userData.displayName,
                email: this.userData.email
            };
            let users = {};
            users[authData.uid] = user;
            usersRef.update(users, () => resolve(user));
        });
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

    /**
     * Stars or unstars a dish
     * @param userKey
     * @param dishKey
     * @param newVal
     * @returns {Promise}
     */
    updateStar(userKey, dishKey, newVal) {
        return new Promise((resolve) => {
            let starredRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/starred`);
            let starred = {};
            starred[dishKey] = newVal;
            starredRef.update(starred, () => resolve(newVal));
        });
    }

}

function getUserData(authData) {
    "use strict";

    switch (authData.provider) {
        case 'google':
            return {displayName: authData.google.displayName, email: authData.google.email, key: authData.uid};
        case 'facebook':
            return {displayName: authData.facebook.displayName, email: authData.facebook.email, key: authData.uid};
    }

}

export default UserService;
