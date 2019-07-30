var palettes = {
	paletteCool: [0x2d475e, 0x49ad9c, 0x99c89e],
	paletteWarm: [0x4d2b52, 0xbb5b85],
	paletteMid: [0xffd02d, 0xf8dd85, 0xf3f5ca]
};

var mainScreen;
var titleScreen;
var video;
var canvas;
var startButton;
var hud;

var scene;
var camera;
var controls;
var renderer;

var time = 0;
var running = false;
var paintingPosition = new THREE.Vector3();
var paintingNormal = new THREE.Vector3();
var particles = [];

document.addEventListener('DOMContentLoaded', onDocumentLoad);

function randomPalette() {
	return Object.values(palettes)[
		Math.floor(Math.random() * Object.keys(palettes).length)
	];
}

function pickRandomColors(palette, number) {
	var index = Math.floor(Math.random() * palette.length);
	var result = [palette[index]];
	if (number > 1) {
		var rest = palette
			.slice(0, index)
			.concat(palette.slice(index + 1, palette.length));
		return pickRandomColors(rest, number - 1).concat(result);
	} else {
		return result;
	}
}

// should've been using OOP but here we are
var particleTypes = {
	paper: function(colors) {
		var bodyShape = new THREE.Shape();
		bodyShape.moveTo(-0.5, -0.5);
		bodyShape.lineTo(0, -0.5);
		bodyShape.arc(0, 0.5, 0.5, -Math.PI / 2, 0);
		bodyShape.lineTo(0.5, 0.5);
		bodyShape.lineTo(-0.5, 0.5);

		var bodyMesh = new THREE.Mesh(
			new THREE.ExtrudeGeometry(bodyShape, {
				depth: 0.04,
				curveSegments: 4,
				bevelEnabled: false
			}),
			new THREE.MeshLambertMaterial({ color: colors[0] })
		);

		var flapShape = new THREE.Shape();
		flapShape.moveTo(0, -0.51);
		flapShape.arc(0, 0.51, 0.51, -Math.PI / 2, 0);
		flapShape.arc(0, -0.51, 0.51, Math.PI / 2, Math.PI);

		var flapMesh = new THREE.Mesh(
			new THREE.ExtrudeGeometry(flapShape, {
				depth: 0.06,
				curveSegments: 4,
				bevelEnabled: false
			}),
			new THREE.MeshLambertMaterial({ color: colors[1] })
		);

		flapMesh.position.z = -0.01;
		bodyMesh.add(flapMesh);

		return {
			object: bodyMesh,
			update: function() {}
		};
	},

	pencil: function(colors) {
		var bodyShape = new THREE.Shape();
		bodyShape.moveTo(-0.5, -0.5);
		bodyShape.arc(0, 0, 1, 0, Math.PI / 2);
		bodyShape.lineTo(-0.5, -0.5);

		var bodyMesh = new THREE.Mesh(
			new THREE.ExtrudeGeometry(bodyShape, {
				depth: 0.04,
				curveSegments: 4,
				bevelEnabled: false
			}),
			new THREE.MeshLambertMaterial({ color: colors[0] })
		);

		var tipShape = new THREE.Shape();
		tipShape.moveTo(-0.51, -0.51);
		tipShape.arc(0, 0, 0.51, 0, Math.PI / 2);
		tipShape.lineTo(-0.51, -0.51);

		var tipMesh = new THREE.Mesh(
			new THREE.ExtrudeGeometry(tipShape, {
				depth: 0.06,
				curveSegments: 4,
				bevelEnabled: false
			}),
			new THREE.MeshLambertMaterial({ color: colors[1] })
		);

		tipMesh.position.z = -0.01;
		bodyMesh.add(tipMesh);

		return {
			object: bodyMesh,
			update: function() {}
		};
	},

	pen: function(colors) {
		var shape = new THREE.Shape();
		shape.moveTo(0, -0.5);
		shape.arc(0.5, 0, 0.5, Math.PI, Math.PI / 2, true);
		shape.lineTo(0.5, 0.5);
		shape.lineTo(-0.5, 0.5);
		shape.lineTo(-0.5, 0);
		shape.arc(0, -0.5, 0.5, Math.PI / 2, 0, true);

		var mesh = new THREE.Mesh(
			new THREE.ExtrudeGeometry(shape, {
				depth: 0.05,
				curveSegments: 4,
				bevelEnabled: false
			}),
			new THREE.MeshLambertMaterial({ color: colors[0] })
		);

		return {
			object: mesh,
			update: function() {}
		};
	},

	brush: function(colors) {
		var shape = new THREE.Shape();
		shape.moveTo(0, -0.5);
		shape.arc(0, 0.5, 0.5, -Math.PI / 2, 0, false);
		shape.arc(0, 0.5, 0.5, -Math.PI / 2, -Math.PI, true);
		shape.lineTo(-0.5, 0.5);
		shape.lineTo(-0.5, 0);
		shape.arc(0.5, 0, 0.5, -Math.PI, -Math.PI / 2);

		var mesh = new THREE.Mesh(
			new THREE.ExtrudeGeometry(shape, {
				depth: 0.05,
				curveSegments: 4,
				bevelEnabled: false
			}),
			new THREE.MeshLambertMaterial({ color: colors[0] })
		);

		return {
			object: mesh,
			update: function() {}
		};
	},

	tablet: function(colors) {
		var bodyMesh = new THREE.Mesh(
			new THREE.BoxGeometry(1, 0.04, 1),
			new THREE.MeshLambertMaterial({ color: colors[0] })
		);

		var screenMesh = new THREE.Mesh(
			new THREE.CylinderGeometry(0.49, 0.49, 0.06, 16, 1),

			new THREE.MeshLambertMaterial({ color: colors[1] })
		);

		screenMesh.position.z = -0.01;
		bodyMesh.add(screenMesh);

		return {
			object: bodyMesh,
			update: function() {}
		};
	}
};

function onDocumentLoad() {
	mainScreen = document.getElementById('mainScreen');
	titleScreen = document.getElementById('titleScreen');
	video = document.getElementById('video');
	canvas = document.getElementById('canvas');
	startButton = document.getElementById('startButton');
	hud = document.getElementById('hud');

	startButton.addEventListener('click', start);
	hud.addEventListener('click', lockIn);
}

function start() {
	if (scene) {
		return;
	}

	video.play();

	var getUserMedia =
		(navigator.mediaDevices &&
			navigator.mediaDevices.getUserMedia &&
			navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)) ||
		(navigator.getUserMedia && navigator.getUserMedia.bind(navigator)) ||
		(navigator.webkitGetUserMedia &&
			navigator.webkitGetUserMedia.bind(navigator)) ||
		(navigator.mozGetUserMedia && navigator.mozGetUserMedia.bind(navigator));

	if (getUserMedia) {
		try {
			var stream = getUserMedia({
				video: {
					facingMode: { ideal: 'environment' }
				}
			})
				.then(function(stream) {
					video.srcObject = stream;
					video.play();
					titleScreen.classList.add('hide');
				})
				.catch(function(error) {
					alert('Camera access is required for this app. Please try again.');
					location.reload();
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

	light = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
	light.position.set(0, 100, 0);
	scene.add(light);

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	controls = new THREE.DeviceOrientationControls(camera);

	renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0, 0);

	loop();
}

function lockIn() {
	hud.style.display = 'none';
	running = true;

	var cameraDirection = camera.getWorldDirection(new THREE.Vector3());
	// paintingPosition = camera.position.clone().
}

function loop() {
	if (running) {
		update();
	}

	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function update() {
	if (particles.length < 600) {
		var typeNames = Object.keys(particleTypes);
		var type =
			particleTypes[typeNames[Math.floor(Math.random() * typeNames.length)]];
		var particle = createParticle(type);
		particles.push(particle);
		scene.add(particle.object);
	}

	particles.forEach(updateParticle);

	time++;
}

function updateParticle(particle) {
	particle.update();

	particle.object.position.add(particle.velocity);
}

function createParticle(type) {
	var colors = pickRandomColors(randomPalette(), 2);

	var particle = type(colors);

	particle.velocity = new THREE.Vector3(
		Math.random() * 0.2 - 0.1,
		Math.random() * 0.2 - 0.1,
		Math.random() * 0.2 - 0.1
	);

	particle.object.scale.multiplyScalar(4);
	particle.object.position.set(
		Math.random() * 40 - 20,
		Math.random() * 40 - 20,
		Math.random() * 40 - 20
	);
	particle.object.rotation.set(
		Math.random() * 2 * Math.PI,
		Math.random() * 2 * Math.PI,
		Math.random() * 2 * Math.PI
	);

	return particle;
}
