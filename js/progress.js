/*进度条类*/
(function (window) {
    function Progress($progressBar,$progressLine,$progressDot) {
        return new Progress.prototype.init($progressBar,$progressLine,$progressDot);
    }
    Progress.prototype = {
        constructor: Progress,
        init: function ($progressBar,$progressLine,$progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove: false,
        //点击进度条行为
        progressClick: function (callBack) {
            var $this = this;//此时的this是progress
            //监听背景点击
            this.$progressBar.click(function (event) {
                //获取背景距离窗口的默认长度
                var normalLeft = $(this).offset().left;
                //获取点击位置距窗口的长度
                var eventLeft = event.pageX;
                //设置前景宽度
                $this.$progressLine.css("width",eventLeft-normalLeft);
                //设置拖拽按钮距离
                $this.$progressDot.css("left",eventLeft-normalLeft);
                //计算进度条比例（用于与音乐播放进度同步）
                var value = ((eventLeft-normalLeft)/$(this).width()).toFixed(2);
                callBack(value);
            });
        },
        //移动进度条行为
        progressMove: function (callBack) {
            var $this = this;
            var normalLeft = this.$progressBar.offset().left;
            var barWidth = this.$progressBar.width();
            var eventLeft;
            //监听鼠标按下事件
            this.$progressDot.on("mousedown",function () {
                $this.isMove = true;
                //监听鼠标移动事件
                $(document).on("mousemove",function (event) {
                    // 获取点击的位置距离窗口的位置
                    eventLeft = event.pageX;
                    var offset = eventLeft - normalLeft;
                    if(offset >= 0 && offset <= barWidth){
                        $this.$progressLine.css("width",offset);
                        $this.$progressDot.css("left",offset);
                    }
                });
                //监听鼠标抬起事件
                //鼠标点击会导致该事件重复执行，所以放在mousedown事件内，执行一次
                $(document).one("mouseup",function () {
                    $(document).off("mousemove");
                    $this.isMove = false;
                    // 计算进度条的比例（用于与音乐播放进度同步）
                    var value = ((eventLeft - normalLeft) / barWidth).toFixed(2);
                    callBack(value);
                });
            });

        },
        //更新进度条长度
        setProgress: function (value) {
            if(this.isMove) return;//正在拖动进度条，直接返回
            if(value < 0 || value > 100) return;//数据校验
            this.$progressLine.css({
                width : value+"%"
            });
            this.$progressDot.css({
                left : value+"%"
            });
        }
    }
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);