/**
 * map-ui.js
 * Handles all visual decorations on the Leaflet map.
 */

export function drawRoute(map, routePoints) {
    return L.polyline(routePoints, {
        color: '#7b1113', // UP Maroon
        weight: 3,
        opacity: 0.5,
        dashArray: '5, 10'
    }).addTo(map);
}

export function drawStops(map, stops) {
    stops.forEach(stop => {
        // 1. Draw the blue circle for the "Sakayan"
        const marker = L.circle([stop.lat, stop.lng], {
            color: '#0056b3',
            fillColor: '#007bff',
            fillOpacity: 0.4,
            radius: 20
        }).addTo(map);

        // 2. Add the permanent Label (Tooltip)
        // 2. Change Tooltip to Popup
        // This makes the label hidden until the user clicks the circle
        marker.bindPopup(`<b>${stop.name}</b>`);
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
