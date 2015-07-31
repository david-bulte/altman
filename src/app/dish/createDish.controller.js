import DishController from './dish.controller.js';

class CreateDishController extends DishController {

  constructor(ConfigService, DishesService, WeekMenuService, $location, $scope, $routeParams) {
    'ngInject';
    super(ConfigService, DishesService, $location, $scope, $routeParams);

    this._weekMenuService = WeekMenuService;

    this.ctrl = 'CreateDishController';
  }

  saved(dish) {
    "use strict";

    this._weekMenuService.addDishId(dish.key).then(() => {
      this._$location.path('/weekmenu');
      this._$scope.$apply();
    });

  }
}

export default CreateDishController;
