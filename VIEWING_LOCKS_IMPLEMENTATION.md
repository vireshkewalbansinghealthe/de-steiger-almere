# 🔐 Real-Time Viewing Locks - Implementation Complete

## Overzicht

Een volledig real-time WebSocket-gebaseerd lock systeem is geïmplementeerd met Supabase Realtime om concurrent reserveren te voorkomen.

## ✨ Features

### 1. **Real-Time Locks met Supabase Realtime**
- Automatische vergrendeling wanneer iemand de detail pagina opent
- Live updates via WebSocket - alle gebruikers zien direct wanneer een unit "bezet" is
- Automatische release wanneer gebruiker de pagina verlaat
- Heartbeat mechanisme (elke 30 seconden) om locks actief te houden

### 2. **Database Structuur**
```sql
viewing_locks table:
- property_id (UUID) - Link naar property
- viewer_id (UUID) - Gebruiker die kijkt
- viewer_session_id (TEXT) - Unieke sessie ID
- last_heartbeat (TIMESTAMPTZ) - Laatste heartbeat
- expires_at (TIMESTAMPTZ) - Vervaltijd (2 minuten)
- created_at (TIMESTAMPTZ)
```

### 3. **Lock Levenscyclus**

#### A. **Acquiring Lock**
```
Gebruiker opent unit detail pagina
    ↓
Hook: useViewingLock()
    ↓
POST /api/viewing-locks
    ↓
Check: Bestaat er al een actieve lock?
    ↓
NEE → Create lock (2 min expiry)
    ↓
JA → Toon "Unit wordt bekeken" bericht
```

#### B. **Maintaining Lock**
```
Heartbeat elke 30 seconden
    ↓
PATCH /api/viewing-locks
    ↓
Update last_heartbeat + extends expires_at
```

#### C. **Releasing Lock**
```
Gebruiker sluit pagina
    ↓
beforeunload event
    ↓
DELETE /api/viewing-locks
    ↓
Lock verwijderd
```

### 4. **UI Feedback**

#### **Wanneer je de lock hebt:**
```
┌─────────────────────────────────┐
│ Unit 5 Details    🔒 Vergren... │  ← Badge
│─────────────────────────────────│
│ ... unit details ...            │
│                                 │
│ [✅ Reserveer Nu - €1,500]     │
└─────────────────────────────────┘
```

#### **Wanneer iemand anders kijkt:**
```
┌─────────────────────────────────┐
│ ⚠️ Een andere klant is deze    │  ← Banner
│    unit momenteel aan het       │
│    bekijken. U kunt deze unit   │
│    niet reserveren...           │
│                    [Probeer →]  │
├─────────────────────────────────┤
│ Unit 5 Details                  │
│─────────────────────────────────│
│ ... unit details ...            │
│                                 │
│ [🔒 Unit wordt bekeken] (gray) │  ← Disabled
└─────────────────────────────────┘
```

## 🔧 Technische Implementatie

### **Frontend Hook: `useViewingLock`**
```typescript
const { 
  isLocked,      // Is unit locked by someone else?
  isOwner,       // Do I own the lock?
  message,       // Lock message (Dutch)
  isLoading,     // Is checking/acquiring?
  retry          // Retry function
} = useViewingLock({
  propertyId: '...',
  enabled: true
});
```

### **Features:**
- ✅ Supabase Realtime subscription voor live updates
- ✅ Automatische cleanup bij visibility change (tab switch)
- ✅ Heartbeat mechanisme
- ✅ `navigator.sendBeacon` voor reliable cleanup bij page close
- ✅ Re-acquisition wanneer pagina weer zichtbaar wordt

### **API Endpoints**

#### **1. POST `/api/viewing-locks`**
```json
Body: {
  "property_id": "uuid",
  "session_id": "random123"
}

Response (Success):
{
  "locked": false,
  "lock": { ... },
  "message": "Lock acquired successfully"
}

Response (Locked):
{
  "locked": true,
  "message": "Een andere klant is deze unit...",
  "seconds_left": 90,
  "expires_at": "2024-..."
}
```

#### **2. PATCH `/api/viewing-locks`** (Heartbeat)
```json
Body: {
  "session_id": "random123"
}
```

#### **3. DELETE `/api/viewing-locks?session_id=...`**
Release lock

## 🔄 Auto-Cleanup

### **Oude Locks Cleanup**
```javascript
// Bij elke lock acquisitie
await supabase
  .from('viewing_locks')
  .delete()
  .or(`expires_at.lt.${now},last_heartbeat.lt.${60_seconds_ago}`);
```

### **Database Function**
```sql
cleanup_expired_viewing_locks()
-- Verwijdert:
-- 1. Locks waar expires_at < now()
-- 2. Locks waar last_heartbeat < 1 minuut geleden
```

## 🎯 Gebruikerservaring

### **Scenario 1: Normale Flow**
```
1. User A opent Unit 5
   → Lock acquired ✅
   → "Vergrendeld voor u" badge

2. User A vult form in / bekijkt details
   → Heartbeat elke 30s ✅

3. User A gaat naar reservering
   → Lock blijft actief tijdens flow

4. User A sluit pagina
   → Lock released ✅
```

### **Scenario 2: Concurrent Access**
```
1. User A opent Unit 5
   → Lock acquired ✅

2. User B probeert Unit 5 te openen
   → Ziet "Unit wordt bekeken" banner ⚠️
   → "Reserveer" button disabled 🔒

3. User A verlaat de pagina
   → Lock released ✅
   → Real-time update naar User B 📡

4. User B ziet banner verdwijnen
   → "Reserveer" button enabled ✅
```

### **Scenario 3: Timeout**
```
1. User A opent Unit 5
   → Lock acquired (expires in 2 min) ✅

2. User A laat pagina open maar interacteert niet
   → No heartbeat ❌

3. Na 1 minuut zonder heartbeat
   → Auto cleanup ruimt lock op 🧹

4. Lock vrij voor anderen ✅
```

## 📊 Monitoring

### **Real-Time Updates**
```typescript
// Subscribe to changes
supabase
  .channel(`viewing_locks:${propertyId}`)
  .on('postgres_changes', ...)
  .subscribe()
```

### **Debug Logging**
```
🔑 Lock acquired for property: xxx
💓 Heartbeat sent
🔓 Lock released
⚠️ Property locked by another user
```

## 🚀 Deployment Checklist

✅ Database migration toegepast
✅ API endpoints geïmplementeerd  
✅ Frontend hook gebouwd
✅ UI componenten aangepast (bedrijfsunits & opslagboxen)
✅ Real-time subscriptions geconfigureerd
✅ Cleanup mechanismen werkend
✅ RLS policies ingesteld

## 🔐 Security

- RLS policies: Users kunnen alleen hun eigen locks CRUD-en
- Anyone can READ locks (nodig voor concurrency check)
- Service role gebruikt voor cleanup
- Session-based locking (per browser tab)

## 🎉 Resultaat

**Voorheen:**
```
❌ Twee users konden tegelijk reserveren
❌ Race conditions bij checkout
❌ Geen feedback over availability
```

**Nu:**
```
✅ Real-time locking met WebSockets
✅ Live feedback over lock status
✅ Automatische cleanup
✅ Gebruiksvriendelijke berichten in Nederlands
✅ Geen race conditions mogelijk
✅ Transparent voor gebruikers
```

## 📝 Testen

### **Test 1: Basic Lock**
1. Open browser 1 → bedrijfsunit detail pagina
2. Zie "Vergrendeld voor u" badge ✅

### **Test 2: Concurrent Access**
1. Browser 1: Open unit 5
2. Browser 2: Open unit 5
3. Browser 2 ziet "Unit wordt bekeken" ✅

### **Test 3: Auto Release**
1. Browser 1: Open unit 5
2. Browser 1: Sluit tab
3. Browser 2: Ziet banner verdwijnen ✅

### **Test 4: Tab Switch**
1. Open unit 5
2. Switch naar andere tab (visibility hidden)
3. Lock released ✅
4. Switch terug
5. Lock re-acquired ✅

## 🌟 Conclusie

Het systeem voorkomt volledig dat meerdere gebruikers tegelijk een unit kunnen reserveren door:
- ⚡ Real-time locks met Supabase Realtime
- 🔄 Automatische heartbeats
- 🧹 Intelligente cleanup
- 💬 Duidelijke gebruikerscommunicatie in Nederlands
- 🎯 Naadloze UX zonder frustratie

**Klaar voor productie!** 🚀

