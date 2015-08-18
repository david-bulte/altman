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

      let familyRef = ref.push({name: name});

      let auth = ref.getAuth();
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

  addInvite(key, member) {
    "use strict";

    return new Promise((resolve, reject) => {

      //check if there's already a user for this email
      //if so ->

      //inivites : {
      //  key : {
      //    user : key,
      //    family : key,
      //    mailSent : new Date()
      //  },
      //  anotherKey : {
      //    family : key,
      //    email : email,
      //    mailSent : new Date()
      //  }
      //}

      //user : {
      //  inivites : {
      //    inviteKey : true
      //  }
      //}

      //family : {
      //  invites : {
      //    key : true
      // }
      // }

      //let userRef

      let familyRef = new Firebase(`ttps://altman.firebaseio.com/families/${key}`);

      //todo

      let invitation = {family: key};
      //search user with member.email
      //if exists: { user : user.key

      // }

      let invite = {};
      invite[invitation.key] = true;
      familyRef.child('invites').update(invitation, (err) => {
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
    "use strict";

    return new Promise((resolve, reject) => {

      let familyRef = new Firebase('https://altman.firebaseio.com/families/' + key);
      let invite = {};
      invite[member.key] = true;
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

    let ref = new Firebase('https://altman.firebaseio.com');
    let authData = ref.getAuth();

    return new Promise((resolve) => {

      let familyKeys = [];
      let it = main();

      let familiesRef = new Firebase(`https://altman.firebaseio.com/users/${authData.uid}/families`);
      familiesRef.once('value', (snapshot) => {
        familyKeys = Object.keys(snapshot.val());
        it.next();
      });

      let addFamily = (key, result) => {
        this._$log.debug(`Adding family ${key}`);
        let familyRef = new Firebase(`https://altman.firebaseio.com/families/${key}`);
        familyRef.once('value', (snapshot) => {
          var family = snapshot.val();
          family.key = key;
          result.push(family);
          it.next();
        });
      };

      function* main() {
        let result = [];
        for (let key of familyKeys) {
          yield addFamily(key, result);
        }
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
