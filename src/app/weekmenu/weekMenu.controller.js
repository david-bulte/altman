class WeekMenuController {

  constructor(ConfigService, DishesService, UserService, ListsService, $mdDialog, $mdToast, $location, $timeout) {
    'ngInject';

    this._configService = ConfigService;
    this._dishesService = DishesService;
    this._userService = UserService;
    this._listsService = ListsService;
    this._dialog = $mdDialog;
    this._toast = $mdToast;
    this._$location = $location;
    this._$timeout = $timeout;
    this.isOpen = false;

    this._userService.getCurrentUser()
      .then(user => this.user = user)
      .then(this._getSections.bind(this))
      .then(this._getDishes.bind(this));
  }

  _getSections() {
    this._configService.getSections(this.user.activeFamily).then((sections) => {
      this._$timeout(this.sections = sections);
    });
  }

  _getDishes() {
    //todo refactor : get lists (specify listKey) + specify what to fetch: dishes
    this._listsService.getLists(undefined, this.user.activeFamily, {dishes : true}).then((lists) => {
      if (lists && lists.length > 0) {
        this._$timeout(this.dishes = lists[0].dishes);
      }
    });
    //this._listsService.getDishes(this.user.activeFamily).then((dishes) => {
    //  this._$timeout(this.dishes = dishes);
    //});
  }

//todo cf dishes.controller
  isStarred(dish) {
    return this.user.starred && this.user.starred[dish.key] === true;
  }

//todo cf dishes.controller
  toggleStar(dish) {
    let newVal = !this.isStarred(dish);
    this._userService.updateStar(this.user.key, dish.key, newVal).then((newVal) => {
      this._$timeout(() => this.user.starred[dish.key] = newVal);
    });
  }

  //todo cf dishes.controller
  isUsed(dish) {
    return this.user.activeFamily !== undefined && dish.usedBy.indexOf(this.user.activeFamily) >= 0;
  }

  removeFromWeekMenu(dish) {
    var listKey = this.user.activeFamily;
    this._listsService.removeDish(listKey, dish.key).then(() => {
      this.dishes.splice(dish, 1);
      this.toast(dish.name + ' removed from week menu')
    });
  }

  updateName(dish) {
    this._dishesService.updateName(dish.key, dish.name).then(() => {
      this.toast(dish.name + ' updated')
    })
  }

  addIngredient(dish, ingredient) {
    this._dishesService.addIngredient(dish.key, {name: ingredient.name}).then(() => {
      this._$timeout(() => {
        ingredient.key = ingredient.name;
        dish.ingredients.push({name: undefined, amount: undefined, section: undefined})
      });
    });
  }

  removeIngredient(dish, ingredient) {
    this._dishesService.removeIngredient(dish.key, ingredient.key).then(() => {
      this._$timeout(() => {
        dish.ingredients.splice(dish.ingredients.indexOf(ingredient), 1);
      });
    })
  }

  updateIngredient(dish, ingredient) {
    if (ingredient.key !== undefined) {
      this._dishesService.updateIngredient(dish.key, ingredient.key, ingredient).then(() => {
        //this was an update no need to add something new
      });
    }
    else {
      this.addIngredient(dish, ingredient);
    }
  }

  createDish() {
    this._dishesService.createDish().then((dish) => {
      this._listsService.addDish(this.user.activeFamily, dish.key).then(() => {
        this._$timeout(() => {
          this.dishes.unshift(dish)
        });
      });
    })
  }










  //setupDish() {
  //  this._dishesService.addDish().then((dishKey) => {
  //    this._listsService.addDish(this.user.activeFamily, dishKey).then(() => {
  //      //todo return dish and add that to dish collection?
  //      this._getDishes();
  //    });
  //  })
  //}


  //toggleStar(dish) {
  //  this._userService.updateStar(this.user.key, dish.key, !dish.starred).then(() => {
  //    this._$timeout(() => dish.starred = !dish.starred);
  //  });
  //}

  //removeIngredient(dish, ingredient) {
  //  this._dishesService.removeIngredient(dish.key, ingredient.name).then(() => {
  //    this._$timeout(() => {
  //      let idx = dish.ingredients.indexOf(ingredient);
  //      dish.ingredients.splice(idx, 1);
  //    });
  //  })
  //}

  ////todo wordt dit ooit rechtstreek opgeroepen?
  //addIngredient(dish, ingredient) {
  //  this._dishesService.addIngredient(dish.key, {name: ingredient.name}).then(() => {
  //    ingredient._original_ = {name: ingredient.name};
  //    this._$timeout(() => dish.ingredients.push({name: undefined, amount: undefined, section: undefined}));
  //  });
  //}

  //updateIngredient(dish, ingredient) {
  //  //todo update/add refactor
  //  if (ingredient._original_ !== undefined) {
  //    this._dishesService.updateIngredient(dish.key, ingredient._original_.name, ingredient).then(() => {
  //      //this was an update no need to add something new
  //    });
  //    //this._dishesService.updateIngredient(dish, ingredient);
  //  }
  //  else {
  //    this.addIngredient(dish, ingredient);
  //  }
  //}

  //removeFromWeekMenu(dish) {
  //  //todo confirm dialog
  //  var familyKey = this.user.activeFamily;
  //  this._listsService.removeDish(familyKey, dish.key).then(() => {
  //    this._$timeout(() => this.dishes.splice(this.dishes.indexOf(dish), 1));
  //    this.toast(dish.name + ' removed from week menu')
  //  });
  //}

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
  //      this.dishes.splice(this.dishes.indexOf(dish), 1);
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
