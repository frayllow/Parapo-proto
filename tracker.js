/**
 * v8.6 - Optimized Multi-Jeep Queue Engine
 * tracker.js
 * Handles coordinate snapping, distance calculations, 
 * and loop-aware queue tracking for the next 3 oncoming jeeps.
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
 * Calculates total route path distance with dynamic wrap-around logic,
 * multiplying segment distances by traffic penalties.
 */
export function getWeightedPathDistance(startIdx, endIdx, routePoints) {
    let weightedTotal = 0;
    const len = routePoints.length;
    let i = startIdx;

    // Traverse index-by-index until we reach the destination stop
    while (i % len !== endIdx) {
        const current = i % len;
        const next = (i + 1) % len;

        const d = getDistance(
            routePoints[current][0], routePoints[current][1],
            routePoints[next][0], routePoints[next][1]
        );

        // Apply penalty if the current segment falls inside an active traffic zone
        const zone = trafficZones.find(z => current >= z.startIdx && current <= z.endIdx);
        const penalty = zone ? zone.penalty : 1.0;

        weightedTotal += (d * penalty);
        i++;
    }

    return weightedTotal;
}

/**
 * Compiles a sorted array of the next oncoming jeeps targeting a given stop.
 * Returns up to 3 active vehicles with their loop-aware ETE and BLE passenger counts.
 */
export function getOncomingQueueForStop(driversObj, stop, routePoints) {
    const baseSpeed = 12; // Average speed in km/h
    const hour = new Date().getHours();
    
    let timeMultiplier = 1.0;
    if (hour >= 7 && hour <= 9) timeMultiplier = 1.4; // Morning peak
    if (hour >= 16 && hour <= 19) timeMultiplier = 1.6; // Afternoon peak

    const now = Date.now();
    const stopSnapped = snapToRoute(stop.lat, stop.lng, routePoints);
    const sIdx = stopSnapped.index;

    const queue = Object.entries(driversObj)
        .filter(([_, jeep]) => (now - (jeep.lastSeen || 0)) <= 60000) // Active only
        .map(([id, jeep]) => {
            const jeepSnapped = snapToRoute(jeep.lat, jeep.lng, routePoints);
            const jIdx = jeepSnapped.index;

            const weightedDist = getWeightedPathDistance(jIdx, sIdx, routePoints);
            const rawDist = getDistance(jeep.lat, jeep.lng, stop.lat, stop.lng);

            // Compute math
            const eta = Math.round(((weightedDist / baseSpeed) * 60) * timeMultiplier);

            return {
                id,
                eta: eta > 0 ? eta : 0,
                passengers: jeep.passengers || 0,
                speed: jeep.speed || 0,
                distance: rawDist
            };
        });

    // Sort queue by ETA ascending (earliest arrival first)
    return queue.sort((a, b) => a.eta - b.eta).slice(0, 3);
}

/**
 * Updates the UI list by finding the nearest jeep for every stop
 * and calculating the loop-aware weighted ETA.
 */
export function updateStopListMultiple(driversObj, stopsArray, routePoints) {
    let listHtml = "";

    stopsArray.forEach(stop => {
        const oncomingQueue = getOncomingQueueForStop(driversObj, stop, routePoints);

        if (oncomingQueue.length === 0) {
            listHtml += `
                <li class="clickable-stop" data-stop-name="${stop.name}" data-stop-lat="${stop.lat}" data-stop-lng="${stop.lng}">
                    <div class="stop-info">
                        <span class="stop-name">${stop.name}</span>
                        <span class="stop-dist" style="color: #888;">No active jeeps tracking</span>
                    </div>
                    <span class="eta-time" style="background: #555;">-- mins</span>
                </li>`;
            return;
        }

        const nextJeep = oncomingQueue[0];
        const displayEta = nextJeep.eta > 0 ? `${nextJeep.eta} min` : `< 1 min`;

        // Display how many other jeeps are trailing behind in the tooltip summary
        const alternativeCount = oncomingQueue.length - 1;
        const alternativeSummary = alternativeCount > 0 
            ? ` • +${alternativeCount} trailing jeep(s)` 
            : ` • Only ride on route`;

        listHtml += `
            <li class="clickable-stop" data-stop-name="${stop.name}" data-stop-lat="${stop.lat}" data-stop-lng="${stop.lng}">
                <div class="stop-info">
                    <span class="stop-name">${stop.name}</span>
                    <span class="stop-dist">
                        Next: <b style="color: #ffcc00;">${nextJeep.id}</b> (${nextJeep.passengers} pax)${alternativeSummary}
                    </span>
                </div>
                <span class="eta-time">${displayEta}</span>
            </li>`;
    });

    return listHtml;
}