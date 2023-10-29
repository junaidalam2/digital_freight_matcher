

const geodesic = require("geographiclib-geodesic"); // https://geographiclib.sourceforge.io/html/js/
const DMS = require("geographiclib-dms");
const geod = geodesic.Geodesic.WGS84;


/*

const lat1 = 3.227511;
const lon1 = 101.724318;
const lat2 = 3.222895;
const lon2 = 101.719751;
const lat3 = 3.224972;
const lon3 = 101.722932;

let y = Math.sin(lon3 - lon1) * Math.cos(lat3);
let x = Math.cos(lat1) * Math.sin(lat3) - Math.sin(lat1) * Math.cos(lat3) * Math.cos(lat3 - lat1);
let bearing1 = Math.atan2(y, x) * (180 / Math.PI);  // convert radians to degrees
bearing1 = 360 - ((bearing1 + 360) % 360);

let y2 = Math.sin(lon2 - lon1) * Math.cos(lat2);
let x2 = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lat2 - lat1);


let bearing2 = Math.atan2(y2, x2) * (180 / Math.PI);  // convert radians to degrees
bearing2 = 360 - ((bearing2 + 360) % 360);

let lat1Rads = lat1;
let lat3Rads = lat3 * (Math.PI / 180);  // convert degrees to radians
let dLon = (lon3 - lon1) * (Math.PI / 180);  // convert degrees to radians

let distanceAC = Math.acos(Math.sin(lat1Rads) * Math.sin(lat3Rads) + Math.cos(lat1Rads) * Math.cos(lat3Rads)* Math.cos(dLon)) * 6371;  
let min_distance = Math.asin(Math.sin(distanceAC/6371)*Math.sin((bearing1) * (Math.PI / 180) -(bearing2) * (Math.PI / 180))) * 6371;

console.log(min_distance)

*/


//const routeStartCoordinates = { 'latitude': 50.5, 'longitude': 80.5}
//const routeEndCoordinates = { 'latitude': 40.5, 'longitude': 60.5}
const routeEndCoordinates = { 'latitude': 50.5, 'longitude': 80.5}
const routeStartCoordinates = { 'latitude': 40.5, 'longitude': 60.5}
const pickUpCoordinates = { 'latitude': 51.0, 'longitude': 69.0}


//console.log(geod.Inverse(routeStartCoordinates['latitude'], routeStartCoordinates['longitude'], pickUpCoordinates['latitude'], pickUpCoordinates['longitude']).s12)

const distancePickUpToRouteStart = geod.Inverse(routeStartCoordinates['latitude'], routeStartCoordinates['longitude'], pickUpCoordinates['latitude'], pickUpCoordinates['longitude']).s12 / 1000
const distancePickUpToRouteEnd = geod.Inverse(routeEndCoordinates['latitude'], routeEndCoordinates['longitude'], pickUpCoordinates['latitude'], pickUpCoordinates['longitude']).s12 / 1000

//console.log(distancePickUpToRouteStart)
//console.log(distancePickUpToRouteEnd)


function obtainBearing(latitudePoint1, latitudePoint2, longitudePoint1, longitudePoint2) {

    const x = Math.sin(longitudePoint2 - longitudePoint1) * Math.cos(latitudePoint2)
    //console.log(x)
    const y = Math.cos(latitudePoint1) * Math.sin(latitudePoint2) - Math.sin(latitudePoint1) * Math.cos(latitudePoint2) * Math.cos(longitudePoint2 - longitudePoint1)

    const bearingInRadians = Math.atan2(x, y);
    const bearingInDegrees = ( bearingInRadians * 180 / Math.PI + 360) % 360; 
    
    return bearingInDegrees;
}


//console.log(obtainBearing(39.099912, 38.627089, -94.581213, -90.200203))
//console.log(obtainBearing(38.627089, 39.099912, -90.200203, -94.581213))


//console.log(Math.cos(38.627089) * Math.sin(4.38101))

const bearing1 = obtainBearing(routeStartCoordinates['latitude'], routeStartCoordinates['longitude'], pickUpCoordinates['latitude'], pickUpCoordinates['longitude']);
const bearing2 = obtainBearing(routeStartCoordinates['latitude'], routeStartCoordinates['longitude'], routeEndCoordinates['latitude'], routeEndCoordinates['longitude']);

const crossTrackDistance = Math.asin( Math.sin( distancePickUpToRouteStart / 6371) * Math.sin((bearing1 - bearing2) * (Math.PI / 180))) * 6371; // kilometers
console.log(crossTrackDistance);
