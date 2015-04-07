if (window.jQuery) {
	(function($) {

		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			mobile = true;
		} else {
			mobile = false;
		}

		function toMMSS(string) {
			var sec_num = parseInt(string, 10);
			/* don't forget the second param */
			var hours = Math.floor(sec_num / 3600);
			var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			var seconds = sec_num - (hours * 3600) - (minutes * 60);

			if (hours < 10) {
				hours = "0" + hours;
			}
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			if (seconds < 10) {
				seconds = "0" + seconds;
			}
			if (hours == 0) {
				var time = minutes + ':' + seconds;
			} else {
				var time = hours + ':' + minutes + ':' + seconds;
			}
			return time;
		}


		$.fn.audio = function(useroptions) {

			var defaults = {
				volume : 0.8,
				url : '',
				src : '',
				width : '300px',
				playlist : [],
				playlistPlay : 'loop',
				playlistOnEnd : 'stop',
				playlistHeadHoverHide : true,
				playlistAlwaysShow : false,
				fallback : ''
			};

			var options = $.extend({}, defaults, useroptions);

			console.log(options);

			var audio = this[0];
			var el = this;
			el.wrap('<div class="potatomedia-wrapper"></div>');
			var wrapper = this.parent();
			function getcss(a) {
				var sheets = document.styleSheets,
				    o = {};
				for (var i in sheets) {
					var rules = sheets[i].rules || sheets[i].cssRules;
					for (var r in rules) {
						if (a.is(rules[r].selectorText)) {
							o = $.extend(o, css2json(rules[r].style), css2json(a.attr('style')));
						}
					}
				}
				return o;
			}


			this.append(options.fallback);

			if (options.playlist != []) {

				if ( typeof options.playlist === 'string') {
					$.getJSON(options.playlist, function(data) {
						console.log(data);
						options.playlist = data;
						playlistReady();
					});
				} else {
					playlistReady();
				}

				/* If playlist is added */
			} else if (options.src === '') {
				options.src = this.attr('src');
				this.attr('src', options.src);
				audio.load();
			} else {
				this.attr('src', options.src);
				audio.load();
			}

			if (options.playlist != []) {
				var currentsong = 0;
			}

			var controlhtml = '<div class="controls" style="min-width: 200px; width: ' + options.width + ';"><img class="audioplay play" src="' + options.url + 'images/play.png"><div class="currentTime">00:00</div><div class="sliderwrapper"><div class="sliderprogress"><div class="sliderend"></div></div></div><div class="duration">00:00</div><img class="volume-icon" src="' + options.url + 'images/volume.png"><div class="volumewrapper"><div class="volume"><div class="volumeend"></div></div></div></div>';
			// <tr><td class="selected"><span class="song-title">Happiest Kid in the World</span><div class="addinfo">Written By (Somebody\'s Name)</div></td></tr><tr><td class="unselected"><span class="song-title">Jesus the Way Truth Life</span><div class="addinfo">Written By (Somebody \'s Name)</div></td></tr>
			var playlist = '<table class="playlist-tb"><tr class="thead"><td class="currentsong">Error</td></tr><tr class="tbody"><td><div class="list-wrapper"><table></table></div></td></tr></table>';
			wrapper.append(controlhtml + playlist);
			var control = this.next();
			$('.playlist-tb', wrapper).css('width', options.width);
			var slider = $('.sliderwrapper', control);
			slider.css('width', control.width() - (155 + $('.volumewrapper', control).width()));
			var play = $('.audioplay', control);
			var currentTime = $('.currentTime', control);
			var volume = $('.volume-icon', control);
			var volumeslider = $('.volumewrapper', control);
			volume.css('right', volumeslider.width() + 8);
			$('.duration', control).css('right', volumeslider.width() + 33);

			$(window).on('resize', function() {
				slider.css('width', control.width() - (155 + $('.volumewrapper', control).width()));
				volume.css('right', volumeslider.width() + 8);
				console.log($('.duration', wrapper)[0]);
				$('.duration', control).css('right', volumeslider.width() + 33);
			});

			var playurl = options.url + 'images/play.png';
			var pauseurl = options.url + 'images/pause.png';

			volumeslider.children().css('width', options.volume * 100 + '%');
			audio.volume = options.volume;

			this.on('canplay', function(e) {
				$('.duration', control).text(toMMSS(audio.duration));
				if (audio.autoplay === true) {
					audio.play();
				}

				// volumeslider.children().css('width', options.volume * 100 + '%');

			});

			this.on('playing', function(e) {
				play.attr('src', pauseurl);
			});

			this.on('play', function(e) {
				play.attr('src', pauseurl);
			});

			this.on('pause', function(e) {
				play.attr('src', playurl);
			});

			this.on('timeupdate', function(e) {
				var currentTimeI = audio.currentTime / audio.duration * 100;
				slider.children().css('width', currentTimeI + '%');
				currentTime.text(toMMSS(audio.currentTime));
			});

			var fn = {
				setTime : function(e) {

					if (e.type.substring(0, 5) === 'touch') {
						var x = e.originalEvent.touches[0].pageX;
					} else if (e.type.substring(0, 5) === 'mouse') {
						var x = e.pageX;
					}

					var left = x - slider.offset().left;
					var percentage = 100 * left / slider.width();
					slider.children().css('width', percentage + '%');
					if (audio.currentTime < audio.duration - 2) {
						audio.currentTime = audio.duration * percentage / 100;
					} else if (audio.currentTime >= audio.duration - 2) {
						audio.pause();
					}
				},
				setVolume : function(e) {
					if (e.type.substring(0, 5) === 'touch') {
						var x = e.originalEvent.touches[0].pageX;
					} else if (e.type.substring(0, 5) === 'mouse') {
						var x = e.pageX;
					}
					var left = x - volumeslider.offset().left;
					var percentage = 100 * left / volumeslider.width();
					/* Duration divided by the percentage of where cursor clicked */
					if (left / volumeslider.width() > 1.0) {
						volumeslider.children().css('width', '100%');
						audio.volume = 1.0;
					} else if (percentage < 0) {
						volumeslider.children().css('width', '0%');
						audio.volume = 0;
					} else {
						audio.volume = percentage / 100;
						volumeslider.children().css('width', percentage + '%');
					}
				}
			};

			slider.on('mousedown touchstart', function(event) {

				fn.setTime(event);

				$(document).one('mouseup touchend', function() {
					$(document).off('mousemove touchmove');
				});

				$(document).on('mousemove touchmove', function(event) {
					fn.setTime(event);
				});
			});

			volumeslider.on('mousedown touchstart', function(event) {

				fn.setVolume(event);

				$(document).one('mouseup touchend', function() {
					$(document).off('mousemove touchmove');
				});

				$(document).on('mousemove touchmove', function(event) {
					fn.setVolume(event);
				});
			});

			play.on('click', function() {
				if (audio.paused) {
					audio.play();
				} else {
					audio.pause();
				}
			});

			/* Playlist */

			audio.changesrc = function(src, add) {
				this.src = src;
				try {
					add();
				} catch (err) {

				}
			};

			$('.currentsong', wrapper).text(options.src);

			function playlistReady() {

				if (options.src === '') {
					/* If the user did not input the src */
					el.attr('src', options.playlist[0]);
					audio.load();
				} else {
					/* Otherwise, input add it in itself if it is not already in the playlist */
					if (options.playlist[0].src !== options.src) {
						options.playlist.unshift({
							name : options.src,
							src : options.src,
							addinfo : ''
						});
					}
				}

				/* Load It! */
				el.attr('src', options.playlist[0].name);
				audio.load();

				$('.currentsong', wrapper).text(options.playlist[0].name);

				for ( i = 0; i < options.playlist.length; i++) {
					$('.playlist-tb .tbody table', wrapper).append('<tr><td class="unselected"><span class="song-title"></span><div class="addinfo"></div></td></tr>');
					var current = $('.playlist-tb .tbody table tbody tr:nth-child(' + (i + 1) + ')', wrapper);
					if (i == 0) {
						current.children().removeClass('unselected').addClass('selected');
					}
					$('.song-title', current).text(options.playlist[i].name);
					$('.addinfo', current).text(options.playlist[i].extraInfo);
				}

				el.on('ended', function(e) {
					allowhover = false;
					currentsong++;
					console.log(currentsong);
					if (currentsong === options.playlist.length) {
						currentsong = 0;
						if (options.playlistOnEnd === 'stop') {

						} else if (options.playlistOnEnd === 'loop') {
							audio.changesrc(options.playlist[0].src, function() {
								audio.load();
								audio.play();
							});
						}
					} else {
						audio.changesrc(options.playlist[currentsong].src, function() {
							audio.load();
							if (options.playlistPlay === 'loop') {
								audio.play();
							} else if (options.playlistPlay === 'stop') {
								audio.currentTime = 0;
								slider.children().css('width', '0%');
							}
						});
					}
					$('.currentsong', wrapper).text((function() {
						if (options.src === '') {
							return options.playlist[currentsong].name;
						} else {
							return options.src;
						}
					})());
					$('.playlist-tb', wrapper).stop().animate({
						top : '-4px'
					}, 200, function() {
						var foo = this;
						setTimeout(function() {
							if (!allowhover) {
								$(foo).stop().animate({
									top : '-27px'
								}, 200);
							}
						}, 800);
					});
					$('.list-wrapper', wrapper).slideUp(200);
					$('.playlist-tb .tbody table tbody tr', wrapper).children().removeClass('selected').addClass('unselected');
					$('.playlist-tb .tbody table tbody tr:nth-child(' + (currentsong + 1) + ')', wrapper).children().removeClass('unselected').addClass('selected');
				});

				var allowhover = true;
				var thead = $('.playlist-tb .thead', wrapper);

				if (options.playlistHeadHoverHide) {
					options.playlistAlwaysShow = false;
					$('.playlist-tb', wrapper).hover(function() {
						if (allowhover) {
							$(this).stop().animate({
								top : '-4px'
							}, 200);
						}
					}, function() {
						allowhover = true;
						$(this).stop().animate({
							top : '-27px'
						}, 200);
						$('.list-wrapper', wrapper).slideUp(200);
					});
				} else {
					$('.playlist-tb', wrapper).css('top', '-4px');
				}

				if (!options.playlistAlwaysShow) {
					thead.on('click', function(e) {
						var $el = $('.list-wrapper', $(this).next());
						var thead = $(this);
						thead.css('user-select', 'none');
						thead.css('-o-user-select', 'none');
						thead.css('-moz-user-select', 'none');
						thead.css('-khtml-user-select', 'none');
						thead.css('-webkit-user-select', 'none');

						$el.stop().slideToggle(200, function() {
							thead.css('user-select', 'all');
							thead.css('-o-user-select', 'all');
							thead.css('-moz-user-select', 'all');
							thead.css('-khtml-user-select', 'all');
							thead.css('-webkit-user-select', 'all');
						});
					});
				} else {
					var $el = $('.list-wrapper', wrapper);
					$el.css('display', 'block');
				}
				var $playlistItem = $('.playlist-tb .tbody table td', wrapper);

				$playlistItem.on('click', function(e) {
					$('.playlist-tb tbody table td').removeClass('selected');
					$('.playlist-tb tbody table td').addClass('unselected');
					$(this).removeClass('unselected');
					$(this).addClass('selected');
					var index = $playlistItem.index(this);
					if (currentsong != index) {
						currentsong = index;
						var playallow = false;
						if (!audio.paused) {
							playallow = true;
						}
						audio.src = options.playlist[currentsong].src;
						$('.currentsong', wrapper).text(options.playlist[currentsong].name);
						audio.load();
						el.one('canplay', function() {
							audio.currentTime = 0;
						});
						if (playallow) {
							audio.play();
						}
					}
				});
			}

		};
	})(jQuery);
} else {
	alert('Please use jQuery! Otherwise, use the pure javascript version.');
}