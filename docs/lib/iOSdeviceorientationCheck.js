/* iOSdeviceorientationCheck.js (https://dz.plala.jp/wiki/index.php/IOS_12.2_deviceorientation)
 * author: shogooda <shogo.gfx@gmail.com>
 * License: MIT */

var iOSdeviceorientationCheckStatus = {
	target: false,
	sensor: false
};

(function() {
	var parser = new UAParser();
	var os = parser.getOS();
	var ver = os.version.split('.');
	var version0 = parseFloat(ver[0]);
	var version1;
	if (ver[1]) {
		version1 = parseFloat(ver[1]);
	} else {
		version1 = 0;
	}

	var alpha = 0;
	var beta = 0;
	var gamma = 0;

	function deviceorientationHandle(event) {
		alpha = event.alpha;
		beta = event.beta;
		gamma = event.gamma;
	}

	if (os.name == 'iOS') {
		if ((version0 = (12 && version1 >= 2) || version0 >= 13)) {
			window.addEventListener(
				'deviceorientation',
				deviceorientationHandle,
				true
			);
			setTimeout(function() {
				window.removeEventListener(
					'deviceorientation',
					deviceorientationHandle,
					true
				);
				iOSdeviceorientationCheckStatus.target = true;
				if (alpha + beta + gamma !== 0) {
					iOSdeviceorientationCheckStatus.sensor = true;
				} else {
					alert(
						'Enable device orientation in Settings > Safari > Motion & Orientation Access.'
					);
				}
			}, 600);
		}
	}
})();
