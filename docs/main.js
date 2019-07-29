var colorMap = {
	dimensionsCool: [0x2d475e, 0x49ad9c, 0x99c89e],
	dimensionsWarm: [0x4d2b52, 0xbb5b85],
	dimensionsMid: [0xffd02d, 0xf8dd85, 0xf3f5ca, 0xfafaf9],
	dimensionsNeutral: [0xb8b9c9, 0xe8e8ee, 0xaaabb9, 0xcbced4]
};

document.addEventListener('DOMContentLoaded', onDocumentLoad);

var video, videoDisplay, snapshotCanvas, canvas, videoStreamSettings, tracker;

Object.entries(colorMap).forEach(function(entry) {
	tracking.ColorTracker.registerColor(entry[0], createColorFunction(entry[1]));
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
	context.drawImage(
		video,
		0,
		0,
		video.videoWidth,
		video.videoHeight,
		0,
		0,
		snapshotCanvas.width,
		snapshotCanvas.height
	);
}

function trackingLoop() {
	copySnapshot();
	tracking.track(snapshotCanvas, tracker);

	requestAnimationFrame(trackingLoop);
}

function startTracking() {
	tracker = new tracking.ColorTracker(Object.keys(colorMap));

	tracker.minDimension = 1;

	tracker.on('track', function(event) {
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		event.data.forEach(function(item) {
			const x = (item.x / snapshotCanvas.width) * canvas.width;
			const y = (item.y / snapshotCanvas.height) * canvas.height;
			const width = (item.width / snapshotCanvas.width) * canvas.width;
			const height = (item.height / snapshotCanvas.height) * canvas.height;
			context.strokeStyle =
				'16px ' + chroma(colorMap[item.color][0]).hex();
			context.strokeRect(x, y, width, height);
			context.font = 'bold 16px sans-serif';
			context.fillStyle = 'white';
			context.strokeStyle = 'solid 16px black';
			context.strokeText(item.color, x + width / 2, y + height / 2);
			context.fillText(item.color, x + width / 2, y + height / 2);
		});
	});

	trackingLoop();
}

function createColorFunction(colors, threshold = 35) {
	return function(sr, sg, sb) {
		for(var color of colors) {
			const r = (color >> 16) & 0xff;
			const g = (color >> 8) & 0xff;
			const b = color & 0xff;
			if(computeColorDistance(r, g, b, sr, sg, sb) < threshold) {
				return true;
			}
		}
	};
}

function computeColorDistance(r1, g1, b1, r2, g2, b2) {
	var dr = r2 - r1;
	var dg = g2 - g1;
	var db = b2 - b1;
	return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}
