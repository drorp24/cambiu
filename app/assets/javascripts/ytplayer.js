// Fetches API code asynchroneously and binds a player to an already existing iFrame.
// Reason: to control video (currently: mute).

// 1. NO div is created to be replaced by the generated iFrame
// The reason: the YT.Player below, that would otherwise generate the iFrame, doesnt respect its options, resulting in ugly progressbar
// but i might have wrongly used it without playerVars (https://developers.google.com/youtube/iframe_api_reference#Events)

// 2. This code loads the IFrame Player API code asynchronously.
// 3 events follow...
var tag = document.createElement('script');

tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 1st event: the API code has fully loaded
// (Contrary to the google classic examples: This function only BINDS the player to an EXISTING iFrame)
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        origin: '<%= "#{request.protocol}#{request.host}:#{request.port}" %>',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 2nd event: the video player is ready (playVideo() starts buffering, play has not started yet)
function onPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
}

// 3rd event: playing has started (= its state has just changed to PLAYING)

var done = false;
function onPlayerStateChange(event) {
     if (event.data == YT.PlayerState.PLAYING & !done) {
         setTimeout(pauseVideo, 13000);
         done = true;
     } else
     if (event.data == YT.PlayerState.PAUSED) {
        resumeVideo();
     }
}

function pauseVideo() {
    player.pauseVideo();
}

function replaceVideoWithBackground() {
    $('.above_fold #background').show();
    $('.above_fold .marketing .message.darkness').hide();
    $('.above_fold .marketing .message.lightness').css('color', '#fff');
    $('.above_fold .marketing .message.lightness h1').addClass('off');
    $('.above_fold .marketing .message.lightness p').addClass('off');
    $('.homesearch').addClass('off');
    $('#player').remove();
}

var resume = 0;
function resumeVideo() {
    if (resume == 0) {
        player.seekTo(33);
        player.playVideo();
        resume = 1;
        setTimeout(pauseVideo, 24000);
    } else
    if (resume == 1) {
        player.seekTo(82);
        player.playVideo();
        resume = 2;
        setTimeout(pauseVideo, 9000);
    } else
    if (resume == 2) {
        player.seekTo(113);
        player.playVideo();
        resume = 3;
    }
}

