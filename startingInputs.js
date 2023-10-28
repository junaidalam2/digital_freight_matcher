
const constants = require('./constants.js');


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
        this.projectedRevenueFullTruck =  projectPricePerPackage * this.availableStandardPackages + this.price;
        this.marginalCostPerOrder = null;

    }

    marginalCost(additionalPallets) {
        this.marginalCostPerOrder = additionalPallets * this.totalMiles * constants.palletCostPerMile
    }

    resetMarginalCost() {
        this.marginalCostPerOrder = null
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