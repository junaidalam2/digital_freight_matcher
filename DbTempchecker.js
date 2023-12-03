const dbServerSqlite = require('./server_db.js');

//dbServerSqlite.dbSelectAll("orders_route1");
//dbServerSqlite.dbSelectAll("orders_route2");
//dbServerSqlite.dbSelectAll("orders_route3");
//dbServerSqlite.dbSelectAll("orders_route4");
//dbServerSqlite.dbSelectAll("orders_route5");
//dbServerSqlite.dbSelectAll("orders_rejected")


function removeAllTables() {

    dbServerSqlite.dropTable("orders")
    dbServerSqlite.dropTable("orders_route1")
    dbServerSqlite.dropTable("orders_route2")
    dbServerSqlite.dropTable("orders_route3")
    dbServerSqlite.dropTable("orders_route4")
    dbServerSqlite.dropTable("orders_route5")
    dbServerSqlite.dropTable("orders_rejected")

}

//removeAllTables();



dbServerSqlite.dbSelectWithCriteria("orders_route1", "order_id", "seed")
dbServerSqlite.dbSelectWithCriteria("orders_route2", "order_id", "seed")
dbServerSqlite.dbSelectWithCriteria("orders_route3", "order_id", "seed")
dbServerSqlite.dbSelectWithCriteria("orders_route4", "order_id", "seed")
dbServerSqlite.dbSelectWithCriteria("orders_route5", "order_id", "seed")
//dbServerSqlite.dbSelectLastRecord("orders_route1")