let _cache = new WeakMap();

class DishesService {

  constructor(FamiliesService, UserService, $log, $timeout) {
    'ngInject';

    this._familiesService = FamiliesService;
    this._userService = UserService;
    this._$log = $log;
    this._$timeout = $timeout;

    _cache.set(this, []);
  }

  static _model(snapshot) {
    "use strict";
    let obj = snapshot.val();
    obj.key = snapshot.key();
    return obj;
  }

  getDishes() {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function getMembers() {
        self._userService.getCurrentUser().then((user) => {
          let familyKey = user.activeFamily;
          self._familiesService.getFamily(familyKey).then((family) => {
            let members = family.members;
            it.next(members);
          });
        });
      }

      function getDishes(userKey, dishes) {
        let dishesRef = new Firebase("https://altman.firebaseio.com/dishes");
        //todo investigate child_added for 'live collection'
        dishesRef.orderByChild('createdBy').equalTo(userKey).once('value', (snapshot) => {
          self._$log.debug('getDishes.value', snapshot.val());
          snapshot.forEach(function (data) {
            var dish = data.val();
            dish.key = data.key();
            dishes.push(dish);
          });
          it.next();
        });
      }

      function* main() {
        //todo could be rewritten so as to only retrieve keys
        let users = yield getMembers(); //returns all members of current family
        let dishes = [];
        for (let user of users) {
          yield getDishes(user.key, dishes);
        }
        //todo also get all starred items from other families
        resolve(dishes);  //note: this is a 'live' result, when new dishes are created by someone of the family, this
                          // dish will be added! It is up to the controller to do some extra filtering on it.
      }
    });
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

  addDish(name = '_default_') {
    return new Promise((resolve) => {
      let dishesRef = new Firebase('https://altman.firebaseio.com/dishes');
      let dishRef = dishesRef.push();
      dishRef.set({name: name, createdBy: dishesRef.getAuth().uid}, () => {
        resolve(dishRef.key());
      });
    });
  }

  removeDish(dishKey) {
    return new Promise((resolve) => {
      let dishRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}`);
      dishRef.remove(() => resolve());
    });
  }

  updateName(dishKey, name) {
    return new Promise((resolve) => {
      let dishRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}`);
      dishRef.update({name: name}, () => resolve());
    });
  }

  addIngredient(dishKey, {name = '_default_', amount = '_unknown_', section = 'varia'}) {
    //todo consider storing product + section separately so as to have autocomplete on section
    return new Promise((resolve) => {
      let ingredientsRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/ingredients`);
      let ingredients = {};
      ingredients[name] = {amount: amount, section: section};
      ingredientsRef.update(ingredients, () => {
        resolve();
      });
      //let ingredientRef = ingredientsRef.push();
      //ingredientRef.set({name: name, createdBy: ingredientsRef.getAuth().uid}, () => {
      //  resolve(ingredientRef.key());
      //});
    });
  }

  removeIngredient(dishKey, ingredientKey) {
    return new Promise((resolve) => {
      let ingredientRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/ingredients/${ingredientKey}`);
      ingredientRef.remove(() => resolve());
    });
  }

  //updateIngredient(dishKey, ingredientKey, {name = '_default_', amount = '_unknown_', section = '_miscellaneous_'}) {
  //  return new Promise((resolve) => {
  //    let ingredientRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/ingredients/${ingredientKey}`);
  //    ingredientRef.update({name: name, amount: amount, section : section}, () => resolve());
  //  });
  //}

  //todo varia
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

export default DishesService;
