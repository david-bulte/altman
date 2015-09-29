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
    this._userService.getCurrentUser()
      .then(user => this.user = user)
      .then(user => this._getLists(user));
  }

  _getLists(user) {
    this._listsService.getLists(user).then((lists) => {
      this._$timeout(this.lists = lists);
      //this._$timeout(this.lists = lists.map(list => list.viewModel(user)));
    });
  }

  updateName(list) {
    this._listsService.updateName(list.key, list.name).then(() => {
      this._$log.info('list name updated');
    });
  }

  createInvite(list, invite) {
    return new Promise((resolve, reject) => {
      this._listsService.addInvite(list.key, invite.email).then((invite) => {
        this._$timeout(() => {
          list.invites.push(invite);
          this.remindInvite(list, invite);
          resolve();
        });
      });
    });
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

  setActive(list) {
    this._listsService.setActive(list.key).then(() => {
      this._$timeout(() => {
        this.user.activeFamily = list.key;
        this.lists.forEach(list => list.active = list.key === this.user.activeFamily);
      });
    });
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

  toggleAdmin(list, member) {
    //todo
  }

}

export default ListsController;
