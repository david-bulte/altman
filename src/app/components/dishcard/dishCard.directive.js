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

  constructor () {
    'ngInject';
  }



}
