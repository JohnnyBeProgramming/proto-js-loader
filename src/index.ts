/// <reference path="modules/imports.d.ts" />
/// <reference path="common.ts" />

// Register as a global class
if (typeof window !== 'undefined') {
    window['remoteScripts'] = proto.loader.RemoteScriptLoader;
}