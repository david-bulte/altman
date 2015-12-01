import ShoppingList from './shoppingList.js';

class ShoppingListService {

    constructor(ConfigService, ListsService) {
        'ngInject';

        this._listsService = ListsService;
        ConfigService.getSections().then(sections => this.sections = sections);
    }

    /**
     * Gets or creates shoppingList
     * @param listKey
     * @returns {Promise}
     */
    getShoppingList(listKey) {
        return this._getShoppingList(listKey).then(shoppingList => {
            return shoppingList !== null ? shoppingList : this._createShoppingList(listKey);
        });
    }

    /**
     * get shoppinglist
     * @param listKey
     * @returns {Promise}
     * @private
     */
    _getShoppingList(listKey) {
        return new Promise((resolve, reject) => {
            let shoppingListRef = new Firebase(`https://altman.firebaseio.com/families/${listKey}/shoppingList`);
            shoppingListRef.once('value', (snapshot) => {
                let shoppingList = ShoppingList.fromSnapshot(snapshot);
                resolve(shoppingList);
            });
        });
    }

    /**
     * create shopping list
     * @param listKey
     * @returns {*}
     * @private
     */
    _createShoppingList(listKey) {
        return this._composeShoppingList(listKey)
            .then(this._saveShoppingList)
            .then(() => listKey)
            .then(this._getShoppingList);
    }

    /**
     * saves shopping list
     * @param shoppingList
     * @returns {Promise}
     * @private
     */
    _saveShoppingList(shoppingList) {
        return new Promise((resolve, reject) => {
            let shoppingListRef = new Firebase(`https://altman.firebaseio.com/families/${shoppingList.family}/shoppingList`);
            shoppingListRef.update(shoppingList, () => {
                resolve(ShoppingList.fromRef(shoppingListRef));
            });
        });
    }

    /**
     * composes shopping list
     * @param listKey
     * @returns {Promise}
     * @private
     */
    _composeShoppingList(listKey) {
        return this._listsService.getListsByListKey(listKey, {dishes : true})
            .then((lists) => {

                let dishes = lists && lists.length > 0 ? lists[0].dishes : [];

                let shoppingList = {sections: {}, family: listKey};

                for (let dish of dishes) {
                    if (dish.ingredients !== undefined) {
                        for (let key of Object.keys(dish.ingredients)) {
                            let ingredient = dish.ingredients[key];
                            let sectionName = ingredient.section !== undefined ? ingredient.section : '_undefined_';
                            let section = shoppingList.sections[sectionName];
                            if (section === undefined) {
                                section = {name: sectionName, ingredients: []};
                                shoppingList.sections[sectionName] = section;
                            }
                            ingredient.dish = dish.name;
                            //todo better create json iso array!!!
                            //where key = dishKey + ingredientKey
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

                return shoppingList;
            })
            .catch((err) => {
                throw err;
            });
    }

    updateIngredient(listKey, sectionKey, ingredientKey, ingredient) {
        return new Promise((resolve, reject) => {
            //todo 0????
            //let ingredientRef = new Firebase(`https://altman.firebaseio.com/families/${listKey}/shoppingList/sections/${sectionKey}/ingredients/${ingredientKey}`);
            let ingredientRef = new Firebase(`https://altman.firebaseio.com/families/${listKey}/shoppingList/sections/${sectionKey}/ingredients/0`);
            ingredientRef.update(ingredient, (res) => {
                resolve(ingredient)
            });
        });
    }


    getIngredients(familyKey) {
        return new Promise((resolve) => {
            this._listsService.getDishes(familyKey).then((dishes) => {
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

    updateShoppingList(shoppingList) {
        //todo get rid of $$hashkey, cf.http://stackoverflow.com/questions/18826320/what-is-the-hashkey-added-to-my-json-stringify-result
        shoppingList = JSON.parse(angular.toJson(shoppingList));
        console.log('updating', shoppingList);
        return new Promise((resolve) => {
            let shoppingListRef = new Firebase(`https://altman.firebaseio.com/families/${shoppingList.family}/shoppingList`);
            shoppingListRef.update(shoppingList, () => resolve(shoppingList));
        });
    }


    joinIngredients(leftIngredient, rightIngredient, amount) {
        "use strict";

    }

}

export default ShoppingListService;
