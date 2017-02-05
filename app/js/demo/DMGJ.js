var DMGJ = (function () {

    "use strict";
    return {
        namespace: function (ns) {
            var parts = ns.split("."),
                object = this,
                i, len;
            for (i = 1, len = parts.length; i < len; i++) {
                if (!object[parts[i]]) {
                    object[parts[i]] = {};
                }
                object = object[parts[i]];
            }
            return object;
        },
        wire: function (obj, name, value) {
            if (!(name in obj)) {
                obj[name] = value;
            }
        }
    };
}());

(function ($, window, Handlebars) {
    "use strict";
    //toolbox
    // (function () {
    //     DMGJ.namespace("DMGJ.tool");
    //     var tool= DMGJ.tool;

    //     //config field
    //     tool.Constant = {
    //         INSERTERROR_MSG: "insert error……"
    //     };

    // }());


    //add tool to jQuery
    (function () {
        "use strict";
        if(!$.indexOf) {
            $.extend({
                indexOf : function (arr, item) {
                    if(arr.indexOf){
                        return arr.indexOf(item);
                    }
                    var loc = -1, i=0 , len = arr.length;
                    for(;i<len; i++) {
                        if(arr[i] === item){
                            loc = i;
                            break;
                        }
                    }
                    return loc;
                },
                showLoading : function () {
                    var $preview = $("#preview"),
                        $body = $("body");
                    if($preview.length === 0){
                        $body.prepend("<section id=\"preview\"></section>");
                    }

                    var spinner = new Spinner().spin($preview[0]);
                    $preview.css({width:$body.width(),height:$body.height()}).show();
                    /*$("#preview").width($("body").width());
                     $("#preview").height($("body").height());
                     $("#preview").show();*/
                    return spinner;
                },
                hideLoading : function (spinner) {
                    if (spinner !== null) {
                        spinner.stop();
                    }
                    $("#preview").hide();
                }
            });
        }

        //tab
        if (typeof $.tab !=="function") {
            $.extend({tab: function (id) {
                var container = $("#"+id);
                //Default Action
                container.find(".tab_content").hide(); //Hide all content
                container.find("ul.tabs li:first").addClass("active").show(); //Activate first tab
                container.find(".tab_content:first").show(); //Show first tab content

                //On Click Event
                container.find("ul.tabs li").click(function() {
                    container.find("ul.tabs li").removeClass("active"); //Remove any "active" class
                    container.find(this).addClass("active"); //Add "active" class to selected tab
                    container.find(".tab_content").hide(); //Hide all tab content
                    var activeTab = $(this).find("a").attr("href"); //Find the rel attribute value to identify the active tab + content
                    container.find(activeTab).fadeIn(); //Fade in the active content
                    return false;
                });
            }})
        }


        (function () {
            // create constructor
            function Slide(ele, options) {
                this.$ele = $(ele);//this. constructor object
                this.options = $.extend({
                    speed: 1000,
                    delay: 3000
                }, options);

                this.lis = this.$ele.find('li');
                //create status
                (function () {
                    var count = this.lis.length,
                        half = Math.floor(count/2),
                        _half = half,
                        i = 0,
                        states = [],
                        tmp = null,
                        isOdd = !!count%2,

                        wMax = 224, wMin = 120, wStep = (wMax-wMin)/half,
                        hMax = 288, hMin = 150, hStep = (hMax-hMin)/half,
                        tMax = 70, tMin = 0, tStep = tMax/half,
                        lMax = 400, lMin = 0, lStep = lMax/(count+_half),
                        oMax = 1, oMin = 0.5, oStep = 0.5/half,
                        index = 0;

                    if(isOdd){
                        half += 1;
                    }else {
                        half += 1;
                        _half -=1;
                    }

                    //upper half
                    for (;i<half; i++) {
                        tmp = {};
                        tmp["&zIndex"] = i + 1;
                        tmp.width = wMin + i * wStep;
                        tmp.height = hMin + i * hStep;
                        tmp.top = tMax - i * tStep;
                        tmp.left = lMin + i * lStep;
                        tmp.$opacity = oMin + i * oStep;
                        states[index++] = tmp;
                    }
                    var midLeft = states[i-1].left;
                    for(i=1; i<=_half; i++){
                        tmp = {};
                        tmp["&zIndex"] = _half - i + 1;
                        tmp.width = wMax - i * wStep;
                        tmp.height = hMax - i * hStep;
                        tmp.top = tMin + i * tStep;
                        tmp.left = midLeft + i * lStep *2;
                        tmp.$opacity = oMax - i * oStep;
                        states[index++] = tmp;
                    }
                    //states[index-1].left = states[index-1].left-lStep;

                    this.states = states;

                }.call(this));

                this.interval;
                // click to the next

                this.$ele.find('section:nth-child(2)').on('click', function () {
                    this.stop();
                    this.next();
                    this.play();
                }.bind(this));
                // click to the previous
                this.$ele.find('section:nth-child(1)').on('click', function () {
                    this.stop();
                    this.prev();
                    this.play();
                }.bind(this));
                this.move();
                // auto show
                this.play();
            }


            Slide.prototype = {

                move: function () {

                    this.lis.each(function (i, el) {
                        $(el)
                            .css('z-index', this.states[i]['&zIndex'])
                            .finish().animate(this.states[i], this.options.speed)
                            // .stop(true,true).animate(states[i], 1000)
                            .find('img').css('opacity', this.states[i].$opacity)
                    }.bind(this))
                },
                // show next
                next: function () {

                    this.states.unshift(this.states.pop());
                    this.move()
                },
                // show previous
                prev: function () {

                    this.states.push(this.states.shift());
                    this.move()
                },
                play: function () {

                    this.interval = setInterval(function () {//this means window

                        // states.unshift(states.pop())      
                        // states.push(states.shift())     /
                        this.next()
                    }.bind(this), this.options.delay)
                },
                // stop showing
                stop: function () {
                    // var _this = this
                    clearInterval(this.interval)
                }


            };
            $.fn.zySlide = function (options) {
                this.each(function (i, ele) {
                    new Slide(ele, options)
                });
                return this;
            }
        }());
    }());


    //encapsulation jquery
    (function ($) {
        "use strict";
        DMGJ.namespace("DMGJ.w$");
        var w$ = DMGJ.w$;
        //encapsulate ajax in jQuery
        w$.ajax = function (action, options) {
            var spinner = null, _options = options == null? {} : options;
            $.extend(_options,{beforeSend: function () {spinner = $.showLoading(); }});

            return $.ajax(action,_options).always(function () {
                $.hideLoading(spinner);
            });
        };
    }(jQuery));

}($, window));






