class ConfigController {

  constructor(ConfigService) {
    'ngInject';

    this.sections = ConfigService.sections;
    this.tags = ConfigService.tags;

  }

}

export default ConfigController;
