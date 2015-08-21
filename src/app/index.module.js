/* global malarkey:false, toastr:false, moment:false */
import config from './index.config';
import routerConfig from './index.route';
import runBlock from './index.run';

import ConfigController from './config/config.controller.js';
import CreateDishController from './dish/createDish.controller.js';
import DishController from './dish/dish.controller.js';
import DishesController from './dishes/dishes.controller.js';
import FamiliesController from './family/families.controller.js';
import LoginController from './login/login.controller.js';
import ShoppingListController from './shoppinglist/shoppingList.controller.js';
import WeekMenuController from './weekmenu/weekMenu.controller.js';
import WelcomeController from './login/welcome.controller.js';

import ConfigService from './config/config.service.js';
import DishesService from './dishes/dishes.service.js';
import FamiliesService from './family/families.service.js';
import ShoppingListService from './shoppinglist/shoppingList.service.js';
import UserService from './login/user.service.js';
import WeekMenuService from './weekmenu/weekMenu.service.js';

import SidebarDirective from './components/sidebar/sidebar.directive.js';
import ToolbarDirective from './components/toolbar/toolbar.directive.js';


angular.module('altman', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngRoute', 'ngMaterial', 'firebase'])
  .constant('malarkey', malarkey)
  .constant('toastr', toastr)
  .constant('moment', moment)
  .config(config)

  .config(routerConfig)

  .run(runBlock)

  .controller('ConfigController', ConfigController)
  .controller('CreateDishController', CreateDishController)
  .controller('DishController', DishController)
  .controller('DishesController', DishesController)
  .controller('FamiliesController', FamiliesController)
  .controller('LoginController', LoginController)
  .controller('ShoppingListController', ShoppingListController)
  .controller('WeekMenuController', WeekMenuController)
  .controller('WelcomeController', WelcomeController)

  .service('ConfigService', ConfigService)
  .service('DishesService', DishesService)
  .service('FamiliesService', FamiliesService)
  .service('ShoppingListService', ShoppingListService)
  .service('UserService', UserService)
  .service('WeekMenuService', WeekMenuService)

  .directive('toolbar', () => new ToolbarDirective()) //register directive classes as factories
  .directive('sidebar', () => new SidebarDirective());
