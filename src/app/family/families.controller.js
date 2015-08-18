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


}

export default FamiliesController;
