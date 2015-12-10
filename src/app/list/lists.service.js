import Dish from '../dishes/dish.js';
import Invite from '../invites/invite.js';
import List from './list.js';

class ListsService {

    constructor(InvitesService, UserService, $log, $timeout) {
        'ngInject';

        this._invitesService = InvitesService;
        this._userService = UserService;
        this._$log = $log;
        this._$timeout = $timeout;
    }

    getListsByUser(user, spec) {
        return _getListKeys(user.key)
            .then((listKeys) => {
                return this.getLists(listKeys, spec);
            })
            .then((lists) => {
                return Promise.all(lists.map((list) => {
                    return _setActive(list, user);
                }));
            });
    }

    getListsByListKey(listKey, spec) {
        return this.getLists([listKey], spec);
    }

    getLists(listKeys, spec) {
        return _getLists(listKeys)
            .then((lists) => {
                return spec.members
                    ? Promise.all(lists.map(_loadMembers.bind(this)))
                    : Promise.resolve(lists);
            })
            .then((lists) => {
                console.log('get invites 1');
                return spec.invites
                    ? Promise.all(lists.map(_loadInvites.bind(this)))
                    : Promise.resolve(lists);
            })
            .then((lists) => {
                return spec.dishes
                    ? Promise.all(lists.map(_loadDishes.bind(this)))
                    : Promise.resolve(lists);
            })
            .catch(err => {
                console.log(err);
                throw err;
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

            let invite = {list: listKey, email: email};

            let invitesRef = new Firebase(`https://altman.firebaseio.com/invites`);
            let inviteRef = invitesRef.push(invite);
            invite.key = inviteRef.key();

            let listInvitesRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/invites`);
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
                let inviteRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/invites/${inviteKey}`);
                inviteRef.remove(() => it.next());
            }

            function* main() {
                yield deleteInvite();
                yield updateList();
                resolve();
            }
        });
    }

    setAdmin(listKey, userKey, admin) {
        return new Promise((resolve, reject) => {
            let adminsRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/admins`);
            let admins = {};
            admins[userKey] = admin;
            adminsRef.update(admins, () => resolve());
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
            userRef.update({activeList: listKey}, () => resolve());
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
                let listRef = new Firebase(`https://altman.firebaseio.com/user/${userKey}/lists/${listKey}`);
                listRef.remove(() => it.next());
            }

            function updateList() {
                self._$log.debug(`updateList ${listKey}`);
                let memberRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/members/${userKey}`);
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
                let listsRef = new Firebase('https://altman.firebaseio.com/lists');
                let listRef = listsRef.push({name: name, createdBy: createdBy});
                setTimeout(() => it.next(listRef.key()), 0);  //calling it.next should be in another 'thread'
            }

            function addAdmin(listKey, userKey) {
                let adminsRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/admins`);
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

    /**
     * Adds dish to List
     * @param listKey
     * @param dishKey
     * @returns {Promise}
     */
    addDish(listKey, dishKey) {
        return addDishKey(listKey, dishKey)
            .then(() => {
                return {listKey: listKey, dishKey : dishKey}
            })
            .then(updateUsedBy)
    }

    /**
     * Removes Dish from List
     * @param listKey
     * @param dishKey
     * @returns {Promise}
     */
    removeDish(listKey, dishKey) {
        let updateDishes = () => {
            new Promise((resolve) => {
                let dishesRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/dishes/${dishKey}`);
                dishesRef.remove(() => resolve());
            });
        };

        let updateDish = () => {
            new Promise((resolve) => {
                let listRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy/${listKey}`);
                listRef.remove(() => resolve());
            });
        };

        return Promise.all([updateDishes(), updateDish()]);
    }

    //todo this could be incorporated by getLists
    /**
     *
     * @param listKey
     * @returns {Promise}
     */
    getDishes(listKey) {
        return new Promise((resolve, reject) => {
            _getDishKeys(listKey)
                .then(_getDishes)
                .then((dishes) => resolve(dishes))
                .catch((err) => reject(err));
        });
    }


    //todo refactor with getLists + make it less synchronous
    //todo also pass parameters with what to load
    getList(listKey) {

        var self = this;

        return new Promise((resolve) => {

            let it;

            let listRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}`);
            listRef.once('value', (snapshot) => {
                let list = snapshot.val();
                list.key = snapshot.key();
                it = main(list);
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

            function* main(list) {

                let members = [];
                if (list.members !== undefined) {
                    for (let key of Object.keys(list.members)) {
                        yield loadUser(key, members);
                    }
                }
                list.members = members;

                let invites = [];
                if (list.invites !== undefined) {
                    for (let key of Object.keys(list.invites)) {
                        yield loadInvite(key, invites);
                    }
                }
                list.invites = invites;
                resolve(list);

            }
        });
    }

    addMember(listKey, userKey) {

        var self = this;

        return new Promise((resolve) => {

            let it = main();
            it.next();

            function updateList() {
                self._$log.debug(`updateList ${listKey}`);
                let membersRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/members`);
                let members = {};
                members[userKey] = true;
                membersRef.update(members, () => it.next());
            }

            function updateUser() {
                self._$log.debug(`updateUser ${userKey}`);
                let listsRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/lists`);
                let lists = {};
                lists[listKey] = true;
                listsRef.update(lists, () => it.next());
            }

            function* main() {
                yield updateList();
                yield updateUser();
                resolve();
            }

        });
    }

    acceptInvite(listKey, userKey, inviteKey) {

        var self = this;

        return new Promise((resolve) => {

            let it = main();
            it.next();

            function addMember() {
                self._$log.debug(`addMember ${userKey}`);
                self.addMember(listKey, userKey).then(() => it.next());
            }

            function deleteInvite() {
                self._$log.debug(`deleteInvite ${inviteKey}`);
                self.deleteInvite(listKey, inviteKey).then(() => it.next());
            }

            function* main() {
                yield addMember();
                yield deleteInvite();
                resolve();
            }
        });

    }

    removeMember(listKey, memberKey) {
        return new Promise((resolve) => {
            let membersRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/members`);
            membersRef.once('value', (snapshot) => {
                let member = snapshot.val();
                delete member[memberKey];
                membersRef.update(member, () => {
                    resolve();
                });
            });
        });
    }

    getMembers(listKey) {

        this._$log.debug(`Getting members for list with key ${listKey}`);

        var self = this;

        return new Promise((resolve) => {

            let it;

            let listRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}`);
            listRef.once('value', (snapshot) => {
                let list = snapshot.val();
                it = main(list);
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

            function* main(list) {
                let result = [];
                let keys = Object.keys(list.members);
                for (let key of keys) {
                    yield addUser(key, result);
                }
                self._$log.debug('Returning result', result);
                resolve(result);
            }

        });
    }

    updateName(listKey, name) {
        return new Promise((resolve) => {
            let listRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}`);
            listRef.update({name: name}, () => resolve());
        });
    }

    updateList(list) {
        return new Promise((resolve) => {
            let listRef = new Firebase(`https://altman.firebaseio.com/lists/${list.key}`);
            listRef.update(list, () => resolve());
        });
    }

}

function _getListKeys(userKey) {
    return new Promise((resolve, reject) => {
        let listsRef = new Firebase(`https://altman.firebaseio.com/users/${userKey}/lists`);
        listsRef.once('value', (snapshot) => {
            if (snapshot.val() != null) {
                resolve(Object.keys(snapshot.val()));
            }
        });
    });
}

function _getLists(listKeys) {
    console.log('listKeys', listKeys);
    return Promise.all(listKeys.map(_getList));
}

function _getList(listKey) {
    return new Promise((resolve, reject) => {
        let listRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}`);
        listRef.once('value', (snapshot) => {
            resolve(List.fromSnapshot(snapshot));
        });
    });
}

function _getDishKeys(listKey) {
    return new Promise((resolve, reject) => {
        let dishesRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/dishes`);
        dishesRef.once('value', (snapshot) => {
            var dishKeys = [];
            var dishes = snapshot.val();
            if (dishes !== null) {
                for (let dishKey of Object.keys(dishes)) {
                    if (dishes[dishKey] === true) {
                        dishKeys.push(dishKey);
                    }
                }
            }
            resolve(dishKeys);
        });
    });
}

function _getDishes(dishKeys) {
    return Promise.all(dishKeys.map(_getDish));
}

function _getDish(dishKey) {
    return new Promise((resolve, reject) => {
        let dishRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}`);
        dishRef.once('value', (snapshot) => {
            resolve(Dish.fromSnapshot(snapshot));
        });
    });
}

function _loadMembers(list) {
    let getUser = (userKey) => {
        return this._userService.getUser(userKey).then(member => {
            let admins = list._firebaseo_.admins || {};
            member.admin = admins[member.key] === true;
            list.members.push(member);
        });
    };

    return list._firebaseo_.members === undefined
        ? Promise.resolve(list)
        : Promise.all(Object.keys(list._firebaseo_.members).map(getUser)).then(() => list);
}

function _loadInvites(list) {
    let getInvite = (inviteKey) => {
        return this._invitesService.getInvite(inviteKey).then(invite => {
            list.invites.push(invite);
        });
    };

    return list._firebaseo_.invites === undefined
        ? Promise.resolve(list)
        : Promise.all(Object.keys(list._firebaseo_.invites).map(getInvite)).then(() => list);
}

function _loadDishes(list) {

    //return new Promise((resolve, reject) => {
    return _getDishKeys(list.key)
        .then(_getDishes)
        .then((dishes) => {
            list.dishes = list.dishes.concat(dishes);
            //resolve(list);
            return list;
        });
    //});

}

function _setActive(list, user) {
    return new Promise((resolve) => {
        list.active = list.key === user.activeList;
        resolve(list);
    });
}

function addDishKey(listKey, dishKey) {
    return new Promise((resolve) => {
        let dishesRef = new Firebase(`https://altman.firebaseio.com/lists/${listKey}/dishes`);
        let dishes = {};
        dishes[dishKey] = true;
        dishesRef.update(dishes, () => resolve());
    });
}

//destructuring shortcut, equavalent to {listKey : listKey, dishKey : dishKey},
// when called {listKey : A, dishKey : B} will be assigned like so:
// let {listKey : key} = {key : A}
//  ==> listKey = A
function updateUsedBy({listKey, dishKey}) {
    return new Promise((resolve) => {
        let usedByRef = new Firebase(`https://altman.firebaseio.com/dishes/${dishKey}/usedBy`);
        let usedBy = {};
        usedBy[listKey] = true;
        usedByRef.update(usedBy, () => resolve());
    });
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