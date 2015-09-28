class List {

  constructor() {
  }

  //todo consider:
  //  alle originele velden: _veld
  //  alle vertaalde velden: veld
  //  list._original_ = snapshot.val();
  //  saveModel() method
  static fromSnapshot(snapshot) {
    let list = _.merge(new List(), snapshot.val());
    list.key = snapshot.key();
    return list;
  }

  viewModel(user) {
    let createdBy = this._members_.filter(member => member.key === this.createdBy)[0];
    if (createdBy !== undefined) {
      this._createdBy_ = createdBy;
      createdBy._creator_ = true;
    }

    this._active_ = this.key === user.activeFamily;

    return this;
  }

}

export default List;
