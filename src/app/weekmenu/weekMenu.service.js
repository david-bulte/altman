let _dishIds = new WeakMap();

class WeekMenuService {

  constructor() {
    'ngInject';

    _dishIds.set(this, new Set());
  }

  get dishIds() {
    "use strict";
    return _dishIds.get(this).values();
  }

  addDishId(dishId) {
    "use strict";
    if (dishId !== undefined) {
      _dishIds.get(this).add(dishId);
    }
  }

  removeDishId(dishId) {
    "use strict";
     _dishIds.get(this).delete(dishId);
  }

}

export default WeekMenuService;
