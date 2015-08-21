class FamilyCardDirective {

  constructor() {
    'ngInject';

    return {
      restrict: 'E',
      templateUrl: 'app/components/familycard/familyCard.html',
      scope: {
        family: '=',
        updateName: '&',
        removeMember: '&',
        sendInvite: '&',
        removeInvite: '&'
      },
      controller: FamilyCardController,
      controllerAs: 'ctrl',
      bindToController: true
    };

  }

}

export default FamilyCardDirective;


class FamilyCardController {

  constructor () {
    'ngInject';
  }



}
