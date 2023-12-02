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
    
    const sql_route1 = 'CREATE TABLE IF NOT EXISTS orders_route1 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, timestamp, order_accepted)';
    db.run(sql_route1);
    const sql_route2 = 'CREATE TABLE IF NOT EXISTS orders_route2 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, timestamp, order_accepted)';
    db.run(sql_route2);
    const sql_route3 = 'CREATE TABLE IF NOT EXISTS orders_route3 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, timestamp, order_accepted)';
    db.run(sql_route3);
    const sql_route4 = 'CREATE TABLE IF NOT EXISTS orders_route4 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, timestamp, order_accepted)';
    db.run(sql_route4);
    const sql_route5 = 'CREATE TABLE IF NOT EXISTS orders_route5 (id INTEGER PRIMARY KEY, order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, timestamp, order_accepted)';
    db.run(sql_route5);

    db.close();
}

createTable();


function dbCreateRecord(order_array, table) {
    const db = dbConnect();
    const sql = `INSERT INTO ${table} (order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, timestamp, order_accepted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    db.run(sql, [...order_array, timestamp, false], (err) => {
        if (err) return console.error(err.message);
    });
    //db.close();
}



function dbSelectLastRecord(table) {

    const db = dbConnect();

        const sql = `SELECT MAX(id) AS id FROM ${table}`;
         db.get(sql, (err, id) => {
            if (err) return reject(console.error(err.message));
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

};