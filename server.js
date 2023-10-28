
const constants = require('./constants.js');
const constants = require('./startInputs.js');

/*

-ket inputs to new order:
    -startpoint, end point, volume, weight
    
    things to add later:
    -should add date later when make it multi-day 
    -type

-check constraints:

1. On route
2. Volume (by pallet)
3. Weight
4. time

 things to add later:
 -compatible type of package


-Output:
    -if will accept order
    -price
    -date


-features to add later:
    -mutli-day
    -other routes


*/

route1TimeMin = 4 * 60;


function sufficientTime(routeTime) {

    let numberOfStops = 2

    return routeTime + constants.truckPickDropTimeMin * numberOfStops < constants.truckMinPerDay

    // later - check if drop off at existing stop location. Then, number of stops = 1. 

}

function onRoute() {}

function sufficientVolume() {

// find min capacity on entire route => if capacity return true

// see if capacity on portion of route that will be used
    // compile hash of coordinates and capacity for the day
    // for each key-value pair, check for capacity
    // if no capacity at any point, return false

    // later - query db or key-value pair at min point on route

}

function sufficientWeight() {

// similar logic to sufficient volume

}


function determinePrice() {}

function determineDate() {}





