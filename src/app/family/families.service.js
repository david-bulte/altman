class FamiliesService {

  constructor($log, $timeout) {
    'ngInject';

    this._$log = $log;
    this._$timeout = $timeout;
  }

  //deprecated
  createFamily(name) {
    "use strict";

    return new Promise((resolve, reject) => {

      let ref = new Firebase('https://altman.firebaseio.com/families/');
      let auth = ref.getAuth();

      let familyRef = ref.push({name: name, createdBy: auth.uid});

      let member = {};
      member[auth.uid] = true;

      let userRef = new Firebase('https://altman.firebaseio.com/users/' + auth.uid);
      let family = {};
      family[familyRef.key()] = true;

      let updateMembers = promisify((cont) => {
        this._$log.debug('updating members');
        familyRef.child('members').update(member, cont);
      });
      let updateAdmins = promisify((cont) => {
        this._$log.debug('updating admins');
        familyRef.child('admins').update(member, cont);
      });
      let updateFamilies = promisify((cont) => {
        this._$log.debug('updating families');
        userRef.child('families').update(family, cont);
      });

      updateMembers
        .then(updateAdmins)
        .then(updateFamilies)
        .then(() => {
          this._$log.debug(`family created - returning key ${familyRef.key()}`);
          resolve(familyRef.key());
        })
        .catch(() => reject);

    });

  }

  addFamily(name) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function createFamily(name = '_default_', createdBy = '') {
        let familiesRef = new Firebase('https://altman.firebaseio.com/families');
        let familyRef = familiesRef.push({name: name, createdBy: createdBy});
        setTimeout(() => it.next(familyRef.key()), 0);  //calling it.next should be in another 'thread'
      }

      function addAdmin(familyKey, userKey) {
        let adminsRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/admins`);
        let admins = {};
        admins[userKey] = true;
        adminsRef.update(admins, () => it.next());
      }

      function addMember(familyKey, userKey) {
        self.addMember(familyKey, userKey, () => it.next());
      }

      function* main() { //we pass in a param on the first yield
        let ref = new Firebase('https://altman.firebaseio.com');
        var userKey = ref.getAuth().uid;

        let familyKey = yield createFamily(name, userKey);
        yield addAdmin(familyKey, userKey);
        yield addMember(familyKey, userKey);

        resolve({});
      }
    });

  }

  addInvite(familyKey, email) {
    return new Promise((resolve, reject) => {

      let invitesRef = new Firebase(`https://altman.firebaseio.com/invites`);
      let inviteRef = invitesRef.push({family: familyKey, email: email});

      let familyInvitesRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/invites`);
      let invites = {};
      invites[inviteRef.key()] = true;
      familyInvitesRef.update(invites, (err) => {
        if (!err) {
          resolve(inviteRef.key());
        }
        else {
          reject();
        }
      });
    });
  }

  addMember(familyKey, userKey) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function updateFamily() {
        self._$log.debug(`updateFamily ${familyKey}`);
        let membersRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/members`);
        let members = {};
        members[userKey] = true;
        membersRef.update(members, () => it.next());
      }

      function updateUser() {
        self._$log.debug(`updateUser ${userKey}`);
        let familiesRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/families`);
        let families = {};
        families[familyKey] = true;
        familiesRef.update(families, () => it.next());
      }

      function* main() {
        yield updateFamily();
        yield updateUser();
        resolve();
      }

    });
  }

  deleteInvite(familyKey, inviteKey) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function deleteInvite() {
        self._$log.debug(`deleteInvite ${inviteKey}`);
        let inviteRef = new Firebase(`https://altman.firebaseio.com/invites/${inviteKey}`);
        inviteRef.remove(() => it.next());
      }

      function updateFamily() {
        self._$log.debug(`updateFamily ${familyKey}`);
        let inviteRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/invites/${inviteKey}`);
        inviteRef.remove(() => it.next());
      }

      function* main() {
        yield deleteInvite();
        yield updateFamily();
        resolve();
      }
    });
  }

  acceptInvite(familyKey, userKey, inviteKey) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function addMember() {
        self._$log.debug(`addMember ${userKey}`);
        self.addMember(familyKey, userKey).then(() => it.next());
      }

      function deleteInvite() {
        self._$log.debug(`deleteInvite ${inviteKey}`);
        self.deleteInvite(familyKey, inviteKey).then(() => it.next());
      }

      function* main() {
        yield addMember();
        yield deleteInvite();
        resolve();
      }
    });

  }

  getFamilies(userKey) {
    "use strict";

    var self = this;

    return new Promise((resolve) => {

      let it;

      let familiesRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/families`);
      familiesRef.once('value', (snapshot) => {
        let keys = Object.keys(snapshot.val());
        it = loadFamilies(keys);
        it.next();
      });

      let loadFamily = (familyKey, families) => {
        this._$log.debug(`Loading family ${familyKey}`);
        let familyRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}`);
        familyRef.once('value', (snapshot) => {
          var family = snapshot.val();
          family.key = familyKey;
          families.push(family);
          it.next();
        });
      };

      let loadUser = (userKey, users) => {
        self._$log.debug(`Loading user ${userKey}`);
        let userRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}`);
        userRef.once('value', (snapshot) => {
          let user = snapshot.val();
          user.key = userKey;
          users.push(user);
          it.next();
        });
      };

      let loadInvite = (inviteKey, invites) => {
        self._$log.debug(`Loading invite ${inviteKey}`);
        let inviteRef = new Firebase(`https://altman.firebaseio.com/invites/${inviteKey}`);
        inviteRef.once('value', (snapshot) => {
          let invite = snapshot.val();
          invite.key = inviteKey;
          invites.push(invite);
          it.next();
        });
      };

      function* loadFamilies(keys) {
        let families = [];

        //first load families
        for (let key of keys) {
          yield loadFamily(key, families);
        }

        //now load members of each family
        for (let family of families) {
          let members = [];
          if (family.members !== undefined) {
            for (let key of Object.keys(family.members)) {
              yield loadUser(key, members);
            }
          }
          family.members = members;
        }

        //now load invites of each family
        for (let family of families) {
          let invites = [];
          if (family.invites !== undefined) {
            for (let key of Object.keys(family.invites)) {
              yield loadInvite(key, invites);
            }
          }
          family.invites = invites;
        }

        resolve(families);
      }

    });

  }

  removeMember(familyKey, memberKey) {
    return new Promise((resolve) => {
      let membersRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/members`);
      membersRef.once('value', (snapshot) => {
        let member = snapshot.val();
        delete member[memberKey];
        membersRef.update(member, () => {
          resolve();
        });
      });
    });
  }

  deleteMember(familyKey, userKey) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function updateUser() {
        self._$log.debug(`updateUser ${userKey}`);
        let familyRef = new Firebase(`https://altman.firebaseio.com/user/${userKey}/families/${familyKey}`);
        familyRef.remove(() => it.next());
      }

      function updateFamily() {
        self._$log.debug(`updateFamily ${familyKey}`);
        let memberRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/members/${userKey}`);
        memberRef.remove(() => it.next());
      }

      function* main() {
        yield updateUser();
        yield updateFamily();
        resolve();
      }
    });
  }

  getMembers(familyKey) {

    this._$log.debug(`Getting members for family with key ${familyKey}`);

    var self = this;

    return new Promise((resolve) => {

      let it;

      let familyRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}`);
      familyRef.once('value', (snapshot) => {
        let family = snapshot.val();
        it = main(family);
        it.next();
      });

      function addUser(userKey, result) {
        self._$log.debug(`Adding user with key ${userKey}`);
        let userRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}`);
        userRef.once('value', (snapshot) => {
          let user = snapshot.val();
          user.key = userKey;
          self._$log.debug(`Found user with key ${userKey}`, user);
          result.push(user);
          it.next();
        });
      }

      function* main(family) {
        let result = [];
        let keys = Object.keys(family.members);
        for (let key of keys) {
          yield addUser(key, result);
        }
        self._$log.debug('Returning result', result);
        resolve(result);
      }

    });
  }

  setActive(familyKey) {
    return new Promise((resolve) => {
      let ref = new Firebase('https://altman.firebaseio.com');
      let authData = ref.getAuth();

      let userRef = new Firebase(`https://altman.firebaseio.com/users/${authData.uid}`);
      userRef.update({activeFamily : familyKey}, () => resolve());
    });
  }

}

function promisify(callback) {
  "use strict";

  return new Promise((resolve, reject) => {

    let cont = (err) => {
      if (err === null) {
        resolve();
      }
      else {
        reject();
      }
    };

    callback(cont);
  });

}

export default FamiliesService;
