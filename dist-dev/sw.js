/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@dfinity/agent/lib/esm/actor.js":
/*!******************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/actor.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Actor": () => (/* binding */ Actor),
/* harmony export */   "ActorCallError": () => (/* binding */ ActorCallError),
/* harmony export */   "CanisterInstallMode": () => (/* binding */ CanisterInstallMode),
/* harmony export */   "QueryCallRejectedError": () => (/* binding */ QueryCallRejectedError),
/* harmony export */   "UpdateCallRejectedError": () => (/* binding */ UpdateCallRejectedError)
/* harmony export */ });
/* harmony import */ var buffer___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! buffer/ */ "./node_modules/buffer/index.js");
/* harmony import */ var _agent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./agent */ "./node_modules/@dfinity/agent/lib/esm/agent/index.js");
/* harmony import */ var _canisters_management__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./canisters/management */ "./node_modules/@dfinity/agent/lib/esm/canisters/management.js");
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./errors */ "./node_modules/@dfinity/agent/lib/esm/errors.js");
/* harmony import */ var _dfinity_candid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @dfinity/candid */ "./node_modules/@dfinity/candid/lib/esm/index.js");
/* harmony import */ var _polling__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./polling */ "./node_modules/@dfinity/agent/lib/esm/polling/index.js");
/* harmony import */ var _dfinity_principal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @dfinity/principal */ "./node_modules/@dfinity/principal/lib/esm/index.js");
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils/buffer */ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js");








class ActorCallError extends _errors__WEBPACK_IMPORTED_MODULE_3__.AgentError {
    constructor(canisterId, methodName, type, props) {
        super([
            `Call failed:`,
            `  Canister: ${canisterId.toText()}`,
            `  Method: ${methodName} (${type})`,
            ...Object.getOwnPropertyNames(props).map(n => `  "${n}": ${JSON.stringify(props[n])}`),
        ].join('\n'));
        this.canisterId = canisterId;
        this.methodName = methodName;
        this.type = type;
        this.props = props;
    }
}
class QueryCallRejectedError extends ActorCallError {
    constructor(canisterId, methodName, result) {
        var _a;
        super(canisterId, methodName, 'query', {
            Status: result.status,
            Code: (_a = _agent__WEBPACK_IMPORTED_MODULE_1__.ReplicaRejectCode[result.reject_code]) !== null && _a !== void 0 ? _a : `Unknown Code "${result.reject_code}"`,
            Message: result.reject_message,
        });
        this.result = result;
    }
}
class UpdateCallRejectedError extends ActorCallError {
    constructor(canisterId, methodName, requestId, response) {
        super(canisterId, methodName, 'update', {
            'Request ID': (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_7__.toHex)(requestId),
            'HTTP status code': response.status.toString(),
            'HTTP status text': response.statusText,
        });
        this.requestId = requestId;
        this.response = response;
    }
}
/**
 * The mode used when installing a canister.
 */
var CanisterInstallMode;
(function (CanisterInstallMode) {
    CanisterInstallMode["Install"] = "install";
    CanisterInstallMode["Reinstall"] = "reinstall";
    CanisterInstallMode["Upgrade"] = "upgrade";
})(CanisterInstallMode || (CanisterInstallMode = {}));
const metadataSymbol = Symbol.for('ic-agent-metadata');
/**
 * An actor base class. An actor is an object containing only functions that will
 * return a promise. These functions are derived from the IDL definition.
 */
class Actor {
    constructor(metadata) {
        this[metadataSymbol] = Object.freeze(metadata);
    }
    /**
     * Get the Agent class this Actor would call, or undefined if the Actor would use
     * the default agent (global.ic.agent).
     * @param actor The actor to get the agent of.
     */
    static agentOf(actor) {
        return actor[metadataSymbol].config.agent;
    }
    /**
     * Get the interface of an actor, in the form of an instance of a Service.
     * @param actor The actor to get the interface of.
     */
    static interfaceOf(actor) {
        return actor[metadataSymbol].service;
    }
    static canisterIdOf(actor) {
        return _dfinity_principal__WEBPACK_IMPORTED_MODULE_6__.Principal.from(actor[metadataSymbol].config.canisterId);
    }
    static async install(fields, config) {
        const mode = fields.mode === undefined ? CanisterInstallMode.Install : fields.mode;
        // Need to transform the arg into a number array.
        const arg = fields.arg ? [...new Uint8Array(fields.arg)] : [];
        // Same for module.
        const wasmModule = [...new Uint8Array(fields.module)];
        const canisterId = typeof config.canisterId === 'string'
            ? _dfinity_principal__WEBPACK_IMPORTED_MODULE_6__.Principal.fromText(config.canisterId)
            : config.canisterId;
        await (0,_canisters_management__WEBPACK_IMPORTED_MODULE_2__.getManagementCanister)(config).install_code({
            mode: { [mode]: null },
            arg,
            wasm_module: wasmModule,
            canister_id: canisterId,
        });
    }
    static async createCanister(config) {
        const { canister_id: canisterId } = await (0,_canisters_management__WEBPACK_IMPORTED_MODULE_2__.getManagementCanister)(config || {}).provisional_create_canister_with_cycles({ amount: [], settings: [] });
        return canisterId;
    }
    static async createAndInstallCanister(interfaceFactory, fields, config) {
        const canisterId = await this.createCanister(config);
        await this.install(Object.assign({}, fields), Object.assign(Object.assign({}, config), { canisterId }));
        return this.createActor(interfaceFactory, Object.assign(Object.assign({}, config), { canisterId }));
    }
    static createActorClass(interfaceFactory) {
        const service = interfaceFactory({ IDL: _dfinity_candid__WEBPACK_IMPORTED_MODULE_4__.IDL });
        class CanisterActor extends Actor {
            constructor(config) {
                const canisterId = typeof config.canisterId === 'string'
                    ? _dfinity_principal__WEBPACK_IMPORTED_MODULE_6__.Principal.fromText(config.canisterId)
                    : config.canisterId;
                super({
                    config: Object.assign(Object.assign(Object.assign({}, DEFAULT_ACTOR_CONFIG), config), { canisterId }),
                    service,
                });
                for (const [methodName, func] of service._fields) {
                    this[methodName] = _createActorMethod(this, methodName, func);
                }
            }
        }
        return CanisterActor;
    }
    static createActor(interfaceFactory, configuration) {
        return new (this.createActorClass(interfaceFactory))(configuration);
    }
}
// IDL functions can have multiple return values, so decoding always
// produces an array. Ensure that functions with single or zero return
// values behave as expected.
function decodeReturnValue(types, msg) {
    const returnValues = _dfinity_candid__WEBPACK_IMPORTED_MODULE_4__.IDL.decode(types, buffer___WEBPACK_IMPORTED_MODULE_0__.Buffer.from(msg));
    switch (returnValues.length) {
        case 0:
            return undefined;
        case 1:
            return returnValues[0];
        default:
            return returnValues;
    }
}
const DEFAULT_ACTOR_CONFIG = {
    pollingStrategyFactory: _polling__WEBPACK_IMPORTED_MODULE_5__.strategy.defaultStrategy,
};
function _createActorMethod(actor, methodName, func) {
    let caller;
    if (func.annotations.includes('query')) {
        caller = async (options, ...args) => {
            var _a, _b;
            // First, if there's a config transformation, call it.
            options = Object.assign(Object.assign({}, options), (_b = (_a = actor[metadataSymbol].config).queryTransform) === null || _b === void 0 ? void 0 : _b.call(_a, methodName, args, Object.assign(Object.assign({}, actor[metadataSymbol].config), options)));
            const agent = options.agent || actor[metadataSymbol].config.agent || (0,_agent__WEBPACK_IMPORTED_MODULE_1__.getDefaultAgent)();
            const cid = _dfinity_principal__WEBPACK_IMPORTED_MODULE_6__.Principal.from(options.canisterId || actor[metadataSymbol].config.canisterId);
            const arg = _dfinity_candid__WEBPACK_IMPORTED_MODULE_4__.IDL.encode(func.argTypes, args);
            const result = await agent.query(cid, { methodName, arg });
            switch (result.status) {
                case "rejected" /* Rejected */:
                    throw new QueryCallRejectedError(cid, methodName, result);
                case "replied" /* Replied */:
                    return decodeReturnValue(func.retTypes, result.reply.arg);
            }
        };
    }
    else {
        caller = async (options, ...args) => {
            var _a, _b;
            // First, if there's a config transformation, call it.
            options = Object.assign(Object.assign({}, options), (_b = (_a = actor[metadataSymbol].config).callTransform) === null || _b === void 0 ? void 0 : _b.call(_a, methodName, args, Object.assign(Object.assign({}, actor[metadataSymbol].config), options)));
            const agent = options.agent || actor[metadataSymbol].config.agent || (0,_agent__WEBPACK_IMPORTED_MODULE_1__.getDefaultAgent)();
            const { canisterId, effectiveCanisterId, pollingStrategyFactory } = Object.assign(Object.assign(Object.assign({}, DEFAULT_ACTOR_CONFIG), actor[metadataSymbol].config), options);
            const cid = _dfinity_principal__WEBPACK_IMPORTED_MODULE_6__.Principal.from(canisterId);
            const ecid = effectiveCanisterId !== undefined ? _dfinity_principal__WEBPACK_IMPORTED_MODULE_6__.Principal.from(effectiveCanisterId) : cid;
            const arg = _dfinity_candid__WEBPACK_IMPORTED_MODULE_4__.IDL.encode(func.argTypes, args);
            const { requestId, response } = await agent.call(cid, {
                methodName,
                arg,
                effectiveCanisterId: ecid,
            });
            if (!response.ok) {
                throw new UpdateCallRejectedError(cid, methodName, requestId, response);
            }
            const pollStrategy = pollingStrategyFactory();
            const responseBytes = await (0,_polling__WEBPACK_IMPORTED_MODULE_5__.pollForResponse)(agent, ecid, requestId, pollStrategy);
            if (responseBytes !== undefined) {
                return decodeReturnValue(func.retTypes, responseBytes);
            }
            else if (func.retTypes.length === 0) {
                return undefined;
            }
            else {
                throw new Error(`Call was returned undefined, but type [${func.retTypes.join(',')}].`);
            }
        };
    }
    const handler = (...args) => caller({}, ...args);
    handler.withOptions =
        (options) => (...args) => caller(options, ...args);
    return handler;
}
//# sourceMappingURL=actor.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/agent/api.js":
/*!**********************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/agent/api.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ReplicaRejectCode": () => (/* binding */ ReplicaRejectCode)
/* harmony export */ });
/**
 * Codes used by the replica for rejecting a message.
 * See {@link https://sdk.dfinity.org/docs/interface-spec/#reject-codes | the interface spec}.
 */
var ReplicaRejectCode;
(function (ReplicaRejectCode) {
    ReplicaRejectCode[ReplicaRejectCode["SysFatal"] = 1] = "SysFatal";
    ReplicaRejectCode[ReplicaRejectCode["SysTransient"] = 2] = "SysTransient";
    ReplicaRejectCode[ReplicaRejectCode["DestinationInvalid"] = 3] = "DestinationInvalid";
    ReplicaRejectCode[ReplicaRejectCode["CanisterReject"] = 4] = "CanisterReject";
    ReplicaRejectCode[ReplicaRejectCode["CanisterError"] = 5] = "CanisterError";
})(ReplicaRejectCode || (ReplicaRejectCode = {}));
//# sourceMappingURL=api.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/agent/http/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/agent/http/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Expiry": () => (/* reexport safe */ _transforms__WEBPACK_IMPORTED_MODULE_6__.Expiry),
/* harmony export */   "HttpAgent": () => (/* binding */ HttpAgent),
/* harmony export */   "IdentityInvalidError": () => (/* binding */ IdentityInvalidError),
/* harmony export */   "RequestStatusResponseStatus": () => (/* binding */ RequestStatusResponseStatus),
/* harmony export */   "makeExpiryTransform": () => (/* reexport safe */ _transforms__WEBPACK_IMPORTED_MODULE_6__.makeExpiryTransform),
/* harmony export */   "makeNonce": () => (/* reexport safe */ _types__WEBPACK_IMPORTED_MODULE_7__.makeNonce),
/* harmony export */   "makeNonceTransform": () => (/* reexport safe */ _transforms__WEBPACK_IMPORTED_MODULE_6__.makeNonceTransform)
/* harmony export */ });
/* harmony import */ var _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/principal */ "./node_modules/@dfinity/principal/lib/esm/index.js");
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../errors */ "./node_modules/@dfinity/agent/lib/esm/errors.js");
/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../auth */ "./node_modules/@dfinity/agent/lib/esm/auth.js");
/* harmony import */ var _cbor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../cbor */ "./node_modules/@dfinity/agent/lib/esm/cbor.js");
/* harmony import */ var _request_id__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../request_id */ "./node_modules/@dfinity/agent/lib/esm/request_id.js");
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/buffer */ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js");
/* harmony import */ var _transforms__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./transforms */ "./node_modules/@dfinity/agent/lib/esm/agent/http/transforms.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./types */ "./node_modules/@dfinity/agent/lib/esm/agent/http/types.js");










var RequestStatusResponseStatus;
(function (RequestStatusResponseStatus) {
    RequestStatusResponseStatus["Received"] = "received";
    RequestStatusResponseStatus["Processing"] = "processing";
    RequestStatusResponseStatus["Replied"] = "replied";
    RequestStatusResponseStatus["Rejected"] = "rejected";
    RequestStatusResponseStatus["Unknown"] = "unknown";
    RequestStatusResponseStatus["Done"] = "done";
})(RequestStatusResponseStatus || (RequestStatusResponseStatus = {}));
// Default delta for ingress expiry is 5 minutes.
const DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS = 5 * 60 * 1000;
// Root public key for the IC, encoded as hex
const IC_ROOT_KEY = '308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100814' +
    'c0e6ec71fab583b08bd81373c255c3c371b2e84863c98a4f1e08b74235d14fb5d9c0cd546d968' +
    '5f913a0c0b2cc5341583bf4b4392e467db96d65b9bb4cb717112f8472e0d5a4d14505ffd7484' +
    'b01291091c5f87b98883463f98091a0baaae';
// IC0 domain info
const IC0_DOMAIN = 'ic0.app';
const IC0_SUB_DOMAIN = '.ic0.app';
class HttpDefaultFetchError extends _errors__WEBPACK_IMPORTED_MODULE_1__.AgentError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
class IdentityInvalidError extends _errors__WEBPACK_IMPORTED_MODULE_1__.AgentError {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
function getDefaultFetch() {
    let defaultFetch;
    if (typeof window !== 'undefined') {
        // Browser context
        if (window.fetch) {
            defaultFetch = window.fetch.bind(window);
        }
        else {
            throw new HttpDefaultFetchError('Fetch implementation was not available. You appear to be in a browser context, but window.fetch was not present.');
        }
    }
    else if (typeof __webpack_require__.g !== 'undefined') {
        // Node context
        if (__webpack_require__.g.fetch) {
            defaultFetch = __webpack_require__.g.fetch.bind(__webpack_require__.g);
        }
        else {
            throw new HttpDefaultFetchError('Fetch implementation was not available. You appear to be in a Node.js context, but global.fetch was not available.');
        }
    }
    else if (typeof self !== 'undefined') {
        if (self.fetch) {
            defaultFetch = self.fetch.bind(self);
        }
    }
    if (defaultFetch) {
        return defaultFetch;
    }
    throw new HttpDefaultFetchError('Fetch implementation was not available. Please provide fetch to the HttpAgent constructor, or ensure it is available in the window or global context.');
}
// A HTTP agent allows users to interact with a client of the internet computer
// using the available methods. It exposes an API that closely follows the
// public view of the internet computer, and is not intended to be exposed
// directly to the majority of users due to its low-level interface.
//
// There is a pipeline to apply transformations to the request before sending
// it to the client. This is to decouple signature, nonce generation and
// other computations so that this class can stay as simple as possible while
// allowing extensions.
class HttpAgent {
    constructor(options = {}) {
        this.rootKey = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.fromHex)(IC_ROOT_KEY);
        this._pipeline = [];
        this._rootKeyFetched = false;
        if (options.source) {
            if (!(options.source instanceof HttpAgent)) {
                throw new Error("An Agent's source can only be another HttpAgent");
            }
            this._pipeline = [...options.source._pipeline];
            this._identity = options.source._identity;
            this._fetch = options.source._fetch;
            this._host = options.source._host;
            this._credentials = options.source._credentials;
        }
        else {
            this._fetch = options.fetch || getDefaultFetch() || fetch.bind(__webpack_require__.g);
        }
        if (options.host !== undefined) {
            if (!options.host.match(/^[a-z]+:/) && typeof window !== 'undefined') {
                this._host = new URL(window.location.protocol + '//' + options.host);
            }
            else {
                this._host = new URL(options.host);
            }
        }
        else if (options.source !== undefined) {
            // Safe to ignore here.
            this._host = options.source._host;
        }
        else {
            const location = typeof window !== 'undefined' ? window.location : undefined;
            if (!location) {
                throw new Error('Must specify a host to connect to.');
            }
            this._host = new URL(location + '');
        }
        // Rewrite to avoid redirects
        if (this._host.hostname.endsWith(IC0_SUB_DOMAIN)) {
            this._host.hostname = IC0_DOMAIN;
        }
        if (options.credentials) {
            const { name, password } = options.credentials;
            this._credentials = `${name}${password ? ':' + password : ''}`;
        }
        this._identity = Promise.resolve(options.identity || new _auth__WEBPACK_IMPORTED_MODULE_2__.AnonymousIdentity());
        // Add a nonce transform to ensure calls are unique
        if (!options.disableNonce) {
            this.addTransform((0,_transforms__WEBPACK_IMPORTED_MODULE_6__.makeNonceTransform)(_types__WEBPACK_IMPORTED_MODULE_7__.makeNonce));
        }
    }
    addTransform(fn, priority = fn.priority || 0) {
        // Keep the pipeline sorted at all time, by priority.
        const i = this._pipeline.findIndex(x => (x.priority || 0) < priority);
        this._pipeline.splice(i >= 0 ? i : this._pipeline.length, 0, Object.assign(fn, { priority }));
    }
    async getPrincipal() {
        if (!this._identity) {
            throw new IdentityInvalidError("This identity has expired due this application's security policy. Please refresh your authentication.");
        }
        return (await this._identity).getPrincipal();
    }
    async call(canisterId, options, identity) {
        const id = await (identity !== undefined ? await identity : await this._identity);
        if (!id) {
            throw new IdentityInvalidError("This identity has expired due this application's security policy. Please refresh your authentication.");
        }
        const canister = _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.from(canisterId);
        const ecid = options.effectiveCanisterId
            ? _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.from(options.effectiveCanisterId)
            : canister;
        const sender = id.getPrincipal() || _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.anonymous();
        const submit = {
            request_type: _types__WEBPACK_IMPORTED_MODULE_7__.SubmitRequestType.Call,
            canister_id: canister,
            method_name: options.methodName,
            arg: options.arg,
            sender,
            ingress_expiry: new _transforms__WEBPACK_IMPORTED_MODULE_6__.Expiry(DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let transformedRequest = (await this._transform({
            request: {
                body: null,
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/cbor' }, (this._credentials ? { Authorization: 'Basic ' + btoa(this._credentials) } : {})),
            },
            endpoint: "call" /* Call */,
            body: submit,
        }));
        // Apply transform for identity.
        transformedRequest = await id.transformRequest(transformedRequest);
        const body = _cbor__WEBPACK_IMPORTED_MODULE_3__.encode(transformedRequest.body);
        // Run both in parallel. The fetch is quite expensive, so we have plenty of time to
        // calculate the requestId locally.
        const [response, requestId] = await Promise.all([
            this._fetch('' + new URL(`/api/v2/canister/${ecid.toText()}/call`, this._host), Object.assign(Object.assign({}, transformedRequest.request), { body })),
            (0,_request_id__WEBPACK_IMPORTED_MODULE_4__.requestIdOf)(submit),
        ]);
        if (!response.ok) {
            throw new Error(`Server returned an error:\n` +
                `  Code: ${response.status} (${response.statusText})\n` +
                `  Body: ${await response.text()}\n`);
        }
        return {
            requestId,
            response: {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
            },
        };
    }
    async query(canisterId, fields, identity) {
        const id = await (identity !== undefined ? await identity : await this._identity);
        if (!id) {
            throw new IdentityInvalidError("This identity has expired due this application's security policy. Please refresh your authentication.");
        }
        const canister = typeof canisterId === 'string' ? _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.fromText(canisterId) : canisterId;
        const sender = (id === null || id === void 0 ? void 0 : id.getPrincipal()) || _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.anonymous();
        const request = {
            request_type: "query" /* Query */,
            canister_id: canister,
            method_name: fields.methodName,
            arg: fields.arg,
            sender,
            ingress_expiry: new _transforms__WEBPACK_IMPORTED_MODULE_6__.Expiry(DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS),
        };
        // TODO: remove this any. This can be a Signed or UnSigned request.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let transformedRequest = await this._transform({
            request: {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/cbor' }, (this._credentials ? { Authorization: 'Basic ' + btoa(this._credentials) } : {})),
            },
            endpoint: "read" /* Query */,
            body: request,
        });
        // Apply transform for identity.
        transformedRequest = await (id === null || id === void 0 ? void 0 : id.transformRequest(transformedRequest));
        const body = _cbor__WEBPACK_IMPORTED_MODULE_3__.encode(transformedRequest.body);
        const response = await this._fetch('' + new URL(`/api/v2/canister/${canister.toText()}/query`, this._host), Object.assign(Object.assign({}, transformedRequest.request), { body }));
        if (!response.ok) {
            throw new Error(`Server returned an error:\n` +
                `  Code: ${response.status} (${response.statusText})\n` +
                `  Body: ${await response.text()}\n`);
        }
        return _cbor__WEBPACK_IMPORTED_MODULE_3__.decode(await response.arrayBuffer());
    }
    async readState(canisterId, fields, identity) {
        const canister = typeof canisterId === 'string' ? _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.fromText(canisterId) : canisterId;
        const id = await (identity !== undefined ? await identity : await this._identity);
        if (!id) {
            throw new IdentityInvalidError("This identity has expired due this application's security policy. Please refresh your authentication.");
        }
        const sender = (id === null || id === void 0 ? void 0 : id.getPrincipal()) || _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.anonymous();
        // TODO: remove this any. This can be a Signed or UnSigned request.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let transformedRequest = await this._transform({
            request: {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/cbor' }, (this._credentials ? { Authorization: 'Basic ' + btoa(this._credentials) } : {})),
            },
            endpoint: "read_state" /* ReadState */,
            body: {
                request_type: "read_state" /* ReadState */,
                paths: fields.paths,
                sender,
                ingress_expiry: new _transforms__WEBPACK_IMPORTED_MODULE_6__.Expiry(DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS),
            },
        });
        // Apply transform for identity.
        transformedRequest = await (id === null || id === void 0 ? void 0 : id.transformRequest(transformedRequest));
        const body = _cbor__WEBPACK_IMPORTED_MODULE_3__.encode(transformedRequest.body);
        const response = await this._fetch('' + new URL(`/api/v2/canister/${canister}/read_state`, this._host), Object.assign(Object.assign({}, transformedRequest.request), { body }));
        if (!response.ok) {
            throw new Error(`Server returned an error:\n` +
                `  Code: ${response.status} (${response.statusText})\n` +
                `  Body: ${await response.text()}\n`);
        }
        return _cbor__WEBPACK_IMPORTED_MODULE_3__.decode(await response.arrayBuffer());
    }
    async status() {
        const headers = this._credentials
            ? {
                Authorization: 'Basic ' + btoa(this._credentials),
            }
            : {};
        const response = await this._fetch('' + new URL(`/api/v2/status`, this._host), { headers });
        if (!response.ok) {
            throw new Error(`Server returned an error:\n` +
                `  Code: ${response.status} (${response.statusText})\n` +
                `  Body: ${await response.text()}\n`);
        }
        return _cbor__WEBPACK_IMPORTED_MODULE_3__.decode(await response.arrayBuffer());
    }
    async fetchRootKey() {
        if (!this._rootKeyFetched) {
            // Hex-encoded version of the replica root key
            this.rootKey = (await this.status()).root_key;
            this._rootKeyFetched = true;
        }
        return this.rootKey;
    }
    invalidateIdentity() {
        this._identity = null;
    }
    replaceIdentity(identity) {
        this._identity = Promise.resolve(identity);
    }
    _transform(request) {
        let p = Promise.resolve(request);
        for (const fn of this._pipeline) {
            p = p.then(r => fn(r).then(r2 => r2 || r));
        }
        return p;
    }
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/agent/http/transforms.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/agent/http/transforms.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Expiry": () => (/* binding */ Expiry),
/* harmony export */   "makeExpiryTransform": () => (/* binding */ makeExpiryTransform),
/* harmony export */   "makeNonceTransform": () => (/* binding */ makeNonceTransform)
/* harmony export */ });
/* harmony import */ var _dfinity_candid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/candid */ "./node_modules/@dfinity/candid/lib/esm/index.js");
/* harmony import */ var simple_cbor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! simple-cbor */ "./node_modules/simple-cbor/src/index.js");
/* harmony import */ var simple_cbor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(simple_cbor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./types */ "./node_modules/@dfinity/agent/lib/esm/agent/http/types.js");



const NANOSECONDS_PER_MILLISECONDS = BigInt(1000000);
const REPLICA_PERMITTED_DRIFT_MILLISECONDS = BigInt(60 * 1000);
class Expiry {
    constructor(deltaInMSec) {
        // Use bigint because it can overflow the maximum number allowed in a double float.
        this._value =
            (BigInt(Date.now()) + BigInt(deltaInMSec) - REPLICA_PERMITTED_DRIFT_MILLISECONDS) *
                NANOSECONDS_PER_MILLISECONDS;
    }
    toCBOR() {
        // TODO: change this to take the minimum amount of space (it always takes 8 bytes now).
        return simple_cbor__WEBPACK_IMPORTED_MODULE_1__.value.u64(this._value.toString(16), 16);
    }
    toHash() {
        return (0,_dfinity_candid__WEBPACK_IMPORTED_MODULE_0__.lebEncode)(this._value);
    }
}
/**
 * Create a Nonce transform, which takes a function that returns a Buffer, and adds it
 * as the nonce to every call requests.
 * @param nonceFn A function that returns a buffer. By default uses a semi-random method.
 */
function makeNonceTransform(nonceFn = _types__WEBPACK_IMPORTED_MODULE_2__.makeNonce) {
    return async (request) => {
        // Nonce are only useful for async calls, to prevent replay attacks. Other types of
        // calls don't need Nonce so we just skip creating one.
        if (request.endpoint === "call" /* Call */) {
            request.body.nonce = nonceFn();
        }
    };
}
/**
 * Create a transform that adds a delay (by default 5 minutes) to the expiry.
 *
 * @param delayInMilliseconds The delay to add to the call time, in milliseconds.
 */
function makeExpiryTransform(delayInMilliseconds) {
    return async (request) => {
        request.body.ingress_expiry = new Expiry(delayInMilliseconds);
    };
}
//# sourceMappingURL=transforms.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/agent/http/types.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/agent/http/types.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SubmitRequestType": () => (/* binding */ SubmitRequestType),
/* harmony export */   "makeNonce": () => (/* binding */ makeNonce)
/* harmony export */ });
// tslint:enable:camel-case
// The types of values allowed in the `request_type` field for submit requests.
var SubmitRequestType;
(function (SubmitRequestType) {
    SubmitRequestType["Call"] = "call";
})(SubmitRequestType || (SubmitRequestType = {}));
/**
 * Create a random Nonce, based on date and a random suffix.
 */
function makeNonce() {
    // Encode 128 bits.
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    const now = BigInt(+Date.now());
    const randHi = Math.floor(Math.random() * 0xffffffff);
    const randLo = Math.floor(Math.random() * 0xffffffff);
    view.setBigUint64(0, now);
    view.setUint32(8, randHi);
    view.setUint32(12, randLo);
    return buffer;
}
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/agent/index.js":
/*!************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/agent/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Expiry": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_1__.Expiry),
/* harmony export */   "HttpAgent": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_1__.HttpAgent),
/* harmony export */   "IdentityInvalidError": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_1__.IdentityInvalidError),
/* harmony export */   "ProxyAgent": () => (/* reexport safe */ _proxy__WEBPACK_IMPORTED_MODULE_2__.ProxyAgent),
/* harmony export */   "ProxyMessageKind": () => (/* reexport safe */ _proxy__WEBPACK_IMPORTED_MODULE_2__.ProxyMessageKind),
/* harmony export */   "ProxyStubAgent": () => (/* reexport safe */ _proxy__WEBPACK_IMPORTED_MODULE_2__.ProxyStubAgent),
/* harmony export */   "ReplicaRejectCode": () => (/* reexport safe */ _api__WEBPACK_IMPORTED_MODULE_0__.ReplicaRejectCode),
/* harmony export */   "RequestStatusResponseStatus": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_1__.RequestStatusResponseStatus),
/* harmony export */   "getDefaultAgent": () => (/* binding */ getDefaultAgent),
/* harmony export */   "makeExpiryTransform": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_1__.makeExpiryTransform),
/* harmony export */   "makeNonce": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_1__.makeNonce),
/* harmony export */   "makeNonceTransform": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_1__.makeNonceTransform)
/* harmony export */ });
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./api */ "./node_modules/@dfinity/agent/lib/esm/agent/api.js");
/* harmony import */ var _http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./http */ "./node_modules/@dfinity/agent/lib/esm/agent/http/index.js");
/* harmony import */ var _proxy__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./proxy */ "./node_modules/@dfinity/agent/lib/esm/agent/proxy.js");



function getDefaultAgent() {
    const agent = typeof window === 'undefined'
        ? typeof __webpack_require__.g === 'undefined'
            ? typeof self === 'undefined'
                ? undefined
                : self.ic.agent
            : __webpack_require__.g.ic.agent
        : window.ic.agent;
    if (!agent) {
        throw new Error('No Agent could be found.');
    }
    return agent;
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/agent/proxy.js":
/*!************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/agent/proxy.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProxyAgent": () => (/* binding */ ProxyAgent),
/* harmony export */   "ProxyMessageKind": () => (/* binding */ ProxyMessageKind),
/* harmony export */   "ProxyStubAgent": () => (/* binding */ ProxyStubAgent)
/* harmony export */ });
/* harmony import */ var _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/principal */ "./node_modules/@dfinity/principal/lib/esm/index.js");

var ProxyMessageKind;
(function (ProxyMessageKind) {
    ProxyMessageKind["Error"] = "err";
    ProxyMessageKind["GetPrincipal"] = "gp";
    ProxyMessageKind["GetPrincipalResponse"] = "gpr";
    ProxyMessageKind["Query"] = "q";
    ProxyMessageKind["QueryResponse"] = "qr";
    ProxyMessageKind["Call"] = "c";
    ProxyMessageKind["CallResponse"] = "cr";
    ProxyMessageKind["ReadState"] = "rs";
    ProxyMessageKind["ReadStateResponse"] = "rsr";
    ProxyMessageKind["Status"] = "s";
    ProxyMessageKind["StatusResponse"] = "sr";
})(ProxyMessageKind || (ProxyMessageKind = {}));
// A Stub Agent that forwards calls to another Agent implementation.
class ProxyStubAgent {
    constructor(_frontend, _agent) {
        this._frontend = _frontend;
        this._agent = _agent;
    }
    onmessage(msg) {
        switch (msg.type) {
            case ProxyMessageKind.GetPrincipal:
                this._agent.getPrincipal().then(response => {
                    this._frontend({
                        id: msg.id,
                        type: ProxyMessageKind.GetPrincipalResponse,
                        response: response.toText(),
                    });
                });
                break;
            case ProxyMessageKind.Query:
                this._agent.query(...msg.args).then(response => {
                    this._frontend({
                        id: msg.id,
                        type: ProxyMessageKind.QueryResponse,
                        response,
                    });
                });
                break;
            case ProxyMessageKind.Call:
                this._agent.call(...msg.args).then(response => {
                    this._frontend({
                        id: msg.id,
                        type: ProxyMessageKind.CallResponse,
                        response,
                    });
                });
                break;
            case ProxyMessageKind.ReadState:
                this._agent.readState(...msg.args).then(response => {
                    this._frontend({
                        id: msg.id,
                        type: ProxyMessageKind.ReadStateResponse,
                        response,
                    });
                });
                break;
            case ProxyMessageKind.Status:
                this._agent.status().then(response => {
                    this._frontend({
                        id: msg.id,
                        type: ProxyMessageKind.StatusResponse,
                        response,
                    });
                });
                break;
            default:
                throw new Error(`Invalid message received: ${JSON.stringify(msg)}`);
        }
    }
}
// An Agent that forwards calls to a backend. The calls are serialized
class ProxyAgent {
    constructor(_backend) {
        this._backend = _backend;
        this._nextId = 0;
        this._pendingCalls = new Map();
        this.rootKey = null;
    }
    onmessage(msg) {
        const id = msg.id;
        const maybePromise = this._pendingCalls.get(id);
        if (!maybePromise) {
            throw new Error('A proxy get the same message twice...');
        }
        this._pendingCalls.delete(id);
        const [resolve, reject] = maybePromise;
        switch (msg.type) {
            case ProxyMessageKind.Error:
                return reject(msg.error);
            case ProxyMessageKind.GetPrincipalResponse:
            case ProxyMessageKind.CallResponse:
            case ProxyMessageKind.QueryResponse:
            case ProxyMessageKind.ReadStateResponse:
            case ProxyMessageKind.StatusResponse:
                return resolve(msg.response);
            default:
                throw new Error(`Invalid message being sent to ProxyAgent: ${JSON.stringify(msg)}`);
        }
    }
    async getPrincipal() {
        return this._sendAndWait({
            id: this._nextId++,
            type: ProxyMessageKind.GetPrincipal,
        }).then(principal => {
            if (typeof principal !== 'string') {
                throw new Error('Invalid principal received.');
            }
            return _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.fromText(principal);
        });
    }
    readState(canisterId, fields) {
        return this._sendAndWait({
            id: this._nextId++,
            type: ProxyMessageKind.ReadState,
            args: [canisterId.toString(), fields],
        });
    }
    call(canisterId, fields) {
        return this._sendAndWait({
            id: this._nextId++,
            type: ProxyMessageKind.Call,
            args: [canisterId.toString(), fields],
        });
    }
    status() {
        return this._sendAndWait({
            id: this._nextId++,
            type: ProxyMessageKind.Status,
        });
    }
    query(canisterId, fields) {
        return this._sendAndWait({
            id: this._nextId++,
            type: ProxyMessageKind.Query,
            args: [canisterId.toString(), fields],
        });
    }
    async _sendAndWait(msg) {
        return new Promise((resolve, reject) => {
            this._pendingCalls.set(msg.id, [resolve, reject]);
            this._backend(msg);
        });
    }
    async fetchRootKey() {
        // Hex-encoded version of the replica root key
        const rootKey = (await this.status()).root_key;
        this.rootKey = rootKey;
        return rootKey;
    }
}
//# sourceMappingURL=proxy.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/auth.js":
/*!*****************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/auth.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AnonymousIdentity": () => (/* binding */ AnonymousIdentity),
/* harmony export */   "SignIdentity": () => (/* binding */ SignIdentity),
/* harmony export */   "createIdentityDescriptor": () => (/* binding */ createIdentityDescriptor)
/* harmony export */ });
/* harmony import */ var _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/principal */ "./node_modules/@dfinity/principal/lib/esm/index.js");
/* harmony import */ var _request_id__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./request_id */ "./node_modules/@dfinity/agent/lib/esm/request_id.js");
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/buffer */ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js");
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};



const domainSeparator = new TextEncoder().encode('\x0Aic-request');
/**
 * An Identity that can sign blobs.
 */
class SignIdentity {
    /**
     * Get the principal represented by this identity. Normally should be a
     * `Principal.selfAuthenticating()`.
     */
    getPrincipal() {
        if (!this._principal) {
            this._principal = _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.selfAuthenticating(new Uint8Array(this.getPublicKey().toDer()));
        }
        return this._principal;
    }
    /**
     * Transform a request into a signed version of the request. This is done last
     * after the transforms on the body of a request. The returned object can be
     * anything, but must be serializable to CBOR.
     * @param request - internet computer request to transform
     */
    async transformRequest(request) {
        const { body } = request, fields = __rest(request, ["body"]);
        const requestId = await (0,_request_id__WEBPACK_IMPORTED_MODULE_1__.requestIdOf)(body);
        return Object.assign(Object.assign({}, fields), { body: {
                content: body,
                sender_pubkey: this.getPublicKey().toDer(),
                sender_sig: await this.sign((0,_utils_buffer__WEBPACK_IMPORTED_MODULE_2__.concat)(domainSeparator, requestId)),
            } });
    }
}
class AnonymousIdentity {
    getPrincipal() {
        return _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.anonymous();
    }
    async transformRequest(request) {
        return Object.assign(Object.assign({}, request), { body: { content: request.body } });
    }
}
/**
 * Create an IdentityDescriptor from a @dfinity/authentication Identity
 * @param identity - identity describe in returned descriptor
 */
function createIdentityDescriptor(identity) {
    const identityIndicator = 'getPublicKey' in identity
        ? { type: 'PublicKeyIdentity', publicKey: (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_2__.toHex)(identity.getPublicKey().toDer()) }
        : { type: 'AnonymousIdentity' };
    return identityIndicator;
}
//# sourceMappingURL=auth.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/canisters/asset.js":
/*!****************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/canisters/asset.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createAssetCanisterActor": () => (/* binding */ createAssetCanisterActor)
/* harmony export */ });
/* harmony import */ var _actor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actor */ "./node_modules/@dfinity/agent/lib/esm/actor.js");
/* harmony import */ var _asset_idl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./asset_idl */ "./node_modules/@dfinity/agent/lib/esm/canisters/asset_idl.js");


/* tslint:enable */
/**
 * Create a management canister actor.
 * @param config
 */
function createAssetCanisterActor(config) {
    return _actor__WEBPACK_IMPORTED_MODULE_0__.Actor.createActor(_asset_idl__WEBPACK_IMPORTED_MODULE_1__["default"], config);
}
//# sourceMappingURL=asset.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/canisters/asset_idl.js":
/*!********************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/canisters/asset_idl.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * This file is generated from the candid for asset management.
 */
/* tslint:disable */
// @ts-ignore
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (({ IDL }) => {
    return IDL.Service({
        retrieve: IDL.Func([IDL.Text], [IDL.Vec(IDL.Nat8)], ['query']),
        store: IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
    });
});
//# sourceMappingURL=asset_idl.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/canisters/management.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/canisters/management.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getManagementCanister": () => (/* binding */ getManagementCanister)
/* harmony export */ });
/* harmony import */ var _actor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actor */ "./node_modules/@dfinity/agent/lib/esm/actor.js");
/* harmony import */ var _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dfinity/principal */ "./node_modules/@dfinity/principal/lib/esm/index.js");
/* harmony import */ var _management_idl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./management_idl */ "./node_modules/@dfinity/agent/lib/esm/canisters/management_idl.js");



/**
 * Create a management canister actor
 * @param config
 */
function getManagementCanister(config) {
    function transform(_methodName, args, _callConfig) {
        const first = args[0];
        let effectiveCanisterId = _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.fromHex('');
        if (first && typeof first === 'object' && first.canister_id) {
            effectiveCanisterId = _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.from(first.canister_id);
        }
        return { effectiveCanisterId };
    }
    return _actor__WEBPACK_IMPORTED_MODULE_0__.Actor.createActor(_management_idl__WEBPACK_IMPORTED_MODULE_2__["default"], Object.assign(Object.assign(Object.assign({}, config), { canisterId: _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.fromHex('') }), {
        callTransform: transform,
        queryTransform: transform,
    }));
}
//# sourceMappingURL=management.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/canisters/management_idl.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/canisters/management_idl.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * This file is generated from the candid for asset management.
 */
/* tslint:disable */
// @ts-ignore
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (({ IDL }) => {
    const canister_id = IDL.Principal;
    const definite_canister_settings = IDL.Record({
        controllers: IDL.Vec(IDL.Principal),
        freezing_threshold: IDL.Nat,
        memory_allocation: IDL.Nat,
        compute_allocation: IDL.Nat,
    });
    const canister_settings = IDL.Record({
        controllers: IDL.Opt(IDL.Vec(IDL.Principal)),
        freezing_threshold: IDL.Opt(IDL.Nat),
        memory_allocation: IDL.Opt(IDL.Nat),
        compute_allocation: IDL.Opt(IDL.Nat),
    });
    const wasm_module = IDL.Vec(IDL.Nat8);
    return IDL.Service({
        canister_status: IDL.Func([IDL.Record({ canister_id: canister_id })], [
            IDL.Record({
                status: IDL.Variant({
                    stopped: IDL.Null,
                    stopping: IDL.Null,
                    running: IDL.Null,
                }),
                memory_size: IDL.Nat,
                cycles: IDL.Nat,
                settings: definite_canister_settings,
                module_hash: IDL.Opt(IDL.Vec(IDL.Nat8)),
            }),
        ], []),
        create_canister: IDL.Func([IDL.Record({ settings: IDL.Opt(canister_settings) })], [IDL.Record({ canister_id: canister_id })], []),
        delete_canister: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
        deposit_cycles: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
        install_code: IDL.Func([
            IDL.Record({
                arg: IDL.Vec(IDL.Nat8),
                wasm_module: wasm_module,
                mode: IDL.Variant({
                    reinstall: IDL.Null,
                    upgrade: IDL.Null,
                    install: IDL.Null,
                }),
                canister_id: canister_id,
            }),
        ], [], []),
        provisional_create_canister_with_cycles: IDL.Func([
            IDL.Record({
                settings: IDL.Opt(canister_settings),
                amount: IDL.Opt(IDL.Nat),
            }),
        ], [IDL.Record({ canister_id: canister_id })], []),
        provisional_top_up_canister: IDL.Func([IDL.Record({ canister_id: canister_id, amount: IDL.Nat })], [], []),
        raw_rand: IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
        start_canister: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
        stop_canister: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
        uninstall_code: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
        update_settings: IDL.Func([
            IDL.Record({
                canister_id: IDL.Principal,
                settings: canister_settings,
            }),
        ], [], []),
    });
});
//# sourceMappingURL=management_idl.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/cbor.js":
/*!*****************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/cbor.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CborTag": () => (/* binding */ CborTag),
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode)
/* harmony export */ });
/* harmony import */ var borc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! borc */ "./node_modules/borc/src/index.js");
/* harmony import */ var simple_cbor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! simple-cbor */ "./node_modules/simple-cbor/src/index.js");
/* harmony import */ var simple_cbor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(simple_cbor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/buffer */ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js");
// tslint:disable:max-classes-per-file
// This file is based on:
// tslint:disable-next-line: max-line-length
// https://github.com/dfinity-lab/dfinity/blob/9bca65f8edd65701ea6bdb00e0752f9186bbc893/docs/spec/public/index.adoc#cbor-encoding-of-requests-and-responses




// We are using hansl/simple-cbor for CBOR serialization, to avoid issues with
// encoding the uint64 values that the HTTP handler of the client expects for
// canister IDs. However, simple-cbor does not yet provide deserialization so
// we are using `Uint8Array` so that we can use the dignifiedquire/borc CBOR
// decoder.
class PrincipalEncoder {
    get name() {
        return 'Principal';
    }
    get priority() {
        return 0;
    }
    match(value) {
        return value && value._isPrincipal === true;
    }
    encode(v) {
        return simple_cbor__WEBPACK_IMPORTED_MODULE_1__.value.bytes(v.toUint8Array());
    }
}
class BufferEncoder {
    get name() {
        return 'Buffer';
    }
    get priority() {
        return 1;
    }
    match(value) {
        return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
    }
    encode(v) {
        return simple_cbor__WEBPACK_IMPORTED_MODULE_1__.value.bytes(new Uint8Array(v));
    }
}
class BigIntEncoder {
    get name() {
        return 'BigInt';
    }
    get priority() {
        return 1;
    }
    match(value) {
        return typeof value === `bigint`;
    }
    encode(v) {
        // Always use a bigint encoding.
        if (v > BigInt(0)) {
            return simple_cbor__WEBPACK_IMPORTED_MODULE_1__.value.tagged(2, simple_cbor__WEBPACK_IMPORTED_MODULE_1__.value.bytes((0,_utils_buffer__WEBPACK_IMPORTED_MODULE_2__.fromHex)(v.toString(16))));
        }
        else {
            return simple_cbor__WEBPACK_IMPORTED_MODULE_1__.value.tagged(3, simple_cbor__WEBPACK_IMPORTED_MODULE_1__.value.bytes((0,_utils_buffer__WEBPACK_IMPORTED_MODULE_2__.fromHex)((BigInt('-1') * v).toString(16))));
        }
    }
}
const serializer = simple_cbor__WEBPACK_IMPORTED_MODULE_1__.SelfDescribeCborSerializer.withDefaultEncoders(true);
serializer.addEncoder(new PrincipalEncoder());
serializer.addEncoder(new BufferEncoder());
serializer.addEncoder(new BigIntEncoder());
var CborTag;
(function (CborTag) {
    CborTag[CborTag["Uint64LittleEndian"] = 71] = "Uint64LittleEndian";
    CborTag[CborTag["Semantic"] = 55799] = "Semantic";
})(CborTag || (CborTag = {}));
/**
 * Encode a JavaScript value into CBOR.
 */
function encode(value) {
    return serializer.serialize(value);
}
function decodePositiveBigInt(buf) {
    const len = buf.byteLength;
    let res = BigInt(0);
    for (let i = 0; i < len; i++) {
        // tslint:disable-next-line:no-bitwise
        res = res * BigInt(0x100) + BigInt(buf[i]);
    }
    return res;
}
// A BORC subclass that decodes byte strings to ArrayBuffer instead of the Buffer class.
class Uint8ArrayDecoder extends borc__WEBPACK_IMPORTED_MODULE_0__.Decoder {
    createByteString(raw) {
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_2__.concat)(...raw);
    }
    createByteStringFromHeap(start, end) {
        if (start === end) {
            return new ArrayBuffer(0);
        }
        return new Uint8Array(this._heap.slice(start, end));
    }
}
function decode(input) {
    const buffer = new Uint8Array(input);
    const decoder = new Uint8ArrayDecoder({
        size: buffer.byteLength,
        tags: {
            // Override tags 2 and 3 for BigInt support (borc supports only BigNumber).
            2: val => decodePositiveBigInt(val),
            3: val => -decodePositiveBigInt(val),
            [CborTag.Semantic]: (value) => value,
        },
    });
    return decoder.decodeFirst(buffer);
}
//# sourceMappingURL=cbor.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/certificate.js":
/*!************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/certificate.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Certificate": () => (/* binding */ Certificate),
/* harmony export */   "UnverifiedCertificateError": () => (/* binding */ UnverifiedCertificateError),
/* harmony export */   "hashTreeToString": () => (/* binding */ hashTreeToString),
/* harmony export */   "lookup_path": () => (/* binding */ lookup_path),
/* harmony export */   "reconstruct": () => (/* binding */ reconstruct)
/* harmony export */ });
/* harmony import */ var _agent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./agent */ "./node_modules/@dfinity/agent/lib/esm/agent/index.js");
/* harmony import */ var _cbor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./cbor */ "./node_modules/@dfinity/agent/lib/esm/cbor.js");
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./errors */ "./node_modules/@dfinity/agent/lib/esm/errors.js");
/* harmony import */ var _request_id__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./request_id */ "./node_modules/@dfinity/agent/lib/esm/request_id.js");
/* harmony import */ var _utils_bls__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils/bls */ "./node_modules/@dfinity/agent/lib/esm/utils/bls.js");
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/buffer */ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js");






/**
 * A certificate needs to be verified (using {@link Certificate.prototype.verify})
 * before it can be used.
 */
class UnverifiedCertificateError extends _errors__WEBPACK_IMPORTED_MODULE_2__.AgentError {
    constructor() {
        super(`Cannot lookup unverified certificate. Call 'verify()' first.`);
    }
}
/**
 * Make a human readable string out of a hash tree.
 * @param tree
 */
function hashTreeToString(tree) {
    const indent = (s) => s
        .split('\n')
        .map(x => '  ' + x)
        .join('\n');
    function labelToString(label) {
        const decoder = new TextDecoder(undefined, { fatal: true });
        try {
            return JSON.stringify(decoder.decode(label));
        }
        catch (e) {
            return `data(...${label.byteLength} bytes)`;
        }
    }
    switch (tree[0]) {
        case 0 /* Empty */:
            return '()';
        case 1 /* Fork */: {
            const left = hashTreeToString(tree[1]);
            const right = hashTreeToString(tree[2]);
            return `sub(\n left:\n${indent(left)}\n---\n right:\n${indent(right)}\n)`;
        }
        case 2 /* Labeled */: {
            const label = labelToString(tree[1]);
            const sub = hashTreeToString(tree[2]);
            return `label(\n label:\n${indent(label)}\n sub:\n${indent(sub)}\n)`;
        }
        case 3 /* Leaf */: {
            return `leaf(...${tree[1].byteLength} bytes)`;
        }
        case 4 /* Pruned */: {
            return `pruned(${(0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.toHex)(new Uint8Array(tree[1]))}`;
        }
        default: {
            return `unknown(${JSON.stringify(tree[0])})`;
        }
    }
}
function isBufferEqual(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    const a8 = new Uint8Array(a);
    const b8 = new Uint8Array(b);
    for (let i = 0; i < a8.length; i++) {
        if (a8[i] !== b8[i]) {
            return false;
        }
    }
    return true;
}
class Certificate {
    constructor(response, _agent = (0,_agent__WEBPACK_IMPORTED_MODULE_0__.getDefaultAgent)()) {
        this._agent = _agent;
        this.verified = false;
        this._rootKey = null;
        this.cert = _cbor__WEBPACK_IMPORTED_MODULE_1__.decode(new Uint8Array(response.certificate));
    }
    lookup(path) {
        this.checkState();
        return lookup_path(path, this.cert.tree);
    }
    async verify() {
        const rootHash = await reconstruct(this.cert.tree);
        const derKey = await this._checkDelegation(this.cert.delegation);
        const sig = this.cert.signature;
        const key = extractDER(derKey);
        const msg = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.concat)(domain_sep('ic-state-root'), rootHash);
        const res = await (0,_utils_bls__WEBPACK_IMPORTED_MODULE_4__.blsVerify)(new Uint8Array(key), new Uint8Array(sig), new Uint8Array(msg));
        this.verified = res;
        return res;
    }
    checkState() {
        if (!this.verified) {
            throw new UnverifiedCertificateError();
        }
    }
    async _checkDelegation(d) {
        if (!d) {
            if (!this._rootKey) {
                if (this._agent.rootKey) {
                    this._rootKey = this._agent.rootKey;
                    return this._rootKey;
                }
                throw new Error(`Agent does not have a rootKey. Do you need to call 'fetchRootKey'?`);
            }
            return this._rootKey;
        }
        const cert = new Certificate(d, this._agent);
        if (!(await cert.verify())) {
            throw new Error('fail to verify delegation certificate');
        }
        const lookup = cert.lookup(['subnet', d.subnet_id, 'public_key']);
        if (!lookup) {
            throw new Error(`Could not find subnet key for subnet 0x${(0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.toHex)(d.subnet_id)}`);
        }
        return lookup;
    }
}
const DER_PREFIX = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.fromHex)('308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100');
const KEY_LENGTH = 96;
function extractDER(buf) {
    const expectedLength = DER_PREFIX.byteLength + KEY_LENGTH;
    if (buf.byteLength !== expectedLength) {
        throw new TypeError(`BLS DER-encoded public key must be ${expectedLength} bytes long`);
    }
    const prefix = buf.slice(0, DER_PREFIX.byteLength);
    if (!isBufferEqual(prefix, DER_PREFIX)) {
        throw new TypeError(`BLS DER-encoded public key is invalid. Expect the following prefix: ${DER_PREFIX}, but get ${prefix}`);
    }
    return buf.slice(DER_PREFIX.byteLength);
}
/**
 * @param t
 */
async function reconstruct(t) {
    switch (t[0]) {
        case 0 /* Empty */:
            return (0,_request_id__WEBPACK_IMPORTED_MODULE_3__.hash)(domain_sep('ic-hashtree-empty'));
        case 4 /* Pruned */:
            return t[1];
        case 3 /* Leaf */:
            return (0,_request_id__WEBPACK_IMPORTED_MODULE_3__.hash)((0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.concat)(domain_sep('ic-hashtree-leaf'), t[1]));
        case 2 /* Labeled */:
            return (0,_request_id__WEBPACK_IMPORTED_MODULE_3__.hash)((0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.concat)(domain_sep('ic-hashtree-labeled'), t[1], await reconstruct(t[2])));
        case 1 /* Fork */:
            return (0,_request_id__WEBPACK_IMPORTED_MODULE_3__.hash)((0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.concat)(domain_sep('ic-hashtree-fork'), await reconstruct(t[1]), await reconstruct(t[2])));
        default:
            throw new Error('unreachable');
    }
}
function domain_sep(s) {
    const len = new Uint8Array([s.length]);
    const str = new TextEncoder().encode(s);
    return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_5__.concat)(len, str);
}
/**
 * @param path
 * @param tree
 */
function lookup_path(path, tree) {
    if (path.length === 0) {
        switch (tree[0]) {
            case 3 /* Leaf */: {
                return new Uint8Array(tree[1]).buffer;
            }
            default: {
                return undefined;
            }
        }
    }
    const label = typeof path[0] === 'string' ? new TextEncoder().encode(path[0]) : path[0];
    const t = find_label(label, flatten_forks(tree));
    if (t) {
        return lookup_path(path.slice(1), t);
    }
}
function flatten_forks(t) {
    switch (t[0]) {
        case 0 /* Empty */:
            return [];
        case 1 /* Fork */:
            return flatten_forks(t[1]).concat(flatten_forks(t[2]));
        default:
            return [t];
    }
}
function find_label(l, trees) {
    if (trees.length === 0) {
        return undefined;
    }
    for (const t of trees) {
        if (t[0] === 2 /* Labeled */) {
            const p = t[1];
            if (isBufferEqual(l, p)) {
                return t[2];
            }
        }
    }
}
//# sourceMappingURL=certificate.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/errors.js":
/*!*******************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/errors.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AgentError": () => (/* binding */ AgentError)
/* harmony export */ });
/**
 * An error that happens in the Agent. This is the root of all errors and should be used
 * everywhere in the Agent code (this package).
 *
 * @todo https://github.com/dfinity/agent-js/issues/420
 */
class AgentError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, AgentError.prototype);
    }
}
//# sourceMappingURL=errors.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Actor": () => (/* reexport safe */ _actor__WEBPACK_IMPORTED_MODULE_0__.Actor),
/* harmony export */   "ActorCallError": () => (/* reexport safe */ _actor__WEBPACK_IMPORTED_MODULE_0__.ActorCallError),
/* harmony export */   "AnonymousIdentity": () => (/* reexport safe */ _auth__WEBPACK_IMPORTED_MODULE_2__.AnonymousIdentity),
/* harmony export */   "CanisterInstallMode": () => (/* reexport safe */ _actor__WEBPACK_IMPORTED_MODULE_0__.CanisterInstallMode),
/* harmony export */   "Cbor": () => (/* reexport module object */ _cbor__WEBPACK_IMPORTED_MODULE_11__),
/* harmony export */   "Certificate": () => (/* reexport safe */ _certificate__WEBPACK_IMPORTED_MODULE_3__.Certificate),
/* harmony export */   "Expiry": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.Expiry),
/* harmony export */   "HttpAgent": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.HttpAgent),
/* harmony export */   "IdentityInvalidError": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.IdentityInvalidError),
/* harmony export */   "ProxyAgent": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.ProxyAgent),
/* harmony export */   "ProxyMessageKind": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.ProxyMessageKind),
/* harmony export */   "ProxyStubAgent": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.ProxyStubAgent),
/* harmony export */   "QueryCallRejectedError": () => (/* reexport safe */ _actor__WEBPACK_IMPORTED_MODULE_0__.QueryCallRejectedError),
/* harmony export */   "ReplicaRejectCode": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.ReplicaRejectCode),
/* harmony export */   "RequestStatusResponseStatus": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.RequestStatusResponseStatus),
/* harmony export */   "SignIdentity": () => (/* reexport safe */ _auth__WEBPACK_IMPORTED_MODULE_2__.SignIdentity),
/* harmony export */   "SubmitRequestType": () => (/* reexport safe */ _agent_http_types__WEBPACK_IMPORTED_MODULE_5__.SubmitRequestType),
/* harmony export */   "UnverifiedCertificateError": () => (/* reexport safe */ _certificate__WEBPACK_IMPORTED_MODULE_3__.UnverifiedCertificateError),
/* harmony export */   "UpdateCallRejectedError": () => (/* reexport safe */ _actor__WEBPACK_IMPORTED_MODULE_0__.UpdateCallRejectedError),
/* harmony export */   "blsVerify": () => (/* reexport safe */ _utils_bls__WEBPACK_IMPORTED_MODULE_9__.blsVerify),
/* harmony export */   "createAssetCanisterActor": () => (/* reexport safe */ _canisters_asset__WEBPACK_IMPORTED_MODULE_6__.createAssetCanisterActor),
/* harmony export */   "createIdentityDescriptor": () => (/* reexport safe */ _auth__WEBPACK_IMPORTED_MODULE_2__.createIdentityDescriptor),
/* harmony export */   "getDefaultAgent": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.getDefaultAgent),
/* harmony export */   "getManagementCanister": () => (/* reexport safe */ _canisters_management__WEBPACK_IMPORTED_MODULE_7__.getManagementCanister),
/* harmony export */   "hash": () => (/* reexport safe */ _request_id__WEBPACK_IMPORTED_MODULE_8__.hash),
/* harmony export */   "hashTreeToString": () => (/* reexport safe */ _certificate__WEBPACK_IMPORTED_MODULE_3__.hashTreeToString),
/* harmony export */   "hashValue": () => (/* reexport safe */ _request_id__WEBPACK_IMPORTED_MODULE_8__.hashValue),
/* harmony export */   "lookup_path": () => (/* reexport safe */ _certificate__WEBPACK_IMPORTED_MODULE_3__.lookup_path),
/* harmony export */   "makeExpiryTransform": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.makeExpiryTransform),
/* harmony export */   "makeNonce": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.makeNonce),
/* harmony export */   "makeNonceTransform": () => (/* reexport safe */ _agent__WEBPACK_IMPORTED_MODULE_1__.makeNonceTransform),
/* harmony export */   "polling": () => (/* reexport module object */ _polling__WEBPACK_IMPORTED_MODULE_10__),
/* harmony export */   "reconstruct": () => (/* reexport safe */ _certificate__WEBPACK_IMPORTED_MODULE_3__.reconstruct),
/* harmony export */   "requestIdOf": () => (/* reexport safe */ _request_id__WEBPACK_IMPORTED_MODULE_8__.requestIdOf),
/* harmony export */   "verify": () => (/* reexport safe */ _utils_bls__WEBPACK_IMPORTED_MODULE_9__.verify)
/* harmony export */ });
/* harmony import */ var _actor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./actor */ "./node_modules/@dfinity/agent/lib/esm/actor.js");
/* harmony import */ var _agent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./agent */ "./node_modules/@dfinity/agent/lib/esm/agent/index.js");
/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./auth */ "./node_modules/@dfinity/agent/lib/esm/auth.js");
/* harmony import */ var _certificate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./certificate */ "./node_modules/@dfinity/agent/lib/esm/certificate.js");
/* harmony import */ var _agent_http_transforms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./agent/http/transforms */ "./node_modules/@dfinity/agent/lib/esm/agent/http/transforms.js");
/* harmony import */ var _agent_http_types__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./agent/http/types */ "./node_modules/@dfinity/agent/lib/esm/agent/http/types.js");
/* harmony import */ var _canisters_asset__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./canisters/asset */ "./node_modules/@dfinity/agent/lib/esm/canisters/asset.js");
/* harmony import */ var _canisters_management__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./canisters/management */ "./node_modules/@dfinity/agent/lib/esm/canisters/management.js");
/* harmony import */ var _request_id__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./request_id */ "./node_modules/@dfinity/agent/lib/esm/request_id.js");
/* harmony import */ var _utils_bls__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./utils/bls */ "./node_modules/@dfinity/agent/lib/esm/utils/bls.js");
/* harmony import */ var _polling__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./polling */ "./node_modules/@dfinity/agent/lib/esm/polling/index.js");
/* harmony import */ var _cbor__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./cbor */ "./node_modules/@dfinity/agent/lib/esm/cbor.js");












//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/polling/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/polling/index.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "defaultStrategy": () => (/* reexport safe */ _strategy__WEBPACK_IMPORTED_MODULE_3__.defaultStrategy),
/* harmony export */   "pollForResponse": () => (/* binding */ pollForResponse),
/* harmony export */   "strategy": () => (/* reexport module object */ _strategy__WEBPACK_IMPORTED_MODULE_3__)
/* harmony export */ });
/* harmony import */ var _agent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../agent */ "./node_modules/@dfinity/agent/lib/esm/agent/index.js");
/* harmony import */ var _certificate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../certificate */ "./node_modules/@dfinity/agent/lib/esm/certificate.js");
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/buffer */ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js");
/* harmony import */ var _strategy__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./strategy */ "./node_modules/@dfinity/agent/lib/esm/polling/strategy.js");





/**
 * Polls the IC to check the status of the given request then
 * returns the response bytes once the request has been processed.
 * @param agent The agent to use to poll read_state.
 * @param canisterId The effective canister ID.
 * @param requestId The Request ID to poll status for.
 * @param strategy A polling strategy.
 */
async function pollForResponse(agent, canisterId, requestId, strategy) {
    const path = [new TextEncoder().encode('request_status'), requestId];
    const state = await agent.readState(canisterId, { paths: [path] });
    const cert = new _certificate__WEBPACK_IMPORTED_MODULE_1__.Certificate(state, agent);
    const verified = await cert.verify();
    if (!verified) {
        throw new Error('Fail to verify certificate');
    }
    const maybeBuf = cert.lookup([...path, new TextEncoder().encode('status')]);
    let status;
    if (typeof maybeBuf === 'undefined') {
        // Missing requestId means we need to wait
        status = _agent__WEBPACK_IMPORTED_MODULE_0__.RequestStatusResponseStatus.Unknown;
    }
    else {
        status = new TextDecoder().decode(maybeBuf);
    }
    switch (status) {
        case _agent__WEBPACK_IMPORTED_MODULE_0__.RequestStatusResponseStatus.Replied: {
            return cert.lookup([...path, 'reply']);
        }
        case _agent__WEBPACK_IMPORTED_MODULE_0__.RequestStatusResponseStatus.Received:
        case _agent__WEBPACK_IMPORTED_MODULE_0__.RequestStatusResponseStatus.Unknown:
        case _agent__WEBPACK_IMPORTED_MODULE_0__.RequestStatusResponseStatus.Processing:
            // Execute the polling strategy, then retry.
            await strategy(canisterId, requestId, status);
            return pollForResponse(agent, canisterId, requestId, strategy);
        case _agent__WEBPACK_IMPORTED_MODULE_0__.RequestStatusResponseStatus.Rejected: {
            const rejectCode = new Uint8Array(cert.lookup([...path, 'reject_code']))[0];
            const rejectMessage = new TextDecoder().decode(cert.lookup([...path, 'reject_message']));
            throw new Error(`Call was rejected:\n` +
                `  Request ID: ${(0,_utils_buffer__WEBPACK_IMPORTED_MODULE_2__.toHex)(requestId)}\n` +
                `  Reject code: ${rejectCode}\n` +
                `  Reject text: ${rejectMessage}\n`);
        }
        case _agent__WEBPACK_IMPORTED_MODULE_0__.RequestStatusResponseStatus.Done:
            // This is _technically_ not an error, but we still didn't see the `Replied` status so
            // we don't know the result and cannot decode it.
            throw new Error(`Call was marked as done but we never saw the reply:\n` +
                `  Request ID: ${(0,_utils_buffer__WEBPACK_IMPORTED_MODULE_2__.toHex)(requestId)}\n`);
    }
    throw new Error('unreachable');
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/polling/strategy.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/polling/strategy.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "backoff": () => (/* binding */ backoff),
/* harmony export */   "chain": () => (/* binding */ chain),
/* harmony export */   "conditionalDelay": () => (/* binding */ conditionalDelay),
/* harmony export */   "defaultStrategy": () => (/* binding */ defaultStrategy),
/* harmony export */   "maxAttempts": () => (/* binding */ maxAttempts),
/* harmony export */   "once": () => (/* binding */ once),
/* harmony export */   "throttle": () => (/* binding */ throttle),
/* harmony export */   "timeout": () => (/* binding */ timeout)
/* harmony export */ });
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/buffer */ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js");

const FIVE_MINUTES_IN_MSEC = 5 * 60 * 1000;
/**
 * A best practices polling strategy: wait 2 seconds before the first poll, then 1 second
 * with an exponential backoff factor of 1.2. Timeout after 5 minutes.
 */
function defaultStrategy() {
    return chain(conditionalDelay(once(), 1000), backoff(1000, 1.2), timeout(FIVE_MINUTES_IN_MSEC));
}
/**
 * Predicate that returns true once.
 */
function once() {
    let first = true;
    return async () => {
        if (first) {
            first = false;
            return true;
        }
        return false;
    };
}
/**
 * Delay the polling once.
 * @param condition A predicate that indicates when to delay.
 * @param timeInMsec The amount of time to delay.
 */
function conditionalDelay(condition, timeInMsec) {
    return async (canisterId, requestId, status) => {
        if (await condition(canisterId, requestId, status)) {
            return new Promise(resolve => setTimeout(resolve, timeInMsec));
        }
    };
}
/**
 * Error out after a maximum number of polling has been done.
 * @param count The maximum attempts to poll.
 */
function maxAttempts(count) {
    let attempts = count;
    return async (canisterId, requestId, status) => {
        if (--attempts <= 0) {
            throw new Error(`Failed to retrieve a reply for request after ${count} attempts:\n` +
                `  Request ID: ${(0,_utils_buffer__WEBPACK_IMPORTED_MODULE_0__.toHex)(requestId)}\n` +
                `  Request status: ${status}\n`);
        }
    };
}
/**
 * Throttle polling.
 * @param throttleInMsec Amount in millisecond to wait between each polling.
 */
function throttle(throttleInMsec) {
    return () => new Promise(resolve => setTimeout(resolve, throttleInMsec));
}
/**
 * Reject a call after a certain amount of time.
 * @param timeInMsec Time in milliseconds before the polling should be rejected.
 */
function timeout(timeInMsec) {
    const end = Date.now() + timeInMsec;
    return async (canisterId, requestId, status) => {
        if (Date.now() > end) {
            throw new Error(`Request timed out after ${timeInMsec} msec:\n` +
                `  Request ID: ${(0,_utils_buffer__WEBPACK_IMPORTED_MODULE_0__.toHex)(requestId)}\n` +
                `  Request status: ${status}\n`);
        }
    };
}
/**
 * A strategy that throttle, but using an exponential backoff strategy.
 * @param startingThrottleInMsec The throttle in milliseconds to start with.
 * @param backoffFactor The factor to multiple the throttle time between every poll. For
 *   example if using 2, the throttle will double between every run.
 */
function backoff(startingThrottleInMsec, backoffFactor) {
    let currentThrottling = startingThrottleInMsec;
    return () => new Promise(resolve => setTimeout(() => {
        currentThrottling *= backoffFactor;
        resolve();
    }, currentThrottling));
}
/**
 * Chain multiple polling strategy. This _chains_ the strategies, so if you pass in,
 * say, two throttling strategy of 1 second, it will result in a throttle of 2 seconds.
 * @param strategies A strategy list to chain.
 */
function chain(...strategies) {
    return async (canisterId, requestId, status) => {
        for (const a of strategies) {
            await a(canisterId, requestId, status);
        }
    };
}
//# sourceMappingURL=strategy.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/request_id.js":
/*!***********************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/request_id.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hash": () => (/* binding */ hash),
/* harmony export */   "hashValue": () => (/* binding */ hashValue),
/* harmony export */   "requestIdOf": () => (/* binding */ requestIdOf)
/* harmony export */ });
/* harmony import */ var _dfinity_candid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/candid */ "./node_modules/@dfinity/candid/lib/esm/index.js");
/* harmony import */ var borc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! borc */ "./node_modules/borc/src/index.js");
/* harmony import */ var js_sha256__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! js-sha256 */ "./node_modules/js-sha256/src/sha256.js");
/* harmony import */ var js_sha256__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(js_sha256__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/buffer */ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js");




/**
 * sha256 hash the provided Buffer
 * @param data - input to hash function
 */
function hash(data) {
    return js_sha256__WEBPACK_IMPORTED_MODULE_2__.sha256.create().update(new Uint8Array(data)).arrayBuffer();
}
/**
 *
 * @param value unknown value
 * @returns ArrayBuffer
 */
function hashValue(value) {
    if (value instanceof borc__WEBPACK_IMPORTED_MODULE_1__.Tagged) {
        return hashValue(value.value);
    }
    else if (typeof value === 'string') {
        return hashString(value);
    }
    else if (typeof value === 'number') {
        return hash((0,_dfinity_candid__WEBPACK_IMPORTED_MODULE_0__.lebEncode)(value));
    }
    else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
        return hash(value);
    }
    else if (Array.isArray(value)) {
        const vals = value.map(hashValue);
        return hash((0,_utils_buffer__WEBPACK_IMPORTED_MODULE_3__.concat)(...vals));
    }
    else if (value && typeof value === 'object' && value._isPrincipal) {
        return hash(value.toUint8Array());
    }
    else if (typeof value === 'object' &&
        value !== null &&
        typeof value.toHash === 'function') {
        return hashValue(value.toHash());
        // TODO This should be move to a specific async method as the webauthn flow required
        // the flow to be synchronous to ensure Safari touch id works.
        // } else if (value instanceof Promise) {
        //   return value.then(x => hashValue(x));
    }
    else if (typeof value === 'bigint') {
        // Do this check much later than the other bigint check because this one is much less
        // type-safe.
        // So we want to try all the high-assurance type guards before this 'probable' one.
        return hash((0,_dfinity_candid__WEBPACK_IMPORTED_MODULE_0__.lebEncode)(value));
    }
    throw Object.assign(new Error(`Attempt to hash a value of unsupported type: ${value}`), {
        // include so logs/callers can understand the confusing value.
        // (when stringified in error message, prototype info is lost)
        value,
    });
}
const hashString = (value) => {
    const encoded = new TextEncoder().encode(value);
    return hash(encoded);
};
/**
 * Get the RequestId of the provided ic-ref request.
 * RequestId is the result of the representation-independent-hash function.
 * https://sdk.dfinity.org/docs/interface-spec/index.html#hash-of-map
 * @param request - ic-ref request to hash into RequestId
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function requestIdOf(request) {
    const hashed = Object.entries(request)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => {
        const hashedKey = hashString(key);
        const hashedValue = hashValue(value);
        return [hashedKey, hashedValue];
    });
    const traversed = hashed;
    const sorted = traversed.sort(([k1], [k2]) => {
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_3__.compare)(k1, k2);
    });
    const concatenated = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_3__.concat)(...sorted.map(x => (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_3__.concat)(...x)));
    const requestId = hash(concatenated);
    return requestId;
}
//# sourceMappingURL=request_id.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/utils/bls.js":
/*!**********************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/utils/bls.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "blsVerify": () => (/* binding */ blsVerify),
/* harmony export */   "verify": () => (/* binding */ verify)
/* harmony export */ });
/* harmony import */ var _vendor_bls_bls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vendor/bls/bls */ "./node_modules/@dfinity/agent/lib/esm/vendor/bls/bls.js");

let verify;
/**
 *
 * @param pk primary key: Uint8Array
 * @param sig signature: Uint8Array
 * @param msg message: Uint8Array
 * @returns Promise resolving a boolean
 */
async function blsVerify(pk, sig, msg) {
    if (!verify) {
        await (0,_vendor_bls_bls__WEBPACK_IMPORTED_MODULE_0__["default"])();
        if ((0,_vendor_bls_bls__WEBPACK_IMPORTED_MODULE_0__.bls_init)() !== 0) {
            throw new Error('Cannot initialize BLS');
        }
        verify = (pk1, sig1, msg1) => {
            // Reorder things from what the WASM expects (sig, m, w).
            return (0,_vendor_bls_bls__WEBPACK_IMPORTED_MODULE_0__.bls_verify)(sig1, msg1, pk1) === 0;
        };
    }
    return verify(pk, sig, msg);
}
//# sourceMappingURL=bls.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/utils/buffer.js":
/*!*************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/utils/buffer.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "compare": () => (/* binding */ compare),
/* harmony export */   "concat": () => (/* binding */ concat),
/* harmony export */   "fromHex": () => (/* binding */ fromHex),
/* harmony export */   "toHex": () => (/* binding */ toHex)
/* harmony export */ });
/**
 * Concatenate multiple array buffers.
 * @param buffers The buffers to concatenate.
 */
function concat(...buffers) {
    const result = new Uint8Array(buffers.reduce((acc, curr) => acc + curr.byteLength, 0));
    let index = 0;
    for (const b of buffers) {
        result.set(new Uint8Array(b), index);
        index += b.byteLength;
    }
    return result.buffer;
}
/**
 * Transforms a buffer to an hexadecimal string. This will use the buffer as an Uint8Array.
 * @param buffer The buffer to return the hexadecimal string of.
 */
function toHex(buffer) {
    return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const hexRe = new RegExp(/^([0-9A-F]{2})*$/i);
/**
 * Transforms a hexadecimal string into an array buffer.
 * @param hex The hexadecimal string to use.
 */
function fromHex(hex) {
    if (!hexRe.test(hex)) {
        throw new Error('Invalid hexadecimal string.');
    }
    const buffer = [...hex]
        .reduce((acc, curr, i) => {
        // tslint:disable-next-line:no-bitwise
        acc[(i / 2) | 0] = (acc[(i / 2) | 0] || '') + curr;
        return acc;
    }, [])
        .map(x => Number.parseInt(x, 16));
    return new Uint8Array(buffer).buffer;
}
function compare(b1, b2) {
    if (b1.byteLength !== b2.byteLength) {
        return b1.byteLength - b2.byteLength;
    }
    const u1 = new Uint8Array(b1);
    const u2 = new Uint8Array(b2);
    for (let i = 0; i < u1.length; i++) {
        if (u1[i] !== u2[i]) {
            return u1[i] - u2[i];
        }
    }
    return 0;
}
//# sourceMappingURL=buffer.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/lib/esm/vendor/bls/bls.js":
/*!***************************************************************!*\
  !*** ./node_modules/@dfinity/agent/lib/esm/vendor/bls/bls.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bls_init": () => (/* binding */ bls_init),
/* harmony export */   "bls_verify": () => (/* binding */ bls_verify),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var base64_arraybuffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! base64-arraybuffer */ "./node_modules/@dfinity/agent/node_modules/base64-arraybuffer/lib/base64-arraybuffer.js");

/* tslint:disable */
/* eslint-disable */
let wasm;
// This WASM is generated from the BLS Rust code of the Agent RS (see
// http://github.com/dfinity/agent-rs/)
// Once the WASM is compiled, simply base64 encode it and include it in this string.
const wasmBytesBase64 = `
    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
    g8AAEF8CQAJAIAZB6AFqEFoNACAGQShqEIQBDQAgBkGIPWoQS0EAIQcgBkGIwwBqQTgQchogBkG4IWpBOBByGiAGQYjA
    AGoQSyAGQcjEAGoQSyAGQcjJAGoQSyAGQcjMAGoQSyAGQagGahBLIAZBsAxqEEsgBkHIzwBqEEsgBkHQ1QBqEEsgBkHY
    2wBqEEsgBkG4FWoQSyAGQZgjaiAGQcjJAGpBwAEQZxogBkHYJGogBkHIzABqQcABEGcaIAZBmCZqIAZBqAZqQcABEGca
    IAZB2CdqIAZBsAxqQcABEGcaIAZBmClqIAZByM8AakHAARBnGiAGQdgqaiAGQdDVAGpBwAEQZxogBkGYLGogBkHY2wBq
    QcABEGcaIAZB2C1qIAZBuBVqQcABEGcaIAZBuBVqQecAEHIaIAZBiMAAaiAGQShqEH8gBkGIwABqEBggBkGYI2ogBkEo
    ahB/A0AgB0HACkYEQCAGQbghaiAGQegBahBrIAYpA7ghIRcgBkG4IWpBARCdASAGQbghahBEIAYpA7ghIRYgBkGIwwBq
    IAZBuCFqEGsgBkGIwwBqQQEQnQEgBkGIwwBqEEQgBkG4IWogBkGIwwBqIBdCAoGnEE8gBkGIwABqIAZBKGogFkICgacQ
    bSAGQcjEAGogBkGIwABqEH8gBkG4IWoQKUEDaiIJQQJ2IgdBAWohAkEAIQgCQAJAAkADQAJAIAZBuCFqQQUQjAEhAyAC
    IAhGBEAgCUGYA0kNASACQecAQbCEwAAQPAALIAhB5wBGDQIgBkG4FWogCGogA0FwaiIDOgAAIAZBuCFqIANBGHRBGHUQ
    ngEgBkG4IWoQRCAGQbghakEEEDsgCEEBaiEIDAELCyAGQbgVaiACaiADOgAAIANBGHRBGHVBf2oiA0EBdiECIANBD0sN
    ASAGQYg9aiAGQZgjaiACQcABbGoQfwNAIAdBf0YEQCAGQYg9aiAGQcjEAGoQcyAGQZgjaiAGQYg9akHAARBnGgwICyAH
    QeYASw0DIAZBiMAAaiAGQZgjaiAGQbgVaiAHaiwAABAfIAdBf2ohByAGQYg9ahAYIAZBiD1qEBggBkGIPWoQGCAGQYg9
    ahAYIAZBiD1qIAZBiMAAahAMDAALAAtB5wBB5wBBoITAABA8AAsgAkEIQcCEwAAQPAALIAdB5wBB0ITAABA8AAUgBkHI
    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
    UtcEAKAIAIgFBASACdCICcQRAIAAoAggMAQtB1LXBACABIAJyNgIAIAALIQEgACAENgIIIAEgBDYCDCAEIAA2AgwgBCAB
    NgIIC0EAIQVB6LjBACgCACIAIAZNDQBB6LjBACAAIAZrIgI2AgBB8LjBAEHwuMEAKAIAIgEgBmoiADYCACAAIAJBAXI2A
    gQgASAGQQNyNgIEIAFBCGoPCyAFDwsgASAHNgIYIAMoAhAiAARAIAEgADYCECAAIAE2AhgLIANBFGooAgAiAEUNACABQR
    RqIAA2AgAgACABNgIYCwJAIAVBEE8EQCADIAZBA3I2AgQgAyAGaiIEIAVBAXI2AgQgBCAFaiAFNgIAQeS4wQAoAgAiAAR
    AIABBA3YiAkEDdEHctcEAaiEAQey4wQAoAgAhBwJ/QdS1wQAoAgAiAUEBIAJBH3F0IgJxBEAgACgCCAwBC0HUtcEAIAEg
    AnI2AgAgAAshAiAAIAc2AgggAiAHNgIMIAcgADYCDCAHIAI2AggLQey4wQAgBDYCAEHkuMEAIAU2AgAMAQsgAyAFIAZqI
    gBBA3I2AgQgACADaiIAIAAoAgRBAXI2AgQLIANBCGoLtA8BA38jAEGAC2siAiQAIAJBCGoQSyACQcgBakE4EHIaIAJBAT
    YCgAIgAkGIAmpBOBByGiACQQE2AsACIAJByAJqQTgQchogAkEBNgKAAyACQYgDakE4EHIaIAJBATYCwAMgAkHIA2pBOBB
    yGiACQQE2AoAEIAJBiARqQQEQigEgAkHIBGpBOBByGiACQQE2AoAFIAJBiAVqQTgQchogAkEBNgLABSACQcgFaiABEIUB
    IAJBiAZqQTgQchogAkEBNgLABiACQcgGakE4EHIaIAJBATYCgAcgAkGIB2pBOBByGiACQQE2AsAHIAJByAdqQTgQchogA
    kEBNgKACCACQcgFahBYIQMgAkHICWpB4ITAABBfIAJBiApqIAJByAlqEIsBIAJByAFqIAJBiApqEKUBIAJByAlqQZiFwA
    AQXyACQYgKaiACQcgJahCLASACQYgCaiACQYgKahClASACQcgFahADIAJByAVqQQsQUiACQYgGaiACQcgFahClASACQYg
    GaiACQYgEahB4IAJBiAZqEEQgAkGIBmogAkHIBWoQSCACQYgFaiACQcgBahClASACQYgFaiACQYgGahBIIAJBiAZqIAJB
    iARqEHggAkGIBmoQRCACQYgGaiACQYgCahBIIAJBiAZqEEEgAkGIBmoQRCACQYgDaiACQYgGahClASACQcgDaiACQcgFa
    hClASACQcgDaiACQYgDahBIIAJByAdqIAJBiANqEKUBIAJByAdqEAMgAkHIBmogAkGIBWoQpQEgAkHIBmoQAyACQYgGai
    ACQcgBahClASACQYgGaiACQcgGahBIIAJByAdqIAJBiAZqEHggAkHIB2oQRCACQcgHaiACQYgDahBIIAJByAZqIAJBiAV
    qEEggAkGIBmogAkGIAmoQpQEgAkGIBmogAkHIBmoQSCACQcgHaiACQYgGahB4IAJByAdqEEQgAkGIBmogAkHIB2oQpQEg
    AkGIBmogAkGIBWoQSCACQYgGaiACQYgHahBcIQQgAkGIBWogAkGIBmoQpQEgAkGIBWogAkGIB2oQNCACQYgFaiACQcgHa
    hBIIAJBiANqIAJBiAVqEEggAkHIA2ogAkGIBWoQSCACQcgFaiABEEggAkHIBmogAkGIBWoQpQEgAkHIBmoQAyACQYgFai
    ACQcgGahClASACQYgFaiACQcgFahBIIAJByAVqIAJBiAZqEKUBIAJByAVqQQsQUiACQcgJakHQhcAAEF8gAkGICmogAkH
    ICWoQiwEgAkHIAmogAkGICmoQpQEgAkHIAmogAkGIB2oQSCACQYgDaiACQcgDakEBIARrIgEQeSACQcgGaiACQYgFaiAB
    EHkgAkGIBmogAkHIBWogARB5IAJBiAdqIAJByAJqIAEQeSACQYgKaiACQYgGaiACQYgHahAjIAJByARqIAJBiApqEKUBI
    AJByARqIAJByAZqEEggAkHIBGoQWCEBIAJBiAZqIAJByARqEKUBIAJBiAZqEEEgAkGIBmoQRCACQcgEaiACQYgGaiABIA
    NzEHkgAkGICmpBiIbAABBfIAJBiAhqIAJBiApqEIsBQTghAQNAIAFBoAVGRQRAIAJBiAhqIAJBiANqEEggAkHICWogAUG
    IhsAAahBfIAFBOGohASACQYgKaiACQcgJahCLASACQYgGaiACQYgKahClASACQYgIaiACQYgGahB4IAJBiAhqEEQMAQsL
    IAJByAhqIAJBiANqEIUBIAJByAlqQaiLwAAQXyACQYgKaiACQcgJahCLASACQYgGaiACQYgKahClASACQcgIaiACQYgGa
    hB4IAJByAhqEERBACEBA0AgAUH4A0ZFBEAgAkHICGogAkGIA2oQSCACQcgJaiABQeCLwABqEF8gAUE4aiEBIAJBiApqIA
    JByAlqEIsBIAJBiAZqIAJBiApqEKUBIAJByAhqIAJBiAZqEHggAkHICGoQRAwBCwsgAkGICmpB2I/AABBfIAJBiAlqIAJ
    BiApqEIsBQQAhAQNAIAFByAZGBEACQCACQcgJaiACQYgDahCFASACQcgKakHYlsAAEF8gAkGICmogAkHICmoQiwEgAkGI
    BmogAkGICmoQpQEgAkHICWogAkGIBmoQeCACQcgJahBEQQAhAQNAIAFBkAZGDQEgAkHICWogAkGIA2oQSCACQcgKaiABQ
    ZCXwABqEF8gAUE4aiEBIAJBiApqIAJByApqEIsBIAJBiAZqIAJBiApqEKUBIAJByAlqIAJBiAZqEHggAkHICWoQRAwACw
    ALBSACQYgJaiACQYgDahBIIAJByAlqIAFBkJDAAGoQXyABQThqIQEgAkGICmogAkHICWoQiwEgAkGIBmogAkGICmoQpQE
    gAkGICWogAkGIBmoQeCACQYgJahBEDAELCyACQYgJaiACQcgEahBIIAJBiAZqIAJBiAhqEKUBIAJBiAZqIAJByAlqEEgg
    AkEIaiACQYgGahClASACQYgGaiACQYgJahClASACQYgGaiACQcgIahBIIAJByABqIAJBiAZqEKUBIAJBiAZqIAJByAhqE
    KUBIAJBiAZqIAJByAlqEEggAkGIAWogAkGIBmoQpQEgACACQQhqQcABEGcaIAJBgAtqJAALzQ0CE38IfiMAQYADayIBJA
    AgADQCOCIUIBR+QoCAgBBaBEAgABASCyABQeABakHoABByGiABQcgBaiAAKQMAIhggGEI/hyIZIBggGRAxIAEgASkDyAE
    iFEL//////////wODNwPYASABQdABaikDACIXQgaGIBRCOoiEIRUgF0I6iCEaIABBCGoiCyEFIAAhBkEBIQcDQCAHQQZP
    BEAgAEEYaiEMIABBKGohCyAAQRBqIQcgACkDMCEYQQQhBkEAIQkgAUGgAWohDUEDIQpBAiEIQQchBQJAAkADQCAFQQpLD
    QIgBiAIIAYgCEsbIQ4gBiAKIAYgCksbQQN0QWhqIQ8gAUGYAWogBUEDdCIQIABqQVBqKQMAIhQgFEI/hyAYIBhCP4ciGR
    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
    OBByGiACQQE2AvgMIAJBgA1qQTgQchogAkG4DWpBATYCACACQYAIakE4EHIaIAJBATYCuAggAkHACGpBOBByGiACQfgIa
    kEBNgIAIAJBgApqIABBgANqIgMQXiACQYAIaiACQYAKahCQASACQYAKaiABQYADaiIFEF4gAkGACGogAkGACmoQDyACQc
    AMahCpASAERQRAIAJBgApqIAMQXiACQcAMaiACQYAKahCQASACQYAKaiABQYACahBeIAJBwAxqIAJBgApqEA8LIAAoAoA
    GQQRHBEAgAkGACmogAEGAAmoQXiACQcAMaiACQYAKahCQASACQYAKaiAFEF4gAkHADGogAkGACmoQDwsgAkGABGogAkHA
    DGogAkGACGoQoQEgAkGABGoQZgsgAkGACGogABCOASACQYAKaiABEI4BIAJBgAhqIABBgAJqIgQQlgEgAkGACGoQrAEgA
    kGACmogAUGAAmoiBRCWASACQYAKahCsASACQYACaiACQYAIahCSASACQYACaiACQYAKahAZIAJBgAhqIAQQkgEgAkGACG
    ogAEGABGoiAxCWASACQYAIahCsASACQYAKaiAFEJIBIAJBgApqIAFBgARqIgUQlgEgAkGACmoQrAEgAkGABmogAkGACGo
    QkgEgAkGABmogAkGACmoQGSACQYAIaiACEJIBIAJBgAhqECsgAkGACmogAkGABGoQkgEgAkGACmoQKyACQYACaiACQYAI
    ahCWASAEIAJBgAJqEJIBIAQgAkGACmoQlgEgAkGABmogAkGACmoQlgEgAkGABGogAkGACGoQlgEgAkGACGogABCSASACQ
    YAIaiADEJYBIAJBgAhqEKwBIAJBgApqIAEQkgEgAkGACmogBRCWASACQYAKahCsASACQYAIaiACQYAKahAZIAJBgARqIA
    JBgAhqEJYBIAJBgAhqIAMQkgEgAkGACGogBRAZIAJBgApqIAJBgAhqEJIBIAJBgApqECsgAyACQYAEahCSASADIAJBgAp
    qEJYBIAJBgAZqIAJBgApqEJYBIAJBgAhqEGYgBCACQYAIahCWAQwDCyAAIAEQBgwECyACQcAMaiABQYAFahBeIAJBgAxq
    IAJBwAxqQcAAEGcaIAJBgAZqIAJBgAxqEKMBCyACQYAGahBmIAJBgAhqIAIQkgEgAkGACGoQKyACQYACaiACQYAIahCWA
    SAFIAJBgAJqEJIBIAJBgARqIAJBgAhqEJIBIAJBgAhqIAAQkgEgAkGACGogAxCWASACQYAIahCsASACQYAKaiABEJIBIA
    JBgApqIAFBgARqEJYBIAJBgApqEKwBIAJBgAhqIAJBgApqEBkgAkGABGogAkGACGoQlgEgAkGACGogAxCSAQJAIARBAkc
    EQCACQcAMaiABQYAFahBeIAJBgAhqIAJBwAxqEKIBDAELIAJBwAxqIAFBgAVqEF4gAkGADGogAkHADGpBwAAQZxogAkGA
    CGogAkGADGoQowELIAJBgAhqEGYgAkGACmogAkGACGoQkgEgAkGACmoQKyADIAJBgARqEJIBIAMgAkGACmoQlgEgAkGAB
    mogAkGACmoQlgEgAkGACGoQZiAFIAJBgAhqEJYBCyACQYAGahCsASACQYAGahBmIAAgAhCSASAAIAJBgAZqEJYBIABBBT
    YCgAYgABCZAQwBCyAAIAEQbAsgAkHADWokAAuaCQIPfwt+IwBBwAJrIgIkACACQeAAakGgp8AAEF8gAEE4EHIhDCACQZg
    BakHwABByGiACQZACakEwEHIaIAwQdCACIAEpAwAiFEL9//P/z///+QF+Qv//////////A4MiETcDiAIgAkHQAGogEUIA
    IAIpA2AiGCAYQj+HIhoQMSAUIAIpA1AiEXwiFiARVK0gAkHYAGopAwAgFEI/h3x8IhRCOocgASkDCCIRQj+HfCARIBRCB
    oYgFkI6iIQiEXwiEiARVK18IRNBASEDAkADQAJAIANBB0YEQCACQZACaiEJIAJB6ABqIQpBByEEIAJB4ABqIQ0gAkGIAm
    ohDkEGIQ8MAQsgA0EBdiIAQQFqIQUgCiAAayEGIAkgAEEDdCIHayEAIAdBCGohCCACQUBrIANBA3QiBCACQeAAamopAwA
    iFiAWQj+HIhQgAikDiAIiESARQj+HEDEgAkHIAGopAwAgEiAVfCIRIBJUrSATIBd8fHwgESACKQNAfCITIBFUrXwhEiAD
    QQFqIQcDQCADIAVNBEAgAkGIAmogBGogE0L9//P/z///+QF+Qv//////////A4MiETcDACACQTBqIBFCACAYIBoQMSACQ
    SBqIBFCACAWIBQQMSACQZgBaiADQQR0aiIAIAJBKGopAwAiGzcDCCAAIAIpAyAiGTcDACACKQMwIhEgE3wiFiARVK0gAk
    E4aikDACASfHwiFEI6hyABIAdBA3RqKQMAIhFCP4d8IBEgFEIGhiAWQjqIhCIRfCISIBFUrXwhEyAVIBl8IhUgGVStIBc
    gG3x8IRcgCUEIaiEJIApBAWohCiAHIQMMAwsgBkEGSw0DIAJBEGogAkHgAGogCGopAwAgAkHgAGogAGopAwB9IhEgEUI/
    hyACQYgCaiAAaikDACACQYgCaiAIaikDAH0iESARQj+HEDEgAikDECIRIBN8IhMgEVStIAJBGGopAwAgEnx8IRIgBUEBa
    iEFIABBeGohACAGQX9qIQYgCEEIaiEIDAALAAsLA0ACQCAEQQ1HBEAgDyAEQQF2IgBrIQUgDiAAQQN0IgtrIRAgDSALay
    EIIBMgF3wgEiAVfCITIBJUrXwhEiAEQQFqIQdBMCEAIAkhBiAKIQMDQCAAIAtGDQIgBUEGTQRAIAIgAyALaikDACAAIAh
    qKQMAfSIRIBFCP4cgACAQaikDACAGIAtqKQMAfSIRIBFCP4cQMSACKQMAIhEgE3wiEyARVK0gAkEIaikDACASfHwhEiAF
    QX9qIQUgBkEIaiEGIANBCGohAyAAQXhqIQAMAQsLIAVBB0HknsAAEDwACyAMIBJC//////////8DgzcDMCACQcACaiQAD
    wsgBEEDdCAMakFIaiATQv//////////A4M3AwAgEkI6hyABIAdBA3RqKQMAIhFCP4d8IBEgEkIGhiATQjqIhCIRfCISIB
    FUrXwhEyAXIARBBHQgAmpBOGoiAEEIaikDAH0gFSAAKQMAIhFUrX0hFyAOQQhqIQ4gDUEIaiENIA9BAWohDyAVIBF9IRU
    gByEEDAALAAsgBkEHQdSewAAQPAAL+QkBBH8jAEGACWsiAiQAIAJBgAhqIAAQXiACIAJBgAhqEF4gAkGACGogAEGAAWoi
    BBBeIAJBgAFqIAJBgAhqEF4gAkGACGogARBeIAIgAkGACGoQDyACQYAIaiABQYABaiIFEF4gAkGAAWogAkGACGoQDyAAK
    AKABiEDAkACQCABKAKABkECRwRAIANBAkYNASACQYAIaiAAQYAFahBeIAJBgAJqIAJBgAhqEF4gAkGACGogAUGABWoQXi
    ACQYACaiACQYAIahAPDAILIANBAkYEQCACQYAIaiAAQYAFahBeIAJBgAdqIAJBgAhqQcAAEGcaIAJBgAZqIAJBgAdqEIU
    BIAJBgAhqIAFBgAVqEF4gAkGAB2ogAkGACGpBwAAQZxogAkGABmogAkGAB2oQSCACQYAIakE4EHIaIAJBATYCuAggAkHA
    CGpBOBByIAJB+AhqQQE2AgAgAkGACGogAkGABmoQpQEQsgEgAkGAAmogAkGACGpBgAEQZxoMAgsgAkGACGogAEGABWoQX
    iACQYACaiACQYAIahBeIAJBgAhqIAFBgAVqEF4gAkGAB2ogAkGACGpBwAAQZxogAkGAAmogAkGAB2oQoAEMAQsgAkGACG
    ogAUGABWoQXiACQYACaiACQYAIahBeIAJBgAhqIABBgAVqEF4gAkGAB2ogAkGACGpBwAAQZxogAkGAAmogAkGAB2oQoAE
    LIAJBgAhqIAAQXiACQYADaiACQYAIahBeIAJBgAhqIAEQXiACQYAEaiACQYAIahBeIAJBgAhqIAQQXiACQYADaiACQYAI
    ahCVASACQYADahCoASACQYAIaiAFEF4gAkGABGogAkGACGoQlQEgAkGABGoQqAEgAkGABWogAkGAA2oQXiACQYAFaiACQ
    YAEahAPIAJBgAZqIAIQXiACQYAGaiACQYABahCVASACQYAGahA6IAJBgAVqIAJBgAZqEJUBIAJBgAhqIAAQXiACQYADai
    ACQYAIahCQASACQYAIaiAAQYAFaiIDEF4gAkGAA2ogAkGACGoQlQEgAkGAA2oQqAEgAkGACGogARBeIAJBgARqIAJBgAh
    qEJABIAJBgAhqIAFBgAVqIgEQXiACQYAEaiACQYAIahCVASACQYAEahCoASACQYAHaiACQYADahBeIAJBgAdqIAJBgARq
    EA8gAkGABmogAhCQASACQYAGaiACQYACahCVASACQYAGahA6IAJBgAdqIAJBgAZqEJUBIAJBgAhqIAQQXiACQYADaiACQ
    YAIahCQASACQYAIaiADEF4gAkGAA2ogAkGACGoQlQEgAkGAA2oQqAEgAkGACGogBRBeIAJBgARqIAJBgAhqEJABIAJBgA
    hqIAEQXiACQYAEaiACQYAIahCVASACQYAEahCoASACQYAIaiACQYADahBeIAJBgAhqIAJBgARqEA8gAkGABmogAkGAAWo
    QkAEgAkGABmogAkGAAmoQlQEgAkGABmoQOiACQYAIaiACQYAGahCVASACQYABahBVIAIgAkGAAWoQlQEgACACIAJBgAVq
    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
    GogAkGABWoQfSACQYAEahCoASACQYAFaiAAEJABIAJBgAVqIAQQlQEgAkGABWoQqAEgAkGABmogARBeIAJBgAZqIAYQlQ
    EgAkGABmoQqAEgAkGABWogAkGABmoQDyACQYAGaiACEJABIAJBgAZqIAJBgAJqEJUBIAJBgAZqIAJBgAVqELUBIAJBgAZ
    qEKgBIAJBgAVqIAIQkAEgAkGABWogAhCVASACIAJBgAVqEJUBIAIQqAEgAkGAAmpBDBCfASACQYACahBVIAJBgAJqEKgB
    IAJBgAdqIAJBgAFqEF4gAkGAB2ogAkGAAmoQlQEgAkGAB2oQqAEgAkGAAWogAkGAAmoQfSACQYABahCoASACQYAGakEME
    J8BIAJBgAZqEFUgAkGABmoQqAEgAkGABWogAkGABmoQkAEgAkGABWogAkGABGoQDyACQYACaiACQYADahCQASACQYACai
    ACQYABahAPIAJBgAVqIAJBgAJqELUBIAJBgAZqIAIQDyACQYABaiACQYAHahAPIAJBgAZqIAJBgAFqEJUBIAIgAkGAA2o
    QDyACQYAHaiACQYAEahAPIAJBgAdqIAIQlQEgACACQYAFahCQASAAEKgBIAMgAkGABmoQkAEgAxCoASAEIAJBgAdqEJAB
    IAQQqAEgAkGACGokAAv2BQEFfyMAQYAEayICJAAgAiAAEIUBIAIgARBIIAJBQGsgAEFAayIDEIUBIAJBQGsgAUFAayIFE
    EggAkGAAWogAEGAAWoiBBCFASACQYABaiABQYABaiIGEEggAkHAAWogABCFASACQcABaiADEHggAkHAAWoQRCACQYACai
    ABEIUBIAJBgAJqIAUQeCACQYACahBEIAJBwAFqIAJBgAJqEEggAkGAAmogAhClASACQYACaiACQUBrEHggAkHAAWogAkG
    AAmoQgAEgAkHAAWoQRCACQYACaiADEKUBIAJBgAJqIAQQeCACQYACahBEIAJBwAJqIAUQhQEgAkHAAmogBhB4IAJBwAJq
    EEQgAkGAAmogAkHAAmoQSCACQcACaiACQUBrEKUBIAJBwAJqIAJBgAFqEHggAkGAAmogAkHAAmoQgAEgAkGAAmoQRCACQ
    cACaiAAEKUBIAJBwAJqIAQQeCACQcACahBEIAJBgANqIAEQhQEgAkGAA2ogBhB4IAJBgANqEEQgAkHAAmogAkGAA2oQSC
    ACQYADaiACEKUBIAJBgANqIAJBgAFqEHggAkGAA2ogAkHAAmoQswEgAkGAA2oQRCACQcACaiACEKUBIAJBwAJqIAIQeCA
    CIAJBwAJqEHggAhBEIAJBgAFqQQwQUiACQcADaiACQUBrEIUBIAJBwANqIAJBgAFqEHggAkHAA2oQRCACQUBrIAJBgAFq
    EIABIAJBQGsQRCACQYADakEMEFIgAkHAAmogAkGAA2oQpQEgAkHAAmogAkGAAmoQSCACQYABaiACQcABahClASACQYABa
    iACQUBrEEggAkHAAmogAkGAAWoQswEgAkGAA2ogAhBIIAJBQGsgAkHAA2oQSCACQYADaiACQUBrEHggAiACQcABahBIIA
    JBwANqIAJBgAJqEEggAkHAA2ogAhB4IAAgAkHAAmoQpQEgABBEIAMgAkGAA2oQpQEgAxBEIAQgAkHAA2oQpQEgBBBEIAJ
    BgARqJAALxQUBBH8jAEHwEmsiACQAIAAQOEF/IQEgABCIAUUEQCAAQYADakE4EHIaIABBuANqQTgQchogAEG4A2ogAEGA
    A2oQVCAAQfAKakG4gMAAEF8gAEHwDWpB8IDAABBfIABB8ANqIABB8ApqIABB8A1qEEkgAEHwBGpBOBByGiAAQQE2AqgFI
    ABBsAVqQTgQchogAEHoBWpBATYCACAAQfAFakE4EHIaIABBATYCqAYgAEGwBmpBOBByGiAAQegGakEBNgIAIABB8AZqQT
    gQchogAEEBNgKoByAAQbAHakE4EHIaIABB6AdqQQE2AgBBf2ohAyAAQfAHahAqIABB8AdqIAAQfiAAQfAKahAqIABB8Ap
    qIABB8AdqEH4gAEHwDWoQKiAAQfANaiAAQfAHahB+IABB8A1qEJwBAkACQAJAA0AgAiEBIANBAkkNAyAAQfAKaiAAQfAE
    aiAAQfAFaiAAQfAGahAlIAFBxABNBEAgAEHwEGogAEHwBGogAEHwBWogAEHwBmoQRiABQQh0QdCrwABqIABB8BBqEJIBI
    AFBAWohAgJAAkAgAEG4A2ogA0F/aiIDEFcgAEGAA2ogAxBXa0EBag4DAQMAAwsgAEHwCmogAEHwB2ogAEHwBGogAEHwBW
    ogAEHwBmoQHiABQcMASw0DIABB8BBqIABB8ARqIABB8AVqIABB8AZqEEYgAkEIdEHQq8AAaiAAQfAQahCSASABQQJqIQI
    MAgsgAEHwCmogAEHwDWogAEHwBGogAEHwBWogAEHwBmoQHiABQcMASw0DIABB8BBqIABB8ARqIABB8AVqIABB8AZqEEYg
    AkEIdEHQq8AAaiAAQfAQahCSASABQQJqIQIMAQsLIAFBxQBBvIHAABA8AAtBxQBBxQBBzIHAABA8AAtBxQBBxQBB3IHAA
    BA8AAtBACEBCyAAQfASaiQAIAEL8gQBBH8jAEGADGsiAiQAIAIgABCOASACQYACahAvIAJBgARqIABBgAJqIgMQjgEgAk
    GABmoQLyACQYAIaiAAEI4BIAJBgApqIAEQjgEgAiABEBkgAkGABGogAUGAAmoiBBAZIAJBgAhqIAMQlgEgAkGACmogBBC
    WASACQYAIahCsASACQYAKahCsASACQYACaiACQYAIahCSASACQYACaiACQYAKahAZIAJBgAhqIAMQkgEgAkGACGogAEGA
    BGoiBRCWASACQYAKaiAEEJIBIAJBgApqIAFBgARqIgQQlgEgAkGACGoQrAEgAkGACmoQrAEgAkGABmogAkGACGoQkgEgA
    kGABmogAkGACmoQGSACQYAIaiACEJIBIAJBgAhqECsgAkGACmogAkGABGoQkgEgAkGACmoQKyACQYACaiACQYAIahCWAS
    ADIAJBgAJqEJIBIAMgAkGACmoQlgEgAkGABmogAkGACmoQlgEgAkGABGogAkGACGoQlgEgAkGACGogABCSASACQYAIaiA
    FEJYBIAJBgAhqEKwBIAJBgApqIAEQkgEgAkGACmogBBCWASACQYAKahCsASACQYAIaiACQYAKahAZIAJBgARqIAJBgAhq
    EJYBIAJBgAhqIAUQkgEgAkGACGogBBAZIAJBgApqIAJBgAhqEJIBIAJBgApqECsgBSACQYAEahCSASAFIAJBgApqEJYBI
    AJBgAZqIAJBgApqEJYBIAJBgAhqEGYgAyACQYAIahCWASACQYAGahCsASACQYAGahBmIAAgAhCSASAAIAJBgAZqEJYBIA
    BBBTYCgAYgABCZASACQYAMaiQAC68EAQV/IwBBkAZrIgIkACAAQUBrIQQCQCABQfgAaigCACABKAI4aqwgAEH4AGooAgA
    iAyAAKAI4IgVqrH5CgICAEFMNACAFQQJOBH8gABASIAAoAngFIAMLQQJIDQAgBBASCyACQaCnwAAQX0EAIQMgAkE4akHw
    ABByGiABQUBrIQUDQCADQThGBEAgAkHwAGohBkEAIQMDQCADQThGRQRAIAMgBmogAiADaikDADcDACADQQhqIQMMAQsLI
    AJBqAFqIAAQXyACQeABaiABEF8gAkGYAmogACABEAggAkGIA2ogBCAFEAggAkGoAWogBBBhIAJBqAFqEEQgAkHgAWogBR
    BhIAJB4AFqEEQgAkH4A2ogAkGoAWogAkHgAWoQCEEAIQMgAkHoBGpB8AAQchoDQCADQfAARkUEQCACQegEaiADaiACQZg
    CaiADaikDADcDACADQQhqIQMMAQsLIAJB6ARqIAJBiANqEGVBACEDA0AgA0HwAEZFBEAgAkGIA2ogA2oiASACQThqIANq
    KQMAIAEpAwB9NwMAIANBCGohAwwBCwsgAkGYAmogAkGIA2oQZSACQZgCahBFIAJB+ANqIAJB6ARqEGQgAkH4A2oQRSACQ
    dgFaiACQZgCahAFIAAgAkHYBWoQayAAQQM2AjggAkHYBWogAkH4A2oQBSAEIAJB2AVqEGsgAEECNgJ4IAJBkAZqJAAFIA
    JBOGogA2pCADcDACADQQhqIQMMAQsLC5QEAQF/IwBB0CJrIgMkACADQcAWakG4gMAAEF8gA0HIHGpB8IDAABBfIANBCGo
    gA0HAFmogA0HIHGoQSSADQYgBakE4EHIaIANBwAFqQTgQchogA0H4AWoQKgJAIAIQhAFFBEAgA0H4BGoQKiADQfgEaiAB
    EH4gA0H4BGoQSiADQfgHahBLIANB+AdqIAIQfyADQfgHahBHIANByBxqIANB+AdqEIUBIANBuAlqIANByBxqEIUBIANBy
    BxqIANBuAhqEIUBIANB+AlqIANByBxqEIUBIANBuApqECogA0G4DWoQYCADQbgKaiADQfgEahB+IANBwBNqECogA0HAE2
    ogA0H4BGoQfiADQcATahCcASADQcABaiADQYgBahBUQX9qIQIDQCACQQFNBEAgA0G4DWoQkwEgACADQbgNakGIBhBnGgw
    DBSADQbgNahAbIANBwBZqIANBuApqIANBuAlqIANB+AlqEBcCQAJAAkAgA0HAAWogAkF/aiICEFcgA0GIAWogAhBXa0EB
    ag4DAQIAAgsgA0HIHGogA0G4CmogA0H4BGogA0G4CWogA0H4CWoQFiADQcAWaiADQcgcahAGDAELIANByBxqIANBuApqI
    ANBwBNqIANBuAlqIANB+AlqEBYgA0HAFmogA0HIHGoQBgsgA0G4DWogA0HAFmoQBAwBCwALAAsgABBgCyADQdAiaiQAC8
    MDARV/A0AgAUHAAUYEQAJAIABBKGohCyAAQRRqKAIAIgwhCCAAQRBqKAIAIg0hAyAAQQxqKAIAIg4hAiAAKAIIIg8hASA
    AQRhqKAIAIhAhCiAAQRxqKAIAIhEhBCAAQSBqKAIAIhIhByAAQSRqKAIAIhMhBgNAIAchCSAEIQcgCiEEIAVBgAJGDQEg
    AiADcSEUIAIgA3MhFSAFIAtqKAIAIAVB9J7AAGooAgAgBEEadyAEQRV3cyAEQQd3cyAGaiAJIARBf3NxIAQgB3FyampqI
    gYgCGohCiAFQQRqIQUgAyEIIAIhAyABIQIgAUEedyABQRN3cyABQQp3cyAUIAEgFXFzaiAGaiEBIAkhBgwACwALBSAAIA
    FqIgNB6ABqIANBzABqKAIAIANBKGooAgAgA0EsaigCACICQRl3IAJBDndzIAJBA3ZzIANB4ABqKAIAIgJBD3cgAkENd3M
    gAkEKdnNqamo2AgAgAUEEaiEBDAELCyAAIAYgE2o2AiQgACAJIBJqNgIgIAAgByARajYCHCAAIAQgEGo2AhggACAIIAxq
    NgIUIAAgAyANajYCECAAIAIgDmo2AgwgACABIA9qNgIIC9YDAgZ/An4jAEHwAGsiASQAIAFBoKfAABBfIAFBOGogARBfI
    AAQRAJAAkACQCABAn8gACgCOCICQRBMBEAgAkF/ahA5DAELIAEpAzAiCEIBfCIHIAhUDQEgACkDMCIIQoCAgICAgICAgH
    9RQQAgB0J/URsNAiABQThqIAggB3+nECghByABIAEpA2ggB0I6hnw3A2ggACABQThqEGIgABBEQQILIgMQLSAAQQhqIQQ
    DQCADRQ0DIAEgASkDCEI5hkKAgICAgICAgAKDIAEpAwBCAYeEIgc3AwAgASAAKQMAIAd9IgdC//////////8DgzcDOEEA
    IQIDQCAHQjqHIQcgAkEoRkUEQCABIAJqIgVBCGoiBiAFQRBqKQMAQjmGQoCAgICAgICAAoMgBikDAEIBh4QiCDcDACABI
    AJqQUBrIAIgBGopAwAgCH0gB3wiB0L//////////wODNwMAIAJBCGohAgwBCwsgASABKQMwQgGHIgg3AzAgASAAKQMwIA
    h9IAd8Igc3A2ggACABQThqIAdCP4enQQFqEE8gA0F/aiEDDAALAAtBoKLAAEEZQbyiwAAQWwALQdCiwABBH0G8osAAEFs
    ACyAAQQE2AjggAUHwAGokAAuhAwEBfyMAQZADayIGJAAgBkEIakHAABByGiAGQcgAakGoAhByGiAGQcgAahBDA0AgAQRA
    IAZByABqQQAQPiABQX9qIQEMAQUCQCACBEAgBkHIAGogAiADEHoLIAQEQCAGQcgAaiAEIAUQegsgBkGIA2pCADcDACAGQ
    YADakIANwMAIAZB+AJqQgA3AwAgBkIANwPwAiAGKAJIIQEgBigCTCECIAZByABqQYABED4DQCAGKAJIQf8DcUHAA0ZFBE
    AgBkHIAGpBABA+DAELCyAGQawBaiABNgIAIAZBqAFqIAI2AgAgBkHIAGoQEUEAIQJBACEBA0AgAUEgRkUEQCAGQfACaiA
    BaiABQXxxIAZqQdAAaigCACACQX9zQRhxdjoAACACQQhqIQIgAUEBaiEBDAELCyAGQcgAahBDQQAhAQNAIAFBIEZFBEAg
    BkEIaiABaiAGQfACaiABai0AADoAACABQQFqIQEMAQsLQQAhAQNAIAFBIEYNASAAIAFqIAZBCGogAWotAAA6AAAgAUEBa
    iEBDAALAAsLCyAGQZADaiQAC6EDAQN/IwBBgAZrIgEkACABIABBgAFqIgMQXiABQYABaiADEF4gAUGAAWoQMiABQYACai
    ABEF4gAUGAAmogAEGAAmoiAhAPIAFBgANqIAIQXiABQYADahAyIAIgAUGAAWoQkAEgAiABQYABahCVASACEKgBIAIQpwE
    gAhCnASACEKgBIAFBgANqQQwQnwEgAUGAA2oQVSABQYADahCoASABQYAEaiABQYADahBeIAFBgARqIAIQDyABQYAFaiAB
    QYABahBeIAFBgAVqIAFBgANqEJUBIAFBgAVqEKgBIAIgAUGAAmoQDyABQYACaiABQYADahCQASABQYACaiABQYADahCVA
    SABQYADaiABQYACahCVASABQYADahCoASABQYABaiABQYADahB9IAFBgAFqEKgBIAFBgAVqIAFBgAFqEA8gAUGABWogAU
    GABGoQlQEgAUGAAmogABCQASABQYACaiABEA8gACABQYABahCQASAAEKgBIAAgAUGAAmoQDyAAEKcBIAAQqAEgAyABQYA
    FahCQASADEKgBIAFBgAZqJAALhQMBBH8CQAJAIAFBgAJPBEAgAEEYaigCACEEAkACQCAAIAAoAgwiAkYEQCAAQRRBECAA
    QRRqIgIoAgAiAxtqKAIAIgENAUEAIQIMAgsgACgCCCIBIAI2AgwgAiABNgIIDAELIAIgAEEQaiADGyEDA0AgAyEFIAEiA
    kEUaiIDKAIAIgFFBEAgAkEQaiEDIAIoAhAhAQsgAQ0ACyAFQQA2AgALIARFDQIgACAAQRxqKAIAQQJ0QeS3wQBqIgEoAg
    BHBEAgBEEQQRQgBCgCECAARhtqIAI2AgAgAkUNAwwCCyABIAI2AgAgAg0BQdi1wQBB2LXBACgCAEF+IAAoAhx3cTYCAA8
    LIABBDGooAgAiAiAAQQhqKAIAIgBHBEAgACACNgIMIAIgADYCCA8LQdS1wQBB1LXBACgCAEF+IAFBA3Z3cTYCAAwBCyAC
    IAQ2AhggACgCECIBBEAgAiABNgIQIAEgAjYCGAsgAEEUaigCACIARQ0AIAJBFGogADYCACAAIAI2AhgLC7MCAQF/IwBBg
    AtrIgUkACAFEC8gBUGAAmoQLyAFQYAEahAvIAVBgAZqQTgQchogBUEBNgK4BiAFQcAGakE4EHIaIAVB+AZqQQE2AgAgBU
    GAB2pBOBByGiAFQQE2ArgHIAVBwAdqQTgQchogBUH4B2pBATYCACAFQYAIakE4EHIaIAVBATYCuAggBUHACGpBOBByGiA
    FQfgIakEBNgIAIAEgAiAFQYAGaiAFQYAHaiAFQYAIahAeIAVBgAhqIAMQoAEgBUGABmogBBCgASAFQYAJaiAFQYAGaiAF
    QYAHahCRASAFIAVBgAlqEJIBIAVBgAlqIAVBgAhqEJsBIAVBgARqIAVBgAlqEJIBIAVBgARqEGYgACAFIAVBgAJqIAVBg
    ARqEHYgAEEDNgKABiAFQYALaiQAC7ECAQF/IwBBgAtrIgQkACAEEC8gBEGAAmoQLyAEQYAEahAvIARBgAZqQTgQchogBE
    EBNgK4BiAEQcAGakE4EHIaIARB+AZqQQE2AgAgBEGAB2pBOBByGiAEQQE2ArgHIARBwAdqQTgQchogBEH4B2pBATYCACA
    EQYAIakE4EHIaIARBATYCuAggBEHACGpBOBByGiAEQfgIakEBNgIAIAEgBEGABmogBEGAB2ogBEGACGoQJSAEQYAIaiAC
    EKABIARBgAZqIAMQoAEgBEGACWogBEGABmogBEGAB2oQkQEgBCAEQYAJahCSASAEQYAJaiAEQYAIahCbASAEQYAEaiAEQ
    YAJahCSASAEQYAEahBmIAAgBCAEQYACaiAEQYAEahB2IABBAzYCgAYgBEGAC2okAAvJAgEDfyMAQcACayIBJAAgASAAQU
    BrIgMQhQEgARADIAFBQGsgAxCFASABQUBrIABBgAFqIgIQSCABQYABaiACEIUBIAFBgAFqEAMgAiABEKUBIAIgARB4IAI
    QRCACEE4gAhBOIAIQRCABQYABakEMEFIgAUHAAWogAUGAAWoQhQEgAUHAAWogAhBIIAFBgAJqIAEQhQEgAUGAAmogAUGA
    AWoQeCABQYACahBEIAIgAUFAaxBIIAFBQGsgAUGAAWoQpQEgAUFAayABQYABahB4IAFBgAFqIAFBQGsQeCABIAFBgAFqE
    IABIAEQRCABQYACaiABEEggAUGAAmogAUHAAWoQeCABQUBrIAAQpQEgAUFAayADEEggACABEKUBIAAQRCAAIAFBQGsQSC
    AAEE4gABBEIAMgAUGAAmoQpQEgAxBEIAFBwAJqJAALrQIBA38jAEGABGsiAiQAIAIgABBeIAJBgAFqIABBgAFqIgMQXiA
    CQYACakE4EHIaIAJBATYCuAIgAkHAAmpBOBByGiACQfgCakEBNgIAIAJBgANqIAMQXiACIAEQDyACQYABaiABQYABaiIE
    EA8gAkGAAmogBBCQASACQYACaiABEJUBIAJBgANqIAAQlQEgAkGAAmoQqAEgAkGAA2oQqAEgAkGAA2ogAkGAAmoQDyACQ
    YACaiACEJABIAJBgAJqEDogAkGAA2ogAkGAAmoQlQEgAkGAA2oQqAEgAkGAAmogAkGAAWoQkAEgAkGAAmoQOiADIAJBgA
    NqEJABIAMgAkGAAmoQlQEgAkGAAWoQVSAAIAJBgAFqEJABIAAgAhCVASAAEKwBIAJBgARqJAALvQIBA38jAEGACGsiASQ
    AIAEgABCOASABQYACaiAAQYAEaiICEI4BIAFBgARqIABBgAJqIgMQjgEgAUGABmoQLyAAECIgAUGABmogABCSASABQYAG
    aiAAEJYBIAAgAUGABmoQlgEgABCsASABELYBIAEQrwEgACABEJYBIAFBgAJqECIgAUGAAmoQZiABQYAGaiABQYACahCSA
    SABQYAGaiABQYACahCWASABQYACaiABQYAGahCWASABQYACahCsASABQYAEahAiIAFBgAZqIAFBgARqEJIBIAFBgAZqIA
    FBgARqEJYBIAFBgARqIAFBgAZqEJYBIAFBgARqEKwBIAMQrgEgAxCvASACELYBIAIQrwEgAyABQYACahCWASACIAFBgAR
    qEJYBIABBBTYCgAYgABCaASABQYAIaiQAC7ICAQN/IwBBgAhrIgEkACAAKAKABkEBRwRAIAEgABCOASABQYACaiAAQYAC
    aiIDEI4BIAFBgARqIABBgARqIgIQjgEgAUGABmogABCOASABECIgAUGAAmogAhAZIAFBgAJqEK8BIAFBgAJqEKwBIAFBg
    ARqECIgAUGABmogAxAZIAFBgAZqEK8BIAIgABCWASACIAMQlgEgAhCsASACECIgACABEJIBIAEgAUGAAmoQlgEgARCsAS
    ABIAFBgARqEJYBIAEgAUGABmoQlgEgARCsASABECsgAUGAAmoQZiABQYAEahBmIAAgAUGAAmoQlgEgAyABQYAEahCSASA
    DIAFBgAZqEJYBIAIgARCWASAAQQRBBSAAKAKABkF+cUECRhs2AoAGIAAQmQELIAFBgAhqJAALigIBAn8jAEHgAWsiAiQA
    IAAQRCACQQhqQTAQchogAkIBNwMAIAJBOGogABBfIAJB8ABqIAEQXyACQagBakE4EHIaIAAQdANAIAJBOGogAkHwAGoQN
    UF/TARAA0ACQCADQQBMDQAgAkHwAGpBARA7IAJBARA7IAJBqAFqIAJBOGoQayACQagBaiACQfAAahBiIAJBqAFqEEQgAk
    E4aiACQagBaiACKQPYAUI/h6dBAWoiARBPIAJBqAFqIAAQayACQagBaiACEGEgAkGoAWoQRCAAIAJBqAFqIAEQTyADQX9
    qIQMMAQsLBSACQQEQLSACQfAAakEBEC0gA0EBaiEDDAELCyACQeABaiQAC54CAQF/IwBBgA1rIgMkACADIAEQaiADEJkB
    IANBiAZqIAIQXyADQYgGahBEIANBwAZqIANBiAZqEF8gA0HABmpBAxAoGiADQcAGahBEIANB+AZqIAMQagJAIANBwAZqE
    FpFBEAgA0HABmoQKUF/aiECA0AgAkEBTQRAIANB+AZqEJoBDAMLIANB+AZqEBoCQAJAIANBwAZqIAJBf2oiAhBXIANBiA
    ZqIAIQV2tBAWoOAwECAAILIANB+AZqIAMQDgwBCyADEJMBIANB+AZqIAMQDiADEJMBDAALAAsgA0H4BmoQsAEgA0H4B2o
    QqQEgA0H4CGoQrQEgA0H4CmoQrQEgA0EBNgL4DAsgACADQfgGakGIBhBnGiADQYANaiQAC5ACAQJ/IwBBgAJrIgUkACAF
    QYABaiAAEF4gAiAFQYABahCQASAFQYABaiAAQYABahBeIAQgBUGAAWoQkAEgBUGAAWogAEGAAmoiBhBeIAUgBUGAAWoQX
    iAFQYABaiAGEF4gAyAFQYABahCQASAFQYABaiABQYABaiIGEF4gBSAFQYABahAPIAVBgAFqIAEQXiADIAVBgAFqEA8gAi
    ADEH0gAhCoASAEIAUQfSAEEKgBIAUgAhCQASACEFUgAhCoASAFQYABaiAGEF4gBSAFQYABahAPIAMgBBCQASAFQYABaiA
    BEF4gAyAFQYABahAPIAMgBRB9IAMQqAEgBBA6IAQQqAEgACABEAsgBUGAAmokAAvkAQECfyMAQcABayIDJAAgAxBLIAAg
    ASACQR91IgQgAnMgBEF/c2pBAm0iAkF/akEfdhBtIAAgAUHAAWogAkEBc0F/akEfdhBtIAAgAUGAA2ogAkECc0F/akEfd
    hBtIAAgAUHABGogAkEDc0F/akEfdhBtIAAgAUGABmogAkEEc0F/akEfdhBtIAAgAUHAB2ogAkEFc0F/akEfdhBtIAAgAU
    GACWogAkEGc0F/akEfdhBtIAAgAUHACmogAkEHc0F/akEfdhBtIAMgABB/IAMQpgEgACADIARBAXEQbSADQcABaiQAC+Q
    BAQJ/IwBBgANrIgMkACADECogACABIAJBH3UiBCACcyAEQX9zakECbSICQX9qQR92EG8gACABQYADaiACQQFzQX9qQR92
    EG8gACABQYAGaiACQQJzQX9qQR92EG8gACABQYAJaiACQQNzQX9qQR92EG8gACABQYAMaiACQQRzQX9qQR92EG8gACABQ
    YAPaiACQQVzQX9qQR92EG8gACABQYASaiACQQZzQX9qQR92EG8gACABQYAVaiACQQdzQX9qQR92EG8gAyAAEH4gAxCcAS
    AAIAMgBEEBcRBvIANBgANqJAALvAEBAn8jAEGwAWsiAiQAIAJBMBByIQIDQCADQTBGBEACQCABQTBqIQEgAkEwaiACEHV
    BACEDA0AgA0EwRg0BIAIgA2ogASADai0AADoAACADQQFqIQMMAAsACwUgAiADaiABIANqLQAAOgAAIANBAWohAwwBCwsg
    AkHwAGogAhB1IABBOBByIgBBATYCOCAAQUBrQTgQciAAQfgAakEBNgIAIAAgAkHwAGoQpQEgAkEwahClASACQbABaiQAC
    9QBAQJ/IwBBgANrIgEkACABIAAQXiABQYABaiAAQYABaiICEF4gAUGAAmogABBeIAFBgAJqIAIQDyABIAIQlQEgAUGAAW
    oQVSABQYABaiAAEJUBIAEQqAEgAUGAAWoQqAEgACABEJABIAAgAUGAAWoQDyABQYABaiABQYACahCQASABQYABahBVIAF
    BgAFqIAFBgAJqEJUBIAFBgAFqEKgBIAFBgAFqEDogACABQYABahCVASABQYACahCnASACIAFBgAJqEJABIAAQrAEgAUGA
    A2okAAvEAQEBfyMAQYADayIDJAAgA0EIaiABEIUBAkAgAkUEQCADQQhqEAcMAQsgA0EIaiACEKUBCyADQcgAakHYo8AAE
    F8gA0GAAWogA0HIAGoQiwEgA0HAAWogA0EIahCFASADQcABahADIANBwAFqIAEQSCAAIAEQhQEgACADQQhqEEggA0GAAm
    ogA0HAAWoQhQEgABBYIQEgA0HAAmogABCFASADQcACahBBIANBwAJqEEQgACADQcACaiABEHkgA0GAA2okAAufAQEBfyM
    AQfAAayICJAAgAiABEF9BACEBIAJBOGpBOBByGiAAEEQCQCAAIAIQNUEASA0AA0AgAkEBEC0gAUEBaiEBIAAgAhA1QX9K
    DQALA0AgAUEATA0BIAJBARA7IAJBOGogABBrIAJBOGogAhBiIAJBOGoQRCAAIAJBOGogAikDaEI/h6dBAWoQTyABQX9qI
    QEMAAsACyACQfAAaiQAC7IBAQF/IwBBgAJrIgQkACAEQYABaiAAEF4gAyAEQYABahCQASAEQYABaiAAQYABahBeIAQgBE
    GAAWoQXiAEQYABaiAAQYACahBeIAIgBEGAAWoQkAEgASAEEJABIAEgAhAPIAMQMiAEEDIgAhAyIAEQpwEgARA6IAEQqAE
    gARBVIAEQqAEgAkEMEJ8BIANBAxCfASACEFUgAhCoASACIAQQfSACEKgBIAAQFCAEQYACaiQAC58BAQJ/IwBBgAJrIgIk
    ACAAIAEQXiAAEDIgAkGIAWpB2KTAABBfIAJBCGpBOBByGiACQQE2AkAgAkHIAGpBOBByIAJBgAFqQQE2AgAgAkHAAWogA
    kGIAWoQiwEgAkEIaiACQcABahClARCyASACQQhqEKgBIAJBCGoQVSACQQhqEKgBIAAgARAPIAAgAkEIahCVASAAEKsBIA
    JBgAJqJAALowEBAX8jAEEwayIGJAAgBkEQaiAAIAEQsQEgBiAGKAIUIgA2AhwgBiAGKAIQIgE2AhggBkEIaiACIAMQsQE
    gBiAGKAIMIgI2AiQgBiAGKAIIIgM2AiAgBiAEIAUQsQEgBiAGKAIEIgQ2AiwgBiAGKAIAIgU2AiggASAAIAMgAiAFIAQQ
    ACAGQShqEKQBIAZBIGoQpAEgBkEYahCkASAGQTBqJAALiAECA38DfiMAQRBrIgIkAAN+IANBOEYEfiACQRBqJAAgBgUgA
    iAAIANqIgQpAwAiBSAFQj+HIAGsIgUgBUI/hxAxIAQgAikDACIHIAZ8IgVC//////////8DgzcDACAFIAdUrSACQQhqKQ
    MAIAZCP4d8fEIGhiAFQjqIhCEGIANBCGohAwwBCwsLhAECA38BfiMAQUBqIgEkACABQQhqIAAQXyABQQhqEEQgAUE4aiE
    CQQYhA0HcAiEAAn8DQEEAIANBAEgNARogAikDACIEUARAIAJBeGohAiAAQUZqIQAgA0F/aiEDDAELCwN/IARQBH8gAAUg
    AEEBaiEAIARCAn8hBAwBCwsLIAFBQGskAAuHAQEBfyMAQcABayIBJAAgAEE4EHIiAEEBNgI4IABBQGtBOBByGiAAQfgAa
    kEBNgIAIAEQUCABQYgBakE4EHIaIABBgAFqIAFBgAEQZxogAEGAAmpBOBByGiAAQbgCakEBNgIAIABBvAJqIAFBhAFqQT
    wQZxogAEH4AmpBATYCACABQcABaiQAC48BAQJ/IwBBgAJrIgEkACAAEKwBIAEgABBeIAFBgAFqQTgQchogAUEBNgK4ASA
    BQcABakE4EHIaIAFB+AFqQQE2AgAgASAAQYABaiICEJUBIAEQOiABQYABaiABEJABIAFBgAFqIAIQlQEgAiABEJABIAIg
    ABCVASAAIAFBgAFqEJABIAAQrAEgAUGAAmokAAt9AgF/An4jAEGAAWsiASQAIAFBCGogABCFASABQQhqEBIgAUHIAGogA
    UEIahCDAUEIIQADQCAAQThGRQRAIAFByABqIABqKQMAIAKEIQIgAEEIaiEADAELCyABKQNIIQMgAUGAAWokACACQn98IA
    NCAYVCf3yDQjqIp0EBcQuJAQIBfwJ+IAAgACkDMCABQT9xrSIDhiAAKQMoQTogAWtBP3GtIgSHhDcDMCAAQShqIQFBBiE
    CA0AgAkEBTQRAIAAgACkDACADhkL//////////wODNwMABSABIAEpAwAgA4ZC//////////8DgyABQXhqIgEpAwAgBIeE
    NwMAIAJBf2ohAgwBCwsLiQECAX8CfiAAIAApA2BBOiABQTpwIgFrrSIEhyAAKQNoIAGtIgOGhDcDaCAAQeAAaiEBQQ0hA
    gNAIAJBAU0EQCAAIAApAwAgA4ZC//////////8DgzcDAAUgASABKQMAIAOGQv//////////A4MgAUF4aiIBKQMAIASHhD
    cDACACQX9qIQIMAQsLC3EBAX8jAEFAaiIBJAAgAEE4EHIiAEEBNgI4IABBQGtBOBByGiAAQfgAakEBNgIAIAFBCGpBOBB
    yGiAAQYABakE4EHIaIABBuAFqQQE2AgAgAEG8AWogAUEEakE8EGcaIABB+AFqQQE2AgAgAUFAayQAC4EBAgF/AX4gAEHw
    ABByIQADQCACQThGBEACQCAAIAEpAzAiA0I6hzcDOCAAIANC//////////8DgzcDMCAAQUBrIQBBACECA0AgAkEwRg0BI
    AAgAmpCADcDACACQQhqIQIMAAsACwUgACACaiABIAJqKQMANwMAIAJBCGohAgwBCwsLdQECfiAAIANCIIgiBSABQiCIIg
    Z+IAIgA358IAEgBH58IANC/////w+DIgIgAUL/////D4MiAX4iA0IgiCACIAZ+fCICQiCIfCABIAV+IAJC/////w+DfCI
    BQiCIfDcDCCAAIANC/////w+DIAFCIIaENwMAC3YBAn8jAEHAAWsiASQAIAEgABCFASABQUBrIAAQhQEgAUGAAWogAEFA
    ayICEIUBIAEgAhB4IAFBQGsgABB4IAFBQGsQRCACIAFBQGsQSCABQYABahBBIAAgAUGAAWoQeCABEEQgABBEIAAgARBII
    AFBwAFqJAALkwEBAn9B0LXBAEHQtcEAKAIAQQFqNgIAAkACQEGYucEAKAIAQQFGBEBBnLnBAEGcucEAKAIAQQFqIgA2Ag
    AgAEECSw0CQaC5wQAoAgAiAUF/Sg0BDAILQZi5wQBCgYCAgBA3AwBBoLnBACgCACIAQQBIDQFBoLnBACAANgIAAAtBoLn
    BACABNgIAIABBAUsNAAALAAtnAQJ/IwBBQGoiAiQAIAAQRCACIAAQhQECQCABRQRAIAAQBwwBCyAAIAEQpQELQQAhAQNA
    IAFBAUsgA3JFBEAgABADIAFBAEchAyABIAFFaiEBDAELCyAAIAIQSCAAEBIgAkFAayQAC18CAX8EfkIBIQNBMCECA38gA
    kF4RgR/IARCAYYgA3ynQX9qBSABIAJqKQMAIgUgACACaikDACIGfUI6hyADgyAEhCEEIAJBeGohAiAFIAaFQn98QjqHIA
    ODIQMMAQsLC2ACAX8EfkIBIQNB6AAhAgN/IAJBeEYEfyAEQgGGIAN8p0F/agUgASACaikDACIFIAAgAmopAwAiBn1COoc
    gA4MgBIQhBCACQXhqIQIgBSAGhUJ/fEI6hyADgyEDDAELCwt3AQN/IwBBgAJrIgIkACACIAEQXiACQYABaiABEF4gAhAy
    IAJBgAFqIAIQDyAAIAJBgAFqEJcBIABBgAJqIgMgAkGAAWoQlwEgAEGABGoiBCACQYABahCXASADIAEQogEgBCACEKIBI
    ABBBTYCgAYgAkGAAmokAAt6AQF/IwBB4ANrIgEkACABQYABakHApcAAEF8gAUG4AWpB+KXAABBfIAEgAUGAAWogAUG4AW
    oQSSABQfACakGwpsAAEF8gAUGoA2pB6KbAABBfIAFB8AFqIAFB8AJqIAFBqANqEEkgACABIAFB8AFqED8gAUHgA2okAAt
    nACAAQQF2IAByIgBBAnYgAHIiAEEEdiAAciIAQQh2IAByIgBBEHYgAHIiACAAQQF2QdWq1aoFcWsiAEECdkGz5syZA3Eg
    AEGz5syZA3FqIgBBBHYgAGpBj568+ABxQYGChAhsQRh2C2cBAn8jAEGAAWsiASQAIAEgABCFASABQUBrQTgQchogAUEBN
    gJ4IAEgAEFAayICEHggARBBIAFBQGsgARClASABQUBrIAIQeCACIAEQpQEgAiAAEHggACABQUBrEKUBIAFBgAFqJAALaA
    IBfwJ+IAFBP3GtIQNBOiABa0E/ca0hBEEAIQEDQCABQTBGBEAgACAAKQMwIAOHNwMwBSAAIAFqIgIgAkEIaikDACAEhkL
    //////////wODIAIpAwAgA4eENwMAIAFBCGohAQwBCwsLbAEBfyMAQTBrIgMkACADIAE2AgQgAyAANgIAIANBHGpBAjYC
    ACADQSxqQQI2AgAgA0ICNwIMIANBlKjAADYCCCADQQI2AiQgAyADQSBqNgIYIAMgAzYCKCADIANBBGo2AiAgA0EIaiACE
    HAAC2wBAX8jAEEwayIDJAAgAyABNgIEIAMgADYCACADQRxqQQI2AgAgA0EsakECNgIAIANCAjcCDCADQbCqwAA2AgggA0
    ECNgIkIAMgA0EgajYCGCADIANBBGo2AiggAyADNgIgIANBCGogAhBwAAtlAQJ/IAAgACgCACICQQhqIgM2AgAgACACQQN
    2QTxxakEoaiICIAFB/wFxIAIoAgBBCHRyNgIAAkACQCADRQRAIABBADYCACAAIAAoAgRBAWo2AgQMAQsgA0H/A3ENAQsg
    ABARCwtnAQF/IwBBgAJrIgMkACAAECogACABEJABIABBgAFqIgEgAhCQASAAQYACahCwASAAEKgBIAMgABAmIANBgAFqI
    AEQXiADQYABahAyIANBgAFqIAMQe0UEQCAAEJgBCyADQYACaiQAC18BAn8jAEGAAWsiASQAIAAQqAEgASAAEIUBIAFBQG
    sgAEFAayICEIUBIAEQAyABQUBrEAMgASABQUBrEHggAUEAEDQgACABEEggARBBIAEQRCACIAEQSCABQYABaiQAC10BAn8
    jAEFAaiIBJAAgAUEIakGgp8AAEF8gAUEIaiAAKAI4QX9qEDkiAhAtIAAgAUEIahBjIABBASACQQFqQR9xdCICNgI4IAJB
    gICAEE4EQCAAEBILIAFBQGskAAtfAgF/AX4jAEHwAGsiASQAIAFBoKfAABBfIAApAwAhAiABQThqIAAQXyAAQQEQOyABQ
    ThqIAEQYSABQThqEEQgAUE4akEBEDsgACABQThqIAJCAoGnEE8gAUHwAGokAAt7AQJ/IABBKGohAgNAIAFBgAJGBEAgAE
    LnzKfQ1tDrs7t/NwIIIABCADcCACAAQSBqQquzj/yRo7Pw2wA3AgAgAEEYakL/pLmIxZHagpt/NwIAIABBEGpC8ua746O
    n/aelfzcCAAUgASACakEANgIAIAFBBGohAQwBCwsLaQICfwF+IAAgACkDACIDQv//////////A4M3AwBBCCEBA0AgA0I6
    hyEDIAFBMEYEQCAAIAApAzAgA3w3AzAFIAAgAWoiAiACKQMAIAN8IgNC//////////8DgzcDACABQQhqIQEMAQsLC2oCA
    n8BfiAAIAApAwAiA0L//////////wODNwMAQQghAQNAIANCOochAyABQegARgRAIAAgACkDaCADfDcDaAUgACABaiICIA
    IpAwAgA3wiA0L//////////wODNwMAIAFBCGohAQwBCwsLWQEBfyMAQYADayIEJAAgBCADEF4gBBBAIARBgAFqIAEQXiA
    EQYACaiACEF4gBEGAAWogBBAPIARBgAJqIAQQDyAAIARBgAFqIARBgAJqEJEBIARBgANqJAALWQECfyMAQUBqIgEkAAJA
    IAAQhAENACABQQEQigEgAEGAAWoiAiABEFkNACACQQAQNCAAIAIQSCAAEBIgAEFAayIAIAIQSCAAEBIgAiABEKUBCyABQ
    UBrJAALVwEBfyMAQbABayICJAAgATQCOCAANAI4fkKAgIAQWQRAIAAQEgsgAkEIaiAAIAEQCCACQfgAaiACQQhqEAUgAC
    ACQfgAahBrIABBAjYCOCACQbABaiQAC08BAn8jAEFAaiIDJAAgAEE4EHIiAEEBNgI4IABBQGtBOBByIABB+ABqQQE2AgA
    gAyABEIsBIAAgAxClASADIAIQiwEgAxClASADQUBrJAALWQECfyMAQYABayIBJAACQCAAEIgBDQAgARBQIABBgAJqIgIg
    ARB7DQAgAhBAIAAgAhAPIAAQqwEgAEGAAWoiACACEA8gABCrASACIAEQkAELIAFBgAFqJAALSwEBfyMAQUBqIgEkACAAQ
    TgQciIAQQE2AjggAUEBEIoBIABBQGsgAUHAABBnGiAAQYABakE4EHIaIABBuAFqQQE2AgAgAUFAayQAC0sBAn8jAEHwAG
    siASQAIAAQd0UEQCABQaCnwAAQXyABQThqIAAQgwEgASABQThqEGIgARBEIAFBOGogARA1IQILIAFB8ABqJAAgAgtPAQF
    /IwBBgAFrIgIkACAAIAEQhQEgABADIAJByABqQdikwAAQXyACQQhqIAJByABqEIsBIAAgARBIIAAgAkEIahB4IAAQEiAC
    QYABaiQAC0kBAn8DQCABQThGRQRAIAAgAWoiAiACKQMAQgGGNwMAIAFBCGohAQwBCwsgACAAKAI4QQF0IgE2AjggAUGAg
    IAQTgRAIAAQEgsLQgIBfwJ+QQAgAmusIQQDQCADQThHBEAgACADaiICIAIpAwAiBSABIANqKQMAhSAEgyAFhTcDACADQQ
    hqIQMMAQsLC0YBAn8jAEFAaiIBJAAgAEE4EHIiAEEBNgI4IABBQGtBOBByIABB+ABqQQE2AgAgAUEBEIoBIAAgARClARC
    yASABQUBrJAALTgEBfyMAQYAEayIBJAAgABAvIAEQLyABQYACahAvIABBgAJqIAFBgAIQZxogAEGABGogAUGAAmpBgAIQ
    ZxogAEEANgKABiABQYAEaiQAC0sBAX8jAEFAaiICJAACQCAAKAI4IAFsQYCAgBBOBEAgAiABEIoBIAAgAhBIDAELIAAgA
    RAoGiAAIAAoAjggAWw2AjgLIAJBQGskAAtKAAJ/IAFBgIDEAEcEQEEBIAAoAhggASAAQRxqKAIAKAIQEQMADQEaCyACRQ
    RAQQAPCyAAKAIYIAJBACAAQRxqKAIAKAIMEQUACwtCAQF/IwBBQGoiAiQAIAJBCGpBgIDAABBfIAEgAkEIahBrIAEQRCA
    AIAEQayAAQQMQKBogABBEIAAQKSACQUBrJAALSQECfyMAQcABayIBJAAgASAAEF4gAUGAAWogABCFASAAIABBQGsiAhCl
    ASAAEEEgAiABQYABahClASAAIAEQlQEgAUHAAWokAAtIAQF/IwBB4AFrIgEkACABQeihwAAQXyABQThqIAAgARAIIAFBq
    AFqIAFBOGoQBSAAIAFBqAFqEGsgAEECNgI4IAFB4AFqJAALPgEBfyABQTpuIQIgAUGVA00EQCAAIAJBA3RqKQMAQgEgAU
    H//wNxQTpwrYaDQgBVDwsgAkEHQdSdwAAQPAALQAIBfwF+IwBBgAFrIgEkACABQQhqIAAQhQEgAUEIahASIAFByABqIAF
    BCGoQgwEgASkDSCABQYABaiQAQgKBpws8AQF/IwBBgAFrIgIkACACIAAQhQEgAkFAayABEIUBIAIQEiACQUBrEBIgAiAC
    QUBrEDUgAkGAAWokAEULPAIBfwF+A38gAUE4RgR/IAJCf3xCgICAgICAgIAEg0I6iKcFIAAgAWopAwAgAoQhAiABQQhqI
    QEMAQsLC0cBAX8jAEEgayIDJAAgA0EUakEANgIAIANB9KrAADYCECADQgE3AgQgAyABNgIcIAMgADYCGCADIANBGGo2Ag
    AgAyACEHAACzkBAX8jAEFAaiICJAAgAiAAEIUBIAIQByABBEAgASACEKUBCyACEAMgAiAAEEggAhAsIAJBQGskAAs6AQF
    /IABBOBByIQADQCACQTBGRQRAIABBCBAtIAAgACkDACABIAJqMQAAfDcDACACQQFqIQIMAQsLCzQBAX8gAEE4EHIiAEEB
    NgI4IABBQGtBOBByIABB+ABqQQE2AgAgACABEKUBIAFBQGsQpQELMAEBfyAAQTgQciEAA0AgAkE4RwRAIAAgAmogASACa
    ikDADcDACACQQhqIQIMAQsLCz8BAX8jAEGAAmsiASQAIAAQUSABEG4gACABEJIBIABBgAJqEK0BIABBgARqEK0BIABBAT
    YCgAYgAUGAAmokAAswAQJ/A0AgAkE4RwRAIAAgAmoiAyADKQMAIAEgAmopAwB8NwMAIAJBCGohAgwBCwsLMAECfwNAIAJ
    BOEcEQCAAIAJqIgMgAykDACABIAJqKQMAfTcDACACQQhqIQIMAQsLCzABAn8DQCACQThHBEAgACACaiIDIAEgAmopAwAg
    AykDAH03AwAgAkEIaiECDAELCwsxAQJ/A0AgAkHwAEcEQCAAIAJqIgMgAykDACABIAJqKQMAfTcDACACQQhqIQIMAQsLC
    zEBAn8DQCACQfAARwRAIAAgAmoiAyADKQMAIAEgAmopAwB8NwMAIAJBCGohAgwBCwsLOQECfyMAQYABayIBJAAgASAAQY
    ABaiICEF4gAiAAEJABIAEQVSAAIAEQkAEgABCsASABQYABaiQACzMBAX8gAgRAIAAhAwNAIAMgAS0AADoAACABQQFqIQE
    gA0EBaiEDIAJBf2oiAg0ACwsgAAtIAQN/IwBBEGsiASQAIAAoAgwhAyAAKAIIIgJFBEBB9KrAAEErQaCrwAAQWwALIAEg
    AzYCCCABIAA2AgQgASACNgIAIAEQcQALMgEBfyAAQgE3AwBBCCEBA0AgAUE4RkUEQCAAIAFqQgA3AwAgAUEIaiEBDAELC
    yAAEFYLNwAgABBRIAAgARCSASAAQYACaiABQYACahCSASAAQYAEaiABQYAEahCSASAAIAEoAoAGNgKABgsoAQF/A0AgAk
    E4RwRAIAAgAmogASACaikDADcDACACQQhqIQIMAQsLCzMAIAAgARCSASAAQYACaiABQYACahCSASAAQYAEaiABQYAEahC
    SASAAIAEoAoAGNgKABgsoACAAIAEgAhB5IABBQGsgAUFAayACEHkgAEGAAWogAUGAAWogAhB5Cy4BAX8jAEGAAWsiASQA
    IAAQLyABEFAgACABEJABIABBgAFqEKkBIAFBgAFqJAALLQAgACABIAIQjwEgAEGAAWogAUGAAWogAhCPASAAQYACaiABQ
    YACaiACEI8BCzQBAX8jAEEQayICJAAgAiABNgIMIAIgADYCCCACQaSowAA2AgQgAkH0qsAANgIAIAIQaAALPgEBfyMAQR
    BrIgEkACABQQhqIABBCGooAgA2AgAgASAAKQIANwMAIAEoAgAiAEEUaigCABogACgCBBoQMwALKQEBfyABBEAgACECA0A
    gAkEAOgAAIAJBAWohAiABQX9qIgENAAsLIAALKwEBfyMAQcABayICJAAgAhBLIAIgARB/IAIQpgEgACACEAwgAkHAAWok
    AAsiAQF/A0AgAUE4RwRAIAAgAWpCADcDACABQQhqIQEMAQsLCycBAX8jAEFAaiICJAAgAkEIaiABEF0gACACQQhqEIsBI
    AJBQGskAAsrACAAEFEgACABEJIBIABBgAJqIAIQkgEgAEGABGogAxCSASAAQQU2AoAGCyMBAX8jAEFAaiIBJAAgASAAEI
    UBIAEQEiABEFogAUFAayQACykAIAAgARBhIAAgACgCOCABKAI4aiIBNgI4IAFBgICAEE4EQCAAEBILCyUAIAAgASACEE8
    gAEEAIAJrIAAoAjgiACABKAI4c3EgAHM2AjgLIwADQCACBEAgACABLQAAED4gAkF/aiECIAFBAWohAQwBCwsLIgACQCAA
    IAEQWUUNACAAQUBrIAFBQGsQWUUNAEEBDwtBAAskAAJAIABBfE0EQCAARQRAQQQhAAwCCyAAEAEiAA0BCwALIAALJwEBf
    yMAQYABayICJAAgAiABEF4gAhA6IAAgAhCVASACQYABaiQACycAIAAgARCQASAAQYABaiABQYABahCQASAAQYACaiABQY
    ACahCQAQslACAAIAEQpQEgAEFAayABQUBrEKUBIABBgAFqIAFBgAFqEKUBCyUBAX8jAEFAaiICJAAgAiABEIUBIAIQQSA
    AIAIQeCACQUBrJAALKAEBfyMAQYACayICJAAgAiABEI4BIAIQKyAAIAIQlgEgAkGAAmokAAsjAEGEAiACSQRAIAJBhAIg
    AxA9AAsgACACNgIEIAAgATYCAAsiAQF/IwBB8ABrIgIkACACIAEQMCAAIAIQBSACQfAAaiQACxwAAkAgABB3RQ0AIABBg
    AFqEHdFDQBBAQ8LQQALHwAgAEE4EHIiAEEBNgI4IAAgARBrIAAgASgCODYCOAseAAJAIAAQhwFFDQAgAEGAAWoQhwFFDQ
    BBAQ8LQQALGwACQCAAEHdFDQAgAEFAaxB3RQ0AQQEPC0EACx4AAkAgABCHAUUNACAAQYACahCHAUUNAEEBDwtBAAsaAQF
    /IAAQWCIBIABBQGsQWCABcyAAEHdxcwsaACAAQTgQciIAQQE2AjggACABEJ0BIAAQVgsZACAAQTgQciIAQQE2AjggACAB
    EGsgABBWCxcAIAAQRCAAKAIAQX8gAUEfcXRBf3NxCxoAIAAgARBfIAAgAhAkIAAgAhBjIAAgAhAkCxwAIAAQLyAAIAEQk
    AEgAEGAAWogAUGAAWoQkAELGAAgACABIAIQeSAAQUBrIAFBQGsgAhB5CxYAIAAgARClASAAQUBrIAFBQGsQpQELGAAgAB
    AvIAAgARCQASAAQYABaiACEJABCxgAIAAgARCQASAAQYABaiABQYABahCQAQsZACAAEK4BIABBgAJqELYBIABBgARqEK4
    BCxcAIAAQsgEgAEFAaxBpIABBgAFqELIBCxQAIAAgARB4IABBQGsgAUFAaxB4CxgAIAAgARCVASAAQYABaiABQYABahCV
    AQsYACAAEKYBIABBgAFqIgAQpgEgACABEA8LGQAgABCpASAAQYABahCwASAAQYACahCpAQsZACAAEKwBIABBgAJqEKwBI
    ABBgARqEKwBCxkAIAAQqgEgAEGAAmoQqgEgAEGABGoQqgELFgAgABAvIAAgARCQASAAQYABahCpAQsWACAAQYABaiIAEK
    gBIAAQOiAAEKgBCxQAIAAQRCAAIAApAwAgAax8NwMACxQAIAAQRCAAIAApAwAgAax9NwMACxEAIAAgARBSIABBQGsgARB
    SCxEAIAAgARBIIABBQGsgARBICxQAIAAgARCQASAAQYABaiACEJABCxIAIAAgARAPIABBgAFqIAEQDwsUACAAIAEQoAEg
    AEGAAWogARCgAQsRACAAKAIEBEAgACgCABAJCwsSACAAIAEQayAAIAEoAjg2AjgLDwAgAEFAayIAEEEgABBECw0AIAAQT
    iAAQUBrEE4LDQAgABBEIABBQGsQRAsPACAAELIBIABBQGsQsgELEAAgABCrASAAQYABahCrAQsNACAAEBIgAEFAaxASCx
    AAIAAQqAEgAEGAAWoQqAELEAAgABCpASAAQYABahCpAQsPACAAQYABahA6IAAQrAELEAAgABCnASAAQYABahCnAQsOACA
    AEGkgAEFAaxCyAQsQACAAIAI2AgQgACABNgIACw0AIAAQdCAAQQE2AjgLDAAgABBBIAAgARB4CwwAIAAgARBrIAAQVgsN
    ACAAEDogACABEJUBCwsAIAAQOiAAEKwBCwwAQunQotvMouq7RgsDAAELAwABCwv+PZoCAEGCgMAACwcBAAAAAQI0AEG4g
    MAAC9sBuF8jku11BwFjT+D5WE+pA2dPnKtLeD0Akew9ffXy9AMD1g8fDSwgAK1vjPCZwa4A8DtNkAEAAADzStxtEor3AI
    uwH1tTsFYDgvLFYx+X7AAysL/NHtseAkehVLifHyMCQHo6ogw4sQGz4sMPAAAAAHNyYy9ibHMxMjM4MS9wYWlyLnJzqAA
    QABQAAAAHAQAACQAAAKgAEAAUAAAADAEAAA0AAACoABAAFAAAABEBAAANAAAAAAAAAAEAAAD///8Dv/+W/78AaQM7VYAd
    moCAAefMIPV1pkwBp+1zAEGogsAACyz+//7///8BAosAgILYBPYB4Y1oiW++kwLOdqvfPagdAMZpulHOdt8Dy1nGFwBB4
    ILAAAuRAZABEAATAAAA0AEAABgAAACQARAAEwAAANQBAAARAAAAkAEQABMAAADWAQAAHAAAAHNyYy9ibHMxMjM4MS9lY3
    AucnMAkAEQABMAAAAZBQAADQAAAJABEAATAAAAGwUAAAkAAACQARAAEwAAABwFAAARAAAAkAEQABMAAAAfBQAAHAAAAAA
    AAAABAAEAAAABAjQAQaCEwAALuSCQARAAEwAAAGcEAAARAAAAkAEQABMAAABsBAAADQAAAJABEAATAAAAbgQAABUAAACQ
    ARAAEwAAAHAEAAAgAAAAHUxYLQgo9ADXXz44aOPbAInJGoj9roEBomOjmrkPTgGY6rCCSW3JAoBOWs9QOu4AimlEAQAAA
    ADgKxeO6UjMAXSpOluMVsgAolXvNe/8FADngsIBPcnDA8EWIDvuPnUAusRiAAwgWgDRCCkuAQAAALgh6L1iEMUA3/4Vlz
    tIpQGLCDH8A9S9AbsR/Cc0UtIDHfAS2hvXowEqPc423S/bAshidB8AAAAAKdKiiy66yAHqR06TLeDGAiSMtsYkvPEDAo/
    w3iCL+AGd1zE97u2BA4ilRy+cg4kDSMIIbgAAAAB7+wUWP99nAjJ7Fwrjx90CaW+GFDsANgMrVFv+4Zl3A8x9+g1bVtIB
    Aju2nPiBcwIH2iEDAQAAAJ4MOb5nECQDX97JALfLQgIx+rexS69LAYydZXIx6AACyy7dIo8TXQHUDYML8enzAuH4sWkBA
    AAAF+OXhGqYcQFbpdOtpXylAPrkHV2MkmwBFovSVX2eswF1O8QNmb5jAc0s5B7x42kCH8/TgAAAAACOyPDjGFbLAOdrHT
    0yPvIBmzNTJw/vYgALmsY2bZ2sAuVtNVN+EdEAIQ4duvj2agBw54F7AQAAAITtOaEl8tcBt7JLQTBKlADaqLKGnI8hAiN
    AhjM+PJkAhhWxv1LmigOwyY1aShP5A1Nl7dYAAAAAgyllb8bBEwFzRs+5ckvDAQgK+Wh+CbkCTntu5kll9wGxPNu1Sqf3
    AwZIdMD/xFwDUDIMYwEAAADZlYis6UwVARTxnQfMG4oChYnB+oJZtgK7IfzsX0loAZnbmVSOEeQDLK2Q2RB9ZgCjJpfpA
    AAAAGFomx1kiLMB8WQcxDiXuAEzNQgzG58oA8zGl/w2qpUB5PXXElTlBwN0goHTbRvzA2ZxjncBAAAAsNyerJ2fFwD4p1
    yCSo8PA1jJJY7GHlAC46GVD2alzAEkA84bmgrRATESRAc7nl0C2wVA1QAAAAC7g8uz8e40ALrVMMa8qTwCg7SGHg3HMwK
    X1V8Qqr1sAecXfByoRyECrC5iwcvqUAI+7ZRyAQAAALdJRnNiFqwCq1uLuXy1MABhhSxO22y1A4nJfwFciyICPjBrhRWY
    2QEHRAIu0MygA7HyBRoBAAAACt3saNGEYwELQBne0pLTATFZwTGPlzMBfdvdQN9bugO0gvaAZqWzAo9b2xG1SnoCqxP8l
    QAAAABB1qF5Oux2AxHckO6qpJkAOFCDmPNn2gBA0K3ZhMV1AI1/4Myjx68Bz4Kkl+BTaQNqzw6hAAAAAF5azL2b2fcBxL
    R4RCdSbgH6gMUimN8cAltmoKIpbwgDY39umQHPdABs/SyMLCpZA6nCekoBAAAAOkrobkl0JQA7G3jD49TsAKfO6e0qBnM
    AuDglhk69ZgJXD1chZ1ngAxiDz0OGTVoAz6osdwAAAAClBGOfovktAHDEowjxkjQAQPeCiUvyzgMOKTS1cjqnAzVXOenG
    BgUD30NOVe6ZOQGOXzXnAAAAAB6iMjVbOZ0DVAdezQfqpgC9qW0wO4NOAK017oqBhGYBx9//faDnQwNXx5sCKkWKACAWj
    joBAAAA2CzGjZPoDQMEcT27D0m1AZcE/dYovIoCMlNFlcVa/AAkCFtU60B8A/urDrK/uGIBGlglNAAAAAAZPrhcujnCAD
    +3PyWfJfQAas3qrBEL4ACZ8kczxmm9AUGJbx+Z8r8BivlNoJfI6AHlL5ayAAAAAP87K8huJ8gBeboJLBshqgI9cfWLxIg
    lAJsEMADCMygD6EFwNjblmAJEHC3SEGfVAt6lYSUBAAAAHBvSQPr5PAEmfg+Nb6A1AlUrxor8F4YAVnLqIm2NLgHv1QFv
    +tNLA4u5LIZrxj8DSNWojAAAAAAEtshpvla0AMEdB7C/n0ABZisb8FqpTwG3XuVoWRI+Ah0Yy7Uu30IDzkKpk/PAQwLp5
    GteAQAAAEsidVRxHmsC4e1rXtkmQQC6Rs6nltP1AKxmo5WhXwcCPWde/KPESAN9VqhAxDORA0WWElwAAAAAMwGY2/XT2Q
    IQmcoIRyvkA2zMWQbE0zICmU8AVjA1IAA7e3XcFeN7AisAv9ymskcDSjlaJAAAAAD4HpcL8ARMAYN8hGRkcBQCbPAzRnu
    ADgGcADvCmtCoALGnekQ/9QQAWEJVdObkBgDByoKxAAAAAI5NB9CkyAcCs4E10QZ9cwKdJEP2EfnnA6+5GAnDq+ICWTVS
    zO3S/gNQMEaut73NAwipRosBAAAAMsER0BpxEwA6v+6PM5fOAxsDYZ44FuQDYET/JL2yLQPLL82T+0MdA+NCf4NvNN8Ae
    eQTlwEAAAAwHHPK66qvA8qbrlN3FdwDs7lDTR7t5wFhGvjba0WeAgwqxCNKoa0Dea+OSG2vYQChp7vhAAAAAIel23tXDj
    cA2OiB4XGAlAGd5qsM8qHmAi16sAl3nlkAvTqPu6FNHgKIJyP6EpplA4sBxJ8AAAAAKftwGKNMXgFoTfq3P1SRAS9kQsg
    mbNoADvR/YPeO/wIFChd0xqYsAa9Jpvcbrs4AU418mAAAAADy1ulfhfhhAbJX0IORsB4CenTzNNbEEwDFSC0Thq8oA7hb
    5zxreScA9F2yLO8G6wO8ubBKAAAAAPClMzaxOrIBphygVrLJ2AMD4kRVrdPDAUHZ9d62vlID0Kd0oKbwuAFHeISI2tIYA
    KT8A2YBAAAA2/7o8uzatgEQKhBkAjf+Ae7CrVETIv0DDObhQjmP7wM2VRnEKRWiAvjTK9fEP/gD3j/AjAAAAADL9OWwd1
    w1Ail7h7GnrhYA5J3PUTLAPgKSJ3DkrTvkAqcq1FdndNgCRh0mXggHJgJuN4YfAAAAAPbhLcdA4t8A7kgBLIqFVAMmfdo
    AFLnkAxINi3OMYlkD4lIllEk7agAy4Si9mZulArqGxwwAAAAAlsZBLlrnlwD4L+qLZcRZAWxN03q2PjQCQT704DyVsAHp
    IxKDRvt2A7UNRHUEljsBEGqZNAEAAAAzuweXcUWYAq/w6M6mux4D0Dw9VFbJ9gJKrUiloSI5AhOtEfrcgEkBwkdnCbiT6
    AKBfNmQAAAAAI9LYx06RxUAEeAlTTxcvQDKBaLKVmPNAzvJTOHOiZcBD8RxwRl4DQJXCcmaD3C3AYEd+uAAAAAA9wbtJh
    Pc+gE0IDPFYe9FASDkgCSUJ98A0i0Hn6ScUwJbVr/yds1TAUP3otjOk8sCDkBgJgAAAADMRTNXOLGZAkewQu742AEAMGm
    42QCa7wJz9ZkIfCtmA0YzVJYUX7QAUUzY8PifHQMUlWutAAAAAJIQVuIptYQCpfqu3xsmWgJvURN56oyoAT4wSgs5vysC
    /5R/RwzFSAIHS2H9z0AHAnS2y6wAAAAAqGqPupy0+AAAgcHg06dwARqHXGpjbrMBZDmkmIbt5gDQbZwdkdIaACgEPFJvA
    akDniUvTQAAAABVP5G4i/RuAI3XbEr1qBcCc7xPfernkgEhTO0e9oSPAfcWMpCEStkDZYGgOoebwgHaXKVnAQAAAEpdU1
    WdPSMD2iCS5O69+AMshbQ5v8RQAxWvgmS9GpMDDPv5xEzX0QNT+YbGSBjbANOObIYBAAAA2S6BFVpB7gAYuXcAAmw9AJI
    rE1djIP0AzfpfP33oewE3pOVu/6a7An4374D6qY8Di/A+agEAAABcd2oSmRMaAU/ux2JpAKcCXx0FoADEWwJNd73jMzTq
    A/3sXkuC6awAzaHu8Mt2pgIIfABmAQAAAKy3+ap/R8YCgDhz6ndu4wCfRKb18LaHAbMXB2JDVRkDUgG3gjF4rAK6mexny
    7ZhAJdSno0AAAAAHQClESMUOQJ2e7v0A3fFAiBqkeyd/KABu1DB7qY9fAKc0cbcjSL4AkQyAyz50BcBlQcOvgAAAAAWVF
    9EmG3SAGrrpaCwPNkAJxf0anKeSAL2SDhM83ZvA8UV0dG07YkD70iDfOWUYwKHKH1rAQAAAPJnvz21OCUCR+Jbvo01XwF
    nyi7NedJdAtYwxPy5RlUBhcR4V7GObgGfq+rbiTaQAQYz31gAAAAAPaBJLiwQ9gJMjafU2IEJAYr3AT5FbzUAhJJyVhPH
    3ANPyIW4SMNDAFsvg4YHSOAAwnUtlgEAAADBYzawU5JHAUAbCIO9I9oAf6Dncr61MgIMu5svYOKVA20aYOnq0PoAUASGl
    CwmpwLDxBJhAQAAAHNyYy9ibHMxMjM4MS9iaWcucnMAoA4QABMAAADMAQAALQAAAKAOEAATAAAAzAEAADUAAACgDhAAEw
    AAABkCAAANAAAAoA4QABMAAAA4AwAAGAAAAKAOEAATAAAAOAMAACEAAACgDhAAEwAAAEIDAAAhAAAAoA4QABMAAABbAwA
    AFwAAAKAOEAATAAAAZAMAABcAAACgDhAAEwAAAHIDAAAwAAAAoA4QABMAAAB7AwAAMAAAAKAOEAATAAAApwMAABgAAACg
    DhAAEwAAALUDAAAYAAAAmC+KQpFEN3HP+8C1pdu16VvCVjnxEfFZpII/ktVeHKuYqgfYAVuDEr6FMSTDfQxVdF2+cv6x3
    oCnBtybdPGbwcFpm+SGR77vxp3BD8yhDCRvLOktqoR0StypsFzaiPl2UlE+mG3GMajIJwOwx39Zv/ML4MZHkafVUWPKBm
    cpKRSFCrcnOCEbLvxtLE0TDThTVHMKZbsKanYuycKBhSxykqHov6JLZhqocItLwqNRbMcZ6JLRJAaZ1oU1DvRwoGoQFsG
    kGQhsNx5Md0gntbywNLMMHDlKqthOT8qcW/NvLmjugo90b2OleBR4yIQIAseM+v++kOtsUKT3o/m+8nhxxkJMU19TSUdf
    QkxTMTIzODFHMV9YTUQ6U0hBLTI1Nl9TU1dVX1JPX05VTF8A0BAQABMAAAA/AAAALgAAANAQEAATAAAAPQAAABUAAADQE
    BAAEwAAAD0AAAANAAAAc3JjL2JsczEyMzgxL2Jscy5ycwAAAAAArve+1aE5BgLok91iZEwkAdIsbk61CS0C2+VwMbbEEQ
    GZYzb76G2KA7ycH+3PFk8AK2qmngEAAABhdHRlbXB0IHRvIGRpdmlkZSBieSB6ZXJvAAAAbxEQABIAAAB8AQAAFAAAAAA
    AAABhdHRlbXB0IHRvIGRpdmlkZSB3aXRoIG92ZXJmbG93c3JjL2JsczEyMzgxL2ZwLnJzAAAAbxEQABIAAAASAgAADQAA
    AG8REAASAAAAHgIAACYAAABvERAAEgAAAB4CAAAjAAAAbxEQABIAAAAkAgAAFwAAAG8REAASAAAAJAIAABQAAAAAAAAAq
    qr//////gHu//9UrP//AupBYg9rDyoBw5z9ShTOEwJLd2TXrEtDAu3pxpKm+V8Cox4RoAEAAABAEhAAFAAAABUBAAATAA
    AAQBIQABQAAAAeAQAAGAAAAEASEAAUAAAAJAEAABwAAABzcmMvYmxzMTIzODEvZWNwMi5ycwAAAAAEAEGQpcAAC7wGQBI
    QABQAAADmAgAACQAAAEASEAAUAAAA7gIAAA0AAABAEhAAFAAAAP4CAAAhAAAAuL0hwchWgAD1+24BqskAA7pwFz2uR7YA
    RNEK7ADpUwN65MZREMUtA0kBgkmkwiMALyuqJAAAAAB+KwRdBX2sAflVF+WERDwDNJME9ce9GwJp12rYgmRCA9BrWWVPJ
    4gA6DRrH9hnnAAFtgI+AQAAAAEouAiGVJMBeKIo6w5zsgIjyRINFpWmAQq1nU73MqoCm/2tGjUu2gJxczJjhFufAHdSXc
    4AAAAAvnlf8F8HqQJqaAc710nDAfOzmulytSoB0pm8jp0W+gEoPsuZi8IrAKw0qwwzzakDAkpsYAAAAACrqv/////+Ae7
    //1Ss//8C6kFiD2sPKgHDnP1KFM4TAkt3ZNesS0MC7enGkqb5XwKjHhGgAQAAAAgUEAALAAAAjwEAAA8AAAAIFBAACwAA
    AKcBAAATAAAACBQQAAsAAACqAQAADQAAAHNyYy9obWFjLnJzADQUEAAgAAAAVBQQABIAAAADAAAAAAAAAAEAAAAEAAAAa
    W5kZXggb3V0IG9mIGJvdW5kczogdGhlIGxlbiBpcyAgYnV0IHRoZSBpbmRleCBpcyAwMDAxMDIwMzA0MDUwNjA3MDgwOT
    EwMTExMjEzMTQxNTE2MTcxODE5MjAyMTIyMjMyNDI1MjYyNzI4MjkzMDMxMzIzMzM0MzUzNjM3MzgzOTQwNDE0MjQzNDQ
    0NTQ2NDc0ODQ5NTA1MTUyNTM1NDU1NTY1NzU4NTk2MDYxNjI2MzY0NjU2NjY3Njg2OTcwNzE3MjczNzQ3NTc2Nzc3ODc5
    ODA4MTgyODM4NDg1ODY4Nzg4ODk5MDkxOTI5Mzk0OTU5Njk3OTg5OQAAQBUQABAAAABQFRAAIgAAAHJhbmdlIGVuZCBpb
    mRleCAgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZiBsZW5ndGggAABjYWxsZWQgYE9wdGlvbjo6dW53cmFwKClgIG9uIG
    EgYE5vbmVgIHZhbHVlALAVEAAcAAAA7gEAAB4AAABsaWJyYXJ5L3N0ZC9zcmMvcGFuaWNraW5nLnJzAEGIrMAACwEBAEH
    IrMAACwEBAEGIrcAACwEBAEHIrcAACwEBAEGIrsAACwEBAEHIrsAACwEBAEGIr8AACwEBAEHIr8AACwEBAEGIsMAACwEB
    AEHIsMAACwEBAEGIscAACwEBAEHIscAACwEBAEGIssAACwEBAEHIssAACwEBAEGIs8AACwEBAEHIs8AACwEBAEGItMAAC
    wEBAEHItMAACwEBAEGItcAACwEBAEHItcAACwEBAEGItsAACwEBAEHItsAACwEBAEGIt8AACwEBAEHIt8AACwEBAEGIuM
    AACwEBAEHIuMAACwEBAEGIucAACwEBAEHIucAACwEBAEGIusAACwEBAEHIusAACwEBAEGIu8AACwEBAEHIu8AACwEBAEG
    IvMAACwEBAEHIvMAACwEBAEGIvcAACwEBAEHIvcAACwEBAEGIvsAACwEBAEHIvsAACwEBAEGIv8AACwEBAEHIv8AACwEB
    AEGIwMAACwEBAEHIwMAACwEBAEGIwcAACwEBAEHIwcAACwEBAEGIwsAACwEBAEHIwsAACwEBAEGIw8AACwEBAEHIw8AAC
    wEBAEGIxMAACwEBAEHIxMAACwEBAEGIxcAACwEBAEHIxcAACwEBAEGIxsAACwEBAEHIxsAACwEBAEGIx8AACwEBAEHIx8
    AACwEBAEGIyMAACwEBAEHIyMAACwEBAEGIycAACwEBAEHIycAACwEBAEGIysAACwEBAEHIysAACwEBAEGIy8AACwEBAEH
    Iy8AACwEBAEGIzMAACwEBAEHIzMAACwEBAEGIzcAACwEBAEHIzcAACwEBAEGIzsAACwEBAEHIzsAACwEBAEGIz8AACwEB
    AEHIz8AACwEBAEGI0MAACwEBAEHI0MAACwEBAEGI0cAACwEBAEHI0cAACwEBAEGI0sAACwEBAEHI0sAACwEBAEGI08AAC
    wEBAEHI08AACwEBAEGI1MAACwEBAEHI1MAACwEBAEGI1cAACwEBAEHI1cAACwEBAEGI1sAACwEBAEHI1sAACwEBAEGI18
    AACwEBAEHI18AACwEBAEGI2MAACwEBAEHI2MAACwEBAEGI2cAACwEBAEHI2cAACwEBAEGI2sAACwEBAEHI2sAACwEBAEG
    I28AACwEBAEHI28AACwEBAEGI3MAACwEBAEHI3MAACwEBAEGI3cAACwEBAEHI3cAACwEBAEGI3sAACwEBAEHI3sAACwEB
    AEGI38AACwEBAEHI38AACwEBAEGI4MAACwEBAEHI4MAACwEBAEGI4cAACwEBAEHI4cAACwEBAEGI4sAACwEBAEHI4sAAC
    wEBAEGI48AACwEBAEHI48AACwEBAEGI5MAACwEBAEHI5MAACwEBAEGI5cAACwEBAEHI5cAACwEBAEGI5sAACwEBAEHI5s
    AACwEBAEGI58AACwEBAEHI58AACwEBAEGI6MAACwEBAEHI6MAACwEBAEGI6cAACwEBAEHI6cAACwEBAEGI6sAACwEBAEH
    I6sAACwEBAEGI68AACwEBAEHI68AACwEBAEGI7MAACwEBAEHI7MAACwEBAEGI7cAACwEBAEHI7cAACwEBAEGI7sAACwEB
    AEHI7sAACwEBAEGI78AACwEBAEHI78AACwEBAEGI8MAACwEBAEHI8MAACwEBAEGI8cAACwEBAEHI8cAACwEBAEGI8sAAC
    wEBAEHI8sAACwEBAEGI88AACwEBAEHI88AACwEBAEGI9MAACwEBAEHI9MAACwEBAEGI9cAACwEBAEHI9cAACwEBAEGI9s
    AACwEBAEHI9sAACwEBAEGI98AACwEBAEHI98AACwEBAEGI+MAACwEBAEHI+MAACwEBAEGI+cAACwEBAEHI+cAACwEBAEG
    I+sAACwEBAEHI+sAACwEBAEGI+8AACwEBAEHI+8AACwEBAEGI/MAACwEBAEHI/MAACwEBAEGI/cAACwEBAEHI/cAACwEB
    AEGI/sAACwEBAEHI/sAACwEBAEGI/8AACwEBAEHI/8AACwEBAEGIgMEACwEBAEHIgMEACwEBAEGIgcEACwEBAEHIgcEAC
    wEBAEGIgsEACwEBAEHIgsEACwEBAEGIg8EACwEBAEHIg8EACwEBAEGIhMEACwEBAEHIhMEACwEBAEGIhcEACwEBAEHIhc
    EACwEBAEGIhsEACwEBAEHIhsEACwEBAEGIh8EACwEBAEHIh8EACwEBAEGIiMEACwEBAEHIiMEACwEBAEGIicEACwEBAEH
    IicEACwEBAEGIisEACwEBAEHIisEACwEBAEGIi8EACwEBAEHIi8EACwEBAEGIjMEACwEBAEHIjMEACwEBAEGIjcEACwEB
    AEHIjcEACwEBAEGIjsEACwEBAEHIjsEACwEBAEGIj8EACwEBAEHIj8EACwEBAEGIkMEACwEBAEHIkMEACwEBAEGIkcEAC
    wEBAEHIkcEACwEBAEGIksEACwEBAEHIksEACwEBAEGIk8EACwEBAEHIk8EACwEBAEGIlMEACwEBAEHIlMEACwEBAEGIlc
    EACwEBAEHIlcEACwEBAEGIlsEACwEBAEHIlsEACwEBAEGIl8EACwEBAEHIl8EACwEBAEGImMEACwEBAEHImMEACwEBAEG
    ImcEACwEBAEHImcEACwEBAEGImsEACwEBAEHImsEACwEBAEGIm8EACwEBAEHIm8EACwEBAEGInMEACwEBAEHInMEACwEB
    AEGIncEACwEBAEHIncEACwEBAEGInsEACwEBAEHInsEACwEBAEGIn8EACwEBAEHIn8EACwEBAEGIoMEACwEBAEHIoMEAC
    wEBAEGIocEACwEBAEHIocEACwEBAEGIosEACwEBAEHIosEACwEBAEGIo8EACwEBAEHIo8EACwEBAEGIpMEACwEBAEHIpM
    EACwEBAEGIpcEACwEBAEHIpcEACwEBAEGIpsEACwEBAEHIpsEACwEBAEGIp8EACwEBAEHIp8EACwEBAEGIqMEACwEBAEH
    IqMEACwEBAEGIqcEACwEBAEHIqcEACwEBAEGIqsEACwEBAEHIqsEACwEBAEGIq8EACwEBAEHIq8EACwEBAEGIrMEACwEB
    AEHIrMEACwEBAEGIrcEACwEBAEHIrcEACwEBAEGIrsEACwEBAEHIrsEACwEBAEGIr8EACwEBAEHIr8EACwEBAEGIsMEAC
    wEBAEHIsMEACwEBAEGIscEACwEBAEHIscEACwEBAEGIssEACwEBAEHIssEACwEBAEGIs8EACwEBAEHIs8EACwEBAEGItM
    EACwEBAEHItMEACwEBAEGItcEACwEBAEHItcEACwEBAHsJcHJvZHVjZXJzAghsYW5ndWFnZQEEUnVzdAAMcHJvY2Vzc2V
    kLWJ5AwVydXN0Yx0xLjQ5LjAgKGUxODg0YThlMyAyMDIwLTEyLTI5KQZ3YWxydXMGMC4xOC4wDHdhc20tYmluZGdlbhIw
    LjIuNzAgKGI2MzU1YzI3MCk=
`.replace(/[^0-9a-zA-Z/+]/g, '');
const wasmBytes = base64_arraybuffer__WEBPACK_IMPORTED_MODULE_0__.decode(wasmBytesBase64);
/**
 * @returns {number}
 */
function bls_init() {
    let ret = wasm.bls_init();
    return ret;
}
let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}
function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    return [ptr, arg.length];
}
/**
 * @param {Uint8Array} sig
 * @param {Uint8Array} m
 * @param {Uint8Array} w
 * @returns {number}
 */
function bls_verify(sig, m, w) {
    const [ptr0, len0] = passArray8ToWasm0(sig, wasm.__wbindgen_malloc);
    const [ptr1, len1] = passArray8ToWasm0(m, wasm.__wbindgen_malloc);
    const [ptr2, len2] = passArray8ToWasm0(w, wasm.__wbindgen_malloc);
    const ret = wasm.bls_verify(ptr0, len0, ptr1, len1, ptr2, len2);
    return ret;
}
async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    }
    else {
        const instance = await WebAssembly.instantiate(module, imports);
        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        }
        else {
            return instance;
        }
    }
}
async function init() {
    const imports = {};
    const { instance, module } = await load(wasmBytes, imports);
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    return wasm;
}
/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (init);
//# sourceMappingURL=bls.js.map

/***/ }),

/***/ "./node_modules/@dfinity/agent/node_modules/base64-arraybuffer/lib/base64-arraybuffer.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@dfinity/agent/node_modules/base64-arraybuffer/lib/base64-arraybuffer.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(){
  "use strict";

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})();


/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/cjs/utils/buffer.js":
/*!**************************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/cjs/utils/buffer.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PipeArrayBuffer = exports.fromHexString = exports.toHexString = exports.concat = void 0;
/**
 * Concatenate multiple array buffers.
 * @param buffers The buffers to concatenate.
 */
function concat(...buffers) {
    const result = new Uint8Array(buffers.reduce((acc, curr) => acc + curr.byteLength, 0));
    let index = 0;
    for (const b of buffers) {
        result.set(new Uint8Array(b), index);
        index += b.byteLength;
    }
    return result;
}
exports.concat = concat;
/**
 * Returns an hexadecimal representation of an array buffer.
 * @param bytes The array buffer.
 */
function toHexString(bytes) {
    return new Uint8Array(bytes).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}
exports.toHexString = toHexString;
/**
 * Return an array buffer from its hexadecimal representation.
 * @param hexString The hexadecimal string.
 */
function fromHexString(hexString) {
    var _a;
    return new Uint8Array(((_a = hexString.match(/.{1,2}/g)) !== null && _a !== void 0 ? _a : []).map(byte => parseInt(byte, 16)));
}
exports.fromHexString = fromHexString;
/**
 * A class that abstracts a pipe-like ArrayBuffer.
 */
class PipeArrayBuffer {
    /**
     * Creates a new instance of a pipe
     * @param buffer an optional buffer to start with
     * @param length an optional amount of bytes to use for the length.
     */
    constructor(buffer, length = (buffer === null || buffer === void 0 ? void 0 : buffer.byteLength) || 0) {
        this._buffer = buffer || new ArrayBuffer(0);
        this._view = new Uint8Array(this._buffer, 0, length);
    }
    get buffer() {
        // Return a copy of the buffer.
        return this._view.slice();
    }
    get byteLength() {
        return this._view.byteLength;
    }
    /**
     * Read `num` number of bytes from the front of the pipe.
     * @param num The number of bytes to read.
     */
    read(num) {
        const result = this._view.subarray(0, num);
        this._view = this._view.subarray(num);
        return result.slice().buffer;
    }
    readUint8() {
        const result = this._view[0];
        this._view = this._view.subarray(1);
        return result;
    }
    /**
     * Write a buffer to the end of the pipe.
     * @param buf The bytes to write.
     */
    write(buf) {
        const b = new Uint8Array(buf);
        const offset = this._view.byteLength;
        if (this._view.byteOffset + this._view.byteLength + b.byteLength >= this._buffer.byteLength) {
            // Alloc grow the view to include the new bytes.
            this.alloc(b.byteLength);
        }
        else {
            // Update the view to include the new bytes.
            this._view = new Uint8Array(this._buffer, this._view.byteOffset, this._view.byteLength + b.byteLength);
        }
        this._view.set(b, offset);
    }
    /**
     * Whether or not there is more data to read from the buffer
     */
    get end() {
        return this._view.byteLength === 0;
    }
    /**
     * Allocate a fixed amount of memory in the buffer. This does not affect the view.
     * @param amount A number of bytes to add to the buffer.
     */
    alloc(amount) {
        // Add a little bit of exponential growth.
        // tslint:disable-next-line:no-bitwise
        const b = new ArrayBuffer(((this._buffer.byteLength + amount) * 1.2) | 0);
        const v = new Uint8Array(b, 0, this._view.byteLength + amount);
        v.set(this._view);
        this._buffer = b;
        this._view = v;
    }
}
exports.PipeArrayBuffer = PipeArrayBuffer;
//# sourceMappingURL=buffer.js.map

/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/esm/candid-core.js":
/*!*************************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/esm/candid-core.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InputBox": () => (/* binding */ InputBox),
/* harmony export */   "InputForm": () => (/* binding */ InputForm),
/* harmony export */   "OptionForm": () => (/* binding */ OptionForm),
/* harmony export */   "RecordForm": () => (/* binding */ RecordForm),
/* harmony export */   "TupleForm": () => (/* binding */ TupleForm),
/* harmony export */   "VariantForm": () => (/* binding */ VariantForm),
/* harmony export */   "VecForm": () => (/* binding */ VecForm)
/* harmony export */ });
class InputBox {
    constructor(idl, ui) {
        this.idl = idl;
        this.ui = ui;
        this.label = null;
        this.value = undefined;
        const status = document.createElement('span');
        status.className = 'status';
        this.status = status;
        if (ui.input) {
            ui.input.addEventListener('blur', () => {
                if (ui.input.value === '') {
                    return;
                }
                this.parse();
            });
            ui.input.addEventListener('input', () => {
                status.style.display = 'none';
                ui.input.classList.remove('reject');
            });
        }
    }
    isRejected() {
        return this.value === undefined;
    }
    parse(config = {}) {
        if (this.ui.form) {
            const value = this.ui.form.parse(config);
            this.value = value;
            return value;
        }
        if (this.ui.input) {
            const input = this.ui.input;
            try {
                const value = this.ui.parse(this.idl, config, input.value);
                if (!this.idl.covariant(value)) {
                    throw new Error(`${input.value} is not of type ${this.idl.display()}`);
                }
                this.status.style.display = 'none';
                this.value = value;
                return value;
            }
            catch (err) {
                input.classList.add('reject');
                this.status.style.display = 'block';
                this.status.innerHTML = 'InputError: ' + err.message;
                this.value = undefined;
                return undefined;
            }
        }
        return null;
    }
    render(dom) {
        const container = document.createElement('span');
        if (this.label) {
            const label = document.createElement('label');
            label.innerText = this.label;
            container.appendChild(label);
        }
        if (this.ui.input) {
            container.appendChild(this.ui.input);
            container.appendChild(this.status);
        }
        if (this.ui.form) {
            this.ui.form.render(container);
        }
        dom.appendChild(container);
    }
}
class InputForm {
    constructor(ui) {
        this.ui = ui;
        this.form = [];
    }
    renderForm(dom) {
        if (this.ui.container) {
            this.form.forEach(e => e.render(this.ui.container));
            dom.appendChild(this.ui.container);
        }
        else {
            this.form.forEach(e => e.render(dom));
        }
    }
    render(dom) {
        if (this.ui.open && this.ui.event) {
            dom.appendChild(this.ui.open);
            const form = this;
            // eslint-disable-next-line
            form.ui.open.addEventListener(form.ui.event, () => {
                // Remove old form
                if (form.ui.container) {
                    form.ui.container.innerHTML = '';
                }
                else {
                    const oldContainer = form.ui.open.nextElementSibling;
                    if (oldContainer) {
                        oldContainer.parentNode.removeChild(oldContainer);
                    }
                }
                // Render form
                form.generateForm();
                form.renderForm(dom);
            });
        }
        else {
            this.generateForm();
            this.renderForm(dom);
        }
    }
}
class RecordForm extends InputForm {
    constructor(fields, ui) {
        super(ui);
        this.fields = fields;
        this.ui = ui;
    }
    generateForm() {
        this.form = this.fields.map(([key, type]) => {
            const input = this.ui.render(type);
            // eslint-disable-next-line
            if (this.ui.labelMap && this.ui.labelMap.hasOwnProperty(key)) {
                input.label = this.ui.labelMap[key] + ' ';
            }
            else {
                input.label = key + ' ';
            }
            return input;
        });
    }
    parse(config) {
        const v = {};
        this.fields.forEach(([key, _], i) => {
            const value = this.form[i].parse(config);
            v[key] = value;
        });
        if (this.form.some(input => input.isRejected())) {
            return undefined;
        }
        return v;
    }
}
class TupleForm extends InputForm {
    constructor(components, ui) {
        super(ui);
        this.components = components;
        this.ui = ui;
    }
    generateForm() {
        this.form = this.components.map(type => {
            const input = this.ui.render(type);
            return input;
        });
    }
    parse(config) {
        const v = [];
        this.components.forEach((_, i) => {
            const value = this.form[i].parse(config);
            v.push(value);
        });
        if (this.form.some(input => input.isRejected())) {
            return undefined;
        }
        return v;
    }
}
class VariantForm extends InputForm {
    constructor(fields, ui) {
        super(ui);
        this.fields = fields;
        this.ui = ui;
    }
    generateForm() {
        const index = this.ui.open.selectedIndex;
        const [_, type] = this.fields[index];
        const variant = this.ui.render(type);
        this.form = [variant];
    }
    parse(config) {
        const select = this.ui.open;
        const selected = select.options[select.selectedIndex].value;
        const value = this.form[0].parse(config);
        if (value === undefined) {
            return undefined;
        }
        const v = {};
        v[selected] = value;
        return v;
    }
}
class OptionForm extends InputForm {
    constructor(ty, ui) {
        super(ui);
        this.ty = ty;
        this.ui = ui;
    }
    generateForm() {
        if (this.ui.open.checked) {
            const opt = this.ui.render(this.ty);
            this.form = [opt];
        }
        else {
            this.form = [];
        }
    }
    parse(config) {
        if (this.form.length === 0) {
            return [];
        }
        else {
            const value = this.form[0].parse(config);
            if (value === undefined) {
                return undefined;
            }
            return [value];
        }
    }
}
class VecForm extends InputForm {
    constructor(ty, ui) {
        super(ui);
        this.ty = ty;
        this.ui = ui;
    }
    generateForm() {
        const len = +this.ui.open.value;
        this.form = [];
        for (let i = 0; i < len; i++) {
            const t = this.ui.render(this.ty);
            this.form.push(t);
        }
    }
    parse(config) {
        const value = this.form.map(input => {
            return input.parse(config);
        });
        if (this.form.some(input => input.isRejected())) {
            return undefined;
        }
        return value;
    }
}
//# sourceMappingURL=candid-core.js.map

/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/esm/candid-ui.js":
/*!***********************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/esm/candid-ui.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Render": () => (/* binding */ Render),
/* harmony export */   "inputBox": () => (/* binding */ inputBox),
/* harmony export */   "optForm": () => (/* binding */ optForm),
/* harmony export */   "recordForm": () => (/* binding */ recordForm),
/* harmony export */   "renderInput": () => (/* binding */ renderInput),
/* harmony export */   "renderValue": () => (/* binding */ renderValue),
/* harmony export */   "tupleForm": () => (/* binding */ tupleForm),
/* harmony export */   "variantForm": () => (/* binding */ variantForm),
/* harmony export */   "vecForm": () => (/* binding */ vecForm)
/* harmony export */ });
/* harmony import */ var _idl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./idl */ "./node_modules/@dfinity/candid/lib/esm/idl.js");
/* harmony import */ var _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dfinity/principal */ "./node_modules/@dfinity/principal/lib/esm/index.js");
/* harmony import */ var _candid_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./candid-core */ "./node_modules/@dfinity/candid/lib/esm/candid-core.js");



const InputConfig = { parse: parsePrimitive };
const FormConfig = { render: renderInput };
const inputBox = (t, config) => {
    return new _candid_core__WEBPACK_IMPORTED_MODULE_2__.InputBox(t, Object.assign(Object.assign({}, InputConfig), config));
};
const recordForm = (fields, config) => {
    return new _candid_core__WEBPACK_IMPORTED_MODULE_2__.RecordForm(fields, Object.assign(Object.assign({}, FormConfig), config));
};
const tupleForm = (components, config) => {
    return new _candid_core__WEBPACK_IMPORTED_MODULE_2__.TupleForm(components, Object.assign(Object.assign({}, FormConfig), config));
};
const variantForm = (fields, config) => {
    return new _candid_core__WEBPACK_IMPORTED_MODULE_2__.VariantForm(fields, Object.assign(Object.assign({}, FormConfig), config));
};
const optForm = (ty, config) => {
    return new _candid_core__WEBPACK_IMPORTED_MODULE_2__.OptionForm(ty, Object.assign(Object.assign({}, FormConfig), config));
};
const vecForm = (ty, config) => {
    return new _candid_core__WEBPACK_IMPORTED_MODULE_2__.VecForm(ty, Object.assign(Object.assign({}, FormConfig), config));
};
class Render extends _idl__WEBPACK_IMPORTED_MODULE_0__.Visitor {
    visitType(t, d) {
        const input = document.createElement('input');
        input.classList.add('argument');
        input.placeholder = t.display();
        return inputBox(t, { input });
    }
    visitNull(t, d) {
        return inputBox(t, {});
    }
    visitRecord(t, fields, d) {
        let config = {};
        if (fields.length > 1) {
            const container = document.createElement('div');
            container.classList.add('popup-form');
            config = { container };
        }
        const form = recordForm(fields, config);
        return inputBox(t, { form });
    }
    visitTuple(t, components, d) {
        let config = {};
        if (components.length > 1) {
            const container = document.createElement('div');
            container.classList.add('popup-form');
            config = { container };
        }
        const form = tupleForm(components, config);
        return inputBox(t, { form });
    }
    visitVariant(t, fields, d) {
        const select = document.createElement('select');
        for (const [key, type] of fields) {
            const option = new Option(key);
            select.add(option);
        }
        select.selectedIndex = -1;
        select.classList.add('open');
        const config = { open: select, event: 'change' };
        const form = variantForm(fields, config);
        return inputBox(t, { form });
    }
    visitOpt(t, ty, d) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('open');
        const form = optForm(ty, { open: checkbox, event: 'change' });
        return inputBox(t, { form });
    }
    visitVec(t, ty, d) {
        const len = document.createElement('input');
        len.type = 'number';
        len.min = '0';
        len.max = '100';
        len.style.width = '8rem';
        len.placeholder = 'len';
        len.classList.add('open');
        const container = document.createElement('div');
        container.classList.add('popup-form');
        const form = vecForm(ty, { open: len, event: 'change', container });
        return inputBox(t, { form });
    }
    visitRec(t, ty, d) {
        return renderInput(ty);
    }
}
class Parse extends _idl__WEBPACK_IMPORTED_MODULE_0__.Visitor {
    visitNull(t, v) {
        return null;
    }
    visitBool(t, v) {
        if (v === 'true') {
            return true;
        }
        if (v === 'false') {
            return false;
        }
        throw new Error(`Cannot parse ${v} as boolean`);
    }
    visitText(t, v) {
        return v;
    }
    visitFloat(t, v) {
        return parseFloat(v);
    }
    visitNumber(t, v) {
        return BigInt(v);
    }
    visitPrincipal(t, v) {
        return _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.fromText(v);
    }
    visitService(t, v) {
        return _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.fromText(v);
    }
    visitFunc(t, v) {
        const x = v.split('.', 2);
        return [_dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.fromText(x[0]), x[1]];
    }
}
class Random extends _idl__WEBPACK_IMPORTED_MODULE_0__.Visitor {
    visitNull(t, v) {
        return null;
    }
    visitBool(t, v) {
        return Math.random() < 0.5;
    }
    visitText(t, v) {
        return Math.random().toString(36).substring(6);
    }
    visitFloat(t, v) {
        return Math.random();
    }
    visitInt(t, v) {
        return BigInt(this.generateNumber(true));
    }
    visitNat(t, v) {
        return BigInt(this.generateNumber(false));
    }
    visitFixedInt(t, v) {
        return BigInt(this.generateNumber(true));
    }
    visitFixedNat(t, v) {
        return BigInt(this.generateNumber(false));
    }
    generateNumber(signed) {
        const num = Math.floor(Math.random() * 100);
        if (signed && Math.random() < 0.5) {
            return -num;
        }
        else {
            return num;
        }
    }
}
function parsePrimitive(t, config, d) {
    if (config.random && d === '') {
        return t.accept(new Random(), d);
    }
    else {
        return t.accept(new Parse(), d);
    }
}
/**
 *
 * @param t an IDL type
 * @returns an input for that type
 */
function renderInput(t) {
    return t.accept(new Render(), null);
}
/**
 *
 * @param t an IDL Type
 * @param input an InputBox
 * @param value any
 * @returns rendering that value to the provided input
 */
function renderValue(t, input, value) {
    return t.accept(new RenderValue(), { input, value });
}
class RenderValue extends _idl__WEBPACK_IMPORTED_MODULE_0__.Visitor {
    visitType(t, d) {
        d.input.ui.input.value = t.valueToString(d.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    visitNull(t, d) { }
    visitText(t, d) {
        d.input.ui.input.value = d.value;
    }
    visitRec(t, ty, d) {
        renderValue(ty, d.input, d.value);
    }
    visitOpt(t, ty, d) {
        if (d.value.length === 0) {
            return;
        }
        else {
            const form = d.input.ui.form;
            const open = form.ui.open;
            open.checked = true;
            open.dispatchEvent(new Event(form.ui.event));
            renderValue(ty, form.form[0], d.value[0]);
        }
    }
    visitRecord(t, fields, d) {
        const form = d.input.ui.form;
        fields.forEach(([key, type], i) => {
            renderValue(type, form.form[i], d.value[key]);
        });
    }
    visitTuple(t, components, d) {
        const form = d.input.ui.form;
        components.forEach((type, i) => {
            renderValue(type, form.form[i], d.value[i]);
        });
    }
    visitVariant(t, fields, d) {
        const form = d.input.ui.form;
        const selected = Object.entries(d.value)[0];
        fields.forEach(([key, type], i) => {
            if (key === selected[0]) {
                const open = form.ui.open;
                open.selectedIndex = i;
                open.dispatchEvent(new Event(form.ui.event));
                renderValue(type, form.form[0], selected[1]);
            }
        });
    }
    visitVec(t, ty, d) {
        const form = d.input.ui.form;
        const len = d.value.length;
        const open = form.ui.open;
        open.value = len;
        open.dispatchEvent(new Event(form.ui.event));
        d.value.forEach((v, i) => {
            renderValue(ty, form.form[i], v);
        });
    }
}
//# sourceMappingURL=candid-ui.js.map

/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/esm/idl.js":
/*!*****************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/esm/idl.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Bool": () => (/* binding */ Bool),
/* harmony export */   "BoolClass": () => (/* binding */ BoolClass),
/* harmony export */   "ConstructType": () => (/* binding */ ConstructType),
/* harmony export */   "Empty": () => (/* binding */ Empty),
/* harmony export */   "EmptyClass": () => (/* binding */ EmptyClass),
/* harmony export */   "FixedIntClass": () => (/* binding */ FixedIntClass),
/* harmony export */   "FixedNatClass": () => (/* binding */ FixedNatClass),
/* harmony export */   "Float32": () => (/* binding */ Float32),
/* harmony export */   "Float64": () => (/* binding */ Float64),
/* harmony export */   "FloatClass": () => (/* binding */ FloatClass),
/* harmony export */   "Func": () => (/* binding */ Func),
/* harmony export */   "FuncClass": () => (/* binding */ FuncClass),
/* harmony export */   "Int": () => (/* binding */ Int),
/* harmony export */   "Int16": () => (/* binding */ Int16),
/* harmony export */   "Int32": () => (/* binding */ Int32),
/* harmony export */   "Int64": () => (/* binding */ Int64),
/* harmony export */   "Int8": () => (/* binding */ Int8),
/* harmony export */   "IntClass": () => (/* binding */ IntClass),
/* harmony export */   "Nat": () => (/* binding */ Nat),
/* harmony export */   "Nat16": () => (/* binding */ Nat16),
/* harmony export */   "Nat32": () => (/* binding */ Nat32),
/* harmony export */   "Nat64": () => (/* binding */ Nat64),
/* harmony export */   "Nat8": () => (/* binding */ Nat8),
/* harmony export */   "NatClass": () => (/* binding */ NatClass),
/* harmony export */   "Null": () => (/* binding */ Null),
/* harmony export */   "NullClass": () => (/* binding */ NullClass),
/* harmony export */   "Opt": () => (/* binding */ Opt),
/* harmony export */   "OptClass": () => (/* binding */ OptClass),
/* harmony export */   "PrimitiveType": () => (/* binding */ PrimitiveType),
/* harmony export */   "Principal": () => (/* binding */ Principal),
/* harmony export */   "PrincipalClass": () => (/* binding */ PrincipalClass),
/* harmony export */   "Rec": () => (/* binding */ Rec),
/* harmony export */   "RecClass": () => (/* binding */ RecClass),
/* harmony export */   "Record": () => (/* binding */ Record),
/* harmony export */   "RecordClass": () => (/* binding */ RecordClass),
/* harmony export */   "Reserved": () => (/* binding */ Reserved),
/* harmony export */   "ReservedClass": () => (/* binding */ ReservedClass),
/* harmony export */   "Service": () => (/* binding */ Service),
/* harmony export */   "ServiceClass": () => (/* binding */ ServiceClass),
/* harmony export */   "Text": () => (/* binding */ Text),
/* harmony export */   "TextClass": () => (/* binding */ TextClass),
/* harmony export */   "Tuple": () => (/* binding */ Tuple),
/* harmony export */   "TupleClass": () => (/* binding */ TupleClass),
/* harmony export */   "Type": () => (/* binding */ Type),
/* harmony export */   "Unknown": () => (/* binding */ Unknown),
/* harmony export */   "UnknownClass": () => (/* binding */ UnknownClass),
/* harmony export */   "Variant": () => (/* binding */ Variant),
/* harmony export */   "VariantClass": () => (/* binding */ VariantClass),
/* harmony export */   "Vec": () => (/* binding */ Vec),
/* harmony export */   "VecClass": () => (/* binding */ VecClass),
/* harmony export */   "Visitor": () => (/* binding */ Visitor),
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode)
/* harmony export */ });
/* harmony import */ var _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/principal */ "./node_modules/@dfinity/principal/lib/esm/index.js");
/* harmony import */ var _utils_buffer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/buffer */ "./node_modules/@dfinity/candid/lib/esm/utils/buffer.js");
/* harmony import */ var _utils_hash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/hash */ "./node_modules/@dfinity/candid/lib/esm/utils/hash.js");
/* harmony import */ var _utils_leb128__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/leb128 */ "./node_modules/@dfinity/candid/lib/esm/utils/leb128.js");
// tslint:disable:max-classes-per-file




const magicNumber = 'DIDL';
function zipWith(xs, ys, f) {
    return xs.map((x, i) => f(x, ys[i]));
}
/**
 * An IDL Type Table, which precedes the data in the stream.
 */
class TypeTable {
    constructor() {
        // List of types. Needs to be an array as the index needs to be stable.
        this._typs = [];
        this._idx = new Map();
    }
    has(obj) {
        return this._idx.has(obj.name);
    }
    add(type, buf) {
        const idx = this._typs.length;
        this._idx.set(type.name, idx);
        this._typs.push(buf);
    }
    merge(obj, knot) {
        const idx = this._idx.get(obj.name);
        const knotIdx = this._idx.get(knot);
        if (idx === undefined) {
            throw new Error('Missing type index for ' + obj);
        }
        if (knotIdx === undefined) {
            throw new Error('Missing type index for ' + knot);
        }
        this._typs[idx] = this._typs[knotIdx];
        // Delete the type.
        this._typs.splice(knotIdx, 1);
        this._idx.delete(knot);
    }
    encode() {
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(this._typs.length);
        const buf = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...this._typs);
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(len, buf);
    }
    indexOf(typeName) {
        if (!this._idx.has(typeName)) {
            throw new Error('Missing type index for ' + typeName);
        }
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(this._idx.get(typeName) || 0);
    }
}
class Visitor {
    visitType(t, data) {
        throw new Error('Not implemented');
    }
    visitPrimitive(t, data) {
        return this.visitType(t, data);
    }
    visitEmpty(t, data) {
        return this.visitPrimitive(t, data);
    }
    visitBool(t, data) {
        return this.visitPrimitive(t, data);
    }
    visitNull(t, data) {
        return this.visitPrimitive(t, data);
    }
    visitReserved(t, data) {
        return this.visitPrimitive(t, data);
    }
    visitText(t, data) {
        return this.visitPrimitive(t, data);
    }
    visitNumber(t, data) {
        return this.visitPrimitive(t, data);
    }
    visitInt(t, data) {
        return this.visitNumber(t, data);
    }
    visitNat(t, data) {
        return this.visitNumber(t, data);
    }
    visitFloat(t, data) {
        return this.visitPrimitive(t, data);
    }
    visitFixedInt(t, data) {
        return this.visitNumber(t, data);
    }
    visitFixedNat(t, data) {
        return this.visitNumber(t, data);
    }
    visitPrincipal(t, data) {
        return this.visitPrimitive(t, data);
    }
    visitConstruct(t, data) {
        return this.visitType(t, data);
    }
    visitVec(t, ty, data) {
        return this.visitConstruct(t, data);
    }
    visitOpt(t, ty, data) {
        return this.visitConstruct(t, data);
    }
    visitRecord(t, fields, data) {
        return this.visitConstruct(t, data);
    }
    visitTuple(t, components, data) {
        const fields = components.map((ty, i) => [`_${i}_`, ty]);
        return this.visitRecord(t, fields, data);
    }
    visitVariant(t, fields, data) {
        return this.visitConstruct(t, data);
    }
    visitRec(t, ty, data) {
        return this.visitConstruct(ty, data);
    }
    visitFunc(t, data) {
        return this.visitConstruct(t, data);
    }
    visitService(t, data) {
        return this.visitConstruct(t, data);
    }
}
/**
 * Represents an IDL type.
 */
class Type {
    /* Display type name */
    display() {
        return this.name;
    }
    valueToString(x) {
        return toReadableString(x);
    }
    /* Implement `T` in the IDL spec, only needed for non-primitive types */
    buildTypeTable(typeTable) {
        if (!typeTable.has(this)) {
            this._buildTypeTableImpl(typeTable);
        }
    }
}
class PrimitiveType extends Type {
    checkType(t) {
        if (this.name !== t.name) {
            throw new Error(`type mismatch: type on the wire ${t.name}, expect type ${this.name}`);
        }
        return t;
    }
    _buildTypeTableImpl(typeTable) {
        // No type table encoding for Primitive types.
        return;
    }
}
class ConstructType extends Type {
    checkType(t) {
        if (t instanceof RecClass) {
            const ty = t.getType();
            if (typeof ty === 'undefined') {
                throw new Error('type mismatch with uninitialized type');
            }
            return ty;
        }
        throw new Error(`type mismatch: type on the wire ${t.name}, expect type ${this.name}`);
    }
    encodeType(typeTable) {
        return typeTable.indexOf(this.name);
    }
}
/**
 * Represents an IDL Empty, a type which has no inhabitants.
 * Since no values exist for this type, it cannot be serialised or deserialised.
 * Result types like `Result<Text, Empty>` should always succeed.
 */
class EmptyClass extends PrimitiveType {
    accept(v, d) {
        return v.visitEmpty(this, d);
    }
    covariant(x) {
        return false;
    }
    encodeValue() {
        throw new Error('Empty cannot appear as a function argument');
    }
    valueToString() {
        throw new Error('Empty cannot appear as a value');
    }
    encodeType() {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-17 /* Empty */);
    }
    decodeValue() {
        throw new Error('Empty cannot appear as an output');
    }
    get name() {
        return 'empty';
    }
}
/**
 * Represents an IDL Unknown, a placeholder type for deserialization only.
 * When decoding a value as Unknown, all fields will be retained but the names are only available in
 * hashed form.
 * A deserialized unknown will offer it's actual type by calling the `type()` function.
 * Unknown cannot be serialized and attempting to do so will throw an error.
 */
class UnknownClass extends Type {
    checkType(t) {
        throw new Error('Method not implemented for unknown.');
    }
    accept(v, d) {
        throw v.visitType(this, d);
    }
    covariant(x) {
        return false;
    }
    encodeValue() {
        throw new Error('Unknown cannot appear as a function argument');
    }
    valueToString() {
        throw new Error('Unknown cannot appear as a value');
    }
    encodeType() {
        throw new Error('Unknown cannot be serialized');
    }
    decodeValue(b, t) {
        let decodedValue = t.decodeValue(b, t);
        if (Object(decodedValue) !== decodedValue) {
            // decodedValue is primitive. Box it, otherwise we cannot add the type() function.
            // The type() function is important for primitives because otherwise we cannot tell apart the
            // different number types.
            decodedValue = Object(decodedValue);
        }
        let typeFunc;
        if (t instanceof RecClass) {
            typeFunc = () => t.getType();
        }
        else {
            typeFunc = () => t;
        }
        // Do not use 'decodedValue.type = typeFunc' because this would lead to an enumerable property
        // 'type' which means it would be serialized if the value would be candid encoded again.
        // This in turn leads to problems if the decoded value is a variant because these values are
        // only allowed to have a single property.
        Object.defineProperty(decodedValue, 'type', {
            value: typeFunc,
            writable: true,
            enumerable: false,
            configurable: true,
        });
        return decodedValue;
    }
    _buildTypeTableImpl() {
        throw new Error('Unknown cannot be serialized');
    }
    get name() {
        return 'Unknown';
    }
}
/**
 * Represents an IDL Bool
 */
class BoolClass extends PrimitiveType {
    accept(v, d) {
        return v.visitBool(this, d);
    }
    covariant(x) {
        return typeof x === 'boolean';
    }
    encodeValue(x) {
        return new Uint8Array([x ? 1 : 0]);
    }
    encodeType() {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-2 /* Bool */);
    }
    decodeValue(b, t) {
        this.checkType(t);
        switch ((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeReadUint8)(b)) {
            case 0:
                return false;
            case 1:
                return true;
            default:
                throw new Error('Boolean value out of range');
        }
    }
    get name() {
        return 'bool';
    }
}
/**
 * Represents an IDL Null
 */
class NullClass extends PrimitiveType {
    accept(v, d) {
        return v.visitNull(this, d);
    }
    covariant(x) {
        return x === null;
    }
    encodeValue() {
        return new ArrayBuffer(0);
    }
    encodeType() {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-1 /* Null */);
    }
    decodeValue(b, t) {
        this.checkType(t);
        return null;
    }
    get name() {
        return 'null';
    }
}
/**
 * Represents an IDL Reserved
 */
class ReservedClass extends PrimitiveType {
    accept(v, d) {
        return v.visitReserved(this, d);
    }
    covariant(x) {
        return true;
    }
    encodeValue() {
        return new ArrayBuffer(0);
    }
    encodeType() {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-16 /* Reserved */);
    }
    decodeValue(b, t) {
        if (t.name !== this.name) {
            t.decodeValue(b, t);
        }
        return null;
    }
    get name() {
        return 'reserved';
    }
}
/**
 * Represents an IDL Text
 */
class TextClass extends PrimitiveType {
    accept(v, d) {
        return v.visitText(this, d);
    }
    covariant(x) {
        return typeof x === 'string';
    }
    encodeValue(x) {
        const buf = new TextEncoder().encode(x);
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(buf.byteLength);
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(len, buf);
    }
    encodeType() {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-15 /* Text */);
    }
    decodeValue(b, t) {
        this.checkType(t);
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(b);
        const buf = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeRead)(b, Number(len));
        const decoder = new TextDecoder('utf8', { fatal: true });
        return decoder.decode(buf);
    }
    get name() {
        return 'text';
    }
    valueToString(x) {
        return '"' + x + '"';
    }
}
/**
 * Represents an IDL Int
 */
class IntClass extends PrimitiveType {
    accept(v, d) {
        return v.visitInt(this, d);
    }
    covariant(x) {
        // We allow encoding of JavaScript plain numbers.
        // But we will always decode to bigint.
        return typeof x === 'bigint' || Number.isInteger(x);
    }
    encodeValue(x) {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(x);
    }
    encodeType() {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-4 /* Int */);
    }
    decodeValue(b, t) {
        this.checkType(t);
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebDecode)(b);
    }
    get name() {
        return 'int';
    }
    valueToString(x) {
        return x.toString();
    }
}
/**
 * Represents an IDL Nat
 */
class NatClass extends PrimitiveType {
    accept(v, d) {
        return v.visitNat(this, d);
    }
    covariant(x) {
        // We allow encoding of JavaScript plain numbers.
        // But we will always decode to bigint.
        return (typeof x === 'bigint' && x >= BigInt(0)) || (Number.isInteger(x) && x >= 0);
    }
    encodeValue(x) {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(x);
    }
    encodeType() {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-3 /* Nat */);
    }
    decodeValue(b, t) {
        this.checkType(t);
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(b);
    }
    get name() {
        return 'nat';
    }
    valueToString(x) {
        return x.toString();
    }
}
/**
 * Represents an IDL Float
 */
class FloatClass extends PrimitiveType {
    constructor(_bits) {
        super();
        this._bits = _bits;
        if (_bits !== 32 && _bits !== 64) {
            throw new Error('not a valid float type');
        }
    }
    accept(v, d) {
        return v.visitFloat(this, d);
    }
    covariant(x) {
        return typeof x === 'number' || x instanceof Number;
    }
    encodeValue(x) {
        const buf = new ArrayBuffer(this._bits / 8);
        const view = new DataView(buf);
        if (this._bits === 32) {
            view.setFloat32(0, x, true);
        }
        else {
            view.setFloat64(0, x, true);
        }
        return buf;
    }
    encodeType() {
        const opcode = this._bits === 32 ? -13 /* Float32 */ : -14 /* Float64 */;
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(opcode);
    }
    decodeValue(b, t) {
        this.checkType(t);
        const bytes = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeRead)(b, this._bits / 8);
        const view = new DataView(bytes);
        if (this._bits === 32) {
            return view.getFloat32(0, true);
        }
        else {
            return view.getFloat64(0, true);
        }
    }
    get name() {
        return 'float' + this._bits;
    }
    valueToString(x) {
        return x.toString();
    }
}
/**
 * Represents an IDL fixed-width Int(n)
 */
class FixedIntClass extends PrimitiveType {
    constructor(_bits) {
        super();
        this._bits = _bits;
    }
    accept(v, d) {
        return v.visitFixedInt(this, d);
    }
    covariant(x) {
        const min = BigInt(2) ** BigInt(this._bits - 1) * BigInt(-1);
        const max = BigInt(2) ** BigInt(this._bits - 1) - BigInt(1);
        if (typeof x === 'bigint') {
            return x >= min && x <= max;
        }
        else if (Number.isInteger(x)) {
            const v = BigInt(x);
            return v >= min && v <= max;
        }
        else {
            return false;
        }
    }
    encodeValue(x) {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.writeIntLE)(x, this._bits / 8);
    }
    encodeType() {
        const offset = Math.log2(this._bits) - 3;
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-9 - offset);
    }
    decodeValue(b, t) {
        this.checkType(t);
        const num = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.readIntLE)(b, this._bits / 8);
        if (this._bits <= 32) {
            return Number(num);
        }
        else {
            return num;
        }
    }
    get name() {
        return `int${this._bits}`;
    }
    valueToString(x) {
        return x.toString();
    }
}
/**
 * Represents an IDL fixed-width Nat(n)
 */
class FixedNatClass extends PrimitiveType {
    constructor(bits) {
        super();
        this.bits = bits;
    }
    accept(v, d) {
        return v.visitFixedNat(this, d);
    }
    covariant(x) {
        const max = BigInt(2) ** BigInt(this.bits);
        if (typeof x === 'bigint' && x >= BigInt(0)) {
            return x < max;
        }
        else if (Number.isInteger(x) && x >= 0) {
            const v = BigInt(x);
            return v < max;
        }
        else {
            return false;
        }
    }
    encodeValue(x) {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.writeUIntLE)(x, this.bits / 8);
    }
    encodeType() {
        const offset = Math.log2(this.bits) - 3;
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-5 - offset);
    }
    decodeValue(b, t) {
        this.checkType(t);
        const num = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.readUIntLE)(b, this.bits / 8);
        if (this.bits <= 32) {
            return Number(num);
        }
        else {
            return num;
        }
    }
    get name() {
        return `nat${this.bits}`;
    }
    valueToString(x) {
        return x.toString();
    }
}
/**
 * Represents an IDL Array
 * @param {Type} t
 */
class VecClass extends ConstructType {
    constructor(_type) {
        super();
        this._type = _type;
        // If true, this vector is really a blob and we can just use memcpy.
        this._blobOptimization = false;
        if (_type instanceof FixedNatClass && _type.bits === 8) {
            this._blobOptimization = true;
        }
    }
    accept(v, d) {
        return v.visitVec(this, this._type, d);
    }
    covariant(x) {
        return Array.isArray(x) && x.every(v => this._type.covariant(v));
    }
    encodeValue(x) {
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(x.length);
        if (this._blobOptimization) {
            return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(len, new Uint8Array(x));
        }
        const buf = new _utils_buffer__WEBPACK_IMPORTED_MODULE_1__.PipeArrayBuffer(new ArrayBuffer(len.byteLength + x.length), 0);
        buf.write(len);
        for (const d of x) {
            const encoded = this._type.encodeValue(d);
            buf.write(new Uint8Array(encoded));
        }
        return buf.buffer;
    }
    _buildTypeTableImpl(typeTable) {
        this._type.buildTypeTable(typeTable);
        const opCode = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-19 /* Vector */);
        const buffer = this._type.encodeType(typeTable);
        typeTable.add(this, (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(opCode, buffer));
    }
    decodeValue(b, t) {
        const vec = this.checkType(t);
        if (!(vec instanceof VecClass)) {
            throw new Error('Not a vector type');
        }
        const len = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(b));
        if (this._blobOptimization) {
            return [...new Uint8Array(b.read(len))];
        }
        const rets = [];
        for (let i = 0; i < len; i++) {
            rets.push(this._type.decodeValue(b, vec._type));
        }
        return rets;
    }
    get name() {
        return `vec ${this._type.name}`;
    }
    display() {
        return `vec ${this._type.display()}`;
    }
    valueToString(x) {
        const elements = x.map(e => this._type.valueToString(e));
        return 'vec {' + elements.join('; ') + '}';
    }
}
/**
 * Represents an IDL Option
 * @param {Type} t
 */
class OptClass extends ConstructType {
    constructor(_type) {
        super();
        this._type = _type;
    }
    accept(v, d) {
        return v.visitOpt(this, this._type, d);
    }
    covariant(x) {
        return Array.isArray(x) && (x.length === 0 || (x.length === 1 && this._type.covariant(x[0])));
    }
    encodeValue(x) {
        if (x.length === 0) {
            return new Uint8Array([0]);
        }
        else {
            return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(new Uint8Array([1]), this._type.encodeValue(x[0]));
        }
    }
    _buildTypeTableImpl(typeTable) {
        this._type.buildTypeTable(typeTable);
        const opCode = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-18 /* Opt */);
        const buffer = this._type.encodeType(typeTable);
        typeTable.add(this, (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(opCode, buffer));
    }
    decodeValue(b, t) {
        const opt = this.checkType(t);
        if (!(opt instanceof OptClass)) {
            throw new Error('Not an option type');
        }
        switch ((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeReadUint8)(b)) {
            case 0:
                return [];
            case 1:
                return [this._type.decodeValue(b, opt._type)];
            default:
                throw new Error('Not an option value');
        }
    }
    get name() {
        return `opt ${this._type.name}`;
    }
    display() {
        return `opt ${this._type.display()}`;
    }
    valueToString(x) {
        if (x.length === 0) {
            return 'null';
        }
        else {
            return `opt ${this._type.valueToString(x[0])}`;
        }
    }
}
/**
 * Represents an IDL Record
 * @param {Object} [fields] - mapping of function name to Type
 */
class RecordClass extends ConstructType {
    constructor(fields = {}) {
        super();
        this._fields = Object.entries(fields).sort((a, b) => (0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(a[0]) - (0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(b[0]));
    }
    accept(v, d) {
        return v.visitRecord(this, this._fields, d);
    }
    tryAsTuple() {
        const res = [];
        for (let i = 0; i < this._fields.length; i++) {
            const [key, type] = this._fields[i];
            if (key !== `_${i}_`) {
                return null;
            }
            res.push(type);
        }
        return res;
    }
    covariant(x) {
        return (typeof x === 'object' &&
            this._fields.every(([k, t]) => {
                // eslint-disable-next-line
                if (!x.hasOwnProperty(k)) {
                    throw new Error(`Record is missing key "${k}".`);
                }
                return t.covariant(x[k]);
            }));
    }
    encodeValue(x) {
        const values = this._fields.map(([key]) => x[key]);
        const bufs = zipWith(this._fields, values, ([, c], d) => c.encodeValue(d));
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...bufs);
    }
    _buildTypeTableImpl(T) {
        this._fields.forEach(([_, value]) => value.buildTypeTable(T));
        const opCode = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-20 /* Record */);
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(this._fields.length);
        const fields = this._fields.map(([key, value]) => (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)((0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(key)), value.encodeType(T)));
        T.add(this, (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(opCode, len, (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...fields)));
    }
    decodeValue(b, t) {
        const record = this.checkType(t);
        if (!(record instanceof RecordClass)) {
            throw new Error('Not a record type');
        }
        const x = {};
        let expectedRecordIdx = 0;
        let actualRecordIdx = 0;
        while (actualRecordIdx < record._fields.length) {
            const [hash, type] = record._fields[actualRecordIdx];
            if (expectedRecordIdx >= this._fields.length) {
                // skip unexpected left over fields present on the wire
                type.decodeValue(b, type);
                actualRecordIdx++;
                continue;
            }
            const [expectKey, expectType] = this._fields[expectedRecordIdx];
            if ((0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(this._fields[expectedRecordIdx][0]) !== (0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(hash)) {
                // the current field on the wire does not match the expected field
                // skip expected optional fields that are not present on the wire
                if (expectType instanceof OptClass || expectType instanceof ReservedClass) {
                    x[expectKey] = [];
                    expectedRecordIdx++;
                    continue;
                }
                // skip unexpected interspersed fields present on the wire
                type.decodeValue(b, type);
                actualRecordIdx++;
                continue;
            }
            x[expectKey] = expectType.decodeValue(b, type);
            expectedRecordIdx++;
            actualRecordIdx++;
        }
        // initialize left over expected optional fields
        for (const [expectKey, expectType] of this._fields.slice(expectedRecordIdx)) {
            if (expectType instanceof OptClass || expectType instanceof ReservedClass) {
                // TODO this assumes null value in opt is represented as []
                x[expectKey] = [];
            }
            else {
                throw new Error('Cannot find required field ' + expectKey);
            }
        }
        return x;
    }
    get name() {
        const fields = this._fields.map(([key, value]) => key + ':' + value.name);
        return `record {${fields.join('; ')}}`;
    }
    display() {
        const fields = this._fields.map(([key, value]) => key + ':' + value.display());
        return `record {${fields.join('; ')}}`;
    }
    valueToString(x) {
        const values = this._fields.map(([key]) => x[key]);
        const fields = zipWith(this._fields, values, ([k, c], d) => k + '=' + c.valueToString(d));
        return `record {${fields.join('; ')}}`;
    }
}
/**
 * Represents Tuple, a syntactic sugar for Record.
 * @param {Type} components
 */
class TupleClass extends RecordClass {
    constructor(_components) {
        const x = {};
        _components.forEach((e, i) => (x['_' + i + '_'] = e));
        super(x);
        this._components = _components;
    }
    accept(v, d) {
        return v.visitTuple(this, this._components, d);
    }
    covariant(x) {
        // `>=` because tuples can be covariant when encoded.
        return (Array.isArray(x) &&
            x.length >= this._fields.length &&
            this._components.every((t, i) => t.covariant(x[i])));
    }
    encodeValue(x) {
        const bufs = zipWith(this._components, x, (c, d) => c.encodeValue(d));
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...bufs);
    }
    decodeValue(b, t) {
        const tuple = this.checkType(t);
        if (!(tuple instanceof TupleClass)) {
            throw new Error('not a tuple type');
        }
        if (tuple._components.length < this._components.length) {
            throw new Error('tuple mismatch');
        }
        const res = [];
        for (const [i, wireType] of tuple._components.entries()) {
            if (i >= this._components.length) {
                // skip value
                wireType.decodeValue(b, wireType);
            }
            else {
                res.push(this._components[i].decodeValue(b, wireType));
            }
        }
        return res;
    }
    display() {
        const fields = this._components.map(value => value.display());
        return `record {${fields.join('; ')}}`;
    }
    valueToString(values) {
        const fields = zipWith(this._components, values, (c, d) => c.valueToString(d));
        return `record {${fields.join('; ')}}`;
    }
}
/**
 * Represents an IDL Variant
 * @param {Object} [fields] - mapping of function name to Type
 */
class VariantClass extends ConstructType {
    constructor(fields = {}) {
        super();
        this._fields = Object.entries(fields).sort((a, b) => (0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(a[0]) - (0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(b[0]));
    }
    accept(v, d) {
        return v.visitVariant(this, this._fields, d);
    }
    covariant(x) {
        return (typeof x === 'object' &&
            Object.entries(x).length === 1 &&
            this._fields.every(([k, v]) => {
                // eslint-disable-next-line
                return !x.hasOwnProperty(k) || v.covariant(x[k]);
            }));
    }
    encodeValue(x) {
        for (let i = 0; i < this._fields.length; i++) {
            const [name, type] = this._fields[i];
            // eslint-disable-next-line
            if (x.hasOwnProperty(name)) {
                const idx = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(i);
                const buf = type.encodeValue(x[name]);
                return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(idx, buf);
            }
        }
        throw Error('Variant has no data: ' + x);
    }
    _buildTypeTableImpl(typeTable) {
        this._fields.forEach(([, type]) => {
            type.buildTypeTable(typeTable);
        });
        const opCode = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-21 /* Variant */);
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(this._fields.length);
        const fields = this._fields.map(([key, value]) => (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)((0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(key)), value.encodeType(typeTable)));
        typeTable.add(this, (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(opCode, len, ...fields));
    }
    decodeValue(b, t) {
        const variant = this.checkType(t);
        if (!(variant instanceof VariantClass)) {
            throw new Error('Not a variant type');
        }
        const idx = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(b));
        if (idx >= variant._fields.length) {
            throw Error('Invalid variant index: ' + idx);
        }
        const [wireHash, wireType] = variant._fields[idx];
        for (const [key, expectType] of this._fields) {
            if ((0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(wireHash) === (0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(key)) {
                const value = expectType.decodeValue(b, wireType);
                return { [key]: value };
            }
        }
        throw new Error('Cannot find field hash ' + wireHash);
    }
    get name() {
        const fields = this._fields.map(([key, type]) => key + ':' + type.name);
        return `variant {${fields.join('; ')}}`;
    }
    display() {
        const fields = this._fields.map(([key, type]) => key + (type.name === 'null' ? '' : `:${type.display()}`));
        return `variant {${fields.join('; ')}}`;
    }
    valueToString(x) {
        for (const [name, type] of this._fields) {
            // eslint-disable-next-line
            if (x.hasOwnProperty(name)) {
                const value = type.valueToString(x[name]);
                if (value === 'null') {
                    return `variant {${name}}`;
                }
                else {
                    return `variant {${name}=${value}}`;
                }
            }
        }
        throw new Error('Variant has no data: ' + x);
    }
}
/**
 * Represents a reference to an IDL type, used for defining recursive data
 * types.
 */
class RecClass extends ConstructType {
    constructor() {
        super(...arguments);
        this._id = RecClass._counter++;
        this._type = undefined;
    }
    accept(v, d) {
        if (!this._type) {
            throw Error('Recursive type uninitialized.');
        }
        return v.visitRec(this, this._type, d);
    }
    fill(t) {
        this._type = t;
    }
    getType() {
        return this._type;
    }
    covariant(x) {
        return this._type ? this._type.covariant(x) : false;
    }
    encodeValue(x) {
        if (!this._type) {
            throw Error('Recursive type uninitialized.');
        }
        return this._type.encodeValue(x);
    }
    _buildTypeTableImpl(typeTable) {
        if (!this._type) {
            throw Error('Recursive type uninitialized.');
        }
        typeTable.add(this, new Uint8Array([]));
        this._type.buildTypeTable(typeTable);
        typeTable.merge(this, this._type.name);
    }
    decodeValue(b, t) {
        if (!this._type) {
            throw Error('Recursive type uninitialized.');
        }
        return this._type.decodeValue(b, t);
    }
    get name() {
        return `rec_${this._id}`;
    }
    display() {
        if (!this._type) {
            throw Error('Recursive type uninitialized.');
        }
        return `μ${this.name}.${this._type.name}`;
    }
    valueToString(x) {
        if (!this._type) {
            throw Error('Recursive type uninitialized.');
        }
        return this._type.valueToString(x);
    }
}
RecClass._counter = 0;
function decodePrincipalId(b) {
    const x = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeReadUint8)(b);
    if (x !== 1) {
        throw new Error('Cannot decode principal');
    }
    const len = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(b));
    return _dfinity_principal__WEBPACK_IMPORTED_MODULE_0__.Principal.fromUint8Array(new Uint8Array((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeRead)(b, len)));
}
/**
 * Represents an IDL principal reference
 */
class PrincipalClass extends PrimitiveType {
    accept(v, d) {
        return v.visitPrincipal(this, d);
    }
    covariant(x) {
        return x && x._isPrincipal;
    }
    encodeValue(x) {
        const buf = x.toUint8Array();
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(buf.byteLength);
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(new Uint8Array([1]), len, buf);
    }
    encodeType() {
        return (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-24 /* Principal */);
    }
    decodeValue(b, t) {
        this.checkType(t);
        return decodePrincipalId(b);
    }
    get name() {
        return 'principal';
    }
    valueToString(x) {
        return `${this.name} "${x.toText()}"`;
    }
}
/**
 * Represents an IDL function reference.
 * @param argTypes Argument types.
 * @param retTypes Return types.
 * @param annotations Function annotations.
 */
class FuncClass extends ConstructType {
    constructor(argTypes, retTypes, annotations = []) {
        super();
        this.argTypes = argTypes;
        this.retTypes = retTypes;
        this.annotations = annotations;
    }
    static argsToString(types, v) {
        if (types.length !== v.length) {
            throw new Error('arity mismatch');
        }
        return '(' + types.map((t, i) => t.valueToString(v[i])).join(', ') + ')';
    }
    accept(v, d) {
        return v.visitFunc(this, d);
    }
    covariant(x) {
        return (Array.isArray(x) && x.length === 2 && x[0] && x[0]._isPrincipal && typeof x[1] === 'string');
    }
    encodeValue([principal, methodName]) {
        const buf = principal.toUint8Array();
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(buf.byteLength);
        const canister = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(new Uint8Array([1]), len, buf);
        const method = new TextEncoder().encode(methodName);
        const methodLen = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(method.byteLength);
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(new Uint8Array([1]), canister, methodLen, method);
    }
    _buildTypeTableImpl(T) {
        this.argTypes.forEach(arg => arg.buildTypeTable(T));
        this.retTypes.forEach(arg => arg.buildTypeTable(T));
        const opCode = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-22 /* Func */);
        const argLen = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(this.argTypes.length);
        const args = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...this.argTypes.map(arg => arg.encodeType(T)));
        const retLen = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(this.retTypes.length);
        const rets = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...this.retTypes.map(arg => arg.encodeType(T)));
        const annLen = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(this.annotations.length);
        const anns = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...this.annotations.map(a => this.encodeAnnotation(a)));
        T.add(this, (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(opCode, argLen, args, retLen, rets, annLen, anns));
    }
    decodeValue(b) {
        const x = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeReadUint8)(b);
        if (x !== 1) {
            throw new Error('Cannot decode function reference');
        }
        const canister = decodePrincipalId(b);
        const mLen = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(b));
        const buf = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeRead)(b, mLen);
        const decoder = new TextDecoder('utf8', { fatal: true });
        const method = decoder.decode(buf);
        return [canister, method];
    }
    get name() {
        const args = this.argTypes.map(arg => arg.name).join(', ');
        const rets = this.retTypes.map(arg => arg.name).join(', ');
        const annon = ' ' + this.annotations.join(' ');
        return `(${args}) -> (${rets})${annon}`;
    }
    valueToString([principal, str]) {
        return `func "${principal.toText()}".${str}`;
    }
    display() {
        const args = this.argTypes.map(arg => arg.display()).join(', ');
        const rets = this.retTypes.map(arg => arg.display()).join(', ');
        const annon = ' ' + this.annotations.join(' ');
        return `(${args}) → (${rets})${annon}`;
    }
    encodeAnnotation(ann) {
        if (ann === 'query') {
            return new Uint8Array([1]);
        }
        else if (ann === 'oneway') {
            return new Uint8Array([2]);
        }
        else {
            throw new Error('Illegal function annotation');
        }
    }
}
class ServiceClass extends ConstructType {
    constructor(fields) {
        super();
        this._fields = Object.entries(fields).sort((a, b) => (0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(a[0]) - (0,_utils_hash__WEBPACK_IMPORTED_MODULE_2__.idlLabelToId)(b[0]));
    }
    accept(v, d) {
        return v.visitService(this, d);
    }
    covariant(x) {
        return x && x._isPrincipal;
    }
    encodeValue(x) {
        const buf = x.toUint8Array();
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(buf.length);
        return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(new Uint8Array([1]), len, buf);
    }
    _buildTypeTableImpl(T) {
        this._fields.forEach(([_, func]) => func.buildTypeTable(T));
        const opCode = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebEncode)(-23 /* Service */);
        const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(this._fields.length);
        const meths = this._fields.map(([label, func]) => {
            const labelBuf = new TextEncoder().encode(label);
            const labelLen = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(labelBuf.length);
            return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(labelLen, labelBuf, func.encodeType(T));
        });
        T.add(this, (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(opCode, len, ...meths));
    }
    decodeValue(b) {
        return decodePrincipalId(b);
    }
    get name() {
        const fields = this._fields.map(([key, value]) => key + ':' + value.name);
        return `service {${fields.join('; ')}}`;
    }
    valueToString(x) {
        return `service "${x.toText()}"`;
    }
}
/**
 *
 * @param x
 * @returns {string}
 */
function toReadableString(x) {
    return JSON.stringify(x, (_key, value) => typeof value === 'bigint' ? `BigInt(${value})` : value);
}
/**
 * Encode a array of values
 * @param argTypes
 * @param args
 * @returns {Buffer} serialised value
 */
function encode(argTypes, args) {
    if (args.length < argTypes.length) {
        throw Error('Wrong number of message arguments');
    }
    const typeTable = new TypeTable();
    argTypes.forEach(t => t.buildTypeTable(typeTable));
    const magic = new TextEncoder().encode(magicNumber);
    const table = typeTable.encode();
    const len = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebEncode)(args.length);
    const typs = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...argTypes.map(t => t.encodeType(typeTable)));
    const vals = (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(...zipWith(argTypes, args, (t, x) => {
        if (!t.covariant(x)) {
            throw new Error(`Invalid ${t.display()} argument: ${toReadableString(x)}`);
        }
        return t.encodeValue(x);
    }));
    return (0,_utils_buffer__WEBPACK_IMPORTED_MODULE_1__.concat)(magic, table, len, typs, vals);
}
/**
 * Decode a binary value
 * @param retTypes - Types expected in the buffer.
 * @param bytes - hex-encoded string, or buffer.
 * @returns Value deserialised to JS type
 */
function decode(retTypes, bytes) {
    const b = new _utils_buffer__WEBPACK_IMPORTED_MODULE_1__.PipeArrayBuffer(bytes);
    if (bytes.byteLength < magicNumber.length) {
        throw new Error('Message length smaller than magic number');
    }
    const magicBuffer = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeRead)(b, magicNumber.length);
    const magic = new TextDecoder().decode(magicBuffer);
    if (magic !== magicNumber) {
        throw new Error('Wrong magic number: ' + JSON.stringify(magic));
    }
    function readTypeTable(pipe) {
        const typeTable = [];
        const len = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
        for (let i = 0; i < len; i++) {
            const ty = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebDecode)(pipe));
            switch (ty) {
                case -18 /* Opt */:
                case -19 /* Vector */: {
                    const t = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebDecode)(pipe));
                    typeTable.push([ty, t]);
                    break;
                }
                case -20 /* Record */:
                case -21 /* Variant */: {
                    const fields = [];
                    let objectLength = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
                    let prevHash;
                    while (objectLength--) {
                        const hash = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
                        if (hash >= Math.pow(2, 32)) {
                            throw new Error('field id out of 32-bit range');
                        }
                        if (typeof prevHash === 'number' && prevHash >= hash) {
                            throw new Error('field id collision or not sorted');
                        }
                        prevHash = hash;
                        const t = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebDecode)(pipe));
                        fields.push([hash, t]);
                    }
                    typeTable.push([ty, fields]);
                    break;
                }
                case -22 /* Func */: {
                    const args = [];
                    let argLength = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
                    while (argLength--) {
                        args.push(Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebDecode)(pipe)));
                    }
                    const returnValues = [];
                    let returnValuesLength = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
                    while (returnValuesLength--) {
                        returnValues.push(Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebDecode)(pipe)));
                    }
                    const annotations = [];
                    let annotationLength = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
                    while (annotationLength--) {
                        const annotation = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
                        switch (annotation) {
                            case 1: {
                                annotations.push('query');
                                break;
                            }
                            case 2: {
                                annotations.push('oneway');
                                break;
                            }
                            default:
                                throw new Error('unknown annotation');
                        }
                    }
                    typeTable.push([ty, [args, returnValues, annotations]]);
                    break;
                }
                case -23 /* Service */: {
                    let servLength = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
                    const methods = [];
                    while (servLength--) {
                        const nameLength = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
                        const funcName = new TextDecoder().decode((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.safeRead)(pipe, nameLength));
                        const funcType = (0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebDecode)(pipe);
                        methods.push([funcName, funcType]);
                    }
                    typeTable.push([ty, methods]);
                    break;
                }
                default:
                    throw new Error('Illegal op_code: ' + ty);
            }
        }
        const rawList = [];
        const length = Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.lebDecode)(pipe));
        for (let i = 0; i < length; i++) {
            rawList.push(Number((0,_utils_leb128__WEBPACK_IMPORTED_MODULE_3__.slebDecode)(pipe)));
        }
        return [typeTable, rawList];
    }
    const [rawTable, rawTypes] = readTypeTable(b);
    if (rawTypes.length < retTypes.length) {
        throw new Error('Wrong number of return values');
    }
    const table = rawTable.map(_ => Rec());
    function getType(t) {
        if (t < -24) {
            throw new Error('future value not supported');
        }
        if (t < 0) {
            switch (t) {
                case -1:
                    return Null;
                case -2:
                    return Bool;
                case -3:
                    return Nat;
                case -4:
                    return Int;
                case -5:
                    return Nat8;
                case -6:
                    return Nat16;
                case -7:
                    return Nat32;
                case -8:
                    return Nat64;
                case -9:
                    return Int8;
                case -10:
                    return Int16;
                case -11:
                    return Int32;
                case -12:
                    return Int64;
                case -13:
                    return Float32;
                case -14:
                    return Float64;
                case -15:
                    return Text;
                case -16:
                    return Reserved;
                case -17:
                    return Empty;
                case -24:
                    return Principal;
                default:
                    throw new Error('Illegal op_code: ' + t);
            }
        }
        if (t >= rawTable.length) {
            throw new Error('type index out of range');
        }
        return table[t];
    }
    function buildType(entry) {
        switch (entry[0]) {
            case -19 /* Vector */: {
                const ty = getType(entry[1]);
                return Vec(ty);
            }
            case -18 /* Opt */: {
                const ty = getType(entry[1]);
                return Opt(ty);
            }
            case -20 /* Record */: {
                const fields = {};
                for (const [hash, ty] of entry[1]) {
                    const name = `_${hash}_`;
                    fields[name] = getType(ty);
                }
                const record = Record(fields);
                const tuple = record.tryAsTuple();
                if (Array.isArray(tuple)) {
                    return Tuple(...tuple);
                }
                else {
                    return record;
                }
            }
            case -21 /* Variant */: {
                const fields = {};
                for (const [hash, ty] of entry[1]) {
                    const name = `_${hash}_`;
                    fields[name] = getType(ty);
                }
                return Variant(fields);
            }
            case -22 /* Func */: {
                const [args, returnValues, annotations] = entry[1];
                return Func(args.map((t) => getType(t)), returnValues.map((t) => getType(t)), annotations);
            }
            case -23 /* Service */: {
                const rec = {};
                const methods = entry[1];
                for (const [name, typeRef] of methods) {
                    let type = getType(typeRef);
                    if (type instanceof RecClass) {
                        // unpack reference type
                        type = type.getType();
                    }
                    if (!(type instanceof FuncClass)) {
                        throw new Error('Illegal service definition: services can only contain functions');
                    }
                    rec[name] = type;
                }
                return Service(rec);
            }
            default:
                throw new Error('Illegal op_code: ' + entry[0]);
        }
    }
    rawTable.forEach((entry, i) => {
        const t = buildType(entry);
        table[i].fill(t);
    });
    const types = rawTypes.map(t => getType(t));
    const output = retTypes.map((t, i) => {
        return t.decodeValue(b, types[i]);
    });
    // skip unused values
    for (let ind = retTypes.length; ind < types.length; ind++) {
        types[ind].decodeValue(b, types[ind]);
    }
    if (b.byteLength > 0) {
        throw new Error('decode: Left-over bytes');
    }
    return output;
}
// Export Types instances.
const Empty = new EmptyClass();
const Reserved = new ReservedClass();
/**
 * Client-only type for deserializing unknown data. Not supported by Candid, and its use is discouraged.
 */
const Unknown = new UnknownClass();
const Bool = new BoolClass();
const Null = new NullClass();
const Text = new TextClass();
const Int = new IntClass();
const Nat = new NatClass();
const Float32 = new FloatClass(32);
const Float64 = new FloatClass(64);
const Int8 = new FixedIntClass(8);
const Int16 = new FixedIntClass(16);
const Int32 = new FixedIntClass(32);
const Int64 = new FixedIntClass(64);
const Nat8 = new FixedNatClass(8);
const Nat16 = new FixedNatClass(16);
const Nat32 = new FixedNatClass(32);
const Nat64 = new FixedNatClass(64);
const Principal = new PrincipalClass();
/**
 *
 * @param types array of any types
 * @returns TupleClass from those types
 */
function Tuple(...types) {
    return new TupleClass(types);
}
/**
 *
 * @param t IDL Type
 * @returns VecClass from that type
 */
function Vec(t) {
    return new VecClass(t);
}
/**
 *
 * @param t IDL Type
 * @returns OptClass of Type
 */
function Opt(t) {
    return new OptClass(t);
}
/**
 *
 * @param t Record of string and IDL Type
 * @returns RecordClass of string and Type
 */
function Record(t) {
    return new RecordClass(t);
}
/**
 *
 * @param fields Record of string and IDL Type
 * @returns VariantClass
 */
function Variant(fields) {
    return new VariantClass(fields);
}
/**
 *
 * @returns new RecClass
 */
function Rec() {
    return new RecClass();
}
/**
 *
 * @param args array of IDL Types
 * @param ret array of IDL Types
 * @param annotations array of strings, [] by default
 * @returns new FuncClass
 */
function Func(args, ret, annotations = []) {
    return new FuncClass(args, ret, annotations);
}
/**
 *
 * @param t Record of string and FuncClass
 * @returns ServiceClass
 */
function Service(t) {
    return new ServiceClass(t);
}
//# sourceMappingURL=idl.js.map

/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/esm/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/esm/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IDL": () => (/* reexport module object */ _idl__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   "InputBox": () => (/* reexport safe */ _candid_core__WEBPACK_IMPORTED_MODULE_1__.InputBox),
/* harmony export */   "InputForm": () => (/* reexport safe */ _candid_core__WEBPACK_IMPORTED_MODULE_1__.InputForm),
/* harmony export */   "OptionForm": () => (/* reexport safe */ _candid_core__WEBPACK_IMPORTED_MODULE_1__.OptionForm),
/* harmony export */   "RecordForm": () => (/* reexport safe */ _candid_core__WEBPACK_IMPORTED_MODULE_1__.RecordForm),
/* harmony export */   "Render": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.Render),
/* harmony export */   "TupleForm": () => (/* reexport safe */ _candid_core__WEBPACK_IMPORTED_MODULE_1__.TupleForm),
/* harmony export */   "VariantForm": () => (/* reexport safe */ _candid_core__WEBPACK_IMPORTED_MODULE_1__.VariantForm),
/* harmony export */   "VecForm": () => (/* reexport safe */ _candid_core__WEBPACK_IMPORTED_MODULE_1__.VecForm),
/* harmony export */   "idlLabelToId": () => (/* reexport safe */ _utils_hash__WEBPACK_IMPORTED_MODULE_3__.idlLabelToId),
/* harmony export */   "inputBox": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.inputBox),
/* harmony export */   "lebDecode": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.lebDecode),
/* harmony export */   "lebEncode": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.lebEncode),
/* harmony export */   "optForm": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.optForm),
/* harmony export */   "readIntLE": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.readIntLE),
/* harmony export */   "readUIntLE": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.readUIntLE),
/* harmony export */   "recordForm": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.recordForm),
/* harmony export */   "renderInput": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.renderInput),
/* harmony export */   "renderValue": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.renderValue),
/* harmony export */   "safeRead": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.safeRead),
/* harmony export */   "safeReadUint8": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.safeReadUint8),
/* harmony export */   "slebDecode": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.slebDecode),
/* harmony export */   "slebEncode": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.slebEncode),
/* harmony export */   "tupleForm": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.tupleForm),
/* harmony export */   "variantForm": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.variantForm),
/* harmony export */   "vecForm": () => (/* reexport safe */ _candid_ui__WEBPACK_IMPORTED_MODULE_0__.vecForm),
/* harmony export */   "writeIntLE": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.writeIntLE),
/* harmony export */   "writeUIntLE": () => (/* reexport safe */ _utils_leb128__WEBPACK_IMPORTED_MODULE_4__.writeUIntLE)
/* harmony export */ });
/* harmony import */ var _candid_ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./candid-ui */ "./node_modules/@dfinity/candid/lib/esm/candid-ui.js");
/* harmony import */ var _candid_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./candid-core */ "./node_modules/@dfinity/candid/lib/esm/candid-core.js");
/* harmony import */ var _idl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./idl */ "./node_modules/@dfinity/candid/lib/esm/idl.js");
/* harmony import */ var _utils_hash__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/hash */ "./node_modules/@dfinity/candid/lib/esm/utils/hash.js");
/* harmony import */ var _utils_leb128__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils/leb128 */ "./node_modules/@dfinity/candid/lib/esm/utils/leb128.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./types */ "./node_modules/@dfinity/candid/lib/esm/types.js");






//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/esm/types.js":
/*!*******************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/esm/types.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/esm/utils/buffer.js":
/*!**************************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/esm/utils/buffer.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PipeArrayBuffer": () => (/* binding */ PipeArrayBuffer),
/* harmony export */   "concat": () => (/* binding */ concat),
/* harmony export */   "fromHexString": () => (/* binding */ fromHexString),
/* harmony export */   "toHexString": () => (/* binding */ toHexString)
/* harmony export */ });
/**
 * Concatenate multiple array buffers.
 * @param buffers The buffers to concatenate.
 */
function concat(...buffers) {
    const result = new Uint8Array(buffers.reduce((acc, curr) => acc + curr.byteLength, 0));
    let index = 0;
    for (const b of buffers) {
        result.set(new Uint8Array(b), index);
        index += b.byteLength;
    }
    return result;
}
/**
 * Returns an hexadecimal representation of an array buffer.
 * @param bytes The array buffer.
 */
function toHexString(bytes) {
    return new Uint8Array(bytes).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}
/**
 * Return an array buffer from its hexadecimal representation.
 * @param hexString The hexadecimal string.
 */
function fromHexString(hexString) {
    var _a;
    return new Uint8Array(((_a = hexString.match(/.{1,2}/g)) !== null && _a !== void 0 ? _a : []).map(byte => parseInt(byte, 16)));
}
/**
 * A class that abstracts a pipe-like ArrayBuffer.
 */
class PipeArrayBuffer {
    /**
     * Creates a new instance of a pipe
     * @param buffer an optional buffer to start with
     * @param length an optional amount of bytes to use for the length.
     */
    constructor(buffer, length = (buffer === null || buffer === void 0 ? void 0 : buffer.byteLength) || 0) {
        this._buffer = buffer || new ArrayBuffer(0);
        this._view = new Uint8Array(this._buffer, 0, length);
    }
    get buffer() {
        // Return a copy of the buffer.
        return this._view.slice();
    }
    get byteLength() {
        return this._view.byteLength;
    }
    /**
     * Read `num` number of bytes from the front of the pipe.
     * @param num The number of bytes to read.
     */
    read(num) {
        const result = this._view.subarray(0, num);
        this._view = this._view.subarray(num);
        return result.slice().buffer;
    }
    readUint8() {
        const result = this._view[0];
        this._view = this._view.subarray(1);
        return result;
    }
    /**
     * Write a buffer to the end of the pipe.
     * @param buf The bytes to write.
     */
    write(buf) {
        const b = new Uint8Array(buf);
        const offset = this._view.byteLength;
        if (this._view.byteOffset + this._view.byteLength + b.byteLength >= this._buffer.byteLength) {
            // Alloc grow the view to include the new bytes.
            this.alloc(b.byteLength);
        }
        else {
            // Update the view to include the new bytes.
            this._view = new Uint8Array(this._buffer, this._view.byteOffset, this._view.byteLength + b.byteLength);
        }
        this._view.set(b, offset);
    }
    /**
     * Whether or not there is more data to read from the buffer
     */
    get end() {
        return this._view.byteLength === 0;
    }
    /**
     * Allocate a fixed amount of memory in the buffer. This does not affect the view.
     * @param amount A number of bytes to add to the buffer.
     */
    alloc(amount) {
        // Add a little bit of exponential growth.
        // tslint:disable-next-line:no-bitwise
        const b = new ArrayBuffer(((this._buffer.byteLength + amount) * 1.2) | 0);
        const v = new Uint8Array(b, 0, this._view.byteLength + amount);
        v.set(this._view);
        this._buffer = b;
        this._view = v;
    }
}
//# sourceMappingURL=buffer.js.map

/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/esm/utils/hash.js":
/*!************************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/esm/utils/hash.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "idlLabelToId": () => (/* binding */ idlLabelToId)
/* harmony export */ });
/**
 * Hashes a string to a number. Algorithm can be found here:
 * https://caml.inria.fr/pub/papers/garrigue-polymorphic_variants-ml98.pdf
 * @param s
 */
function idlHash(s) {
    const utf8encoder = new TextEncoder();
    const array = utf8encoder.encode(s);
    let h = 0;
    for (const c of array) {
        h = (h * 223 + c) % 2 ** 32;
    }
    return h;
}
/**
 *
 * @param label string
 * @returns number representing hashed label
 */
function idlLabelToId(label) {
    if (/^_\d+_$/.test(label) || /^_0x[0-9a-fA-F]+_$/.test(label)) {
        const num = +label.slice(1, -1);
        if (Number.isSafeInteger(num) && num >= 0 && num < 2 ** 32) {
            return num;
        }
    }
    return idlHash(label);
}
//# sourceMappingURL=hash.js.map

/***/ }),

/***/ "./node_modules/@dfinity/candid/lib/esm/utils/leb128.js":
/*!**************************************************************!*\
  !*** ./node_modules/@dfinity/candid/lib/esm/utils/leb128.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lebDecode": () => (/* binding */ lebDecode),
/* harmony export */   "lebEncode": () => (/* binding */ lebEncode),
/* harmony export */   "readIntLE": () => (/* binding */ readIntLE),
/* harmony export */   "readUIntLE": () => (/* binding */ readUIntLE),
/* harmony export */   "safeRead": () => (/* binding */ safeRead),
/* harmony export */   "safeReadUint8": () => (/* binding */ safeReadUint8),
/* harmony export */   "slebDecode": () => (/* binding */ slebDecode),
/* harmony export */   "slebEncode": () => (/* binding */ slebEncode),
/* harmony export */   "writeIntLE": () => (/* binding */ writeIntLE),
/* harmony export */   "writeUIntLE": () => (/* binding */ writeUIntLE)
/* harmony export */ });
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./buffer */ "./node_modules/@dfinity/candid/lib/esm/utils/buffer.js");
/* eslint-disable no-constant-condition */
// tslint:disable:no-bitwise
// Note: this file uses buffer-pipe, which on Node only, uses the Node Buffer
//       implementation, which isn't compatible with the NPM buffer package
//       which we use everywhere else. This means that we have to transform
//       one into the other, hence why every function that returns a Buffer
//       actually return `new Buffer(pipe.buffer)`.
// TODO: The best solution would be to have our own buffer type around
//       Uint8Array which is standard.

function eob() {
    throw new Error('unexpected end of buffer');
}
/**
 *
 * @param pipe Pipe from buffer-pipe
 * @param num number
 * @returns Buffer
 */
function safeRead(pipe, num) {
    if (pipe.byteLength < num) {
        eob();
    }
    return pipe.read(num);
}
/**
 * @param pipe
 */
function safeReadUint8(pipe) {
    const byte = pipe.readUint8();
    if (byte === undefined) {
        eob();
    }
    return byte;
}
/**
 * Encode a positive number (or bigint) into a Buffer. The number will be floored to the
 * nearest integer.
 * @param value The number to encode.
 */
function lebEncode(value) {
    if (typeof value === 'number') {
        value = BigInt(value);
    }
    if (value < BigInt(0)) {
        throw new Error('Cannot leb encode negative values.');
    }
    const byteLength = (value === BigInt(0) ? 0 : Math.ceil(Math.log2(Number(value)))) + 1;
    const pipe = new _buffer__WEBPACK_IMPORTED_MODULE_0__.PipeArrayBuffer(new ArrayBuffer(byteLength), 0);
    while (true) {
        const i = Number(value & BigInt(0x7f));
        value /= BigInt(0x80);
        if (value === BigInt(0)) {
            pipe.write(new Uint8Array([i]));
            break;
        }
        else {
            pipe.write(new Uint8Array([i | 0x80]));
        }
    }
    return pipe.buffer;
}
/**
 * Decode a leb encoded buffer into a bigint. The number will always be positive (does not
 * support signed leb encoding).
 * @param pipe A Buffer containing the leb encoded bits.
 */
function lebDecode(pipe) {
    let weight = BigInt(1);
    let value = BigInt(0);
    let byte;
    do {
        byte = safeReadUint8(pipe);
        value += BigInt(byte & 0x7f).valueOf() * weight;
        weight *= BigInt(128);
    } while (byte >= 0x80);
    return value;
}
/**
 * Encode a number (or bigint) into a Buffer, with support for negative numbers. The number
 * will be floored to the nearest integer.
 * @param value The number to encode.
 */
function slebEncode(value) {
    if (typeof value === 'number') {
        value = BigInt(value);
    }
    const isNeg = value < BigInt(0);
    if (isNeg) {
        value = -value - BigInt(1);
    }
    const byteLength = (value === BigInt(0) ? 0 : Math.ceil(Math.log2(Number(value)))) + 1;
    const pipe = new _buffer__WEBPACK_IMPORTED_MODULE_0__.PipeArrayBuffer(new ArrayBuffer(byteLength), 0);
    while (true) {
        const i = getLowerBytes(value);
        value /= BigInt(0x80);
        // prettier-ignore
        if ((isNeg && value === BigInt(0) && (i & 0x40) !== 0)
            || (!isNeg && value === BigInt(0) && (i & 0x40) === 0)) {
            pipe.write(new Uint8Array([i]));
            break;
        }
        else {
            pipe.write(new Uint8Array([i | 0x80]));
        }
    }
    function getLowerBytes(num) {
        const bytes = num % BigInt(0x80);
        if (isNeg) {
            // We swap the bits here again, and remove 1 to do two's complement.
            return Number(BigInt(0x80) - bytes - BigInt(1));
        }
        else {
            return Number(bytes);
        }
    }
    return pipe.buffer;
}
/**
 * Decode a leb encoded buffer into a bigint. The number is decoded with support for negative
 * signed-leb encoding.
 * @param pipe A Buffer containing the signed leb encoded bits.
 */
function slebDecode(pipe) {
    // Get the size of the buffer, then cut a buffer of that size.
    const pipeView = new Uint8Array(pipe.buffer);
    let len = 0;
    for (; len < pipeView.byteLength; len++) {
        if (pipeView[len] < 0x80) {
            // If it's a positive number, we reuse lebDecode.
            if ((pipeView[len] & 0x40) === 0) {
                return lebDecode(pipe);
            }
            break;
        }
    }
    const bytes = new Uint8Array(safeRead(pipe, len + 1));
    let value = BigInt(0);
    for (let i = bytes.byteLength - 1; i >= 0; i--) {
        value = value * BigInt(0x80) + BigInt(0x80 - (bytes[i] & 0x7f) - 1);
    }
    return -value - BigInt(1);
}
/**
 *
 * @param value bigint or number
 * @param byteLength number
 * @returns Buffer
 */
function writeUIntLE(value, byteLength) {
    if (BigInt(value) < BigInt(0)) {
        throw new Error('Cannot write negative values.');
    }
    return writeIntLE(value, byteLength);
}
/**
 *
 * @param value
 * @param byteLength
 */
function writeIntLE(value, byteLength) {
    value = BigInt(value);
    const pipe = new _buffer__WEBPACK_IMPORTED_MODULE_0__.PipeArrayBuffer(new ArrayBuffer(Math.min(1, byteLength)), 0);
    let i = 0;
    let mul = BigInt(256);
    let sub = BigInt(0);
    let byte = Number(value % mul);
    pipe.write(new Uint8Array([byte]));
    while (++i < byteLength) {
        if (value < 0 && sub === BigInt(0) && byte !== 0) {
            sub = BigInt(1);
        }
        byte = Number((value / mul - sub) % BigInt(256));
        pipe.write(new Uint8Array([byte]));
        mul *= BigInt(256);
    }
    return pipe.buffer;
}
/**
 *
 * @param pipe Pipe from buffer-pipe
 * @param byteLength number
 * @returns bigint
 */
function readUIntLE(pipe, byteLength) {
    let val = BigInt(safeReadUint8(pipe));
    let mul = BigInt(1);
    let i = 0;
    while (++i < byteLength) {
        mul *= BigInt(256);
        const byte = BigInt(safeReadUint8(pipe));
        val = val + mul * byte;
    }
    return val;
}
/**
 *
 * @param pipe Pipe from buffer-pipe
 * @param byteLength number
 * @returns bigint
 */
function readIntLE(pipe, byteLength) {
    let val = readUIntLE(pipe, byteLength);
    const mul = BigInt(2) ** (BigInt(8) * BigInt(byteLength - 1) + BigInt(7));
    if (val >= mul) {
        val -= mul * BigInt(2);
    }
    return val;
}
//# sourceMappingURL=leb128.js.map

/***/ }),

/***/ "./node_modules/@dfinity/principal/lib/esm/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@dfinity/principal/lib/esm/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Principal": () => (/* binding */ Principal)
/* harmony export */ });
/* harmony import */ var _utils_base32__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/base32 */ "./node_modules/@dfinity/principal/lib/esm/utils/base32.js");
/* harmony import */ var _utils_getCrc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/getCrc */ "./node_modules/@dfinity/principal/lib/esm/utils/getCrc.js");
/* harmony import */ var _utils_sha224__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/sha224 */ "./node_modules/@dfinity/principal/lib/esm/utils/sha224.js");



const SELF_AUTHENTICATING_SUFFIX = 2;
const ANONYMOUS_SUFFIX = 4;
const fromHexString = (hexString) => { var _a; return new Uint8Array(((_a = hexString.match(/.{1,2}/g)) !== null && _a !== void 0 ? _a : []).map(byte => parseInt(byte, 16))); };
const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
class Principal {
    constructor(_arr) {
        this._arr = _arr;
        this._isPrincipal = true;
    }
    static anonymous() {
        return new this(new Uint8Array([ANONYMOUS_SUFFIX]));
    }
    static selfAuthenticating(publicKey) {
        const sha = (0,_utils_sha224__WEBPACK_IMPORTED_MODULE_2__.sha224)(publicKey);
        return new this(new Uint8Array([...sha, SELF_AUTHENTICATING_SUFFIX]));
    }
    static from(other) {
        if (typeof other === 'string') {
            return Principal.fromText(other);
        }
        else if (typeof other === 'object' &&
            other !== null &&
            other._isPrincipal === true) {
            return new Principal(other._arr);
        }
        throw new Error(`Impossible to convert ${JSON.stringify(other)} to Principal.`);
    }
    static fromHex(hex) {
        return new this(fromHexString(hex));
    }
    static fromText(text) {
        const canisterIdNoDash = text.toLowerCase().replace(/-/g, '');
        let arr = (0,_utils_base32__WEBPACK_IMPORTED_MODULE_0__.decode)(canisterIdNoDash);
        arr = arr.slice(4, arr.length);
        const principal = new this(arr);
        if (principal.toText() !== text) {
            throw new Error(`Principal "${principal.toText()}" does not have a valid checksum (original value "${text}" may not be a valid Principal ID).`);
        }
        return principal;
    }
    static fromUint8Array(arr) {
        return new this(arr);
    }
    isAnonymous() {
        return this._arr.byteLength === 1 && this._arr[0] === ANONYMOUS_SUFFIX;
    }
    toUint8Array() {
        return this._arr;
    }
    toHex() {
        return toHexString(this._arr).toUpperCase();
    }
    toText() {
        const checksumArrayBuf = new ArrayBuffer(4);
        const view = new DataView(checksumArrayBuf);
        view.setUint32(0, (0,_utils_getCrc__WEBPACK_IMPORTED_MODULE_1__.getCrc32)(this._arr));
        const checksum = new Uint8Array(checksumArrayBuf);
        const bytes = Uint8Array.from(this._arr);
        const array = new Uint8Array([...checksum, ...bytes]);
        const result = (0,_utils_base32__WEBPACK_IMPORTED_MODULE_0__.encode)(array);
        const matches = result.match(/.{1,5}/g);
        if (!matches) {
            // This should only happen if there's no character, which is unreachable.
            throw new Error();
        }
        return matches.join('-');
    }
    toString() {
        return this.toText();
    }
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@dfinity/principal/lib/esm/utils/base32.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@dfinity/principal/lib/esm/utils/base32.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode)
/* harmony export */ });
// tslint:disable:no-bitwise
const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
// Build a lookup table for decoding.
const lookupTable = Object.create(null);
for (let i = 0; i < alphabet.length; i++) {
    lookupTable[alphabet[i]] = i;
}
// Add aliases for rfc4648.
lookupTable['0'] = lookupTable.o;
lookupTable['1'] = lookupTable.i;
/**
 * @param input The input array to encode.
 * @returns A Base32 string encoding the input.
 */
function encode(input) {
    // How many bits will we skip from the first byte.
    let skip = 0;
    // 5 high bits, carry from one byte to the next.
    let bits = 0;
    // The output string in base32.
    let output = '';
    function encodeByte(byte) {
        if (skip < 0) {
            // we have a carry from the previous byte
            bits |= byte >> -skip;
        }
        else {
            // no carry
            bits = (byte << skip) & 248;
        }
        if (skip > 3) {
            // Not enough data to produce a character, get us another one
            skip -= 8;
            return 1;
        }
        if (skip < 4) {
            // produce a character
            output += alphabet[bits >> 3];
            skip += 5;
        }
        return 0;
    }
    for (let i = 0; i < input.length;) {
        i += encodeByte(input[i]);
    }
    return output + (skip < 0 ? alphabet[bits >> 3] : '');
}
/**
 * @param input The base32 encoded string to decode.
 */
function decode(input) {
    // how many bits we have from the previous character.
    let skip = 0;
    // current byte we're producing.
    let byte = 0;
    const output = new Uint8Array(((input.length * 4) / 3) | 0);
    let o = 0;
    function decodeChar(char) {
        // Consume a character from the stream, store
        // the output in this.output. As before, better
        // to use update().
        let val = lookupTable[char.toLowerCase()];
        if (val === undefined) {
            throw new Error(`Invalid character: ${JSON.stringify(char)}`);
        }
        // move to the high bits
        val <<= 3;
        byte |= val >>> skip;
        skip += 5;
        if (skip >= 8) {
            // We have enough bytes to produce an output
            output[o++] = byte;
            skip -= 8;
            if (skip > 0) {
                byte = (val << (5 - skip)) & 255;
            }
            else {
                byte = 0;
            }
        }
    }
    for (const c of input) {
        decodeChar(c);
    }
    return output.slice(0, o);
}
//# sourceMappingURL=base32.js.map

/***/ }),

/***/ "./node_modules/@dfinity/principal/lib/esm/utils/getCrc.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@dfinity/principal/lib/esm/utils/getCrc.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getCrc32": () => (/* binding */ getCrc32)
/* harmony export */ });
// tslint:disable:no-bitwise
// This file is translated to JavaScript from
// https://lxp32.github.io/docs/a-simple-example-crc32-calculation/
const lookUpTable = new Uint32Array([
    0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3,
    0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91,
    0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
    0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5,
    0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
    0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
    0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f,
    0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,
    0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
    0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
    0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457,
    0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
    0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb,
    0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9,
    0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
    0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad,
    0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683,
    0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
    0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7,
    0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
    0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
    0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79,
    0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f,
    0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
    0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
    0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21,
    0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
    0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45,
    0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db,
    0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
    0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf,
    0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d,
]);
/**
 * Calculate the CRC32 of an ArrayBufferLike.
 * @param buf The BufferLike to calculate the CRC32 of.
 */
function getCrc32(buf) {
    const b = new Uint8Array(buf);
    let crc = -1;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < b.length; i++) {
        const byte = b[i];
        const t = (byte ^ crc) & 0xff;
        crc = lookUpTable[t] ^ (crc >>> 8);
    }
    return (crc ^ -1) >>> 0;
}
//# sourceMappingURL=getCrc.js.map

/***/ }),

/***/ "./node_modules/@dfinity/principal/lib/esm/utils/sha224.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@dfinity/principal/lib/esm/utils/sha224.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sha224": () => (/* binding */ sha224)
/* harmony export */ });
/* harmony import */ var js_sha256__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! js-sha256 */ "./node_modules/js-sha256/src/sha256.js");
/* harmony import */ var js_sha256__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(js_sha256__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Returns the SHA224 hash of the buffer.
 * @param data Arraybuffer to encode
 */
function sha224(data) {
    const shaObj = js_sha256__WEBPACK_IMPORTED_MODULE_0__.sha224.create();
    shaObj.update(data);
    return new Uint8Array(shaObj.array());
}
//# sourceMappingURL=sha224.js.map

/***/ }),

/***/ "./node_modules/base64-arraybuffer/dist/base64-arraybuffer.es5.js":
/*!************************************************************************!*\
  !*** ./node_modules/base64-arraybuffer/dist/base64-arraybuffer.es5.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode)
/* harmony export */ });
/*
 * base64-arraybuffer 1.0.2 <https://github.com/niklasvh/base64-arraybuffer>
 * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}
var encode = function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    }
    else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
};
var decode = function (base64) {
    var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }
    var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return arraybuffer;
};


//# sourceMappingURL=base64-arraybuffer.es5.js.map


/***/ }),

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ "./node_modules/bignumber.js/bignumber.js":
/*!************************************************!*\
  !*** ./node_modules/bignumber.js/bignumber.js ***!
  \************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;;(function (globalObject) {
  'use strict';

/*
 *      bignumber.js v9.0.2
 *      A JavaScript library for arbitrary-precision arithmetic.
 *      https://github.com/MikeMcl/bignumber.js
 *      Copyright (c) 2021 Michael Mclaughlin <M8ch88l@gmail.com>
 *      MIT Licensed.
 *
 *      BigNumber.prototype methods     |  BigNumber methods
 *                                      |
 *      absoluteValue            abs    |  clone
 *      comparedTo                      |  config               set
 *      decimalPlaces            dp     |      DECIMAL_PLACES
 *      dividedBy                div    |      ROUNDING_MODE
 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
 *      exponentiatedBy          pow    |      RANGE
 *      integerValue                    |      CRYPTO
 *      isEqualTo                eq     |      MODULO_MODE
 *      isFinite                        |      POW_PRECISION
 *      isGreaterThan            gt     |      FORMAT
 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
 *      isInteger                       |  isBigNumber
 *      isLessThan               lt     |  maximum              max
 *      isLessThanOrEqualTo      lte    |  minimum              min
 *      isNaN                           |  random
 *      isNegative                      |  sum
 *      isPositive                      |
 *      isZero                          |
 *      minus                           |
 *      modulo                   mod    |
 *      multipliedBy             times  |
 *      negated                         |
 *      plus                            |
 *      precision                sd     |
 *      shiftedBy                       |
 *      squareRoot               sqrt   |
 *      toExponential                   |
 *      toFixed                         |
 *      toFormat                        |
 *      toFraction                      |
 *      toJSON                          |
 *      toNumber                        |
 *      toPrecision                     |
 *      toString                        |
 *      valueOf                         |
 *
 */


  var BigNumber,
    isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
    mathceil = Math.ceil,
    mathfloor = Math.floor,

    bignumberError = '[BigNumber Error] ',
    tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

    BASE = 1e14,
    LOG_BASE = 14,
    MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
    // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
    POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
    SQRT_BASE = 1e7,

    // EDITABLE
    // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
    // the arguments to toExponential, toFixed, toFormat, and toPrecision.
    MAX = 1E9;                                   // 0 to MAX_INT32


  /*
   * Create and return a BigNumber constructor.
   */
  function clone(configObject) {
    var div, convertBase, parseNumeric,
      P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
      ONE = new BigNumber(1),


      //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


      // The default values below must be integers within the inclusive ranges stated.
      // The values can also be changed at run-time using BigNumber.set.

      // The maximum number of decimal places for operations involving division.
      DECIMAL_PLACES = 20,                     // 0 to MAX

      // The rounding mode used when rounding to the above decimal places, and when using
      // toExponential, toFixed, toFormat and toPrecision, and round (default value).
      // UP         0 Away from zero.
      // DOWN       1 Towards zero.
      // CEIL       2 Towards +Infinity.
      // FLOOR      3 Towards -Infinity.
      // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
      ROUNDING_MODE = 4,                       // 0 to 8

      // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

      // The exponent value at and beneath which toString returns exponential notation.
      // Number type: -7
      TO_EXP_NEG = -7,                         // 0 to -MAX

      // The exponent value at and above which toString returns exponential notation.
      // Number type: 21
      TO_EXP_POS = 21,                         // 0 to MAX

      // RANGE : [MIN_EXP, MAX_EXP]

      // The minimum exponent value, beneath which underflow to zero occurs.
      // Number type: -324  (5e-324)
      MIN_EXP = -1e7,                          // -1 to -MAX

      // The maximum exponent value, above which overflow to Infinity occurs.
      // Number type:  308  (1.7976931348623157e+308)
      // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
      MAX_EXP = 1e7,                           // 1 to MAX

      // Whether to use cryptographically-secure random number generation, if available.
      CRYPTO = false,                          // true or false

      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP        0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN      1 The remainder has the same sign as the dividend.
      //             This modulo mode is commonly known as 'truncated division' and is
      //             equivalent to (a % n) in JavaScript.
      // FLOOR     3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
      // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
      //             The remainder is always positive.
      //
      // The truncated division, floored division, Euclidian division and IEEE 754 remainder
      // modes are commonly used for the modulus operation.
      // Although the other rounding modes can also be used, they may not give useful results.
      MODULO_MODE = 1,                         // 0 to 9

      // The maximum number of significant digits of the result of the exponentiatedBy operation.
      // If POW_PRECISION is 0, there will be unlimited significant digits.
      POW_PRECISION = 0,                       // 0 to MAX

      // The format specification used by the BigNumber.prototype.toFormat method.
      FORMAT = {
        prefix: '',
        groupSize: 3,
        secondaryGroupSize: 0,
        groupSeparator: ',',
        decimalSeparator: '.',
        fractionGroupSize: 0,
        fractionGroupSeparator: '\xA0',        // non-breaking space
        suffix: ''
      },

      // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
      // '-', '.', whitespace, or repeated character.
      // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
      ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz',
      alphabetHasNormalDecimalDigits = true;


    //------------------------------------------------------------------------------------------


    // CONSTRUCTOR


    /*
     * The BigNumber constructor and exported function.
     * Create and return a new instance of a BigNumber object.
     *
     * v {number|string|BigNumber} A numeric value.
     * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
     */
    function BigNumber(v, b) {
      var alphabet, c, caseChanged, e, i, isNum, len, str,
        x = this;

      // Enable constructor call without `new`.
      if (!(x instanceof BigNumber)) return new BigNumber(v, b);

      if (b == null) {

        if (v && v._isBigNumber === true) {
          x.s = v.s;

          if (!v.c || v.e > MAX_EXP) {
            x.c = x.e = null;
          } else if (v.e < MIN_EXP) {
            x.c = [x.e = 0];
          } else {
            x.e = v.e;
            x.c = v.c.slice();
          }

          return;
        }

        if ((isNum = typeof v == 'number') && v * 0 == 0) {

          // Use `1 / n` to handle minus zero also.
          x.s = 1 / v < 0 ? (v = -v, -1) : 1;

          // Fast path for integers, where n < 2147483648 (2**31).
          if (v === ~~v) {
            for (e = 0, i = v; i >= 10; i /= 10, e++);

            if (e > MAX_EXP) {
              x.c = x.e = null;
            } else {
              x.e = e;
              x.c = [v];
            }

            return;
          }

          str = String(v);
        } else {

          if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);

          x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
        }

        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

        // Exponential form?
        if ((i = str.search(/e/i)) > 0) {

          // Determine exponent.
          if (e < 0) e = i;
          e += +str.slice(i + 1);
          str = str.substring(0, i);
        } else if (e < 0) {

          // Integer.
          e = str.length;
        }

      } else {

        // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
        intCheck(b, 2, ALPHABET.length, 'Base');

        // Allow exponential notation to be used with base 10 argument, while
        // also rounding to DECIMAL_PLACES as with other bases.
        if (b == 10 && alphabetHasNormalDecimalDigits) {
          x = new BigNumber(v);
          return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
        }

        str = String(v);

        if (isNum = typeof v == 'number') {

          // Avoid potential interpretation of Infinity and NaN as base 44+ values.
          if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

          x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

          // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
          if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
            throw Error
             (tooManyDigits + v);
          }
        } else {
          x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
        }

        alphabet = ALPHABET.slice(0, b);
        e = i = 0;

        // Check that str is a valid base b number.
        // Don't use RegExp, so alphabet can contain special characters.
        for (len = str.length; i < len; i++) {
          if (alphabet.indexOf(c = str.charAt(i)) < 0) {
            if (c == '.') {

              // If '.' is not the first character and it has not be found before.
              if (i > e) {
                e = len;
                continue;
              }
            } else if (!caseChanged) {

              // Allow e.g. hexadecimal 'FF' as well as 'ff'.
              if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
                  str == str.toLowerCase() && (str = str.toUpperCase())) {
                caseChanged = true;
                i = -1;
                e = 0;
                continue;
              }
            }

            return parseNumeric(x, String(v), isNum, b);
          }
        }

        // Prevent later check for length on converted number.
        isNum = false;
        str = convertBase(str, b, 10, x.s);

        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
        else e = str.length;
      }

      // Determine leading zeros.
      for (i = 0; str.charCodeAt(i) === 48; i++);

      // Determine trailing zeros.
      for (len = str.length; str.charCodeAt(--len) === 48;);

      if (str = str.slice(i, ++len)) {
        len -= i;

        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
        if (isNum && BigNumber.DEBUG &&
          len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
            throw Error
             (tooManyDigits + (x.s * v));
        }

         // Overflow?
        if ((e = e - i - 1) > MAX_EXP) {

          // Infinity.
          x.c = x.e = null;

        // Underflow?
        } else if (e < MIN_EXP) {

          // Zero.
          x.c = [x.e = 0];
        } else {
          x.e = e;
          x.c = [];

          // Transform base

          // e is the base 10 exponent.
          // i is where to slice str to get the first element of the coefficient array.
          i = (e + 1) % LOG_BASE;
          if (e < 0) i += LOG_BASE;  // i < 1

          if (i < len) {
            if (i) x.c.push(+str.slice(0, i));

            for (len -= LOG_BASE; i < len;) {
              x.c.push(+str.slice(i, i += LOG_BASE));
            }

            i = LOG_BASE - (str = str.slice(i)).length;
          } else {
            i -= len;
          }

          for (; i--; str += '0');
          x.c.push(+str);
        }
      } else {

        // Zero.
        x.c = [x.e = 0];
      }
    }


    // CONSTRUCTOR PROPERTIES


    BigNumber.clone = clone;

    BigNumber.ROUND_UP = 0;
    BigNumber.ROUND_DOWN = 1;
    BigNumber.ROUND_CEIL = 2;
    BigNumber.ROUND_FLOOR = 3;
    BigNumber.ROUND_HALF_UP = 4;
    BigNumber.ROUND_HALF_DOWN = 5;
    BigNumber.ROUND_HALF_EVEN = 6;
    BigNumber.ROUND_HALF_CEIL = 7;
    BigNumber.ROUND_HALF_FLOOR = 8;
    BigNumber.EUCLID = 9;


    /*
     * Configure infrequently-changing library-wide settings.
     *
     * Accept an object with the following optional properties (if the value of a property is
     * a number, it must be an integer within the inclusive range stated):
     *
     *   DECIMAL_PLACES   {number}           0 to MAX
     *   ROUNDING_MODE    {number}           0 to 8
     *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
     *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
     *   CRYPTO           {boolean}          true or false
     *   MODULO_MODE      {number}           0 to 9
     *   POW_PRECISION       {number}           0 to MAX
     *   ALPHABET         {string}           A string of two or more unique characters which does
     *                                       not contain '.'.
     *   FORMAT           {object}           An object with some of the following properties:
     *     prefix                 {string}
     *     groupSize              {number}
     *     secondaryGroupSize     {number}
     *     groupSeparator         {string}
     *     decimalSeparator       {string}
     *     fractionGroupSize      {number}
     *     fractionGroupSeparator {string}
     *     suffix                 {string}
     *
     * (The values assigned to the above FORMAT object properties are not checked for validity.)
     *
     * E.g.
     * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
     *
     * Ignore properties/parameters set to null or undefined, except for ALPHABET.
     *
     * Return an object with the properties current values.
     */
    BigNumber.config = BigNumber.set = function (obj) {
      var p, v;

      if (obj != null) {

        if (typeof obj == 'object') {

          // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
          // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
            v = obj[p];
            intCheck(v, 0, MAX, p);
            DECIMAL_PLACES = v;
          }

          // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
          // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
            v = obj[p];
            intCheck(v, 0, 8, p);
            ROUNDING_MODE = v;
          }

          // EXPONENTIAL_AT {number|number[]}
          // Integer, -MAX to MAX inclusive or
          // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
          // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
            v = obj[p];
            if (v && v.pop) {
              intCheck(v[0], -MAX, 0, p);
              intCheck(v[1], 0, MAX, p);
              TO_EXP_NEG = v[0];
              TO_EXP_POS = v[1];
            } else {
              intCheck(v, -MAX, MAX, p);
              TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
            }
          }

          // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
          // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
          // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
          if (obj.hasOwnProperty(p = 'RANGE')) {
            v = obj[p];
            if (v && v.pop) {
              intCheck(v[0], -MAX, -1, p);
              intCheck(v[1], 1, MAX, p);
              MIN_EXP = v[0];
              MAX_EXP = v[1];
            } else {
              intCheck(v, -MAX, MAX, p);
              if (v) {
                MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
              } else {
                throw Error
                 (bignumberError + p + ' cannot be zero: ' + v);
              }
            }
          }

          // CRYPTO {boolean} true or false.
          // '[BigNumber Error] CRYPTO not true or false: {v}'
          // '[BigNumber Error] crypto unavailable'
          if (obj.hasOwnProperty(p = 'CRYPTO')) {
            v = obj[p];
            if (v === !!v) {
              if (v) {
                if (typeof crypto != 'undefined' && crypto &&
                 (crypto.getRandomValues || crypto.randomBytes)) {
                  CRYPTO = v;
                } else {
                  CRYPTO = !v;
                  throw Error
                   (bignumberError + 'crypto unavailable');
                }
              } else {
                CRYPTO = v;
              }
            } else {
              throw Error
               (bignumberError + p + ' not true or false: ' + v);
            }
          }

          // MODULO_MODE {number} Integer, 0 to 9 inclusive.
          // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
            v = obj[p];
            intCheck(v, 0, 9, p);
            MODULO_MODE = v;
          }

          // POW_PRECISION {number} Integer, 0 to MAX inclusive.
          // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
            v = obj[p];
            intCheck(v, 0, MAX, p);
            POW_PRECISION = v;
          }

          // FORMAT {object}
          // '[BigNumber Error] FORMAT not an object: {v}'
          if (obj.hasOwnProperty(p = 'FORMAT')) {
            v = obj[p];
            if (typeof v == 'object') FORMAT = v;
            else throw Error
             (bignumberError + p + ' not an object: ' + v);
          }

          // ALPHABET {string}
          // '[BigNumber Error] ALPHABET invalid: {v}'
          if (obj.hasOwnProperty(p = 'ALPHABET')) {
            v = obj[p];

            // Disallow if less than two characters,
            // or if it contains '+', '-', '.', whitespace, or a repeated character.
            if (typeof v == 'string' && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
              alphabetHasNormalDecimalDigits = v.slice(0, 10) == '0123456789';
              ALPHABET = v;
            } else {
              throw Error
               (bignumberError + p + ' invalid: ' + v);
            }
          }

        } else {

          // '[BigNumber Error] Object expected: {v}'
          throw Error
           (bignumberError + 'Object expected: ' + obj);
        }
      }

      return {
        DECIMAL_PLACES: DECIMAL_PLACES,
        ROUNDING_MODE: ROUNDING_MODE,
        EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
        RANGE: [MIN_EXP, MAX_EXP],
        CRYPTO: CRYPTO,
        MODULO_MODE: MODULO_MODE,
        POW_PRECISION: POW_PRECISION,
        FORMAT: FORMAT,
        ALPHABET: ALPHABET
      };
    };


    /*
     * Return true if v is a BigNumber instance, otherwise return false.
     *
     * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
     *
     * v {any}
     *
     * '[BigNumber Error] Invalid BigNumber: {v}'
     */
    BigNumber.isBigNumber = function (v) {
      if (!v || v._isBigNumber !== true) return false;
      if (!BigNumber.DEBUG) return true;

      var i, n,
        c = v.c,
        e = v.e,
        s = v.s;

      out: if ({}.toString.call(c) == '[object Array]') {

        if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

          // If the first element is zero, the BigNumber value must be zero.
          if (c[0] === 0) {
            if (e === 0 && c.length === 1) return true;
            break out;
          }

          // Calculate number of digits that c[0] should have, based on the exponent.
          i = (e + 1) % LOG_BASE;
          if (i < 1) i += LOG_BASE;

          // Calculate number of digits of c[0].
          //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
          if (String(c[0]).length == i) {

            for (i = 0; i < c.length; i++) {
              n = c[i];
              if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
            }

            // Last element cannot be zero, unless it is the only element.
            if (n !== 0) return true;
          }
        }

      // Infinity/NaN
      } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
        return true;
      }

      throw Error
        (bignumberError + 'Invalid BigNumber: ' + v);
    };


    /*
     * Return a new BigNumber whose value is the maximum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.maximum = BigNumber.max = function () {
      return maxOrMin(arguments, P.lt);
    };


    /*
     * Return a new BigNumber whose value is the minimum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.minimum = BigNumber.min = function () {
      return maxOrMin(arguments, P.gt);
    };


    /*
     * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
     * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
     * zeros are produced).
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
     * '[BigNumber Error] crypto unavailable'
     */
    BigNumber.random = (function () {
      var pow2_53 = 0x20000000000000;

      // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
      // Check if Math.random() produces more than 32 bits of randomness.
      // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
      // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
      var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
       ? function () { return mathfloor(Math.random() * pow2_53); }
       : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
         (Math.random() * 0x800000 | 0); };

      return function (dp) {
        var a, b, e, k, v,
          i = 0,
          c = [],
          rand = new BigNumber(ONE);

        if (dp == null) dp = DECIMAL_PLACES;
        else intCheck(dp, 0, MAX);

        k = mathceil(dp / LOG_BASE);

        if (CRYPTO) {

          // Browsers supporting crypto.getRandomValues.
          if (crypto.getRandomValues) {

            a = crypto.getRandomValues(new Uint32Array(k *= 2));

            for (; i < k;) {

              // 53 bits:
              // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
              // 11111 11111111 11111111 11111111 11100000 00000000 00000000
              // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
              //                                     11111 11111111 11111111
              // 0x20000 is 2^21.
              v = a[i] * 0x20000 + (a[i + 1] >>> 11);

              // Rejection sampling:
              // 0 <= v < 9007199254740992
              // Probability that v >= 9e15, is
              // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
              if (v >= 9e15) {
                b = crypto.getRandomValues(new Uint32Array(2));
                a[i] = b[0];
                a[i + 1] = b[1];
              } else {

                // 0 <= v <= 8999999999999999
                // 0 <= (v % 1e14) <= 99999999999999
                c.push(v % 1e14);
                i += 2;
              }
            }
            i = k / 2;

          // Node.js supporting crypto.randomBytes.
          } else if (crypto.randomBytes) {

            // buffer
            a = crypto.randomBytes(k *= 7);

            for (; i < k;) {

              // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
              // 0x100000000 is 2^32, 0x1000000 is 2^24
              // 11111 11111111 11111111 11111111 11111111 11111111 11111111
              // 0 <= v < 9007199254740992
              v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
                 (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
                 (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

              if (v >= 9e15) {
                crypto.randomBytes(7).copy(a, i);
              } else {

                // 0 <= (v % 1e14) <= 99999999999999
                c.push(v % 1e14);
                i += 7;
              }
            }
            i = k / 7;
          } else {
            CRYPTO = false;
            throw Error
             (bignumberError + 'crypto unavailable');
          }
        }

        // Use Math.random.
        if (!CRYPTO) {

          for (; i < k;) {
            v = random53bitInt();
            if (v < 9e15) c[i++] = v % 1e14;
          }
        }

        k = c[--i];
        dp %= LOG_BASE;

        // Convert trailing digits to zeros according to dp.
        if (k && dp) {
          v = POWS_TEN[LOG_BASE - dp];
          c[i] = mathfloor(k / v) * v;
        }

        // Remove trailing elements which are zero.
        for (; c[i] === 0; c.pop(), i--);

        // Zero?
        if (i < 0) {
          c = [e = 0];
        } else {

          // Remove leading elements which are zero and adjust exponent accordingly.
          for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

          // Count the digits of the first element of c to determine leading zeros, and...
          for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

          // adjust the exponent accordingly.
          if (i < LOG_BASE) e -= LOG_BASE - i;
        }

        rand.e = e;
        rand.c = c;
        return rand;
      };
    })();


    /*
     * Return a BigNumber whose value is the sum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.sum = function () {
      var i = 1,
        args = arguments,
        sum = new BigNumber(args[0]);
      for (; i < args.length;) sum = sum.plus(args[i++]);
      return sum;
    };


    // PRIVATE FUNCTIONS


    // Called by BigNumber and BigNumber.prototype.toString.
    convertBase = (function () {
      var decimal = '0123456789';

      /*
       * Convert string of baseIn to an array of numbers of baseOut.
       * Eg. toBaseOut('255', 10, 16) returns [15, 15].
       * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
       */
      function toBaseOut(str, baseIn, baseOut, alphabet) {
        var j,
          arr = [0],
          arrL,
          i = 0,
          len = str.length;

        for (; i < len;) {
          for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

          arr[0] += alphabet.indexOf(str.charAt(i++));

          for (j = 0; j < arr.length; j++) {

            if (arr[j] > baseOut - 1) {
              if (arr[j + 1] == null) arr[j + 1] = 0;
              arr[j + 1] += arr[j] / baseOut | 0;
              arr[j] %= baseOut;
            }
          }
        }

        return arr.reverse();
      }

      // Convert a numeric string of baseIn to a numeric string of baseOut.
      // If the caller is toString, we are converting from base 10 to baseOut.
      // If the caller is BigNumber, we are converting from baseIn to base 10.
      return function (str, baseIn, baseOut, sign, callerIsToString) {
        var alphabet, d, e, k, r, x, xc, y,
          i = str.indexOf('.'),
          dp = DECIMAL_PLACES,
          rm = ROUNDING_MODE;

        // Non-integer.
        if (i >= 0) {
          k = POW_PRECISION;

          // Unlimited precision.
          POW_PRECISION = 0;
          str = str.replace('.', '');
          y = new BigNumber(baseIn);
          x = y.pow(str.length - i);
          POW_PRECISION = k;

          // Convert str as if an integer, then restore the fraction part by dividing the
          // result by its base raised to a power.

          y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
           10, baseOut, decimal);
          y.e = y.c.length;
        }

        // Convert the number as integer.

        xc = toBaseOut(str, baseIn, baseOut, callerIsToString
         ? (alphabet = ALPHABET, decimal)
         : (alphabet = decimal, ALPHABET));

        // xc now represents str as an integer and converted to baseOut. e is the exponent.
        e = k = xc.length;

        // Remove trailing zeros.
        for (; xc[--k] == 0; xc.pop());

        // Zero?
        if (!xc[0]) return alphabet.charAt(0);

        // Does str represent an integer? If so, no need for the division.
        if (i < 0) {
          --e;
        } else {
          x.c = xc;
          x.e = e;

          // The sign is needed for correct rounding.
          x.s = sign;
          x = div(x, y, dp, rm, baseOut);
          xc = x.c;
          r = x.r;
          e = x.e;
        }

        // xc now represents str converted to baseOut.

        // THe index of the rounding digit.
        d = e + dp + 1;

        // The rounding digit: the digit to the right of the digit that may be rounded up.
        i = xc[d];

        // Look at the rounding digits and mode to determine whether to round up.

        k = baseOut / 2;
        r = r || d < 0 || xc[d + 1] != null;

        r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
              : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
               rm == (x.s < 0 ? 8 : 7));

        // If the index of the rounding digit is not greater than zero, or xc represents
        // zero, then the result of the base conversion is zero or, if rounding up, a value
        // such as 0.00001.
        if (d < 1 || !xc[0]) {

          // 1^-dp or 0
          str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
        } else {

          // Truncate xc to the required number of decimal places.
          xc.length = d;

          // Round up?
          if (r) {

            // Rounding up may mean the previous digit has to be rounded up and so on.
            for (--baseOut; ++xc[--d] > baseOut;) {
              xc[d] = 0;

              if (!d) {
                ++e;
                xc = [1].concat(xc);
              }
            }
          }

          // Determine trailing zeros.
          for (k = xc.length; !xc[--k];);

          // E.g. [4, 11, 15] becomes 4bf.
          for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

          // Add leading zeros, decimal point and trailing zeros as required.
          str = toFixedPoint(str, e, alphabet.charAt(0));
        }

        // The caller will add the sign.
        return str;
      };
    })();


    // Perform division in the specified base. Called by div and convertBase.
    div = (function () {

      // Assume non-zero x and k.
      function multiply(x, k, base) {
        var m, temp, xlo, xhi,
          carry = 0,
          i = x.length,
          klo = k % SQRT_BASE,
          khi = k / SQRT_BASE | 0;

        for (x = x.slice(); i--;) {
          xlo = x[i] % SQRT_BASE;
          xhi = x[i] / SQRT_BASE | 0;
          m = khi * xlo + xhi * klo;
          temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
          carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
          x[i] = temp % base;
        }

        if (carry) x = [carry].concat(x);

        return x;
      }

      function compare(a, b, aL, bL) {
        var i, cmp;

        if (aL != bL) {
          cmp = aL > bL ? 1 : -1;
        } else {

          for (i = cmp = 0; i < aL; i++) {

            if (a[i] != b[i]) {
              cmp = a[i] > b[i] ? 1 : -1;
              break;
            }
          }
        }

        return cmp;
      }

      function subtract(a, b, aL, base) {
        var i = 0;

        // Subtract b from a.
        for (; aL--;) {
          a[aL] -= i;
          i = a[aL] < b[aL] ? 1 : 0;
          a[aL] = i * base + a[aL] - b[aL];
        }

        // Remove leading zeros.
        for (; !a[0] && a.length > 1; a.splice(0, 1));
      }

      // x: dividend, y: divisor.
      return function (x, y, dp, rm, base) {
        var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
          yL, yz,
          s = x.s == y.s ? 1 : -1,
          xc = x.c,
          yc = y.c;

        // Either NaN, Infinity or 0?
        if (!xc || !xc[0] || !yc || !yc[0]) {

          return new BigNumber(

           // Return NaN if either NaN, or both Infinity or 0.
           !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            xc && xc[0] == 0 || !yc ? s * 0 : s / 0
         );
        }

        q = new BigNumber(s);
        qc = q.c = [];
        e = x.e - y.e;
        s = dp + e + 1;

        if (!base) {
          base = BASE;
          e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
          s = s / LOG_BASE | 0;
        }

        // Result exponent may be one less then the current value of e.
        // The coefficients of the BigNumbers from convertBase may have trailing zeros.
        for (i = 0; yc[i] == (xc[i] || 0); i++);

        if (yc[i] > (xc[i] || 0)) e--;

        if (s < 0) {
          qc.push(1);
          more = true;
        } else {
          xL = xc.length;
          yL = yc.length;
          i = 0;
          s += 2;

          // Normalise xc and yc so highest order digit of yc is >= base / 2.

          n = mathfloor(base / (yc[0] + 1));

          // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
          // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
          if (n > 1) {
            yc = multiply(yc, n, base);
            xc = multiply(xc, n, base);
            yL = yc.length;
            xL = xc.length;
          }

          xi = yL;
          rem = xc.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL; rem[remL++] = 0);
          yz = yc.slice();
          yz = [0].concat(yz);
          yc0 = yc[0];
          if (yc[1] >= base / 2) yc0++;
          // Not necessary, but to prevent trial digit n > base, when using base 3.
          // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

          do {
            n = 0;

            // Compare divisor and remainder.
            cmp = compare(yc, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, n.

              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // n is how many times the divisor goes into the current remainder.
              n = mathfloor(rem0 / yc0);

              //  Algorithm:
              //  product = divisor multiplied by trial digit (n).
              //  Compare product and remainder.
              //  If product is greater than remainder:
              //    Subtract divisor from product, decrement trial digit.
              //  Subtract product from remainder.
              //  If product was less than remainder at the last compare:
              //    Compare new remainder and divisor.
              //    If remainder is greater than divisor:
              //      Subtract divisor from remainder, increment trial digit.

              if (n > 1) {

                // n may be > base only when base is 3.
                if (n >= base) n = base - 1;

                // product = divisor * trial digit.
                prod = multiply(yc, n, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                // If product > remainder then trial digit n too high.
                // n is 1 too high about 5% of the time, and is not known to have
                // ever been more than 1 too high.
                while (compare(prod, rem, prodL, remL) == 1) {
                  n--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yc, prodL, base);
                  prodL = prod.length;
                  cmp = 1;
                }
              } else {

                // n is 0 or 1, cmp is -1.
                // If n is 0, there is no need to compare yc and rem again below,
                // so change cmp to 1 to avoid it.
                // If n is 1, leave cmp as -1, so yc and rem are compared again.
                if (n == 0) {

                  // divisor < remainder, so n must be at least 1.
                  cmp = n = 1;
                }

                // product = divisor
                prod = yc.slice();
                prodL = prod.length;
              }

              if (prodL < remL) prod = [0].concat(prod);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);
              remL = rem.length;

               // If product was < remainder.
              if (cmp == -1) {

                // Compare divisor and new remainder.
                // If divisor < new remainder, subtract divisor from remainder.
                // Trial digit n too low.
                // n is 1 too low about 5% of the time, and very rarely 2 too low.
                while (compare(yc, rem, yL, remL) < 1) {
                  n++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yc, remL, base);
                  remL = rem.length;
                }
              }
            } else if (cmp === 0) {
              n++;
              rem = [0];
            } // else cmp === 1 and n will be 0

            // Add the next digit, n, to the result array.
            qc[i++] = n;

            // Update the remainder.
            if (rem[0]) {
              rem[remL++] = xc[xi] || 0;
            } else {
              rem = [xc[xi]];
              remL = 1;
            }
          } while ((xi++ < xL || rem[0] != null) && s--);

          more = rem[0] != null;

          // Leading zero?
          if (!qc[0]) qc.splice(0, 1);
        }

        if (base == BASE) {

          // To calculate q.e, first get the number of digits of qc[0].
          for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

          round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

        // Caller is convertBase.
        } else {
          q.e = e;
          q.r = +more;
        }

        return q;
      };
    })();


    /*
     * Return a string representing the value of BigNumber n in fixed-point or exponential
     * notation rounded to the specified decimal places or significant digits.
     *
     * n: a BigNumber.
     * i: the index of the last digit required (i.e. the digit that may be rounded up).
     * rm: the rounding mode.
     * id: 1 (toExponential) or 2 (toPrecision).
     */
    function format(n, i, rm, id) {
      var c0, e, ne, len, str;

      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      if (!n.c) return n.toString();

      c0 = n.c[0];
      ne = n.e;

      if (i == null) {
        str = coeffToString(n.c);
        str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
         ? toExponential(str, ne)
         : toFixedPoint(str, ne, '0');
      } else {
        n = round(new BigNumber(n), i, rm);

        // n.e may have changed if the value was rounded up.
        e = n.e;

        str = coeffToString(n.c);
        len = str.length;

        // toPrecision returns exponential notation if the number of significant digits
        // specified is less than the number of digits necessary to represent the integer
        // part of the value in fixed-point notation.

        // Exponential notation.
        if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

          // Append zeros?
          for (; len < i; str += '0', len++);
          str = toExponential(str, e);

        // Fixed-point notation.
        } else {
          i -= ne;
          str = toFixedPoint(str, e, '0');

          // Append zeros?
          if (e + 1 > len) {
            if (--i > 0) for (str += '.'; i--; str += '0');
          } else {
            i += e - len;
            if (i > 0) {
              if (e + 1 == len) str += '.';
              for (; i--; str += '0');
            }
          }
        }
      }

      return n.s < 0 && c0 ? '-' + str : str;
    }


    // Handle BigNumber.max and BigNumber.min.
    function maxOrMin(args, method) {
      var n,
        i = 1,
        m = new BigNumber(args[0]);

      for (; i < args.length; i++) {
        n = new BigNumber(args[i]);

        // If any number is NaN, return NaN.
        if (!n.s) {
          m = n;
          break;
        } else if (method.call(m, n)) {
          m = n;
        }
      }

      return m;
    }


    /*
     * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
     * Called by minus, plus and times.
     */
    function normalise(n, c, e) {
      var i = 1,
        j = c.length;

       // Remove trailing zeros.
      for (; !c[--j]; c.pop());

      // Calculate the base 10 exponent. First get the number of digits of c[0].
      for (j = c[0]; j >= 10; j /= 10, i++);

      // Overflow?
      if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

        // Infinity.
        n.c = n.e = null;

      // Underflow?
      } else if (e < MIN_EXP) {

        // Zero.
        n.c = [n.e = 0];
      } else {
        n.e = e;
        n.c = c;
      }

      return n;
    }


    // Handle values that fail the validity test in BigNumber.
    parseNumeric = (function () {
      var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
        dotAfter = /^([^.]+)\.$/,
        dotBefore = /^\.([^.]+)$/,
        isInfinityOrNaN = /^-?(Infinity|NaN)$/,
        whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

      return function (x, str, isNum, b) {
        var base,
          s = isNum ? str : str.replace(whitespaceOrPlus, '');

        // No exception on ±Infinity or NaN.
        if (isInfinityOrNaN.test(s)) {
          x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
        } else {
          if (!isNum) {

            // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
            s = s.replace(basePrefix, function (m, p1, p2) {
              base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
              return !b || b == base ? p1 : m;
            });

            if (b) {
              base = b;

              // E.g. '1.' to '1', '.1' to '0.1'
              s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
            }

            if (str != s) return new BigNumber(s, base);
          }

          // '[BigNumber Error] Not a number: {n}'
          // '[BigNumber Error] Not a base {b} number: {n}'
          if (BigNumber.DEBUG) {
            throw Error
              (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
          }

          // NaN
          x.s = null;
        }

        x.c = x.e = null;
      }
    })();


    /*
     * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
     * If r is truthy, it is known that there are more digits after the rounding digit.
     */
    function round(x, sd, rm, r) {
      var d, i, j, k, n, ni, rd,
        xc = x.c,
        pows10 = POWS_TEN;

      // if x is not Infinity or NaN...
      if (xc) {

        // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
        // n is a base 1e14 number, the value of the element of array x.c containing rd.
        // ni is the index of n within x.c.
        // d is the number of digits of n.
        // i is the index of rd within n including leading zeros.
        // j is the actual index of rd within n (if < 0, rd is a leading zero).
        out: {

          // Get the number of digits of the first element of xc.
          for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
          i = sd - d;

          // If the rounding digit is in the first element of xc...
          if (i < 0) {
            i += LOG_BASE;
            j = sd;
            n = xc[ni = 0];

            // Get the rounding digit at index j of n.
            rd = n / pows10[d - j - 1] % 10 | 0;
          } else {
            ni = mathceil((i + 1) / LOG_BASE);

            if (ni >= xc.length) {

              if (r) {

                // Needed by sqrt.
                for (; xc.length <= ni; xc.push(0));
                n = rd = 0;
                d = 1;
                i %= LOG_BASE;
                j = i - LOG_BASE + 1;
              } else {
                break out;
              }
            } else {
              n = k = xc[ni];

              // Get the number of digits of n.
              for (d = 1; k >= 10; k /= 10, d++);

              // Get the index of rd within n.
              i %= LOG_BASE;

              // Get the index of rd within n, adjusted for leading zeros.
              // The number of leading zeros of n is given by LOG_BASE - d.
              j = i - LOG_BASE + d;

              // Get the rounding digit at index j of n.
              rd = j < 0 ? 0 : n / pows10[d - j - 1] % 10 | 0;
            }
          }

          r = r || sd < 0 ||

          // Are there any non-zero digits after the rounding digit?
          // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
          // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
           xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

          r = rm < 4
           ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
           : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

            // Check whether the digit to the left of the rounding digit is odd.
            ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
             rm == (x.s < 0 ? 8 : 7));

          if (sd < 1 || !xc[0]) {
            xc.length = 0;

            if (r) {

              // Convert sd to decimal places.
              sd -= x.e + 1;

              // 1, 0.1, 0.01, 0.001, 0.0001 etc.
              xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
              x.e = -sd || 0;
            } else {

              // Zero.
              xc[0] = x.e = 0;
            }

            return x;
          }

          // Remove excess digits.
          if (i == 0) {
            xc.length = ni;
            k = 1;
            ni--;
          } else {
            xc.length = ni + 1;
            k = pows10[LOG_BASE - i];

            // E.g. 56700 becomes 56000 if 7 is the rounding digit.
            // j > 0 means i > number of leading zeros of n.
            xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
          }

          // Round up?
          if (r) {

            for (; ;) {

              // If the digit to be rounded up is in the first element of xc...
              if (ni == 0) {

                // i will be the length of xc[0] before k is added.
                for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
                j = xc[0] += k;
                for (k = 1; j >= 10; j /= 10, k++);

                // if i != k the length has increased.
                if (i != k) {
                  x.e++;
                  if (xc[0] == BASE) xc[0] = 1;
                }

                break;
              } else {
                xc[ni] += k;
                if (xc[ni] != BASE) break;
                xc[ni--] = 0;
                k = 1;
              }
            }
          }

          // Remove trailing zeros.
          for (i = xc.length; xc[--i] === 0; xc.pop());
        }

        // Overflow? Infinity.
        if (x.e > MAX_EXP) {
          x.c = x.e = null;

        // Underflow? Zero.
        } else if (x.e < MIN_EXP) {
          x.c = [x.e = 0];
        }
      }

      return x;
    }


    function valueOf(n) {
      var str,
        e = n.e;

      if (e === null) return n.toString();

      str = coeffToString(n.c);

      str = e <= TO_EXP_NEG || e >= TO_EXP_POS
        ? toExponential(str, e)
        : toFixedPoint(str, e, '0');

      return n.s < 0 ? '-' + str : str;
    }


    // PROTOTYPE/INSTANCE METHODS


    /*
     * Return a new BigNumber whose value is the absolute value of this BigNumber.
     */
    P.absoluteValue = P.abs = function () {
      var x = new BigNumber(this);
      if (x.s < 0) x.s = 1;
      return x;
    };


    /*
     * Return
     *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
     *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
     *   0 if they have the same value,
     *   or null if the value of either is NaN.
     */
    P.comparedTo = function (y, b) {
      return compare(this, new BigNumber(y, b));
    };


    /*
     * If dp is undefined or null or true or false, return the number of decimal places of the
     * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
     *
     * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
     * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
     * ROUNDING_MODE if rm is omitted.
     *
     * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.decimalPlaces = P.dp = function (dp, rm) {
      var c, n, v,
        x = this;

      if (dp != null) {
        intCheck(dp, 0, MAX);
        if (rm == null) rm = ROUNDING_MODE;
        else intCheck(rm, 0, 8);

        return round(new BigNumber(x), dp + x.e + 1, rm);
      }

      if (!(c = x.c)) return null;
      n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last number.
      if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
      if (n < 0) n = 0;

      return n;
    };


    /*
     *  n / 0 = I
     *  n / N = N
     *  n / I = 0
     *  0 / n = 0
     *  0 / 0 = N
     *  0 / N = N
     *  0 / I = 0
     *  N / n = N
     *  N / 0 = N
     *  N / N = N
     *  N / I = N
     *  I / n = I
     *  I / 0 = I
     *  I / N = N
     *  I / I = N
     *
     * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
     * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
     */
    P.dividedBy = P.div = function (y, b) {
      return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
    };


    /*
     * Return a new BigNumber whose value is the integer part of dividing the value of this
     * BigNumber by the value of BigNumber(y, b).
     */
    P.dividedToIntegerBy = P.idiv = function (y, b) {
      return div(this, new BigNumber(y, b), 0, 1);
    };


    /*
     * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
     *
     * If m is present, return the result modulo m.
     * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
     * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
     *
     * The modular power operation works efficiently when x, n, and m are integers, otherwise it
     * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
     *
     * n {number|string|BigNumber} The exponent. An integer.
     * [m] {number|string|BigNumber} The modulus.
     *
     * '[BigNumber Error] Exponent not an integer: {n}'
     */
    P.exponentiatedBy = P.pow = function (n, m) {
      var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
        x = this;

      n = new BigNumber(n);

      // Allow NaN and ±Infinity, but not other non-integers.
      if (n.c && !n.isInteger()) {
        throw Error
          (bignumberError + 'Exponent not an integer: ' + valueOf(n));
      }

      if (m != null) m = new BigNumber(m);

      // Exponent of MAX_SAFE_INTEGER is 15.
      nIsBig = n.e > 14;

      // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
      if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

        // The sign of the result of pow when x is negative depends on the evenness of n.
        // If +n overflows to ±Infinity, the evenness of n would be not be known.
        y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? 2 - isOdd(n) : +valueOf(n)));
        return m ? y.mod(m) : y;
      }

      nIsNeg = n.s < 0;

      if (m) {

        // x % m returns NaN if abs(m) is zero, or m is NaN.
        if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

        isModExp = !nIsNeg && x.isInteger() && m.isInteger();

        if (isModExp) x = x.mod(m);

      // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
      // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
      } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
        // [1, 240000000]
        ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
        // [80000000000000]  [99999750000000]
        : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

        // If x is negative and n is odd, k = -0, else k = 0.
        k = x.s < 0 && isOdd(n) ? -0 : 0;

        // If x >= 1, k = ±Infinity.
        if (x.e > -1) k = 1 / k;

        // If n is negative return ±0, else return ±Infinity.
        return new BigNumber(nIsNeg ? 1 / k : k);

      } else if (POW_PRECISION) {

        // Truncating each coefficient array to a length of k after each multiplication
        // equates to truncating significant digits to POW_PRECISION + [28, 41],
        // i.e. there will be a minimum of 28 guard digits retained.
        k = mathceil(POW_PRECISION / LOG_BASE + 2);
      }

      if (nIsBig) {
        half = new BigNumber(0.5);
        if (nIsNeg) n.s = 1;
        nIsOdd = isOdd(n);
      } else {
        i = Math.abs(+valueOf(n));
        nIsOdd = i % 2;
      }

      y = new BigNumber(ONE);

      // Performs 54 loop iterations for n of 9007199254740991.
      for (; ;) {

        if (nIsOdd) {
          y = y.times(x);
          if (!y.c) break;

          if (k) {
            if (y.c.length > k) y.c.length = k;
          } else if (isModExp) {
            y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
          }
        }

        if (i) {
          i = mathfloor(i / 2);
          if (i === 0) break;
          nIsOdd = i % 2;
        } else {
          n = n.times(half);
          round(n, n.e + 1, 1);

          if (n.e > 14) {
            nIsOdd = isOdd(n);
          } else {
            i = +valueOf(n);
            if (i === 0) break;
            nIsOdd = i % 2;
          }
        }

        x = x.times(x);

        if (k) {
          if (x.c && x.c.length > k) x.c.length = k;
        } else if (isModExp) {
          x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
        }
      }

      if (isModExp) return y;
      if (nIsNeg) y = ONE.div(y);

      return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
     * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
     *
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
     */
    P.integerValue = function (rm) {
      var n = new BigNumber(this);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);
      return round(n, n.e + 1, rm);
    };


    /*
     * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isEqualTo = P.eq = function (y, b) {
      return compare(this, new BigNumber(y, b)) === 0;
    };


    /*
     * Return true if the value of this BigNumber is a finite number, otherwise return false.
     */
    P.isFinite = function () {
      return !!this.c;
    };


    /*
     * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isGreaterThan = P.gt = function (y, b) {
      return compare(this, new BigNumber(y, b)) > 0;
    };


    /*
     * Return true if the value of this BigNumber is greater than or equal to the value of
     * BigNumber(y, b), otherwise return false.
     */
    P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
      return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

    };


    /*
     * Return true if the value of this BigNumber is an integer, otherwise return false.
     */
    P.isInteger = function () {
      return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
    };


    /*
     * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isLessThan = P.lt = function (y, b) {
      return compare(this, new BigNumber(y, b)) < 0;
    };


    /*
     * Return true if the value of this BigNumber is less than or equal to the value of
     * BigNumber(y, b), otherwise return false.
     */
    P.isLessThanOrEqualTo = P.lte = function (y, b) {
      return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
    };


    /*
     * Return true if the value of this BigNumber is NaN, otherwise return false.
     */
    P.isNaN = function () {
      return !this.s;
    };


    /*
     * Return true if the value of this BigNumber is negative, otherwise return false.
     */
    P.isNegative = function () {
      return this.s < 0;
    };


    /*
     * Return true if the value of this BigNumber is positive, otherwise return false.
     */
    P.isPositive = function () {
      return this.s > 0;
    };


    /*
     * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
     */
    P.isZero = function () {
      return !!this.c && this.c[0] == 0;
    };


    /*
     *  n - 0 = n
     *  n - N = N
     *  n - I = -I
     *  0 - n = -n
     *  0 - 0 = 0
     *  0 - N = N
     *  0 - I = -I
     *  N - n = N
     *  N - 0 = N
     *  N - N = N
     *  N - I = N
     *  I - n = I
     *  I - 0 = I
     *  I - N = N
     *  I - I = N
     *
     * Return a new BigNumber whose value is the value of this BigNumber minus the value of
     * BigNumber(y, b).
     */
    P.minus = function (y, b) {
      var i, j, t, xLTy,
        x = this,
        a = x.s;

      y = new BigNumber(y, b);
      b = y.s;

      // Either NaN?
      if (!a || !b) return new BigNumber(NaN);

      // Signs differ?
      if (a != b) {
        y.s = -b;
        return x.plus(y);
      }

      var xe = x.e / LOG_BASE,
        ye = y.e / LOG_BASE,
        xc = x.c,
        yc = y.c;

      if (!xe || !ye) {

        // Either Infinity?
        if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

        // Either zero?
        if (!xc[0] || !yc[0]) {

          // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
          return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

           // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
           ROUNDING_MODE == 3 ? -0 : 0);
        }
      }

      xe = bitFloor(xe);
      ye = bitFloor(ye);
      xc = xc.slice();

      // Determine which is the bigger number.
      if (a = xe - ye) {

        if (xLTy = a < 0) {
          a = -a;
          t = xc;
        } else {
          ye = xe;
          t = yc;
        }

        t.reverse();

        // Prepend zeros to equalise exponents.
        for (b = a; b--; t.push(0));
        t.reverse();
      } else {

        // Exponents equal. Check digit by digit.
        j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

        for (a = b = 0; b < j; b++) {

          if (xc[b] != yc[b]) {
            xLTy = xc[b] < yc[b];
            break;
          }
        }
      }

      // x < y? Point xc to the array of the bigger number.
      if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

      b = (j = yc.length) - (i = xc.length);

      // Append zeros to xc if shorter.
      // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
      if (b > 0) for (; b--; xc[i++] = 0);
      b = BASE - 1;

      // Subtract yc from xc.
      for (; j > a;) {

        if (xc[--j] < yc[j]) {
          for (i = j; i && !xc[--i]; xc[i] = b);
          --xc[i];
          xc[j] += BASE;
        }

        xc[j] -= yc[j];
      }

      // Remove leading zeros and adjust exponent accordingly.
      for (; xc[0] == 0; xc.splice(0, 1), --ye);

      // Zero?
      if (!xc[0]) {

        // Following IEEE 754 (2008) 6.3,
        // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
        y.s = ROUNDING_MODE == 3 ? -1 : 1;
        y.c = [y.e = 0];
        return y;
      }

      // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
      // for finite x and y.
      return normalise(y, xc, ye);
    };


    /*
     *   n % 0 =  N
     *   n % N =  N
     *   n % I =  n
     *   0 % n =  0
     *  -0 % n = -0
     *   0 % 0 =  N
     *   0 % N =  N
     *   0 % I =  0
     *   N % n =  N
     *   N % 0 =  N
     *   N % N =  N
     *   N % I =  N
     *   I % n =  N
     *   I % 0 =  N
     *   I % N =  N
     *   I % I =  N
     *
     * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
     * BigNumber(y, b). The result depends on the value of MODULO_MODE.
     */
    P.modulo = P.mod = function (y, b) {
      var q, s,
        x = this;

      y = new BigNumber(y, b);

      // Return NaN if x is Infinity or NaN, or y is NaN or zero.
      if (!x.c || !y.s || y.c && !y.c[0]) {
        return new BigNumber(NaN);

      // Return x if y is Infinity or x is zero.
      } else if (!y.c || x.c && !x.c[0]) {
        return new BigNumber(x);
      }

      if (MODULO_MODE == 9) {

        // Euclidian division: q = sign(y) * floor(x / abs(y))
        // r = x - qy    where  0 <= r < abs(y)
        s = y.s;
        y.s = 1;
        q = div(x, y, 0, 3);
        y.s = s;
        q.s *= s;
      } else {
        q = div(x, y, 0, MODULO_MODE);
      }

      y = x.minus(q.times(y));

      // To match JavaScript %, ensure sign of zero is sign of dividend.
      if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

      return y;
    };


    /*
     *  n * 0 = 0
     *  n * N = N
     *  n * I = I
     *  0 * n = 0
     *  0 * 0 = 0
     *  0 * N = N
     *  0 * I = N
     *  N * n = N
     *  N * 0 = N
     *  N * N = N
     *  N * I = N
     *  I * n = I
     *  I * 0 = N
     *  I * N = N
     *  I * I = I
     *
     * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
     * of BigNumber(y, b).
     */
    P.multipliedBy = P.times = function (y, b) {
      var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
        base, sqrtBase,
        x = this,
        xc = x.c,
        yc = (y = new BigNumber(y, b)).c;

      // Either NaN, ±Infinity or ±0?
      if (!xc || !yc || !xc[0] || !yc[0]) {

        // Return NaN if either is NaN, or one is 0 and the other is Infinity.
        if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
          y.c = y.e = y.s = null;
        } else {
          y.s *= x.s;

          // Return ±Infinity if either is ±Infinity.
          if (!xc || !yc) {
            y.c = y.e = null;

          // Return ±0 if either is ±0.
          } else {
            y.c = [0];
            y.e = 0;
          }
        }

        return y;
      }

      e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
      y.s *= x.s;
      xcL = xc.length;
      ycL = yc.length;

      // Ensure xc points to longer array and xcL to its length.
      if (xcL < ycL) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

      // Initialise the result array with zeros.
      for (i = xcL + ycL, zc = []; i--; zc.push(0));

      base = BASE;
      sqrtBase = SQRT_BASE;

      for (i = ycL; --i >= 0;) {
        c = 0;
        ylo = yc[i] % sqrtBase;
        yhi = yc[i] / sqrtBase | 0;

        for (k = xcL, j = i + k; j > i;) {
          xlo = xc[--k] % sqrtBase;
          xhi = xc[k] / sqrtBase | 0;
          m = yhi * xlo + xhi * ylo;
          xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
          c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
          zc[j--] = xlo % base;
        }

        zc[j] = c;
      }

      if (c) {
        ++e;
      } else {
        zc.splice(0, 1);
      }

      return normalise(y, zc, e);
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber negated,
     * i.e. multiplied by -1.
     */
    P.negated = function () {
      var x = new BigNumber(this);
      x.s = -x.s || null;
      return x;
    };


    /*
     *  n + 0 = n
     *  n + N = N
     *  n + I = I
     *  0 + n = n
     *  0 + 0 = 0
     *  0 + N = N
     *  0 + I = I
     *  N + n = N
     *  N + 0 = N
     *  N + N = N
     *  N + I = N
     *  I + n = I
     *  I + 0 = I
     *  I + N = N
     *  I + I = I
     *
     * Return a new BigNumber whose value is the value of this BigNumber plus the value of
     * BigNumber(y, b).
     */
    P.plus = function (y, b) {
      var t,
        x = this,
        a = x.s;

      y = new BigNumber(y, b);
      b = y.s;

      // Either NaN?
      if (!a || !b) return new BigNumber(NaN);

      // Signs differ?
       if (a != b) {
        y.s = -b;
        return x.minus(y);
      }

      var xe = x.e / LOG_BASE,
        ye = y.e / LOG_BASE,
        xc = x.c,
        yc = y.c;

      if (!xe || !ye) {

        // Return ±Infinity if either ±Infinity.
        if (!xc || !yc) return new BigNumber(a / 0);

        // Either zero?
        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
        if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
      }

      xe = bitFloor(xe);
      ye = bitFloor(ye);
      xc = xc.slice();

      // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
      if (a = xe - ye) {
        if (a > 0) {
          ye = xe;
          t = yc;
        } else {
          a = -a;
          t = xc;
        }

        t.reverse();
        for (; a--; t.push(0));
        t.reverse();
      }

      a = xc.length;
      b = yc.length;

      // Point xc to the longer array, and b to the shorter length.
      if (a - b < 0) t = yc, yc = xc, xc = t, b = a;

      // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
      for (a = 0; b;) {
        a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
        xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
      }

      if (a) {
        xc = [a].concat(xc);
        ++ye;
      }

      // No need to check for zero, as +x + +y != 0 && -x + -y != 0
      // ye = MAX_EXP + 1 possible
      return normalise(y, xc, ye);
    };


    /*
     * If sd is undefined or null or true or false, return the number of significant digits of
     * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
     * If sd is true include integer-part trailing zeros in the count.
     *
     * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
     * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
     * ROUNDING_MODE if rm is omitted.
     *
     * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
     *                     boolean: whether to count integer-part trailing zeros: true or false.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
     */
    P.precision = P.sd = function (sd, rm) {
      var c, n, v,
        x = this;

      if (sd != null && sd !== !!sd) {
        intCheck(sd, 1, MAX);
        if (rm == null) rm = ROUNDING_MODE;
        else intCheck(rm, 0, 8);

        return round(new BigNumber(x), sd, rm);
      }

      if (!(c = x.c)) return null;
      v = c.length - 1;
      n = v * LOG_BASE + 1;

      if (v = c[v]) {

        // Subtract the number of trailing zeros of the last element.
        for (; v % 10 == 0; v /= 10, n--);

        // Add the number of digits of the first element.
        for (v = c[0]; v >= 10; v /= 10, n++);
      }

      if (sd && x.e + 1 > n) n = x.e + 1;

      return n;
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
     * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
     *
     * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
     */
    P.shiftedBy = function (k) {
      intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
      return this.times('1e' + k);
    };


    /*
     *  sqrt(-n) =  N
     *  sqrt(N) =  N
     *  sqrt(-I) =  N
     *  sqrt(I) =  I
     *  sqrt(0) =  0
     *  sqrt(-0) = -0
     *
     * Return a new BigNumber whose value is the square root of the value of this BigNumber,
     * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
     */
    P.squareRoot = P.sqrt = function () {
      var m, n, r, rep, t,
        x = this,
        c = x.c,
        s = x.s,
        e = x.e,
        dp = DECIMAL_PLACES + 4,
        half = new BigNumber('0.5');

      // Negative/NaN/Infinity/zero?
      if (s !== 1 || !c || !c[0]) {
        return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
      }

      // Initial estimate.
      s = Math.sqrt(+valueOf(x));

      // Math.sqrt underflow/overflow?
      // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
      if (s == 0 || s == 1 / 0) {
        n = coeffToString(c);
        if ((n.length + e) % 2 == 0) n += '0';
        s = Math.sqrt(+n);
        e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

        if (s == 1 / 0) {
          n = '5e' + e;
        } else {
          n = s.toExponential();
          n = n.slice(0, n.indexOf('e') + 1) + e;
        }

        r = new BigNumber(n);
      } else {
        r = new BigNumber(s + '');
      }

      // Check for zero.
      // r could be zero if MIN_EXP is changed after the this value was created.
      // This would cause a division by zero (x/t) and hence Infinity below, which would cause
      // coeffToString to throw.
      if (r.c[0]) {
        e = r.e;
        s = e + dp;
        if (s < 3) s = 0;

        // Newton-Raphson iteration.
        for (; ;) {
          t = r;
          r = half.times(t.plus(div(x, t, dp, 1)));

          if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

            // The exponent of r may here be one less than the final result exponent,
            // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
            // are indexed correctly.
            if (r.e < e) --s;
            n = n.slice(s - 3, s + 1);

            // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
            // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
            // iteration.
            if (n == '9999' || !rep && n == '4999') {

              // On the first iteration only, check to see if rounding up gives the
              // exact result as the nines may infinitely repeat.
              if (!rep) {
                round(t, t.e + DECIMAL_PLACES + 2, 0);

                if (t.times(t).eq(x)) {
                  r = t;
                  break;
                }
              }

              dp += 4;
              s += 4;
              rep = 1;
            } else {

              // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
              // result. If not, then there are further digits and m will be truthy.
              if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

                // Truncate to the first rounding digit.
                round(r, r.e + DECIMAL_PLACES + 2, 1);
                m = !r.times(r).eq(x);
              }

              break;
            }
          }
        }
      }

      return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
    };


    /*
     * Return a string representing the value of this BigNumber in exponential notation and
     * rounded using ROUNDING_MODE to dp fixed decimal places.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toExponential = function (dp, rm) {
      if (dp != null) {
        intCheck(dp, 0, MAX);
        dp++;
      }
      return format(this, dp, rm, 1);
    };


    /*
     * Return a string representing the value of this BigNumber in fixed-point notation rounding
     * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
     *
     * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
     * but e.g. (-0.00001).toFixed(0) is '-0'.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toFixed = function (dp, rm) {
      if (dp != null) {
        intCheck(dp, 0, MAX);
        dp = dp + this.e + 1;
      }
      return format(this, dp, rm);
    };


    /*
     * Return a string representing the value of this BigNumber in fixed-point notation rounded
     * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
     * of the format or FORMAT object (see BigNumber.set).
     *
     * The formatting object may contain some or all of the properties shown below.
     *
     * FORMAT = {
     *   prefix: '',
     *   groupSize: 3,
     *   secondaryGroupSize: 0,
     *   groupSeparator: ',',
     *   decimalSeparator: '.',
     *   fractionGroupSize: 0,
     *   fractionGroupSeparator: '\xA0',      // non-breaking space
     *   suffix: ''
     * };
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     * [format] {object} Formatting options. See FORMAT pbject above.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     * '[BigNumber Error] Argument not an object: {format}'
     */
    P.toFormat = function (dp, rm, format) {
      var str,
        x = this;

      if (format == null) {
        if (dp != null && rm && typeof rm == 'object') {
          format = rm;
          rm = null;
        } else if (dp && typeof dp == 'object') {
          format = dp;
          dp = rm = null;
        } else {
          format = FORMAT;
        }
      } else if (typeof format != 'object') {
        throw Error
          (bignumberError + 'Argument not an object: ' + format);
      }

      str = x.toFixed(dp, rm);

      if (x.c) {
        var i,
          arr = str.split('.'),
          g1 = +format.groupSize,
          g2 = +format.secondaryGroupSize,
          groupSeparator = format.groupSeparator || '',
          intPart = arr[0],
          fractionPart = arr[1],
          isNeg = x.s < 0,
          intDigits = isNeg ? intPart.slice(1) : intPart,
          len = intDigits.length;

        if (g2) i = g1, g1 = g2, g2 = i, len -= i;

        if (g1 > 0 && len > 0) {
          i = len % g1 || g1;
          intPart = intDigits.substr(0, i);
          for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
          if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
          if (isNeg) intPart = '-' + intPart;
        }

        str = fractionPart
         ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
          ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
           '$&' + (format.fractionGroupSeparator || ''))
          : fractionPart)
         : intPart;
      }

      return (format.prefix || '') + str + (format.suffix || '');
    };


    /*
     * Return an array of two BigNumbers representing the value of this BigNumber as a simple
     * fraction with an integer numerator and an integer denominator.
     * The denominator will be a positive non-zero value less than or equal to the specified
     * maximum denominator. If a maximum denominator is not specified, the denominator will be
     * the lowest value necessary to represent the number exactly.
     *
     * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
     *
     * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
     */
    P.toFraction = function (md) {
      var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
        x = this,
        xc = x.c;

      if (md != null) {
        n = new BigNumber(md);

        // Throw if md is less than one or is not an integer, unless it is Infinity.
        if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
          throw Error
            (bignumberError + 'Argument ' +
              (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
        }
      }

      if (!xc) return new BigNumber(x);

      d = new BigNumber(ONE);
      n1 = d0 = new BigNumber(ONE);
      d1 = n0 = new BigNumber(ONE);
      s = coeffToString(xc);

      // Determine initial denominator.
      // d is a power of 10 and the minimum max denominator that specifies the value exactly.
      e = d.e = s.length - x.e - 1;
      d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
      md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

      exp = MAX_EXP;
      MAX_EXP = 1 / 0;
      n = new BigNumber(s);

      // n0 = d1 = 0
      n0.c[0] = 0;

      for (; ;)  {
        q = div(n, d, 0, 1);
        d2 = d0.plus(q.times(d1));
        if (d2.comparedTo(md) == 1) break;
        d0 = d1;
        d1 = d2;
        n1 = n0.plus(q.times(d2 = n1));
        n0 = d2;
        d = n.minus(q.times(d2 = d));
        n = d2;
      }

      d2 = div(md.minus(d0), d1, 0, 1);
      n0 = n0.plus(d2.times(n1));
      d0 = d0.plus(d2.times(d1));
      n0.s = n1.s = x.s;
      e = e * 2;

      // Determine which fraction is closer to x, n0/d0 or n1/d1
      r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
          div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

      MAX_EXP = exp;

      return r;
    };


    /*
     * Return the value of this BigNumber converted to a number primitive.
     */
    P.toNumber = function () {
      return +valueOf(this);
    };


    /*
     * Return a string representing the value of this BigNumber rounded to sd significant digits
     * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
     * necessary to represent the integer part of the value in fixed-point notation, then use
     * exponential notation.
     *
     * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
     */
    P.toPrecision = function (sd, rm) {
      if (sd != null) intCheck(sd, 1, MAX);
      return format(this, sd, rm, 2);
    };


    /*
     * Return a string representing the value of this BigNumber in base b, or base 10 if b is
     * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
     * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
     * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
     * TO_EXP_NEG, return exponential notation.
     *
     * [b] {number} Integer, 2 to ALPHABET.length inclusive.
     *
     * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
     */
    P.toString = function (b) {
      var str,
        n = this,
        s = n.s,
        e = n.e;

      // Infinity or NaN?
      if (e === null) {
        if (s) {
          str = 'Infinity';
          if (s < 0) str = '-' + str;
        } else {
          str = 'NaN';
        }
      } else {
        if (b == null) {
          str = e <= TO_EXP_NEG || e >= TO_EXP_POS
           ? toExponential(coeffToString(n.c), e)
           : toFixedPoint(coeffToString(n.c), e, '0');
        } else if (b === 10 && alphabetHasNormalDecimalDigits) {
          n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
          str = toFixedPoint(coeffToString(n.c), n.e, '0');
        } else {
          intCheck(b, 2, ALPHABET.length, 'Base');
          str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
        }

        if (s < 0 && n.c[0]) str = '-' + str;
      }

      return str;
    };


    /*
     * Return as toString, but do not accept a base argument, and include the minus sign for
     * negative zero.
     */
    P.valueOf = P.toJSON = function () {
      return valueOf(this);
    };


    P._isBigNumber = true;

    if (configObject != null) BigNumber.set(configObject);

    return BigNumber;
  }


  // PRIVATE HELPER FUNCTIONS

  // These functions don't need access to variables,
  // e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


  function bitFloor(n) {
    var i = n | 0;
    return n > 0 || n === i ? i : i - 1;
  }


  // Return a coefficient array as a string of base 10 digits.
  function coeffToString(a) {
    var s, z,
      i = 1,
      j = a.length,
      r = a[0] + '';

    for (; i < j;) {
      s = a[i++] + '';
      z = LOG_BASE - s.length;
      for (; z--; s = '0' + s);
      r += s;
    }

    // Determine trailing zeros.
    for (j = r.length; r.charCodeAt(--j) === 48;);

    return r.slice(0, j + 1 || 1);
  }


  // Compare the value of BigNumbers x and y.
  function compare(x, y) {
    var a, b,
      xc = x.c,
      yc = y.c,
      i = x.s,
      j = y.s,
      k = x.e,
      l = y.e;

    // Either NaN?
    if (!i || !j) return null;

    a = xc && !xc[0];
    b = yc && !yc[0];

    // Either zero?
    if (a || b) return a ? b ? 0 : -j : i;

    // Signs differ?
    if (i != j) return i;

    a = i < 0;
    b = k == l;

    // Either Infinity?
    if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

    // Compare exponents.
    if (!b) return k > l ^ a ? 1 : -1;

    j = (k = xc.length) < (l = yc.length) ? k : l;

    // Compare digit by digit.
    for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

    // Compare lengths.
    return k == l ? 0 : k > l ^ a ? 1 : -1;
  }


  /*
   * Check that n is a primitive number, an integer, and in range, otherwise throw.
   */
  function intCheck(n, min, max, name) {
    if (n < min || n > max || n !== mathfloor(n)) {
      throw Error
       (bignumberError + (name || 'Argument') + (typeof n == 'number'
         ? n < min || n > max ? ' out of range: ' : ' not an integer: '
         : ' not a primitive number: ') + String(n));
    }
  }


  // Assumes finite n.
  function isOdd(n) {
    var k = n.c.length - 1;
    return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
  }


  function toExponential(str, e) {
    return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
     (e < 0 ? 'e' : 'e+') + e;
  }


  function toFixedPoint(str, e, z) {
    var len, zs;

    // Negative exponent?
    if (e < 0) {

      // Prepend zeros.
      for (zs = z + '.'; ++e; zs += z);
      str = zs + str;

    // Positive exponent
    } else {
      len = str.length;

      // Append zeros.
      if (++e > len) {
        for (zs = z, e -= len; --e; zs += z);
        str += zs;
      } else if (e < len) {
        str = str.slice(0, e) + '.' + str.slice(e);
      }
    }

    return str;
  }


  // EXPORT


  BigNumber = clone();
  BigNumber['default'] = BigNumber.BigNumber = BigNumber;

  // AMD.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return BigNumber; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

  // Node.js and other environments that support module.exports.
  } else {}
})(this);


/***/ }),

/***/ "./node_modules/borc/src/constants.js":
/*!********************************************!*\
  !*** ./node_modules/borc/src/constants.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


const Bignumber = (__webpack_require__(/*! bignumber.js */ "./node_modules/bignumber.js/bignumber.js").BigNumber)

exports.MT = {
  POS_INT: 0,
  NEG_INT: 1,
  BYTE_STRING: 2,
  UTF8_STRING: 3,
  ARRAY: 4,
  MAP: 5,
  TAG: 6,
  SIMPLE_FLOAT: 7
}

exports.TAG = {
  DATE_STRING: 0,
  DATE_EPOCH: 1,
  POS_BIGINT: 2,
  NEG_BIGINT: 3,
  DECIMAL_FRAC: 4,
  BIGFLOAT: 5,
  BASE64URL_EXPECTED: 21,
  BASE64_EXPECTED: 22,
  BASE16_EXPECTED: 23,
  CBOR: 24,
  URI: 32,
  BASE64URL: 33,
  BASE64: 34,
  REGEXP: 35,
  MIME: 36
}

exports.NUMBYTES = {
  ZERO: 0,
  ONE: 24,
  TWO: 25,
  FOUR: 26,
  EIGHT: 27,
  INDEFINITE: 31
}

exports.SIMPLE = {
  FALSE: 20,
  TRUE: 21,
  NULL: 22,
  UNDEFINED: 23
}

exports.SYMS = {
  NULL: Symbol('null'),
  UNDEFINED: Symbol('undef'),
  PARENT: Symbol('parent'),
  BREAK: Symbol('break'),
  STREAM: Symbol('stream')
}

exports.SHIFT32 = Math.pow(2, 32)
exports.SHIFT16 = Math.pow(2, 16)

exports.MAX_SAFE_HIGH = 0x1fffff
exports.NEG_ONE = new Bignumber(-1)
exports.TEN = new Bignumber(10)
exports.TWO = new Bignumber(2)

exports.PARENT = {
  ARRAY: 0,
  OBJECT: 1,
  MAP: 2,
  TAG: 3,
  BYTE_STRING: 4,
  UTF8_STRING: 5
}


/***/ }),

/***/ "./node_modules/borc/src/decoder.asm.js":
/*!**********************************************!*\
  !*** ./node_modules/borc/src/decoder.asm.js ***!
  \**********************************************/
/***/ ((module) => {

/* eslint-disable */

module.exports = function decodeAsm (stdlib, foreign, buffer) {
  'use asm'

  // -- Imports

  var heap = new stdlib.Uint8Array(buffer)
  // var log = foreign.log
  var pushInt = foreign.pushInt
  var pushInt32 = foreign.pushInt32
  var pushInt32Neg = foreign.pushInt32Neg
  var pushInt64 = foreign.pushInt64
  var pushInt64Neg = foreign.pushInt64Neg
  var pushFloat = foreign.pushFloat
  var pushFloatSingle = foreign.pushFloatSingle
  var pushFloatDouble = foreign.pushFloatDouble
  var pushTrue = foreign.pushTrue
  var pushFalse = foreign.pushFalse
  var pushUndefined = foreign.pushUndefined
  var pushNull = foreign.pushNull
  var pushInfinity = foreign.pushInfinity
  var pushInfinityNeg = foreign.pushInfinityNeg
  var pushNaN = foreign.pushNaN
  var pushNaNNeg = foreign.pushNaNNeg

  var pushArrayStart = foreign.pushArrayStart
  var pushArrayStartFixed = foreign.pushArrayStartFixed
  var pushArrayStartFixed32 = foreign.pushArrayStartFixed32
  var pushArrayStartFixed64 = foreign.pushArrayStartFixed64
  var pushObjectStart = foreign.pushObjectStart
  var pushObjectStartFixed = foreign.pushObjectStartFixed
  var pushObjectStartFixed32 = foreign.pushObjectStartFixed32
  var pushObjectStartFixed64 = foreign.pushObjectStartFixed64

  var pushByteString = foreign.pushByteString
  var pushByteStringStart = foreign.pushByteStringStart
  var pushUtf8String = foreign.pushUtf8String
  var pushUtf8StringStart = foreign.pushUtf8StringStart

  var pushSimpleUnassigned = foreign.pushSimpleUnassigned

  var pushTagStart = foreign.pushTagStart
  var pushTagStart4 = foreign.pushTagStart4
  var pushTagStart8 = foreign.pushTagStart8
  var pushTagUnassigned = foreign.pushTagUnassigned

  var pushBreak = foreign.pushBreak

  var pow = stdlib.Math.pow

  // -- Constants


  // -- Mutable Variables

  var offset = 0
  var inputLength = 0
  var code = 0

  // Decode a cbor string represented as Uint8Array
  // which is allocated on the heap from 0 to inputLength
  //
  // input - Int
  //
  // Returns Code - Int,
  // Success = 0
  // Error > 0
  function parse (input) {
    input = input | 0

    offset = 0
    inputLength = input

    while ((offset | 0) < (inputLength | 0)) {
      code = jumpTable[heap[offset] & 255](heap[offset] | 0) | 0

      if ((code | 0) > 0) {
        break
      }
    }

    return code | 0
  }

  // -- Helper Function

  function checkOffset (n) {
    n = n | 0

    if ((((offset | 0) + (n | 0)) | 0) < (inputLength | 0)) {
      return 0
    }

    return 1
  }

  function readUInt16 (n) {
    n = n | 0

    return (
      (heap[n | 0] << 8) | heap[(n + 1) | 0]
    ) | 0
  }

  function readUInt32 (n) {
    n = n | 0

    return (
      (heap[n | 0] << 24) | (heap[(n + 1) | 0] << 16) | (heap[(n + 2) | 0] << 8) | heap[(n + 3) | 0]
    ) | 0
  }

  // -- Initial Byte Handlers

  function INT_P (octet) {
    octet = octet | 0

    pushInt(octet | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function UINT_P_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushInt(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function UINT_P_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushInt(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function UINT_P_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushInt32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function UINT_P_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushInt64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function INT_N (octet) {
    octet = octet | 0

    pushInt((-1 - ((octet - 32) | 0)) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function UINT_N_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushInt(
      (-1 - (heap[(offset + 1) | 0] | 0)) | 0
    )

    offset = (offset + 2) | 0

    return 0
  }

  function UINT_N_16 (octet) {
    octet = octet | 0

    var val = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    val = readUInt16((offset + 1) | 0) | 0
    pushInt((-1 - (val | 0)) | 0)

    offset = (offset + 3) | 0

    return 0
  }

  function UINT_N_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushInt32Neg(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function UINT_N_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushInt64Neg(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function BYTE_STRING (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var step = 0

    step = (octet - 64) | 0
    if (checkOffset(step | 0) | 0) {
      return 1
    }

    start = (offset + 1) | 0
    end = (((offset + 1) | 0) + (step | 0)) | 0

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_8 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(1) | 0) {
      return 1
    }

    length = heap[(offset + 1) | 0] | 0
    start = (offset + 2) | 0
    end = (((offset + 2) | 0) + (length | 0)) | 0

    if (checkOffset((length + 1) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_16 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    length = readUInt16((offset + 1) | 0) | 0
    start = (offset + 3) | 0
    end = (((offset + 3) | 0) + (length | 0)) | 0


    if (checkOffset((length + 2) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_32 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(4) | 0) {
      return 1
    }

    length = readUInt32((offset + 1) | 0) | 0
    start = (offset + 5) | 0
    end = (((offset + 5) | 0) + (length | 0)) | 0


    if (checkOffset((length + 4) | 0) | 0) {
      return 1
    }

    pushByteString(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function BYTE_STRING_64 (octet) {
    // NOT IMPLEMENTED
    octet = octet | 0

    return 1
  }

  function BYTE_STRING_BREAK (octet) {
    octet = octet | 0

    pushByteStringStart()

    offset = (offset + 1) | 0

    return 0
  }

  function UTF8_STRING (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var step = 0

    step = (octet - 96) | 0

    if (checkOffset(step | 0) | 0) {
      return 1
    }

    start = (offset + 1) | 0
    end = (((offset + 1) | 0) + (step | 0)) | 0

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_8 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(1) | 0) {
      return 1
    }

    length = heap[(offset + 1) | 0] | 0
    start = (offset + 2) | 0
    end = (((offset + 2) | 0) + (length | 0)) | 0

    if (checkOffset((length + 1) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_16 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(2) | 0) {
      return 1
    }

    length = readUInt16((offset + 1) | 0) | 0
    start = (offset + 3) | 0
    end = (((offset + 3) | 0) + (length | 0)) | 0

    if (checkOffset((length + 2) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_32 (octet) {
    octet = octet | 0

    var start = 0
    var end = 0
    var length = 0

    if (checkOffset(4) | 0) {
      return 1
    }

    length = readUInt32((offset + 1) | 0) | 0
    start = (offset + 5) | 0
    end = (((offset + 5) | 0) + (length | 0)) | 0

    if (checkOffset((length + 4) | 0) | 0) {
      return 1
    }

    pushUtf8String(start | 0, end | 0)

    offset = end | 0

    return 0
  }

  function UTF8_STRING_64 (octet) {
    // NOT IMPLEMENTED
    octet = octet | 0

    return 1
  }

  function UTF8_STRING_BREAK (octet) {
    octet = octet | 0

    pushUtf8StringStart()

    offset = (offset + 1) | 0

    return 0
  }

  function ARRAY (octet) {
    octet = octet | 0

    pushArrayStartFixed((octet - 128) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function ARRAY_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushArrayStartFixed(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function ARRAY_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushArrayStartFixed(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function ARRAY_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushArrayStartFixed32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function ARRAY_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushArrayStartFixed64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function ARRAY_BREAK (octet) {
    octet = octet | 0

    pushArrayStart()

    offset = (offset + 1) | 0

    return 0
  }

  function MAP (octet) {
    octet = octet | 0

    var step = 0

    step = (octet - 160) | 0

    if (checkOffset(step | 0) | 0) {
      return 1
    }

    pushObjectStartFixed(step | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function MAP_8 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushObjectStartFixed(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2) | 0

    return 0
  }

  function MAP_16 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushObjectStartFixed(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3) | 0

    return 0
  }

  function MAP_32 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushObjectStartFixed32(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function MAP_64 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushObjectStartFixed64(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function MAP_BREAK (octet) {
    octet = octet | 0

    pushObjectStart()

    offset = (offset + 1) | 0

    return 0
  }

  function TAG_KNOWN (octet) {
    octet = octet | 0

    pushTagStart((octet - 192| 0) | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_POS (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_NEG (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_FRAC (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BIGNUM_FLOAT (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_UNASSIGNED (octet) {
    octet = octet | 0

    pushTagStart((octet - 192| 0) | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE64_URL (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE64 (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_BASE16 (octet) {
    octet = octet | 0

    pushTagStart(octet | 0)

    offset = (offset + 1 | 0)

    return 0
  }

  function TAG_MORE_1 (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushTagStart(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2 | 0)

    return 0
  }

  function TAG_MORE_2 (octet) {
    octet = octet | 0

    if (checkOffset(2) | 0) {
      return 1
    }

    pushTagStart(
      readUInt16((offset + 1) | 0) | 0
    )

    offset = (offset + 3 | 0)

    return 0
  }

  function TAG_MORE_4 (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushTagStart4(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0
    )

    offset = (offset + 5 | 0)

    return 0
  }

  function TAG_MORE_8 (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushTagStart8(
      readUInt16((offset + 1) | 0) | 0,
      readUInt16((offset + 3) | 0) | 0,
      readUInt16((offset + 5) | 0) | 0,
      readUInt16((offset + 7) | 0) | 0
    )

    offset = (offset + 9 | 0)

    return 0
  }

  function SIMPLE_UNASSIGNED (octet) {
    octet = octet | 0

    pushSimpleUnassigned(((octet | 0) - 224) | 0)

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_FALSE (octet) {
    octet = octet | 0

    pushFalse()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_TRUE (octet) {
    octet = octet | 0

    pushTrue()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_NULL (octet) {
    octet = octet | 0

    pushNull()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_UNDEFINED (octet) {
    octet = octet | 0

    pushUndefined()

    offset = (offset + 1) | 0

    return 0
  }

  function SIMPLE_BYTE (octet) {
    octet = octet | 0

    if (checkOffset(1) | 0) {
      return 1
    }

    pushSimpleUnassigned(heap[(offset + 1) | 0] | 0)

    offset = (offset + 2)  | 0

    return 0
  }

  function SIMPLE_FLOAT_HALF (octet) {
    octet = octet | 0

    var f = 0
    var g = 0
    var sign = 1.0
    var exp = 0.0
    var mant = 0.0
    var r = 0.0
    if (checkOffset(2) | 0) {
      return 1
    }

    f = heap[(offset + 1) | 0] | 0
    g = heap[(offset + 2) | 0] | 0

    if ((f | 0) & 0x80) {
      sign = -1.0
    }

    exp = +(((f | 0) & 0x7C) >> 2)
    mant = +((((f | 0) & 0x03) << 8) | g)

    if (+exp == 0.0) {
      pushFloat(+(
        (+sign) * +5.9604644775390625e-8 * (+mant)
      ))
    } else if (+exp == 31.0) {
      if (+sign == 1.0) {
        if (+mant > 0.0) {
          pushNaN()
        } else {
          pushInfinity()
        }
      } else {
        if (+mant > 0.0) {
          pushNaNNeg()
        } else {
          pushInfinityNeg()
        }
      }
    } else {
      pushFloat(+(
        +sign * pow(+2, +(+exp - 25.0)) * +(1024.0 + mant)
      ))
    }

    offset = (offset + 3) | 0

    return 0
  }

  function SIMPLE_FLOAT_SINGLE (octet) {
    octet = octet | 0

    if (checkOffset(4) | 0) {
      return 1
    }

    pushFloatSingle(
      heap[(offset + 1) | 0] | 0,
      heap[(offset + 2) | 0] | 0,
      heap[(offset + 3) | 0] | 0,
      heap[(offset + 4) | 0] | 0
    )

    offset = (offset + 5) | 0

    return 0
  }

  function SIMPLE_FLOAT_DOUBLE (octet) {
    octet = octet | 0

    if (checkOffset(8) | 0) {
      return 1
    }

    pushFloatDouble(
      heap[(offset + 1) | 0] | 0,
      heap[(offset + 2) | 0] | 0,
      heap[(offset + 3) | 0] | 0,
      heap[(offset + 4) | 0] | 0,
      heap[(offset + 5) | 0] | 0,
      heap[(offset + 6) | 0] | 0,
      heap[(offset + 7) | 0] | 0,
      heap[(offset + 8) | 0] | 0
    )

    offset = (offset + 9) | 0

    return 0
  }

  function ERROR (octet) {
    octet = octet | 0

    return 1
  }

  function BREAK (octet) {
    octet = octet | 0

    pushBreak()

    offset = (offset + 1) | 0

    return 0
  }

  // -- Jump Table

  var jumpTable = [
    // Integer 0x00..0x17 (0..23)
    INT_P, // 0x00
    INT_P, // 0x01
    INT_P, // 0x02
    INT_P, // 0x03
    INT_P, // 0x04
    INT_P, // 0x05
    INT_P, // 0x06
    INT_P, // 0x07
    INT_P, // 0x08
    INT_P, // 0x09
    INT_P, // 0x0A
    INT_P, // 0x0B
    INT_P, // 0x0C
    INT_P, // 0x0D
    INT_P, // 0x0E
    INT_P, // 0x0F
    INT_P, // 0x10
    INT_P, // 0x11
    INT_P, // 0x12
    INT_P, // 0x13
    INT_P, // 0x14
    INT_P, // 0x15
    INT_P, // 0x16
    INT_P, // 0x17
    // Unsigned integer (one-byte uint8_t follows)
    UINT_P_8, // 0x18
    // Unsigned integer (two-byte uint16_t follows)
    UINT_P_16, // 0x19
    // Unsigned integer (four-byte uint32_t follows)
    UINT_P_32, // 0x1a
    // Unsigned integer (eight-byte uint64_t follows)
    UINT_P_64, // 0x1b
    ERROR, // 0x1c
    ERROR, // 0x1d
    ERROR, // 0x1e
    ERROR, // 0x1f
    // Negative integer -1-0x00..-1-0x17 (-1..-24)
    INT_N, // 0x20
    INT_N, // 0x21
    INT_N, // 0x22
    INT_N, // 0x23
    INT_N, // 0x24
    INT_N, // 0x25
    INT_N, // 0x26
    INT_N, // 0x27
    INT_N, // 0x28
    INT_N, // 0x29
    INT_N, // 0x2A
    INT_N, // 0x2B
    INT_N, // 0x2C
    INT_N, // 0x2D
    INT_N, // 0x2E
    INT_N, // 0x2F
    INT_N, // 0x30
    INT_N, // 0x31
    INT_N, // 0x32
    INT_N, // 0x33
    INT_N, // 0x34
    INT_N, // 0x35
    INT_N, // 0x36
    INT_N, // 0x37
    // Negative integer -1-n (one-byte uint8_t for n follows)
    UINT_N_8, // 0x38
    // Negative integer -1-n (two-byte uint16_t for n follows)
    UINT_N_16, // 0x39
    // Negative integer -1-n (four-byte uint32_t for nfollows)
    UINT_N_32, // 0x3a
    // Negative integer -1-n (eight-byte uint64_t for n follows)
    UINT_N_64, // 0x3b
    ERROR, // 0x3c
    ERROR, // 0x3d
    ERROR, // 0x3e
    ERROR, // 0x3f
    // byte string (0x00..0x17 bytes follow)
    BYTE_STRING, // 0x40
    BYTE_STRING, // 0x41
    BYTE_STRING, // 0x42
    BYTE_STRING, // 0x43
    BYTE_STRING, // 0x44
    BYTE_STRING, // 0x45
    BYTE_STRING, // 0x46
    BYTE_STRING, // 0x47
    BYTE_STRING, // 0x48
    BYTE_STRING, // 0x49
    BYTE_STRING, // 0x4A
    BYTE_STRING, // 0x4B
    BYTE_STRING, // 0x4C
    BYTE_STRING, // 0x4D
    BYTE_STRING, // 0x4E
    BYTE_STRING, // 0x4F
    BYTE_STRING, // 0x50
    BYTE_STRING, // 0x51
    BYTE_STRING, // 0x52
    BYTE_STRING, // 0x53
    BYTE_STRING, // 0x54
    BYTE_STRING, // 0x55
    BYTE_STRING, // 0x56
    BYTE_STRING, // 0x57
    // byte string (one-byte uint8_t for n, and then n bytes follow)
    BYTE_STRING_8, // 0x58
    // byte string (two-byte uint16_t for n, and then n bytes follow)
    BYTE_STRING_16, // 0x59
    // byte string (four-byte uint32_t for n, and then n bytes follow)
    BYTE_STRING_32, // 0x5a
    // byte string (eight-byte uint64_t for n, and then n bytes follow)
    BYTE_STRING_64, // 0x5b
    ERROR, // 0x5c
    ERROR, // 0x5d
    ERROR, // 0x5e
    // byte string, byte strings follow, terminated by "break"
    BYTE_STRING_BREAK, // 0x5f
    // UTF-8 string (0x00..0x17 bytes follow)
    UTF8_STRING, // 0x60
    UTF8_STRING, // 0x61
    UTF8_STRING, // 0x62
    UTF8_STRING, // 0x63
    UTF8_STRING, // 0x64
    UTF8_STRING, // 0x65
    UTF8_STRING, // 0x66
    UTF8_STRING, // 0x67
    UTF8_STRING, // 0x68
    UTF8_STRING, // 0x69
    UTF8_STRING, // 0x6A
    UTF8_STRING, // 0x6B
    UTF8_STRING, // 0x6C
    UTF8_STRING, // 0x6D
    UTF8_STRING, // 0x6E
    UTF8_STRING, // 0x6F
    UTF8_STRING, // 0x70
    UTF8_STRING, // 0x71
    UTF8_STRING, // 0x72
    UTF8_STRING, // 0x73
    UTF8_STRING, // 0x74
    UTF8_STRING, // 0x75
    UTF8_STRING, // 0x76
    UTF8_STRING, // 0x77
    // UTF-8 string (one-byte uint8_t for n, and then n bytes follow)
    UTF8_STRING_8, // 0x78
    // UTF-8 string (two-byte uint16_t for n, and then n bytes follow)
    UTF8_STRING_16, // 0x79
    // UTF-8 string (four-byte uint32_t for n, and then n bytes follow)
    UTF8_STRING_32, // 0x7a
    // UTF-8 string (eight-byte uint64_t for n, and then n bytes follow)
    UTF8_STRING_64, // 0x7b
    // UTF-8 string, UTF-8 strings follow, terminated by "break"
    ERROR, // 0x7c
    ERROR, // 0x7d
    ERROR, // 0x7e
    UTF8_STRING_BREAK, // 0x7f
    // array (0x00..0x17 data items follow)
    ARRAY, // 0x80
    ARRAY, // 0x81
    ARRAY, // 0x82
    ARRAY, // 0x83
    ARRAY, // 0x84
    ARRAY, // 0x85
    ARRAY, // 0x86
    ARRAY, // 0x87
    ARRAY, // 0x88
    ARRAY, // 0x89
    ARRAY, // 0x8A
    ARRAY, // 0x8B
    ARRAY, // 0x8C
    ARRAY, // 0x8D
    ARRAY, // 0x8E
    ARRAY, // 0x8F
    ARRAY, // 0x90
    ARRAY, // 0x91
    ARRAY, // 0x92
    ARRAY, // 0x93
    ARRAY, // 0x94
    ARRAY, // 0x95
    ARRAY, // 0x96
    ARRAY, // 0x97
    // array (one-byte uint8_t fo, and then n data items follow)
    ARRAY_8, // 0x98
    // array (two-byte uint16_t for n, and then n data items follow)
    ARRAY_16, // 0x99
    // array (four-byte uint32_t for n, and then n data items follow)
    ARRAY_32, // 0x9a
    // array (eight-byte uint64_t for n, and then n data items follow)
    ARRAY_64, // 0x9b
    // array, data items follow, terminated by "break"
    ERROR, // 0x9c
    ERROR, // 0x9d
    ERROR, // 0x9e
    ARRAY_BREAK, // 0x9f
    // map (0x00..0x17 pairs of data items follow)
    MAP, // 0xa0
    MAP, // 0xa1
    MAP, // 0xa2
    MAP, // 0xa3
    MAP, // 0xa4
    MAP, // 0xa5
    MAP, // 0xa6
    MAP, // 0xa7
    MAP, // 0xa8
    MAP, // 0xa9
    MAP, // 0xaA
    MAP, // 0xaB
    MAP, // 0xaC
    MAP, // 0xaD
    MAP, // 0xaE
    MAP, // 0xaF
    MAP, // 0xb0
    MAP, // 0xb1
    MAP, // 0xb2
    MAP, // 0xb3
    MAP, // 0xb4
    MAP, // 0xb5
    MAP, // 0xb6
    MAP, // 0xb7
    // map (one-byte uint8_t for n, and then n pairs of data items follow)
    MAP_8, // 0xb8
    // map (two-byte uint16_t for n, and then n pairs of data items follow)
    MAP_16, // 0xb9
    // map (four-byte uint32_t for n, and then n pairs of data items follow)
    MAP_32, // 0xba
    // map (eight-byte uint64_t for n, and then n pairs of data items follow)
    MAP_64, // 0xbb
    ERROR, // 0xbc
    ERROR, // 0xbd
    ERROR, // 0xbe
    // map, pairs of data items follow, terminated by "break"
    MAP_BREAK, // 0xbf
    // Text-based date/time (data item follows; see Section 2.4.1)
    TAG_KNOWN, // 0xc0
    // Epoch-based date/time (data item follows; see Section 2.4.1)
    TAG_KNOWN, // 0xc1
    // Positive bignum (data item "byte string" follows)
    TAG_KNOWN, // 0xc2
    // Negative bignum (data item "byte string" follows)
    TAG_KNOWN, // 0xc3
    // Decimal Fraction (data item "array" follows; see Section 2.4.3)
    TAG_KNOWN, // 0xc4
    // Bigfloat (data item "array" follows; see Section 2.4.3)
    TAG_KNOWN, // 0xc5
    // (tagged item)
    TAG_UNASSIGNED, // 0xc6
    TAG_UNASSIGNED, // 0xc7
    TAG_UNASSIGNED, // 0xc8
    TAG_UNASSIGNED, // 0xc9
    TAG_UNASSIGNED, // 0xca
    TAG_UNASSIGNED, // 0xcb
    TAG_UNASSIGNED, // 0xcc
    TAG_UNASSIGNED, // 0xcd
    TAG_UNASSIGNED, // 0xce
    TAG_UNASSIGNED, // 0xcf
    TAG_UNASSIGNED, // 0xd0
    TAG_UNASSIGNED, // 0xd1
    TAG_UNASSIGNED, // 0xd2
    TAG_UNASSIGNED, // 0xd3
    TAG_UNASSIGNED, // 0xd4
    // Expected Conversion (data item follows; see Section 2.4.4.2)
    TAG_UNASSIGNED, // 0xd5
    TAG_UNASSIGNED, // 0xd6
    TAG_UNASSIGNED, // 0xd7
    // (more tagged items, 1/2/4/8 bytes and then a data item follow)
    TAG_MORE_1, // 0xd8
    TAG_MORE_2, // 0xd9
    TAG_MORE_4, // 0xda
    TAG_MORE_8, // 0xdb
    ERROR, // 0xdc
    ERROR, // 0xdd
    ERROR, // 0xde
    ERROR, // 0xdf
    // (simple value)
    SIMPLE_UNASSIGNED, // 0xe0
    SIMPLE_UNASSIGNED, // 0xe1
    SIMPLE_UNASSIGNED, // 0xe2
    SIMPLE_UNASSIGNED, // 0xe3
    SIMPLE_UNASSIGNED, // 0xe4
    SIMPLE_UNASSIGNED, // 0xe5
    SIMPLE_UNASSIGNED, // 0xe6
    SIMPLE_UNASSIGNED, // 0xe7
    SIMPLE_UNASSIGNED, // 0xe8
    SIMPLE_UNASSIGNED, // 0xe9
    SIMPLE_UNASSIGNED, // 0xea
    SIMPLE_UNASSIGNED, // 0xeb
    SIMPLE_UNASSIGNED, // 0xec
    SIMPLE_UNASSIGNED, // 0xed
    SIMPLE_UNASSIGNED, // 0xee
    SIMPLE_UNASSIGNED, // 0xef
    SIMPLE_UNASSIGNED, // 0xf0
    SIMPLE_UNASSIGNED, // 0xf1
    SIMPLE_UNASSIGNED, // 0xf2
    SIMPLE_UNASSIGNED, // 0xf3
    // False
    SIMPLE_FALSE, // 0xf4
    // True
    SIMPLE_TRUE, // 0xf5
    // Null
    SIMPLE_NULL, // 0xf6
    // Undefined
    SIMPLE_UNDEFINED, // 0xf7
    // (simple value, one byte follows)
    SIMPLE_BYTE, // 0xf8
    // Half-Precision Float (two-byte IEEE 754)
    SIMPLE_FLOAT_HALF, // 0xf9
    // Single-Precision Float (four-byte IEEE 754)
    SIMPLE_FLOAT_SINGLE, // 0xfa
    // Double-Precision Float (eight-byte IEEE 754)
    SIMPLE_FLOAT_DOUBLE, // 0xfb
    ERROR, // 0xfc
    ERROR, // 0xfd
    ERROR, // 0xfe
    // "break" stop code
    BREAK // 0xff
  ]

  // --

  return {
    parse: parse
  }
}


/***/ }),

/***/ "./node_modules/borc/src/decoder.js":
/*!******************************************!*\
  !*** ./node_modules/borc/src/decoder.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { Buffer } = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")
const ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
const Bignumber = (__webpack_require__(/*! bignumber.js */ "./node_modules/bignumber.js/bignumber.js").BigNumber)

const parser = __webpack_require__(/*! ./decoder.asm */ "./node_modules/borc/src/decoder.asm.js")
const utils = __webpack_require__(/*! ./utils */ "./node_modules/borc/src/utils.js")
const c = __webpack_require__(/*! ./constants */ "./node_modules/borc/src/constants.js")
const Simple = __webpack_require__(/*! ./simple */ "./node_modules/borc/src/simple.js")
const Tagged = __webpack_require__(/*! ./tagged */ "./node_modules/borc/src/tagged.js")
const { URL } = __webpack_require__(/*! iso-url */ "./node_modules/iso-url/index.js")

/**
 * Transform binary cbor data into JavaScript objects.
 */
class Decoder {
  /**
   * @param {Object} [opts={}]
   * @param {number} [opts.size=65536] - Size of the allocated heap.
   */
  constructor (opts) {
    opts = opts || {}

    if (!opts.size || opts.size < 0x10000) {
      opts.size = 0x10000
    } else {
      // Ensure the size is a power of 2
      opts.size = utils.nextPowerOf2(opts.size)
    }

    // Heap use to share the input with the parser
    this._heap = new ArrayBuffer(opts.size)
    this._heap8 = new Uint8Array(this._heap)
    this._buffer = Buffer.from(this._heap)

    this._reset()

    // Known tags
    this._knownTags = Object.assign({
      0: (val) => new Date(val),
      1: (val) => new Date(val * 1000),
      2: (val) => utils.arrayBufferToBignumber(val),
      3: (val) => c.NEG_ONE.minus(utils.arrayBufferToBignumber(val)),
      4: (v) => {
        // const v = new Uint8Array(val)
        return c.TEN.pow(v[0]).times(v[1])
      },
      5: (v) => {
        // const v = new Uint8Array(val)
        return c.TWO.pow(v[0]).times(v[1])
      },
      32: (val) => new URL(val),
      35: (val) => new RegExp(val)
    }, opts.tags)

    // Initialize asm based parser
    this.parser = parser(__webpack_require__.g, {
      // eslint-disable-next-line no-console
      log: console.log.bind(console),
      pushInt: this.pushInt.bind(this),
      pushInt32: this.pushInt32.bind(this),
      pushInt32Neg: this.pushInt32Neg.bind(this),
      pushInt64: this.pushInt64.bind(this),
      pushInt64Neg: this.pushInt64Neg.bind(this),
      pushFloat: this.pushFloat.bind(this),
      pushFloatSingle: this.pushFloatSingle.bind(this),
      pushFloatDouble: this.pushFloatDouble.bind(this),
      pushTrue: this.pushTrue.bind(this),
      pushFalse: this.pushFalse.bind(this),
      pushUndefined: this.pushUndefined.bind(this),
      pushNull: this.pushNull.bind(this),
      pushInfinity: this.pushInfinity.bind(this),
      pushInfinityNeg: this.pushInfinityNeg.bind(this),
      pushNaN: this.pushNaN.bind(this),
      pushNaNNeg: this.pushNaNNeg.bind(this),
      pushArrayStart: this.pushArrayStart.bind(this),
      pushArrayStartFixed: this.pushArrayStartFixed.bind(this),
      pushArrayStartFixed32: this.pushArrayStartFixed32.bind(this),
      pushArrayStartFixed64: this.pushArrayStartFixed64.bind(this),
      pushObjectStart: this.pushObjectStart.bind(this),
      pushObjectStartFixed: this.pushObjectStartFixed.bind(this),
      pushObjectStartFixed32: this.pushObjectStartFixed32.bind(this),
      pushObjectStartFixed64: this.pushObjectStartFixed64.bind(this),
      pushByteString: this.pushByteString.bind(this),
      pushByteStringStart: this.pushByteStringStart.bind(this),
      pushUtf8String: this.pushUtf8String.bind(this),
      pushUtf8StringStart: this.pushUtf8StringStart.bind(this),
      pushSimpleUnassigned: this.pushSimpleUnassigned.bind(this),
      pushTagUnassigned: this.pushTagUnassigned.bind(this),
      pushTagStart: this.pushTagStart.bind(this),
      pushTagStart4: this.pushTagStart4.bind(this),
      pushTagStart8: this.pushTagStart8.bind(this),
      pushBreak: this.pushBreak.bind(this)
    }, this._heap)
  }

  get _depth () {
    return this._parents.length
  }

  get _currentParent () {
    return this._parents[this._depth - 1]
  }

  get _ref () {
    return this._currentParent.ref
  }

  // Finish the current parent
  _closeParent () {
    var p = this._parents.pop()

    if (p.length > 0) {
      throw new Error(`Missing ${p.length} elements`)
    }

    switch (p.type) {
      case c.PARENT.TAG:
        this._push(
          this.createTag(p.ref[0], p.ref[1])
        )
        break
      case c.PARENT.BYTE_STRING:
        this._push(this.createByteString(p.ref, p.length))
        break
      case c.PARENT.UTF8_STRING:
        this._push(this.createUtf8String(p.ref, p.length))
        break
      case c.PARENT.MAP:
        if (p.values % 2 > 0) {
          throw new Error('Odd number of elements in the map')
        }
        this._push(this.createMap(p.ref, p.length))
        break
      case c.PARENT.OBJECT:
        if (p.values % 2 > 0) {
          throw new Error('Odd number of elements in the map')
        }
        this._push(this.createObject(p.ref, p.length))
        break
      case c.PARENT.ARRAY:
        this._push(this.createArray(p.ref, p.length))
        break
      default:
        break
    }

    if (this._currentParent && this._currentParent.type === c.PARENT.TAG) {
      this._dec()
    }
  }

  // Reduce the expected length of the current parent by one
  _dec () {
    const p = this._currentParent
    // The current parent does not know the epxected child length

    if (p.length < 0) {
      return
    }

    p.length--

    // All children were seen, we can close the current parent
    if (p.length === 0) {
      this._closeParent()
    }
  }

  // Push any value to the current parent
  _push (val, hasChildren) {
    const p = this._currentParent
    p.values++

    switch (p.type) {
      case c.PARENT.ARRAY:
      case c.PARENT.BYTE_STRING:
      case c.PARENT.UTF8_STRING:
        if (p.length > -1) {
          this._ref[this._ref.length - p.length] = val
        } else {
          this._ref.push(val)
        }
        this._dec()
        break
      case c.PARENT.OBJECT:
        if (p.tmpKey != null) {
          this._ref[p.tmpKey] = val
          p.tmpKey = null
          this._dec()
        } else {
          p.tmpKey = val

          if (typeof p.tmpKey !== 'string') {
            // too bad, convert to a Map
            p.type = c.PARENT.MAP
            p.ref = utils.buildMap(p.ref)
          }
        }
        break
      case c.PARENT.MAP:
        if (p.tmpKey != null) {
          this._ref.set(p.tmpKey, val)
          p.tmpKey = null
          this._dec()
        } else {
          p.tmpKey = val
        }
        break
      case c.PARENT.TAG:
        this._ref.push(val)
        if (!hasChildren) {
          this._dec()
        }
        break
      default:
        throw new Error('Unknown parent type')
    }
  }

  // Create a new parent in the parents list
  _createParent (obj, type, len) {
    this._parents[this._depth] = {
      type: type,
      length: len,
      ref: obj,
      values: 0,
      tmpKey: null
    }
  }

  // Reset all state back to the beginning, also used for initiatlization
  _reset () {
    this._res = []
    this._parents = [{
      type: c.PARENT.ARRAY,
      length: -1,
      ref: this._res,
      values: 0,
      tmpKey: null
    }]
  }

  // -- Interface to customize deoding behaviour
  createTag (tagNumber, value) {
    const typ = this._knownTags[tagNumber]

    if (!typ) {
      return new Tagged(tagNumber, value)
    }

    return typ(value)
  }

  createMap (obj, len) {
    return obj
  }

  createObject (obj, len) {
    return obj
  }

  createArray (arr, len) {
    return arr
  }

  createByteString (raw, len) {
    return Buffer.concat(raw)
  }

  createByteStringFromHeap (start, end) {
    if (start === end) {
      return Buffer.alloc(0)
    }

    return Buffer.from(this._heap.slice(start, end))
  }

  createInt (val) {
    return val
  }

  createInt32 (f, g) {
    return utils.buildInt32(f, g)
  }

  createInt64 (f1, f2, g1, g2) {
    return utils.buildInt64(f1, f2, g1, g2)
  }

  createFloat (val) {
    return val
  }

  createFloatSingle (a, b, c, d) {
    return ieee754.read([a, b, c, d], 0, false, 23, 4)
  }

  createFloatDouble (a, b, c, d, e, f, g, h) {
    return ieee754.read([a, b, c, d, e, f, g, h], 0, false, 52, 8)
  }

  createInt32Neg (f, g) {
    return -1 - utils.buildInt32(f, g)
  }

  createInt64Neg (f1, f2, g1, g2) {
    const f = utils.buildInt32(f1, f2)
    const g = utils.buildInt32(g1, g2)

    if (f > c.MAX_SAFE_HIGH) {
      return c.NEG_ONE.minus(new Bignumber(f).times(c.SHIFT32).plus(g))
    }

    return -1 - ((f * c.SHIFT32) + g)
  }

  createTrue () {
    return true
  }

  createFalse () {
    return false
  }

  createNull () {
    return null
  }

  createUndefined () {
    return undefined
  }

  createInfinity () {
    return Infinity
  }

  createInfinityNeg () {
    return -Infinity
  }

  createNaN () {
    return NaN
  }

  createNaNNeg () {
    return -NaN
  }

  createUtf8String (raw, len) {
    return raw.join('')
  }

  createUtf8StringFromHeap (start, end) {
    if (start === end) {
      return ''
    }

    return this._buffer.toString('utf8', start, end)
  }

  createSimpleUnassigned (val) {
    return new Simple(val)
  }

  // -- Interface for decoder.asm.js

  pushInt (val) {
    this._push(this.createInt(val))
  }

  pushInt32 (f, g) {
    this._push(this.createInt32(f, g))
  }

  pushInt64 (f1, f2, g1, g2) {
    this._push(this.createInt64(f1, f2, g1, g2))
  }

  pushFloat (val) {
    this._push(this.createFloat(val))
  }

  pushFloatSingle (a, b, c, d) {
    this._push(this.createFloatSingle(a, b, c, d))
  }

  pushFloatDouble (a, b, c, d, e, f, g, h) {
    this._push(this.createFloatDouble(a, b, c, d, e, f, g, h))
  }

  pushInt32Neg (f, g) {
    this._push(this.createInt32Neg(f, g))
  }

  pushInt64Neg (f1, f2, g1, g2) {
    this._push(this.createInt64Neg(f1, f2, g1, g2))
  }

  pushTrue () {
    this._push(this.createTrue())
  }

  pushFalse () {
    this._push(this.createFalse())
  }

  pushNull () {
    this._push(this.createNull())
  }

  pushUndefined () {
    this._push(this.createUndefined())
  }

  pushInfinity () {
    this._push(this.createInfinity())
  }

  pushInfinityNeg () {
    this._push(this.createInfinityNeg())
  }

  pushNaN () {
    this._push(this.createNaN())
  }

  pushNaNNeg () {
    this._push(this.createNaNNeg())
  }

  pushArrayStart () {
    this._createParent([], c.PARENT.ARRAY, -1)
  }

  pushArrayStartFixed (len) {
    this._createArrayStartFixed(len)
  }

  pushArrayStartFixed32 (len1, len2) {
    const len = utils.buildInt32(len1, len2)
    this._createArrayStartFixed(len)
  }

  pushArrayStartFixed64 (len1, len2, len3, len4) {
    const len = utils.buildInt64(len1, len2, len3, len4)
    this._createArrayStartFixed(len)
  }

  pushObjectStart () {
    this._createObjectStartFixed(-1)
  }

  pushObjectStartFixed (len) {
    this._createObjectStartFixed(len)
  }

  pushObjectStartFixed32 (len1, len2) {
    const len = utils.buildInt32(len1, len2)
    this._createObjectStartFixed(len)
  }

  pushObjectStartFixed64 (len1, len2, len3, len4) {
    const len = utils.buildInt64(len1, len2, len3, len4)
    this._createObjectStartFixed(len)
  }

  pushByteStringStart () {
    this._parents[this._depth] = {
      type: c.PARENT.BYTE_STRING,
      length: -1,
      ref: [],
      values: 0,
      tmpKey: null
    }
  }

  pushByteString (start, end) {
    this._push(this.createByteStringFromHeap(start, end))
  }

  pushUtf8StringStart () {
    this._parents[this._depth] = {
      type: c.PARENT.UTF8_STRING,
      length: -1,
      ref: [],
      values: 0,
      tmpKey: null
    }
  }

  pushUtf8String (start, end) {
    this._push(this.createUtf8StringFromHeap(start, end))
  }

  pushSimpleUnassigned (val) {
    this._push(this.createSimpleUnassigned(val))
  }

  pushTagStart (tag) {
    this._parents[this._depth] = {
      type: c.PARENT.TAG,
      length: 1,
      ref: [tag]
    }
  }

  pushTagStart4 (f, g) {
    this.pushTagStart(utils.buildInt32(f, g))
  }

  pushTagStart8 (f1, f2, g1, g2) {
    this.pushTagStart(utils.buildInt64(f1, f2, g1, g2))
  }

  pushTagUnassigned (tagNumber) {
    this._push(this.createTag(tagNumber))
  }

  pushBreak () {
    if (this._currentParent.length > -1) {
      throw new Error('Unexpected break')
    }

    this._closeParent()
  }

  _createObjectStartFixed (len) {
    if (len === 0) {
      this._push(this.createObject({}))
      return
    }

    this._createParent({}, c.PARENT.OBJECT, len)
  }

  _createArrayStartFixed (len) {
    if (len === 0) {
      this._push(this.createArray([]))
      return
    }

    this._createParent(new Array(len), c.PARENT.ARRAY, len)
  }

  _decode (input) {
    if (input.byteLength === 0) {
      throw new Error('Input too short')
    }

    this._reset()
    this._heap8.set(input)
    const code = this.parser.parse(input.byteLength)

    if (this._depth > 1) {
      while (this._currentParent.length === 0) {
        this._closeParent()
      }
      if (this._depth > 1) {
        throw new Error('Undeterminated nesting')
      }
    }

    if (code > 0) {
      throw new Error('Failed to parse')
    }

    if (this._res.length === 0) {
      throw new Error('No valid result')
    }
  }

  // -- Public Interface

  decodeFirst (input) {
    this._decode(input)

    return this._res[0]
  }

  decodeAll (input) {
    this._decode(input)

    return this._res
  }

  /**
   * Decode the first cbor object.
   *
   * @param {Buffer|string} input
   * @param {string} [enc='hex'] - Encoding used if a string is passed.
   * @returns {*}
   */
  static decode (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Decoder({ size: input.length })
    return dec.decodeFirst(input)
  }

  /**
   * Decode all cbor objects.
   *
   * @param {Buffer|string} input
   * @param {string} [enc='hex'] - Encoding used if a string is passed.
   * @returns {Array<*>}
   */
  static decodeAll (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Decoder({ size: input.length })
    return dec.decodeAll(input)
  }
}

Decoder.decodeFirst = Decoder.decode

module.exports = Decoder


/***/ }),

/***/ "./node_modules/borc/src/diagnose.js":
/*!*******************************************!*\
  !*** ./node_modules/borc/src/diagnose.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { Buffer } = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")
const Decoder = __webpack_require__(/*! ./decoder */ "./node_modules/borc/src/decoder.js")
const utils = __webpack_require__(/*! ./utils */ "./node_modules/borc/src/utils.js")

/**
 * Output the diagnostic format from a stream of CBOR bytes.
 *
 */
class Diagnose extends Decoder {
  createTag (tagNumber, value) {
    return `${tagNumber}(${value})`
  }

  createInt (val) {
    return super.createInt(val).toString()
  }

  createInt32 (f, g) {
    return super.createInt32(f, g).toString()
  }

  createInt64 (f1, f2, g1, g2) {
    return super.createInt64(f1, f2, g1, g2).toString()
  }

  createInt32Neg (f, g) {
    return super.createInt32Neg(f, g).toString()
  }

  createInt64Neg (f1, f2, g1, g2) {
    return super.createInt64Neg(f1, f2, g1, g2).toString()
  }

  createTrue () {
    return 'true'
  }

  createFalse () {
    return 'false'
  }

  createFloat (val) {
    const fl = super.createFloat(val)
    if (utils.isNegativeZero(val)) {
      return '-0_1'
    }

    return `${fl}_1`
  }

  createFloatSingle (a, b, c, d) {
    const fl = super.createFloatSingle(a, b, c, d)
    return `${fl}_2`
  }

  createFloatDouble (a, b, c, d, e, f, g, h) {
    const fl = super.createFloatDouble(a, b, c, d, e, f, g, h)
    return `${fl}_3`
  }

  createByteString (raw, len) {
    const val = raw.join(', ')

    if (len === -1) {
      return `(_ ${val})`
    }
    return `h'${val}`
  }

  createByteStringFromHeap (start, end) {
    const val = (Buffer.from(
      super.createByteStringFromHeap(start, end)
    )).toString('hex')

    return `h'${val}'`
  }

  createInfinity () {
    return 'Infinity_1'
  }

  createInfinityNeg () {
    return '-Infinity_1'
  }

  createNaN () {
    return 'NaN_1'
  }

  createNaNNeg () {
    return '-NaN_1'
  }

  createNull () {
    return 'null'
  }

  createUndefined () {
    return 'undefined'
  }

  createSimpleUnassigned (val) {
    return `simple(${val})`
  }

  createArray (arr, len) {
    const val = super.createArray(arr, len)

    if (len === -1) {
      // indefinite
      return `[_ ${val.join(', ')}]`
    }

    return `[${val.join(', ')}]`
  }

  createMap (map, len) {
    const val = super.createMap(map)
    const list = Array.from(val.keys())
      .reduce(collectObject(val), '')

    if (len === -1) {
      return `{_ ${list}}`
    }

    return `{${list}}`
  }

  createObject (obj, len) {
    const val = super.createObject(obj)
    const map = Object.keys(val)
      .reduce(collectObject(val), '')

    if (len === -1) {
      return `{_ ${map}}`
    }

    return `{${map}}`
  }

  createUtf8String (raw, len) {
    const val = raw.join(', ')

    if (len === -1) {
      return `(_ ${val})`
    }

    return `"${val}"`
  }

  createUtf8StringFromHeap (start, end) {
    const val = (Buffer.from(
      super.createUtf8StringFromHeap(start, end)
    )).toString('utf8')

    return `"${val}"`
  }

  static diagnose (input, enc) {
    if (typeof input === 'string') {
      input = Buffer.from(input, enc || 'hex')
    }

    const dec = new Diagnose()
    return dec.decodeFirst(input)
  }
}

module.exports = Diagnose

function collectObject (val) {
  return (acc, key) => {
    if (acc) {
      return `${acc}, ${key}: ${val[key]}`
    }
    return `${key}: ${val[key]}`
  }
}


/***/ }),

/***/ "./node_modules/borc/src/encoder.js":
/*!******************************************!*\
  !*** ./node_modules/borc/src/encoder.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { Buffer } = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")
const { URL } = __webpack_require__(/*! iso-url */ "./node_modules/iso-url/index.js")
const Bignumber = (__webpack_require__(/*! bignumber.js */ "./node_modules/bignumber.js/bignumber.js").BigNumber)

const utils = __webpack_require__(/*! ./utils */ "./node_modules/borc/src/utils.js")
const constants = __webpack_require__(/*! ./constants */ "./node_modules/borc/src/constants.js")
const MT = constants.MT
const NUMBYTES = constants.NUMBYTES
const SHIFT32 = constants.SHIFT32
const SYMS = constants.SYMS
const TAG = constants.TAG
const HALF = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.TWO
const FLOAT = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.FOUR
const DOUBLE = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.EIGHT
const TRUE = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.TRUE
const FALSE = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.FALSE
const UNDEFINED = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.UNDEFINED
const NULL = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.NULL

const MAXINT_BN = new Bignumber('0x20000000000000')
const BUF_NAN = Buffer.from('f97e00', 'hex')
const BUF_INF_NEG = Buffer.from('f9fc00', 'hex')
const BUF_INF_POS = Buffer.from('f97c00', 'hex')

function toType (obj) {
  // [object Type]
  // --------8---1
  return ({}).toString.call(obj).slice(8, -1)
}

/**
 * Transform JavaScript values into CBOR bytes
 *
 */
class Encoder {
  /**
   * @param {Object} [options={}]
   * @param {function(Buffer)} options.stream
   */
  constructor (options) {
    options = options || {}

    this.streaming = typeof options.stream === 'function'
    this.onData = options.stream

    this.semanticTypes = [
      [URL, this._pushUrl],
      [Bignumber, this._pushBigNumber]
    ]

    const addTypes = options.genTypes || []
    const len = addTypes.length
    for (let i = 0; i < len; i++) {
      this.addSemanticType(
        addTypes[i][0],
        addTypes[i][1]
      )
    }

    this._reset()
  }

  addSemanticType (type, fun) {
    const len = this.semanticTypes.length
    for (let i = 0; i < len; i++) {
      const typ = this.semanticTypes[i][0]
      if (typ === type) {
        const old = this.semanticTypes[i][1]
        this.semanticTypes[i][1] = fun
        return old
      }
    }
    this.semanticTypes.push([type, fun])
    return null
  }

  push (val) {
    if (!val) {
      return true
    }

    this.result[this.offset] = val
    this.resultMethod[this.offset] = 0
    this.resultLength[this.offset] = val.length
    this.offset++

    if (this.streaming) {
      this.onData(this.finalize())
    }

    return true
  }

  pushWrite (val, method, len) {
    this.result[this.offset] = val
    this.resultMethod[this.offset] = method
    this.resultLength[this.offset] = len
    this.offset++

    if (this.streaming) {
      this.onData(this.finalize())
    }

    return true
  }

  _pushUInt8 (val) {
    return this.pushWrite(val, 1, 1)
  }

  _pushUInt16BE (val) {
    return this.pushWrite(val, 2, 2)
  }

  _pushUInt32BE (val) {
    return this.pushWrite(val, 3, 4)
  }

  _pushDoubleBE (val) {
    return this.pushWrite(val, 4, 8)
  }

  _pushNaN () {
    return this.push(BUF_NAN)
  }

  _pushInfinity (obj) {
    const half = (obj < 0) ? BUF_INF_NEG : BUF_INF_POS
    return this.push(half)
  }

  _pushFloat (obj) {
    const b2 = Buffer.allocUnsafe(2)

    if (utils.writeHalf(b2, obj)) {
      if (utils.parseHalf(b2) === obj) {
        return this._pushUInt8(HALF) && this.push(b2)
      }
    }

    const b4 = Buffer.allocUnsafe(4)
    b4.writeFloatBE(obj, 0)
    if (b4.readFloatBE(0) === obj) {
      return this._pushUInt8(FLOAT) && this.push(b4)
    }

    return this._pushUInt8(DOUBLE) && this._pushDoubleBE(obj)
  }

  _pushInt (obj, mt, orig) {
    const m = mt << 5
    if (obj < 24) {
      return this._pushUInt8(m | obj)
    }

    if (obj <= 0xff) {
      return this._pushUInt8(m | NUMBYTES.ONE) && this._pushUInt8(obj)
    }

    if (obj <= 0xffff) {
      return this._pushUInt8(m | NUMBYTES.TWO) && this._pushUInt16BE(obj)
    }

    if (obj <= 0xffffffff) {
      return this._pushUInt8(m | NUMBYTES.FOUR) && this._pushUInt32BE(obj)
    }

    if (obj <= Number.MAX_SAFE_INTEGER) {
      return this._pushUInt8(m | NUMBYTES.EIGHT) &&
        this._pushUInt32BE(Math.floor(obj / SHIFT32)) &&
        this._pushUInt32BE(obj % SHIFT32)
    }

    if (mt === MT.NEG_INT) {
      return this._pushFloat(orig)
    }

    return this._pushFloat(obj)
  }

  _pushIntNum (obj) {
    if (obj < 0) {
      return this._pushInt(-obj - 1, MT.NEG_INT, obj)
    } else {
      return this._pushInt(obj, MT.POS_INT)
    }
  }

  _pushNumber (obj) {
    switch (false) {
      case (obj === obj): // eslint-disable-line
        return this._pushNaN(obj)
      case isFinite(obj):
        return this._pushInfinity(obj)
      case ((obj % 1) !== 0):
        return this._pushIntNum(obj)
      default:
        return this._pushFloat(obj)
    }
  }

  _pushString (obj) {
    const len = Buffer.byteLength(obj, 'utf8')
    return this._pushInt(len, MT.UTF8_STRING) && this.pushWrite(obj, 5, len)
  }

  _pushBoolean (obj) {
    return this._pushUInt8(obj ? TRUE : FALSE)
  }

  _pushUndefined (obj) {
    return this._pushUInt8(UNDEFINED)
  }

  _pushArray (gen, obj) {
    const len = obj.length
    if (!gen._pushInt(len, MT.ARRAY)) {
      return false
    }
    for (let j = 0; j < len; j++) {
      if (!gen.pushAny(obj[j])) {
        return false
      }
    }
    return true
  }

  _pushTag (tag) {
    return this._pushInt(tag, MT.TAG)
  }

  _pushDate (gen, obj) {
    // Round date, to get seconds since 1970-01-01 00:00:00 as defined in
    // Sec. 2.4.1 and get a possibly more compact encoding. Note that it is
    // still allowed to encode fractions of seconds which can be achieved by
    // changing overwriting the encode function for Date objects.
    return gen._pushTag(TAG.DATE_EPOCH) && gen.pushAny(Math.round(obj / 1000))
  }

  _pushBuffer (gen, obj) {
    return gen._pushInt(obj.length, MT.BYTE_STRING) && gen.push(obj)
  }

  _pushNoFilter (gen, obj) {
    return gen._pushBuffer(gen, obj.slice())
  }

  _pushRegexp (gen, obj) {
    return gen._pushTag(TAG.REGEXP) && gen.pushAny(obj.source)
  }

  _pushSet (gen, obj) {
    if (!gen._pushInt(obj.size, MT.ARRAY)) {
      return false
    }
    for (const x of obj) {
      if (!gen.pushAny(x)) {
        return false
      }
    }
    return true
  }

  _pushUrl (gen, obj) {
    return gen._pushTag(TAG.URI) && gen.pushAny(obj.format())
  }

  _pushBigint (obj) {
    let tag = TAG.POS_BIGINT
    if (obj.isNegative()) {
      obj = obj.negated().minus(1)
      tag = TAG.NEG_BIGINT
    }
    let str = obj.toString(16)
    if (str.length % 2) {
      str = '0' + str
    }
    const buf = Buffer.from(str, 'hex')
    return this._pushTag(tag) && this._pushBuffer(this, buf)
  }

  _pushBigNumber (gen, obj) {
    if (obj.isNaN()) {
      return gen._pushNaN()
    }
    if (!obj.isFinite()) {
      return gen._pushInfinity(obj.isNegative() ? -Infinity : Infinity)
    }
    if (obj.isInteger()) {
      return gen._pushBigint(obj)
    }
    if (!(gen._pushTag(TAG.DECIMAL_FRAC) &&
      gen._pushInt(2, MT.ARRAY))) {
      return false
    }

    const dec = obj.decimalPlaces()
    const slide = obj.multipliedBy(new Bignumber(10).pow(dec))
    if (!gen._pushIntNum(-dec)) {
      return false
    }
    if (slide.abs().isLessThan(MAXINT_BN)) {
      return gen._pushIntNum(slide.toNumber())
    } else {
      return gen._pushBigint(slide)
    }
  }

  _pushMap (gen, obj) {
    if (!gen._pushInt(obj.size, MT.MAP)) {
      return false
    }

    return this._pushRawMap(
      obj.size,
      Array.from(obj)
    )
  }

  _pushObject (obj) {
    if (!obj) {
      return this._pushUInt8(NULL)
    }

    var len = this.semanticTypes.length
    for (var i = 0; i < len; i++) {
      if (obj instanceof this.semanticTypes[i][0]) {
        return this.semanticTypes[i][1].call(obj, this, obj)
      }
    }

    var f = obj.encodeCBOR
    if (typeof f === 'function') {
      return f.call(obj, this)
    }

    var keys = Object.keys(obj)
    var keyLength = keys.length
    if (!this._pushInt(keyLength, MT.MAP)) {
      return false
    }

    return this._pushRawMap(
      keyLength,
      keys.map((k) => [k, obj[k]])
    )
  }

  _pushRawMap (len, map) {
    // Sort keys for canoncialization
    // 1. encode key
    // 2. shorter key comes before longer key
    // 3. same length keys are sorted with lower
    //    byte value before higher

    map = map.map(function (a) {
      a[0] = Encoder.encode(a[0])
      return a
    }).sort(utils.keySorter)

    for (var j = 0; j < len; j++) {
      if (!this.push(map[j][0])) {
        return false
      }

      if (!this.pushAny(map[j][1])) {
        return false
      }
    }

    return true
  }

  /**
   * Alias for `.pushAny`
   *
   * @param {*} obj
   * @returns {boolean} true on success
   */
  write (obj) {
    return this.pushAny(obj)
  }

  /**
   * Push any supported type onto the encoded stream
   *
   * @param {any} obj
   * @returns {boolean} true on success
   */
  pushAny (obj) {
    var typ = toType(obj)

    switch (typ) {
      case 'Number':
        return this._pushNumber(obj)
      case 'String':
        return this._pushString(obj)
      case 'Boolean':
        return this._pushBoolean(obj)
      case 'Object':
        return this._pushObject(obj)
      case 'Array':
        return this._pushArray(this, obj)
      case 'Uint8Array':
        return this._pushBuffer(this, Buffer.isBuffer(obj) ? obj : Buffer.from(obj))
      case 'Null':
        return this._pushUInt8(NULL)
      case 'Undefined':
        return this._pushUndefined(obj)
      case 'Map':
        return this._pushMap(this, obj)
      case 'Set':
        return this._pushSet(this, obj)
      case 'URL':
        return this._pushUrl(this, obj)
      case 'BigNumber':
        return this._pushBigNumber(this, obj)
      case 'Date':
        return this._pushDate(this, obj)
      case 'RegExp':
        return this._pushRegexp(this, obj)
      case 'Symbol':
        switch (obj) {
          case SYMS.NULL:
            return this._pushObject(null)
          case SYMS.UNDEFINED:
            return this._pushUndefined(undefined)
          // TODO: Add pluggable support for other symbols
          default:
            throw new Error('Unknown symbol: ' + obj.toString())
        }
      default:
        throw new Error('Unknown type: ' + typeof obj + ', ' + (obj ? obj.toString() : ''))
    }
  }

  finalize () {
    if (this.offset === 0) {
      return null
    }

    var result = this.result
    var resultLength = this.resultLength
    var resultMethod = this.resultMethod
    var offset = this.offset

    // Determine the size of the buffer
    var size = 0
    var i = 0

    for (; i < offset; i++) {
      size += resultLength[i]
    }

    var res = Buffer.allocUnsafe(size)
    var index = 0
    var length = 0

    // Write the content into the result buffer
    for (i = 0; i < offset; i++) {
      length = resultLength[i]

      switch (resultMethod[i]) {
        case 0:
          result[i].copy(res, index)
          break
        case 1:
          res.writeUInt8(result[i], index, true)
          break
        case 2:
          res.writeUInt16BE(result[i], index, true)
          break
        case 3:
          res.writeUInt32BE(result[i], index, true)
          break
        case 4:
          res.writeDoubleBE(result[i], index, true)
          break
        case 5:
          res.write(result[i], index, length, 'utf8')
          break
        default:
          throw new Error('unkown method')
      }

      index += length
    }

    var tmp = res

    this._reset()

    return tmp
  }

  _reset () {
    this.result = []
    this.resultMethod = []
    this.resultLength = []
    this.offset = 0
  }

  /**
   * Encode the given value
   * @param {*} o
   * @returns {Buffer}
   */
  static encode (o) {
    const enc = new Encoder()
    const ret = enc.pushAny(o)
    if (!ret) {
      throw new Error('Failed to encode input')
    }

    return enc.finalize()
  }
}

module.exports = Encoder


/***/ }),

/***/ "./node_modules/borc/src/index.js":
/*!****************************************!*\
  !*** ./node_modules/borc/src/index.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


// exports.Commented = require('./commented')
exports.Diagnose = __webpack_require__(/*! ./diagnose */ "./node_modules/borc/src/diagnose.js")
exports.Decoder = __webpack_require__(/*! ./decoder */ "./node_modules/borc/src/decoder.js")
exports.Encoder = __webpack_require__(/*! ./encoder */ "./node_modules/borc/src/encoder.js")
exports.Simple = __webpack_require__(/*! ./simple */ "./node_modules/borc/src/simple.js")
exports.Tagged = __webpack_require__(/*! ./tagged */ "./node_modules/borc/src/tagged.js")

// exports.comment = exports.Commented.comment
exports.decodeAll = exports.Decoder.decodeAll
exports.decodeFirst = exports.Decoder.decodeFirst
exports.diagnose = exports.Diagnose.diagnose
exports.encode = exports.Encoder.encode
exports.decode = exports.Decoder.decode

exports.leveldb = {
  decode: exports.Decoder.decodeAll,
  encode: exports.Encoder.encode,
  buffer: true,
  name: 'cbor'
}


/***/ }),

/***/ "./node_modules/borc/src/simple.js":
/*!*****************************************!*\
  !*** ./node_modules/borc/src/simple.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const constants = __webpack_require__(/*! ./constants */ "./node_modules/borc/src/constants.js")
const MT = constants.MT
const SIMPLE = constants.SIMPLE
const SYMS = constants.SYMS

/**
 * A CBOR Simple Value that does not map onto a known constant.
 */
class Simple {
  /**
   * Creates an instance of Simple.
   *
   * @param {integer} value - the simple value's integer value
   */
  constructor (value) {
    if (typeof value !== 'number') {
      throw new Error('Invalid Simple type: ' + (typeof value))
    }
    if ((value < 0) || (value > 255) || ((value | 0) !== value)) {
      throw new Error('value must be a small positive integer: ' + value)
    }
    this.value = value
  }

  /**
   * Debug string for simple value
   *
   * @returns {string} simple(value)
   */
  toString () {
    return 'simple(' + this.value + ')'
  }

  /**
   * Debug string for simple value
   *
   * @returns {string} simple(value)
   */
  inspect () {
    return 'simple(' + this.value + ')'
  }

  /**
   * Push the simple value onto the CBOR stream
   *
   * @param {cbor.Encoder} gen The generator to push onto
   * @returns {number}
   */
  encodeCBOR (gen) {
    return gen._pushInt(this.value, MT.SIMPLE_FLOAT)
  }

  /**
   * Is the given object a Simple?
   *
   * @param {any} obj - object to test
   * @returns {bool} - is it Simple?
   */
  static isSimple (obj) {
    return obj instanceof Simple
  }

  /**
   * Decode from the CBOR additional information into a JavaScript value.
   * If the CBOR item has no parent, return a "safe" symbol instead of
   * `null` or `undefined`, so that the value can be passed through a
   * stream in object mode.
   *
   * @param {Number} val - the CBOR additional info to convert
   * @param {bool} hasParent - Does the CBOR item have a parent?
   * @returns {(null|undefined|Boolean|Symbol)} - the decoded value
   */
  static decode (val, hasParent) {
    if (hasParent == null) {
      hasParent = true
    }
    switch (val) {
      case SIMPLE.FALSE:
        return false
      case SIMPLE.TRUE:
        return true
      case SIMPLE.NULL:
        if (hasParent) {
          return null
        } else {
          return SYMS.NULL
        }
      case SIMPLE.UNDEFINED:
        if (hasParent) {
          return undefined
        } else {
          return SYMS.UNDEFINED
        }
      case -1:
        if (!hasParent) {
          throw new Error('Invalid BREAK')
        }
        return SYMS.BREAK
      default:
        return new Simple(val)
    }
  }
}

module.exports = Simple


/***/ }),

/***/ "./node_modules/borc/src/tagged.js":
/*!*****************************************!*\
  !*** ./node_modules/borc/src/tagged.js ***!
  \*****************************************/
/***/ ((module) => {

"use strict";


/**
 * A CBOR tagged item, where the tag does not have semantics specified at the
 * moment, or those semantics threw an error during parsing. Typically this will
 * be an extension point you're not yet expecting.
 */
class Tagged {
  /**
   * Creates an instance of Tagged.
   *
   * @param {Number} tag - the number of the tag
   * @param {any} value - the value inside the tag
   * @param {Error} err - the error that was thrown parsing the tag, or null
   */
  constructor (tag, value, err) {
    this.tag = tag
    this.value = value
    this.err = err
    if (typeof this.tag !== 'number') {
      throw new Error('Invalid tag type (' + (typeof this.tag) + ')')
    }
    if ((this.tag < 0) || ((this.tag | 0) !== this.tag)) {
      throw new Error('Tag must be a positive integer: ' + this.tag)
    }
  }

  /**
   * Convert to a String
   *
   * @returns {String} string of the form '1(2)'
   */
  toString () {
    return `${this.tag}(${JSON.stringify(this.value)})`
  }

  /**
   * Push the simple value onto the CBOR stream
   *
   * @param {cbor.Encoder} gen The generator to push onto
   * @returns {number}
   */
  encodeCBOR (gen) {
    gen._pushTag(this.tag)
    return gen.pushAny(this.value)
  }

  /**
   * If we have a converter for this type, do the conversion.  Some converters
   * are built-in.  Additional ones can be passed in.  If you want to remove
   * a built-in converter, pass a converter in whose value is 'null' instead
   * of a function.
   *
   * @param {Object} converters - keys in the object are a tag number, the value
   *   is a function that takes the decoded CBOR and returns a JavaScript value
   *   of the appropriate type.  Throw an exception in the function on errors.
   * @returns {any} - the converted item
   */
  convert (converters) {
    var er, f
    f = converters != null ? converters[this.tag] : undefined
    if (typeof f !== 'function') {
      f = Tagged['_tag' + this.tag]
      if (typeof f !== 'function') {
        return this
      }
    }
    try {
      return f.call(Tagged, this.value)
    } catch (error) {
      er = error
      this.err = er
      return this
    }
  }
}

module.exports = Tagged


/***/ }),

/***/ "./node_modules/borc/src/utils.js":
/*!****************************************!*\
  !*** ./node_modules/borc/src/utils.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


const { Buffer } = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")
const Bignumber = (__webpack_require__(/*! bignumber.js */ "./node_modules/bignumber.js/bignumber.js").BigNumber)

const constants = __webpack_require__(/*! ./constants */ "./node_modules/borc/src/constants.js")
const SHIFT32 = constants.SHIFT32
const SHIFT16 = constants.SHIFT16
const MAX_SAFE_HIGH = 0x1fffff

exports.parseHalf = function parseHalf (buf) {
  var exp, mant, sign
  sign = buf[0] & 0x80 ? -1 : 1
  exp = (buf[0] & 0x7C) >> 2
  mant = ((buf[0] & 0x03) << 8) | buf[1]
  if (!exp) {
    return sign * 5.9604644775390625e-8 * mant
  } else if (exp === 0x1f) {
    return sign * (mant ? 0 / 0 : 2e308)
  } else {
    return sign * Math.pow(2, exp - 25) * (1024 + mant)
  }
}

function toHex (n) {
  if (n < 16) {
    return '0' + n.toString(16)
  }

  return n.toString(16)
}

exports.arrayBufferToBignumber = function (buf) {
  const len = buf.byteLength
  let res = ''
  for (let i = 0; i < len; i++) {
    res += toHex(buf[i])
  }

  return new Bignumber(res, 16)
}

// convert an Object into a Map
exports.buildMap = (obj) => {
  const res = new Map()
  const keys = Object.keys(obj)
  const length = keys.length
  for (let i = 0; i < length; i++) {
    res.set(keys[i], obj[keys[i]])
  }
  return res
}

exports.buildInt32 = (f, g) => {
  return f * SHIFT16 + g
}

exports.buildInt64 = (f1, f2, g1, g2) => {
  const f = exports.buildInt32(f1, f2)
  const g = exports.buildInt32(g1, g2)

  if (f > MAX_SAFE_HIGH) {
    return new Bignumber(f).times(SHIFT32).plus(g)
  } else {
    return (f * SHIFT32) + g
  }
}

exports.writeHalf = function writeHalf (buf, half) {
  // assume 0, -0, NaN, Infinity, and -Infinity have already been caught

  // HACK: everyone settle in.  This isn't going to be pretty.
  // Translate cn-cbor's C code (from Carsten Borman):

  // uint32_t be32;
  // uint16_t be16, u16;
  // union {
  //   float f;
  //   uint32_t u;
  // } u32;
  // u32.f = float_val;

  const u32 = Buffer.allocUnsafe(4)
  u32.writeFloatBE(half, 0)
  const u = u32.readUInt32BE(0)

  // if ((u32.u & 0x1FFF) == 0) { /* worth trying half */

  // hildjj: If the lower 13 bits are 0, we won't lose anything in the conversion
  if ((u & 0x1FFF) !== 0) {
    return false
  }

  //   int s16 = (u32.u >> 16) & 0x8000;
  //   int exp = (u32.u >> 23) & 0xff;
  //   int mant = u32.u & 0x7fffff;

  var s16 = (u >> 16) & 0x8000 // top bit is sign
  const exp = (u >> 23) & 0xff // then 5 bits of exponent
  const mant = u & 0x7fffff

  //   if (exp == 0 && mant == 0)
  //     ;              /* 0.0, -0.0 */

  // hildjj: zeros already handled.  Assert if you don't believe me.

  //   else if (exp >= 113 && exp <= 142) /* normalized */
  //     s16 += ((exp - 112) << 10) + (mant >> 13);
  if ((exp >= 113) && (exp <= 142)) {
    s16 += ((exp - 112) << 10) + (mant >> 13)

  //   else if (exp >= 103 && exp < 113) { /* denorm, exp16 = 0 */
  //     if (mant & ((1 << (126 - exp)) - 1))
  //       goto float32;         /* loss of precision */
  //     s16 += ((mant + 0x800000) >> (126 - exp));
  } else if ((exp >= 103) && (exp < 113)) {
    if (mant & ((1 << (126 - exp)) - 1)) {
      return false
    }
    s16 += ((mant + 0x800000) >> (126 - exp))

    //   } else if (exp == 255 && mant == 0) { /* Inf */
    //     s16 += 0x7c00;

    // hildjj: Infinity already handled

  //   } else
  //     goto float32;           /* loss of range */
  } else {
    return false
  }

  //   ensure_writable(3);
  //   u16 = s16;
  //   be16 = hton16p((const uint8_t*)&u16);
  buf.writeUInt16BE(s16, 0)
  return true
}

exports.keySorter = function (a, b) {
  var lenA = a[0].byteLength
  var lenB = b[0].byteLength

  if (lenA > lenB) {
    return 1
  }

  if (lenB > lenA) {
    return -1
  }

  return a[0].compare(b[0])
}

// Adapted from http://www.2ality.com/2012/03/signedzero.html
exports.isNegativeZero = (x) => {
  return x === 0 && (1 / x < 0)
}

exports.nextPowerOf2 = (n) => {
  let count = 0
  // First n in the below condition is for
  // the case where n is 0
  if (n && !(n & (n - 1))) {
    return n
  }

  while (n !== 0) {
    n >>= 1
    count += 1
  }

  return 1 << count
}


/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
var ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayView (arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    var copy = new Uint8Array(arrayView)
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
  }
  return fromArrayLike(arrayView)
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        Buffer.from(buf).copy(buffer, pos)
      } else {
        Uint8Array.prototype.set.call(
          buffer,
          buf,
          pos
        )
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    } else {
      buf.copy(buffer, pos)
    }
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF)
      ? 4
      : (firstByte > 0xDF)
          ? 3
          : (firstByte > 0xBF)
              ? 2
              : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
  for (var i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUintLE =
Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUintBE =
Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUint8 =
Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUint16LE =
Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUint16BE =
Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUint32LE =
Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUint32BE =
Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUintLE =
Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUintBE =
Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUint8 =
Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUint16LE =
Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUint16BE =
Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUint32LE =
Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUint32BE =
Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()


/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ "./node_modules/iso-url/index.js":
/*!***************************************!*\
  !*** ./node_modules/iso-url/index.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const {
    URLWithLegacySupport,
    format,
    URLSearchParams,
    defaultBase
} = __webpack_require__(/*! ./src/url */ "./node_modules/iso-url/src/url-browser.js");
const relative = __webpack_require__(/*! ./src/relative */ "./node_modules/iso-url/src/relative.js");

module.exports = {
    URL: URLWithLegacySupport,
    URLSearchParams,
    format,
    relative,
    defaultBase
};


/***/ }),

/***/ "./node_modules/iso-url/src/relative.js":
/*!**********************************************!*\
  !*** ./node_modules/iso-url/src/relative.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { URLWithLegacySupport, format } = __webpack_require__(/*! ./url */ "./node_modules/iso-url/src/url-browser.js");

module.exports = (url, location = {}, protocolMap = {}, defaultProtocol) => {
    let protocol = location.protocol ?
        location.protocol.replace(':', '') :
        'http';

    // Check protocol map
    protocol = (protocolMap[protocol] || defaultProtocol || protocol) + ':';
    let urlParsed;

    try {
        urlParsed = new URLWithLegacySupport(url);
    } catch (err) {
        urlParsed = {};
    }

    const base = Object.assign({}, location, {
        protocol: protocol || urlParsed.protocol,
        host: location.host || urlParsed.host
    });

    return new URLWithLegacySupport(url, format(base)).toString();
};


/***/ }),

/***/ "./node_modules/iso-url/src/url-browser.js":
/*!*************************************************!*\
  !*** ./node_modules/iso-url/src/url-browser.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


const defaultBase = self.location ?
    self.location.protocol + '//' + self.location.host :
    '';
const URL = self.URL;

class URLWithLegacySupport {
    constructor(url = '', base = defaultBase) {
        this.super = new URL(url, base);
        this.path = this.pathname + this.search;
        this.auth =
            this.username && this.password ?
                this.username + ':' + this.password :
                null;

        this.query =
            this.search && this.search.startsWith('?') ?
                this.search.slice(1) :
                null;
    }

    get hash() {
        return this.super.hash;
    }
    get host() {
        return this.super.host;
    }
    get hostname() {
        return this.super.hostname;
    }
    get href() {
        return this.super.href;
    }
    get origin() {
        return this.super.origin;
    }
    get password() {
        return this.super.password;
    }
    get pathname() {
        return this.super.pathname;
    }
    get port() {
        return this.super.port;
    }
    get protocol() {
        return this.super.protocol;
    }
    get search() {
        return this.super.search;
    }
    get searchParams() {
        return this.super.searchParams;
    }
    get username() {
        return this.super.username;
    }

    set hash(hash) {
        this.super.hash = hash;
    }
    set host(host) {
        this.super.host = host;
    }
    set hostname(hostname) {
        this.super.hostname = hostname;
    }
    set href(href) {
        this.super.href = href;
    }
    set origin(origin) {
        this.super.origin = origin;
    }
    set password(password) {
        this.super.password = password;
    }
    set pathname(pathname) {
        this.super.pathname = pathname;
    }
    set port(port) {
        this.super.port = port;
    }
    set protocol(protocol) {
        this.super.protocol = protocol;
    }
    set search(search) {
        this.super.search = search;
    }
    set searchParams(searchParams) {
        this.super.searchParams = searchParams;
    }
    set username(username) {
        this.super.username = username;
    }

    createObjectURL(o) {
        return this.super.createObjectURL(o);
    }
    revokeObjectURL(o) {
        this.super.revokeObjectURL(o);
    }
    toJSON() {
        return this.super.toJSON();
    }
    toString() {
        return this.super.toString();
    }
    format() {
        return this.toString();
    }
}

function format(obj) {
    if (typeof obj === 'string') {
        const url = new URL(obj);

        return url.toString();
    }

    if (!(obj instanceof URL)) {
        const userPass =
            obj.username && obj.password ?
                `${obj.username}:${obj.password}@` :
                '';
        const auth = obj.auth ? obj.auth + '@' : '';
        const port = obj.port ? ':' + obj.port : '';
        const protocol = obj.protocol ? obj.protocol + '//' : '';
        const host = obj.host || '';
        const hostname = obj.hostname || '';
        const search = obj.search || (obj.query ? '?' + obj.query : '');
        const hash = obj.hash || '';
        const pathname = obj.pathname || '';
        const path = obj.path || pathname + search;

        return `${protocol}${userPass || auth}${host ||
            hostname + port}${path}${hash}`;
    }
}

module.exports = {
    URLWithLegacySupport,
    URLSearchParams: self.URLSearchParams,
    defaultBase,
    format
};


/***/ }),

/***/ "./node_modules/js-sha256/src/sha256.js":
/*!**********************************************!*\
  !*** ./node_modules/js-sha256/src/sha256.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

/* provided dependency */ var process = __webpack_require__(/*! ./node_modules/process/browser.js */ "./node_modules/process/browser.js");
var __WEBPACK_AMD_DEFINE_RESULT__;/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
/*jslint bitwise: true */
(function () {
  'use strict';

  var ERROR = 'input is invalid type';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_SHA256_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = __webpack_require__.g;
  } else if (WEB_WORKER) {
    root = self;
  }
  var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && "object" === 'object' && module.exports;
  var AMD =  true && __webpack_require__.amdO;
  var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var EXTRA = [-2147483648, 8388608, 32768, 128];
  var SHIFT = [24, 16, 8, 0];
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

  var blocks = [];

  if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function (outputType, is224) {
    return function (message) {
      return new Sha256(is224, true).update(message)[outputType]();
    };
  };

  var createMethod = function (is224) {
    var method = createOutputMethod('hex', is224);
    if (NODE_JS) {
      method = nodeWrap(method, is224);
    }
    method.create = function () {
      return new Sha256(is224);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(type, is224);
    }
    return method;
  };

  var nodeWrap = function (method, is224) {
    var crypto = eval("require('crypto')");
    var Buffer = eval("require('buffer').Buffer");
    var algorithm = is224 ? 'sha224' : 'sha256';
    var nodeMethod = function (message) {
      if (typeof message === 'string') {
        return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
      } else {
        if (message === null || message === undefined) {
          throw new Error(ERROR);
        } else if (message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        }
      }
      if (Array.isArray(message) || ArrayBuffer.isView(message) ||
        message.constructor === Buffer) {
        return crypto.createHash(algorithm).update(new Buffer(message)).digest('hex');
      } else {
        return method(message);
      }
    };
    return nodeMethod;
  };

  var createHmacOutputMethod = function (outputType, is224) {
    return function (key, message) {
      return new HmacSha256(key, is224, true).update(message)[outputType]();
    };
  };

  var createHmacMethod = function (is224) {
    var method = createHmacOutputMethod('hex', is224);
    method.create = function (key) {
      return new HmacSha256(key, is224);
    };
    method.update = function (key, message) {
      return method.create(key).update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createHmacOutputMethod(type, is224);
    }
    return method;
  };

  function Sha256(is224, sharedMemory) {
    if (sharedMemory) {
      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      this.blocks = blocks;
    } else {
      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (is224) {
      this.h0 = 0xc1059ed8;
      this.h1 = 0x367cd507;
      this.h2 = 0x3070dd17;
      this.h3 = 0xf70e5939;
      this.h4 = 0xffc00b31;
      this.h5 = 0x68581511;
      this.h6 = 0x64f98fa7;
      this.h7 = 0xbefa4fa4;
    } else { // 256
      this.h0 = 0x6a09e667;
      this.h1 = 0xbb67ae85;
      this.h2 = 0x3c6ef372;
      this.h3 = 0xa54ff53a;
      this.h4 = 0x510e527f;
      this.h5 = 0x9b05688c;
      this.h6 = 0x1f83d9ab;
      this.h7 = 0x5be0cd19;
    }

    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
    this.is224 = is224;
  }

  Sha256.prototype.update = function (message) {
    if (this.finalized) {
      return;
    }
    var notString, type = typeof message;
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
      notString = true;
    }
    var code, index = 0, i, length = message.length, blocks = this.blocks;

    while (index < length) {
      if (this.hashed) {
        this.hashed = false;
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] =
          blocks[4] = blocks[5] = blocks[6] = blocks[7] =
          blocks[8] = blocks[9] = blocks[10] = blocks[11] =
          blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }

      if (notString) {
        for (i = this.start; index < length && i < 64; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }

      this.lastByteIndex = i;
      this.bytes += i - this.start;
      if (i >= 64) {
        this.block = blocks[16];
        this.start = i - 64;
        this.hash();
        this.hashed = true;
      } else {
        this.start = i;
      }
    }
    if (this.bytes > 4294967295) {
      this.hBytes += this.bytes / 4294967296 << 0;
      this.bytes = this.bytes % 4294967296;
    }
    return this;
  };

  Sha256.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex;
    blocks[16] = this.block;
    blocks[i >> 2] |= EXTRA[i & 3];
    this.block = blocks[16];
    if (i >= 56) {
      if (!this.hashed) {
        this.hash();
      }
      blocks[0] = this.block;
      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks[15] = this.bytes << 3;
    this.hash();
  };

  Sha256.prototype.hash = function () {
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
      h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

    for (j = 16; j < 64; ++j) {
      // rightrotate
      t1 = blocks[j - 15];
      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
      t1 = blocks[j - 2];
      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
    }

    bc = b & c;
    for (j = 0; j < 64; j += 4) {
      if (this.first) {
        if (this.is224) {
          ab = 300032;
          t1 = blocks[0] - 1413257819;
          h = t1 - 150054599 << 0;
          d = t1 + 24177077 << 0;
        } else {
          ab = 704751109;
          t1 = blocks[0] - 210244248;
          h = t1 - 1521486534 << 0;
          d = t1 + 143694565 << 0;
        }
        this.first = false;
      } else {
        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        ab = a & b;
        maj = ab ^ (a & c) ^ bc;
        ch = (e & f) ^ (~e & g);
        t1 = h + s1 + ch + K[j] + blocks[j];
        t2 = s0 + maj;
        h = d + t1 << 0;
        d = t1 + t2 << 0;
      }
      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
      da = d & a;
      maj = da ^ (d & b) ^ ab;
      ch = (h & e) ^ (~h & f);
      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
      t2 = s0 + maj;
      g = c + t1 << 0;
      c = t1 + t2 << 0;
      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
      cd = c & d;
      maj = cd ^ (c & a) ^ da;
      ch = (g & h) ^ (~g & e);
      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
      t2 = s0 + maj;
      f = b + t1 << 0;
      b = t1 + t2 << 0;
      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
      bc = b & c;
      maj = bc ^ (b & d) ^ cd;
      ch = (f & g) ^ (~f & h);
      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
      t2 = s0 + maj;
      e = a + t1 << 0;
      a = t1 + t2 << 0;
    }

    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
    this.h4 = this.h4 + e << 0;
    this.h5 = this.h5 + f << 0;
    this.h6 = this.h6 + g << 0;
    this.h7 = this.h7 + h << 0;
  };

  Sha256.prototype.hex = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var hex = HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
      HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
      HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
      HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
      HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
      HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
      HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
      HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
      HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
      HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
      HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
      HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
      HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
      HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
      HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
      HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
      HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
      HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
      HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
      HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
      HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F] +
      HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F] +
      HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F] +
      HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
      HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F] +
      HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F] +
      HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F] +
      HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
    if (!this.is224) {
      hex += HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F] +
        HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F] +
        HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F] +
        HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
    }
    return hex;
  };

  Sha256.prototype.toString = Sha256.prototype.hex;

  Sha256.prototype.digest = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var arr = [
      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
      (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
      (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF
    ];
    if (!this.is224) {
      arr.push((h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF);
    }
    return arr;
  };

  Sha256.prototype.array = Sha256.prototype.digest;

  Sha256.prototype.arrayBuffer = function () {
    this.finalize();

    var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
    var dataView = new DataView(buffer);
    dataView.setUint32(0, this.h0);
    dataView.setUint32(4, this.h1);
    dataView.setUint32(8, this.h2);
    dataView.setUint32(12, this.h3);
    dataView.setUint32(16, this.h4);
    dataView.setUint32(20, this.h5);
    dataView.setUint32(24, this.h6);
    if (!this.is224) {
      dataView.setUint32(28, this.h7);
    }
    return buffer;
  };

  function HmacSha256(key, is224, sharedMemory) {
    var i, type = typeof key;
    if (type === 'string') {
      var bytes = [], length = key.length, index = 0, code;
      for (i = 0; i < length; ++i) {
        code = key.charCodeAt(i);
        if (code < 0x80) {
          bytes[index++] = code;
        } else if (code < 0x800) {
          bytes[index++] = (0xc0 | (code >> 6));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes[index++] = (0xe0 | (code >> 12));
          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
          bytes[index++] = (0xf0 | (code >> 18));
          bytes[index++] = (0x80 | ((code >> 12) & 0x3f));
          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        }
      }
      key = bytes;
    } else {
      if (type === 'object') {
        if (key === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
          key = new Uint8Array(key);
        } else if (!Array.isArray(key)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
    }

    if (key.length > 64) {
      key = (new Sha256(is224, true)).update(key).array();
    }

    var oKeyPad = [], iKeyPad = [];
    for (i = 0; i < 64; ++i) {
      var b = key[i] || 0;
      oKeyPad[i] = 0x5c ^ b;
      iKeyPad[i] = 0x36 ^ b;
    }

    Sha256.call(this, is224, sharedMemory);

    this.update(iKeyPad);
    this.oKeyPad = oKeyPad;
    this.inner = true;
    this.sharedMemory = sharedMemory;
  }
  HmacSha256.prototype = new Sha256();

  HmacSha256.prototype.finalize = function () {
    Sha256.prototype.finalize.call(this);
    if (this.inner) {
      this.inner = false;
      var innerHash = this.array();
      Sha256.call(this, this.is224, this.sharedMemory);
      this.update(this.oKeyPad);
      this.update(innerHash);
      Sha256.prototype.finalize.call(this);
    }
  };

  var exports = createMethod();
  exports.sha256 = exports;
  exports.sha224 = createMethod(true);
  exports.sha256.hmac = createHmacMethod();
  exports.sha224.hmac = createHmacMethod(true);

  if (COMMON_JS) {
    module.exports = exports;
  } else {
    root.sha256 = exports.sha256;
    root.sha224 = exports.sha224;
    if (AMD) {
      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
        return exports;
      }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
  }
})();


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/simple-cbor/src/index.js":
/*!***********************************************!*\
  !*** ./node_modules/simple-cbor/src/index.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__export(__webpack_require__(/*! ./serializer */ "./node_modules/simple-cbor/src/serializer.js"));
const value = __importStar(__webpack_require__(/*! ./value */ "./node_modules/simple-cbor/src/value.js"));
exports.value = value;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/simple-cbor/src/serializer.js":
/*!****************************************************!*\
  !*** ./node_modules/simple-cbor/src/serializer.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const cbor = __importStar(__webpack_require__(/*! ./value */ "./node_modules/simple-cbor/src/value.js"));
const BufferClasses = [
    ArrayBuffer,
    Uint8Array,
    Uint16Array,
    Uint32Array,
    Int8Array,
    Int16Array,
    Int32Array,
    Float32Array,
    Float64Array,
];
class JsonDefaultCborEncoder {
    // @param _serializer The CBOR Serializer to use.
    // @param _stable Whether or not keys from objects should be sorted (stable). This is
    //     particularly useful when testing encodings between JSON objects.
    constructor(_serializer, _stable = false) {
        this._serializer = _serializer;
        this._stable = _stable;
        this.name = "jsonDefault";
        this.priority = -100;
    }
    match(value) {
        return ["undefined", "boolean", "number", "string", "object"].indexOf(typeof value) != -1;
    }
    encode(value) {
        switch (typeof value) {
            case "undefined":
                return cbor.undefined_();
            case "boolean":
                return cbor.bool(value);
            case "number":
                if (Math.floor(value) === value) {
                    return cbor.number(value);
                }
                else {
                    return cbor.doubleFloat(value);
                }
            case "string":
                return cbor.string(value);
            case "object":
                if (value === null) {
                    return cbor.null_();
                }
                else if (Array.isArray(value)) {
                    return cbor.array(value.map((x) => this._serializer.serializeValue(x)));
                }
                else if (BufferClasses.find((x) => value instanceof x)) {
                    return cbor.bytes(value.buffer);
                }
                else if (Object.getOwnPropertyNames(value).indexOf("toJSON") !== -1) {
                    return this.encode(value.toJSON());
                }
                else if (value instanceof Map) {
                    const m = new Map();
                    for (const [key, item] of value.entries()) {
                        m.set(key, this._serializer.serializeValue(item));
                    }
                    return cbor.map(m, this._stable);
                }
                else {
                    const m = new Map();
                    for (const [key, item] of Object.entries(value)) {
                        m.set(key, this._serializer.serializeValue(item));
                    }
                    return cbor.map(m, this._stable);
                }
            default:
                throw new Error("Invalid value.");
        }
    }
}
exports.JsonDefaultCborEncoder = JsonDefaultCborEncoder;
class ToCborEncoder {
    constructor() {
        this.name = "cborEncoder";
        this.priority = -90;
    }
    match(value) {
        return typeof value == "object" && typeof value["toCBOR"] == "function";
    }
    encode(value) {
        return value.toCBOR();
    }
}
exports.ToCborEncoder = ToCborEncoder;
class CborSerializer {
    constructor() {
        this._encoders = new Set();
    }
    static withDefaultEncoders(stable = false) {
        const s = new this();
        s.addEncoder(new JsonDefaultCborEncoder(s, stable));
        s.addEncoder(new ToCborEncoder());
        return s;
    }
    removeEncoder(name) {
        // Has to make an extra call to values() to ensure it doesn't break on iteration.
        for (const encoder of this._encoders.values()) {
            if (encoder.name == name) {
                this._encoders.delete(encoder);
            }
        }
    }
    addEncoder(encoder) {
        this._encoders.add(encoder);
    }
    getEncoderFor(value) {
        let chosenEncoder = null;
        for (const encoder of this._encoders) {
            if (!chosenEncoder || encoder.priority > chosenEncoder.priority) {
                if (encoder.match(value)) {
                    chosenEncoder = encoder;
                }
            }
        }
        if (chosenEncoder === null) {
            throw new Error("Could not find an encoder for value.");
        }
        return chosenEncoder;
    }
    serializeValue(value) {
        return this.getEncoderFor(value).encode(value);
    }
    serialize(value) {
        return this.serializeValue(value);
    }
}
exports.CborSerializer = CborSerializer;
class SelfDescribeCborSerializer extends CborSerializer {
    serialize(value) {
        return cbor.raw(new Uint8Array([
            // Self describe CBOR.
            ...new Uint8Array([0xd9, 0xd9, 0xf7]),
            ...new Uint8Array(super.serializeValue(value)),
        ]));
    }
}
exports.SelfDescribeCborSerializer = SelfDescribeCborSerializer;
//# sourceMappingURL=serializer.js.map

/***/ }),

/***/ "./node_modules/simple-cbor/src/value.js":
/*!***********************************************!*\
  !*** ./node_modules/simple-cbor/src/value.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const MAX_U64_NUMBER = 0x20000000000000;
function _concat(a, ...args) {
    const newBuffer = new Uint8Array(a.byteLength + args.reduce((acc, b) => acc + b.byteLength, 0));
    newBuffer.set(new Uint8Array(a), 0);
    let i = a.byteLength;
    for (const b of args) {
        newBuffer.set(new Uint8Array(b), i);
        i += b.byteLength;
    }
    return newBuffer.buffer;
}
function _serializeValue(major, minor, value) {
    // Remove everything that's not an hexadecimal character. These are not
    // considered errors since the value was already validated and they might
    // be number decimals or sign.
    value = value.replace(/[^0-9a-fA-F]/g, "");
    // Create the buffer from the value with left padding with 0.
    const length = 2 ** (minor - 24 /* Int8 */);
    value = value.slice(-length * 2).padStart(length * 2, "0");
    const bytes = [(major << 5) + minor].concat(value.match(/../g).map((byte) => parseInt(byte, 16)));
    return new Uint8Array(bytes).buffer;
}
function _serializeNumber(major, value) {
    if (value < 24) {
        return new Uint8Array([(major << 5) + value]).buffer;
    }
    else {
        const minor = value <= 0xff
            ? 24 /* Int8 */
            : value <= 0xffff
                ? 25 /* Int16 */
                : value <= 0xffffffff
                    ? 26 /* Int32 */
                    : 27 /* Int64 */;
        return _serializeValue(major, minor, value.toString(16));
    }
}
function _serializeString(str) {
    const utf8 = [];
    for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) {
            utf8.push(charcode);
        }
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        }
        else {
            // Surrogate pair
            i++;
            charcode = ((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff);
            utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        }
    }
    return _concat(new Uint8Array(_serializeNumber(3 /* TextString */, str.length)), new Uint8Array(utf8));
}
/**
 * Tag a value.
 */
function tagged(tag, value) {
    if (tag == 0xd9d9f7) {
        return _concat(new Uint8Array([0xd9, 0xd9, 0xf7]), value);
    }
    if (tag < 24) {
        return _concat(new Uint8Array([(6 /* Tag */ << 5) + tag]), value);
    }
    else {
        const minor = tag <= 0xff
            ? 24 /* Int8 */
            : tag <= 0xffff
                ? 25 /* Int16 */
                : tag <= 0xffffffff
                    ? 26 /* Int32 */
                    : 27 /* Int64 */;
        const length = 2 ** (minor - 24 /* Int8 */);
        const value = tag
            .toString(16)
            .slice(-length * 2)
            .padStart(length * 2, "0");
        const bytes = [(6 /* Tag */ << 5) + minor].concat(value.match(/../g).map((byte) => parseInt(byte, 16)));
        return new Uint8Array(bytes).buffer;
    }
}
exports.tagged = tagged;
/**
 * Set the raw bytes contained by this value. This should only be used with another
 * CborValue, or if you are implementing extensions to CBOR.
 * @param bytes A buffer containing the value.
 */
function raw(bytes) {
    return new Uint8Array(bytes).buffer;
}
exports.raw = raw;
/**
 * Encode a number that is between [0, 23].
 * @param n
 */
function uSmall(n) {
    if (isNaN(n)) {
        throw new RangeError("Invalid number.");
    }
    n = Math.min(Math.max(0, n), 23); // Clamp it.
    const bytes = [(0 /* UnsignedInteger */ << 5) + n];
    return new Uint8Array(bytes).buffer;
}
exports.uSmall = uSmall;
function u8(u8, radix) {
    // Force u8 into a number, and validate it.
    u8 = parseInt("" + u8, radix);
    if (isNaN(u8)) {
        throw new RangeError("Invalid number.");
    }
    u8 = Math.min(Math.max(0, u8), 0xff); // Clamp it.
    u8 = u8.toString(16);
    return _serializeValue(0 /* UnsignedInteger */, 24 /* Int8 */, u8);
}
exports.u8 = u8;
function u16(u16, radix) {
    // Force u16 into a number, and validate it.
    u16 = parseInt("" + u16, radix);
    if (isNaN(u16)) {
        throw new RangeError("Invalid number.");
    }
    u16 = Math.min(Math.max(0, u16), 0xffff); // Clamp it.
    u16 = u16.toString(16);
    return _serializeValue(0 /* UnsignedInteger */, 25 /* Int16 */, u16);
}
exports.u16 = u16;
function u32(u32, radix) {
    // Force u32 into a number, and validate it.
    u32 = parseInt("" + u32, radix);
    if (isNaN(u32)) {
        throw new RangeError("Invalid number.");
    }
    u32 = Math.min(Math.max(0, u32), 0xffffffff); // Clamp it.
    u32 = u32.toString(16);
    return _serializeValue(0 /* UnsignedInteger */, 26 /* Int32 */, u32);
}
exports.u32 = u32;
function u64(u64, radix) {
    // Special consideration for numbers that might be larger than expected.
    if (typeof u64 == "string" && radix == 16) {
        // This is the only case where we guarantee we'll encode the number directly.
        // Validate it's all hexadecimal first.
        if (u64.match(/[^0-9a-fA-F]/)) {
            throw new RangeError("Invalid number.");
        }
        return _serializeValue(0 /* UnsignedInteger */, 27 /* Int64 */, u64);
    }
    // Force u64 into a number, and validate it.
    u64 = parseInt("" + u64, radix);
    if (isNaN(u64)) {
        throw new RangeError("Invalid number.");
    }
    u64 = Math.min(Math.max(0, u64), MAX_U64_NUMBER); // Clamp it to actual limit.
    u64 = u64.toString(16);
    return _serializeValue(0 /* UnsignedInteger */, 27 /* Int64 */, u64);
}
exports.u64 = u64;
/**
 * Encode a negative number that is between [-24, -1].
 */
function iSmall(n) {
    if (isNaN(n)) {
        throw new RangeError("Invalid number.");
    }
    if (n === 0) {
        return uSmall(0);
    }
    // Negative n, clamped to [1, 24], minus 1 (there's no negative 0).
    n = Math.min(Math.max(0, -n), 24) - 1;
    const bytes = [(1 /* SignedInteger */ << 5) + n];
    return new Uint8Array(bytes).buffer;
}
exports.iSmall = iSmall;
function i8(i8, radix) {
    // Force i8 into a number, and validate it.
    i8 = parseInt("" + i8, radix);
    if (isNaN(i8)) {
        throw new RangeError("Invalid number.");
    }
    // Negative n, clamped, minus 1 (there's no negative 0).
    i8 = Math.min(Math.max(0, -i8 - 1), 0xff);
    i8 = i8.toString(16);
    return _serializeValue(1 /* SignedInteger */, 24 /* Int8 */, i8);
}
exports.i8 = i8;
function i16(i16, radix) {
    // Force i16 into a number, and validate it.
    i16 = parseInt("" + i16, radix);
    if (isNaN(i16)) {
        throw new RangeError("Invalid number.");
    }
    // Negative n, clamped, minus 1 (there's no negative 0).
    i16 = Math.min(Math.max(0, -i16 - 1), 0xffff);
    i16 = i16.toString(16);
    return _serializeValue(1 /* SignedInteger */, 25 /* Int16 */, i16);
}
exports.i16 = i16;
function i32(i32, radix) {
    // Force i32 into a number, and validate it.
    i32 = parseInt("" + i32, radix);
    if (isNaN(i32)) {
        throw new RangeError("Invalid number.");
    }
    // Negative n, clamped, minus 1 (there's no negative 0).
    i32 = Math.min(Math.max(0, -i32 - 1), 0xffffffff);
    i32 = i32.toString(16);
    return _serializeValue(1 /* SignedInteger */, 26 /* Int32 */, i32);
}
exports.i32 = i32;
function i64(i64, radix) {
    // Special consideration for numbers that might be larger than expected.
    if (typeof i64 == "string" && radix == 16) {
        if (i64.startsWith("-")) {
            i64 = i64.slice(1);
        }
        else {
            // Clamp it.
            i64 = "0";
        }
        // This is the only case where we guarantee we'll encode the number directly.
        // Validate it's all hexadecimal first.
        if (i64.match(/[^0-9a-fA-F]/) || i64.length > 16) {
            throw new RangeError("Invalid number.");
        }
        // We need to do -1 to the number.
        let done = false;
        let newI64 = i64.split("").reduceRight((acc, x) => {
            if (done) {
                return x + acc;
            }
            let n = parseInt(x, 16) - 1;
            if (n >= 0) {
                done = true;
                return n.toString(16) + acc;
            }
            else {
                return "f" + acc;
            }
        }, "");
        if (!done) {
            // This number was 0.
            return u64(0);
        }
        return _serializeValue(1 /* SignedInteger */, 27 /* Int64 */, newI64);
    }
    // Force i64 into a number, and validate it.
    i64 = parseInt("" + i64, radix);
    if (isNaN(i64)) {
        throw new RangeError("Invalid number.");
    }
    i64 = Math.min(Math.max(0, -i64 - 1), 0x20000000000000); // Clamp it to actual.
    i64 = i64.toString(16);
    return _serializeValue(1 /* SignedInteger */, 27 /* Int64 */, i64);
}
exports.i64 = i64;
/**
 * Encode a number using the smallest amount of bytes, by calling the methods
 * above. e.g. If the number fits in a u8, it will use that.
 */
function number(n) {
    if (n >= 0) {
        if (n < 24) {
            return uSmall(n);
        }
        else if (n <= 0xff) {
            return u8(n);
        }
        else if (n <= 0xffff) {
            return u16(n);
        }
        else if (n <= 0xffffffff) {
            return u32(n);
        }
        else {
            return u64(n);
        }
    }
    else {
        if (n >= -24) {
            return iSmall(n);
        }
        else if (n >= -0xff) {
            return i8(n);
        }
        else if (n >= -0xffff) {
            return i16(n);
        }
        else if (n >= -0xffffffff) {
            return i32(n);
        }
        else {
            return i64(n);
        }
    }
}
exports.number = number;
/**
 * Encode a byte array. This is different than the `raw()` method.
 */
function bytes(bytes) {
    return _concat(_serializeNumber(2 /* ByteString */, bytes.byteLength), bytes);
}
exports.bytes = bytes;
/**
 * Encode a JavaScript string.
 */
function string(str) {
    return _serializeString(str);
}
exports.string = string;
/**
 * Encode an array of cbor values.
 */
function array(items) {
    return _concat(_serializeNumber(4 /* Array */, items.length), ...items);
}
exports.array = array;
/**
 * Encode a map of key-value pairs. The keys are string, and the values are CBOR
 * encoded.
 */
function map(items, stable = false) {
    if (!(items instanceof Map)) {
        items = new Map(Object.entries(items));
    }
    let entries = Array.from(items.entries());
    if (stable) {
        entries = entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    }
    return _concat(_serializeNumber(5 /* Map */, items.size), ...entries.map(([k, v]) => _concat(_serializeString(k), v)));
}
exports.map = map;
/**
 * Encode a single (32 bits) precision floating point number.
 */
function singleFloat(f) {
    const single = new Float32Array([f]);
    return _concat(new Uint8Array([(7 /* SimpleValue */ << 5) + 26]), new Uint8Array(single.buffer));
}
exports.singleFloat = singleFloat;
/**
 * Encode a double (64 bits) precision floating point number.
 */
function doubleFloat(f) {
    const single = new Float64Array([f]);
    return _concat(new Uint8Array([(7 /* SimpleValue */ << 5) + 27]), new Uint8Array(single.buffer));
}
exports.doubleFloat = doubleFloat;
function bool(v) {
    return v ? true_() : false_();
}
exports.bool = bool;
/**
 * Encode the boolean true.
 */
function true_() {
    return raw(new Uint8Array([(7 /* SimpleValue */ << 5) + 21]));
}
exports.true_ = true_;
/**
 * Encode the boolean false.
 */
function false_() {
    return raw(new Uint8Array([(7 /* SimpleValue */ << 5) + 20]));
}
exports.false_ = false_;
/**
 * Encode the constant null.
 */
function null_() {
    return raw(new Uint8Array([(7 /* SimpleValue */ << 5) + 22]));
}
exports.null_ = null_;
/**
 * Encode the constant undefined.
 */
function undefined_() {
    return raw(new Uint8Array([(7 /* SimpleValue */ << 5) + 23]));
}
exports.undefined_ = undefined_;
//# sourceMappingURL=value.js.map

/***/ }),

/***/ "./src/sw/http_request.ts":
/*!********************************!*\
  !*** ./src/sw/http_request.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "handleRequest": () => (/* binding */ handleRequest)
/* harmony export */ });
/* harmony import */ var _dfinity_agent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/agent */ "./node_modules/@dfinity/agent/lib/esm/index.js");
/* harmony import */ var _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dfinity/principal */ "./node_modules/@dfinity/principal/lib/esm/index.js");
/* harmony import */ var _validation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./validation */ "./src/sw/validation.ts");
/* harmony import */ var base64_arraybuffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! base64-arraybuffer */ "./node_modules/base64-arraybuffer/dist/base64-arraybuffer.es5.js");
/* harmony import */ var pako__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! pako */ "./node_modules/pako/dist/pako.esm.mjs");
/* harmony import */ var _http_interface_canister_http_interface__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../http-interface/canister_http_interface */ "./src/http-interface/canister_http_interface.js");
/* harmony import */ var _streaming__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./streaming */ "./src/sw/streaming.ts");
/**
 * Implement the HttpRequest to Canisters Proposal.
 *
 */







const hostnameCanisterIdMap = {
    'identity.ic0.app': ['rdmx6-jaaaa-aaaaa-aaadq-cai', 'ic0.app'],
    'nns.ic0.app': ['qoctq-giaaa-aaaaa-aaaea-cai', 'ic0.app'],
    'dscvr.one': ['h5aet-waaaa-aaaab-qaamq-cai', 'ic0.app'],
    'personhood.ic0.app': ['g3wsl-eqaaa-aaaan-aaaaa-cai', 'ic0.app'],
};
const shouldFetchRootKey = ['1', 'true'].includes("1");
const swLocation = new URL(self.location.toString());
const [, swDomains] = (() => {
    const maybeSplit = splitHostnameForCanisterId(swLocation.hostname);
    if (maybeSplit) {
        return maybeSplit;
    }
    else {
        return [null, swLocation.hostname];
    }
})();
/**
 * Split a hostname up-to the first valid canister ID from the right.
 * @param hostname The hostname to analyze.
 * @returns A canister ID followed by all subdomains that are after it, or null if no
 *     canister ID were found.
 */
function splitHostnameForCanisterId(hostname) {
    const maybeFixed = hostnameCanisterIdMap[hostname];
    if (maybeFixed) {
        return [_dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.fromText(maybeFixed[0]), maybeFixed[1]];
    }
    const subdomains = hostname.split('.').reverse();
    const topdomains = [];
    for (const domain of subdomains) {
        try {
            const principal = _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.fromText(domain);
            return [principal, topdomains.reverse().join('.')];
        }
        catch (_) {
            topdomains.push(domain);
        }
    }
    return null;
}
/**
 * Try to resolve the Canister ID to contact in the domain name.
 * @param hostname The domain name to look up.
 * @returns A Canister ID or null if none were found.
 */
function maybeResolveCanisterIdFromHostName(hostname) {
    // Try to resolve from the right to the left.
    const maybeCanisterId = splitHostnameForCanisterId(hostname);
    if (maybeCanisterId && swDomains === maybeCanisterId[1]) {
        return maybeCanisterId[0];
    }
    return null;
}
/**
 * Try to resolve the Canister ID to contact in the search params.
 * @param searchParams The URL Search params.
 * @param isLocal Whether to resolve headers as if we were running locally.
 * @returns A Canister ID or null if none were found.
 */
function maybeResolveCanisterIdFromSearchParam(searchParams, isLocal) {
    // Skip this if we're not on localhost.
    if (!isLocal) {
        return null;
    }
    const maybeCanisterId = searchParams.get('canisterId');
    if (maybeCanisterId) {
        try {
            return _dfinity_principal__WEBPACK_IMPORTED_MODULE_1__.Principal.fromText(maybeCanisterId);
        }
        catch (e) {
            // Do nothing.
        }
    }
    return null;
}
/**
 * Try to resolve the Canister ID to contact from a URL string.
 * @param urlString The URL in string format (normally from the request).
 * @param isLocal Whether to resolve headers as if we were running locally.
 * @returns A Canister ID or null if none were found.
 */
function resolveCanisterIdFromUrl(urlString, isLocal) {
    try {
        const url = new URL(urlString);
        return (maybeResolveCanisterIdFromHostName(url.hostname) ||
            maybeResolveCanisterIdFromSearchParam(url.searchParams, isLocal));
    }
    catch (_) {
        return null;
    }
}
/**
 * Try to resolve the Canister ID to contact from headers.
 * @param headers Headers from the HttpRequest.
 * @param isLocal Whether to resolve headers as if we were running locally.
 * @returns A Canister ID or null if none were found.
 */
function maybeResolveCanisterIdFromHeaders(headers, isLocal) {
    const maybeHostHeader = headers.get('host');
    if (maybeHostHeader) {
        // Remove the port.
        const maybeCanisterId = maybeResolveCanisterIdFromHostName(maybeHostHeader.replace(/:\d+$/, ''));
        if (maybeCanisterId) {
            return maybeCanisterId;
        }
    }
    if (isLocal) {
        const maybeRefererHeader = headers.get('referer');
        if (maybeRefererHeader) {
            const maybeCanisterId = resolveCanisterIdFromUrl(maybeRefererHeader, isLocal);
            if (maybeCanisterId) {
                return maybeCanisterId;
            }
        }
    }
    return null;
}
function maybeResolveCanisterIdFromHttpRequest(request, isLocal) {
    return ((isLocal && resolveCanisterIdFromUrl(request.referrer, isLocal)) ||
        maybeResolveCanisterIdFromHeaders(request.headers, isLocal) ||
        resolveCanisterIdFromUrl(request.url, isLocal));
}
/**
 * Decode a body (ie. deflate or gunzip it) based on its content-encoding.
 * @param body The body to decode.
 * @param encoding Its content-encoding associated header.
 */
function decodeBody(body, encoding) {
    switch (encoding) {
        case 'identity':
        case '':
            return body;
        case 'gzip':
            return pako__WEBPACK_IMPORTED_MODULE_4__.ungzip(body);
        case 'deflate':
            return pako__WEBPACK_IMPORTED_MODULE_4__.inflate(body);
        default:
            throw new Error(`Unsupported encoding: "${encoding}"`);
    }
}
async function createAgentAndActor(url, canisterId, fetchRootKey) {
    const replicaUrl = new URL(url);
    const agent = new _dfinity_agent__WEBPACK_IMPORTED_MODULE_0__.HttpAgent({ host: replicaUrl.toString() });
    if (fetchRootKey) {
        await agent.fetchRootKey();
    }
    const actor = _dfinity_agent__WEBPACK_IMPORTED_MODULE_0__.Actor.createActor(_http_interface_canister_http_interface__WEBPACK_IMPORTED_MODULE_5__.idlFactory, {
        agent,
        canisterId: canisterId,
    });
    return [agent, actor];
}
/**
 * Box a request, send it to the canister, and handle its response, creating a Response
 * object.
 * @param request The request received from the browser.
 * @returns The response to send to the browser.
 * @throws If an internal error happens.
 */
async function handleRequest(request) {
    const url = new URL(request.url);
    /**
     * We forward all requests to /api/ to the replica, as is.
     */
    if (url.pathname.startsWith('/api/')) {
        const response = await fetch(request);
        // force the content-type to be cbor as /api/ is exclusively used for canister calls
        const sanitizedHeaders = new Headers(response.headers);
        sanitizedHeaders.set('X-Content-Type-Options', 'nosniff');
        sanitizedHeaders.set('Content-Type', 'application/cbor');
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: sanitizedHeaders,
        });
    }
    /**
     * We refuse any request to /_/*
     */
    if (url.pathname.startsWith('/_/')) {
        return new Response(null, { status: 404 });
    }
    /**
     * We try to do an HTTP Request query.
     */
    const isLocal = swDomains === 'localhost';
    const maybeCanisterId = maybeResolveCanisterIdFromHttpRequest(request, isLocal);
    if (maybeCanisterId) {
        try {
            const origin = splitHostnameForCanisterId(url.hostname);
            const [agent, actor] = await createAgentAndActor(origin ? url.protocol + '//' + origin[1] : url.origin, maybeCanisterId, shouldFetchRootKey);
            const requestHeaders = [];
            request.headers.forEach((value, key) => requestHeaders.push([key, value]));
            // If the accept encoding isn't given, add it because we want to save bandwidth.
            if (!request.headers.has('Accept-Encoding')) {
                requestHeaders.push(['Accept-Encoding', 'gzip, deflate, identity']);
            }
            const httpRequest = {
                method: request.method,
                url: url.pathname + url.search,
                headers: requestHeaders,
                body: [...new Uint8Array(await request.arrayBuffer())],
            };
            let upgradeCall = false;
            let httpResponse = (await actor.http_request(httpRequest));
            if (httpResponse.upgrade.length === 1 && httpResponse.upgrade[0]) {
                // repeat the request as an update call
                httpResponse = (await actor.http_request_update(httpRequest));
                upgradeCall = true;
            }
            const headers = new Headers();
            let certificate;
            let tree;
            let encoding = '';
            for (const [key, value] of httpResponse.headers) {
                switch (key.trim().toLowerCase()) {
                    case 'ic-certificate':
                        {
                            const fields = value.split(/,/);
                            for (const f of fields) {
                                const [, name, b64Value] = [...f.match(/^(.*)=:(.*):$/)].map((x) => x.trim());
                                const value = base64_arraybuffer__WEBPACK_IMPORTED_MODULE_3__.decode(b64Value);
                                if (name === 'certificate') {
                                    certificate = value;
                                }
                                else if (name === 'tree') {
                                    tree = value;
                                }
                            }
                        }
                        continue;
                    case 'content-encoding':
                        encoding = value.trim();
                        break;
                }
                headers.append(key, value);
            }
            // if we do streaming, body contains the first chunk
            let buffer = httpResponse.body;
            if (httpResponse.streaming_strategy.length !== 0) {
                buffer = buffer.concat(await (0,_streaming__WEBPACK_IMPORTED_MODULE_6__.streamContent)(agent, maybeCanisterId, httpResponse.streaming_strategy[0]));
            }
            const body = new Uint8Array(buffer);
            const identity = decodeBody(body, encoding);
            // when an update call is used, the response certification is checked by
            // agent-js
            let bodyValid = upgradeCall;
            if (!upgradeCall && certificate && tree) {
                // Try to validate the body as is.
                bodyValid = await (0,_validation__WEBPACK_IMPORTED_MODULE_2__.validateBody)(maybeCanisterId, url.pathname, body.buffer, certificate, tree, agent, shouldFetchRootKey);
                if (!bodyValid) {
                    // If that didn't work, try to validate its identity version. This is for
                    // backward compatibility.
                    bodyValid = await (0,_validation__WEBPACK_IMPORTED_MODULE_2__.validateBody)(maybeCanisterId, url.pathname, identity.buffer, certificate, tree, agent, shouldFetchRootKey);
                }
            }
            if (bodyValid) {
                return new Response(identity.buffer, {
                    status: httpResponse.status_code,
                    headers,
                });
            }
            else {
                console.error('BODY DOES NOT PASS VERIFICATION');
                return new Response('Body does not pass verification', { status: 500 });
            }
        }
        catch (e) {
            console.error('Failed to fetch response:', e);
            return new Response(`Failed to fetch response: ${String(e)}`, {
                status: 500,
            });
        }
    }
    // Last check. IF this is not part of the same domain, then we simply let it load as is.
    // The same domain will always load using our service worker, and not the same domain
    // would load by reference. If you want security for your users at that point you
    // should use SRI to make sure the resource matches.
    if (!url.hostname.endsWith(swDomains) ||
        url.hostname.endsWith(`raw.${swDomains}`)) {
        console.log('Direct call ...');
        // todo: Do we need to check for headers and certify the content here?
        return await fetch(request);
    }
    console.error(`URL ${JSON.stringify(url.toString())} did not resolve to a canister ID.`);
    return new Response('Could not find the canister ID.', { status: 404 });
}


/***/ }),

/***/ "./src/sw/streaming.ts":
/*!*****************************!*\
  !*** ./src/sw/streaming.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "streamContent": () => (/* binding */ streamContent)
/* harmony export */ });
/* harmony import */ var _http_interface_canister_http_interface__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../http-interface/canister_http_interface */ "./src/http-interface/canister_http_interface.js");
/* harmony import */ var _dfinity_candid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dfinity/candid */ "./node_modules/@dfinity/candid/lib/esm/index.js");


const MAX_CALLBACKS = 1000;
async function streamContent(agent, canisterId, streamingStrategy) {
    let buffer = [];
    let tokenOpt = [streamingStrategy.Callback.token];
    const [, callBackFunc] = streamingStrategy.Callback.callback;
    let currentCallback = 1;
    while (tokenOpt.length !== 0) {
        if (currentCallback > MAX_CALLBACKS) {
            throw new Error('Exceeded streaming callback limit');
        }
        const callbackResponse = await queryNextChunk(tokenOpt[0], agent, canisterId, callBackFunc);
        switch (callbackResponse.status) {
            case "replied" /* Replied */: {
                const callbackData = _dfinity_candid__WEBPACK_IMPORTED_MODULE_1__.IDL.decode([_http_interface_canister_http_interface__WEBPACK_IMPORTED_MODULE_0__.streamingCallbackHttpResponseType], callbackResponse.reply.arg)[0];
                if (isStreamingCallbackResponse(callbackData)) {
                    buffer = buffer.concat(callbackData.body);
                    tokenOpt = callbackData.token;
                }
                else {
                    throw new Error('Unexpected callback response: ' + callbackData);
                }
                break;
            }
            case "rejected" /* Rejected */: {
                throw new Error('Streaming callback error: ' + callbackResponse);
            }
        }
        currentCallback += 1;
    }
    return buffer;
}
function queryNextChunk(token, agent, canisterId, callBackFunc) {
    const tokenType = token.type();
    // unbox primitive values
    const tokenValue = typeof token.valueOf === 'function' ? token.valueOf() : token;
    const callbackArg = _dfinity_candid__WEBPACK_IMPORTED_MODULE_1__.IDL.encode([tokenType], [tokenValue]);
    return agent.query(canisterId, {
        methodName: callBackFunc,
        arg: callbackArg,
    });
}
function isStreamingCallbackResponse(response) {
    return (typeof response === 'object' &&
        response !== null &&
        'body' in response &&
        'token' in response);
}


/***/ }),

/***/ "./src/sw/validation.ts":
/*!******************************!*\
  !*** ./src/sw/validation.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "validateBody": () => (/* binding */ validateBody)
/* harmony export */ });
/* harmony import */ var _dfinity_agent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/agent */ "./node_modules/@dfinity/agent/lib/esm/index.js");
/* harmony import */ var _dfinity_candid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dfinity/candid */ "./node_modules/@dfinity/candid/lib/esm/index.js");
/* harmony import */ var _dfinity_candid_lib_cjs_utils_buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dfinity/candid/lib/cjs/utils/buffer */ "./node_modules/@dfinity/candid/lib/cjs/utils/buffer.js");



const MAX_CERT_TIME_OFFSET_IN_MS = 300000; // 5 min
/**
 * Validate whether a body is properly certified.
 * @param canisterId The canister ID that provided the resource.
 * @param path The path of the resource requested to be validated (including the prefix `/`).
 * @param body An asset body, as it appears on the HTTP response (not decoded)
 * @param certificate The certificate to validate the .
 * @param tree The merkle tree returned by the canister.
 * @param agent A JavaScript agent that can validate certificates.
 * @param shouldFetchRootKey Whether should fetch the root key if it isn't available.
 * @returns True if the body is valid.
 */
async function validateBody(canisterId, path, body, certificate, tree, agent, shouldFetchRootKey = false) {
    const cert = new _dfinity_agent__WEBPACK_IMPORTED_MODULE_0__.Certificate({ certificate: new Uint8Array(certificate) }, agent);
    // If we're running locally, update the key manually.
    if (shouldFetchRootKey) {
        await agent.fetchRootKey();
    }
    // Make sure the certificate is valid.
    if (!(await cert.verify())) {
        return false;
    }
    // check certificate time
    if (!validateCertificateTime(cert)) {
        return false;
    }
    const hashTree = _dfinity_agent__WEBPACK_IMPORTED_MODULE_0__.Cbor.decode(new Uint8Array(tree));
    const reconstructed = await (0,_dfinity_agent__WEBPACK_IMPORTED_MODULE_0__.reconstruct)(hashTree);
    const witness = cert.lookup([
        'canister',
        canisterId.toUint8Array(),
        'certified_data',
    ]);
    if (!witness) {
        throw new Error('Could not find certified data for this canister in the certificate.');
    }
    // First validate that the Tree is as good as the certification.
    if (!equal(witness, reconstructed)) {
        console.error('Witness != Tree passed in ic-certification');
        return false;
    }
    // Next, calculate the SHA of the content.
    const sha = await crypto.subtle.digest('SHA-256', body);
    let treeSha = (0,_dfinity_agent__WEBPACK_IMPORTED_MODULE_0__.lookup_path)(['http_assets', path], hashTree);
    if (!treeSha) {
        // Allow fallback to `index.html`.
        treeSha = (0,_dfinity_agent__WEBPACK_IMPORTED_MODULE_0__.lookup_path)(['http_assets', '/index.html'], hashTree);
    }
    if (!treeSha) {
        // The tree returned in the certification header is wrong. Return false.
        // We don't throw here, just invalidate the request.
        console.error(`Invalid Tree in the header. Does not contain path ${JSON.stringify(path)}`);
        return false;
    }
    return !!treeSha && equal(sha, treeSha);
}
function validateCertificateTime(cert) {
    const decodedTime = (0,_dfinity_candid__WEBPACK_IMPORTED_MODULE_1__.lebDecode)(new _dfinity_candid_lib_cjs_utils_buffer__WEBPACK_IMPORTED_MODULE_2__.PipeArrayBuffer(cert.lookup(['time'])));
    const certTime = Number(decodedTime / BigInt(1000000)); // convert from nanos to millis
    const now = Date.now();
    if (certTime - MAX_CERT_TIME_OFFSET_IN_MS > now) {
        console.error(`Invalid certificate: time ${certTime} is too far in the future (current time: ${now})`);
        return false;
    }
    if (certTime + MAX_CERT_TIME_OFFSET_IN_MS < now) {
        console.error(`Invalid certificate: time ${certTime} is too far in the past (current time: ${now})`);
        return false;
    }
    return true;
}
function equal(buf1, buf2) {
    if (buf1.byteLength !== buf2.byteLength) {
        return false;
    }
    const a1 = new Uint8Array(buf1);
    const a2 = new Uint8Array(buf2);
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] != a2[i]) {
            return false;
        }
    }
    return true;
}


/***/ }),

/***/ "./src/http-interface/canister_http_interface.js":
/*!*******************************************************!*\
  !*** ./src/http-interface/canister_http_interface.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "idlFactory": () => (/* binding */ idlFactory),
/* harmony export */   "init": () => (/* binding */ init),
/* harmony export */   "streamingCallbackHttpResponseType": () => (/* binding */ streamingCallbackHttpResponseType)
/* harmony export */ });
/* harmony import */ var _dfinity_candid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dfinity/candid */ "./node_modules/@dfinity/candid/lib/esm/index.js");


const tokenType = _dfinity_candid__WEBPACK_IMPORTED_MODULE_0__.IDL.Unknown;
const streamingCallbackHttpResponseType = _dfinity_candid__WEBPACK_IMPORTED_MODULE_0__.IDL.Record({
  token: _dfinity_candid__WEBPACK_IMPORTED_MODULE_0__.IDL.Opt(tokenType),
  body: _dfinity_candid__WEBPACK_IMPORTED_MODULE_0__.IDL.Vec(_dfinity_candid__WEBPACK_IMPORTED_MODULE_0__.IDL.Nat8),
});
const idlFactory = ({ IDL }) => {
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
  });
  const StreamingStrategy = IDL.Variant({
    Callback: IDL.Record({
      token: tokenType,
      callback: IDL.Func(
        [tokenType],
        [IDL.Opt(streamingCallbackHttpResponseType)],
        ['query']
      ),
    }),
  });
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
    streaming_strategy: IDL.Opt(StreamingStrategy),
    status_code: IDL.Nat16,
    upgrade: IDL.Opt(IDL.Bool),
  });
  return IDL.Service({
    http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
    http_request_update: IDL.Func([HttpRequest], [HttpResponse]),
  });
};
const init = ({ IDL }) => {
  return [];
};


/***/ }),

/***/ "./node_modules/pako/dist/pako.esm.mjs":
/*!*********************************************!*\
  !*** ./node_modules/pako/dist/pako.esm.mjs ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Deflate": () => (/* binding */ Deflate_1),
/* harmony export */   "Inflate": () => (/* binding */ Inflate_1),
/* harmony export */   "constants": () => (/* binding */ constants_1),
/* harmony export */   "default": () => (/* binding */ pako),
/* harmony export */   "deflate": () => (/* binding */ deflate_1),
/* harmony export */   "deflateRaw": () => (/* binding */ deflateRaw_1),
/* harmony export */   "gzip": () => (/* binding */ gzip_1),
/* harmony export */   "inflate": () => (/* binding */ inflate_1),
/* harmony export */   "inflateRaw": () => (/* binding */ inflateRaw_1),
/* harmony export */   "ungzip": () => (/* binding */ ungzip_1)
/* harmony export */ });

/*! pako 2.0.4 https://github.com/nodeca/pako @license (MIT AND Zlib) */
// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

/* eslint-disable space-unary-ops */

/* Public constants ==========================================================*/
/* ===========================================================================*/


//const Z_FILTERED          = 1;
//const Z_HUFFMAN_ONLY      = 2;
//const Z_RLE               = 3;
const Z_FIXED$1               = 4;
//const Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
const Z_BINARY              = 0;
const Z_TEXT                = 1;
//const Z_ASCII             = 1; // = Z_TEXT
const Z_UNKNOWN$1             = 2;

/*============================================================================*/


function zero$1(buf) { let len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

const STORED_BLOCK = 0;
const STATIC_TREES = 1;
const DYN_TREES    = 2;
/* The three kinds of block type */

const MIN_MATCH$1    = 3;
const MAX_MATCH$1    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

const LENGTH_CODES$1  = 29;
/* number of length codes, not counting the special END_BLOCK code */

const LITERALS$1      = 256;
/* number of literal bytes 0..255 */

const L_CODES$1       = LITERALS$1 + 1 + LENGTH_CODES$1;
/* number of Literal or Length codes, including the END_BLOCK code */

const D_CODES$1       = 30;
/* number of distance codes */

const BL_CODES$1      = 19;
/* number of codes used to transfer the bit lengths */

const HEAP_SIZE$1     = 2 * L_CODES$1 + 1;
/* maximum heap size */

const MAX_BITS$1      = 15;
/* All codes must not exceed MAX_BITS bits */

const Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

const MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

const END_BLOCK   = 256;
/* end of block literal code */

const REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

const REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

const REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
const extra_lbits =   /* extra bits for each length code */
  new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]);

const extra_dbits =   /* extra bits for each distance code */
  new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]);

const extra_blbits =  /* extra bits for each bit length code */
  new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]);

const bl_order =
  new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

const DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
const static_ltree  = new Array((L_CODES$1 + 2) * 2);
zero$1(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

const static_dtree  = new Array(D_CODES$1 * 2);
zero$1(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

const _dist_code    = new Array(DIST_CODE_LEN);
zero$1(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

const _length_code  = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
zero$1(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

const base_length   = new Array(LENGTH_CODES$1);
zero$1(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

const base_dist     = new Array(D_CODES$1);
zero$1(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


let static_l_desc;
let static_d_desc;
let static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



const d_code = (dist) => {

  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
const put_short = (s, w) => {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
};


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
const send_bits = (s, value, length) => {

  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
};


const send_code = (s, c, tree) => {

  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
};


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
const bi_reverse = (code, len) => {

  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
const bi_flush = (s) => {

  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
};


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
const gen_bitlen = (s, desc) =>
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  const tree            = desc.dyn_tree;
  const max_code        = desc.max_code;
  const stree           = desc.stat_desc.static_tree;
  const has_stree       = desc.stat_desc.has_stree;
  const extra           = desc.stat_desc.extra_bits;
  const base            = desc.stat_desc.extra_base;
  const max_length      = desc.stat_desc.max_length;
  let h;              /* heap index */
  let n, m;           /* iterate over the tree elements */
  let bits;           /* bit length */
  let xbits;          /* extra bits */
  let f;              /* frequency */
  let overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
};


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
const gen_codes = (tree, max_code, bl_count) =>
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  const next_code = new Array(MAX_BITS$1 + 1); /* next code value for each bit length */
  let code = 0;              /* running code value */
  let bits;                  /* bit index */
  let n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS$1; bits++) {
    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    let len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
};


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
const tr_static_init = () => {

  let n;        /* iterates over tree elements */
  let bits;     /* bit counter */
  let length;   /* length value */
  let code;     /* code value */
  let dist;     /* distance index */
  const bl_count = new Array(MAX_BITS$1 + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES$1; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES$1 + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES$1; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES$1, MAX_BITS$1);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES$1, MAX_BL_BITS);

  //static_init_done = true;
};


/* ===========================================================================
 * Initialize a new block.
 */
const init_block = (s) => {

  let n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES$1;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES$1;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES$1; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
};


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
const bi_windup = (s) =>
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
};

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
const copy_block = (s, buf, len, header) =>
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  s.pending_buf.set(s.window.subarray(buf, buf + len), s.pending);
  s.pending += len;
};

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
const smaller = (tree, n, m, depth) => {

  const _n2 = n * 2;
  const _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
};

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
const pqdownheap = (s, tree, k) =>
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  const v = s.heap[k];
  let j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
};


// inlined manually
// const SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
const compress_block = (s, ltree, dtree) =>
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  let dist;           /* distance of matched string */
  let lc;             /* match length or unmatched char (if dist == 0) */
  let lx = 0;         /* running index in l_buf */
  let code;           /* the code to send */
  let extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS$1 + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
};


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
const build_tree = (s, desc) =>
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  const tree     = desc.dyn_tree;
  const stree    = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems    = desc.stat_desc.elems;
  let n, m;          /* iterate over heap elements */
  let max_code = -1; /* largest code with non zero frequency */
  let node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE$1;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
};


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
const scan_tree = (s, tree, max_code) =>
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  let n;                     /* iterates over all tree elements */
  let prevlen = -1;          /* last emitted length */
  let curlen;                /* length of current code */

  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  let count = 0;             /* repeat count of the current code */
  let max_count = 7;         /* max repeat count */
  let min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
const send_tree = (s, tree, max_code) =>
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  let n;                     /* iterates over all tree elements */
  let prevlen = -1;          /* last emitted length */
  let curlen;                /* length of current code */

  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  let count = 0;             /* repeat count of the current code */
  let max_count = 7;         /* max repeat count */
  let min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
const build_bl_tree = (s) => {

  let max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
};


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
const send_all_trees = (s, lcodes, dcodes, blcodes) =>
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  let rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
};


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
const detect_data_type = (s) => {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  let black_mask = 0xf3ffc07f;
  let n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS$1; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
};


let static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
const _tr_init$1 = (s) =>
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
};


/* ===========================================================================
 * Send a stored block
 */
const _tr_stored_block$1 = (s, buf, stored_len, last) =>
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
};


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
const _tr_align$1 = (s) => {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
};


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
const _tr_flush_block$1 = (s, buf, stored_len, last) =>
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  let opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  let max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN$1) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block$1(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
};

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
const _tr_tally$1 = (s, dist, lc) =>
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //let out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize - 1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
};

var _tr_init_1  = _tr_init$1;
var _tr_stored_block_1 = _tr_stored_block$1;
var _tr_flush_block_1  = _tr_flush_block$1;
var _tr_tally_1 = _tr_tally$1;
var _tr_align_1 = _tr_align$1;

var trees = {
	_tr_init: _tr_init_1,
	_tr_stored_block: _tr_stored_block_1,
	_tr_flush_block: _tr_flush_block_1,
	_tr_tally: _tr_tally_1,
	_tr_align: _tr_align_1
};

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const adler32 = (adler, buf, len, pos) => {
  let s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
};


var adler32_1 = adler32;

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
const makeTable = () => {
  let c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
};

// Create table on load. Just 255 signed longs. Not a problem.
const crcTable = new Uint32Array(makeTable());


const crc32 = (crc, buf, len, pos) => {
  const t = crcTable;
  const end = pos + len;

  crc ^= -1;

  for (let i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
};


var crc32_1 = crc32;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var messages = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var constants$2 = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  Z_MEM_ERROR:       -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;




/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH: Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH: Z_FULL_FLUSH$1, Z_FINISH: Z_FINISH$3, Z_BLOCK: Z_BLOCK$1,
  Z_OK: Z_OK$3, Z_STREAM_END: Z_STREAM_END$3, Z_STREAM_ERROR: Z_STREAM_ERROR$2, Z_DATA_ERROR: Z_DATA_ERROR$2, Z_BUF_ERROR: Z_BUF_ERROR$1,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
  Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
  Z_UNKNOWN,
  Z_DEFLATED: Z_DEFLATED$2
} = constants$2;

/*============================================================================*/


const MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
const MAX_WBITS$1 = 15;
/* 32K LZ77 window */
const DEF_MEM_LEVEL = 8;


const LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
const LITERALS      = 256;
/* number of literal bytes 0..255 */
const L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
const D_CODES       = 30;
/* number of distance codes */
const BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
const HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
const MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

const MIN_MATCH = 3;
const MAX_MATCH = 258;
const MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

const PRESET_DICT = 0x20;

const INIT_STATE = 42;
const EXTRA_STATE = 69;
const NAME_STATE = 73;
const COMMENT_STATE = 91;
const HCRC_STATE = 103;
const BUSY_STATE = 113;
const FINISH_STATE = 666;

const BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
const BS_BLOCK_DONE     = 2; /* block flush performed */
const BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
const BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

const OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

const err = (strm, errorCode) => {
  strm.msg = messages[errorCode];
  return errorCode;
};

const rank = (f) => {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
};

const zero = (buf) => {
  let len = buf.length; while (--len >= 0) { buf[len] = 0; }
};


/* eslint-disable new-cap */
let HASH_ZLIB = (s, prev, data) => ((prev << s.hash_shift) ^ data) & s.hash_mask;
// This hash causes less collisions, https://github.com/nodeca/pako/issues/135
// But breaks binary compatibility
//let HASH_FAST = (s, prev, data) => ((prev << 8) + (prev >> 8) + (data << 4)) & s.hash_mask;
let HASH = HASH_ZLIB;

/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
const flush_pending = (strm) => {
  const s = strm.state;

  //_tr_flush_bits(s);
  let len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
};


const flush_block_only = (s, last) => {
  _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
};


const put_byte = (s, b) => {
  s.pending_buf[s.pending++] = b;
};


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
const putShortMSB = (s, b) => {

  //  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
};


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
const read_buf = (strm, buf, start, size) => {

  let len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
};


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
const longest_match = (s, cur_match) => {

  let chain_length = s.max_chain_length;      /* max hash chain length */
  let scan = s.strstart; /* current string */
  let match;                       /* matched string */
  let len;                           /* length of current match */
  let best_len = s.prev_length;              /* best match length so far */
  let nice_match = s.nice_match;             /* stop if match long enough */
  const limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  const _win = s.window; // shortcut

  const wmask = s.w_mask;
  const prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  const strend = s.strstart + MAX_MATCH;
  let scan_end1  = _win[scan + best_len - 1];
  let scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
};


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
const fill_window = (s) => {

  const _w_size = s.w_size;
  let p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      s.window.set(s.window.subarray(_w_size, _w_size + _w_size), 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;

      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;

      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    const curr = s.strstart + s.lookahead;
//    let init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
};

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
const deflate_stored = (s, flush) => {

  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  let max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    const max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
};

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
const deflate_fast = (s, flush) => {

  let hash_head;        /* head of the hash chain */
  let bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
const deflate_slow = (s, flush) => {

  let hash_head;          /* head of hash chain */
  let bflush;              /* set if current block must be flushed */

  let max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
};


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
const deflate_rle = (s, flush) => {

  let bflush;            /* set if current block must be flushed */
  let prev;              /* byte at distance one to match */
  let scan, strend;      /* scan goes up to strend for length of run */

  const _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
const deflate_huff = (s, flush) => {

  let bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = _tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {

  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

const configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
const lm_init = (s) => {

  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
};


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED$2; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new Uint16Array(HEAP_SIZE * 2);
  this.dyn_dtree  = new Uint16Array((2 * D_CODES + 1) * 2);
  this.bl_tree    = new Uint16Array((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new Uint16Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new Uint16Array(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new Uint16Array(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


const deflateResetKeep = (strm) => {

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR$2);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  const s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH$2;
  _tr_init(s);
  return Z_OK$3;
};


const deflateReset = (strm) => {

  const ret = deflateResetKeep(strm);
  if (ret === Z_OK$3) {
    lm_init(strm.state);
  }
  return ret;
};


const deflateSetHeader = (strm, head) => {

  if (!strm || !strm.state) { return Z_STREAM_ERROR$2; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR$2; }
  strm.state.gzhead = head;
  return Z_OK$3;
};


const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {

  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR$2;
  }
  let wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION$1) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR$2);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  const s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new Uint8Array(s.w_size * 2);
  s.head = new Uint16Array(s.hash_size);
  s.prev = new Uint16Array(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;

  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
  //s->pending_buf = (uchf *) overlay;
  s.pending_buf = new Uint8Array(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
  s.d_buf = 1 * s.lit_bufsize;

  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
};

const deflateInit = (strm, level) => {

  return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
};


const deflate$2 = (strm, flush) => {

  let beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK$1 || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
  }

  const s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH$3)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
  }

  s.strm = strm; /* just in case */
  const old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
        );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      let header = (Z_DEFLATED$2 + ((s.w_bits - 8) << 4)) << 8;
      let level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK$3;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH$3) {
    return err(strm, Z_BUF_ERROR$1);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR$1);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE)) {
    let bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK$3;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        _tr_align(s);
      }
      else if (flush !== Z_BLOCK$1) { /* FULL_FLUSH or SYNC_FLUSH */

        _tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH$1) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK$3;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH$3) { return Z_OK$3; }
  if (s.wrap <= 0) { return Z_STREAM_END$3; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
};


const deflateEnd = (strm) => {

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR$2;
  }

  const status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR$2);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
};


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
const deflateSetDictionary = (strm, dictionary) => {

  let dictLength = dictionary.length;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR$2;
  }

  const s = strm.state;
  const wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR$2;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    let tmpDict = new Uint8Array(s.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    let str = s.strstart;
    let n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK$3;
};


var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2$1 = deflate$2;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
module.exports.deflateBound = deflateBound;
module.exports.deflateCopy = deflateCopy;
module.exports.deflateParams = deflateParams;
module.exports.deflatePending = deflatePending;
module.exports.deflatePrime = deflatePrime;
module.exports.deflateTune = deflateTune;
*/

var deflate_1$2 = {
	deflateInit: deflateInit_1,
	deflateInit2: deflateInit2_1,
	deflateReset: deflateReset_1,
	deflateResetKeep: deflateResetKeep_1,
	deflateSetHeader: deflateSetHeader_1,
	deflate: deflate_2$1,
	deflateEnd: deflateEnd_1,
	deflateSetDictionary: deflateSetDictionary_1,
	deflateInfo: deflateInfo
};

const _has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

var assign = function (obj /*from1, from2, from3, ...*/) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (const p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// Join array of chunks to single array.
var flattenChunks = (chunks) => {
  // calculate data length
  let len = 0;

  for (let i = 0, l = chunks.length; i < l; i++) {
    len += chunks[i].length;
  }

  // join chunks
  const result = new Uint8Array(len);

  for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
    let chunk = chunks[i];
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
};

var common = {
	assign: assign,
	flattenChunks: flattenChunks
};

// String encode/decode helpers


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
let STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
const _utf8len = new Uint8Array(256);
for (let q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
var string2buf = (str) => {
  if (typeof TextEncoder === 'function' && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(str);
  }

  let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new Uint8Array(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper
const buf2binstring = (buf, len) => {
  // On Chrome, the arguments in a function call that are allowed is `65534`.
  // If the length of the buffer is smaller than that, we can use this optimization,
  // otherwise we will take a slower path.
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }

  let result = '';
  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
};


// convert array to string
var buf2string = (buf, max) => {
  const len = max || buf.length;

  if (typeof TextDecoder === 'function' && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(buf.subarray(0, max));
  }

  let i, out;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  const utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    let c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    let c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = (buf, max) => {

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

var strings = {
	string2buf: string2buf,
	buf2string: buf2string,
	utf8border: utf8border
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

var zstream = ZStream;

const toString$1 = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH: Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH: Z_FINISH$2,
  Z_OK: Z_OK$2, Z_STREAM_END: Z_STREAM_END$2,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY,
  Z_DEFLATED: Z_DEFLATED$1
} = constants$2;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overridden.
 **/

/**
 * Deflate.result -> Uint8Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 *   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate$1(options) {
  this.options = common.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED$1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY
  }, options || {});

  let opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new zstream();
  this.strm.avail_out = 0;

  let status = deflate_1$2.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK$2) {
    throw new Error(messages[status]);
  }

  if (opt.header) {
    deflate_1$2.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    let dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = deflate_1$2.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK$2) {
      throw new Error(messages[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, flush_mode]) -> Boolean
 * - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must
 * have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
 * buffers and call [[Deflate#onEnd]].
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate$1.prototype.push = function (data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status, _flush_mode;

  if (this.ended) { return false; }

  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString$1.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  for (;;) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    // Make sure avail_out > 6 to avoid repeating markers
    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }

    status = deflate_1$2.deflate(strm, _flush_mode);

    // Ended => flush and finish
    if (status === Z_STREAM_END$2) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status = deflate_1$2.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$2;
    }

    // Flush if out buffer full
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }

    // Flush if requested and has data
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }

    if (strm.avail_in === 0) break;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array): output data.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate$1.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH). By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate$1.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK$2) {
    this.result = common.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array
 * - data (Uint8Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate$1(input, options) {
  const deflator = new Deflate$1(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg || messages[deflator.err]; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array
 * - data (Uint8Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return deflate$1(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array
 * - data (Uint8Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip$1(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate$1(input, options);
}


var Deflate_1$1 = Deflate$1;
var deflate_2 = deflate$1;
var deflateRaw_1$1 = deflateRaw$1;
var gzip_1$1 = gzip$1;
var constants$1 = constants$2;

var deflate_1$1 = {
	Deflate: Deflate_1$1,
	deflate: deflate_2,
	deflateRaw: deflateRaw_1$1,
	gzip: gzip_1$1,
	constants: constants$1
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
const BAD$1 = 30;       /* got a data error -- remain here until reset */
const TYPE$1 = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
var inffast = function inflate_fast(strm, start) {
  let _in;                    /* local strm.input */
  let last;                   /* have enough input while in < last */
  let _out;                   /* local strm.output */
  let beg;                    /* inflate()'s initial strm.output */
  let end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  let dmax;                   /* maximum distance from zlib header */
//#endif
  let wsize;                  /* window size or zero if not using window */
  let whave;                  /* valid bytes in the window */
  let wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  let s_window;               /* allocated sliding window, if wsize != 0 */
  let hold;                   /* local strm.hold */
  let bits;                   /* local strm.bits */
  let lcode;                  /* local strm.lencode */
  let dcode;                  /* local strm.distcode */
  let lmask;                  /* mask for first level of length codes */
  let dmask;                  /* mask for first level of distance codes */
  let here;                   /* retrieved table entry */
  let op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  let len;                    /* match length, unused bytes */
  let dist;                   /* match distance */
  let from;                   /* where to copy match from */
  let from_source;


  let input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  const state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD$1;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD$1;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD$1;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE$1;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD$1;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const MAXBITS = 15;
const ENOUGH_LENS$1 = 852;
const ENOUGH_DISTS$1 = 592;
//const ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

const CODES$1 = 0;
const LENS$1 = 1;
const DISTS$1 = 2;

const lbase = new Uint16Array([ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
]);

const lext = new Uint8Array([ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
]);

const dbase = new Uint16Array([ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
]);

const dext = new Uint8Array([ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
]);

const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) =>
{
  const bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  let len = 0;               /* a code's length in bits */
  let sym = 0;               /* index of code symbols */
  let min = 0, max = 0;          /* minimum and maximum code lengths */
  let root = 0;              /* number of index bits for root table */
  let curr = 0;              /* number of index bits for current table */
  let drop = 0;              /* code bits to drop for sub-table */
  let left = 0;                   /* number of prefix codes available */
  let used = 0;              /* code entries in table used */
  let huff = 0;              /* Huffman code */
  let incr;              /* for incrementing code, index */
  let fill;              /* index for replicating entries */
  let low;               /* low bits for current root entry */
  let mask;              /* mask for low root bits */
  let next;             /* next available space in table */
  let base = null;     /* base value table to use */
  let base_index = 0;
//  let shoextra;    /* extra bits table to use */
  let end;                    /* use base and extra for symbol > end */
  const count = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  const offs = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  let extra = null;
  let extra_index = 0;

  let here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES$1 || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES$1) {
    base = extra = work;    /* dummy value--not used */
    end = 19;

  } else if (type === LENS$1) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
    (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
        (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};


var inftrees = inflate_table;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.






const CODES = 0;
const LENS = 1;
const DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_FINISH: Z_FINISH$1, Z_BLOCK, Z_TREES,
  Z_OK: Z_OK$1, Z_STREAM_END: Z_STREAM_END$1, Z_NEED_DICT: Z_NEED_DICT$1, Z_STREAM_ERROR: Z_STREAM_ERROR$1, Z_DATA_ERROR: Z_DATA_ERROR$1, Z_MEM_ERROR: Z_MEM_ERROR$1, Z_BUF_ERROR,
  Z_DEFLATED
} = constants$2;


/* STATES ====================================================================*/
/* ===========================================================================*/


const    HEAD = 1;       /* i: waiting for magic header */
const    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
const    TIME = 3;       /* i: waiting for modification time (gzip) */
const    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
const    EXLEN = 5;      /* i: waiting for extra length (gzip) */
const    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
const    NAME = 7;       /* i: waiting for end of file name (gzip) */
const    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
const    HCRC = 9;       /* i: waiting for header crc (gzip) */
const    DICTID = 10;    /* i: waiting for dictionary check value */
const    DICT = 11;      /* waiting for inflateSetDictionary() call */
const        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
const        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
const        STORED = 14;    /* i: waiting for stored size (length and complement) */
const        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
const        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
const        TABLE = 17;     /* i: waiting for dynamic block table lengths */
const        LENLENS = 18;   /* i: waiting for code length code lengths */
const        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
const            LEN_ = 20;      /* i: same as LEN below, but only first time in */
const            LEN = 21;       /* i: waiting for length/lit/eob code */
const            LENEXT = 22;    /* i: waiting for length extra bits */
const            DIST = 23;      /* i: waiting for distance code */
const            DISTEXT = 24;   /* i: waiting for distance extra bits */
const            MATCH = 25;     /* o: waiting for output space to copy string */
const            LIT = 26;       /* o: waiting for output space to write literal */
const    CHECK = 27;     /* i: waiting for 32-bit check value */
const    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
const    DONE = 29;      /* finished check, done -- remain here until reset */
const    BAD = 30;       /* got a data error -- remain here until reset */
const    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
const    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



const ENOUGH_LENS = 852;
const ENOUGH_DISTS = 592;
//const ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

const MAX_WBITS = 15;
/* 32K LZ77 window */
const DEF_WBITS = MAX_WBITS;


const zswap32 = (q) => {

  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
};


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new Uint16Array(320); /* temporary storage for code lengths */
  this.work = new Uint16Array(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new Int32Array(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}


const inflateResetKeep = (strm) => {

  if (!strm || !strm.state) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
  state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK$1;
};


const inflateReset = (strm) => {

  if (!strm || !strm.state) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

};


const inflateReset2 = (strm, windowBits) => {
  let wrap;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR$1; }
  const state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
};


const inflateInit2 = (strm, windowBits) => {

  if (!strm) { return Z_STREAM_ERROR$1; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  const state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  const ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$1) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
};


const inflateInit = (strm) => {

  return inflateInit2(strm, DEF_WBITS);
};


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
let virgin = true;

let lenfix, distfix; // We have no pointers in JS, so keep tables separate


const fixedtables = (state) => {

  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    lenfix = new Int32Array(512);
    distfix = new Int32Array(32);

    /* literal/length table */
    let sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inftrees(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inftrees(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
};


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
const updatewindow = (strm, src, end, copy) => {

  let dist;
  const state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new Uint8Array(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    state.window.set(src.subarray(end - state.wsize, end), 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      state.window.set(src.subarray(end - copy, end), 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
};


const inflate$2 = (strm, flush) => {

  let state;
  let input, output;          // input/output buffers
  let next;                   /* next input INDEX */
  let put;                    /* next output INDEX */
  let have, left;             /* available input and output */
  let hold;                   /* bit buffer */
  let bits;                   /* bits in bit buffer */
  let _in, _out;              /* save starting available input and output */
  let copy;                   /* number of stored or match bytes to copy */
  let from;                   /* where to copy match bytes from */
  let from_source;
  let here = 0;               /* current decoding table entry */
  let here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //let last;                   /* parent table entry */
  let last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  let len;                    /* length to copy for repeats, bits to drop */
  let ret;                    /* return code */
  const hbuf = new Uint8Array(4);    /* buffer for gzip header crc calculation */
  let opts;

  let n; // temporary variable for NEED_BITS

  const order = /* permutation of code lengths */
    new Uint8Array([ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ]);


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR$1;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK$1;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        state.flags = 0;           /* expect zlib header */
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        else if (len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }

        // !!! pako patch. Force use `options.windowBits` if passed.
        // Required to always use max window size by default.
        state.dmax = 1 << state.wbits;
        //state.dmax = 1 << len;

        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32_1(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Uint8Array(state.head.extra_len);
              }
              state.head.extra.set(
                input.subarray(
                  next,
                  // extra field is limited to 65536 bytes
                  // - no need for additional size check
                  next + copy
                ),
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if (state.flags & 0x0200) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if (state.flags & 0x0200) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if (state.flags & 0x0200) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT$1;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
        /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          output.set(input.subarray(next, next + copy), put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inffast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (_out) {
            strm.adler = state.check =
                /*UPDATE(state.check, put - _out, _out);*/
                (state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END$1;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR$1;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR$1;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR$1;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH$1))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH$1) && ret === Z_OK$1) {
    ret = Z_BUF_ERROR;
  }
  return ret;
};


const inflateEnd = (strm) => {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR$1;
  }

  let state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK$1;
};


const inflateGetHeader = (strm, head) => {

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR$1; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK$1;
};


const inflateSetDictionary = (strm, dictionary) => {
  const dictLength = dictionary.length;

  let state;
  let dictid;
  let ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR$1; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR$1;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR$1;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK$1;
};


var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2$1 = inflate$2;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
module.exports.inflateCopy = inflateCopy;
module.exports.inflateGetDictionary = inflateGetDictionary;
module.exports.inflateMark = inflateMark;
module.exports.inflatePrime = inflatePrime;
module.exports.inflateSync = inflateSync;
module.exports.inflateSyncPoint = inflateSyncPoint;
module.exports.inflateUndermine = inflateUndermine;
*/

var inflate_1$2 = {
	inflateReset: inflateReset_1,
	inflateReset2: inflateReset2_1,
	inflateResetKeep: inflateResetKeep_1,
	inflateInit: inflateInit_1,
	inflateInit2: inflateInit2_1,
	inflate: inflate_2$1,
	inflateEnd: inflateEnd_1,
	inflateGetHeader: inflateGetHeader_1,
	inflateSetDictionary: inflateSetDictionary_1,
	inflateInfo: inflateInfo
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

var gzheader = GZheader;

const toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH, Z_FINISH,
  Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR
} = constants$2;

/* ===========================================================================*/


/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 * const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate$1(options) {
  this.options = common.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ''
  }, options || {});

  const opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  let status  = inflate_1$2.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== Z_OK) {
    throw new Error(messages[status]);
  }

  this.header = new gzheader();

  inflate_1$2.inflateGetHeader(this.strm, this.header);

  // Setup dictionary
  if (opt.dictionary) {
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) { //In raw mode we need to set the dictionary early
      status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== Z_OK) {
        throw new Error(messages[status]);
      }
    }
  }
}

/**
 * Inflate#push(data[, flush_mode]) -> Boolean
 * - data (Uint8Array|ArrayBuffer): input data
 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
 *   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
 *   `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. If end of stream detected,
 * [[Inflate#onEnd]] will be called.
 *
 * `flush_mode` is not needed for normal operation, because end of stream
 * detected automatically. You may try to use it for advanced things, but
 * this functionality was not tested.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate$1.prototype.push = function (data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status, _flush_mode, last_avail_out;

  if (this.ended) return false;

  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;

  // Convert data if needed
  if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  for (;;) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = inflate_1$2.inflate(strm, _flush_mode);

    if (status === Z_NEED_DICT && dictionary) {
      status = inflate_1$2.inflateSetDictionary(strm, dictionary);

      if (status === Z_OK) {
        status = inflate_1$2.inflate(strm, _flush_mode);
      } else if (status === Z_DATA_ERROR) {
        // Replace code with more verbose
        status = Z_NEED_DICT;
      }
    }

    // Skip snyc markers if more data follows and not raw mode
    while (strm.avail_in > 0 &&
           status === Z_STREAM_END &&
           strm.state.wrap > 0 &&
           data[strm.next_in] !== 0)
    {
      inflate_1$2.inflateReset(strm);
      status = inflate_1$2.inflate(strm, _flush_mode);
    }

    switch (status) {
      case Z_STREAM_ERROR:
      case Z_DATA_ERROR:
      case Z_NEED_DICT:
      case Z_MEM_ERROR:
        this.onEnd(status);
        this.ended = true;
        return false;
    }

    // Remember real `avail_out` value, because we may patch out buffer content
    // to align utf8 strings boundaries.
    last_avail_out = strm.avail_out;

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === Z_STREAM_END) {

        if (this.options.to === 'string') {

          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail & realign counters
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);

          this.onData(utf8str);

        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
        }
      }
    }

    // Must repeat iteration if out buffer is full
    if (status === Z_OK && last_avail_out === 0) continue;

    // Finalize if end of stream reached.
    if (status === Z_STREAM_END) {
      status = inflate_1$2.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return true;
    }

    if (strm.avail_in === 0) break;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|String): output data. When string output requested,
 *   each chunk will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate$1.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH). By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate$1.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|String
 * - data (Uint8Array): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako');
 * const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
 * let output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 **/
function inflate$1(input, options) {
  const inflator = new Inflate$1(options);

  inflator.push(input);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) throw inflator.msg || messages[inflator.err];

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|String
 * - data (Uint8Array): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|String
 * - data (Uint8Array): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


var Inflate_1$1 = Inflate$1;
var inflate_2 = inflate$1;
var inflateRaw_1$1 = inflateRaw$1;
var ungzip$1 = inflate$1;
var constants = constants$2;

var inflate_1$1 = {
	Inflate: Inflate_1$1,
	inflate: inflate_2,
	inflateRaw: inflateRaw_1$1,
	ungzip: ungzip$1,
	constants: constants
};

const { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;

const { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;



var Deflate_1 = Deflate;
var deflate_1 = deflate;
var deflateRaw_1 = deflateRaw;
var gzip_1 = gzip;
var Inflate_1 = Inflate;
var inflate_1 = inflate;
var inflateRaw_1 = inflateRaw;
var ungzip_1 = ungzip;
var constants_1 = constants$2;

var pako = {
	Deflate: Deflate_1,
	deflate: deflate_1,
	deflateRaw: deflateRaw_1,
	gzip: gzip_1,
	Inflate: Inflate_1,
	inflate: inflate_1,
	inflateRaw: inflateRaw_1,
	ungzip: ungzip_1,
	constants: constants_1
};




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/sw/sw.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _http_request__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./http_request */ "./src/sw/http_request.ts");

const DEBUG = true;
// Always install updated SW immediately
self.addEventListener('install', () => {
    self.skipWaiting();
});
self.addEventListener('activate', async () => {
    // upon activation take control of all clients (tabs & windows)
    await self.clients.claim();
    // reload all clients
    const clients = (await self.clients.matchAll());
    clients.forEach((client) => client.navigate(client.url));
});
// Intercept and proxy all fetch requests made by the browser or DOM on this scope.
self.addEventListener('fetch', (event) => {
    try {
        const response = (0,_http_request__WEBPACK_IMPORTED_MODULE_0__.handleRequest)(event.request);
        event.respondWith(response);
    }
    catch (e) {
        const error_message = String(e);
        console.error(error_message);
        if (DEBUG) {
            return event.respondWith(new Response(error_message, {
                status: 501,
            }));
        }
        event.respondWith(new Response('Internal Error', { status: 502 }));
    }
});

})();

/******/ })()
;
//# sourceMappingURL=sw.js.map