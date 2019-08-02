(function() {
	if (!WEBGL.isWebGLAvailable()) {
		alert(
			'This app requires WebGL, which is not supported by your web browser.'
		);
		location.reload();
		return;
	}

	var palettes = [
		{
			paletteWarm: [0x4d2b52, 0xbb5b85, 0xe0e4ad],
			paletteMixed: [0x4d2b52, 0xf8dd85, 0xaaabb9],
			paletteNeutral: [0xb8b9c9, 0xe8e8ee, 0xaaabb9]
		},
		{
			paletteCool: [0x2d475e, 0x49ad9c, 0x99c89e],
			paletteWarm: [0x4d2b52, 0xbb5b85],
			paletteMid: [0xffd02d, 0xf8dd85, 0xf3f5ca]
		},
		{
			paletteCool: [0x2d475e, 0x49ad9c, 0x99c89e, 0xddd359],
			paletteMixed: [0x49ad9c, 0xf8dd85, 0xaaabb9],
			paletteNeutral: [0xb8b9c9, 0xe8e8ee, 0xaaabb9]
		}
	];

	var paintingFeatureVec = [
		[
			0.6391872287819984,
			0.7296098844665485,
			-0.2210092938228081,
			-0.0057990776804819014,
			0.07796537770425577,
			0.06443419644979827
		],
		[
			-0.3593924173784146,
			-0.611915816235142,
			-0.498629075974555,
			0.35716016633879705,
			0.17718492626963767,
			0.2980055137889341
		],
		[
			0.029811998557934285,
			-0.026711550707909825,
			-0.08275810799682715,
			-0.5852691556893755,
			-0.22537870909798688,
			-0.7734424905870613
		]
	];

	var paintingMatchThreshold = [1, 1, 1];

	var maxParticleCount = 90;

	var videoFPS = 24;

	var target0;
	var target1;
	var target2;
	var mainScreen;
	var titleScreen;
	var video;
	var canvas;
	var canvasTest;
	var startButton;
	var hud;
	var viewfinder;
	var guide;

	var videoSettings;
	var videoWorkCanvas = document.createElement('canvas');

	var matchIndex = 1;
	var highestMatchProgressIndex = 1;
	var featureMatchProgress = [0, 0, 0];

	var scene;
	var camera;
	var controls;
	var renderer;

	var clock = new THREE.Clock();
	var delta = 0;

	var framesSinceStart = 0;
	var framesSinceLaunch = 0;
	var launched = false;
	var paintingPosition;
	var paintingNormal;
	var cameraPole;

	var ring1;
	var ring2;
	var ring3;
	var ring4;

	var particles = [];

	var tmpVector3 = new THREE.Vector3();
	var tmpMatrix4 = new THREE.Matrix4();
	var tmpQuaternion = new THREE.Quaternion();

	document.addEventListener('DOMContentLoaded', onDocumentLoad);
	window.addEventListener('resize', onWindowResize, false);

	function onWindowResize() {
		if (camera) {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		if (renderer) {
			renderer.setSize(window.innerWidth, window.innerHeight);
		}
	}

	function randomPalette() {
		return Object.values(palettes[matchIndex])[
			Math.floor(Math.random() * Object.keys(palettes[matchIndex]).length)
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

	var geometries = {
		paperBody: (function() {
			var bodyShape = new THREE.Shape();
			bodyShape.moveTo(-0.5, -0.5);
			bodyShape.lineTo(0, -0.5);
			bodyShape.arc(0, 0.5, 0.5, -Math.PI / 2, 0);
			bodyShape.lineTo(0.5, 0.5);
			bodyShape.lineTo(-0.5, 0.5);

			return new THREE.ExtrudeBufferGeometry(bodyShape, {
				depth: 0.04,
				curveSegments: 4,
				bevelEnabled: false
			});
		})(),

		paperFlap: (function() {
			var flapShape = new THREE.Shape();
			flapShape.moveTo(0, -0.51);
			flapShape.arc(0, 0.51, 0.51, -Math.PI / 2, 0);
			flapShape.arc(0, -0.51, 0.51, Math.PI / 2, Math.PI);

			return new THREE.ExtrudeBufferGeometry(flapShape, {
				depth: 0.06,
				curveSegments: 4,
				bevelEnabled: false
			});
		})(),

		pencilBody: (function() {
			var bodyShape = new THREE.Shape();
			bodyShape.moveTo(-0.5, -0.5);
			bodyShape.arc(0, 0, 1, 0, Math.PI / 2);
			bodyShape.lineTo(-0.5, -0.5);

			return new THREE.ExtrudeBufferGeometry(bodyShape, {
				depth: 0.04,
				curveSegments: 4,
				bevelEnabled: false
			});
		})(),

		pencilTip: (function() {
			var tipShape = new THREE.Shape();
			tipShape.moveTo(-0.51, -0.51);
			tipShape.arc(0, 0, 0.51, 0, Math.PI / 2);
			tipShape.lineTo(-0.51, -0.51);

			return new THREE.ExtrudeBufferGeometry(tipShape, {
				depth: 0.06,
				curveSegments: 4,
				bevelEnabled: false
			});
		})(),

		pen: (function() {
			var shape = new THREE.Shape();
			shape.moveTo(0, -0.5);
			shape.arc(0.5, 0, 0.5, Math.PI, Math.PI / 2, true);
			shape.lineTo(0.5, 0.5);
			shape.lineTo(-0.5, 0.5);
			shape.lineTo(-0.5, 0);
			shape.arc(0, -0.5, 0.5, Math.PI / 2, 0, true);

			return new THREE.ExtrudeBufferGeometry(shape, {
				depth: 0.05,
				curveSegments: 4,
				bevelEnabled: false
			});
		})(),

		brush: (function() {
			var shape = new THREE.Shape();
			shape.moveTo(0, -0.5);
			shape.arc(0, 0.5, 0.5, -Math.PI / 2, 0, false);
			shape.arc(0, 0.5, 0.5, -Math.PI / 2, -Math.PI, true);
			shape.lineTo(-0.5, 0.5);
			shape.lineTo(-0.5, 0);
			shape.arc(0.5, 0, 0.5, -Math.PI, -Math.PI / 2);

			return new THREE.ExtrudeBufferGeometry(shape, {
				depth: 0.05,
				curveSegments: 4,
				bevelEnabled: false
			});
		})(),

		tabletBody: new THREE.BoxBufferGeometry(1, 1, 0.04),
		tabletScreen: new THREE.CylinderBufferGeometry(0.49, 0.49, 0.06, 16, 1)
	};

	// should've been using OOP but here we are
	var particleTypes = {
		paper: function(colors) {
			var bodyMesh = new THREE.Mesh(
				geometries.paperBody,
				new THREE.MeshLambertMaterial({ color: colors[0] })
			);

			var flapMesh = new THREE.Mesh(
				geometries.paperFlap,
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
			var bodyMesh = new THREE.Mesh(
				geometries.paperBody,
				new THREE.MeshLambertMaterial({ color: colors[0] })
			);

			var tipMesh = new THREE.Mesh(
				geometries.pencilTip,
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
			var mesh = new THREE.Mesh(
				geometries.pen,
				new THREE.MeshLambertMaterial({ color: colors[0] })
			);

			return {
				object: mesh,
				update: function() {}
			};
		},

		brush: function(colors) {
			var mesh = new THREE.Mesh(
				geometries.brush,
				new THREE.MeshLambertMaterial({ color: colors[0] })
			);

			return {
				object: mesh,
				update: function() {}
			};
		},

		tablet: function(colors) {
			var bodyMesh = new THREE.Mesh(
				geometries.tabletBody,
				new THREE.MeshLambertMaterial({ color: colors[0] })
			);

			var screenMesh = new THREE.Mesh(
				geometries.tabletScreen,
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
		target0 = document.getElementById('target0');
		target1 = document.getElementById('target1');
		target2 = document.getElementById('target2');
		mainScreen = document.getElementById('mainScreen');
		titleScreen = document.getElementById('titleScreen');
		video = document.getElementById('video');
		canvas = document.getElementById('canvas');
		canvasTest = document.getElementById('canvasTest');
		startButton = document.getElementById('startButton');
		hud = document.getElementById('hud');
		viewfinder = document.getElementById('viewfinder');
		guide = document.getElementById('guide');

		canvasTest.width = window.innerWidth;
		canvasTest.height = window.innerHeight;

		startButton.addEventListener('click', start);
		hud.addEventListener('click', function() {
			if (framesSinceStart > 480) {
				matchIndex = highestMatchProgressIndex;
				launch();
			}
		});
	}

	function start() {
		if (scene) {
			return;
		}

		hud.classList.remove('hide');

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
						loop();
						titleScreen.classList.add('hide');
						video.srcObject = stream;
						videoSettings = stream.getVideoTracks()[0].getSettings();
						videoFPS = videoSettings.frameRate;
					})
					.catch(function(error) {
						console.error(error);
						alert(
							'Camera is required for this app. Please allow camera access.'
						);
						location.reload();
					});
			} catch (error) {
				console.error(error);
				alert(
					'Something went wrong while getting the camera stream. Your experience may be limited.'
				);
			}
		} else {
			alert(
				'Your browser does not support camera access. Your experience may be limited.'
			);
		}

		if (DeviceOrientationEvent.requestPermission) {
			DeviceOrientationEvent.requestPermission();
		}

		scene = new THREE.Scene();

		light = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
		light.position.set(0, 1, 0);
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
	}

	function launch() {
		if (launched) {
			return;
		}

		launched = true;

		hud.classList.add('hide');

		var cameraDirection = camera.getWorldDirection(tmpVector3);
		paintingPosition = scene.position
			.clone()
			.addScaledVector(cameraDirection, 100);
		paintingNormal = cameraDirection.clone().multiplyScalar(-1);

		ring1 = new THREE.Mesh(
			new THREE.RingGeometry(0.8, 4, 32),
			new THREE.MeshBasicMaterial({ color: 0x2d475e })
		);
		ring1.position
			.copy(paintingPosition)
			.addScaledVector(paintingNormal, 0.4)
			.add({
				x: Math.random() * 1 - 0.5,
				y: Math.random() * 1 - 0.5,
				z: Math.random() * 1 - 0.5
			});
		ring1.lookAt(scene.position);
		ring1.scale.set(0.1, 0.1, 0.1);

		ring2 = new THREE.Mesh(
			new THREE.RingGeometry(0.4, 3, 32),
			new THREE.MeshBasicMaterial({ color: 0xbb5b85 })
		);
		ring2.position
			.copy(paintingPosition)
			.addScaledVector(paintingNormal, 0.3)
			.add({
				x: Math.random() * 1 - 0.5,
				y: Math.random() * 1 - 0.5,
				z: Math.random() * 1 - 0.5
			});
		ring2.lookAt(scene.position);
		ring2.scale.set(0.1, 0.1, 0.1);

		ring3 = new THREE.Mesh(
			new THREE.RingGeometry(0.2, 2, 32),
			new THREE.MeshBasicMaterial({ color: 0xddd359 })
		);
		ring3.position
			.copy(paintingPosition)
			.addScaledVector(paintingNormal, 0.2)
			.add({
				x: Math.random() * 1 - 0.5,
				y: Math.random() * 1 - 0.5,
				z: Math.random() * 1 - 0.5
			});
		ring3.lookAt(scene.position);
		ring3.scale.set(0.1, 0.1, 0.1);

		ring4 = new THREE.Mesh(
			new THREE.RingGeometry(0.1, 1, 32),
			new THREE.MeshBasicMaterial({ color: 0xe8e8ee })
		);
		ring4.position
			.copy(paintingPosition)
			.addScaledVector(paintingNormal, 0.1)
			.add({
				x: Math.random() * 1 - 0.5,
				y: Math.random() * 1 - 0.5,
				z: Math.random() * 1 - 0.5
			});
		ring4.lookAt(scene.position);
		ring4.scale.set(0.1, 0.1, 0.1);

		scene.add(ring1);
		scene.add(ring2);
		scene.add(ring3);
		scene.add(ring4);
	}

	function loop() {
		framesSinceStart++;

		if (launched) {
			update();

			delta += clock.getDelta();
			var interval = 1 / videoFPS;
			if (delta > interval) {
				updateLighting();
				renderer.render(scene, camera);

				delta = delta % interval;
			}
		} else {
			matchImage();
			viewfinder.style.opacity = Math.sqrt(
				1 -
					Math.max(
						featureMatchProgress[0],
						featureMatchProgress[1],
						featureMatchProgress[2]
					)
			);
		}

		controls.update();

		requestAnimationFrame(loop);
	}

	function matchImage() {
		if (!video.currentTime) {
			return;
		}

		videoWorkCanvas.width = 64;
		videoWorkCanvas.height =
			(videoWorkCanvas.width * video.videoHeight) / video.videoWidth;
		var videoWorkContext = videoWorkCanvas.getContext('2d');
		videoWorkContext.drawImage(
			video,
			0,
			0,
			videoWorkCanvas.width,
			videoWorkCanvas.height
		);

		var videoAspect = videoWorkCanvas.width / videoWorkCanvas.height;
		var windowAspect = window.innerWidth / window.innerHeight;
		var videoClipRect =
			windowAspect < videoAspect
				? {
						x: Math.floor(
							(videoWorkCanvas.width - videoWorkCanvas.height * windowAspect) /
								2
						),
						y: 0,
						width: Math.floor(videoWorkCanvas.height * windowAspect),
						height: videoWorkCanvas.height
				  }
				: {
						x: 0,
						y: Math.floor(
							(videoWorkCanvas.height - videoWorkCanvas.width / windowAspect) /
								2
						),
						width: videoWorkCanvas.width,
						height: Math.floor(videoWorkCanvas.width / windowAspect)
				  };

		var viewfinderScreenRect = viewfinder.getBoundingClientRect();
		var viewfinderVideoRect = {
			x: Math.floor(
				videoClipRect.x +
					(viewfinderScreenRect.x * videoClipRect.width) / window.innerWidth
			),
			y: Math.floor(
				videoClipRect.y +
					(viewfinderScreenRect.y * videoClipRect.height) / window.innerHeight
			),
			width: Math.ceil(
				(viewfinderScreenRect.width * videoClipRect.width) / window.innerWidth
			),
			height: Math.ceil(
				(viewfinderScreenRect.height * videoClipRect.height) /
					window.innerHeight
			)
		};

		if (location.href.includes('target')) {
			var target;
			if (location.href.includes('target0')) {
				target = target0;
			} else if (location.href.includes('target1')) {
				target = target1;
			} else if (location.href.includes('target2')) {
				target = target2;
			}

			if (target) {
				videoWorkContext.drawImage(
					target,
					viewfinderVideoRect.x,
					viewfinderVideoRect.y,
					viewfinderVideoRect.width,
					viewfinderVideoRect.height
				);
			}
		}

		var data = videoWorkContext.getImageData(
			viewfinderVideoRect.x,
			viewfinderVideoRect.y,
			viewfinderVideoRect.width,
			viewfinderVideoRect.height
		).data;

		var lineStride = 4 * viewfinderVideoRect.width;
		// topLeft
		var topColor = computeImageAverageColor(
			data,
			lineStride,
			Math.floor(viewfinderVideoRect.width / 12),
			Math.floor(viewfinderVideoRect.height / 12),
			Math.ceil(viewfinderVideoRect.width / 6),
			Math.ceil(viewfinderVideoRect.height / 6)
		);
		// Middle
		var midColor = computeImageAverageColor(
			data,
			lineStride,
			Math.floor(viewfinderVideoRect.width / 3),
			Math.floor((viewfinderVideoRect.height * 5) / 12),
			Math.ceil(viewfinderVideoRect.width / 3),
			Math.ceil(viewfinderVideoRect.height / 6)
		);
		// Bottom
		var bottomColor = computeImageAverageColor(
			data,
			lineStride,
			Math.floor(viewfinderVideoRect.width / 3),
			Math.floor((viewfinderVideoRect.height * 9) / 12),
			Math.ceil(viewfinderVideoRect.width / 3),
			Math.ceil(viewfinderVideoRect.height / 6)
		);
		var deltaTop = {
			r: topColor.r - midColor.r,
			g: topColor.g - midColor.g,
			b: topColor.b - midColor.b
		};
		var deltaBottom = {
			r: midColor.r - bottomColor.r,
			g: midColor.g - bottomColor.g,
			b: midColor.b - bottomColor.b
		};

		var length =
			Math.sqrt(
				deltaTop.r * deltaTop.r +
					deltaTop.g * deltaTop.g +
					deltaTop.b * deltaTop.b +
					deltaBottom.r * deltaBottom.r +
					deltaBottom.g * deltaBottom.g +
					deltaBottom.b * deltaBottom.b
			) || 1;

		var normalizedFeatureVec = [
			deltaTop.r / length,
			deltaTop.g / length,
			deltaTop.b / length,
			deltaBottom.r / length,
			deltaBottom.g / length,
			deltaBottom.b / length
		];

		if (location.href.includes('training')) {
			console.log(JSON.stringify(normalizedFeatureVec));
			var testCtx = canvasTest.getContext('2d');
			testCtx.clearRect(0, 0, testCtx.canvas.width, testCtx.canvas.height);
			testCtx.fillStyle = 'red';
			testCtx.font = 'bold 16px sans-serif';
			normalizedFeatureVec.forEach(function(val, index) {
				testCtx.fillText(val, 5, 5 + 20 * (1 + index));
			});
			return;
		}

		paintingFeatureVec.forEach(function(vec, index) {
			var errorSum = normalizedFeatureVec.reduce(function(cur, val, index) {
				var delta = vec[index] - val;
				return cur + delta * delta;
			}, 0);
			var vectorDistance = Math.sqrt(errorSum);
			featureMatchProgress[index] += 0.04 / (0.02 + vectorDistance);
			featureMatchProgress[index] *= 0.9;
			if (featureMatchProgress[index] >= paintingMatchThreshold[index]) {
				matchIndex = index;
				console.log('launch', matchIndex);
				setTimeout(launch, 500);
			}
		});

		featureMatchProgress.forEach(function(value, index) {
			if (featureMatchProgress[highestMatchProgressIndex] < value) {
				highestMatchProgressIndex = index;
			}
		});

		guide.src = ['target0.jpg', 'target1.jpg', 'target2.jpg'][
			highestMatchProgressIndex
		];
		console.log(featureMatchProgress);
	}

	function computeImageAverageColor(imageData, lineStride, x, y, w, h) {
		var r = 0;
		var g = 0;
		var b = 0;
		for (var j = y; j < y + h; j++) {
			for (var i = x; i < x + w; i++) {
				r += imageData[j * lineStride + i * 4] / 0xff;
				g += imageData[j * lineStride + i * 4 + 1] / 0xff;
				b += imageData[j * lineStride + i * 4 + 2] / 0xff;
			}
		}
		var count = w * h;
		return {
			r: r / count,
			g: g / count,
			b: b / count
		};
	}

	function updateLighting() {
		if (!video.currentTime) {
			return;
		}

		videoWorkCanvas.width = 256;
		videoWorkCanvas.height = 256;
		var context = videoWorkCanvas.getContext('2d');
		context.drawImage(
			video,
			0,
			0,
			videoWorkCanvas.width,
			videoWorkCanvas.height
		);
		var data = context.getImageData(0, 0, 256, 256).data;
		var pixelCount = data.length / 4;

		var samples = 2000;
		var skip = 4 * Math.floor(pixelCount / samples);

		var r = 0;
		var g = 0;
		var b = 0;

		var count = 0;
		var i = 0;
		while (count < samples) {
			r = Math.max(r, data[i]);
			g = Math.max(g, data[i + 1]);
			b = Math.max(b, data[i + 2]);
			i += skip;
			count++;
		}

		light.color.setRGB(r / 0xff, g / 0xff, b / 0xff);
		light.groundColor.copy(light.color).multiplyScalar(0.6);
	}

	function update() {
		var cameraDirection = camera.getWorldDirection(tmpVector3).clone();

		if (ring1) {
			ring1.scale.multiplyScalar(1.18);
			ring1.position.addScaledVector(paintingNormal, 0.2);
			if (
				ring1.position
					.clone()
					.sub(scene.position)
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
					.sub(scene.position)
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
					.sub(scene.position)
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
					.sub(scene.position)
					.dot(cameraDirection) < 0
			) {
				scene.remove(ring4);
				ring4 = null;
			}
		}

		var spawn =
			framesSinceLaunch >= 24 && Math.random() < 0.1 + 9 / framesSinceLaunch
				? 1
				: 0;
		while (spawn > 0 && particles.length < maxParticleCount) {
			var typeNames = Object.keys(particleTypes);
			var type =
				particleTypes[typeNames[Math.floor(Math.random() * typeNames.length)]];
			var particle = createParticle(type);

			particle.velocity = new THREE.Vector3(
				Math.random() * 1.5 - 0.75,
				Math.random() * 1.5 - 0.75,
				Math.random() * 1.5 - 0.75
			).addScaledVector(paintingNormal, 2);

			particle.object.scale.set(0, 0, 0);

			particle.object.position.copy(paintingPosition).add({
				x: Math.random() * 10 - 5,
				y: Math.random() * 10 - 5,
				z: Math.random() * 10 - 5
			});
			particle.object.lookAt(scene.position);

			scene.add(particle.object);

			spawn--;
		}

		particles.forEach(updateParticle);

		framesSinceLaunch++;
	}

	function updateParticle(particle) {
		particle.update();

		particle.object.position.add(particle.velocity);

		particle.object.scale.set(
			particle.object.scale.x * 0.6 + 3 * 0.4,
			particle.object.scale.y * 0.6 + 3 * 0.4,
			particle.object.scale.z * 0.6 + 3 * 0.4
		);

		if (particle.id % 4 < 3) {
			particle.object
				.rotateX(((particle.id % 10) / 10) * 0.04 - 0.02)
				.rotateY((((particle.id * 3) % 10) / 10) * 0.04 - 0.02)
				.rotateZ((((particle.id * 7) % 10) / 10) * 0.04 - 0.02);
		}

		tmpMatrix4.lookAt(
			particle.object.position,
			scene.position,
			particle.object.getWorldDirection(tmpVector3)
		);
		tmpQuaternion.setFromRotationMatrix(tmpMatrix4);
		particle.object.quaternion.slerp(tmpQuaternion, 0.0008);

		var altitude = computeAltitude(particle);
		var orbitRadius = particle.object.position
			.clone()
			.setY(scene.position.y)
			.sub(scene.position)
			.applyAxisAngle(
				{ x: 0, y: 1, z: 0 },
				((particle.id % 3 === 0) * Math.PI) / 2 - Math.PI / 4
			)
			.normalize();
		var dir = scene.position
			.clone()
			.setY(
				particle.object.position.y * 0.2 +
					(scene.position.y + altitude * 32 + 2) * 0.8
			)
			.sub(particle.object.position)
			.addScaledVector(
				orbitRadius,
				30 +
					30 * ((particle.id % 12) / 12) +
					1200 / (framesSinceLaunch + 60) +
					200 / (Math.abs(altitude) * 200 + 1)
			)
			.normalize();
		particle.velocity.addScaledVector(
			dir,
			(0.08 + ((particle.id % 10) / 10) * 0.04) / (9 - Math.abs(altitude) * 8)
		);
		particle.velocity.multiplyScalar(0.966);

		setTrailColor(particle.trail, particle.colors[0]);
		if (particle.object.position.distanceTo(particle.lastTrailAdvance) > 5) {
			particle.trail.advance();
			particle.lastTrailAdvance.copy(particle.object.position);
		} else {
			particle.trail.updateHead();
		}
	}

	function computeAltitude(particle) {
		// smooth triangle wave
		return (
			1 -
			(2 *
				Math.acos(0.99 * Math.sin(particle.id + framesSinceLaunch * 0.008))) /
				Math.PI
		);
	}

	function createParticle(type) {
		var colors = pickRandomColors(randomPalette(), 2);

		var particle = type(colors);

		particle.colors = colors;

		var trailHeadGeometry = [];
		trailHeadGeometry.push(
			new THREE.Vector3(0.5, -0.5, 0.0),
			new THREE.Vector3(-0.5, 0.5, 0.0)
		);

		particle.lastTrailAdvance = new THREE.Vector3(Infinity, Infinity, Infinity);
		particle.trail = new THREE.TrailRenderer(scene, false);

		var trailMaterial = THREE.TrailRenderer.createBaseMaterial();
		trailMaterial.uniforms.headColor.value.set(1, 1, 1, 1);
		trailMaterial.uniforms.tailColor.value.set(1, 1, 1, 1);

		var trailLength = 30;

		particle.trail.initialize(
			trailMaterial,
			trailLength,
			false,
			0,
			trailHeadGeometry,
			particle.object
		);
		particle.trail.activate();

		particle.id = particles.length;
		particles.push(particle);
		return particle;
	}

	function setTrailColor(trail, color) {
		var colorR = ((color >> 16) & 0xff) / 0xff;
		var colorG = ((color >> 8) & 0xff) / 0xff;
		var colorB = (color & 0xff) / 0xff;
		colorR *= light.color.r;
		colorG *= light.color.g;
		colorB *= light.color.b;
		trail.material.uniforms.headColor.value.set(colorR, colorG, colorB, 1);
		trail.material.uniforms.tailColor.value.set(colorR, colorG, colorB, 1);
	}
})();
