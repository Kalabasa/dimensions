var colorMap = {
	dimensionsCool: 0x99c89e,
	dimensionsWarm: 0xbb5b85,
	dimensionsMid: 0xf8dd85,
	dimensionsNeutral: 0xe8e8ee
};

document.addEventListener('DOMContentLoaded', onDocumentLoad);

var video, canvas;

Object.entries(colorMap).forEach(function(entry) {
	var color = entry[1];
	var r = (color >> 16) & 0xff;
	var g = (color >> 8) & 0xff;
	var b = color & 0xff;
	tracking.ColorTracker.registerColor(entry[0], createColorFunction(r, g, b));
});

function onDocumentLoad() {
	video = document.getElementById('video');
	canvas = document.getElementById('canvas');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	captureVideo(startTracking);
}

function captureVideo(callback) {
	var getUserMedia =
		(navigator.mediaDevices &&
			navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)) ||
		navigator.getUserMedia.bind(navigator) ||
		navigator.webkitGetUserMedia.bind(navigator) ||
		navigator.mozGetUserMedia.bind(navigator);

	if (getUserMedia) {
		try {
			var stream = getUserMedia({
				video: {
					facingMode: { ideal: 'environment' }
				}
			}).then(function(stream) {
				video.srcObject = stream;
				video.play();
				callback();
			});
		} catch (error) {
			alert('Something went wrong while getting the camera stream.');
		}
	} else {
		alert('Your browser does not support camera access.');
	}
}

function startTracking() {
	var tracker = new tracking.ColorTracker(Object.keys(colorMap));

	tracker.on('track', function(event) {
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		event.data.forEach(function(item) {
			context.strokeStyle = '#' + colorMap[item.color].toString(16).padStart(6);
			context.strokeRect(item.x, item.y, item.width, item.height);
		});
	});

	tracking.track(video, tracker);
}

function createColorFunction(r, g, b, threshold = 48) {
	return function(sr, sg, sb) {
		return computeColorDistance(r, g, b, sr, sg, sb) < threshold;
	};
}

function computeColorDistance(r1, g1, b1, r2, g2, b2) {
	var dr = r2 - r1;
	var dg = g2 - g1;
	var db = b2 - b1;
	return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}
