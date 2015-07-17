let _counter = new WeakMap();
let _dishes = new WeakMap();

class DishesService {

  constructor() {
    'ngInject';

    _dishes.set(this, new Map());
    _counter.set(this, 0);

    for (var i = 0; i < 10; i++) {
      let dish = this.createDish();
      dish.name = 'test ' + i;
    }
  }

  get dishes() {
    "use strict";
    return _dishes.get(this).values();
  }

  createDish() {
    "use strict";
    let id = _counter.get(this) + 1;
    let dish = new Dish({id: id});
    _dishes.get(this).set(id, dish);
    _counter.set(this, id);
    return dish;
  }

  getDish(id) {
    "use strict";
    let dishes = _dishes.get(this).values();
    for (let dish of dishes) {
      if (dish.id === id) {
        return dish;
      }
    }
  }

  deleteDish(id) {
    "use strict";
    _dishes.get(this).delete(id);
  }

  filterDishes(query = '') {
    var dishes = Array.from(_dishes.get(this).values());
    return dishes.filter((dish) => {
      return query.length === 0 || dish.name.toLowerCase().startsWith(query.toLowerCase());
    });
  }

}

class Dish {

  constructor(spec) {
    "use strict";

    this.id = spec.id;
    this.ingredients = [];
    this.name = spec.name;
    this.notes = spec.notes;
    this.section = undefined;
    this.tags = [];
  }

}

export default DishesService;
