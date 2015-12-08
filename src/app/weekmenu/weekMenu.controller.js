class WeekMenuController {

    constructor(ConfigService, DishesService, UserService, ListsService, $mdDialog, $mdToast, $location, $timeout) {
        'ngInject';

        this._configService = ConfigService;
        this._dishesService = DishesService;
        this._userService = UserService;
        this._listsService = ListsService;
        this._dialog = $mdDialog;
        this._$mdToast = $mdToast;
        this._$location = $location;
        this._$timeout = $timeout;
        this.isOpen = false;

        this._userService.getCurrentUser()
            .then(user => this.user = user)
            .then(this._getSections.bind(this))
            .then(this._getDishes.bind(this));
    }

    _getSections() {
        this._configService.getSections(this.user.activeList).then((sections) => {
            this._$timeout(this.sections = sections);
        });
    }

    _getDishes() {
        if (this.user.activeList) {
            this._listsService.getListsByListKey(this.user.activeList, {dishes: true})
                .then((lists) => {
                    this._$timeout(this.dishes = lists && lists.length > 0 ? lists[0].dishes: []);
                }).catch(err => {
                this.toast(`oops ${err}`);
            });
        }
        else {
            console.log('???????? no activeList!!!');
        }
    }

//todo cf dishes.controller
    isStarred(dish) {
        return this.user.starred && this.user.starred[dish.key] === true;
    }

//todo cf dishes.controller
    toggleStar(dish) {
        let newVal = !this.isStarred(dish);
        this._userService.updateStar(this.user.key, dish.key, newVal).then((newVal) => {
            this._$timeout(() => this.user.starred[dish.key] = newVal);
        });
    }

    isUsed(dish) {
        return this.user.activeList !== undefined && dish.usedBy.indexOf(this.user.activeList) >= 0;
    }

    removeFromWeekMenu(dish) {
        var listKey = this.user.activeList;
        this._listsService.removeDish(listKey, dish.key).then(() => {
            this.dishes.splice(dish, 1);
            this.toast(dish.name + ' removed from week menu')
        });
    }

    updateName(dish) {
        this._dishesService.updateName(dish.key, dish.name).then(() => {
            this.toast(dish.name + ' updated')
        })
    }

    addIngredient(dish, ingredient) {
        this._dishesService.addIngredient(dish.key, {name: ingredient.name}).then(() => {
            this._$timeout(() => {
                ingredient.key = ingredient.name;
                dish.ingredients.push({name: undefined, amount: undefined, section: undefined})
            });
        });
    }

    removeIngredient(dish, ingredient) {
        this._dishesService.removeIngredient(dish.key, ingredient.key).then(() => {
            this._$timeout(() => {
                dish.ingredients.splice(dish.ingredients.indexOf(ingredient), 1);
            });
        })
    }

    updateIngredient(dish, ingredient) {
        if (ingredient.key !== undefined) {
            this._dishesService.updateIngredient(dish.key, ingredient.key, ingredient).then(() => {
                //this was an update no need to add something new
            });
        }
        else {
            this.addIngredient(dish, ingredient);
        }
    }

    createDish() {
        this._dishesService.createDish().then((dish) => {
            this._listsService.addDish(this.user.activeList, dish.key).then(() => {
                this._$timeout(() => {
                    this.dishes.unshift(dish)
                });
            });
        })
    }

    toast(content) {
        "use strict";
        this._$mdToast.show(
            this._$mdToast.simple()
                .content(content)
                .position('bottom left')
                .hideDelay(3000)
        );
    }

}

export default WeekMenuController;
