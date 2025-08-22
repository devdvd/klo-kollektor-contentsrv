// FIXED: Dynamischer Content Server - server.js
// Lädt echte JSON-Dateien statt hardcoded Content

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs').promises;
const path = require('path');
const os = require('os'); // Füge das am Anfang der server.js hinzu

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Content-Verzeichnis
const CONTENT_DIR = path.join(__dirname, 'content');
const METADATA_FILE = path.join(CONTENT_DIR, 'metadata.json');
const EDITIONS_DIR = path.join(CONTENT_DIR, 'editions');

// Stelle sicher, dass Content-Verzeichnis existiert
async function ensureContentDir() {
    try {
        await fs.access(CONTENT_DIR);
        await fs.access(EDITIONS_DIR);
    } catch {
        await fs.mkdir(CONTENT_DIR, { recursive: true });
        await fs.mkdir(EDITIONS_DIR, { recursive: true });
    }
}

// 🔥 FIXED: Lade ECHTE Metadaten aus metadata.json
async function loadMetadata() {
    try {
        console.log('📖 Lade Metadaten aus:', METADATA_FILE);
        const data = await fs.readFile(METADATA_FILE, 'utf8');
        const metadata = JSON.parse(data);
        console.log('✅ Metadaten geladen:', metadata.version);
        return metadata;
    } catch (error) {
        console.error('❌ Fehler beim Laden der Metadaten:', error.message);
        console.log('📁 Fallback Metadaten werden verwendet');
        return {
            version: "1.0.0",
            lastUpdated: new Date().toISOString(),
            updateAvailable: false,
            newContent: {
                title: { de: "Fallback Content", en: "Fallback Content" },
                description: { de: "Keine aktuellen Daten verfügbar", en: "No current data available" },
                icon: "⚠️"
            },
            contentPacks: {}
        };
    }
}

// 🔥 FIXED: Lade ECHTE Edition aus JSON-Datei
async function loadEdition(editionId) {
    try {
        const editionFile = path.join(EDITIONS_DIR, `${editionId}.json`);
        console.log('📖 Lade Edition aus:', editionFile);
        
        const data = await fs.readFile(editionFile, 'utf8');
        const edition = JSON.parse(data);
        console.log(`✅ Edition ${editionId} geladen:`, edition.name?.de || edition.name);
        return edition;
    } catch (error) {
        console.error(`❌ Edition ${editionId} nicht gefunden:`, error.message);
        return null;
    }
}

// 🔥 FIXED: Liste alle verfügbaren Editionen auf
async function listAvailableEditions() {
    try {
        const files = await fs.readdir(EDITIONS_DIR);
        const editionFiles = files.filter(file => file.endsWith('.json'));
        console.log('📁 Verfügbare Edition-Dateien:', editionFiles);
        return editionFiles.map(file => file.replace('.json', ''));
    } catch (error) {
        console.error('❌ Fehler beim Auflisten der Editionen:', error.message);
        return [];
    }
}

// Routes

// 🔥 FIXED: Update-Check - lädt ECHTE Daten
app.get('/content/check-updates', async (req, res) => {
    try {
        console.log('🔍 Update-Check Request erhalten von:', req.get('User-Agent'));
        
        // Lade ECHTE Metadaten aus JSON-Datei
        const metadata = await loadMetadata();
        
        // Erweitere um Server-Info
        const response = {
            ...metadata,
            timestamp: new Date().toISOString(),
            serverVersion: "2.0.0",
            availableEditions: await listAvailableEditions()
        };
        
        console.log('📦 Sende ECHTE Update-Response:', {
            version: response.version,
            contentPacks: Object.keys(response.contentPacks || {}),
            updateAvailable: response.updateAvailable
        });
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Update-Check Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// 🔥 FIXED: Einzelne Edition laden - aus JSON-Datei
app.get('/content/edition/:editionId', async (req, res) => {
    try {
        const { editionId } = req.params;
        console.log(`📥 Edition angefragt: ${editionId}`);
        
        // Lade ECHTE Edition aus JSON-Datei
        const edition = await loadEdition(editionId);
        
        if (edition) {
            console.log(`✅ Edition ${editionId} gefunden und gesendet`);
            res.json(edition);
        } else {
            console.log(`❌ Edition ${editionId} nicht gefunden`);
            
            // Liste verfügbare Editionen auf
            const available = await listAvailableEditions();
            res.status(404).json({ 
                error: 'Edition not found',
                requestedEdition: editionId,
                availableEditions: available
            });
        }
        
    } catch (error) {
        console.error('❌ Edition Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// 🔥 NEU: Alle verfügbaren Editionen auflisten
app.get('/content/editions', async (req, res) => {
    try {
        console.log('📋 Liste aller Editionen angefragt');
        
        const editionIds = await listAvailableEditions();
        const editions = {};
        
        // Lade alle Editionen
        for (const editionId of editionIds) {
            const edition = await loadEdition(editionId);
            if (edition) {
                editions[editionId] = edition;
            }
        }
        
        console.log(`✅ ${Object.keys(editions).length} Editionen geladen`);
        res.json(editions);
        
    } catch (error) {
        console.error('❌ Editions List Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// 🔥 NEU: Content-Verwaltung - Zeige alle Files
app.get('/admin/content-status', async (req, res) => {
    try {
        console.log('🔍 Content-Status angefragt');
        
        const status = {
            contentDir: CONTENT_DIR,
            metadataExists: false,
            editionsDir: EDITIONS_DIR,
            availableEditions: [],
            totalFiles: 0
        };
        
        // Prüfe Metadata
        try {
            await fs.access(METADATA_FILE);
            status.metadataExists = true;
            const metadata = await loadMetadata();
            status.metadataVersion = metadata.version;
        } catch (e) {
            status.metadataError = e.message;
        }
        
        // Prüfe Editionen
        try {
            status.availableEditions = await listAvailableEditions();
            status.totalFiles = status.availableEditions.length;
        } catch (e) {
            status.editionsError = e.message;
        }
        
        console.log('📊 Content Status:', status);
        res.json(status);
        
    } catch (error) {
        console.error('❌ Content Status Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Health Check
app.get('/health', async (req, res) => {
    console.log('💓 Health Check');
    
    const metadata = await loadMetadata();
    const editions = await listAvailableEditions();
    
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        contentAvailable: true,
        metadataVersion: metadata.version,
        availableEditions: editions.length
    });
});

// Test-Route
app.get('/test', async (req, res) => {
    console.log('🧪 Test Route aufgerufen');
    
    const metadata = await loadMetadata();
    const editions = await listAvailableEditions();
    
    res.json({ 
        message: 'Content-Server läuft!',
        timestamp: new Date().toISOString(),
        contentVersion: metadata.version,
        availableEditions: editions
    });
});

// CORS Preflight für alle Routen
app.options('*', cors());

// Error Handler
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
});

// 404 Handler
app.use((req, res) => {
    console.log(`❓ 404 - Route nicht gefunden: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// Start Server
async function startServer() {
    const hostname = os.hostname();
    await ensureContentDir();
    
    // Teste Content beim Start
    console.log('🔍 Teste Content beim Server-Start...');
    const metadata = await loadMetadata();
    const editions = await listAvailableEditions();
    
    console.log(`📊 Content-Status:
    - Metadata Version: ${metadata.version}
    - Verfügbare Editionen: ${editions.length}
    - Editionen: ${editions.join(', ')}`);
    
    app.listen(PORT, () => {
        console.log(`🚀 DYNAMISCHER Content Server läuft auf Port ${PORT}`);
        console.log(`📁 Content-Verzeichnis: ${CONTENT_DIR}`);
        console.log(`📁 Editionen-Verzeichnis: ${EDITIONS_DIR}`);
        console.log(`
🌐 Test-URLs:
   - Test: http://${hostname}:${PORT}/test
   - Update-Check: http://${hostname}:${PORT}/content/check-updates
   - Health: http://${hostname}:${PORT}/health
   - Content Status: http://${hostname}:${PORT}/admin/content-status
   - Alle Editionen: http://${hostname}:${PORT}/content/editions
        `);
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
