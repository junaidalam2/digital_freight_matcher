const dbServerSqlite = require('./server_db.js');

//dbServerSqlite.dbSelectAll("orders_route1");
//dbServerSqlite.dbSelectAll("orders_route2");
//dbServerSqlite.dbSelectAll("orders_route3");
//dbServerSqlite.dbSelectAll("orders_route4");
//dbServerSqlite.dbSelectAll("orders_route5");



function removeAllTables() {

    dbServerSqlite.dropTable("orders")
    dbServerSqlite.dropTable("orders_route1")
    dbServerSqlite.dropTable("orders_route2")
    dbServerSqlite.dropTable("orders_route3")
    dbServerSqlite.dropTable("orders_route4")
    dbServerSqlite.dropTable("orders_route5")

}

removeAllTables();
