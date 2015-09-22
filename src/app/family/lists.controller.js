class ListsController {

  constructor(ListsService, UserService, $log, $mdDialog, $mdToast, $location, $timeout) {
    'ngInject';

    this._listsService = ListsService;
    this._userService = UserService;
    this._$log = $log;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._$location = $location;
    this._$timeout = $timeout;

    this._init();
  }

  _init() {
    this._userService.getCurrentUser().then((user) => {
      this.user = user;
      this._getFamilies();
    });
  }

  _getFamilies() {
    var self = this;
    this._listsService.getFamilies(this.user.key).then((families) => {
      for (let family of families) {
        self._model(family);
      }
      this._$timeout(() => this.families = families);
    });
  }

  _model(family) {
    let createdBy = family.members.filter((member) => member.key === family.createdBy)[0];
    this._$log.debug('createdBy', createdBy);
    if (createdBy !== undefined) {
      family._createdBy_ = createdBy;
      createdBy._creator_ = true;
    }
    family.active = family.key === this.user.activeFamily;

    family.invites.push({email : undefined});
  }

  setupFamily() {
    this._listsService.addFamily().then((family) => {
      //todo just add new family iso reloading all
      this._getFamilies();
    });
  }

  updateName(family) {
    this._listsService.updateName(family.key, family.name).then(() => {
      //todo toast
    });
  }

  toggleAdmin(family, member) {
    //todo
  }

  setActive(family) {
    this._listsService.setActive(family.key).then(() => {
      this.user.activeFamily = family.key;
      //todo should we reload?
      this._getFamilies();
    });
  }

  sendInvite(family, invite) {
    if (invite.key === undefined) {
      this._listsService.addInvite(family.key, invite.email).then((key) => {
        this._$timeout(() => {
          invite.key = key;
          family.invites.push({email : undefined});
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

  removeMember(family, member) {
    //todo toast
    this._listsService.deleteMember(family.key, member.key).then(() => {
      let idx = family.members.indexOf(member);
      this._$timeout(() => family.members.splice(idx, 1));
    });
  }

  removeMe(family) {
    //todo kan dit als je enige admin bent?
    this.removeMember(family, this.user);
  }

}

export default ListsController;
