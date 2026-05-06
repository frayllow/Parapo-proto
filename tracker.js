/**
 * v5.0
 * tracker.js - Path-Based Transit Engine
 */

// --- INTERNAL HELPERS ---

export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getNearestPointOnSegment(p, a, b) {
    const atob = [b[0] - a[0], b[1] - a[1]];
    const atop = [p[0] - a[0], p[1] - a[1]];
    const len = atob[0] * atob[0] + atob[1] * atob[1];
    let dot = atop[0] * atob[0] + atop[1] * atob[1];
    const t = Math.min(1, Math.max(0, dot / (len || 1)));
    return [a[0] + atob[0] * t, a[1] + atob[1] * t];
}

// Finds which segment index (0 to N) the point is currently on
function findNearestSegmentIndex(p, routePoints) {
    let minD = Infinity;
    let index = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
        const closest = getNearestPointOnSegment(p, routePoints[i], routePoints[i+1]);
        const d = Math.pow(p[0]-closest[0], 2) + Math.pow(p[1]-closest[1], 2);
        if (d < minD) { minD = d; index = i; }
    }
    return index;
}

// Calculates distance following the road segments
function calculatePathDistance(latA, lngA, idxA, latB, lngB, idxB, route) {
    let total = 0;
    // If on same segment, just straight line
    if (idxA === idxB) return getDistance(latA, lngA, latB, lngB);
    
    // 1. Distance to end of first segment
    total += getDistance(latA, lngA, route[idxA+1][0], route[idxA+1][1]);
    
    // 2. Full segments in between
    for (let i = idxA + 1; i < idxB; i++) {
        total += getDistance(route[i][0], route[i][1], route[i+1][0], route[i+1][1]);
    }
    
    // 3. Distance from start of last segment to target
    total += getDistance(route[idxB][0], route[idxB][1], latB, lngB);
    return total;
}

// --- EXPORTED FUNCTIONS ---

export function snapToRoute(userLat, userLng, routePoints) {
    const idx = findNearestSegmentIndex([userLat, userLng], routePoints);
    return getNearestPointOnSegment([userLat, userLng], routePoints[idx], routePoints[idx+1]);
}

export function updateStopList(driverLat, driverLng, stopsArray, routePoints) {
    let listHtml = "";
    const speedKmh = 10; // Reduced for campus stop-and-go traffic
    const driverIdx = findNearestSegmentIndex([driverLat, driverLng], routePoints);
    const debugData = [];

    stopsArray.forEach(stop => {
        const stopIdx = findNearestSegmentIndex([stop.lat, stop.lng], routePoints);
        let routeDist = 0;

        // ONE-WAY LOGIC: Check if stop is ahead or behind
        if (driverIdx <= stopIdx) {
            // Stop is ahead in the array
            routeDist = calculatePathDistance(driverLat, driverLng, driverIdx, stop.lat, stop.lng, stopIdx, routePoints);
        } else {
            // Stop is behind; must loop through the end back to the start
            const distToEnd = calculatePathDistance(driverLat, driverLng, driverIdx, routePoints[routePoints.length-1][0], routePoints[routePoints.length-1][1], routePoints.length-1, routePoints);
            const distFromStart = calculatePathDistance(routePoints[0][0], routePoints[0][1], 0, stop.lat, stop.lng, stopIdx, routePoints);
            routeDist = distToEnd + distFromStart;
        }

        const etaMinutes = Math.round((routeDist / speedKmh) * 60);
        debugData.push({ Stop: stop.name, Distance_KM: routeDist.toFixed(3), ETA_Mins: etaMinutes });

        listHtml += `
            <li>
                <div class="stop-info">
                    <span class="stop-name">${stop.name}</span>
                    <span class="stop-dist">${routeDist.toFixed(2)} km away</span>
                </div>
                <span class="eta-time">${etaMinutes > 0 ? etaMinutes : '< 1'} min</span>
            </li>`;
    });

    console.clear();
    console.table(debugData); // View this in F12 Console
    return listHtml;
}