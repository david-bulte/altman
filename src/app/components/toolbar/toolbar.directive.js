class ToolbarDirective {

  constructor() {
    'ngInject';

    return {
      restrict: 'E',
      templateUrl: 'app/components/toolbar/toolbar.html',
      scope: {
        toolbarTitle: '=',
        toolbarFilterEnabled: '=',
        toolbarFilter: '='
      },
      controller: ToolbarController,
      controllerAs: 'toolbar',
      bindToController: true
    };

  }

}

export default ToolbarDirective;


class ToolbarController {

  constructor ($log, $mdSidenav, $mdUtil) {
    'ngInject';

    this.toggleSidebar = buildToggler('left');

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      },300);
      return debounceFn;
    }
  }

}
