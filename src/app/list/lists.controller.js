class ListsController {

    constructor(ListsService, UserService, $log, $mdDialog, $mdToast, $location, $timeout) {
        'ngInject';

        this._listsService = ListsService;
        this._userService = UserService;
        this._$mdToast = $mdToast;
        this._$log = $log;
        this._dialog = $mdDialog;
        this._$location = $location;
        this._$timeout = $timeout;

        this._userService.getCurrentUser()
            .then(user => this.user = user)
            .then(user => this._getLists(user));
    }

    _getLists(user) {
        this._listsService.getListsByUser(user, {members: true, invites: true})
            .then((lists) => {
                this._$timeout(this.lists = lists);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    toggleAdmin(list, member) {
        this._listsService.setAdmin(list.key, member.key, member.admin).then(() => {
            this._$log.info('member admin toggled');
        });
    }

    isActive(list) {
        return this.user.activeFamily === list.key;
    }

    toggleActive(list) {
        //let toggled = list.active
        this._listsService.setActive(list.key).then(() => {
            this._$timeout(() => {
                this.user.activeFamily = list.key;
            });
        });
    }

    updateName(list) {
        this._listsService.updateName(list.key, list.name).then(() => {
            this._$log.info('list name updated');
        });
    }

    addInvite(list, invite) {
        this._listsService.addInvite(list.key, invite.email).then((created) => {
            this._$timeout(() => {
                invite.key = created.key;
                list.invites.push({email: undefined})
            });
        });
    }

    updateInvite(list, invite) {
        if (invite.key !== undefined) {
            this._listsService.updateList(this.list).then(() => this.toast('updated'));
        }
        else {
            this.addInvite(list, invite);
        }
    }

    removeInvite(list, invite) {
        this._listsService.deleteInvite(list.key, invite.key).then(() => {
            let idx = list.invites.indexOf(invite);
            this._$timeout(() => list.invites.splice(idx, 1));
        });
    }

    remindInvite(list, invite) {
        //todo
    }

    removeMember(list, member) {
        this._listsService.deleteMember(list.key, member.key).then(() => {
            let idx = list._members_.indexOf(member);
            this._$timeout(() => list._members_.splice(idx, 1));
        });
    }

    createList() {
        this._listsService.createList().then((list) => {
            //todo just add new family iso reloading all
            this._getLists(this.user);
        });
    }


    //todo

    removeMe(list) {
        //todo kan dit als je enige admin bent?
        this.removeMember(list, this.user);
    }

    toast(content) {
        "use strict";
        this._$mdToast.show(
            this._$mdToast.simple()
                .content(content)
                .position('bottom left')
                .hideDelay(3000)
        );
    }

}

export default ListsController;
