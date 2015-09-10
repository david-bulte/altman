class ShoppingListController {

  constructor(ConfigService, ShoppingListService, UserService, $timeout) {
    'ngInject';

    //this.sections = [];
    //this._cache = {};

    //this._configService = ConfigService;
    this._shoppingListService = ShoppingListService;
    this._userService = UserService;
    this._$timeout = $timeout;

    //let self = this;
    //this._configService.getConfig().then((config) => {
    //
    //  this.sections = config.sections;
    //  for (let section of this.sections) {
    //    self._cache[section] = [];
    //  }
    //
    //  this._shoppingListService.getIngredients().then((ingredients) => {
    //
    //    for (let ingredient of ingredients) {
    //      let section = ingredient.section;
    //      if (section) {
    //        self._cache[section].push(ingredient);
    //      }
    //      else {
    //        //varia?
    //      }
    //    }
    //
    //    $scope.$apply();
    //  });
    //
    //});

    this._init();
  }

  _init() {
    this._userService.getCurrentUser().then((user) => {
      this.user = user;
      this._getSections();
    });
  }

  _getSections() {
    this._shoppingListService.getSections(this.user.activeFamily).then((sections) => {
      this._$timeout(() => {
        console.log(sections);
        this.sections = sections
      });
    });
  }

  getIngredients(section) {
    "use strict";
    return this._cache[section];
  }

  //_getDishes(query) {
  //  "use strict";
  //  this._dishesService.getDishes(query).then((dishes) => {
  //    "use strict";
  //    this.dishes = dishes;
  //  });
  //}

}

export default ShoppingListController;
