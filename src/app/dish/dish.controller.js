class DishController {

  constructor(ConfigService, DishesService, $location, $scope, $routeParams) {
    'ngInject';

    this._$scope = $scope;
    this._$location = $location;
    this._dishesService = DishesService;

    ConfigService.getConfig().then((config) => {
      "use strict";
      this.sections = config.sections;
      this.tags = config.tags;
    });

    this.dish = {};

    let key = $routeParams.key;

    if (key !== undefined) {
      this._dishesService.getDish(key)
        .then((dish) => {
          this.dish.key = dish.key;
          this.dish.name = dish.name;
          if (dish.ingredients) {
            this.dish.ingredients = Array.from(dish.ingredients);
          }
        });
    }

    this.tags = [];
    this.ingredients = [];
    this.ingredients.push({name: undefined, fresh: true});

    //$scope.$watch('dish.dish', (dish) => {
    //  "use strict";
    //  if (dish) {
    //    DishesService.addDish(dish);
    //  }
    //})
  }

  save() {
    "use strict";
    let dish = {
      key: this.dish.key,
      name: this.dish.name,
      ingredients: this.ingredients.filter((ingredient) => {
        return !ingredient.fresh;
      })
    };

    var self = this;
    this._dishesService.saveDish(dish).then(() => {
      //toast
      //change location
      self._$location.path('/dishes');
      self._$scope.$apply();
    });
  }

  ingredientChanged(ingredient) {
    "use strict";
    if (ingredient.fresh === true) {
      delete ingredient.fresh;
      this.ingredients.push({name: undefined, fresh: true});
    }
  }

}

export default DishController;
