class FamiliesService {

  constructor($log, $timeout) {
    'ngInject';

    this._$log = $log;
    this._$timeout = $timeout;
  }

  createFamily(name) {
    "use strict";

    return new Promise((resolve, reject) => {

      let ref = new Firebase('https://altman.firebaseio.com/families/');

      let familyRef = ref.push({name: name});

      let auth = ref.getAuth();
      let member = {};
      member[auth.uid] = true;

      let userRef = new Firebase('https://altman.firebaseio.com/users/' + auth.uid);
      let family = {};
      family[familyRef.key()] = true;

      let updateMembers = promisify((cont) => {
        this._$log.debug('updating members');
        familyRef.child('members').update(member, cont);
      });
      let updateAdmins = promisify((cont) => {
        this._$log.debug('updating admins');
        familyRef.child('admins').update(member, cont);
      });
      let updateFamilies = promisify((cont) => {
        this._$log.debug('updating families');
        userRef.child('families').update(family, cont);
      });

      updateMembers
        .then(updateAdmins)
        .then(updateFamilies)
        .then(() => {
          this._$log.debug(`family created - returning key ${familyRef.key()}`);
          resolve(familyRef.key());
        })
        .catch(() => reject);

    });

  }

  static _model(snapshot) {
    "use strict";
    let obj = snapshot.val();
    obj.key = snapshot.key();
    return obj;
  }

  getDishes(query) {
    "use strict";

    return new Promise((resolve, reject) => {

      var result = [];
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

    return new Promise((resolve, reject) => {
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

}

function promisify(callback) {
  "use strict";

  return new Promise((resolve, reject) => {

    let cont = (err) => {
      if (err == null) {
        resolve();
      }
      else {
        reject();
      }
    };

    callback(cont);
  });

}

export default FamiliesService;
