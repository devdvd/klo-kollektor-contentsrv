// Einfacher Content Server ohne Express-Probleme
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3001;

// Content-Daten
const CONTENT_DATA = {
    version: "1.1.0",
    lastUpdated: new Date().toISOString(),
    updateAvailable: true,
    newContent: {
        title: {
            de: "Neue Winter-Edition verfügbar!",
            en: "New Winter Edition available!"
        },
        description: {
            de: "Weihnachtsmärkte und Skigebiete jetzt spielbar!",
            en: "Christmas markets and ski resorts now playable!"
        },
        icon: "❄️"
    },
    editions: {
        winter_special: {
            id: 'winter_special',
            name: 'Winter Special 2025',
            icon: '❄️',
            color: '#74b9ff',
            type: 'seasonal',
            free: true,
            available: true,
            locations: [
                {
                    id: 'weihnachtsmarkt_koeln',
                    name: {de: 'Kölner Weihnachtsmarkt', en: 'Cologne Christmas Market'},
                    flag: '🎄',
                    type: 'Weihnachtsmarkt',
                    bonus: 50
                },
                {
                    id: 'skigebiet_alpen',
                    name: {de: 'Alpen Skigebiet', en: 'Alpine Ski Resort'},
                    flag: '⛷️',
                    type: 'Skigebiet',
                    bonus: 100
                },
                {
                    id: 'eislaufbahn_muenchen',
                    name: {de: 'Münchner Eislaufbahn', en: 'Munich Ice Rink'},
                    flag: '⛸️',
                    type: 'Eislaufbahn'
                }
            ]
        },
        autobahn: {
            id: 'autobahn',
            name: 'Autobahn-Edition',
            icon: '🛣️',
            color: '#636e72',
            type: 'transport',
            free: true,
            available: true,
            locations: [
                {
                    id: 'raststaette_a1',
                    name: {de: 'Raststätte A1 Nord', en: 'A1 North Rest Stop'},
                    flag: '🚗',
                    type: 'Raststätte'
                },
                {
                    id: 'autohof_a7',
                    name: {de: 'Autohof A7', en: 'A7 Truck Stop'},
                    flag: '🚚',
                    type: 'Autohof'
                }
            ]
        },
        deutsche_staedte_premium: {
            id: 'deutsche_staedte_premium',
            name: 'Deutsche Städte Premium',
            icon: '🏙️',
            color: '#e74c3c',
            type: 'geographic_premium',
            free: false,
            price: 1.99,
            available: true,
            locations: [
                {
                    id: 'berlin_hackescher_markt',
                    name: {de: 'Berlin - Hackescher Markt', en: 'Berlin - Hackescher Markt'},
                    flag: '🏦',
                    type: 'Historisches Zentrum',
                    bonus: 75
                },
                {
                    id: 'muenchen_marienplatz',
                    name: {de: 'München - Marienplatz', en: 'Munich - Marienplatz'},
                    flag: '🍺',
                    type: 'Stadtzentrum',
                    bonus: 80
                },
                {
                    id: 'koeln_dom',
                    name: {de: 'Köln - Dom', en: 'Cologne - Cathedral'},
                    flag: '⛪',
                    type: 'Kathedrale',
                    bonus: 100
                },
                {
                    id: 'rothenburg_mittelalter',
                    name: {de: 'Rothenburg ob der Tauber', en: 'Rothenburg ob der Tauber'},
                    flag: '🏨',
                    type: 'Mittelalterliche Stadt',
                    bonus: 110
                }
            ]
        }
    }
};

// Detaillierte Edition-Daten
const EDITION_DETAILS = {
    winter_special: {
        id: "winter_special",
        name: {
            de: "Winter-Special",
            en: "Winter Special"
        },
        icon: "❄️",
        color: "#74b9ff",
        type: "seasonal",
        difficulty: 2,
        free: true,
        unlocked: true,
        locations: [
            {
                id: "weihnachtsmarkt_koeln",
                name: {de: "Kölner Weihnachtsmarkt", en: "Cologne Christmas Market"},
                flag: "🎄",
                type: "Weihnachtsmarkt",
                bonus: 50
            },
            {
                id: "skigebiet_alpen", 
                name: {de: "Alpen Skigebiet", en: "Alpine Ski Resort"},
                flag: "⛷️",
                type: "Skigebiet",
                bonus: 100
            },
            {
                id: "eislaufbahn_muenchen",
                name: {de: "Münchner Eislaufbahn", en: "Munich Ice Rink"},
                flag: "⛸️",
                type: "Eislaufbahn"
            }
        ]
    },
    autobahn: {
        id: "autobahn",
        name: {
            de: "Autobahn-Edition",
            en: "Highway Edition"
        },
        icon: "🛣️",
        color: "#636e72",
        type: "transport",
        difficulty: 2,
        free: true,
        unlocked: true,
        locations: [
            {
                id: "raststaette_a1",
                name: {de: "Raststätte A1 Nord", en: "A1 North Rest Stop"},
                flag: "🚗",
                type: "Raststätte"
            },
            {
                id: "autohof_a7",
                name: {de: "Autohof A7", en: "A7 Truck Stop"},
                flag: "🚚", 
                type: "Autohof"
            }
        ]
    },
    deutsche_staedte_premium: {
        id: "deutsche_staedte_premium",
        name: {
            de: "Deutsche Städte Premium",
            en: "German Cities Premium"
        },
        icon: "🏙️",
        color: "#e74c3c",
        type: "geographic_premium",
        difficulty: 3,
        free: false,
        price: 1.99,
        unlocked: true,
        locations: [
            {
                id: "berlin_hackescher_markt",
                name: {de: "Berlin - Hackescher Markt", en: "Berlin - Hackescher Markt"},
                flag: "🏦",
                type: "Historisches Zentrum",
                bonus: 75
            },
            {
                id: "muenchen_marienplatz",
                name: {de: "München - Marienplatz", en: "Munich - Marienplatz"},
                flag: "🍺",
                type: "Stadtzentrum",
                bonus: 80
            },
            {
                id: "hamburg_speicherstadt",
                name: {de: "Hamburg - Speicherstadt", en: "Hamburg - Speicherstadt"},
                flag: "🚢",
                type: "UNESCO Welterbe",
                bonus: 90
            },
            {
                id: "koeln_dom",
                name: {de: "Köln - Dom", en: "Cologne - Cathedral"},
                flag: "⛪",
                type: "Kathedrale",
                bonus: 100
            },
            {
                id: "dresden_frauenkirche",
                name: {de: "Dresden - Frauenkirche", en: "Dresden - Frauenkirche"},
                flag: "🏰",
                type: "Barocke Kirche",
                bonus: 85
            },
            {
                id: "heidelberg_schloss",
                name: {de: "Heidelberg - Schloss", en: "Heidelberg - Castle"},
                flag: "🏰",
                type: "Renaissance Schloss",
                bonus: 95
            },
            {
                id: "rothenburg_mittelalter",
                name: {de: "Rothenburg ob der Tauber", en: "Rothenburg ob der Tauber"},
                flag: "🏨",
                type: "Mittelalterliche Stadt",
                bonus: 110
            },
            {
                id: "luebeck_holstentor",
                name: {de: "Lübeck - Holstentor", en: "Lübeck - Holstentor"},
                flag: "🚨",
                type: "Stadttor",
                bonus: 88
            }
        ]
    }
};

// CORS Headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, Accept');
}

// JSON Response
function sendJsonResponse(res, data, statusCode = 200) {
    setCorsHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
}

// Server erstellen
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;
    
    console.log(`${method} ${pathname} - User-Agent: ${req.headers['user-agent'] || 'Unbekannt'}`);
    
    // CORS Preflight
    if (method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Routes
    if (pathname === '/health') {
        console.log('💓 Health Check');
        sendJsonResponse(res, {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            contentAvailable: true
        });
    }
    else if (pathname === '/test') {
        console.log('🧪 Test Route aufgerufen');
        sendJsonResponse(res, {
            message: 'Content-Server läuft!',
            timestamp: new Date().toISOString(),
            availableRoutes: [
                '/health',
                '/test', 
                '/content/check-updates',
                '/content/edition/:id'
            ]
        });
    }
    else if (pathname === '/content/check-updates') {
        console.log('🔍 Update-Check Request erhalten');
        console.log('📦 Sende Update-Response mit Editionen:', Object.keys(CONTENT_DATA.editions));
        sendJsonResponse(res, CONTENT_DATA);
    }
    else if (pathname.startsWith('/content/edition/')) {
        const editionId = pathname.split('/').pop();
        console.log(`📥 Edition angefragt: ${editionId}`);
        
        if (EDITION_DETAILS[editionId]) {
            console.log(`✅ Edition ${editionId} gefunden und gesendet`);
            sendJsonResponse(res, EDITION_DETAILS[editionId]);
        } else {
            console.log(`❌ Edition ${editionId} nicht gefunden`);
            sendJsonResponse(res, { error: 'Edition not found' }, 404);
        }
    }
    else {
        console.log(`❓ 404 - Route nicht gefunden: ${method} ${pathname}`);
        sendJsonResponse(res, { 
            error: 'Route not found',
            availableRoutes: ['/health', '/test', '/content/check-updates', '/content/edition/:id']
        }, 404);
    }
});

// Server starten
server.listen(PORT, () => {
    console.log(`🚀 Content Server läuft auf Port ${PORT}`);
    console.log(`🌐 Test-URL: http://localhost:${PORT}/test`);
    console.log(`🔍 Update-Check: http://localhost:${PORT}/content/check-updates`);
    console.log(`💓 Health-Check: http://localhost:${PORT}/health`);
    console.log(`📋 Verfügbare Editionen: ${Object.keys(CONTENT_DATA.editions).join(', ')}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('⏹️ Server wird beendet...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('⏹️ Server wird beendet (Ctrl+C)...');
    server.close(() => {
        process.exit(0);
    });
});