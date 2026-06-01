/**
 * map-ui.js
 * Handles all visual decorations on the Leaflet map.
 */

import { snapToRoute, getWeightedTravelTime } from './tracker.js';
import { ikotRoutePoints } from './config.js';

export function drawRoute(map, routePoints) {
    return L.polyline(routePoints, {
        color: '#7b1113', // UP Maroon
        weight: 3,
        opacity: 0.5,
        dashArray: '5, 10'
    }).addTo(map);
}

/**
 * Draws the passenger stops onto the driver's map and attaches an
 * interactive live ETA popup calculator to each marker pin.
 */
export function drawStops(map, stops) {
    stops.forEach(stop => {
        // 1. Plot the standard stop marker pin onto the map layout
        const stopMarker = L.marker([stop.lat, stop.lng]).addTo(map);

        // 2. Attach the click event listener right onto the marker instance
        stopMarker.on('click', function() {
            let driverLat = 14.6549; // Standard map center fallback default
            let driverLng = 121.0652;
            let driverSpeed = 0;

            // Find the driver's custom marker instance on the map to extract live coordinates
            // This searches through Leaflet's internal map layers for your "YOU" marker
            map.eachLayer(layer => {
                // If the layer is a marker and its popup explicitly marks it as the driver
                if (layer instanceof L.Marker && layer.getPopup() && layer.getPopup().getContent() === "YOU") {
                    const loc = layer.getLatLng();
                    driverLat = loc.lat;
                    driverLng = loc.lng;
                }
            });

            // 3. Snap both positions to your track indices
            const driverSnapped = snapToRoute(driverLat, driverLng, ikotRoutePoints);
            const stopSnapped = snapToRoute(stop.lat, stop.lng, ikotRoutePoints);
            
            // 4. Calculate live segment-by-segment minutes
            const rawMinutes = getWeightedTravelTime(driverSnapped.index, stopSnapped.index, ikotRoutePoints, driverSpeed);
            
            // 5. Apply time-of-day multipliers matching peak constraints
            const hour = new Date().getHours();
            let timeMultiplier = 1.0;
            if (hour >= 7 && hour <= 9) timeMultiplier = 1.4; // Morning peak
            if (hour >= 16 && hour <= 19) timeMultiplier = 1.6; // Afternoon peak
            const finalEta = Math.round(rawMinutes * timeMultiplier);

            // 6. Hardcoded space left open for your upcoming passenger toggle interactions
            const passengersWaitingHere = 0;

            // 7. FIX: Create and open a dynamic popup on the fly instead of binding it permanently!
            L.popup()
                .setLatLng([stop.lat, stop.lng])
                .setContent(`
                    <div style="font-family: sans-serif; padding: 4px; min-width: 175px; color: #1a1a1a;">
                        <h4 style="margin: 0 0 4px 0; color: #800000; font-size: 14px;">${stop.name}</h4>
                        <hr style="border: 0; border-top: 1px solid #ddd; margin: 4px 0;">
                        
                        <p style="margin: 4px 0; font-size: 13px;">
                            <strong>⏱️ Your ETA:</strong> 
                            <span style="color: #2e7d32; font-weight: bold;">
                                ${finalEta > 0 ? `${finalEta} min` : "< 1 min"}
                            </span>
                        </p>
                        
                        <p style="margin: 4px 0; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                            <span><strong>🙋 Waiting:</strong></span>
                            <span style="background: #757575; color: white; padding: 1px 6px; border-radius: 10px; font-size: 11px; font-weight: bold;">
                                ${passengersWaitingHere}
                            </span>
                        </p>
                    </div>
                `)
                .openOn(map); // Using openOn(map) automatically closes any other open popups safely!
        });
    });
}

export function createUserIcon() {
    return L.divIcon({
        className: 'user-marker',
        html: `<div style='background-color:#007bff; width:12px; height:12px; border-radius:50%; border:3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);'></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
}

export function createJeepIcon(color = '#7b1113') {
    return L.divIcon({
        className: 'jeep-icon',
        html: `<div style='background-color:${color}; color:white; border-radius:50%; width:24px; height:24px; text-align:center; line-height:24px; font-size:12px; font-weight:bold; border:2px solid white;'>J</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
}
