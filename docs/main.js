document.addEventListener('DOMContentLoaded', onDocumentLoad);

var video;
var scene;
var camera;
var controls;
var renderer;

function onDocumentLoad() {
	video = document.getElementById('video');

	var getUserMedia =
		(navigator.mediaDevices &&
			navigator.mediaDevices.getUserMedia &&
			navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)) ||
		(navigator.getUserMedia && navigator.getUserMedia.bind(navigator)) ||
		(navigator.webkitGetUserMedia &&
			navigator.webkitGetUserMedia.bind(navigator)) ||
		(navigator.mozGetUserMedia && navigator.mozGetUserMedia.bind(navigator));

	if (false && getUserMedia) {
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
			alert(
				'Something went wrong while getting the camera stream. Your experience may be limited.'
			);
		}
	} else {
		alert(
			'Your browser does not support camera access. Your experience may be limited.'
		);
	}

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	controls = new THREE.DeviceOrientationControls(camera);

	var geometry = new THREE.BoxGeometry(10, 10, 10);
	var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
	var thing = new THREE.Mesh(geometry, material);
	thing.rotation.x = 1;
	thing.rotation.y = 1;
	thing.position.y = -10;
	thing.position.z = -5;
	scene.add(thing);

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0, 0);
	renderer.domElement.style.position = 'absolute';
	document.body.appendChild(renderer.domElement);

	loop();
}

function loop() {
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}
