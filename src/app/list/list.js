class List {

  constructor() {
    this._firebaseo_ = undefined;
    this.key = undefined;
    this.name = undefined;
    this.admin = undefined;
    this.author = undefined;
    this.active = undefined;
    this.invites = [];
    this.members = [];
    this.sections = [];
    this.dishes = [];
  }

  static fromSnapshot(snapshot) {
    let list = new List();
    list._firebaseo_ = snapshot.val();
    list.key = snapshot.key();
    list.name = list._firebaseo_.name;
    return list;
  }

}

export default List;
