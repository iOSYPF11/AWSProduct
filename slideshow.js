/**
 * Created by libo on 2017/11/9.
 */
 var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var defaults = {
    lines: 12,
    length: 7,
    width: 5,
    radius: 10,
    scale: 1.0,
    corners: 1,
    color: '#000',
    fadeColor: 'transparent',
    animation: 'spinner-line-fade-default',
    rotate: 0,
    direction: 1,
    speed: 1,
    zIndex: 2e9,
    className: 'spinner',
    top: '50%',
    left: '50%',
    shadow: '0 0 1px transparent',
    position: 'absolute',
};
var Spinner = /** @class */ (function () {
    function Spinner(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = __assign(__assign({}, defaults), opts);
    }
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target by calling
     * stop() internally.
     */
    Spinner.prototype.spin = function (target) {
        this.stop();
        this.el = document.createElement('div');
        this.el.className = this.opts.className;
        this.el.setAttribute('role', 'progressbar');
        css(this.el, {
            position: this.opts.position,
            width: 0,
            zIndex: this.opts.zIndex,
            left: this.opts.left,
            top: this.opts.top,
            transform: "scale(" + this.opts.scale + ")",
        });
        if (target) {
            target.insertBefore(this.el, target.firstChild || null);
        }
        drawLines(this.el, this.opts);
        return this;
    };
    /**
     * Stops and removes the Spinner.
     * Stopped spinners may be reused by calling spin() again.
     */
    Spinner.prototype.stop = function () {
        if (this.el) {
            if (typeof requestAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.animateId);
            }
            else {
                clearTimeout(this.animateId);
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
            this.el = undefined;
        }
        return this;
    };
    return Spinner;
}());
// export { Spinner };
/**
 * Sets multiple style properties at once.
 */
function css(el, props) {
    for (var prop in props) {
        el.style[prop] = props[prop];
    }
    return el;
}
/**
 * Returns the line color from the given string or array.
 */
function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length];
}
/**
 * Internal method that draws the individual lines.
 */
function drawLines(el, opts) {
    var borderRadius = (Math.round(opts.corners * opts.width * 500) / 1000) + 'px';
    var shadow = 'none';
    if (opts.shadow === true) {
        shadow = '0 2px 4px #000'; // default shadow
    }
    else if (typeof opts.shadow === 'string') {
        shadow = opts.shadow;
    }
    var shadows = parseBoxShadow(shadow);
    for (var i = 0; i < opts.lines; i++) {
        var degrees = ~~(360 / opts.lines * i + opts.rotate);
        var backgroundLine = css(document.createElement('div'), {
            position: 'absolute',
            top: -opts.width / 2 + "px",
            width: (opts.length + opts.width) + 'px',
            height: opts.width + 'px',
            background: getColor(opts.fadeColor, i),
            borderRadius: borderRadius,
            transformOrigin: 'left',
            transform: "rotate(" + degrees + "deg) translateX(" + opts.radius + "px)",
        });
        var delay = i * opts.direction / opts.lines / opts.speed;
        delay -= 1 / opts.speed; // so initial animation state will include trail
        var line = css(document.createElement('div'), {
            width: '100%',
            height: '100%',
            background: getColor(opts.color, i),
            borderRadius: borderRadius,
            boxShadow: normalizeShadow(shadows, degrees),
            animation: 1 / opts.speed + "s linear " + delay + "s infinite " + opts.animation,
        });
        backgroundLine.appendChild(line);
        el.appendChild(backgroundLine);
    }
}
function parseBoxShadow(boxShadow) {
    var regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
    var shadows = [];
    for (var _i = 0, _a = boxShadow.split(','); _i < _a.length; _i++) {
        var shadow = _a[_i];
        var matches = shadow.match(regex);
        if (matches === null) {
            continue; // invalid syntax
        }
        var x = +matches[2];
        var y = +matches[5];
        var xUnits = matches[4];
        var yUnits = matches[7];
        if (x === 0 && !xUnits) {
            xUnits = yUnits;
        }
        if (y === 0 && !yUnits) {
            yUnits = xUnits;
        }
        if (xUnits !== yUnits) {
            continue; // units must match to use as coordinates
        }
        shadows.push({
            prefix: matches[1] || '',
            x: x,
            y: y,
            xUnits: xUnits,
            yUnits: yUnits,
            end: matches[8],
        });
    }
    return shadows;
}
/**
 * Modify box-shadow x/y offsets to counteract rotation
 */
function normalizeShadow(shadows, degrees) {
    var normalized = [];
    for (var _i = 0, shadows_1 = shadows; _i < shadows_1.length; _i++) {
        var shadow = shadows_1[_i];
        var xy = convertOffset(shadow.x, shadow.y, degrees);
        normalized.push(shadow.prefix + xy[0] + shadow.xUnits + ' ' + xy[1] + shadow.yUnits + shadow.end);
    }
    return normalized.join(', ');
}
function convertOffset(x, y, degrees) {
    var radians = degrees * Math.PI / 180;
    var sin = Math.sin(radians);
    var cos = Math.cos(radians);
    return [
        Math.round((x * cos + y * sin) * 1000) / 1000,
        Math.round((-x * sin + y * cos) * 1000) / 1000,
    ];
}




 window.onload = function(){
    /*
     * 1.自动轮播  定时器  无缝衔接  动画结束瞬间定位
     * 2.点需要随着轮播的滚动改变对应的点  改变当前样式  当前图片的索引
     * 3.手指滑动的时候让轮播图滑动   touch事件  记录坐标轴的改变 改变轮播图的定位（位移css3）
     * 4.当滑动的距离不超过一定的距离的时候  需要吸附回去  过渡的形式去做
     * 5.当滑动超过了一定的距离  需要 跳到 下一张或者上一张  （滑动的方向） 一定的距离（屏幕的三分之一）
     * */
    
    var imageList = ["","",""];
    var test = window.location.href;
    var str_after = test.split("=")[1];
    console.log(str_after);
    var opts = {
        lines: 13, // 花瓣数目
         length: 20, // 花瓣长度
         width: 10, // 花瓣宽度
         radius: 30, // 花瓣距中心半径
         scale: 1,
        corners: 1, // 花瓣圆滑度 (0-1)
         color: '#95ff66', // 花瓣颜色
         opacity: 0.25,
        rotate: 0, // 花瓣旋转角度
         direction: 1, // 花瓣旋转方向 1: 顺时针, -1: 逆时针
         speed: 1, // 花瓣旋转速度
         trail: 60, // 花瓣旋转时的拖影(百分比)
         zIndex: 2e9, // spinner的z轴 (默认是2000000000)
         className: 'spinner', // spinner css 样式名称
         top: '50%', // spinner 相对父容器Top定位 单位 px
         left: '50%', // spinner 相对父容器Left定位 单位 px
         shadow: false, // 花瓣是否显示阴影
         hwaccel: false, //spinner 是否启用硬件加速及高速旋转 
         position: 'absolute'
        
    };
    var target = document.getElementById('loading');
    console.log(target)
    
    var spinner = new Spinner(opts).spin(target);

    
    
    $.ajax({
            type:"post",
            url:"https://z9alk1vin0.execute-api.ap-northeast-1.amazonaws.com/get/",
            data:JSON.stringify({productNo:str_after}),
            dataType: "json",
            contentType: "application/json",
            async:true,
            success:function(data){
                console.log(data)
                spinner.spin();
                
                document.getElementById("goodname_en").innerHTML = data["Items"][0]["productEnName"];
                document.getElementById("goodname").innerHTML = data["Items"][0]["productChName"];
                document.getElementById("goodnum").innerHTML = "("+data["Items"][0]["productNo"]+")";
                imageList = eval(data["Items"][0]["image"]);
                for (var i = 0; i < imageList.length; i++) {
                    $('#sdimage').append('<li><a ><img src= '+"https://2021reactapp0818a8cb7d7dcbdf4d99a2f6e7e64270337152331-dev.s3.ap-northeast-1.amazonaws.com/public/"+imageList[i]+' id = '+"tuu" + i+'></a></li>');
                    if (i > 0) {
                        $('#dot').append('<li></li>');  
                    }
                }
                document.getElementById("authimage").src = "image/na_btn.png";
                document.getElementById("auth").innerHTML = "正品";
                //轮播图大盒子
                var banner = document.querySelector('.banner');
                //图片的宽度
                var width = banner.offsetWidth;
                //图片盒子
                var imageBox = banner.querySelector('ul:first-child');
                //点盒子
    
                var pointBox = banner.querySelector('ul:last-child');

                //所有的图片

                var images = imageBox.querySelectorAll('li');
                //所有的点

                var points = pointBox.querySelectorAll('li');
                var imageCount = images.length; //页面中用来轮播的图片有5张不同的
                //公用方法
                //加过渡
                var addTransition = function(){
                    imageBox.style.transition = "all 0.3s";
                    imageBox.style.webkitTransition = "all 0.3s";/*做兼容*/
                };
                //清除过渡
                var removeTransition = function(){
                    imageBox.style.transition = "none";
                    imageBox.style.webkitTransition = "none";
                }
                //定位
                var setTranslateX = function(translateX){
                    imageBox.style.transform = "translateX("+translateX+"px)";
                    imageBox.style.webkitTransform = "translateX("+translateX+"px)";
                }

                //功能实现
                //自动轮播  定时器  无缝衔接  动画结束瞬间定位
                var index = 0;
                var timer = setInterval(function(){
                    
                    //改变定位  动画的形式去改变  transition transform translate
                    addTransition();    //加过渡动画
                    setTranslateX(-index * width);  //定位
                    index++;   //自动轮播到下一张
                },2000);

                //等过渡结束之后来做无缝衔接
                my.transitionEnd(imageBox, function(){
                //处理事件结束后的业务逻辑
                if(index > imageCount-1){
                    index = 0;
                }else if(index <= 0){
                    index = imageCount - 1;
                }
                removeTransition(); //清除过渡
                setTranslateX(-index * width);  //定位
                setPoint(); //设置底部显示当前图片对应的圆角
            });

            //改变当前样式  当前图片的索引
            var setPoint = function(){
                //清除上一次的now
                for(var i = 0 ; i < points.length ; i++){
                    points[i].className = " ";
                }
                //给图片对应的点加上样式
                    points[index].className = "now";
        
            }

            /*
            手指滑动的时候让轮播图滑动   touch事件  记录坐标轴的改变 改变轮播图的定位（位移css3）
            当滑动的距离不超过一定的距离的时候  需要吸附回去  过渡的形式去做
            当滑动超过了一定的距离  需要 跳到 下一张或者上一张  （滑动的方向） 一定的距离（屏幕的三分之一）
            */
            //touch事件
            var startX = 0; //记录起始  刚刚触摸的点的位置 x的坐标
            var moveX = 0;  //滑动的时候x的位置
            var distanceX = 0;  //滑动的距离
            var isMove = false; //是否滑动过

            imageBox.addEventListener('touchstart', function(e){
                clearInterval(timer);   //清除定时器
                startX = e.touches[0].clientX;  //记录起始X
            });

            imageBox.addEventListener('touchmove',function(e){
                moveX = e.touches[0].clientX;   //滑动时候的X
                distanceX = moveX - startX; //计算移动的距离
                //计算当前定位  -index*width+distanceX
                removeTransition(); //清除过渡
                setTranslateX(-index * width + distanceX);  //实时的定位
                isMove = true;  //证明滑动过
            });

            //在模拟器上模拟的滑动会有问题 丢失的情况  最后在模拟器的时候用window
            imageBox.addEventListener('touchend', function(e){
                // 滑动超过 1/3 即为滑动有效，否则即为无效，则吸附回去
                if(isMove && Math.abs(distanceX) > width/3){
                    //5.当滑动超过了一定的距离  需要 跳到 下一张或者上一张  （滑动的方向）*/
                    if(distanceX > 0){  //上一张
                        index --;
                    }
                    else{   //下一张
                        index ++;
                    }
                }
                addTransition();    //加过渡动画
                setTranslateX(-index * width);    //定位
                if(index > imageCount ){
                    index = 0;
                }else if(index <= 0){
                    index = imageCount-1;
                }
                setPoint();
                //重置参数
                startX = 0;
                moveX = 0;
                distanceX = 0;
                isMove = false;
                //加定时器
                clearInterval(timer);   //严谨 再清除一次定时器
                timer= setInterval(function(){
                    index++ ;  //自动轮播到下一张
                    addTransition();    //加过渡动画
                    setTranslateX(-index * width);    //定位
                },3000);
            });


            },error:function(data){
               
            }
        });
    
};