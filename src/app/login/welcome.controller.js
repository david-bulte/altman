class WelcomeController {

  constructor($location, $log, $timeout) {
    'ngInject';

    this._$location = $location;
    this._$log = $log;
    this._$timeout = $timeout;

    this.initialized = false;
    this.registered = false;
    this.progressing = false;

    /*
     {
     familyName : 'David en Kristien',
     familyId : '1234',
     authoredByName : 'David',
     authoredByUid : '1234'
     }
     */
    this.invitation = undefined;
    this.family = {};
    this.members = [{email: undefined, fresh: true}];

    this._init().then(() => {
      "use strict";
      this.initialized = true;
      this._$log.debug('initialization finished');
    }).catch((err) => {
      "use strict";
    });
  }

  _init() {

    this._$log.debug('starting initialization');

    let ref = new Firebase('https://altman.firebaseio.com');
    let authData = ref.getAuth();

    let register = () => {
      return new Promise((resolve, reject) => {
        "use strict";

        this._$log.debug(`registering ${authData.uid}`);

        ref.child('users').child(authData.uid).set({
          provider: authData.provider,
          name: getName(authData)
        }, (err) => {
          "use strict";
          if (err !== null) {
            resolve();
          }
          else {
            reject();
          }
        });

      });
    };

    let checkInvitation = ()=> {
      return new Promise((resolve, reject) => {

        this._$log.debug(`checking invitation ${authData.uid}`);

        let ref = new Firebase('https://altman.firebaseio.com/invitations/' + authData.uid);
        ref.once('value', (snapshot) => {
          resolve(snapshot.val());
        });
      });
    };

    return register().then(checkInvitation);

  }

  _checkInvitation(uid) {
    "use strict";

    return new Promise((resolve, reject) => {
      let ref = new Firebase('https://altman.firebaseio.com/invitations/' + uid);
      ref.once('value', (snapshot) => {
        resolve(snapshot.val());
      });
    });
  }

  acceptInvitation() {
    "use strict";

    //todo -> message we'll set you up in no time
    this._$location.path('/weekmenu');
  }

  requestInvitation() {
    "use strict";

    this.progressing = true;
    //send mail (cf php background)

    //todo
    this._$timeout(() => {
      this._$location.path('/weekmenu');
    }, 1000);

  }

  setupFamily() {
    "use strict";

    let ref = new Firebase('https://altman.firebaseio.com/families/');

    let familyRef = ref.push({name : this.family.name});
    this.family.key = familyRef.key();

    let auth = ref.getAuth();
    let member = {};
    member[auth.uid] = true;

    let userRef = new Firebase('https://altman.firebaseio.com/users/' + auth.uid);
    let family = {};
    family[familyRef.key()] = true;

    let updateMembers = promisify((cont) => {
      familyRef.child('members').update(member, cont);
    });
    let updateAdmins = promisify((cont) => {
      familyRef.child('admins').update(member, cont);
    });
    let updateFamilies = promisify((cont) => {
      userRef.child('families').update(family, cont);
    });

    updateMembers
      .then(updateAdmins)
      .then(updateFamilies)
      .then(() => {

        for (let member of this.members) {
          //todo send invitation to member
          console.log(member);
        }

      });


  }
  //setupFamily() {
  //  "use strict";
  //
  //  //todo how to change this in chain of promises?
  //
  //  let ref = new Firebase('https://altman.firebaseio.com/families/');
  //
  //  let familyRef = ref.push({name : this.family.name});
  //  this.family.key = familyRef.key();
  //
  //  let auth = ref.getAuth();
  //
  //  let member = {};
  //  member[auth.uid] = true;
  //  familyRef.child('members').update(member);
  //  familyRef.child('admins').update(member);
  //
  //  let userRef = new Firebase('https://altman.firebaseio.com/users/' + auth.uid);
  //  let family = {};
  //  family[familyRef.key()] = true;
  //  userRef.child('families').update(family);
  //
  //  for (let member of this.members) {
  //    //todo send invitation to member
  //  }
  //
  //}

  addMember() {
    "use strict";

  }

  memberChanged(member) {
    "use strict";
    if (member.fresh === true) {
      delete member.fresh;
      this.members.push({email: undefined, fresh: true});
    }
  }

  notNow() {
    "use strict";
    this.setupFamily();

    //todo setupFamily should be promises
    //then redirect
  }

  sendInvitations() {
    "use strict";

    //todo send mails
  }

  done() {
    "use strict";

    //todo this in html with url to weekmenu.html
    //(or intro.html)

    //todo create family
    this._$location.path('/weekmenu');

  }

}

function promisify(callback) {
  "use strict";

  return new Promise((resolve, reject) => {

    let cont = (err) => {
      if (err == null) {
        resolve();
      }
      else {
        reject();
      }
    };

    callback(cont);
  });

}

function getName(authData) {
  "use strict";

  switch (authData.provider) {
    case 'google':
      return authData.google.displayName;
    case 'twitter':
      return authData.twitter.displayName;
    case 'facebook':
      return authData.facebook.displayName;
  }
}


export default WelcomeController;















//return new Promise((resolve, reject) => {
//  "use strict";
//
//  let ref = new Firebase('https://altman.firebaseio.com');
//  let authData = ref.getAuth();
//
//  ref.child('users').child(authData.uid).set({
//    provider: authData.provider,
//    name: getName(authData)
//  }, (err) => {
//    "use strict";
//    if (err !== null) {
//      this._checkInvitation(authData.uid).then((invitation) => {
//        resolve(invitation);
//      });
//    }
//  });
//
//});
