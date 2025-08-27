# 🚽 Klo-Kollektor Content Server

## 🎯 Über dieses Repository
Dieses Repository enthält die Content-Definitionen und Server-Konfiguration für die Klo-Kollektor App.

## 📁 Struktur
- `api/` - Content-Server JSON-Dateien
- `docs/` - Dokumentation  
- `tests/` - Tests für Content-Validierung

## 🔗 URLs
- **Production**: `https://USERNAME.github.io/klo-kollektor-contentsrv/api/content-server.json`
- **Test**: `https://USERNAME.github.io/klo-kollektor-contentsrv/api/content-server-test.json`

## 📝 Content Updates
Neue Editionen und Updates werden hier verwaltet und automatisch an die Apps ausgeliefert.

## 🚀 GitHub Pages
Dieses Repository wird über GitHub Pages gehostet und stellt die Content-Dateien über HTTPS bereit.

## 📋 Content hinzufügen
1. Neue Edition in `contentPacks` hinzufügen
2. Entsprechendes Update in `contentUpdates` erstellen
3. Version in `metadata` erhöhen
4. Commit und Push → Automatisch live

## 🧪 Testing
- Test-Version unter `/api/content-server-test.json`
- App mit `?test=true` Parameter für Test-Content