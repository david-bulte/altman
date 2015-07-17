const DEFAULT_TAGS = ['veggie'];
const DEFAULT_SECTIONS = ['groenten en fruit', 'vlees', 'zuivel', 'droge voeding', 'ontbijt', 'diepvries', 'varia'];

let _config = new WeakMap();

class ConfigService {

  constructor() {
    'ngInject';

    //from http://babeljs.io/docs/advanced/caveats/: "Built-in classes such as Date, Array, DOM etc cannot be properly
    // subclassed due to limitations in ES5." -> we can't use Array.from(DEFAULT_TAGS)
    _config.set(this, {
      tags: DEFAULT_TAGS.slice(),
      sections : DEFAULT_SECTIONS.slice()
    });

  }

  get tags() {
    return _config.get(this).tags;
  }

  get sections() {
    return _config.get(this).sections;
  }

}

export default ConfigService;
