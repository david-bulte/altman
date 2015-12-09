class WelcomeController {

    constructor(InvitesService, ListsService, UserService, $location, $log, $timeout) {
        'ngInject';

        this._$location = $location;
        this._$log = $log;
        this._$timeout = $timeout;
        this._invitesService = InvitesService;
        this._listsService = ListsService;
        this._userService = UserService;

        this.registered = false;
        this.progressing = false;

        this.invites = [];
        this.list;
        this.members = [{email: undefined, fresh: true}];
        this.userData;

        this._userExists().then(userExists => {
            if (userExists) {
                $log.debug('User exists -> redirecting to /weekmenu');
                $location.path('/weekmenu');
            }
            else {
                $log.debug('User does not exist yet -> register user');
                this._registerUser().then(() => $location.path('/weekmenu'));
            }
        })
    }

    _userExists() {
        this._$log.debug('Checking if user exists');

        let ref = new Firebase('https://altman.firebaseio.com');
        let authData = ref.getAuth();

        return new Promise((resolve) => {
            let userRef = new Firebase(`https://altman.firebaseio.com/users/${authData.uid}`);
            userRef.once('value', snapshot => {
                resolve(snapshot.val() !== null);
            });
        });
    }

    _registerUser() {
        return this._userService.register()
            //.then(user => user.email)
            //.then(InvitesService.getInvitesByEmail)
            //.then((invites) => this._$timeout(() => this.invites = invites))
            .then(() => this._listsService.createList())
            .then(listKey => this._listsService.setActive(listKey))
            .then(() => this._$log.debug('finished initialization'));
    }

    start() {
        this._$log.debug('Starting app');
        this._$location.path('/weekmenu');
    }











    acceptInvite(invite) {
        this._listsService.acceptInvite(invite.list, this.userData.key, invite.key)
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

    setupList() {
        this._listsService.addList().then((listKey) => {
            console.log(listKey);
            //todo chaining promises
            this._listsService.getList(listKey).then((list) => {
                this._model(list);
                this._$timeout(() => this.list = list);
            });
        });
    }

    //todo cf lists.controller, maybe move to directive?
    _model(list) {
        let createdBy = list.members.filter((member) => member.key === list.createdBy)[0];
        this._$log.debug('createdBy', createdBy);
        if (createdBy !== undefined) {
            list._createdBy_ = createdBy;
            createdBy._creator_ = true;
        }
        //todo review (this.user not set yet)
        //list.active = list.key === this.user.activeList;

        list.invites.push({email: undefined});
    }

    done() {
        this._$location.path('/weekmenu');
    }

    //
    ////todo move this to service
    //setupList() {
    //  "use strict";
    //
    //  this._listsService.createList(this.list.name).then((key) => {
    //    this.list.key = key;
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
        this._$log.debug(`Adding members to list with key ${this.list.key}`);

        return new Promise((resolve) => {
            let self = this;
            let it = main();

            let addMember = (member) => {
                this._$log.debug(`Adding member ${member}`);
                this._listsService.addInvite(self.list.key, member.email).then(() => it.next());
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

        this._listsService.addList().then(() => {
            this._$log.debug('list created now redirecting to weekmenu...');
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

        //todo create list
        this._$location.path('/weekmenu');

    }

    updateName(list) {
        this._listsService.updateName(list.key, list.name).then(() => {
            //todo toast
        });
    }

    sendInvite(list, invite) {
        if (invite.key === undefined) {
            this._listsService.addInvite(list.key, invite.email).then((key) => {
                this._$timeout(() => {
                    invite.key = key;
                    list.invites.push({email: undefined});
                });
            });
        }

        //todo send mail
    }

    removeInvite(list, invite) {
        //todo toast
        this._listsService.deleteInvite(list.key, invite.key).then(() => {
            let idx = list.invites.indexOf(invite);
            this._$timeout(() => list.invites.splice(idx, 1));
        });
    }

}

//function getUserData(authData) {
//    "use strict";
//
//    switch (authData.provider) {
//        case 'google':
//            return {displayName: authData.google.displayName, email: authData.google.email, key: authData.uid};
//        case 'facebook':
//            return {displayName: authData.facebook.displayName, email: authData.facebook.email, key: authData.uid};
//    }
//
//}


export default WelcomeController;
