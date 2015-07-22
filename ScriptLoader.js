var remoteScripts = {
    delay: 10 * 1000,
    options: {
        containerId: 'XssNotifyBox',
        containerCss: 'xss-notify',
    },
    urlStates: {},
    define: function (urls, detect, done) {
        // Define container
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

        // Convert to an array
        urls = Array.isArray(urls) ? urls : (typeof urls === 'string' ? [urls] : []);
        urls.forEach(function (url) {
            var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : {
                url: url,
                qry: detect,
                done: done,
                elem: null,
                state: null,
            };
            var elem = info ? info.elem : null;
            if (info && info.qry && info.qry(url)) {
                info.state = true;
                remoteScripts.remove(url);
                if (done) done(url, info);
                return; // Already defined...
            }
            if (url in remoteScripts.urlStates) {
                if (!info.state) {
                    remoteScripts.retry(url);
                }
                return; // Already Busy...
            } else {
                console.log('   + ', url);

                elem = document.createElement('div');
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

                info.elem = elem;
            }

            var btnLink = (elem.childNodes.length > 2) ? elem.childNodes[2] : null;
            if (btnLink) {
                btnLink.onclick = function () {
                    return remoteScripts.fetch(this, info);
                }
                if (info.state === null) btnLink.click();
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
            if (info.state) {
                remoteScripts.ready(url);
                return false;
            } else {
                // Open in new window...
            }
        } else {
            // First try and load with normal script tag...
            remoteScripts.urlStates[url] = info;
            remoteScripts.attach(url, remoteScripts.result);

            // Cancel event bubbling...
            return false;
        }
    },
    attach: function (url, callback) {
        try {
            // Try and load the script normally
            var srciptElem = document.createElement('script');
            if (srciptElem) {
                srciptElem.onload = function (evt) {
                    if (callback) callback(url, true);
                }
                srciptElem.src = url;
                document.body.appendChild(srciptElem);
            }

            // Set timer to check for timeout
            var intv = setInterval(function () {
                if (callback) {
                    callback(url, false);
                }
                clearInterval(intv);
            }, remoteScripts.delay);
        } catch (ex) {
            console.warn('Warning: Script refused to load. ' + ex.message);
            callback(url, false);
        }
    },
    result: function (url, success) {
        var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
        if (!success) {

            // Failed to load script normally, try workaround...
            remoteScripts.retry(url);

            // Notify script failed
            var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
            if (info && info.done) {
                info.done(url, info);
            }
        } else {
            // Loaded normally...
            remoteScripts.ready(url);
        }
    },
    retry: function (url) {
        var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
        if (info && !info.state) {
            info.state = null;

            console.warn('   R ', url);

            if (info.done) {
                info.done(url, info);
            }

            // Update UI state...
            if (info.elem && info.elem.childNodes.length > 4) {
                info.elem.className = 'bar warn';
                info.elem.childNodes[0].className = 'fa fa-question-circle faa-tada animated';
                info.elem.childNodes[1].innerHTML = '<b>Loading:</b> ';
                info.elem.childNodes[3].style.display = 'inline';
                info.elem.childNodes[4].style.display = 'inline';
            }

            // Detect if present...
            if (info.qry && info.qry()) {
                remoteScripts.ready(url);
                return; // Already loaded...
            }

            // Set a timer to check for reult (if exist)
            var msCounter = 0;
            var msChecker = 2 * 1000; // Check every 2 seconds
            var msTimeout = 2 * 60 * 1000; // Timeout in 2 mins
            if (!info.intv) {
                info.intv = setInterval(function () {
                    // Count ellapsed time
                    msCounter += msChecker;

                    console.log(' - Check: ', info.qry && info.qry());

                    // Check for timeout
                    if (info.done && msCounter >= msTimeout) {
                        // Failed to load...
                        info.intv = clearInterval(info.intv);
                        return remoteScripts.failed(url);
                    }

                    // Check if loaded...
                    if (info.state || info.qry && info.qry()) {
                        // Done loading...
                        info.intv = clearInterval(info.intv);
                        return remoteScripts.ready(url);
                    }

                }, msChecker);
            }
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
    failed: function (url) {
        var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;

        // Update UI state...
        if (info && info.elem && info.elem.childNodes.length > 4) {
            info.elem.className = 'bar error';
            info.elem.childNodes[0].className = 'fa fa-exclamation-circle faa-tada animated';
            info.elem.childNodes[1].innerHTML = '<b>Failure:</b> ';
            info.elem.childNodes[3].style.display = 'inline';
            info.elem.childNodes[4].style.display = 'inline';
        }

        if (info && info.done) {
            info.state = false;
            info.done(url, info);
        }
        //remoteScripts.remove(url);
    },
    remove: function (url) {
        if (url in remoteScripts.urlStates) {
            var info = remoteScripts.urlStates[url];
            var intv = info.intv;
            if (intv) info.intv = clearInterval(intv);

            var elem = info.elem;
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