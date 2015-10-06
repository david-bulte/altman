class DishesController {

  constructor(DishesService, ListsService, UserService, $mdDialog, $mdToast, $location, $timeout) {
    'ngInject';

    this._dishesService = DishesService;
    this._listsService = ListsService;
    this._userService = UserService;
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
    this._userService.getCurrentUser()
      .then(user => this.user = user)
      .then(this._getDishes.bind(this));
  }

  _getDishes(user) {
    this._dishesService.getDishes(user).then((dishes) => {
      this._$timeout(this.dishes = dishes);
    });
  }

  isStarred(dish) {
    return this.user.starred && this.user.starred[dish.key] === true;
  }

  toggleStar(dish) {
    let newVal = !this.isStarred(dish);
    this._userService.updateStar(this.user.key, dish.key, newVal).then((newVal) => {
      this._$timeout(() => this.user.starred[dish.key] = newVal);
    });
  }

  addToWeekMenu(dish) {
    var listKey = this.user.activeFamily;
    this._listsService.addDish(listKey, dish.key).then(() => {
      dish.usedBy.push(listKey);
      this.toast(dish.name + ' added to week menu')
    });
  }

  removeFromWeekMenu(dish) {
    var listKey = this.user.activeFamily;
    this._listsService.removeDish(listKey, dish.key).then(() => {
      dish.usedBy.splice(dish.usedBy.indexOf(listKey), 1);
      this.toast(dish.name + ' removed from week menu')
    });
  }

  isUsed(dish) {
    return this.user.activeFamily !== undefined && dish.usedBy.indexOf(this.user.activeFamily) >= 0;
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
      this._$timeout(() => {
        this.dishes.unshift(dish)
      });
    })
  }

  removeDish(dish) {
    //todo
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
