class WelcomeController {

  constructor() {
    'ngInject';

    this.initialized = false;
    this.registered = false;

    /*
     {
     familyName : 'David en Kristien',
     familyId : '1234',
     authoredByName : 'David',
     authoredByUid : '1234'
     }
     */
    this.invitation = undefined;

    this._init().then(() => {
      "use strict";
      this.initialized = true;
    }).catch((err) => {
      "use strict";

    });
  }

  _init() {

    let ref = new Firebase('https://altman.firebaseio.com');
    let authData = ref.getAuth();

    let register = new Promise((resolve, reject) => {
      "use strict";

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

    let checkInvitation = new Promise((resolve, reject) => {
      let ref = new Firebase('https://altman.firebaseio.com/invitations/' + authData.uid);
      ref.once('value', (snapshot) => {
        resolve(snapshot.val());
      });
    });

    return register().then(checkInvitation);

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

  }

  requestInvitation() {
    "use strict";

  }

  /**
   * Can also be used for 'single mode' - in that case the family name ===  uid and we'll only have 1 member
   */
  setupFamily() {
    "use strict";

  }

  addMember() {
    "use strict";

  }

  sendInvitations() {
    "use strict";

  }

  done() {
    "use strict";

    //todo this in html with url to weekmenu.html
    //(or intro.html)
  }

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
