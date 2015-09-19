class ShoppingListController {

  constructor(ConfigService, ShoppingListService, UserService, $timeout) {
    'ngInject';

    this._shoppingListService = ShoppingListService;
    this._userService = UserService;
    this._$timeout = $timeout;
    this.editMode = false;

    this._init();
  }

  _init() {
    this._userService.getCurrentUser().then((user) => {
      this.user = user;
      this._shoppingListService.getShoppingList(user.activeFamily).then((shoppingList) => {
        this._$timeout(() => {
          this._model(shoppingList);
          this.shoppingList = shoppingList;
          this.sections = Object.values(shoppingList.sections);
        });
      });
      //this._getSections();
    });
  }

  _model(shoppingList) {
    console.log('>>> before', shoppingList);
    for (let section of Object.values(shoppingList.sections)) {
      if (section.ingredients === undefined) {
        section.ingredients = [];
      }
      for (let ingredient of section.ingredients) {
        ingredient._original_ = ingredient;
      }
    }
    console.log('>>> after', shoppingList);
  }

  //todo ???
  _unmodel(shoppingList) {
    for (let section of Object.values(shoppingList.sections)) {
      if (section.ingredients === undefined) {
        section.ingredients = [];
      }
      for (let ingredient of section.ingredients) {
        delete ingredient._original_;
      }
    }
    return shoppingList;
  }

  updateIngredient(section, ingredient) {
    let isCreate = ingredient._original_ === undefined;
    let copy = this._unmodel(angular.copy(this.shoppingList));
    this._shoppingListService.updateShoppingList(copy).then((shoppingList) => {
      if (isCreate) {
        ingredient._original_ = ingredient;
        this._$timeout(() => section.ingredients.push({name: undefined, amount: undefined, section: undefined}));
      }
    });

  }

}

export default ShoppingListController;
