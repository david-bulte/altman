class ShoppingListController {

  constructor(ConfigService, ShoppingListService, $scope) {
    'ngInject';

    this.sections = [];
    this._cache = {};

    this._configService = ConfigService;
    this._shoppingListService = ShoppingListService;

    let self = this;
    this._configService.getConfig().then((config) => {
      "use strict";

      this.sections = config.sections;
      for (let section of this.sections) {
        self._cache[section] = [];
      }

      this._shoppingListService.getIngredients().then((ingredients) => {

        for (let ingredient of ingredients) {
          let section = ingredient.section;
          if (section) {
            self._cache[section].push(ingredient);
          }
          else {
            //varia?
          }
        }

        $scope.$apply();

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
