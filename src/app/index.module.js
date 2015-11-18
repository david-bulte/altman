/* global malarkey:false, toastr:false, moment:false */
import config from './index.config';
import routerConfig from './index.route';
import runBlock from './index.run';

import ConfigController from './config/config.controller.js';
import CreateDishController from './dish/createDish.controller.js';
import DishController from './dish/dish.controller.js';
import DishesController from './dishes/dishes.controller.js';
import ListsController from './list/lists.controller.js';
import LoginController from './login/login.controller.js';
import ShoppingListController from './shoppinglist/shoppingList.controller.js';
import WeekMenuController from './weekmenu/weekMenu.controller.js';
import WelcomeController from './login/welcome.controller.js';

import ConfigService from './config/config.service.js';
import DishesService from './dishes/dishes.service.js';
import InvitesService from './invites/invites.service.js';
import ListsService from './list/lists.service.js';
import NotificationsService from './notifications/notifications.service.js';
import ShoppingListService from './shoppinglist/shoppingList.service.js';
import UserService from './login/user.service.js';
import WeekMenuService from './weekmenu/weekMenu.service.js';

import DishCardDirective from './components/dishcard/dishCard.directive.js';
import ListCardDirective from './components/listcard/listCard.directive.js';
import SectionCardDirective from './components/section/sectionCard.directive.js';
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
  .controller('ListsController', ListsController)
  .controller('LoginController', LoginController)
  .controller('ShoppingListController', ShoppingListController)
  .controller('WeekMenuController', WeekMenuController)
  .controller('WelcomeController', WelcomeController)

  .service('ConfigService', ConfigService)
  .service('DishesService', DishesService)
  .service('InvitesService', InvitesService)
  .service('ListsService', ListsService)
  .service('NotificationsService', NotificationsService)
  .service('ShoppingListService', ShoppingListService)
  .service('UserService', UserService)
  .service('WeekMenuService', WeekMenuService)

  .directive('dishCard', () => new DishCardDirective()) //register directive classes as factories
  .directive('listCard', () => new ListCardDirective())
  .directive('toolbar', () => new ToolbarDirective())
  .directive('sectionCard', () => new SectionCardDirective())
  .directive('sidebar', () => new SidebarDirective());
