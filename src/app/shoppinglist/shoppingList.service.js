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
            let shoppingListRef = new Firebase(`https://altman.firebaseio.com/shoppingLists/${listKey}`);
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
        let createShoppingList = new Promise((resolve, reject) => {
            let shoppingListRef = new Firebase(`https://altman.firebaseio.com/shoppingLists/${shoppingList.list}`);
            //let shoppingListRef = shoppingListsRef.push();
            shoppingListRef.update(shoppingList, () => {
                shoppingList.key = shoppingListRef.key();
                resolve(shoppingList);
                //resolve(ShoppingList.fromRef(shoppingListRef));
            });
        });

        let updateList = (shoppingList) => {
            return new Promise((resolve, reject) => {
                let listRef = new Firebase(`https://altman.firebaseio.com/lists/${shoppingList.list}`);
                listRef.update({shoppingList: shoppingList.key}, () => {
                    resolve(shoppingList);
                });
            });
        }

        return createShoppingList.then(updateList);
    }


    //_saveShoppingList(shoppingList) {
    //    return new Promise((resolve, reject) => {
    //        let shoppingListRef = new Firebase(`https://altman.firebaseio.com/lists/${shoppingList.list}/shoppingList`);
    //        shoppingListRef.update(shoppingList, () => {
    //            resolve(ShoppingList.fromRef(shoppingListRef));
    //        });
    //    });
    //}
    //
    /**
     * composes shopping list
     * @param listKey
     * @returns {Promise}
     * @private
     */
    _composeShoppingList(listKey) {
        return this._listsService.getListsByListKey(listKey, {dishes: true})
            .then((lists) => {

                let shoppingList = {sections: {}, list: listKey};
                let dishes = lists && lists.length > 0 ? lists[0].dishes : [];

                dishes
                    .filter(dish => dish.ingredients !== undefined)
                    .map(dish => {
                        dish.ingredients.forEach(ingredient => {
                            ingredient.dish = dish.name;
                        });
                        return dish.ingredients;
                    })
                    .reduce((arr1, arr2) => arr1.concat(arr2), [])
                    .forEach(ingredient => {
                        let name = ingredient.section ? ingredient.section : '_undefined_';
                        let section = shoppingList.sections[name];
                        if (section == undefined) {
                            section = {name: name, ingredients: []};
                            shoppingList.sections[name] = section;
                        }
                        section.ingredients.push(ingredient);
                    })

                for (let name of this.sections) {
                    if (shoppingList.sections[name] === undefined) {
                        shoppingList.sections[name] = {
                            ingredients: [],
                            name: name
                        }
                    }
                }

                return shoppingList;
            })
            .catch((err) => {
                throw err;
            });
    }

    updateShoppingList(shoppingList) {
        return new Promise((resolve, reject) => {
            let shoppingListRef = new Firebase(`https://altman.firebaseio.com/shoppingLists/${shoppingList.key}`);
            //cf. http://stackoverflow.com/questions/17680131/firebase-push-failed-first-argument-contains-an-invalid-key-hashkey
            let copy = JSON.parse(angular.toJson(shoppingList));
            delete copy._firebaseo_;
            delete copy.name;
            shoppingListRef.update(copy, () => {
                resolve()
            });
        });
    }

    getIngredients(listKey) {
        return new Promise((resolve) => {
            this._listsService.getDishes(listKey).then((dishes) => {
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

    addIngredient(listKey, section, ingredient, type) {
        return new Promise((resolve) => {
            let changesRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/shoppingListChanges/${type}`);
            let changeRef = changesRef.push();
            let change = {section: section, ingredient: ingredient};
            changeRef.set(change, () => {
                change.key = changeRef.key();
                resolve(change)
            })
        });
    }

    //updateShoppingList(shoppingList) {
    //    //todo get rid of $$hashkey, cf.http://stackoverflow.com/questions/18826320/what-is-the-hashkey-added-to-my-json-stringify-result
    //    shoppingList = JSON.parse(angular.toJson(shoppingList));
    //    console.log('updating', shoppingList);
    //    return new Promise((resolve) => {
    //        let shoppingListRef = new Firebase(`https://altman.firebaseio.com/lists/${shoppingList.list}/shoppingList`);
    //        shoppingListRef.update(shoppingList, () => resolve(shoppingList));
    //    });
    //}


    joinIngredients(leftIngredient, rightIngredient, amount) {
        "use strict";

    }

}

export default ShoppingListService;
