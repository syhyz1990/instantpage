// ==UserScript==
// @name              网页加速器
// @namespace         https://github.com/syhyz1990/instantpage
// @icon              https://www.baiduyun.wiki/instantpage.png
// @icon64            https://www.baiduyun.wiki/instantpage.png
// @version           1.2.2
// @author            YouXiaoHou
// @description       自动帮你加速网页中的超链接，加快打开网页的速度，实测符合条件的网页打开速度减少50%以上。
// @updateURL         https://www.baiduyun.wiki/instantpage.user.js
// @downloadURL       https://www.baiduyun.wiki/instantpage.user.js
// @license           AGPL
// @homepage          https://www.baiduyun.wiki/tool/install-instantpage.html
// @require           https://cdn.jsdelivr.net/npm/sweetalert2@10.15.6/dist/sweetalert2.min.js
// @resource          swalStyle https://cdn.jsdelivr.net/npm/sweetalert2@10.15.6/dist/sweetalert2.min.css
// @match             *://*/*
// @noframes
// @run-at            document-idle
// @grant             GM_openInTab
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             GM_registerMenuCommand
// @grant             GM_getResourceText
// ==/UserScript==

(function () {
    'use strict';

    const fixedStyle = ['www.baidu.com']; //弹出框错乱的网站css插入到<html>而非<head>
    let util = {
        getValue(name) {
            return GM_getValue(name);
        },
        setValue(name, value) {
            GM_setValue(name, value);
        },
        include(str, arr) {
            str = str.replace(/[-_]/ig, '');
            for (let i = 0, l = arr.length; i < l; i++) {
                let val = arr[i];
                if (val !== '' && str.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                    return true;
                }
            }
            return false;
        },
        addStyle(id, tag, css) {
            tag = tag || 'style';
            let doc = document, styleDom = doc.getElementById(id);
            if (styleDom) return;
            let style = doc.createElement(tag);
            style.rel = 'stylesheet';
            style.id = id;
            tag === 'style' ? style.innerHTML = css : style.href = css;
            let root = this.include(location.href, fixedStyle);
            root ? doc.documentElement.appendChild(style) : doc.getElementsByTagName('head')[0].appendChild(style);
        }
    };

    let main = {
        /**
         * 配置默认值
         */
        initValue() {
            let value = [{
                name: 'setting_success_times',
                value: 0
            }, {
                name: 'allow_external_links',
                value: true
            }, {
                name: 'allow_query_links',
                value: false
            }, {
                name: 'enable_target_self',
                value: false
            }, {
                name: 'enable_animation',
                value: false
            }, {
                name: 'delay_on_hover',
                value: 65
            }, {
                name: 'exclude_list',
                value: ''
            }, {
                name: 'exclude_keyword',
                value: 'login\nlogout\nregister\nsignin\nsignup\nsignout\npay\nadd\ncreate\nedit\ndownload\ndel\nreset\nsubmit\ndoubleclick\ngoogleads\nexit'
            }];

            value.forEach((v) => {
                util.getValue(v.name) === undefined && util.setValue(v.name, v.value);
            });
        },

        registerMenuCommand() {
            GM_registerMenuCommand('已加速：' + util.getValue('setting_success_times') + '次', () => {
                Swal.fire({
                    showCancelButton: true,
                    title: '确定要重置加速次数吗？',
                    icon: 'warning',
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    customClass: {
                        popup: 'instant-popup',
                    },
                }).then((res) => {
                    if (res.isConfirmed) {
                        util.setValue('setting_success_times', 0);
                        history.go(0);
                    }
                });
            });
            GM_registerMenuCommand('设置', () => {
                let dom = `<div style="font-size: 1em;">
                              <label class="instant-setting-label">加速外部链接<input type="checkbox" id="S-External" ${util.getValue('allow_external_links') ? 'checked' : ''} class="instant-setting-checkbox"></label>
                              <label class="instant-setting-label"><span>加速含参数链接（谨慎开启） <a href="https://www.baiduyun.wiki/tool/install-instantpage.html#配置说明">详见</a></span><input type="checkbox" id="S-Query" ${util.getValue('allow_query_links') ? 'checked' : ''} 
                              class="instant-setting-checkbox"></label>
                              <label class="instant-setting-label">加速链接在本页打开<input type="checkbox" id="S-Target" ${util.getValue('enable_target_self') ? 'checked' : ''} class="instant-setting-checkbox"></label>
                              <label class="instant-setting-label">加速动画效果<input type="checkbox" id="S-Animate" ${util.getValue('enable_animation') ? 'checked' : ''} 
                              class="instant-setting-checkbox"></label>
                              <label class="instant-setting-label">链接预读延时（毫秒）<input type="number" min="65" id="S-Delay" value="${util.getValue('delay_on_hover')}" 
                              class="instant-setting-input"></label>
                              <label class="instant-setting-label-col">排除下列网址 <textarea placeholder="列表中的域名将不开启加速器，一行一个，例如：www.baidu.com" id="S-Exclude" class="instant-setting-textarea">${util.getValue('exclude_list')}</textarea></label>
                              <label class="instant-setting-label-col">排除下列关键词 <textarea placeholder="链接中含关键词将不开启加速器，一行一个，例如：logout" id="S-Exclude-Word" class="instant-setting-textarea">${util.getValue('exclude_keyword')}</textarea></label>
                            </div>`;
                Swal.fire({
                    title: '加速器配置',
                    html: dom,
                    showCloseButton: true,
                    confirmButtonText: '保存',
                    footer: '<div style="text-align: center;font-size: 1em;">点击查看 <a href="https://www.baiduyun.wiki/tool/install-instantpage.html" target="_blank">使用说明</a>，助手免费开源，<a href="https://www.baiduyun.wiki/instantpage.user.js">检查更新</a><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path d="M445.956 138.812L240.916 493.9c-11.329 19.528-12.066 44.214 0 65.123 12.067 20.909 33.898 32.607 56.465 32.607h89.716v275.044c0 31.963 25.976 57.938 57.938 57.938h134.022c32.055 0 57.938-25.975 57.938-57.938V591.63h83.453c24.685 0 48.634-12.803 61.806-35.739 13.172-22.844 12.343-50.016 0-71.386l-199.42-345.693c-13.633-23.58-39.24-39.516-68.44-39.516-29.198 0-54.897 15.935-68.438 39.516z" fill="#d81e06"/></svg></div>',
                    customClass: {
                        popup: 'instant-popup',
                    },
                }).then((res) => {
                    if (res.isConfirmed) {
                        history.go(0);
                    }
                });

                document.getElementById('S-External').addEventListener('change', (e) => {
                    util.setValue('allow_external_links', e.currentTarget.checked);
                });
                document.getElementById('S-Query').addEventListener('change', (e) => {
                    util.setValue('allow_query_links', e.currentTarget.checked);
                });
                document.getElementById('S-Target').addEventListener('change', (e) => {
                    util.setValue('enable_target_self', e.currentTarget.checked);
                });
                document.getElementById('S-Animate').addEventListener('change', (e) => {
                    util.setValue('enable_animation', e.currentTarget.checked);
                });
                document.getElementById('S-Delay').addEventListener('change', (e) => {
                    util.setValue('delay_on_hover', e.currentTarget.value);
                });
                document.getElementById('S-Exclude').addEventListener('change', (e) => {
                    util.setValue('exclude_list', e.currentTarget.value);
                });
                document.getElementById('S-Exclude-Word').addEventListener('change', (e) => {
                    util.setValue('exclude_keyword', e.currentTarget.value);
                });
            });
        },

        //在排除名单里
        inExcludeList() {
            let exclude = util.getValue('exclude_list').split('\n');
            let host = location.host;
            return exclude.includes(host);
        },

        //加速主代码
        instantPage() {
            if (window.instantLoaded) return;
            let mouseoverTimer;
            let lastTouchTimestamp;
            const prefetches = new Set();
            const prefetchElement = document.createElement('link');
            const isSupported = prefetchElement.relList && prefetchElement.relList.supports && prefetchElement.relList.supports('prefetch')
                && window.IntersectionObserver && 'isIntersecting' in IntersectionObserverEntry.prototype;
            const isOnline = () => window.navigator.onLine;
            const allowQueryString = 'instantAllowQueryString' in document.body.dataset || util.getValue('allow_query_links');
            const allowExternalLinks = 'instantAllowExternalLinks' in document.body.dataset || util.getValue('allow_external_links');
            const useWhitelist = 'instantWhitelist' in document.body.dataset;
            const mousedownShortcut = 'instantMousedownShortcut' in document.body.dataset;
            const DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION = 1111;
            const enableAnimation = util.getValue('enable_animation');
            const enableTargetSelf = util.getValue('enable_target_self');
            window.instantLoaded = true;
            const excludeKeyword = util.getValue('exclude_keyword').split('\n');

            let delayOnHover = util.getValue('delay_on_hover');
            let useMousedown = false;
            let useMousedownOnly = false;
            let useViewport = false;

            if ('instantIntensity' in document.body.dataset) {
                const intensity = document.body.dataset.instantIntensity;

                if (intensity.substr(0, 'mousedown'.length) == 'mousedown') {
                    useMousedown = true;
                    if (intensity == 'mousedown-only') {
                        useMousedownOnly = true;
                    }
                } else if (intensity.substr(0, 'viewport'.length) == 'viewport') {
                    if (!(navigator.connection && (navigator.connection.saveData || (navigator.connection.effectiveType && navigator.connection.effectiveType.includes('2g'))))) {
                        if (intensity == "viewport") {
                            if (document.documentElement.clientWidth * document.documentElement.clientHeight < 450000) {
                                useViewport = true;
                            }
                        } else if (intensity == "viewport-all") {
                            useViewport = true;
                        }
                    }
                } else {
                    const milliseconds = parseInt(intensity);
                    if (!isNaN(milliseconds)) {
                        delayOnHover = milliseconds;
                    }
                }
            }

            if (isSupported) {
                const eventListenersOptions = {
                    capture: true,
                    passive: true,
                };

                if (!useMousedownOnly) {
                    document.addEventListener('touchstart', touchstartListener, eventListenersOptions);
                }

                if (!useMousedown) {
                    document.addEventListener('mouseover', mouseoverListener, eventListenersOptions);
                } else if (!mousedownShortcut) {
                    document.addEventListener('mousedown', mousedownListener, eventListenersOptions);
                }

                if (mousedownShortcut) {
                    document.addEventListener('mousedown', mousedownShortcutListener, eventListenersOptions);
                }


                if (useViewport) {
                    let triggeringFunction;
                    if (window.requestIdleCallback) {
                        triggeringFunction = (callback) => {
                            requestIdleCallback(callback, {
                                timeout: 1500,
                            });
                        };
                    } else {
                        triggeringFunction = (callback) => {
                            callback();
                        };
                    }

                    triggeringFunction(() => {
                        const intersectionObserver = new IntersectionObserver((entries) => {
                            entries.forEach((entry) => {
                                if (entry.isIntersecting) {
                                    const linkElement = entry.target;
                                    intersectionObserver.unobserve(linkElement);
                                    preload(linkElement);
                                }
                            });
                        });

                        document.querySelectorAll('a').forEach((linkElement) => {
                            if (isPreloadable(linkElement)) {
                                intersectionObserver.observe(linkElement);
                            }
                        });
                    });
                }
            }

            function touchstartListener(event) {
                /* Chrome on Android calls mouseover before touchcancel so `lastTouchTimestamp`
                 * must be assigned on touchstart to be measured on mouseover. */
                lastTouchTimestamp = performance.now();

                const linkElement = event.target.closest('a');

                if (!isPreloadable(linkElement)) {
                    return;
                }

                preload(linkElement);
            }

            function mouseoverListener(event) {
                if (performance.now() - lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
                    return;
                }

                const linkElement = event.target.closest('a');

                if (!isPreloadable(linkElement)) {
                    return;
                }

                linkElement.addEventListener('mouseout', mouseoutListener, {passive: true});

                mouseoverTimer = setTimeout(() => {
                    preload(linkElement);
                    mouseoverTimer = undefined;
                }, delayOnHover);
            }

            function mousedownListener(event) {
                const linkElement = event.target.closest('a');

                if (!isPreloadable(linkElement)) {
                    return;
                }

                preload(linkElement);
            }

            function mouseoutListener(event) {
                if (event.relatedTarget && event.target.closest('a') == event.relatedTarget.closest('a')) {
                    return;
                }

                if (mouseoverTimer) {
                    clearTimeout(mouseoverTimer);
                    mouseoverTimer = undefined;
                }
            }

            function mousedownShortcutListener(event) {
                if (performance.now() - lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
                    return;
                }

                const linkElement = event.target.closest('a');

                if (event.which > 1 || event.metaKey || event.ctrlKey) {
                    return;
                }

                if (!linkElement) {
                    return;
                }

                linkElement.addEventListener('click', function (event) {
                    if (event.detail == 1337) {
                        return;
                    }

                    event.preventDefault();
                }, {capture: true, passive: false, once: true});

                const customEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    detail: 1337
                });
                linkElement.dispatchEvent(customEvent);
            }

            function isPreloadable(linkElement) {
                if (!linkElement || !linkElement.href) {
                    return;
                }

                if (util.include(linkElement.href, excludeKeyword)) {
                    return;
                }

                if (useWhitelist && !('instant' in linkElement.dataset)) {
                    return;
                }

                if (!allowExternalLinks && linkElement.origin != location.origin && !('instant' in linkElement.dataset)) {
                    return;
                }

                if (!['http:', 'https:'].includes(linkElement.protocol)) {
                    return;
                }

                if (linkElement.protocol === 'http:' && location.protocol === 'https:') {
                    if (linkElement.href.indexOf('http://www.baidu.com/link?url') === 0) {
                        linkElement.href = linkElement.href.replace('http', 'https');
                    } else {
                        return;
                    }
                }
                //下载文件不加速
                if (/\.[a-zA-Z0-9]{0,5}$/i.test(linkElement.href)) {
                    //排除域名，网站扩展名
                    if (!/(com|cn|top|ltd|net|tech|shop|vip|xyz|wang|cloud|online|site|love|art|xin|store|fun|cc|website|press|space|beer|luxe|video|ren|group|fit|yoga|org|pro|ink|biz|info|design|link|work|mobi|kim|pub|name|tv|co|asia|red|live|wiki|gov|life|world|run|show|city|gold|today|plus|cool|icu|company|chat|zone|fans|law|host|center|club|email|fund|social|team|guru|htm|html|php|asp|jsp)$/i.test(linkElement.href)) {
                        return;
                    }
                }

                if (!allowQueryString && linkElement.search && !('instant' in linkElement.dataset)) {
                    return;
                }

                if (linkElement.hash && linkElement.pathname + linkElement.search == location.pathname + location.search) {
                    return;
                }

                if (linkElement.dataset.filename || linkElement.dataset.noInstant) {
                    return;
                }

                return true;
            }

            function preload(linkElement) {
                let url = linkElement.href;
                if (!isOnline()) {
                    return;
                }

                if (prefetches.has(url)) {
                    return;
                }

                const prefetcher = document.createElement('link');
                prefetcher.rel = 'prefetch';
                prefetcher.href = url;
                document.head.appendChild(prefetcher);

                prefetches.add(url);

                if (enableAnimation) {
                    linkElement.classList.add("link-instanted");
                }
                if (enableTargetSelf) {
                    linkElement.target = '_self';
                }

                util.setValue('setting_success_times', util.getValue('setting_success_times') + 1);
            }
        },

        addPluginStyle() {
            let style = `
                .instant-popup { font-size: 14px !important; }
                .instant-setting-label { display: flex;align-items: center;justify-content: space-between;padding-top: 15px; }
                .instant-setting-label-col { display: flex;align-items: flex-start;;padding-top: 15px;flex-direction:column }
                .instant-setting-checkbox { width: 16px;height: 16px; }
                .instant-setting-textarea { width: 100%; margin: 14px 0 0; height: 60px; resize: none; border: 1px solid #bbb; box-sizing: border-box; padding: 5px 10px; border-radius: 5px; color: #666; line-height: 1.2; }
                .instant-setting-input { border: 1px solid #bbb; box-sizing: border-box; padding: 5px 10px; border-radius: 5px; width: 100px}
                 @keyframes instantAnminate { from { opacity: 1; } 50% { opacity: 0.4 } to { opacity: 0.85; }}
                .link-instanted { animation: instantAnminate 0.8s 1; animation-fill-mode:forwards }
                .link-instanted * { animation: instantAnminate 0.8s 1; animation-fill-mode:forwards }
            `;
            util.addStyle('swal-pub-style', 'style', GM_getResourceText('swalStyle'));
            util.addStyle('instant-style', 'style', style);
        },

        init() {
            this.initValue();
            this.addPluginStyle();
            this.registerMenuCommand();
            if (this.inExcludeList()) return;
            this.instantPage();
        }
    };
    main.init();
})();
