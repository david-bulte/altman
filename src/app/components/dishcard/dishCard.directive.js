class DishCardDirective {

  constructor() {
    'ngInject';

    return {
      restrict: 'E',
      templateUrl: 'app/components/dishcard/dishCard.html',
      scope: {
        dish: '=',
        sections: '=',
        updateName: '&',
        removeDish: '&',
        toggleStar: '&',
        removeIngredient: '&',
        addIngredient: '&',
        updateIngredient: '&',
        addToWeekMenu: '&',
        removeFromWeekMenu: '&'
      },
      controller: DishCardController,
      controllerAs: 'ctrl',
      bindToController: true
    };

  }

}

export default DishCardDirective;


class DishCardController {

  constructor ($scope) {
    'ngInject';

    this.selected = {};
    this.removeButtonVisible = false;
  }

  selectIngredient(dish, ingredient) {
    let selected = Object.values(this.selected).filter((selected) => selected === true);
    this.removeButtonVisible = selected.length > 0;
  }

  removeIngredients(dish) {
    for (let ingredient of this.dish.ingredients) {
      if (this.selected[ingredient.name] === true) {
        this.removeIngredient({dish : this.dish, ingredient : ingredient});
      }
    }
  }
}
