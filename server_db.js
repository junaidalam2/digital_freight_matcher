const sqlite = require('sqlite3').verbose();

function dbConnect() {
    const db = new sqlite.Database('./sqlite_order.db', sqlite.OPEN_READWRITE, (err) => {
        if (err) return console.error(err.message);
    });

    return db;
}


function createTable() {
    const db = dbConnect();
    const sql = 'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, timestamp, order_accepted)';
    db.run(sql);
    
    const sql_route1 = 'CREATE TABLE IF NOT EXISTS orders_route1 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, pickup_intersect_lat, pickup_intersect_lon, drop_intersect_lat, drop_intersect_lon, distance_to_pickup, distance_to_drop, distance_on_route, direction_to_anchor, timestamp, order_accepted)';
    db.run(sql_route1);
    const sql_route2 = 'CREATE TABLE IF NOT EXISTS orders_route2 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, pickup_intersect_lat, pickup_intersect_lon, drop_intersect_lat, drop_intersect_lon, distance_to_pickup, distance_to_drop, distance_on_route, direction_to_anchor, timestamp, order_accepted)';
    db.run(sql_route2);
    const sql_route3 = 'CREATE TABLE IF NOT EXISTS orders_route3 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, pickup_intersect_lat, pickup_intersect_lon, drop_intersect_lat, drop_intersect_lon, distance_to_pickup, distance_to_drop, distance_on_route, direction_to_anchor, timestamp, order_accepted)';
    db.run(sql_route3);
    const sql_route4 = 'CREATE TABLE IF NOT EXISTS orders_route4 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, pickup_intersect_lat, pickup_intersect_lon, drop_intersect_lat, drop_intersect_lon, distance_to_pickup, distance_to_drop, distance_on_route, direction_to_anchor, timestamp, order_accepted)';
    db.run(sql_route4);
    const sql_route5 = 'CREATE TABLE IF NOT EXISTS orders_route5 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, pickup_intersect_lat, pickup_intersect_lon, drop_intersect_lat, drop_intersect_lon, distance_to_pickup, distance_to_drop, distance_on_route, direction_to_anchor, timestamp, order_accepted)';
    db.run(sql_route5);
    
    const sql_rejected = 'CREATE TABLE IF NOT EXISTS orders_rejected (id INTEGER PRIMARY KEY, order_id)';
    db.run(sql_rejected);

    db.close();
}

createTable();


function dbCreateRecord(order_array, table) {
    const db = dbConnect();
    const sql = `INSERT INTO ${table} (order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, pickup_intersect_lat, pickup_intersect_lon, drop_intersect_lat, drop_intersect_lon, distance_to_pickup, distance_to_drop, distance_on_route, direction_to_anchor, timestamp, order_accepted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    db.run(sql, [...order_array, timestamp, false], (err) => {
        if (err) return console.error(err.message);
    });
    //db.close();
}


function dbCreateRecordRejectedOrder(order_id) {
    const db = dbConnect();
    const sql = `INSERT INTO orders_rejected (order_id) VALUES (?)`;
    db.run(sql, [order_id], (err) => {
        if (err) return console.error(err.message);
    });
    //db.close();
}



function dbSelectLastRecord(table) {

    const db = dbConnect();

        const sql = `SELECT MAX(id) AS id FROM ${table}`;
         db.get(sql, (err, id) => {
            if (err) return err.message;
            console.log(id);
        });
        //db.close();
}


function dbSelectAll(table) {
    const db = dbConnect();


        const sql = `SELECT * FROM ${table}`;
        
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log(rows);
            }
        });

        // db.close(); // You might want to close the database connection after the query is executed.
    //return rows
}


function dbSelectAllRanked(table, OrderByColumn, OrderDirection) {
    const db = dbConnect();


        const sql = `SELECT * FROM ${table} ORDER BY ${OrderByColumn} ${OrderDirection}`;
              
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log(rows);
            }
        });

        // db.close(); // You might want to close the database connection after the query is executed.
    return rows
}




function dropTable(table) {
    const db = dbConnect();

        const sql = `DROP TABLE IF EXISTS ${table}`;
        
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log(`Table: ${table} dropped`);
            }
        });

        // db.close(); // You might want to close the database connection after the query is executed.
    
}



module.exports = {

    dbCreateRecord,
    dbSelectLastRecord,
    dbSelectAll,
    dropTable,
    dbCreateRecordRejectedOrder,
    dbSelectAllRanked,

};