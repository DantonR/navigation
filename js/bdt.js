// ----------------------------------------------
// jquery
// ----------------------------------------------
var bdt = new bdtTools(), apiserver = "/", isMobileSite = false;
var site = {
    isMobileSite: function () { return isMobileSite },
    isDevServer: function () { if (window.location.hostname == 'local.mitsubishi-electric.co.nz' || window.location.hostname == 'dannyt.mitsubishi-electric.co.nz' || window.location.hostname == 'dev.mitsubishi-electric.co.nz' || window.location.hostname == 'win7-dannyt.bdh.co.nz') { return true } else { return false }; },
    isExternalApp: function () { return $("html").hasClass("me-app") },
    isExternalPage: function () { return $("html").hasClass("me-ep") },
    isTabletLandscape: function () {
        //console.log('innerWidth=' + window.innerWidth + 'innerHeight=' + window.innerHeight);
        if (isMobile.tablet() && window.innerWidth > 960) { return true } else { return false };
    },
    apiServer: function (apiURL) {
        var apiServer = 'https://www.mitsubishi-electric.co.nz/';
        if (!apiURL) apiURL = 'api/';
        if (site.isDevServer() == true) apiServer = location.protocol + '//' + window.location.hostname + '/';

        return apiServer + apiURL;
    }
};

$(document).ready(function () {
    $(document).on('click', 'a.ui-btn', function (e) { e.preventDefault(); });
    $('button').click(function (e) { e.preventDefault() });

});

function setMobileSite(value, user) {
    if (user) {
        deleteCookie('isMobileSite');
        if (value == true) { setCookie('userMobileSite', 'True') } else { setCookie('userMobileSite', 'False') };
    } else {
        deleteCookie('userMobileSite');
        if (value == true) { setCookie('isMobileSite', 'True') } else { setCookie('isMobileSite', 'False') };
    };
    location.reload();
}
if (site.isTabletLandscape() || isMobile.iPad()) {
    if (getCookie('isMobileSite') == 'True' && site.isExternalApp() == false) setMobileSite(false);
} else if (isMobile.tablet()) {
    if (getCookie('isMobileSite') == 'False') setMobileSite(true);
};


// iOS Fix
if (isMobile.iOS()) {
    //alert('im ios=' + window.navigator.userAgent.toLowerCase() + 'matchVersion=' + isMobile.matchUserAgent('os 6_0_1'));
    if (isMobile.matchUserAgent('os 8_4_1') == true) {
        $('#m_global_nav ul.dropdown_content a').bind('touchstart', function (e) { location.href = currentElement.href; });
    };
};


// loadingMsg
function loadingMsg(msg, options) {
    var activepage = $("body");
    if (!msg) msg = 'Loading...';

    if ($('#m_loading').length) {
        $('#m_loading' + ' i').html(msg);
    } else {
        var mPopUp = '', hideButton = '<a href="#" onclick="loadingMsgHide()" class="ui-btn fa fa-close fa-2x"></a>';
        mPopUp += '<div id="m_loading">'
        mPopUp += '<div class="ui-loader-background"></div>'
        mPopUp += '<div class="ui-loader"><div class="loading">' + hideButton + '<b class="fa fa-spinner fa-pulse fa-4x" ></b><i>' + msg + '</i></div></div>'
        //mPopUp += '<div class="ui-loader"><div class="loading">' + hideButton + '<img src="./n.gif" /><i>' + msg + '</i></div></div>'
        mPopUp += '</div>'
        activepage.append(mPopUp);
    };

    if (options) {
        if (options.bgclr) $('.ui-loader-background').css('background-color', options.bgclr);
        if (options.opacity) $('.ui-loader-background').css('opacity', options.opacity);
    }
    $('#m_loading').show();
}
function loadingMsgHide() {
    $('#m_loading').hide();
}


// MENUS
var navBtn = document.querySelector("header .hamburger");
var navMenu = document.querySelector("header .nav-menu");
var navLink = document.querySelectorAll("header .nav-link");
if (navBtn && navLink) {
    navBtn.addEventListener("click", mobileNavMenu);
    navLink.forEach(n => n.addEventListener("click", closeNavMenu));
}

function mobileNavMenu() {
    navBtn.classList.toggle("active");
    navMenu.classList.toggle("active");
}
function closeNavMenu() {
    navBtn.classList.remove("active");
    navMenu.classList.remove("active");
}

var contentBtn = document.querySelector(".content-btn");
var contentMenu = document.querySelector(".nav-content .nav-menu");
var contentLink = document.querySelectorAll(".nav-content .nav-link");
if (contentBtn && contentLink) {
    contentBtn.addEventListener("click", mobileContentMenu);
    contentLink.forEach(n => n.addEventListener("click", closeContentMenu));
}

function mobileContentMenu() {
    contentBtn.classList.toggle("active");
    contentMenu.classList.toggle("active");
}
function closeContentMenu() {
    contentBtn.classList.remove("active");
    contentMenu.classList.remove("active");
}




// Sliders
function loadSlider(type) {
    var _id = '#slides-' + type, _width = 950, _height = 300, _widthMob = 480, _heightMob = 360, _interval = 5500, _navigation = true, _pagination = true, _play = true, _oneSlide = false, _productSlides = false;

    switch (type) {
        case 'promo':
            _width = 240, _height = 240, _widthMob = 240, _heightMob = 240, _interval = 3000;
            break;
        case 'inspire':
            _width = 580, _height = 400, _widthMob = 580, _heightMob = 400;
            break;
        case 'casestudy':
        case 'product':
        case 'learn':
            _width = 760, _height = 400, _widthMob = 760, _heightMob = 400;
            break;
        case 'series':
            _width = 760, _height = 400, _widthMob = 760, _heightMob = 400, _productSlides = true;
            break;
        case 'gallery':
            _width = 760, _height = 364, _widthMob = 760, _heightMob = 364, _productSlides = true;
            break;
        case 'gallery-srcset':
            _width = 760, _height = 364, _widthMob = 480, _heightMob = 360, _productSlides = true;
            break;
        case 'landing-srcset':
            _width = 960, _height = 460, _widthMob = 480, _heightMob = 360, _productSlides = true;
            break;
        case 'home':
            _height = 360, _productSlides = true;
            break;
        case 'landing':
            _height = 330;
            break;
        default:
            _id = '#slides'
            break;
    };

    $(_id + ' .me-scale').find('img').each(function () { var imgClass = (this.width / this.height > 1) ? 'wide' : 'tall'; $(this).addClass(imgClass); });
    if ($(_id + ' div.slide').length < 2) _oneSlide = true, _navigation = false, _pagination = false, _play = false;
    if (_productSlides && isMobileSite == false) $(".prod_slides").slides({ preload: true, generateNextPrev: true, generatePagination: false });
    //console.log('_oneSlide=' + _oneSlide);

    if (_oneSlide == true) {
        $(_id + ' div.slide').css('left', '0px');
        $(_id).show();

    } else {
        if (isMobileSite == true) {
            var mq = window.matchMedia('(max-width: 960px)');
            if (mq.matches && $('div.slides-container').hasClass('slides-nav-inside')) $('div.slides-container').removeClass('slides-nav-inside');
            $(_id).slidesjs({
                width: _widthMob,
                height: _heightMob,
                start: 1,
                navigation: { active: false, effect: "slide" },
                pagination: { active: _pagination },
                play: { active: _play, effect: "slide", interval: _interval, auto: _play, swap: true, pauseOnHover: false, restartDelay: 2500 },
                effect: { slide: { speed: 500 }, fade: { speed: 500, crossfade: false } }
            });
        } else {
            $(_id).slidesjs({ // this is showing all below
                width: _width,
                height: _height,
                start: 1,
                navigation: { active: _navigation, effect: "fade" },
                pagination: { active: _pagination, effect: "fade" },
                play: { active: _play, effect: "fade", interval: _interval, auto: _play, swap: true, pauseOnHover: false, restartDelay: 2500 },
                effect: { slide: { speed: 500 }, fade: { speed: 500, crossfade: false } },
                callback: { loaded: function () { }, start: function () { }, complete: function () { } }
            });
        };

        var sjsSlide, sjsSlideStopped = false;
        sjsSlide = $(_id).data('plugin_slidesjs');
        $(".slidesjs-control", _id).on("touchmove", function (e) {
            if (sjsSlideStopped == false) {
                sjsSlide.stop();
                setTimeout(function () { sjsSlide.play(); sjsSlideStop = false; }, 5000);
            };
            sjsSlideStop = true;
        });

    };

}


// ----------------------------------------------
// SET BDT Tools DateVersion 2018-01-15
// ----------------------------------------------
function bdtTools() {
    var self = this;
    //local (thissite)
    self.loadingMsg = function (msg, options) { return loadingMsg(msg, options) }
    self.loadingMsgHide = function () { return loadingMsgHide() }

    //bdtTools
    self.saveFileUrl = function (url, reply) { return saveFileUrl(url, reply) }
    self.openDownloadFileUrl = function (url, target, options) { return openDownloadFileUrl(url, target, options) }

    self.popUpMsg = function (msg, id) { return popUpMsg(msg, id) }
    self.loaderShow = function (msg, hide) { return loaderShow(msg, hide) }
    self.loaderHide = function () { return loaderHide() }

    self.changeLocation = function (url) { return changeLocation(url) }
    self.openUrl = function (url, options) { return openExternalUrl(url, '_self', options) }
    self.openUrlNew = function (url, options) { return openExternalUrl(url, '_blank', options) }
    self.openExternalUrl = function (url, target, options) { return openExternalUrl(url, target, options) }
    self.panelNavClick = function (url, pageID, pagename) { return panelNavClick(url, pageID, pagename) }

    self.getNow = function () { return getNow() }
    self.getQueryVariable = function (variable) { return getQueryVariable(variable) }
    self.setCookie = function (name, value, days) { return setCookie(name, value, days) }
    self.getCookie = function (name) { return getCookie(name) }
    self.deleteCookie = function (name, domain) { return deleteCookie(name, domain) }
    self.replaceLBR = function (str) { return replaceLBR(str) }
    self.htmlEncode = function (v) { return htmlEncode(v) }
    self.htmlDecode = function (v) { return htmlDecode(v) }

    self.isNumber = function (n) { return isNumber(n) }
    self.validateHex = function (hex) { return validateHex(hex) }
    self.validateIP = function (value) { return validateIP(value) }
    self.validateIPSubnet = function (value) { return validateIPSubnet(value) }
    self.validateEmail = function (email) { return validateEmail(email) }
    self.validatePostCode = function (code) { return validatePostCode(code) }
    self.validatePhone = function (phone) { return validatePhone(phone) }
    self.validatePassword = function (password) { return validatePassword(password) }

    self.chunkString = function (str, n) { return chunkString(str, n) }
    self.replaceLineFeeds = function (str, value) { return replaceLineFeeds(str, value) }
    self.loadScript = function (url, callback) { return loadScript(url, callback) }
    self.preload = function (arrayOfImages) { return preload(arrayOfImages) }

    self.disableEnterKey = function () { return disableEnterKey() }
    self.disableSelecting = function () { return disableSelecting() }
    self.disableKeyCodeById = function (id, code) { return disableKeyCodeById(id, code) }

    self.inputOnlyHexByID = function (id) { return inputOnlyHexByID(id) }
    self.inputTextOnlyNumbers = function (id) { return inputTextOnlyNumbers(id) }

    self.getParameterByName = function (name) { return getParameterByName(name) }
    self.getPageName = function () { return getPageName() }
    self.imageExists = function (url, exists, timeout) { return imageExists(url, exists, timeout) }

    self.convertBinary = function (number) { return convertBinary(number) }

    self.runFunctionAfterDate = function (startDate, action) { return runFunctionAfterDate(startDate, action) }
    self.runFunctionsBetweenDates = function (startDate, endDate, inbetweenAction, beforeAfterAction) { return runFunctionsBetweenDates(startDate, endDate, inbetweenAction, beforeAfterAction) }
    self.makeDate = function (day, month, year, hours, minutes, action) { return makeDate(day, month, year, hours, minutes, action) }

    self.xmlGet = function (url, callback, error, async, timeout) { return xhrGetXml(url, callback, error, async, timeout) }
    self.xmlPost = function (url, xml, callback, error, async, timeout) { return xhrPostXml(url, xml, callback, error, async, timeout) }
    self.xmlGetElement = function (element, xml) { return xmlGetElement(element, xml) }
    self.xml2str = function (xmlNode) { return xml2str(xmlNode) }
    self.xml2json = function (node) { return xml2json(node) }
    self.json2xml = function (data) { return json2xml(data) }
    self.str2ab = function (str, type) { return str2ab(str, type) }
    self.ab2str = function (buf, type) { return ab2str(buf, type) }
    self.log = function (a, m) { return pageLog(a, m) }

    //extras below
    self.postLimitAlert = function (id, maxlength) { return postLimitAlert(id, maxlength) }
}

function postLimitAlert(id, maxlength) {
    if (!maxlength) maxlength = 250;
    var a = document.getElementById(id).value;
    if (a.length > maxlength) {
        alert("You have typed the maximun amount of characters for your post.\n\n" + maxlength);
        a.value = a.value.substring(0, maxlength);
    };
}