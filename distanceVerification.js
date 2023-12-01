const turf = require('@turf/turf');
let updatedRouteData = {};


const routes = {
  route_1: [ //Ringold
    {
      latitude: 33.7544138157922, // Atlanta
      longitude: -84.3875298776525, // <- Starting Point
    },
    {
      latitude: 34.9161210050057,
      longitude: -85.1103924702221,
    },
  ],
  route_2: [ //Augusta
    {
      latitude: 33.7544138157922, // Atlanta
      longitude: -84.3875298776525, // <- Starting Point
    },
    {
      latitude: 33.4676716195606,
      longitude: -81.8920767938344,
    },
  ],
  route_3: [ //Savannah
    {
      latitude: 33.7544138157922, // Atlanta
      longitude: -84.3875298776525, // <- Starting Point
    },
    {
      latitude: 32.0815296895872,
      longitude: -80.9773396382228,
    },
  ],
  route_4: [ //Albany
    {
      latitude: 33.7544138157922, // Atlanta
      longitude: -84.3875298776525, // <- Starting Point
    },
    {
      latitude: 31.5770410650746,
      longitude: -84.1807668794164,
    },
  ],
  route_5: [ //Columbus
    {
      latitude: 33.7544138157922, // Atlanta
      longitude: -84.3875298776525, // <- Starting Point
    },
    {
      latitude: 32.4661710120819,
      longitude: -85.1587927831466,
    },
  ],
};
// Function to convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Function to calculate Haversine distance between two points on the Earth
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}
  function crossTrackDistance(lat, lon, lat1, lon1, lat2, lon2) {
    const d13 = haversine(lat, lon, lat1, lon1);
    const d12 = haversine(lat1, lon1, lat2, lon2);
    const d23 = haversine(lat, lon, lat2, lon2);

    // Calculate triangle semi-perimeter
    const s = (d13 + d12 + d23) / 2;

    // Calculate area of the triangle using Heron's formula
    const area = Math.sqrt(s * (s - d13) * (s - d12) * (s - d23));

    // Calculate cross-track distance
    const dxt = (2 * area) / d12;

    return Math.abs(dxt); // Return absolute value for positive distance
}
// Function to calculate cross-track distance for all routes


function calculateCrossTrackDistances(routes, pointLatitude, pointLongitude) {
  // Function to calculate cross-track distance

  console.log("97pointLatitude: ", pointLatitude);
  console.log("98pointLongitude: ", pointLongitude);


  for (const routeKey in routes) {
    const route = routes[routeKey];
    // console.log("101route: ", route);
    const lineStart = route[0]; // First point of the route
    // console.log("103lineStart: ", lineStart);
    const lineEnd = route[route.length - 1]; // Last point of the route
    // console.log("105lineEnd: ", lineEnd);
    const distance = crossTrackDistance(
      pointLatitude,
      pointLongitude,
      lineStart.latitude,
      lineStart.longitude,
      lineEnd.latitude,
      lineEnd.longitude
    );
    // console.log("dV112distance: ", distance);
    if (distance < 5){
        console.log("112distanceVerif");
        console.log(`113Route: ${routeKey}, Cross-track distance: ${distance.toFixed(2)} kilometers`);
        
        // convert route keys from route_X to X
        const routeNumber = routeKey.split('_')[1];
        const  updatedRouteNum = `route${routeNumber}`;
        const numOfRoute = routeNumber;
        updatedRouteData[updatedRouteNum] = route;


      return {
        routeKey: routeKey,
        distance: distance.toFixed(2), // fix 2 decimals
        updatedRouteNum: updatedRouteNum,
        updatedRouteData: updatedRouteData,
        numOfRoute: numOfRoute,

      };
    }
    else{
      console.log('no match');
    }

  }
  return false
}

// Example point coordinates (San Francisco)
const pointLatitude = 33.63511814123319;
const pointLongitude = -84.4316031545102;
// from order:
// const pointLatitude = 33.754413815792205;
// const pointLongitude = -84.3875298776525;

// Call the function to calculate cross-track distances for all routes
console.log("132: ", calculateCrossTrackDistances(routes, pointLatitude, pointLongitude));
// console.log("154dV: ", updatedRouteNum);
module.exports = {
  calculateCrossTrackDistances,
  routes,
}