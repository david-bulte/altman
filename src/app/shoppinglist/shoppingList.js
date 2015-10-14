class ShoppingList {

  constructor() {
    this._firebaseo_;
    this.key;
    this.name;
    this.usedBy = [];
    this.ingredients = [];
  }

  static fromSnapshot(snapshot) {

    if (snapshot.val() === null) {
      return null;
    }

    let shoppingList = new ShoppingList();
    shoppingList._firebaseo_ = snapshot.val();
    shoppingList.key = snapshot.key();
    shoppingList.name = shoppingList._firebaseo_.name;
    shoppingList.sections = shoppingList._firebaseo_.sections;

    var sections = shoppingList._firebaseo_.sections;
    if (sections) {
      for (let section of Object.values(sections)) {
        if (section.ingredients === undefined) {
          section.ingredients = [];
        }
        for (let ingredient of section.ingredients) {
          ingredient._firebaseo_ = ingredient;
        }
      }
    }

    return shoppingList;
  }

  static fromRef(ref) {
    let shoppingList = new ShoppingList();
    shoppingList.key = ref.key();
    return shoppingList;
  }

}

export default ShoppingList;
