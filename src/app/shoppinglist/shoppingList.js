class ShoppingList {

  constructor() {
    this._firebaseo_;
    this.key;
    this.name;
    this.usedBy = [];
    //this.ingredients = [];
  }

  static fromSnapshot(snapshot) {

    if (snapshot.val() === null) {
      return null;
    }

    let shoppingList = new ShoppingList();
    shoppingList._firebaseo_ = snapshot.val();
    shoppingList.key = snapshot.key();
    shoppingList.name = shoppingList._firebaseo_.name;
    //shoppingList.sections = shoppingList._firebaseo_.sections;
    shoppingList.sections = {};

    var sections = shoppingList._firebaseo_.sections;
    if (sections) {
      for (let section of Object.values(sections)) {
        let copy = shoppingList.sections[section.name];
        if (copy === undefined) {
          copy = {name: section.name, ingredients: []};
          shoppingList.sections[section.name] = copy;
        }
        //if (section.ingredients === undefined) {
        //  section.ingredients = [];
        //}
        if (section.ingredients) {
          //todo index, key ingredient???
          for (let ingredient of section.ingredients) {
            copy.ingredients.push({
              amount: ingredient.amount,
              dish: ingredient.dish,
              key: ingredient.key,
              name: ingredient.name,
              switched: ingredient.switched,
              section: ingredient.section,
              _firebaseo_: ingredient
            });
          }
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
