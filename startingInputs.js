const {isOnRoute} = require ('./distanceVerification.js');
const constants = require('./constants.js');
const { routes, calculateCrossTrackDistances } = require('./distanceVerification.js');
const { distanceCalculatorKM, crossTrackDistanceCalc } = require ('./distance.js');
const distance = require('./distance.js');
const geodesic = require("geographiclib-geodesic"); // https://geographiclib.sourceforge.io/html/js/
const DMS = require("geographiclib-dms");
const { updateLocale } = require('moment');
const geod = geodesic.Geodesic.WGS84;
// https://stackoverflow.com/questions/20231258/minimum-distance-between-a-point-and-a-line-in-latitude-longitude?noredirect=1&lq=1

let db;
async function initializeDatabase() {
    return new Promise( (resolve, reject) => {
        try {
            const sqlite3 = require('sqlite3').verbose();
            db = new sqlite3.Database('routes.db');

            async function dropAndCreateRoutesTable(db) {
                return new Promise((resolve, reject) => {
                    db.run(`DROP TABLE IF EXISTS Routes`, (err) => {
                    if (err) {
                        console.log(error("47Error dropping table: ", err.message));
                        reject(err);
                    } else {
                        db.run(
                            `CREATE TABLE IF NOT EXISTS Routes (
                            EntryID INTEGER PRIMARY KEY AUTOINCREMENT,
                            RouteNum INTEGER,
                            AnchorPoint TEXT,
                            MilesWithCargo REAL,
                            TotalMiles REAL,
                            OperationalTruckCost REAL,
                            Pallets INTEGER,
                            CargoCost REAL,
                            EmptyCargoCost REAL,
                            Markup REAL,
                            PriceBasedOnTotalCost REAL,
                            PriceBasedOnCargoCost REAL,
                            Margin REAL,
                            PickupDropOffQuantity INTEGER,
                            TimeHours REAL     
                            )`, function(err) {
                                if(err) {
                                    console.error("34: ", err.message);
                
                                } else {
                                    console.error("77:No error");
                                    resolve();
                                    // performAdditionalDatabaseActions();
                                }
                        });
                    }
                    });   
                });
            }
       
            async function insertRoutesData(db) {
                const routesData = [
                    [1, 'Ringgold', 101, 202, 367.02, 12, 165.80599, 201.21, 0.5, 550.53, 248.708981, -0.3224, 2, 4.0],
                    [2, 'Augusta', 94.6, 189.2, 343.76, 10, 129.41622, 214.35, 0.5, 515.64, 194.1243367, -0.4353, 2, 3.8],
                    [3, 'Savannah', 248, 496, 901.19, 11, 373.20028, 527.99, 0.5, 1351.79, 559.8004127, -0.3788, 2, 9.9],
                    [4, 'Albany', 182, 364, 661.36, 12, 298.77911, 362.58, 0.5, 992.04, 448.1686588, -0.3224, 2, 7.3],
                    [5, 'Columbus', 107, 214, 388.82, 9, 131.74189, 257.08, 0.5, 583.23, 197.612829, -0.4918, 2, 4.3],
                ];

                const insertOrUpdateRoute = db.prepare(`INSERT INTO Routes (
                    RouteNum,AnchorPoint,MilesWithCargo,TotalMiles,OperationalTruckCost, Pallets,CargoCost,
                    EmptyCargoCost, Markup,PriceBasedOnTotalCost,PriceBasedOnCargoCost,Margin,PickupDropOffQuantity,TimeHours) 
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)` );

                for (const data of routesData) {
                    await runInsert(db, insertOrUpdateRoute, data);
                }   
                insertOrUpdateRoute.finalize();
            }
            async function runInsert(db, insertOrUpdateRoute, data) {
                return new Promise((resolve, reject) => {
                    insertOrUpdateRoute.run(...data, function(err) {
                        if (err) {
                            console.error("81Error inserting data: ", err.message);
                            reject(err);
                        } else {
                            console.log("84Data inserted success: ", data);
                            resolve();
                        }
                    });
                });
            }

            async function displayRoutes(db) {
                return new Promise((resolve, reject) => {
                    db.all("SELECT * FROM Routes", (err, rows) => {
                        if (err) {
                            console.error("116Error fetching routes: ", err.message);
                            reject(err);
                        } else {
                            console.log("98Routes in db: ");
                            rows.forEach(row => {
                                console.log(row);
                            });
                            resolve();
                        }
                    });
                });
            }

            async function fetchAndLogRoutes(db) {
                return new Promise((resolve, reject) => {
                    db.each("SELECT * FROM Routes", (err, row) => {
                        if (err) {
                            console.error("134Error fetching routes:", err.message);
                            reject(err);
                        } else {
                            console.log("137Fetched route:", row);
                        }
                    }, () => {
                        resolve();
                    });
                });
            }

            (async () => {
                try {
                    await dropAndCreateRoutesTable(db);
                    await insertRoutesData(db);
                    await displayRoutes(db);
                    await fetchAndLogRoutes(db);
                    db.close((err) => {
                        if(err) {
                            console.log("28dbclose: ", err.message);
                            reject(err);
                        } else {
                            console.log("30Database connection closed");
                            resolve();
                        }
                    });
                } catch (error) {
                    console.error("36Error: ", error);
                    reject(error);
                }
            })();
        } catch (error) {
            console.error("Outer catch block: ", error);
            reject(error);
        }
    });             
}


class Route {

    constructor(db, routeNumber, anchorPointName, milesWithCargo, palletsOccupied, pickUpDropOffCounter, longitude, latitude) {
        this.db = db;
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
        this.milesWithCargo = order.milesWithCargo; // fix the calculation
        this.palletsOccupied = order.palletsOccupied; // check if i need to add to the current pallets Occ
        this.pickUpDropOffCounter = order.pickUpDropOffCounter;
        // Adjust volume and weight for partial pallets
        this.availableVolume = constants.truckVolume - this.palletsOccupied * constants.palletVolume;
        this.availableWeight = constants.maxWeight - this.palletsOccupied * constants.palletWeight;
        const updateQuery = `UPDATE Routes
                            SET MilesWithCarg = ?, Pallets = ?, TimeHours = ?
                            WHERE RouteNum = ?`;
        this.db.run(updateQuery, [this.milesWithCargo, this.palletsOccupied, this.timeInMinutes/60, this.routeNumber], function(err) {
            if(err) {
                console.log("202ErrorUpdRoute: ", err);
            } else {
                console.log("204 Route updated");
            }
        });
    }

    checkConstraints() {
        // Need to create constraints for time, volume, weight
        const timeConstraint = this.timeInMinutes <= constants.maxTimeInMinutes;
        const volumeConstraint = this.availableVolume >= 0; // check if Available Volume >= 0
        const weightConstraint = this.availableWeight >= 0; // check if Available Weight >= 0
        return timeConstraint && volumeConstraint && weightConstraint;
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
        const routeKey = routeInfo.routeKey;
        const numOfRoute= routeInfo.numOfRoute;
        
        routeToUpdate = routeData[numOfRoute];
        // routeToUpdate.updateOrder(transformedOrder);
        console.log("148routeInfo: ", routeInfo);
        console.log("223routeKey: ", routeKey);
        console.log("149typeof: ", typeof routeInfo);
        console.log("237numOfRoute: ", numOfRoute);
        console.log("242R2Up: ", routeToUpdate);
        
        console.log("243R2Up: ", routeToUpdate);
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

const route1 = new Route(db, 1, 'Ringgold', 101, 12, 2, 34.9161210050057, -85.1103924702221);
const route2 = new Route(db, 2, 'Augusta', 94.6, 10, 2, 33.4676716195606, -81.8920767938344);
const route3 = new Route(db, 3, 'Savannah', 248, 11, 2, 32.0815296895872, -80.9773396382228);
const route4 = new Route(db, 4, 'Albany', 182, 12, 2, 31.5770410650746, -84.1807668794164);
const route5 = new Route(db, 5, 'Columbus', 107, 9, 2, 32.4661710120819, -85.1587927831466);


const routeData = {
    1: route1,
    2: route2,
    3: route3,
    4: route4,
    5: route5,
}



// move to another file
function calculateDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371; // Earth radius in km
    const degreesToRadians = (degrees) => {
        return degrees * (Math.PI / 180);
    };

    const radLat1 = degreesToRadians(lat1);
    const radLon1 = degreesToRadians(lon1);
    const radLat2 = degreesToRadians(lat2);
    const radLon2 = degreesToRadians(lon2);

    const dLat = radLat2 - radLat1;
    const dLon = radLon2 - radLon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon /2 ) * Math.sin(dLon / 2);
    const c = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c; // distance in km
    console.log("113dist: ", distance);
    return distance;
}

function convertOrderFormat(order) {
    console.log("64Order: ", order);
    // console.log("34: order.pickUp.latitude: ", order['pick-up'].latitude);
    // console.log("35: order.pickUp.longitude: ", order['pick-up'].longitude);
    // console.log("36: order.pickUp.latitude: ", order['drop-off'].latitude);
    // console.log("37: order.pickUp.longitude: ", order['drop-off'].longitude);
    const milesWithCargo = calculateDistanceBetweenPoints(order['pick-up'].latitude, order['pick-up'].longitude, order['drop-off'].latitude, order['drop-off'].longitude); // calc miles with cargo
    const palletsOccupied = order.cargo.packages.length; // calc pallets occupied
    const pickUpDropOffCounter = 2; // calc pick up / drop off counter
    console.log("126: milesWithCargo: ", milesWithCargo);
    // console.log("42: palletsOccupied: ", palletsOccupied);
    // console.log("43: pickUpDropOffCounter: ", pickUpDropOffCounter);
    const pointLatitude = order['pick-up'].latitude;
    const pointLongitude = order['pick-up'].longitude;
    return {
        milesWithCargo,
        palletsOccupied,
        pickUpDropOffCounter,
        pointLatitude,
        pointLatitude
    };
}





// CHECK FOR VOLUME; 
function meets_Volume(order) {
    orderVolume = order[0][0];
    console.log("260OrderVolume: ", orderVolume);
    if (maxVolume <= currentVolume + orderVolume) {
        return true;
    } else {
        return false;
    }
}
// CHECK FOR WEIGHT; boolean
function meets_Weight(order) {
    orderWeight = order[0][1];
    console.log("260OrderWeight: ", orderWeight);
    if (maxWeight <= currentWeight + orderWeight) {
        return true;
    } else {
        return false;
    }
}

// CHECK FOR TIME; boolean
function meets_Time(order) {
    orderTime = 0.66;
    console.log("260OrderTime: ", orderTime);
    if (maxTime <= currentTime + orderTime) {
        return true;
    } else {
        return false;
    }
}

// If meets volume, weight and time constraints, update the route


module.exports = {
    routeData: routeData,
}

//////////////////////////////////////////////////////////////////////////
let routeToUpdate;
// route1.updateOrder(transformedOrder);

// Get coordinates for testing



function processOrder(order, aw_initDB, aw_procOrd) {
    return new Promise((resolve, reject) => {
        const transformedOrder = convertOrderFormat(order);
        if (meets_Volume && meets_Weight && meets_Time) {
            // routeToUpdate.updateOrder(transformedOrder);
            updateOrder(transformedOrder);
            // console.log("275R2Up: ", routeToUpdate);    
            // update price
        } else {
            console.log("Order rejected")
        }
    })
}

async function startOrderProcessing(order, routeToUpdate) {
    try {
        await initializeDatabase();
        
        let aw_procOrd = await processOrder(order);
        return "Order processed successfully";
    } catch (error) {
        throw new Error (`Order processing failed: ${error}`);
    }
}

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
// const order = {
//     1,"[12, 42, standard]",
//     "{lat: 33.78015129657219,lng: -84.34128279641483}",
//     "{lat: 33.662866638790945,lng: -84.26739402810634}"
// }

startOrderProcessing(order)
    .then((successMessage) => {
        console.log(successMessage);
    })
    .catch((errorMessage) => {
        console.error(errorMessage);
    });






/*
create & seed database 
intake order
determine if w/in range of a route; yes => route info
in the database, update the route info based on route returned
    price, volume,  . . .


edit to take in dropoff point
determine route
X sufficient time? +30min
X sufficient volume? this.volume <= 26.6; total vol (1700 ft^3) - (pallets * vol[64])
X sufficient weight: 9180 lbs max; weight = total weight - (pallets * weight[440])

determine price
does it fit on current truck, if not reject


*/