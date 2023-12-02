// underlying source for calculations -> https://www.movable-type.co.uk/scripts/latlong.html

const geodesic = require("geographiclib-geodesic"); // https://geographiclib.sourceforge.io/html/js/
const DMS = require("geographiclib-dms");
const geod = geodesic.Geodesic.WGS84;


const routeEndCoordinates = { 'latitude': 50.5, 'longitude': 80.5}
const routeStartCoordinates = { 'latitude': 40.5, 'longitude': 60.5}
const pickUpCoordinates = { 'latitude': 51.0, 'longitude': 69.0}

function distanceCalculatorKM(point1Hash, point2Hash) {

    const distanceInKM = geod.Inverse(point1Hash['latitude'], point1Hash['longitude'], point2Hash['latitude'], point2Hash['longitude']).s12 / 1000;  // dividing by 1000 to convert to kilometres
    console.log("Dist14: ", distanceInKM);
    return distanceInKM;
}

function obtainBearing(latitudePoint1, latitudePoint2, longitudePoint1, longitudePoint2) {

    const x = Math.sin(longitudePoint2 - longitudePoint1) * Math.cos(latitudePoint2)
    const y = Math.cos(latitudePoint1) * Math.sin(latitudePoint2) - Math.sin(latitudePoint1) * Math.cos(latitudePoint2) * Math.cos(longitudePoint2 - longitudePoint1)

    const bearingInRadians = Math.atan2(x, y);
    const bearingInDegrees = ( bearingInRadians * 180 / Math.PI + 360) % 360; 
    
    return bearingInDegrees;
}

function crossTrackDistanceCalc(pickUpCoordinates, routeStartCoordinates, routeEndCoordinates) {

    const distancePickUpToRouteStart = distanceCalculatorKM(routeStartCoordinates, pickUpCoordinates);

    const bearing1 = obtainBearing(routeStartCoordinates['latitude'], routeStartCoordinates['longitude'], pickUpCoordinates['latitude'], pickUpCoordinates['longitude']);
    const bearing2 = obtainBearing(routeStartCoordinates['latitude'], routeStartCoordinates['longitude'], routeEndCoordinates['latitude'], routeEndCoordinates['longitude']);

    const crossTrackDistance = Math.asin( Math.sin( distancePickUpToRouteStart / 6371) * Math.sin((bearing1 - bearing2) * (Math.PI / 180))) * 6371; // kilometres

    return crossTrackDistance;
}

//crossTrackDistanceCalc(pickUpCoordinates, routeStartCoordinates, routeEndCoordinates);

module.exports = {

    distanceCalculatorKM,
    crossTrackDistanceCalc,

}
