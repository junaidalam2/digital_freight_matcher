
const constants = require('./constants.js');
const geodesic = require("geographiclib-geodesic"); // https://geographiclib.sourceforge.io/html/js/
const DMS = require("geographiclib-dms");
const geod = geodesic.Geodesic.WGS84;
// https://stackoverflow.com/questions/20231258/minimum-distance-between-a-point-and-a-line-in-latitude-longitude?noredirect=1&lq=1

class Route {

    constructor(routeNumber, anchorPoint, milesWithCargo, palletsOccupied, pickUpDropOffCounter, longitude, latitude) {

        this.routeNumber = routeNumber;
        this.anchorPoint = anchorPoint;
        this.anchorLongitude = longitude;
        this.anschorLatitude = latitude;
        this.milesWithCargo = milesWithCargo;
        this.totalMiles = this.milesWithCargo * 2;  // this seems overly simplistic. I believe we'll need to change this calc.
        this.timeInMinutes = this.totalMiles * constants.averageTruckSpeedInMiles * 60;
        this.operationalTruckCost = constants.costPerMile * this.totalMiles;
        this.palletsOccupied = palletsOccupied;
        this.cargoCost = this.totalMiles * constants.palletCostPerMile * this.palletsOccupied;
        this.emptyCargoCost = this.operationalTruckCost - this.cargoCost;
        this.price = this.cargoCost * constants.markup; // based on cargo cost
        this.pickUpDropOffCounter =  pickUpDropOffCounter;
        this.availableVolume = this.palletsOccupied * constants.palletVolume * constants.truckVolume;
        this.availableWeight = constants.maxWeight - this.palletsOccupied * constants.palletWeight;
        this.availableStandardPackages = this.availableVolume / constants.stdPackageVolume
        this.projectPricePerPackage = this.emptyCargoCost / this.availableStandardPackages * ( 1 + constants.markup);
        this.projectedRevenueFullTruck =  this.projectPricePerPackage * this.availableStandardPackages + this.price;
        this.marginalCostPerOrder = null;
        this.marginalDistanceInMiles = null;

    }

    marginalCost(additionalPallets, additionalMilesWithCargo) {
        this.marginalCostPerOrder = additionalPallets * this.totalMiles * constants.palletCostPerMile;
        this.marginalCostPerOrder += constants.costPerMile * additionalMilesWithCargo; 
    }

    resetMarginalCost() {
        this.marginalCostPerOrder = null
    }



    /* DISTANCE CALC BELOW IS INCORRECT. ALSO, NEED TO CALCULATE 'CROSS-TRACK' DISTANCE. WORKING ON IT IN 'DISTANCE.JS'.
    checkDistanceToRoute(point1, point2, limit = 1000) { // distance in meters
        if (geod.Inverse(point1["latitude"], point1["longitude"], point2["latitude"], point2["longitude"]) <= limit) return true 
        return false
    }

    isOnRoute(pickUpHash, dropOffHash) {

        let startingOnRoute = false;
        let endingOnRoute = false;

        if(distanceToRoute({'latitude': pickUpHash["latitude"], 'longitude': this.anschorLatitude}, {'latitude': this.anschorLatitude, 'longitude': this.anchorLongitude}) 
            && distanceToRoute({'latitude': this.anschorLatitude, 'longitude': pickUpHash["longitude"]}, {'latitude': this.anschorLatitude, 'longitude': this.anchorLongitude})) {
                startingOnRoute = true;
        } 
        

        if(distanceToRoute({'latitude': dropOffHash["latitude"], 'longitude': constants.hubLongitude}, {'latitude': constants.hubLatitude, 'longitude': constants.hubLongitude}) 
            && distanceToRoute({'latitude': constants.hubLatitude, 'longitude': dropOffHash["longitude"]}, {'latitude': constants.hubLatitude, 'longitude': constants.hubLongitude})) {
                endingOnRoute = true;
        } 

        return startingOnRoute && endingOnRoute;
    }


    marginalDistanceCalculator() {
         distanceInMeters = geod.Inverse(point1["latitude"], point1["longitude"], point2["latitude"], point2["longitude"]);

         this.marginalDistanceInMiles = distanceInMeters;

    }
    */

}


const route1 = new Route(1, 'Ringgold', 101, 12, 2, 34.9161210050057, -85.1103924702221)
const route2 = new Route(2, 'Augusta', 94.6, 10, 2, 33.4676716195606, -81.8920767938344)
const route3 = new Route(3, 'Savannah', 248, 11, 2, 32.0815296895872, -80.9773396382228)
const route4 = new Route(4, 'Albany', 182, 12, 2, 31.5770410650746, -84.1807668794164)
const route5 = new Route(5, 'Columbus', 107, 9, 2, 32.4661710120819, -85.1587927831466)


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