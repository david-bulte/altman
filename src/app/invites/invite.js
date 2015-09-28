class Invite {

  constructor() {
  }

  static fromSnapshot(snapshot) {
    let invite = _.merge(new Invite(), snapshot.val());
    invite.key = snapshot.key();
    //todo will be added later on
    invite.from='xxx';
    invite.name='yyy';
    return invite;
  }

  static fromJson(json) {
    return _.merge(new Invite(), json);
  }

}

export default Invite;
