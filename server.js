
const constants = require('./constants.js');
const routes = require('./routes.js');
const dbServerSqlite = require('./server_db.js');


function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in kilometers
  
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
    return distance;
  }
  
  
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  
  function intersectionPoint(start, end, point) {
    // Calculate distances between points
    const distanceStartToPoint = haversine(start.latitude, start.longitude, point.latitude, point.longitude);
    const distanceEndToPoint = haversine(end.latitude, end.longitude, point.latitude, point.longitude);
    const totalDistance = haversine(start.latitude, start.longitude, end.latitude, end.longitude);
  
    // Check if the point is on the line
    if (Math.abs(distanceStartToPoint + distanceEndToPoint - totalDistance) < 1e-6) {
        return point;
    } else {
        // Calculate the intersection point
        const ratio = distanceStartToPoint / totalDistance;
        const intersectionLat = start.latitude + ratio * (end.latitude - start.latitude);
        const intersectionLon = start.longitude + ratio * (end.longitude - start.longitude);
        return { latitude: intersectionLat, longitude: intersectionLon };
    }
  }
  
  
  function allocateToRouteDb(order) {
  
    let orderAllocated = false;
  
    Object.keys(routes.routeData).forEach(function (key) { 
      const routeClassInstance = routes.routeData[key]
      
      routeClassInstance.proposedOrderPickUpCoord = {'latitude': order[4], 'longitude': order[5] };
      routeClassInstance.proposedOrderDropOffCoord = {'latitude': order[6], 'longitude': order[7] };
      routeClassInstance.isOnRoute()
  
      if(routeClassInstance.orderOnRoute) {
        console.log(routeClassInstance.orderOnRoute);
  
        const pickIntersectCoord = intersectionPoint(constants.hubCoordinates,  routeClassInstance.anchorCoord, routeClassInstance.proposedOrderPickUpCoord);
        const dropIntersectCoord = intersectionPoint(constants.hubCoordinates, routeClassInstance.anchorCoord, routeClassInstance.proposedOrderDropOffCoord);
  
        order.push(pickIntersectCoord.latitude)
        order.push(pickIntersectCoord.longitude)
        order.push(dropIntersectCoord.latitude)
        order.push(dropIntersectCoord.longitude)
  
  
        const distanceToStart = haversine(pickIntersectCoord.latitude, pickIntersectCoord.longitude, constants.hubCoordinates['latitude'], constants.hubCoordinates['longitude'])
        const distanceToEnd = haversine(dropIntersectCoord.latitude, dropIntersectCoord.longitude, constants.hubCoordinates['latitude'], constants.hubCoordinates['longitude'])
        const distanceOnRoute = haversine(pickIntersectCoord.latitude, pickIntersectCoord.longitude, dropIntersectCoord.latitude, dropIntersectCoord.longitude)
        
        let directionToAnchor = true;
        if(distanceToStart >= distanceToEnd ) {
          directionToAnchor = false;
        }
        
        order.push(distanceToStart);
        order.push(distanceToEnd);
        order.push(distanceOnRoute);
        order.push(directionToAnchor);
  
        console.log(order, order.length)
  
        dbServerSqlite.dbCreateRecord(order, routeClassInstance.dbTableName);
        
        order = []
        orderAllocated = true
        //dbServerSqlite.dbSelectLastRecord(routeClassInstance.dbTableName)
        return;
      }
    })
  
    if (!orderAllocated) {
      dbServerSqlite.dbCreateRecordRejectedOrder(order[0]);
    }
  
  }
  

  module.exports = {

    allocateToRouteDb,
      
}



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





