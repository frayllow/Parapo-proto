/**
 * v7.0
 * tracker.js
 * Handles coordinate snapping, distance calculations, 
 * and Environmental Modeling for ETAs.
 */

import { trafficZones } from './config.js';

/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 */
export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Snaps a raw GPS point to the nearest coordinate in the predefined route.
 * Returns an object with the snapped point and its index in the array.
 */
export function snapToRoute(userLat, userLng, routePoints) {
    let minD = Infinity;
    let closestPoint = routePoints[0];
    let closestIdx = 0;

    routePoints.forEach((point, index) => {
        const d = getDistance(userLat, userLng, point[0], point[1]);
        if (d < minD) {
            minD = d;
            closestPoint = point;
            closestIdx = index;
        }
    });

    return { point: closestPoint, index: closestIdx };
}

/**
 * ENVIRONMENTAL ENGINE:
 * Calculates path distance multiplied by traffic penalties for specific segments.
 */
function getWeightedPathDistance(startIdx, endIdx, routePoints) {
    let weightedTotal = 0;

    // Iterate through the segments between the start and end index
    for (let i = startIdx; i < endIdx; i++) {
        const d = getDistance(
            routePoints[i][0], routePoints[i][1],
            routePoints[i + 1][0], routePoints[i + 1][1]
        );

        // Apply penalty if the segment index (i) falls within a traffic zone
        const zone = trafficZones.find(z => i >= z.startIdx && i <= z.endIdx);
        const penalty = zone ? zone.penalty : 1.0;

        weightedTotal += (d * penalty);
    }

    return weightedTotal;
}

/**
 * Updates the UI list by finding the nearest jeep for every stop
 * and calculating the weighted ETA.
 */
export function updateStopListMultiple(driversObj, stopsArray, routePoints) {
    const baseSpeed = 12; // Average Ikot speed in km/h
    const hour = new Date().getHours();
    
    // Global Heuristic: General campus slowdown during peak hours
    let timeMultiplier = 1.0;
    if (hour >= 7 && hour <= 9) timeMultiplier = 1.4; // Morning rush
    if (hour >= 16 && hour <= 19) timeMultiplier = 1.6; // Afternoon rush

    let listHtml = "";

    stopsArray.forEach(stop => {
        let bestWeightedEta = Infinity;
        let actualDistToDisplay = Infinity;

        // Check every jeep in the fleet to find which one reaches THIS stop first
        Object.values(driversObj).forEach(jeep => {
            const jeepSnapped = snapToRoute(jeep.lat, jeep.lng, routePoints);
            const stopSnapped = snapToRoute(stop.lat, stop.lng, routePoints);
            
            const jIdx = jeepSnapped.index;
            const sIdx = stopSnapped.index;

            let weightedDist = 0;
            let rawDist = 0;

            if (jIdx <= sIdx) {
                // Jeep is behind the stop (normal path)
                weightedDist = getWeightedPathDistance(jIdx, sIdx, routePoints);
                rawDist = getDistance(jeep.lat, jeep.lng, stop.lat, stop.lng);
            } else {
                // Jeep has passed the stop; calculate distance to end of loop + start to stop
                const toEnd = getWeightedPathDistance(jIdx, routePoints.length - 1, routePoints);
                const fromStart = getWeightedPathDistance(0, sIdx, routePoints);
                weightedDist = toEnd + fromStart;
                rawDist = getDistance(jeep.lat, jeep.lng, stop.lat, stop.lng); 
            }

            // ETA = (Distance / Speed) * 60 minutes * Time-of-day Factor
            const eta = Math.round(((weightedDist / baseSpeed) * 60) * timeMultiplier);
            
            if (eta < bestWeightedEta) {
                bestWeightedEta = eta;
                actualDistToDisplay = rawDist;
            }
        });

        // Generate the HTML for the stop list
        listHtml += `
            <li>
                <div class="stop-info">
                    <span class="stop-name">${stop.name}</span>
                    <span class="stop-dist">${(actualDistToDisplay).toFixed(2)} km away</span>
                </div>
                <span class="eta-time">${bestWeightedEta > 0 ? bestWeightedEta : '< 1'} min</span>
            </li>`;
    });

    return listHtml;
}