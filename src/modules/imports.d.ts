/// <reference path="../typings/jquery/jquery.d.ts" />

interface document {
    head: HTMLHeadElement;
    body: HTMLBodyElement;
    createElement: (type: string) => HTMLElement;
}

interface Window {
    WhichBrowser: () => void;
    isNaN: (input: any) => boolean;
    isFinite: (input: any) => boolean;
    attachEvent: (name: string, callback: (evt?: any) => void) => void;
    detachEvent: (name: string, callback: (evt?: any) => void) => void;
    events: any;
}

declare var define: any;
declare var module: any;
