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
    db.close();
}

createTable();


function dbCreateRecord(order_array) {
    const db = dbConnect();
    const sql = 'INSERT INTO orders (order_id, cargo_volume, cargo_weight, cargo_type, pickup_lat, pickup_lon, drop_lat, drop_lon, valid, timestamp, order_accepted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    db.run(sql, [...order_array, timestamp, false], (err) => {
        if (err) return console.error(err.message);
    });
    //db.close();
}



function dbSelectLastRecord() {

    const db = dbConnect();

    return new Promise((resolve, reject) => {

        const sql = `SELECT MAX(id) AS id FROM orders`;
         db.get(sql, (err, id) => {
            if (err) return reject(console.error(err.message));
            console.log(id);
            return resolve(id);
        });
        //db.close();
    });
}


module.exports = {

    dbCreateRecord,
    dbSelectLastRecord,

};