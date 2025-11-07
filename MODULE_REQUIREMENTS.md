# Module Requirements for Aggregator-1

This document outlines the requirements for external modules (`cam-tick.js` and `mic-audio-to-text.js`) to work properly with Aggregator-1's ephemeral token architecture.

## Overview

Aggregator-1 uses **ephemeral tokens** from Google's Gemini Live API. These tokens are short-lived (30 minutes) and require the `v1alpha` API version. 

**Important:** Modules should support **BOTH** regular API keys (for local development) and ephemeral tokens (for production). The module should auto-detect which type of token is being used and configure itself accordingly.

## Requirements

### 1. Dual Token Support (Regular API Keys + Ephemeral Tokens)

Modules must support **both** regular API keys and ephemeral tokens:

- **Regular API keys** (for local development): `AIzaSy...`
- **Ephemeral tokens** (for production/Aggregator-1): `auth_tokens/...`

Modules should auto-detect the token type and configure accordingly. This allows:
- ✅ **Local development** with standard API keys (no changes needed)
- ✅ **Production use** with ephemeral tokens (for Aggregator-1)

**Ephemeral tokens look like:**
```
auth_tokens/2034e5e198e35c5067ef15227cb587e00f217e4e6ee2aec6bf78cc941aeb92c5
```

**Standard API keys look like:**
```
AIzaSyDs7kFihYEHUPxZ7fSzvO9kcvzBOmIVIPo
```

### 2. API Version Configuration

**CRITICAL:** Ephemeral tokens **only work with `v1alpha` API version**.

When initializing GoogleGenAI SDK, modules must:

1. **Detect ephemeral tokens** (check if `apiKey` starts with `auth_tokens/`)
2. **Automatically use `v1alpha`** when an ephemeral token is detected
3. **Accept `httpOptions` in `init()` config** to allow explicit API version override

### 3. Module Interface

Modules must support this initialization pattern:

```javascript
module.init({ 
  apiKey: token,  // Can be standard API key or ephemeral token
  httpOptions: { apiVersion: 'v1alpha' }  // Optional, but recommended
});
```

### 4. GoogleGenAI SDK Initialization

When creating a `GoogleGenAI` instance, modules should:

```javascript
import { GoogleGenAI } from "@google/genai";

// In module's init() or connect() method:
const isEphemeralToken = apiKey.startsWith('auth_tokens/');

const client = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    apiVersion: isEphemeralToken ? 'v1alpha' : (httpOptions?.apiVersion || 'v1beta')
  }
});
```

**Key points:**
- If token starts with `auth_tokens/`, **always use `v1alpha`**
- Otherwise, use `httpOptions.apiVersion` if provided, or default to `v1beta`
- Never use `v1beta` with ephemeral tokens (will cause connection failures)

### 5. WebSocket Connection (Direct WebSocket modules)

If your module connects directly via WebSocket (like `cam-tick.js`), ensure:

- WebSocket URL uses `v1alpha` endpoint when using ephemeral tokens
- Token is passed as `access_token` query parameter (not `key`) for ephemeral tokens

**Example:**
```javascript
const isEphemeralToken = apiKey.startsWith('auth_tokens/');
const endpoint = isEphemeralToken 
  ? 'v1alpha.GenerativeService.BidiGenerateContent'
  : 'v1beta.GenerativeService.BidiGenerateContent';
  
const wsUrl = isEphemeralToken
  ? `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${endpoint}?access_token=${apiKey}`
  : `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${endpoint}?key=${apiKey}`;
```

## Implementation Checklist

For modules using **GoogleGenAI SDK**:

- [ ] Accept `httpOptions` parameter in `init()` config (optional, for flexibility)
- [ ] Detect ephemeral tokens (check `apiKey.startsWith('auth_tokens/')`)
- [ ] Automatically set `apiVersion: 'v1alpha'` when ephemeral token detected
- [ ] Use `v1beta` (or current default) for regular API keys
- [ ] Pass `httpOptions` to `GoogleGenAI` constructor
- [ ] Ensure backward compatibility - regular API keys work as before

For modules using **Direct WebSocket**:

- [ ] Detect ephemeral tokens
- [ ] Use `v1alpha` endpoint for ephemeral tokens
- [ ] Use `v1beta` endpoint for regular API keys (current behavior)
- [ ] Use `access_token` query param for ephemeral tokens
- [ ] Use `key` query param for standard API keys (current behavior)
- [ ] Ensure backward compatibility - regular API keys work as before

## Migration Impact

### For Local Development

**You have two options:**

1. **Continue using regular API keys** (simplest):
   ```javascript
   // This continues to work exactly as before
   module.init({ apiKey: 'AIzaSy...' });
   ```
   - No backend needed
   - No token generation required
   - Works exactly as before

2. **Test with ephemeral tokens** (optional):
   - Requires a token generation endpoint (see Testing section)
   - Can use Aggregator-1's endpoint if it's running
   - Or create your own simple endpoint

**Recommendation:** Option 1 is sufficient. The auto-detection logic is simple enough that you can verify it works in staging/production without needing to test ephemeral tokens locally.

### For Production / Aggregator-1

When modules receive ephemeral tokens (from Aggregator-1), they:
- Auto-detect the token type
- Use `v1alpha` API version
- Use appropriate connection method

**Bottom line:** The implementation is **backward compatible**. Regular API keys work as before, ephemeral tokens are auto-detected and handled appropriately. **You don't need a backend to develop locally** - regular API keys work fine.

## Example Implementation

### For SDK-based modules (like mic-audio-to-text.js):

```javascript
class MyModule {
  constructor() {
    this.client = null;
  }
  
  init(config) {
    const { apiKey, httpOptions } = config;
    const isEphemeralToken = apiKey.startsWith('auth_tokens/');
    
    // Ephemeral tokens require v1alpha, regular keys can use v1beta
    const apiVersion = isEphemeralToken 
      ? 'v1alpha'  // Ephemeral tokens MUST use v1alpha
      : (httpOptions?.apiVersion || 'v1beta');  // Regular keys default to v1beta
    
    this.client = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        ...httpOptions,
        apiVersion: apiVersion
      }
    });
    
    // Warn if ephemeral token used without v1alpha
    if (isEphemeralToken && apiVersion !== 'v1alpha') {
      console.warn('Warning: Ephemeral tokens require v1alpha API version');
    }
  }
}

// Usage examples:

// Local development (regular API key) - works as before
const module1 = new MyModule();
module1.init({ apiKey: 'AIzaSy...' });  // Uses v1beta (default)

// Production (ephemeral token) - auto-detects and uses v1alpha
const module2 = new MyModule();
module2.init({ apiKey: 'auth_tokens/...' });  // Auto-uses v1alpha
```

### For WebSocket-based modules (like cam-tick.js):

```javascript
function createWebSocket(apiKey) {
  const isEphemeralToken = apiKey.startsWith('auth_tokens/');
  
  // Auto-detect token type and configure accordingly
  const endpoint = isEphemeralToken 
    ? 'v1alpha.GenerativeService.BidiGenerateContent'  // Ephemeral tokens
    : 'v1beta.GenerativeService.BidiGenerateContent';  // Regular keys
  
  const param = isEphemeralToken ? 'access_token' : 'key';
  const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${endpoint}?${param}=${apiKey}`;
  
  return new WebSocket(url);
}

// Usage examples:

// Local development (regular API key) - works as before
const ws1 = createWebSocket('AIzaSy...');  // Uses v1beta with ?key=

// Production (ephemeral token) - auto-detects and uses v1alpha
const ws2 = createWebSocket('auth_tokens/...');  // Uses v1alpha with ?access_token=
```

## Testing

### Testing with Regular API Keys (Local Development)

Your module should work exactly as before:

```javascript
// No changes needed for local dev
module.init({ apiKey: 'AIzaSy...' });
```

This should continue to work with `v1beta` (or whatever you're currently using).

### Testing with Ephemeral Tokens

To test your module with ephemeral tokens, you have a few options:

#### Option 1: Use Aggregator-1's Token Endpoint (Easiest)

Aggregator-1 provides a token generation endpoint that you can use for local testing. This is the simplest way to test ephemeral tokens without setting up your own backend.

**Step 1: Start Aggregator-1 Locally**

If you have access to the Aggregator-1 repository:

```bash
cd aggregator-1
vercel dev
```

This will start Aggregator-1 on `http://localhost:3000` (or another port if 3000 is busy).

**Step 2: Get Your Password**

Aggregator-1 uses password protection. You'll need the password that's set in Aggregator-1's `.env.local` file (for local dev) or environment variables (for deployed).

**Step 3: Request an Ephemeral Token**

Make a GET request to Aggregator-1's token endpoint:

**Using curl:**
```bash
curl "http://localhost:3000/api/token?password=your-password-here"
```

**Response:**
```json
{"token":"auth_tokens/2034e5e198e35c5067ef15227cb587e00f217e4e6ee2aec6bf78cc941aeb92c5"}
```

**Using JavaScript (in browser or Node.js):**
```javascript
const password = 'your-password-here';
const response = await fetch(`http://localhost:3000/api/token?password=${encodeURIComponent(password)}`);
const { token } = await response.json();
console.log('Ephemeral token:', token);
// token = "auth_tokens/..."
```

**Using Python:**
```python
import requests

password = 'your-password-here'
response = requests.get(f'http://localhost:3000/api/token?password={password}')
token = response.json()['token']
print(f'Ephemeral token: {token}')
```

**Step 4: Use the Token in Your Module**

Once you have the token, use it exactly like a regular API key:

```javascript
// In your module's test/demo code
const token = "auth_tokens/2034e5e198e35c5067ef15227cb587e00f217e4e6ee2aec6bf78cc941aeb92c5";

const module = new YourModule();
module.init({ apiKey: token });

// Your module should auto-detect it's an ephemeral token
// and use v1alpha API version
```

**Step 5: Test Your Module**

Your module should now:
- Detect the ephemeral token (starts with `auth_tokens/`)
- Use `v1alpha` API version
- Connect successfully to Gemini Live API

**Complete Example Workflow:**

```javascript
// 1. Get token from Aggregator-1
async function getEphemeralToken() {
  const password = 'your-password'; // From Aggregator-1's .env.local
  const response = await fetch(`http://localhost:3000/api/token?password=${password}`);
  const { token } = await response.json();
  return token;
}

// 2. Test your module with the token
async function testModule() {
  const token = await getEphemeralToken();
  
  const module = new YourModule();
  module.addEventListener('percept', (event) => {
    console.log('Received percept:', event.detail);
  });
  
  module.init({ apiKey: token });
  // Module should auto-detect ephemeral token and use v1alpha
}

testModule();
```

**If Aggregator-1 is Deployed:**

If Aggregator-1 is deployed to Vercel, you can use the production URL:

```javascript
// Replace with your actual Aggregator-1 URL
const AGGREGATOR_URL = 'https://aggregator-1.vercel.app';
const password = 'your-production-password';

const response = await fetch(`${AGGREGATOR_URL}/api/token?password=${password}`);
const { token } = await response.json();
```

**Error Handling:**

If you get a `401 Unauthorized` error:
- Check that the password is correct
- Verify Aggregator-1 is running
- Check that `SITE_PASSWORD` is set in Aggregator-1's environment

If you get a `500` error:
- Aggregator-1 might not have `GEMINI_API_KEY` set
- Check Aggregator-1's logs for details

#### Option 2: Create Your Own Token Generation Endpoint

If you want to test independently, create a simple endpoint:

**For Node.js/Express:**
```javascript
import { GoogleGenAI } from "@google/genai";
import express from 'express';

const app = express();

app.get('/api/token', async (req, res) => {
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
  
  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime: expireTime,
      newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
      httpOptions: { apiVersion: 'v1alpha' }
    }
  });
  
  res.json({ token: token.name });
});

app.listen(3001);
```

**For Python/Flask:**
```python
from flask import Flask, jsonify
from google import genai
import datetime

app = Flask(__name__)

@app.route('/api/token')
def get_token():
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    
    expire_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=30)
    token = client.auth_tokens.create(config={
        'uses': 1,
        'expire_time': expire_time.isoformat(),
        'new_session_expire_time': (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=1)).isoformat(),
        'http_options': {'api_version': 'v1alpha'}
    })
    
    return jsonify({'token': token.name})

if __name__ == '__main__':
    app.run(port=3001)
```

#### Option 3: Skip Local Ephemeral Token Testing

**You don't need to test ephemeral tokens locally!** Since the detection logic is simple:

```javascript
const isEphemeralToken = apiKey.startsWith('auth_tokens/');
```

You can:
- Test locally with regular API keys (verifies your module works)
- Rely on the auto-detection logic (it's straightforward)
- Test ephemeral tokens only in staging/production where Aggregator-1 provides them

**Recommendation:** Use Option 1 (Aggregator-1's endpoint) for the easiest testing, or Option 3 (skip local testing) since the detection is simple.

## Error Messages to Watch For

If modules aren't configured correctly, you'll see:

- `WebSocket connection to 'wss://...v1beta...' failed` - Using wrong API version
- `401 Unauthorized` - Token expired or invalid
- `The SDK's ephemeral token support is in v1alpha only` - SDK warning about wrong version

## References

- [Gemini Ephemeral Tokens Documentation](https://ai.google.dev/gemini-api/docs/ephemeral-tokens)
- [GoogleGenAI SDK Documentation](https://ai.google.dev/gemini-api/docs)

## Questions?

If you need clarification on any requirements, please check:
- Aggregator-1's `ephemeral-tokens-vercel-plan.md` for architecture details
- Aggregator-1's `app.js` to see how modules are initialized

