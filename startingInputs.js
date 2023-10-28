
const constants = require('./constants.js');


class Route {

    constructor(routeNumber, anchorPoint, milesWithCargo, palletsOccupied, pickUpDropOffCounter, longitude = null, latitude = null) {

        this.routeNumber = routeNumber;
        this.anchorPoint = anchorPoint;
        this.longitude = longitude; // of anchor
        this.latitude = latitude; // of anchor
        this.milesWithCargo = milesWithCargo;
        this.totalMiles = this.milesWithCargo * 2;
        this.operationalTruckCost = constants.costPerMile * this.totalMiles;
        this.palletsOccupied = palletsOccupied;
        this.cargoCost = this.totalMiles * constants.palletCostPerMile * this.palletsOccupied;
        this.emptyCargoCost = this.operationalTruckCost - this.cargoCost;
        this.price = this.operationalTruckCost * constants.markup;
        this.pickUpDropOffCounter =  pickUpDropOffCounter;

    }

}

const route1 = new Route(1, 'Ringgold', 101, 12, 2)
const route2 = new Route(2, 'Augusta', 94.6, 10, 2)
const route3 = new Route(3, 'Savannah', 248, 11, 2)
const route4 = new Route(4, 'Albany', 182, 12, 2)
const route5 = new Route(5, 'Columbus', 107, 9, 2)


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