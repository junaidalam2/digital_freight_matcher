// const {isOnRoute} = require ('./distanceVerification.js');
const constants = require('./constants.js');
const { distanceCalculatorKM, crossTrackDistanceCalc } = require ('./distance.js');
const distance = require('./distance.js');
const geodesic = require("geographiclib-geodesic"); // https://geographiclib.sourceforge.io/html/js/
const DMS = require("geographiclib-dms");
const geod = geodesic.Geodesic.WGS84;
// https://stackoverflow.com/questions/20231258/minimum-distance-between-a-point-and-a-line-in-latitude-longitude?noredirect=1&lq=1


function convertOrderFormat(order) {
    console.log("64Order: ", order);
    console.log("12: order.pickUp.latitude: ", order['pick-up'].latitude);
    console.log("13: order.pickUp.longitude: ", order['pick-up'].longitude);
    console.log("14: order.pickUp.latitude: ", order['drop-off'].latitude);
    console.log("15: order.pickUp.longitude: ", order['drop-off'].longitude);
    const milesWithCargo = distanceCalculatorKM(order['pick-up'].latitude, order['pick-up'].longitude, order['drop-off'].latitude, order['drop-off'].longitude); // calc miles with cargo
    const palletsOccupied = order.cargo.packages.length; // calc pallets occupied
    const pickUpDropOffCounter = 2; // calc pick up / drop off counter
    console.log("16: milesWithCargo: ", milesWithCargo);
    console.log("17: palletsOccupied: ", palletsOccupied);
    console.log("18: pickUpDropOffCounter: ", pickUpDropOffCounter);
    return {
        milesWithCargo,
        palletsOccupied,
        pickUpDropOffCounter,
    };
}


const order = {
    cargo: {
        packages: [1, 60, 'standard'] // CBM (vol.), weight (pounds), type
    },
    // I had to put ' ' around the pick-up and drop-off vars
    'pick-up': {
        "latitude": 33.754413815792205,
        "longitude": -84.3875298776525
    },
   'drop-off': {
        "latitude": 34.87433824316913,
        "longitude": -85.08447506395166
    }
};
const transformedOrder = convertOrderFormat(order);


console.log(convertOrderFormat(order));
console.log("48:transformedOrder: ", transformedOrder);