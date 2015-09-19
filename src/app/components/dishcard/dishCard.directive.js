//import * as _ from '../../vendor/lodash/dist/lodash.min.js';

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
        hideCompact: '=',
        hideStar: '=',
        hideSections: '=',
        hideAddRemoveWeekMenu: '=',
        toggleStar: '&',
        removeIngredient: '&',
        addIngredient: '&',
        updateIngredient: '&',
        addToWeekMenu: '&',
        removeFromWeekMenu: '&',
        compactMode: '=',
        editMode: '=',
        canEdit: '=',
        canDelete: '='
      },
      controller: DishCardController,
      controllerAs: 'ctrl',
      bindToController: true
    };

  }

}

export default DishCardDirective;


class DishCardController {

  constructor($scope) {
    'ngInject';

    this.selected = {};
    this.canEdit = this.canEdit !== undefined && this.canEdit;
    this.editMode = this.editMode !== undefined && this.editMode;
    this.canRemoveIngredient = false;
  }

  selectIngredient(dish, ingredient) {
    let selected = Object.values(this.selected).filter((selected) => selected === true);
    this.canRemoveIngredient = selected.length > 0;
  }

  removeIngredients(dish) {
    for (let ingredient of this.dish.ingredients) {
      if (this.selected[ingredient.name] === true) {
        this.removeIngredient({dish: this.dish, ingredient: ingredient});
      }
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.dish.ingredients.push({name: undefined, amount: undefined, section: undefined});
    }
    else {
      _.remove(this.dish.ingredients, function(ingredient) {
        return ingredient._original_ === undefined;
      });
    }
  }

}
