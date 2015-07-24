var remoteScripts = {
    delay: 10 * 1000,
    options: {
        containerId: 'XssNotifyBox',
        containerCss: 'xss-notify',
    },
    blocked: false,
    urlStates: {},
    windowHandle: null,
    define: function (urls, detect, done, parentElem) {
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
            var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
            if (!info) {
                // Create new...
                info = {
                    url: url,
                    qry: detect,
                    step: done,
                    elem: null,
                    state: null,
                    parent: parentElem,
                    listener: function (event) {
                        //if (event.origin !== window.location.href) return
                        var destUrl = url;
                        if (!event || !Array.isArray(event.data)) {
                            //console.log('Warning: Invalid post message:', event);
                            return;
                        }

                        // Check if the is a result to send
                        var results = (event.data || []).filter(function (element, index, array) {
                            return (element.url == destUrl);
                        }, url);
                        if (results && results.length) {
                            info.setResult(results);
                        }
                    },
                    success: function () {
                        info.state = true;
                        remoteScripts.ready(info.url);
                    },
                    failure: function () {
                        console.warn('Warning: Failed to attach ' + info.url);
                        remoteScripts.failed(info.url);
                    },
                    setResult: function (resp) {
                        if (!resp) return;
                        if (!Array.isArray(resp)) return;
                        resp.forEach(function (item) {
                            try {
                                switch (item.type) {
                                    case 'script':
                                        var source = item.data;
                                        remoteScripts.script(source, function (elem) {
                                            if (elem) {
                                                elem.setAttribute('relx', info.url);

                                                // Replace current node....
                                                var parentElem = (info.tag ? info.tag.parentNode : null) || document.body;
                                                if (parentElem && info.tag) {
                                                    parentElem.replaceChild(elem, info.tag);
                                                } else {
                                                    parentElem.appendChild(elem);
                                                }
                                                info.tag = elem;
                                                info.success();
                                            } else {
                                                info.failure();
                                            }
                                        });
                                        break;
                                    default:
                                        console.warn(' - Unknown posted message:', item);
                                        break;
                                }
                            } catch (ex) {
                                console.error(ex);
                                info.failure();
                            }
                        });
                    },
                };

                // Attach callbacks
                if (window.addEventListener) {
                    window.addEventListener('message', info.listener, false);
                } else {
                    window.attachEvent('onmessage', info.listener);
                }
            }

            var elem = info ? info.elem : null;
            if (info && info.qry && info.qry(url)) {
                remoteScripts.ready(url);
                return; // Already defined...
            }

            if (url in remoteScripts.urlStates) {
                remoteScripts.retry(url);
                return; // Already Busy...
            } else {
                // Attach to tracker
                remoteScripts.urlStates[url] = info;

                // Check for blocked scripts
                if (remoteScripts.blocked) {
                    remoteScripts.retry(url);
                    return; // Previous script was blocked...
                }

                console.log('   + ', url);
                elem = document.createElement('div');
                {
                    elem.className = 'bar info';
                    elem.innerHTML =
                        '<i class="fa fa-cog faa-spin animated" style="margin-right: 3px;"></i>' +
                        '<span>Loading: </span>' +
                        '<a target="_blank" href="' + url + '">' + url + '</a>' +
                        '<a href="#" style="float: right; margin-right: 8px;">Dismis</a>' +
                        '<a href="#" style="float: right; margin-right: 8px;">Retry</a>';
                }
                container.appendChild(elem);
                info.elem = elem;

                var btnLink = (elem.childNodes.length > 2) ? elem.childNodes[2] : null;
                if (btnLink) {
                    btnLink.onclick = function () {
                        return remoteScripts.fetch(this, info);
                    }
                }

                var btnClose = (elem.childNodes.length > 3) ? elem.childNodes[3] : null;
                if (btnClose) {
                    btnClose.style.display = 'none';
                    btnClose.onclick = function () {
                        remoteScripts.failed(url);
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

                // Try and load with normal script tag...
                info.tag = remoteScripts.attach(info.url, remoteScripts.result, info.parent);
            }
        });
    },
    fetch: function (link, info) {
        if (info.state) {
            remoteScripts.ready(info.url);
        } else {
            // Open in new window...
            remoteScripts.retry(info.url);
        }
        return false;
    },
    attach: function (url, callback, parentElem) {
        try {
            // Check if there has been a failed script load...
            if (remoteScripts.blocked && remoteScripts.windowHandle) {
                remoteScripts.queue(url);
            } else {
                // Try and load the script normally...
                var srciptElem = document.createElement('script');
                if (srciptElem) {
                    srciptElem.onload = function (evt) {
                        if (callback) callback(url, true);
                    }
                    srciptElem.src = url;
                    (parentElem || document.body).appendChild(srciptElem);
                }

                // Set timer to check for timeout
                var intv = setInterval(function () {                    
                    if (callback) {
                        callback(url, false);
                    }
                    clearInterval(intv);
                }, remoteScripts.delay);

            }
        } catch (ex) {
            console.warn('Warning: Script refused to load. ' + ex.message);
            callback(url, false);
        }

        return srciptElem;
    },
    script: function (source, callback) {
        try {
            // Try and load the script normally
            var srciptElem = document.createElement('script');
            if (srciptElem) {
                srciptElem.textContent = source;
                if (callback) callback(srciptElem, true);
            }
        } catch (ex) {
            console.warn('Warning: Script refused to load. ' + ex.message);
            callback(null, false);
        }
    },
    result: function (url, success) {
        var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
        if (!success) {

            // Failed to load script normally, try workaround...
            remoteScripts.retry(url);

            // Notify script failed
            var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
            if (info && info.step) {
                info.step(url, info);
            }
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

            console.log('   ~ ', url);

            // Indicate to future calls that scripts are blocked
            remoteScripts.blocked = true;
            info.state = null;
            if (info.step) {
                info.step(url, info);
            }

            // Update UI state...
            if (info.elem && info.elem.childNodes.length > 4) {
                info.elem.className = 'bar warn';
                info.elem.childNodes[0].className = 'fa fa-question-circle faa-tada animated';
                info.elem.childNodes[1].innerHTML = '<b>Loading:</b> ';
                info.elem.childNodes[3].style.display = 'inline';
                info.elem.childNodes[4].style.display = 'inline';
            }


            var debouncedMs = 0;
            if (!remoteScripts.windowHandle || remoteScripts.windowHandle.closed) {
                remoteScripts.windowHandle = remoteScripts.dialog(remoteScripts.static.loader, 320, 240);
                debouncedMs = 500;
            }

            var debounced = setInterval(function () {
                clearInterval(debounced);
                if (!remoteScripts.windowHandle) {
                    console.warn(' - Popup blocked...');
                    return;
                } else {
                    // Queue the request
                    var done = remoteScripts.queue(url);
                    if (!done) {
                        console.warn(' - Script could not be queued...');
                    }
                }
            }, debouncedMs);

            // Set a timer to check for reult (if exist)
            var msCounter = 0;
            var msChecker = 0.5 * 1000; // Check every [n] milliseconds
            var msTimeout = 2 * 60 * 1000; // Timeout in 2 mins
            if (!info.intv) {
                info.intv = setInterval(function () {
                    // Count ellapsed time
                    msCounter += msChecker;

                    if (remoteScripts.windowHandle && remoteScripts.windowHandle.closed) {
                        remoteScripts.windowHandle = null;
                    }

                    // Check for timeout
                    if (info.intv && msCounter >= msTimeout) {
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
    queue: function (url) {
        var done = null;
        try {
            // Send a request
            var targ = remoteScripts.windowHandle;
            var req = [{
                url: url,
                type: 'queue',
            }];

            try {
                var orig = '*';
                if (targ && targ.postMessage) {
                    done = true;
                    targ.postMessage(req, orig);
                }
            } catch (ex) {
                done = false;
                console.warn('Warning: ' + ex.message);
            }

            if (!done) {
                var method = 'queue';
                var win = targ;
                if (win && method in win.window) {
                    win.window[method](req);
                    done = true;
                }
            }

        } catch (ex) {
            done = false;
            console.warn('Warning: ' + ex.message);
            throw ex;
        }

        return done;
    },
    ready: function (url) {
        var info = (url in remoteScripts.urlStates) ? remoteScripts.urlStates[url] : null;
        if (info && info.step) {
            info.state = true;
            info.step(url, info);
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

        if (info && info.step) {
            info.state = false;
            info.step(url, info);
        }
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
            // Remove callback
            if (window.removeEventListener) {
                window.removeEventListener('message', info.listener);
            } else {
                window.detachEvent('onmessage', info.listener);
            }

            delete remoteScripts.urlStates[url];
        }
    },
    dialog: function (url, width, height) {
        var left = screen.width - width - 20;
        var top = 0;//screen.height - height - 32;
        var opts = 'width=' + width + ', height=' + height;
        {
            opts += ', top=' + top + ', left=' + left;
            opts += ', directories=no';
            opts += ', location=no';
            opts += ', menubar=no';
            opts += ', resizable=no';
            opts += ', scrollbars=no';
            opts += ', status=no';
            opts += ', toolbar=no';
        }

        var win = window.open(url, 'Loading...', opts);
        if (win) {
            win.left = screen.width - win.outerWidth;
        }
        return win;
    },
    static: {
        loader: "data:text/html;charset=utf-8,%EF%BB%BF%3C!DOCTYPE%20html%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%3Chead%3E%0D%0A%20%20%20%20%3Ctitle%3EScript%20Importer%3C%2Ftitle%3E%0D%0A%20%20%20%20%3Cstyle%3E%0D%0A%20%20%20%20%20%20%20%20%40import%20url('https%3A%2F%2Fmaxcdn.bootstrapcdn.com%2Fbootstrap%2F3.3.5%2Fcss%2Fbootstrap.min.css')%3B%0D%0A%20%20%20%20%20%20%20%20%40import%20url('https%3A%2F%2Fmaxcdn.bootstrapcdn.com%2Fbootstrap%2F3.3.5%2Fcss%2Fbootstrap-theme.min.css')%3B%0D%0A%20%20%20%20%20%20%20%20%40import%20url('https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Ffont-awesome%2F4.3.0%2Fcss%2Ffont-awesome.min.css')%3B%0D%0A%20%20%20%20%3C%2Fstyle%3E%0D%0A%20%20%20%20%3Clink%20href%3D%22assets%2Fcss%2Fvendor%2Ffont-awesome-animation.min.css%22%20rel%3D%22stylesheet%22%20%2F%3E%0D%0A%20%20%20%20%3C!--%0D%0A%20%20%20%20--%3E%0D%0A%20%20%20%20%3Cmeta%20http-equiv%3D%22Content-Security-Policy%22%20content%3D%22script-src%20'self'%20'unsafe-inline'%20'unsafe-eval'%3B%20child-src%20'none'%3B%20object-src%20'none'%22%3E%0D%0A%3C%2Fhead%3E%0D%0A%3Cbody%20style%3D%22overflow%3A%20hidden%3B%22%3E%0D%0A%20%20%20%20%3Cdiv%20class%3D%22thumbnail%22%20style%3D%22position%3Aabsolute%3B%20top%3A0%3B%20left%3A%200%3B%20right%3A%200%3B%20bottom%3A%200%3B%20display%3A%20flex%3B%20flex-direction%3Acolumn%3B%20background-color%3A%20rgba(255%2C%20255%2C%20255%2C%200.75)%22%3E%0D%0A%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%22form%22%20style%3D%22flex-grow%3A%200%3B%20flex-shrink%3A0%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%22input-group%20input-group-sm%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%22input-group-addon%22%3EURL%3A%3C%2Fspan%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cinput%20id%3D%22txtUrl%22%20type%3D%22text%22%20class%3D%22form-control%22%20placeholder%3D%22Enter%20url%20to%20import...%22%20value%3D%22https%3A%2F%2Fcode.jquery.com%2Fjquery-2.1.4.min.js%22%20%2F%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ca%20class%3D%22input-group-addon%20btn%20btn-default%22%20onclick%3D%22window.close()%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Close%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fa%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%3Cdiv%20id%3D%22srcUrl%22%20class%3D%22row%22%20style%3D%22flex-grow%3A%201%3B%20flex-shrink%3A1%3B%20display%3A%20flex%3B%20flex-direction%3Acolumn%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%22col%20col-xs-12%20col-md-12%22%20style%3D%22flex-grow%3A%201%3B%20display%3A%20flex%3B%20flex-direction%3Acolumn%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ca%20id%3D%22lnkBtn%22%20onclick%3D%22loadScript(document.getElementById('txtUrl').value)%22%20class%3D%22btn%20btn-lg%20btn-primary%22%20style%3D%22padding%3A24px%3B%20font-size%3A%2024px%3B%20flex-grow%3A%201%3B%20text-align%3A%20center%3B%20vertical-align%3A%20middle%20!important%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ci%20id%3D%22lnkIco%22%20class%3D%22fa%20fa-cloud-download%20faa-float%20animated%20fa-4x%22%3E%3C%2Fi%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20id%3D%22lnkTxt%22%3EAttach%20Script%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fa%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%3Ctextarea%20id%3D%22txtOut%22%20style%3D%22display%3Anone%3B%20flex-grow%3A%201%3B%20flex-direction%3Acolumn%3B%20border%3A%20none%3B%20margin%3A%204px%3B%20font-family%3Amonospace%3B%20font-size%3A%209px%3B%22%3ENo%20Result%3C%2Ftextarea%3E%0D%0A%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%3Cdiv%20style%3D%22cursor%3Apointer%3B%20position%3A%20absolute%3B%20left%3A0%3B%20bottom%3A%200%3B%20right%3A0%3B%20text-align%3A%20center%3B%20font-size%3A%2011px%3B%20padding%3A%202px%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%3Ca%20id%3D%22lnkOut%22%20style%3D%22display%3Anone%3B%20color%3A%20%23808080%3B%20text-decoration%3A%20none%3B%20white-space%3A%20nowrap%3B%20%20overflow%3A%20hidden%3B%20%20text-overflow%3A%20ellipsis%3B%22%3ENavigate%20to%20remote%20URL%3C%2Fa%3E%0D%0A%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%3Cscript%3E%0D%0A%20%20%20%20%20%20%20%20var%20autoLoad%20%3D%20false%3B%0D%0A%20%20%20%20%20%20%20%20var%20pendingQueue%20%3D%20%5B%5D%3B%0D%0A%20%20%20%20%20%20%20%20var%20isBusyLoading%20%3D%20false%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20init()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Attach%20callback%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20targ%20%3D%20window%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(targ%20%26%26%20targ.addEventListener)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targ.addEventListener('message'%2C%20listener%2C%20false)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(targ%20%26%26%20targ.attachEvent)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targ.attachEvent('onmessage'%2C%20listener)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Remember%20to%20remove%20the%20event%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.beforeunload%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20completed()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.warn('Warning%3A%20'%20%2B%20ex.message)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20completed()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Remove%20callback%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(window.removeEventListener)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.removeEventListener('message'%2C%20listener)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.detachEvent('onmessage'%2C%20listener)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20listener(event)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2Fif%20(event.origin%20!%3D%3D%20window.location.href)%20return%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20var%20data%20%3D%20event.data%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(data%20%26%26%20Array.isArray(data))%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data.forEach(function%20(item)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20switch%20(item.type)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20case%20'queue'%3A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20queue(item.url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20queue(url%2C%20callback)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(!pendingQueue.filter(function%20(itm)%20%7B%20return%20url%20%3D%3D%20itm%20%7D).length)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pendingQueue.push(%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%3A%20url%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20callback%3A%20callback%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.warn('Already%20queued%3A'%2C%20url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(!isBusyLoading%20%26%26%20pendingQueue.length)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20itm%20%3D%20pendingQueue.splice(0%2C%201)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20loadScript(itm%5B0%5D.url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20loadScript(url%2C%20callback)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(isBusyLoading)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.warn('%20-%20Warn%3A%20Is%20Busy%20Loading...')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20queue(url%2C%20callback)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20isBusyLoading%20%3D%20true%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20txtUrl%20%3D%20document.getElementById('txtUrl')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20lnkBtn%20%3D%20document.getElementById('lnkBtn')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20lnkIco%20%3D%20document.getElementById('lnkIco')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20lnkTxt%20%3D%20document.getElementById('lnkTxt')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20srcUrl%20%3D%20document.getElementById('srcUrl')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20txtOut%20%3D%20document.getElementById('txtOut')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20lnkOut%20%3D%20document.getElementById('lnkOut')%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkBtn)%20lnkBtn.className%20%3D%20'btn%20btn-lg%20btn-default%20disabled'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkIco)%20lnkIco.className%20%3D%20'fa%20fa-refresh%20faa-spin%20animated%20fa-4x'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkTxt)%20lnkTxt.innerHTML%20%3D%20'Downloading%20script...'%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(txtUrl)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtUrl.value%20%3D%20url%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.style.display%20%3D%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(url)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log('Downloading%3A%20'%20%2B%20url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20xhttp%20%3D%20('XMLHttpRequest'%20in%20window)%20%3F%20new%20XMLHttpRequest()%20%3A%20xmlhttp%20%3D%20new%20ActiveXObject(%22Microsoft.XMLHTTP%22)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(xhttp)%20%7B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20function%20setCloser()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Close%20this%20window%20if%20no%20further%20instructions%20after%20timeout%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20intv%20%3D%20setInterval(function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(!isBusyLoading%20%26%26%20window%20%26%26%20!window.closed)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20clearInterval(intv)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.close()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%20500)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20function%20handleSuccess(url%2C%20result)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkBtn)%20lnkBtn.className%20%3D%20'btn%20btn-lg%20btn-success'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkIco)%20lnkIco.className%20%3D%20'fa%20fa-check%20faa-pulse%20animated%20fa-4x'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkTxt)%20lnkTxt.innerHTML%20%3D%20'Success'%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log('Completed%3A'%2C%20url)%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Clear%20busy%20flag...%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20isBusyLoading%20%3D%20false%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Set%20result%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(txtOut)%20txtOut.value%20%3D%20result%20%7C%7C%20''%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.innerText%20%3D%20'Show%20%2F%20Hide%20Respone%20Text'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.style.display%20%3D%20'block'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.onclick%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(result%20%26%26%20srcUrl%20%26%26%20txtOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20toggle%20%3D%20srcUrl.style.display%20!%3D%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20srcUrl.style.display%20%3D%20toggle%20%3F%20'none'%20%3A%20'flex'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtOut.style.display%20%3D%20toggle%20%3F%20'flex'%20%3A%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtOut.select()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20false%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Reply%20with%20response%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20resp%20%3D%20%5B%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%3A%20url%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%3A%20result%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'script'%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5D%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20done%20%3D%20null%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20targ%20%3D%20window.opener%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20orig%20%3D%20'*'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(targ%20%26%26%20targ.postMessage)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targ.postMessage(resp%2C%20orig)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20done%20%3D%20true%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20done%20%3D%20false%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.warn('Warning%3A%20'%20%2B%20ex.message)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(!done%20%26%26%20targ)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20method%20%3D%20'remoteScriptSetResult'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(method%20in%20targ)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targ%5Bmethod%5D(resp)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20done%20%3D%20true%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.location.href%20%3D%20url%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(!isBusyLoading%20%26%26%20pendingQueue.length)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20itm%20%3D%20pendingQueue.splice(0%2C%201)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20loadScript(itm%5B0%5D.url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(done)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20setCloser()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20handleException(ex)%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20function%20handleException(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.error(ex)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20isBusyLoading%20%3D%20false%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkBtn)%20lnkBtn.className%20%3D%20'btn%20btn-lg%20btn-danger'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkIco)%20lnkIco.className%20%3D%20'fa%20fa-times-circle%20faa-ring%20animated%20fa-4x'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkTxt)%20lnkTxt.innerHTML%20%3D%20'Script%20Error'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.innerText%20%3D%20ex.message%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.style.display%20%3D%20'block'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.onclick%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(srcUrl%20%26%26%20txtOut%20%26%26%20txtOut.value)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20toggle%20%3D%20srcUrl.style.display%20!%3D%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20srcUrl.style.display%20%3D%20toggle%20%3F%20'none'%20%3A%20'flex'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtOut.style.display%20%3D%20toggle%20%3F%20'flex'%20%3A%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtOut.select()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.location.href%20%3D%20url%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20false%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20xhttp.onreadystatechange%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log('%20-%20State%20%5B%20'%20%2B%20xhttp.readyState%20%2B%20'%20%5D%3A%20'%2C%20xhttp.responseText.length)%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(xhttp.readyState%20%3D%3D%20XMLHttpRequest.DONE)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(xhttp.status%20%3D%3D%20200)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20result%20%3D%20xhttp.responseText%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(result)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20handleSuccess(url%2C%20result)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%20if%20(xhttp.status%20%3D%3D%20400)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20throw%20new%20Error('There%20was%20an%20error%20400')%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(xhttp)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log('%20-%20xhttp'%2C%20xhttp)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20throw%20new%20Error((xhttp.statusText%20%7C%7C%20'Server%20Retured%3A%20'%20%2B%20xhttp.status))%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20handleException(ex)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20xhttp.open(%22GET%22%2C%20url%2C%20true)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20xhttp.send()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20throw%20new%20Error('Enter%20a%20valid%20url')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.error(ex)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkBtn)%20lnkBtn.className%20%3D%20'btn%20btn-lg%20btn-danger'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkIco)%20lnkIco.className%20%3D%20'fa%20fa-exclamation-circle%20faa-tada%20animated%20fa-4x'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkTxt)%20lnkTxt.innerHTML%20%3D%20'Script%20Error'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.innerText%20%3D%20ex.message%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.style.display%20%3D%20'block'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.onclick%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20alert(ex.message)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.location.reload(true)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20false%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20if%20(autoLoad)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20window.onload%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20txtUrl%20%3D%20document.getElementById('txtUrl')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(txtUrl%20%26%26%20txtUrl.value)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Delay%20Load%201s%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20intv%20%3D%20setInterval(function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20clearInterval(intv)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20loadScript(txtUrl.value)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%201000)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20init()%3B%0D%0A%0D%0A%20%20%20%20%3C%2Fscript%3E%0D%0A%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A",
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