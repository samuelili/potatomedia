if (window.jQuery) {
	(function($) {
		$.fn.audio = function() {
			var audio = this;
			this.wrap('<div class="potatomedia-wrapper"></div>');
			var wrapper = this.parent();
			var controlhtml = '<div class="controls" style="width: 300px; top: 100px; position: absolute; left: 100px;"><img class="audioplay play" src="../images/play.png"><div class="currentTime">00:01</div><div class="sliderwrapper" style="width: 95px;"><div class="sliderprogress" style="width: 0%;"><div class="sliderend"></div></div></div><div class="duration">03:56</div><img class="volume-icon" src="../images/volume.png"><div class="volumewrapper"><div class="volume"><div class="volumeend"></div></div></div></div>';
			console.log(wrapper[0]);
		};
	})(jQuery);
} else {
	alert('Please use jQuery! Otherwise, use the pure javascript version.');
}