// Content Server - Backend für Klo-Kollektor
// server.js

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Content-Verzeichnis
const CONTENT_DIR = path.join(__dirname, 'content');
const METADATA_FILE = path.join(CONTENT_DIR, 'metadata.json');

// Stelle sicher, dass Content-Verzeichnis existiert
async function ensureContentDir() {
    try {
        await fs.access(CONTENT_DIR);
    } catch {
        await fs.mkdir(CONTENT_DIR, { recursive: true });
    }
}

// Lade Metadaten
async function loadMetadata() {
    try {
        const data = await fs.readFile(METADATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        console.log('📁 Fallback Metadaten werden verwendet');
        return {
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
            }
        };
    }
}

// Routes

// Update-Check - HAUPTROUTE
app.get('/content/check-updates', async (req, res) => {
    try {
        console.log('🔍 Update-Check Request erhalten von:', req.get('User-Agent'));
        
        const response = {
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
                            type: {de: 'Weihnachtsmarkt', en: 'Christmas Market'},
                            bonus: 50
                        },
                        {
                            id: 'skigebiet_alpen',
                            name: {de: 'Alpen Skigebiet', en: 'Alpine Ski Resort'},
                            flag: '⛷️',
                            type: {de: 'Skigebiet', en: 'Ski Resort'},
                            bonus: 100
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
                    locations: [
                        {
                            id: 'raststaette_a1',
                            name: {de: 'Raststätte A1 Nord', en: 'A1 North Rest Stop'},
                            flag: '🚗',
                            type: {de: 'Raststätte', en: 'Rest Stop'}
                        }
                    ]
                }
            }
        };
        
        console.log('📦 Sende Update-Response:', response);
        res.json(response);
        
    } catch (error) {
        console.error('❌ Update-Check Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Einzelne Edition laden
app.get('/content/edition/:editionId', async (req, res) => {
    try {
        const { editionId } = req.params;
        console.log(`📥 Edition angefragt: ${editionId}`);
        
        // Vollständige Edition-Daten
        const editionData = {
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
            }
        };
        
        if (editionData[editionId]) {
            console.log(`✅ Edition ${editionId} gefunden und gesendet`);
            res.json(editionData[editionId]);
        } else {
            console.log(`❌ Edition ${editionId} nicht gefunden`);
            res.status(404).json({ error: 'Edition not found' });
        }
        
    } catch (error) {
        console.error('❌ Edition Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health Check
app.get('/health', (req, res) => {
    console.log('💓 Health Check');
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        contentAvailable: true
    });
});

// Test-Route
app.get('/test', (req, res) => {
    console.log('🧪 Test Route aufgerufen');
    res.json({ 
        message: 'Content-Server läuft!',
        timestamp: new Date().toISOString()
    });
});

// CORS Preflight für alle Routen
app.options('*', cors());

// Error Handler
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 Handler
app.use((req, res) => {
    console.log(`❓ 404 - Route nicht gefunden: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// Start Server
async function startServer() {
    await ensureContentDir();
    
    app.listen(PORT, () => {
        console.log(`🚀 Content Server läuft auf Port ${PORT}`);
        console.log(`📁 Content-Verzeichnis: ${CONTENT_DIR}`);
        console.log(`🌐 Test-URL: http://localhost:${PORT}/test`);
        console.log(`🔍 Update-Check: http://localhost:${PORT}/content/check-updates`);
        console.log(`💓 Health-Check: http://localhost:${PORT}/health`);
    });
}

startServer().catch(console.error);

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('⏹️ Server wird beendet...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⏹️ Server wird beendet (Ctrl+C)...');
    process.exit(0);
});