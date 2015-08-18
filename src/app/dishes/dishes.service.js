let _cache = new WeakMap();

class DishesService {

  constructor($timeout) {
    'ngInject';

    this._$timeout = $timeout;

    _cache.set(this, []);
  }

  static _model(snapshot) {
    "use strict";
    let obj = snapshot.val();
    obj.key = snapshot.key();
    return obj;
  }

  getDishes(query) {
    "use strict";

    let result = _cache.get(this);
    result.length = 0;

    return new Promise((resolve) => {
      let ref = new Firebase("https://altman.firebaseio.com/dishes");
      ref.orderByChild('name').startAt(query).on('child_added', (snapshot) => {
        let dish = DishesService._model(snapshot);
        if (query && query.length > 0 && !dish.name.startsWith(query)) {
          return;
        }
        result.push(dish);
        this._$timeout(() => {
          resolve(result);
        });
      });
    });
  }

  getDish(key) {
    "use strict";

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

  addDish(dish) {
    "use strict";
    let ref = new Firebase("https://altman.firebaseio.com/dishes");
    dish.key = ref.push(dish).key();
  }

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
