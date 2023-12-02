const constants = require('./constants.js');


class Route {

    constructor(routeNumber, anchorPointName, milesWithCargo, palletsOccupied, pickUpDropOffCounter, longitude, latitude, dbTableName) {

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
        this.dbTableName = dbTableName;

    }

    marginalCost(additionalPallets, additionalMilesWithCargo) {
        this.marginalCostPerOrder = additionalPallets * this.totalMiles * constants.palletCostPerMile;
        this.marginalCostPerOrder += constants.costPerMile * additionalMilesWithCargo; 
    }

    resetMarginalCost() {
        this.marginalCostPerOrder = null
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    haversine(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in kilometers
      
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
      
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
        const distance = R * c;
      
        return distance;
    }

    crossTrackDistance(lat, lon, lat1, lon1, lat2, lon2) {
        const d13 = this.haversine(lat, lon, lat1, lon1);
        const theta13 = this.toRadians(this.bearing(lat1, lon1, lat, lon));
        const theta12 = this.toRadians(this.bearing(lat1, lon1, lat2, lon2));
      
        const dxt = Math.asin(Math.sin(d13 / 6371) * Math.sin(theta13 - theta12)) * 6371;
      
        return dxt;
    }


    bearing(lat1, lon1, lat2, lon2) {
        const dLon = this.toRadians(lon2 - lon1);
      
        const y = Math.sin(dLon) * Math.cos(this.toRadians(lat2));
        const x =
          Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
          Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLon);
      
        const brng = Math.atan2(y, x);
      
        // Convert bearing from radians to degrees
        const brngDegrees = (this.toRadians(brng) + 360) % 360;
      
        return brngDegrees;
    }


    isOnRoute() {
        
        this.proposedPickUpDistanceToRoute = this.crossTrackDistance(
            this.proposedOrderPickUpCoord['latitude'],
            this.proposedOrderPickUpCoord['longitude'],
            this.anchorCoord['latitude'],
            this.anchorCoord['longitude'],
            constants.hubCoordinates['latitude'],
            constants.hubCoordinates['longitude'],
          );

        console.log(this.proposedPickUpDistanceToRoute)

        this.proposedDropOffDistanceToRoute = this.crossTrackDistance(
            this.proposedOrderDropOffCoord['latitude'],
            this.proposedOrderDropOffCoord['longitude'],
            this.anchorCoord['latitude'],
            this.anchorCoord['longitude'],
            constants.hubCoordinates['latitude'],
            constants.hubCoordinates['longitude'],
          );

        console.log(this.proposedDropOffDistanceToRoute)

        if(Math.abs(this.proposedPickUpDistanceToRoute) <= 1 && Math.abs(this.proposedDropOffDistanceToRoute) <= 1) {
            this.orderOnRoute = true;
        } else {
            this.orderOnRoute = false;
        }
    }

}


const route1 = new Route(1, 'Ringgold', 101, 12, 2, 34.9161210050057, -85.1103924702221, "route1")
const route2 = new Route(2, 'Augusta', 94.6, 10, 2, 33.4676716195606, -81.8920767938344, "route2")
const route3 = new Route(3, 'Savannah', 248, 11, 2, 32.0815296895872, -80.9773396382228, "route3")
const route4 = new Route(4, 'Albany', 182, 12, 2, 31.5770410650746, -84.1807668794164, "route4")
const route5 = new Route(5, 'Columbus', 107, 9, 2, 32.4661710120819, -85.1587927831466, "route5")


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


//34.9161210050057, -85.1103924702221

//route1.proposedOrderPickUpCoord = {'latitude': 34.9161210050057, 'longitude': -85.1103924702221 }; 
//route1.proposedOrderDropOffCoord = {'latitude': 34.9161210050057, 'longitude': -85.1103924702221 }; 

route1.proposedOrderPickUpCoord = {'latitude': 33.7544138157922, 'longitude': -84.3875298776525 }; 
route1.proposedOrderDropOffCoord = {'latitude': 34.9161210050057, 'longitude': -85.1103924702221 }; 

//console.log(route1.proposedOrderPickUpCoord)
//console.log(route1.proposedOrderDropOffCoord)

//console.log(route1.routeNumber)

route1.isOnRoute()
console.log(route1.orderOnRoute)

