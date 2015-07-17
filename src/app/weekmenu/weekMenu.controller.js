class WeekMenuController {

  constructor(DishesService, WeekMenuService, $mdDialog, $mdToast, $location) {
    'ngInject';

    this._dishesService = DishesService;
    this._weekMenuService = WeekMenuService;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._location = $location;

    this.dishes = [];

    let dishIds = this._weekMenuService.dishIds;
    for (let dishId of dishIds) {
      this.dishes.push(this._dishesService.getDish(dishId));
    }

    this.isOpen = false;
  }

  addDish() {
    "use strict";
    let dish = this._dishesService.createDish();
    this._weekMenuService.addDishId(dish.id);
    this._location.path(`/edit-dish/${dish.id}`);
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
      this.dishes.splice(dish, 1);
      this._weekMenuService.removeDishId(dish.id);
      this.toast(dish.name + ' removed');
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
