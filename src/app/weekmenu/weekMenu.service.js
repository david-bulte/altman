class WeekMenuService {

  constructor() {
    'ngInject';
  }

  getWeekMenuDishes(listKey) {

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function getWeekMenuDishes() {
        let weekMenusRef = new Firebase("https://altman.firebaseio.com/weekmenus");
        weekMenusRef.orderByChild('list').equalTo(listKey).once('value', (snapshot) => {
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
        let weekMenuDishes = yield getWeekMenuDishes(); //returns all members of current list
        for (let weekMenuDish of weekMenuDishes) {
          weekMenuDish._dish_ = yield getDish(weekMenuDish.dish);
        }
        resolve(weekMenuDishes);
      }
    });
  }

  addDish(listKey, dishKey) {
    let updateWeekMenus = () => {
      new Promise((resolve) => {
        let weekMenuRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${listKey}`);
        let dish = {};
        dish[dishKey] = true;
        weekMenuRef.update(dish, () => resolve());
      });
    };

    let updateDish = () => {
      new Promise((resolve) => {
        let usedByRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy`);
        let usedBy = {};
        usedBy[listKey] = true;
        usedByRef.update(usedBy, () => resolve());
      });
    };

    return Promise.all([updateWeekMenus(), updateDish()]);
  }

  removeDish(listKey, dishKey) {
    let updateWeekMenus = () => {
      new Promise((resolve) => {
        let dishRef = new Firebase(`https://altman.firebaseio.com/weekmenus/${listKey}/${dishKey}`);
        dishRef.remove(() => resolve());
      });
    };

    let updateDish = () => {
      new Promise((resolve) => {
        let listRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy/${listKey}`);
        listRef.remove(() => resolve());
      });
    };

    return Promise.all([updateWeekMenus(), updateDish()]);
  }

}

export default WeekMenuService;
