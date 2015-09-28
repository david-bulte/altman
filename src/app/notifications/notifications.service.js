class NotificationsService {

  constructor(InvitesService, $location, $log, $timeout) {
    'ngInject';

    this._invitesService = InvitesService;
    this._$location = $location;
    this._$log = $log;
    this._$timeout = $timeout;

    this._notifications = [];
    this._init();
  }

  get notifications() {
    return this._notifications;
  }

  _addNotification(notification) {
    this._$timeout(this._notifications.push(notification));
  }

  _removeNotification(notification) {
    this._$timeout(this._notifications.splice(this._notifications.indexOf(notification), 1));
  }

  _fromInvite(invite) {
    return {
      icon: '',
      message: `${invite.from} invites you to join ${invite.name}`,
      callback: () => {
        this._$location.path('/lists');
        this._removeNotification(this);
      }
    }
  }

  _init() {
    this._invitesService.on('new-invite', (invite) => {
      this._addNotification(this._fromInvite(invite));
    });
  }

}

export default NotificationsService;
