/// <reference path="modules/imports.d.ts" />
/// <reference path="modules/loader/RemoteScriptLoader.ts" />

// Expose as CommonJS module
if (typeof module !== 'undefined') {
    module.exports = proto.loader.RemoteScriptLoader;
}

// Expose as an AMD module
if (typeof define === 'function' && define.amd) {
    define(proto.loader.RemoteScriptLoader);
}