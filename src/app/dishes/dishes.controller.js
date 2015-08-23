class DishesController {

  constructor(DishesService, UserService, WeekMenuService, $mdDialog, $mdToast, $location, $scope, $timeout) {
    'ngInject';

    this._dishesService = DishesService;
    this._userService = UserService;
    this._weekMenuService = WeekMenuService;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._$location = $location;
    this._$timeout = $timeout;
    this.dishes = [];
    //todo
    this.sections = ['groenten & fruit', 'zuivel', 'vlees', 'droge voeding', 'ontbijt', 'diepvries', 'varia'];

    this._init();
  }

  _init() {
    this._userService.getCurrentUser().then((user) => {
      this.user = user;
      this._getDishes();
    });
  }

  _getDishes(query) {
    //todo filter
    this._dishesService.getDishes().then((dishes) => {
      for (let dish of dishes) {
        this._model(dish);
      }
      this._$timeout(() => this.dishes = dishes);
    });
  }

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
          _original_ : ingredient
        });
      }
    }
    dish.ingredients = ingredients;
    dish.ingredients.push({name: undefined, amount: undefined, section: undefined});

    dish.starred = this.user.starred && this.user.starred[dish.key] === true;
  }

  setupDish() {
    this._dishesService.addDish().then((dishKey) => {
      //todo return dish and add that to dish collection?
      //or, interesting: will it be added to the dishes collection automatically?
      this._getDishes();
    })
  }

  updateName(dish) {
    this._dishesService.updateName(dish.key, dish.name).then(() => {
      //todo toast
    })
  }

  removeDish(dish) {
  }

  toggleStar(dish) {
    this._userService.updateStar(this.user.key, dish.key, !dish.starred).then(() => {
      this._$timeout(() => dish.starred = !dish.starred);
    })
  }

  addIngredient(dish, ingredient) {
    this._dishesService.addIngredient(dish.key, {name: ingredient.name}).then(() => {
      ingredient._original_ = {name: ingredient.name};
      this._$timeout(() => dish.ingredients.push({name: undefined, amount: undefined, section: undefined}));
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

  filter(query) {
    for (let dish of this.dishes) {
      dish.filteredOut = !dish.name.startsWith(query);
    }
  }

  //filterDishes(query) {
  //  "use strict";
  //
  //  console.log('filter');
  //  console.log('filter');
  //  console.log('filter');
  //  console.log('filter');
  //  //this.dishes = this._dishesService.filterDishes(query);
  //  this.dishes = this._dishesService.dishes;
  //}

  //todo we shouldn't be able to delete dishes if they are used by other users -> each dish should have hint
  //if they are only used by us -> also delete entry in weekmenu
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
      this._dishesService.deleteDish(dish)
        .then(() => {
          this.toast(dish.name + ' removed');
        })
    }, () => {
      //ok
    });
  }

  addDishToWeekMenu(dish) {
    "use strict";
    this._weekMenuService.addDishId(dish.key).then(() => {
      this.toast(dish.name + ' added to week menu');
    });
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
