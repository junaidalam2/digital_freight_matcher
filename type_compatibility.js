//palletsOccupied - check for pallets on the truck at the current moment
//ordersOnTruck - db table [array of[arrays]] of all orders on the truck

function compatibility(orders, palletsOccupied, ordersOnTruck) {
    let orderType = orders[0][2]
    const types = {
        "standard": ["standard", "food"],
        "medicine": ["medicine"],
        "food": ["food", "standard"]
    };
    for (let i = 0; ordersOnTruck.length > i; i++):{
        for (let type in types) {
            if (types.hasOwnProperty(type)) {
                if (orderType === "medicine" && palletsOccupied === 0 || orderType === "medicine" && ordersOnTruck[i][2] === "medicine") {
                    return true; // medicine can only be picked up on the way back
                }
                if (types[type].includes(orderType) && types[type].includes(ordersOnTruck[i][2])) {
                    return true; 
                }
            }
        }
        return false; 
    }
    
}
console.log(compatibility("standard", this.palletsOccupied, ordersOnTruck)); // true
console.log(compatibility("food", this.palletsOccupied, ordersOnTruck)); // false
console.log(compatibility("food", this.palletsOccupied, ordersOnTruck)); // true
console.log(compatibility("medicine", this.palletsOccupied, ordersOnTruck)); // false

