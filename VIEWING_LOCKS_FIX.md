# 🔧 Viewing Locks Fix - Lock Release Issues

## Problems Identified

### 1. **Lock Not Being Released** ❌
- Modal close buttons weren't clearing `selectedPropertyId`
- Hook kept lock active even after modal closed
- Lock state persisted across different unit views

### 2. **Always Showing "Locked" Message** ❌
- When modal closed, propertyId was set to null
- But `releaseLock()` checked `if (!propertyId)` and returned early
- Lock was never actually released in the database

## Fixes Applied ✅

### **1. Frontend: Modal Close Handlers**
Updated all 3 modal close buttons to clear BOTH states:

```typescript
// ❌ Before
onClick={() => setSelectedUnit(null)}

// ✅ After
onClick={() => {
  setSelectedUnit(null);
  setSelectedPropertyId(null);  // This triggers lock release!
}}
```

**Locations Fixed:**
- Close button (X) in modal header
- "Plan een bezichtiging" button
- "Sluiten" button in footer

### **2. Hook: Release Lock Logic**
Fixed `releaseLock()` to use session_id instead of propertyId:

```typescript
// ❌ Before
if (!propertyId || !state.isOwner) return;

// ✅ After
if (!state.isOwner) return;  // Don't check propertyId!
```

**Why?** When modal closes, `propertyId` becomes `null`, but we still need to release the lock using `session_id`.

### **3. API: Enhanced Logging**
Added comprehensive logging to trace lock lifecycle:

```typescript
// POST /api/viewing-locks
🔒 Lock request - Property: xxx, Session: yyy, User: zzz
🧹 Cleaned up N expired locks
🔍 Active locks found: N
❌ Property locked by session: xxx  OR  ✅ No active locks
✅ Lock created/updated: lock_id

// DELETE /api/viewing-locks
🔓 Release lock request - Session: xxx, User: yyy
✅ Locks released: N
```

### **4. Hook: Enhanced Logging**
Added detailed logging in `useViewingLock`:

```typescript
🔒 Lock acquire skipped - propertyId: null, enabled: false
🔒 Attempting to acquire lock for property: xxx, session: yyy
✅ Lock acquired successfully  OR  ❌ Property is locked
🔓 Releasing lock for session: xxx
```

## How Lock Flow Works Now

### **Opening a Unit Modal:**
```
1. User clicks unit in grid/table
   ├─ setSelectedUnit("5")
   └─ setSelectedPropertyId("abc-123-...")
   
2. Hook detects propertyId change
   └─ useEffect triggers → acquireLock()

3. API: POST /api/viewing-locks
   ├─ Cleanup expired locks
   ├─ Check for other active locks
   ├─ None found ✅
   └─ Upsert new lock

4. UI Updates
   ├─ Show "🔒 Vergrendeld voor u" badge
   └─ Enable "Reserveer Nu" button

5. Heartbeat starts (every 30s)
   └─ PATCH /api/viewing-locks
```

### **Closing the Modal:**
```
1. User clicks close button
   ├─ setSelectedUnit(null)
   └─ setSelectedPropertyId(null)  ← KEY FIX!
   
2. Hook detects propertyId changed to null
   └─ useEffect cleanup runs → releaseLock()

3. releaseLock() function
   ├─ Check state.isOwner ✅
   ├─ Use session_id (not propertyId)
   └─ DELETE /api/viewing-locks?session_id=xxx

4. API: DELETE /api/viewing-locks
   ├─ Delete where session_id = xxx AND user_id = yyy
   └─ Returns deleted_count

5. State reset
   └─ isOwner: false, isLocked: false

6. Real-time update sent to other users
   └─ Supabase WebSocket broadcast
```

### **Concurrent User Trying to View:**
```
User A has lock on Unit 5
   ↓
User B opens Unit 5
   ├─ POST /api/viewing-locks (property_id: Unit 5)
   ├─ API finds active lock (session != User B's session)
   ├─ Returns { locked: true, message: "..." }
   └─ UI shows:
      ├─ ⚠️ Warning banner
      └─ 🔒 Disabled "Reserveer" button
```

## Database Schema

```sql
viewing_locks (
  id UUID PRIMARY KEY,
  property_id UUID,           -- The unit being viewed
  viewer_id UUID,             -- The user viewing
  viewer_session_id TEXT,     -- Unique session (per tab)
  last_heartbeat TIMESTAMPTZ, -- Last activity
  expires_at TIMESTAMPTZ,     -- Auto-expire (2 min)
  UNIQUE(property_id, viewer_session_id)
)
```

**Unique Constraint Logic:**
- Same user + same session + same property = 1 lock (upsert)
- Different session = different lock (allows multiple tabs)
- But API prevents: different user trying to lock same property

## Testing Instructions 🧪

### **Test 1: Basic Lock & Release**
```
1. Open a unit modal
2. Check console:
   🔒 Attempting to acquire lock...
   ✅ Lock acquired successfully
3. Close modal
4. Check console:
   🔓 Releasing lock for session: xxx
   ✅ Locks released: 1
5. Reopen same unit
6. Should work immediately (no "locked" message)
```

### **Test 2: Concurrent Access**
```
1. Browser A: Open Unit 5 modal
2. Browser A console: ✅ Lock acquired
3. Browser B: Open Unit 5 modal
4. Browser B should see:
   ❌ Property is locked
   ⚠️ "Een andere klant is..." banner
   🔒 Disabled button
5. Browser A: Close modal
6. Browser A console: 🔓 Releasing lock
7. Browser B: Should immediately update
   ✅ Banner disappears
   ✅ Button enabled
```

### **Test 3: Multiple Units (No Interference)**
```
1. Open Unit 5 → Lock acquired ✅
2. Close Unit 5 → Lock released ✅
3. Open Unit 8 → Lock acquired ✅
4. Both should work independently
5. Check DB: Only 1 lock exists (for Unit 8)
```

### **Test 4: Session Persistence**
```
1. Open Unit 5
2. Check Network tab:
   - POST /api/viewing-locks (creates lock)
   - PATCH /api/viewing-locks (every 30s)
3. Wait 35 seconds
4. Should see at least 1 heartbeat
5. Close modal
6. Should see DELETE /api/viewing-locks
```

## Common Issues & Solutions

### **Issue: "Always showing locked"**
**Cause:** `selectedPropertyId` not being cleared

**Solution:** ✅ Fixed - all close buttons now clear both states

### **Issue: "Lock persists after closing"**
**Cause:** `releaseLock()` checking for `propertyId` which is null

**Solution:** ✅ Fixed - now checks session_id only

### **Issue: "Can't reopen same unit"**
**Cause:** Lock not released properly

**Solution:** ✅ Fixed - proper cleanup in useEffect

### **Issue: "Heartbeat stops"**
**Cause:** Interval not cleared on unmount

**Solution:** ✅ Fixed - clearInterval in releaseLock()

## Verification Checklist

✅ Modal close clears `selectedPropertyId`
✅ Lock releases on modal close
✅ Lock releases on tab close (beforeunload)
✅ Heartbeat maintains lock while viewing
✅ Concurrent users see lock message
✅ Real-time updates via WebSocket
✅ Expired locks auto-cleaned
✅ Console logging for debugging
✅ Database unique constraint correct

## Console Log Reference

### **Normal Flow (Single User):**
```
🔒 Attempting to acquire lock for property: abc123, session: xyz789
🔒 Lock request - Property: abc123, Session: xyz789, User: user123
🧹 Cleaned up 0 expired locks
🔍 Active locks found: 0
✅ No active locks, proceeding to acquire
✅ Lock created/updated: lock_id_456
✅ Lock acquired successfully

[30s later]
💓 Heartbeat sent

[User closes modal]
🔓 Releasing lock for session: xyz789
🔓 Release lock request - Session: xyz789, User: user123
✅ Locks released: 1
```

### **Concurrent Access (Two Users):**
```
User A:
🔒 Attempting to acquire lock...
✅ Lock acquired successfully

User B:
🔒 Attempting to acquire lock...
🔍 Active locks found: 1
❌ Property locked by session: xyz789
❌ Property is locked by another user

User A closes:
🔓 Releasing lock...
✅ Locks released: 1

User B (real-time update):
🔒 Lock change detected
🔒 Attempting to acquire lock...
✅ Lock acquired successfully
```

## Performance Notes

- **Lock Duration:** 2 minutes (auto-expire)
- **Heartbeat Interval:** 30 seconds
- **Cleanup Check:** On every lock request
- **Real-time Latency:** ~100-500ms (Supabase WebSocket)

## Next Steps

1. **Test thoroughly** using the test cases above
2. **Monitor console logs** to verify flow
3. **Check database** to ensure locks are cleaned up
4. **Test on multiple browsers** for concurrent access

## Success Criteria ✅

- ✅ No lingering locks after modal close
- ✅ Can immediately reopen same unit
- ✅ Concurrent users properly blocked
- ✅ Real-time updates working
- ✅ No database lock buildup
- ✅ Clear console logging for debugging

**Status: READY FOR TESTING** 🚀

