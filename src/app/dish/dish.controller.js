class DishController {

  constructor(ConfigService, DishesService, $routeParams) {
    'ngInject';

    this.sections = ConfigService.sections;
    this.tags = ConfigService.tags;

    let id = $routeParams.id;

    if (id !== undefined) {
      this.dish = DishesService.getDish(parseInt(id, 10));
    }
    else {
      //first add to DishesService
      //next just add id to WeekMenuService
      this.dish = DishesService.add();
    }
    this.dish.ingredients.push({name : undefined, fresh : true});
  }

  changed(ingredient) {
    "use strict";
    if (ingredient.fresh === true) {
      delete ingredient.fresh;
      this.dish.ingredients.push({name : undefined, fresh : true});
    }
  }

}

export default DishController;
