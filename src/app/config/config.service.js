//todo
//const DEFAULT_TAGS = ['veggie'];
//const DEFAULT_SECTIONS = ['groenten en fruit', 'vlees', 'zuivel', 'droge voeding', 'ontbijt', 'diepvries', 'varia'];

let _config = new WeakMap();

const DEFAULT_SECTIONS = ['groenten & fruit', 'zuivel', 'vlees', 'droge voeding', 'ontbijt', 'diepvries', 'varia'];


class ConfigService {

  constructor($firebaseObject) {
    'ngInject';

    let ref = new Firebase("https://altman.firebaseio.com/configs");
    let config = $firebaseObject(ref.child('david_bulte'));

    _config.set(this, config);
  }

  getConfig() {
    "use strict";
    var self = this;
    return new Promise(function (resolve, reject) {
      _config.get(self).$loaded()
        .then((config) => {
          resolve({
            sections: config.sections ? Array.from(config.sections) : [],
            tags: config.tags ? Array.from(config.tags) : []
          });
        })
        .catch(reject);
    });
  }

  saveSections(sections) {
    "use strict";
    let config = _config.get(this);
    config.sections = sections;
    config.$save();
  }

  saveTags(tags) {
    "use strict";
    let config = _config.get(this);
    config.tags = tags;
    config.$save();
  }

  getSections() {
    return new Promise((resolve) => {
      let sectionsRef = new Firebase(`https://altman.firebaseio.com/configs/david_bulte/sections`);
      sectionsRef.once('value', (snapshot) => {
        var sections = snapshot.val();
        resolve((sections && sections.length > 0) ? sections : DEFAULT_SECTIONS);
      });
    });
  }

}

export default ConfigService;
