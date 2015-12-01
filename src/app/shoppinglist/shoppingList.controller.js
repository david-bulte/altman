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
        this._shoppingListService.updateIngredient(this.user.activeFamily, section.name, ingredient.key, {switched: ingredient.switched}).then((ingredient) => {
            this.toast('updated')
        });
    }

    removeIngredient(section, ingredient) {
        //todo
        //section.ingredients.splice(section.ingredients.indexOf(ingredient), 1);
        //let copy = this._unmodel(angular.copy(this.shoppingList));
        //this._shoppingListService.updateShoppingList(copy).then((shoppingList) => {
        //});
    }

    addIngredient(section, ingredient) {
        //todo
    }

    updateIngredient(section, ingredient) {
        //  let isCreate = ingredient._original_ === undefined;
        //  let copy = this._unmodel(angular.copy(this.shoppingList));
        //  this._shoppingListService.updateShoppingList(copy).then((shoppingList) => {
        //    if (isCreate) {
        //      ingredient._original_ = ingredient;
        //      this._$timeout(() => section.ingredients.push({name: undefined, amount: undefined, section: undefined}));
        //    }
        //  });
        //
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
