class User {

  constructor() {
  }

  static fromSnapshot(snapshot) {
    let user = _.merge(new User(), snapshot.val());
    user.key = snapshot.key();
    return user;
  }


}

export default User;
