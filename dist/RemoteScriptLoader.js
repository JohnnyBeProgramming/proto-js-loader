/// <reference path="IDelayTimers.ts" />
/// <reference path="IDisplayOptions.ts" />
/// <reference path="IProxyOptions.ts" />
var proto;
(function (proto) {
    var loader;
    (function (loader) {
        var RemoteScriptLoader = (function () {
            function RemoteScriptLoader() {
                this.delay = {
                    check: 1 * 1000,
                    iframe: 5 * 1000,
                    timeout: 30 * 1000,
                };
                this.options = {
                    containerId: 'XssNotifyBox',
                    containerCss: 'xss-notify',
                };
                this.proxies = {
                    popup: false,
                    iframe: true,
                    prompt: false,
                    checking: null,
                };
                this.autoLoad = true;
                this.blocked = false;
                this.urlStates = {};
                this.windowHandle = null;
                this.iframeProxy = null;
                this.dialogProxy = null;
                this.static = {
                    relayID: '___msgRelay___',
                    loader: "data:text/html;charset=utf-8,%EF%BB%BF%3C!DOCTYPE%20html%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%3Chead%3E%0D%0A%20%20%20%20%3Ctitle%3EScript%20Importer%3C%2Ftitle%3E%0D%0A%20%20%20%20%3Cstyle%3E%0D%0A%20%20%20%20%20%20%20%20%40import%20url('https%3A%2F%2Fmaxcdn.bootstrapcdn.com%2Fbootstrap%2F3.3.5%2Fcss%2Fbootstrap.min.css')%3B%0D%0A%20%20%20%20%20%20%20%20%40import%20url('https%3A%2F%2Fmaxcdn.bootstrapcdn.com%2Fbootstrap%2F3.3.5%2Fcss%2Fbootstrap-theme.min.css')%3B%0D%0A%20%20%20%20%20%20%20%20%40import%20url('https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Ffont-awesome%2F4.3.0%2Fcss%2Ffont-awesome.min.css')%3B%0D%0A%20%20%20%20%3C%2Fstyle%3E%0D%0A%20%20%20%20%3Clink%20href%3D%22assets%2Fcss%2Fvendor%2Ffont-awesome-animation.min.css%22%20rel%3D%22stylesheet%22%20%2F%3E%0D%0A%20%20%20%20%3C!--%0D%0A%20%20%20%20--%3E%0D%0A%20%20%20%20%3Cmeta%20http-equiv%3D%22Content-Security-Policy%22%20content%3D%22script-src%20'self'%20'unsafe-inline'%20'unsafe-eval'%3B%20child-src%20'none'%3B%20object-src%20'none'%22%3E%0D%0A%3C%2Fhead%3E%0D%0A%3Cbody%20style%3D%22overflow%3A%20hidden%3B%22%3E%0D%0A%20%20%20%20%3Cdiv%20class%3D%22thumbnail%22%20style%3D%22position%3Aabsolute%3B%20top%3A0%3B%20left%3A%200%3B%20right%3A%200%3B%20bottom%3A%200%3B%20display%3A%20flex%3B%20flex-direction%3Acolumn%3B%20background-color%3A%20rgba(255%2C%20255%2C%20255%2C%200.75)%22%3E%0D%0A%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%22form%22%20style%3D%22flex-grow%3A%200%3B%20flex-shrink%3A0%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%22input-group%20input-group-sm%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%22input-group-addon%22%3EURL%3A%3C%2Fspan%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cinput%20id%3D%22txtUrl%22%20type%3D%22text%22%20class%3D%22form-control%22%20placeholder%3D%22Enter%20url%20to%20import...%22%20value%3D%22https%3A%2F%2Fcode.jquery.com%2Fjquery-2.1.4.min.js%22%20%2F%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ca%20class%3D%22input-group-addon%20btn%20btn-default%22%20onclick%3D%22closeFrame()%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Close%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fa%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%3Cdiv%20id%3D%22srcUrl%22%20class%3D%22row%22%20style%3D%22flex-grow%3A%201%3B%20flex-shrink%3A1%3B%20display%3A%20flex%3B%20flex-direction%3Acolumn%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%22col%20col-xs-12%20col-md-12%22%20style%3D%22flex-grow%3A%201%3B%20display%3A%20flex%3B%20flex-direction%3Acolumn%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ca%20id%3D%22lnkBtn%22%20onclick%3D%22loadScript(document.getElementById('txtUrl').value)%22%20class%3D%22btn%20btn-lg%20btn-primary%22%20style%3D%22padding%3A24px%3B%20font-size%3A%2024px%3B%20flex-grow%3A%201%3B%20text-align%3A%20center%3B%20vertical-align%3A%20middle%20!important%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ci%20id%3D%22lnkIco%22%20class%3D%22fa%20fa-cloud-download%20faa-float%20animated%20fa-4x%22%3E%3C%2Fi%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20id%3D%22lnkTxt%22%3EAttach%20Script%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fa%3E%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%20%20%20%20%3Ctextarea%20id%3D%22txtOut%22%20style%3D%22display%3Anone%3B%20flex-grow%3A%201%3B%20flex-direction%3Acolumn%3B%20border%3A%20none%3B%20margin%3A%204px%3B%20font-family%3Amonospace%3B%20font-size%3A%209px%3B%22%3ENo%20Result%3C%2Ftextarea%3E%0D%0A%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%3Cdiv%20style%3D%22cursor%3Apointer%3B%20position%3A%20absolute%3B%20left%3A0%3B%20bottom%3A%200%3B%20right%3A0%3B%20text-align%3A%20center%3B%20font-size%3A%2011px%3B%20padding%3A%202px%3B%22%3E%0D%0A%20%20%20%20%20%20%20%20%3Ca%20id%3D%22lnkOut%22%20style%3D%22display%3Anone%3B%20color%3A%20%23808080%3B%20text-decoration%3A%20none%3B%20white-space%3A%20nowrap%3B%20%20overflow%3A%20hidden%3B%20%20text-overflow%3A%20ellipsis%3B%22%3ENavigate%20to%20remote%20URL%3C%2Fa%3E%0D%0A%20%20%20%20%3C%2Fdiv%3E%0D%0A%20%20%20%20%3Cscript%3E%0D%0A%20%20%20%20%20%20%20%20var%20autoLoad%20%3D%20false%3B%0D%0A%20%20%20%20%20%20%20%20var%20pendingQueue%20%3D%20%5B%5D%3B%0D%0A%20%20%20%20%20%20%20%20var%20isBusyLoading%20%3D%20false%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20init()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Attach%20callback%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20targ%20%3D%20window%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(targ%20%26%26%20targ.addEventListener)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targ.addEventListener('message'%2C%20listener%2C%20false)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(targ%20%26%26%20targ.attachEvent)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targ.attachEvent('onmessage'%2C%20listener)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.warn('Warning%3A%20'%20%2B%20ex.message)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20listener(event)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2Fif%20(event.origin%20!%3D%3D%20window.location.href)%20return%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20var%20data%20%3D%20event.data%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(data%20%26%26%20data.length%20%26%26%20data.forEach)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data.forEach(function%20(item)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20switch%20(item.type)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20case%20'queue'%3A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20queue(item.url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20queue(url%2C%20callback)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(!pendingQueue.filter(function%20(itm)%20%7B%20return%20url%20%3D%3D%20itm%20%7D).length)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pendingQueue.push(%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%3A%20url%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20callback%3A%20callback%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.warn('Already%20queued%3A'%2C%20url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(!isBusyLoading%20%26%26%20pendingQueue.length)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20itm%20%3D%20pendingQueue.splice(0%2C%201)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20loadScript(itm%5B0%5D.url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20setCloser()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Close%20this%20window%20if%20no%20further%20instructions%20after%20timeout%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20var%20intv%20%3D%20setInterval(function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(!isBusyLoading)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20clearInterval(intv)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20closeFrame()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%20500)%3B%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20handleSuccess(url%2C%20result)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkBtn)%20lnkBtn.className%20%3D%20'btn%20btn-lg%20btn-success'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkIco)%20lnkIco.className%20%3D%20'fa%20fa-check%20faa-pulse%20animated%20fa-4x'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkTxt)%20lnkTxt.innerHTML%20%3D%20'Success'%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Clear%20busy%20flag...%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20isBusyLoading%20%3D%20false%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Set%20result%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(txtOut)%20txtOut.value%20%3D%20result%20%7C%7C%20''%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.innerText%20%3D%20'Show%20%2F%20Hide%20Respone%20Text'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.style.display%20%3D%20'block'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.onclick%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(result%20%26%26%20srcUrl%20%26%26%20txtOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20toggle%20%3D%20srcUrl.style.display%20!%3D%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20srcUrl.style.display%20%3D%20toggle%20%3F%20'none'%20%3A%20'flex'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtOut.style.display%20%3D%20toggle%20%3F%20'flex'%20%3A%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtOut.select()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20false%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Reply%20with%20response%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20respond(%5B%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%3A%20url%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%3A%20result%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'script'%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5D)%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.groupEnd()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20handleException(url%2C%20ex)%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20handleException(url%2Cex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20console.error(ex)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20isBusyLoading%20%3D%20false%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkBtn)%20lnkBtn.className%20%3D%20'btn%20btn-lg%20btn-danger'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkIco)%20lnkIco.className%20%3D%20'fa%20fa-times-circle%20faa-ring%20animated%20fa-4x'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkTxt)%20lnkTxt.innerHTML%20%3D%20'Script%20Error'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.innerText%20%3D%20ex.message%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.style.display%20%3D%20'block'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.onclick%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(srcUrl%20%26%26%20txtOut%20%26%26%20txtOut.value)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20toggle%20%3D%20srcUrl.style.display%20!%3D%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20srcUrl.style.display%20%3D%20toggle%20%3F%20'none'%20%3A%20'flex'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtOut.style.display%20%3D%20toggle%20%3F%20'flex'%20%3A%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtOut.select()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.location.href%20%3D%20url%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20false%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20console.groupEnd()%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Fail%20response%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20respond(%5B%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20url%3A%20url%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'failed'%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%5D)%3B%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20loadScript(url%2C%20callback)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(isBusyLoading)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.warn('%20-%20Warn%3A%20Is%20Busy%20Loading...')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20queue(url%2C%20callback)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20isBusyLoading%20%3D%20true%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20txtUrl%20%3D%20document.getElementById('txtUrl')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20lnkBtn%20%3D%20document.getElementById('lnkBtn')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20lnkIco%20%3D%20document.getElementById('lnkIco')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20lnkTxt%20%3D%20document.getElementById('lnkTxt')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20srcUrl%20%3D%20document.getElementById('srcUrl')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20txtOut%20%3D%20document.getElementById('txtOut')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20lnkOut%20%3D%20document.getElementById('lnkOut')%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkBtn)%20lnkBtn.className%20%3D%20'btn%20btn-lg%20btn-default%20disabled'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkIco)%20lnkIco.className%20%3D%20'fa%20fa-refresh%20faa-spin%20animated%20fa-4x'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkTxt)%20lnkTxt.innerHTML%20%3D%20'Downloading'%3B%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(txtUrl)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20txtUrl.value%20%3D%20url%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.style.display%20%3D%20'none'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(url)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.groupCollapsed('%20%20%20G%20'%2C%20url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20xhttp%20%3D%20('XMLHttpRequest'%20in%20window)%20%3F%20new%20XMLHttpRequest()%20%3A%20xmlhttp%20%3D%20new%20ActiveXObject(%22Microsoft.XMLHTTP%22)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(xhttp)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20xhttp.onreadystatechange%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log('%20-%20Status%5B'%20%2B%20xhttp.readyState%20%2B%20'%5D%5B'%20%2B%20xhttp.statusText%20%2B%20'%5D%3A%20'%2C%20(xhttp.responseText%20%3F%20xhttp.responseText.length%20%3A%20'%3F'))%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(xhttp.readyState%20%3D%3D%20XMLHttpRequest.DONE)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(xhttp.status%20%3D%3D%20200)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20result%20%3D%20xhttp.responseText%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(result)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20handleSuccess(url%2C%20result)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20else%20if%20(xhttp.status%20%3D%3D%20400)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20throw%20new%20Error('There%20was%20an%20error%20400')%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(xhttp)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log('%20-%20xhttp'%2C%20xhttp)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(txtOut)%20txtOut.value%20%3D%20result%20%7C%7C%20''%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20throw%20new%20Error((xhttp.statusText%20%7C%7C%20'Server%20Retured%3A%20'%20%2B%20xhttp.status))%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20handleException(url%2C%20ex)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20xhttp.open(%22GET%22%2C%20url%2C%20true)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20xhttp.send()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20throw%20new%20Error('Enter%20a%20valid%20url')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.error(ex)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkBtn)%20lnkBtn.className%20%3D%20'btn%20btn-lg%20btn-danger'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkIco)%20lnkIco.className%20%3D%20'fa%20fa-exclamation-circle%20faa-tada%20animated%20fa-4x'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkTxt)%20lnkTxt.innerHTML%20%3D%20'Script%20Error'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(lnkOut)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.innerText%20%3D%20ex.message%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.style.display%20%3D%20'block'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20lnkOut.onclick%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20alert(ex.message)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.location.reload(true)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20false%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20respond(resp)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20var%20done%20%3D%20null%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20var%20targ%20%3D%20window.opener%20%7C%7C%20window.parent%20%7C%7C%20window%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20try%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20orig%20%3D%20'*'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(targ%20%26%26%20targ.postMessage)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targ.postMessage(resp%2C%20orig)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20done%20%3D%20true%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20catch%20(ex)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20done%20%3D%20false%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.warn('Warning%3A%20'%20%2B%20ex.message)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(!done%20%26%26%20targ)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20method%20%3D%20'remoteScriptSetResult'%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(method%20in%20targ)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20targ%5Bmethod%5D(resp)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20done%20%3D%20true%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.location.href%20%3D%20url%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(!isBusyLoading%20%26%26%20pendingQueue.length)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20itm%20%3D%20pendingQueue.splice(0%2C%201)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20loadScript(itm%5B0%5D.url)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(done)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20setCloser()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20function%20closeFrame()%20%7B%20%20%20%20%20%20%20%20%20%20%20%20%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(window.parent)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Ask%20parent%20to%20close...%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20respond(%5B%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'close'%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5D)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Fallback%2C%20close%20direct%20(if%20possible)...%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(!window.closed%20%26%26%20window.opener)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20window.close()%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20if%20(autoLoad)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20window.onload%20%3D%20function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20txtUrl%20%3D%20document.getElementById('txtUrl')%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(txtUrl%20%26%26%20txtUrl.value)%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Delay%20Load%201s%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20var%20intv%20%3D%20setInterval(function%20()%20%7B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20clearInterval(intv)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20loadScript(txtUrl.value)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%201000)%3B%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20%20%20%7D%0D%0A%0D%0A%20%20%20%20%20%20%20%20init()%3B%0D%0A%0D%0A%20%20%20%20%3C%2Fscript%3E%0D%0A%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A",
                };
            }
            RemoteScriptLoader.prototype.define = function (urls, detect, done, parentElem) {
                var _this = this;
                // Convert to an array
                urls = Array.isArray(urls) ? urls : (typeof urls === 'string' ? [urls] : []);
                urls.forEach(function (url) {
                    var info = (url in _this.urlStates) ? _this.urlStates[url] : null;
                    if (!info) {
                        // Create new item...
                        info = _this.create(url, detect, done, parentElem);
                        url = info.url;
                        console.log('   + ', url);
                        // Attach callbacks
                        if (info.listener) {
                            if (window.addEventListener) {
                                window.addEventListener('message', info.listener, false);
                            }
                            else {
                                window.attachEvent('onmessage', info.listener);
                            }
                        }
                    }
                    var elem = info ? info.elem : null;
                    if (url in _this.urlStates) {
                        _this.retry(url);
                        return; // Already Busy...
                    }
                    else {
                        // Attach to container
                        _this.urlStates[url] = info;
                        _this.infoBar(info);
                        // Check if script should be loaded?
                        if (info && (typeof info.qry === 'function') && info.qry(url)) {
                            _this.ready(url);
                            return; // Already defined...
                        }
                        else {
                            // Try and load the script tag...
                            info.tag = _this.attach(info, _this.result);
                        }
                    }
                });
            };
            RemoteScriptLoader.prototype.create = function (url, detect, done, parentElem) {
                var _this = this;
                var info = {
                    url: url,
                    tag: null,
                    qry: detect,
                    step: done,
                    elem: null,
                    state: null,
                    remote: null,
                    jscript: null,
                    parent: parentElem,
                    listener: null,
                    success: function () {
                        info.state = true;
                        _this.ready(info.url);
                    },
                    failure: function (ex) {
                        console.warn('Warning: ' + (ex ? ex.message : 'Failed to attach ' + info.url));
                        _this.failed(info.url, ex);
                    },
                    setResult: function (resp) {
                        if (!resp || !resp.length)
                            return;
                        resp.forEach(function (item) {
                            try {
                                switch (item.type) {
                                    case 'script':
                                        var source = item.data;
                                        var elem = _this.script(info, source, function (state, elem) {
                                            if (state) {
                                                info.success();
                                            }
                                            else {
                                                info.failure(new Error('Script error: ' + item.url));
                                            }
                                        });
                                        if (elem) {
                                            elem.setAttribute('relx', info.url);
                                            // Replace current node....
                                            var parentElem = (info.tag ? info.tag.parentNode : null) || document.body;
                                            if (parentElem && info.tag) {
                                                parentElem.replaceChild(elem, info.tag);
                                            }
                                            else {
                                                parentElem.appendChild(elem);
                                            }
                                            info.tag = elem;
                                        }
                                        break;
                                    case 'failed':
                                        info.failure(new Error('Child dialog failed to load.'));
                                        break;
                                    default:
                                        console.warn(' - Unknown posted message:', item);
                                        break;
                                }
                            }
                            catch (ex) {
                                console.error(ex);
                                info.failure(ex);
                            }
                        });
                    },
                };
                // Check if online resource...
                var webUrl = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/i;
                var noLines = url.indexOf('\r\n') < 0;
                if (noLines && webUrl.test(url)) {
                    // Remote script...
                    info.remote = true;
                    info.listener = function (event) {
                        //if (event.origin !== window.location.href) return
                        var destUrl = url;
                        if (!event || typeof event.data === 'string' || !Array.isArray(event.data)) {
                            console.warn('Warning: Unknown post message:', event);
                            return;
                        }
                        // Check if the is a result
                        var results = event.data.filter(function (element, index, array) {
                            return (element.url == destUrl);
                        }, url);
                        // Set the result...
                        if (results && results.length) {
                            info.setResult(results);
                        }
                    };
                }
                else {
                    // Inline script...
                    info.remote = false;
                    info.jscript = url;
                    info.url = 'local://' + this.guid() + '.js';
                    info.qry = function () {
                        return typeof detect === 'function' ? detect() : false;
                    };
                }
                return info;
            };
            RemoteScriptLoader.prototype.infoBar = function (info) {
                var _this = this;
                var url = info.url;
                var container = this.container();
                var elem = document.createElement('div');
                if (container) {
                    elem.className = 'bar info';
                    elem.innerHTML =
                        '<i class="fa fa-cog faa-spin animated" style="margin-right: 3px;"></i>' +
                            '<span>Loading: </span>' +
                            '<a target="_blank" href="' + url + '">' + url + '</a>' +
                            '<a href="#" style="float: right; margin-right: 8px;">Dismis</a>' +
                            '<a href="#" style="float: right; margin-right: 8px;">Retry</a>';
                    container.appendChild(elem);
                }
                info.elem = elem;
                var btnLink = (elem.childNodes.length > 2) ? elem.childNodes[2] : null;
                if (btnLink) {
                    btnLink.onclick = function () {
                        return _this.fetch(info);
                    };
                }
                var btnClose = (elem.childNodes.length > 3) ? elem.childNodes[3] : null;
                if (btnClose) {
                    btnClose.style.display = 'none';
                    btnClose.onclick = function () {
                        _this.failed(url, new Error('User dismissed error.'), true);
                        _this.remove(url);
                        return false;
                    };
                }
                var btnRetry = (elem.childNodes.length > 4) ? elem.childNodes[4] : null;
                if (btnRetry) {
                    btnRetry.style.display = 'none';
                    btnRetry.onclick = function () {
                        _this.retry(url);
                        return false;
                    };
                }
            };
            RemoteScriptLoader.prototype.guid = function () {
                // http://www.ietf.org/rfc/rfc4122.txt
                var s = [];
                var hexDigits = "0123456789abcdef";
                for (var i = 0; i < 36; i++) {
                    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
                s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
                s[8] = s[13] = s[18] = s[23] = "-";
                var uuid = s.join("");
                return uuid;
            };
            RemoteScriptLoader.prototype.container = function () {
                // Define container
                var container = document.getElementById(this.options.containerId);
                if (!container) {
                    container = document.createElement('div');
                    container.id = this.options.containerId;
                    container.className = this.options.containerCss;
                    container.style.left = '0';
                    container.style.right = '0';
                    container.style.bottom = '0';
                    container.style.fontSize = '11px';
                    container.style.position = 'absolute';
                    container.style.zIndex = '2110000000';
                    document.body.appendChild(container);
                }
                return container;
            };
            RemoteScriptLoader.prototype.fetch = function (info) {
                if (info.state) {
                    this.ready(info.url);
                }
                else {
                    // Open in new window...
                    this.retry(info.url);
                }
                return false;
            };
            RemoteScriptLoader.prototype.attach = function (info, callback) {
                var _this = this;
                try {
                    var url = info.url;
                    // Check for inline scripts
                    if (info.remote === false && info.jscript) {
                        var elem = this.script(info, info.jscript, function (state, elem) {
                            if (callback)
                                callback(url, state);
                        });
                        if (elem) {
                            elem.setAttribute('relx', info.url);
                            document.body.appendChild(elem);
                        }
                        return;
                    }
                    // Check if there has been failed script loads...
                    if (this.blocked && this.windowHandle) {
                        this.queue(url);
                    }
                    else {
                        // Note: This is a slight hackish way of doing things, 
                        //       but if a direct download is faster than loading 
                        //       the script tag (or when script tags are blocked)
                        //       we can rather use the direct result.
                        if (this.autoLoad) {
                            try {
                                var xhttp = ('XMLHttpRequest' in window) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
                                if (xhttp) {
                                    xhttp.onreadystatechange = function () {
                                        if (xhttp.status == 200 && xhttp.readyState == XMLHttpRequest.DONE) {
                                            var result = xhttp.responseText;
                                            if (result) {
                                                // Attach the script directly
                                                var elem = _this.script(info, result, function (state, elem) {
                                                    if (callback && state === true) {
                                                        // Signal that the script was asuccess...
                                                        if (callback)
                                                            callback(url, true);
                                                    }
                                                    else if (state === false) {
                                                        // Wait for onload timeout
                                                        if (callback)
                                                            callback(url, false);
                                                    }
                                                });
                                                if (elem) {
                                                    elem.setAttribute('relx', info.url);
                                                    // Replace current node....
                                                    var parentElem = (info.tag ? info.tag.parentNode : null) || document.body;
                                                    if (parentElem && info.tag) {
                                                        parentElem.replaceChild(elem, info.tag);
                                                    }
                                                    else {
                                                        parentElem.appendChild(elem);
                                                    }
                                                    info.tag = elem;
                                                }
                                            }
                                        }
                                        else if (xhttp.status == 400) {
                                            _this.autoLoad = false; // Disable auto loading
                                            if (callback)
                                                callback(url, false, new Error(xhttp.responseText));
                                        }
                                    };
                                    xhttp.onerror = function (error) {
                                        if (callback)
                                            callback(url, false, new Error('Script was blocked.'));
                                    };
                                    xhttp.open('GET', url, true);
                                    xhttp.send();
                                }
                            }
                            catch (ex) {
                                if (callback)
                                    callback(url, false, ex);
                                this.autoLoad = false; // Disable auto loading...
                            }
                        }
                        else {
                            // Try and load the script normally...
                            var scriptElem = document.createElement('script');
                            if (scriptElem) {
                                scriptElem.onload = function (evt) {
                                    _this.autoLoad = false; // Disable auto loading
                                    if (callback)
                                        callback(url, true);
                                };
                                scriptElem.src = url;
                                (info.parent || document.body).appendChild(scriptElem);
                            }
                        }
                        // Set timer to check for timeout
                        var intv = setInterval(function () {
                            if (callback) {
                                callback(url, false);
                            }
                            clearInterval(intv);
                        }, this.delay.timeout);
                    }
                }
                catch (ex) {
                    console.warn('Warning: Script refused to load. ' + ex.message);
                    callback(url, false);
                }
                return scriptElem;
            };
            RemoteScriptLoader.prototype.script = function (info, source, callback) {
                try {
                    // Try and load the script (marshalled)
                    var jscript = 'try { ' + '\r\n'
                        + '    window.' + this.static.relayID + '.status("' + info.url + '", null);' + '\r\n'
                        + '    ' + source + '\r\n'
                        + '    window.' + this.static.relayID + '.status("' + info.url + '", true);' + '\r\n'
                        + '} catch (ex) {' + '\r\n'
                        + '    window.' + this.static.relayID + '.status("' + info.url + '", false, ex); ' + '\r\n'
                        + '}';
                    var scriptElem = document.createElement('script');
                    if (scriptElem) {
                        scriptElem.textContent = jscript;
                    }
                    // Define container
                    var globals = window;
                    var relayer = globals[this.static.relayID] = globals[this.static.relayID] || {
                        events: {},
                        watch: function (relx, callback) {
                            if (relx in relayer.events) {
                                console.warn('Warning: Event ' + relx + ' already defined.');
                            }
                            relayer.events[relx] = callback;
                        },
                        forget: function (relx) {
                            if (relx in relayer.events) {
                                delete relayer.events[relx];
                            }
                            else {
                                console.warn('Warning: Event ' + relx + ' not found.');
                            }
                        },
                        status: function (relx, state, data) {
                            if (relx in relayer.events) {
                                relayer.events[relx](relx, state, data);
                            }
                            else {
                                console.warn('Warning: Event ' + relx + ' not found.');
                            }
                        },
                    };
                    if (!!window[this.static.relayID]) {
                        info.relay = window[this.static.relayID];
                        info.relay.watch(info.url, function (url, state, data) {
                            if (url == info.url) {
                                if (state === true) {
                                    info.success();
                                    if (callback)
                                        callback(true, scriptElem);
                                }
                                else if (state === false) {
                                    info.failure(data || new Error('Inline script failed with no further details.'));
                                    if (callback)
                                        callback(false, scriptElem, data);
                                }
                                if (state != null) {
                                    info.relay.forget(info.url);
                                }
                            }
                        });
                    }
                    return scriptElem;
                }
                catch (ex) {
                    console.warn('Warning: Script refused to load. ' + ex.message);
                    if (callback)
                        callback(false, null, ex);
                }
                return null;
            };
            RemoteScriptLoader.prototype.result = function (url, success) {
                var info = (url in this.urlStates) ? this.urlStates[url] : null;
                if (!success) {
                    // Failed to load script normally, try workaround...
                    this.retry(url);
                    // Notify script failed
                    var info = (url in this.urlStates) ? this.urlStates[url] : null;
                    if (info && info.step) {
                        info.step(url, info);
                    }
                }
                else {
                    // Loaded normally...
                    this.ready(url);
                }
            };
            RemoteScriptLoader.prototype.retry = function (url) {
                var _this = this;
                var info = (url in this.urlStates) ? this.urlStates[url] : null;
                if (info && !info.remote)
                    return;
                if (info && !info.state) {
                    // Detect if present...
                    if (info.qry && info.qry()) {
                        this.ready(url);
                        return; // Already loaded...
                    }
                    if (this.proxies.checking && this.confirmPopups(url)) {
                        this.retry(url);
                        return; // Switch proxies...
                    }
                    // Indicate to future calls that scripts are blocked
                    this.blocked = true;
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
                    var queueRequest = function (url) {
                        // Queue the request
                        var done = _this.queue(url);
                        if (!done) {
                            _this.checkStatus(url);
                        }
                    };
                    if (!this.windowHandle || this.windowHandle.closed) {
                        this.windowHandle = this.dialog(url, 320, 240);
                        // Load the external window
                        var debouncedMs = 500;
                        var debounced = setInterval(function () {
                            clearInterval(debounced);
                            queueRequest(url);
                        }, debouncedMs);
                    }
                    else {
                        queueRequest(url);
                    }
                    // Set a timer to check for reult (if exist)
                    var msCounter = 0;
                    var msChecker = this.delay.check; // Check every [n] milliseconds
                    var msTimeout = this.delay.timeout; //2 * 60 * 1000; // Timeout in 2 mins
                    if (!info.intv) {
                        info.intv = setInterval(function () {
                            // Count ellapsed time
                            msCounter += msChecker;
                            if (_this.windowHandle && _this.windowHandle.closed) {
                                _this.windowHandle = null;
                            }
                            // Check for timeout
                            if (info.intv && msCounter >= msTimeout) {
                                // Failed to load...
                                info.intv = clearInterval(info.intv);
                                return _this.failed(url, new Error('The following script timed out: ' + info.url));
                            }
                            // Check if loaded...
                            if (info.state || info.qry && info.qry()) {
                                // Done loading...
                                info.intv = clearInterval(info.intv);
                                return _this.ready(url);
                            }
                        }, msChecker);
                    }
                }
            };
            RemoteScriptLoader.prototype.queue = function (url) {
                var done = null;
                try {
                    // Send a request
                    var targ = this.windowHandle;
                    var req = [{
                            url: url,
                            type: 'queue',
                        }];
                    if (url in this.urlStates) {
                    }
                    else {
                        console.groupCollapsed(' -=> ' + url);
                    }
                    try {
                        var orig = '*';
                        if (targ && targ.postMessage) {
                            done = true;
                            targ.postMessage(req, orig);
                        }
                    }
                    catch (ex) {
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
                }
                catch (ex) {
                    done = false;
                    console.warn('Warning: ' + ex.message);
                    throw ex;
                }
                return done;
            };
            RemoteScriptLoader.prototype.ready = function (url) {
                var info = (url in this.urlStates) ? this.urlStates[url] : null;
                if (info && info.step) {
                    info.state = true;
                    info.step(url, info);
                }
                this.remove(url);
            };
            RemoteScriptLoader.prototype.failed = function (url, ex, confirmed) {
                var info = (url in this.urlStates) ? this.urlStates[url] : null;
                // Update UI state...
                if (info && info.elem && info.elem.childNodes.length > 4) {
                    info.elem.className = 'bar error';
                    info.elem.childNodes[0].className = 'fa fa-exclamation-circle faa-tada animated';
                    info.elem.childNodes[1].innerHTML = '<b>Failure:</b> ';
                    info.elem.childNodes[2].title = (ex ? ex.message : '') || url;
                    info.elem.childNodes[3].style.display = 'inline';
                    info.elem.childNodes[4].style.display = 'inline';
                }
                if (confirmed && info && info.step) {
                    info.state = false;
                    info.step(url, info, ex);
                }
            };
            RemoteScriptLoader.prototype.remove = function (url) {
                console.groupEnd();
                var dialog = this.dialogProxy;
                if (dialog && dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                    this.dialogProxy = null;
                }
                if (url in this.urlStates) {
                    var info = this.urlStates[url];
                    var intv = info.intv;
                    if (intv)
                        info.intv = clearInterval(intv);
                    var elem = info.elem;
                    if (elem && elem.parentNode) {
                        elem.parentNode.removeChild(elem);
                    }
                    // Remove callback
                    if (window.removeEventListener) {
                        window.removeEventListener('message', info.listener);
                    }
                    else {
                        window.detachEvent('onmessage', info.listener);
                    }
                    delete this.urlStates[url];
                }
            };
            RemoteScriptLoader.prototype.dialog = function (url, width, height) {
                var _this = this;
                var template = this.static.loader;
                var popupEnabled = this.proxies.popup;
                if (popupEnabled) {
                    try {
                        var left = screen.width - width;
                        var top = 0; //screen.height - height;
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
                        var win = window.open(template, 'Loading...', opts);
                        if (win) {
                            win['left'] = screen.width - win.outerWidth;
                            console.warn(' - Popup Opened...');
                            return win;
                        }
                        else {
                            console.warn(' - Popup blocked...');
                            //this.failed(url, new Error('Popup has been blocked!'));
                            return;
                        }
                    }
                    catch (ex) {
                        console.warn('Warning: ' + ex.message);
                    }
                }
                var iFrameEnabled = this.proxies.iframe;
                if (iFrameEnabled) {
                    console.warn(' - Create iframe...');
                    var iframe = document.createElement('iframe');
                    {
                        this.styleDialog(iframe, width, height);
                    }
                    this.iframeProxy = iframe;
                    document.body.appendChild(iframe);
                    var closeListener = function (event) {
                        var data = event.data;
                        if (data && data.length && data.forEach) {
                            data.forEach(function (item) {
                                switch (item.type) {
                                    case 'close':
                                        if (iframe.parentNode) {
                                            iframe.parentNode.removeChild(iframe);
                                        }
                                        _this.windowHandle = null;
                                        // Remove callback
                                        if (window.removeEventListener) {
                                            window.removeEventListener('message', closeListener);
                                        }
                                        else {
                                            window.detachEvent('onmessage', closeListener);
                                        }
                                        break;
                                }
                            });
                        }
                        if (closeTimeoutIntv) {
                            clearInterval(closeTimeoutIntv);
                            closeTimeoutIntv = null;
                        }
                    };
                    // Attach callbacks
                    if (window.addEventListener) {
                        window.addEventListener('message', closeListener, false);
                    }
                    else {
                        window.attachEvent('onmessage', closeListener);
                    }
                    // Set a timeout to check iframe
                    var closeTimeoutMs = this.delay.iframe;
                    var closeTimeoutIntv = setInterval(function () {
                        if (!closeTimeoutIntv)
                            return;
                        console.warn(' - Iframes blocked...');
                        clearInterval(closeTimeoutIntv);
                        _this.confirmPopups(url, true);
                        _this.checkStatus(url);
                    }, closeTimeoutMs);
                    try {
                        iframe.contentWindow.location.href = template;
                        return iframe.contentWindow.window;
                    }
                    catch (ex) {
                        iFrameEnabled = false;
                    }
                }
            };
            RemoteScriptLoader.prototype.checkStatus = function (url) {
                var _this = this;
                if (!this.dialogProxy) {
                    // Create notification dialog
                    var width = 128;
                    var height = 128;
                    var elem = document.createElement('div');
                    var link = document.createElement('a');
                    var text = '<i class="fa fa-minus-circle fa-4x"></i><div>Blocked</div>';
                    {
                        elem.className = 'thumbnail';
                        elem.style.position = 'relative';
                        elem.style.display = 'inline-block';
                        elem.style.width = width + 'px';
                        elem.style.height = height + 'px';
                        elem.appendChild(link);
                        link.innerHTML = text;
                        link.className = 'btn btn-danger';
                        link.style.width = '100%';
                        link.style.height = '100%';
                        link.style.fontSize = '20px';
                        link.onclick = function () {
                            _this.retry(url);
                        };
                    }
                    document.body.appendChild(elem);
                    this.dialogProxy = elem;
                    this.styleDialog(elem, width, height);
                }
            };
            RemoteScriptLoader.prototype.styleDialog = function (elem, width, height) {
                var left = screen.width - width;
                var top = 0; //screen.height - height;
                if (elem) {
                    elem.style.width = '' + width + 'px';
                    elem.style.height = '' + height + 'px';
                    elem.style.border = 'none';
                    elem.style.left = '' + left + 'px';
                    elem.style.top = '' + top + 'px';
                    elem.style.position = 'absolute';
                    elem.style.zIndex = '2109999999';
                }
            };
            RemoteScriptLoader.prototype.confirmPopups = function (url, ellapsed) {
                var message = 'Warning: The iframe is not responsive. \r\nSwitch to using window popus instead?';
                var iframe = this.iframeProxy;
                var active = this.proxies.checking && (this.proxies.prompt ? confirm(message) : true);
                if (active) {
                    if (iframe && iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                    this.windowHandle = null;
                    this.proxies.popup = true;
                    this.proxies.iframe = true;
                    this.proxies.prompt = false;
                    this.proxies.checking = null;
                    if (ellapsed)
                        this.retry(url);
                }
                return active;
            };
            return RemoteScriptLoader;
        })();
        loader.RemoteScriptLoader = RemoteScriptLoader;
    })(loader = proto.loader || (proto.loader = {}));
})(proto || (proto = {}));
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
/// <reference path="modules/imports.d.ts" />
/// <reference path="common.ts" />
// Register as a global class
if (typeof window !== 'undefined') {
    window['remoteScripts'] = proto.loader.RemoteScriptLoader;
}
