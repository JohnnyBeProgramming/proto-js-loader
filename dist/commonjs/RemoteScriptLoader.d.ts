/// <reference path="../../src/modules/imports.d.ts" />
declare module proto.loader {
    interface IDelayTimers {
        check: number;
        iframe: number;
        timeout: number;
    }
}
declare module proto.loader {
    interface IDisplayOptions {
        containerId: string;
        containerCss: string;
    }
}
declare module proto.loader {
    interface IProxyOptions {
        popup: boolean;
        iframe: boolean;
        prompt: boolean;
        checking: boolean;
    }
}
declare module proto.loader {
    class RemoteScriptLoader {
        delay: IDelayTimers;
        options: IDisplayOptions;
        proxies: IProxyOptions;
        autoLoad: boolean;
        blocked: boolean;
        urlStates: any;
        windowHandle: any;
        iframeProxy: any;
        dialogProxy: any;
        define(urls: any, detect?: () => boolean, done?: () => void, parentElem?: HTMLElement): void;
        private create(url, detect?, done?, parentElem?);
        private infoBar(info);
        private guid();
        private container();
        private fetch(info);
        private attach(info, callback);
        private script(info, source, callback);
        private result(url, success);
        private retry(url);
        private queue(url);
        private ready(url);
        private failed(url, ex?, confirmed?);
        private remove(url);
        private dialog(url, width, height);
        private checkStatus(url);
        private styleDialog(elem, width, height);
        private confirmPopups(url, ellapsed?);
        private static;
    }
}
