//medicine can only be picked up on the way back
//empty the pallets before coming back
// CHECK if this.palletsOccupied is referenced correctly

function compatibility(shipment1, shipment2) { //take in palletsOccupied too?
    const types = {
        "standard": ["standard", "food"],
        "medicine": ["medicine"],
        "food": ["food", "standard"]
    };

    for (let type in types) {
        if (types.hasOwnProperty(type)) {
          if (type === "medicine" && this.palletsOccupied === 0 || shipment1 === "medicine" && shipment2 === "medicine"){
                return true;
          }
          if (types[type].includes(shipment1) && types[type].includes(shipment2)) {
                return true;
            }
        }
    }
    return false;
}

console.log(compatibility("standard", "medicine")); // false
console.log(compatibility("standard", "food")); // true
console.log(compatibility("medicine", "food")); // false
console.log(compatibility("food", "standard")); // tuee

