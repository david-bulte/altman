class ShoppingListController {

    constructor(ConfigService, ShoppingListService, UserService, $mdToast, $timeout) {
        'ngInject';

        this._shoppingListService = ShoppingListService;
        this._userService = UserService;
        this._$mdToast = $mdToast;
        this._$timeout = $timeout;
        this.editMode = false;

        this._userService.getCurrentUser()
            .then(user => this.user = user)
            .then(this._getShoppingList.bind(this));
    }

    _getShoppingList() {
        this._shoppingListService.getShoppingList(this.user.activeFamily).then((shoppingList) => {
            this._$timeout(() => {
                this.shoppingList = shoppingList;
                this.sections = Object.values(shoppingList.sections);
            });
        });
    }

    switchIngredient(section, ingredient) {
        ingredient.switched = true;
        this._shoppingListService.updateShoppingList(this.shoppingList).then(() => this.toast('updated'));
    }

    removeIngredient(section, ingredient) {
        section.ingredients.splice(section.ingredients.indexOf(ingredient), 1);
        this._shoppingListService.updateShoppingList(this.shoppingList).then(shoppingList => this.toast('deleted'));
    }

    addIngredient(section, ingredient) {
        this._shoppingListService.updateShoppingList(this.shoppingList).then(() => {
            this._$timeout(() => {
                ingredient.key = ingredient.name;
                section.ingredients.push({name: undefined, amount: undefined, section: undefined})
            });
            this.toast('added')
        });
    }

    updateIngredient(dish, ingredient) {
        this._shoppingListService.updateShoppingList(this.shoppingList).then(() => this.toast('updated'));
    }

    updateIngredient(dish, ingredient) {
        if (ingredient.key !== undefined) {
            this._shoppingListService.updateShoppingList(this.shoppingList).then(() => this.toast('updated'));
        }
        else {
            this.addIngredient(dish, ingredient);
        }
    }

    toast(content) {
        this._$mdToast.show(
            this._$mdToast.simple()
                .content(content)
                .position('bottom left')
                .hideDelay(3000)
        );
    }

}

export default ShoppingListController;
