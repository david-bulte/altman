class WeekMenuService {

  constructor() {
    'ngInject';
  }

  getDishes() {
    "use strict";

    let getKeys = () => {
      return new Promise((resolve) => {
        let ref = new Firebase('https://altman.firebaseio.com/weekmenus/david_bulte/dishes');
        ref.once('value', (snapshot) => {
          let keys = [];
          let val = snapshot.val();
          for (let key of Object.keys(val)) {
            if (val[key] > 0) {
              keys.push(key);
            }
          }
          resolve(keys);
        });
      });
    };

    let getDish = (key, callback) => {
      let ref = new Firebase('https://altman.firebaseio.com/dishes/' + key);
      ref.once('value', (snapshot) => {
        callback(snapshot.val());
      });
    };

    let getDishes = (keys) => {

      let makePromise = (key, result) => {
        return new Promise((resolve) => {
          getDish(key, (val) => {
            val.key = key;
            result.push(val);
            resolve();
          });
        });
      };

      return new Promise((resolve) => {
        var dishes = [];
        var fs = [];
        for (let key of keys) {
          fs.push(makePromise(key, dishes));
        }
        Promise.all(fs).then(() => {
          resolve(dishes);
        });
      });
    };

    return new Promise((resolve) => {
      getKeys()
        .then(getDishes)
        .then(resolve);
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
