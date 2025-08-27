# 📋 Content-Server API Spezifikation

## Basis-Struktur
- `version`: Server-Version (SemVer)
- `lastUpdated`: ISO-Timestamp
- `contentUpdates`: Array von Update-Benachrichtigungen
- `contentPacks`: Verfügbare Content-Pakete
- `achievements`: Erfolge-Definitionen
- `metadata`: Server-Metadaten

## Update-Struktur
- `id`: Eindeutige Update-ID
- `version`: Update-Version
- `minAppVersion`: Minimal erforderliche App-Version
- `title`: Mehrsprachige Titel
- `description`: Mehrsprachige Beschreibung
- `contentIds`: Array der betroffenen Content-Pakete
- `features`: Array von neuen Features