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

        this.canEdit = this.canEdit !== undefined && this.canEdit;
        if (this.canEdit) {
            this.section.ingredients.push({name: undefined, amount: undefined});
        }
    }

    selectIngredient(ingredient) {
        this.selected = ingredient;
    }

}
