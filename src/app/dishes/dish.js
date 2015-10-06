class Dish {

  constructor() {
    this._firebaseo_;
    this.key;
    this.name;
    this.usedBy = [];
    this.ingredients = [];
  }

  static fromSnapshot(snapshot) {
    let dish = new Dish();
    dish._firebaseo_ = snapshot.val();
    dish.key = snapshot.key();
    dish.name = dish._firebaseo_.name;

    var usedBy = dish._firebaseo_.usedBy;
    if (usedBy) {
      for (let listKey of Object.keys(usedBy)) {
        if (usedBy[listKey] === true) {
          dish.usedBy.push(listKey);
        }
      }
    }

    var ingredients = dish._firebaseo_.ingredients;
    if (ingredients) {
      for (let ingredientKey of Object.keys(ingredients)) {
        let ingredient = ingredients[ingredientKey];
        ingredient.key = ingredientKey;
        dish.ingredients.push(ingredient);
      }
    }
    return dish;
  }

  static fromRef(ref) {
    let dish = new Dish();
    dish.key = ref.key();
    return dish;
  }

}

export default Dish;
