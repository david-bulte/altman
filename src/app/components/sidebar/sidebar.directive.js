class SidebarDirective {

  constructor() {
    'ngInject';

    return {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      scope: {
        sidebarTitle: '='
      },
      controller: SidebarController,
      controllerAs: 'sidebar',
      bindToController: true
    };

  }

}

export default SidebarDirective;


class SidebarController {

  constructor ($log, $mdSidenav, $mdUtil) {
    'ngInject';

    this.toggle = buildToggler('left');

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
