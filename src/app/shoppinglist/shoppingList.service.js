//offline -> investigate
let _cache = new WeakMap();

class ShoppingListService {

  constructor(WeekMenuService, $timeout) {
    'ngInject';

    this._weekMenuService = WeekMenuService;
    this._$timeout = $timeout;

    _cache.set(this, new Map());

  }

  calc() {
    "use strict";

    //first delete



  }

  getIngredients() {
    "use strict";

    //let ingredients = _cache.get(this);
    //if (ingredients empty)
    //calc();
    //else resolve(ingredients)

    return new Promise((resolve, reject) => {
      this._weekMenuService.getDishes().then((dishes) => {
        let ingredients = [];
        for (let dish of dishes) {
          for (let key of Object.keys(dish.ingredients)) {
            ingredients.push(dish.ingredients[key]);
          }
        }
        resolve(ingredients);
      });
    });

  }

  addIngredient(ingredient) {
    "use strict";

  }

  joinIngredients(leftIngredient, rightIngredient, amount) {
    "use strict";

  }

}

export default ShoppingListService;
