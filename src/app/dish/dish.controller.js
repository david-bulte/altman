class DishController {

  constructor(ConfigService, DishesService, $location, $scope, $routeParams) {
    'ngInject';

    this._$scope = $scope;
    this._$location = $location;
    this._dishesService = DishesService;

    this.ctrl = 'DishController';

    ConfigService.getConfig().then((config) => {
      "use strict";
      this.sections = config.sections;
      this.tags = config.tags;
    });

    this.dish = {};
    this.tags = [];
    this.ingredients = [{name: undefined, fresh: true}];

    let key = $routeParams.key;

    if (key !== undefined) {
      this._dishesService.getDish(key)
        .then((dish) => {
          this.dish.key = dish.key;
          this.dish.name = dish.name;
          if (dish.ingredients) {
            for (let ingredient of Object.keys(dish.ingredients)) {
              this.ingredients.unshift(dish.ingredients[ingredient]);
            }
          }
        });
    }

    //$scope.$watch('dish.dish', (dish) => {
    //  "use strict";
    //  if (dish) {
    //    DishesService.addDish(dish);
    //  }
    //})
  }

  save() {

    console.log('save() ' + this.ctrl);

    "use strict";
    let dish = {
      key: this.dish.key,
      name: this.dish.name,
      ingredients: {}
    };

    for (let ingredient of this.ingredients) {
      if (!ingredient.fresh) {
        dish.ingredients[ingredient.name] = {
          name : ingredient.name,
          amount : ingredient.amount,
          section : ingredient.section
        };
      }
    }

    var self = this;
    this._dishesService.saveDish(dish).then((dish) => {
      self.saved(dish);
    });
  }

  saved(dish) {
    "use strict";

    console.log('saved() ' + this.ctrl);

    this._$location.path('/dishes');
    this._$scope.$apply();
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
