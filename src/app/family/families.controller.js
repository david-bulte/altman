class FamiliesController {

  constructor(FamiliesService, $mdDialog, $mdToast, $location, $timeout) {
    'ngInject';

    this._familiesService = FamiliesService;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._$location = $location;
    this._$timeout = $timeout;
    this._getFamilies();
  }

  _getFamilies() {
    "use strict";
    this._familiesService.getFamilies().then((families) => {
      this._$timeout(() => this.families = families);
    });
  }

  removeMember(family, member) {
    //todo test
    //todo via toast
    this._familiesService.removeMember(family.key, member.key).then(() => {
      family.members.splice(family.members.indexOf(member), 1);
    });
  }

  toggleAdmin(family, member) {
    //todo
  }

  createInvitation(query) {
    //todo
  }
}

export default FamiliesController;
