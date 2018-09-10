/*播放相关的类*/
(function (window) {
    function Player($audio) {
        return new Player.prototype.init($audio);
    }
    Player.prototype = {
        constructor: Player,
        musicList: [],
        init: function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        currentIndex: -1,
        //播放音乐
        playMusic: function (index, music) {
            //判断是否是同一首歌
            if(this.currentIndex == index){//同一首
                if(this.audio.paused){
                    this.audio.play();
                }else{
                    this.audio.pause();
                }
            }else{
                this.$audio.attr("src",music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },
        //播放上一首
        preIndex: function () {
            var index = this.currentIndex - 1;
            if(index < 0 ){
                index = this.musicList.length-1;
            }
            return index;
        },
        //播放下一首
        nextIndex: function () {
            var index = this.currentIndex + 1;
            if(index > this.musicList.length-1){
                index = 0;
            }
            return index;
        },
        //删除音乐后，更新音乐数组
        changeMusic: function (index) {
            //删除当前音乐数组中对应的音乐
            this.musicList.splice(index,1);
            //判断被删除的音乐是否在正在播放音乐的前面
            if(index < this.currentIndex){
                this.currentIndex = this.currentIndex - 1;
            }
        },
        //得出音频播放时长
        musicTimeUpdate: function (callBack) {
            var $this = this;
            //音频播放位置发生改变时触发的事件
            this.$audio.on("timeupdate",function () {
                var duration = $this.audio.duration;//音频的长度（秒）
                var currentTime = $this.audio.currentTime;//音频已播放长度（秒）
                var timeStr = $this.formatDate(currentTime,duration);
                callBack(currentTime, duration, timeStr);
            });
        },
        //根据播放时长和总时长得出 "02:22 / 04:44" 这种格式的字符串
        formatDate: function (currentTime,duration) {
            var endMin = parseInt(duration/60);
            var endSec = parseInt(duration%60);
            if(endMin < 10){
                endMin = "0" + endMin;
            }
            if(endSec < 10){
                endSec = "0" + endSec;
            }

            var startMin = parseInt(currentTime / 60); // 2
            var startSec = parseInt(currentTime % 60);
            if(startMin < 10){
                startMin = "0" + startMin;
            }
            if(startSec < 10){
                startSec = "0" + startSec;
            }
            return startMin+":"+startSec+" / "+endMin+":"+endSec;
        },
        musicSeekTo: function (value) {
            if(isNaN(value)) return;
            if(isNaN(this.audio.duration)){
                //没播放任何一首歌曲，直接拖到滚动条
                //所以获取第一首歌的总时长
                var timeArr = this.musicList[0].time.split(":");
                var min = parseInt(timeArr[0])*60;
                var sec = parseInt(timeArr[1]);
                this.audio.currentTime = (min+sec)*value;
            }else{
                this.audio.currentTime = this.audio.duration * value;
            }
        },
        musicVoiceSeekTo: function (value) {
            if(isNaN(value)) return;
            if(value <0 || value > 1) return;
            // audio控件的音量是0~1
            this.audio.volume = value;
        }
    }
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);