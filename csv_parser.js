const fs = require('fs');
const csv = require('csv-parser');
const routes = require('./routes.js');
const dbServerSqlite = require('./server_db.js');



function allocateToRouteDb(order) {

  Object.keys(routes.routeData).forEach(function (key) { 
    const routeClassInstance = routes.routeData[key]
    
    routeClassInstance.proposedOrderPickUpCoord = {'latitude': order[4], 'longitude': order[5] };
    routeClassInstance.proposedOrderDropOffCoord = {'latitude': order[6], 'longitude': order[7] };
    
    if(routeClassInstance.isOnRoute()) {
      dbServerSqlite.dbCreateRecord(order, routeClassInstance.dbTableName);
      dbServerSqlite.dbSelectLastRecord(routeClassInstance.dbTableName)
      return;
    }
  })
}





fs.createReadStream('full_orders.csv')
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
    allocateToRouteDb(order)
    

  })
  .on('end', () => {
    console.log('CSV data has been transformed to a JavaScript object:');
  })
  .on('error', (error) => {
    console.error('Error reading the CSV file:', error.message);
  });




