/**
 * map-ui.js
 * Handles all visual decorations on the Leaflet map.
 */

import { snapToRoute, getWeightedTravelTime } from './tracker.js';
import { ikotRoutePoints } from './config.js';

/**
 * Draws the route paths selectively. Splitting the array elements 
 * prevents continuous polylines from cutting across University Ave.
 */
export function drawRoute(map, routePoints, showTerminal = true) {
    
    // 1. If driving mode requires showing the Terminal/Loading point
    if (showTerminal) {
        // Points 1 to 3 -> Indices 0 to 2 are isolated right at the loading station area
        const terminalSlice = routePoints.slice(0, 3); 
        
        L.polyline(terminalSlice, {
            color: '#6c757d',    // Gray/Slate to represent terminal zone
            weight: 4,
            opacity: 0.8,
            dashArray: '5, 5'   // Dashed lane line layout
        }).addTo(map);
    }

    // 2. Map the actual operational Ikot Loop (Indices 12 to 100)
    // This explicitly leaves indices 3 to 11 unrendered, hiding the OTW path lines!
    const activeLoopSlice = routePoints.slice(12, 101);

    return L.polyline(activeLoopSlice, {
        color: '#7b1113', // Your signature UP Maroon
        weight: 4,
        opacity: 0.8,
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
        const stopMarker = L.circleMarker([stop.lat, stop.lng], {
            radius: 10,
            fillColor: '#7b1113', // UP Maroon
            color: '#ffffff',     // Crisp white border
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        }).addTo(map);

        // 👇 ADD THIS LINE TO ENABLE NAME LABELS ON HOVER:
        stopMarker.bindTooltip(stop.name, { direction: 'top', sticky: true });

       // Attach the click event listener right onto the marker instance
       // Dispatches the clicked stop data straight to your driver card UI instead of a popup
        stopMarker.on('click', function() {
            const event = new CustomEvent('stopSelectedByDriver', { detail: stop });
            window.dispatchEvent(event);
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

// Add these to the bottom of map-ui.js

/**
 * Creates a unique HTML/CSS template representing the Terminal Flag station.
 */
export function createTerminalIcon() {
    return L.divIcon({
        className: 'terminal-flag-marker',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="background-color: #ffcc00; color: #7b1113; font-weight: bold; font-size: 11px; padding: 3px 6px; border-radius: 4px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap;">
                    🏁 TERMINAL
                </div>
                <div style="width: 2px; height: 6px; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
            </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 27] // Anchors the pin accurately directly over the road coordinate
    });
}

/**
 * Draws the special Terminal icon precisely onto the map layout grid.
 */
export function drawTerminalFlag(map, routePoints) {
    // Index 0 corresponds exactly to Loading Point 1 in config.js
    const terminalLocation = routePoints[0];
    
    return L.marker(terminalLocation, { 
        icon: createTerminalIcon(),
        zIndexOffset: 1000 // Ensures the flag stays layered on top of route tracks
    }).addTo(map).bindPopup("<b>Univ Ave Jeep Terminal</b><br>Initial vehicle deployment & loading point.");
}
