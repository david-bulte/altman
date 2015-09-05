class WeekMenuService {

  constructor() {
    'ngInject';
  }

  //addWeekMenu(familyKey, name = '_default_') {
  //  return new Promise((resolve) => {
  //    let weekMenusRef = new Firebase('https://altman.firebaseio.com/weekmenus');
  //    let weekMenuRef = weekMenusRef.push();
  //    weekMenuRef.set({family: familyKey, name: name, comments: 'test'}, () => resolve());
  //  });
  //}

  //getWeekMenu(weekMenuKey) {
  //
  //  let getWeekMenu = () => {
  //    return new Promise((resolve) => {
  //      let weekMenusRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${weekMenuKey}`);
  //      weekMenusRef.on('value', (snapshot) => {
  //        let weekMenu = snapshot.val();
  //        weekMenu.key = snapshot.key();
  //        resolve(weekMenu);
  //      });
  //    });
  //  };
  //
  //  let getDish = (dishKey) => {
  //    return new Promise((resolve) => {
  //      let dishesRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}`);
  //      dishesRef.once('value', (snapshot) => {
  //        let dish = snapshot.val();
  //        dish.key = snapshot.key();
  //        resolve(dish);
  //      });
  //    });
  //  };
  //
  //  let loadDishes = (weekMenu) => {
  //    let promises = [];
  //    for (let dishKey of weekMenu.dishes) {
  //      promises.push(new Promise((resolve) => {
  //        getDish(dishKey).then(() => resolve());
  //      }));
  //    }
  //    return Promise.all(promises);
  //  };
  //
  //  return getWeekMenu()
  //    .then(loadDishes);
  //}

  getWeekMenuDishes(familyKey) {

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function getWeekMenuDishes() {
        let weekMenusRef = new Firebase("https://altman.firebaseio.com/weekmenus");
        weekMenusRef.orderByChild('family').equalTo(familyKey).once('value', (snapshot) => {
          let weekMenuDishes = [];
          snapshot.forEach(function (data) {
            weekMenuDishes.push(data.val());
          });
          it.next(weekMenuDishes);
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
        let weekMenuDishes = yield getWeekMenuDishes(); //returns all members of current family
        for (let weekMenuDish of weekMenuDishes) {
          weekMenuDish._dish_ = yield getDish(weekMenuDish.dish);
        }
        resolve(weekMenuDishes);
      }
    });
  }

  //getDishes(familyKey) {
  //
  //  return new Promise((resolve) => {
  //
  //    let it = main();
  //    it.next();
  //
  //    function getDishKeys() {
  //      let dishesRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${familyKey}`);
  //      dishesRef.once('value', (snapshot) => {
  //        let dishKeys = snapshot.val();
  //
  //        let filtered = [];
  //        for (let [dishKey, included] of Object.entries(dishKeys)) {
  //          if (included === true) {
  //            filtered.push(dishKey);
  //          }
  //        }
  //
  //        it.next(filtered);
  //      });
  //    }
  //
  //    function getDish(dishKey) {
  //      let dishesRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}`);
  //      dishesRef.once('value', (snapshot) => {
  //        let dish = snapshot.val();
  //        dish.key = snapshot.key();
  //        it.next(dish);
  //      });
  //    }
  //
  //    function* main() {
  //      let dishKeys = yield getDishKeys(); //returns all members of current family
  //      let dishes = [];
  //      for (let key of dishKeys) {
  //        let dish = yield getDish(key);
  //        dishes.push(dish);
  //      }
  //      resolve(dishes);
  //    }
  //  });
  //}

  //addDish(weekMenuKey, dishKey) {
  //
  //  let updateWeekMenu = () => {
  //    new Promise((resolve) => {
  //      let dishesRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${weekMenuKey}/dishes`);
  //      let dishes = {};
  //      dishes[dishKey] = true;
  //      dishesRef.update(dishes, () => resolve());
  //    });
  //  };
  //
  //  let updateDish = () => {
  //    new Promise((resolve) => {
  //      let usedByRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy`);
  //      let usedBy = {};
  //      usedBy[weekMenuKey] = true;
  //      usedByRef.update(usedBy, () => resolve());
  //    });
  //  };
  //
  //  return Promise.all([updateWeekMenu(), updateDish()]);
  //}

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


  //removeDish(weekMenuKey, dishKey) {
  //  let updateWeekMenu = () => {
  //    new Promise((resolve) => {
  //      let dishRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${weekMenuKey}/dishes/${dishKey}`);
  //      dishRef.remove(() => resolve());
  //    });
  //  };
  //
  //  let updateDish = () => {
  //    new Promise((resolve) => {
  //      let weekMenuRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy/${weekMenuKey}`);
  //      weekMenuRef.remove(() => resolve());
  //    });
  //  };
  //
  //  return Promise.all([updateWeekMenu(), updateDish()]);
  //}
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
