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
var paintingPosition;
var paintingNormal;

var ring1;
var ring2;
var ring3;
var ring4;

var particles = [];

var tmpVector3 = new THREE.Vector3();
var tmpMatrix4 = new THREE.Matrix4();
var tmpQuaternion = new THREE.Quaternion();

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
			new THREE.BoxGeometry(1, 1, 0.04),
			new THREE.MeshLambertMaterial({ color: colors[0] })
		);

		var screenMesh = new THREE.Mesh(
			new THREE.CylinderGeometry(0.49, 0.49, 0.06, 16, 1),

			new THREE.MeshLambertMaterial({ color: colors[1] })
		);

		screenMesh.rotation.x = Math.PI / 2;
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

	// controls = new THREE.DeviceOrientationControls(camera);
	camera.rotation.set(0, Math.PI / 2, 0);

	renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0, 0);

	loop();
}

function lockIn() {
	hud.style.display = 'none';

	var cameraDirection = camera.getWorldDirection(tmpVector3);
	paintingPosition = camera.position
		.clone()
		.addScaledVector(cameraDirection, 30);
	paintingNormal = cameraDirection.clone().multiplyScalar(-1);

	ring1 = new THREE.Mesh(
		new THREE.RingGeometry(0.4, 4, 32),
		new THREE.MeshBasicMaterial({ color: 0x2d475e })
	);
	ring1.position
		.copy(paintingPosition)
		.addScaledVector(paintingNormal, 0.2)
		.add({
			x: Math.random() * 1 - 0.5,
			y: Math.random() * 1 - 0.5,
			z: Math.random() * 1 - 0.5
		});
	ring1.lookAt(camera.position);
	ring1.rotateOnAxis(
		{ x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 },
		(Math.random() * Math.PI) / 4 - Math.PI / 8
	);
	ring1.scale.set(0.1, 0.1, 0.1);

	ring2 = new THREE.Mesh(
		new THREE.RingGeometry(0.3, 3, 32),
		new THREE.MeshBasicMaterial({ color: 0xbb5b85 })
	);
	ring2.position
		.copy(paintingPosition)
		.addScaledVector(paintingNormal, 0.15)
		.add({
			x: Math.random() * 1 - 0.5,
			y: Math.random() * 1 - 0.5,
			z: Math.random() * 1 - 0.5
		});
	ring2.lookAt(camera.position);
	ring2.rotateOnAxis(
		{ x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 },
		(Math.random() * Math.PI) / 4 - Math.PI / 8
	);
	ring2.scale.set(0.1, 0.1, 0.1);

	ring3 = new THREE.Mesh(
		new THREE.RingGeometry(0.2, 2, 32),
		new THREE.MeshBasicMaterial({ color: 0xddd359 })
	);
	ring3.position
		.copy(paintingPosition)
		.addScaledVector(paintingNormal, 0.1)
		.add({
			x: Math.random() * 1 - 0.5,
			y: Math.random() * 1 - 0.5,
			z: Math.random() * 1 - 0.5
		});
	ring3.lookAt(camera.position);
	ring3.rotateOnAxis(
		{ x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 },
		(Math.random() * Math.PI) / 4 - Math.PI / 8
	);
	ring3.scale.set(0.1, 0.1, 0.1);

	ring4 = new THREE.Mesh(
		new THREE.RingGeometry(0.1, 1, 32),
		new THREE.MeshBasicMaterial({ color: 0xe8e8ee })
	);
	ring4.position
		.copy(paintingPosition)
		.addScaledVector(paintingNormal, 0.05)
		.add({
			x: Math.random() * 1 - 0.5,
			y: Math.random() * 1 - 0.5,
			z: Math.random() * 1 - 0.5
		});
	ring4.lookAt(camera.position);
	ring4.rotateOnAxis(
		{ x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 },
		(Math.random() * Math.PI) / 4 - Math.PI / 8
	);
	ring4.scale.set(0.1, 0.1, 0.1);

	scene.add(ring1);
	scene.add(ring2);
	scene.add(ring3);
	scene.add(ring4);

	running = true;
}

function loop() {
	if (running) {
		update();
	}

	// controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function update() {
	var cameraDirection = camera.getWorldDirection(tmpVector3);

	if (ring1) {
		ring1.scale.multiplyScalar(1.18);
		ring1.position.addScaledVector(paintingNormal, 0.2);
		if (
			ring1.position
				.clone()
				.sub(camera.position)
				.dot(cameraDirection) < 0
		) {
			scene.remove(ring1);
			ring1 = null;
		}
	}
	if (ring2) {
		ring2.scale.multiplyScalar(1.16);
		ring2.position.addScaledVector(paintingNormal, 0.2);
		if (
			ring2.position
				.clone()
				.sub(camera.position)
				.dot(cameraDirection) < 0
		) {
			scene.remove(ring2);
			ring2 = null;
		}
	}
	if (ring3) {
		ring3.scale.multiplyScalar(1.14);
		ring3.position.addScaledVector(paintingNormal, 0.2);
		if (
			ring3.position
				.clone()
				.sub(camera.position)
				.dot(cameraDirection) < 0
		) {
			scene.remove(ring3);
			ring3 = null;
		}
	}
	if (ring4) {
		ring4.scale.multiplyScalar(1.12);
		ring4.position.addScaledVector(paintingNormal, 0.2);
		if (
			ring4.position
				.clone()
				.sub(camera.position)
				.dot(cameraDirection) < 0
		) {
			scene.remove(ring4);
			ring4 = null;
		}
	}

	var spawn = time < 30 ? 0 : Math.ceil(16 / (time - 30 + 1));
	while (spawn > 0 && particles.length < 200) {
		var typeNames = Object.keys(particleTypes);
		var type =
			particleTypes[typeNames[Math.floor(Math.random() * typeNames.length)]];
		var particle = createParticle(type);

		particle.velocity = new THREE.Vector3(
			Math.random() * 0.3 - 0.15,
			Math.random() * 0.3 - 0.15,
			Math.random() * 0.3 - 0.15
		).addScaledVector(paintingNormal, 1);

		particle.object.scale.set(0, 0, 0);

		particle.object.position.copy(paintingPosition).add({
			x: Math.random() * 10 - 5,
			y: Math.random() * 10 - 5,
			z: Math.random() * 10 - 5
		});
		particle.object.lookAt(camera.position);

		scene.add(particle.object);

		spawn--;
	}

	particles.forEach(updateParticle);

	time++;
}

function updateParticle(particle) {
	particle.update();

	particle.object.position.add(particle.velocity);

	particle.object.scale.set(
		particle.object.scale.x * 0.6 + 1 * 0.4,
		particle.object.scale.y * 0.6 + 1 * 0.4,
		particle.object.scale.z * 0.6 + 1 * 0.4
	);

	if (particle.id % 4 < 3) {
		particle.object
			.rotateX(((particle.id % 10) / 10) * 0.04 - 0.02)
			.rotateY((((particle.id * 3) % 10) / 10) * 0.04 - 0.02)
			.rotateZ((((particle.id * 7) % 10) / 10) * 0.04 - 0.02);
	}

	tmpMatrix4.lookAt(
		particle.object.position,
		camera.position,
		particle.object.getWorldDirection(tmpVector3)
	);
	tmpQuaternion.setFromRotationMatrix(tmpMatrix4);
	particle.object.quaternion.slerp(
		tmpQuaternion,
		0.0008
	);

	var orbitRadius = particle.object.position
		.clone()
		.sub(camera.position)
		.applyAxisAngle(
			{ x: 0, y: 1, z: 0 },
			(particle.id % 2) * Math.PI - Math.PI / 2
		)
		.normalize();
	var dir = camera.position
		.clone()
		.add({ x: 0, y: Math.sin((time + particle.id * 709) * 0.001) * 4 + 2, z: 0 })
		.sub(particle.object.position)
		.addScaledVector(
			orbitRadius,
			6 + 2 * ((particle.id % 12) / 12) + 70 / (time + 60)
		);
	particle.velocity.addScaledVector(
		dir,
		0.0001 + ((particle.id % 10) / 10) * 0.001
	);
	particle.velocity.multiplyScalar(0.97);
}

function createParticle(type) {
	var colors = pickRandomColors(randomPalette(), 2);
	var particle = type(colors);
	particle.id = particles.length;
	particles.push(particle);
	return particle;
}
