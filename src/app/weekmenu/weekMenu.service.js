let _dishIds = new WeakMap();

class WeekMenuService {

  constructor() {
    'ngInject';

    _dishIds.set(this, new Set());
  }

  get dishIds() {
    "use strict";
    return _dishIds.get(this).values();
  }

  addDishId(key) {
    "use strict";

    let callback = (resolve, reject) => {
      return (err) => {
        if (err) {
          reject();
        }
        else {
          resolve()
        }
      };
    };


    let updateWeekmenu = new Promise((resolve, reject) => {
      let ref = new Firebase('https://altman.firebaseio.com/weekmenus/david_bulte/dishes');
      let dish = {};
      dish[key] = 1;
      ref.set(dish, callback(resolve, reject));
    });

    let updateDish = new Promise((resolve, reject) => {
      let ref = new Firebase('https://altman.firebaseio.com/dishes/' + key + '/weekmenus');
      ref.set({david_bulte : 1}, callback(resolve, reject));
    });

    return Promise.all([updateWeekmenu, updateDish]);
  }

  removeDishId(dishId) {
    "use strict";
    _dishIds.get(this).delete(dishId);
  }

}

export default WeekMenuService;
