/**
 * v8.9 - Robust Multi-Jeep Queue Engine
 * tracker.js
 * Handles coordinate snapping, distance calculations, 
 * and loop-aware queue tracking for oncoming jeeps with safety guards.
 */

import { trafficZones, getTimeOfDayMultiplier } from './config.js';

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
export function getWeightedTravelTime(startIdx, endIdx, routePoints, currentJeepSpeed = 12) {
    let totalMinutes = 0;
    const len = routePoints.length;
    let i = startIdx;

    let baseSpeedKmh = Number(currentJeepSpeed) <= 0 ? 12 : Number(currentJeepSpeed);
    const globalTimeModifier = getTimeOfDayMultiplier(); // 🕒 Fetch temporal scale

    while (i !== endIdx) {
        const current = i;
        let next = (current + 1) % len;

        // 🔄 THE EXACT FIX YOU NEED HERE:
        // If the calculation loop reaches index 100, its physical next target is index 12.
        // This completely skips indices 0 to 11 during loop repetitions,
        // measuring only the direct distance from 100 to 12.
        if (current === 100) {
            next = 12; 
        }

        const d = getDistance(routePoints[current][0], routePoints[current][1], routePoints[next][0], routePoints[next][1]);
        
        // Find if this specific road interval has a localized geographic traffic bottleneck
        //const zone = trafficZones.find(z => current >= z.startIdx && current <= z.endIdx); //remove comment to bring back traffic zone multiplier

        // Compound calculation: Localized Structural Friction * Temporal Traffic Density
        //const activePenalty = zone ? (zone.basePenalty * globalTimeModifier) : globalTimeModifier; // remove comment to bring back time of day multiplier

        // 👇 HARDCODE THE MULTIPLIER TO 1.0 FOR OPEN-ROAD BASELINES: -> eto muna for testing today
        const activePenalty = 1.0;

        totalMinutes += (d / baseSpeedKmh) * 60 * activePenalty;
        
        i = next;
    }

    return totalMinutes;
}

/**
 * Compiles a sorted array of the next oncoming jeeps targeting a given stop.
 */
/**
 * Generates an ordered queue of active oncoming vehicles tracking toward a target commuter stop.
 * Filters out jeeps sitting idle at the terminal (index 0) but counts them once they begin moving (1-11).
 */
export function getOncomingQueueForStop(driversData, stop, routePoints) {
    if (!driversData) return [];
    
    const oncomingQueue = [];
    const stopSnapped = snapToRoute(stop.lat, stop.lng, routePoints);
    const stopIdx = stopSnapped.index;

    Object.keys(driversData).forEach(driverId => {
        const driver = driversData[driverId];
        const jeepSnapped = snapToRoute(driver.lat, driver.lng, routePoints);
        const jeepIdx = jeepSnapped.index;

        // 🛑 NEW TERMINAL IDLE FILTER:
        // Only skip the jeep if it is sitting exactly at index 0 (the terminal).
        // Once jeepIdx >= 1, it has started moving down the loading route, so count it!
        if (jeepIdx === 0) {
            return; // Continues to the next jeep in the loop
        }

        // Calculate logical index steps forward along the active circuit
        let stepsToStop = 0;
        let currentIdx = jeepIdx;

        while (currentIdx !== stopIdx) {
            stepsToStop++;
            currentIdx = (currentIdx + 1) % routePoints.length;
            
            // 🔄 THE LOOP TRAP:
            // When wrapping past index 100, force it to index 12 to bypass indices 0-11
            if (currentIdx === 0) {
                currentIdx = 12; 
            }
        }

        // Calculate travel duration minutes using our dynamic time engine
        const etaMinutes = Math.round(getWeightedTravelTime(jeepIdx, stopIdx, routePoints, driver.speed));

        oncomingQueue.push({
            id: driverId,
            speed: driver.speed,
            passengers: driver.passengers || 0,
            steps: stepsToStop,
            eta: etaMinutes
        });
    });

    // Sort queue ascending so the closest arriving vehicle is listed first
    return oncomingQueue.sort((a, b) => a.steps - b.steps);
}

/**
 * Identifies the driver's next immediate upcoming stop along the one-way loop
 * and calculates the ETA in minutes to reach it using our travel time engine.
 */
/**
 * Calculates the exact arrival details for the single nearest upcoming commuter stop
 * situated ahead of the driver's current coordinates.
 */
export function getNextStopETAForDriver(driverLat, driverLng, driverSpeed, stops, routePoints) {
    const snapped = snapToRoute(driverLat, driverLng, routePoints);
    const currentIdx = snapped.index;

    let closestStop = null;
    let minSteps = Infinity;
    let calculatedEta = 0;

    stops.forEach(stop => {
        const stopSnapped = snapToRoute(stop.lat, stop.lng, routePoints);
        const stopIdx = stopSnapped.index;

        let steps = 0;
        let checkIdx = currentIdx;

        while (checkIdx !== stopIdx) {
            steps++;
            checkIdx = (checkIdx + 1) % routePoints.length;
            
            // 🔄 THE LOOP TRAP:
            // Keeps the driver's upcoming stop trace trapped inside the active 
            // campus loop bounds (12 to 100) instead of bleeding back to index 0.
            if (checkIdx === 0) {
                checkIdx = 12; 
            }
        }

        // Find the stop requiring the lowest number of logical index steps forward
        if (steps < minSteps && steps > 0) {
            minSteps = steps;
            closestStop = stop;
            
            // Generate dynamic travel time explicitly for this driver's path segment
            calculatedEta = Math.round(getWeightedTravelTime(currentIdx, stopIdx, routePoints, driverSpeed));
        }
    });

    if (!closestStop) return null;

    return {
        stopName: closestStop.name,
        eta: calculatedEta > 0 ? `${calculatedEta} mins` : "< 1 min"
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

