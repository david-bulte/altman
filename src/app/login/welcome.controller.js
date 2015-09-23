class WelcomeController {

  constructor(ListsService, $location, $log, $timeout) {
    'ngInject';

    this._$location = $location;
    this._$log = $log;
    this._$timeout = $timeout;
    this._listsService = ListsService;

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
    this.invites = [];
    this.family;
    this.members = [{email: undefined, fresh: true}];
    this.userData;

    this._init().then(() => {
      this.initialized = true;
      this._$log.debug('initialization finished');
    }).catch((err) => {
    });
  }

  _init() {

    this._$log.debug('starting initialization');

    let ref = new Firebase('https://altman.firebaseio.com');
    let authData = ref.getAuth();
    this.userData = getUserData(authData);

    let register = () => {
      return new Promise((resolve, reject) => {

        this._$log.debug(`registering ${authData.uid}`);

        ref.child('users').child(authData.uid).set({
          provider: authData.provider,
          name: this.userData.displayName,
          email: this.userData.email
        }, (err) => {
          if (err === null) {
            resolve();
          }
          else {
            reject();
          }
        });

      });
    };

    let checkInvites = ()=> {
      return new Promise((resolve) => {

        let email = getUserData(authData).email;
        this._$log.debug(`checking invite ${email}`);

        let invitesRef = new Firebase('https://altman.firebaseio.com/invites');
        invitesRef.orderByChild('email').equalTo(email).once('value', (snapshot) => {
          let invites = [];
          snapshot.forEach((data) => {
            let invite = data.val();
            invite.key = data.key();
            invites.push(invite);
          });
          this._$timeout(() => this.invites = invites);
          //now fetch families -> yield
          resolve();
        });
      });
    };

    return register()
      .then(checkInvites);
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

  acceptInvite(invite) {
    this._listsService.acceptInvite(invite.family, this.userData.key, invite.key)
      .then(() => {
        this._$log.debug('Invite accepted - now redirecting to weekmenu');
        this._$timeout(() => this._$location.path('/weekmenu'));
      });
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
    this._listsService.addFamily().then((familyKey) => {
      console.log(familyKey);
      //todo chaining promises
      this._listsService.getFamily(familyKey).then((family) => {
        this._model(family);
        this._$timeout(() => this.family = family);
      });
    });
  }

  //todo cf families.controller, maybe move to directive?
  _model(family) {
    let createdBy = family.members.filter((member) => member.key === family.createdBy)[0];
    this._$log.debug('createdBy', createdBy);
    if (createdBy !== undefined) {
      family._createdBy_ = createdBy;
      createdBy._creator_ = true;
    }
    //todo review (this.user not set yet)
    //family.active = family.key === this.user.activeFamily;

    family.invites.push({email : undefined});
  }

  done() {
    this._$location.path('/weekmenu');
  }

  //
  ////todo move this to service
  //setupFamily() {
  //  "use strict";
  //
  //  this._listsService.createFamily(this.family.name).then((key) => {
  //    this.family.key = key;
  //    this._addInvites().then(() => {
  //      this._$log.debug('Invites created - now redirecting to weekmenu');
  //      this._$location.path('/weekmenu');
  //    });
  //  });
  //}

  /**
   * cf. http://davidwalsh.name/async-generators
   */
  _addInvites() {
    "use strict";
    this._$log.debug(`Adding members to family with key ${this.family.key}`);

    return new Promise((resolve) => {
      let self = this;
      let it = main();

      let addMember = (member) => {
        this._$log.debug(`Adding member ${member}`);
        this._listsService.addInvite(self.family.key, member.email).then(() => it.next());
      };

      function* main() {
        for (let member of self.members) {
          if (!member.fresh) {
            yield addMember({email: member.email});
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

    this._listsService.addFamily().then(() => {
      this._$log.debug('family created now redirecting to weekmenu...');
      this._$location.path('/weekmenu');
    });
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

  updateName(family) {
    this._listsService.updateName(family.key, family.name).then(() => {
      //todo toast
    });
  }

  sendInvite(family, invite) {
    if (invite.key === undefined) {
      this._listsService.addInvite(family.key, invite.email).then((key) => {
        this._$timeout(() => {
          invite.key = key;
          family.invites.push({email: undefined});
        });
      });
    }

    //todo send mail
  }

  removeInvite(family, invite) {
    //todo toast
    this._listsService.deleteInvite(family.key, invite.key).then(() => {
      let idx = family.invites.indexOf(invite);
      this._$timeout(() => family.invites.splice(idx, 1));
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

export default WelcomeController;
