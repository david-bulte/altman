class DishesController {

  constructor(DishesService, WeekMenuService, $mdDialog, $mdToast, $location, $scope) {
    'ngInject';

    this._dishesService = DishesService;
    this._weekMenuService = WeekMenuService;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._location = $location;

    this.filterDishes('');

    $scope.$watch('dishes.filter', (query) => {
      this.filterDishes(query);
    });
  }

  filterDishes(query) {
    "use strict";

    this.dishes = this._dishesService.filterDishes(query);
  }

  deleteDish(ev, dish) {
    "use strict";

    var confirm = this._dialog.confirm()
      .title('Would you like to remove this dish?')
      .content('The dish will also be removed from your week menu.')
      .ok('Remove')
      .cancel('Cancel')
      .targetEvent(ev);

    //cool, because we have an arrow function, 'this' still refers to the class
    this._dialog.show(confirm).then(() => {
      this.dishes.splice(dish, 1);
      this._dishesService.deleteDish(dish.id);
      this.toast(dish.name + ' removed');
    }, () => {
      //ok
    });
  }

  addDishToWeekMenu(dish) {
    "use strict";
    this._weekMenuService.addDishId(dish.id);
    this.toast(dish.name + ' added to week menu');
  }

  removeDishFromWeekMenu(dish) {
    "use strict";
    this._weekMenuService.removeDishId(dish.id);
    this.toast(dish.name + ' removed from week menu');
  }

  toast(content) {
    "use strict";
    this._toast.show(
      this._toast.simple()
        .content(content)
        .position('bottom left')
        .hideDelay(3000)
    );
  }

}

export default DishesController;
