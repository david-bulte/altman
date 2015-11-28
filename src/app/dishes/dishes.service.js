import Dish from './dish.js';

let _cache = new WeakMap();

class DishesService {

  constructor(ListsService, UserService, $log, $timeout) {
    'ngInject';

    this._listsService = ListsService;
    this._userService = UserService;
    this._$log = $log;
    this._$timeout = $timeout;

    _cache.set(this, []);
  }

  _getMembers(listKey) {
    return new Promise((resolve, reject) => {
      this._listsService.getListsByListKey(listKey).then((lists) => {
        resolve(lists.length > 0 ? lists[0].members : []);
      });
    });
  }

  /**
   * Returns dishes created all members of user's active family
   * @param user
   * @returns {Promise}
   */
  getDishes(user) {
    return new Promise((resolve, reject) => {
      let getMembers = this._getMembers.bind(this);
      getMembers(user.activeFamily)
        .then((members) => {
          return Promise.all(members.map((user) => {
            return user.key;
          }))
        })
        .then((userKeys) => {
          return Promise.all(userKeys.map(_getDishes))
        })
        .then((dishesLists) => { //multiple lists, 1 per member
          let result = [];
          for (let list of dishesLists) {
            result = result.concat(list);
          }
          resolve(result);
        });
    });
  }

  /**
   * Updates the name of the given dish
   * @param dishKey
   * @param name
   * @returns {Promise}
   */
  updateName(dishKey, name) {
    return new Promise((resolve) => {
      let dishRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}`);
      dishRef.update({name: name}, () => resolve());
    });
  }

  /**
   * @returns {Promise}
   */
  createDish() {
    return new Promise((resolve) => {
      let dishesRef = new Firebase('https://altman.firebaseio.com/dishes');
      let dishRef = dishesRef.push();
      dishRef.set({createdBy: dishesRef.getAuth().uid}, () => {
        resolve(Dish.fromRef(dishRef));
      });
    });
  }

  /**
   *
   * @param dishKey
   * @param name
   * @param amount
   * @param section
   * @returns {Promise}
   */
  addIngredient(dishKey, {name = '_default_', amount = '_unknown_', section = 'varia'}) {
    return new Promise((resolve) => {
      let ingredientsRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/ingredients`);
      let ingredients = {};
      ingredients[name] = {name : name, amount: amount, section: section};
      ingredientsRef.update(ingredients, () => {
        resolve();
      });
    });
  }

  /**
   *
   * @param dishKey
   * @param ingredientKey
   * @returns {Promise}
   */
  removeIngredient(dishKey, ingredientKey) {
    return new Promise((resolve) => {
      let ingredientRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/ingredients/${ingredientKey}`);
      ingredientRef.remove(() => resolve());
    });
  }

  /**
   *
   * @param dishKey
   * @param ingredientKey
   * @param name
   * @param amount
   * @param section
   * @returns {Promise}
   */
  updateIngredient(dishKey, ingredientKey, {name = '_default_', amount = '_unknown_', section = 'varia'}) {
    return new Promise((resolve) => {
      if (ingredientKey !== name) {
        this.removeIngredient(dishKey, ingredientKey)
          .then(() => this.addIngredient(dishKey, {name: name, amount: amount, section: section}))
          .then(() => resolve());
      }
      else {
        let ingredientRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/ingredients/${ingredientKey}`);
        ingredientRef.update({name: name, amount: amount, section: section}, () => resolve());
      }
    });
  }






















  static _model(snapshot) {
    "use strict";
    let obj = snapshot.val();
    obj.key = snapshot.key();
    return obj;
  }

  getDish(key) {
    return new Promise((resolve) => {
      let ref = new Firebase("https://altman.firebaseio.com/dishes/" + key);
      ref.on("value", (snapshot) => {
        let dish = DishesService._model(snapshot);
        this._$timeout(() => {
          resolve(dish);
        });
      });
    });
  }

  removeDish(dishKey) {
    return new Promise((resolve) => {
      let dishRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}`);
      dishRef.remove(() => resolve());
    });
  }

  //deprecated
  saveDish(dish) {
    "use strict";

    let key = dish.key;
    delete dish.key;

    return new Promise(function (resolve, reject) {
      if (key) {
        let ref = new Firebase("https://altman.firebaseio.com/dishes/" + key);
        ref.set(dish, (err) => {
          if (err) {
            reject(err);
          }
          else {
            dish.key = key;
            resolve(dish);
          }
        });
      }
      else {
        let ref = new Firebase("https://altman.firebaseio.com/dishes");
        let dishRef = ref.push();
        dishRef.set(dish, (err) => {
          if (err) {
            reject(err);
          }
          else {
            dish.key = dishRef.key();
            resolve(dish);
          }
        });
      }
    });
  }

  //deprecated
  deleteDish(dish) {
    "use strict";

    return new Promise((resolve, reject) => {
      let ref = new Firebase("https://altman.firebaseio.com/dishes/" + dish.key);
      ref.remove((err) => {
        if (err) {
          reject(err);
        }
        else {
          this._$timeout(() => {
            let dishes = _cache.get(this);
            dishes.splice(dishes.indexOf(dish), 1);
            resolve();
          });
        }
      });
    });
  }

}

function _getDishes(userKey) {
  return new Promise((resolve, reject) => {
    let dishesRef = new Firebase('https://altman.firebaseio.com/dishes');
    dishesRef.orderByChild('createdBy').equalTo(userKey).once('value', (snapshot) => {
      let dishes = [];
      snapshot.forEach(function (data) {
        dishes.push(Dish.fromSnapshot(data));
      });
      resolve(dishes);
    });
  });
}

export default DishesService;
