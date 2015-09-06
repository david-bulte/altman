class WeekMenuController {

  constructor(DishesService, UserService, FamiliesService, $mdDialog, $mdToast, $location, $timeout) {
    'ngInject';

    this._dishesService = DishesService;
    this._userService = UserService;
    this._familiesService = FamiliesService;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._$location = $location;
    this._$timeout = $timeout;
    //todo
    this.sections = ['groenten & fruit', 'zuivel', 'vlees', 'droge voeding', 'ontbijt', 'diepvries', 'varia'];

    this.isOpen = false;

    this._init();
  }

  _init() {
    this._userService.getCurrentUser().then((user) => {
      this.user = user;
      this._getDishes();
    });
  }

  setupDish() {
    this._dishesService.addDish().then((dishKey) => {
      this._familiesService.addDish(this.user.activeFamily, dishKey).then(() => {
        //todo return dish and add that to dish collection?
        this._getDishes();
      });
    })
  }

  _getDishes() {
    this._familiesService.getDishes(this.user.activeFamily).then((weekMenuDishes) => {
      for (let weekMenuDish of weekMenuDishes) {
        this._model(weekMenuDish._dish_);
      }
      this._$timeout(() => this.weekMenuDishes = weekMenuDishes);
    });
  }

  //todo streamline with dishes.controller
  _model(dish) {

    let ingredients = [];
    if (dish.ingredients !== undefined) {
      for (let ingredientName of Object.keys(dish.ingredients)) {
        var ingredient = dish.ingredients[ingredientName];
        ingredient.name = ingredientName;
        ingredients.push({
          name: ingredientName,
          amount: ingredient.amount,
          section: ingredient.section,
          _original_: ingredient
        });
      }
    }
    dish.ingredients = ingredients;
    //dish.ingredients.push({name: undefined, amount: undefined, section: undefined});

    dish.starred = this.user.starred
      && this.user.starred[dish.key] === true;

    dish.used = dish.usedBy !== undefined
      && this.user.activeFamily !== undefined
      && dish.usedBy[this.user.activeFamily] === true;
  }

  updateName(dish) {
    this._dishesService.updateName(dish.key, dish.name).then(() => {
      //todo toast
    })
  }

  toggleStar(dish) {
    this._userService.updateStar(this.user.key, dish.key, !dish.starred).then(() => {
      this._$timeout(() => dish.starred = !dish.starred);
    });
  }

  removeIngredient(dish, ingredient) {
    this._dishesService.removeIngredient(dish.key, ingredient.name).then(() => {
      this._$timeout(() => {
        let idx = dish.ingredients.indexOf(ingredient);
        dish.ingredients.splice(idx, 1);
      });
    })
  }

  addIngredient(dish, ingredient) {
    this._dishesService.addIngredient(dish.key, {name: ingredient.name}).then(() => {
      ingredient._original_ = {name: ingredient.name};
      this._$timeout(() => dish.ingredients.push({name: undefined, amount: undefined, section: undefined}));
    });
  }

  updateIngredient(dish, ingredient) {
    //todo update/add refactor
    if (ingredient._original_ !== undefined) {
      this._dishesService.updateIngredient(dish.key, ingredient._original_.name, ingredient).then(() => {
        //this was an update no need to add something new
      });
      //this._dishesService.updateIngredient(dish, ingredient);
    }
    else {
      this.addIngredient(dish, ingredient);
    }
  }

  removeFromWeekMenu(dish) {
    //todo confirm dialog
    var familyKey = this.user.activeFamily;
    this._familiesService.removeDish(familyKey, dish.key).then(() => {
      this._$timeout(() => this.weekMenuDishes.splice(this.weekMenuDishes.indexOf(dish), 1));
      this.toast(dish.name + ' removed from week menu')
    });
  }

  //remove(ev, dish) {
  //  "use strict";
  //
  //  var confirm = this._dialog.confirm()
  //    .title('Would you like to remove this dish from your week menu?')
  //    .content('Don\'t worry, we won\'t remove it from your dishes collection.')
  //    .ok('Remove')
  //    .cancel('Cancel')
  //    .targetEvent(ev);
  //
  //  //cool, because we have an arrow function, 'this' still refers to the class
  //  this._dialog.show(confirm).then(() => {
  //    this._weekMenuService.removeDishId(dish.key).then(() => {
  //      this.weekMenuDishes.splice(this.weekMenuDishes.indexOf(dish), 1);
  //      this.toast(dish.name + ' removed');
  //    });
  //  }, () => {
  //    //ok
  //  });
  //}

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
