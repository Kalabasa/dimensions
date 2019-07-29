var colorMap = {
	dimensionsCool: 0x99c89e,
	dimensionsWarm: 0xbb5b85,
	dimensionsMid: 0xf8dd85,
	dimensionsNeutral: 0xe8e8ee
};

document.addEventListener('DOMContentLoaded', onDocumentLoad);

var video, videoDisplay, snapshotCanvas, canvas, videoStreamSettings, tracker;

Object.entries(colorMap).forEach(function(entry) {
	var color = entry[1];
	var r = (color >> 16) & 0xff;
	var g = (color >> 8) & 0xff;
	var b = color & 0xff;
	tracking.ColorTracker.registerColor(entry[0], createColorFunction(r, g, b));
});

function onDocumentLoad() {
	video = document.getElementById('video');
	videoDisplay = document.getElementById('videoDisplay');
	snapshotCanvas = document.getElementById('snapshotCanvas');
	canvas = document.getElementById('canvas');

	snapshotCanvas.width = 160;
	snapshotCanvas.height = 160;

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

				videoDisplay.srcObject = stream;
				videoDisplay.play();

				callback();
			});
		} catch (error) {
			alert('Something went wrong while getting the camera stream.');
		}
	} else {
		alert('Your browser does not support camera access.');
	}
}

function copySnapshot() {
  var context = snapshotCanvas.getContext('2d');
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
}

function trackingLoop() {
	copySnapshot();
	tracking.track(snapshotCanvas, tracker);

	requestAnimationFrame(trackingLoop);
}

function startTracking() {
	tracker = new tracking.ColorTracker(Object.keys(colorMap));

	tracker.on('track', function(event) {
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		event.data.forEach(function(item) {
			const x = item.x / snapshotCanvas.width * canvas.width;
			const y = item.y / snapshotCanvas.height * canvas.height;
			const width = item.width / snapshotCanvas.width * canvas.width;
			const height = item.height / snapshotCanvas.height * canvas.height;
			context.strokeStyle = '16px #' + colorMap[item.color].toString(16).padStart(6, '0');
			context.strokeRect(x, y, width, height);
			context.font = '16px sans-serif';
			context.fillStyle = 'white';
			context.strokeStyle = 'black';
			context.fillText(item.color, x + width / 2, y + height / 2);
			context.strokeText(item.color, x + width / 2, y + height / 2);
		});
	});

	trackingLoop();
}

function createColorFunction(r, g, b, threshold = 128) {
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
