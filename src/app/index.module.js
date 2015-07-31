/* global malarkey:false, toastr:false, moment:false */
import config from './index.config';

import routerConfig from './index.route';

import runBlock from './index.run';
import MainController from './main/main.controller';
import DishController from './dish/dish.controller.js';
import CreateDishController from './dish/createDish.controller.js';
import DishesController from './dishes/dishes.controller.js';
import DishesService from './dishes/dishes.service.js';
import ConfigController from './config/config.controller.js';
import ConfigService from './config/config.service.js';
import WeekMenuController from './weekmenu/weekMenu.controller.js';
import WeekMenuService from './weekmenu/weekMenu.service.js';
import SidebarDirective from './components/sidebar/sidebar.directive.js';
import ToolbarDirective from './components/toolbar/toolbar.directive.js';
import ShoppingListController from './shoppinglist/shoppingList.controller.js';
import ShoppingListService from './shoppinglist/shoppingList.service.js';


angular.module('altman', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngRoute', 'ngMaterial', 'firebase'])
  .constant('malarkey', malarkey)
  .constant('toastr', toastr)
  .constant('moment', moment)
  .config(config)

  .config(routerConfig)

  .run(runBlock)

  .controller('MainController', MainController)
  .controller('ConfigController', ConfigController)
  .controller('DishController', DishController)
  .controller('CreateDishController', CreateDishController)
  .controller('DishesController', DishesController)
  .controller('WeekMenuController', WeekMenuController)
  .controller('ShoppingListController', ShoppingListController)

  .service('ConfigService', ConfigService)
  .service('DishesService', DishesService)
  .service('ShoppingListService', ShoppingListService)
  .service('WeekMenuService', WeekMenuService)

  .directive('toolbar', () => new ToolbarDirective()) //register directive classes as factories
  .directive('sidebar', () => new SidebarDirective())
