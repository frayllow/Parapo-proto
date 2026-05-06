/**
 * location.js
 * Handles the user's personal GPS location logic.
 */

export function startUserTracking(map, userMarker) {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    // watchPosition automatically triggers whenever the user moves
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            // Move the user marker on the map
            if (userMarker) {
                userMarker.setLatLng([latitude, longitude]);
            }

            console.log(`User moved to: ${latitude}, ${longitude}`);
        },
        (error) => {
            console.error("User denied location or GPS error:", error.message);
        },
        options
    );

    return watchId;
}