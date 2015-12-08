import Invite from './invite.js';

class InvitesService {

    constructor(UserService, $log, $timeout) {
        'ngInject';

        this._userService = UserService;
        this._$log = $log;
        this._$timeout = $timeout;
        this.handlers = {};
    }

    updateInvite(inviteKey, invite) {
        return new Promise((resolve) => {
            let inviteRef = new Firebase(`https://altman.firebaseio.com/invites/${inviteKey}`);
            inviteRef.update(invite, () => resolve());
        });
    }

    getInvite(inviteKey) {
        return new Promise((resolve, reject) => {
            let ref = new Firebase(`https://altman.firebaseio.com/invites/${inviteKey}`);
            ref.once('value', (snapshot) => {
                resolve(Invite.fromSnapshot(snapshot));
            });
        });
    }

    getInvitesByEmail(email) {
        return new Promise((resolve) => {
            let invitesRef = new Firebase('https://altman.firebaseio.com/invites');
            invitesRef.orderByChild('email').equalTo(email).once('value', (snapshot) => {
                let invites = [];
                snapshot.forEach((data) => {
                    let invite = data.val();
                    invite.key = data.key();
                    invites.push(invite);
                });
                resolve(invites);
            });
        });
    }

    on(event, handler) {
        let ticket = new Date();
        //todo david 7/12
        //this.handlers[ticket] = handler;
        //this._userService.getCurrentUser().then(user => {
        //    let invitesRef = new Firebase('https://altman.firebaseio.com/invites');
        //    invitesRef.orderByChild('email').equalTo(user.email).on('child_added', (snapshot) => {
        //        for (let handler of Object.values(this.handlers)) {
        //            handler(Invite.fromSnapshot(snapshot));
        //        }
        //    });
        //});
        return ticket;
    }

    off(ticket) {
        delete this.handlers[ticket];
    }

}

export default InvitesService;
