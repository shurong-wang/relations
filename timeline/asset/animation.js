(function (window) {
	window.animation = function(fps){
		if(fps) {
			this.fps = fps;
		}
	}
	animation.prototype.animationList = [];
	animation.prototype.fps = 60;
	animation.prototype.stop = function (index) {
		clearInterval(index);
		this.animationList = this.animationList.map(function (d) {
			return d != index;
		});
	}
	animation.prototype.start = function (render, fps) {
		return this.animationList.push(setInterval(render, 1000/fps || this.fps));
	}
	animation.prototype.stopAll = function () {
		this.animationList.forEach(function (d) {
			return clearInterval(d);
		})
		this.animationList.splice(0);
	}
})(window);
