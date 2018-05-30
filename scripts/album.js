var createSongRow = function createSongRow(trackNumber, title, duration) {
    var template =
        '<tr class="album-view-song-item">'
      + '   <td class="song-item-number" data-track-number="' + trackNumber + '">' + trackNumber + '</td>'
      + '   <td class="song-item-title">' + title + '</td>'
      + '   <td class="song-item-duration">' + filterTimeCode(duration) + '</td>'
      + '</tr>'
    ;

    var $row = $(template);

    var clickHandler = function clickHandler() {
        var songTrackNumber = parseInt($(this).attr('data-track-number'));

        if (currentlyPlayingSongNumber === null) {
            $(this).html(pauseButtonTemplate);
            $playButton.html(playerBarPauseButton);
            setSong(songTrackNumber);
            updatePlayerBarSong();
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
        } else if (currentlyPlayingSongNumber === songTrackNumber) {
            if (currentSoundFile.isPaused()) {
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
                $(this).html(pauseButtonTemplate);
                $playButton.html(playerBarPauseButton);
            } else {
                currentSoundFile.pause();
                $(this).html(playButtonTemplate);
                $playButton.html(playerBarPlayButton);
            }
        } else if (currentlyPlayingSongNumber !== songTrackNumber) {
            var currentlyPlayingSongElement = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingSongElement.empty().text(currentlyPlayingSongNumber);
            $(this).html(pauseButtonTemplate);
            $playButton.html(playerBarPauseButton);
            setSong(songTrackNumber);
            updatePlayerBarSong();
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
        }
    };

    var onHover = function onHover(event) {
        var $songItem = $(this).find('.song-item-number');
        var songItemNumber = parseInt($songItem.attr('data-track-number'));

        if (songItemNumber !== currentlyPlayingSongNumber) {
            $songItem.html(playButtonTemplate);
        }
    };

    var offHover = function offHover(event) {
        var $songItem = $(this).find('.song-item-number');
        var songItemNumber = parseInt($songItem.attr('data-track-number'));

        if (songItemNumber !== currentlyPlayingSongNumber) {
            $songItem.html(songItemNumber);
        }
    };

    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);

    return $row;
};

var setCurrentAlbum = function setCurrentAlbum(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(parseInt(i + 1), album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var setSong = function setSong(songNumber) {
    currentlyPlayingSongNumber = parseInt(songNumber);
    var songNumberIndex = parseInt(songNumber - 1);
    currentSongFromAlbum = currentAlbum.songs[songNumberIndex];
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    setVolume(currentVolume);
    var $volumeSeek = $('.volume .seek-bar');
    updateSeekPercentage($volumeSeek, currentVolume / 100);
};

var seek = function seek(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function setVolume(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
        currentVolume = volume;
    }
};

var getSongNumberCell = function getSongNumberCell(number) {
    var $songNumberCell = $('.song-item-number[data-track-number="' + number + '"]');
    return $songNumberCell;
};

var trackIndex = function trackIndex(album, song) {
    return album.songs.indexOf(song);
};

var updatePlayerBarSong = function updatePlayerBarSong() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};

var togglePlayFromPlayerBar = function togglePlayFromPlayerBar() {
    var $songNumberCell = getSongNumberCell(currentlyPlayingSongNumber);

    if (currentSoundFile) {
        if (currentSoundFile.isPaused()) {
            $songNumberCell.html(pauseButtonTemplate);
            $playButton.html(playerBarPauseButton);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
        } else {
            $songNumberCell.html(playButtonTemplate);
            $playButton.html(playerBarPlayButton);
            currentSoundFile.pause();
        }
    }
};

var nextSong = function nextSong() {
    var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var $oldSong = getSongNumberCell(currentIndex + 1);
    var oldSongNumber = parseInt($oldSong.attr('data-track-number'));
    var $newSong = null;

    currentIndex++;

    if (currentIndex >= currentAlbum.songs.length) {
        currentIndex = 0;
    }

    setSong(currentIndex + 1);
    $oldSong.html(oldSongNumber);
    $newSong = getSongNumberCell(currentIndex + 1);
    $newSong.html(pauseButtonTemplate);
    updatePlayerBarSong();
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
};

var previousSong = function previousSong() {
    var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var $oldSong = getSongNumberCell(currentIndex + 1);
    var oldSongNumber = parseInt($oldSong.attr('data-track-number'));
    var $newSong = null;

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = currentAlbum.songs.length - 1;
    }


    setSong(currentIndex + 1);
    $oldSong.html(oldSongNumber);
    $newSong = getSongNumberCell(currentIndex + 1);
    $newSong.html(pauseButtonTemplate);
    updatePlayerBarSong();
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
};

var updateSeekBarWhileSongPlays = function updateSeekBarWhileSongPlays() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function (event) {
            var currentTime = this.getTime();
            var duration = this.getDuration();
            var seekBarFillRatio = currentTime / duration;
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(currentTime.toString());
            if (currentSoundFile.isEnded()) {
                if (currentlyPlayingSongNumber < currentAlbum.songs.length) {
                    nextSong();
                }
            }
        });
    }
};

var setCurrentTimeInPlayerBar = function setCurrentTimeInPlayerBar(currentTime) {
    $currentTimeDisplay.text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function setTotalTimeInPlayerBar(totalTime) {
    $totalTimeDisplay.text(filterTimeCode(totalTime));
};

var filterTimeCode = function filterTimeCode(timeInSeconds) {
    timeInSeconds = parseFloat(timeInSeconds);
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = Math.floor(timeInSeconds % 60);
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
};

var updateSeekPercentage = function updateSeekPercentage($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function setupSeekBars() {
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function (event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        updateSeekPercentage($(this), seekBarFillRatio);
        if ($(this).parent().hasClass('seek-control')) {
            seek(currentSoundFile.getDuration() * seekBarFillRatio);
        } else {
            setVolume(100 * seekBarFillRatio);
        }
    });

    $seekBars.find('.thumb').mousedown(function (event) {
        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function (event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            updateSeekPercentage($seekBar, seekBarFillRatio);
            if ($seekBar.parent().hasClass('seek-control')) {
                seek(currentSoundFile.getDuration() * seekBarFillRatio);
            } else {
                setVolume(100 * seekBarFillRatio);
            }
        });

        $(document).bind('mouseup.thumb', function () {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

// Store state of playing songs
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $playButton = $('.main-controls .play-pause');
var $nextButton = $('.main-controls .next');
var $currentTimeDisplay = $('.current-time');
var $totalTimeDisplay = $('.total-time');

$(document).ready(function () {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $playButton.click(togglePlayFromPlayerBar);
    $nextButton.click(nextSong);
});