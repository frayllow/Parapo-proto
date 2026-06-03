// config.js
export const firebaseConfig = {
    apiKey: "AIzaSyDnfZ2xTSC1oCc2REyjRzQ8f5NAejHtJiI",
    authDomain: "parapo-proto.firebaseapp.com",
    databaseURL: "https://parapo-proto-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "parapo-proto",
    storageBucket: "parapo-proto.firebasestorage.app",
    messagingSenderId: "561177127937",
    appId: "1:561177127937:web:17389e46ae0713c7906400"
};

// config.js

// config.js

export const ikotRouteConfig = {
    loadingStartIdx: 0,   // Corresponds to Point 1 (Index 0)
    loadingEndIdx: 11,    // Corresponds to Point 12 (Index 11)
    loopStartIdx: 12,     // Corresponds to Point 13 (Index 12)
    loopEndIdx: 100       // Corresponds to Point 101 (Index 100)
};

export const ikotRoutePoints = [
    // 🚛 ACTUAL LOADING ROUTE (Points 1 to 12 -> Array Indices 0 to 11) 
    /* 00 */ [14.6540479, 121.0543074], // Loading Point 1 
    /* 01 */ [14.6539602, 121.0545922], // 025 
    /* 02 */ [14.6541747, 121.0547988], // 024 
    /* 03 */ [14.6543385, 121.0549097], // Loading Point x Univ Ave 
    /* 04 */ [14.6545060, 121.0556635], // 023 
    /* 05 */ [14.6546423, 121.0564250], // 022 
    /* 06 */ [14.6547049, 121.0569195], // 021 
    /* 07 */ [14.6547299, 121.0583306], // Univ Ave Traffic Light B 
    /* 08 */ [14.6547517, 121.0585437], // 020 
    /* 09 */ [14.6547735, 121.0607087], // 019 
    /* 10 */ [14.6547939, 121.0620287], // UPD Checkpoint 
    /* 11 */ [14.6548036, 121.0623341], // Univ Ave Turn 

    // 🏁 ACTUAL ACTIVE IKOT LOOP (Points 13 to 101 -> Array Indices 12 to 100) 
    /* 12 */ [14.6546675, 121.0623341], // 13: Univ Ave Enter Right 
    /* 13 */ [14.6537530, 121.0623331], // 14: 018 
    /* 14 */ [14.6528907, 121.0623300], // 15: UPLB P2P bus 
    /* 15 */ [14.6521566, 121.0623293], // 16: UP College of Fine Arts 
    /* 16 */ [14.6510952, 121.0623299], // 17: Mang Larry's 
    /* 17 */ [14.6503075, 121.0623278], // 18: Village B 
    /* 18 */ [14.6496019, 121.0623254], // 19: E Jacinto x Plaza Hernandi 
    /* 19 */ [14.6486247, 121.0623207], // 20: Kamagong RH 
    /* 20 */ [14.6478707, 121.0623217], // 21: Centennial RH Waiting Shed 
    /* 21 */ [14.6474998, 121.0623201], // 22: Near Centennial RH Gate 
    /* 22 */ [14.6473461, 121.0623326], // 23: KNL Arko Traffic Light 
    /* 23 */ [14.6473913, 121.0625265], // 24: KNL Arko 
    /* 24 */ [14.6476542, 121.0636286], // 25: 017 
    /* 25 */ [14.6476994, 121.0640551], // 26: KNL Minute Burger 
    /* 26 */ [14.6476797, 121.0643627], // 27: Maong's Grill 
    /* 27 */ [14.6476845, 121.0646569], // 28: V. Manansala x CP Garcia 
    /* 28 */ [14.6477501, 121.0651842], // 29: 016 
    /* 29 */ [14.6477926, 121.0653659], // 30: UP Diliman Health Center 
    /* 30 */ [14.6479615, 121.0657828], // 31: Pook Amorsolo Branch Lib 
    /* 31 */ [14.6479851, 121.0659183], // 32: Institute of Civil Engg Gate 
    /* 32 */ [14.6479749, 121.0661467], // 33: 015 
    /* 33 */ [14.6479127, 121.0664089], // 34: Near Department of Chem 
    /* 34 */ [14.6472483, 121.0678727], // 35: Aguinalox CP Garcia 
    /* 35 */ [14.6472078, 121.0680380], // 36: Near Office for Initiatives 
    /* 36 */ [14.6472004, 121.0688178], // 37: CP Garcia Traffic Light 
    /* 37 */ [14.6472051, 121.0689673], // 38: Near CP Garcia Gate 
    /* 38 */ [14.6476680, 121.0689714], // 39: 014 
    /* 39 */ [14.6480908, 121.0689740], // 40: 013 
    /* 40 */ [14.6485077, 121.0689799], // 41: NIGS 
    /* 41 */ [14.6488482, 121.0689778], // 42: 012 
    /* 42 */ [14.6489671, 121.0689639], // 43: NIGS x CS Lib Waiting Shed 
    /* 43 */ [14.6491225, 121.0689091], // 44: College of Science Library 
    /* 44 */ [14.6498488, 121.0686173], // 45: EEEI Waiting Shed 
    /* 45 */ [14.6500408, 121.0685437], // 46: 011 
    /* 46 */ [14.6503153, 121.0684620], // 47: 010 
    /* 47 */ [14.6505528, 121.0684227], // 48: Marine Science Institute 
    /* 48 */ [14.6508503, 121.0683997], // 49: 009 
    /* 49 */ [14.6522545, 121.0686237], // 50: 008 
    /* 50 */ [14.6524904, 121.0686418], // 51: Quirino x Velasquez 
    /* 51 */ [14.6524917, 121.0688531], // 52: NSRI Sakayan 
    /* 52 */ [14.6524997, 121.0693800], // 53: Palma Hall Pav 2 Back Ent 
    /* 53 */ [14.6525194, 121.0708166], // 54: Kamia RH WS 
    /* 54 */ [14.6525373, 121.0716925], // 55: 007 
    /* 55 */ [14.6526549, 121.0716007], // 56: Near UPIS Sakayan 
    /* 56 */ [14.6539186, 121.0716682], // 57: Near Eduk 
    /* 57 */ [14.6539385, 121.0727096], // 58: 006 
    /* 58 */ [14.6540193, 121.0728310], // 59: 005 
    /* 59 */ [14.6542070, 121.0729380], // 60: Vinzons UP Ikot Waiting Shed 
    /* 60 */ [14.6546030, 121.0731168], // 61: Vinzons Food Kiosks 
    /* 61 */ [14.6550804, 121.0731017], // 62: UP Sunken Grand Stand 
    /* 62 */ [14.6555479, 121.0731018], // 63: 004 
    /* 63 */ [14.6557519, 121.0730741], // 64: 003 
    /* 64 */ [14.6558971, 121.0729783], // 65: School of Econ Waiting Shed 
    /* 65 */ [14.6561619, 121.0727550], // 66: UP School of Econ Turn 
    /* 66 */ [14.6564882, 121.0727566], // 67: Arellano St. Intersection 
    /* 67 */ [14.6569921, 121.0727454], // 68: Near Romulo Hall 
    /* 68 */ [14.6574770, 121.0727436], // 69: GT Waiting Shed 
    /* 69 */ [14.6579717, 121.0727352], // 70: UP International Center 
    /* 70 */ [14.6586635, 121.0727315], // 71: 002 
    /* 71 */ [14.6591056, 121.0727347], // 72: Ilang RH Waiting Shed 
    /* 72 */ [14.6594534, 121.0727160], // 73: Ilang RH turn 
    /* 73 */ [14.6594499, 121.0722259], // 74: Christian Child Care Center 
    /* 74 */ [14.6594488, 121.0717677], // 75: Atencio Libunao Waiting Shed 
    /* 75 */ [14.6594413, 121.0711561], // 76: UP Health Service 
    /* 76 */ [14.6594381, 121.0706214], // 77: Parish of the Holy Sacrifice 
    /* 77 */ [14.6594360, 121.0702963], // 78: Near Cash Office Waiting Shed 
    /* 78 */ [14.6594293, 121.0696741], // 79: DiliMall 
    /* 79 */ [14.6594291, 121.0688453], // 80: Near Area 2 Waiting Shed 
    /* 80 */ [14.6594191, 121.0685440], // 81: Area 2 Liko 
    /* 81 */ [14.6588552, 121.0685393], // 82: Kalayaan Residence Hall 
    /* 82 */ [14.6580838, 121.0685615], // 83: Near Yakal 
    /* 83 */ [14.6576041, 121.0685619], // 84: Near Melchor WS 
    /* 84 */ [14.6575577, 121.0685626], // 85: Melchor Intersection 
    /* 85 */ [14.6575574, 121.0683403], // 86: IBG-KAL 
    /* 86 */ [14.6575594, 121.0679617], // 87: Molave Residence Hall 
    /* 87 */ [14.6575611, 121.0671024], // 88: UP Film Institute 
    /* 88 */ [14.6575656, 121.0666964], // 89: Bahay ng Alumni 
    /* 89 */ [14.6575730, 121.0657742], // 90: University Theatre 
    /* 90 */ [14.6575764, 121.0650027], // 91: Ylanan Waiting Shed 
    /* 91 */ [14.6576149, 121.0643013], // 92: UP College of Mass Comm 
    /* 92 */ [14.6576622, 121.0638763], // 93: College of Social Work 
    /* 93 */ [14.6576913, 121.0630639], // 94: Near UP Swimming Pool 
    /* 94 */ [14.6576954, 121.0625991], // 95: Near UP Arena 
    /* 95 */ [14.6576872, 121.0623611], // 96: E Jacinto & Magsaysay Int 
    /* 96 */ [14.6570646, 121.0623555], // 97: UP SOLAIR 
    /* 97 */ [14.6568292, 121.0623472], // 98: SURP 
    /* 98 */ [14.6566105, 121.0623402], // 99: Institute for Small Scale Inc 
    /* 99 */ [14.6558528, 121.0623385], // 100: 001 
    /* 100*/ [14.6552026, 121.0623275]  // 101: Univ Ave Jeep Terminal boundary loop closure 
];

// Dedicated Designated Passenger Loading Stops
export const stops = [
    { name: "UP College of Fine Arts",          lat: 14.6521566, lng: 121.0623293 },
    { name: "Centennial RH Waiting Shed",      lat: 14.6478707, lng: 121.0623217 },
    { name: "KNL Arko",                        lat: 14.6473913, lng: 121.0625265 },
    { name: "Maong's Grill",                   lat: 14.6476797, lng: 121.0643627 },
    { name: "NIGS x CS Lib Waiting Shed",      lat: 14.6489671, lng: 121.0689639 },
    { name: "EEEI Waiting Shed",               lat: 14.6498488, lng: 121.0686173 },
    { name: "NSRI Sakayan",                    lat: 14.6524917, lng: 121.0688531 },
    { name: "Kamia RH WS",                     lat: 14.6525194, lng: 121.0708166 },
    { name: "Near UPIS Sakayan",               lat: 14.6526549, lng: 121.0716907 },
    { name: "Vinzon's UP Ikot Waiting Shed",   lat: 14.6542070, lng: 121.0729380 },
    { name: "School of Econ Waiting Shed",     lat: 14.6558971, lng: 121.0729783 },
    { name: "GT Waiting Shed",                 lat: 14.6574770, lng: 121.0727436 },
    { name: "Ilang RH Waiting Shed",           lat: 14.6591056, lng: 121.0727347 },
    { name: "Atencio Libunao Waiting Shed",    lat: 14.6594488, lng: 121.0717677 },
    { name: "Near Cash Office Waiting Shed",   lat: 14.6594360, lng: 121.0702963 },
    { name: "Near Area 2 Waiting Shed",        lat: 14.6594291, lng: 121.0688453 },
    { name: "Ylanan Waiting Shed",             lat: 14.6575764, lng: 121.0650027 },
    { name: "Univ Ave Jeep Terminal",          lat: 14.6552026, lng: 121.0623275 }
];

// note: need ko pa to iconfirm
export const trafficZones = [
    { 
        name: "Philcoa/Univ Ave Entry Node", 
        startIdx: 0, 
        endIdx: 4, 
        basePenalty: 1.4,
        type: "entry" // Highly active during morning check-ins
    },
    { 
        name: "KNL Arko - CP Garcia Bottleneck", 
        startIdx: 21, 
        endIdx: 27,   
        basePenalty: 1.8,
        type: "peripheral" // Influenced heavily by external city rush hour traffic
    },
    { 
        name: "Engineering - Science Complex (Melchor/EEEI/CS Lib)", 
        startIdx: 39, 
        endIdx: 45,   
        basePenalty: 1.5,
        type: "academic" // Heavy pedestrian delays during class change over intervals
    },
    { 
        name: "GT-Vinzons Student Hub", 
        startIdx: 59, 
        endIdx: 64,   
        basePenalty: 1.6,
        type: "academic" // Active during lunch hours and afternoon breaks
    }
];

/**
 * Determines the global campus traffic multiplier based on the time of day.
 * Models real student commute habits and class shifts at UPD.
 */
export function getTimeOfDayMultiplier() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Weekends are generally clear unless there is a special campus event (e.g., Lantern Parade, UAAP)
    if (day === 0 || day === 6) return 1.0;

    // 🌅 Morning Rush (7:30 AM - 9:00 AM): High entry traffic via Univ Ave / Philcoa
    if (hour >= 7 && hour < 9) return 1.6;

    // 🍱 Lunch Break & Midday Shift (11:30 AM - 1:30 PM): Inter-building travel (Area 2 / Shopping Center areas)
    if (hour >= 11 && hour < 13) return 1.4;

    // 🌇 Afternoon Class Dismissals & Rush Hour (4:30 PM - 6:30 PM)
    if (hour >= 16 && hour < 19) {
        // Friday rush hour is notably worse due to weekend exit traffic
        return day === 5 ? 2.0 : 1.7;
    }

    // 🌙 Nighttime / Off-Peak hours
    return 1.0;
}