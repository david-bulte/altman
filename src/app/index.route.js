function routerConfig ($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/', {
      templateUrl: 'app/weekMenu/weekMenu.html',
      controller: 'WeekMenuController',
      controllerAs: 'weekMenu'
    })
    .when('/login', {
      templateUrl: 'app/login/login.html',
      controller: 'LoginController',
      controllerAs: 'login'
    })
    .when('/welcome', {
      templateUrl: 'app/login/welcome.html',
      controller: 'WelcomeController',
      controllerAs: 'welcome'
    })
    .when('/config', {
      templateUrl: 'app/config/config.html',
      controller: 'ConfigController',
      controllerAs: 'config'
    })
    .when('/edit-dish/:key', {
      templateUrl: 'app/dish/create-or-edit.html',
      controller: 'DishController',
      controllerAs: 'dish'
    })
    .when('/create-dish', {
      templateUrl: 'app/dish/create-or-edit.html',
      controller: 'CreateDishController',
      controllerAs: 'dish'
    })
    .when('/dishes', {
      templateUrl: 'app/dishes/dishes.html',
      controller: 'DishesController',
      controllerAs: 'dishes'
    })
    .when('/shoppinglist', {
      templateUrl: 'app/shoppinglist/shoppinglist.html',
      controller: 'ShoppingListController',
      controllerAs: 'shoppingList'
    })
    .otherwise({
      redirectTo: '/'
    });
}

export default routerConfig;
