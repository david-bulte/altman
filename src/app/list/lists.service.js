import List from './list.js';
import Invite from '../invites/invite.js';

class ListsService {

  constructor(InvitesService, UserService, $log, $timeout) {
    'ngInject';

    this._invitesService = InvitesService;
    this._userService = UserService;
    this._$log = $log;
    this._$timeout = $timeout;
  }

  /**
   * todo pass specification with what to eagerly fetch
   * @param userKey
   * @returns {Promise}
   */
  getLists(userKey) {

    let getListKeys = (userKey) => {
      return new Promise((resolve, reject) => {
        let listsRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/families`);
        listsRef.once('value', (snapshot) => {
          if (snapshot != null) {
            resolve(Object.keys(snapshot.val()));
          }
        });
      });
    };

    let getList = (listKey) => {
      return new Promise((resolve, reject) => {
        let listRef = new Firebase(`https://altman.firebaseio.com/families/${listKey}`);
        listRef.once('value', (snapshot) => {
          var list = List.fromSnapshot(snapshot);
          this._$log.info('list: ', list);
          resolve(list);
        });
      });
    };

    let loadMembers = (list) => {

      list._members_ = [];

      let getUser = (userKey) => {
        return new Promise((resolve, reject) => {
          this._userService.getUser(userKey).then(user => {
            list._members_.push(user);
            resolve();
          });
        });
      };

      return new Promise((resolve, reject)=> {
        if (list.members === undefined) {
          resolve(list)
        }
        else {
          Promise.all(Object.keys(list.members).map(getUser))
            .then(() => resolve(list))
        }
      });
    };

    let loadInvites = (list) => {

      list._invites_ = [];

      let getInvite = (inviteKey) => {
        return new Promise((resolve, reject) => {
          this._invitesService.getInvite(inviteKey).then(invite => {
            list._invites_.push(invite);
            resolve();
          });
        });
      };

      return new Promise((resolve, reject)=> {
        if (list.invites === undefined) {
          resolve(list)
        }
        else {
          Promise.all(Object.keys(list.invites).map(getInvite))
            .then(resolve(list))
        }
      });
    };

    return new Promise((resolve, reject) => {
      getListKeys(userKey)
        .then((listKeys) => {
          return Promise.all(listKeys.map(getList));
        })
        .then((lists) => {
          return Promise.all(lists.map(loadMembers));
        })
        .then((lists) => {
          return Promise.all(lists.map(loadInvites));
        })
        //todo Lists.map((list) => List.fromJson())
        .then((lists) => resolve(lists))
        .catch((err) => reject(err));
    });

  }

  /**
   *
   * @param listKey
   * @param email
   * @returns {Promise}
   */
  addInvite(listKey, email) {
    return new Promise((resolve, reject) => {

      let invite = {family: listKey, email: email};

      let invitesRef = new Firebase(`https://altman.firebaseio.com/invites`);
      let inviteRef = invitesRef.push(invite);
      invite.key = inviteRef.key();

      let listInvitesRef = new Firebase(`https://altman.firebaseio.com/families/${listKey}/invites`);
      let invites = {};
      invites[inviteRef.key()] = true;
      listInvitesRef.update(invites, (err) => {
        if (!err) {
          resolve(Invite.fromJson(invite));
        }
        else {
          reject();
        }
      });
    });
  }

  /**
   *
   * @param listKey
   * @param inviteKey
   * @returns {Promise}
   */
  deleteInvite(listKey, inviteKey) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function deleteInvite() {
        self._$log.debug(`deleteInvite ${inviteKey}`);
        let inviteRef = new Firebase(`https://altman.firebaseio.com/invites/${inviteKey}`);
        inviteRef.remove(() => it.next());
      }

      function updateList() {
        self._$log.debug(`updateList ${listKey}`);
        let inviteRef = new Firebase(`https://altman.firebaseio.com/families/${listKey}/invites/${inviteKey}`);
        inviteRef.remove(() => it.next());
      }

      function* main() {
        yield deleteInvite();
        yield updateList();
        resolve();
      }
    });
  }

  /**
   *
   * @param listKey
   * @returns {Promise}
   */
  setActive(listKey) {
    return new Promise((resolve) => {
      let ref = new Firebase('https://altman.firebaseio.com');
      let authData = ref.getAuth();

      let userRef = new Firebase(`https://altman.firebaseio.com/users/${authData.uid}`);
      userRef.update({activeFamily: listKey}, () => resolve());
    });
  }

  /**
   *
   * @param listKey
   * @param userKey
   * @returns {Promise}
   */
  deleteMember(listKey, userKey) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function updateUser() {
        self._$log.debug(`updateUser ${userKey}`);
        let familyRef = new Firebase(`https://altman.firebaseio.com/user/${userKey}/families/${listKey}`);
        familyRef.remove(() => it.next());
      }

      function updateList() {
        self._$log.debug(`updateList ${listKey}`);
        let memberRef = new Firebase(`https://altman.firebaseio.com/families/${listKey}/members/${userKey}`);
        memberRef.remove(() => it.next());
      }

      function* main() {
        yield updateUser();
        yield updateList();
        resolve();
      }
    });
  }

  /**
   * todo return created List
   * @param name
   * @returns {Promise}
   */
  createList(name) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function createList(name = '_default_', createdBy = '') {
        let listsRef = new Firebase('https://altman.firebaseio.com/families');
        let listRef = listsRef.push({name: name, createdBy: createdBy});
        setTimeout(() => it.next(listRef.key()), 0);  //calling it.next should be in another 'thread'
      }

      function addAdmin(listKey, userKey) {
        let adminsRef = new Firebase(`https://altman.firebaseio.com/families/${listKey}/admins`);
        let admins = {};
        admins[userKey] = true;
        adminsRef.update(admins, () => it.next());
      }

      function addMember(listKey, userKey) {
        self.addMember(listKey, userKey).then(() => it.next());
      }

      function* main() { //we pass in a param on the first yield
        let ref = new Firebase('https://altman.firebaseio.com');
        var userKey = ref.getAuth().uid;

        let listKey = yield createList(name, userKey);
        yield addAdmin(listKey, userKey);
        yield addMember(listKey, userKey);

        resolve(listKey);
      }
    });
  }


  getDishes(familyKey) {

    let getDishes = () => {
      return new Promise((resolve) => {
        let dishesRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/dishes`);
        dishesRef.on('value', (snapshot) => {
          var dishes = snapshot.val();
          resolve(Object.values(dishes));
        });
      });
    };

    let loadDish = (appliedDish) => {
      return new Promise((resolve) => {
        let dishesRef = new Firebase(`https://altman.firebaseio.com/dishes/${appliedDish.dish}`);
        dishesRef.once('value', (snapshot) => {
          var dish = snapshot.val();
          dish.key = snapshot.key();
          appliedDish._dish_ = dish;
          resolve();
        });
      });
    };

    let loadDishes = (appliedDishes) => {
      let promises = [];
      for (let appliedDish of appliedDishes) {
        promises.push(new Promise((resolve) => {
          loadDish(appliedDish).then(() => resolve());
        }));
      }

      return new Promise((resolve) => {
        Promise.all(promises).then(() => resolve(appliedDishes));
      });
    };

    return getDishes()
      .then(loadDishes);
  }

  //todo refactor with getFamilies + make it less synchronous
  //todo also pass parameters with what to load
  getFamily(familyKey) {

    var self = this;

    return new Promise((resolve) => {

      let it;

      let familyRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}`);
      familyRef.once('value', (snapshot) => {
        let family = snapshot.val();
        family.key = snapshot.key();
        it = main(family);
        it.next();
      });

      let loadUser = (userKey, users) => {
        self._$log.debug(`Loading user ${userKey}`);
        let userRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}`);
        userRef.once('value', (snapshot) => {
          let user = snapshot.val();
          user.key = userKey;
          users.push(user);
          it.next();
        });
      };

      let loadInvite = (inviteKey, invites) => {
        self._$log.debug(`Loading invite ${inviteKey}`);
        let inviteRef = new Firebase(`https://altman.firebaseio.com/invites/${inviteKey}`);
        inviteRef.once('value', (snapshot) => {
          let invite = snapshot.val();
          invite.key = inviteKey;
          invites.push(invite);
          it.next();
        });
      };

      function* main(family) {

        let members = [];
        if (family.members !== undefined) {
          for (let key of Object.keys(family.members)) {
            yield loadUser(key, members);
          }
        }
        family.members = members;

        let invites = [];
        if (family.invites !== undefined) {
          for (let key of Object.keys(family.invites)) {
            yield loadInvite(key, invites);
          }
        }
        family.invites = invites;
        resolve(family);

      }
    });
  }

  addMember(familyKey, userKey) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function updateFamily() {
        self._$log.debug(`updateFamily ${familyKey}`);
        let membersRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/members`);
        let members = {};
        members[userKey] = true;
        membersRef.update(members, () => it.next());
      }

      function updateUser() {
        self._$log.debug(`updateUser ${userKey}`);
        let familiesRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/families`);
        let families = {};
        families[familyKey] = true;
        familiesRef.update(families, () => it.next());
      }

      function* main() {
        yield updateFamily();
        yield updateUser();
        resolve();
      }

    });
  }

  acceptInvite(familyKey, userKey, inviteKey) {

    var self = this;

    return new Promise((resolve) => {

      let it = main();
      it.next();

      function addMember() {
        self._$log.debug(`addMember ${userKey}`);
        self.addMember(familyKey, userKey).then(() => it.next());
      }

      function deleteInvite() {
        self._$log.debug(`deleteInvite ${inviteKey}`);
        self.deleteInvite(familyKey, inviteKey).then(() => it.next());
      }

      function* main() {
        yield addMember();
        yield deleteInvite();
        resolve();
      }
    });

  }

  addDish(familyKey, dishKey) {
    let updateDishes = () => {
      return new Promise((resolve) => {
        let dishesRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/dishes`);
        dishesRef.push({dish: dishKey, comment: '_default_'}, () => resolve());
      });
    };

    let updateDish = () => {
      return new Promise((resolve) => {
        let usedByRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy`);
        let usedBy = {};
        usedBy[familyKey] = true;
        usedByRef.update(usedBy, () => resolve());
      });
    };

    return Promise.all([updateDishes(), updateDish()]);
  }

  removeDish(familyKey, dishKey) {
    let updateDishes = () => {
      new Promise((resolve) => {
        let dishesRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/dishes/${dishKey}`);
        dishesRef.remove(() => resolve());
      });
    };

    let updateDish = () => {
      new Promise((resolve) => {
        let familyRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy/${familyKey}`);
        familyRef.remove(() => resolve());
      });
    };

    return Promise.all([updateDishes(), updateDish()]);
  }

  //todo pass specification with what to fetch

  ////todo pass specification with what to fetch
  //getLists(userKey) {
  //  "use strict";
  //
  //  var self = this;
  //
  //  return new Promise((resolve) => {
  //
  //    let it;
  //
  //    let familiesRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/families`);
  //    familiesRef.once('value', (snapshot) => {
  //      let keys = Object.keys(snapshot.val());
  //      it = loadFamilies(keys);
  //      it.next();
  //    });
  //
  //    let loadFamily = (familyKey, families) => {
  //      this._$log.debug(`Loading family ${familyKey}`);
  //      let familyRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}`);
  //      familyRef.once('value', (snapshot) => {
  //        var family = snapshot.val();
  //        family.key = familyKey;
  //        families.push(family);
  //        it.next();
  //      });
  //    };
  //
  //    let loadUser = (userKey, users) => {
  //      self._$log.debug(`Loading user ${userKey}`);
  //      let userRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}`);
  //      userRef.once('value', (snapshot) => {
  //        let user = snapshot.val();
  //        user.key = userKey;
  //        users.push(user);
  //        it.next();
  //      });
  //    };
  //
  //    let loadInvite = (inviteKey, invites) => {
  //      self._$log.debug(`Loading invite ${inviteKey}`);
  //      let inviteRef = new Firebase(`https://altman.firebaseio.com/invites/${inviteKey}`);
  //      inviteRef.once('value', (snapshot) => {
  //        let invite = snapshot.val();
  //        invite.key = inviteKey;
  //        invites.push(invite);
  //        it.next();
  //      });
  //    };
  //
  //    function* loadFamilies(keys) {
  //      let families = [];
  //
  //      //first load families
  //      for (let key of keys) {
  //        yield loadFamily(key, families);
  //      }
  //
  //      //now load members of each family
  //      for (let family of families) {
  //        let members = [];
  //        if (family.members !== undefined) {
  //          for (let key of Object.keys(family.members)) {
  //            yield loadUser(key, members);
  //          }
  //        }
  //        family.members = members;
  //      }
  //
  //      //now load invites of each family
  //      for (let family of families) {
  //        let invites = [];
  //        if (family.invites !== undefined) {
  //          for (let key of Object.keys(family.invites)) {
  //            yield loadInvite(key, invites);
  //          }
  //        }
  //        family.invites = invites;
  //      }
  //
  //      resolve(families);
  //    }
  //
  //  });
  //
  //}

  removeMember(familyKey, memberKey) {
    return new Promise((resolve) => {
      let membersRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}/members`);
      membersRef.once('value', (snapshot) => {
        let member = snapshot.val();
        delete member[memberKey];
        membersRef.update(member, () => {
          resolve();
        });
      });
    });
  }

  getMembers(familyKey) {

    this._$log.debug(`Getting members for family with key ${familyKey}`);

    var self = this;

    return new Promise((resolve) => {

      let it;

      let familyRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}`);
      familyRef.once('value', (snapshot) => {
        let family = snapshot.val();
        it = main(family);
        it.next();
      });

      function addUser(userKey, result) {
        self._$log.debug(`Adding user with key ${userKey}`);
        let userRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}`);
        userRef.once('value', (snapshot) => {
          let user = snapshot.val();
          user.key = userKey;
          self._$log.debug(`Found user with key ${userKey}`, user);
          result.push(user);
          it.next();
        });
      }

      function* main(family) {
        let result = [];
        let keys = Object.keys(family.members);
        for (let key of keys) {
          yield addUser(key, result);
        }
        self._$log.debug('Returning result', result);
        resolve(result);
      }

    });
  }

  updateName(familyKey, name) {
    return new Promise((resolve) => {
      let familyRef = new Firebase(`https://altman.firebaseio.com/families/${familyKey}`);
      familyRef.update({name: name}, () => resolve());
    });
  }

}

function promisify(callback) {
  "use strict";

  return new Promise((resolve, reject) => {

    let cont = (err) => {
      if (err === null) {
        resolve();
      }
      else {
        reject();
      }
    };

    callback(cont);
  });

}

export default ListsService;





















////deprecated
//createFamily(name) {
//  "use strict";
//
//  return new Promise((resolve, reject) => {
//
//    let ref = new Firebase('https://altman.firebaseio.com/families/');
//    let auth = ref.getAuth();
//
//    let familyRef = ref.push({name: name, createdBy: auth.uid});
//
//    let member = {};
//    member[auth.uid] = true;
//
//    let userRef = new Firebase('https://altman.firebaseio.com/users/' + auth.uid);
//    let family = {};
//    family[familyRef.key()] = true;
//
//    let updateMembers = promisify((cont) => {
//      this._$log.debug('updating members');
//      familyRef.child('members').update(member, cont);
//    });
//    let updateAdmins = promisify((cont) => {
//      this._$log.debug('updating admins');
//      familyRef.child('admins').update(member, cont);
//    });
//    let updateFamilies = promisify((cont) => {
//      this._$log.debug('updating families');
//      userRef.child('families').update(family, cont);
//    });
//
//    updateMembers
//      .then(updateAdmins)
//      .then(updateFamilies)
//      .then(() => {
//        this._$log.debug(`family created - returning key ${familyRef.key()}`);
//        resolve(familyRef.key());
//      })
//      .catch(() => reject);
//
//  });
//
//}
