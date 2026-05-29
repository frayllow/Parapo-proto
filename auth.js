/**
 * ParaPo Identity Manager
 * Handles anonymous session IDs for both Drivers and Passengers.
 */

export function getSessionId(role) {
    // We prefix the ID by role to make it easy to identify in Firebase (e.g., "driver_123" or "passenger_456")
    const storageKey = `parapo_${role}_id`;
    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
        // Generate a 3-digit random number for the demo
        const randomNum = Math.floor(Math.random() * 900) + 100;
        sessionId = `${role}_${randomNum}`;
        localStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
}

/**
 * Utility to clear the session if a user wants to "Reset" their identity
 */
export function resetSession(role) {
    localStorage.removeItem(`parapo_${role}_id`);
    location.reload();
}