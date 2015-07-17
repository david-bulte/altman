/* global malarkey:false, toastr:false, moment:false */
import config from './index.config';

import routerConfig from './index.route';

import runBlock from './index.run';
import MainController from './main/main.controller';
import GithubContributorService from '../app/components/githubContributor/githubContributor.service';
import WebDevTecService from '../app/components/webDevTec/webDevTec.service';
import NavbarDirective from '../app/components/navbar/navbar.directive';
import MalarkeyDirective from '../app/components/malarkey/malarkey.directive';
import DishController from './dish/dish.controller.js';
import DishesController from './dishes/dishes.controller.js';
import DishesService from './dishes/dishes.service.js';
import ConfigController from './config/config.controller.js';
import ConfigService from './config/config.service.js';
import WeekMenuController from './weekmenu/weekMenu.controller.js';
import WeekMenuService from './weekmenu/weekMenu.service.js';
import SidebarDirective from './components/sidebar/sidebar.directive.js';
import ToolbarDirective from './components/toolbar/toolbar.directive.js';


angular.module('april', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngRoute', 'ngMaterial'])
  .constant('malarkey', malarkey)
  .constant('toastr', toastr)
  .constant('moment', moment)
  .config(config)

  .config(routerConfig)

  .run(runBlock)

  .service('githubContributor', GithubContributorService)
  .service('webDevTec', WebDevTecService)

  .controller('MainController', MainController)
  .controller('ConfigController', ConfigController)
  .controller('DishController', DishController)
  .controller('DishesController', DishesController)
  .controller('WeekMenuController', WeekMenuController)

  .service('ConfigService', ConfigService)
  .service('DishesService', DishesService)
  .service('WeekMenuService', WeekMenuService)

  .directive('toolbar', () => new ToolbarDirective())
  .directive('sidebar', () => new SidebarDirective())
  .directive('acmeNavbar', () => new NavbarDirective())
  .directive('acmeMalarkey', () => new MalarkeyDirective(malarkey));
