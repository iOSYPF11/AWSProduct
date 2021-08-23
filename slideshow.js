/**
 * Created by libo on 2017/11/9.
 */



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
    var str_after = test.split("?")[1];
    console.alert(str_after);
     $.ajax({
            type:"post",
            url:"https://z9alk1vin0.execute-api.ap-northeast-1.amazonaws.com/get/",
            data:JSON.stringify({productNo:str_after}),
            dataType: "json",
            contentType: "application/json",
            async:true,
            success:function(data){
                console.log(data)
                alert(data)
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