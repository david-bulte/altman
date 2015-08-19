class FamiliesService {

  constructor($log, $timeout) {
    'ngInject';

    this._$log = $log;
    this._$timeout = $timeout;
  }

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

  addInvite(key, email) {
    return new Promise((resolve, reject) => {

      let invitesRef = new Firebase(`https://altman.firebaseio.com/invites`);
      let inviteRef = invitesRef.push({family: key, email: email});

      let familyInvitesRef = new Firebase(`https://altman.firebaseio.com/families/${key}/invites`);
      let invites = {};
      invites[inviteRef.key()] = true;
      familyInvitesRef.update(invites, (err) => {
        if (!err) {
          resolve();
        }
        else {
          reject();
        }
      });
    });
  }

  addMember(key, member) {
    return new Promise((resolve, reject) => {

      let familyRef = new Firebase(`https://altman.firebaseio.com/families/${key}`);
      let members = {};
      members[member.key] = true;
      familyRef.child('members').update(member, (err) => {
        if (!err) {
          resolve();
        }
        else {
          reject();
        }
      });
    });
  }

  getFamilies() {
    "use strict";

    var self = this;

    let ref = new Firebase('https://altman.firebaseio.com');
    let authData = ref.getAuth();

    return new Promise((resolve) => {

      let it;

      let familiesRef = new Firebase(`https://altman.firebaseio.com/users/${authData.uid}/families`);
      familiesRef.once('value', (snapshot) => {
        let keys = Object.keys(snapshot.val());
        it = loadFamilies(keys);
        it.next();
      });

      let loadFamily = (key, families) => {
        this._$log.debug(`Loading family ${key}`);
        let familyRef = new Firebase(`https://altman.firebaseio.com/families/${key}`);
        familyRef.once('value', (snapshot) => {
          var family = snapshot.val();
          family.key = key;
          families.push(family);
          it.next();
        });
      };

      let loadUser = (key, users) => {
        self._$log.debug(`Loading user ${key}`);
        let userRef = new Firebase(`https://altman.firebaseio.com/users/${key}`);
        userRef.once('value', (snapshot) => {
          let user = snapshot.val();
          user.key = key;
          users.push(user);
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
          for (let key of Object.keys(family.members)) {
            yield loadUser(key, members);
          }
          family.members = members;
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
          "use strict";
          resolve();
        });
      });
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
