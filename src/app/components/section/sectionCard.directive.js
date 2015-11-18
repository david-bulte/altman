//import * as _ from '../../vendor/lodash/dist/lodash.min.js';
class SectionCardDirective {

  constructor() {
    'ngInject';

    return {
      restrict: 'E',
      templateUrl: 'app/components/section/sectionCard.html',
      scope: {
        section: '=',
        removeIngredient: '&',
        addIngredient: '&',
        updateIngredient: '&',
        switchIngredient: '&',
        editMode: '='
      },
      controller: SectionCardController,
      controllerAs: 'ctrl',
      bindToController: true
    };
  }

}

export default SectionCardDirective;


class SectionCardController {

  constructor($scope) {
    'ngInject';

    this.selected = {};
    this.editMode = false;
    this.canRemoveIngredient = false;
  }

  selectIngredient(section, ingredient) {
    let selected = Object.values(this.selected).filter((selected) => selected === true);
    this.canRemoveIngredient = selected.length > 0;
  }

  removeIngredients(section) {
    for (let ingredient of this.section.ingredients) {
      if (this.selected[ingredient.name] === true) {
        this.removeIngredient({section: this.section, ingredient: ingredient});
      }
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.section.ingredients.push({name: undefined, amount: undefined});
    }
    else {
      _.remove(this.section.ingredients, function(ingredient) {
        return ingredient.key === undefined;
      });
    }
  }

}
