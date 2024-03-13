// ----------------------------------------------
// BDT common across all - DateVersion 2022-06-15 (will need a merge from apps) - removed ko out
// ----------------------------------------------


// ----------------------------------------------
// BDT vars
// ----------------------------------------------
var isBrowser = {
    IE: function () {
        var msie = window.navigator.userAgent.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) { return true; } else { return false; };
    }
};
var isMobile = {
    userAgent: function () { return window.navigator.userAgent.toLowerCase() },

    // returns null if false
    Android: function () { return isMobile.userAgent().match(/android/i) },
    BlackBerry: function () { return isMobile.userAgent().match(/blackberry/i) },
    iOS: function () { return isMobile.userAgent().match(/iphone|ipad|ipod/i) },
    OperaMini: function () { return isMobile.userAgent().match(/opera mini/i) },
    Tizen: function () { return isMobile.userAgent().match(/tizen/i) },
    Windows: function () { return isMobile.userAgent().match(/iemobile/i) },
    any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.OperaMini() || isMobile.Windows()) },

    version: {
        // returns 0 if false
        Android: function () {
            var check = isMobile.userAgent().match(/android\s([0-9\.]*)/), ver = check ? check[1] : 0;
            return parseFloat(ver);
        },
        iOS: function () {
            var ver = 0;
            if (!window.MSStream) {
                var appVersion;
                if (typeof window.navigator.appVersion !== 'undefined') {
                    appVersion = window.navigator.appVersion;
                    var match = appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), aVer;
                    if (match) {
                        aVer = [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3] || 0, 10)];
                        ver = aVer.join('.');
                    };
                };
            };
            return parseFloat(ver);
        }
    },

    // true / false statments (.test will return true or false)
    mobile: function () { return /mobile/.test(isMobile.userAgent()) },
    safari: function () { return /safari/.test(isMobile.userAgent()) },
    standalone: function () { if (typeof window.navigator.standalone !== 'undefined') { return window.navigator.standalone } else { return false } },

    iPad: function () { return /ipad/.test(isMobile.userAgent()) },
    iPhone: function () { return /iphone/.test(isMobile.userAgent()) },
    AndroidTab: function () { if (!isMobile.mobile() && isMobile.Android()) { return true } else { return false } },
    WindowTab: function () { return /tablet pc/.test(isMobile.userAgent()) },

    iOSapp: function () { if (!isMobile.standalone() && isMobile.safari()) { return false } else { return true } },

    matchUserAgent: function (value) { if (isMobile.userAgent().match(new RegExp(value, "i"))) { return true } else { return false } },

    storagebycookie: function () { if (isMobile.OperaMini()) { return true } else { return false } },
    inlandscape: function () { if (window.innerWidth > window.innerHeight) { return true } else { return false } },

    tablet: function () {
        if (isMobile.iPad() || isMobile.AndroidTab() || isMobile.WindowTab()) {
            return true
        } else if (isMobile.Android() || isMobile.Windows()) {
            if (isMobile.inlandscape() == false) {
                if (window.innerWidth > 620 && window.innerHeight > 560) { return true } else { return false };
            } else {
                if (window.innerWidth > 560 && window.innerHeight > 560) { return true } else { return false };
            };
        } else {
            return false
        };
    },
    wearable: function () { if (isMobile.Tizen()) { return true } else { return false } },
    computer: function () { if (isMobile.any() || isMobile.tablet() || isMobile.wearable()) { return false } else { return true } }
};
var isCordova = {
    inAppBrowser: function () { if (typeof cordova !== 'undefined' && typeof cordova.InAppBrowser !== 'undefined') { return true } else { return false }; },
    file: function () { if (typeof cordova !== 'undefined' && typeof cordova.file !== 'undefined') { return true } else { return false }; },
    fileTransfer: function () { if (typeof cordova !== 'undefined' && typeof FileTransfer !== 'undefined') { return true } else { return false }; },
    fileOpener2: function () { if (typeof cordova !== 'undefined' && typeof cordova.plugins !== 'undefined' && typeof cordova.plugins.fileOpener2 !== 'undefined') { return true } else { return false }; }
};


//-----------------------------------
// BDT files, cordova, loading
//-----------------------------------
function saveFileUrl(url, reply) {
    processDownloadFileUrl(url, 'save').done(function (data) { if (data) { reply(data.result); } else { reply(url); } }).fail(function () { reply(url); });
}
function openDownloadFileUrl(url, target, options) {
    return processDownloadFileUrl(url, 'open', target, options);
}
function processDownloadFileUrl(url, type, target, options) {   //private
    if (!target) target = '_blank';
    if (!options) getOpenOptions();
    if (typeof app != 'undefined' && app.isphonegap() == true) {
        if (isCordova.file() == true && isCordova.fileTransfer() == true && isCordova.fileOpener2() == true) {
            //console.log('processDownloadFileUrl');

            var fileURL = cordova.file.dataDirectory;                               //Persistent and private data storage
            if (isMobile.iOS()) fileURL = cordova.file.documentsDirectory;          //iOS only - Files private to the app, but that are meaningful to other application (e.g. Office files)
            if (isMobile.Android()) fileURL = cordova.file.externalDataDirectory;   //andriod only - app-specific data files on external storage - external apps cant access the other.
            var fileTransfer = new FileTransfer();
            var uri = encodeURI(url);
            var fileMIMEType = '', dfd = $.Deferred(); ;

            var i = url.indexOf(".nz/");
            if (i > 0) { fileURL += url.slice(i + 4); } else { fileURL += url.substring(url.lastIndexOf('/') + 1); };

            window.resolveLocalFileSystemURL(fileURL, fileExists, fileGet)

            function fileExists(fileEntry) {
                if (type == 'open') loaderShow('Opening file...');
                fileEntry.file(function (file) {
                    //console.log('fileExists file: ' + JSON.stringify(file));
                    fileMIMEType = file.type;
                    $.ajax({
                        type: 'HEAD',
                        url: url,
                        complete: function (xhr) {
                            var urlHeader = new Object();
                            urlHeader.type = xhr.getResponseHeader('Content-Type');
                            urlHeader.length = xhr.getResponseHeader('Content-Length');
                            urlHeader.lastModified = xhr.getResponseHeader('Last-Modified');
                            //console.log('getHeadersURL urlHeader: ' + JSON.stringify(urlHeader));
                            if (new Date(urlHeader.lastModified).getTime() > new Date().getTime(file.lastModified) || urlHeader.length && urlHeader.length != file.size) { // tested - works if url date = null
                                fileGet();
                            } else {
                                if (type == 'open') {
                                    cordova.plugins.fileOpener2.open(fileURL, fileMIMEType, { error: fileGet, success: fileOpenerSuccess });
                                } else {
                                    saveFileComplete(fileURL);
                                };
                            };
                        }
                    });
                });
            }
            function fileGet() {
                if (type == 'open') loaderShow('Getting file...');
                fileTransfer.download(uri, fileURL, fileTransferSuccess, fileTransferError, true, {}); 
            }
            function fileTransferSuccess(entry) {
                //console.log('uri: ' + uri + ', fileURL: ' + fileURL + ', download complete: ' + entry.toURL());
                //loaderHide();
                entry.file(function (file) {
                    //console.log('fileTransferSuccess file: ' + JSON.stringify(file));
                    if (type == 'open') {
                        fileMIMEType = file.type;
                        cordova.plugins.fileOpener2.open(fileURL, fileMIMEType, { error: fileOpenerError, success: fileOpenerSuccess });
                    } else {
                        saveFileComplete(fileURL);
                    };
                    
                });
            }
            function fileTransferError(e) {
                // error.code: [FileTransferError.] 1=FILE_NOT_FOUND_ERR, 2=INVALID_URL_ERR, 3=CONNECTION_ERR, 4=ABORT_ERR, 5=NOT_MODIFIED_ERR) 
                //console.log('download error source: ' + e.source + ', target:' + e.target + ', code:' + e.code);
                if (type == 'save') {
                    saveFileComplete(url);
                } else {
                    switch (e.code) {
                        case 3:
                            loaderHide();
                            popUpMsg('No downloaded file found and it seems you are not connected to the internet.')
                            break;
                        default:
                            loaderHide();
                            break;
                    };
                };
            }
            function fileOpenerError(e) {
                //console.log('fileOpenerError Error status: ' + e.status + ', message: ' + e.message);
                if (type == 'save') {
                    saveFileComplete(url);
                } else {
                    loaderHide();
                    popUpMsg(e.message)
                };
            }
            function fileOpenerSuccess(e) {
                //console.log('file opened successfully');
                loaderHide();
            }
            function saveFileComplete(result) {
                loaderHide();
                //console.log('result=' + result);
                dfd.resolve({ result: result });
            }
            if (type == 'save') return dfd.promise();

        } else if (isCordova.inAppBrowser() == true) {
            cordova.InAppBrowser.open(url, target, options);
        } else {
            window.open(url, target, options);
        };
    } else {
        window.open(url, target, options);
    };
}
function popUpMsg(msg, id) {
    var activepage = $("body").pagecontainer("getActivePage"), pagename = activepage.attr('id');
    if (!msg) msg = 'Loading...';
    if (!id) id = 'popupMsg_' + pagename;
    if ($('#' + id).length) {
        $('#' + id + ' p').html(msg);
    } else {
        var mPopUp = '<div data-role="popup" id="' + id + '" data-overlay-theme="b" data-theme="b" class="ui-corner-all">';
        mPopUp += '<a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-b ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>';
        mPopUp += '<div class="ui-corner-all " style="padding:20px;"><p>' + msg + '</p></div>';
        mPopUp += '</div>';
        activepage.append(mPopUp).enhanceWithin();
    };
    $('#' + id).popup('open');
}
function loaderShow(msg, hide) {
    var hideButton = '<a href="#" onclick="loaderHide()" class="ui-btn ui-corner-all ui-shadow ui-btn-b ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>';
    if (typeof hide == 'undefined') hide = true;
    if (!msg) msg = 'Loading...';
    if (!hide) hideButton = '';
    if ($('div.ui-loader-background').length == 0) $('body').append('<div class="ui-loader-background"></div>').enhanceWithin();
    $.mobile.loading("show", {
        text: msg,
        textVisible: true,
        theme: 'b',
        html: '<div class="ui-overlay-d loading">' + hideButton + '<img src="./n.gif" /><i>' + msg + '</i></div>'
    });
}
function loaderHide() {
    $.mobile.loading("hide");
}


// ----------------------------------------------
// BDT openers, nav, page changers
// ----------------------------------------------
function changeLocation(url) {
    document.location.href = url;
}
//function changePage(url) {} // this is done in main.js
function openExternalUrl(url, target, options) {
    //_self: Opens in the Cordova WebView if the URL is in the white list, otherwise it opens in the InAppBrowser.
    //_blank: Opens in the InAppBrowser.
    //_system: Opens in the system's web browser.
    //todo note - if cordova.InAppBrowser exists window.open() becomes cordova.InAppBrowser.open() so below isnt needed in andriod - need to test in iOS and if same result them remove so all is window.open()
    if (!target) target = '_blank';
    if (!options) getOpenOptions();
    if (typeof app != 'undefined' && app.isphonegap() == true && isCordova.inAppBrowser() == true) {
        if (isMobile.Android()) {
            if (url.indexOf(".pdf") > 0 || url.indexOf(".zip") > 0 || url.indexOf(".jp") > 0 || url.indexOf(".png") > 0 || url.indexOf(".xls") > 0 || url.indexOf(".doc") > 0) {   //Android devices cannot open up PDFs in a sub web view (inAppBrowser) so the PDF needs to be downloaded and then opened with whatevernative PDF viewer is installed on the app.
                openDownloadFileUrl(url);
            } else {
                cordova.InAppBrowser.open(url, target, options); 
            };
        } else {
            cordova.InAppBrowser.open(url, target, options);
        };
    } else {
        window.open(url, target, options);
    };
}
function openWindowUrl(url, target, options) {
    if (!options) getOpenOptions();
    if (!target) target = 'myWindow';
    _window = window.open(url, target, options);
    if (_window.opener !== null) _window.opener = self;
    _window.focus();
}
function panelNavClick(url, pageID, pagename) {
    if (pageID == pagename) {
        return ' data-rel="close"'
    } else {
        return ' onclick="changePage(\'' + url + '\');"'
    };
}
function getOpenOptions() {     //private
    if (isMobile.iOS()) {
        return 'location=no,enableViewportScale=yes'; //,disallowoverscroll=yes,toolbar=yes'
    } else if (isMobile.Android()) {
        return 'location=yes,zoom=yes';
    } else {
        return 'location=yes';
    };
}


// ----------------------------------------------
// BDT functions
// ----------------------------------------------

// use goTo in jQuery.extenders -- $('#r749').goTo();
function scrollToHash(hash, delay) {
    if (delay > 0) {
        setTimeout(goto, delay);
    } else {
        goto();
    };
    function goto() {
        location.hash = hash;
    }
}




function isInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)

    );
}




function getNow() { var d = new Date(); return d.getTime(); }
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        };
    }
}
function setCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    };
    document.cookie = name + "=" + value + expires + "; path=/";
}
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    };
    return "";
}
function deleteCookie(name, domain) {
    document.cookie = name + "=''; path=/" + ((domain) ? "; domain=" + domain : "") + "; expires=Thu, 01 Jan 1970 00:00:01 GMT";
}
function replaceLBR(str) {
    var ret = [];
    if (str !== null && str != '') ret = str.replace(/(?:\r\n|\r|\n)/g, '<br />');
    return ret;
}
function htmlEncode(value) { return $('<div/>').text(value).html(); }
function htmlDecode(value) { return $('<div/>').html(value).text(); }

//-----------------------------------
function isNumber(n) {
    // if valid returns true
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function validateHex(Hex) {
    // if valid returns true
    re = /^[0-9a-fA-F]+$/;
    return re.test(Hex);
}
function validateIP(value) {
    var retVal = false;
    var pattern = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
    if (!pattern.test(value)) {
        //Not Valid IP
        retVal = false;
    } else {
        var lastChar = value.substr(value.length - 1);
        if (lastChar == '.') { value = value.slice(0, -1); };
        var ip = value.split('.');
        if (ip.length == 4) {
            //Valid IP
            retVal = true;
        };
    };
    return retVal;
}
function validateIPSubnet(value) {
    var retVal = false;
    if (typeof value !== 'undefined' && value.length != '') {
        retVal = true;
        if (value.length == 3 && parseInt(value) > 255) retVal = false;
    } else {
        retVal = false;
    };
    return retVal;
}
function validateEmail(email) {
    // if valid returns true
    if (/\s+/.test(email)) {
        //console.log('email has whitespace');
        return false
    } else {
        //console.log('email test @ etc');
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    };
}
function validatePostCode(code) {
    // if valid returns true
    if (code.length = 4 && isNumber(code)) { return true; } else { return false; };
}
function validatePhone(phone) {
    // if valid returns true
    if (phone) {
        var cPhone = phone.toString(), valid = false;
        cPhone = cPhone.replace(/[\(\)\s\-]/g, '');
        if (cPhone.length < 9) {
            return false
        } else {
            //https://en.wikipedia.org/wiki/Telephone_numbers_in_New_Zealand
            var re = /^(0|(\+64(\s|-)?)){1}\d{1}(\s|-)?\d{3}(\s|-)?\d{4}$/; //landline
            valid = re.test(cPhone);
            if (!valid) {
                re = /^(0|(\+64(\s|-)?)){1}(20|21|22|27|28|29){1}(\s|-)?\d{3}(\s|-)?\d{3,}$/; //cell
                valid = re.test(cPhone);
            }
            return valid
        }
    } else {
        return false
    }
   
}
function validatePassword(password) {
    // if valid returns true
    re = /^[a-z0-9]+$/i
    return re.test(password);
}
//-----------------------------------
function chunkString(str, n) {
    var ret = [];
    var i;
    var len;
    for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
    }
    return ret
};
function replaceLineFeeds(str, value) {
    return str.replace(/(?:\r\n|\r|\n)/g, value);
};

function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}
function preload(arrayOfImages) {
    $(arrayOfImages).each(function () {
        $('<img/>')[0].src = this;
    });
}

function getKeyCode(str) { return str.charCodeAt(str.length - 1); } //private
function isKeyCodeArrowsDelBack(charCode) { if (charCode == 0 || charCode == 8 || charCode == 46 || (charCode >= 37 && charCode <= 40)) { return true; } else { return false; }; } //private
function disableKeyCodeById(id, code) {
    if (isMobile.Android()) {
        $(id).keyup(function (e) {
            e = e || window.event;
            var charCode = (typeof e.which == 'undefined') ? e.keyCode : e.which;
            if (charCode == 0 || charCode == 229) charCode = getKeyCode(this.value);
            if (charCode == code) {
                var charStr = String.fromCharCode(charCode); //console.log(charCode + ' ' + charStr);
                $(id).val(function (index, text) { return text.replace(charStr, '') });
                e.preventDefault();
                return false;
            };
        });
    } else {
        $(id).keypress(function (e) { if (e.which == code) { e.preventDefault(); return false; }; });
    };
}
function disableEnterKey() {
    if (isMobile.Android()) {
        $('input,select').keyup(function (e) {
            e = e || window.event;
            var charCode = (typeof e.which == 'undefined') ? e.keyCode : e.which;
            if (charCode == 13 || charCode == 10) { e.preventDefault(); return false; }
        });
    } else {
        $('input,select').keypress(function (e) { if (e.which == 13 || e.which == 10) { e.preventDefault(); return false; } });
    };
}
function disableSelecting() {
    $('input,textarea').bind('cut copy paste select', function (e) { e.preventDefault(); });  //disable cut,copy,paste,select
}

function inputOnlyHexByID(id) {
    if (isMobile.Android()) {
        $(id).keyup(function (e) {
            e = e || window.event;
            var charCode = (typeof e.which == 'undefined') ? e.keyCode : e.which;
            if (charCode == 0 || charCode == 229) charCode = getKeyCode(this.value);
            if (isKeyCodeArrowsDelBack(charCode) == false && (charCode < 48 || (charCode > 57 && charCode < 65) || (charCode > 70 && charCode < 97) || charCode > 102)) {
                var charStr = String.fromCharCode(charCode);
                $(id).val(function (index, text) { return text.replace(charStr, '') });
                e.preventDefault();
                return false;
            };
        });
    } else {
        $(id).keypress(function (e) { if (isKeyCodeArrowsDelBack(e.which) == false && (e.which < 48 || (e.which > 57 && e.which < 65) || (e.which > 70 && e.which < 97) || e.which > 102)) { e.preventDefault(); return false; }; });
    };
}
function inputTextOnlyNumbers(id) {
    if (!id) id = '.me-input-ip';
    if (isMobile.Android()) {
        $(id + ' input[type="text"]').keyup(function (e) {
            e = e || window.event;
            var charCode = (typeof e.which == 'undefined') ? e.keyCode : e.which;
            if (charCode == 0 || charCode == 229) charCode = getKeyCode(this.value);
            if (isKeyCodeArrowsDelBack(charCode) == false && (charCode < 48 || charCode > 57)) {
                var charStr = String.fromCharCode(charCode);
                $(id + ' input[type="text"]').val(function (index, text) { return text.replace(charStr, '') });
                e.preventDefault();
                return false;
            };
        });
    } else {
        $(id + ' input[type="text"]').keypress(function (e) {//console.log(e.which);
            if (isKeyCodeArrowsDelBack(e.which) == false && (e.which < 48 || e.which > 57)) { e.preventDefault(); return false; };
        });
    };
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function getPageName() {
    var activepage = $("body").pagecontainer("getActivePage");  // $.mobile.activePage;
    var pagename = activepage.attr('id');
    return pagename;
}
function imageExists(url, exists, timeout) {
    if (!timeout) timeout = 2000;
    var timer;
    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; }; }
    function handleFail() { this.onload = this.onabort = this.onerror = function () { }; clearTimer(); exists(false); }
    var img = new Image();
    img.onerror = img.onabort = handleFail;
    img.onload = function () { clearTimer(); exists(true); };
    img.src = url;
    timer = setTimeout(function (theImg) {
        return function () { handleFail.call(theImg); };
    } (img), timeout);
    return (img);
}


function convertBinary(number) {
    var binaryArr = [];
    for (; number; number >>= 1) {
        binaryArr.push(number & 1);
    }
    return binaryArr.reverse().join('');
}

function copyData(id, type) {
     // always select a div ID as ie will break if its a table ID.
    var body = document.body, range, sel, el = document.getElementById(id), msg = '';
    if (type) { type = type.toLowerCase(); } else { type = 'table'; };
   
    switch (type) {
        case 'table':
            msg = 'Data copied, open an application like Excel and either: Paste with this formating or Paste as text';
            break;

        case 'code':
            msg = 'Data copied, paste into your website source editor';
            break;

        default:
            msg = 'Data copied, either: Paste with this formating or Paste as text';
            break;
    };

    if (el) {
        switch (type) {
            
            case 'code':
                var textarea = document.createElement("textarea");
                textarea.textContent = el.innerHTML;
                textarea.style.position = "fixed"; 
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                try {
                    document.execCommand("copy");
                }
                catch (ex) {
                    console.warn("Copy to clipboard failed.", ex);
                    return false;
                }
                finally {
                    document.body.removeChild(textarea);
                }
                break;

            default:
                if (body.createTextRange) {
                    range = body.createTextRange();
                    range.moveToElementText(el);
                    range.select();
                    document.execCommand('copy');

                } else if (document.createRange && window.getSelection) {
                    range = document.createRange();
                    range.selectNodeContents(el);
                    sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                    document.execCommand('copy');

                };
                break;
        };
        
    } else {
        msg = 'No data';
    };
    alert(msg);
}

function copyFileText(url) {
    function fileReply(text) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        try {
            document.execCommand("copy");
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        };

        alert('Data copied, paste into your website source editor');
    }
    function fileError(e) {
        alert('No data');
    }
    xhrGetTxtFromFile(url, fileReply, fileError);
        
}

function replaceIDwithFileText(url, id) {

    function fileReply(text) {
        $('#' + id).html('hello');
        if (text) {
            document.getElementById(id).innerHTML = text;
            //document.body.appendChild(xhr.responseText)
        }
    }
    function fileError(e) {
        //document.getElementById(id).innerHTML = text
        $('#' + id).html('file is missing');
    }

    xhrGetTxtFromFile(url, fileReply, fileError);
} 

function xhrGetTxtFromFile(url, callback, error, async, timeout) {
    if (!timeout) timeout = 2000;
    if (typeof async == 'undefined') async = true;
    var result = false, errored = false, xhr = createXHR('GET', url, async);
    //console.log('async=' + async);
    if (xhr) {
        xhr.onreadystatechange = XHRhandler;
        if (async == true) {
            xhr.timeout = timeout;
            xhr.ontimeout = XHRtimeout;
        } else {
            setTimeout(function () {
                if (result == false) XHRerror('sync timeouted');
            }, timeout);
        };
        xhr.send(null);
    } else {
        XHRerror('no xhr');
    };
    function XHRhandler() {
        //console.log('XHRhandler readyState=' + xhr.readyState + ' status=' + xhr.status);
        if (xhr && xhr.readyState == 4 && xhr.status == 200) {
            result = true;
            try {
                if (callback) callback(xhr.responseText);
                XHRabort('found - finish');
            } catch (e) {
                XHRerror('no file');
            }
        }
        if (xhr && xhr.readyState == 4 && xhr.status == 0) XHRerror('cannot load');
    }
    function XHRerror(e) {
        //console.log('XHRerror= ' + e); if (xhr) console.log('XHRerror readyState=' + xhr.readyState + ' status=' + xhr.status);
        XHRabort('XHRerror= ' + e);
        if (errored == false && error) error(e);
        errored = true;
    }
    function XHRtimeout() { XHRabort('XHRtimeout'); }
    function XHRabort(m) { if (xhr) { xhr.abort(); xhr = null; }; console.log('XHRabort msg=' + m); }
}

//-----------------------------------


function runFunctionAfterDate(startDate, action) {
    var startDate = new Date(startDate - 60000); // minus a minute to allow for loop
    (function loop() {
        var now = new Date();
        if (now >= startDate) action();
        now = new Date();                  // allow for time passing
        var delay = 60000 - (now % 60000); // exact ms to next minute interval
        setTimeout(loop, delay);
    })();
}
function runFunctionsBetweenDates(startDate, endDate, inbetweenAction, beforeAfterAction) {
    var startDate = new Date(startDate - 60000); // minus a minute to allow for loop
    var endDate = new Date(endDate - 60000);
    //console.log('startDate=' + startDate + ', endDate=' + endDate);
    (function loop() {
        var now = new Date();
        if (now >= startDate && now <= endDate) {
            inbetweenAction();
        } else {
            beforeAfterAction();
        };
        now = new Date();
        var delay = 60000 - (now % 60000);
        setTimeout(loop, delay);
    })();
}
function makeDate(day, month, year, hours, minutes, action) {
    if (month != 0) month = month - 1;
    var retVal = new Date();
    retVal.setDate(day);
    retVal.setMonth(month);
    retVal.setFullYear(year);
    retVal.setHours(hours);
    retVal.setMinutes(minutes);
    retVal.setSeconds(0);
    return retVal
}




//-----------------------------------
// xml, xhr, ArrayBuffer
//-----------------------------------
function createXHR(method, url, async) {    //private
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) { // XHR for Chrome/Firefox/Opera/Safari/>=IE10
        xhr.open(method, url, async);
    } else if (typeof XDomainRequest != "undefined") { // XDomainRequest for <= IE9
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else { // CORS not supported.
        xhr = null;
    };
    return xhr;
}
function xhrGetXml(url, callback, error, async, timeout) {
    if (!timeout) timeout = 2000;
    if (typeof async == 'undefined') async = true;
    var result = false, errored = false, xhr = createXHR('GET', url, async);
    //console.log('async=' + async);
    if (xhr) {
        xhr.onreadystatechange = XHRhandler;
        if (async == true) {
            xhr.timeout = timeout;
            xhr.ontimeout = XHRtimeout;
        } else {
            setTimeout(function () {
                if (result == false) XHRerror('sync timeouted');
            }, timeout);
        };
        xhr.send(null);
    } else {
        XHRerror('no xhr');
    };
    function XHRhandler() {
        //console.log('XHRhandler readyState=' + xhr.readyState + ' status=' + xhr.status);
        if (xhr && xhr.readyState == 4 && xhr.status == 200) {
            result = true;
            try {
                var xml = (xhr.responseXML.documentElement);
                if (callback) callback(xml);
                XHRabort('found - finish');
            } catch (e) {
                XHRerror('no xml');
            }
        }
        if (xhr && xhr.readyState == 4 && xhr.status == 0) XHRerror('cannot load');
    }
    function XHRerror(e) {
        //console.log('XHRerror= ' + e); if (xhr) console.log('XHRerror readyState=' + xhr.readyState + ' status=' + xhr.status);
        XHRabort('XHRerror= ' + e);
        if (errored == false && error) error(e);
        errored = true;
    }
    function XHRtimeout() { XHRabort('XHRtimeout'); }
    function XHRabort(m) { if (xhr) { xhr.abort(); xhr = null; }; console.log('XHRabort msg=' + m); }
}
function xhrPostXml(url, xml, callback, error, async, timeout) {
    if (!timeout) timeout = 4000;
    if (typeof async == 'undefined') async = true;
    var result = false, errored = false, postXML = '<?xml version="1.0" encoding="UTF-8"?>' + xml, xhr = createXHR('POST', url, async);
    if (xhr) {
        xhr.onreadystatechange = XHRhandler;
        if (async == true) {
            xhr.timeout = timeout;
            xhr.ontimeout = XHRtimeout;
        } else {
            setTimeout(function () { if (result == false) XHRerror('sync timeouted') }, timeout);
        };

        xhr.send(postXML);
    } else {
        error('no xhr');
    };
    function XHRhandler() {
        //console.log('XHRhandler readyState=' + xhr.readyState + ' status=' + xhr.status);
        if (xhr && xhr.readyState == 4 && xhr.status == 200) {
            result = true;
            try {
                var xml = (xhr.responseXML.documentElement);
                if (callback) callback(xml);
                XHRabort('found - finish');
            } catch (e) {
                XHRerror('no xml');
            }
        }
        if (xhr && xhr.readyState == 4 && xhr.status == 0) XHRerror('cannot load');
    }
    function XHRerror(e) {
        //console.log('XHRerror= ' + e); if (xhr) console.log('XHRerror readyState=' + xhr.readyState + ' status=' + xhr.status);
        XHRabort('XHRerror= ' + e);
        if (errored == false && error) error(e);
        errored = true;
    }
    function XHRtimeout() { XHRabort('XHRtimeout'); }
    function XHRabort(m) { if (xhr) { xhr.abort(); xhr = null; }; console.log('XHRabort msg=' + m); }
}
function xmlGetElement(element, xml) {
    var xmlstr = xml2str(xml), retVal = '', data = xmlstr.match('<' + element + '>(.*?)<\/' + element + '>');
    if (data != null) retVal = data[1];
    return retVal
}
function xml2Str(xmlNode) { return xml2str(xmlNode) }
function xml2str(xmlNode) {
    try {
        return (new XMLSerializer()).serializeToString(xmlNode);
    }
    catch (e) {
        try {
            return xmlNode.xml
        }
        catch (e) {
            //Other browsers without XML Serializer
            console.log('Xmlserializer not supported');
        }
    }
    return false
}
function xml2json(node) {
    var data = {};
    // append a value
    function Add(name, value) {
        if (data[name]) {
            if (data[name].constructor != Array) {
                data[name] = [data[name]];
            }
            data[name][data[name].length] = value;
        } else {
            data[name] = value;
        }
    };
    try {
        // element attributes
        var c, cn;
        for (c = 0; cn = node.attributes[c]; c++) {
            Add(cn.name, cn.value);
        }
        // child elements
        for (c = 0; cn = node.childNodes[c]; c++) {
            if (cn.nodeType == 1) {
                if (cn.childNodes.length == 1 && cn.firstChild.nodeType == 3) {
                    // text value
                    Add(cn.nodeName, cn.firstChild.nodeValue);
                } else {
                    // sub-object
                    Add(cn.nodeName, xml2json(cn));
                }
            }
        }
    }
    catch (e) { console.log('xml2json -- TypeError: Cannot read property "0" of undefined') }
    return data
}
function json2xml(o, tab) {
    var toXml = function (v, name, ind) {
        var xml = "";
        if (v instanceof Array) {
            for (var i = 0, n = v.length; i < n; i++) {
                xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            }
        }
        else if (typeof (v) == "object") {
            var hasChild = false;
            xml += ind + "<" + name;
            for (var m in v) {
                if (m.charAt(0) == "@")
                    xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                else
                    hasChild = true;
            }
            xml += hasChild ? ">" : "/>";
            if (hasChild) {
                for (var m in v) {
                    if (m == "#text")
                        xml += v[m];
                    else if (m == "#cdata")
                        xml += "<![CDATA[" + v[m] + "]]>";
                    else if (m.charAt(0) != "@")
                        xml += toXml(v[m], m, ind + "\t");
                }
                xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
            }
        }
        else {
            xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
        }
        return xml
    }, xml = "";
    for (var m in o) {
        xml += toXml(o[m], m, "");
    }
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "")
}
function ab2str(buf, type) {
    switch (type) {
        case 16:
            return String.fromCharCode.apply(null, new Uint16Array(buf));
            break;
        default:
            return String.fromCharCode.apply(null, new Uint8Array(buf));
            break;
    };
}
function str2ab(str, type) {
    switch (type) {
        case 16:
            var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
            var bufView = new Uint16Array(buf);
            break;
        default:
            var buf = new ArrayBuffer(str.length);
            var bufView = new Uint8Array(buf);
            break;
    };
    for (var i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function pageLog(a, msg) {
    if (typeof a == 'undefined') a = 0;
    if (a == 1) {
        if ($('#' + getPageName() + ' .ui-content .me-log').length == 0) { $('#' + getPageName() + ' .ui-content').append('<div class="me-log-ctr"><a class="ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all ui-mini" onclick="bdt.log(2)" role="button">clear</a><b>Console</b></div><div class="me-log"></div>') };
        $('.me-log').append('<p>' + msg + '</p>');
        $('.me-log-ctr').show();
        $('.me-log').show();
    } else if (a == 2) {
        $('.me-log').html('');
    } else {
        $('.me-log-ctr').hide();
        $('.me-log').html('');
        $('.me-log').hide();
    };

}




// ----------------------------------------------
// jq extas
// ----------------------------------------------

// register AJAX prefilter : options, original options
$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    if (!originalOptions.retryMax || !originalOptions.retryMax >= 2) return;
    if (!originalOptions.timeout > 0) return;
    if (originalOptions.retryCount) {
        originalOptions.retryCount++;
    } else {
        originalOptions.retryCount = 1;
        originalOptions._error = originalOptions.error;
    };
    options.error = function (_jqXHR, _textStatus, _errorThrown) {
        if (originalOptions.retryCount >= originalOptions.retryMax || _textStatus != 'timeout') {
            if (originalOptions._error) originalOptions._error(_jqXHR, _textStatus, _errorThrown);
            return;
        };
        $.ajax(originalOptions);
    };
});

// jQuery.XDomainRequest.js
// Author: Jason Moon - @JSONMOON
// IE8+
if (!jQuery.support.cors && jQuery.ajaxTransport && window.XDomainRequest) {
    var httpRegEx = /^https?:\/\//i;
    var getOrPostRegEx = /^get|post$/i;
    var sameSchemeRegEx = new RegExp('^' + location.protocol, 'i');
    var htmlRegEx = /text\/html/i;
    var jsonRegEx = /\/json/i;
    var xmlRegEx = /\/xml/i;

    // ajaxTransport exists in jQuery 1.5+
    jQuery.ajaxTransport('text html xml json', function (options, userOptions, jqXHR) {
        // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
        if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(options.url) && sameSchemeRegEx.test(options.url)) {
            var xdr = null;
            var userType = (userOptions.dataType || '').toLowerCase();
            return {
                send: function (headers, complete) {
                    xdr = new XDomainRequest();
                    if (/^\d+$/.test(userOptions.timeout)) {
                        xdr.timeout = userOptions.timeout;
                    }
                    xdr.ontimeout = function () {
                        complete(500, 'timeout');
                    };
                    xdr.onload = function () {
                        var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
                        var status = {
                            code: 200,
                            message: 'success'
                        };
                        var responses = {
                            text: xdr.responseText
                        };
                        try {
                            if (userType === 'html' || htmlRegEx.test(xdr.contentType)) {
                                responses.html = xdr.responseText;
                            } else if (userType === 'json' || (userType !== 'text' && jsonRegEx.test(xdr.contentType))) {
                                try {
                                    responses.json = jQuery.parseJSON(xdr.responseText);
                                } catch (e) {
                                    status.code = 500;
                                    status.message = 'parseerror';
                                    //throw 'Invalid JSON: ' + xdr.responseText;
                                }
                            } else if (userType === 'xml' || (userType !== 'text' && xmlRegEx.test(xdr.contentType))) {
                                var doc = new ActiveXObject('Microsoft.XMLDOM');
                                doc.async = false;
                                try {
                                    doc.loadXML(xdr.responseText);
                                } catch (e) {
                                    doc = undefined;
                                }
                                if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                                    status.code = 500;
                                    status.message = 'parseerror';
                                    throw 'Invalid XML: ' + xdr.responseText;
                                }
                                responses.xml = doc;
                            }
                        } catch (parseMessage) {
                            throw parseMessage;
                        } finally {
                            complete(status.code, status.message, responses, allResponseHeaders);
                        }
                    };
                    // set an empty handler for 'onprogress' so requests don't get aborted
                    xdr.onprogress = function () { };
                    xdr.onerror = function () {
                        complete(500, 'error', {
                            text: xdr.responseText
                        });
                    };
                    var postData = '';
                    if (userOptions.data) {
                        postData = (jQuery.type(userOptions.data) === 'string') ? userOptions.data : jQuery.param(userOptions.data);
                    }
                    xdr.open(options.type, options.url);
                    xdr.send(postData);
                },
                abort: function () {
                    if (xdr) {
                        xdr.abort();
                    }
                }
            };
        }
    });
}




// ----------------------------------------------
// jQuery.extenders
// ----------------------------------------------

$.fn.extend({
    disableSelection: function () {
        this.each(function () {
            this.onselectstart = function () {
                //console.log('disableSelection');
                return false;
            };
            this.unselectable = "on";
            $(this).css('-moz-user-select', 'none');
            $(this).css('-webkit-user-select', 'none');
        });
        return this;
    },
    disablePaste: function () {
        this.bind('paste', function (e) { e.preventDefault(); });
        return this;
    },
    goTo: function (addToScroll, speed) {
        if (!addToScroll) addToScroll = 0;
        if (!speed) speed = 0; //use to be 'fast'
        if ($(this).length) {
            var top = $(this).offset().top + addToScroll;
            //console.warn('** goTo top:' + top + ' top:' + $(this).offset().top + ' addToScroll:' + addToScroll);

            if (isMobile.any()) {
                window.scrollTo(0, top);

            } else if ('parentIFrame' in window) {
                setTimeout(function () { window.parentIFrame.scrollToOffset(0, top) }, 100);

            } else {
                $('html, body').animate({ scrollTop: top + 'px' }, speed);

            };
        } else {
            console.warn('** .goTo() error:  element does not exist');
        };

        return this;
    },
    followTo: function (parent) {
        var $this = this,
            $window = $(window),
            $parent = $(parent),
            offset = $this.offset(),
            blockHeight = $this.height(),
            parentHeight = $parent.height(),
            topPadding = 20,
            topMargin = 0;
        
        $window.scroll(function (e) {
            if ($window.scrollTop() + topPadding > offset.top) {
                //console.log('st:' + $window.scrollTop());
                //console.log('os:' + $parent.offset().top);
                //console.log('ph:' + (parentHeight));
                //console.log('poff:' + ($parent.offset().top));
                //console.log('bh:' + blockHeight);
                //console.log(parentHeight - blockHeight + topPadding - $parent.offset().top);
                //console.log(parentHeight - blockHeight + topPadding);
                //console.log($window.scrollTop() + topPadding);

                if (($window.scrollTop() + topPadding - $parent.offset().top) > (parentHeight - blockHeight + topPadding)) {
                    topMargin = parentHeight - blockHeight + topPadding;

                } else {
                    topMargin = $window.scrollTop() - offset.top + topPadding;
                };
            } else {
                topMargin = 0;
            };
            $this.css({ marginTop: topMargin });
            //$this.stop().animate({marginTop: topMargin});
        });
        return this;
    }
});

//(function ($) {
//    $.fn.example = function (addToScroll, speed) {};
//})(jQuery);



(function () {
    // Identify text area elements and assign reformatTextArea() function to their `blur` (which is lost focus) events.
    const sourceAreas = document.querySelectorAll('input');
    for (let i = 0; i < sourceAreas.length; i++) {
        sourceAreas[i].addEventListener('blur', function () {
            cleanseElement(this)
        })
    }

    // Replace offending Unicode characters. Add others as needed.
    function cleanseText(text) {
        const HIGHEST_POSSIBLE_CHAR_VALUE = 127
        const GENERIC_REPLACEMENT_CHAR = ' ';
        let goodChars = [];

        // Swap out known offenders. Add others as needed.        
        // https://unicode-table.com/en/#basic-latin
        let strippedText = text
            .replace(/[\u2014]/g, "--")        // emdash
            .replace(/[\u2022]/g, "*")         // bullet
            .replace(/[\u2018\u2019]/g, "'")   // smart single quotes
            .replace(/[\u201C\u201D]/g, '"');  // smart double quotes

        // Strip out any other offending characters.
        for (let i = 0; i < strippedText.length; i++) {
            if (strippedText.charCodeAt(i) <= HIGHEST_POSSIBLE_CHAR_VALUE) {
                goodChars.push(strippedText.charAt(i));
            }
            else {
                goodChars.push(GENERIC_REPLACEMENT_CHAR);
            }
        }

        return goodChars.join('');
    };

    function cleanseElement(element) {
        element.value = cleanseText(element.value);
    }
})();

//function createModalGroup(elId) {
//    if (document.getElementById(elId) != null) {

//        var modalButtons = document.querySelectorAll('.modal-btn')
//        modalButtons.forEach(function (item, index) {
//            console.log(item, index);


//            item.dataset.micromodalTrigger = 'modal-' + (index + 1)
//            var heading = item.dataset.heading
//            var content = item.dataset.content

//            $('#m_main').append(createModal(index + 1, heading, content))
//        });
//    }
//}

//function createModal(index, heading, content) {
//    var modal = document.createElement('div');
//    modal.className = 'modal'
//    modal.classList.add("modal", "micromodal-slide");
//    modal.setAttribute('id', 'modal-' + index)
//    modal.ariaHidden = "true"

//    var modalOverlay = document.createElement('div')
//    modalOverlay.className = 'modal__overlay'
//    modalOverlay.tabIndex = '-1'
//    modalOverlay.dataset.micromodalClose = ''
//    modal.appendChild(modalOverlay)

//    var modalContainer = document.createElement('div')
//    modalContainer.className = 'modal__container'
//    modalContainer.role = 'dialog'
//    modalContainer.ariaModal = 'true'
//    modalContainer.ariaLabelledby = 'modal-' + index + '-title'
//    modalOverlay.appendChild(modalContainer)

//    var modalHeader = document.createElement('header')
//    modalHeader.className = 'modal__header'
//    var modalHeading = document.createElement('h2')
//    modalHeading.innerHTML = heading
//    modalHeading.className = 'modal__title'
//    modalHeading.setAttribute('id', 'modal-' + index + '-title')

//    modalHeader.appendChild(modalHeading)
//    modalContainer.appendChild(modalHeader)

//    var modalMain = document.createElement('main')
//    modalMain.className = 'modal__content'
//    modalMain.setAttribute('id', 'modal-' + index + '-content')
//    var modalMainText = document.createElement('p')
//    modalMainText.innerHTML = content
//    modalMain.appendChild(modalMainText)

//    modalContainer.appendChild(modalMain)


//    return(modal)
//}


//$('#modalbtn').click(function () {
//})
