class WeekMenuService {

  constructor() {
    'ngInject';
  }

  getDishes(familyKey) {

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function getDishKeys() {
        let dishesRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${familyKey}`);
        dishesRef.once('value', (snapshot) => {
          let dishKeys = snapshot.val();

          let filtered = [];
          for (let [dishKey, included] of Object.entries(dishKeys)) {
            if (included === true) {
              filtered.push(dishKey);
            }
          }

          it.next(filtered);
        });
      }

      function getDish(dishKey) {
        let dishesRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}`);
        dishesRef.once('value', (snapshot) => {
          let dish = snapshot.val();
          dish.key = snapshot.key();
          it.next(dish);
        });
      }

      function* main() {
        let dishKeys = yield getDishKeys(); //returns all members of current family
        let dishes = [];
        for (let key of dishKeys) {
          let dish = yield getDish(key);
          dishes.push(dish);
        }
        resolve(dishes);
      }
    });
  }

  addDish(familyKey, dishKey) {
    let updateWeekMenus = () => {
      new Promise((resolve) => {
        let weekMenuRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${familyKey}`);
        let dish = {};
        dish[dishKey] = true;
        weekMenuRef.update(dish, () => resolve());
      });
    };

    let updateDish = () => {
      new Promise((resolve) => {
        let usedByRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy`);
        let usedBy = {};
        usedBy[familyKey] = true;
        usedByRef.update(usedBy, () => resolve());
      });
    };

    return Promise.all([updateWeekMenus(), updateDish()]);
  }

  removeDish(familyKey, dishKey) {
    let updateWeekMenus = () => {
      new Promise((resolve) => {
        let dishRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${familyKey}/${dishKey}`);
        dishRef.remove(() => resolve());
      });
    };

    let updateDish = () => {
      new Promise((resolve) => {
        let familyRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy/${familyKey}`);
        familyRef.remove(() => resolve());
      });
    };

    return Promise.all([updateWeekMenus(), updateDish()]);
  }

  removeDishId(key) {
    "use strict";
    return new Promise((resolve, reject) => {
      let ref = new Firebase('https://altman.firebaseio.com/weekmenus/david_bulte/dishes');
      let dish = {};
      dish[key] = null;
      ref.update(dish, (err) => {
        if (err) {
          reject();
        }
        else {
          resolve();
        }
      });
    });
  }

  //removeDishId(key) {
  //  "use strict";
  //  return new Promise((resolve, reject) => {
  //    let ref = new Firebase('https://altman.firebaseio.com/weekmenus/david_bulte/dishes');
  //    let dish = {};
  //    dish[key] = null;
  //    ref.update(dish, (err) => {
  //      if (err) {
  //        reject();
  //      }
  //      else {
  //        resolve();
  //      }
  //    });
  //  });
  //}

}

export default WeekMenuService;
