class ConfigController {

  constructor(ConfigService, $scope, $timeout) {
    'ngInject';

    this.sections = [];
    this.tags = [];

    ConfigService.getConfig().then((config) => {
      "use strict";
      $timeout(() => {
        this.sections = config.sections;
        this.tags = config.tags;
      });
    });

    $scope.$watchCollection('config.sections', (newVal, oldVal) => {
      "use strict";
      if (newVal && newVal !== oldVal) {
        ConfigService.saveSections(newVal);
      }
    });

    $scope.$watchCollection('config.tags', (newVal, oldVal) => {
      "use strict";
      if (newVal && newVal !== oldVal) {
        ConfigService.saveTags(newVal);
      }
    });
  }

  addTag(tag) {
    "use strict";
    this.tags.$add(tag);
  }
}

export default ConfigController;
