class ListCardDirective {

  constructor() {
    'ngInject';

    return {
      restrict: 'E',
      templateUrl: 'app/components/listcard/listCard.html',
      scope: {
        list: '=',
        updateName: '&',
        removeMember: '&',
        remindInvite: '&',
        createInvite: '&',
        removeInvite: '&',
        setActive: '&',
        removeMe: '&'
      },
      controller: ListCardController,
      controllerAs: 'ctrl',
      bindToController: true
    };

  }

}

export default ListCardDirective;


class ListCardController {

  constructor($log) {
    'ngInject';

    this._$log = $log;
    this.newInvite = {}
  }

  createInviteLocal() {
    this.createInvite({list: this.list, invite: this.newInvite})
      .then(this.newInvite = {})
      .catch((err) => this._$log.error(err));
  }

}
