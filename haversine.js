



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
  
  // Function to calculate cross-track distance
  function crossTrackDistance(lat, lon, lat1, lon1, lat2, lon2) {
    const d13 = haversine(lat, lon, lat1, lon1);
    const theta13 = toRadians(bearing(lat1, lon1, lat, lon));
    const theta12 = toRadians(bearing(lat1, lon1, lat2, lon2));
  
    const dxt = Math.asin(Math.sin(d13 / 6371) * Math.sin(theta13 - theta12)) * 6371;
  
    return dxt;
  }
  
  // Function to calculate initial bearing between two points
  function bearing(lat1, lon1, lat2, lon2) {
    const dLon = toRadians(lon2 - lon1);
  
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x =
      Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
      Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  
    const brng = Math.atan2(y, x);
  
    // Convert bearing from radians to degrees
    const brngDegrees = (toRadians(brng) + 360) % 360;
  
    return brngDegrees;
  }
  
  // Example usage
  /*
  const pointLatitude = 37.7749; // Example point coordinates (San Francisco)
  const pointLongitude = -122.4194;
  const lineStartLatitude = 34.0522; // Example line start coordinates (Los Angeles)
  const lineStartLongitude = -118.2437;
  const lineEndLatitude = 41.8781; // Example line end coordinates (Chicago)
  const lineEndLongitude = -87.6298;
*/
  const pointLatitude = 34.9161210050057; // Example point coordinates (San Francisco)
  const pointLongitude = -85.1103924702221;
  const lineStartLatitude = 34.9161210050057; // Example line start coordinates (Los Angeles)
  const lineStartLongitude = -85.1103924702221;
  const lineEndLatitude = 33.7544138157922 ; // Example line end coordinates (Chicago)
  const lineEndLongitude = -84.3875298776525;
  
  const distance = crossTrackDistance(
    pointLatitude,
    pointLongitude,
    lineStartLatitude,
    lineStartLongitude,
    lineEndLatitude,
    lineEndLongitude
  );
  
  console.log(`Cross-track distance: ${distance} kilometers`);
  