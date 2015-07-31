class WeekMenuController {

  constructor(DishesService, WeekMenuService, $mdDialog, $mdToast, $location, $timeout) {
    'ngInject';

    this._dishesService = DishesService;
    this._weekMenuService = WeekMenuService;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._$location = $location;

    this.dishes = [];

    this._weekMenuService.getDishes().then((dishes) => {
      "use strict";
      $timeout(() => {
        this.dishes = dishes;
      });
    });

    this.isOpen = false;
  }

  addDish() {
    "use strict";
    this._$location.path('/create-dish');
  }

  remove(ev, dish) {
    "use strict";

    var confirm = this._dialog.confirm()
      .title('Would you like to remove this dish from your week menu?')
      .content('Don\'t worry, we won\'t remove it from your dishes collection.')
      .ok('Remove')
      .cancel('Cancel')
      .targetEvent(ev);

    //cool, because we have an arrow function, 'this' still refers to the class
    this._dialog.show(confirm).then(() => {
      this._weekMenuService.removeDishId(dish.key).then(() => {
        this.dishes.splice(this.dishes.indexOf(dish), 1);
        this.toast(dish.name + ' removed');
      });
    }, () => {
      //ok
    });
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

export default WeekMenuController;
