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
        showSwitch: '=',
        toggleStar: '&',
        removeIngredient: '&',
        addIngredient: '&',
        updateIngredient: '&',
        addToWeekMenu: '&',
        removeFromWeekMenu: '&',
        switchIngredient: '&',
        compactMode: '=',
        editMode: '=',
        canEdit: '=',
        canDelete: '=',
        starred: '=',
        used: '='
      },
      controller: DishCardController,
      controllerAs: 'ctrl',
      bindToController: true
    };

  }

}

export default DishCardDirective;


class DishCardController {

  constructor() {
    this.canEdit = this.canEdit !== undefined && this.canEdit;
    //this.editMode = this.editMode !== undefined && this.editMode;
    if (this.canEdit) {
      this.dish.ingredients.push({name: undefined, amount: undefined, section: undefined});
    }
  }

  selectIngredient(ingredient) {
    this.selected = ingredient;
  }

}
