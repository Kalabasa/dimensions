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
				video.srcObject = stream;
				video.play();
			});
		} catch (error) {
			alert('Something went wrong while getting the camera stream.');
		}
	} else {
		alert('Your browser does not support camera access.');
	}
}
