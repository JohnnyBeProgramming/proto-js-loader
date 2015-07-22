var remoteScripts = {
    delay: 10 * 1000,
    options: {
        containerId: 'XssNotifyBox',
        containerCss: 'xss-notify',
    },
    urlStates: {},
    define: function (urls, detect, done) {
        var container = document.getElementById(remoteScripts.options.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = remoteScripts.options.containerId;
            container.className = remoteScripts.options.containerCss;
            container.style.left = '0';
            container.style.right = '0';
            container.style.bottom = '0';
            container.style.fontSize = '11px';
            container.style.position = 'absolute';
            container.style.zIndexx = '2110000000';
            document.body.appendChild(container);
        }

        urls = Array.isArray(urls) ? urls : (typeof urls === 'string' ? [urls] : []);
        urls.forEach(function (url) {
            if (detect && detect(url)) return; // Already defined...
            if (url in remoteScripts.urlStates) return; // State already exists...

            console.log('   + ', url);

            // ToDo: Create Link and define...
            var elem = document.createElement('div');
            {
                elem.className = 'bar info';
                elem.innerHTML =
                    '<i class="fa fa-cog faa-spin animated" style="margin-right: 3px;"></i>' +
                    '<span>Loading resource: </span>' +
                    '<a target="_blank" href="' + url + '">' + url + '</a>' +
                    '<a href="#" style="float: right; margin-right: 8px;">Dismis</a>' +
                    '<a href="#" style="float: right; margin-right: 8px;">Retry</a>';
            }
            container.appendChild(elem);

            var info = {
                url: url,
                qry: detect,
                done: done,
                elem: elem,
                state: null,
            };

            var btnLink = (elem.childNodes.length > 2) ? elem.childNodes[2] : null;
            if (btnLink) {
                btnLink.onclick = function () {
                    return remoteScripts.fetch(this, info);
                }
                btnLink.click();
            }

            var btnClose = (elem.childNodes.length > 3) ? elem.childNodes[3] : null;
            if (btnClose) {
                btnClose.style.display = 'none';
                btnClose.onclick = function () {
                    remoteScripts.remove(url);
                    return false;
                }
            }

            var btnRetry = (elem.childNodes.length > 4) ? elem.childNodes[4] : null;
            if (btnRetry) {
                btnRetry.style.display = 'none';
                btnRetry.onclick = function () {
                    remoteScripts.retry(url);
                    return false;
                }
            }
        });
    },
    fetch: function (link, info) {
        var url = link.href;
        if (url in remoteScripts.urlStates) {
            // Failed to load script: Open in new window...
        } else {
            // First try and load with normal script tag...
            remoteScripts.urlStates[url] = info;
            remoteScripts.attach(url, remoteScripts.result);

            // Cancel event bubbling...
            return false;
        }
    },
    attach: function (url, callback) {
        var isReady = false;
        try {
            // Try and load the script normally
            var srciptElem = document.createElement('script');
            if (srciptElem) {
                srciptElem.onload = function (evt) {
                    isReady = true;
                    if (callback) callback(url, true);
                }
                srciptElem.src = url;
                document.body.appendChild(srciptElem);
            }

            // Set timer to check for timeout
            var intv = setInterval(function () {
                clearInterval(intv);
                if (!isReady && callback) {
                    isReady = true;
                    callback(url, false);
                }
            }, remoteScripts.delay);
        } catch (ex) {
            console.warn('Warning: Script refused to load. ' + ex.message);
            isReady = true;
            callback(url, false);
        }
    },
    result: function (url, success) {
        if (!success) {
            // Failed to load script normally, try workaround...
            remoteScripts.retry(url);
        } else {
            // Loaded normally...
            remoteScripts.ready(url);
        }
    },
    retry: function (url) {
        var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
        if (info && !info.state) {

            // Detect if present...
            if (info.qry && info.qry()) {
                remoteScripts.ready(url);
                return; // Already loaded...
            }

            // Update UI state...
            if (info.elem && info.elem.childNodes.length > 4) {
                info.elem.className = 'bar warn';
                info.elem.childNodes[0].className = 'fa fa-warning faa-tada animated';
                info.elem.childNodes[1].innerHTML = '<b>Problem loading:</b> ';
                info.elem.childNodes[3].style.display = 'inline';
                info.elem.childNodes[4].style.display = 'inline';
            }

            // Set a timer to check for reult (if exist)
            if (!info.intv && info.qry) {
                info.intv = setInterval(function () {
                    // Check if loaded...
                    if (info.state || info.qry && info.qry()) {
                        // Done loading...
                        clearInterval(info.intv);
                        return remoteScripts.ready(url);
                    }
                }, 2 * 1000);
            }

            // ToDo: Get alternative way to fetch data...
            console.warn('   ! ', url);
        }
    },
    ready: function (url) {
        var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
        if (info && info.done) {
            info.state = true;
            info.done(url, info);
        }
        remoteScripts.remove(url);
    },
    remove: function (url) {
        if (url in remoteScripts.urlStates) {
            var intv = remoteScripts.urlStates[url].intv;
            if (intv) clearInterval(intv);

            var elem = remoteScripts.urlStates[url].elem;
            if (elem && elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
            delete remoteScripts.urlStates[url];
        }
    },
};


// Expose as an AMD module
if (typeof define === 'function' && define.amd) {
    define(remoteScripts);
}

// Expose as CommonJS module
if (typeof module !== 'undefined') {
    module.exports = remoteScripts;
}