
const constants = require('./constants.js');
const distance = require('./distance.js');
const geodesic = require("geographiclib-geodesic"); // https://geographiclib.sourceforge.io/html/js/
const DMS = require("geographiclib-dms");
const geod = geodesic.Geodesic.WGS84;
// https://stackoverflow.com/questions/20231258/minimum-distance-between-a-point-and-a-line-in-latitude-longitude?noredirect=1&lq=1

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
    
        const x = Math.sin(longitudePoint2 - longitudePoint1) * Math.cos(latitudePoint2)
        const y = Math.cos(latitudePoint1) * Math.sin(latitudePoint2) - Math.sin(latitudePoint1) * Math.cos(latitudePoint2) * Math.cos(longitudePoint2 - longitudePoint1)
    
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


    isOnRoute() {

        this.proposedPickUpDistanceToRoute = this.crossTrackDistanceCalc(this.proposedOrderPickUpCoord, this.anchorCoord, constants.hubCoordinates)
        this.proposedDropOffDistanceToRoute = this.crossTrackDistanceCalc(this.proposedOrderDropOffCoord, this.anchorCoord, constants.hubCoordinates)

        if(this.proposedPickUpDistanceToRoute <= 1 && this.proposedDropOffDistanceToRoute <= 1) {
            this.orderOnRoute = true;
        } else {
            this.orderOnRoute = false;
        }
    }

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

/*
//34.9161210050057, -85.1103924702221

route1.proposedOrderPickUpCoord = {'latitude': 34.9161210050057, 'longitude': -85.1103924702221 }; 
route1.proposedOrderDropOffCoord = {'latitude': 84.3875298776525, 'longitude': 33.7544138157922 }; 

route1.isOnRoute()
console.log(route1.orderOnRoute)
*/
