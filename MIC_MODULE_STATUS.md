# MicAudioToText Module Status

## Current State: ⚠️ Partial Ephemeral Token Support

The `mic-audio-to-text.js` module has **partial** ephemeral token detection but **cannot fully work** with ephemeral tokens in the current Aggregator-1 setup.

## What Works

The module **does detect** ephemeral tokens (line 6280):
- Detects `auth_tokens/` prefix
- Uses `BidiGenerateContentConstrained` endpoint (correct)
- Uses `access_token` query parameter (correct)
- Shows warning if wrong API version is used

## What Doesn't Work

The module **does NOT** properly configure the API version:

1. **Default API Version Issue:**
   - Creates `GoogleGenAI` client without `httpOptions` (line 8646-8647)
   - Defaults to `v1beta` API version (line 5602: `Jr = "v1beta"`)
   - Ephemeral tokens **require** `v1alpha` API version

2. **Connection Will Fail:**
   - Even though it detects ephemeral tokens and uses correct endpoint/query param
   - The WebSocket connection will use `v1beta` endpoint
   - Gemini API will reject ephemeral tokens on `v1beta` endpoints

## Code Analysis

**Current initialization (line 8641-8648):**
```javascript
init(e) {
  this.connect(e.apiKey);
}
async connect(e) {
  this.client = new ia({
    apiKey: e  // ❌ No httpOptions passed
  });
  // ...
}
```

**What's needed:**
```javascript
init(e) {
  const isEphemeralToken = e.apiKey.startsWith('auth_tokens/');
  this.connect(e.apiKey, isEphemeralToken ? { apiVersion: 'v1alpha' } : undefined);
}
async connect(e, httpOptions) {
  this.client = new ia({
    apiKey: e,
    httpOptions: httpOptions || { apiVersion: 'v1beta' }  // ✅ Pass httpOptions
  });
  // ...
}
```

## Impact on Aggregator-1

**Current behavior:**
- ✅ CamTick works perfectly with ephemeral tokens
- ❌ MicAudioToText will fail to connect with ephemeral tokens
- ⚠️ MicAudioToText will show warnings in console about API version mismatch

**Expected error:**
```
WebSocket connection to 'wss://...v1beta...' failed
Warning: The SDK's ephemeral token support is in v1alpha only
```

## Solution

The `mic-audio-to-text.js` module needs to be updated by its maintainers to:

1. Accept `httpOptions` parameter in `init()` config
2. Detect ephemeral tokens (`apiKey.startsWith('auth_tokens/')`)
3. Pass `httpOptions: { apiVersion: 'v1alpha' }` to `GoogleGenAI` constructor when ephemeral token detected

See `MODULE_REQUIREMENTS.md` for complete implementation guide.

## Workaround (Not Recommended)

Until the module is updated, Aggregator-1 could:
- Use regular API keys for mic module (defeats purpose of ephemeral tokens)
- Wait for module update
- Show user-friendly error message explaining mic module limitation

## Recommendation

**Disable mic module** in Aggregator-1 until `mic-audio-to-text.js` is updated, or document that mic functionality requires a regular API key (not ephemeral token).

---

**Status:** Waiting for `mic-audio-to-text.js` maintainers to implement ephemeral token support per `MODULE_REQUIREMENTS.md`.

