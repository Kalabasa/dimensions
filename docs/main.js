var colorMap = {
	dimensionsCool: [0x49ad9c, 0x99c89e],
	dimensionsWarm: [0x4d2b52, 0xbb5b85],
	dimensionsMid: [0xffd02d, 0xf8dd85],
	dimensionsNeutral: [0xb8b9c9, 0xe8e8ee, 0xaaabb9, 0xcbced4]
};

document.addEventListener('DOMContentLoaded', onDocumentLoad);

var video;
var canvas;
var canvasContext;
var videoStreamSettings;

function onDocumentLoad() {
	video = document.getElementById('video');
	canvas = document.getElementById('canvas');
	canvasContext = canvas.getContext('2d');

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
				videoStreamSettings = stream.getVideoTracks()[0].getSettings();
				canvas.width = videoStreamSettings.width;
				canvas.height = videoStreamSettings.height;

				video.srcObject = stream;
				video.play();

				video.addEventListener('play', loop);
			});
		} catch (error) {
			alert('Something went wrong while getting the camera stream.');
		}
	} else {
		alert('Your browser does not support camera access.');
	}
}

function loop() {
	process();
	setTimeout(loop, 0);
}

function process() {
	if (!video.videoWidth || !video.videoHeight) return;

	canvasContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
	const frame = canvasContext.getImageData(
		0,
		0,
		video.videoWidth,
		video.videoHeight
	);
	const l = frame.data.length / 4;

	let maxRGB = 1;
	for (let i = 0; i < l; i++) {
		const r = frame.data[i * 4 + 0];
		const g = frame.data[i * 4 + 1];
		const b = frame.data[i * 4 + 2];
		const rgb = r + g + b;
		maxRGB = Math.max(maxRGB, rgb);
	}
	let white = maxRGB / 3;

	for (let i = 0; i < l; i++) {
		const r = frame.data[i * 4 + 0] * 0xff / white;
		const g = frame.data[i * 4 + 1] * 0xff / white;
		const b = frame.data[i * 4 + 2] * 0xff / white;
		// frame.data[i * 4 + 0] = Math.floor(r);
		// frame.data[i * 4 + 1] = Math.floor(g);
		// frame.data[i * 4 + 2] = Math.floor(b);
		const coolMask = (colorDistance(r, g, b, 0x49, 0xad, 0x9c) < 88) * 0xff;
		const warmMask1 = (colorDistance(r, g, b, 0x42, 0x25, 0xb2) < 96) * 0xff;
		const warmMask2 = (colorDistance(r, g, b, 0xbb, 0x5b, 0x85) < 64) * 0xff;
		const midMask = (colorDistance(r, g, b, 0xf8, 0xdd, 0x85) < 64) * 0xff;
		frame.data[i * 4 + 0] = 0xff & (warmMask1 | warmMask2);
		frame.data[i * 4 + 1] = 0xff & midMask;
		frame.data[i * 4 + 2] = 0xff & coolMask;
	}
	canvasContext.putImageData(frame, 0, 0);
}

function colorDistance(r, g, b, r2, g2, b2) {
	const dr = r - r2;
	const dg = g - g2;
	const db = b - b2;
	return Math.sqrt(dr * dr + dg * dg + db * db);
}