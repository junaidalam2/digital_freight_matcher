const {isOnRoute} = require ('./distanceVerification.js');
const constants = require('./constants.js');
const { routes, calculateCrossTrackDistances } = require('./distanceVerification.js');
const { distanceCalculatorKM, crossTrackDistanceCalc } = require ('./distance.js');
const distance = require('./distance.js');
const geodesic = require("geographiclib-geodesic"); // https://geographiclib.sourceforge.io/html/js/
const DMS = require("geographiclib-dms");
const geod = geodesic.Geodesic.WGS84;
// https://stackoverflow.com/questions/20231258/minimum-distance-between-a-point-and-a-line-in-latitude-longitude?noredirect=1&lq=1

// move to another file
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}
// move to another file
function calculateDistanceBetweenPoints(point1, point2) {
    const earthRadiusKm = 6371; // Earth radius in km

    const lat1 = degreesToRadians(point1.latitude);
    const lon1 = degreesToRadians(point1.longitude);
    const lat2 = degreesToRadians(point2.latitude);
    const lon2 = degreesToRadians(point2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon /2 ) * Math.sin(dLon / 2);
    const c = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c; // distance in km
    return distance;
}

function convertOrderFormat(order) {
    // console.log("64Order: ", order);
    // console.log("34: order.pickUp.latitude: ", order['pick-up'].latitude);
    // console.log("35: order.pickUp.longitude: ", order['pick-up'].longitude);
    // console.log("36: order.pickUp.latitude: ", order['drop-off'].latitude);
    // console.log("37: order.pickUp.longitude: ", order['drop-off'].longitude);
    const milesWithCargo = distanceCalculatorKM(order['pick-up'].latitude, order['pick-up'].longitude, order['drop-off'].latitude, order['drop-off'].longitude); // calc miles with cargo
    const palletsOccupied = order.cargo.packages.length; // calc pallets occupied
    const pickUpDropOffCounter = 2; // calc pick up / drop off counter
    // console.log("41: milesWithCargo: ", milesWithCargo);
    // console.log("42: palletsOccupied: ", palletsOccupied);
    // console.log("43: pickUpDropOffCounter: ", pickUpDropOffCounter);
    return {
        milesWithCargo,
        palletsOccupied,
        pickUpDropOffCounter,
    };
}

class Route {

    constructor(routeNumber, anchorPointName, milesWithCargo, palletsOccupied, pickUpDropOffCounter, longitude, latitude) {
        this.routeNumber = routeNumber;
        this.anchorPointName = anchorPointName;
        this.anchorCoord = {'latitude': latitude, 'longitude': longitude }; 
        this.milesWithCargo = milesWithCargo;
        this.totalMiles = this.milesWithCargo * 2;  // this seems overly simplistic. I believe we'll need to change this calc.
        this.timeInMinutes = this.totalMiles * constants.averageTruckSpeedInMiles * 60;
        this.operationalTruckCost = constants.costPerMile * this.totalMiles;
        this.palletsOccupied = palletsOccupied;
        this.cargoCost = this.totalMiles * constants.palletCostPerMile * this.palletsOccupied;
        this.emptyCargoCost = this.operationalTruckCost - this.cargoCost;
        this.price = this.cargoCost * (1 + constants.markup); // based on cargo cost
        this.pickUpDropOffCounter =  pickUpDropOffCounter;
        // starting val for volumne, weight, pallets
        this.availableVolume = constants.truckVolume - this.palletsOccupied * constants.palletVolume;
        this.availableWeight = constants.maxWeight - this.palletsOccupied * constants.palletWeight;
        this.availableStandardPackages = this.availableVolume / constants.stdPackageVolume
        this.projectPricePerPackage = this.emptyCargoCost / this.availableStandardPackages * ( 1 + constants.markup);
        this.projectedRevenueFullTruck =  this.projectPricePerPackage * this.availableStandardPackages + this.price;
        this.marginalCostPerOrder = null;
        this.marginalDistanceInMiles = null;
        this.proposedOrderPickUpCoord = null;
        this.proposedOrderDropOffCoord = null;
        this.proposedPickUpDistanceToRoute = null;
        this.proposedDropOffDistanceToRoute = null;
        this.orderOnRoute = false;
    }
    

    

    updateOrder(order) {
        this.milesWithCargo = order.milesWithCargo;
        this.palletsOccupied = order.palletsOccupied; // check if i need to add to the current pallets Occ
        this.pickUpDropOffCounter = order.pickUpDropOffCounter;
        // Adjust volume and weight for partial pallets
        this.availableVolume = constants.truckVolume - this.palletsOccupied * constants.palletVolume;
        this.availableWeight = constants.maxWeight - this.palletsOccupied * constants.palletWeight;
    }

    checkConstraints() {
        // Need to create constraints for time, volume, weight
        const timeConstraint = this.timeInMinutes <= constants.maxTimeInMinutes;
        const volumeConstraint = this.availableVolume >= 0; // check if Available Volume >= 0
        const weightConstraint = this.availableWeight >= 0; // check if Available Weight >= 0
        return timeConstraint && volumeConstraint && weightConstraint;
    }

    rejectOrder() {
        // Restore vars to previous vals
        // Subtracted out the order vals
        this.milesWithCargo -= order.milesWithCargo;
        this.palletsOccupied -= order.palletsOccupied;
        this.pickUpDropOffCounter -= order.pickUpDropOffCounter;
        this.availableVolume = constants.truckVolume - this.palletsOccupied * constants.palletVolume;
        this.availableWeight = constants.maxWeight - this.palletsOccupied * constants.palletWeight;
    }

    marginalCost(additionalPallets, additionalMilesWithCargo) {
        this.marginalCostPerOrder = additionalPallets * this.totalMiles * constants.palletCostPerMile;
        this.marginalCostPerOrder += constants.costPerMile * additionalMilesWithCargo; 
    }

    resetMarginalCost() {
        this.marginalCostPerOrder = null
    }

    distanceCalculatorKM(point1Hash, point2Hash) {
        const distanceInKM = geod.Inverse(point1Hash['latitude'], point1Hash['longitude'], point2Hash['latitude'], point2Hash['longitude']).s12 / 1000;  // dividing by 1000 to convert to kilometres
        return distanceInKM;
    }
    
    obtainBearing(latitudePoint1, latitudePoint2, longitudePoint1, longitudePoint2) {
        const x = Math.sin(longitudePoint2 - longitudePoint1) * Math.cos(latitudePoint2);
        const y = Math.cos(latitudePoint1) * Math.sin(latitudePoint2) - Math.sin(latitudePoint1) * Math.cos(latitudePoint2) * Math.cos(longitudePoint2 - longitudePoint1);
        const bearingInRadians = Math.atan2(x, y);
        const bearingInDegrees = ( bearingInRadians * 180 / Math.PI + 360) % 360; 
        return bearingInDegrees;
    }
    
    crossTrackDistanceCalc(orderCoordinates, routeStartCoordinates, routeEndCoordinates) {
        const distancePickUpToRouteStart = this.distanceCalculatorKM(routeStartCoordinates, orderCoordinates);
        const bearing1 = this.obtainBearing(routeStartCoordinates['latitude'], routeStartCoordinates['longitude'], orderCoordinates['latitude'], orderCoordinates['longitude']);
        const bearing2 = this.obtainBearing(routeStartCoordinates['latitude'], routeStartCoordinates['longitude'], routeEndCoordinates['latitude'], routeEndCoordinates['longitude']);
        const crossTrackDistance = Math.asin( Math.sin( distancePickUpToRouteStart / 6371) * Math.sin((bearing1 - bearing2) * (Math.PI / 180))) * 6371; // kilometres
        return crossTrackDistance;
    }


    isOnRouteWithTurf(pointLatitude, pointLongitude) {
        console.log("134 isOnRouteWithTurf");
        console.log("147routes: ", routes);
        const routeInfo = calculateCrossTrackDistances(routes, pointLatitude, pointLongitude);
        console.log("148routeInfo: ", routeInfo);
        console.log("149typeof: ", typeof routeInfo);
        if (routeInfo && typeof routeInfo === 'object') {
            const routeKey = routeInfo.routeKey.replace('route_', 'route'); // convert to routeX
            // console.log("138routeKey: ", routeKey);
            // console.log("139onRoute: ", onRoute);
            // console.log("140distance: ", distance);
            return {
                onRoute: true,
                routeKey: routeKey,
                distance: routeInfo.distance
            };
        } else {
            return {
                onRoute: false,
            };
        }

    }
}

const route1 = new Route(1, 'Ringgold', 101, 12, 2, 34.9161210050057, -85.1103924702221);
const route2 = new Route(2, 'Augusta', 94.6, 10, 2, 33.4676716195606, -81.8920767938344);
const route3 = new Route(3, 'Savannah', 248, 11, 2, 32.0815296895872, -80.9773396382228);
const route4 = new Route(4, 'Albany', 182, 12, 2, 31.5770410650746, -84.1807668794164);
const route5 = new Route(5, 'Columbus', 107, 9, 2, 32.4661710120819, -85.1587927831466);


const routeData = {

    1: route1,
    2: route2,
    3: route3,
    4: route4,
    5: route5,

}


module.exports = {

    routeData: routeData,
      
}

/*
//34.9161210050057, -85.1103924702221

route1.proposedOrderPickUpCoord = {'latitude': 34.9161210050057, 'longitude': -85.1103924702221 }; 
route1.proposedOrderDropOffCoord = {'latitude': 84.3875298776525, 'longitude': 33.7544138157922 }; 

route1.isOnRoute()
console.log(route1.orderOnRoute)
*/

// route 1 instance
// const route1 = routeData[1];

const order = {
    cargo: {
        packages: [1, 60, 'standard'] // CBM (vol.), weight (pounds), type
    },
    // I had to put ' ' around the pick-up and drop-off vars
    'pick-up': {
        // "latitude": 33.754413815792205,
        // "longitude": -84.3875298776525
        "latitude": 33.63511814123319,
        "longitude": -84.4316031545102
    },
   'drop-off': {
        "latitude": 34.87433824316913,
        "longitude": -85.08447506395166
    }
};
const order2 = {
    1,"[12, 42, standard]",
    "{lat: 33.78015129657219,lng: -84.34128279641483}",
    "{lat: 33.662866638790945,lng: -84.26739402810634}"
}

const transformedOrder = convertOrderFormat(order);
let routeToUpdate;
// route1.updateOrder(transformedOrder);

// Get coordinates for testing
const pointLatitude = order['pick-up'].latitude;
const pointLongitude = order['pick-up'].longitude;

const routeKeyInfo = calculateCrossTrackDistances(routes, pointLatitude,pointLongitude);
const routeKey = routeKeyInfo.routeKey;
const numOfRoute= routeKeyInfo.numOfRoute;
console.log("223routeKeyInfo: ", routeKeyInfo);
console.log("223routeKey: ", routeKey);
// console.log("224routeData[updatedRouteNum]: ", routeData[updatedRouteNum]);
console.log("237numOfRoute: ", numOfRoute);
// console.log("225route1: ", route1);
routeToUpdate = routeData[numOfRoute];
console.log("242R2Up: ", routeToUpdate);
routeToUpdate.updateOrder(transformedOrder);
console.log("243R2Up: ", routeToUpdate);

// determine if enough weight capacity



// if (updatedRouteKey && routeData[updatedRouteKey]) {
    
    // routeToUpdate = routeNum;
    // console.log("242R2Up: ", routeToUpdate);

    // routeToUpdate.updateOrder(transformedOrder);
    // console.log(`228: Order assigned to route ${routeNum}.`);

// } else {
//     console.log("238No route found for the order.");
// }

// set the proposed order drop-off coordinates
// route1.proposedOrderDropOffCoord = order.dropOff;

// Test if the point is on the route
// if (routeToUpdate.isOnRouteWithTurf(pointLatitude, pointLongitude)) {
//     console.log("246pointLatitude: ", pointLatitude);
//     console.log("246pointLongitude: ", pointLongitude);
//     console.log("246Point is on route.");
//     } else {
//     console.log("248Point is not on the route");
// }




// route1.marginalCost(additionalPallets, additionalMilesWithCargo);
// // Test the conditional acceptatnce of the order
// if (route1.isOnRouteWithTurf && route1.marginalCostPerOrder <= 0) {
//     // update route attributes
//     route1.palletsOccupied += additionalPallets;
//     route1.milesWithCargo += additionalMilesWithCargo;
//     route1.routeNumber.push(deliveryPoint);
//     console.log("Order accepted. Route capacity adjusted.");

// } else {
//     console.log("Order not accepted.");
// }

// Calculate and test distances using disntance functions
// const distancePickUpToRouteStart = distanceCalculatorKM(route1.anchorCoord, order.pickUp);
// const crossTrackDistance = crossTrackDistanceCalc(order.pickUp, route1.anchorCoord, constants.hubCoordinates);
// console.log(`Distance from anchor to pick-up: ${distancePickUpToRouteStart} km`);
// console.log(`Cross-track distance: ${crossTrackDist} km`);


/*
intake order
edit to take in dropoff point
determine route
sufficient time? +30min
sufficient volume? this.volume <= 26.6; total vol (1700 ft^3) - (pallets * vol[64])
sufficient weight: 9180 lbs max; weight = total weight - (pallets * weight[440])
weight of package * 66lbs
determine price
does it fit on current truck, if not reject

clone; done
create a branch
push to branch
branch, save on it


*/