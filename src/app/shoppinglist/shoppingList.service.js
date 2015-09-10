//offline -> investigate
//let _cache = new WeakMap();

class ShoppingListService {

  constructor(FamiliesService, $timeout) {
    'ngInject';

    this._familiesService = FamiliesService;
    //this._$timeout = $timeout;

    //todo
    this.sections = ['groenten & fruit', 'zuivel', 'vlees', 'droge voeding', 'ontbijt', 'diepvries', 'varia'];

    //_cache.set(this, new Map());

  }

  getSections(familyKey) {

    return new Promise((resolve) => {
      this._familiesService.getDishes(familyKey).then((dishes) => {

        let sections = {};

        for (let dish of dishes) {
          if (dish._dish_.ingredients !== undefined) {
            for (let key of Object.keys(dish._dish_.ingredients)) {
              let ingredient = dish._dish_.ingredients[key];
              //ingredient.name = key;
              let name = ingredient.section !== undefined ? ingredient.section : '_undefined_';
              let section = sections[name];
              if (section === undefined) {
                section = {name : name, ingredients : []};
                sections[name] = section;
              }
              section.ingredients.push(ingredient);
            }
          }
        }

        resolve(Object.values(sections));
      });
    });
  }

  getIngredients(familyKey) {
    "use strict";

    return new Promise((resolve) => {
      this._familiesService.getDishes(familyKey).then((dishes) => {
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
