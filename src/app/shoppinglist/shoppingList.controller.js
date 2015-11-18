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
    this._userService.getCurrentUser()
      .then(user => this.user = user)
      .then(this._getShoppingList.bind(this));
  }

  _getShoppingList() {
      this._shoppingListService.getShoppingList(this.user.activeFamily).then((shoppingList) => {
        this._$timeout(() => {
          //this._model(shoppingList);
          this.shoppingList = shoppingList;
          console.log('shoppingList', shoppingList);
          this.sections = Object.values(shoppingList.sections);
        });
      });
  }

  switchIngredient(section, ingredient) {
    console.log(section);
    console.log(ingredient);
    //let copy = this._unmodel(angular.copy(this.shoppingList));
    this._shoppingListService.updateIngredient(this.user.activeFamily, section.name, ingredient.key, {switched : ingredient.switched}).then((ingredient) => {
      //todo toast
    });
  }

  removeIngredient(section, ingredient) {
    //todo
    //section.ingredients.splice(section.ingredients.indexOf(ingredient), 1);
    //let copy = this._unmodel(angular.copy(this.shoppingList));
    //this._shoppingListService.updateShoppingList(copy).then((shoppingList) => {
    //});
  }

  addIngredient(section, ingredient) {
    //todo
  }

  updateIngredient(section, ingredient) {
  //  let isCreate = ingredient._original_ === undefined;
  //  let copy = this._unmodel(angular.copy(this.shoppingList));
  //  this._shoppingListService.updateShoppingList(copy).then((shoppingList) => {
  //    if (isCreate) {
  //      ingredient._original_ = ingredient;
  //      this._$timeout(() => section.ingredients.push({name: undefined, amount: undefined, section: undefined}));
  //    }
  //  });
  //
  }

  //update-ingredient="shoppingListCtrl.updateIngredient(section, ingredient)"
  //  switch-ingredient="shoppingListCtrl.switchIngredient(section, ingredient)"
  //ng-repeat="section in shoppingListCtrl.sections"></section-card>

  //todo ???
  //_unmodel(shoppingList) {
  //  for (let section of Object.values(shoppingList.sections)) {
  //    if (section.ingredients === undefined) {
  //      section.ingredients = [];
  //    }
  //    for (let ingredient of section.ingredients) {
  //      delete ingredient._original_;
  //    }
  //  }
  //  return shoppingList;
  //}



}

export default ShoppingListController;
