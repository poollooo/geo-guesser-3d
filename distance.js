import * as geolib from 'geolib'

let distanceInKm = 0;

let givenCoordinates = [
    5.8570, 72
]

let userCoordinates = [
    4,
    72
]
    



distanceInKm = Math.floor(geolib.getDistance(givenCoordinates, userCoordinates) / 1000)
console.log('distance in km is ', distanceInKm)


// function distance(lat1, lon1, lat2, lon2) {
//     const R = 6371e3; // metres
//     const latGivenRad = lat1 * Math.PI / 180; // φ, λ in radians
//     const latClickedRad = lat2 * Math.PI / 180;
//     const deltaLat = (lat2 - lat1) * Math.PI / 180;
//     const deltaLong = (lon2 - lon1) * Math.PI / 180;

//     const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
//         Math.cos(latGivenRad) * Math.cos(latClickedRad) *
//         Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     distanceInKm = Math.floor(Math.floor(R * c) / 1000)
//     return distanceInKm;
// }


// console.log(distance(geo.normalizeLatitude(6.2476), geo.normalizeLongitude(75.5658), geo.normalizeLatitude(-27), geo.normalizeLongitude(133)));