class ShoppingListService {

  constructor(FamiliesService) {
    'ngInject';

    this._familiesService = FamiliesService;

    //todo
    this.sections = ['groenten & fruit', 'zuivel', 'vlees', 'droge voeding', 'ontbijt', 'diepvries', 'varia'];
  }

  getShoppingList(familyKey) {
    return new Promise((resolve) => {

      let shoppingListRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/shoppingList`);
      shoppingListRef.once('value', (snapshot) => {
        var shoppingList = snapshot.val();
        if (shoppingList !== null) {
          console.log('shoppingList', shoppingList);
          resolve(shoppingList);
        }
        else {
          this._createShoppingList(familyKey).then((shoppingList) => resolve(shoppingList));
        }
      });

    });
  }

  _createShoppingList(familyKey) {
    return new Promise((resolve) => {
      this.getSections(familyKey).then((shoppingList) => {
        let shoppingListRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/shoppingList`);
        shoppingListRef.update(shoppingList, () => {
          resolve(shoppingList)
        });
      });
    });
  }

  updateShoppingList(shoppingList) {
    //todo get rid of $$hashkey, cf.http://stackoverflow.com/questions/18826320/what-is-the-hashkey-added-to-my-json-stringify-result
    shoppingList = JSON.parse(angular.toJson(shoppingList));
    console.log('updating', shoppingList);
    return new Promise((resolve) => {
      let shoppingListRef = new Firebase(`https://altman.firebaseio.com/families/${shoppingList.family}/shoppingList`);
      shoppingListRef.update(shoppingList, () => resolve(shoppingList));
    });
  }

  getSections(familyKey) {

    return new Promise((resolve) => {
      this._familiesService.getDishes(familyKey).then((dishes) => {

        let shoppingList = {sections : {}, family : familyKey};

        for (let dish of dishes) {
          if (dish._dish_.ingredients !== undefined) {
            for (let key of Object.keys(dish._dish_.ingredients)) {
              let ingredient = dish._dish_.ingredients[key];
              let sectionName = ingredient.section !== undefined ? ingredient.section : '_undefined_';
              let section = shoppingList.sections[sectionName];
              if (section === undefined) {
                section = {name: sectionName, ingredients: []};
                shoppingList.sections[sectionName] = section;
              }
              ingredient.dish = dish._dish_.name;
              section.ingredients.push(ingredient);
            }
          }
        }

        for (let sectionName of this.sections) {
          if (shoppingList.sections[sectionName] === undefined) {
            shoppingList.sections[sectionName] = {
              ingredients: [],
              name: sectionName
            }
          }
        }

        resolve(shoppingList);
      });
    });
  }

  getIngredients(familyKey) {
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

  addIngredient(familyKey, section, ingredient, type) {
    return new Promise((resolve) => {
      let changesRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/shoppingListChanges/${type}`);
      let changeRef = changesRef.push();
      let change = {section: section, ingredient: ingredient};
      changeRef.set(change, () => {
        change.key = changeRef.key();
        resolve(change)
      })
    });
  }

  joinIngredients(leftIngredient, rightIngredient, amount) {
    "use strict";

  }

}

export default ShoppingListService;
