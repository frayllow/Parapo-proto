/**
 * v8.9 - Robust Multi-Jeep Queue Engine
 * tracker.js
 * Handles coordinate snapping, distance calculations, 
 * and loop-aware queue tracking for oncoming jeeps with safety guards.
 */

import { trafficZones } from './config.js';

/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 */
export function getDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
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
 */
export function snapToRoute(userLat, userLng, routePoints) {
    let minD = Infinity;
    let closestPoint = routePoints[0];
    let closestIdx = 0;

    // Safety fallback for empty/invalid coordinates
    if (userLat === undefined || userLng === undefined || isNaN(userLat) || isNaN(userLng)) {
        return { point: routePoints[0], index: 0 };
    }

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
 * Calculates total route path distance with dynamic wrap-around logic,
 * multiplying segment distances by traffic penalties.
 */
/**
 * Calculates total travel time in minutes segment-by-segment,
 * factoring in a jeep's current speed and traffic penalties.
 */
export function getWeightedTravelTime(startIdx, endIdx, routePoints, currentJeepSpeed = 12) {
    let totalMinutes = 0;
    const len = routePoints.length;
    let i = startIdx;

    // Standard baseline check: Fallback to  km/h if speed is zero, text, or negative
    let baseSpeedKmh = Number(currentJeepSpeed);
    if (isNaN(baseSpeedKmh) || baseSpeedKmh <= 0) {
        baseSpeedKmh = 6; 
    }

    while (i % len !== endIdx) {
        const current = i % len;
        const next = (i + 1) % len;

        const d = getDistance(
            routePoints[current][0], routePoints[current][1],
            routePoints[next][0], routePoints[next][1]
        );

        const zone = trafficZones.find(z => current >= z.startIdx && current <= z.endIdx);
        const penalty = zone ? zone.penalty : 1.0;

        // Time (hours) = Distance / Speed. Multiply by 60 for minutes, then apply penalty factor.
        const segmentTimeMinutes = (d / baseSpeedKmh) * 60 * penalty;
        
        totalMinutes += segmentTimeMinutes;
        i++;
    }

    return totalMinutes; // This function now returns total travel minutes directly!
}

/**
 * Compiles a sorted array of the next oncoming jeeps targeting a given stop.
 */
/**
 * Compiles a sorted array of the next oncoming jeeps targeting a given stop.
 */
export function getOncomingQueueForStop(driversObj, stop, routePoints) {
    const hour = new Date().getHours();
    
    let timeMultiplier = 1.0;
    if (hour >= 7 && hour <= 9) timeMultiplier = 1.4; // Morning peak
    if (hour >= 16 && hour <= 19) timeMultiplier = 1.6; // Afternoon peak

    const now = Date.now();
    const stopSnapped = snapToRoute(stop.lat, stop.lng, routePoints);
    const sIdx = stopSnapped.index;

    const queue = Object.entries(driversObj)
        .filter(([_, jeep]) => {
            // Strict Activity Guard: must have coordinates and a valid recent timestamp
            if (!jeep || jeep.lat === undefined || jeep.lng === undefined) return false;
            const lastSeen = Number(jeep.lastSeen);
            if (isNaN(lastSeen)) return false;
            return (now - lastSeen) <= 120000; // Heartbeat check
        })
        .map(([id, jeep]) => {
            const jeepSnapped = snapToRoute(jeep.lat, jeep.lng, routePoints);
            const jIdx = jeepSnapped.index;

            // 💡 NEW DROPPED-IN LOGIC:
            // Passes live speed into the function, which returns total travel minutes directly.
            const travelTimeMinutes = getWeightedTravelTime(jIdx, sIdx, routePoints, jeep.speed);
            
            // Apply peak time-of-day multipliers and round to clean integers
            const finalEta = Math.round(travelTimeMinutes * timeMultiplier);
            const rawDist = getDistance(jeep.lat, jeep.lng, stop.lat, stop.lng);

            return {
                id,
                eta: finalEta > 0 ? finalEta : 0,
                passengers: jeep.passengers || 0,
                speed: jeep.speed || 0,
                distance: rawDist
            };
        });

    return queue.sort((a, b) => a.eta - b.eta).slice(0, 3);
}

/**
 * Identifies the driver's next immediate upcoming stop along the one-way loop
 * and calculates the ETA in minutes to reach it using our travel time engine.
 */
export function getNextStopETAForDriver(driverLat, driverLng, stopsArray, routePoints, driverSpeed = 12) {
    if (driverLat === undefined || driverLng === undefined || !stopsArray.length) {
        return { name: "Unknown", eta: "--" };
    }

    const driverSnapped = snapToRoute(driverLat, driverLng, routePoints);
    const dIdx = driverSnapped.index;

    let closestStop = null;
    let minTimeCalculated = Infinity;

    // Time-of-day peak penalty multiplier context
    const hour = new Date().getHours();
    let timeMultiplier = 1.0;
    if (hour >= 7 && hour <= 9) timeMultiplier = 1.4; // Morning peak
    if (hour >= 16 && hour <= 19) timeMultiplier = 1.6; // Afternoon peak

    stopsArray.forEach(stop => {
        const stopSnapped = snapToRoute(stop.lat, stop.lng, routePoints);
        const sIdx = stopSnapped.index;

        // 💡 UPDATED LOGIC:
        // Pass the driver's live speed into the function. It returns travel time in minutes directly,
        // factoring in any segment-by-segment traffic penalties along the way!
        const travelTimeMinutes = getWeightedTravelTime(dIdx, sIdx, routePoints, driverSpeed);

        // We find the stop with the smallest forward travel time. If travelTimeMinutes is near 0, 
        // the driver is right at that stop, so we find the next upcoming stop to prevent target-lock.
        if (travelTimeMinutes > 0.05 && travelTimeMinutes < minTimeCalculated) {
            minTimeCalculated = travelTimeMinutes;
            closestStop = stop;
        }
    });

    if (!closestStop) return { name: "Terminal", eta: "--" };

    // Apply peak-hour time multiplier to the pre-calculated travel minutes
    const finalEta = Math.round(minTimeCalculated * timeMultiplier);

    return {
        name: closestStop.name,
        eta: finalEta > 0 ? `${finalEta} min` : "< 1 min"
    };
}

/**
 * Updates the UI list by tracking multiple oncoming jeep assets
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