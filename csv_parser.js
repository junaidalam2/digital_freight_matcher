const fs = require('fs');
const csv = require('csv-parser');
const routes = require('./routes.js');
const constants = require('./constants.js');
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


fs.createReadStream('full_orders_truncated.csv')
  .pipe(csv())
  .on('data', (row) => {
    const order_id = parseInt(row.id);
    const cargoArray = row.cargo.replace(/[\[\]']+/g, '').split(', ').map(item => (isNaN(item) ? item : parseInt(item)));
    const cargo_volume = cargoArray[0];
    const cargo_weight = cargoArray[1];
    const cargo_type = cargoArray[2];
    const { lat: pickup_lat, lng: pickup_lon } = eval(`(${row.pick_up})`);
    const { lat: drop_lat, lng: drop_lon } = eval(`(${row.drop_off})`);
    const valid = row.valid === 'true';

    const order = [
      order_id,
      cargo_volume,
      cargo_weight,
      cargo_type,
      pickup_lat,
      pickup_lon,
      drop_lat,
      drop_lon,
      valid,
    ];

    //console.log(order)
    //dbServerSqlite.dbCreateRecord(order)
    allocateToRouteDb(order);
    

  })
  .on('end', () => {
    console.log('CSV data has been transformed to a JavaScript object:');
  })
  .on('error', (error) => {
    console.error('Error reading the CSV file:', error.message);
  });




