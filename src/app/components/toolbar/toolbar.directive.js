class ToolbarDirective {

  constructor() {
    'ngInject';

    return {
      restrict: 'E',
      templateUrl: 'app/components/toolbar/toolbar.html',
      scope: {
        toolbarTitle: '=',
        toolbarFilterEnabled: '=',
        toolbarFilter: '&'
      },
      controller: ToolbarController,
      controllerAs: 'toolbar',
      bindToController: true
    };

  }

}

export default ToolbarDirective;


class ToolbarController {

  constructor(NotificationsService, $log, $mdSidenav, $mdUtil, $scope) {
    'ngInject';

    //this.notifications = [];
    this.toggleSidebar = buildToggler('left');

    //this._notificationsTicket = NotificationsService.on('notification', (notification) => {
    //  this.notifications.push(notification);
    //});
    //
    //$scope.$on("$destroy", () => {
    //  NotificationsService.off(this._notificationsTicket);
    //});

    this.notifications = NotificationsService.notifications;

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
      var debounceFn = $mdUtil.debounce(function () {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 300);
      return debounceFn;
    }
  }

  filter() {
    this.toolbarFilter({query: this.query});
  }

}
