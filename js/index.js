$(function () {
    //滚动条插件
    $(".content_list").mCustomScrollbar();

    var $audio = $("audio");
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;

    //加载歌曲列表
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url: "./source/musiclist.json",
            dataType: "json",
            success: function (data) {
                player.musicList = data;
                var $musicList = $(".content_list ul");
                $.each(data,function (index, ele) {
                    //调用创建标签的方法
                    var $item = createMusicItem(index,ele);
                    $musicList.append($item);
                });
                //初始化歌曲歌词信息，默认都是第一首
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);
            },
            error: function (e) {
                console.log(e);
            }
        });
    }

    //定义一个创建音乐列表标签的方法
    function createMusicItem(index, music) {
        var $item = $("<li class=\"list_music\">\n" +
            "                        <div class=\"list_check\"><span></span></div>\n" +
            "                        <div class=\"list_number\">"+(index+1)+"</div>\n" +
            "                        <div class=\"list_name\">"+music.name+"\n" +
            "                            <div class=\"list_menu\">\n" +
            "                                <a href=\"javascript:;\" title=\"播放\" class=\"list_menu_play\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"添加\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                        <div class=\"list_singer\">"+music.singer+"</div>\n" +
            "                        <div class=\"list_time\">\n" +
            "                            <span class=\"list_time_text\">"+music.time+"</span>\n" +
            "                            <span class=\"list_menu_del\"><a href=\"javascript:;\" title=\"删除\"></a></span>\n" +
            "                        </div>\n" +
            "                    </li>");
        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }

    //定义一个初始化歌曲信息的方法
    function initMusicInfo(music) {
        //获取对应元素
        var $musicImage = $(".song_info_pic img");
        var $musicName = $(".song_info_name a");
        var $musicSinger = $(".song_info_singer a");
        var $musicAblum = $(".song_info_ablum a");
        var $musicProgressName = $(".music_progress_name");
        var $musicProgressTime = $(".music_progress_time");
        var $musicBg = $(".mask_bg");

        //给对应元素赋值
        $musicImage.attr("src",music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAblum.text(music.album);
        $musicProgressName.text(music.name+" / "+music.singer);
        $musicProgressName.text(music.name +" / "+ music.singer);
        $musicProgressTime.text("00:00 / "+ music.time);
        $musicBg.css("background", "url('"+music.cover+"')");
    }

    //定义一个初始化歌词信息的方法
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $(".song_lyric");
        //清空上一首的歌词
        $lyricContainer.html("");
        //加载歌词
        lyric.loadLyric(function () {
            //创建歌词列表
            $.each(lyric.lyrics,function (index, ele) {
                var $item = $("<li>"+ele+"</li>");
                $lyricContainer.append($item);
            });
        });
    }

    //初始化进度条
    initProgress();
    function initProgress() {
        var $progressBar = $(".music_progress_bar");
        var $progressLine = $(".music_progress_line");
        var $progressDot = $(".music_progress_dot");
        progress = new Progress($progressBar,$progressLine,$progressDot);
        //注册点击进度条行为
        progress.progressClick(function (value) {
            player.musicSeekTo(value);//更新歌曲播放进度
        });
        //注册移动进度条行为
        progress.progressMove(function (value) {
            player.musicSeekTo(value);//更新歌曲播放进度
        });

        //音量进度条（同上）
        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");
        voiceProgress = new Progress($voiceBar,$voiceLine,$voiceDot);
        //注册点击进度条行为
        voiceProgress.progressClick(function (value) {
            player.musicVoiceSeekTo(value);
        });
        //注册移动进度条行为
        voiceProgress.progressMove(function (value) {
            player.musicVoiceSeekTo(value);
        });
    }

    //初始化事件监听
    initEvents();
    function initEvents() {
        //监听歌曲的移入移除事件
        $(".content_list").delegate(".list_music","mouseenter",function () {
            // 显示子菜单
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".list_menu_del").stop().fadeIn(100);
            // 隐藏时长
            $(this).find(".list_time .list_time_text").stop().fadeOut(100);
        });
        $(".content_list").delegate(".list_music","mouseleave",function () {
            // 显示子菜单
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".list_menu_del").stop().fadeOut(100);
            // 隐藏时长
            $(this).find(".list_time .list_time_text").stop().fadeIn(100);
        });
        
        //监听复选框点击事件
        $(".content_list").delegate(".list_music .list_check","click",function () {
            $(this).toggleClass("list_checked");
        });
        //如果是标题复选框选中
        $(".content_list").delegate(".list_title .list_check","click",function () {
            $(this).toggleClass("list_checked");
            if($(this).hasClass("list_checked")){//说明标题复选框被选中
                $(".list_music .list_check").addClass("list_checked");
            }else{//说明标题复选框未被选中
                $(".list_music .list_check").removeClass("list_checked");
            }
        });

        //列表菜单内播放按钮的点击事件
        var $musicPlay = $(".music_play");//底部播放按钮
        $(".content_list").delegate(".list_menu_play","click",function () {
            var $item = $(this).parents(".list_music");

            //切换播放图标
            $(this).toggleClass("list_menu_play2");
            //复原其它的播放图标
            $item.siblings().find(".list_menu_play").removeClass("list_menu_play2");
            //同步底部播放按钮
            if($(this).hasClass("list_menu_play2")){
                //播放状态
                $musicPlay.addClass("music_play2");
                //文字高亮
                $item.find("div").css("color","rgba(255,255,255,1)");
                $item.siblings().find("div").css("color","rgba(255,255,255,0.5)");
            }else{
                $musicPlay.removeClass("music_play2");
                $item.find("div").css("color", "rgba(255,255,255,0.5)");
            }
            //切换序号状态
            $item.find(".list_number").toggleClass("list_number2");
            $item.siblings().find(".list_number").removeClass("list_number2");

            //播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music);
            //更新歌曲信息
            initMusicInfo($item.get(0).music);
            //更新歌词信息
            initMusicLyric($item.get(0).music);
        });

        //监听底部播放按钮
        $musicPlay.click(function () {
            //判断有没有播放过音乐
            if(player.currentIndex == -1){
                //没播放过，默认播放第一首
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            }else{
                $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        });
        //监听底部上一首按钮
        $(".music_pre").click(function () {
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        });
        //监听底部下一首按钮
        $(".music_next").click(function () {
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        });

        //监听列表删除按钮
        $(".content_list").delegate(".list_menu_del a","click",function () {
            var $item = $(this).parents(".list_music");

            //判断当前被删除的音乐是否正在播放
            if($item.get(0).index == player.currentIndex){
                //正在播放，播放下一首
                $(".music_next").trigger("click");
            }
            $item.remove();
            player.changeMusic($item.get(0).index);//更新播放对象中的音乐数组

            //重新排序
            $(".list_music").each(function (index, ele) {
                ele.index = index;
                $(ele).find(".list_number").text(index+1);
            });
        });

        //监听播放进度
        player.musicTimeUpdate(function (currentTime, duration, timeStr) {
            //同步时间
            $(".music_progress_time").text(timeStr);
            //同步进度条
            var value = currentTime / duration * 100;
            //更新进度条
            progress.setProgress(value);
            //实现歌词同步
            var index = lyric.currentIndex(currentTime);//根据播放时长得到播到的歌词的下标
            var $item = $(".song_lyric li").eq(index);
            $item.addClass("cur");
            $item.siblings().removeClass("cur");
            //实现歌词滚动
            if(index <= 2) return;
            $(".song_lyric").css({
                marginTop: (-index+2)*30
            });
        });

        //监听声音按钮点击事件
        $(".music_voice_icon").click(function () {
            //图标切换
            $(this).toggleClass("music_voice_icon2");
            //声音切换
            if($(this).hasClass("music_voice_icon2")){
                // 变为没有声音
                player.musicVoiceSeekTo(0);
            }else{
                // 变为有声音
                player.musicVoiceSeekTo(1);
            }
        });
    }
});