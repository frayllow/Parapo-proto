/**
 * v6.0
 * tracker.js - Multi-Vehicle Engine
 */

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

function calculatePathDistance(latA, lngA, idxA, latB, lngB, idxB, route) {
    let total = 0;
    if (idxA === idxB) return getDistance(latA, lngA, latB, lngB);
    total += getDistance(latA, lngA, route[idxA+1][0], route[idxA+1][1]);
    for (let i = idxA + 1; i < idxB; i++) {
        total += getDistance(route[i][0], route[i][1], route[i+1][0], route[i+1][1]);
    }
    total += getDistance(route[idxB][0], route[idxB][1], latB, lngB);
    return total;
}

export function snapToRoute(userLat, userLng, routePoints) {
    const idx = findNearestSegmentIndex([userLat, userLng], routePoints);
    return getNearestPointOnSegment([userLat, userLng], routePoints[idx], routePoints[idx+1]);
}

// NEW: Handles multiple drivers and picks the best ETA for each stop
export function updateStopListMultiple(driversObj, stopsArray, routePoints) {
    let listHtml = "";
    const speedKmh = 10;

    stopsArray.forEach(stop => {
        let bestDist = Infinity;
        let bestEta = Infinity;

        // Iterate through all jeeps in the Firebase 'drivers' node
        Object.keys(driversObj).forEach(id => {
            const jeep = driversObj[id];
            const snapped = snapToRoute(jeep.lat, jeep.lng, routePoints);
            const driverIdx = findNearestSegmentIndex(snapped, routePoints);
            const stopIdx = findNearestSegmentIndex([stop.lat, stop.lng], routePoints);
            
            let routeDist = 0;
            if (driverIdx <= stopIdx) {
                routeDist = calculatePathDistance(snapped[0], snapped[1], driverIdx, stop.lat, stop.lng, stopIdx, routePoints);
            } else {
                const distToEnd = calculatePathDistance(snapped[0], snapped[1], driverIdx, routePoints[routePoints.length-1][0], routePoints[routePoints.length-1][1], routePoints.length-1, routePoints);
                const distFromStart = calculatePathDistance(routePoints[0][0], routePoints[0][1], 0, stop.lat, stop.lng, stopIdx, routePoints);
                routeDist = distToEnd + distFromStart;
            }

            const currentEta = Math.round((routeDist / speedKmh) * 60);
            if (currentEta < bestEta) {
                bestEta = currentEta;
                bestDist = routeDist;
            }
        });

        listHtml += `
            <li>
                <div class="stop-info">
                    <span class="stop-name">${stop.name}</span>
                    <span class="stop-dist">${bestDist.toFixed(2)} km (Nearest)</span>
                </div>
                <span class="eta-time">${bestEta > 0 ? bestEta : '< 1'} min</span>
            </li>`;
    });

    return listHtml;
}