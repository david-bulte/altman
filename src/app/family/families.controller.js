class FamiliesController {

  constructor(FamiliesService, $log, $mdDialog, $mdToast, $location, $timeout) {
    'ngInject';

    this._familiesService = FamiliesService;
    this._$log = $log;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._$location = $location;
    this._$timeout = $timeout;
    this._getFamilies();
  }

  _getFamilies() {
    var self = this;
    this._familiesService.getFamilies().then((families) => {
      for (let family of families) {
        self._model(family);
        console.log(family.members);
      }
      this._$timeout(() => this.families = families);
    });
  }

  _model(family) {
    let createdBy = family.members.filter((member) => member.key === family.createdBy)[0];
    this._$log.debug('createdBy', createdBy);
    family._createdBy_ = createdBy;
    createdBy._creator_ = true;

    family.invites.push({email : undefined});
  }

  setupFamily() {
    //todo new createFamily method
    //todo add methods to update name
    this._familiesService.addFamily().then((family) => {
      //todo just add new family iso reloading all
      this._getFamilies();
    });
  }

  toggleAdmin(family, member) {
    //todo
  }

  setActive(family) {
    this._familiesService.setActive(family.key).then(() => {
      //todo toast
    });
  }

  sendInvite(family, invite) {
    if (invite.key === undefined) {
      this._familiesService.addInvite(family.key, invite.email).then((key) => {
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
    this._familiesService.deleteInvite(family.key, invite.key).then(() => {
      let idx = family.invites.indexOf(invite);
      this._$timeout(() => family.invites.splice(idx, 1));
    });
  }

  removeMember(family, member) {
    //todo toast
    this._familiesService.deleteMember(family.key, member.key).then(() => {
      let idx = family.members.indexOf(member);
      this._$timeout(() => family.members.splice(idx, 1));
    });
  }

  removeMe(family) {
    //todo kan dit als je admin bent en er zijn geen andere admins?
  }

}

export default FamiliesController;
