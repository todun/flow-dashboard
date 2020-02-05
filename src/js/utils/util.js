var $ = require('jquery');
var moment = require('moment-timezone');
import {findIndexById} from 'utils/store-utils';

var util = {

    ListPop: function(keyval, list, _key) {
        var key = _key || "id";
        for (var i=0; i<list.length; i++) {
            var li_el = list[i];
            if (li_el[key] == keyval) {
                list.pop(i);
            }
        }
    },

    play_audio(name) {
        let audio = new Audio('/static/sounds/' + name);
        audio.volume = 0.2;
        audio.play();
    },

    goal_id(year, month) {
        if (month == null) return year
        if (month < 10) month = '0' + month
        return `${year}-${month}`
    },

    notify(message, body, tag, icon) {
      let opts = {
        body: body,
        icon: icon || '/images/logo_128.png',
      };
      let notification;
      if (tag) opts.tag = tag;
      if (!("Notification" in window)) {
        console.warning("This browser does not support desktop notification");
      } else if (Notification.permission === "granted") {
        notification = new Notification(message, opts);
      }
      else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
          if (permission === "granted") {
            notification = new Notification(message, opts);
          }
        });
      }
      if (notification) {
        notification.onclick = function(){
            window.focus();
            if (this.cancel) this.cancel();
        };
      }
    },

    colorInterpolate: function(opts) {
        // Takes opts
        // color1, color2 - hex without # e.g. 'FF0000'
        // min, max, value, from which ratio is calculated
        // OR
        // ratio
        var color1 = opts.color1;
        var color2 = opts.color2;
        var min = opts.min || 0;
        var max = opts.max || 100;
        var value = opts.value || 0;
        if (value < min) value = min;
        if (value > max) value = max;
        var ratio = 0.0;
        if (opts.value!=null) {
            ratio = (value - min) / (max - min);
        } else if (opts.ratio) {
            ratio = opts.ratio;
        }
        var hex = function(x) {
            x = x.toString(16);
            return (x.length == 1) ? '0' + x : x;
        };

        var r = Math.ceil(parseInt(color2.substring(0,2), 16) * ratio + parseInt(color1.substring(0,2), 16) * (1-ratio));
        var g = Math.ceil(parseInt(color2.substring(2,4), 16) * ratio + parseInt(color1.substring(2,4), 16) * (1-ratio));
        var b = Math.ceil(parseInt(color2.substring(4,6), 16) * ratio + parseInt(color1.substring(4,6), 16) * (1-ratio));
        var res_c = hex(r) + hex(g) + hex(b);
        return res_c;
    },

    url_summary(url) {
        url = url.replace('http://','');
        url = url.replace('https://','');
        url = url.replace('www.','');
        return util.truncate(url, 25);
    },


    updateByKey: function(item, items, _keyattr, _do_delete) {
        let success = false;
        var do_delete = _do_delete || false;
        var keyattr = _keyattr || "key";
        let i = findIndexById(items, item[keyattr], keyattr);
        if (i > -1) {
            if (do_delete) items.splice(i, 1);
            else items[i] = item;
            success = true
        } else {
            items.push(item)
            success = true
        }
        return success;
    },

    _render: function(html, directive, data) {
        compiled = $(html).compile(directive);
        var el = $(html).render(data, compiled);
        return el;
    },

    contains: function(list, val) {
        for (k = 0; k < list.length; k++) {
            if (val == list[k]) {
                return 1;
            }
        }
        return 0;
    },

    baseUrl: function() {
        var base_url = location.protocol + '//' + location.host + location.pathname;
        return base_url;
    },

    nowTimestamp: function() {
        // Millis
        return Date.now();
    },

    printDate: function(ms, _format) {
        if (ms == null) return "";
        // Using moment.js to print local date/times
        let format = _format == null ? "YYYY-MM-DD" : _format;
        var dt = moment(parseInt(ms));
        return dt.format(format);
    },

    printTime: function(date_object) {
        var dt = moment(date_object);
        return dt.format("HH:mm");
    },

    daysInMonth: function(month,year) {
        return new Date(year, month, 0).getDate();
    },

    dayOfYear: function(now) {
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = now - start;
        let oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    },

    iso_from_date(d) {
        let year = d.getFullYear();
        let day = d.getDate();
        let month = d.getMonth() + 1;
        if (month < 10) month = '0'+month;
        if (day < 10) day = '0'+day;
        return year+'-'+month+'-'+day;
    },

    printDateObj: function(date, _timezone, opts) {
        if (_timezone && moment) {
            // Using moment.js to print local date/times
            let dt = moment.tz(date.getTime(), _timezone);
            let format = "YYYY-MM-DD";
            if (opts) {
                if (opts.format) format = opts.format;
                else if (opts['_with_time']) format = "YYYY-MM-DD HH:mm";
            }
            return dt.format(format);
        } else {
            if (date != null) {
                return util.iso_from_date(date);
            } else return "--";
        }
    },

    printISODate: function(ts) {
        let newDate = new Date();
        newDate.setTime(ts*1000);
        return util.iso_from_date(newDate);
    },

    date_from_iso(iso_str) {
        return new Date(iso_str + 'T00:00:00'); // Force interpretation as local timezone
    },

    timestamp: function() {
        // Seconds
        return parseInt(new Date().getTime() / 1000);
    },

    printMonthDay: function(ts) {
        var newDate = new Date();
        newDate.setTime(ts*1000);
        var month = newDate.getMonth()+1;
        var day = newDate.getDate();
        return day+'/'+month;
    },

    startAutomaticTimestamps: function(_tz, _interval) {
        var tz = _tz || "UTC";
        var interval = _interval || 20; // Secs
        util.printTimestampsNow(null, null, null, tz);
        var interval_id = setInterval(function() {
            util.printTimestampsNow(null, null, null, tz);
        }, 1000*interval);
        return interval_id;
    },

    from_now(ms) {
        return moment(ms).fromNow();
    },

    hours_until(ms) {
        let now = new Date().getTime();
        let secs_until = Math.round((ms - now)/1000);
        return parseInt(secs_until / 60.0 / 60.0);
    },

    timesince(ms) {
        let LEVELS = [
            { label: "second", cutoff: 60, recent: true, seconds: 1 },
            { label: "minute", cutoff: 60, seconds: 60 },
            { label: "hour", cutoff: 24, seconds: 60*60 },
            { label: "day", cutoff: 30, seconds: 60*60*24 }
        ];
        let text;
        let recent = false;
        let very_old = false;
        let now = new Date().getTime();
        let secs_since = Math.round((now - ms)/1000);
        let handled = false;
        let full_date = util.printDate(ms);
        let past = secs_since > 0;
        let diff_label = past ? "ago" : "from now";
        for (let i=0; i<LEVELS.length; i++) {
            let level = LEVELS[i];
            let units_diff = Math.abs(secs_since / level.seconds);
            if (units_diff < level.cutoff) {
                if (level.recent) recent = true;
                text = parseInt(units_diff) + " " + level.label + "(s) " + diff_label;
                handled = true;
                break;
            }
        }
        if (!handled) {
            very_old = true;
            text = full_date;
        }
        return { very_old, text, full_date, recent };
    },

    printTimestampsNow: function(_smart, _row_sel, _recent_class, _timezone) {
        var row_sel = _row_sel || 'li';
        var recent_class = _recent_class || 'list-group-item-info';
        var smart = smart == null ? true : _smart;
        $('[data-ts]').each(function() {
            var ts = $(this).attr('data-ts');
            if (smart) {
                let {very_old, text} = util.timesince(ts);
                if (!handled) {
                    // Remove _ts since this is too old for relative time
                    $(this).removeAttr('data-ts');
                }
            } else text = full_date;
            $(this).text(text).attr('title', full_date);
        });
    },

    printPercent: function(dec, opts) {
        if (dec == Infinity || isNaN(dec)) {
            if (opts && opts.default) return opts.default;
            else return "N/A";
        }
        return parseInt(dec*100) + "%";
    },

    uppercaseSlug: function(str) {
        return str.replace(/[^A-Z0-9]+/ig, "_").toUpperCase();
    },

    truncate: function(s, _chars) {
        var chars = _chars || 30;
        if (s.length > chars) return s.substring(0, _chars) + '...';
        else return s;
    },

    getParameterByName: function(name, _default) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? _default || "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    getHash: function(default_value) {
        return window.location.hash.substr(1) || default_value
    },

    randomId: function(length) {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },

    doOnKeypress: function(keycodes, fn) {
        if (!(keycodes instanceof Array)) keycodes = [keycodes];
        $(document).keyup(function(e) {
            if (keycodes.indexOf(e.keyCode) > -1 && fn) { fn(); }
        });
    },

    mergeObject: function(obj1, obj2) {
        // Merge obj2 into obj1
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
    },

    arrToObj: function(arr, keyname) {
        var obj = {};
        arr.forEach(function(item, i, arr) {
            obj[item[keyname]] = item;
        });
        return obj;
    },

    printFilesize: function(bytes) {
        var MB = 1000000, KB = 1000;
        if (bytes != null) {
            if (bytes > MB) return (bytes/MB).toFixed(1) + ' MiB';
            else if (bytes > KB) return (bytes/KB).toFixed(1) + ' KiB';
            else return (bytes).toFixed(1) + ' bytes';
        } else return "--";
    },

    dateToTimestamp: function(date_string) {
        var dc = date_string.split('/');
        var date = new Date(dc[2], dc[0], dc[1]);
        console.log(date.getTime());
        return date.getTime();
    },

    addEvent: function(element, eventName, callback) {
        if (element.addEventListener) {
            element.addEventListener(eventName, callback, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + eventName, callback);
        } else {
            element["on" + eventName] = callback;
        }
    },

    applySentenceCase: function(str) {
        return str.replace(/.+?[\.\?\!](\s|$)/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    float2rat: function(x) {
        var tolerance = 1.0E-6;
        var h1=1; var h2=0;
        var k1=0; var k2=1;
        var b = x;
        do {
            var a = Math.floor(b);
            var aux = h1; h1 = a*h1+h2; h2 = aux;
            aux = k1; k1 = a*k1+k2; k2 = aux;
            b = 1/(b-a);
        } while (Math.abs(x-h1/k1) > x*tolerance);

        return h1+":"+k1;
    },

    stripNonNumbers: function(text) {
        return text.replace(/[^0-9]*/g, '');
    },

    stripSpaces: function(text) {
        return text.replace(/ /g,'');
    },

    strip: function(text) {
        return String(text).replace(/^\s+|\s+$/g, '');
    },

    replaceAt: function(index, s, character) {
        return s.substr(0, index) + character + s.substr(index+character.length);
    },

    countChars: function(s, character) {
        return s.split(character).length - 1;
    },

    initAppCache: function() {
        appCache = window.applicationCache;
        appCache.addEventListener('updateready', function(e) {
            if (appCache.status == appCache.UPDATEREADY) {
                // Browser downloaded a new app cache.
                // Swap it in and reload the page to get the new hotness.
                appCache.swapCache();
                var r = confirm('A new version of this site is available... Please reload now');
                if (r) location.reload(true);
            }
        }, false);
        var status;
        switch (appCache.status) {
            case appCache.UNCACHED: // UNCACHED == 0
                status = 'UNCACHED';
                break;
            case appCache.IDLE: // IDLE == 1
                status = 'IDLE';
                break;
            case appCache.CHECKING: // CHECKING == 2
                status = 'CHECKING';
                break;
            case appCache.DOWNLOADING: // DOWNLOADING == 3
                status = 'DOWNLOADING';
                break;
            case appCache.UPDATEREADY: // UPDATEREADY == 4
                status = 'UPDATEREADY';
                break;
            case appCache.OBSOLETE: // OBSOLETE == 5
                status = 'OBSOLETE';
                break;
            default:
                status = 'UKNOWN CACHE STATUS';
                break;
        };
        console.log("[ AppCache ] Status: " + status);
    },

    countWithCeiling: function(count, ceiling) {
        if (count == ceiling) return count + "+";
        else return count;
    },

    arrEquals: function(array, array2) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time
        if (array2.length != array.length)
            return false;

        for (var i = 0, l=array2.length; i < l; i++) {
            // Check if we have nested arrays
            if (array2[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!array2[i].equals(array[i]))
                    return false;
            }
            else if (array2[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    },

    stripSymbols: function(text) {
        return text.replace(/[^A-Za-z 0-9]*/g, '');
    },

    randomInt: function(min, max) {
        return Math.floor((Math.random() * max) + min);
    },

    emptyArray: function(len, item) {
        var item = item === undefined ? null : item;
        var arr = [];
        for (var i=0; i<len; i++) {
            arr.push(item);
        }
        return arr;
    },

    clone: function(obj) {
        var o2 = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                o2[key] = obj[key];
            }
        }
        return o2;
    },

    getRandomColor: function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    average: function(arr) {
        let {sum, count} = util.sum(arr);
        return count > 0 ? sum / count : 0;
    },

    sum: function(arr) {
        // Of non-null
        let sum = 0;
        let count = 0;
        if (arr.length > 0) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] != null) {
                    sum += arr[i];
                    count += 1;
                }
            }
        }
        return {sum, count};
    },

    capitalize: function(s) {
        if (s==null) return null;
        else {
            s = s.toLowerCase();
            return s.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
        }
    },

    dayDiff: function(firstDate, secondDate) {
        let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        let diffDays = Math.round((firstDate.getTime() - secondDate.getTime())/(oneDay));
        return diffDays;
    },

    dateOffset: function(oldDate, _days, _months, _years) {
        var days = _days || 0;
        var months = _months || 0;
        var years = _years || 0;
        return new Date(oldDate.getFullYear()+years,oldDate.getMonth()+months,oldDate.getDate()+days);
    },

    catchJSErrors: function() {
        window.onerror = function(msg, url, line, col, error) {
           // Note that col & error are new to the HTML 5 spec and may not be
           // supported in every browser.  It worked for me in Chrome.
           var extra = !col ? '' : '\ncolumn: ' + col;
           extra += !error ? '' : '\nerror: ' + error;

           // You can view the information in an alert to see things working like this:
           alert("An error has occurred. Share this with the Echo Development team for assistance: " + msg + "\nurl: " + url + "\nline: " + line + extra);

           var suppressErrorAlert = true;
           // If you return true, then error alerts (like in older versions of
           // Internet Explorer) will be suppressed.
           return suppressErrorAlert;
        };
    },

    toggleInList: function(list, item) {
        var i = list.indexOf(item);
        if (i > -1) list.splice(i, 1);
        else list.push(item);
        return list;
    },

    stringToColor: function(str) {
        // str to hash
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
        // int/hash to hex
        for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
        return colour;
    },

    lookupDict: function(itemlist, _keyprop) {
        var keyprop = _keyprop || 'id';
        var lookup = {}
        itemlist.forEach(function(item, i, arr) {
            lookup[item[keyprop]] = item;
        });
        return lookup;
    },

    flattenDict: function(dict) {
        let list = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                list.push(dict[key]);
            }
        }
        return list;
    },

    fromCents: function(cents) {
        return cents / 100.0;
    },

    toCents: function(units) {
        units = units.replace(',','');
        return parseFloat(units) * 100.0;
    },

    fixedNumber: function(num, _decimals) {
        var decimals = _decimals == null ? 2 : _decimals;
        return parseFloat(Math.round(num * 100) / 100).toFixed(decimals);
    },

    numberWithCommas: function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },

    serializeObject: function(jqel) {
        var o = {};
        var a = jqel.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    },

    type_check(value, type) {
        // Type is a string matching google visualization types
        // Returns value standardized to given type
        if (type == "number") value = parseFloat(value);
        return value;
    },

    set_title(title) {
        if (title != null) title = title + " | Flow";
        else title = "Flow";
        document.title = title;
    },

    spread_array(obj, from_prop, to_prop, n) {
        if (obj[from_prop]) {
            for (let i=0; i<n; i++) {
                let key = to_prop + (i+1);
                obj[key] = obj[from_prop][i];
            }
        }
        return obj;
    },

    transp_color(hex_color, brightness) {
        let opacity_prefix = (parseInt(255*brightness)).toString(16).toUpperCase();
        if (hex_color.startsWith('#')) hex_color = hex_color.slice(1).toUpperCase();
        return `#${opacity_prefix}${hex_color}`;
    },

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    secsToDuration: function(secs, opts) {
        let labels = ["hour", "minute", "second"];
        let d = moment.duration(secs, "seconds");
        let hours = parseInt(d.asHours());
        let mins = parseInt(d.minutes());
        let _secs = parseInt(d.seconds());
        let s = [];
        let levels = [hours, mins];
        let no_seconds = opts && opts.no_seconds
        let zero_text = opts && opts.zero_text;
        if (!no_seconds) levels.push(_secs);
        levels.forEach(function(p, i) {
            let label = labels[i];
            if (p > 0) {
                let piece = p + " " + label;
                if (p > 1) piece += "s";
                s.push(piece);
            }
        });
        if (s.length > 0) return s.join(', ');
        else return zero_text || "0 seconds";
    },

    user_agent_mobile: function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

}

module.exports = util;