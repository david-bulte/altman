class WeekMenuService {

  constructor() {
    'ngInject';
  }

  getDishes() {
    "use strict";

    let getKeys = () => {
      return new Promise((resolve, reject) => {
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

      return new Promise((resolve, reject) => {
        var dishes = [];
        var fs = [];
        for (let key of keys) {
          fs.push(makePromise(key, dishes));
        }
        Promise.all(fs).then(() => {
          resolve(dishes);
        })
      });
    };

    return new Promise((resolve, reject) => {
      getKeys()
        .then(getDishes)
        .then(resolve);
    });

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
      ref.update(dish, callback(resolve, reject));
    });

    //let updateDish = new Promise((resolve, reject) => {
    //  let ref = new Firebase('https://altman.firebaseio.com/dishes/' + key + '/weekmenus');
    //  ref.set({david_bulte : 1}, callback(resolve, reject));
    //});

    //return Promise.all([updateWeekmenu, updateDish]);

    return updateWeekmenu;
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

}

export default WeekMenuService;
