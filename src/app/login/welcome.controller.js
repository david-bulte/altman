class WelcomeController {

  constructor(FamiliesService, $location, $log, $timeout) {
    'ngInject';

    this._$location = $location;
    this._$log = $log;
    this._$timeout = $timeout;
    this._familiesService = FamiliesService;

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
      return new Promise((resolve) => {

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

    return new Promise((resolve) => {
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

  //todo move this to service
  setupFamily() {
    "use strict";

    this._familiesService.createFamily(this.family.name).then((key) => {
      this.family.key = key;
      this._addMembers().then(() => {
        this._$location.path('/weekmenu');
      });
    });
  }

  /**
   * cf. http://davidwalsh.name/async-generators
   */
  _addMembers() {
    "use strict";
    this._$log.debug(`Adding members to family with key ${this.family.key}`);

    return new Promise((resolve) => {
      let self = this;
      let it = main();

      let addMember = (member) => {
        this._$log.debug(`Adding member ${member}`);
        //todo
        this._familiesService.addMember(self.family.key, member).then(() => it.next());
        //this._familiesService.addInvite(self.family.key, member).then(() => it.next());
      };

      function* main() {
        for (let member of self.members) {
          if (!member.fresh) {
            yield addMember({email : member.email});
          }
        }
        resolve();
      }

      it.next();
    });
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

    let ref = new Firebase('https://altman.firebaseio.com');
    let authData = ref.getAuth();

    this._familiesService.createFamily({name : getName(authData)}).then((key) => {
      this._$log.debug('family created now redirecting to weekmenu...');
      this._$location.path('/weekmenu');
    });

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



























//let ref = new Firebase('https://altman.firebaseio.com/families/');
//
//let familyRef = ref.push({name : this.family.name});
//
//let auth = ref.getAuth();
//let member = {};
//member[auth.uid] = true;
//
//let userRef = new Firebase('https://altman.firebaseio.com/users/' + auth.uid);
//let family = {};
//family[familyRef.key()] = true;
//
//let updateMembers = promisify((cont) => {
//  familyRef.child('members').update(member, cont);
//});
//let updateAdmins = promisify((cont) => {
//  familyRef.child('admins').update(member, cont);
//});
//let updateFamilies = promisify((cont) => {
//  userRef.child('families').update(family, cont);
//});
//
//updateMembers
//  .then(updateAdmins)
//  .then(updateFamilies)
//  .then(() => {
//
//    for (let member of this.members) {
//      //todo send invitation to member
//      console.log(member);
//    }
//
//    //todo and this part can remain in controller
//    this.family.key = familyRef.key();
//
//    //todo also create familyRequests containing email addresses => ability to join once logged in for first time
//  });
