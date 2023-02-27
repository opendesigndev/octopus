import On from "util";
import { v4 as Le } from "uuid";
import we from "paper";
import wn from "pino";
import { createParser as Pn } from "@opendesign/figma-parser";
import { EventEmitter as $n } from "eventemitter3";
var S = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Cn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var he = {};
Object.defineProperty(he, "__esModule", { value: !0 });
var gr = he.benchmarkAsync = he.benchmark = void 0;
function Ln(e) {
  const t = performance.now(), r = e(), n = performance.now() - t;
  return { result: r, time: n };
}
he.benchmark = Ln;
async function Rn(e) {
  const t = performance.now(), r = await e(), n = performance.now() - t;
  return { result: r, time: n };
}
gr = he.benchmarkAsync = Rn;
var M = {};
Object.defineProperty(M, "__esModule", { value: !0 });
M.sleep = M.rejectTo = fe = M.detachPromiseControls = void 0;
function In() {
  let e, t;
  return {
    promise: new Promise((n, s) => {
      e = n, t = s;
    }),
    resolve: e,
    reject: t
  };
}
var fe = M.detachPromiseControls = In;
function Nn(e, t = null) {
  return Promise.resolve(e).then((r) => r, () => t);
}
M.rejectTo = Nn;
function Mn(e) {
  return new Promise((t) => {
    setTimeout(() => {
      t();
    }, e);
  });
}
M.sleep = Mn;
var d = {};
function xn(e) {
  return e != null && typeof e == "object";
}
var j = xn, vr = S && S.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(d, "__esModule", { value: !0 });
var Ke = d.compareStrings = R = d.push = Tr = d.keys = br = d.traverseAndFind = de = d.getConvertedAsync = d.getConverted = d.getPresentProps = L = d.getMapped = yr = d.isObject = d.deepInspect = d.JSONFromTypedArray = void 0;
const Dn = vr(On), kn = vr(j);
function Fn(e) {
  return JSON.parse(Buffer.from(e).toString());
}
d.JSONFromTypedArray = Fn;
function zn(e) {
  return Dn.default.inspect(e, { depth: null });
}
d.deepInspect = zn;
function jn(e) {
  return Boolean(e && (typeof e == "object" || typeof e == "function"));
}
var yr = d.isObject = jn;
function Gn(e, t, r) {
  return typeof e != "string" ? r : e && e in t ? t[e] : r;
}
var L = d.getMapped = Gn;
function Vn(e, t = []) {
  return Object.fromEntries(Object.entries(e).filter(([, r]) => r != null && !t.includes(r)));
}
d.getPresentProps = Vn;
function Un(e) {
  return e.map((t) => t.convert()).filter((t) => Boolean(t));
}
d.getConverted = Un;
async function Bn(e) {
  return (await Promise.all(e.map((r) => r.convert()))).filter((r) => Boolean(r));
}
var de = d.getConvertedAsync = Bn;
function mr(e, t) {
  return [
    t(e),
    ...Object.values(e).reduce((r, n) => (0, kn.default)(n) ? [...r, ...mr(n, t)] : r, [])
  ];
}
function Hn(e, t) {
  return mr(e, t).filter((r) => r !== void 0);
}
var br = d.traverseAndFind = Hn;
function Kn(e) {
  return Object.keys(e);
}
var Tr = d.keys = Kn;
function Yn(e, ...t) {
  return e.push(...t), e;
}
var R = d.push = Yn;
Ke = d.compareStrings = (() => {
  const e = new Intl.Collator("en-US");
  return (t, r) => e.compare(t, r);
})();
var ot = {};
Object.defineProperty(ot, "__esModule", { value: !0 });
var Er = ot.Queue = void 0;
const Ot = M;
class qn {
  constructor(t) {
    const { name: r, factory: n, parallels: s, drainLimit: i = 1 } = t;
    this._name = r, this._factory = n, this._available = s, this._drainLimit = i, this._tasks = [], this._awaiting = 0, this._working = 0;
  }
  static safeValue(t) {
    return { value: t, error: null };
  }
  static safeError(t) {
    return { value: void 0, error: t };
  }
  get status() {
    return {
      name: this._name,
      available: this._available,
      working: this._working,
      enqueued: this._awaiting
    };
  }
  _getTasks() {
    return typeof this._drainLimit == "number" ? this._tasks.splice(0, this._drainLimit) : this._tasks.splice(0);
  }
  _finalizeTask() {
    this._working--, this._available++, queueMicrotask(() => this._try());
  }
  _try() {
    this._available > 0 && this._awaiting && this._run();
  }
  _resolveTasksWithResults(t, r) {
    if (this._finalizeTask(), !Array.isArray(r) || t.length !== r.length)
      throw new Error("Results are not an array or has different length than tasks input.");
    r.forEach((n, s) => {
      const { value: i, error: a } = n, { resolve: o, reject: c } = t[s];
      queueMicrotask(() => {
        a ? c(a) : o(i);
      });
    });
  }
  _rejectTasks(t, r) {
    this._finalizeTask(), t.forEach((n) => n.reject(r));
  }
  async _run() {
    this._available--, this._working++;
    const t = this._getTasks();
    if (!t.length) {
      this._finalizeTask();
      return;
    }
    this._awaiting -= t.length;
    try {
      const r = await this._factory(t.map((n) => n.task));
      this._resolveTasksWithResults(t, r);
    } catch (r) {
      this._rejectTasks(t, r);
    }
  }
  exec(t) {
    const { promise: r, resolve: n, reject: s } = (0, Ot.detachPromiseControls)();
    return this._tasks.push({ task: t, resolve: n, reject: s }), this._awaiting++, queueMicrotask(() => this._try()), r;
  }
  /**
   * Optimized way to call multiple exec() at once.
   * Instead of spawning multiple parallels per task when queue is empty,
   * executes only one parallel with drainer if available.
   *
   * Returns Promise<U>[] instead of Promise<U[]> so it's possible to handle each
   * promise separately.
   * */
  execMany(t) {
    return t.map((n) => {
      const { promise: s, resolve: i, reject: a } = (0, Ot.detachPromiseControls)();
      return this._tasks.push({ task: n, resolve: i, reject: a }), this._awaiting++, queueMicrotask(() => this._try()), s;
    });
  }
}
Er = ot.Queue = qn;
let Ye;
function Wn(e) {
  Ye = e;
}
function z() {
  if (!Ye)
    throw new Error("Platform specific factories are not set!");
  return Ye;
}
let h = null, ge, Sr, Ar;
function Xn(e) {
  h = e;
}
function Jn(e) {
  var t, r;
  ge = ((r = (t = z()).createEnvironment) == null ? void 0 : r.call(t)) ?? {}, h = z().createLoggerFactory(e.logger), Sr = z().createBufferService().base64ToUint8Array, Ar = z().createImageSizeService();
}
var A = {};
Object.defineProperty(A, "__esModule", { value: !0 });
var P = A.asFiniteNumber = A.asNumber = qe = A.asString = A.asBoolean = ct = A.asArray = void 0;
function Qn(e, t) {
  return Array.isArray(e) ? e : Array.isArray(t) ? t : [];
}
var ct = A.asArray = Qn;
function Zn(e, t) {
  return typeof e == "boolean" ? e : typeof t == "boolean" ? t : Boolean(e);
}
A.asBoolean = Zn;
function es(e, t) {
  return typeof e == "string" ? e : typeof t == "string" ? t : String(e);
}
var qe = A.asString = es;
function ts(e, t) {
  return typeof e == "number" ? e : typeof t == "number" ? t : Number(e);
}
A.asNumber = ts;
function rs(e, t) {
  if (typeof e == "number" && Number.isFinite(e))
    return e;
  if (typeof t == "number" && Number.isFinite(t))
    return t;
  const r = Number(e);
  if (!Number.isFinite(r))
    throw new Error(`Failed when converting "${e}" to finite number`);
  return r;
}
P = A.asFiniteNumber = rs;
var b = {};
Object.defineProperty(b, "__esModule", { value: !0 });
var Or = b.invLerp = b.lerp = b.tan = b.cos = b.sin = b.clamp = m = b.round = wr = b.mod = void 0;
function ns(e, t) {
  const r = e % t;
  return r >= 0 ? r : r + t;
}
var wr = b.mod = ns;
function ss(e, t = 2) {
  const r = Math.pow(10, t);
  return Math.round(e * r) / r;
}
var m = b.round = ss;
function is(e, t, r) {
  return Math.max(Math.min(e, r), t);
}
b.clamp = is;
function as(e) {
  return Math.sin(e * Math.PI / 180);
}
b.sin = as;
function os(e) {
  return Math.cos(e * Math.PI / 180);
}
b.cos = os;
function cs(e) {
  return Math.tan(e * Math.PI / 180);
}
b.tan = cs;
function us(e, t, r) {
  return e * (1 - r) + t * r;
}
b.lerp = us;
function ls(e, t, r) {
  return e === r ? 0 : t === r ? 1 : (r - e) / (t - e);
}
Or = b.invLerp = ls;
const T = {
  TRANSFORM: [1, 0, 0, 1, 0, 0],
  BLEND_MODE: "NORMAL",
  EMPTY_PATH: "",
  WINDING_RULE: "NON_ZERO",
  STROKE_ALIGN: "CENTER",
  STROKE_CAP: "NONE",
  STROKE_JOIN: "MITER",
  STROKE_LINE_CAP: "BUTT",
  STROKE_MITER_ANGLE: 28.96,
  TEXT: {
    FONT_SIZE: 12,
    FONT_WEIGHT: 400,
    LETTER_SPACING: 0,
    LINE_HEIGHT_PERCENT: 100,
    LINE_HEIGHT_UNIT: "INTRINSIC_%"
  }
}, hs = [
  "COLOR",
  "COLOR_BURN",
  "COLOR_DODGE",
  "DARKEN",
  "DIFFERENCE",
  "EXCLUSION",
  "HARD_LIGHT",
  "HUE",
  "LIGHTEN",
  "LINEAR_BURN",
  "LINEAR_DODGE",
  "LUMINOSITY",
  "MULTIPLY",
  "NORMAL",
  "OVERLAY",
  "PASS_THROUGH",
  "SATURATION",
  "SCREEN",
  "SOFT_LIGHT"
];
function C(e) {
  return e.replaceAll(":", "-").replaceAll(";", "_");
}
function ut(e) {
  return typeof e == "string" && hs.includes(e) ? e : T.BLEND_MODE;
}
function Pr(e, { isFrameLike: t = !1 }) {
  return !t && e === "PASS_THROUGH" ? T.BLEND_MODE : ut(e);
}
function lt(e, t = 1) {
  const r = P(e == null ? void 0 : e.a, 0) * t;
  return {
    r: m(P(e == null ? void 0 : e.r, 0), 4),
    g: m(P(e == null ? void 0 : e.g, 0), 4),
    b: m(P(e == null ? void 0 : e.b, 0), 4),
    a: m(r, 4)
  };
}
function fs(e, t = 1) {
  return (e == null ? void 0 : e.color) === void 0 || (e == null ? void 0 : e.position) === void 0 ? null : {
    color: lt(e.color, t),
    position: e.position
  };
}
function ps({ x: e, y: t }) {
  return { x0: 0, x1: e, y0: 0, y1: t };
}
function Pe(e) {
  if ((e == null ? void 0 : e.x) === void 0 && (e == null ? void 0 : e.y) === void 0 && (e == null ? void 0 : e.width) === void 0 && (e == null ? void 0 : e.height) === void 0)
    return null;
  const t = m(P(e == null ? void 0 : e.x, 0)), r = m(P(e == null ? void 0 : e.y, 0)), n = m(P(e == null ? void 0 : e.width, 0)), s = m(P(e == null ? void 0 : e.height, 0));
  return { x: t, y: r, width: n, height: s };
}
function $r(e) {
  if ((e == null ? void 0 : e.x) === void 0 && (e == null ? void 0 : e.y) === void 0)
    return null;
  const t = m(P(e == null ? void 0 : e.x, 0)), r = m(P(e == null ? void 0 : e.y, 0));
  return { x: t, y: r };
}
function We(e) {
  const [t, r] = e ?? [];
  if (!Array.isArray(t) || !Array.isArray(r))
    return null;
  const [n, s, i] = t, [a, o, c] = r;
  return [n, a, s, o, i, c];
}
function _s(e) {
  return e === "EVENODD" ? "EVEN_ODD" : "NON_ZERO";
}
function wt(e = []) {
  return e.map((t) => ({
    path: t.path ?? T.EMPTY_PATH,
    fillRule: _s(t.windingRule)
  }));
}
function Cr(e) {
  return e.isPasteboard ? "PASTEBOARD" : e.sourceLayer.type === "COMPONENT" ? "COMPONENT" : e.parentType && e.parentType !== "PAGE" ? "PARTIAL" : "ARTBOARD";
}
function ds(e) {
  const { r: t, g: r, b: n, a: s } = e ?? {};
  return t === void 0 || r === void 0 || n === void 0 ? void 0 : { r: t, g: r, b: n, a: s === void 0 ? 1 : s };
}
function Lr(e) {
  if (ge.NODE_ENV !== "debug")
    return;
  const t = e.bounds, r = e.boundingBox;
  if (!t || !r)
    return;
  const { x: n, y: s } = t, { x: i, y: a } = r;
  return [1, 0, 0, 1, i - n, a - s];
}
const Ae = class {
  constructor(e) {
    this._sourceDesign = e.sourceDesign, this._octopusConverter = e.octopusConverter, this._exports = {
      images: /* @__PURE__ */ new Map(),
      previews: /* @__PURE__ */ new Map(),
      components: /* @__PURE__ */ new Map(),
      componentImageMap: /* @__PURE__ */ new Map(),
      componentSourcePath: /* @__PURE__ */ new Map(),
      libraries: /* @__PURE__ */ new Map(),
      chunks: /* @__PURE__ */ new Map()
    };
  }
  finalize() {
    [...this._exports.images.keys()].forEach((t) => {
      var r;
      (r = this._exports.images.get(t)) == null || r.reject(new Error(`Image with name '${t}' is missing`));
    });
  }
  async setExportedImagePath(e, t) {
    var r;
    this._exports.images.has(e) || this._exports.images.set(e, fe()), (r = this._exports.images.get(e)) == null || r.resolve(t);
  }
  getExportedImagePath(e) {
    var t;
    return this._exports.images.has(e) || this._exports.images.set(e, fe()), (t = this._exports.images.get(e)) == null ? void 0 : t.promise;
  }
  setExportedPreviewPath(e, t) {
    this._exports.previews.set(e, t);
  }
  getExportedPreviewPath(e) {
    return this._exports.previews.get(e);
  }
  setExportedComponentImageMap(e, t) {
    this._exports.componentImageMap.set(e, t);
  }
  getExportedComponentImageMap(e) {
    return this._exports.componentImageMap.get(e);
  }
  setExportedSourcePath(e, t) {
    this._exports.componentSourcePath.set(e, t);
  }
  getExportedSourcePath(e) {
    return this._exports.componentSourcePath.get(e);
  }
  setExportedChunk(e, t) {
    this._exports.chunks.set(e.id, { style: e, sourcePath: t });
  }
  getExportedChunk(e) {
    return this._exports.chunks.get(e);
  }
  setExportedLibrary(e) {
    const { designId: t, name: r, designNodeId: n } = e, s = C(t), i = { id: C(n), type: "COMPONENT" }, a = this._exports.libraries.get(t);
    if (a)
      a.children = R(a.children, i);
    else {
      const o = { originalId: t };
      this._exports.libraries.set(t, { id: s, name: r, meta: o, children: [i] });
    }
  }
  getExportedComponentDescriptorById(e) {
    var t;
    return (t = this._exports.components.get(e)) == null ? void 0 : t.descriptor;
  }
  getExportedComponentPathById(e) {
    var r;
    const t = this._exports.components.get(e);
    if (typeof ((r = t == null ? void 0 : t.descriptor) == null ? void 0 : r.path) == "string")
      return t.descriptor.path;
  }
  setExportedComponent(e, t) {
    this._exports.components.set(e.id, { source: e, descriptor: t });
  }
  get manifestVersion() {
    return this._octopusConverter.pkg.manifestSpecVersion;
  }
  get meta() {
    return { converterVersion: this._octopusConverter.pkg.version };
  }
  get figVersion() {
    return this._sourceDesign.schemaVersion ?? Ae.DEFAULT_FIG_VERSION;
  }
  get name() {
    return this._sourceDesign.name ?? Ae.DEFAULT_FIG_FILENAME;
  }
  _convertError(e) {
    return e ? {
      code: -1,
      message: e.message,
      stacktrace: e.stack ? e.stack.split(`
`) : void 0
    } : void 0;
  }
  get pages() {
    return [...this._sourceDesign.pages.map((t) => ({
      id: C(t.id),
      name: t.name,
      meta: { originalId: t.id },
      children: t.children.map((r) => ({ id: C(r.id), type: "COMPONENT" }))
    }))].sort((t, r) => Ke(t.id, r.id));
  }
  _getStatus(e) {
    const t = e.id, r = this.getExportedComponentDescriptorById(t);
    return {
      value: r ? r.error ? "FAILED" : "READY" : "PROCESSING",
      error: this._convertError(r == null ? void 0 : r.error),
      time: (r == null ? void 0 : r.time) ?? void 0
    };
  }
  async _getAssetImage(e) {
    return { location: { type: "RELATIVE", path: await this.getExportedImagePath(e) ?? "" }, refId: e };
  }
  async _getAssetImages(e) {
    const t = [];
    for (const r of e) {
      const n = await this._getAssetImage(r);
      n && t.push(n);
    }
    return t;
  }
  _getAssetFonts(e) {
    return e.map((t) => ({ name: t }));
  }
  async _getAssets(e) {
    const t = this.getExportedComponentImageMap(e.id) ?? [], r = await this._getAssetImages(t), n = this._getAssetFonts(e.dependencies.fonts);
    return { images: r, fonts: n };
  }
  _getSourceArtifact(e) {
    return { type: "SOURCE", location: { type: "RELATIVE", path: e } };
  }
  _getArtifacts(e) {
    const t = [], r = this.getExportedSourcePath(e.id);
    return r && t.push(this._getSourceArtifact(r)), t;
  }
  _getPreview(e) {
    const t = this.getExportedPreviewPath(e);
    if (t)
      return { type: "RELATIVE", path: t };
  }
  _getVariantProperties(e = "") {
    const t = {};
    return e.split(", ").forEach((r) => {
      const n = r.split("=");
      if (n.length !== 2)
        return;
      const [s, i] = n;
      t[s] = i;
    }), t;
  }
  _getVariant(e) {
    const t = this._sourceDesign.getComponentById(e);
    if (!t)
      return;
    const { componentSetId: r, description: n } = t;
    if (!r)
      return;
    const s = this._sourceDesign.componentSets[r];
    if (!s)
      return;
    const { name: i, description: a } = s;
    if (!i)
      return;
    const o = { id: C(r), name: i, meta: { originalId: r }, description: a }, c = this._getVariantProperties(t.name);
    return { of: o, properties: c, description: n };
  }
  _getChunk(e, t) {
    if (!e || !t)
      return;
    const r = C(e.id), { name: n, description: s, styleType: i } = e.meta, a = L(i, Ae.CHUNK_TYPE_MAP, void 0);
    if (!a) {
      h == null || h.warn("Unknown chunk type", { styleType: i });
      return;
    }
    const o = { type: "RELATIVE", path: t }, c = { originalId: e.id };
    return { id: r, name: n, meta: c, description: s, type: a, location: o };
  }
  get chunks() {
    return Array.from(this._exports.chunks.values()).map((e) => this._getChunk(e == null ? void 0 : e.style, e == null ? void 0 : e.sourcePath)).filter((e) => Boolean(e));
  }
  get libraries() {
    return Array.from(this._exports.libraries.values());
  }
  async _getComponent(e) {
    const t = C(e.id), r = e.bounds ?? void 0, n = this._getStatus(e), i = { type: "RELATIVE", path: this.getExportedComponentPathById(e.id) ?? "" }, a = await this._getAssets(e), o = this._getArtifacts(e), c = Cr(e), u = this._getPreview(e.id), l = this._getVariant(e.id), f = { originalId: e.id };
    return {
      id: t,
      name: e.name,
      role: c,
      meta: f,
      status: n,
      bounds: r,
      dependencies: [],
      preview: u,
      assets: a,
      artifacts: o,
      variant: l,
      location: i
    };
  }
  async components() {
    const e = Array.from(this._exports.components.values());
    return [...await Promise.all(e.map((r) => this._getComponent(r.source)))].sort((r, n) => Ke(r.id, n.id));
  }
  async convert() {
    return {
      version: this.manifestVersion,
      origin: {
        name: "FIGMA",
        version: this.figVersion
      },
      name: this.name,
      meta: this.meta,
      pages: this.pages,
      components: await this.components(),
      chunks: this.chunks,
      libraries: this.libraries
    };
  }
};
let Re = Ae;
Re.DEFAULT_FIG_VERSION = "0";
Re.DEFAULT_FIG_FILENAME = "Untitled";
Re.CHUNK_TYPE_MAP = {
  FILL: "STYLE_FILL",
  TEXT: "STYLE_TEXT",
  EFFECT: "STYLE_EFFECT",
  GRID: "STYLE_GRID"
};
var ht = {};
Object.defineProperty(ht, "__esModule", { value: !0 });
var $ = ht.firstCallMemo = void 0;
function Pt(e) {
  const t = /* @__PURE__ */ new WeakMap();
  return function(...r) {
    return t.has(this) || t.set(this, e.call(this, ...r)), t.get(this);
  };
}
function gs() {
  return function(e, t, r) {
    return r.get && (r.get = Pt(r.get)), r.value && (r.value = Pt(r.value)), r;
  };
}
$ = ht.firstCallMemo = gs;
class G {
  constructor(t) {
    this._rawValue = t;
  }
  get raw() {
    return this._rawValue;
  }
}
class vs extends G {
  constructor(t) {
    super(t);
  }
  get type() {
    var t;
    return (t = this._rawValue) == null ? void 0 : t.type;
  }
  get visible() {
    var t;
    return ((t = this._rawValue) == null ? void 0 : t.visible) ?? !0;
  }
  get radius() {
    var t;
    return ((t = this._rawValue) == null ? void 0 : t.radius) ?? 0;
  }
  get color() {
    var t;
    return (t = this._rawValue) == null ? void 0 : t.color;
  }
  get blendMode() {
    var t;
    return (t = this._rawValue) == null ? void 0 : t.blendMode;
  }
  get offset() {
    var t;
    return $r((t = this._rawValue) == null ? void 0 : t.offset);
  }
  get spread() {
    var t;
    return ((t = this._rawValue) == null ? void 0 : t.spread) ?? 0;
  }
  get showShadowBehindNode() {
    var t;
    return ((t = this._rawValue) == null ? void 0 : t.showShadowBehindNode) ?? !1;
  }
}
class Xe extends G {
  constructor(t) {
    super(t.rawValue);
  }
  get type() {
    return this._rawValue.type;
  }
  get visible() {
    return this._rawValue.visible ?? !0;
  }
  get opacity() {
    return m(this._rawValue.opacity ?? 1);
  }
  get color() {
    return ds(this._rawValue.color);
  }
  get blendMode() {
    return this._rawValue.blendMode;
  }
  get scaleMode() {
    return this._rawValue.scaleMode;
  }
  get imageTransform() {
    return We(this._rawValue.imageTransform);
  }
  get rotation() {
    const t = this._rawValue.rotation ?? 0, r = wr(-t, 360);
    return r || void 0;
  }
  get scalingFactor() {
    return m(this._rawValue.scalingFactor ?? 1);
  }
  get gradientStops() {
    return this._rawValue.gradientStops ?? [];
  }
  get gradientHandlePositions() {
    const [t, r, n] = this._rawValue.gradientHandlePositions ?? [];
    return [t == null ? void 0 : t.x, t == null ? void 0 : t.y, r == null ? void 0 : r.x, r == null ? void 0 : r.y, n == null ? void 0 : n.x, n == null ? void 0 : n.y].includes(void 0) ? null : [t, r, n];
  }
  get gradientTransform() {
    return We(this._rawValue.gradientTransform);
  }
  get imageRef() {
    return this._rawValue.imageRef;
  }
  get filters() {
    return this._rawValue.filters;
  }
}
var ys = Object.defineProperty, ms = Object.getOwnPropertyDescriptor, Rr = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? ms(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && ys(t, r, s), s;
};
const bs = ["FRAME", "GROUP", "COMPONENT", "COMPONENT_SET", "INSTANCE"];
class ve extends G {
  constructor(t) {
    super(t.rawValue), this._parent = t.parent;
  }
  get id() {
    return this._rawValue.id ?? Le();
  }
  get name() {
    return this._rawValue.name;
  }
  get parent() {
    return this._parent;
  }
  get parentComponent() {
    const t = this._parent;
    return t instanceof x ? t : t.parentComponent;
  }
  get visible() {
    return this._rawValue.visible ?? !0;
  }
  get opacity() {
    return m(this._rawValue.opacity ?? 1);
  }
  get blendMode() {
    return this._rawValue.blendMode;
  }
  get isFrameLike() {
    return bs.includes(this._rawValue.type ?? "");
  }
  get transform() {
    return We(this._rawValue.relativeTransform);
  }
  get hasBackgroundMask() {
    return !1;
  }
  get fills() {
    var t;
    return ((t = this._rawValue.fills) == null ? void 0 : t.map((r) => new Xe({ rawValue: r }))) ?? [];
  }
  get strokes() {
    var t;
    return ((t = this._rawValue.strokes) == null ? void 0 : t.map((r) => new Xe({ rawValue: r }))) ?? [];
  }
  get fillGeometry() {
    return wt(this._rawValue.fillGeometry);
  }
  get strokeGeometry() {
    return wt(this._rawValue.strokeGeometry);
  }
  get strokeWeight() {
    return this._rawValue.strokeWeight ?? 0;
  }
  get strokeAlign() {
    return this._rawValue.strokeAlign ?? T.STROKE_ALIGN;
  }
  get strokeCap() {
    return this._rawValue.strokeCap ?? T.STROKE_CAP;
  }
  get strokeJoin() {
    return this._rawValue.strokeJoin ?? T.STROKE_JOIN;
  }
  get strokeDashes() {
    return this._rawValue.strokeDashes ?? [];
  }
  get strokeMiterAngle() {
    return this._rawValue.strokeMiterAngle ?? T.STROKE_MITER_ANGLE;
  }
  get effects() {
    return (this._rawValue.effects ?? []).reduce((r, n) => {
      const s = new vs(n);
      return s ? R(r, s) : r;
    }, []);
  }
  get size() {
    return $r(this._rawValue.size);
  }
  get cornerRadius() {
    const t = this._rawValue.cornerRadius;
    return typeof t == "number" && t ? t : void 0;
  }
  get cornerRadii() {
    return this._rawValue.rectangleCornerRadii;
  }
  get isMask() {
    return this._rawValue.isMask ?? !1;
  }
  get isMaskOutline() {
    return this._rawValue.isMaskOutline ?? !1;
  }
  get isArtboard() {
    var t, r;
    return (t = this._rawValue.parent) != null && t.type ? ((r = this._rawValue.parent) == null ? void 0 : r.type) === "PAGE" : this.parent instanceof x;
  }
}
Rr([
  $()
], ve.prototype, "fills", 1);
Rr([
  $()
], ve.prototype, "strokes", 1);
class Ir extends ve {
  constructor(t) {
    super(t), this._layers = this._initLayers();
  }
  _initLayers() {
    var t;
    return ct((t = this._rawValue) == null ? void 0 : t.children).reduce((r, n) => {
      const s = Ie({ layer: n, parent: this });
      return s ? R(r, s) : r;
    }, []);
  }
  get hasBackgroundMask() {
    const t = ["FRAME", "COMPONENT_SET", "COMPONENT", "INSTANCE"].includes(this.type), r = this.fills.length > 0, n = this.strokes.length > 0;
    return t && (r || n);
  }
  get type() {
    return this._rawValue.type ?? "FRAME";
  }
  get clipsContent() {
    return this._rawValue.clipsContent ?? !0;
  }
  get layers() {
    return this._layers;
  }
  get bounds() {
    return Pe(this._rawValue.absoluteRenderBounds);
  }
  get boundingBox() {
    return Pe(this._rawValue.absoluteBoundingBox);
  }
}
class Ts extends ve {
  constructor(t) {
    super(t), this._children = this._initLayers();
  }
  _initLayers() {
    var r;
    return ct((r = this._rawValue) == null ? void 0 : r.children).reduce((n, s) => {
      const i = Ie({ parent: this, layer: s });
      return i ? R(n, i) : n;
    }, []);
  }
  get type() {
    return "SHAPE";
  }
  get shapeType() {
    return this._rawValue.type;
  }
  get children() {
    return this._children;
  }
  get booleanOperation() {
    return this._rawValue.booleanOperation;
  }
}
var Es = Object.defineProperty, Ss = Object.getOwnPropertyDescriptor, As = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? Ss(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && Es(t, r, s), s;
};
class Je extends G {
  constructor(t) {
    super(t);
  }
  get fontFamily() {
    return this._rawValue.fontFamily;
  }
  get fontPostScriptName() {
    return this._rawValue.fontPostScriptName ?? void 0;
  }
  get fontStyle() {
    return this._rawValue.fontStyle;
  }
  get fontWeight() {
    return this._rawValue.fontWeight ?? void 0;
  }
  get fontSize() {
    return this._rawValue.fontSize ?? void 0;
  }
  get textAlignHorizontal() {
    return this._rawValue.textAlignHorizontal ?? void 0;
  }
  get textAlignVertical() {
    return this._rawValue.textAlignVertical ?? void 0;
  }
  get letterSpacing() {
    return this._rawValue.letterSpacing ?? void 0;
  }
  get lineHeightPx() {
    return this._rawValue.lineHeightPx ?? void 0;
  }
  get lineHeightPercent() {
    return this._rawValue.lineHeightPercent ?? void 0;
  }
  get lineHeightPercentFontSize() {
    return this._rawValue.lineHeightPercentFontSize ?? void 0;
  }
  get lineHeightUnit() {
    return this._rawValue.lineHeightUnit ?? void 0;
  }
  get paragraphSpacing() {
    return this._rawValue.paragraphSpacing ?? void 0;
  }
  get paragraphIndent() {
    return this._rawValue.paragraphIndent ?? void 0;
  }
  get listSpacing() {
    return this._rawValue.listSpacing ?? void 0;
  }
  get italic() {
    return this._rawValue.italic ?? void 0;
  }
  get kerning() {
    const r = (this._rawValue.opentypeFlags ?? {}).KERN;
    if (r !== void 0)
      return r !== 0;
  }
  get textCase() {
    return this._rawValue.textCase;
  }
  get textDecoration() {
    return this._rawValue.textDecoration;
  }
  get textAutoResize() {
    return this._rawValue.textAutoResize;
  }
  get textFills() {
    var t;
    return (t = this._rawValue.fills) == null ? void 0 : t.map((r) => new Xe({ rawValue: r }));
  }
}
As([
  $()
], Je.prototype, "textFills", 1);
var Os = Object.defineProperty, ws = Object.getOwnPropertyDescriptor, Nr = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? ws(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && Os(t, r, s), s;
};
class ft extends ve {
  constructor(t) {
    super(t);
  }
  get type() {
    return "TEXT";
  }
  get characters() {
    return this._rawValue.characters ?? "";
  }
  get layoutVersion() {
    return this._rawValue.layoutVersion;
  }
  get characterStyleOverrides() {
    return this._rawValue.characterStyleOverrides ?? [];
  }
  get styleOverrideTable() {
    const t = this._rawValue.styleOverrideTable ?? {};
    return Object.keys(t).reduce((r, n) => {
      const s = t[n];
      return s && (r[n] = new Je(s)), r;
    }, {});
  }
  get defaultStyle() {
    return this._rawValue.style ? new Je(this._rawValue.style) : null;
  }
}
Nr([
  $()
], ft.prototype, "styleOverrideTable", 1);
Nr([
  $()
], ft.prototype, "defaultStyle", 1);
const Ps = {
  FRAME: ne,
  GROUP: ne,
  INSTANCE: ne,
  COMPONENT: ne,
  COMPONENT_SET: ne,
  BOOLEAN_OPERATION: k,
  ELLIPSE: k,
  LINE: k,
  RECTANGLE: k,
  REGULAR_POLYGON: k,
  STAR: k,
  VECTOR: k,
  TEXT: $s,
  SLICE: Cs
};
function ne({ layer: e, parent: t }) {
  return new Ir({ parent: t, rawValue: e });
}
function k({ layer: e, parent: t }) {
  return new Ts({ parent: t, rawValue: e });
}
function $s({ layer: e, parent: t }) {
  return new ft({ parent: t, rawValue: e });
}
function Cs() {
  return null;
}
function Ie(e) {
  const t = Object(e.layer).type, r = L(t, Ps, void 0);
  return typeof r != "function" ? (h == null || h.warn("createSourceLayer: Unknown layer type", { type: t }), null) : r(e);
}
var Ls = Object.defineProperty, Rs = Object.getOwnPropertyDescriptor, Is = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? Rs(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && Ls(t, r, s), s;
};
const Qe = class extends G {
  constructor(e) {
    super(e.rawFrame), this._isPasteboard = e.isPasteboard ?? !1, this._sourceLayer = this._initializeSourceLayer(e.rawFrame);
  }
  _initializeSourceLayer(e) {
    return Ie({ parent: this, layer: e }) ?? new Ir({ rawValue: e, parent: this });
  }
  _getAssetFonts() {
    const e = br(this._rawValue, (t) => {
      const r = Object(t);
      if (r != null && r.fontPostScriptName)
        return r == null ? void 0 : r.fontPostScriptName;
      if ((r == null ? void 0 : r.fontPostScriptName) === null && (r != null && r.fontFamily))
        return r == null ? void 0 : r.fontFamily;
    });
    return [...new Set(e)];
  }
  get dependencies() {
    return { fonts: this._getAssetFonts() };
  }
  get raw() {
    return this._rawValue;
  }
  get sourceLayer() {
    return this._sourceLayer;
  }
  get bounds() {
    return Pe(this._rawValue.absoluteRenderBounds);
  }
  get boundingBox() {
    return Pe(this._rawValue.absoluteBoundingBox);
  }
  get id() {
    return this._rawValue.id ?? Qe.DEFAULT_ID;
  }
  get name() {
    return this._rawValue.name ?? Qe.DEFAULT_NAME;
  }
  get isPasteboard() {
    return this._isPasteboard;
  }
  get opacity() {
    return m(this._rawValue.opacity ?? 1);
  }
  get blendMode() {
    return this._rawValue.blendMode;
  }
  get clipsContent() {
    return this._rawValue.clipsContent ?? !0;
  }
  get parentType() {
    var e;
    return (e = this._rawValue.parent) == null ? void 0 : e.type;
  }
};
let x = Qe;
x.DEFAULT_ID = "component-1";
x.DEFAULT_NAME = "Component";
Is([
  $()
], x.prototype, "dependencies", 1);
const Ze = class extends G {
  constructor(e) {
    super(e);
    const { components: t, pasteboard: r } = this._initComponents();
    this._components = t, this._pasteboard = r;
  }
  _initPasteboard(e) {
    if (e.length === 0)
      return null;
    const t = {
      ...this._rawValue,
      id: `${this.id}-pasteboard`,
      name: `${this.name}-pasteboard`,
      type: "FRAME",
      children: e
    };
    return new x({ rawFrame: t, isPasteboard: !0 });
  }
  _initComponents() {
    var s, i;
    const e = [], t = [];
    (i = (s = this._rawValue) == null ? void 0 : s.children) == null || i.forEach((a) => {
      a.type === "FRAME" || a.type === "COMPONENT" || a.type === "COMPONENT_SET" ? e.push(a) : t.push(a);
    });
    const r = e.map((a) => new x({ rawFrame: a })), n = this._initPasteboard(t);
    return { components: r, pasteboard: n };
  }
  get raw() {
    return this._rawValue;
  }
  get components() {
    return this._components;
  }
  get pasteboard() {
    return this._pasteboard;
  }
  get children() {
    return this.pasteboard ? [...this.components, this.pasteboard] : this.components;
  }
  get id() {
    return this._rawValue.id ?? Ze.DEFAULT_ID;
  }
  get name() {
    return this._rawValue.name ?? Ze.DEFAULT_ID;
  }
};
let Mr = Ze;
Mr.DEFAULT_ID = "page-1";
class Ns extends G {
  constructor(t) {
    var r, n, s;
    super(t.raw ?? {}), this._pages = ((s = (n = (r = t.raw) == null ? void 0 : r.document) == null ? void 0 : n.children) == null ? void 0 : s.map((i) => new Mr(i))) ?? [], this._designId = t.designId;
  }
  get raw() {
    return this._rawValue;
  }
  get designId() {
    return this._designId;
  }
  get schemaVersion() {
    return this._rawValue.schemaVersion !== void 0 ? String(this._rawValue.schemaVersion) : void 0;
  }
  get name() {
    return this._rawValue.name;
  }
  get pages() {
    return this._pages;
  }
  get components() {
    return this._rawValue.components ?? {};
  }
  getComponentById(t) {
    return this.components[t];
  }
  get componentSets() {
    return this._rawValue.componentSets ?? {};
  }
  get styles() {
    return this._rawValue.styles ?? {};
  }
}
function Ms(e) {
  return e === 0 ? 1e-3 : e;
}
function xs(e) {
  return Object.values(e).every((t) => t === void 0);
}
class Ds {
  constructor(t) {
    this._effect = t;
  }
  get visible() {
    return this._effect.visible;
  }
  get blendMode() {
    return ut(this._effect.blendMode);
  }
  get shadow() {
    const t = this._effect.offset;
    if (t === null)
      return null;
    const r = this._effect.radius, n = this._effect.spread, s = lt(this._effect.color);
    return { offset: t, blur: r, choke: n, color: s };
  }
  get _innerShadow() {
    const t = this.visible, r = this.blendMode, n = "BODY", s = this.shadow;
    return s === null ? null : { type: "INNER_SHADOW", visible: t, blendMode: r, basis: n, shadow: s };
  }
  get _dropShadow() {
    const t = this.visible, r = this.blendMode, n = "BODY", s = this.shadow;
    return s === null ? null : { type: "DROP_SHADOW", visible: t, blendMode: r, basis: n, shadow: s };
  }
  get _blur() {
    const t = this.visible, r = "LAYER_AND_EFFECTS", n = this._effect.radius / 2;
    return { type: "BLUR", visible: t, basis: r, blur: n };
  }
  get _backgroundBlur() {
    const t = this.visible, r = "BACKGROUND", n = this._effect.radius;
    return { type: "BLUR", visible: t, basis: r, blur: n };
  }
  convert() {
    const t = this._effect.type;
    switch (t) {
      case "INNER_SHADOW":
        return this._innerShadow;
      case "DROP_SHADOW":
        return this._dropShadow;
      case "LAYER_BLUR":
        return this._blur;
      case "BACKGROUND_BLUR":
        return this._backgroundBlur;
      default:
        return h == null || h.warn("Unknown Effect type", { type: t }), null;
    }
  }
}
var ks = Object.defineProperty, Fs = Object.getOwnPropertyDescriptor, zs = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? Fs(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && ks(t, r, s), s;
};
const xr = class {
  constructor(e) {
    this._parent = e.parent, this._sourceLayer = e.sourceLayer, this._visible = this._sourceLayer.visible, this._id = qe(this._sourceLayer.id, Le());
  }
  get sourceLayer() {
    return this._sourceLayer;
  }
  _isTopLayer(e) {
    return e instanceof le;
  }
  get parentComponent() {
    return this._isTopLayer(this._parent) ? this._parent : this._parent.parentComponent;
  }
  get isTopLayer() {
    return this._isTopLayer(this._parent);
  }
  get id() {
    return C(this._id);
  }
  get name() {
    return qe(this._sourceLayer.name, "Layer");
  }
  get visible() {
    return this._visible;
  }
  set visible(e) {
    this._visible = e;
  }
  get blendMode() {
    const { isFrameLike: e } = this._sourceLayer;
    return Pr(this._sourceLayer.blendMode, { isFrameLike: e });
  }
  get transform() {
    return this.sourceLayer.transform ?? T.TRANSFORM;
  }
  get opacity() {
    return this._sourceLayer.opacity;
  }
  get type() {
    const e = String(this._sourceLayer.type), t = L(e, xr.LAYER_TYPE_MAP, void 0);
    return t || (h == null || h.warn("Unknown Layer type", { type: e }), null);
  }
  get isConvertible() {
    return this.type !== null;
  }
  get effects() {
    return this.sourceLayer.effects.reduce((e, t) => {
      const r = new Ds(t).convert();
      return r ? R(e, r) : e;
    }, []);
  }
  convertBase() {
    if (!this.isConvertible)
      return null;
    const e = this.type;
    return {
      id: this.id,
      name: this.name,
      type: e,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      transform: this.transform,
      effects: this.effects
    };
  }
};
let q = xr;
q.DEFAULT_TRANSLATION = [0, 0];
q.LAYER_TYPE_MAP = {
  FRAME: "GROUP",
  SHAPE: "SHAPE",
  TEXT: "TEXT"
};
zs([
  $()
], q.prototype, "effects", 1);
class js extends q {
  constructor(t) {
    super(t), this._layers = hn(this._sourceLayer.layers, this);
  }
  get type() {
    return "GROUP";
  }
  get transform() {
    return this.isTopLayer ? ge.NODE_ENV === "debug" ? Lr(this._sourceLayer) ?? T.TRANSFORM : T.TRANSFORM : this.sourceLayer.transform ?? T.TRANSFORM;
  }
  get meta() {
    const r = { isArtboard: ["FRAME", "COMPONENT", "INSTANCE"].includes(this.sourceLayer.type) ? !0 : void 0 };
    return xs(r) ? void 0 : r;
  }
  get layers() {
    return this._layers;
  }
  async _convertTypeSpecific() {
    return {
      type: "GROUP",
      layers: await de(this.layers),
      meta: this.meta
    };
  }
  async convert() {
    const t = this.convertBase();
    if (!t)
      return null;
    const r = await this._convertTypeSpecific();
    return r ? { ...t, ...r } : null;
  }
}
class N {
  static createBackgroundLayer(t, r) {
    const n = { ...t.raw };
    n.id = `${n.id}-BackgroundMask`, n.type = "RECTANGLE", delete n.opacity, delete n.relativeTransform, delete n.rectangleCornerRadii;
    const s = Ie({ layer: n, parent: t.parent });
    return s ? ue({ layer: s, parent: r }) : null;
  }
  static createBackgroundMaskGroup({
    sourceLayer: t,
    parent: r
  }) {
    const n = `${t.id}-Background`, s = r instanceof le, i = s && ge.NODE_ENV === "debug" ? Lr(t) : void 0, a = s ? i : t.transform ?? void 0, o = N.createBackgroundLayer(t, r);
    if (!o)
      return null;
    const c = t.clipsContent ? "BODY_EMBED" : "SOLID", { visible: u, blendMode: l, opacity: f, name: p, isArtboard: g } = t, y = t.boundingBox ?? void 0, v = new N({
      id: n,
      name: p,
      mask: o,
      maskBasis: c,
      transform: a,
      parent: r,
      blendMode: l,
      opacity: f,
      visible: u,
      isArtboard: g,
      boundingBox: y
    });
    return v.layers = hn(t.layers, v), v;
  }
  static createClippingMask({ mask: t, layers: r, parent: n }) {
    const s = `${t.id}-ClippingMask`, i = "LAYER_AND_EFFECTS";
    t.visible = !1;
    const a = new N({ id: s, parent: n, mask: t, maskBasis: i });
    return a.layers = r, a;
  }
  static createClippingMaskOutline({ mask: t, layers: r, parent: n }) {
    const s = `${t.id}-ClippingMask`, i = "BODY";
    t.visible = !1;
    const a = new N({ id: s, parent: n, mask: t, maskBasis: i });
    return a.layers = r, a;
  }
  constructor(t) {
    const {
      parent: r,
      id: n,
      name: s,
      mask: i,
      maskBasis: a,
      maskChannels: o,
      visible: c,
      transform: u,
      opacity: l,
      blendMode: f,
      isArtboard: p,
      boundingBox: g
    } = t;
    this._id = n, this._name = s, this._mask = i, this._maskBasis = a, this._maskChannels = o, this._parent = r, this._visible = c ?? !0, this._transform = u, this._opacity = l, this._blendMode = f, this._boundingBox = g, this._isArtboard = p ?? !1;
  }
  get id() {
    return C(this._id);
  }
  get name() {
    return this._name;
  }
  get transform() {
    return this._transform ?? T.TRANSFORM;
  }
  get maskBasis() {
    return this._maskBasis ?? "BODY";
  }
  get maskChannels() {
    return this._maskChannels;
  }
  get mask() {
    return this._mask;
  }
  get parentComponent() {
    const t = this._parent;
    return t instanceof le ? t : t.parentComponent;
  }
  get isTopLayer() {
    return this._parent instanceof le;
  }
  get type() {
    return "MASK_GROUP";
  }
  get visible() {
    return this._visible;
  }
  set visible(t) {
    this._visible = t;
  }
  get layers() {
    return this._layers;
  }
  set layers(t) {
    this._layers = t;
  }
  get opacity() {
    return this._opacity;
  }
  get blendMode() {
    return Pr(this._blendMode, { isFrameLike: !0 });
  }
  get meta() {
    return { isArtboard: !0 };
  }
  get sourceLayer() {
    return this._parent.sourceLayer;
  }
  async convert() {
    const t = await this.mask.convert();
    return t ? {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      maskBasis: this.maskBasis,
      maskChannels: this.maskChannels,
      mask: t,
      transform: this.transform,
      layers: await de(this.layers),
      meta: this.meta
    } : null;
  }
}
var pe = {};
Object.defineProperty(pe, "__esModule", { value: !0 });
pe.multiplyAlpha = Dr = pe.lerpColor = void 0;
const et = b;
function Te(e = 0, t = 0, r, n = 0, s = 255) {
  return (0, et.clamp)((0, et.lerp)(e, t, r), n, s);
}
function Gs(e, t, r) {
  const { r: n, g: s, b: i, a } = e ?? {}, { r: o, g: c, b: u, a: l } = t ?? {};
  return {
    r: Te(n, o, r),
    g: Te(s, c, r),
    b: Te(i, u, r),
    a: Te(a ?? 1, l ?? 1, r, 0, 1)
  };
}
var Dr = pe.lerpColor = Gs;
function Vs(e, t = 1) {
  const { r, g: n, b: s, a: i } = e;
  return { r, g: n, b: s, a: (0, et.round)(i * t) };
}
pe.multiplyAlpha = Vs;
we.setup(new we.Size(100, 100));
const Us = 1e-8;
function Bs(e) {
  if (typeof e != "string")
    return e;
  const t = new we.CompoundPath(e);
  return t.children.forEach((r) => {
    r.segments.length > 100 && r.simplify(Us);
  }), t.pathData;
}
const { Matrix: Hs, Point: Ks } = we;
function Ys(e, t) {
  return new Ks(e, t);
}
function H([e, t, r, n, s, i]) {
  return new Hs(e, t, r, n, s, i);
}
class ye {
  static convertFills(t, r) {
    const n = t.map((s) => new ye({ fill: s, parentLayer: r }));
    return de(n);
  }
  constructor(t) {
    this._fill = t.fill, this._parentLayer = t.parentLayer;
  }
  get fillType() {
    switch (this._fill.type) {
      case "SOLID":
        return "COLOR";
      case "GRADIENT_LINEAR":
      case "GRADIENT_RADIAL":
      case "GRADIENT_ANGULAR":
      case "GRADIENT_DIAMOND":
        return "GRADIENT";
      case "IMAGE":
        return "IMAGE";
      default:
        return null;
    }
  }
  get visible() {
    return this._fill.visible;
  }
  get blendMode() {
    return ut(this._fill.blendMode);
  }
  get opacity() {
    return this._fill.opacity;
  }
  get _color() {
    return lt(this._fill.color, this.opacity);
  }
  get _gradientStops() {
    const t = this._fill.gradientStops.reduce((r, n) => {
      const s = fs(n, this.opacity);
      return s ? R(r, s) : r;
    }, []);
    if (!t.length)
      return null;
    if (this._gradientType === "ANGULAR") {
      const r = t[0], n = t[t.length - 1];
      if (m(r.position) === 0 && m(n.position) === 1)
        return t;
      if (m(r.position) === 0)
        return R(t, { ...r, position: 1 });
      if (m(n.position) === 0)
        return [{ ...n, position: 0 }, ...t];
      const s = r.position + (1 - n.position), i = Or(0, s, r.position), a = Dr(r.color, n.color, i);
      return [{ color: a, position: 0 }, ...t, { color: a, position: 1 }];
    }
    return t;
  }
  get _gradientType() {
    switch (this._fill.type) {
      case "GRADIENT_LINEAR":
        return "LINEAR";
      case "GRADIENT_RADIAL":
        return "RADIAL";
      case "GRADIENT_ANGULAR":
        return "ANGULAR";
      case "GRADIENT_DIAMOND":
        return "DIAMOND";
      default:
        return null;
    }
  }
  get _gradient() {
    const t = this._gradientType;
    if (t === null)
      return null;
    const r = this._gradientStops;
    return r === null ? null : { type: t, stops: r };
  }
  get _transform() {
    const t = this._parentLayer.sourceLayer.size, { x: r, y: n } = t ?? {};
    if (!r || !n)
      return null;
    const s = this._fill.gradientTransform;
    if (s) {
      if (this._gradientType === "LINEAR")
        return H(s).scale(1 / r, 1 / n).invert().values;
      const w = Ys(0, 0);
      return H(s).scale(2 / r, 2 / n, w).invert().values;
    }
    const i = this._fill.gradientHandlePositions;
    if (i === null)
      return null;
    const [a, o, c] = i, u = { x: a.x * r, y: a.y * n }, l = { x: o.x * r, y: o.y * n }, f = { x: c.x * r, y: c.y * n }, p = l.x - u.x, g = l.y - u.y, y = f.x - u.x, v = f.y - u.y, E = u.x, O = u.y;
    return [p, g, y, v, E, O];
  }
  get _gradientPositioning() {
    const t = "FILL", r = "LAYER", n = this._transform;
    return n === null ? null : { layout: t, origin: r, transform: n };
  }
  get _imagePositioning() {
    const t = this._fill.scaleMode ?? "FILL", r = "LAYER";
    if (t === "TILE") {
      const o = this._fill.imageRef;
      if (!o)
        return null;
      const c = this._parentLayer.parentComponent.designConverter.getImageSize(o);
      if (!c)
        return null;
      const u = this._fill.scalingFactor, { width: l, height: f } = c, p = [l * u, 0, 0, f * u, 0, 0];
      return { layout: t, origin: r, transform: p };
    }
    const n = this._parentLayer.sourceLayer.size;
    if (!n)
      return null;
    const { x: s, y: i } = n;
    if (this._fill.imageTransform) {
      const o = H(this._fill.imageTransform).invert().prepend(H([s, 0, 0, i, 0, 0])).values;
      return { layout: t, origin: r, transform: o };
    }
    if (this._fill.rotation) {
      const o = H([1, 0, 0, 1, 0, 0]).rotate(this._fill.rotation, 0.5, 0.5).invert().prepend(H([s, 0, 0, i, 0, 0])).values;
      return { layout: t, origin: r, transform: o };
    }
    return { layout: t, origin: r, transform: [s, 0, 0, i, 0, 0] };
  }
  get _fillColor() {
    const t = this._color;
    if (!t)
      return null;
    const r = this.visible, n = this.blendMode;
    return { type: "COLOR", visible: r, blendMode: n, color: t };
  }
  get _fillGradient() {
    const t = this.visible, r = this.blendMode, n = this._gradient;
    if (n === null)
      return null;
    const s = this._gradientPositioning;
    return s === null ? null : { type: "GRADIENT", visible: t, blendMode: r, gradient: n, positioning: s };
  }
  get _filterOpacity() {
    return { type: "OPACITY_MULTIPLIER", opacity: this.opacity };
  }
  get _filterAdjustment() {
    const { exposure: t, contrast: r, saturation: n, temperature: s, tint: i, highlights: a, shadows: o } = this._fill.filters ?? {};
    return { type: "FIGMA_COLOR_ADJUSTMENT", colorAdjustment: { hue: t, contrast: r, saturation: n, temperature: s, tint: i, highlights: a, shadows: o } };
  }
  async _fillImage() {
    const t = this._fill.imageRef;
    if (!t)
      return null;
    const r = await this._parentLayer.parentComponent.octopusManifest.getExportedImagePath(t), n = r ? { ref: { type: "PATH", value: r } } : { ref: { type: "RESOURCE_REF", value: t } }, s = this.visible, i = this.blendMode, a = this._imagePositioning;
    if (a === null)
      return null;
    const o = [this._filterOpacity, this._filterAdjustment];
    return { type: "IMAGE", visible: s, blendMode: i, image: n, positioning: a, filters: o };
  }
  async convert() {
    switch (this.fillType) {
      case "COLOR":
        return this._fillColor;
      case "GRADIENT":
        return this._fillGradient;
      case "IMAGE":
        return this._fillImage();
      default:
        return null;
    }
  }
}
var tt = {}, qs = {
  get exports() {
    return tt;
  },
  set exports(e) {
    tt = e;
  }
};
function Ws(e) {
  return e && e.length ? e[0] : void 0;
}
var Xs = Ws;
(function(e) {
  e.exports = Xs;
})(qs);
const Js = /* @__PURE__ */ Cn(tt);
class kr {
  constructor(t) {
    this._sourceLayer = t.sourceLayer, this._isStroke = t.isStroke ?? !1;
  }
  get sourceLayer() {
    return this._sourceLayer;
  }
  get _sourceShape() {
    if (this.sourceLayer.type === "SHAPE")
      switch (this.sourceLayer.shapeType) {
        case "RECTANGLE":
          return "RECTANGLE";
        case "LINE":
          return "LINE";
        case "ELLIPSE":
          return "ELLIPSE";
        case "REGULAR_POLYGON":
        case "STAR":
          return "POLYGON";
        default:
          return;
      }
  }
  _transform({ sourceLayer: t, isTopLayer: r }) {
    return r ? T.TRANSFORM : t.transform ?? T.TRANSFORM;
  }
  _geometries(t) {
    return this._isStroke ? t.strokeGeometry : t.fillGeometry.length ? t.fillGeometry : t.strokeGeometry;
  }
  _firstGeometry(t) {
    return Js(this._geometries(t) ?? []);
  }
  _geometry(t) {
    var n;
    const r = (n = this._geometries(t)) == null ? void 0 : n.reduce(
      (s, i) => R(s, Bs(i.path)),
      []
    );
    return r ? r.join(" ") : T.EMPTY_PATH;
  }
  _isRectangle(t) {
    return t.shapeType === "RECTANGLE" && !t.cornerRadii;
  }
  _getPathRectangle({ sourceLayer: t, isTopLayer: r }) {
    const n = t.visible, s = this._transform({ sourceLayer: t, isTopLayer: r }), i = t.size ?? { x: 0, y: 0 }, a = ps(i), o = t.cornerRadius;
    return { type: "RECTANGLE", visible: n, transform: s, rectangle: a, cornerRadius: o };
  }
  _getPathPath({ sourceLayer: t, isTopLayer: r }) {
    const n = t.visible, s = this._transform({ sourceLayer: t, isTopLayer: r }), i = { sourceShape: this._sourceShape }, a = this._geometry(t);
    return { type: "PATH", visible: n, transform: s, meta: i, geometry: a };
  }
  _getPathBool({ sourceLayer: t, isTopLayer: r }) {
    const n = t.booleanOperation, s = t.visible, i = this._transform({ sourceLayer: t, isTopLayer: r }), a = this._geometry(t) || void 0, o = t.children.filter((c) => c.type === "SHAPE").map((c) => this._getPath({ sourceLayer: c, isTopLayer: !1 }));
    return { type: "COMPOUND", op: n, visible: s, transform: i, paths: o, geometry: a };
  }
  _getPath({ sourceLayer: t, isTopLayer: r }) {
    return this._isStroke ? this._getPathPath({ sourceLayer: t, isTopLayer: r }) : t.type === "TEXT" ? this._getPathPath({ sourceLayer: t, isTopLayer: r }) : t.type !== "SHAPE" ? this._getPathRectangle({ sourceLayer: t, isTopLayer: r }) : this._isRectangle(t) ? this._getPathRectangle({ sourceLayer: t, isTopLayer: r }) : t.shapeType === "BOOLEAN_OPERATION" ? this._getPathBool({ sourceLayer: t, isTopLayer: r }) : this._getPathPath({ sourceLayer: t, isTopLayer: r });
  }
  get fillRule() {
    var t;
    return ((t = this._firstGeometry(this.sourceLayer)) == null ? void 0 : t.fillRule) ?? T.WINDING_RULE;
  }
  convert() {
    return this._getPath({ sourceLayer: this.sourceLayer, isTopLayer: !0 });
  }
}
var Qs = Object.defineProperty, Zs = Object.getOwnPropertyDescriptor, ei = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? Zs(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && Qs(t, r, s), s;
};
const oe = class {
  static convertStrokes(e, t) {
    const r = e.map((n) => new oe({ fill: n, parentLayer: t }));
    return de(r);
  }
  constructor(e) {
    this._parentLayer = e.parentLayer, this._fill = e.fill, this._path = new kr({ sourceLayer: e.parentLayer.sourceLayer, isStroke: !0 });
  }
  get sourceLayer() {
    return this._parentLayer.sourceLayer;
  }
  get position() {
    const e = this.sourceLayer.strokeAlign;
    return oe.STROKE_ALIGNS.includes(e) ? e : (h == null || h.warn("Unknown Stroke Align", { strokeAlign: e }), null);
  }
  get lineCap() {
    const e = this.sourceLayer.strokeCap, t = L(e, oe.STROKE_CAP_MAP, void 0);
    return t || (h == null || h.warn("Unknown Stroke Cap", { strokeCap: e }), T.STROKE_LINE_CAP);
  }
  get lineJoin() {
    const e = this.sourceLayer.strokeJoin;
    return oe.STROKE_JOINS.includes(e) ? e : (h == null || h.warn("Unknown Stroke join", { strokeJoin: e }), null);
  }
  async fill() {
    return new ye({ fill: this._fill, parentLayer: this._parentLayer }).convert();
  }
  get style() {
    return this.dashing.length === 0 ? "SOLID" : "DASHED";
  }
  get dashing() {
    return this.sourceLayer.strokeDashes ?? [];
  }
  get visible() {
    return this._fill.visible;
  }
  get thickness() {
    return this.sourceLayer.strokeWeight;
  }
  get miterLimit() {
    return this.sourceLayer.strokeMiterAngle;
  }
  get path() {
    const e = this._path.convert();
    return e.geometry ? e : void 0;
  }
  get fillRule() {
    return this._path.fillRule;
  }
  async convert() {
    const e = await this.fill(), t = this.position, r = this.lineJoin, n = this.lineCap;
    if (e === null || t === null || r === null)
      return null;
    const s = this.style, i = this.dashing, a = this.visible, o = this.thickness, c = this.miterLimit, u = this.path, l = this.fillRule;
    return { style: s, dashing: i, visible: a, fill: e, thickness: o, position: t, lineJoin: r, lineCap: n, miterLimit: c, fillRule: l, path: u };
  }
};
let W = oe;
W.STROKE_ALIGNS = ["CENTER", "INSIDE", "OUTSIDE"];
W.STROKE_JOINS = ["MITER", "BEVEL", "ROUND"];
W.STROKE_CAP_MAP = {
  NONE: "BUTT",
  ROUND: "ROUND",
  SQUARE: "SQUARE"
};
ei([
  $()
], W.prototype, "fill", 1);
class ti extends q {
  constructor(t) {
    super(t), this._path = new kr(t);
  }
  get sourceLayer() {
    return this._sourceLayer;
  }
  get _fills() {
    return ye.convertFills(this.sourceLayer.fills, this);
  }
  get _strokes() {
    return W.convertStrokes(this.sourceLayer.strokes, this);
  }
  async _shape() {
    return {
      path: this._path.convert(),
      fillRule: this._path.fillRule,
      fills: await this._fills,
      strokes: await this._strokes
    };
  }
  async _convertTypeSpecific() {
    return {
      type: "SHAPE",
      shape: await this._shape()
    };
  }
  async convert() {
    const t = this.convertBase();
    if (!t)
      return null;
    const r = await this._convertTypeSpecific();
    return r ? { ...t, ...r } : null;
  }
}
var pt = {}, Ne = {}, ri = Object.prototype, ni = ri.hasOwnProperty;
function si(e, t) {
  return e != null && ni.call(e, t);
}
var ii = si, ai = Array.isArray, D = ai, oi = typeof S == "object" && S && S.Object === Object && S, Fr = oi, ci = Fr, ui = typeof self == "object" && self && self.Object === Object && self, li = ci || ui || Function("return this")(), I = li, hi = I, fi = hi.Symbol, me = fi, $t = me, zr = Object.prototype, pi = zr.hasOwnProperty, _i = zr.toString, se = $t ? $t.toStringTag : void 0;
function di(e) {
  var t = pi.call(e, se), r = e[se];
  try {
    e[se] = void 0;
    var n = !0;
  } catch {
  }
  var s = _i.call(e);
  return n && (t ? e[se] = r : delete e[se]), s;
}
var gi = di, vi = Object.prototype, yi = vi.toString;
function mi(e) {
  return yi.call(e);
}
var bi = mi, Ct = me, Ti = gi, Ei = bi, Si = "[object Null]", Ai = "[object Undefined]", Lt = Ct ? Ct.toStringTag : void 0;
function Oi(e) {
  return e == null ? e === void 0 ? Ai : Si : Lt && Lt in Object(e) ? Ti(e) : Ei(e);
}
var be = Oi, wi = be, Pi = j, $i = "[object Symbol]";
function Ci(e) {
  return typeof e == "symbol" || Pi(e) && wi(e) == $i;
}
var _t = Ci, Li = D, Ri = _t, Ii = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Ni = /^\w*$/;
function Mi(e, t) {
  if (Li(e))
    return !1;
  var r = typeof e;
  return r == "number" || r == "symbol" || r == "boolean" || e == null || Ri(e) ? !0 : Ni.test(e) || !Ii.test(e) || t != null && e in Object(t);
}
var xi = Mi;
function Di(e) {
  var t = typeof e;
  return e != null && (t == "object" || t == "function");
}
var dt = Di, ki = be, Fi = dt, zi = "[object AsyncFunction]", ji = "[object Function]", Gi = "[object GeneratorFunction]", Vi = "[object Proxy]";
function Ui(e) {
  if (!Fi(e))
    return !1;
  var t = ki(e);
  return t == ji || t == Gi || t == zi || t == Vi;
}
var jr = Ui, Bi = I, Hi = Bi["__core-js_shared__"], Ki = Hi, Ve = Ki, Rt = function() {
  var e = /[^.]+$/.exec(Ve && Ve.keys && Ve.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function Yi(e) {
  return !!Rt && Rt in e;
}
var qi = Yi, Wi = Function.prototype, Xi = Wi.toString;
function Ji(e) {
  if (e != null) {
    try {
      return Xi.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var Gr = Ji, Qi = jr, Zi = qi, ea = dt, ta = Gr, ra = /[\\^$.*+?()[\]{}|]/g, na = /^\[object .+?Constructor\]$/, sa = Function.prototype, ia = Object.prototype, aa = sa.toString, oa = ia.hasOwnProperty, ca = RegExp(
  "^" + aa.call(oa).replace(ra, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function ua(e) {
  if (!ea(e) || Zi(e))
    return !1;
  var t = Qi(e) ? ca : na;
  return t.test(ta(e));
}
var la = ua;
function ha(e, t) {
  return e == null ? void 0 : e[t];
}
var fa = ha, pa = la, _a = fa;
function da(e, t) {
  var r = _a(e, t);
  return pa(r) ? r : void 0;
}
var V = da, ga = V, va = ga(Object, "create"), Me = va, It = Me;
function ya() {
  this.__data__ = It ? It(null) : {}, this.size = 0;
}
var ma = ya;
function ba(e) {
  var t = this.has(e) && delete this.__data__[e];
  return this.size -= t ? 1 : 0, t;
}
var Ta = ba, Ea = Me, Sa = "__lodash_hash_undefined__", Aa = Object.prototype, Oa = Aa.hasOwnProperty;
function wa(e) {
  var t = this.__data__;
  if (Ea) {
    var r = t[e];
    return r === Sa ? void 0 : r;
  }
  return Oa.call(t, e) ? t[e] : void 0;
}
var Pa = wa, $a = Me, Ca = Object.prototype, La = Ca.hasOwnProperty;
function Ra(e) {
  var t = this.__data__;
  return $a ? t[e] !== void 0 : La.call(t, e);
}
var Ia = Ra, Na = Me, Ma = "__lodash_hash_undefined__";
function xa(e, t) {
  var r = this.__data__;
  return this.size += this.has(e) ? 0 : 1, r[e] = Na && t === void 0 ? Ma : t, this;
}
var Da = xa, ka = ma, Fa = Ta, za = Pa, ja = Ia, Ga = Da;
function X(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
X.prototype.clear = ka;
X.prototype.delete = Fa;
X.prototype.get = za;
X.prototype.has = ja;
X.prototype.set = Ga;
var Va = X;
function Ua() {
  this.__data__ = [], this.size = 0;
}
var Ba = Ua;
function Ha(e, t) {
  return e === t || e !== e && t !== t;
}
var gt = Ha, Ka = gt;
function Ya(e, t) {
  for (var r = e.length; r--; )
    if (Ka(e[r][0], t))
      return r;
  return -1;
}
var xe = Ya, qa = xe, Wa = Array.prototype, Xa = Wa.splice;
function Ja(e) {
  var t = this.__data__, r = qa(t, e);
  if (r < 0)
    return !1;
  var n = t.length - 1;
  return r == n ? t.pop() : Xa.call(t, r, 1), --this.size, !0;
}
var Qa = Ja, Za = xe;
function eo(e) {
  var t = this.__data__, r = Za(t, e);
  return r < 0 ? void 0 : t[r][1];
}
var to = eo, ro = xe;
function no(e) {
  return ro(this.__data__, e) > -1;
}
var so = no, io = xe;
function ao(e, t) {
  var r = this.__data__, n = io(r, e);
  return n < 0 ? (++this.size, r.push([e, t])) : r[n][1] = t, this;
}
var oo = ao, co = Ba, uo = Qa, lo = to, ho = so, fo = oo;
function J(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
J.prototype.clear = co;
J.prototype.delete = uo;
J.prototype.get = lo;
J.prototype.has = ho;
J.prototype.set = fo;
var De = J, po = V, _o = I, go = po(_o, "Map"), vt = go, Nt = Va, vo = De, yo = vt;
function mo() {
  this.size = 0, this.__data__ = {
    hash: new Nt(),
    map: new (yo || vo)(),
    string: new Nt()
  };
}
var bo = mo;
function To(e) {
  var t = typeof e;
  return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
}
var Eo = To, So = Eo;
function Ao(e, t) {
  var r = e.__data__;
  return So(t) ? r[typeof t == "string" ? "string" : "hash"] : r.map;
}
var ke = Ao, Oo = ke;
function wo(e) {
  var t = Oo(this, e).delete(e);
  return this.size -= t ? 1 : 0, t;
}
var Po = wo, $o = ke;
function Co(e) {
  return $o(this, e).get(e);
}
var Lo = Co, Ro = ke;
function Io(e) {
  return Ro(this, e).has(e);
}
var No = Io, Mo = ke;
function xo(e, t) {
  var r = Mo(this, e), n = r.size;
  return r.set(e, t), this.size += r.size == n ? 0 : 1, this;
}
var Do = xo, ko = bo, Fo = Po, zo = Lo, jo = No, Go = Do;
function Q(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
Q.prototype.clear = ko;
Q.prototype.delete = Fo;
Q.prototype.get = zo;
Q.prototype.has = jo;
Q.prototype.set = Go;
var yt = Q, Vr = yt, Vo = "Expected a function";
function mt(e, t) {
  if (typeof e != "function" || t != null && typeof t != "function")
    throw new TypeError(Vo);
  var r = function() {
    var n = arguments, s = t ? t.apply(this, n) : n[0], i = r.cache;
    if (i.has(s))
      return i.get(s);
    var a = e.apply(this, n);
    return r.cache = i.set(s, a) || i, a;
  };
  return r.cache = new (mt.Cache || Vr)(), r;
}
mt.Cache = Vr;
var Uo = mt, Bo = Uo, Ho = 500;
function Ko(e) {
  var t = Bo(e, function(n) {
    return r.size === Ho && r.clear(), n;
  }), r = t.cache;
  return t;
}
var Yo = Ko, qo = Yo, Wo = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Xo = /\\(\\)?/g, Jo = qo(function(e) {
  var t = [];
  return e.charCodeAt(0) === 46 && t.push(""), e.replace(Wo, function(r, n, s, i) {
    t.push(s ? i.replace(Xo, "$1") : n || r);
  }), t;
}), Qo = Jo;
function Zo(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length, s = Array(n); ++r < n; )
    s[r] = t(e[r], r, e);
  return s;
}
var Ur = Zo, Mt = me, ec = Ur, tc = D, rc = _t, nc = 1 / 0, xt = Mt ? Mt.prototype : void 0, Dt = xt ? xt.toString : void 0;
function Br(e) {
  if (typeof e == "string")
    return e;
  if (tc(e))
    return ec(e, Br) + "";
  if (rc(e))
    return Dt ? Dt.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -nc ? "-0" : t;
}
var sc = Br, ic = sc;
function ac(e) {
  return e == null ? "" : ic(e);
}
var oc = ac, cc = D, uc = xi, lc = Qo, hc = oc;
function fc(e, t) {
  return cc(e) ? e : uc(e, t) ? [e] : lc(hc(e));
}
var Fe = fc, pc = be, _c = j, dc = "[object Arguments]";
function gc(e) {
  return _c(e) && pc(e) == dc;
}
var vc = gc, kt = vc, yc = j, Hr = Object.prototype, mc = Hr.hasOwnProperty, bc = Hr.propertyIsEnumerable, Tc = kt(function() {
  return arguments;
}()) ? kt : function(e) {
  return yc(e) && mc.call(e, "callee") && !bc.call(e, "callee");
}, bt = Tc, Ec = 9007199254740991, Sc = /^(?:0|[1-9]\d*)$/;
function Ac(e, t) {
  var r = typeof e;
  return t = t ?? Ec, !!t && (r == "number" || r != "symbol" && Sc.test(e)) && e > -1 && e % 1 == 0 && e < t;
}
var Tt = Ac, Oc = 9007199254740991;
function wc(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= Oc;
}
var Et = wc, Pc = _t, $c = 1 / 0;
function Cc(e) {
  if (typeof e == "string" || Pc(e))
    return e;
  var t = e + "";
  return t == "0" && 1 / e == -$c ? "-0" : t;
}
var St = Cc, Lc = Fe, Rc = bt, Ic = D, Nc = Tt, Mc = Et, xc = St;
function Dc(e, t, r) {
  t = Lc(t, e);
  for (var n = -1, s = t.length, i = !1; ++n < s; ) {
    var a = xc(t[n]);
    if (!(i = e != null && r(e, a)))
      break;
    e = e[a];
  }
  return i || ++n != s ? i : (s = e == null ? 0 : e.length, !!s && Mc(s) && Nc(a, s) && (Ic(e) || Rc(e)));
}
var Kr = Dc, kc = ii, Fc = Kr;
function zc(e, t) {
  return e != null && Fc(e, t, kc);
}
var jc = zc, Gc = Fe, Vc = St;
function Uc(e, t) {
  t = Gc(t, e);
  for (var r = 0, n = t.length; e != null && r < n; )
    e = e[Vc(t[r++])];
  return r && r == n ? e : void 0;
}
var Bc = Uc, Hc = V, Kc = function() {
  try {
    var e = Hc(Object, "defineProperty");
    return e({}, "", {}), e;
  } catch {
  }
}(), Yr = Kc, Ft = Yr;
function Yc(e, t, r) {
  t == "__proto__" && Ft ? Ft(e, t, {
    configurable: !0,
    enumerable: !0,
    value: r,
    writable: !0
  }) : e[t] = r;
}
var qc = Yc, Wc = qc, Xc = gt, Jc = Object.prototype, Qc = Jc.hasOwnProperty;
function Zc(e, t, r) {
  var n = e[t];
  (!(Qc.call(e, t) && Xc(n, r)) || r === void 0 && !(t in e)) && Wc(e, t, r);
}
var eu = Zc, tu = eu, ru = Fe, nu = Tt, zt = dt, su = St;
function iu(e, t, r, n) {
  if (!zt(e))
    return e;
  t = ru(t, e);
  for (var s = -1, i = t.length, a = i - 1, o = e; o != null && ++s < i; ) {
    var c = su(t[s]), u = r;
    if (c === "__proto__" || c === "constructor" || c === "prototype")
      return e;
    if (s != a) {
      var l = o[c];
      u = n ? n(l, c, o) : void 0, u === void 0 && (u = zt(l) ? l : nu(t[s + 1]) ? [] : {});
    }
    tu(o, c, u), o = o[c];
  }
  return e;
}
var au = iu, ou = Bc, cu = au, uu = Fe;
function lu(e, t, r) {
  for (var n = -1, s = t.length, i = {}; ++n < s; ) {
    var a = t[n], o = ou(e, a);
    r(o, a) && cu(i, uu(a, e), o);
  }
  return i;
}
var hu = lu;
function fu(e, t) {
  return e != null && t in Object(e);
}
var pu = fu, _u = pu, du = Kr;
function gu(e, t) {
  return e != null && du(e, t, _u);
}
var vu = gu, yu = hu, mu = vu;
function bu(e, t) {
  return yu(e, t, function(r, n) {
    return mu(e, n);
  });
}
var Tu = bu;
function Eu(e, t) {
  for (var r = -1, n = t.length, s = e.length; ++r < n; )
    e[s + r] = t[r];
  return e;
}
var qr = Eu, jt = me, Su = bt, Au = D, Gt = jt ? jt.isConcatSpreadable : void 0;
function Ou(e) {
  return Au(e) || Su(e) || !!(Gt && e && e[Gt]);
}
var wu = Ou, Pu = qr, $u = wu;
function Wr(e, t, r, n, s) {
  var i = -1, a = e.length;
  for (r || (r = $u), s || (s = []); ++i < a; ) {
    var o = e[i];
    t > 0 && r(o) ? t > 1 ? Wr(o, t - 1, r, n, s) : Pu(s, o) : n || (s[s.length] = o);
  }
  return s;
}
var Cu = Wr, Lu = Cu;
function Ru(e) {
  var t = e == null ? 0 : e.length;
  return t ? Lu(e, 1) : [];
}
var Iu = Ru;
function Nu(e, t, r) {
  switch (r.length) {
    case 0:
      return e.call(t);
    case 1:
      return e.call(t, r[0]);
    case 2:
      return e.call(t, r[0], r[1]);
    case 3:
      return e.call(t, r[0], r[1], r[2]);
  }
  return e.apply(t, r);
}
var Mu = Nu, xu = Mu, Vt = Math.max;
function Du(e, t, r) {
  return t = Vt(t === void 0 ? e.length - 1 : t, 0), function() {
    for (var n = arguments, s = -1, i = Vt(n.length - t, 0), a = Array(i); ++s < i; )
      a[s] = n[t + s];
    s = -1;
    for (var o = Array(t + 1); ++s < t; )
      o[s] = n[s];
    return o[t] = r(a), xu(e, this, o);
  };
}
var Xr = Du;
function ku(e) {
  return function() {
    return e;
  };
}
var Fu = ku;
function zu(e) {
  return e;
}
var Jr = zu, ju = Fu, Ut = Yr, Gu = Jr, Vu = Ut ? function(e, t) {
  return Ut(e, "toString", {
    configurable: !0,
    enumerable: !1,
    value: ju(t),
    writable: !0
  });
} : Gu, Uu = Vu, Bu = 800, Hu = 16, Ku = Date.now;
function Yu(e) {
  var t = 0, r = 0;
  return function() {
    var n = Ku(), s = Hu - (n - r);
    if (r = n, s > 0) {
      if (++t >= Bu)
        return arguments[0];
    } else
      t = 0;
    return e.apply(void 0, arguments);
  };
}
var qu = Yu, Wu = Uu, Xu = qu, Ju = Xu(Wu), Qr = Ju, Qu = Iu, Zu = Xr, el = Qr;
function tl(e) {
  return el(Zu(e, void 0, Qu), e + "");
}
var rl = tl, nl = Tu, sl = rl, il = sl(function(e, t) {
  return e == null ? {} : nl(e, t);
}), al = il, ol = "__lodash_hash_undefined__";
function cl(e) {
  return this.__data__.set(e, ol), this;
}
var ul = cl;
function ll(e) {
  return this.__data__.has(e);
}
var hl = ll, fl = yt, pl = ul, _l = hl;
function $e(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.__data__ = new fl(); ++t < r; )
    this.add(e[t]);
}
$e.prototype.add = $e.prototype.push = pl;
$e.prototype.has = _l;
var Zr = $e;
function dl(e, t, r, n) {
  for (var s = e.length, i = r + (n ? 1 : -1); n ? i-- : ++i < s; )
    if (t(e[i], i, e))
      return i;
  return -1;
}
var gl = dl;
function vl(e) {
  return e !== e;
}
var yl = vl;
function ml(e, t, r) {
  for (var n = r - 1, s = e.length; ++n < s; )
    if (e[n] === t)
      return n;
  return -1;
}
var bl = ml, Tl = gl, El = yl, Sl = bl;
function Al(e, t, r) {
  return t === t ? Sl(e, t, r) : Tl(e, El, r);
}
var Ol = Al, wl = Ol;
function Pl(e, t) {
  var r = e == null ? 0 : e.length;
  return !!r && wl(e, t, 0) > -1;
}
var $l = Pl;
function Cl(e, t, r) {
  for (var n = -1, s = e == null ? 0 : e.length; ++n < s; )
    if (r(t, e[n]))
      return !0;
  return !1;
}
var Ll = Cl;
function Rl(e) {
  return function(t) {
    return e(t);
  };
}
var en = Rl;
function Il(e, t) {
  return e.has(t);
}
var tn = Il, Nl = Zr, Ml = $l, xl = Ll, Dl = Ur, kl = en, Fl = tn, zl = 200;
function jl(e, t, r, n) {
  var s = -1, i = Ml, a = !0, o = e.length, c = [], u = t.length;
  if (!o)
    return c;
  r && (t = Dl(t, kl(r))), n ? (i = xl, a = !1) : t.length >= zl && (i = Fl, a = !1, t = new Nl(t));
  e:
    for (; ++s < o; ) {
      var l = e[s], f = r == null ? l : r(l);
      if (l = n || l !== 0 ? l : 0, a && f === f) {
        for (var p = u; p--; )
          if (t[p] === f)
            continue e;
        c.push(l);
      } else
        i(t, f, n) || c.push(l);
    }
  return c;
}
var Gl = jl, Vl = Jr, Ul = Xr, Bl = Qr;
function Hl(e, t) {
  return Bl(Ul(e, t, Vl), e + "");
}
var Kl = Hl, Yl = jr, ql = Et;
function Wl(e) {
  return e != null && ql(e.length) && !Yl(e);
}
var rn = Wl, Xl = rn, Jl = j;
function Ql(e) {
  return Jl(e) && Xl(e);
}
var Zl = Ql, eh = Gl, th = Kl, rh = Zl, nh = th(function(e, t) {
  return rh(e) ? eh(e, t) : [];
}), sh = nh, At = S && S.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(Ne, "__esModule", { value: !0 });
Ne.normalizeDefaults = void 0;
const Bt = At(jc), Ht = At(al), Ue = At(sh), ih = A, Y = d;
function ah(e, t, r) {
  return {
    ...e,
    [t]: r
  };
}
function oh(e, t) {
  return e.reduce((r, n) => {
    if (!(0, Y.isObject)(n.style))
      return [...r, n];
    const s = (0, Ht.default)(n.style, (0, Ue.default)((0, Y.keys)(n.style), t));
    if (!(0, Y.keys)(s).length) {
      const a = (0, Y.keys)(n);
      if (!(0, Ue.default)(a, "ranges", "style").length)
        return r;
      const c = (0, Ht.default)(n, (0, Ue.default)(a, "style"));
      return [...r, c];
    }
    const i = {
      ...n,
      font: s
    };
    return [...r, i];
  }, []);
}
function ch(e, t, r) {
  const n = (0, Y.isObject)(e.defaultStyle) ? e.defaultStyle : {}, s = !(0, Bt.default)(n, t), i = (n == null ? void 0 : n[t]) === r, a = s || i, o = (0, ih.asArray)(e.styles).every((c) => {
    var u;
    const l = !(0, Bt.default)(c == null ? void 0 : c.style, t), f = ((u = c == null ? void 0 : c.style) === null || u === void 0 ? void 0 : u[t]) === r;
    return l || f;
  });
  if (a && o) {
    const c = ah(n, t, r), u = oh(e.styles, t);
    return {
      ...e,
      defaultStyle: c,
      styles: u
    };
  }
  return e;
}
function uh(e) {
  const t = {
    letterSpacing: 0
  };
  return Array.isArray(e.styles) ? (0, Y.keys)(t).reduce((r, n) => ch(r, n, t[n]), e) : e;
}
Ne.normalizeDefaults = uh;
var ze = {}, lh = De;
function hh() {
  this.__data__ = new lh(), this.size = 0;
}
var fh = hh;
function ph(e) {
  var t = this.__data__, r = t.delete(e);
  return this.size = t.size, r;
}
var _h = ph;
function dh(e) {
  return this.__data__.get(e);
}
var gh = dh;
function vh(e) {
  return this.__data__.has(e);
}
var yh = vh, mh = De, bh = vt, Th = yt, Eh = 200;
function Sh(e, t) {
  var r = this.__data__;
  if (r instanceof mh) {
    var n = r.__data__;
    if (!bh || n.length < Eh - 1)
      return n.push([e, t]), this.size = ++r.size, this;
    r = this.__data__ = new Th(n);
  }
  return r.set(e, t), this.size = r.size, this;
}
var Ah = Sh, Oh = De, wh = fh, Ph = _h, $h = gh, Ch = yh, Lh = Ah;
function Z(e) {
  var t = this.__data__ = new Oh(e);
  this.size = t.size;
}
Z.prototype.clear = wh;
Z.prototype.delete = Ph;
Z.prototype.get = $h;
Z.prototype.has = Ch;
Z.prototype.set = Lh;
var Rh = Z;
function Ih(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length; ++r < n; )
    if (t(e[r], r, e))
      return !0;
  return !1;
}
var Nh = Ih, Mh = Zr, xh = Nh, Dh = tn, kh = 1, Fh = 2;
function zh(e, t, r, n, s, i) {
  var a = r & kh, o = e.length, c = t.length;
  if (o != c && !(a && c > o))
    return !1;
  var u = i.get(e), l = i.get(t);
  if (u && l)
    return u == t && l == e;
  var f = -1, p = !0, g = r & Fh ? new Mh() : void 0;
  for (i.set(e, t), i.set(t, e); ++f < o; ) {
    var y = e[f], v = t[f];
    if (n)
      var E = a ? n(v, y, f, t, e, i) : n(y, v, f, e, t, i);
    if (E !== void 0) {
      if (E)
        continue;
      p = !1;
      break;
    }
    if (g) {
      if (!xh(t, function(O, w) {
        if (!Dh(g, w) && (y === O || s(y, O, r, n, i)))
          return g.push(w);
      })) {
        p = !1;
        break;
      }
    } else if (!(y === v || s(y, v, r, n, i))) {
      p = !1;
      break;
    }
  }
  return i.delete(e), i.delete(t), p;
}
var nn = zh, jh = I, Gh = jh.Uint8Array, Vh = Gh;
function Uh(e) {
  var t = -1, r = Array(e.size);
  return e.forEach(function(n, s) {
    r[++t] = [s, n];
  }), r;
}
var Bh = Uh;
function Hh(e) {
  var t = -1, r = Array(e.size);
  return e.forEach(function(n) {
    r[++t] = n;
  }), r;
}
var Kh = Hh, Kt = me, Yt = Vh, Yh = gt, qh = nn, Wh = Bh, Xh = Kh, Jh = 1, Qh = 2, Zh = "[object Boolean]", ef = "[object Date]", tf = "[object Error]", rf = "[object Map]", nf = "[object Number]", sf = "[object RegExp]", af = "[object Set]", of = "[object String]", cf = "[object Symbol]", uf = "[object ArrayBuffer]", lf = "[object DataView]", qt = Kt ? Kt.prototype : void 0, Be = qt ? qt.valueOf : void 0;
function hf(e, t, r, n, s, i, a) {
  switch (r) {
    case lf:
      if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
        return !1;
      e = e.buffer, t = t.buffer;
    case uf:
      return !(e.byteLength != t.byteLength || !i(new Yt(e), new Yt(t)));
    case Zh:
    case ef:
    case nf:
      return Yh(+e, +t);
    case tf:
      return e.name == t.name && e.message == t.message;
    case sf:
    case of:
      return e == t + "";
    case rf:
      var o = Wh;
    case af:
      var c = n & Jh;
      if (o || (o = Xh), e.size != t.size && !c)
        return !1;
      var u = a.get(e);
      if (u)
        return u == t;
      n |= Qh, a.set(e, t);
      var l = qh(o(e), o(t), n, s, i, a);
      return a.delete(e), l;
    case cf:
      if (Be)
        return Be.call(e) == Be.call(t);
  }
  return !1;
}
var ff = hf, pf = qr, _f = D;
function df(e, t, r) {
  var n = t(e);
  return _f(e) ? n : pf(n, r(e));
}
var gf = df;
function vf(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length, s = 0, i = []; ++r < n; ) {
    var a = e[r];
    t(a, r, e) && (i[s++] = a);
  }
  return i;
}
var yf = vf;
function mf() {
  return [];
}
var bf = mf, Tf = yf, Ef = bf, Sf = Object.prototype, Af = Sf.propertyIsEnumerable, Wt = Object.getOwnPropertySymbols, Of = Wt ? function(e) {
  return e == null ? [] : (e = Object(e), Tf(Wt(e), function(t) {
    return Af.call(e, t);
  }));
} : Ef, wf = Of;
function Pf(e, t) {
  for (var r = -1, n = Array(e); ++r < e; )
    n[r] = t(r);
  return n;
}
var $f = Pf, _e = {}, Cf = {
  get exports() {
    return _e;
  },
  set exports(e) {
    _e = e;
  }
};
function Lf() {
  return !1;
}
var Rf = Lf;
(function(e, t) {
  var r = I, n = Rf, s = t && !t.nodeType && t, i = s && !0 && e && !e.nodeType && e, a = i && i.exports === s, o = a ? r.Buffer : void 0, c = o ? o.isBuffer : void 0, u = c || n;
  e.exports = u;
})(Cf, _e);
var If = be, Nf = Et, Mf = j, xf = "[object Arguments]", Df = "[object Array]", kf = "[object Boolean]", Ff = "[object Date]", zf = "[object Error]", jf = "[object Function]", Gf = "[object Map]", Vf = "[object Number]", Uf = "[object Object]", Bf = "[object RegExp]", Hf = "[object Set]", Kf = "[object String]", Yf = "[object WeakMap]", qf = "[object ArrayBuffer]", Wf = "[object DataView]", Xf = "[object Float32Array]", Jf = "[object Float64Array]", Qf = "[object Int8Array]", Zf = "[object Int16Array]", ep = "[object Int32Array]", tp = "[object Uint8Array]", rp = "[object Uint8ClampedArray]", np = "[object Uint16Array]", sp = "[object Uint32Array]", _ = {};
_[Xf] = _[Jf] = _[Qf] = _[Zf] = _[ep] = _[tp] = _[rp] = _[np] = _[sp] = !0;
_[xf] = _[Df] = _[qf] = _[kf] = _[Wf] = _[Ff] = _[zf] = _[jf] = _[Gf] = _[Vf] = _[Uf] = _[Bf] = _[Hf] = _[Kf] = _[Yf] = !1;
function ip(e) {
  return Mf(e) && Nf(e.length) && !!_[If(e)];
}
var ap = ip, Ce = {}, op = {
  get exports() {
    return Ce;
  },
  set exports(e) {
    Ce = e;
  }
};
(function(e, t) {
  var r = Fr, n = t && !t.nodeType && t, s = n && !0 && e && !e.nodeType && e, i = s && s.exports === n, a = i && r.process, o = function() {
    try {
      var c = s && s.require && s.require("util").types;
      return c || a && a.binding && a.binding("util");
    } catch {
    }
  }();
  e.exports = o;
})(op, Ce);
var cp = ap, up = en, Xt = Ce, Jt = Xt && Xt.isTypedArray, lp = Jt ? up(Jt) : cp, sn = lp, hp = $f, fp = bt, pp = D, _p = _e, dp = Tt, gp = sn, vp = Object.prototype, yp = vp.hasOwnProperty;
function mp(e, t) {
  var r = pp(e), n = !r && fp(e), s = !r && !n && _p(e), i = !r && !n && !s && gp(e), a = r || n || s || i, o = a ? hp(e.length, String) : [], c = o.length;
  for (var u in e)
    (t || yp.call(e, u)) && !(a && // Safari 9 has enumerable `arguments.length` in strict mode.
    (u == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    s && (u == "offset" || u == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    i && (u == "buffer" || u == "byteLength" || u == "byteOffset") || // Skip index properties.
    dp(u, c))) && o.push(u);
  return o;
}
var bp = mp, Tp = Object.prototype;
function Ep(e) {
  var t = e && e.constructor, r = typeof t == "function" && t.prototype || Tp;
  return e === r;
}
var Sp = Ep;
function Ap(e, t) {
  return function(r) {
    return e(t(r));
  };
}
var Op = Ap, wp = Op, Pp = wp(Object.keys, Object), $p = Pp, Cp = Sp, Lp = $p, Rp = Object.prototype, Ip = Rp.hasOwnProperty;
function Np(e) {
  if (!Cp(e))
    return Lp(e);
  var t = [];
  for (var r in Object(e))
    Ip.call(e, r) && r != "constructor" && t.push(r);
  return t;
}
var Mp = Np, xp = bp, Dp = Mp, kp = rn;
function Fp(e) {
  return kp(e) ? xp(e) : Dp(e);
}
var zp = Fp, jp = gf, Gp = wf, Vp = zp;
function Up(e) {
  return jp(e, Vp, Gp);
}
var Bp = Up, Qt = Bp, Hp = 1, Kp = Object.prototype, Yp = Kp.hasOwnProperty;
function qp(e, t, r, n, s, i) {
  var a = r & Hp, o = Qt(e), c = o.length, u = Qt(t), l = u.length;
  if (c != l && !a)
    return !1;
  for (var f = c; f--; ) {
    var p = o[f];
    if (!(a ? p in t : Yp.call(t, p)))
      return !1;
  }
  var g = i.get(e), y = i.get(t);
  if (g && y)
    return g == t && y == e;
  var v = !0;
  i.set(e, t), i.set(t, e);
  for (var E = a; ++f < c; ) {
    p = o[f];
    var O = e[p], w = t[p];
    if (n)
      var re = a ? n(w, O, p, t, e, i) : n(O, w, p, e, t, i);
    if (!(re === void 0 ? O === w || s(O, w, r, n, i) : re)) {
      v = !1;
      break;
    }
    E || (E = p == "constructor");
  }
  if (v && !E) {
    var U = e.constructor, B = t.constructor;
    U != B && "constructor" in e && "constructor" in t && !(typeof U == "function" && U instanceof U && typeof B == "function" && B instanceof B) && (v = !1);
  }
  return i.delete(e), i.delete(t), v;
}
var Wp = qp, Xp = V, Jp = I, Qp = Xp(Jp, "DataView"), Zp = Qp, e_ = V, t_ = I, r_ = e_(t_, "Promise"), n_ = r_, s_ = V, i_ = I, a_ = s_(i_, "Set"), o_ = a_, c_ = V, u_ = I, l_ = c_(u_, "WeakMap"), h_ = l_, rt = Zp, nt = vt, st = n_, it = o_, at = h_, an = be, ee = Gr, Zt = "[object Map]", f_ = "[object Object]", er = "[object Promise]", tr = "[object Set]", rr = "[object WeakMap]", nr = "[object DataView]", p_ = ee(rt), __ = ee(nt), d_ = ee(st), g_ = ee(it), v_ = ee(at), F = an;
(rt && F(new rt(new ArrayBuffer(1))) != nr || nt && F(new nt()) != Zt || st && F(st.resolve()) != er || it && F(new it()) != tr || at && F(new at()) != rr) && (F = function(e) {
  var t = an(e), r = t == f_ ? e.constructor : void 0, n = r ? ee(r) : "";
  if (n)
    switch (n) {
      case p_:
        return nr;
      case __:
        return Zt;
      case d_:
        return er;
      case g_:
        return tr;
      case v_:
        return rr;
    }
  return t;
});
var y_ = F, He = Rh, m_ = nn, b_ = ff, T_ = Wp, sr = y_, ir = D, ar = _e, E_ = sn, S_ = 1, or = "[object Arguments]", cr = "[object Array]", Ee = "[object Object]", A_ = Object.prototype, ur = A_.hasOwnProperty;
function O_(e, t, r, n, s, i) {
  var a = ir(e), o = ir(t), c = a ? cr : sr(e), u = o ? cr : sr(t);
  c = c == or ? Ee : c, u = u == or ? Ee : u;
  var l = c == Ee, f = u == Ee, p = c == u;
  if (p && ar(e)) {
    if (!ar(t))
      return !1;
    a = !0, l = !1;
  }
  if (p && !l)
    return i || (i = new He()), a || E_(e) ? m_(e, t, r, n, s, i) : b_(e, t, c, r, n, s, i);
  if (!(r & S_)) {
    var g = l && ur.call(e, "__wrapped__"), y = f && ur.call(t, "__wrapped__");
    if (g || y) {
      var v = g ? e.value() : e, E = y ? t.value() : t;
      return i || (i = new He()), s(v, E, r, n, i);
    }
  }
  return p ? (i || (i = new He()), T_(e, t, r, n, s, i)) : !1;
}
var w_ = O_, P_ = w_, lr = j;
function on(e, t, r, n, s) {
  return e === t ? !0 : e == null || t == null || !lr(e) && !lr(t) ? e !== e && t !== t : P_(e, t, r, n, on, s);
}
var $_ = on, C_ = $_;
function L_(e, t) {
  return C_(e, t);
}
var R_ = L_, I_ = S && S.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(ze, "__esModule", { value: !0 });
ze.normalizeDupRanges = void 0;
const N_ = I_(R_), M_ = A;
function x_(e) {
  return e.slice().sort((r, n) => r.from - n.from).reduce((r, n, s) => {
    if (!s)
      return r.push({ ...n }), r;
    const i = r[r.length - 1];
    return i.to >= n.from ? i.to = Math.max(n.to, i.to) : r.push({ ...n }), r;
  }, []);
}
function D_(e) {
  const t = (0, M_.asArray)(e.styles).reduce((n, s) => {
    const i = [...n.keys()].find((a) => (0, N_.default)(a, s.style));
    return i ? n.get(i).push(...s.ranges) : n.set(s.style, s.ranges), n;
  }, /* @__PURE__ */ new Map()), r = [...t.keys()].reduce((n, s) => [
    ...n,
    {
      style: s,
      ranges: x_(t.get(s))
    }
  ], []);
  return {
    ...e,
    ...r.length ? { styles: r } : null
  };
}
ze.normalizeDupRanges = D_;
var je = {};
Object.defineProperty(je, "__esModule", { value: !0 });
je.normalizeLinebreak = void 0;
function k_(e) {
  return e.replace(/[\u0003\u000b]/g, "\u2028").replace(/[\r\n]/g, "\u2029");
}
function F_(e, t, r) {
  return {
    from: e <= r ? e : e - 1,
    to: t > r ? t - 1 : t
  };
}
function z_(e, t) {
  return e.map((r) => Array.isArray(r.ranges) ? {
    ...r,
    ranges: r.ranges.map((n) => F_(n.from, n.to, t))
  } : r);
}
function cn(e) {
  if (typeof e.value != "string")
    return e;
  const t = e.value.indexOf(`\r
`);
  return t === -1 ? e : cn({
    ...e,
    value: e.value.replace(/\r\n/, `
`),
    styles: Array.isArray(e.styles) ? z_(e.styles, t) : e.styles
  });
}
function j_(e) {
  const t = cn(e);
  return {
    ...t,
    value: k_(t.value)
  };
}
je.normalizeLinebreak = j_;
Object.defineProperty(pt, "__esModule", { value: !0 });
var un = pt.normalizeText = void 0;
const G_ = Ne, V_ = ze, U_ = je;
function B_(e) {
  return [U_.normalizeLinebreak, G_.normalizeDefaults, V_.normalizeDupRanges].reduce((r, n) => n(r), e);
}
un = pt.normalizeText = B_;
function H_(e) {
  if (!e)
    return "Regular";
  const t = {
    100: "Thin",
    200: "UltraLight",
    300: "Light",
    400: "Regular",
    500: "Medium",
    600: "Semibold",
    700: "Bold",
    800: "ExtraBold",
    900: "Black"
  }, r = Tr(t).reduce((n, s, i, a) => {
    if (!n) {
      if (i === a.length - 1)
        return null;
      const o = a[i + 1];
      if (Number(s) <= e && Number(o) >= e)
        return [s, o];
    }
    return n;
  }, null);
  return r === null ? "Regular" : e - Number(r[0]) > Number(r[1]) - e ? t[r[1]] : t[r[0]];
}
function K_({ fontStyle: e, fontWeight: t, italic: r }) {
  if (typeof e == "string")
    return e.replace(/\s/g, "").replace(/Regular/, "");
  const n = H_(t).replace(/Regular/, "");
  return r ? `${n}Italic` : n;
}
function Y_(e) {
  const { fontFamily: t } = e;
  if (typeof t != "string")
    return null;
  const r = t.replace(/\s/g, ""), n = K_(e);
  return n ? `${r}-${n}` : r;
}
var q_ = Object.defineProperty, W_ = Object.getOwnPropertyDescriptor, ln = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? W_(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && q_(t, r, s), s;
};
const ce = class extends q {
  constructor(e) {
    super(e);
  }
  get sourceLayer() {
    return this._sourceLayer;
  }
  async _getFills(e) {
    return (await Promise.all(e.map((r) => new ye({ fill: r, parentLayer: this }).convert()))).filter((r) => Boolean(r));
  }
  async _fills() {
    return this._getFills(this.sourceLayer.fills);
  }
  async _strokes() {
    const e = this.sourceLayer.strokes;
    return (await Promise.all(e.map((r) => new W({ fill: r, parentLayer: this }).convert()))).filter((r) => Boolean(r));
  }
  _parsePostScriptName(e) {
    const t = e.fontPostScriptName;
    if (t)
      return t;
    const { fontFamily: r, fontStyle: n, fontWeight: s, italic: i } = e;
    return Y_({ fontFamily: r, fontStyle: n, fontWeight: s, italic: i });
  }
  _getFont(e) {
    const t = this._parsePostScriptName(e), r = e.fontPostScriptName ? void 0 : !0;
    if (t)
      return { postScriptName: t, family: e.fontFamily, syntheticPostScriptName: r };
  }
  _getLineHeight(e) {
    const t = e.lineHeightPx, r = e.lineHeightPercent;
    if (!(t === void 0 && r === void 0))
      return r === 100 ? 0 : Ms(t ?? 0);
  }
  async _getStyle(e) {
    const t = this._getFont(e), r = e.fontSize, n = this._getLineHeight(e), s = e.kerning, i = e.letterSpacing, a = L(e.textCase, ce.TEXT_CASE_MAP, void 0), o = e.textDecoration, c = o === void 0 ? void 0 : o === "UNDERLINE" ? "SINGLE" : "NONE", u = o === void 0 ? void 0 : o === "STRIKETHROUGH", l = e.textFills && await this._getFills(e.textFills);
    return { font: t, fontSize: r, lineHeight: n, kerning: s, letterSpacing: i, underline: c, linethrough: u, letterCase: a, fills: l };
  }
  async _defaultStyle() {
    var p;
    const e = this.sourceLayer.defaultStyle;
    if (!e)
      return null;
    const t = this._getFont(e);
    if (!t)
      return h == null || h.warn("Unknown font", { textStyle: e }), null;
    const r = e.fontSize ?? T.TEXT.FONT_SIZE, n = this._getLineHeight(e), s = e.kerning === !1 ? !1 : void 0, i = e.letterSpacing, a = L(e.textCase, ce.TEXT_CASE_MAP, void 0), o = e.textDecoration, c = o === "UNDERLINE" ? "SINGLE" : void 0, u = o === "STRIKETHROUGH" ? !0 : void 0, l = (p = e.textFills) != null && p.length ? await this._getFills(e.textFills) : await this._fills(), f = await this._strokes();
    return { font: t, fontSize: r, lineHeight: n, kerning: s, letterSpacing: i, underline: c, linethrough: u, letterCase: a, fills: l, strokes: f };
  }
  async _styles() {
    const e = this.sourceLayer.characterStyleOverrides.reduce((n, s, i) => {
      const a = n[s];
      return a ? a.push(i) : n[s] = [i], n;
    }, {}), t = this.sourceLayer.styleOverrideTable;
    return (await Promise.all(
      Object.keys(e).map(async (n) => {
        const s = t[n];
        if (!s)
          return null;
        const i = await this._getStyle(s);
        if (!i)
          return null;
        const a = e[n];
        if (!a)
          return null;
        const o = a.map((c) => ({ from: c, to: c + 1 }));
        return { style: i, ranges: o };
      })
    )).filter((n) => Boolean(n));
  }
  get horizontalAlign() {
    var r;
    const e = (r = this.sourceLayer.defaultStyle) == null ? void 0 : r.textAlignHorizontal, t = L(e, ce.HORIZONTAL_ALIGN_MAP, void 0);
    return t || (h == null || h.warn("Unknown horizontal Align", { horizontalAlign: e }), "LEFT");
  }
  get _frame() {
    var s;
    const e = L((s = this.sourceLayer.defaultStyle) == null ? void 0 : s.textAutoResize, ce.FRAME_MODE_MAP, "FIXED"), { x: t, y: r } = this.sourceLayer.size ?? {};
    return { mode: e, size: t !== void 0 && r !== void 0 ? { width: t, height: r } : void 0 };
  }
  async _text() {
    var c;
    const e = this.sourceLayer.characters, t = await this._defaultStyle();
    if (!t)
      return null;
    const r = await this._styles(), n = this.horizontalAlign, s = (c = this.sourceLayer.defaultStyle) == null ? void 0 : c.textAlignVertical, i = this._frame;
    return un({ value: e, defaultStyle: t, styles: r, horizontalAlign: n, verticalAlign: s, frame: i, baselinePolicy: "OFFSET_ASCENDER" });
  }
  async _convertTypeSpecific() {
    const e = await this._text();
    return e ? { type: "TEXT", text: e } : null;
  }
  async convert() {
    const e = this.convertBase();
    if (!e)
      return null;
    const t = await this._convertTypeSpecific();
    return t ? { ...e, ...t } : null;
  }
};
let te = ce;
te.HORIZONTAL_ALIGN_MAP = {
  LEFT: "LEFT",
  CENTER: "CENTER",
  RIGHT: "RIGHT",
  JUSTIFIED: "JUSTIFY"
};
te.TEXT_CASE_MAP = {
  ORIGINAL: "NONE",
  UPPER: "UPPERCASE",
  LOWER: "LOWERCASE",
  SMALL_CAPS: "SMALL_CAPS",
  SMALL_CAPS_FORCED: "SMALL_CAPS",
  TITLE: "TITLE_CASE"
};
te.FRAME_MODE_MAP = {
  NONE: "FIXED",
  HEIGHT: "AUTO_HEIGHT",
  WIDTH_AND_HEIGHT: "AUTO_WIDTH"
};
ln([
  $()
], te.prototype, "_defaultStyle", 1);
ln([
  $()
], te.prototype, "_styles", 1);
const X_ = {
  FRAME: ie,
  GROUP: ie,
  INSTANCE: ie,
  COMPONENT: ie,
  COMPONENT_SET: ie,
  SHAPE: J_,
  TEXT: Q_,
  SLICE: Z_
};
function ie({
  layer: e,
  parent: t
}) {
  const r = e;
  return r.hasBackgroundMask || r.clipsContent ? N.createBackgroundMaskGroup({ parent: t, sourceLayer: r }) : new js({ parent: t, sourceLayer: r });
}
function J_({ layer: e, parent: t }) {
  const r = e;
  return new ti({ parent: t, sourceLayer: r });
}
function Q_({ layer: e, parent: t }) {
  const r = e;
  return new te({ parent: t, sourceLayer: r });
}
function Z_() {
  return null;
}
function ue(e) {
  const t = e.layer.type, r = L(t, X_, void 0);
  return r ? r(e) : (h == null || h.warn("createOctopusLayer: Unknown layer type", { type: t }), null);
}
function ed(e, t, r, n) {
  return n ? N.createClippingMaskOutline({ parent: e, mask: t, layers: r }) : N.createClippingMask({ parent: e, mask: t, layers: r });
}
function hr(e) {
  return e.type === "FRAME" || !e.visible;
}
function td(e) {
  return [...e].reduce((r, n, s) => ((s === 0 || n.isMask) && r.push([]), r[r.length - 1].push(n), r), []).reduce((r, n) => {
    let s = n[0].isMask;
    const i = n.reduce((a, o, c) => ((c === 0 || hr(o) || !s) && a.push([]), hr(o) && (s = !1), a[a.length - 1].push(o), a), []);
    return r.push(i), r;
  }, []).flat(1);
}
function hn(e, t) {
  return td(e).map((n) => {
    if (n[0].isMask) {
      const [s, ...i] = n, a = ue({ parent: t, layer: s });
      if (!a)
        return null;
      const o = i.map((c) => ue({ parent: t, layer: c })).filter((c) => Boolean(c));
      return ed(t, a, o, s.isMaskOutline);
    }
    return ue({ parent: t, layer: n[0] });
  }).filter((n) => Boolean(n));
}
class le {
  constructor(t) {
    this._designConverter = t.designConverter, this._sourceComponent = t.source;
  }
  get parentComponent() {
    return this;
  }
  get sourceComponent() {
    return this._sourceComponent;
  }
  get sourceLayer() {
    return this.sourceComponent.sourceLayer;
  }
  get designConverter() {
    return this._designConverter;
  }
  get octopusManifest() {
    return this.designConverter.octopusManifest;
  }
  get dimensions() {
    const t = ge.NODE_ENV === "debug" ? this.sourceComponent.bounds : this.sourceComponent.boundingBox;
    if (!t)
      return;
    const { width: r, height: n } = t;
    return { width: r, height: n };
  }
  get id() {
    return C(this.sourceComponent.id);
  }
  get version() {
    return this._designConverter.pkgMeta.octopusSpecVersion;
  }
  async _content() {
    const t = this.sourceLayer, r = ue({ parent: this, layer: t });
    return await (r == null ? void 0 : r.convert()) ?? void 0;
  }
  async convert() {
    return {
      id: this.id,
      type: "OCTOPUS_COMPONENT",
      version: this.version,
      dimensions: this.dimensions,
      content: await this._content()
    };
  }
}
class rd {
  constructor(t) {
    this._designConverter = t.designConverter, this._source = t.source;
  }
  convert() {
    return new le({ designConverter: this._designConverter, source: this._source }).convert();
  }
}
const nd = !0, Oe = class {
  constructor(e, t) {
    this._imageSizeMap = {}, this._awaitingComponents = [], this._conversionResult = { manifest: void 0, components: [], images: [], previews: [] }, this._designEmitter = e.designEmitter || null, this._designId = e.designId || Le(), this._octopusConverter = t, this._exporter = yr(e.exporter) ? e.exporter : null, this._partialUpdateInterval = e.partialUpdateInterval || Oe.PARTIAL_UPDATE_INTERVAL, this._shouldReturn = !(e.skipReturn ?? !1), this._finalizeConvert = fe(), this._queue = this._initComponentQueue();
  }
  get id() {
    return this._designId;
  }
  get octopusManifest() {
    return this._octopusManifest;
  }
  get imageSizeMap() {
    return this._imageSizeMap;
  }
  getImageSize(e) {
    return e ? this._imageSizeMap[e] : void 0;
  }
  get pkgMeta() {
    return this._octopusConverter.pkg;
  }
  async _convertSourceComponentSafe(e) {
    try {
      return { value: await new rd({ source: e, designConverter: this }).convert(), error: null };
    } catch (t) {
      return { value: null, error: t };
    }
  }
  async _convertSourceComponent(e) {
    const { time: t, result: r } = await this._octopusConverter.benchmarkAsync(
      async () => this._convertSourceComponentSafe(e)
    ), { value: n, error: s } = r;
    return { id: e.id, value: n, error: s, time: t };
  }
  async _exportManifest() {
    var r, n;
    const e = this.octopusManifest;
    if (!e)
      return;
    const t = await e.convert();
    try {
      await ((n = (r = this._exporter) == null ? void 0 : r.exportManifest) == null ? void 0 : n.call(r, t));
    } catch (s) {
      h == null || h.error(s);
    }
    return t;
  }
  async _exportComponentSafe(e, t) {
    var r, n;
    try {
      const s = await ((n = (r = this._exporter) == null ? void 0 : r.exportComponent) == null ? void 0 : n.call(r, e, t));
      return s ? { path: s, error: null } : { path: null, error: new Error("Export Component failed - no path") };
    } catch (s) {
      return { path: null, error: s };
    }
  }
  async _exportComponent(e) {
    var s;
    const t = await this._convertSourceComponent(e), { path: r, error: n } = await this._exportComponentSafe(t, Cr(e));
    return (s = this.octopusManifest) == null || s.setExportedComponent(e, {
      path: r,
      error: t.error ?? n,
      time: t.time
    }), t;
  }
  _initComponentQueue() {
    return new Er({
      name: Oe.COMPONENT_QUEUE_NAME,
      parallels: Oe.COMPONENT_QUEUE_PARALLELS,
      factory: async (e) => Promise.all(
        e.map(async (t) => ({
          value: await this._exportComponent(t),
          error: null
        }))
      )
    });
  }
  async _convertDesign(e) {
    var i, a, o, c, u;
    const t = e.designId, r = e.design, n = new Ns({ designId: t, raw: r });
    this._octopusManifest = new Re({ sourceDesign: n, octopusConverter: this._octopusConverter }), n.raw && ((a = (i = this._exporter) == null ? void 0 : i.exportRawDesign) == null || a.call(i, n.raw)), this._exportManifest();
    const s = setInterval(async () => this._exportManifest(), this._partialUpdateInterval);
    await e.content, (o = this.octopusManifest) == null || o.finalize(), await Promise.all(this._awaitingComponents), clearInterval(s), this._conversionResult.manifest = await this._exportManifest(), (u = (c = this._exporter) == null ? void 0 : c.finalizeExport) == null || u.call(c), this._finalizeConvert.resolve();
  }
  async _convertFrame(e, t = !1) {
    var p, g, y, v, E;
    const { libraryMeta: r, nodeId: n, node: s, fills: i } = e;
    t && r && ((p = this.octopusManifest) == null || p.setExportedLibrary(r));
    const a = s.document, o = (y = (g = this._exporter) == null ? void 0 : g.exportRawComponent) == null ? void 0 : y.call(g, a, n), c = Object.keys(i ?? {});
    (v = this.octopusManifest) == null || v.setExportedComponentImageMap(n, c);
    const u = new x({ rawFrame: a }), l = this._queue.exec(u);
    this._awaitingComponents.push(l), (E = this.octopusManifest) == null || E.setExportedSourcePath(n, await o);
    const f = await l;
    this._shouldReturn && this._conversionResult.components.push(f);
  }
  async _convertChunk(e) {
    var r, n, s;
    const t = await ((n = (r = this._exporter) == null ? void 0 : r.exportRawChunk) == null ? void 0 : n.call(r, e, e.id));
    (s = this.octopusManifest) == null || s.setExportedChunk(e, t);
  }
  async _convertFill(e) {
    var s, i, a;
    typeof e.buffer == "string" && (e.buffer = this._octopusConverter.base64ToUint8Array(e.buffer));
    const t = e.ref, r = e.size ? e.size : await this._octopusConverter.imageSize(e.buffer);
    r && (this._imageSizeMap[t] = r);
    const n = (i = (s = this._exporter) == null ? void 0 : s.exportImage) == null ? void 0 : i.call(s, t, e.buffer);
    (a = this.octopusManifest) == null || a.setExportedImagePath(t, n), this._shouldReturn && this._conversionResult.images.push({ name: t, data: e.buffer });
  }
  async _convertPreview(e) {
    var n, s, i;
    const t = e.nodeId, r = await ((s = (n = this._exporter) == null ? void 0 : n.exportPreview) == null ? void 0 : s.call(n, e.nodeId, e.buffer));
    (i = this.octopusManifest) == null || i.setExportedPreviewPath(t, r), this._shouldReturn && this._conversionResult.previews.push({ id: t, data: e.buffer });
  }
  async convert() {
    const e = this._designEmitter;
    return e === null ? (h == null || h.error("Creating Design Failed"), null) : (e.on("ready:design", (t) => this._convertDesign(t)), e.on("ready:style", (t) => this._convertChunk(t)), e.on("ready:artboard", (t) => this._convertFrame(t)), e.on("ready:component", (t) => this._convertFrame(t)), e.on("ready:library", (t) => this._convertFrame(t, nd)), e.on("ready:fill", (t) => this._convertFill(t)), e.on("ready:preview", (t) => this._convertPreview(t)), await this._finalizeConvert.promise, this._shouldReturn ? this._conversionResult : null);
  }
};
let Ge = Oe;
Ge.COMPONENT_QUEUE_PARALLELS = 5;
Ge.COMPONENT_QUEUE_NAME = "Component queue";
Ge.PARTIAL_UPDATE_INTERVAL = 3e3;
const sd = "3.0.1", id = "3.0.1", fn = "@opendesign/octopus-fig", pn = "3.0.0-rc.28-tarpub12", _n = "Figma HTTP API format to Octopus 3+ converter.", dn = "Apache-2.0", gn = {
  bundle: "yarn run bundle:web",
  "bundle:web": "vite build -c vite.web.js",
  build: "rimraf ./dist && tsc --build tsconfig.json",
  "release:bundle:node": "vite build -c vite.node.js",
  "release:bundle:web": "vite build -c vite.web.js",
  "release:bundle": "yarn release:bundle:node && yarn release:bundle:web",
  "release:cleanup": "rimraf ./release ./release.tgz",
  "release:publish": "yarn publish release.tgz --non-interactive --ignore-scripts",
  release: "yarn release:bundle && node ./prepare-release.mjs && yarn release:publish && yarn release:cleanup",
  "clean:workdir": "rimraf ./workdir/*",
  "convert:squid:debug": "ts-node ./examples/node/convert-plugin-squid-debug.ts",
  "convert:squid:local": "ts-node ./examples/node/convert-plugin-squid-local.ts",
  clean: "rimraf ./node_modules ./dist ./workdir ./test/integration/report",
  "convert:api:debug": "ts-node ./examples/node/convert-api-debug.ts",
  "convert:api:local": "ts-node ./examples/node/convert-api-local.ts",
  prepack: "yarn run build",
  test: "yarn test:unit && yarn test:integration",
  "test:unit": "yarn jest",
  "test:integration": "yarn test:integration:parser && yarn test:integration:squid",
  "test:integration:parser": "ts-node --esm test/integration/figma-parser/index.ts",
  "test:integration:parser:update": "yarn test:integration:parser:update:assets && yarn test:integration:parser:update:tests",
  "test:integration:parser:update:assets": "ts-node --esm test/integration/figma-parser/update-assets.ts",
  "test:integration:parser:update:tests": "ts-node --esm test/integration/figma-parser/update-tests.ts",
  "test:integration:squid": "ts-node --esm test/integration/squid-plugin",
  "test:integration:squid:update": "ts-node --esm test/integration/squid-plugin/update-tests.ts",
  "types:check": "tsc --noEmit",
  typedoc: "typedoc --excludePrivate src/index-node.ts src/index-web.ts",
  watch: "rimraf ./dist && tsc -w"
}, vn = {
  "@opendesign/figma-parser": "3.0.0-rc.17",
  "@opendesign/manifest-ts": "3.0.1",
  "@opendesign/octopus-common": "3.0.0-rc.29",
  "@opendesign/octopus-ts": "3.0.1",
  "@types/lodash": "^4.14.178",
  "@types/uuid": "^8.3.1",
  dotenv: "16.0.0",
  eventemitter3: "^5.0.0",
  "image-size": "^1.0.1",
  lodash: "^4.17.21",
  paper: "0.12.15",
  pino: "^6.7.0",
  "pino-pretty": "^4.3.0",
  uuid: "^8.3.2"
}, yn = {
  "@types/chalk": "^2.2.0",
  "@types/jest": "^27.4.0",
  "@types/node": "*",
  "@types/pino-pretty": "4.7.5",
  "@types/pino-std-serializers": "2.4.1",
  "@types/rimraf": "^3.0.2",
  chalk: "^4.1.2",
  "enhanced-resolve": "^5.12.0",
  handlebars: "^4.7.7",
  jest: "^27.3.1",
  jsondiffpatch: "^0.4.1",
  rimraf: "^3.0.2",
  tar: "^6.1.13",
  "ts-jest": "^27.1.3",
  "ts-jest-resolver": "^2.0.0",
  "ts-node": "10.8.0",
  typedoc: "^0.23.18",
  typescript: "4.9.5",
  vite: "^4.1.4",
  "vite-plugin-dts": "^2.0.2"
}, mn = [
  "dist"
], bn = "module", Tn = "./dist/src/index-node.js", En = {
  ".": {
    default: "./dist/src/index-node.js"
  }
}, ad = {
  name: fn,
  version: pn,
  description: _n,
  license: dn,
  scripts: gn,
  dependencies: vn,
  devDependencies: yn,
  files: mn,
  type: bn,
  module: Tn,
  exports: En
}, od = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ad,
  dependencies: vn,
  description: _n,
  devDependencies: yn,
  exports: En,
  files: mn,
  license: dn,
  module: Tn,
  name: fn,
  scripts: gn,
  type: bn,
  version: pn
}, Symbol.toStringTag, { value: "Module" }));
function cd() {
  const e = sd, t = id, { name: r, version: n } = od;
  return { name: r, version: n, manifestSpecVersion: e, octopusSpecVersion: t };
}
class ud {
  constructor(t) {
    this._setGlobals(t), this._pkg = cd(), this._services = this._initServices();
  }
  get benchmarkAsync() {
    return this._services.benchmark.benchmarkAsync;
  }
  get imageSize() {
    return this._services.imageSize;
  }
  get base64ToUint8Array() {
    return this._services.buffer.base64ToUint8Array;
  }
  _initServices() {
    return {
      benchmark: z().createBenchmarkService(),
      imageSize: z().createImageSizeService(),
      buffer: z().createBufferService()
    };
  }
  _setGlobals(t) {
    Wn(t.platformFactories), Jn({
      logger: { enabled: t.loggerEnabled ?? !0 }
    }), t.logger && Xn(t.logger);
  }
  get pkg() {
    return this._pkg;
  }
  async convertDesign(t) {
    return new Ge(t, this).convert();
  }
}
function ld(e) {
  return Uint8Array.from(atob(e), (t) => t.charCodeAt(0));
}
async function hd(e) {
  return new Promise((t, r) => {
    try {
      const n = new Image();
      n.src = URL.createObjectURL(new Blob([e])), n.onload = () => {
        const { width: s, height: i } = n;
        t({ width: s, height: i });
      };
    } catch (n) {
      r(n);
    }
  });
}
const fd = (e) => wn({
  enabled: e.enabled,
  browser: { asObject: !0 }
});
class lg {
  /**
   * Creates SourceApiReader that downloads given Figma designs from Figma API.
   * @constructor
   * @param {SourceApiReaderOptions} options
   */
  constructor(t) {
    this._options = t, this._parser = this._initParser();
  }
  /**
   * Figma design hash.
   * Can be found in the URL of the design: `https://www.figma.com/file/__DESIGN_HASH__`
   * @returns {string} returns Figma design hash
   */
  get designId() {
    return this._options.designId;
  }
  get getFileMeta() {
    return this._parser.getFileMeta();
  }
  /**
   * Returns `EventEmitter` which is needed in OctopusFigConverter.
   * @param {string[]} [ids] Optional IDs of wanted artboards. If not provided, whole design will be parsed.
   * @returns {EventEmitter} returns `EventEmitter` providing source data to the OctopusFigConverter
   */
  parse(t) {
    return this._parser.parse(t);
  }
  _initParser() {
    return Pn(this._options);
  }
}
var pd = typeof S == "object" && S && S.Object === Object && S, _d = pd, dd = _d, gd = typeof self == "object" && self && self.Object === Object && self, vd = dd || gd || Function("return this")(), yd = vd, md = yd, bd = md.Symbol, Sn = bd, fr = Sn, An = Object.prototype, Td = An.hasOwnProperty, Ed = An.toString, ae = fr ? fr.toStringTag : void 0;
function Sd(e) {
  var t = Td.call(e, ae), r = e[ae];
  try {
    e[ae] = void 0;
    var n = !0;
  } catch {
  }
  var s = Ed.call(e);
  return n && (t ? e[ae] = r : delete e[ae]), s;
}
var Ad = Sd, Od = Object.prototype, wd = Od.toString;
function Pd(e) {
  return wd.call(e);
}
var $d = Pd, pr = Sn, Cd = Ad, Ld = $d, Rd = "[object Null]", Id = "[object Undefined]", _r = pr ? pr.toStringTag : void 0;
function Nd(e) {
  return e == null ? e === void 0 ? Id : Rd : _r && _r in Object(e) ? Cd(e) : Ld(e);
}
var Md = Nd;
function xd(e) {
  return e != null && typeof e == "object";
}
var Dd = xd, kd = Md, Fd = Dd, zd = "[object Symbol]";
function jd(e) {
  return typeof e == "symbol" || Fd(e) && kd(e) == zd;
}
var Gd = jd, Vd = Gd;
function Ud(e, t, r) {
  for (var n = -1, s = e.length; ++n < s; ) {
    var i = e[n], a = t(i);
    if (a != null && (o === void 0 ? a === a && !Vd(a) : r(a, o)))
      var o = a, c = i;
  }
  return c;
}
var Bd = Ud;
function Hd(e, t) {
  return e > t;
}
var Kd = Hd;
function Yd(e) {
  return e;
}
var qd = Yd, Wd = Bd, Xd = Kd, Jd = qd;
function Qd(e) {
  return e && e.length ? Wd(e, Jd, Xd) : void 0;
}
var Zd = Qd;
const dr = [
  [1, 0, 0],
  [0, 1, 0]
], K = Array.isArray, Se = (e) => typeof e == "number";
class eg {
  // TODO fix any
  constructor(t) {
    this._raw = t;
  }
  _normalizeGeometry(t) {
    t && t.data && t.path === void 0 && (t.path = t.data, delete t.data);
  }
  _normalizeChildTransform(t, r, n) {
    const [[s, i, a], [o, c, u]] = t.relativeTransform ?? [[], []];
    return !Se(a) || !Se(u) || (t.relativeTransform = [
      [s, i, a - r],
      [o, c, u - n]
    ], t.type === "GROUP" && K(t.children) && t.children.forEach((l) => this._normalizeChildTransform(l, r, n))), t;
  }
  _normalizeFill(t) {
    !t.imageRef && t.imageHash && (t.imageRef = t.imageHash, delete t.imageHash), t.scaleMode === "CROP" && (t.scaleMode = "STRETCH"), t.type === "IMAGE" && t.scaleMode === "FILL" && (t.imageTransform = void 0);
  }
  _normalizeSize(t) {
    const { size: r, width: n, height: s } = t;
    return !r && (n || s) && (t.size = { x: n, y: s }), t;
  }
  _normalizeCornerRadius(t) {
    const { cornerRadius: r, rectangleCornerRadii: n, topLeftRadius: s, topRightRadius: i, bottomLeftRadius: a, bottomRightRadius: o } = t;
    return r || n || (t.rectangleCornerRadii = [
      s ?? 0,
      i ?? 0,
      a ?? 0,
      o ?? 0
    ], delete t.topLeftRadius, delete t.topRightRadius, delete t.bottomLeftRadius, delete t.bottomRightRadius), t;
  }
  _normalizeStroke(t) {
    const { strokeCap: r, strokeWeight: n } = t;
    if (r || (t.strokeCap = "NONE"), !n) {
      const { strokeTopWeight: s, strokeBottomWeight: i, strokeLeftWeight: a, strokeRightWeight: o } = t;
      t.strokeWeight = Zd([s, i, a, o, 1]);
    }
    return t;
  }
  _normalizeTextStyle(t, r) {
    const { fontName: n, fontWeight: s, fontSize: i, textCase: a, textDecoration: o, lineHeight: c } = r, { textAlignHorizontal: u, textAlignVertical: l, listSpacing: f, textAutoResize: p, paragraphSpacing: g, paragraphIndent: y } = t, { family: v, style: E } = n, O = n.style.includes("Italic"), w = r.letterSpacing.value, re = r.fills, U = c.unit === "PIXELS" ? c.value : void 0, B = c.unit === "PERCENT" ? c.value : void 0;
    return {
      fontFamily: v,
      fontStyle: E,
      fontWeight: s,
      fontSize: i,
      textAlignHorizontal: u,
      textAlignVertical: l,
      letterSpacing: w,
      italic: O,
      textCase: a,
      textDecoration: o,
      listSpacing: f,
      textAutoResize: p,
      paragraphSpacing: g,
      paragraphIndent: y,
      lineHeightPx: U,
      lineHeightPercent: B,
      fills: re
    };
  }
  _getNextCharacterStyleOverrides(t, r) {
    return Array(r).fill(t);
  }
  _normalizeText(t) {
    const { styledTextSegments: r } = t;
    if ((r == null ? void 0 : r.length) > 0) {
      const n = [], s = {};
      r.forEach((i, a) => {
        const o = this._getNextCharacterStyleOverrides(a, i.end - i.start);
        n.push(...o);
        const c = this._normalizeTextStyle(t, i);
        a === 0 ? t.style = c : s[a] = c;
      }), t.characterStyleOverrides = n, t.styleOverrideTable = s, delete t.styledTextSegments;
    }
    return t;
  }
  _normalizeGroup(t) {
    const [[r, n, s], [i, a, o]] = t.relativeTransform;
    return K(t.children) && Se(s) && Se(o) && t.children.forEach((c) => this._normalizeChildTransform(c, s, o)), t;
  }
  _normalizeTopLayerTransform(t) {
    const r = t.type === "BOOLEAN_OPERATION" ? dr : t.absoluteTransform, [[n, s, i], [a, o, c]] = r, { x: u, y: l } = t.absoluteRenderBounds;
    return t.relativeTransform = [
      [n, s, i - u],
      [a, o, c - l]
    ], t;
  }
  _normalizeLayer(t, r = !1) {
    const { type: n } = t;
    this._normalizeSize(t), this._normalizeCornerRadius(t), this._normalizeStroke(t);
    const { fillGeometry: s, strokeGeometry: i, fills: a } = t;
    return K(s) && s.forEach((o) => this._normalizeGeometry(o)), K(i) && i.forEach((o) => this._normalizeGeometry(o)), K(a) && a.forEach((o) => this._normalizeFill(o)), n === "BOOLEAN_OPERATION" && (t.relativeTransform = dr), n === "POLYGON" && (t.type = "REGULAR_POLYGON"), n === "GROUP" && this._normalizeGroup(t), n === "TEXT" && this._normalizeText(t), r && this._normalizeTopLayerTransform(t), K(t.children) && t.children.forEach((o) => this._normalizeLayer(o)), t;
  }
  normalize() {
    return this._normalizeLayer(this._raw, !0);
  }
}
function tg(e) {
  return /^[a-zA-Z0-9+/]*={0,2}$/.test(e);
}
function rg(e) {
  const { document: t, selectedContent: r, assets: n } = e.context ?? {};
  t != null && t.id || h == null || h.warn("Unknown document id", { source: e });
  const s = (t == null ? void 0 : t.id) ?? Le(), a = [{ event: "ready:design", data: { designId: s } }];
  if (n != null && n.images)
    for (const o in n.images) {
      const c = n.images[o];
      if (!c || !tg(c)) {
        h == null || h.error("Invalid image asset", { ref: o, data: c });
        continue;
      }
      const u = Sr(c);
      a.push({ event: "ready:fill", data: { designId: s, ref: o, buffer: u } });
    }
  for (const o of r ?? []) {
    const c = o.id;
    if (!c)
      continue;
    const u = new eg(o).normalize(), l = { designId: s, nodeId: c, node: { document: u } };
    a.push({ event: "ready:artboard", data: l });
  }
  return a;
}
class ng extends $n {
  constructor(t) {
    super(), this._sourceData = t, this._finalizeDesign = fe(), this._emitOnReady();
  }
  async _preprocessFillSizes(t) {
    for (const r of t)
      r.event === "ready:fill" && (r.data.size = await Ar(r.data.buffer));
  }
  async _emitOnReady() {
    const t = rg(this._sourceData);
    await this._preprocessFillSizes(t);
    for (const r of t)
      r.event === "ready:design" && (r.data.content = this._finalizeDesign.promise), queueMicrotask(() => this.emit(r.event, r.data));
    this._finalizeDesign.resolve();
  }
}
class hg {
  /**
   * Creates SourcePluginReader that can parse given Source from Squid Plugin and provide them through `EventEmitter` calls.
   * @constructor
   * @param {PluginSource} pluginSource Source generated from Squid Plugin
   */
  constructor(t) {
    this._pluginSource = t;
  }
  /**
   * Returns `EventEmitter` which is needed in OctopusFigConverter.
   * @returns {EventEmitter} returns `EventEmitter` providing source data to the OctopusFigConverter
   */
  parse() {
    return new ng(this._pluginSource);
  }
}
function fg(e) {
  return new ud({
    ...e,
    platformFactories: {
      createLoggerFactory: fd,
      createBenchmarkService: () => ({ benchmarkAsync: gr }),
      createImageSizeService: () => hd,
      createBufferService: () => ({ base64ToUint8Array: ld })
    }
  });
}
export {
  lg as SourceApiReader,
  hg as SourcePluginReader,
  fg as createConverter
};
