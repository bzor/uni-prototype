/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let Et, Ct;
function _t() {
  return {
    geminiUrl: Et,
    vertexUrl: Ct
  };
}
function It(n, e, t, o) {
  var r, l;
  if (!(n != null && n.baseUrl)) {
    const a = _t();
    return e ? (r = a.vertexUrl) !== null && r !== void 0 ? r : t : (l = a.geminiUrl) !== null && l !== void 0 ? l : o;
  }
  return n.baseUrl;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class $ {
}
function T(n, e) {
  const t = /\{([^}]+)\}/g;
  return n.replace(t, (o, r) => {
    if (Object.prototype.hasOwnProperty.call(e, r)) {
      const l = e[r];
      return l != null ? String(l) : "";
    } else
      throw new Error(`Key '${r}' not found in valueMap.`);
  });
}
function s(n, e, t) {
  for (let l = 0; l < e.length - 1; l++) {
    const a = e[l];
    if (a.endsWith("[]")) {
      const u = a.slice(0, -2);
      if (!(u in n))
        if (Array.isArray(t))
          n[u] = Array.from({ length: t.length }, () => ({}));
        else
          throw new Error(`Value must be a list given an array path ${a}`);
      if (Array.isArray(n[u])) {
        const f = n[u];
        if (Array.isArray(t))
          for (let d = 0; d < f.length; d++) {
            const c = f[d];
            s(c, e.slice(l + 1), t[d]);
          }
        else
          for (const d of f)
            s(d, e.slice(l + 1), t);
      }
      return;
    } else if (a.endsWith("[0]")) {
      const u = a.slice(0, -3);
      u in n || (n[u] = [{}]);
      const f = n[u];
      s(f[0], e.slice(l + 1), t);
      return;
    }
    (!n[a] || typeof n[a] != "object") && (n[a] = {}), n = n[a];
  }
  const o = e[e.length - 1], r = n[o];
  if (r !== void 0) {
    if (!t || typeof t == "object" && Object.keys(t).length === 0 || t === r)
      return;
    if (typeof r == "object" && typeof t == "object" && r !== null && t !== null)
      Object.assign(r, t);
    else
      throw new Error(`Cannot set value for an existing key. Key: ${o}`);
  } else
    o === "_self" && typeof t == "object" && t !== null && !Array.isArray(t) ? Object.assign(n, t) : n[o] = t;
}
function i(n, e, t = void 0) {
  try {
    if (e.length === 1 && e[0] === "_self")
      return n;
    for (let o = 0; o < e.length; o++) {
      if (typeof n != "object" || n === null)
        return t;
      const r = e[o];
      if (r.endsWith("[]")) {
        const l = r.slice(0, -2);
        if (l in n) {
          const a = n[l];
          return Array.isArray(a) ? a.map((u) => i(u, e.slice(o + 1), t)) : t;
        } else
          return t;
      } else
        n = n[r];
    }
    return n;
  } catch (o) {
    if (o instanceof TypeError)
      return t;
    throw o;
  }
}
function vt(n, e) {
  for (const [t, o] of Object.entries(e)) {
    const r = t.split("."), l = o.split("."), a = /* @__PURE__ */ new Set();
    let u = -1;
    for (let f = 0; f < r.length; f++)
      if (r[f] === "*") {
        u = f;
        break;
      }
    if (u !== -1 && l.length > u)
      for (let f = u; f < l.length; f++) {
        const d = l[f];
        d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
      }
    fe(n, r, l, 0, a);
  }
}
function fe(n, e, t, o, r) {
  if (o >= e.length || typeof n != "object" || n === null)
    return;
  const l = e[o];
  if (l.endsWith("[]")) {
    const a = l.slice(0, -2), u = n;
    if (a in u && Array.isArray(u[a]))
      for (const f of u[a])
        fe(f, e, t, o + 1, r);
  } else if (l === "*") {
    if (typeof n == "object" && n !== null && !Array.isArray(n)) {
      const a = n, u = Object.keys(a).filter((d) => !d.startsWith("_") && !r.has(d)), f = {};
      for (const d of u)
        f[d] = a[d];
      for (const [d, c] of Object.entries(f)) {
        const p = [];
        for (const m of t.slice(o))
          m === "*" ? p.push(d) : p.push(m);
        s(a, p, c);
      }
      for (const d of u)
        delete a[d];
    }
  } else {
    const a = n;
    l in a && fe(a[l], e, t, o + 1, r);
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function Ce(n) {
  if (typeof n != "string")
    throw new Error("fromImageBytes must be a string");
  return n;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function St(n) {
  const e = {}, t = i(n, [
    "operationName"
  ]);
  t != null && s(e, ["operationName"], t);
  const o = i(n, ["resourceName"]);
  return o != null && s(e, ["_url", "resourceName"], o), e;
}
function At(n) {
  const e = {}, t = i(n, ["name"]);
  t != null && s(e, ["name"], t);
  const o = i(n, ["metadata"]);
  o != null && s(e, ["metadata"], o);
  const r = i(n, ["done"]);
  r != null && s(e, ["done"], r);
  const l = i(n, ["error"]);
  l != null && s(e, ["error"], l);
  const a = i(n, [
    "response",
    "generateVideoResponse"
  ]);
  return a != null && s(e, ["response"], Mt(a)), e;
}
function Rt(n) {
  const e = {}, t = i(n, ["name"]);
  t != null && s(e, ["name"], t);
  const o = i(n, ["metadata"]);
  o != null && s(e, ["metadata"], o);
  const r = i(n, ["done"]);
  r != null && s(e, ["done"], r);
  const l = i(n, ["error"]);
  l != null && s(e, ["error"], l);
  const a = i(n, ["response"]);
  return a != null && s(e, ["response"], Pt(a)), e;
}
function Mt(n) {
  const e = {}, t = i(n, [
    "generatedSamples"
  ]);
  if (t != null) {
    let l = t;
    Array.isArray(l) && (l = l.map((a) => Nt(a))), s(e, ["generatedVideos"], l);
  }
  const o = i(n, [
    "raiMediaFilteredCount"
  ]);
  o != null && s(e, ["raiMediaFilteredCount"], o);
  const r = i(n, [
    "raiMediaFilteredReasons"
  ]);
  return r != null && s(e, ["raiMediaFilteredReasons"], r), e;
}
function Pt(n) {
  const e = {}, t = i(n, ["videos"]);
  if (t != null) {
    let l = t;
    Array.isArray(l) && (l = l.map((a) => wt(a))), s(e, ["generatedVideos"], l);
  }
  const o = i(n, [
    "raiMediaFilteredCount"
  ]);
  o != null && s(e, ["raiMediaFilteredCount"], o);
  const r = i(n, [
    "raiMediaFilteredReasons"
  ]);
  return r != null && s(e, ["raiMediaFilteredReasons"], r), e;
}
function Nt(n) {
  const e = {}, t = i(n, ["video"]);
  return t != null && s(e, ["video"], Ut(t)), e;
}
function wt(n) {
  const e = {}, t = i(n, ["_self"]);
  return t != null && s(e, ["video"], Lt(t)), e;
}
function Dt(n) {
  const e = {}, t = i(n, [
    "operationName"
  ]);
  return t != null && s(e, ["_url", "operationName"], t), e;
}
function xt(n) {
  const e = {}, t = i(n, [
    "operationName"
  ]);
  return t != null && s(e, ["_url", "operationName"], t), e;
}
function Ut(n) {
  const e = {}, t = i(n, ["uri"]);
  t != null && s(e, ["uri"], t);
  const o = i(n, ["encodedVideo"]);
  o != null && s(e, ["videoBytes"], Ce(o));
  const r = i(n, ["encoding"]);
  return r != null && s(e, ["mimeType"], r), e;
}
function Lt(n) {
  const e = {}, t = i(n, ["gcsUri"]);
  t != null && s(e, ["uri"], t);
  const o = i(n, [
    "bytesBase64Encoded"
  ]);
  o != null && s(e, ["videoBytes"], Ce(o));
  const r = i(n, ["mimeType"]);
  return r != null && s(e, ["mimeType"], r), e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
var Pe;
(function(n) {
  n.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", n.OUTCOME_OK = "OUTCOME_OK", n.OUTCOME_FAILED = "OUTCOME_FAILED", n.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(Pe || (Pe = {}));
var Ne;
(function(n) {
  n.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", n.PYTHON = "PYTHON";
})(Ne || (Ne = {}));
var we;
(function(n) {
  n.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", n.SILENT = "SILENT", n.WHEN_IDLE = "WHEN_IDLE", n.INTERRUPT = "INTERRUPT";
})(we || (we = {}));
var H;
(function(n) {
  n.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", n.STRING = "STRING", n.NUMBER = "NUMBER", n.INTEGER = "INTEGER", n.BOOLEAN = "BOOLEAN", n.ARRAY = "ARRAY", n.OBJECT = "OBJECT", n.NULL = "NULL";
})(H || (H = {}));
var De;
(function(n) {
  n.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", n.MODE_DYNAMIC = "MODE_DYNAMIC";
})(De || (De = {}));
var xe;
(function(n) {
  n.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", n.NO_AUTH = "NO_AUTH", n.API_KEY_AUTH = "API_KEY_AUTH", n.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", n.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", n.OAUTH = "OAUTH", n.OIDC_AUTH = "OIDC_AUTH";
})(xe || (xe = {}));
var Ue;
(function(n) {
  n.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", n.SIMPLE_SEARCH = "SIMPLE_SEARCH", n.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Ue || (Ue = {}));
var Le;
(function(n) {
  n.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", n.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", n.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", n.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", n.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", n.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", n.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", n.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", n.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", n.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", n.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Le || (Le = {}));
var ke;
(function(n) {
  n.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", n.SEVERITY = "SEVERITY", n.PROBABILITY = "PROBABILITY";
})(ke || (ke = {}));
var Fe;
(function(n) {
  n.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", n.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", n.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", n.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", n.BLOCK_NONE = "BLOCK_NONE", n.OFF = "OFF";
})(Fe || (Fe = {}));
var Ge;
(function(n) {
  n.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", n.STOP = "STOP", n.MAX_TOKENS = "MAX_TOKENS", n.SAFETY = "SAFETY", n.RECITATION = "RECITATION", n.LANGUAGE = "LANGUAGE", n.OTHER = "OTHER", n.BLOCKLIST = "BLOCKLIST", n.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", n.SPII = "SPII", n.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", n.IMAGE_SAFETY = "IMAGE_SAFETY", n.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", n.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", n.NO_IMAGE = "NO_IMAGE";
})(Ge || (Ge = {}));
var Ve;
(function(n) {
  n.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", n.NEGLIGIBLE = "NEGLIGIBLE", n.LOW = "LOW", n.MEDIUM = "MEDIUM", n.HIGH = "HIGH";
})(Ve || (Ve = {}));
var qe;
(function(n) {
  n.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", n.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", n.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", n.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", n.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(qe || (qe = {}));
var He;
(function(n) {
  n.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", n.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", n.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", n.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", n.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(He || (He = {}));
var Be;
(function(n) {
  n.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", n.SAFETY = "SAFETY", n.OTHER = "OTHER", n.BLOCKLIST = "BLOCKLIST", n.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", n.IMAGE_SAFETY = "IMAGE_SAFETY", n.MODEL_ARMOR = "MODEL_ARMOR", n.JAILBREAK = "JAILBREAK";
})(Be || (Be = {}));
var Je;
(function(n) {
  n.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", n.ON_DEMAND = "ON_DEMAND", n.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Je || (Je = {}));
var j;
(function(n) {
  n.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", n.TEXT = "TEXT", n.IMAGE = "IMAGE", n.AUDIO = "AUDIO";
})(j || (j = {}));
var $e;
(function(n) {
  n.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", n.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", n.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", n.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})($e || ($e = {}));
var Ye;
(function(n) {
  n.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", n.TUNING_MODE_FULL = "TUNING_MODE_FULL", n.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Ye || (Ye = {}));
var We;
(function(n) {
  n.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", n.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", n.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", n.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", n.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", n.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", n.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(We || (We = {}));
var ce;
(function(n) {
  n.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", n.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", n.JOB_STATE_PENDING = "JOB_STATE_PENDING", n.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", n.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", n.JOB_STATE_FAILED = "JOB_STATE_FAILED", n.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", n.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", n.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", n.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", n.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", n.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(ce || (ce = {}));
var Ke;
(function(n) {
  n.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", n.TUNING_TASK_I2V = "TUNING_TASK_I2V", n.TUNING_TASK_T2V = "TUNING_TASK_T2V";
})(Ke || (Ke = {}));
var ze;
(function(n) {
  n.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", n.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", n.BALANCED = "BALANCED", n.PRIORITIZE_COST = "PRIORITIZE_COST";
})(ze || (ze = {}));
var be;
(function(n) {
  n.UNSPECIFIED = "UNSPECIFIED", n.BLOCKING = "BLOCKING", n.NON_BLOCKING = "NON_BLOCKING";
})(be || (be = {}));
var Xe;
(function(n) {
  n.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", n.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Xe || (Xe = {}));
var Qe;
(function(n) {
  n.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", n.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Qe || (Qe = {}));
var Ze;
(function(n) {
  n.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", n.AUTO = "AUTO", n.ANY = "ANY", n.NONE = "NONE", n.VALIDATED = "VALIDATED";
})(Ze || (Ze = {}));
var Oe;
(function(n) {
  n.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", n.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", n.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", n.BLOCK_NONE = "BLOCK_NONE";
})(Oe || (Oe = {}));
var je;
(function(n) {
  n.DONT_ALLOW = "DONT_ALLOW", n.ALLOW_ADULT = "ALLOW_ADULT", n.ALLOW_ALL = "ALLOW_ALL";
})(je || (je = {}));
var en;
(function(n) {
  n.auto = "auto", n.en = "en", n.ja = "ja", n.ko = "ko", n.hi = "hi", n.zh = "zh", n.pt = "pt", n.es = "es";
})(en || (en = {}));
var nn;
(function(n) {
  n.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", n.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", n.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", n.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", n.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(nn || (nn = {}));
var tn;
(function(n) {
  n.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", n.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", n.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", n.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(tn || (tn = {}));
var on;
(function(n) {
  n.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", n.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", n.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", n.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(on || (on = {}));
var sn;
(function(n) {
  n.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", n.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", n.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", n.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", n.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", n.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", n.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", n.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(sn || (sn = {}));
var rn;
(function(n) {
  n.FOREGROUND = "FOREGROUND", n.BACKGROUND = "BACKGROUND", n.PROMPT = "PROMPT", n.SEMANTIC = "SEMANTIC", n.INTERACTIVE = "INTERACTIVE";
})(rn || (rn = {}));
var ln;
(function(n) {
  n.ASSET = "ASSET", n.STYLE = "STYLE";
})(ln || (ln = {}));
var an;
(function(n) {
  n.INSERT = "INSERT", n.REMOVE = "REMOVE", n.REMOVE_STATIC = "REMOVE_STATIC", n.OUTPAINT = "OUTPAINT";
})(an || (an = {}));
var un;
(function(n) {
  n.OPTIMIZED = "OPTIMIZED", n.LOSSLESS = "LOSSLESS";
})(un || (un = {}));
var dn;
(function(n) {
  n.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", n.PREFERENCE_TUNING = "PREFERENCE_TUNING";
})(dn || (dn = {}));
var fn;
(function(n) {
  n.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", n.PROCESSING = "PROCESSING", n.ACTIVE = "ACTIVE", n.FAILED = "FAILED";
})(fn || (fn = {}));
var cn;
(function(n) {
  n.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", n.UPLOADED = "UPLOADED", n.GENERATED = "GENERATED";
})(cn || (cn = {}));
var pn;
(function(n) {
  n.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", n.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", n.RESPONSE_REJECTED = "RESPONSE_REJECTED", n.NEED_MORE_INPUT = "NEED_MORE_INPUT";
})(pn || (pn = {}));
var mn;
(function(n) {
  n.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", n.TEXT = "TEXT", n.IMAGE = "IMAGE", n.VIDEO = "VIDEO", n.AUDIO = "AUDIO", n.DOCUMENT = "DOCUMENT";
})(mn || (mn = {}));
var hn;
(function(n) {
  n.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", n.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", n.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(hn || (hn = {}));
var gn;
(function(n) {
  n.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", n.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", n.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(gn || (gn = {}));
var yn;
(function(n) {
  n.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", n.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", n.NO_INTERRUPTION = "NO_INTERRUPTION";
})(yn || (yn = {}));
var Tn;
(function(n) {
  n.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", n.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", n.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT";
})(Tn || (Tn = {}));
var En;
(function(n) {
  n.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", n.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", n.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", n.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", n.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", n.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", n.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", n.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", n.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", n.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", n.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", n.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", n.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(En || (En = {}));
var Cn;
(function(n) {
  n.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", n.QUALITY = "QUALITY", n.DIVERSITY = "DIVERSITY", n.VOCALIZATION = "VOCALIZATION";
})(Cn || (Cn = {}));
var Y;
(function(n) {
  n.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", n.PLAY = "PLAY", n.PAUSE = "PAUSE", n.STOP = "STOP", n.RESET_CONTEXT = "RESET_CONTEXT";
})(Y || (Y = {}));
class pe {
  constructor(e) {
    const t = {};
    for (const o of e.headers.entries())
      t[o[0]] = o[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}
class Z {
  /**
   * Returns the concatenation of all text parts from the first candidate in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the text from the first
   * one will be returned.
   * If there are non-text parts in the response, the concatenation of all text
   * parts will be returned, and a warning will be logged.
   * If there are thought parts in the response, the concatenation of all text
   * parts excluding the thought parts will be returned.
   *
   * @example
   * ```ts
   * const response = await ai.models.generateContent({
   *   model: 'gemini-2.0-flash',
   *   contents:
   *     'Why is the sky blue?',
   * });
   *
   * console.debug(response.text);
   * ```
   */
  get text() {
    var e, t, o, r, l, a, u, f;
    if (((r = (o = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || o === void 0 ? void 0 : o.parts) === null || r === void 0 ? void 0 : r.length) === 0)
      return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let d = "", c = !1;
    const p = [];
    for (const m of (f = (u = (a = (l = this.candidates) === null || l === void 0 ? void 0 : l[0]) === null || a === void 0 ? void 0 : a.content) === null || u === void 0 ? void 0 : u.parts) !== null && f !== void 0 ? f : []) {
      for (const [h, g] of Object.entries(m))
        h !== "text" && h !== "thought" && (g !== null || g !== void 0) && p.push(h);
      if (typeof m.text == "string") {
        if (typeof m.thought == "boolean" && m.thought)
          continue;
        c = !0, d += m.text;
      }
    }
    return p.length > 0 && console.warn(`there are non-text parts ${p} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), c ? d : void 0;
  }
  /**
   * Returns the concatenation of all inline data parts from the first candidate
   * in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the inline data from the
   * first one will be returned. If there are non-inline data parts in the
   * response, the concatenation of all inline data parts will be returned, and
   * a warning will be logged.
   */
  get data() {
    var e, t, o, r, l, a, u, f;
    if (((r = (o = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || o === void 0 ? void 0 : o.parts) === null || r === void 0 ? void 0 : r.length) === 0)
      return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let d = "";
    const c = [];
    for (const p of (f = (u = (a = (l = this.candidates) === null || l === void 0 ? void 0 : l[0]) === null || a === void 0 ? void 0 : a.content) === null || u === void 0 ? void 0 : u.parts) !== null && f !== void 0 ? f : []) {
      for (const [m, h] of Object.entries(p))
        m !== "inlineData" && (h !== null || h !== void 0) && c.push(m);
      p.inlineData && typeof p.inlineData.data == "string" && (d += atob(p.inlineData.data));
    }
    return c.length > 0 && console.warn(`there are non-data parts ${c} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), d.length > 0 ? btoa(d) : void 0;
  }
  /**
   * Returns the function calls from the first candidate in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the function calls from
   * the first one will be returned.
   * If there are no function calls in the response, undefined will be returned.
   *
   * @example
   * ```ts
   * const controlLightFunctionDeclaration: FunctionDeclaration = {
   *   name: 'controlLight',
   *   parameters: {
   *   type: Type.OBJECT,
   *   description: 'Set the brightness and color temperature of a room light.',
   *   properties: {
   *     brightness: {
   *       type: Type.NUMBER,
   *       description:
   *         'Light level from 0 to 100. Zero is off and 100 is full brightness.',
   *     },
   *     colorTemperature: {
   *       type: Type.STRING,
   *       description:
   *         'Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.',
   *     },
   *   },
   *   required: ['brightness', 'colorTemperature'],
   *  };
   *  const response = await ai.models.generateContent({
   *     model: 'gemini-2.0-flash',
   *     contents: 'Dim the lights so the room feels cozy and warm.',
   *     config: {
   *       tools: [{functionDeclarations: [controlLightFunctionDeclaration]}],
   *       toolConfig: {
   *         functionCallingConfig: {
   *           mode: FunctionCallingConfigMode.ANY,
   *           allowedFunctionNames: ['controlLight'],
   *         },
   *       },
   *     },
   *   });
   *  console.debug(JSON.stringify(response.functionCalls));
   * ```
   */
  get functionCalls() {
    var e, t, o, r, l, a, u, f;
    if (((r = (o = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || o === void 0 ? void 0 : o.parts) === null || r === void 0 ? void 0 : r.length) === 0)
      return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const d = (f = (u = (a = (l = this.candidates) === null || l === void 0 ? void 0 : l[0]) === null || a === void 0 ? void 0 : a.content) === null || u === void 0 ? void 0 : u.parts) === null || f === void 0 ? void 0 : f.filter((c) => c.functionCall).map((c) => c.functionCall).filter((c) => c !== void 0);
    if ((d == null ? void 0 : d.length) !== 0)
      return d;
  }
  /**
   * Returns the first executable code from the first candidate in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the executable code from
   * the first one will be returned.
   * If there are no executable code in the response, undefined will be
   * returned.
   *
   * @example
   * ```ts
   * const response = await ai.models.generateContent({
   *   model: 'gemini-2.0-flash',
   *   contents:
   *     'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
   *   config: {
   *     tools: [{codeExecution: {}}],
   *   },
   * });
   *
   * console.debug(response.executableCode);
   * ```
   */
  get executableCode() {
    var e, t, o, r, l, a, u, f, d;
    if (((r = (o = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || o === void 0 ? void 0 : o.parts) === null || r === void 0 ? void 0 : r.length) === 0)
      return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const c = (f = (u = (a = (l = this.candidates) === null || l === void 0 ? void 0 : l[0]) === null || a === void 0 ? void 0 : a.content) === null || u === void 0 ? void 0 : u.parts) === null || f === void 0 ? void 0 : f.filter((p) => p.executableCode).map((p) => p.executableCode).filter((p) => p !== void 0);
    if ((c == null ? void 0 : c.length) !== 0)
      return (d = c == null ? void 0 : c[0]) === null || d === void 0 ? void 0 : d.code;
  }
  /**
   * Returns the first code execution result from the first candidate in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the code execution result from
   * the first one will be returned.
   * If there are no code execution result in the response, undefined will be returned.
   *
   * @example
   * ```ts
   * const response = await ai.models.generateContent({
   *   model: 'gemini-2.0-flash',
   *   contents:
   *     'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
   *   config: {
   *     tools: [{codeExecution: {}}],
   *   },
   * });
   *
   * console.debug(response.codeExecutionResult);
   * ```
   */
  get codeExecutionResult() {
    var e, t, o, r, l, a, u, f, d;
    if (((r = (o = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || o === void 0 ? void 0 : o.parts) === null || r === void 0 ? void 0 : r.length) === 0)
      return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const c = (f = (u = (a = (l = this.candidates) === null || l === void 0 ? void 0 : l[0]) === null || a === void 0 ? void 0 : a.content) === null || u === void 0 ? void 0 : u.parts) === null || f === void 0 ? void 0 : f.filter((p) => p.codeExecutionResult).map((p) => p.codeExecutionResult).filter((p) => p !== void 0);
    if ((c == null ? void 0 : c.length) !== 0)
      return (d = c == null ? void 0 : c[0]) === null || d === void 0 ? void 0 : d.output;
  }
}
class _n {
}
class In {
}
class kt {
}
class Ft {
}
class Gt {
}
class Vt {
}
class vn {
}
class Sn {
}
class An {
}
class qt {
}
class oe {
  /**
   * Instantiates an Operation of the same type as the one being called with the fields set from the API response.
   * @internal
   */
  _fromAPIResponse({ apiResponse: e, isVertexAI: t }) {
    const o = new oe();
    let r;
    const l = e;
    return t ? r = Rt(l) : r = At(l), Object.assign(o, r), o;
  }
}
class Rn {
}
class Mn {
}
class Pn {
}
class Ht {
}
class Bt {
}
class Jt {
}
class Nn {
}
class $t {
  /**
   * Returns the concatenation of all text parts from the server content if present.
   *
   * @remarks
   * If there are non-text parts in the response, the concatenation of all text
   * parts will be returned, and a warning will be logged.
   */
  get text() {
    var e, t, o;
    let r = "", l = !1;
    const a = [];
    for (const u of (o = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && o !== void 0 ? o : []) {
      for (const [f, d] of Object.entries(u))
        f !== "text" && f !== "thought" && d !== null && a.push(f);
      if (typeof u.text == "string") {
        if (typeof u.thought == "boolean" && u.thought)
          continue;
        l = !0, r += u.text;
      }
    }
    return a.length > 0 && console.warn(`there are non-text parts ${a} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), l ? r : void 0;
  }
  /**
   * Returns the concatenation of all inline data parts from the server content if present.
   *
   * @remarks
   * If there are non-inline data parts in the
   * response, the concatenation of all inline data parts will be returned, and
   * a warning will be logged.
   */
  get data() {
    var e, t, o;
    let r = "";
    const l = [];
    for (const a of (o = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && o !== void 0 ? o : []) {
      for (const [u, f] of Object.entries(a))
        u !== "inlineData" && f !== null && l.push(u);
      a.inlineData && typeof a.inlineData.data == "string" && (r += atob(a.inlineData.data));
    }
    return l.length > 0 && console.warn(`there are non-data parts ${l} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), r.length > 0 ? btoa(r) : void 0;
  }
}
class Yt {
  /**
   * Returns the first audio chunk from the server content, if present.
   *
   * @remarks
   * If there are no audio chunks in the response, undefined will be returned.
   */
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0)
      return this.serverContent.audioChunks[0];
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function P(n, e) {
  if (!e || typeof e != "string")
    throw new Error("model is required and must be a string");
  if (n.isVertexAI()) {
    if (e.startsWith("publishers/") || e.startsWith("projects/") || e.startsWith("models/"))
      return e;
    if (e.indexOf("/") >= 0) {
      const t = e.split("/", 2);
      return `publishers/${t[0]}/models/${t[1]}`;
    } else
      return `publishers/google/models/${e}`;
  } else
    return e.startsWith("models/") || e.startsWith("tunedModels/") ? e : `models/${e}`;
}
function bn(n, e) {
  const t = P(n, e);
  return t ? t.startsWith("publishers/") && n.isVertexAI() ? `projects/${n.getProject()}/locations/${n.getLocation()}/${t}` : t.startsWith("models/") && n.isVertexAI() ? `projects/${n.getProject()}/locations/${n.getLocation()}/publishers/google/${t}` : t : "";
}
function Xn(n) {
  return Array.isArray(n) ? n.map((e) => ie(e)) : [ie(n)];
}
function ie(n) {
  if (typeof n == "object" && n !== null)
    return n;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof n}`);
}
function Qn(n) {
  const e = ie(n);
  if (e.mimeType && e.mimeType.startsWith("image/"))
    return e;
  throw new Error(`Unsupported mime type: ${e.mimeType}`);
}
function Zn(n) {
  const e = ie(n);
  if (e.mimeType && e.mimeType.startsWith("audio/"))
    return e;
  throw new Error(`Unsupported mime type: ${e.mimeType}`);
}
function wn(n) {
  if (n == null)
    throw new Error("PartUnion is required");
  if (typeof n == "object")
    return n;
  if (typeof n == "string")
    return { text: n };
  throw new Error(`Unsupported part type: ${typeof n}`);
}
function On(n) {
  if (n == null || Array.isArray(n) && n.length === 0)
    throw new Error("PartListUnion is required");
  return Array.isArray(n) ? n.map((e) => wn(e)) : [wn(n)];
}
function me(n) {
  return n != null && typeof n == "object" && "parts" in n && Array.isArray(n.parts);
}
function Dn(n) {
  return n != null && typeof n == "object" && "functionCall" in n;
}
function xn(n) {
  return n != null && typeof n == "object" && "functionResponse" in n;
}
function L(n) {
  if (n == null)
    throw new Error("ContentUnion is required");
  return me(n) ? n : {
    role: "user",
    parts: On(n)
  };
}
function _e(n, e) {
  if (!e)
    return [];
  if (n.isVertexAI() && Array.isArray(e))
    return e.flatMap((t) => {
      const o = L(t);
      return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
    });
  if (n.isVertexAI()) {
    const t = L(e);
    return t.parts && t.parts.length > 0 && t.parts[0].text !== void 0 ? [t.parts[0].text] : [];
  }
  return Array.isArray(e) ? e.map((t) => L(t)) : [L(e)];
}
function k(n) {
  if (n == null || Array.isArray(n) && n.length === 0)
    throw new Error("contents are required");
  if (!Array.isArray(n)) {
    if (Dn(n) || xn(n))
      throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [L(n)];
  }
  const e = [], t = [], o = me(n[0]);
  for (const r of n) {
    const l = me(r);
    if (l != o)
      throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (l)
      e.push(r);
    else {
      if (Dn(r) || xn(r))
        throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      t.push(r);
    }
  }
  return o || e.push({ role: "user", parts: On(t) }), e;
}
function Wt(n, e) {
  n.includes("null") && (e.nullable = !0);
  const t = n.filter((o) => o !== "null");
  if (t.length === 1)
    e.type = Object.values(H).includes(t[0].toUpperCase()) ? t[0].toUpperCase() : H.TYPE_UNSPECIFIED;
  else {
    e.anyOf = [];
    for (const o of t)
      e.anyOf.push({
        type: Object.values(H).includes(o.toUpperCase()) ? o.toUpperCase() : H.TYPE_UNSPECIFIED
      });
  }
}
function W(n) {
  const e = {}, t = ["items"], o = ["anyOf"], r = ["properties"];
  if (n.type && n.anyOf)
    throw new Error("type and anyOf cannot be both populated.");
  const l = n.anyOf;
  l != null && l.length == 2 && (l[0].type === "null" ? (e.nullable = !0, n = l[1]) : l[1].type === "null" && (e.nullable = !0, n = l[0])), n.type instanceof Array && Wt(n.type, e);
  for (const [a, u] of Object.entries(n))
    if (u != null)
      if (a == "type") {
        if (u === "null")
          throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array)
          continue;
        e.type = Object.values(H).includes(u.toUpperCase()) ? u.toUpperCase() : H.TYPE_UNSPECIFIED;
      } else if (t.includes(a))
        e[a] = W(u);
      else if (o.includes(a)) {
        const f = [];
        for (const d of u) {
          if (d.type == "null") {
            e.nullable = !0;
            continue;
          }
          f.push(W(d));
        }
        e[a] = f;
      } else if (r.includes(a)) {
        const f = {};
        for (const [d, c] of Object.entries(u))
          f[d] = W(c);
        e[a] = f;
      } else {
        if (a === "additionalProperties")
          continue;
        e[a] = u;
      }
  return e;
}
function Ie(n) {
  return W(n);
}
function ve(n) {
  if (typeof n == "object")
    return n;
  if (typeof n == "string")
    return {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: n
        }
      }
    };
  throw new Error(`Unsupported speechConfig type: ${typeof n}`);
}
function Se(n) {
  if ("multiSpeakerVoiceConfig" in n)
    throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return n;
}
function b(n) {
  if (n.functionDeclarations)
    for (const e of n.functionDeclarations)
      e.parameters && (Object.keys(e.parameters).includes("$schema") ? e.parametersJsonSchema || (e.parametersJsonSchema = e.parameters, delete e.parameters) : e.parameters = W(e.parameters)), e.response && (Object.keys(e.response).includes("$schema") ? e.responseJsonSchema || (e.responseJsonSchema = e.response, delete e.response) : e.response = W(e.response));
  return n;
}
function X(n) {
  if (n == null)
    throw new Error("tools is required");
  if (!Array.isArray(n))
    throw new Error("tools is required and must be an array of Tools");
  const e = [];
  for (const t of n)
    e.push(t);
  return e;
}
function Kt(n, e, t, o = 1) {
  const r = !e.startsWith(`${t}/`) && e.split("/").length === o;
  return n.isVertexAI() ? e.startsWith("projects/") ? e : e.startsWith("locations/") ? `projects/${n.getProject()}/${e}` : e.startsWith(`${t}/`) ? `projects/${n.getProject()}/locations/${n.getLocation()}/${e}` : r ? `projects/${n.getProject()}/locations/${n.getLocation()}/${t}/${e}` : e : r ? `${t}/${e}` : e;
}
function q(n, e) {
  if (typeof e != "string")
    throw new Error("name must be a string");
  return Kt(n, e, "cachedContents");
}
function jn(n) {
  switch (n) {
    case "STATE_UNSPECIFIED":
      return "JOB_STATE_UNSPECIFIED";
    case "CREATING":
      return "JOB_STATE_RUNNING";
    case "ACTIVE":
      return "JOB_STATE_SUCCEEDED";
    case "FAILED":
      return "JOB_STATE_FAILED";
    default:
      return n;
  }
}
function B(n) {
  return Ce(n);
}
function zt(n) {
  return n != null && typeof n == "object" && "name" in n;
}
function bt(n) {
  return n != null && typeof n == "object" && "video" in n;
}
function Xt(n) {
  return n != null && typeof n == "object" && "uri" in n;
}
function et(n) {
  var e;
  let t;
  if (zt(n) && (t = n.name), !(Xt(n) && (t = n.uri, t === void 0)) && !(bt(n) && (t = (e = n.video) === null || e === void 0 ? void 0 : e.uri, t === void 0))) {
    if (typeof n == "string" && (t = n), t === void 0)
      throw new Error("Could not extract file name from the provided input.");
    if (t.startsWith("https://")) {
      const r = t.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null)
        throw new Error(`Could not extract file name from URI ${t}`);
      t = r[0];
    } else t.startsWith("files/") && (t = t.split("files/")[1]);
    return t;
  }
}
function nt(n, e) {
  let t;
  return n.isVertexAI() ? t = e ? "publishers/google/models" : "models" : t = e ? "models" : "tunedModels", t;
}
function tt(n) {
  for (const e of ["models", "tunedModels", "publisherModels"])
    if (Qt(n, e))
      return n[e];
  return [];
}
function Qt(n, e) {
  return n !== null && typeof n == "object" && e in n;
}
function Zt(n, e = {}) {
  const t = n, o = {
    name: t.name,
    description: t.description,
    parametersJsonSchema: t.inputSchema
  };
  return t.outputSchema && (o.responseJsonSchema = t.outputSchema), e.behavior && (o.behavior = e.behavior), {
    functionDeclarations: [
      o
    ]
  };
}
function Ot(n, e = {}) {
  const t = [], o = /* @__PURE__ */ new Set();
  for (const r of n) {
    const l = r.name;
    if (o.has(l))
      throw new Error(`Duplicate function name ${l} found in MCP tools. Please ensure function names are unique.`);
    o.add(l);
    const a = Zt(r, e);
    a.functionDeclarations && t.push(...a.functionDeclarations);
  }
  return { functionDeclarations: t };
}
function ot(n, e) {
  let t;
  if (typeof e == "string")
    if (n.isVertexAI())
      if (e.startsWith("gs://"))
        t = { format: "jsonl", gcsUri: [e] };
      else if (e.startsWith("bq://"))
        t = { format: "bigquery", bigqueryUri: e };
      else
        throw new Error(`Unsupported string source for Vertex AI: ${e}`);
    else if (e.startsWith("files/"))
      t = { fileName: e };
    else
      throw new Error(`Unsupported string source for Gemini API: ${e}`);
  else if (Array.isArray(e)) {
    if (n.isVertexAI())
      throw new Error("InlinedRequest[] is not supported in Vertex AI.");
    t = { inlinedRequests: e };
  } else
    t = e;
  const o = [t.gcsUri, t.bigqueryUri].filter(Boolean).length, r = [
    t.inlinedRequests,
    t.fileName
  ].filter(Boolean).length;
  if (n.isVertexAI()) {
    if (r > 0 || o !== 1)
      throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (o > 0 || r !== 1)
    throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
  return t;
}
function jt(n) {
  if (typeof n != "string")
    return n;
  const e = n;
  if (e.startsWith("gs://"))
    return {
      format: "jsonl",
      gcsUri: e
    };
  if (e.startsWith("bq://"))
    return {
      format: "bigquery",
      bigqueryUri: e
    };
  throw new Error(`Unsupported destination: ${e}`);
}
function it(n) {
  if (typeof n != "object" || n === null)
    return {};
  const e = n, t = e.inlinedResponses;
  if (typeof t != "object" || t === null)
    return n;
  const r = t.inlinedResponses;
  if (!Array.isArray(r) || r.length === 0)
    return n;
  let l = !1;
  for (const a of r) {
    if (typeof a != "object" || a === null)
      continue;
    const f = a.response;
    if (typeof f != "object" || f === null)
      continue;
    if (f.embedding !== void 0) {
      l = !0;
      break;
    }
  }
  return l && (e.inlinedEmbedContentResponses = e.inlinedResponses, delete e.inlinedResponses), n;
}
function Q(n, e) {
  const t = e;
  if (!n.isVertexAI()) {
    if (/batches\/[^/]+$/.test(t))
      return t.split("/").pop();
    throw new Error(`Invalid batch job name: ${t}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(t))
    return t.split("/").pop();
  if (/^\d+$/.test(t))
    return t;
  throw new Error(`Invalid batch job name: ${t}.`);
}
function st(n) {
  const e = n;
  return e === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : e === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : e === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : e === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : e === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : e === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : e === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function eo(n) {
  const e = {}, t = i(n, ["responsesFile"]);
  t != null && s(e, ["fileName"], t);
  const o = i(n, [
    "inlinedResponses",
    "inlinedResponses"
  ]);
  if (o != null) {
    let l = o;
    Array.isArray(l) && (l = l.map((a) => xo(a))), s(e, ["inlinedResponses"], l);
  }
  const r = i(n, [
    "inlinedEmbedContentResponses",
    "inlinedResponses"
  ]);
  if (r != null) {
    let l = r;
    Array.isArray(l) && (l = l.map((a) => a)), s(e, ["inlinedEmbedContentResponses"], l);
  }
  return e;
}
function no(n) {
  const e = {}, t = i(n, ["predictionsFormat"]);
  t != null && s(e, ["format"], t);
  const o = i(n, [
    "gcsDestination",
    "outputUriPrefix"
  ]);
  o != null && s(e, ["gcsUri"], o);
  const r = i(n, [
    "bigqueryDestination",
    "outputUri"
  ]);
  return r != null && s(e, ["bigqueryUri"], r), e;
}
function to(n) {
  const e = {}, t = i(n, ["format"]);
  t != null && s(e, ["predictionsFormat"], t);
  const o = i(n, ["gcsUri"]);
  o != null && s(e, ["gcsDestination", "outputUriPrefix"], o);
  const r = i(n, ["bigqueryUri"]);
  if (r != null && s(e, ["bigqueryDestination", "outputUri"], r), i(n, ["fileName"]) !== void 0)
    throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(n, ["inlinedResponses"]) !== void 0)
    throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (i(n, ["inlinedEmbedContentResponses"]) !== void 0)
    throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return e;
}
function ne(n) {
  const e = {}, t = i(n, ["name"]);
  t != null && s(e, ["name"], t);
  const o = i(n, [
    "metadata",
    "displayName"
  ]);
  o != null && s(e, ["displayName"], o);
  const r = i(n, ["metadata", "state"]);
  r != null && s(e, ["state"], st(r));
  const l = i(n, [
    "metadata",
    "createTime"
  ]);
  l != null && s(e, ["createTime"], l);
  const a = i(n, [
    "metadata",
    "endTime"
  ]);
  a != null && s(e, ["endTime"], a);
  const u = i(n, [
    "metadata",
    "updateTime"
  ]);
  u != null && s(e, ["updateTime"], u);
  const f = i(n, ["metadata", "model"]);
  f != null && s(e, ["model"], f);
  const d = i(n, ["metadata", "output"]);
  return d != null && s(e, ["dest"], eo(it(d))), e;
}
function he(n) {
  const e = {}, t = i(n, ["name"]);
  t != null && s(e, ["name"], t);
  const o = i(n, ["displayName"]);
  o != null && s(e, ["displayName"], o);
  const r = i(n, ["state"]);
  r != null && s(e, ["state"], st(r));
  const l = i(n, ["error"]);
  l != null && s(e, ["error"], l);
  const a = i(n, ["createTime"]);
  a != null && s(e, ["createTime"], a);
  const u = i(n, ["startTime"]);
  u != null && s(e, ["startTime"], u);
  const f = i(n, ["endTime"]);
  f != null && s(e, ["endTime"], f);
  const d = i(n, ["updateTime"]);
  d != null && s(e, ["updateTime"], d);
  const c = i(n, ["model"]);
  c != null && s(e, ["model"], c);
  const p = i(n, ["inputConfig"]);
  p != null && s(e, ["src"], oo(p));
  const m = i(n, ["outputConfig"]);
  return m != null && s(e, ["dest"], no(it(m))), e;
}
function oo(n) {
  const e = {}, t = i(n, ["instancesFormat"]);
  t != null && s(e, ["format"], t);
  const o = i(n, ["gcsSource", "uris"]);
  o != null && s(e, ["gcsUri"], o);
  const r = i(n, [
    "bigquerySource",
    "inputUri"
  ]);
  return r != null && s(e, ["bigqueryUri"], r), e;
}
function io(n, e) {
  const t = {};
  if (i(e, ["format"]) !== void 0)
    throw new Error("format parameter is not supported in Gemini API.");
  if (i(e, ["gcsUri"]) !== void 0)
    throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(e, ["bigqueryUri"]) !== void 0)
    throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = i(e, ["fileName"]);
  o != null && s(t, ["fileName"], o);
  const r = i(e, [
    "inlinedRequests"
  ]);
  if (r != null) {
    let l = r;
    Array.isArray(l) && (l = l.map((a) => Do(n, a))), s(t, ["requests", "requests"], l);
  }
  return t;
}
function so(n) {
  const e = {}, t = i(n, ["format"]);
  t != null && s(e, ["instancesFormat"], t);
  const o = i(n, ["gcsUri"]);
  o != null && s(e, ["gcsSource", "uris"], o);
  const r = i(n, ["bigqueryUri"]);
  if (r != null && s(e, ["bigquerySource", "inputUri"], r), i(n, ["fileName"]) !== void 0)
    throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(n, ["inlinedRequests"]) !== void 0)
    throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return e;
}
function ro(n) {
  const e = {}, t = i(n, ["data"]);
  if (t != null && s(e, ["data"], t), i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function lo(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], Q(n, o)), t;
}
function ao(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], Q(n, o)), t;
}
function uo(n) {
  const e = {}, t = i(n, ["content"]);
  t != null && s(e, ["content"], t);
  const o = i(n, [
    "citationMetadata"
  ]);
  o != null && s(e, ["citationMetadata"], fo(o));
  const r = i(n, ["tokenCount"]);
  r != null && s(e, ["tokenCount"], r);
  const l = i(n, ["finishReason"]);
  l != null && s(e, ["finishReason"], l);
  const a = i(n, ["avgLogprobs"]);
  a != null && s(e, ["avgLogprobs"], a);
  const u = i(n, [
    "groundingMetadata"
  ]);
  u != null && s(e, ["groundingMetadata"], u);
  const f = i(n, ["index"]);
  f != null && s(e, ["index"], f);
  const d = i(n, [
    "logprobsResult"
  ]);
  d != null && s(e, ["logprobsResult"], d);
  const c = i(n, [
    "safetyRatings"
  ]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((h) => h)), s(e, ["safetyRatings"], m);
  }
  const p = i(n, [
    "urlContextMetadata"
  ]);
  return p != null && s(e, ["urlContextMetadata"], p), e;
}
function fo(n) {
  const e = {}, t = i(n, ["citationSources"]);
  if (t != null) {
    let o = t;
    Array.isArray(o) && (o = o.map((r) => r)), s(e, ["citations"], o);
  }
  return e;
}
function rt(n) {
  const e = {}, t = i(n, ["parts"]);
  if (t != null) {
    let r = t;
    Array.isArray(r) && (r = r.map((l) => qo(l))), s(e, ["parts"], r);
  }
  const o = i(n, ["role"]);
  return o != null && s(e, ["role"], o), e;
}
function co(n, e) {
  const t = {}, o = i(n, ["displayName"]);
  if (e !== void 0 && o != null && s(e, ["batch", "displayName"], o), i(n, ["dest"]) !== void 0)
    throw new Error("dest parameter is not supported in Gemini API.");
  return t;
}
function po(n, e) {
  const t = {}, o = i(n, ["displayName"]);
  e !== void 0 && o != null && s(e, ["displayName"], o);
  const r = i(n, ["dest"]);
  return e !== void 0 && r != null && s(e, ["outputConfig"], to(jt(r))), t;
}
function Un(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["src"]);
  r != null && s(t, ["batch", "inputConfig"], io(n, ot(n, r)));
  const l = i(e, ["config"]);
  return l != null && co(l, t), t;
}
function mo(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["model"], P(n, o));
  const r = i(e, ["src"]);
  r != null && s(t, ["inputConfig"], so(ot(n, r)));
  const l = i(e, ["config"]);
  return l != null && po(l, t), t;
}
function ho(n, e) {
  const t = {}, o = i(n, ["displayName"]);
  return e !== void 0 && o != null && s(e, ["batch", "displayName"], o), t;
}
function go(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["src"]);
  r != null && s(t, ["batch", "inputConfig"], vo(n, r));
  const l = i(e, ["config"]);
  return l != null && ho(l, t), t;
}
function yo(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], Q(n, o)), t;
}
function To(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], Q(n, o)), t;
}
function Eo(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["name"]);
  o != null && s(e, ["name"], o);
  const r = i(n, ["done"]);
  r != null && s(e, ["done"], r);
  const l = i(n, ["error"]);
  return l != null && s(e, ["error"], l), e;
}
function Co(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["name"]);
  o != null && s(e, ["name"], o);
  const r = i(n, ["done"]);
  r != null && s(e, ["done"], r);
  const l = i(n, ["error"]);
  return l != null && s(e, ["error"], l), e;
}
function _o(n, e) {
  const t = {}, o = i(e, ["contents"]);
  if (o != null) {
    let l = _e(n, o);
    Array.isArray(l) && (l = l.map((a) => a)), s(t, ["requests[]", "request", "content"], l);
  }
  const r = i(e, ["config"]);
  return r != null && (s(t, ["_self"], Io(r, t)), vt(t, { "requests[].*": "requests[].request.*" })), t;
}
function Io(n, e) {
  const t = {}, o = i(n, ["taskType"]);
  e !== void 0 && o != null && s(e, ["requests[]", "taskType"], o);
  const r = i(n, ["title"]);
  e !== void 0 && r != null && s(e, ["requests[]", "title"], r);
  const l = i(n, [
    "outputDimensionality"
  ]);
  if (e !== void 0 && l != null && s(e, ["requests[]", "outputDimensionality"], l), i(n, ["mimeType"]) !== void 0)
    throw new Error("mimeType parameter is not supported in Gemini API.");
  if (i(n, ["autoTruncate"]) !== void 0)
    throw new Error("autoTruncate parameter is not supported in Gemini API.");
  return t;
}
function vo(n, e) {
  const t = {}, o = i(e, ["fileName"]);
  o != null && s(t, ["file_name"], o);
  const r = i(e, [
    "inlinedRequests"
  ]);
  return r != null && s(t, ["requests"], _o(n, r)), t;
}
function So(n) {
  const e = {};
  if (i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const t = i(n, ["fileUri"]);
  t != null && s(e, ["fileUri"], t);
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function Ao(n, e, t) {
  const o = {}, r = i(e, [
    "systemInstruction"
  ]);
  t !== void 0 && r != null && s(t, ["systemInstruction"], rt(L(r)));
  const l = i(e, ["temperature"]);
  l != null && s(o, ["temperature"], l);
  const a = i(e, ["topP"]);
  a != null && s(o, ["topP"], a);
  const u = i(e, ["topK"]);
  u != null && s(o, ["topK"], u);
  const f = i(e, [
    "candidateCount"
  ]);
  f != null && s(o, ["candidateCount"], f);
  const d = i(e, [
    "maxOutputTokens"
  ]);
  d != null && s(o, ["maxOutputTokens"], d);
  const c = i(e, [
    "stopSequences"
  ]);
  c != null && s(o, ["stopSequences"], c);
  const p = i(e, [
    "responseLogprobs"
  ]);
  p != null && s(o, ["responseLogprobs"], p);
  const m = i(e, ["logprobs"]);
  m != null && s(o, ["logprobs"], m);
  const h = i(e, [
    "presencePenalty"
  ]);
  h != null && s(o, ["presencePenalty"], h);
  const g = i(e, [
    "frequencyPenalty"
  ]);
  g != null && s(o, ["frequencyPenalty"], g);
  const y = i(e, ["seed"]);
  y != null && s(o, ["seed"], y);
  const _ = i(e, [
    "responseMimeType"
  ]);
  _ != null && s(o, ["responseMimeType"], _);
  const v = i(e, [
    "responseSchema"
  ]);
  v != null && s(o, ["responseSchema"], Ie(v));
  const C = i(e, [
    "responseJsonSchema"
  ]);
  if (C != null && s(o, ["responseJsonSchema"], C), i(e, ["routingConfig"]) !== void 0)
    throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(e, ["modelSelectionConfig"]) !== void 0)
    throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const E = i(e, [
    "safetySettings"
  ]);
  if (t !== void 0 && E != null) {
    let D = E;
    Array.isArray(D) && (D = D.map((G) => Ho(G))), s(t, ["safetySettings"], D);
  }
  const I = i(e, ["tools"]);
  if (t !== void 0 && I != null) {
    let D = X(I);
    Array.isArray(D) && (D = D.map((G) => Bo(b(G)))), s(t, ["tools"], D);
  }
  const S = i(e, ["toolConfig"]);
  if (t !== void 0 && S != null && s(t, ["toolConfig"], S), i(e, ["labels"]) !== void 0)
    throw new Error("labels parameter is not supported in Gemini API.");
  const R = i(e, [
    "cachedContent"
  ]);
  t !== void 0 && R != null && s(t, ["cachedContent"], q(n, R));
  const M = i(e, [
    "responseModalities"
  ]);
  M != null && s(o, ["responseModalities"], M);
  const U = i(e, [
    "mediaResolution"
  ]);
  U != null && s(o, ["mediaResolution"], U);
  const A = i(e, ["speechConfig"]);
  if (A != null && s(o, ["speechConfig"], ve(A)), i(e, ["audioTimestamp"]) !== void 0)
    throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const N = i(e, [
    "thinkingConfig"
  ]);
  N != null && s(o, ["thinkingConfig"], N);
  const x = i(e, ["imageConfig"]);
  return x != null && s(o, ["imageConfig"], x), o;
}
function Ro(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["candidates"]);
  if (o != null) {
    let f = o;
    Array.isArray(f) && (f = f.map((d) => uo(d))), s(e, ["candidates"], f);
  }
  const r = i(n, ["modelVersion"]);
  r != null && s(e, ["modelVersion"], r);
  const l = i(n, [
    "promptFeedback"
  ]);
  l != null && s(e, ["promptFeedback"], l);
  const a = i(n, ["responseId"]);
  a != null && s(e, ["responseId"], a);
  const u = i(n, [
    "usageMetadata"
  ]);
  return u != null && s(e, ["usageMetadata"], u), e;
}
function Mo(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], Q(n, o)), t;
}
function Po(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], Q(n, o)), t;
}
function No(n) {
  const e = {};
  if (i(n, ["authConfig"]) !== void 0)
    throw new Error("authConfig parameter is not supported in Gemini API.");
  const t = i(n, ["enableWidget"]);
  return t != null && s(e, ["enableWidget"], t), e;
}
function wo(n) {
  const e = {};
  if (i(n, ["excludeDomains"]) !== void 0)
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const t = i(n, [
    "timeRangeFilter"
  ]);
  return t != null && s(e, ["timeRangeFilter"], t), e;
}
function Do(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["request", "model"], P(n, o));
  const r = i(e, ["contents"]);
  if (r != null) {
    let u = k(r);
    Array.isArray(u) && (u = u.map((f) => rt(f))), s(t, ["request", "contents"], u);
  }
  const l = i(e, ["metadata"]);
  l != null && s(t, ["metadata"], l);
  const a = i(e, ["config"]);
  return a != null && s(t, ["request", "generationConfig"], Ao(n, a, i(t, ["request"], {}))), t;
}
function xo(n) {
  const e = {}, t = i(n, ["response"]);
  t != null && s(e, ["response"], Ro(t));
  const o = i(n, ["error"]);
  return o != null && s(e, ["error"], o), e;
}
function Uo(n, e) {
  const t = {}, o = i(n, ["pageSize"]);
  e !== void 0 && o != null && s(e, ["_query", "pageSize"], o);
  const r = i(n, ["pageToken"]);
  if (e !== void 0 && r != null && s(e, ["_query", "pageToken"], r), i(n, ["filter"]) !== void 0)
    throw new Error("filter parameter is not supported in Gemini API.");
  return t;
}
function Lo(n, e) {
  const t = {}, o = i(n, ["pageSize"]);
  e !== void 0 && o != null && s(e, ["_query", "pageSize"], o);
  const r = i(n, ["pageToken"]);
  e !== void 0 && r != null && s(e, ["_query", "pageToken"], r);
  const l = i(n, ["filter"]);
  return e !== void 0 && l != null && s(e, ["_query", "filter"], l), t;
}
function ko(n) {
  const e = {}, t = i(n, ["config"]);
  return t != null && Uo(t, e), e;
}
function Fo(n) {
  const e = {}, t = i(n, ["config"]);
  return t != null && Lo(t, e), e;
}
function Go(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "nextPageToken"
  ]);
  o != null && s(e, ["nextPageToken"], o);
  const r = i(n, ["operations"]);
  if (r != null) {
    let l = r;
    Array.isArray(l) && (l = l.map((a) => ne(a))), s(e, ["batchJobs"], l);
  }
  return e;
}
function Vo(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "nextPageToken"
  ]);
  o != null && s(e, ["nextPageToken"], o);
  const r = i(n, [
    "batchPredictionJobs"
  ]);
  if (r != null) {
    let l = r;
    Array.isArray(l) && (l = l.map((a) => he(a))), s(e, ["batchJobs"], l);
  }
  return e;
}
function qo(n) {
  const e = {}, t = i(n, ["functionCall"]);
  t != null && s(e, ["functionCall"], t);
  const o = i(n, [
    "codeExecutionResult"
  ]);
  o != null && s(e, ["codeExecutionResult"], o);
  const r = i(n, [
    "executableCode"
  ]);
  r != null && s(e, ["executableCode"], r);
  const l = i(n, ["fileData"]);
  l != null && s(e, ["fileData"], So(l));
  const a = i(n, [
    "functionResponse"
  ]);
  a != null && s(e, ["functionResponse"], a);
  const u = i(n, ["inlineData"]);
  u != null && s(e, ["inlineData"], ro(u));
  const f = i(n, ["text"]);
  f != null && s(e, ["text"], f);
  const d = i(n, ["thought"]);
  d != null && s(e, ["thought"], d);
  const c = i(n, [
    "thoughtSignature"
  ]);
  c != null && s(e, ["thoughtSignature"], c);
  const p = i(n, [
    "videoMetadata"
  ]);
  return p != null && s(e, ["videoMetadata"], p), e;
}
function Ho(n) {
  const e = {}, t = i(n, ["category"]);
  if (t != null && s(e, ["category"], t), i(n, ["method"]) !== void 0)
    throw new Error("method parameter is not supported in Gemini API.");
  const o = i(n, ["threshold"]);
  return o != null && s(e, ["threshold"], o), e;
}
function Bo(n) {
  const e = {}, t = i(n, [
    "functionDeclarations"
  ]);
  if (t != null) {
    let d = t;
    Array.isArray(d) && (d = d.map((c) => c)), s(e, ["functionDeclarations"], d);
  }
  if (i(n, ["retrieval"]) !== void 0)
    throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = i(n, [
    "googleSearchRetrieval"
  ]);
  o != null && s(e, ["googleSearchRetrieval"], o);
  const r = i(n, ["googleMaps"]);
  r != null && s(e, ["googleMaps"], No(r));
  const l = i(n, ["computerUse"]);
  l != null && s(e, ["computerUse"], l);
  const a = i(n, [
    "codeExecution"
  ]);
  if (a != null && s(e, ["codeExecution"], a), i(n, ["enterpriseWebSearch"]) !== void 0)
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(n, ["googleSearch"]);
  u != null && s(e, ["googleSearch"], wo(u));
  const f = i(n, ["urlContext"]);
  return f != null && s(e, ["urlContext"], f), e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
var J;
(function(n) {
  n.PAGED_ITEM_BATCH_JOBS = "batchJobs", n.PAGED_ITEM_MODELS = "models", n.PAGED_ITEM_TUNING_JOBS = "tuningJobs", n.PAGED_ITEM_FILES = "files", n.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", n.PAGED_ITEM_RAG_STORES = "ragStores", n.PAGED_ITEM_DOCUMENTS = "documents";
})(J || (J = {}));
class ee {
  constructor(e, t, o, r) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, o, r);
  }
  init(e, t, o) {
    var r, l;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t == null ? void 0 : t.sdkHttpResponse, this.idxInternal = 0;
    let a = { config: {} };
    !o || Object.keys(o).length === 0 ? a = { config: {} } : typeof o == "object" ? a = Object.assign({}, o) : a = o, a.config && (a.config.pageToken = t.nextPageToken), this.paramsInternal = a, this.pageInternalSize = (l = (r = a.config) === null || r === void 0 ? void 0 : r.pageSize) !== null && l !== void 0 ? l : this.pageInternal.length;
  }
  initNextPage(e) {
    this.init(this.nameInternal, e, this.paramsInternal);
  }
  /**
   * Returns the current page, which is a list of items.
   *
   * @remarks
   * The first page is retrieved when the pager is created. The returned list of
   * items could be a subset of the entire list.
   */
  get page() {
    return this.pageInternal;
  }
  /**
   * Returns the type of paged item (for example, ``batch_jobs``).
   */
  get name() {
    return this.nameInternal;
  }
  /**
   * Returns the length of the page fetched each time by this pager.
   *
   * @remarks
   * The number of items in the page is less than or equal to the page length.
   */
  get pageSize() {
    return this.pageInternalSize;
  }
  /**
   * Returns the headers of the API response.
   */
  get sdkHttpResponse() {
    return this.sdkHttpResponseInternal;
  }
  /**
   * Returns the parameters when making the API request for the next page.
   *
   * @remarks
   * Parameters contain a set of optional configs that can be
   * used to customize the API request. For example, the `pageToken` parameter
   * contains the token to request the next page.
   */
  get params() {
    return this.paramsInternal;
  }
  /**
   * Returns the total number of items in the current page.
   */
  get pageLength() {
    return this.pageInternal.length;
  }
  /**
   * Returns the item at the given index.
   */
  getItem(e) {
    return this.pageInternal[e];
  }
  /**
   * Returns an async iterator that support iterating through all items
   * retrieved from the API.
   *
   * @remarks
   * The iterator will automatically fetch the next page if there are more items
   * to fetch from the API.
   *
   * @example
   *
   * ```ts
   * const pager = await ai.files.list({config: {pageSize: 10}});
   * for await (const file of pager) {
   *   console.log(file.name);
   * }
   * ```
   */
  [Symbol.asyncIterator]() {
    return {
      next: async () => {
        if (this.idxInternal >= this.pageLength)
          if (this.hasNextPage())
            await this.nextPage();
          else
            return { value: void 0, done: !0 };
        const e = this.getItem(this.idxInternal);
        return this.idxInternal += 1, { value: e, done: !1 };
      },
      return: async () => ({ value: void 0, done: !0 })
    };
  }
  /**
   * Fetches the next page of items. This makes a new API request.
   *
   * @throws {Error} If there are no more pages to fetch.
   *
   * @example
   *
   * ```ts
   * const pager = await ai.files.list({config: {pageSize: 10}});
   * let page = pager.page;
   * while (true) {
   *   for (const file of page) {
   *     console.log(file.name);
   *   }
   *   if (!pager.hasNextPage()) {
   *     break;
   *   }
   *   page = await pager.nextPage();
   * }
   * ```
   */
  async nextPage() {
    if (!this.hasNextPage())
      throw new Error("No more pages to fetch.");
    const e = await this.requestInternal(this.params);
    return this.initNextPage(e), this.page;
  }
  /**
   * Returns true if there are more pages to fetch from the API.
   */
  hasNextPage() {
    var e;
    return ((e = this.params.config) === null || e === void 0 ? void 0 : e.pageToken) !== void 0;
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Jo extends $ {
  constructor(e) {
    super(), this.apiClient = e, this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI())
        throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    }, this.list = async (t = {}) => new ee(J.PAGED_ITEM_BATCH_JOBS, (o) => this.listInternal(o), await this.listInternal(t), t);
  }
  // Helper function to handle inlined generate content requests
  createInlinedGenerateContentRequest(e) {
    const t = Un(
      this.apiClient,
      // Use instance apiClient
      e
    ), o = t._url, r = T("{model}:batchGenerateContent", o), u = t.batch.inputConfig.requests, f = u.requests, d = [];
    for (const c of f) {
      const p = Object.assign({}, c);
      if (p.systemInstruction) {
        const m = p.systemInstruction;
        delete p.systemInstruction;
        const h = p.request;
        h.systemInstruction = m, p.request = h;
      }
      d.push(p);
    }
    return u.requests = d, delete t.config, delete t._url, delete t._query, { path: r, body: t };
  }
  // Helper function to get the first GCS URI
  getGcsUri(e) {
    if (typeof e == "string")
      return e.startsWith("gs://") ? e : void 0;
    if (!Array.isArray(e) && e.gcsUri && e.gcsUri.length > 0)
      return e.gcsUri[0];
  }
  // Helper function to get the BigQuery URI
  getBigqueryUri(e) {
    if (typeof e == "string")
      return e.startsWith("bq://") ? e : void 0;
    if (!Array.isArray(e))
      return e.bigqueryUri;
  }
  // Function to format the destination configuration for Vertex AI
  formatDestination(e, t) {
    const o = t ? Object.assign({}, t) : {}, r = Date.now().toString();
    if (o.displayName || (o.displayName = `genaiBatchJob_${r}`), o.dest === void 0) {
      const l = this.getGcsUri(e), a = this.getBigqueryUri(e);
      if (l)
        l.endsWith(".jsonl") ? o.dest = `${l.slice(0, -6)}/dest` : o.dest = `${l}_dest_${r}`;
      else if (a)
        o.dest = `${a}_dest_${r}`;
      else
        throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return o;
  }
  /**
   * Internal method to create batch job.
   *
   * @param params - The parameters for create batch job request.
   * @return The created batch job.
   *
   */
  async createInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = mo(this.apiClient, e);
      return u = T("batchPredictionJobs", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a.then((c) => he(c));
    } else {
      const d = Un(this.apiClient, e);
      return u = T("{model}:batchGenerateContent", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a.then((c) => ne(c));
    }
  }
  /**
   * Internal method to create batch job.
   *
   * @param params - The parameters for create batch job request.
   * @return The created batch job.
   *
   */
  async createEmbeddingsInternal(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI())
      throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const u = go(this.apiClient, e);
      return l = T("{model}:asyncBatchEmbedContent", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json()), r.then((f) => ne(f));
    }
  }
  /**
   * Gets batch job configurations.
   *
   * @param params - The parameters for the get request.
   * @return The batch job.
   *
   * @example
   * ```ts
   * await ai.batches.get({name: '...'}); // The server-generated resource name.
   * ```
   */
  async get(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Po(this.apiClient, e);
      return u = T("batchPredictionJobs/{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a.then((c) => he(c));
    } else {
      const d = Mo(this.apiClient, e);
      return u = T("batches/{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a.then((c) => ne(c));
    }
  }
  /**
   * Cancels a batch job.
   *
   * @param params - The parameters for the cancel request.
   * @return The empty response returned by the API.
   *
   * @example
   * ```ts
   * await ai.batches.cancel({name: '...'}); // The server-generated resource name.
   * ```
   */
  async cancel(e) {
    var t, o, r, l;
    let a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const f = ao(this.apiClient, e);
      a = T("batchPredictionJobs/{name}:cancel", f._url), u = f._query, delete f._url, delete f._query, await this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(f),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      });
    } else {
      const f = lo(this.apiClient, e);
      a = T("batches/{name}:cancel", f._url), u = f._query, delete f._url, delete f._query, await this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(f),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Fo(e);
      return u = T("batchPredictionJobs", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Vo(c), m = new Nn();
        return Object.assign(m, p), m;
      });
    } else {
      const d = ko(e);
      return u = T("batches", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Go(c), m = new Nn();
        return Object.assign(m, p), m;
      });
    }
  }
  /**
   * Deletes a batch job.
   *
   * @param params - The parameters for the delete request.
   * @return The empty response returned by the API.
   *
   * @example
   * ```ts
   * await ai.batches.delete({name: '...'}); // The server-generated resource name.
   * ```
   */
  async delete(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = To(this.apiClient, e);
      return u = T("batchPredictionJobs/{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => Co(c));
    } else {
      const d = yo(this.apiClient, e);
      return u = T("batches/{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => Eo(c));
    }
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function $o(n) {
  const e = {}, t = i(n, ["data"]);
  if (t != null && s(e, ["data"], t), i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function Ln(n) {
  const e = {}, t = i(n, ["parts"]);
  if (t != null) {
    let r = t;
    Array.isArray(r) && (r = r.map((l) => di(l))), s(e, ["parts"], r);
  }
  const o = i(n, ["role"]);
  return o != null && s(e, ["role"], o), e;
}
function Yo(n, e) {
  const t = {}, o = i(n, ["ttl"]);
  e !== void 0 && o != null && s(e, ["ttl"], o);
  const r = i(n, ["expireTime"]);
  e !== void 0 && r != null && s(e, ["expireTime"], r);
  const l = i(n, ["displayName"]);
  e !== void 0 && l != null && s(e, ["displayName"], l);
  const a = i(n, ["contents"]);
  if (e !== void 0 && a != null) {
    let c = k(a);
    Array.isArray(c) && (c = c.map((p) => Ln(p))), s(e, ["contents"], c);
  }
  const u = i(n, [
    "systemInstruction"
  ]);
  e !== void 0 && u != null && s(e, ["systemInstruction"], Ln(L(u)));
  const f = i(n, ["tools"]);
  if (e !== void 0 && f != null) {
    let c = f;
    Array.isArray(c) && (c = c.map((p) => fi(p))), s(e, ["tools"], c);
  }
  const d = i(n, ["toolConfig"]);
  if (e !== void 0 && d != null && s(e, ["toolConfig"], d), i(n, ["kmsKeyName"]) !== void 0)
    throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return t;
}
function Wo(n, e) {
  const t = {}, o = i(n, ["ttl"]);
  e !== void 0 && o != null && s(e, ["ttl"], o);
  const r = i(n, ["expireTime"]);
  e !== void 0 && r != null && s(e, ["expireTime"], r);
  const l = i(n, ["displayName"]);
  e !== void 0 && l != null && s(e, ["displayName"], l);
  const a = i(n, ["contents"]);
  if (e !== void 0 && a != null) {
    let p = k(a);
    Array.isArray(p) && (p = p.map((m) => m)), s(e, ["contents"], p);
  }
  const u = i(n, [
    "systemInstruction"
  ]);
  e !== void 0 && u != null && s(e, ["systemInstruction"], L(u));
  const f = i(n, ["tools"]);
  if (e !== void 0 && f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => ci(m))), s(e, ["tools"], p);
  }
  const d = i(n, ["toolConfig"]);
  e !== void 0 && d != null && s(e, ["toolConfig"], d);
  const c = i(n, ["kmsKeyName"]);
  return e !== void 0 && c != null && s(e, ["encryption_spec", "kmsKeyName"], c), t;
}
function Ko(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["model"], bn(n, o));
  const r = i(e, ["config"]);
  return r != null && Yo(r, t), t;
}
function zo(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["model"], bn(n, o));
  const r = i(e, ["config"]);
  return r != null && Wo(r, t), t;
}
function bo(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], q(n, o)), t;
}
function Xo(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], q(n, o)), t;
}
function Qo(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  return t != null && s(e, ["sdkHttpResponse"], t), e;
}
function Zo(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  return t != null && s(e, ["sdkHttpResponse"], t), e;
}
function Oo(n) {
  const e = {};
  if (i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const t = i(n, ["fileUri"]);
  t != null && s(e, ["fileUri"], t);
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function jo(n) {
  const e = {};
  if (i(n, ["behavior"]) !== void 0)
    throw new Error("behavior parameter is not supported in Vertex AI.");
  const t = i(n, ["description"]);
  t != null && s(e, ["description"], t);
  const o = i(n, ["name"]);
  o != null && s(e, ["name"], o);
  const r = i(n, ["parameters"]);
  r != null && s(e, ["parameters"], r);
  const l = i(n, [
    "parametersJsonSchema"
  ]);
  l != null && s(e, ["parametersJsonSchema"], l);
  const a = i(n, ["response"]);
  a != null && s(e, ["response"], a);
  const u = i(n, [
    "responseJsonSchema"
  ]);
  return u != null && s(e, ["responseJsonSchema"], u), e;
}
function ei(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], q(n, o)), t;
}
function ni(n, e) {
  const t = {}, o = i(e, ["name"]);
  return o != null && s(t, ["_url", "name"], q(n, o)), t;
}
function ti(n) {
  const e = {};
  if (i(n, ["authConfig"]) !== void 0)
    throw new Error("authConfig parameter is not supported in Gemini API.");
  const t = i(n, ["enableWidget"]);
  return t != null && s(e, ["enableWidget"], t), e;
}
function oi(n) {
  const e = {};
  if (i(n, ["excludeDomains"]) !== void 0)
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const t = i(n, [
    "timeRangeFilter"
  ]);
  return t != null && s(e, ["timeRangeFilter"], t), e;
}
function ii(n, e) {
  const t = {}, o = i(n, ["pageSize"]);
  e !== void 0 && o != null && s(e, ["_query", "pageSize"], o);
  const r = i(n, ["pageToken"]);
  return e !== void 0 && r != null && s(e, ["_query", "pageToken"], r), t;
}
function si(n, e) {
  const t = {}, o = i(n, ["pageSize"]);
  e !== void 0 && o != null && s(e, ["_query", "pageSize"], o);
  const r = i(n, ["pageToken"]);
  return e !== void 0 && r != null && s(e, ["_query", "pageToken"], r), t;
}
function ri(n) {
  const e = {}, t = i(n, ["config"]);
  return t != null && ii(t, e), e;
}
function li(n) {
  const e = {}, t = i(n, ["config"]);
  return t != null && si(t, e), e;
}
function ai(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "nextPageToken"
  ]);
  o != null && s(e, ["nextPageToken"], o);
  const r = i(n, [
    "cachedContents"
  ]);
  if (r != null) {
    let l = r;
    Array.isArray(l) && (l = l.map((a) => a)), s(e, ["cachedContents"], l);
  }
  return e;
}
function ui(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "nextPageToken"
  ]);
  o != null && s(e, ["nextPageToken"], o);
  const r = i(n, [
    "cachedContents"
  ]);
  if (r != null) {
    let l = r;
    Array.isArray(l) && (l = l.map((a) => a)), s(e, ["cachedContents"], l);
  }
  return e;
}
function di(n) {
  const e = {}, t = i(n, ["functionCall"]);
  t != null && s(e, ["functionCall"], t);
  const o = i(n, [
    "codeExecutionResult"
  ]);
  o != null && s(e, ["codeExecutionResult"], o);
  const r = i(n, [
    "executableCode"
  ]);
  r != null && s(e, ["executableCode"], r);
  const l = i(n, ["fileData"]);
  l != null && s(e, ["fileData"], Oo(l));
  const a = i(n, [
    "functionResponse"
  ]);
  a != null && s(e, ["functionResponse"], a);
  const u = i(n, ["inlineData"]);
  u != null && s(e, ["inlineData"], $o(u));
  const f = i(n, ["text"]);
  f != null && s(e, ["text"], f);
  const d = i(n, ["thought"]);
  d != null && s(e, ["thought"], d);
  const c = i(n, [
    "thoughtSignature"
  ]);
  c != null && s(e, ["thoughtSignature"], c);
  const p = i(n, [
    "videoMetadata"
  ]);
  return p != null && s(e, ["videoMetadata"], p), e;
}
function fi(n) {
  const e = {}, t = i(n, [
    "functionDeclarations"
  ]);
  if (t != null) {
    let d = t;
    Array.isArray(d) && (d = d.map((c) => c)), s(e, ["functionDeclarations"], d);
  }
  if (i(n, ["retrieval"]) !== void 0)
    throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = i(n, [
    "googleSearchRetrieval"
  ]);
  o != null && s(e, ["googleSearchRetrieval"], o);
  const r = i(n, ["googleMaps"]);
  r != null && s(e, ["googleMaps"], ti(r));
  const l = i(n, ["computerUse"]);
  l != null && s(e, ["computerUse"], l);
  const a = i(n, [
    "codeExecution"
  ]);
  if (a != null && s(e, ["codeExecution"], a), i(n, ["enterpriseWebSearch"]) !== void 0)
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(n, ["googleSearch"]);
  u != null && s(e, ["googleSearch"], oi(u));
  const f = i(n, ["urlContext"]);
  return f != null && s(e, ["urlContext"], f), e;
}
function ci(n) {
  const e = {}, t = i(n, [
    "functionDeclarations"
  ]);
  if (t != null) {
    let p = t;
    Array.isArray(p) && (p = p.map((m) => jo(m))), s(e, ["functionDeclarations"], p);
  }
  const o = i(n, ["retrieval"]);
  o != null && s(e, ["retrieval"], o);
  const r = i(n, [
    "googleSearchRetrieval"
  ]);
  r != null && s(e, ["googleSearchRetrieval"], r);
  const l = i(n, ["googleMaps"]);
  l != null && s(e, ["googleMaps"], l);
  const a = i(n, ["computerUse"]);
  a != null && s(e, ["computerUse"], a);
  const u = i(n, [
    "codeExecution"
  ]);
  u != null && s(e, ["codeExecution"], u);
  const f = i(n, [
    "enterpriseWebSearch"
  ]);
  f != null && s(e, ["enterpriseWebSearch"], f);
  const d = i(n, ["googleSearch"]);
  d != null && s(e, ["googleSearch"], d);
  const c = i(n, ["urlContext"]);
  return c != null && s(e, ["urlContext"], c), e;
}
function pi(n, e) {
  const t = {}, o = i(n, ["ttl"]);
  e !== void 0 && o != null && s(e, ["ttl"], o);
  const r = i(n, ["expireTime"]);
  return e !== void 0 && r != null && s(e, ["expireTime"], r), t;
}
function mi(n, e) {
  const t = {}, o = i(n, ["ttl"]);
  e !== void 0 && o != null && s(e, ["ttl"], o);
  const r = i(n, ["expireTime"]);
  return e !== void 0 && r != null && s(e, ["expireTime"], r), t;
}
function hi(n, e) {
  const t = {}, o = i(e, ["name"]);
  o != null && s(t, ["_url", "name"], q(n, o));
  const r = i(e, ["config"]);
  return r != null && pi(r, t), t;
}
function gi(n, e) {
  const t = {}, o = i(e, ["name"]);
  o != null && s(t, ["_url", "name"], q(n, o));
  const r = i(e, ["config"]);
  return r != null && mi(r, t), t;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class yi extends $ {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new ee(J.PAGED_ITEM_CACHED_CONTENTS, (o) => this.listInternal(o), await this.listInternal(t), t);
  }
  /**
   * Creates a cached contents resource.
   *
   * @remarks
   * Context caching is only supported for specific models. See [Gemini
   * Developer API reference](https://ai.google.dev/gemini-api/docs/caching?lang=node/context-cac)
   * and [Vertex AI reference](https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview#supported_models)
   * for more information.
   *
   * @param params - The parameters for the create request.
   * @return The created cached content.
   *
   * @example
   * ```ts
   * const contents = ...; // Initialize the content to cache.
   * const response = await ai.caches.create({
   *   model: 'gemini-2.0-flash-001',
   *   config: {
   *    'contents': contents,
   *    'displayName': 'test cache',
   *    'systemInstruction': 'What is the sum of the two pdfs?',
   *    'ttl': '86400s',
   *  }
   * });
   * ```
   */
  async create(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = zo(this.apiClient, e);
      return u = T("cachedContents", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a.then((c) => c);
    } else {
      const d = Ko(this.apiClient, e);
      return u = T("cachedContents", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a.then((c) => c);
    }
  }
  /**
   * Gets cached content configurations.
   *
   * @param params - The parameters for the get request.
   * @return The cached content.
   *
   * @example
   * ```ts
   * await ai.caches.get({name: '...'}); // The server-generated resource name.
   * ```
   */
  async get(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = ni(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a.then((c) => c);
    } else {
      const d = ei(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a.then((c) => c);
    }
  }
  /**
   * Deletes cached content.
   *
   * @param params - The parameters for the delete request.
   * @return The empty response returned by the API.
   *
   * @example
   * ```ts
   * await ai.caches.delete({name: '...'}); // The server-generated resource name.
   * ```
   */
  async delete(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Xo(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Zo(c), m = new Mn();
        return Object.assign(m, p), m;
      });
    } else {
      const d = bo(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Qo(c), m = new Mn();
        return Object.assign(m, p), m;
      });
    }
  }
  /**
   * Updates cached content configurations.
   *
   * @param params - The parameters for the update request.
   * @return The updated cached content.
   *
   * @example
   * ```ts
   * const response = await ai.caches.update({
   *   name: '...',  // The server-generated resource name.
   *   config: {'ttl': '7600s'}
   * });
   * ```
   */
  async update(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = gi(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a.then((c) => c);
    } else {
      const d = hi(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a.then((c) => c);
    }
  }
  async listInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = li(e);
      return u = T("cachedContents", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = ui(c), m = new Pn();
        return Object.assign(m, p), m;
      });
    } else {
      const d = ri(e);
      return u = T("cachedContents", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = ai(c), m = new Pn();
        return Object.assign(m, p), m;
      });
    }
  }
}
function kn(n) {
  var e = typeof Symbol == "function" && Symbol.iterator, t = e && n[e], o = 0;
  if (t) return t.call(n);
  if (n && typeof n.length == "number") return {
    next: function() {
      return n && o >= n.length && (n = void 0), { value: n && n[o++], done: !n };
    }
  };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function w(n) {
  return this instanceof w ? (this.v = n, this) : new w(n);
}
function K(n, e, t) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var o = t.apply(n, e || []), r, l = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", a), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function a(h) {
    return function(g) {
      return Promise.resolve(g).then(h, p);
    };
  }
  function u(h, g) {
    o[h] && (r[h] = function(y) {
      return new Promise(function(_, v) {
        l.push([h, y, _, v]) > 1 || f(h, y);
      });
    }, g && (r[h] = g(r[h])));
  }
  function f(h, g) {
    try {
      d(o[h](g));
    } catch (y) {
      m(l[0][3], y);
    }
  }
  function d(h) {
    h.value instanceof w ? Promise.resolve(h.value.v).then(c, p) : m(l[0][2], h);
  }
  function c(h) {
    f("next", h);
  }
  function p(h) {
    f("throw", h);
  }
  function m(h, g) {
    h(g), l.shift(), l.length && f(l[0][0], l[0][1]);
  }
}
function O(n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = n[Symbol.asyncIterator], t;
  return e ? e.call(n) : (n = typeof kn == "function" ? kn(n) : n[Symbol.iterator](), t = {}, o("next"), o("throw"), o("return"), t[Symbol.asyncIterator] = function() {
    return this;
  }, t);
  function o(l) {
    t[l] = n[l] && function(a) {
      return new Promise(function(u, f) {
        a = n[l](a), r(u, f, a.done, a.value);
      });
    };
  }
  function r(l, a, u, f) {
    Promise.resolve(f).then(function(d) {
      l({ value: d, done: u });
    }, a);
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function Ti(n) {
  var e;
  if (n.candidates == null || n.candidates.length === 0)
    return !1;
  const t = (e = n.candidates[0]) === null || e === void 0 ? void 0 : e.content;
  return t === void 0 ? !1 : lt(t);
}
function lt(n) {
  if (n.parts === void 0 || n.parts.length === 0)
    return !1;
  for (const e of n.parts)
    if (e === void 0 || Object.keys(e).length === 0)
      return !1;
  return !0;
}
function Ei(n) {
  if (n.length !== 0) {
    for (const e of n)
      if (e.role !== "user" && e.role !== "model")
        throw new Error(`Role must be user or model, but got ${e.role}.`);
  }
}
function Fn(n) {
  if (n === void 0 || n.length === 0)
    return [];
  const e = [], t = n.length;
  let o = 0;
  for (; o < t; )
    if (n[o].role === "user")
      e.push(n[o]), o++;
    else {
      const r = [];
      let l = !0;
      for (; o < t && n[o].role === "model"; )
        r.push(n[o]), l && !lt(n[o]) && (l = !1), o++;
      l ? e.push(...r) : e.pop();
    }
  return e;
}
class Ci {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  /**
   * Creates a new chat session.
   *
   * @remarks
   * The config in the params will be used for all requests within the chat
   * session unless overridden by a per-request `config` in
   * @see {@link types.SendMessageParameters#config}.
   *
   * @param params - Parameters for creating a chat session.
   * @returns A new chat session.
   *
   * @example
   * ```ts
   * const chat = ai.chats.create({
   *   model: 'gemini-2.0-flash'
   *   config: {
   *     temperature: 0.5,
   *     maxOutputTokens: 1024,
   *   }
   * });
   * ```
   */
  create(e) {
    return new _i(
      this.apiClient,
      this.modelsModule,
      e.model,
      e.config,
      // Deep copy the history to avoid mutating the history outside of the
      // chat session.
      structuredClone(e.history)
    );
  }
}
class _i {
  constructor(e, t, o, r = {}, l = []) {
    this.apiClient = e, this.modelsModule = t, this.model = o, this.config = r, this.history = l, this.sendPromise = Promise.resolve(), Ei(l);
  }
  /**
   * Sends a message to the model and returns the response.
   *
   * @remarks
   * This method will wait for the previous message to be processed before
   * sending the next message.
   *
   * @see {@link Chat#sendMessageStream} for streaming method.
   * @param params - parameters for sending messages within a chat session.
   * @returns The model's response.
   *
   * @example
   * ```ts
   * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
   * const response = await chat.sendMessage({
   *   message: 'Why is the sky blue?'
   * });
   * console.log(response.text);
   * ```
   */
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const o = L(e.message), r = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(o),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var l, a, u;
      const f = await r, d = (a = (l = f.candidates) === null || l === void 0 ? void 0 : l[0]) === null || a === void 0 ? void 0 : a.content, c = f.automaticFunctionCallingHistory, p = this.getHistory(!0).length;
      let m = [];
      c != null && (m = (u = c.slice(p)) !== null && u !== void 0 ? u : []);
      const h = d ? [d] : [];
      this.recordHistory(o, h, m);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), r;
  }
  /**
   * Sends a message to the model and returns the response in chunks.
   *
   * @remarks
   * This method will wait for the previous message to be processed before
   * sending the next message.
   *
   * @see {@link Chat#sendMessage} for non-streaming method.
   * @param params - parameters for sending the message.
   * @return The model's response.
   *
   * @example
   * ```ts
   * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
   * const response = await chat.sendMessageStream({
   *   message: 'Why is the sky blue?'
   * });
   * for await (const chunk of response) {
   *   console.log(chunk.text);
   * }
   * ```
   */
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const o = L(e.message), r = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(o),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = r.then(() => {
    }).catch(() => {
    });
    const l = await r;
    return this.processStreamResponse(l, o);
  }
  /**
   * Returns the chat history.
   *
   * @remarks
   * The history is a list of contents alternating between user and model.
   *
   * There are two types of history:
   * - The `curated history` contains only the valid turns between user and
   * model, which will be included in the subsequent requests sent to the model.
   * - The `comprehensive history` contains all turns, including invalid or
   *   empty model outputs, providing a complete record of the history.
   *
   * The history is updated after receiving the response from the model,
   * for streaming response, it means receiving the last chunk of the response.
   *
   * The `comprehensive history` is returned by default. To get the `curated
   * history`, set the `curated` parameter to `true`.
   *
   * @param curated - whether to return the curated history or the comprehensive
   *     history.
   * @return History contents alternating between user and model for the entire
   *     chat session.
   */
  getHistory(e = !1) {
    const t = e ? Fn(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    var o, r;
    return K(this, arguments, function* () {
      var a, u, f, d;
      const c = [];
      try {
        for (var p = !0, m = O(e), h; h = yield w(m.next()), a = h.done, !a; p = !0) {
          d = h.value, p = !1;
          const g = d;
          if (Ti(g)) {
            const y = (r = (o = g.candidates) === null || o === void 0 ? void 0 : o[0]) === null || r === void 0 ? void 0 : r.content;
            y !== void 0 && c.push(y);
          }
          yield yield w(g);
        }
      } catch (g) {
        u = { error: g };
      } finally {
        try {
          !p && !a && (f = m.return) && (yield w(f.call(m)));
        } finally {
          if (u) throw u.error;
        }
      }
      this.recordHistory(t, c);
    });
  }
  recordHistory(e, t, o) {
    let r = [];
    t.length > 0 && t.every((l) => l.role !== void 0) ? r = t : r.push({
      role: "model",
      parts: []
    }), o && o.length > 0 ? this.history.push(...Fn(o)) : this.history.push(e), this.history.push(...r);
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class se extends Error {
  constructor(e) {
    super(e.message), this.name = "ApiError", this.status = e.status, Object.setPrototypeOf(this, se.prototype);
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function Ii(n) {
  const e = {}, t = i(n, ["file"]);
  return t != null && s(e, ["file"], t), e;
}
function vi(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  return t != null && s(e, ["sdkHttpResponse"], t), e;
}
function Si(n) {
  const e = {}, t = i(n, ["name"]);
  return t != null && s(e, ["_url", "file"], et(t)), e;
}
function Ai(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  return t != null && s(e, ["sdkHttpResponse"], t), e;
}
function Ri(n) {
  const e = {}, t = i(n, ["name"]);
  return t != null && s(e, ["_url", "file"], et(t)), e;
}
function Mi(n, e) {
  const t = {}, o = i(n, ["pageSize"]);
  e !== void 0 && o != null && s(e, ["_query", "pageSize"], o);
  const r = i(n, ["pageToken"]);
  return e !== void 0 && r != null && s(e, ["_query", "pageToken"], r), t;
}
function Pi(n) {
  const e = {}, t = i(n, ["config"]);
  return t != null && Mi(t, e), e;
}
function Ni(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "nextPageToken"
  ]);
  o != null && s(e, ["nextPageToken"], o);
  const r = i(n, ["files"]);
  if (r != null) {
    let l = r;
    Array.isArray(l) && (l = l.map((a) => a)), s(e, ["files"], l);
  }
  return e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class wi extends $ {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new ee(J.PAGED_ITEM_FILES, (o) => this.listInternal(o), await this.listInternal(t), t);
  }
  /**
   * Uploads a file asynchronously to the Gemini API.
   * This method is not available in Vertex AI.
   * Supported upload sources:
   * - Node.js: File path (string) or Blob object.
   * - Browser: Blob object (e.g., File).
   *
   * @remarks
   * The `mimeType` can be specified in the `config` parameter. If omitted:
   *  - For file path (string) inputs, the `mimeType` will be inferred from the
   *     file extension.
   *  - For Blob object inputs, the `mimeType` will be set to the Blob's `type`
   *     property.
   * Somex eamples for file extension to mimeType mapping:
   * .txt -> text/plain
   * .json -> application/json
   * .jpg  -> image/jpeg
   * .png -> image/png
   * .mp3 -> audio/mpeg
   * .mp4 -> video/mp4
   *
   * This section can contain multiple paragraphs and code examples.
   *
   * @param params - Optional parameters specified in the
   *        `types.UploadFileParameters` interface.
   *         @see {@link types.UploadFileParameters#config} for the optional
   *         config in the parameters.
   * @return A promise that resolves to a `types.File` object.
   * @throws An error if called on a Vertex AI client.
   * @throws An error if the `mimeType` is not provided and can not be inferred,
   * the `mimeType` can be provided in the `params.config` parameter.
   * @throws An error occurs if a suitable upload location cannot be established.
   *
   * @example
   * The following code uploads a file to Gemini API.
   *
   * ```ts
   * const file = await ai.files.upload({file: 'file.txt', config: {
   *   mimeType: 'text/plain',
   * }});
   * console.log(file.name);
   * ```
   */
  async upload(e) {
    if (this.apiClient.isVertexAI())
      throw new Error("Vertex AI does not support uploading files. You can share files through a GCS bucket.");
    return this.apiClient.uploadFile(e.file, e.config).then((t) => t);
  }
  /**
   * Downloads a remotely stored file asynchronously to a location specified in
   * the `params` object. This method only works on Node environment, to
   * download files in the browser, use a browser compliant method like an <a>
   * tag.
   *
   * @param params - The parameters for the download request.
   *
   * @example
   * The following code downloads an example file named "files/mehozpxf877d" as
   * "file.txt".
   *
   * ```ts
   * await ai.files.download({file: file.name, downloadPath: 'file.txt'});
   * ```
   */
  async download(e) {
    await this.apiClient.downloadFile(e);
  }
  async listInternal(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI())
      throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const u = Pi(e);
      return l = T("files", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json().then((d) => {
        const c = d;
        return c.sdkHttpResponse = {
          headers: f.headers
        }, c;
      })), r.then((f) => {
        const d = Ni(f), c = new Ht();
        return Object.assign(c, d), c;
      });
    }
  }
  async createInternal(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI())
      throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const u = Ii(e);
      return l = T("upload/v1beta/files", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json()), r.then((f) => {
        const d = vi(f), c = new Bt();
        return Object.assign(c, d), c;
      });
    }
  }
  /**
   * Retrieves the file information from the service.
   *
   * @param params - The parameters for the get request
   * @return The Promise that resolves to the types.File object requested.
   *
   * @example
   * ```ts
   * const config: GetFileParameters = {
   *   name: fileName,
   * };
   * file = await ai.files.get(config);
   * console.log(file.name);
   * ```
   */
  async get(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI())
      throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const u = Ri(e);
      return l = T("files/{file}", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json()), r.then((f) => f);
    }
  }
  /**
   * Deletes a remotely stored file.
   *
   * @param params - The parameters for the delete request.
   * @return The DeleteFileResponse, the response for the delete method.
   *
   * @example
   * The following code deletes an example file named "files/mehozpxf877d".
   *
   * ```ts
   * await ai.files.delete({name: file.name});
   * ```
   */
  async delete(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI())
      throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const u = Si(e);
      return l = T("files/{file}", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json().then((d) => {
        const c = d;
        return c.sdkHttpResponse = {
          headers: f.headers
        }, c;
      })), r.then((f) => {
        const d = Ai(f), c = new Jt();
        return Object.assign(c, d), c;
      });
    }
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function te(n) {
  const e = {}, t = i(n, ["data"]);
  if (t != null && s(e, ["data"], t), i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function Di(n) {
  const e = {}, t = i(n, ["parts"]);
  if (t != null) {
    let r = t;
    Array.isArray(r) && (r = r.map((l) => Ki(l))), s(e, ["parts"], r);
  }
  const o = i(n, ["role"]);
  return o != null && s(e, ["role"], o), e;
}
function xi(n) {
  const e = {};
  if (i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const t = i(n, ["fileUri"]);
  t != null && s(e, ["fileUri"], t);
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function Ui(n) {
  const e = {};
  if (i(n, ["behavior"]) !== void 0)
    throw new Error("behavior parameter is not supported in Vertex AI.");
  const t = i(n, ["description"]);
  t != null && s(e, ["description"], t);
  const o = i(n, ["name"]);
  o != null && s(e, ["name"], o);
  const r = i(n, ["parameters"]);
  r != null && s(e, ["parameters"], r);
  const l = i(n, [
    "parametersJsonSchema"
  ]);
  l != null && s(e, ["parametersJsonSchema"], l);
  const a = i(n, ["response"]);
  a != null && s(e, ["response"], a);
  const u = i(n, [
    "responseJsonSchema"
  ]);
  return u != null && s(e, ["responseJsonSchema"], u), e;
}
function Li(n) {
  const e = {}, t = i(n, [
    "modelSelectionConfig"
  ]);
  t != null && s(e, ["modelConfig"], t);
  const o = i(n, [
    "audioTimestamp"
  ]);
  o != null && s(e, ["audioTimestamp"], o);
  const r = i(n, [
    "candidateCount"
  ]);
  r != null && s(e, ["candidateCount"], r);
  const l = i(n, [
    "enableAffectiveDialog"
  ]);
  l != null && s(e, ["enableAffectiveDialog"], l);
  const a = i(n, [
    "frequencyPenalty"
  ]);
  a != null && s(e, ["frequencyPenalty"], a);
  const u = i(n, ["logprobs"]);
  u != null && s(e, ["logprobs"], u);
  const f = i(n, [
    "maxOutputTokens"
  ]);
  f != null && s(e, ["maxOutputTokens"], f);
  const d = i(n, [
    "mediaResolution"
  ]);
  d != null && s(e, ["mediaResolution"], d);
  const c = i(n, [
    "presencePenalty"
  ]);
  c != null && s(e, ["presencePenalty"], c);
  const p = i(n, [
    "responseJsonSchema"
  ]);
  p != null && s(e, ["responseJsonSchema"], p);
  const m = i(n, [
    "responseLogprobs"
  ]);
  m != null && s(e, ["responseLogprobs"], m);
  const h = i(n, [
    "responseMimeType"
  ]);
  h != null && s(e, ["responseMimeType"], h);
  const g = i(n, [
    "responseModalities"
  ]);
  g != null && s(e, ["responseModalities"], g);
  const y = i(n, [
    "responseSchema"
  ]);
  y != null && s(e, ["responseSchema"], y);
  const _ = i(n, [
    "routingConfig"
  ]);
  _ != null && s(e, ["routingConfig"], _);
  const v = i(n, ["seed"]);
  v != null && s(e, ["seed"], v);
  const C = i(n, ["speechConfig"]);
  C != null && s(e, ["speechConfig"], at(C));
  const E = i(n, [
    "stopSequences"
  ]);
  E != null && s(e, ["stopSequences"], E);
  const I = i(n, ["temperature"]);
  I != null && s(e, ["temperature"], I);
  const S = i(n, [
    "thinkingConfig"
  ]);
  S != null && s(e, ["thinkingConfig"], S);
  const R = i(n, ["topK"]);
  R != null && s(e, ["topK"], R);
  const M = i(n, ["topP"]);
  if (M != null && s(e, ["topP"], M), i(n, ["enableEnhancedCivicAnswers"]) !== void 0)
    throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return e;
}
function ki(n) {
  const e = {};
  if (i(n, ["authConfig"]) !== void 0)
    throw new Error("authConfig parameter is not supported in Gemini API.");
  const t = i(n, ["enableWidget"]);
  return t != null && s(e, ["enableWidget"], t), e;
}
function Fi(n) {
  const e = {};
  if (i(n, ["excludeDomains"]) !== void 0)
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const t = i(n, [
    "timeRangeFilter"
  ]);
  return t != null && s(e, ["timeRangeFilter"], t), e;
}
function Gi(n, e) {
  const t = {}, o = i(n, [
    "generationConfig"
  ]);
  e !== void 0 && o != null && s(e, ["setup", "generationConfig"], o);
  const r = i(n, [
    "responseModalities"
  ]);
  e !== void 0 && r != null && s(e, ["setup", "generationConfig", "responseModalities"], r);
  const l = i(n, ["temperature"]);
  e !== void 0 && l != null && s(e, ["setup", "generationConfig", "temperature"], l);
  const a = i(n, ["topP"]);
  e !== void 0 && a != null && s(e, ["setup", "generationConfig", "topP"], a);
  const u = i(n, ["topK"]);
  e !== void 0 && u != null && s(e, ["setup", "generationConfig", "topK"], u);
  const f = i(n, [
    "maxOutputTokens"
  ]);
  e !== void 0 && f != null && s(e, ["setup", "generationConfig", "maxOutputTokens"], f);
  const d = i(n, [
    "mediaResolution"
  ]);
  e !== void 0 && d != null && s(e, ["setup", "generationConfig", "mediaResolution"], d);
  const c = i(n, ["seed"]);
  e !== void 0 && c != null && s(e, ["setup", "generationConfig", "seed"], c);
  const p = i(n, ["speechConfig"]);
  e !== void 0 && p != null && s(e, ["setup", "generationConfig", "speechConfig"], Se(p));
  const m = i(n, [
    "thinkingConfig"
  ]);
  e !== void 0 && m != null && s(e, ["setup", "generationConfig", "thinkingConfig"], m);
  const h = i(n, [
    "enableAffectiveDialog"
  ]);
  e !== void 0 && h != null && s(e, ["setup", "generationConfig", "enableAffectiveDialog"], h);
  const g = i(n, [
    "systemInstruction"
  ]);
  e !== void 0 && g != null && s(e, ["setup", "systemInstruction"], Di(L(g)));
  const y = i(n, ["tools"]);
  if (e !== void 0 && y != null) {
    let R = X(y);
    Array.isArray(R) && (R = R.map((M) => bi(b(M)))), s(e, ["setup", "tools"], R);
  }
  const _ = i(n, [
    "sessionResumption"
  ]);
  e !== void 0 && _ != null && s(e, ["setup", "sessionResumption"], zi(_));
  const v = i(n, [
    "inputAudioTranscription"
  ]);
  e !== void 0 && v != null && s(e, ["setup", "inputAudioTranscription"], v);
  const C = i(n, [
    "outputAudioTranscription"
  ]);
  e !== void 0 && C != null && s(e, ["setup", "outputAudioTranscription"], C);
  const E = i(n, [
    "realtimeInputConfig"
  ]);
  e !== void 0 && E != null && s(e, ["setup", "realtimeInputConfig"], E);
  const I = i(n, [
    "contextWindowCompression"
  ]);
  e !== void 0 && I != null && s(e, ["setup", "contextWindowCompression"], I);
  const S = i(n, ["proactivity"]);
  return e !== void 0 && S != null && s(e, ["setup", "proactivity"], S), t;
}
function Vi(n, e) {
  const t = {}, o = i(n, [
    "generationConfig"
  ]);
  e !== void 0 && o != null && s(e, ["setup", "generationConfig"], Li(o));
  const r = i(n, [
    "responseModalities"
  ]);
  e !== void 0 && r != null && s(e, ["setup", "generationConfig", "responseModalities"], r);
  const l = i(n, ["temperature"]);
  e !== void 0 && l != null && s(e, ["setup", "generationConfig", "temperature"], l);
  const a = i(n, ["topP"]);
  e !== void 0 && a != null && s(e, ["setup", "generationConfig", "topP"], a);
  const u = i(n, ["topK"]);
  e !== void 0 && u != null && s(e, ["setup", "generationConfig", "topK"], u);
  const f = i(n, [
    "maxOutputTokens"
  ]);
  e !== void 0 && f != null && s(e, ["setup", "generationConfig", "maxOutputTokens"], f);
  const d = i(n, [
    "mediaResolution"
  ]);
  e !== void 0 && d != null && s(e, ["setup", "generationConfig", "mediaResolution"], d);
  const c = i(n, ["seed"]);
  e !== void 0 && c != null && s(e, ["setup", "generationConfig", "seed"], c);
  const p = i(n, ["speechConfig"]);
  e !== void 0 && p != null && s(e, ["setup", "generationConfig", "speechConfig"], at(Se(p)));
  const m = i(n, [
    "thinkingConfig"
  ]);
  e !== void 0 && m != null && s(e, ["setup", "generationConfig", "thinkingConfig"], m);
  const h = i(n, [
    "enableAffectiveDialog"
  ]);
  e !== void 0 && h != null && s(e, ["setup", "generationConfig", "enableAffectiveDialog"], h);
  const g = i(n, [
    "systemInstruction"
  ]);
  e !== void 0 && g != null && s(e, ["setup", "systemInstruction"], L(g));
  const y = i(n, ["tools"]);
  if (e !== void 0 && y != null) {
    let R = X(y);
    Array.isArray(R) && (R = R.map((M) => Xi(b(M)))), s(e, ["setup", "tools"], R);
  }
  const _ = i(n, [
    "sessionResumption"
  ]);
  e !== void 0 && _ != null && s(e, ["setup", "sessionResumption"], _);
  const v = i(n, [
    "inputAudioTranscription"
  ]);
  e !== void 0 && v != null && s(e, ["setup", "inputAudioTranscription"], v);
  const C = i(n, [
    "outputAudioTranscription"
  ]);
  e !== void 0 && C != null && s(e, ["setup", "outputAudioTranscription"], C);
  const E = i(n, [
    "realtimeInputConfig"
  ]);
  e !== void 0 && E != null && s(e, ["setup", "realtimeInputConfig"], E);
  const I = i(n, [
    "contextWindowCompression"
  ]);
  e !== void 0 && I != null && s(e, ["setup", "contextWindowCompression"], I);
  const S = i(n, ["proactivity"]);
  return e !== void 0 && S != null && s(e, ["setup", "proactivity"], S), t;
}
function qi(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["setup", "model"], P(n, o));
  const r = i(e, ["config"]);
  return r != null && s(t, ["config"], Gi(r, t)), t;
}
function Hi(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["setup", "model"], P(n, o));
  const r = i(e, ["config"]);
  return r != null && s(t, ["config"], Vi(r, t)), t;
}
function Bi(n) {
  const e = {}, t = i(n, [
    "musicGenerationConfig"
  ]);
  return t != null && s(e, ["musicGenerationConfig"], t), e;
}
function Ji(n) {
  const e = {}, t = i(n, [
    "weightedPrompts"
  ]);
  if (t != null) {
    let o = t;
    Array.isArray(o) && (o = o.map((r) => r)), s(e, ["weightedPrompts"], o);
  }
  return e;
}
function $i(n) {
  const e = {}, t = i(n, ["media"]);
  if (t != null) {
    let d = Xn(t);
    Array.isArray(d) && (d = d.map((c) => te(c))), s(e, ["mediaChunks"], d);
  }
  const o = i(n, ["audio"]);
  o != null && s(e, ["audio"], te(Zn(o)));
  const r = i(n, [
    "audioStreamEnd"
  ]);
  r != null && s(e, ["audioStreamEnd"], r);
  const l = i(n, ["video"]);
  l != null && s(e, ["video"], te(Qn(l)));
  const a = i(n, ["text"]);
  a != null && s(e, ["text"], a);
  const u = i(n, [
    "activityStart"
  ]);
  u != null && s(e, ["activityStart"], u);
  const f = i(n, ["activityEnd"]);
  return f != null && s(e, ["activityEnd"], f), e;
}
function Yi(n) {
  const e = {}, t = i(n, ["media"]);
  if (t != null) {
    let d = Xn(t);
    Array.isArray(d) && (d = d.map((c) => c)), s(e, ["mediaChunks"], d);
  }
  const o = i(n, ["audio"]);
  o != null && s(e, ["audio"], Zn(o));
  const r = i(n, [
    "audioStreamEnd"
  ]);
  r != null && s(e, ["audioStreamEnd"], r);
  const l = i(n, ["video"]);
  l != null && s(e, ["video"], Qn(l));
  const a = i(n, ["text"]);
  a != null && s(e, ["text"], a);
  const u = i(n, [
    "activityStart"
  ]);
  u != null && s(e, ["activityStart"], u);
  const f = i(n, ["activityEnd"]);
  return f != null && s(e, ["activityEnd"], f), e;
}
function Wi(n) {
  const e = {}, t = i(n, [
    "setupComplete"
  ]);
  t != null && s(e, ["setupComplete"], t);
  const o = i(n, [
    "serverContent"
  ]);
  o != null && s(e, ["serverContent"], o);
  const r = i(n, ["toolCall"]);
  r != null && s(e, ["toolCall"], r);
  const l = i(n, [
    "toolCallCancellation"
  ]);
  l != null && s(e, ["toolCallCancellation"], l);
  const a = i(n, [
    "usageMetadata"
  ]);
  a != null && s(e, ["usageMetadata"], Qi(a));
  const u = i(n, ["goAway"]);
  u != null && s(e, ["goAway"], u);
  const f = i(n, [
    "sessionResumptionUpdate"
  ]);
  return f != null && s(e, ["sessionResumptionUpdate"], f), e;
}
function Ki(n) {
  const e = {}, t = i(n, ["functionCall"]);
  t != null && s(e, ["functionCall"], t);
  const o = i(n, [
    "codeExecutionResult"
  ]);
  o != null && s(e, ["codeExecutionResult"], o);
  const r = i(n, [
    "executableCode"
  ]);
  r != null && s(e, ["executableCode"], r);
  const l = i(n, ["fileData"]);
  l != null && s(e, ["fileData"], xi(l));
  const a = i(n, [
    "functionResponse"
  ]);
  a != null && s(e, ["functionResponse"], a);
  const u = i(n, ["inlineData"]);
  u != null && s(e, ["inlineData"], te(u));
  const f = i(n, ["text"]);
  f != null && s(e, ["text"], f);
  const d = i(n, ["thought"]);
  d != null && s(e, ["thought"], d);
  const c = i(n, [
    "thoughtSignature"
  ]);
  c != null && s(e, ["thoughtSignature"], c);
  const p = i(n, [
    "videoMetadata"
  ]);
  return p != null && s(e, ["videoMetadata"], p), e;
}
function zi(n) {
  const e = {}, t = i(n, ["handle"]);
  if (t != null && s(e, ["handle"], t), i(n, ["transparent"]) !== void 0)
    throw new Error("transparent parameter is not supported in Gemini API.");
  return e;
}
function at(n) {
  const e = {}, t = i(n, ["languageCode"]);
  t != null && s(e, ["languageCode"], t);
  const o = i(n, ["voiceConfig"]);
  if (o != null && s(e, ["voiceConfig"], o), i(n, ["multiSpeakerVoiceConfig"]) !== void 0)
    throw new Error("multiSpeakerVoiceConfig parameter is not supported in Vertex AI.");
  return e;
}
function bi(n) {
  const e = {}, t = i(n, [
    "functionDeclarations"
  ]);
  if (t != null) {
    let d = t;
    Array.isArray(d) && (d = d.map((c) => c)), s(e, ["functionDeclarations"], d);
  }
  if (i(n, ["retrieval"]) !== void 0)
    throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = i(n, [
    "googleSearchRetrieval"
  ]);
  o != null && s(e, ["googleSearchRetrieval"], o);
  const r = i(n, ["googleMaps"]);
  r != null && s(e, ["googleMaps"], ki(r));
  const l = i(n, ["computerUse"]);
  l != null && s(e, ["computerUse"], l);
  const a = i(n, [
    "codeExecution"
  ]);
  if (a != null && s(e, ["codeExecution"], a), i(n, ["enterpriseWebSearch"]) !== void 0)
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(n, ["googleSearch"]);
  u != null && s(e, ["googleSearch"], Fi(u));
  const f = i(n, ["urlContext"]);
  return f != null && s(e, ["urlContext"], f), e;
}
function Xi(n) {
  const e = {}, t = i(n, [
    "functionDeclarations"
  ]);
  if (t != null) {
    let p = t;
    Array.isArray(p) && (p = p.map((m) => Ui(m))), s(e, ["functionDeclarations"], p);
  }
  const o = i(n, ["retrieval"]);
  o != null && s(e, ["retrieval"], o);
  const r = i(n, [
    "googleSearchRetrieval"
  ]);
  r != null && s(e, ["googleSearchRetrieval"], r);
  const l = i(n, ["googleMaps"]);
  l != null && s(e, ["googleMaps"], l);
  const a = i(n, ["computerUse"]);
  a != null && s(e, ["computerUse"], a);
  const u = i(n, [
    "codeExecution"
  ]);
  u != null && s(e, ["codeExecution"], u);
  const f = i(n, [
    "enterpriseWebSearch"
  ]);
  f != null && s(e, ["enterpriseWebSearch"], f);
  const d = i(n, ["googleSearch"]);
  d != null && s(e, ["googleSearch"], d);
  const c = i(n, ["urlContext"]);
  return c != null && s(e, ["urlContext"], c), e;
}
function Qi(n) {
  const e = {}, t = i(n, [
    "promptTokenCount"
  ]);
  t != null && s(e, ["promptTokenCount"], t);
  const o = i(n, [
    "cachedContentTokenCount"
  ]);
  o != null && s(e, ["cachedContentTokenCount"], o);
  const r = i(n, [
    "candidatesTokenCount"
  ]);
  r != null && s(e, ["responseTokenCount"], r);
  const l = i(n, [
    "toolUsePromptTokenCount"
  ]);
  l != null && s(e, ["toolUsePromptTokenCount"], l);
  const a = i(n, [
    "thoughtsTokenCount"
  ]);
  a != null && s(e, ["thoughtsTokenCount"], a);
  const u = i(n, [
    "totalTokenCount"
  ]);
  u != null && s(e, ["totalTokenCount"], u);
  const f = i(n, [
    "promptTokensDetails"
  ]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((g) => g)), s(e, ["promptTokensDetails"], h);
  }
  const d = i(n, [
    "cacheTokensDetails"
  ]);
  if (d != null) {
    let h = d;
    Array.isArray(h) && (h = h.map((g) => g)), s(e, ["cacheTokensDetails"], h);
  }
  const c = i(n, [
    "candidatesTokensDetails"
  ]);
  if (c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((g) => g)), s(e, ["responseTokensDetails"], h);
  }
  const p = i(n, [
    "toolUsePromptTokensDetails"
  ]);
  if (p != null) {
    let h = p;
    Array.isArray(h) && (h = h.map((g) => g)), s(e, ["toolUsePromptTokensDetails"], h);
  }
  const m = i(n, ["trafficType"]);
  return m != null && s(e, ["trafficType"], m), e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function Zi(n) {
  const e = {}, t = i(n, ["data"]);
  if (t != null && s(e, ["data"], t), i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function Oi(n) {
  const e = {}, t = i(n, ["content"]);
  t != null && s(e, ["content"], t);
  const o = i(n, [
    "citationMetadata"
  ]);
  o != null && s(e, ["citationMetadata"], ji(o));
  const r = i(n, ["tokenCount"]);
  r != null && s(e, ["tokenCount"], r);
  const l = i(n, ["finishReason"]);
  l != null && s(e, ["finishReason"], l);
  const a = i(n, ["avgLogprobs"]);
  a != null && s(e, ["avgLogprobs"], a);
  const u = i(n, [
    "groundingMetadata"
  ]);
  u != null && s(e, ["groundingMetadata"], u);
  const f = i(n, ["index"]);
  f != null && s(e, ["index"], f);
  const d = i(n, [
    "logprobsResult"
  ]);
  d != null && s(e, ["logprobsResult"], d);
  const c = i(n, [
    "safetyRatings"
  ]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((h) => h)), s(e, ["safetyRatings"], m);
  }
  const p = i(n, [
    "urlContextMetadata"
  ]);
  return p != null && s(e, ["urlContextMetadata"], p), e;
}
function ji(n) {
  const e = {}, t = i(n, ["citationSources"]);
  if (t != null) {
    let o = t;
    Array.isArray(o) && (o = o.map((r) => r)), s(e, ["citations"], o);
  }
  return e;
}
function es(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["contents"]);
  if (r != null) {
    let l = k(r);
    Array.isArray(l) && (l = l.map((a) => a)), s(t, ["contents"], l);
  }
  return t;
}
function ns(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["tokensInfo"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((l) => l)), s(e, ["tokensInfo"], r);
  }
  return e;
}
function ts(n) {
  const e = {}, t = i(n, ["values"]);
  t != null && s(e, ["values"], t);
  const o = i(n, ["statistics"]);
  return o != null && s(e, ["statistics"], os(o)), e;
}
function os(n) {
  const e = {}, t = i(n, ["truncated"]);
  t != null && s(e, ["truncated"], t);
  const o = i(n, ["token_count"]);
  return o != null && s(e, ["tokenCount"], o), e;
}
function re(n) {
  const e = {}, t = i(n, ["parts"]);
  if (t != null) {
    let r = t;
    Array.isArray(r) && (r = r.map((l) => ar(l))), s(e, ["parts"], r);
  }
  const o = i(n, ["role"]);
  return o != null && s(e, ["role"], o), e;
}
function is(n) {
  const e = {}, t = i(n, ["controlType"]);
  t != null && s(e, ["controlType"], t);
  const o = i(n, [
    "enableControlImageComputation"
  ]);
  return o != null && s(e, ["computeControl"], o), e;
}
function ss(n) {
  const e = {};
  if (i(n, ["systemInstruction"]) !== void 0)
    throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (i(n, ["tools"]) !== void 0)
    throw new Error("tools parameter is not supported in Gemini API.");
  if (i(n, ["generationConfig"]) !== void 0)
    throw new Error("generationConfig parameter is not supported in Gemini API.");
  return e;
}
function rs(n, e) {
  const t = {}, o = i(n, [
    "systemInstruction"
  ]);
  e !== void 0 && o != null && s(e, ["systemInstruction"], L(o));
  const r = i(n, ["tools"]);
  if (e !== void 0 && r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => pt(u))), s(e, ["tools"], a);
  }
  const l = i(n, [
    "generationConfig"
  ]);
  return e !== void 0 && l != null && s(e, ["generationConfig"], Xs(l)), t;
}
function ls(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["contents"]);
  if (r != null) {
    let a = k(r);
    Array.isArray(a) && (a = a.map((u) => re(u))), s(t, ["contents"], a);
  }
  const l = i(e, ["config"]);
  return l != null && ss(l), t;
}
function as(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["contents"]);
  if (r != null) {
    let a = k(r);
    Array.isArray(a) && (a = a.map((u) => u)), s(t, ["contents"], a);
  }
  const l = i(e, ["config"]);
  return l != null && rs(l, t), t;
}
function us(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["totalTokens"]);
  o != null && s(e, ["totalTokens"], o);
  const r = i(n, [
    "cachedContentTokenCount"
  ]);
  return r != null && s(e, ["cachedContentTokenCount"], r), e;
}
function ds(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["totalTokens"]);
  return o != null && s(e, ["totalTokens"], o), e;
}
function fs(n, e) {
  const t = {}, o = i(e, ["model"]);
  return o != null && s(t, ["_url", "name"], P(n, o)), t;
}
function cs(n, e) {
  const t = {}, o = i(e, ["model"]);
  return o != null && s(t, ["_url", "name"], P(n, o)), t;
}
function ps(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  return t != null && s(e, ["sdkHttpResponse"], t), e;
}
function ms(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  return t != null && s(e, ["sdkHttpResponse"], t), e;
}
function hs(n, e) {
  const t = {}, o = i(n, ["outputGcsUri"]);
  e !== void 0 && o != null && s(e, ["parameters", "storageUri"], o);
  const r = i(n, [
    "negativePrompt"
  ]);
  e !== void 0 && r != null && s(e, ["parameters", "negativePrompt"], r);
  const l = i(n, [
    "numberOfImages"
  ]);
  e !== void 0 && l != null && s(e, ["parameters", "sampleCount"], l);
  const a = i(n, ["aspectRatio"]);
  e !== void 0 && a != null && s(e, ["parameters", "aspectRatio"], a);
  const u = i(n, [
    "guidanceScale"
  ]);
  e !== void 0 && u != null && s(e, ["parameters", "guidanceScale"], u);
  const f = i(n, ["seed"]);
  e !== void 0 && f != null && s(e, ["parameters", "seed"], f);
  const d = i(n, [
    "safetyFilterLevel"
  ]);
  e !== void 0 && d != null && s(e, ["parameters", "safetySetting"], d);
  const c = i(n, [
    "personGeneration"
  ]);
  e !== void 0 && c != null && s(e, ["parameters", "personGeneration"], c);
  const p = i(n, [
    "includeSafetyAttributes"
  ]);
  e !== void 0 && p != null && s(e, ["parameters", "includeSafetyAttributes"], p);
  const m = i(n, [
    "includeRaiReason"
  ]);
  e !== void 0 && m != null && s(e, ["parameters", "includeRaiReason"], m);
  const h = i(n, ["language"]);
  e !== void 0 && h != null && s(e, ["parameters", "language"], h);
  const g = i(n, [
    "outputMimeType"
  ]);
  e !== void 0 && g != null && s(e, ["parameters", "outputOptions", "mimeType"], g);
  const y = i(n, [
    "outputCompressionQuality"
  ]);
  e !== void 0 && y != null && s(e, ["parameters", "outputOptions", "compressionQuality"], y);
  const _ = i(n, ["addWatermark"]);
  e !== void 0 && _ != null && s(e, ["parameters", "addWatermark"], _);
  const v = i(n, ["labels"]);
  e !== void 0 && v != null && s(e, ["labels"], v);
  const C = i(n, ["editMode"]);
  e !== void 0 && C != null && s(e, ["parameters", "editMode"], C);
  const E = i(n, ["baseSteps"]);
  return e !== void 0 && E != null && s(e, ["parameters", "editConfig", "baseSteps"], E), t;
}
function gs(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["prompt"]);
  r != null && s(t, ["instances[0]", "prompt"], r);
  const l = i(e, [
    "referenceImages"
  ]);
  if (l != null) {
    let u = l;
    Array.isArray(u) && (u = u.map((f) => mr(f))), s(t, ["instances[0]", "referenceImages"], u);
  }
  const a = i(e, ["config"]);
  return a != null && hs(a, t), t;
}
function ys(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "predictions"
  ]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((l) => le(l))), s(e, ["generatedImages"], r);
  }
  return e;
}
function Ts(n, e) {
  const t = {}, o = i(n, ["taskType"]);
  e !== void 0 && o != null && s(e, ["requests[]", "taskType"], o);
  const r = i(n, ["title"]);
  e !== void 0 && r != null && s(e, ["requests[]", "title"], r);
  const l = i(n, [
    "outputDimensionality"
  ]);
  if (e !== void 0 && l != null && s(e, ["requests[]", "outputDimensionality"], l), i(n, ["mimeType"]) !== void 0)
    throw new Error("mimeType parameter is not supported in Gemini API.");
  if (i(n, ["autoTruncate"]) !== void 0)
    throw new Error("autoTruncate parameter is not supported in Gemini API.");
  return t;
}
function Es(n, e) {
  const t = {}, o = i(n, ["taskType"]);
  e !== void 0 && o != null && s(e, ["instances[]", "task_type"], o);
  const r = i(n, ["title"]);
  e !== void 0 && r != null && s(e, ["instances[]", "title"], r);
  const l = i(n, [
    "outputDimensionality"
  ]);
  e !== void 0 && l != null && s(e, ["parameters", "outputDimensionality"], l);
  const a = i(n, ["mimeType"]);
  e !== void 0 && a != null && s(e, ["instances[]", "mimeType"], a);
  const u = i(n, ["autoTruncate"]);
  return e !== void 0 && u != null && s(e, ["parameters", "autoTruncate"], u), t;
}
function Cs(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["contents"]);
  if (r != null) {
    let u = _e(n, r);
    Array.isArray(u) && (u = u.map((f) => f)), s(t, ["requests[]", "content"], u);
  }
  const l = i(e, ["config"]);
  l != null && Ts(l, t);
  const a = i(e, ["model"]);
  return a !== void 0 && s(t, ["requests[]", "model"], P(n, a)), t;
}
function _s(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["contents"]);
  if (r != null) {
    let a = _e(n, r);
    Array.isArray(a) && (a = a.map((u) => u)), s(t, ["instances[]", "content"], a);
  }
  const l = i(e, ["config"]);
  return l != null && Es(l, t), t;
}
function Is(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["embeddings"]);
  if (o != null) {
    let l = o;
    Array.isArray(l) && (l = l.map((a) => a)), s(e, ["embeddings"], l);
  }
  const r = i(n, ["metadata"]);
  return r != null && s(e, ["metadata"], r), e;
}
function vs(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "predictions[]",
    "embeddings"
  ]);
  if (o != null) {
    let l = o;
    Array.isArray(l) && (l = l.map((a) => ts(a))), s(e, ["embeddings"], l);
  }
  const r = i(n, ["metadata"]);
  return r != null && s(e, ["metadata"], r), e;
}
function Ss(n) {
  const e = {}, t = i(n, ["endpoint"]);
  t != null && s(e, ["name"], t);
  const o = i(n, [
    "deployedModelId"
  ]);
  return o != null && s(e, ["deployedModelId"], o), e;
}
function As(n) {
  const e = {};
  if (i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const t = i(n, ["fileUri"]);
  t != null && s(e, ["fileUri"], t);
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function Rs(n) {
  const e = {};
  if (i(n, ["behavior"]) !== void 0)
    throw new Error("behavior parameter is not supported in Vertex AI.");
  const t = i(n, ["description"]);
  t != null && s(e, ["description"], t);
  const o = i(n, ["name"]);
  o != null && s(e, ["name"], o);
  const r = i(n, ["parameters"]);
  r != null && s(e, ["parameters"], r);
  const l = i(n, [
    "parametersJsonSchema"
  ]);
  l != null && s(e, ["parametersJsonSchema"], l);
  const a = i(n, ["response"]);
  a != null && s(e, ["response"], a);
  const u = i(n, [
    "responseJsonSchema"
  ]);
  return u != null && s(e, ["responseJsonSchema"], u), e;
}
function Ms(n, e, t) {
  const o = {}, r = i(e, [
    "systemInstruction"
  ]);
  t !== void 0 && r != null && s(t, ["systemInstruction"], re(L(r)));
  const l = i(e, ["temperature"]);
  l != null && s(o, ["temperature"], l);
  const a = i(e, ["topP"]);
  a != null && s(o, ["topP"], a);
  const u = i(e, ["topK"]);
  u != null && s(o, ["topK"], u);
  const f = i(e, [
    "candidateCount"
  ]);
  f != null && s(o, ["candidateCount"], f);
  const d = i(e, [
    "maxOutputTokens"
  ]);
  d != null && s(o, ["maxOutputTokens"], d);
  const c = i(e, [
    "stopSequences"
  ]);
  c != null && s(o, ["stopSequences"], c);
  const p = i(e, [
    "responseLogprobs"
  ]);
  p != null && s(o, ["responseLogprobs"], p);
  const m = i(e, ["logprobs"]);
  m != null && s(o, ["logprobs"], m);
  const h = i(e, [
    "presencePenalty"
  ]);
  h != null && s(o, ["presencePenalty"], h);
  const g = i(e, [
    "frequencyPenalty"
  ]);
  g != null && s(o, ["frequencyPenalty"], g);
  const y = i(e, ["seed"]);
  y != null && s(o, ["seed"], y);
  const _ = i(e, [
    "responseMimeType"
  ]);
  _ != null && s(o, ["responseMimeType"], _);
  const v = i(e, [
    "responseSchema"
  ]);
  v != null && s(o, ["responseSchema"], Ie(v));
  const C = i(e, [
    "responseJsonSchema"
  ]);
  if (C != null && s(o, ["responseJsonSchema"], C), i(e, ["routingConfig"]) !== void 0)
    throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(e, ["modelSelectionConfig"]) !== void 0)
    throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const E = i(e, [
    "safetySettings"
  ]);
  if (t !== void 0 && E != null) {
    let D = E;
    Array.isArray(D) && (D = D.map((G) => hr(G))), s(t, ["safetySettings"], D);
  }
  const I = i(e, ["tools"]);
  if (t !== void 0 && I != null) {
    let D = X(I);
    Array.isArray(D) && (D = D.map((G) => _r(b(G)))), s(t, ["tools"], D);
  }
  const S = i(e, ["toolConfig"]);
  if (t !== void 0 && S != null && s(t, ["toolConfig"], S), i(e, ["labels"]) !== void 0)
    throw new Error("labels parameter is not supported in Gemini API.");
  const R = i(e, [
    "cachedContent"
  ]);
  t !== void 0 && R != null && s(t, ["cachedContent"], q(n, R));
  const M = i(e, [
    "responseModalities"
  ]);
  M != null && s(o, ["responseModalities"], M);
  const U = i(e, [
    "mediaResolution"
  ]);
  U != null && s(o, ["mediaResolution"], U);
  const A = i(e, ["speechConfig"]);
  if (A != null && s(o, ["speechConfig"], ve(A)), i(e, ["audioTimestamp"]) !== void 0)
    throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const N = i(e, [
    "thinkingConfig"
  ]);
  N != null && s(o, ["thinkingConfig"], N);
  const x = i(e, ["imageConfig"]);
  return x != null && s(o, ["imageConfig"], x), o;
}
function Ps(n, e, t) {
  const o = {}, r = i(e, [
    "systemInstruction"
  ]);
  t !== void 0 && r != null && s(t, ["systemInstruction"], L(r));
  const l = i(e, ["temperature"]);
  l != null && s(o, ["temperature"], l);
  const a = i(e, ["topP"]);
  a != null && s(o, ["topP"], a);
  const u = i(e, ["topK"]);
  u != null && s(o, ["topK"], u);
  const f = i(e, [
    "candidateCount"
  ]);
  f != null && s(o, ["candidateCount"], f);
  const d = i(e, [
    "maxOutputTokens"
  ]);
  d != null && s(o, ["maxOutputTokens"], d);
  const c = i(e, [
    "stopSequences"
  ]);
  c != null && s(o, ["stopSequences"], c);
  const p = i(e, [
    "responseLogprobs"
  ]);
  p != null && s(o, ["responseLogprobs"], p);
  const m = i(e, ["logprobs"]);
  m != null && s(o, ["logprobs"], m);
  const h = i(e, [
    "presencePenalty"
  ]);
  h != null && s(o, ["presencePenalty"], h);
  const g = i(e, [
    "frequencyPenalty"
  ]);
  g != null && s(o, ["frequencyPenalty"], g);
  const y = i(e, ["seed"]);
  y != null && s(o, ["seed"], y);
  const _ = i(e, [
    "responseMimeType"
  ]);
  _ != null && s(o, ["responseMimeType"], _);
  const v = i(e, [
    "responseSchema"
  ]);
  v != null && s(o, ["responseSchema"], Ie(v));
  const C = i(e, [
    "responseJsonSchema"
  ]);
  C != null && s(o, ["responseJsonSchema"], C);
  const E = i(e, [
    "routingConfig"
  ]);
  E != null && s(o, ["routingConfig"], E);
  const I = i(e, [
    "modelSelectionConfig"
  ]);
  I != null && s(o, ["modelConfig"], I);
  const S = i(e, [
    "safetySettings"
  ]);
  if (t !== void 0 && S != null) {
    let V = S;
    Array.isArray(V) && (V = V.map((ue) => ue)), s(t, ["safetySettings"], V);
  }
  const R = i(e, ["tools"]);
  if (t !== void 0 && R != null) {
    let V = X(R);
    Array.isArray(V) && (V = V.map((ue) => pt(b(ue)))), s(t, ["tools"], V);
  }
  const M = i(e, ["toolConfig"]);
  t !== void 0 && M != null && s(t, ["toolConfig"], M);
  const U = i(e, ["labels"]);
  t !== void 0 && U != null && s(t, ["labels"], U);
  const A = i(e, [
    "cachedContent"
  ]);
  t !== void 0 && A != null && s(t, ["cachedContent"], q(n, A));
  const N = i(e, [
    "responseModalities"
  ]);
  N != null && s(o, ["responseModalities"], N);
  const x = i(e, [
    "mediaResolution"
  ]);
  x != null && s(o, ["mediaResolution"], x);
  const D = i(e, ["speechConfig"]);
  D != null && s(o, ["speechConfig"], ct(ve(D)));
  const G = i(e, [
    "audioTimestamp"
  ]);
  G != null && s(o, ["audioTimestamp"], G);
  const Re = i(e, [
    "thinkingConfig"
  ]);
  Re != null && s(o, ["thinkingConfig"], Re);
  const Me = i(e, ["imageConfig"]);
  return Me != null && s(o, ["imageConfig"], Me), o;
}
function Gn(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["contents"]);
  if (r != null) {
    let a = k(r);
    Array.isArray(a) && (a = a.map((u) => re(u))), s(t, ["contents"], a);
  }
  const l = i(e, ["config"]);
  return l != null && s(t, ["generationConfig"], Ms(n, l, t)), t;
}
function Vn(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["contents"]);
  if (r != null) {
    let a = k(r);
    Array.isArray(a) && (a = a.map((u) => u)), s(t, ["contents"], a);
  }
  const l = i(e, ["config"]);
  return l != null && s(t, ["generationConfig"], Ps(n, l, t)), t;
}
function qn(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["candidates"]);
  if (o != null) {
    let f = o;
    Array.isArray(f) && (f = f.map((d) => Oi(d))), s(e, ["candidates"], f);
  }
  const r = i(n, ["modelVersion"]);
  r != null && s(e, ["modelVersion"], r);
  const l = i(n, [
    "promptFeedback"
  ]);
  l != null && s(e, ["promptFeedback"], l);
  const a = i(n, ["responseId"]);
  a != null && s(e, ["responseId"], a);
  const u = i(n, [
    "usageMetadata"
  ]);
  return u != null && s(e, ["usageMetadata"], u), e;
}
function Hn(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((c) => c)), s(e, ["candidates"], d);
  }
  const r = i(n, ["createTime"]);
  r != null && s(e, ["createTime"], r);
  const l = i(n, ["modelVersion"]);
  l != null && s(e, ["modelVersion"], l);
  const a = i(n, [
    "promptFeedback"
  ]);
  a != null && s(e, ["promptFeedback"], a);
  const u = i(n, ["responseId"]);
  u != null && s(e, ["responseId"], u);
  const f = i(n, [
    "usageMetadata"
  ]);
  return f != null && s(e, ["usageMetadata"], f), e;
}
function Ns(n, e) {
  const t = {};
  if (i(n, ["outputGcsUri"]) !== void 0)
    throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (i(n, ["negativePrompt"]) !== void 0)
    throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const o = i(n, [
    "numberOfImages"
  ]);
  e !== void 0 && o != null && s(e, ["parameters", "sampleCount"], o);
  const r = i(n, ["aspectRatio"]);
  e !== void 0 && r != null && s(e, ["parameters", "aspectRatio"], r);
  const l = i(n, [
    "guidanceScale"
  ]);
  if (e !== void 0 && l != null && s(e, ["parameters", "guidanceScale"], l), i(n, ["seed"]) !== void 0)
    throw new Error("seed parameter is not supported in Gemini API.");
  const a = i(n, [
    "safetyFilterLevel"
  ]);
  e !== void 0 && a != null && s(e, ["parameters", "safetySetting"], a);
  const u = i(n, [
    "personGeneration"
  ]);
  e !== void 0 && u != null && s(e, ["parameters", "personGeneration"], u);
  const f = i(n, [
    "includeSafetyAttributes"
  ]);
  e !== void 0 && f != null && s(e, ["parameters", "includeSafetyAttributes"], f);
  const d = i(n, [
    "includeRaiReason"
  ]);
  e !== void 0 && d != null && s(e, ["parameters", "includeRaiReason"], d);
  const c = i(n, ["language"]);
  e !== void 0 && c != null && s(e, ["parameters", "language"], c);
  const p = i(n, [
    "outputMimeType"
  ]);
  e !== void 0 && p != null && s(e, ["parameters", "outputOptions", "mimeType"], p);
  const m = i(n, [
    "outputCompressionQuality"
  ]);
  if (e !== void 0 && m != null && s(e, ["parameters", "outputOptions", "compressionQuality"], m), i(n, ["addWatermark"]) !== void 0)
    throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (i(n, ["labels"]) !== void 0)
    throw new Error("labels parameter is not supported in Gemini API.");
  const h = i(n, ["imageSize"]);
  if (e !== void 0 && h != null && s(e, ["parameters", "sampleImageSize"], h), i(n, ["enhancePrompt"]) !== void 0)
    throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return t;
}
function ws(n, e) {
  const t = {}, o = i(n, ["outputGcsUri"]);
  e !== void 0 && o != null && s(e, ["parameters", "storageUri"], o);
  const r = i(n, [
    "negativePrompt"
  ]);
  e !== void 0 && r != null && s(e, ["parameters", "negativePrompt"], r);
  const l = i(n, [
    "numberOfImages"
  ]);
  e !== void 0 && l != null && s(e, ["parameters", "sampleCount"], l);
  const a = i(n, ["aspectRatio"]);
  e !== void 0 && a != null && s(e, ["parameters", "aspectRatio"], a);
  const u = i(n, [
    "guidanceScale"
  ]);
  e !== void 0 && u != null && s(e, ["parameters", "guidanceScale"], u);
  const f = i(n, ["seed"]);
  e !== void 0 && f != null && s(e, ["parameters", "seed"], f);
  const d = i(n, [
    "safetyFilterLevel"
  ]);
  e !== void 0 && d != null && s(e, ["parameters", "safetySetting"], d);
  const c = i(n, [
    "personGeneration"
  ]);
  e !== void 0 && c != null && s(e, ["parameters", "personGeneration"], c);
  const p = i(n, [
    "includeSafetyAttributes"
  ]);
  e !== void 0 && p != null && s(e, ["parameters", "includeSafetyAttributes"], p);
  const m = i(n, [
    "includeRaiReason"
  ]);
  e !== void 0 && m != null && s(e, ["parameters", "includeRaiReason"], m);
  const h = i(n, ["language"]);
  e !== void 0 && h != null && s(e, ["parameters", "language"], h);
  const g = i(n, [
    "outputMimeType"
  ]);
  e !== void 0 && g != null && s(e, ["parameters", "outputOptions", "mimeType"], g);
  const y = i(n, [
    "outputCompressionQuality"
  ]);
  e !== void 0 && y != null && s(e, ["parameters", "outputOptions", "compressionQuality"], y);
  const _ = i(n, ["addWatermark"]);
  e !== void 0 && _ != null && s(e, ["parameters", "addWatermark"], _);
  const v = i(n, ["labels"]);
  e !== void 0 && v != null && s(e, ["labels"], v);
  const C = i(n, ["imageSize"]);
  e !== void 0 && C != null && s(e, ["parameters", "sampleImageSize"], C);
  const E = i(n, [
    "enhancePrompt"
  ]);
  return e !== void 0 && E != null && s(e, ["parameters", "enhancePrompt"], E), t;
}
function Ds(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["prompt"]);
  r != null && s(t, ["instances[0]", "prompt"], r);
  const l = i(e, ["config"]);
  return l != null && Ns(l, t), t;
}
function xs(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["prompt"]);
  r != null && s(t, ["instances[0]", "prompt"], r);
  const l = i(e, ["config"]);
  return l != null && ws(l, t), t;
}
function Us(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "predictions"
  ]);
  if (o != null) {
    let l = o;
    Array.isArray(l) && (l = l.map((a) => Ws(a))), s(e, ["generatedImages"], l);
  }
  const r = i(n, [
    "positivePromptSafetyAttributes"
  ]);
  return r != null && s(e, ["positivePromptSafetyAttributes"], dt(r)), e;
}
function Ls(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "predictions"
  ]);
  if (o != null) {
    let l = o;
    Array.isArray(l) && (l = l.map((a) => le(a))), s(e, ["generatedImages"], l);
  }
  const r = i(n, [
    "positivePromptSafetyAttributes"
  ]);
  return r != null && s(e, ["positivePromptSafetyAttributes"], ft(r)), e;
}
function ks(n, e) {
  const t = {}, o = i(n, [
    "numberOfVideos"
  ]);
  if (e !== void 0 && o != null && s(e, ["parameters", "sampleCount"], o), i(n, ["outputGcsUri"]) !== void 0)
    throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (i(n, ["fps"]) !== void 0)
    throw new Error("fps parameter is not supported in Gemini API.");
  const r = i(n, [
    "durationSeconds"
  ]);
  if (e !== void 0 && r != null && s(e, ["parameters", "durationSeconds"], r), i(n, ["seed"]) !== void 0)
    throw new Error("seed parameter is not supported in Gemini API.");
  const l = i(n, ["aspectRatio"]);
  e !== void 0 && l != null && s(e, ["parameters", "aspectRatio"], l);
  const a = i(n, ["resolution"]);
  e !== void 0 && a != null && s(e, ["parameters", "resolution"], a);
  const u = i(n, [
    "personGeneration"
  ]);
  if (e !== void 0 && u != null && s(e, ["parameters", "personGeneration"], u), i(n, ["pubsubTopic"]) !== void 0)
    throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const f = i(n, [
    "negativePrompt"
  ]);
  e !== void 0 && f != null && s(e, ["parameters", "negativePrompt"], f);
  const d = i(n, [
    "enhancePrompt"
  ]);
  if (e !== void 0 && d != null && s(e, ["parameters", "enhancePrompt"], d), i(n, ["generateAudio"]) !== void 0)
    throw new Error("generateAudio parameter is not supported in Gemini API.");
  const c = i(n, ["lastFrame"]);
  e !== void 0 && c != null && s(e, ["instances[0]", "lastFrame"], ae(c));
  const p = i(n, [
    "referenceImages"
  ]);
  if (e !== void 0 && p != null) {
    let m = p;
    Array.isArray(m) && (m = m.map((h) => Lr(h))), s(e, ["instances[0]", "referenceImages"], m);
  }
  if (i(n, ["mask"]) !== void 0)
    throw new Error("mask parameter is not supported in Gemini API.");
  if (i(n, ["compressionQuality"]) !== void 0)
    throw new Error("compressionQuality parameter is not supported in Gemini API.");
  return t;
}
function Fs(n, e) {
  const t = {}, o = i(n, [
    "numberOfVideos"
  ]);
  e !== void 0 && o != null && s(e, ["parameters", "sampleCount"], o);
  const r = i(n, ["outputGcsUri"]);
  e !== void 0 && r != null && s(e, ["parameters", "storageUri"], r);
  const l = i(n, ["fps"]);
  e !== void 0 && l != null && s(e, ["parameters", "fps"], l);
  const a = i(n, [
    "durationSeconds"
  ]);
  e !== void 0 && a != null && s(e, ["parameters", "durationSeconds"], a);
  const u = i(n, ["seed"]);
  e !== void 0 && u != null && s(e, ["parameters", "seed"], u);
  const f = i(n, ["aspectRatio"]);
  e !== void 0 && f != null && s(e, ["parameters", "aspectRatio"], f);
  const d = i(n, ["resolution"]);
  e !== void 0 && d != null && s(e, ["parameters", "resolution"], d);
  const c = i(n, [
    "personGeneration"
  ]);
  e !== void 0 && c != null && s(e, ["parameters", "personGeneration"], c);
  const p = i(n, ["pubsubTopic"]);
  e !== void 0 && p != null && s(e, ["parameters", "pubsubTopic"], p);
  const m = i(n, [
    "negativePrompt"
  ]);
  e !== void 0 && m != null && s(e, ["parameters", "negativePrompt"], m);
  const h = i(n, [
    "enhancePrompt"
  ]);
  e !== void 0 && h != null && s(e, ["parameters", "enhancePrompt"], h);
  const g = i(n, [
    "generateAudio"
  ]);
  e !== void 0 && g != null && s(e, ["parameters", "generateAudio"], g);
  const y = i(n, ["lastFrame"]);
  e !== void 0 && y != null && s(e, ["instances[0]", "lastFrame"], F(y));
  const _ = i(n, [
    "referenceImages"
  ]);
  if (e !== void 0 && _ != null) {
    let E = _;
    Array.isArray(E) && (E = E.map((I) => kr(I))), s(e, ["instances[0]", "referenceImages"], E);
  }
  const v = i(n, ["mask"]);
  e !== void 0 && v != null && s(e, ["instances[0]", "mask"], Ur(v));
  const C = i(n, [
    "compressionQuality"
  ]);
  return e !== void 0 && C != null && s(e, ["parameters", "compressionQuality"], C), t;
}
function Gs(n) {
  const e = {}, t = i(n, ["name"]);
  t != null && s(e, ["name"], t);
  const o = i(n, ["metadata"]);
  o != null && s(e, ["metadata"], o);
  const r = i(n, ["done"]);
  r != null && s(e, ["done"], r);
  const l = i(n, ["error"]);
  l != null && s(e, ["error"], l);
  const a = i(n, [
    "response",
    "generateVideoResponse"
  ]);
  return a != null && s(e, ["response"], Bs(a)), e;
}
function Vs(n) {
  const e = {}, t = i(n, ["name"]);
  t != null && s(e, ["name"], t);
  const o = i(n, ["metadata"]);
  o != null && s(e, ["metadata"], o);
  const r = i(n, ["done"]);
  r != null && s(e, ["done"], r);
  const l = i(n, ["error"]);
  l != null && s(e, ["error"], l);
  const a = i(n, ["response"]);
  return a != null && s(e, ["response"], Js(a)), e;
}
function qs(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["prompt"]);
  r != null && s(t, ["instances[0]", "prompt"], r);
  const l = i(e, ["image"]);
  l != null && s(t, ["instances[0]", "image"], ae(l));
  const a = i(e, ["video"]);
  a != null && s(t, ["instances[0]", "video"], mt(a));
  const u = i(e, ["source"]);
  u != null && $s(u, t);
  const f = i(e, ["config"]);
  return f != null && ks(f, t), t;
}
function Hs(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["prompt"]);
  r != null && s(t, ["instances[0]", "prompt"], r);
  const l = i(e, ["image"]);
  l != null && s(t, ["instances[0]", "image"], F(l));
  const a = i(e, ["video"]);
  a != null && s(t, ["instances[0]", "video"], ht(a));
  const u = i(e, ["source"]);
  u != null && Ys(u, t);
  const f = i(e, ["config"]);
  return f != null && Fs(f, t), t;
}
function Bs(n) {
  const e = {}, t = i(n, [
    "generatedSamples"
  ]);
  if (t != null) {
    let l = t;
    Array.isArray(l) && (l = l.map((a) => zs(a))), s(e, ["generatedVideos"], l);
  }
  const o = i(n, [
    "raiMediaFilteredCount"
  ]);
  o != null && s(e, ["raiMediaFilteredCount"], o);
  const r = i(n, [
    "raiMediaFilteredReasons"
  ]);
  return r != null && s(e, ["raiMediaFilteredReasons"], r), e;
}
function Js(n) {
  const e = {}, t = i(n, ["videos"]);
  if (t != null) {
    let l = t;
    Array.isArray(l) && (l = l.map((a) => bs(a))), s(e, ["generatedVideos"], l);
  }
  const o = i(n, [
    "raiMediaFilteredCount"
  ]);
  o != null && s(e, ["raiMediaFilteredCount"], o);
  const r = i(n, [
    "raiMediaFilteredReasons"
  ]);
  return r != null && s(e, ["raiMediaFilteredReasons"], r), e;
}
function $s(n, e) {
  const t = {}, o = i(n, ["prompt"]);
  e !== void 0 && o != null && s(e, ["instances[0]", "prompt"], o);
  const r = i(n, ["image"]);
  e !== void 0 && r != null && s(e, ["instances[0]", "image"], ae(r));
  const l = i(n, ["video"]);
  return e !== void 0 && l != null && s(e, ["instances[0]", "video"], mt(l)), t;
}
function Ys(n, e) {
  const t = {}, o = i(n, ["prompt"]);
  e !== void 0 && o != null && s(e, ["instances[0]", "prompt"], o);
  const r = i(n, ["image"]);
  e !== void 0 && r != null && s(e, ["instances[0]", "image"], F(r));
  const l = i(n, ["video"]);
  return e !== void 0 && l != null && s(e, ["instances[0]", "video"], ht(l)), t;
}
function Ws(n) {
  const e = {}, t = i(n, ["_self"]);
  t != null && s(e, ["image"], er(t));
  const o = i(n, [
    "raiFilteredReason"
  ]);
  o != null && s(e, ["raiFilteredReason"], o);
  const r = i(n, ["_self"]);
  return r != null && s(e, ["safetyAttributes"], dt(r)), e;
}
function le(n) {
  const e = {}, t = i(n, ["_self"]);
  t != null && s(e, ["image"], ut(t));
  const o = i(n, [
    "raiFilteredReason"
  ]);
  o != null && s(e, ["raiFilteredReason"], o);
  const r = i(n, ["_self"]);
  r != null && s(e, ["safetyAttributes"], ft(r));
  const l = i(n, ["prompt"]);
  return l != null && s(e, ["enhancedPrompt"], l), e;
}
function Ks(n) {
  const e = {}, t = i(n, ["_self"]);
  t != null && s(e, ["mask"], ut(t));
  const o = i(n, ["labels"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((l) => l)), s(e, ["labels"], r);
  }
  return e;
}
function zs(n) {
  const e = {}, t = i(n, ["video"]);
  return t != null && s(e, ["video"], Dr(t)), e;
}
function bs(n) {
  const e = {}, t = i(n, ["_self"]);
  return t != null && s(e, ["video"], xr(t)), e;
}
function Xs(n) {
  const e = {}, t = i(n, [
    "modelSelectionConfig"
  ]);
  t != null && s(e, ["modelConfig"], t);
  const o = i(n, [
    "audioTimestamp"
  ]);
  o != null && s(e, ["audioTimestamp"], o);
  const r = i(n, [
    "candidateCount"
  ]);
  r != null && s(e, ["candidateCount"], r);
  const l = i(n, [
    "enableAffectiveDialog"
  ]);
  l != null && s(e, ["enableAffectiveDialog"], l);
  const a = i(n, [
    "frequencyPenalty"
  ]);
  a != null && s(e, ["frequencyPenalty"], a);
  const u = i(n, ["logprobs"]);
  u != null && s(e, ["logprobs"], u);
  const f = i(n, [
    "maxOutputTokens"
  ]);
  f != null && s(e, ["maxOutputTokens"], f);
  const d = i(n, [
    "mediaResolution"
  ]);
  d != null && s(e, ["mediaResolution"], d);
  const c = i(n, [
    "presencePenalty"
  ]);
  c != null && s(e, ["presencePenalty"], c);
  const p = i(n, [
    "responseJsonSchema"
  ]);
  p != null && s(e, ["responseJsonSchema"], p);
  const m = i(n, [
    "responseLogprobs"
  ]);
  m != null && s(e, ["responseLogprobs"], m);
  const h = i(n, [
    "responseMimeType"
  ]);
  h != null && s(e, ["responseMimeType"], h);
  const g = i(n, [
    "responseModalities"
  ]);
  g != null && s(e, ["responseModalities"], g);
  const y = i(n, [
    "responseSchema"
  ]);
  y != null && s(e, ["responseSchema"], y);
  const _ = i(n, [
    "routingConfig"
  ]);
  _ != null && s(e, ["routingConfig"], _);
  const v = i(n, ["seed"]);
  v != null && s(e, ["seed"], v);
  const C = i(n, ["speechConfig"]);
  C != null && s(e, ["speechConfig"], ct(C));
  const E = i(n, [
    "stopSequences"
  ]);
  E != null && s(e, ["stopSequences"], E);
  const I = i(n, ["temperature"]);
  I != null && s(e, ["temperature"], I);
  const S = i(n, [
    "thinkingConfig"
  ]);
  S != null && s(e, ["thinkingConfig"], S);
  const R = i(n, ["topK"]);
  R != null && s(e, ["topK"], R);
  const M = i(n, ["topP"]);
  if (M != null && s(e, ["topP"], M), i(n, ["enableEnhancedCivicAnswers"]) !== void 0)
    throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return e;
}
function Qs(n, e) {
  const t = {}, o = i(e, ["model"]);
  return o != null && s(t, ["_url", "name"], P(n, o)), t;
}
function Zs(n, e) {
  const t = {}, o = i(e, ["model"]);
  return o != null && s(t, ["_url", "name"], P(n, o)), t;
}
function Os(n) {
  const e = {};
  if (i(n, ["authConfig"]) !== void 0)
    throw new Error("authConfig parameter is not supported in Gemini API.");
  const t = i(n, ["enableWidget"]);
  return t != null && s(e, ["enableWidget"], t), e;
}
function js(n) {
  const e = {};
  if (i(n, ["excludeDomains"]) !== void 0)
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const t = i(n, [
    "timeRangeFilter"
  ]);
  return t != null && s(e, ["timeRangeFilter"], t), e;
}
function er(n) {
  const e = {}, t = i(n, [
    "bytesBase64Encoded"
  ]);
  t != null && s(e, ["imageBytes"], B(t));
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function ut(n) {
  const e = {}, t = i(n, ["gcsUri"]);
  t != null && s(e, ["gcsUri"], t);
  const o = i(n, [
    "bytesBase64Encoded"
  ]);
  o != null && s(e, ["imageBytes"], B(o));
  const r = i(n, ["mimeType"]);
  return r != null && s(e, ["mimeType"], r), e;
}
function ae(n) {
  const e = {};
  if (i(n, ["gcsUri"]) !== void 0)
    throw new Error("gcsUri parameter is not supported in Gemini API.");
  const t = i(n, ["imageBytes"]);
  t != null && s(e, ["bytesBase64Encoded"], B(t));
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function F(n) {
  const e = {}, t = i(n, ["gcsUri"]);
  t != null && s(e, ["gcsUri"], t);
  const o = i(n, ["imageBytes"]);
  o != null && s(e, ["bytesBase64Encoded"], B(o));
  const r = i(n, ["mimeType"]);
  return r != null && s(e, ["mimeType"], r), e;
}
function nr(n, e, t) {
  const o = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && s(t, ["_query", "pageSize"], r);
  const l = i(e, ["pageToken"]);
  t !== void 0 && l != null && s(t, ["_query", "pageToken"], l);
  const a = i(e, ["filter"]);
  t !== void 0 && a != null && s(t, ["_query", "filter"], a);
  const u = i(e, ["queryBase"]);
  return t !== void 0 && u != null && s(t, ["_url", "models_url"], nt(n, u)), o;
}
function tr(n, e, t) {
  const o = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && s(t, ["_query", "pageSize"], r);
  const l = i(e, ["pageToken"]);
  t !== void 0 && l != null && s(t, ["_query", "pageToken"], l);
  const a = i(e, ["filter"]);
  t !== void 0 && a != null && s(t, ["_query", "filter"], a);
  const u = i(e, ["queryBase"]);
  return t !== void 0 && u != null && s(t, ["_url", "models_url"], nt(n, u)), o;
}
function or(n, e) {
  const t = {}, o = i(e, ["config"]);
  return o != null && nr(n, o, t), t;
}
function ir(n, e) {
  const t = {}, o = i(e, ["config"]);
  return o != null && tr(n, o, t), t;
}
function sr(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "nextPageToken"
  ]);
  o != null && s(e, ["nextPageToken"], o);
  const r = i(n, ["_self"]);
  if (r != null) {
    let l = tt(r);
    Array.isArray(l) && (l = l.map((a) => ge(a))), s(e, ["models"], l);
  }
  return e;
}
function rr(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "nextPageToken"
  ]);
  o != null && s(e, ["nextPageToken"], o);
  const r = i(n, ["_self"]);
  if (r != null) {
    let l = tt(r);
    Array.isArray(l) && (l = l.map((a) => ye(a))), s(e, ["models"], l);
  }
  return e;
}
function lr(n) {
  const e = {}, t = i(n, ["maskMode"]);
  t != null && s(e, ["maskMode"], t);
  const o = i(n, [
    "segmentationClasses"
  ]);
  o != null && s(e, ["maskClasses"], o);
  const r = i(n, ["maskDilation"]);
  return r != null && s(e, ["dilation"], r), e;
}
function ge(n) {
  const e = {}, t = i(n, ["name"]);
  t != null && s(e, ["name"], t);
  const o = i(n, ["displayName"]);
  o != null && s(e, ["displayName"], o);
  const r = i(n, ["description"]);
  r != null && s(e, ["description"], r);
  const l = i(n, ["version"]);
  l != null && s(e, ["version"], l);
  const a = i(n, ["_self"]);
  a != null && s(e, ["tunedModelInfo"], Ir(a));
  const u = i(n, [
    "inputTokenLimit"
  ]);
  u != null && s(e, ["inputTokenLimit"], u);
  const f = i(n, [
    "outputTokenLimit"
  ]);
  f != null && s(e, ["outputTokenLimit"], f);
  const d = i(n, [
    "supportedGenerationMethods"
  ]);
  return d != null && s(e, ["supportedActions"], d), e;
}
function ye(n) {
  const e = {}, t = i(n, ["name"]);
  t != null && s(e, ["name"], t);
  const o = i(n, ["displayName"]);
  o != null && s(e, ["displayName"], o);
  const r = i(n, ["description"]);
  r != null && s(e, ["description"], r);
  const l = i(n, ["versionId"]);
  l != null && s(e, ["version"], l);
  const a = i(n, ["deployedModels"]);
  if (a != null) {
    let p = a;
    Array.isArray(p) && (p = p.map((m) => Ss(m))), s(e, ["endpoints"], p);
  }
  const u = i(n, ["labels"]);
  u != null && s(e, ["labels"], u);
  const f = i(n, ["_self"]);
  f != null && s(e, ["tunedModelInfo"], vr(f));
  const d = i(n, [
    "defaultCheckpointId"
  ]);
  d != null && s(e, ["defaultCheckpointId"], d);
  const c = i(n, ["checkpoints"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), s(e, ["checkpoints"], p);
  }
  return e;
}
function ar(n) {
  const e = {}, t = i(n, ["functionCall"]);
  t != null && s(e, ["functionCall"], t);
  const o = i(n, [
    "codeExecutionResult"
  ]);
  o != null && s(e, ["codeExecutionResult"], o);
  const r = i(n, [
    "executableCode"
  ]);
  r != null && s(e, ["executableCode"], r);
  const l = i(n, ["fileData"]);
  l != null && s(e, ["fileData"], As(l));
  const a = i(n, [
    "functionResponse"
  ]);
  a != null && s(e, ["functionResponse"], a);
  const u = i(n, ["inlineData"]);
  u != null && s(e, ["inlineData"], Zi(u));
  const f = i(n, ["text"]);
  f != null && s(e, ["text"], f);
  const d = i(n, ["thought"]);
  d != null && s(e, ["thought"], d);
  const c = i(n, [
    "thoughtSignature"
  ]);
  c != null && s(e, ["thoughtSignature"], c);
  const p = i(n, [
    "videoMetadata"
  ]);
  return p != null && s(e, ["videoMetadata"], p), e;
}
function ur(n) {
  const e = {}, t = i(n, ["productImage"]);
  return t != null && s(e, ["image"], F(t)), e;
}
function dr(n, e) {
  const t = {}, o = i(n, [
    "numberOfImages"
  ]);
  e !== void 0 && o != null && s(e, ["parameters", "sampleCount"], o);
  const r = i(n, ["baseSteps"]);
  e !== void 0 && r != null && s(e, ["parameters", "editConfig", "baseSteps"], r);
  const l = i(n, ["outputGcsUri"]);
  e !== void 0 && l != null && s(e, ["parameters", "storageUri"], l);
  const a = i(n, ["seed"]);
  e !== void 0 && a != null && s(e, ["parameters", "seed"], a);
  const u = i(n, [
    "safetyFilterLevel"
  ]);
  e !== void 0 && u != null && s(e, ["parameters", "safetySetting"], u);
  const f = i(n, [
    "personGeneration"
  ]);
  e !== void 0 && f != null && s(e, ["parameters", "personGeneration"], f);
  const d = i(n, ["addWatermark"]);
  e !== void 0 && d != null && s(e, ["parameters", "addWatermark"], d);
  const c = i(n, [
    "outputMimeType"
  ]);
  e !== void 0 && c != null && s(e, ["parameters", "outputOptions", "mimeType"], c);
  const p = i(n, [
    "outputCompressionQuality"
  ]);
  e !== void 0 && p != null && s(e, ["parameters", "outputOptions", "compressionQuality"], p);
  const m = i(n, [
    "enhancePrompt"
  ]);
  e !== void 0 && m != null && s(e, ["parameters", "enhancePrompt"], m);
  const h = i(n, ["labels"]);
  return e !== void 0 && h != null && s(e, ["labels"], h), t;
}
function fr(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["source"]);
  r != null && pr(r, t);
  const l = i(e, ["config"]);
  return l != null && dr(l, t), t;
}
function cr(n) {
  const e = {}, t = i(n, [
    "predictions"
  ]);
  if (t != null) {
    let o = t;
    Array.isArray(o) && (o = o.map((r) => le(r))), s(e, ["generatedImages"], o);
  }
  return e;
}
function pr(n, e) {
  const t = {}, o = i(n, ["prompt"]);
  e !== void 0 && o != null && s(e, ["instances[0]", "prompt"], o);
  const r = i(n, ["personImage"]);
  e !== void 0 && r != null && s(e, ["instances[0]", "personImage", "image"], F(r));
  const l = i(n, [
    "productImages"
  ]);
  if (e !== void 0 && l != null) {
    let a = l;
    Array.isArray(a) && (a = a.map((u) => ur(u))), s(e, ["instances[0]", "productImages"], a);
  }
  return t;
}
function mr(n) {
  const e = {}, t = i(n, [
    "referenceImage"
  ]);
  t != null && s(e, ["referenceImage"], F(t));
  const o = i(n, ["referenceId"]);
  o != null && s(e, ["referenceId"], o);
  const r = i(n, [
    "referenceType"
  ]);
  r != null && s(e, ["referenceType"], r);
  const l = i(n, [
    "maskImageConfig"
  ]);
  l != null && s(e, ["maskImageConfig"], lr(l));
  const a = i(n, [
    "controlImageConfig"
  ]);
  a != null && s(e, ["controlImageConfig"], is(a));
  const u = i(n, [
    "styleImageConfig"
  ]);
  u != null && s(e, ["styleImageConfig"], u);
  const f = i(n, [
    "subjectImageConfig"
  ]);
  return f != null && s(e, ["subjectImageConfig"], f), e;
}
function dt(n) {
  const e = {}, t = i(n, [
    "safetyAttributes",
    "categories"
  ]);
  t != null && s(e, ["categories"], t);
  const o = i(n, [
    "safetyAttributes",
    "scores"
  ]);
  o != null && s(e, ["scores"], o);
  const r = i(n, ["contentType"]);
  return r != null && s(e, ["contentType"], r), e;
}
function ft(n) {
  const e = {}, t = i(n, [
    "safetyAttributes",
    "categories"
  ]);
  t != null && s(e, ["categories"], t);
  const o = i(n, [
    "safetyAttributes",
    "scores"
  ]);
  o != null && s(e, ["scores"], o);
  const r = i(n, ["contentType"]);
  return r != null && s(e, ["contentType"], r), e;
}
function hr(n) {
  const e = {}, t = i(n, ["category"]);
  if (t != null && s(e, ["category"], t), i(n, ["method"]) !== void 0)
    throw new Error("method parameter is not supported in Gemini API.");
  const o = i(n, ["threshold"]);
  return o != null && s(e, ["threshold"], o), e;
}
function gr(n) {
  const e = {}, t = i(n, ["image"]);
  return t != null && s(e, ["image"], F(t)), e;
}
function yr(n, e) {
  const t = {}, o = i(n, ["mode"]);
  e !== void 0 && o != null && s(e, ["parameters", "mode"], o);
  const r = i(n, [
    "maxPredictions"
  ]);
  e !== void 0 && r != null && s(e, ["parameters", "maxPredictions"], r);
  const l = i(n, [
    "confidenceThreshold"
  ]);
  e !== void 0 && l != null && s(e, ["parameters", "confidenceThreshold"], l);
  const a = i(n, ["maskDilation"]);
  e !== void 0 && a != null && s(e, ["parameters", "maskDilation"], a);
  const u = i(n, [
    "binaryColorThreshold"
  ]);
  e !== void 0 && u != null && s(e, ["parameters", "binaryColorThreshold"], u);
  const f = i(n, ["labels"]);
  return e !== void 0 && f != null && s(e, ["labels"], f), t;
}
function Tr(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["source"]);
  r != null && Cr(r, t);
  const l = i(e, ["config"]);
  return l != null && yr(l, t), t;
}
function Er(n) {
  const e = {}, t = i(n, ["predictions"]);
  if (t != null) {
    let o = t;
    Array.isArray(o) && (o = o.map((r) => Ks(r))), s(e, ["generatedMasks"], o);
  }
  return e;
}
function Cr(n, e) {
  const t = {}, o = i(n, ["prompt"]);
  e !== void 0 && o != null && s(e, ["instances[0]", "prompt"], o);
  const r = i(n, ["image"]);
  e !== void 0 && r != null && s(e, ["instances[0]", "image"], F(r));
  const l = i(n, [
    "scribbleImage"
  ]);
  return e !== void 0 && l != null && s(e, ["instances[0]", "scribble"], gr(l)), t;
}
function ct(n) {
  const e = {}, t = i(n, ["languageCode"]);
  t != null && s(e, ["languageCode"], t);
  const o = i(n, ["voiceConfig"]);
  if (o != null && s(e, ["voiceConfig"], o), i(n, ["multiSpeakerVoiceConfig"]) !== void 0)
    throw new Error("multiSpeakerVoiceConfig parameter is not supported in Vertex AI.");
  return e;
}
function _r(n) {
  const e = {}, t = i(n, [
    "functionDeclarations"
  ]);
  if (t != null) {
    let d = t;
    Array.isArray(d) && (d = d.map((c) => c)), s(e, ["functionDeclarations"], d);
  }
  if (i(n, ["retrieval"]) !== void 0)
    throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = i(n, [
    "googleSearchRetrieval"
  ]);
  o != null && s(e, ["googleSearchRetrieval"], o);
  const r = i(n, ["googleMaps"]);
  r != null && s(e, ["googleMaps"], Os(r));
  const l = i(n, ["computerUse"]);
  l != null && s(e, ["computerUse"], l);
  const a = i(n, [
    "codeExecution"
  ]);
  if (a != null && s(e, ["codeExecution"], a), i(n, ["enterpriseWebSearch"]) !== void 0)
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(n, ["googleSearch"]);
  u != null && s(e, ["googleSearch"], js(u));
  const f = i(n, ["urlContext"]);
  return f != null && s(e, ["urlContext"], f), e;
}
function pt(n) {
  const e = {}, t = i(n, [
    "functionDeclarations"
  ]);
  if (t != null) {
    let p = t;
    Array.isArray(p) && (p = p.map((m) => Rs(m))), s(e, ["functionDeclarations"], p);
  }
  const o = i(n, ["retrieval"]);
  o != null && s(e, ["retrieval"], o);
  const r = i(n, [
    "googleSearchRetrieval"
  ]);
  r != null && s(e, ["googleSearchRetrieval"], r);
  const l = i(n, ["googleMaps"]);
  l != null && s(e, ["googleMaps"], l);
  const a = i(n, ["computerUse"]);
  a != null && s(e, ["computerUse"], a);
  const u = i(n, [
    "codeExecution"
  ]);
  u != null && s(e, ["codeExecution"], u);
  const f = i(n, [
    "enterpriseWebSearch"
  ]);
  f != null && s(e, ["enterpriseWebSearch"], f);
  const d = i(n, ["googleSearch"]);
  d != null && s(e, ["googleSearch"], d);
  const c = i(n, ["urlContext"]);
  return c != null && s(e, ["urlContext"], c), e;
}
function Ir(n) {
  const e = {}, t = i(n, ["baseModel"]);
  t != null && s(e, ["baseModel"], t);
  const o = i(n, ["createTime"]);
  o != null && s(e, ["createTime"], o);
  const r = i(n, ["updateTime"]);
  return r != null && s(e, ["updateTime"], r), e;
}
function vr(n) {
  const e = {}, t = i(n, [
    "labels",
    "google-vertex-llm-tuning-base-model-id"
  ]);
  t != null && s(e, ["baseModel"], t);
  const o = i(n, ["createTime"]);
  o != null && s(e, ["createTime"], o);
  const r = i(n, ["updateTime"]);
  return r != null && s(e, ["updateTime"], r), e;
}
function Sr(n, e) {
  const t = {}, o = i(n, ["displayName"]);
  e !== void 0 && o != null && s(e, ["displayName"], o);
  const r = i(n, ["description"]);
  e !== void 0 && r != null && s(e, ["description"], r);
  const l = i(n, [
    "defaultCheckpointId"
  ]);
  return e !== void 0 && l != null && s(e, ["defaultCheckpointId"], l), t;
}
function Ar(n, e) {
  const t = {}, o = i(n, ["displayName"]);
  e !== void 0 && o != null && s(e, ["displayName"], o);
  const r = i(n, ["description"]);
  e !== void 0 && r != null && s(e, ["description"], r);
  const l = i(n, [
    "defaultCheckpointId"
  ]);
  return e !== void 0 && l != null && s(e, ["defaultCheckpointId"], l), t;
}
function Rr(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "name"], P(n, o));
  const r = i(e, ["config"]);
  return r != null && Sr(r, t), t;
}
function Mr(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["config"]);
  return r != null && Ar(r, t), t;
}
function Pr(n, e) {
  const t = {}, o = i(n, ["outputGcsUri"]);
  e !== void 0 && o != null && s(e, ["parameters", "storageUri"], o);
  const r = i(n, [
    "safetyFilterLevel"
  ]);
  e !== void 0 && r != null && s(e, ["parameters", "safetySetting"], r);
  const l = i(n, [
    "personGeneration"
  ]);
  e !== void 0 && l != null && s(e, ["parameters", "personGeneration"], l);
  const a = i(n, [
    "includeRaiReason"
  ]);
  e !== void 0 && a != null && s(e, ["parameters", "includeRaiReason"], a);
  const u = i(n, [
    "outputMimeType"
  ]);
  e !== void 0 && u != null && s(e, ["parameters", "outputOptions", "mimeType"], u);
  const f = i(n, [
    "outputCompressionQuality"
  ]);
  e !== void 0 && f != null && s(e, ["parameters", "outputOptions", "compressionQuality"], f);
  const d = i(n, [
    "enhanceInputImage"
  ]);
  e !== void 0 && d != null && s(e, ["parameters", "upscaleConfig", "enhanceInputImage"], d);
  const c = i(n, [
    "imagePreservationFactor"
  ]);
  e !== void 0 && c != null && s(e, ["parameters", "upscaleConfig", "imagePreservationFactor"], c);
  const p = i(n, ["labels"]);
  e !== void 0 && p != null && s(e, ["labels"], p);
  const m = i(n, [
    "numberOfImages"
  ]);
  e !== void 0 && m != null && s(e, ["parameters", "sampleCount"], m);
  const h = i(n, ["mode"]);
  return e !== void 0 && h != null && s(e, ["parameters", "mode"], h), t;
}
function Nr(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["_url", "model"], P(n, o));
  const r = i(e, ["image"]);
  r != null && s(t, ["instances[0]", "image"], F(r));
  const l = i(e, [
    "upscaleFactor"
  ]);
  l != null && s(t, ["parameters", "upscaleConfig", "upscaleFactor"], l);
  const a = i(e, ["config"]);
  return a != null && Pr(a, t), t;
}
function wr(n) {
  const e = {}, t = i(n, [
    "sdkHttpResponse"
  ]);
  t != null && s(e, ["sdkHttpResponse"], t);
  const o = i(n, [
    "predictions"
  ]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((l) => le(l))), s(e, ["generatedImages"], r);
  }
  return e;
}
function Dr(n) {
  const e = {}, t = i(n, ["uri"]);
  t != null && s(e, ["uri"], t);
  const o = i(n, ["encodedVideo"]);
  o != null && s(e, ["videoBytes"], B(o));
  const r = i(n, ["encoding"]);
  return r != null && s(e, ["mimeType"], r), e;
}
function xr(n) {
  const e = {}, t = i(n, ["gcsUri"]);
  t != null && s(e, ["uri"], t);
  const o = i(n, [
    "bytesBase64Encoded"
  ]);
  o != null && s(e, ["videoBytes"], B(o));
  const r = i(n, ["mimeType"]);
  return r != null && s(e, ["mimeType"], r), e;
}
function Ur(n) {
  const e = {}, t = i(n, ["image"]);
  t != null && s(e, ["_self"], F(t));
  const o = i(n, ["maskMode"]);
  return o != null && s(e, ["maskMode"], o), e;
}
function Lr(n) {
  const e = {}, t = i(n, ["image"]);
  t != null && s(e, ["image"], ae(t));
  const o = i(n, [
    "referenceType"
  ]);
  return o != null && s(e, ["referenceType"], o), e;
}
function kr(n) {
  const e = {}, t = i(n, ["image"]);
  t != null && s(e, ["image"], F(t));
  const o = i(n, [
    "referenceType"
  ]);
  return o != null && s(e, ["referenceType"], o), e;
}
function mt(n) {
  const e = {}, t = i(n, ["uri"]);
  t != null && s(e, ["uri"], t);
  const o = i(n, ["videoBytes"]);
  o != null && s(e, ["encodedVideo"], B(o));
  const r = i(n, ["mimeType"]);
  return r != null && s(e, ["encoding"], r), e;
}
function ht(n) {
  const e = {}, t = i(n, ["uri"]);
  t != null && s(e, ["gcsUri"], t);
  const o = i(n, ["videoBytes"]);
  o != null && s(e, ["bytesBase64Encoded"], B(o));
  const r = i(n, ["mimeType"]);
  return r != null && s(e, ["mimeType"], r), e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Fr = "Content-Type", Gr = "X-Server-Timeout", Vr = "User-Agent", Te = "x-goog-api-client", qr = "1.28.0", Hr = `google-genai-sdk/${qr}`, Br = "v1beta1", Jr = "v1beta", Bn = /^\s*data: (.*)(?:\n\n|\r\r|\r\n\r\n)/;
class $r {
  constructor(e) {
    var t, o;
    this.clientOptions = Object.assign(Object.assign({}, e), { project: e.project, location: e.location, apiKey: e.apiKey, vertexai: e.vertexai });
    const r = {};
    this.clientOptions.vertexai ? (r.apiVersion = (t = this.clientOptions.apiVersion) !== null && t !== void 0 ? t : Br, r.baseUrl = this.baseUrlFromProjectLocation(), this.normalizeAuthParameters()) : (r.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : Jr, r.baseUrl = "https://generativelanguage.googleapis.com/"), r.headers = this.getDefaultHeaders(), this.clientOptions.httpOptions = r, e.httpOptions && (this.clientOptions.httpOptions = this.patchHttpOptions(r, e.httpOptions));
  }
  /**
   * Determines the base URL for Vertex AI based on project and location.
   * Uses the global endpoint if location is 'global' or if project/location
   * are not specified (implying API key usage).
   * @private
   */
  baseUrlFromProjectLocation() {
    return this.clientOptions.project && this.clientOptions.location && this.clientOptions.location !== "global" ? `https://${this.clientOptions.location}-aiplatform.googleapis.com/` : "https://aiplatform.googleapis.com/";
  }
  /**
   * Normalizes authentication parameters for Vertex AI.
   * If project and location are provided, API key is cleared.
   * If project and location are not provided (implying API key usage),
   * project and location are cleared.
   * @private
   */
  normalizeAuthParameters() {
    if (this.clientOptions.project && this.clientOptions.location) {
      this.clientOptions.apiKey = void 0;
      return;
    }
    this.clientOptions.project = void 0, this.clientOptions.location = void 0;
  }
  isVertexAI() {
    var e;
    return (e = this.clientOptions.vertexai) !== null && e !== void 0 ? e : !1;
  }
  getProject() {
    return this.clientOptions.project;
  }
  getLocation() {
    return this.clientOptions.location;
  }
  getApiVersion() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.apiVersion !== void 0)
      return this.clientOptions.httpOptions.apiVersion;
    throw new Error("API version is not set.");
  }
  getBaseUrl() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.baseUrl !== void 0)
      return this.clientOptions.httpOptions.baseUrl;
    throw new Error("Base URL is not set.");
  }
  getRequestUrl() {
    return this.getRequestUrlInternal(this.clientOptions.httpOptions);
  }
  getHeaders() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.headers !== void 0)
      return this.clientOptions.httpOptions.headers;
    throw new Error("Headers are not set.");
  }
  getRequestUrlInternal(e) {
    if (!e || e.baseUrl === void 0 || e.apiVersion === void 0)
      throw new Error("HTTP options are not correctly set.");
    const o = [e.baseUrl.endsWith("/") ? e.baseUrl.slice(0, -1) : e.baseUrl];
    return e.apiVersion && e.apiVersion !== "" && o.push(e.apiVersion), o.join("/");
  }
  getBaseResourcePath() {
    return `projects/${this.clientOptions.project}/locations/${this.clientOptions.location}`;
  }
  getApiKey() {
    return this.clientOptions.apiKey;
  }
  getWebsocketBaseUrl() {
    const e = this.getBaseUrl(), t = new URL(e);
    return t.protocol = t.protocol == "http:" ? "ws" : "wss", t.toString();
  }
  setBaseUrl(e) {
    if (this.clientOptions.httpOptions)
      this.clientOptions.httpOptions.baseUrl = e;
    else
      throw new Error("HTTP options are not correctly set.");
  }
  constructUrl(e, t, o) {
    const r = [this.getRequestUrlInternal(t)];
    return o && r.push(this.getBaseResourcePath()), e !== "" && r.push(e), new URL(`${r.join("/")}`);
  }
  shouldPrependVertexProjectPath(e) {
    return !(this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const o = this.shouldPrependVertexProjectPath(e), r = this.constructUrl(e.path, t, o);
    if (e.queryParams)
      for (const [a, u] of Object.entries(e.queryParams))
        r.searchParams.append(a, String(u));
    let l = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}")
        throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else
      l.body = e.body;
    return l = await this.includeExtraHttpOptionsToRequestInit(l, t, r.toString(), e.abortSignal), this.unaryApiCall(r, l, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const o = JSON.parse(JSON.stringify(e));
    for (const [r, l] of Object.entries(t))
      typeof l == "object" ? o[r] = Object.assign(Object.assign({}, o[r]), l) : l !== void 0 && (o[r] = l);
    return o;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const o = this.shouldPrependVertexProjectPath(e), r = this.constructUrl(e.path, t, o);
    (!r.searchParams.has("alt") || r.searchParams.get("alt") !== "sse") && r.searchParams.set("alt", "sse");
    let l = {};
    return l.body = e.body, l = await this.includeExtraHttpOptionsToRequestInit(l, t, r.toString(), e.abortSignal), this.streamApiCall(r, l, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, o, r) {
    if (t && t.timeout || r) {
      const l = new AbortController(), a = l.signal;
      if (t.timeout && (t == null ? void 0 : t.timeout) > 0) {
        const u = setTimeout(() => l.abort(), t.timeout);
        u && typeof u.unref == "function" && u.unref();
      }
      r && r.addEventListener("abort", () => {
        l.abort();
      }), e.signal = a;
    }
    return t && t.extraBody !== null && Yr(e, t.extraBody), e.headers = await this.getHeadersInternal(t, o), e;
  }
  async unaryApiCall(e, t, o) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: o })).then(async (r) => (await Jn(r), new pe(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, o) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: o })).then(async (r) => (await Jn(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    var t;
    return K(this, arguments, function* () {
      const r = (t = e == null ? void 0 : e.body) === null || t === void 0 ? void 0 : t.getReader(), l = new TextDecoder("utf-8");
      if (!r)
        throw new Error("Response body is empty");
      try {
        let a = "";
        for (; ; ) {
          const { done: u, value: f } = yield w(r.read());
          if (u) {
            if (a.trim().length > 0)
              throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const d = l.decode(f, { stream: !0 });
          try {
            const p = JSON.parse(d);
            if ("error" in p) {
              const m = JSON.parse(JSON.stringify(p.error)), h = m.status, g = m.code, y = `got status: ${h}. ${JSON.stringify(p)}`;
              if (g >= 400 && g < 600)
                throw new se({
                  message: y,
                  status: g
                });
            }
          } catch (p) {
            if (p.name === "ApiError")
              throw p;
          }
          a += d;
          let c = a.match(Bn);
          for (; c; ) {
            const p = c[1];
            try {
              const m = new Response(p, {
                headers: e == null ? void 0 : e.headers,
                status: e == null ? void 0 : e.status,
                statusText: e == null ? void 0 : e.statusText
              });
              yield yield w(new pe(m)), a = a.slice(c[0].length), c = a.match(Bn);
            } catch (m) {
              throw new Error(`exception parsing stream chunk ${p}. ${m}`);
            }
          }
        }
      } finally {
        r.releaseLock();
      }
    });
  }
  async apiCall(e, t) {
    return fetch(e, t).catch((o) => {
      throw new Error(`exception ${o} sending request`);
    });
  }
  getDefaultHeaders() {
    const e = {}, t = Hr + " " + this.clientOptions.userAgentExtra;
    return e[Vr] = t, e[Te] = t, e[Fr] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const o = new Headers();
    if (e && e.headers) {
      for (const [r, l] of Object.entries(e.headers))
        o.append(r, l);
      e.timeout && e.timeout > 0 && o.append(Gr, String(Math.ceil(e.timeout / 1e3)));
    }
    return await this.clientOptions.auth.addAuthHeaders(o, t), o;
  }
  /**
   * Uploads a file asynchronously using Gemini API only, this is not supported
   * in Vertex AI.
   *
   * @param file The string path to the file to be uploaded or a Blob object.
   * @param config Optional parameters specified in the `UploadFileConfig`
   *     interface. @see {@link types.UploadFileConfig}
   * @return A promise that resolves to a `File` object.
   * @throws An error if called on a Vertex AI client.
   * @throws An error if the `mimeType` is not provided and can not be inferred,
   */
  async uploadFile(e, t) {
    var o, r;
    const l = {};
    t != null && (l.mimeType = t.mimeType, l.name = t.name, l.displayName = t.displayName), l.name && !l.name.startsWith("files/") && (l.name = `files/${l.name}`);
    const a = this.clientOptions.uploader, u = await a.stat(e);
    l.sizeBytes = String(u.size);
    const f = (o = t == null ? void 0 : t.mimeType) !== null && o !== void 0 ? o : u.type;
    if (f === void 0 || f === "")
      throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    l.mimeType = f;
    let d = "";
    typeof e == "string" && (d = e.replace(/[/\\]+$/, ""), d = (r = d.split(/[/\\]/).pop()) !== null && r !== void 0 ? r : "");
    const c = await this.fetchUploadUrl(l, d, t);
    return a.upload(e, c, this);
  }
  /**
   * Downloads a file asynchronously to the specified path.
   *
   * @params params - The parameters for the download request, see {@link
   * types.DownloadFileParameters}
   */
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, o) {
    var r;
    let l = {};
    o != null && o.httpOptions ? l = o.httpOptions : l = {
      apiVersion: "",
      headers: Object.assign({ "Content-Type": "application/json", "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start", "X-Goog-Upload-Header-Content-Length": `${e.sizeBytes}`, "X-Goog-Upload-Header-Content-Type": `${e.mimeType}` }, t ? { "X-Goog-Upload-File-Name": t } : {})
    };
    const a = {
      file: e
    }, u = await this.request({
      path: T("upload/v1beta/files", a._url),
      body: JSON.stringify(a),
      httpMethod: "POST",
      httpOptions: l
    });
    if (!u || !(u != null && u.headers))
      throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const f = (r = u == null ? void 0 : u.headers) === null || r === void 0 ? void 0 : r["x-goog-upload-url"];
    if (f === void 0)
      throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return f;
  }
}
async function Jn(n) {
  var e;
  if (n === void 0)
    throw new Error("response is undefined");
  if (!n.ok) {
    const t = n.status;
    let o;
    !((e = n.headers.get("content-type")) === null || e === void 0) && e.includes("application/json") ? o = await n.json() : o = {
      error: {
        message: await n.text(),
        code: n.status,
        status: n.statusText
      }
    };
    const r = JSON.stringify(o);
    throw t >= 400 && t < 600 ? new se({
      message: r,
      status: t
    }) : new Error(r);
  }
}
function Yr(n, e) {
  if (!e || Object.keys(e).length === 0)
    return;
  if (n.body instanceof Blob) {
    console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");
    return;
  }
  let t = {};
  if (typeof n.body == "string" && n.body.length > 0)
    try {
      const l = JSON.parse(n.body);
      if (typeof l == "object" && l !== null && !Array.isArray(l))
        t = l;
      else {
        console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");
        return;
      }
    } catch {
      console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");
      return;
    }
  function o(l, a) {
    const u = Object.assign({}, l);
    for (const f in a)
      if (Object.prototype.hasOwnProperty.call(a, f)) {
        const d = a[f], c = u[f];
        d && typeof d == "object" && !Array.isArray(d) && c && typeof c == "object" && !Array.isArray(c) ? u[f] = o(c, d) : (c && d && typeof c != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${f}". Original type: ${typeof c}, New type: ${typeof d}. Overwriting.`), u[f] = d);
      }
    return u;
  }
  const r = o(t, e);
  n.body = JSON.stringify(r);
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Wr = "mcp_used/unknown";
let Kr = !1;
function gt(n) {
  for (const e of n)
    if (zr(e) || typeof e == "object" && "inputSchema" in e)
      return !0;
  return Kr;
}
function yt(n) {
  var e;
  const t = (e = n[Te]) !== null && e !== void 0 ? e : "";
  n[Te] = (t + ` ${Wr}`).trimStart();
}
function zr(n) {
  return n !== null && typeof n == "object" && n instanceof Ae;
}
function br(n, e = 100) {
  return K(this, arguments, function* () {
    let o, r = 0;
    for (; r < e; ) {
      const l = yield w(n.listTools({ cursor: o }));
      for (const a of l.tools)
        yield yield w(a), r++;
      if (!l.nextCursor)
        break;
      o = l.nextCursor;
    }
  });
}
class Ae {
  constructor(e = [], t) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = e, this.config = t;
  }
  /**
   * Creates a McpCallableTool.
   */
  static create(e, t) {
    return new Ae(e, t);
  }
  /**
   * Validates the function names are not duplicate and initialize the function
   * name to MCP client mapping.
   *
   * @throws {Error} if the MCP tools from the MCP clients have duplicate tool
   *     names.
   */
  async initialize() {
    var e, t, o, r;
    if (this.mcpTools.length > 0)
      return;
    const l = {}, a = [];
    for (const c of this.mcpClients)
      try {
        for (var u = !0, f = (t = void 0, O(br(c))), d; d = await f.next(), e = d.done, !e; u = !0) {
          r = d.value, u = !1;
          const p = r;
          a.push(p);
          const m = p.name;
          if (l[m])
            throw new Error(`Duplicate function name ${m} found in MCP tools. Please ensure function names are unique.`);
          l[m] = c;
        }
      } catch (p) {
        t = { error: p };
      } finally {
        try {
          !u && !e && (o = f.return) && await o.call(f);
        } finally {
          if (t) throw t.error;
        }
      }
    this.mcpTools = a, this.functionNameToMcpClient = l;
  }
  async tool() {
    return await this.initialize(), Ot(this.mcpTools, this.config);
  }
  async callTool(e) {
    await this.initialize();
    const t = [];
    for (const o of e)
      if (o.name in this.functionNameToMcpClient) {
        const r = this.functionNameToMcpClient[o.name];
        let l;
        this.config.timeout && (l = {
          timeout: this.config.timeout
        });
        const a = await r.callTool(
          {
            name: o.name,
            arguments: o.args
          },
          // Set the result schema to undefined to allow MCP to rely on the
          // default schema.
          void 0,
          l
        );
        t.push({
          functionResponse: {
            name: o.name,
            response: a.isError ? { error: a } : a
          }
        });
      }
    return t;
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
async function Xr(n, e, t) {
  const o = new Yt();
  let r;
  t.data instanceof Blob ? r = JSON.parse(await t.data.text()) : r = JSON.parse(t.data), Object.assign(o, r), e(o);
}
class Qr {
  constructor(e, t, o) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = o;
  }
  /**
       Establishes a connection to the specified model and returns a
       LiveMusicSession object representing that connection.
  
       @experimental
  
       @remarks
  
       @param params - The parameters for establishing a connection to the model.
       @return A live session.
  
       @example
       ```ts
       let model = 'models/lyria-realtime-exp';
       const session = await ai.live.music.connect({
         model: model,
         callbacks: {
           onmessage: (e: MessageEvent) => {
             console.log('Received message from the server: %s\n', debug(e.data));
           },
           onerror: (e: ErrorEvent) => {
             console.log('Error occurred: %s\n', debug(e.error));
           },
           onclose: (e: CloseEvent) => {
             console.log('Connection closed.');
           },
         },
       });
       ```
      */
  async connect(e) {
    var t, o;
    if (this.apiClient.isVertexAI())
      throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), l = this.apiClient.getApiVersion(), a = jr(this.apiClient.getDefaultHeaders()), u = this.apiClient.getApiKey(), f = `${r}/ws/google.ai.generativelanguage.${l}.GenerativeService.BidiGenerateMusic?key=${u}`;
    let d = () => {
    };
    const c = new Promise((E) => {
      d = E;
    }), p = e.callbacks, m = function() {
      d({});
    }, h = this.apiClient, g = {
      onopen: m,
      onmessage: (E) => {
        Xr(h, p.onmessage, E);
      },
      onerror: (t = p == null ? void 0 : p.onerror) !== null && t !== void 0 ? t : function(E) {
      },
      onclose: (o = p == null ? void 0 : p.onclose) !== null && o !== void 0 ? o : function(E) {
      }
    }, y = this.webSocketFactory.create(f, Or(a), g);
    y.connect(), await c;
    const C = { setup: { model: P(this.apiClient, e.model) } };
    return y.send(JSON.stringify(C)), new Zr(y, this.apiClient);
  }
}
class Zr {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  /**
      Sets inputs to steer music generation. Updates the session's current
      weighted prompts.
  
      @param params - Contains one property, `weightedPrompts`.
  
        - `weightedPrompts` to send to the model; weights are normalized to
          sum to 1.0.
  
      @experimental
     */
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0)
      throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = Ji(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  /**
      Sets a configuration to the model. Updates the session's current
      music generation config.
  
      @param params - Contains one property, `musicGenerationConfig`.
  
        - `musicGenerationConfig` to set in the model. Passing an empty or
      undefined config to the model will reset the config to defaults.
  
      @experimental
     */
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = Bi(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  /**
   * Start the music stream.
   *
   * @experimental
   */
  play() {
    this.sendPlaybackControl(Y.PLAY);
  }
  /**
   * Temporarily halt the music stream. Use `play` to resume from the current
   * position.
   *
   * @experimental
   */
  pause() {
    this.sendPlaybackControl(Y.PAUSE);
  }
  /**
   * Stop the music stream and reset the state. Retains the current prompts
   * and config.
   *
   * @experimental
   */
  stop() {
    this.sendPlaybackControl(Y.STOP);
  }
  /**
   * Resets the context of the music generation without stopping it.
   * Retains the current prompts and config.
   *
   * @experimental
   */
  resetContext() {
    this.sendPlaybackControl(Y.RESET_CONTEXT);
  }
  /**
       Terminates the WebSocket connection.
  
       @experimental
     */
  close() {
    this.conn.close();
  }
}
function Or(n) {
  const e = {};
  return n.forEach((t, o) => {
    e[o] = t;
  }), e;
}
function jr(n) {
  const e = new Headers();
  for (const [t, o] of Object.entries(n))
    e.append(t, o);
  return e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const el = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function nl(n, e, t) {
  const o = new $t();
  let r;
  t.data instanceof Blob ? r = await t.data.text() : t.data instanceof ArrayBuffer ? r = new TextDecoder().decode(t.data) : r = t.data;
  const l = JSON.parse(r);
  if (n.isVertexAI()) {
    const a = Wi(l);
    Object.assign(o, a);
  } else
    Object.assign(o, l);
  e(o);
}
class tl {
  constructor(e, t, o) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = o, this.music = new Qr(this.apiClient, this.auth, this.webSocketFactory);
  }
  /**
       Establishes a connection to the specified model with the given
       configuration and returns a Session object representing that connection.
  
       @experimental Built-in MCP support is an experimental feature, may change in
       future versions.
  
       @remarks
  
       @param params - The parameters for establishing a connection to the model.
       @return A live session.
  
       @example
       ```ts
       let model: string;
       if (GOOGLE_GENAI_USE_VERTEXAI) {
         model = 'gemini-2.0-flash-live-preview-04-09';
       } else {
         model = 'gemini-live-2.5-flash-preview';
       }
       const session = await ai.live.connect({
         model: model,
         config: {
           responseModalities: [Modality.AUDIO],
         },
         callbacks: {
           onopen: () => {
             console.log('Connected to the socket.');
           },
           onmessage: (e: MessageEvent) => {
             console.log('Received message from the server: %s\n', debug(e.data));
           },
           onerror: (e: ErrorEvent) => {
             console.log('Error occurred: %s\n', debug(e.error));
           },
           onclose: (e: CloseEvent) => {
             console.log('Connection closed.');
           },
         },
       });
       ```
      */
  async connect(e) {
    var t, o, r, l, a, u;
    if (e.config && e.config.httpOptions)
      throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const f = this.apiClient.getWebsocketBaseUrl(), d = this.apiClient.getApiVersion();
    let c;
    const p = this.apiClient.getHeaders();
    e.config && e.config.tools && gt(e.config.tools) && yt(p);
    const m = rl(p);
    if (this.apiClient.isVertexAI())
      c = `${f}/ws/google.cloud.aiplatform.${d}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(m, c);
    else {
      const A = this.apiClient.getApiKey();
      let N = "BidiGenerateContent", x = "key";
      A != null && A.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), d !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), N = "BidiGenerateContentConstrained", x = "access_token"), c = `${f}/ws/google.ai.generativelanguage.${d}.GenerativeService.${N}?${x}=${A}`;
    }
    let h = () => {
    };
    const g = new Promise((A) => {
      h = A;
    }), y = e.callbacks, _ = function() {
      var A;
      (A = y == null ? void 0 : y.onopen) === null || A === void 0 || A.call(y), h({});
    }, v = this.apiClient, C = {
      onopen: _,
      onmessage: (A) => {
        nl(v, y.onmessage, A);
      },
      onerror: (t = y == null ? void 0 : y.onerror) !== null && t !== void 0 ? t : function(A) {
      },
      onclose: (o = y == null ? void 0 : y.onclose) !== null && o !== void 0 ? o : function(A) {
      }
    }, E = this.webSocketFactory.create(c, sl(m), C);
    E.connect(), await g;
    let I = P(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && I.startsWith("publishers/")) {
      const A = this.apiClient.getProject(), N = this.apiClient.getLocation();
      I = `projects/${A}/locations/${N}/` + I;
    }
    let S = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [j.AUDIO] } : e.config.responseModalities = [j.AUDIO]), !((l = e.config) === null || l === void 0) && l.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const R = (u = (a = e.config) === null || a === void 0 ? void 0 : a.tools) !== null && u !== void 0 ? u : [], M = [];
    for (const A of R)
      if (this.isCallableTool(A)) {
        const N = A;
        M.push(await N.tool());
      } else
        M.push(A);
    M.length > 0 && (e.config.tools = M);
    const U = {
      model: I,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? S = Hi(this.apiClient, U) : S = qi(this.apiClient, U), delete S.config, E.send(JSON.stringify(S)), new il(E, this.apiClient);
  }
  // TODO: b/416041229 - Abstract this method to a common place.
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}
const ol = {
  turnComplete: !0
};
class il {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let o = [];
      try {
        o = k(t.turns), e.isVertexAI() || (o = o.map((r) => re(r)));
      } catch {
        throw new Error(`Failed to parse client content "turns", type: '${typeof t.turns}'`);
      }
      return {
        clientContent: { turns: o, turnComplete: t.turnComplete }
      };
    }
    return {
      clientContent: { turnComplete: t.turnComplete }
    };
  }
  tLiveClienttToolResponse(e, t) {
    let o = [];
    if (t.functionResponses == null)
      throw new Error("functionResponses is required.");
    if (Array.isArray(t.functionResponses) ? o = t.functionResponses : o = [t.functionResponses], o.length === 0)
      throw new Error("functionResponses is required.");
    for (const l of o) {
      if (typeof l != "object" || l === null || !("name" in l) || !("response" in l))
        throw new Error(`Could not parse function response, type '${typeof l}'.`);
      if (!e.isVertexAI() && !("id" in l))
        throw new Error(el);
    }
    return {
      toolResponse: { functionResponses: o }
    };
  }
  /**
      Send a message over the established connection.
  
      @param params - Contains two **optional** properties, `turns` and
          `turnComplete`.
  
        - `turns` will be converted to a `Content[]`
        - `turnComplete: true` [default] indicates that you are done sending
          content and expect a response. If `turnComplete: false`, the server
          will wait for additional messages before starting generation.
  
      @experimental
  
      @remarks
      There are two ways to send messages to the live API:
      `sendClientContent` and `sendRealtimeInput`.
  
      `sendClientContent` messages are added to the model context **in order**.
      Having a conversation using `sendClientContent` messages is roughly
      equivalent to using the `Chat.sendMessageStream`, except that the state of
      the `chat` history is stored on the API server instead of locally.
  
      Because of `sendClientContent`'s order guarantee, the model cannot respons
      as quickly to `sendClientContent` messages as to `sendRealtimeInput`
      messages. This makes the biggest difference when sending objects that have
      significant preprocessing time (typically images).
  
      The `sendClientContent` message sends a `Content[]`
      which has more options than the `Blob` sent by `sendRealtimeInput`.
  
      So the main use-cases for `sendClientContent` over `sendRealtimeInput` are:
  
      - Sending anything that can't be represented as a `Blob` (text,
      `sendClientContent({turns="Hello?"}`)).
      - Managing turns when not using audio input and voice activity detection.
        (`sendClientContent({turnComplete:true})` or the short form
      `sendClientContent()`)
      - Prefilling a conversation context
        ```
        sendClientContent({
            turns: [
              Content({role:user, parts:...}),
              Content({role:user, parts:...}),
              ...
            ]
        })
        ```
      @experimental
     */
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, ol), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  /**
      Send a realtime message over the established connection.
  
      @param params - Contains one property, `media`.
  
        - `media` will be converted to a `Blob`
  
      @experimental
  
      @remarks
      Use `sendRealtimeInput` for realtime audio chunks and video frames (images).
  
      With `sendRealtimeInput` the api will respond to audio automatically
      based on voice activity detection (VAD).
  
      `sendRealtimeInput` is optimized for responsivness at the expense of
      deterministic ordering guarantees. Audio and video tokens are to the
      context when they become available.
  
      Note: The Call signature expects a `Blob` object, but only a subset
      of audio and image mimetypes are allowed.
     */
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = {
      realtimeInput: Yi(e)
    } : t = {
      realtimeInput: $i(e)
    }, this.conn.send(JSON.stringify(t));
  }
  /**
      Send a function response message over the established connection.
  
      @param params - Contains property `functionResponses`.
  
        - `functionResponses` will be converted to a `functionResponses[]`
  
      @remarks
      Use `sendFunctionResponse` to reply to `LiveServerToolCall` from the server.
  
      Use {@link types.LiveConnectConfig#tools} to configure the callable functions.
  
      @experimental
     */
  sendToolResponse(e) {
    if (e.functionResponses == null)
      throw new Error("Tool response parameters are required.");
    const t = this.tLiveClienttToolResponse(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  /**
       Terminates the WebSocket connection.
  
       @experimental
  
       @example
       ```ts
       let model: string;
       if (GOOGLE_GENAI_USE_VERTEXAI) {
         model = 'gemini-2.0-flash-live-preview-04-09';
       } else {
         model = 'gemini-live-2.5-flash-preview';
       }
       const session = await ai.live.connect({
         model: model,
         config: {
           responseModalities: [Modality.AUDIO],
         }
       });
  
       session.close();
       ```
     */
  close() {
    this.conn.close();
  }
}
function sl(n) {
  const e = {};
  return n.forEach((t, o) => {
    e[o] = t;
  }), e;
}
function rl(n) {
  const e = new Headers();
  for (const [t, o] of Object.entries(n))
    e.append(t, o);
  return e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const $n = 10;
function Yn(n) {
  var e, t, o;
  if (!((e = n == null ? void 0 : n.automaticFunctionCalling) === null || e === void 0) && e.disable)
    return !0;
  let r = !1;
  for (const a of (t = n == null ? void 0 : n.tools) !== null && t !== void 0 ? t : [])
    if (z(a)) {
      r = !0;
      break;
    }
  if (!r)
    return !0;
  const l = (o = n == null ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return l && (l < 0 || !Number.isInteger(l)) || l == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", l), !0) : !1;
}
function z(n) {
  return "callTool" in n && typeof n.callTool == "function";
}
function ll(n) {
  var e, t, o;
  return (o = (t = (e = n.config) === null || e === void 0 ? void 0 : e.tools) === null || t === void 0 ? void 0 : t.some((r) => z(r))) !== null && o !== void 0 ? o : !1;
}
function al(n) {
  var e, t, o;
  return (o = (t = (e = n.config) === null || e === void 0 ? void 0 : e.tools) === null || t === void 0 ? void 0 : t.some((r) => !z(r))) !== null && o !== void 0 ? o : !1;
}
function Wn(n) {
  var e;
  return !(!((e = n == null ? void 0 : n.automaticFunctionCalling) === null || e === void 0) && e.ignoreCallHistory);
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class ul extends $ {
  constructor(e) {
    super(), this.apiClient = e, this.generateContent = async (t) => {
      var o, r, l, a, u;
      const f = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !ll(t) || Yn(t.config))
        return await this.generateContentInternal(f);
      if (al(t))
        throw new Error("Automatic function calling with CallableTools and Tools is not yet supported.");
      let d, c;
      const p = k(f.contents), m = (l = (r = (o = f.config) === null || o === void 0 ? void 0 : o.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && l !== void 0 ? l : $n;
      let h = 0;
      for (; h < m && (d = await this.generateContentInternal(f), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, y = [];
        for (const _ of (u = (a = t.config) === null || a === void 0 ? void 0 : a.tools) !== null && u !== void 0 ? u : [])
          if (z(_)) {
            const C = await _.callTool(d.functionCalls);
            y.push(...C);
          }
        h++, c = {
          role: "user",
          parts: y
        }, f.contents = k(f.contents), f.contents.push(g), f.contents.push(c), Wn(f.config) && (p.push(g), p.push(c));
      }
      return Wn(f.config) && (d.automaticFunctionCallingHistory = p), d;
    }, this.generateContentStream = async (t) => {
      if (this.maybeMoveToResponseJsonSchem(t), Yn(t.config)) {
        const o = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(o);
      } else
        return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((o) => {
      var r;
      let l;
      const a = [];
      if (o != null && o.generatedImages)
        for (const f of o.generatedImages)
          f && (f != null && f.safetyAttributes) && ((r = f == null ? void 0 : f.safetyAttributes) === null || r === void 0 ? void 0 : r.contentType) === "Positive Prompt" ? l = f == null ? void 0 : f.safetyAttributes : a.push(f);
      let u;
      return l ? u = {
        generatedImages: a,
        positivePromptSafetyAttributes: l,
        sdkHttpResponse: o.sdkHttpResponse
      } : u = {
        generatedImages: a,
        sdkHttpResponse: o.sdkHttpResponse
      }, u;
    }), this.list = async (t) => {
      var o;
      const a = {
        config: Object.assign(Object.assign({}, {
          queryBase: !0
        }), t == null ? void 0 : t.config)
      };
      if (this.apiClient.isVertexAI() && !a.config.queryBase) {
        if (!((o = a.config) === null || o === void 0) && o.filter)
          throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        a.config.filter = "labels.tune-type:*";
      }
      return new ee(J.PAGED_ITEM_MODELS, (u) => this.listInternal(u), await this.listInternal(a), a);
    }, this.editImage = async (t) => {
      const o = {
        model: t.model,
        prompt: t.prompt,
        referenceImages: [],
        config: t.config
      };
      return t.referenceImages && t.referenceImages && (o.referenceImages = t.referenceImages.map((r) => r.toReferenceImageAPI())), await this.editImageInternal(o);
    }, this.upscaleImage = async (t) => {
      let o = {
        numberOfImages: 1,
        mode: "upscale"
      };
      t.config && (o = Object.assign(Object.assign({}, o), t.config));
      const r = {
        model: t.model,
        image: t.image,
        upscaleFactor: t.upscaleFactor,
        config: o
      };
      return await this.upscaleImageInternal(r);
    }, this.generateVideos = async (t) => {
      var o, r, l, a, u, f;
      if ((t.prompt || t.image || t.video) && t.source)
        throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((o = t.video) === null || o === void 0) && o.uri && (!((r = t.video) === null || r === void 0) && r.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((a = (l = t.source) === null || l === void 0 ? void 0 : l.video) === null || a === void 0) && a.uri && (!((f = (u = t.source) === null || u === void 0 ? void 0 : u.video) === null || f === void 0) && f.videoBytes) && (t.source.video = {
        uri: t.source.video.uri,
        mimeType: t.source.video.mimeType
      })), await this.generateVideosInternal(t);
    };
  }
  /**
   * This logic is needed for GenerateContentConfig only.
   * Previously we made GenerateContentConfig.responseSchema field to accept
   * unknown. Since v1.9.0, we switch to use backend JSON schema support.
   * To maintain backward compatibility, we move the data that was treated as
   * JSON schema from the responseSchema field to the responseJsonSchema field.
   */
  maybeMoveToResponseJsonSchem(e) {
    e.config && e.config.responseSchema && (e.config.responseJsonSchema || Object.keys(e.config.responseSchema).includes("$schema") && (e.config.responseJsonSchema = e.config.responseSchema, delete e.config.responseSchema));
  }
  /**
   * Transforms the CallableTools in the parameters to be simply Tools, it
   * copies the params into a new object and replaces the tools, it does not
   * modify the original params. Also sets the MCP usage header if there are
   * MCP tools in the parameters.
   */
  async processParamsMaybeAddMcpUsage(e) {
    var t, o, r;
    const l = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!l)
      return e;
    const a = await Promise.all(l.map(async (f) => z(f) ? await f.tool() : f)), u = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: a })
    };
    if (u.config.tools = a, e.config && e.config.tools && gt(e.config.tools)) {
      const f = (r = (o = e.config.httpOptions) === null || o === void 0 ? void 0 : o.headers) !== null && r !== void 0 ? r : {};
      let d = Object.assign({}, f);
      Object.keys(d).length === 0 && (d = this.apiClient.getDefaultHeaders()), yt(d), u.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: d });
    }
    return u;
  }
  async initAfcToolsMap(e) {
    var t, o, r;
    const l = /* @__PURE__ */ new Map();
    for (const a of (o = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && o !== void 0 ? o : [])
      if (z(a)) {
        const u = a, f = await u.tool();
        for (const d of (r = f.functionDeclarations) !== null && r !== void 0 ? r : []) {
          if (!d.name)
            throw new Error("Function declaration name is required.");
          if (l.has(d.name))
            throw new Error(`Duplicate tool declaration name: ${d.name}`);
          l.set(d.name, u);
        }
      }
    return l;
  }
  async processAfcStream(e) {
    var t, o, r;
    const l = (r = (o = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && r !== void 0 ? r : $n;
    let a = !1, u = 0;
    const f = await this.initAfcToolsMap(e);
    return function(d, c, p) {
      var m, h;
      return K(this, arguments, function* () {
        for (var g, y, _, v; u < l; ) {
          a && (u++, a = !1);
          const S = yield w(d.processParamsMaybeAddMcpUsage(p)), R = yield w(d.generateContentStreamInternal(S)), M = [], U = [];
          try {
            for (var C = !0, E = (y = void 0, O(R)), I; I = yield w(E.next()), g = I.done, !g; C = !0) {
              v = I.value, C = !1;
              const A = v;
              if (yield yield w(A), A.candidates && (!((m = A.candidates[0]) === null || m === void 0) && m.content)) {
                U.push(A.candidates[0].content);
                for (const N of (h = A.candidates[0].content.parts) !== null && h !== void 0 ? h : [])
                  if (u < l && N.functionCall) {
                    if (!N.functionCall.name)
                      throw new Error("Function call name was not returned by the model.");
                    if (c.has(N.functionCall.name)) {
                      const x = yield w(c.get(N.functionCall.name).callTool([N.functionCall]));
                      M.push(...x);
                    } else
                      throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${c.keys()}, mising tool: ${N.functionCall.name}`);
                  }
              }
            }
          } catch (A) {
            y = { error: A };
          } finally {
            try {
              !C && !g && (_ = E.return) && (yield w(_.call(E)));
            } finally {
              if (y) throw y.error;
            }
          }
          if (M.length > 0) {
            a = !0;
            const A = new Z();
            A.candidates = [
              {
                content: {
                  role: "user",
                  parts: M
                }
              }
            ], yield yield w(A);
            const N = [];
            N.push(...U), N.push({
              role: "user",
              parts: M
            });
            const x = k(p.contents).concat(N);
            p.contents = x;
          } else
            break;
        }
      });
    }(this, f, e);
  }
  async generateContentInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Vn(this.apiClient, e);
      return u = T("{model}:generateContent", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Hn(c), m = new Z();
        return Object.assign(m, p), m;
      });
    } else {
      const d = Gn(this.apiClient, e);
      return u = T("{model}:generateContent", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = qn(c), m = new Z();
        return Object.assign(m, p), m;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Vn(this.apiClient, e);
      return u = T("{model}:streamGenerateContent?alt=sse", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.requestStream({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), a.then(function(p) {
        return K(this, arguments, function* () {
          var m, h, g, y;
          try {
            for (var _ = !0, v = O(p), C; C = yield w(v.next()), m = C.done, !m; _ = !0) {
              y = C.value, _ = !1;
              const E = y, I = Hn(yield w(E.json()));
              I.sdkHttpResponse = {
                headers: E.headers
              };
              const S = new Z();
              Object.assign(S, I), yield yield w(S);
            }
          } catch (E) {
            h = { error: E };
          } finally {
            try {
              !_ && !m && (g = v.return) && (yield w(g.call(v)));
            } finally {
              if (h) throw h.error;
            }
          }
        });
      });
    } else {
      const d = Gn(this.apiClient, e);
      return u = T("{model}:streamGenerateContent?alt=sse", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.requestStream({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }), a.then(function(p) {
        return K(this, arguments, function* () {
          var m, h, g, y;
          try {
            for (var _ = !0, v = O(p), C; C = yield w(v.next()), m = C.done, !m; _ = !0) {
              y = C.value, _ = !1;
              const E = y, I = qn(yield w(E.json()));
              I.sdkHttpResponse = {
                headers: E.headers
              };
              const S = new Z();
              Object.assign(S, I), yield yield w(S);
            }
          } catch (E) {
            h = { error: E };
          } finally {
            try {
              !_ && !m && (g = v.return) && (yield w(g.call(v)));
            } finally {
              if (h) throw h.error;
            }
          }
        });
      });
    }
  }
  /**
   * Calculates embeddings for the given contents. Only text is supported.
   *
   * @param params - The parameters for embedding contents.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.embedContent({
   *  model: 'text-embedding-004',
   *  contents: [
   *    'What is your name?',
   *    'What is your favorite color?',
   *  ],
   *  config: {
   *    outputDimensionality: 64,
   *  },
   * });
   * console.log(response);
   * ```
   */
  async embedContent(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = _s(this.apiClient, e);
      return u = T("{model}:predict", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = vs(c), m = new _n();
        return Object.assign(m, p), m;
      });
    } else {
      const d = Cs(this.apiClient, e);
      return u = T("{model}:batchEmbedContents", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Is(c), m = new _n();
        return Object.assign(m, p), m;
      });
    }
  }
  /**
   * Private method for generating images.
   */
  async generateImagesInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = xs(this.apiClient, e);
      return u = T("{model}:predict", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Ls(c), m = new In();
        return Object.assign(m, p), m;
      });
    } else {
      const d = Ds(this.apiClient, e);
      return u = T("{model}:predict", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Us(c), m = new In();
        return Object.assign(m, p), m;
      });
    }
  }
  /**
   * Private method for editing an image.
   */
  async editImageInternal(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = gs(this.apiClient, e);
      return l = T("{model}:predict", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json().then((d) => {
        const c = d;
        return c.sdkHttpResponse = {
          headers: f.headers
        }, c;
      })), r.then((f) => {
        const d = ys(f), c = new kt();
        return Object.assign(c, d), c;
      });
    } else
      throw new Error("This method is only supported by the Vertex AI.");
  }
  /**
   * Private method for upscaling an image.
   */
  async upscaleImageInternal(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = Nr(this.apiClient, e);
      return l = T("{model}:predict", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json().then((d) => {
        const c = d;
        return c.sdkHttpResponse = {
          headers: f.headers
        }, c;
      })), r.then((f) => {
        const d = wr(f), c = new Ft();
        return Object.assign(c, d), c;
      });
    } else
      throw new Error("This method is only supported by the Vertex AI.");
  }
  /**
   * Recontextualizes an image.
   *
   * There are two types of recontextualization currently supported:
   * 1) Imagen Product Recontext - Generate images of products in new scenes
   *    and contexts.
   * 2) Virtual Try-On: Generate images of persons modeling fashion products.
   *
   * @param params - The parameters for recontextualizing an image.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response1 = await ai.models.recontextImage({
   *  model: 'imagen-product-recontext-preview-06-30',
   *  source: {
   *    prompt: 'In a modern kitchen setting.',
   *    productImages: [productImage],
   *  },
   *  config: {
   *    numberOfImages: 1,
   *  },
   * });
   * console.log(response1?.generatedImages?.[0]?.image?.imageBytes);
   *
   * const response2 = await ai.models.recontextImage({
   *  model: 'virtual-try-on-preview-08-04',
   *  source: {
   *    personImage: personImage,
   *    productImages: [productImage],
   *  },
   *  config: {
   *    numberOfImages: 1,
   *  },
   * });
   * console.log(response2?.generatedImages?.[0]?.image?.imageBytes);
   * ```
   */
  async recontextImage(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = fr(this.apiClient, e);
      return l = T("{model}:predict", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json()), r.then((f) => {
        const d = cr(f), c = new Gt();
        return Object.assign(c, d), c;
      });
    } else
      throw new Error("This method is only supported by the Vertex AI.");
  }
  /**
   * Segments an image, creating a mask of a specified area.
   *
   * @param params - The parameters for segmenting an image.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.segmentImage({
   *  model: 'image-segmentation-001',
   *  source: {
   *    image: image,
   *  },
   *  config: {
   *    mode: 'foreground',
   *  },
   * });
   * console.log(response?.generatedMasks?.[0]?.mask?.imageBytes);
   * ```
   */
  async segmentImage(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = Tr(this.apiClient, e);
      return l = T("{model}:predict", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json()), r.then((f) => {
        const d = Er(f), c = new Vt();
        return Object.assign(c, d), c;
      });
    } else
      throw new Error("This method is only supported by the Vertex AI.");
  }
  /**
   * Fetches information about a model by name.
   *
   * @example
   * ```ts
   * const modelInfo = await ai.models.get({model: 'gemini-2.0-flash'});
   * ```
   */
  async get(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Zs(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a.then((c) => ye(c));
    } else {
      const d = Qs(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a.then((c) => ge(c));
    }
  }
  async listInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = ir(this.apiClient, e);
      return u = T("{models_url}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = rr(c), m = new vn();
        return Object.assign(m, p), m;
      });
    } else {
      const d = or(this.apiClient, e);
      return u = T("{models_url}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = sr(c), m = new vn();
        return Object.assign(m, p), m;
      });
    }
  }
  /**
   * Updates a tuned model by its name.
   *
   * @param params - The parameters for updating the model.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.update({
   *   model: 'tuned-model-name',
   *   config: {
   *     displayName: 'New display name',
   *     description: 'New description',
   *   },
   * });
   * ```
   */
  async update(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Mr(this.apiClient, e);
      return u = T("{model}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a.then((c) => ye(c));
    } else {
      const d = Rr(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a.then((c) => ge(c));
    }
  }
  /**
   * Deletes a tuned model by its name.
   *
   * @param params - The parameters for deleting the model.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.delete({model: 'tuned-model-name'});
   * ```
   */
  async delete(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = cs(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = ms(c), m = new Sn();
        return Object.assign(m, p), m;
      });
    } else {
      const d = fs(this.apiClient, e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = ps(c), m = new Sn();
        return Object.assign(m, p), m;
      });
    }
  }
  /**
   * Counts the number of tokens in the given contents. Multimodal input is
   * supported for Gemini models.
   *
   * @param params - The parameters for counting tokens.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.countTokens({
   *  model: 'gemini-2.0-flash',
   *  contents: 'The quick brown fox jumps over the lazy dog.'
   * });
   * console.log(response);
   * ```
   */
  async countTokens(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = as(this.apiClient, e);
      return u = T("{model}:countTokens", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = ds(c), m = new An();
        return Object.assign(m, p), m;
      });
    } else {
      const d = ls(this.apiClient, e);
      return u = T("{model}:countTokens", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = us(c), m = new An();
        return Object.assign(m, p), m;
      });
    }
  }
  /**
   * Given a list of contents, returns a corresponding TokensInfo containing
   * the list of tokens and list of token ids.
   *
   * This method is not supported by the Gemini Developer API.
   *
   * @param params - The parameters for computing tokens.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.computeTokens({
   *  model: 'gemini-2.0-flash',
   *  contents: 'What is your name?'
   * });
   * console.log(response);
   * ```
   */
  async computeTokens(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = es(this.apiClient, e);
      return l = T("{model}:computeTokens", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json().then((d) => {
        const c = d;
        return c.sdkHttpResponse = {
          headers: f.headers
        }, c;
      })), r.then((f) => {
        const d = ns(f), c = new qt();
        return Object.assign(c, d), c;
      });
    } else
      throw new Error("This method is only supported by the Vertex AI.");
  }
  /**
   * Private method for generating videos.
   */
  async generateVideosInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Hs(this.apiClient, e);
      return u = T("{model}:predictLongRunning", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a.then((c) => {
        const p = Vs(c), m = new oe();
        return Object.assign(m, p), m;
      });
    } else {
      const d = qs(this.apiClient, e);
      return u = T("{model}:predictLongRunning", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a.then((c) => {
        const p = Gs(c), m = new oe();
        return Object.assign(m, p), m;
      });
    }
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class dl extends $ {
  constructor(e) {
    super(), this.apiClient = e;
  }
  /**
   * Gets the status of a long-running operation.
   *
   * @param parameters The parameters for the get operation request.
   * @return The updated Operation object, with the latest status or result.
   */
  async getVideosOperation(e) {
    const t = e.operation, o = e.config;
    if (t.name === void 0 || t.name === "")
      throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const r = t.name.split("/operations/")[0];
      let l;
      o && "httpOptions" in o && (l = o.httpOptions);
      const a = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: l }
      });
      return t._fromAPIResponse({
        apiResponse: a,
        isVertexAI: !0
      });
    } else {
      const r = await this.getVideosOperationInternal({
        operationName: t.name,
        config: o
      });
      return t._fromAPIResponse({
        apiResponse: r,
        isVertexAI: !1
      });
    }
  }
  /**
   * Gets the status of a long-running operation.
   *
   * @param parameters The parameters for the get operation request.
   * @return The updated Operation object, with the latest status or result.
   */
  async get(e) {
    const t = e.operation, o = e.config;
    if (t.name === void 0 || t.name === "")
      throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const r = t.name.split("/operations/")[0];
      let l;
      o && "httpOptions" in o && (l = o.httpOptions);
      const a = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: l }
      });
      return t._fromAPIResponse({
        apiResponse: a,
        isVertexAI: !0
      });
    } else {
      const r = await this.getVideosOperationInternal({
        operationName: t.name,
        config: o
      });
      return t._fromAPIResponse({
        apiResponse: r,
        isVertexAI: !1
      });
    }
  }
  async getVideosOperationInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = xt(e);
      return u = T("{operationName}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json()), a;
    } else {
      const d = Dt(e);
      return u = T("{operationName}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json()), a;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = St(e);
      return l = T("{resourceName}:fetchPredictOperation", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json()), r;
    } else
      throw new Error("This method is only supported by the Vertex AI.");
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function fl(n) {
  const e = {}, t = i(n, ["data"]);
  if (t != null && s(e, ["data"], t), i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function cl(n) {
  const e = {}, t = i(n, ["parts"]);
  if (t != null) {
    let r = t;
    Array.isArray(r) && (r = r.map((l) => Cl(l))), s(e, ["parts"], r);
  }
  const o = i(n, ["role"]);
  return o != null && s(e, ["role"], o), e;
}
function pl(n, e, t) {
  const o = {}, r = i(e, ["expireTime"]);
  t !== void 0 && r != null && s(t, ["expireTime"], r);
  const l = i(e, [
    "newSessionExpireTime"
  ]);
  t !== void 0 && l != null && s(t, ["newSessionExpireTime"], l);
  const a = i(e, ["uses"]);
  t !== void 0 && a != null && s(t, ["uses"], a);
  const u = i(e, [
    "liveConnectConstraints"
  ]);
  t !== void 0 && u != null && s(t, ["bidiGenerateContentSetup"], El(n, u));
  const f = i(e, [
    "lockAdditionalFields"
  ]);
  return t !== void 0 && f != null && s(t, ["fieldMask"], f), o;
}
function ml(n, e) {
  const t = {}, o = i(e, ["config"]);
  return o != null && s(t, ["config"], pl(n, o, t)), t;
}
function hl(n) {
  const e = {};
  if (i(n, ["displayName"]) !== void 0)
    throw new Error("displayName parameter is not supported in Gemini API.");
  const t = i(n, ["fileUri"]);
  t != null && s(e, ["fileUri"], t);
  const o = i(n, ["mimeType"]);
  return o != null && s(e, ["mimeType"], o), e;
}
function gl(n) {
  const e = {};
  if (i(n, ["authConfig"]) !== void 0)
    throw new Error("authConfig parameter is not supported in Gemini API.");
  const t = i(n, ["enableWidget"]);
  return t != null && s(e, ["enableWidget"], t), e;
}
function yl(n) {
  const e = {};
  if (i(n, ["excludeDomains"]) !== void 0)
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const t = i(n, [
    "timeRangeFilter"
  ]);
  return t != null && s(e, ["timeRangeFilter"], t), e;
}
function Tl(n, e) {
  const t = {}, o = i(n, [
    "generationConfig"
  ]);
  e !== void 0 && o != null && s(e, ["setup", "generationConfig"], o);
  const r = i(n, [
    "responseModalities"
  ]);
  e !== void 0 && r != null && s(e, ["setup", "generationConfig", "responseModalities"], r);
  const l = i(n, ["temperature"]);
  e !== void 0 && l != null && s(e, ["setup", "generationConfig", "temperature"], l);
  const a = i(n, ["topP"]);
  e !== void 0 && a != null && s(e, ["setup", "generationConfig", "topP"], a);
  const u = i(n, ["topK"]);
  e !== void 0 && u != null && s(e, ["setup", "generationConfig", "topK"], u);
  const f = i(n, [
    "maxOutputTokens"
  ]);
  e !== void 0 && f != null && s(e, ["setup", "generationConfig", "maxOutputTokens"], f);
  const d = i(n, [
    "mediaResolution"
  ]);
  e !== void 0 && d != null && s(e, ["setup", "generationConfig", "mediaResolution"], d);
  const c = i(n, ["seed"]);
  e !== void 0 && c != null && s(e, ["setup", "generationConfig", "seed"], c);
  const p = i(n, ["speechConfig"]);
  e !== void 0 && p != null && s(e, ["setup", "generationConfig", "speechConfig"], Se(p));
  const m = i(n, [
    "thinkingConfig"
  ]);
  e !== void 0 && m != null && s(e, ["setup", "generationConfig", "thinkingConfig"], m);
  const h = i(n, [
    "enableAffectiveDialog"
  ]);
  e !== void 0 && h != null && s(e, ["setup", "generationConfig", "enableAffectiveDialog"], h);
  const g = i(n, [
    "systemInstruction"
  ]);
  e !== void 0 && g != null && s(e, ["setup", "systemInstruction"], cl(L(g)));
  const y = i(n, ["tools"]);
  if (e !== void 0 && y != null) {
    let R = X(y);
    Array.isArray(R) && (R = R.map((M) => Il(b(M)))), s(e, ["setup", "tools"], R);
  }
  const _ = i(n, [
    "sessionResumption"
  ]);
  e !== void 0 && _ != null && s(e, ["setup", "sessionResumption"], _l(_));
  const v = i(n, [
    "inputAudioTranscription"
  ]);
  e !== void 0 && v != null && s(e, ["setup", "inputAudioTranscription"], v);
  const C = i(n, [
    "outputAudioTranscription"
  ]);
  e !== void 0 && C != null && s(e, ["setup", "outputAudioTranscription"], C);
  const E = i(n, [
    "realtimeInputConfig"
  ]);
  e !== void 0 && E != null && s(e, ["setup", "realtimeInputConfig"], E);
  const I = i(n, [
    "contextWindowCompression"
  ]);
  e !== void 0 && I != null && s(e, ["setup", "contextWindowCompression"], I);
  const S = i(n, ["proactivity"]);
  return e !== void 0 && S != null && s(e, ["setup", "proactivity"], S), t;
}
function El(n, e) {
  const t = {}, o = i(e, ["model"]);
  o != null && s(t, ["setup", "model"], P(n, o));
  const r = i(e, ["config"]);
  return r != null && s(t, ["config"], Tl(r, t)), t;
}
function Cl(n) {
  const e = {}, t = i(n, ["functionCall"]);
  t != null && s(e, ["functionCall"], t);
  const o = i(n, [
    "codeExecutionResult"
  ]);
  o != null && s(e, ["codeExecutionResult"], o);
  const r = i(n, [
    "executableCode"
  ]);
  r != null && s(e, ["executableCode"], r);
  const l = i(n, ["fileData"]);
  l != null && s(e, ["fileData"], hl(l));
  const a = i(n, [
    "functionResponse"
  ]);
  a != null && s(e, ["functionResponse"], a);
  const u = i(n, ["inlineData"]);
  u != null && s(e, ["inlineData"], fl(u));
  const f = i(n, ["text"]);
  f != null && s(e, ["text"], f);
  const d = i(n, ["thought"]);
  d != null && s(e, ["thought"], d);
  const c = i(n, [
    "thoughtSignature"
  ]);
  c != null && s(e, ["thoughtSignature"], c);
  const p = i(n, [
    "videoMetadata"
  ]);
  return p != null && s(e, ["videoMetadata"], p), e;
}
function _l(n) {
  const e = {}, t = i(n, ["handle"]);
  if (t != null && s(e, ["handle"], t), i(n, ["transparent"]) !== void 0)
    throw new Error("transparent parameter is not supported in Gemini API.");
  return e;
}
function Il(n) {
  const e = {}, t = i(n, [
    "functionDeclarations"
  ]);
  if (t != null) {
    let d = t;
    Array.isArray(d) && (d = d.map((c) => c)), s(e, ["functionDeclarations"], d);
  }
  if (i(n, ["retrieval"]) !== void 0)
    throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = i(n, [
    "googleSearchRetrieval"
  ]);
  o != null && s(e, ["googleSearchRetrieval"], o);
  const r = i(n, ["googleMaps"]);
  r != null && s(e, ["googleMaps"], gl(r));
  const l = i(n, ["computerUse"]);
  l != null && s(e, ["computerUse"], l);
  const a = i(n, [
    "codeExecution"
  ]);
  if (a != null && s(e, ["codeExecution"], a), i(n, ["enterpriseWebSearch"]) !== void 0)
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(n, ["googleSearch"]);
  u != null && s(e, ["googleSearch"], yl(u));
  const f = i(n, ["urlContext"]);
  return f != null && s(e, ["urlContext"], f), e;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function vl(n) {
  const e = [];
  for (const t in n)
    if (Object.prototype.hasOwnProperty.call(n, t)) {
      const o = n[t];
      if (typeof o == "object" && o != null && Object.keys(o).length > 0) {
        const r = Object.keys(o).map((l) => `${t}.${l}`);
        e.push(...r);
      } else
        e.push(t);
    }
  return e.join(",");
}
function Sl(n, e) {
  let t = null;
  const o = n.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const l = o.setup;
    typeof l == "object" && l !== null ? (n.bidiGenerateContentSetup = l, t = l) : delete n.bidiGenerateContentSetup;
  } else o !== void 0 && delete n.bidiGenerateContentSetup;
  const r = n.fieldMask;
  if (t) {
    const l = vl(t);
    if (Array.isArray(e == null ? void 0 : e.lockAdditionalFields) && (e == null ? void 0 : e.lockAdditionalFields.length) === 0)
      l ? n.fieldMask = l : delete n.fieldMask;
    else if (e != null && e.lockAdditionalFields && e.lockAdditionalFields.length > 0 && r !== null && Array.isArray(r) && r.length > 0) {
      const a = [
        "temperature",
        "topK",
        "topP",
        "maxOutputTokens",
        "responseModalities",
        "seed",
        "speechConfig"
      ];
      let u = [];
      r.length > 0 && (u = r.map((d) => a.includes(d) ? `generationConfig.${d}` : d));
      const f = [];
      l && f.push(l), u.length > 0 && f.push(...u), f.length > 0 ? n.fieldMask = f.join(",") : delete n.fieldMask;
    } else
      delete n.fieldMask;
  } else
    r !== null && Array.isArray(r) && r.length > 0 ? n.fieldMask = r.join(",") : delete n.fieldMask;
  return n;
}
class Al extends $ {
  constructor(e) {
    super(), this.apiClient = e;
  }
  /**
   * Creates an ephemeral auth token resource.
   *
   * @experimental
   *
   * @remarks
   * Ephemeral auth tokens is only supported in the Gemini Developer API.
   * It can be used for the session connection to the Live constrained API.
   * Support in v1alpha only.
   *
   * @param params - The parameters for the create request.
   * @return The created auth token.
   *
   * @example
   * ```ts
   * const ai = new GoogleGenAI({
   *     apiKey: token.name,
   *     httpOptions: { apiVersion: 'v1alpha' }  // Support in v1alpha only.
   * });
   *
   * // Case 1: If LiveEphemeralParameters is unset, unlock LiveConnectConfig
   * // when using the token in Live API sessions. Each session connection can
   * // use a different configuration.
   * const config: CreateAuthTokenConfig = {
   *     uses: 3,
   *     expireTime: '2025-05-01T00:00:00Z',
   * }
   * const token = await ai.tokens.create(config);
   *
   * // Case 2: If LiveEphemeralParameters is set, lock all fields in
   * // LiveConnectConfig when using the token in Live API sessions. For
   * // example, changing `outputAudioTranscription` in the Live API
   * // connection will be ignored by the API.
   * const config: CreateAuthTokenConfig =
   *     uses: 3,
   *     expireTime: '2025-05-01T00:00:00Z',
   *     LiveEphemeralParameters: {
   *        model: 'gemini-2.0-flash-001',
   *        config: {
   *           'responseModalities': ['AUDIO'],
   *           'systemInstruction': 'Always answer in English.',
   *        }
   *     }
   * }
   * const token = await ai.tokens.create(config);
   *
   * // Case 3: If LiveEphemeralParameters is set and lockAdditionalFields is
   * // set, lock LiveConnectConfig with set and additional fields (e.g.
   * // responseModalities, systemInstruction, temperature in this example) when
   * // using the token in Live API sessions.
   * const config: CreateAuthTokenConfig =
   *     uses: 3,
   *     expireTime: '2025-05-01T00:00:00Z',
   *     LiveEphemeralParameters: {
   *        model: 'gemini-2.0-flash-001',
   *        config: {
   *           'responseModalities': ['AUDIO'],
   *           'systemInstruction': 'Always answer in English.',
   *        }
   *     },
   *     lockAdditionalFields: ['temperature'],
   * }
   * const token = await ai.tokens.create(config);
   *
   * // Case 4: If LiveEphemeralParameters is set and lockAdditionalFields is
   * // empty array, lock LiveConnectConfig with set fields (e.g.
   * // responseModalities, systemInstruction in this example) when using the
   * // token in Live API sessions.
   * const config: CreateAuthTokenConfig =
   *     uses: 3,
   *     expireTime: '2025-05-01T00:00:00Z',
   *     LiveEphemeralParameters: {
   *        model: 'gemini-2.0-flash-001',
   *        config: {
   *           'responseModalities': ['AUDIO'],
   *           'systemInstruction': 'Always answer in English.',
   *        }
   *     },
   *     lockAdditionalFields: [],
   * }
   * const token = await ai.tokens.create(config);
   * ```
   */
  async create(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI())
      throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const u = ml(this.apiClient, e);
      l = T("auth_tokens", u._url), a = u._query, delete u.config, delete u._url, delete u._query;
      const f = Sl(u, e.config);
      return r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(f),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), r.then((d) => d);
    }
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function Rl(n, e) {
  const t = {}, o = i(n, ["name"]);
  return o != null && s(t, ["_url", "name"], o), t;
}
function Ml(n, e) {
  const t = {}, o = i(n, ["name"]);
  return o != null && s(t, ["_url", "name"], o), t;
}
function Pl(n, e, t) {
  const o = {};
  if (i(n, ["validationDataset"]) !== void 0)
    throw new Error("validationDataset parameter is not supported in Gemini API.");
  const r = i(n, [
    "tunedModelDisplayName"
  ]);
  if (e !== void 0 && r != null && s(e, ["displayName"], r), i(n, ["description"]) !== void 0)
    throw new Error("description parameter is not supported in Gemini API.");
  const l = i(n, ["epochCount"]);
  e !== void 0 && l != null && s(e, ["tuningTask", "hyperparameters", "epochCount"], l);
  const a = i(n, [
    "learningRateMultiplier"
  ]);
  if (a != null && s(o, ["tuningTask", "hyperparameters", "learningRateMultiplier"], a), i(n, ["exportLastCheckpointOnly"]) !== void 0)
    throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  if (i(n, ["preTunedModelCheckpointId"]) !== void 0)
    throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  if (i(n, ["adapterSize"]) !== void 0)
    throw new Error("adapterSize parameter is not supported in Gemini API.");
  const u = i(n, ["batchSize"]);
  e !== void 0 && u != null && s(e, ["tuningTask", "hyperparameters", "batchSize"], u);
  const f = i(n, ["learningRate"]);
  if (e !== void 0 && f != null && s(e, ["tuningTask", "hyperparameters", "learningRate"], f), i(n, ["labels"]) !== void 0)
    throw new Error("labels parameter is not supported in Gemini API.");
  if (i(n, ["beta"]) !== void 0)
    throw new Error("beta parameter is not supported in Gemini API.");
  return o;
}
function Nl(n, e, t) {
  const o = {};
  let r = i(t, [
    "config",
    "method"
  ]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const h = i(n, [
      "validationDataset"
    ]);
    e !== void 0 && h != null && s(e, ["supervisedTuningSpec"], Kn(h));
  } else if (r === "PREFERENCE_TUNING") {
    const h = i(n, [
      "validationDataset"
    ]);
    e !== void 0 && h != null && s(e, ["preferenceOptimizationSpec"], Kn(h));
  }
  const l = i(n, [
    "tunedModelDisplayName"
  ]);
  e !== void 0 && l != null && s(e, ["tunedModelDisplayName"], l);
  const a = i(n, ["description"]);
  e !== void 0 && a != null && s(e, ["description"], a);
  let u = i(t, [
    "config",
    "method"
  ]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const h = i(n, ["epochCount"]);
    e !== void 0 && h != null && s(e, ["supervisedTuningSpec", "hyperParameters", "epochCount"], h);
  } else if (u === "PREFERENCE_TUNING") {
    const h = i(n, ["epochCount"]);
    e !== void 0 && h != null && s(e, ["preferenceOptimizationSpec", "hyperParameters", "epochCount"], h);
  }
  let f = i(t, [
    "config",
    "method"
  ]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const h = i(n, [
      "learningRateMultiplier"
    ]);
    e !== void 0 && h != null && s(e, ["supervisedTuningSpec", "hyperParameters", "learningRateMultiplier"], h);
  } else if (f === "PREFERENCE_TUNING") {
    const h = i(n, [
      "learningRateMultiplier"
    ]);
    e !== void 0 && h != null && s(e, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], h);
  }
  let d = i(t, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const h = i(n, [
      "exportLastCheckpointOnly"
    ]);
    e !== void 0 && h != null && s(e, ["supervisedTuningSpec", "exportLastCheckpointOnly"], h);
  } else if (d === "PREFERENCE_TUNING") {
    const h = i(n, [
      "exportLastCheckpointOnly"
    ]);
    e !== void 0 && h != null && s(e, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], h);
  }
  let c = i(t, [
    "config",
    "method"
  ]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const h = i(n, ["adapterSize"]);
    e !== void 0 && h != null && s(e, ["supervisedTuningSpec", "hyperParameters", "adapterSize"], h);
  } else if (c === "PREFERENCE_TUNING") {
    const h = i(n, ["adapterSize"]);
    e !== void 0 && h != null && s(e, ["preferenceOptimizationSpec", "hyperParameters", "adapterSize"], h);
  }
  if (i(n, ["batchSize"]) !== void 0)
    throw new Error("batchSize parameter is not supported in Vertex AI.");
  if (i(n, ["learningRate"]) !== void 0)
    throw new Error("learningRate parameter is not supported in Vertex AI.");
  const p = i(n, ["labels"]);
  e !== void 0 && p != null && s(e, ["labels"], p);
  const m = i(n, ["beta"]);
  return e !== void 0 && m != null && s(e, ["preferenceOptimizationSpec", "hyperParameters", "beta"], m), o;
}
function wl(n, e) {
  const t = {}, o = i(n, ["baseModel"]);
  o != null && s(t, ["baseModel"], o);
  const r = i(n, [
    "preTunedModel"
  ]);
  r != null && s(t, ["preTunedModel"], r);
  const l = i(n, [
    "trainingDataset"
  ]);
  l != null && Bl(l);
  const a = i(n, ["config"]);
  return a != null && Pl(a, t), t;
}
function Dl(n, e) {
  const t = {}, o = i(n, ["baseModel"]);
  o != null && s(t, ["baseModel"], o);
  const r = i(n, [
    "preTunedModel"
  ]);
  r != null && s(t, ["preTunedModel"], r);
  const l = i(n, [
    "trainingDataset"
  ]);
  l != null && Jl(l, t, e);
  const a = i(n, ["config"]);
  return a != null && Nl(a, t, e), t;
}
function xl(n, e) {
  const t = {}, o = i(n, ["name"]);
  return o != null && s(t, ["_url", "name"], o), t;
}
function Ul(n, e) {
  const t = {}, o = i(n, ["name"]);
  return o != null && s(t, ["_url", "name"], o), t;
}
function Ll(n, e, t) {
  const o = {}, r = i(n, ["pageSize"]);
  e !== void 0 && r != null && s(e, ["_query", "pageSize"], r);
  const l = i(n, ["pageToken"]);
  e !== void 0 && l != null && s(e, ["_query", "pageToken"], l);
  const a = i(n, ["filter"]);
  return e !== void 0 && a != null && s(e, ["_query", "filter"], a), o;
}
function kl(n, e, t) {
  const o = {}, r = i(n, ["pageSize"]);
  e !== void 0 && r != null && s(e, ["_query", "pageSize"], r);
  const l = i(n, ["pageToken"]);
  e !== void 0 && l != null && s(e, ["_query", "pageToken"], l);
  const a = i(n, ["filter"]);
  return e !== void 0 && a != null && s(e, ["_query", "filter"], a), o;
}
function Fl(n, e) {
  const t = {}, o = i(n, ["config"]);
  return o != null && Ll(o, t), t;
}
function Gl(n, e) {
  const t = {}, o = i(n, ["config"]);
  return o != null && kl(o, t), t;
}
function Vl(n, e) {
  const t = {}, o = i(n, [
    "sdkHttpResponse"
  ]);
  o != null && s(t, ["sdkHttpResponse"], o);
  const r = i(n, [
    "nextPageToken"
  ]);
  r != null && s(t, ["nextPageToken"], r);
  const l = i(n, ["tunedModels"]);
  if (l != null) {
    let a = l;
    Array.isArray(a) && (a = a.map((u) => Tt(u))), s(t, ["tuningJobs"], a);
  }
  return t;
}
function ql(n, e) {
  const t = {}, o = i(n, [
    "sdkHttpResponse"
  ]);
  o != null && s(t, ["sdkHttpResponse"], o);
  const r = i(n, [
    "nextPageToken"
  ]);
  r != null && s(t, ["nextPageToken"], r);
  const l = i(n, ["tuningJobs"]);
  if (l != null) {
    let a = l;
    Array.isArray(a) && (a = a.map((u) => Ee(u))), s(t, ["tuningJobs"], a);
  }
  return t;
}
function Hl(n, e) {
  const t = {}, o = i(n, ["name"]);
  o != null && s(t, ["model"], o);
  const r = i(n, ["name"]);
  return r != null && s(t, ["endpoint"], r), t;
}
function Bl(n, e) {
  const t = {};
  if (i(n, ["gcsUri"]) !== void 0)
    throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(n, ["vertexDatasetResource"]) !== void 0)
    throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const o = i(n, ["examples"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((l) => l)), s(t, ["examples", "examples"], r);
  }
  return t;
}
function Jl(n, e, t) {
  const o = {};
  let r = i(t, [
    "config",
    "method"
  ]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const a = i(n, ["gcsUri"]);
    e !== void 0 && a != null && s(e, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (r === "PREFERENCE_TUNING") {
    const a = i(n, ["gcsUri"]);
    e !== void 0 && a != null && s(e, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  }
  let l = i(t, [
    "config",
    "method"
  ]);
  if (l === void 0 && (l = "SUPERVISED_FINE_TUNING"), l === "SUPERVISED_FINE_TUNING") {
    const a = i(n, [
      "vertexDatasetResource"
    ]);
    e !== void 0 && a != null && s(e, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (l === "PREFERENCE_TUNING") {
    const a = i(n, [
      "vertexDatasetResource"
    ]);
    e !== void 0 && a != null && s(e, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  }
  if (i(n, ["examples"]) !== void 0)
    throw new Error("examples parameter is not supported in Vertex AI.");
  return o;
}
function Tt(n, e) {
  const t = {}, o = i(n, [
    "sdkHttpResponse"
  ]);
  o != null && s(t, ["sdkHttpResponse"], o);
  const r = i(n, ["name"]);
  r != null && s(t, ["name"], r);
  const l = i(n, ["state"]);
  l != null && s(t, ["state"], jn(l));
  const a = i(n, ["createTime"]);
  a != null && s(t, ["createTime"], a);
  const u = i(n, [
    "tuningTask",
    "startTime"
  ]);
  u != null && s(t, ["startTime"], u);
  const f = i(n, [
    "tuningTask",
    "completeTime"
  ]);
  f != null && s(t, ["endTime"], f);
  const d = i(n, ["updateTime"]);
  d != null && s(t, ["updateTime"], d);
  const c = i(n, ["description"]);
  c != null && s(t, ["description"], c);
  const p = i(n, ["baseModel"]);
  p != null && s(t, ["baseModel"], p);
  const m = i(n, ["_self"]);
  return m != null && s(t, ["tunedModel"], Hl(m)), t;
}
function Ee(n, e) {
  const t = {}, o = i(n, [
    "sdkHttpResponse"
  ]);
  o != null && s(t, ["sdkHttpResponse"], o);
  const r = i(n, ["name"]);
  r != null && s(t, ["name"], r);
  const l = i(n, ["state"]);
  l != null && s(t, ["state"], jn(l));
  const a = i(n, ["createTime"]);
  a != null && s(t, ["createTime"], a);
  const u = i(n, ["startTime"]);
  u != null && s(t, ["startTime"], u);
  const f = i(n, ["endTime"]);
  f != null && s(t, ["endTime"], f);
  const d = i(n, ["updateTime"]);
  d != null && s(t, ["updateTime"], d);
  const c = i(n, ["error"]);
  c != null && s(t, ["error"], c);
  const p = i(n, ["description"]);
  p != null && s(t, ["description"], p);
  const m = i(n, ["baseModel"]);
  m != null && s(t, ["baseModel"], m);
  const h = i(n, ["tunedModel"]);
  h != null && s(t, ["tunedModel"], h);
  const g = i(n, [
    "preTunedModel"
  ]);
  g != null && s(t, ["preTunedModel"], g);
  const y = i(n, [
    "supervisedTuningSpec"
  ]);
  y != null && s(t, ["supervisedTuningSpec"], y);
  const _ = i(n, [
    "preferenceOptimizationSpec"
  ]);
  _ != null && s(t, ["preferenceOptimizationSpec"], _);
  const v = i(n, [
    "tuningDataStats"
  ]);
  v != null && s(t, ["tuningDataStats"], v);
  const C = i(n, [
    "encryptionSpec"
  ]);
  C != null && s(t, ["encryptionSpec"], C);
  const E = i(n, [
    "partnerModelTuningSpec"
  ]);
  E != null && s(t, ["partnerModelTuningSpec"], E);
  const I = i(n, [
    "customBaseModel"
  ]);
  I != null && s(t, ["customBaseModel"], I);
  const S = i(n, ["experiment"]);
  S != null && s(t, ["experiment"], S);
  const R = i(n, ["labels"]);
  R != null && s(t, ["labels"], R);
  const M = i(n, ["outputUri"]);
  M != null && s(t, ["outputUri"], M);
  const U = i(n, ["pipelineJob"]);
  U != null && s(t, ["pipelineJob"], U);
  const A = i(n, [
    "serviceAccount"
  ]);
  A != null && s(t, ["serviceAccount"], A);
  const N = i(n, [
    "tunedModelDisplayName"
  ]);
  N != null && s(t, ["tunedModelDisplayName"], N);
  const x = i(n, [
    "veoTuningSpec"
  ]);
  return x != null && s(t, ["veoTuningSpec"], x), t;
}
function $l(n, e) {
  const t = {}, o = i(n, [
    "sdkHttpResponse"
  ]);
  o != null && s(t, ["sdkHttpResponse"], o);
  const r = i(n, ["name"]);
  r != null && s(t, ["name"], r);
  const l = i(n, ["metadata"]);
  l != null && s(t, ["metadata"], l);
  const a = i(n, ["done"]);
  a != null && s(t, ["done"], a);
  const u = i(n, ["error"]);
  return u != null && s(t, ["error"], u), t;
}
function Kn(n, e) {
  const t = {}, o = i(n, ["gcsUri"]);
  o != null && s(t, ["validationDatasetUri"], o);
  const r = i(n, [
    "vertexDatasetResource"
  ]);
  return r != null && s(t, ["validationDatasetUri"], r), t;
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Yl extends $ {
  constructor(e) {
    super(), this.apiClient = e, this.get = async (t) => await this.getInternal(t), this.list = async (t = {}) => new ee(J.PAGED_ITEM_TUNING_JOBS, (o) => this.listInternal(o), await this.listInternal(t), t), this.tune = async (t) => {
      var o;
      if (this.apiClient.isVertexAI())
        if (t.baseModel.startsWith("projects/")) {
          const r = {
            tunedModelName: t.baseModel
          };
          !((o = t.config) === null || o === void 0) && o.preTunedModelCheckpointId && (r.checkpointId = t.config.preTunedModelCheckpointId);
          const l = Object.assign(Object.assign({}, t), { preTunedModel: r });
          return l.baseModel = void 0, await this.tuneInternal(l);
        } else {
          const r = Object.assign({}, t);
          return await this.tuneInternal(r);
        }
      else {
        const r = Object.assign({}, t), l = await this.tuneMldevInternal(r);
        let a = "";
        return l.metadata !== void 0 && l.metadata.tunedModel !== void 0 ? a = l.metadata.tunedModel : l.name !== void 0 && l.name.includes("/operations/") && (a = l.name.split("/operations/")[0]), {
          name: a,
          state: ce.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Ul(e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => Ee(c));
    } else {
      const d = xl(e);
      return u = T("{name}", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => Tt(c));
    }
  }
  async listInternal(e) {
    var t, o, r, l;
    let a, u = "", f = {};
    if (this.apiClient.isVertexAI()) {
      const d = Gl(e);
      return u = T("tuningJobs", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = ql(c), m = new Rn();
        return Object.assign(m, p), m;
      });
    } else {
      const d = Fl(e);
      return u = T("tunedModels", d._url), f = d._query, delete d._url, delete d._query, a = this.apiClient.request({
        path: u,
        queryParams: f,
        body: JSON.stringify(d),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      }).then((c) => c.json().then((p) => {
        const m = p;
        return m.sdkHttpResponse = {
          headers: c.headers
        }, m;
      })), a.then((c) => {
        const p = Vl(c), m = new Rn();
        return Object.assign(m, p), m;
      });
    }
  }
  /**
   * Cancels a tuning job.
   *
   * @param params - The parameters for the cancel request.
   * @return The empty response returned by the API.
   *
   * @example
   * ```ts
   * await ai.tunings.cancel({name: '...'}); // The server-generated resource name.
   * ```
   */
  async cancel(e) {
    var t, o, r, l;
    let a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const f = Ml(e);
      a = T("{name}:cancel", f._url), u = f._query, delete f._url, delete f._query, await this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(f),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      });
    } else {
      const f = Rl(e);
      a = T("{name}:cancel", f._url), u = f._query, delete f._url, delete f._query, await this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(f),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (l = e.config) === null || l === void 0 ? void 0 : l.abortSignal
      });
    }
  }
  async tuneInternal(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = Dl(e, e);
      return l = T("tuningJobs", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json().then((d) => {
        const c = d;
        return c.sdkHttpResponse = {
          headers: f.headers
        }, c;
      })), r.then((f) => Ee(f));
    } else
      throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, o;
    let r, l = "", a = {};
    if (this.apiClient.isVertexAI())
      throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const u = wl(e);
      return l = T("tunedModels", u._url), a = u._query, delete u._url, delete u._query, r = this.apiClient.request({
        path: l,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((f) => f.json().then((d) => {
        const c = d;
        return c.sdkHttpResponse = {
          headers: f.headers
        }, c;
      })), r.then((f) => $l(f));
    }
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Wl {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}
const Kl = 1024 * 1024 * 8, zl = 3, bl = 1e3, Xl = 2, de = "x-goog-upload-status";
async function Ql(n, e, t) {
  var o, r, l;
  let a = 0, u = 0, f = new pe(new Response()), d = "upload";
  for (a = n.size; u < a; ) {
    const p = Math.min(Kl, a - u), m = n.slice(u, u + p);
    u + p >= a && (d += ", finalize");
    let h = 0, g = bl;
    for (; h < zl && (f = await t.request({
      path: "",
      body: m,
      httpMethod: "POST",
      httpOptions: {
        apiVersion: "",
        baseUrl: e,
        headers: {
          "X-Goog-Upload-Command": d,
          "X-Goog-Upload-Offset": String(u),
          "Content-Length": String(p)
        }
      }
    }), !(!((o = f == null ? void 0 : f.headers) === null || o === void 0) && o[de])); )
      h++, await Ol(g), g = g * Xl;
    if (u += p, ((r = f == null ? void 0 : f.headers) === null || r === void 0 ? void 0 : r[de]) !== "active")
      break;
    if (a <= u)
      throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  const c = await (f == null ? void 0 : f.json());
  if (((l = f == null ? void 0 : f.headers) === null || l === void 0 ? void 0 : l[de]) !== "final")
    throw new Error("Failed to upload file: Upload status is not finalized.");
  return c.file;
}
async function Zl(n) {
  return { size: n.size, type: n.type };
}
function Ol(n) {
  return new Promise((e) => setTimeout(e, n));
}
class jl {
  async upload(e, t, o) {
    if (typeof e == "string")
      throw new Error("File path is not supported in browser uploader.");
    return await Ql(e, t, o);
  }
  async stat(e) {
    if (typeof e == "string")
      throw new Error("File path is not supported in browser uploader.");
    return await Zl(e);
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class ea {
  create(e, t, o) {
    return new na(e, t, o);
  }
}
class na {
  constructor(e, t, o) {
    this.url = e, this.headers = t, this.callbacks = o;
  }
  connect() {
    this.ws = new WebSocket(this.url), this.ws.onopen = this.callbacks.onopen, this.ws.onerror = this.callbacks.onerror, this.ws.onclose = this.callbacks.onclose, this.ws.onmessage = this.callbacks.onmessage;
  }
  send(e) {
    if (this.ws === void 0)
      throw new Error("WebSocket is not connected");
    this.ws.send(e);
  }
  close() {
    if (this.ws === void 0)
      throw new Error("WebSocket is not connected");
    this.ws.close();
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const zn = "x-goog-api-key";
class ta {
  constructor(e) {
    this.apiKey = e;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addAuthHeaders(e, t) {
    if (e.get(zn) === null) {
      if (this.apiKey.startsWith("auth_tokens/"))
        throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey)
        throw new Error("API key is missing. Please provide a valid API key.");
      e.append(zn, this.apiKey);
    }
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const oa = "gl-node/";
class ia {
  constructor(e) {
    var t;
    if (e.apiKey == null)
      throw new Error("An API Key must be set when running in a browser");
    if (e.project || e.location)
      throw new Error("Vertex AI project based authentication is not supported on browser runtimes. Please do not provide a project or location.");
    this.vertexai = (t = e.vertexai) !== null && t !== void 0 ? t : !1, this.apiKey = e.apiKey;
    const o = It(
      e.httpOptions,
      e.vertexai,
      /*vertexBaseUrlFromEnv*/
      void 0,
      /*geminiBaseUrlFromEnv*/
      void 0
    );
    o && (e.httpOptions ? e.httpOptions.baseUrl = o : e.httpOptions = { baseUrl: o }), this.apiVersion = e.apiVersion;
    const r = new ta(this.apiKey);
    this.apiClient = new $r({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: e.httpOptions,
      userAgentExtra: oa + "web",
      uploader: new jl(),
      downloader: new Wl()
    }), this.models = new ul(this.apiClient), this.live = new tl(this.apiClient, r, new ea()), this.batches = new Jo(this.apiClient), this.chats = new Ci(this.models, this.apiClient), this.caches = new yi(this.apiClient), this.files = new wi(this.apiClient), this.operations = new dl(this.apiClient), this.authTokens = new Al(this.apiClient), this.tunings = new Yl(this.apiClient);
  }
}
class sa {
  constructor() {
    this.client = null, this.session = null, this.inputAudioContext = null, this.mediaStream = null, this.audioProcessor = null, this.isRecording = !1, this.setupComplete = !1, this.accumulatedText = "", this.currentTurnActive = !1, this.eventTarget = new EventTarget(), this.inputSampleRate = 16e3, this.model = "gemini-live-2.5-flash-preview", this.verboseLogging = !1, this.pendingApiKey = null, this.pendingHttpOptions = null;
  }
  init(e) {
    const { apiKey: t, httpOptions: o } = e, r = t.startsWith("auth_tokens/"), l = r ? "v1alpha" : (o == null ? void 0 : o.apiVersion) || "v1beta";
    this.verboseLogging && console.log(`[MIC] API Version: ${l}`);
    const a = {
      ...o,
      apiVersion: l
    };
    r && l !== "v1alpha" && this.verboseLogging && console.warn("[MIC] Warning: Ephemeral tokens require v1alpha API version"), this.pendingApiKey = t, this.pendingHttpOptions = a, this.verboseLogging && console.log("[MIC] Config stored. Call start() to connect to Gemini API."), this.startMicrophone();
  }
  start() {
    if (!this.pendingApiKey) {
      this.verboseLogging && console.warn("[MIC] No pending config. Call init() first.");
      return;
    }
    this.connect(this.pendingApiKey, this.pendingHttpOptions);
  }
  async connect(e, t) {
    try {
      this.client = new ia({
        apiKey: e,
        httpOptions: t
      }), this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.inputSampleRate
      });
      const o = {
        responseModalities: [j.TEXT],
        systemInstruction: {
          parts: [{
            text: `You are a real-time speech analyzer named Uni. When you hear audio input, transcribe it and provide analysis. Audio will only every be English, do not interpret speech as anything but English.

CRITICAL: You MUST respond with ONLY valid JSON. No text before or after. No markdown. No code blocks. Just the raw JSON object.

Required JSON format (EXACTLY these fields, nothing else):
{
  "transcript": "exact transcription",
  "analysis": "brief content analysis in 1-2 sentences",
  "sentiment": "very short sentiment analysis",
  "tone": "a concise description of the tone of voice",
  "emoji": "single emoji of emotional content",
  "confidence": 0.85
}

Example response:
{"transcript": "Hello there", "analysis": "A friendly greeting, initiating a conversation", "sentiment": "positive", "tone": "A warm male tone of voice", emoji": "👋", "confidence": 0.9}

Remember: Return ONLY the JSON object. No other text.`
          }]
        }
      };
      this.verboseLogging && (console.log("[GEMINI] Config:", o), console.log("[GEMINI] Response modalities:", o.responseModalities)), this.session = await this.client.live.connect({
        model: this.model,
        callbacks: {
          onopen: () => {
            this.verboseLogging && console.log("[GEMINI] Connected to Gemini Live"), e && (localStorage.setItem("apiKey", e), this.verboseLogging && console.log("[STORAGE] Saved API key to localStorage")), setTimeout(() => {
              this.setupComplete = !0, this.mediaStream && this.inputAudioContext && (this.isRecording = !0, this.verboseLogging && console.log("[MIC] Ready to send audio to Gemini"));
            }, 500);
          },
          onmessage: async (r) => {
            this.verboseLogging && console.log("[GEMINI] Message received:", r), this.handleGeminiResponse(r);
          },
          onerror: (r) => {
            console.error("[GEMINI] Error:", r);
          },
          onclose: (r) => {
            this.verboseLogging && (console.log("[GEMINI] Connection closed:", r), console.log("[GEMINI] Close reason:", r.reason)), this.isRecording = !1, this.setupComplete && this.disconnect();
          }
        },
        config: o
      });
    } catch (o) {
      console.error("Connection error:", o);
    }
  }
  async startMicrophone() {
    try {
      (!this.inputAudioContext || this.inputAudioContext.state === "closed") && (console.error("[MIC] AudioContext is closed or null, recreating..."), this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.inputSampleRate
      })), this.verboseLogging && console.log("[MIC] Requesting microphone access..."), this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: this.inputSampleRate,
          echoCancellation: !0,
          noiseSuppression: !0
        }
      }), this.verboseLogging && console.log("[MIC] Microphone access granted"), this.inputAudioContext.state === "suspended" && await this.inputAudioContext.resume(), this.verboseLogging && console.log("[MIC] AudioContext created, sample rate:", this.inputAudioContext.sampleRate);
      const e = this.inputAudioContext.createMediaStreamSource(this.mediaStream), t = 256;
      this.audioProcessor = this.inputAudioContext.createScriptProcessor(t, 1, 1), this.audioProcessor.onaudioprocess = (o) => {
        if (!this.isRecording || !this.setupComplete || !this.session) return;
        const l = o.inputBuffer.getChannelData(0);
        try {
          const a = this.createBlob(l);
          this.session.sendRealtimeInput({ media: a });
        } catch (a) {
          console.error("[AUDIO] Error sending audio chunk:", a), a.message && a.message.includes("CLOSED") && (this.isRecording = !1);
        }
      }, e.connect(this.audioProcessor), this.audioProcessor.connect(this.inputAudioContext.destination), this.isRecording = !0, this.verboseLogging && console.log("[MIC] Recording started");
    } catch (e) {
      console.error("[MIC] Error:", e);
    }
  }
  // Encode bytes to base64
  encode(e) {
    const t = String.fromCharCode.apply(null, e);
    return btoa(t);
  }
  // Create blob from PCM data
  // Returns an object with data (base64) and mimeType, NOT a Blob object
  createBlob(e) {
    const t = e.length, o = new Int16Array(t);
    for (let r = 0; r < t; r++)
      o[r] = e[r] * 32768;
    return {
      data: this.encode(new Uint8Array(o.buffer)),
      mimeType: "audio/pcm;rate=16000"
    };
  }
  handleGeminiResponse(e) {
    var t, o, r;
    this.verboseLogging && console.log("[GEMINI] Message:", e);
    try {
      if (this.verboseLogging && (console.log("[GEMINI] Processing message:", e), e.serverContent && console.log("[GEMINI] serverContent:", e.serverContent)), ((t = e.serverContent) == null ? void 0 : t.interrupted) && this.verboseLogging && console.log("[GEMINI] User interrupted"), (o = e.serverContent) != null && o.modelTurn) {
        this.currentTurnActive || (this.currentTurnActive = !0, this.verboseLogging && console.log("[GEMINI] Model turn started"));
        const a = e.serverContent.modelTurn.parts;
        if (this.verboseLogging && console.log("[GEMINI] Parts:", a), a && a.length > 0)
          for (const u of a)
            this.verboseLogging && console.log("[GEMINI] Part:", u, "Has text:", !!u.text, "Has audio:", !!u.inlineData), u.text && (this.verboseLogging && console.log("[GEMINI] Found text:", u.text), this.accumulatedText += u.text);
      }
      if ((r = e.serverContent) != null && r.turnComplete)
        if (this.verboseLogging && (console.log("[GEMINI] Turn complete - processing full response"), console.log("[GEMINI] Accumulated text so far:", this.accumulatedText)), this.currentTurnActive = !1, this.accumulatedText && this.accumulatedText.trim().length > 0) {
          const a = this.parseResponse(this.accumulatedText);
          if (a) {
            const { transcript: u, analysis: f, tone: d, emoji: c, confidence: p, sentiment: m } = a;
            u && f && this.emitPercept({ transcript: u, analysis: f, tone: d, emoji: c, sentiment: m, confidence: p });
          }
          this.accumulatedText = "";
        } else
          this.verboseLogging && console.log("[GEMINI] Turn complete but no text received");
    } catch (l) {
      console.error("[GEMINI] Error processing response:", l, "Message:", e), this.accumulatedText = "", this.currentTurnActive = !1;
    }
  }
  // Parse response - normalize Gemini's actual response format
  // Handles variations: transcription vs transcript, nested analysis objects, etc.
  parseResponse(e) {
    var l, a, u, f, d, c, p;
    try {
      let m;
      try {
        m = JSON.parse(e.trim());
      } catch {
        const S = e.match(/\{[\s\S]*\}/);
        if (S)
          m = JSON.parse(S[0]);
        else
          throw new Error("No JSON found");
      }
      const h = m.transcript || m.transcription || null;
      let g = null;
      if (typeof m.analysis == "string")
        g = m.analysis;
      else if (typeof m.analysis == "object" && m.analysis !== null) {
        const I = m.analysis;
        if (I.uni_personal_reaction)
          g = I.uni_personal_reaction;
        else if (I.response_suggestion)
          g = I.response_suggestion;
        else {
          const S = [];
          (l = I.sentiment) != null && l.overall && S.push(`Sentiment: ${I.sentiment.overall}`), I.tone && S.push(`Tone: ${I.tone}`), I.emotion_detected && S.push(`Emotion: ${I.emotion_detected}`), g = S.join(". ") || JSON.stringify(I);
        }
      }
      let y = null;
      typeof m.sentiment == "string" ? y = m.sentiment : (a = m.sentiment) != null && a.overall ? y = m.sentiment.overall : (f = (u = m.analysis) == null ? void 0 : u.sentiment) != null && f.overall && (y = m.analysis.sentiment.overall);
      let _ = null;
      typeof m.tone == "string" ? _ = m.tone : (d = m.tone) != null && d.overall ? _ = m.tone.overall : (p = (c = m.analysis) == null ? void 0 : c.tone) != null && p.overall && (_ = m.analysis.tone.overall);
      const v = m.emoji || null;
      let C = m.confidence;
      typeof C == "string" && (C = parseFloat(C)), (isNaN(C) || C === null || C === void 0) && (C = null);
      const E = {
        transcript: h,
        analysis: g,
        sentiment: y,
        tone: _,
        emoji: v || "💬",
        confidence: C
      };
      if (h || g)
        return E;
    } catch (m) {
      this.verboseLogging && console.log("[GEMINI] JSON parse failed, using regex fallback:", m.message);
    }
    const t = this.extractTranscript(e), o = this.extractAnalysis(e);
    this.extractTone(e);
    const r = this.extractEmoji(e);
    return t || o ? { transcript: t, analysis: o, emoji: r } : null;
  }
  extractTranscript(e) {
    const t = e.match(/Transcript:\s*(.+?)(?:\n|Analysis:|Emoji:|$)/is);
    return t && t[1] ? t[1].trim() : null;
  }
  extractAnalysis(e) {
    const t = e.match(/Analysis:\s*(.+?)(?:\n\s*Emoji:|$)/is);
    return t && t[1] ? t[1].trim() : e.replace(/Transcript:.*?(?=Analysis:|Emoji:|$)/is, "").replace(/Emoji:\s*.*/i, "").trim();
  }
  extractTone(e) {
    const t = e.match(/Tone:\s*(.+?)(?:\n\s*Emoji:|$)/is);
    return t && t[1] ? t[1].trim() : e.replace(/Transcript:.*?(?=Tone:|Emoji:|$)/is, "").replace(/Emoji:\s*.*/i, "").trim();
  }
  extractEmoji(e) {
    const t = e.match(/Emoji:\s*([^\s\n]+)/i);
    if (t && t[1])
      return this.verboseLogging && console.log("[EMOJI] Matched from pattern:", t[1]), t[1].substring(0, 2);
    const o = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u, r = e.match(o);
    return r ? r[0] : "💬";
  }
  emitPercept(e) {
    this.eventTarget.dispatchEvent(new CustomEvent("percept", { detail: e }));
  }
  addEventListener(e, t) {
    this.eventTarget.addEventListener(e, t);
  }
  removeEventListener(e, t) {
    this.eventTarget.removeEventListener(e, t);
  }
  // Set verbose logging flag
  setVerboseLogging(e) {
    this.verboseLogging = e;
  }
  disconnect() {
    this.session && (this.session.close(), this.session = null), this.client = null, this.isRecording = !1, this.setupComplete = !1, this.accumulatedText = "", this.currentTurnActive = !1;
  }
}
export {
  sa as MicAudioToText
};
