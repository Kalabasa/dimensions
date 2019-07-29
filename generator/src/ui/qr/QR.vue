<style scoped>
.circle {
	position: relative;
	width: 1.5in;
	height: 1.5in;
	border-radius: 100%;
	mix-blend-mode: lighten;
}
.quarterTopLeft {
	position: absolute;
	width: 50%;
	height: 50%;
	border-top-left-radius: 100%;
	background: var(--quarterTopLeftColor);
}
.quarterTopRight {
	position: absolute;
	right: 0;
	width: 50%;
	height: 50%;
	border-top-right-radius: 100%;
	background: var(--quarterTopRightColor);
}
.quarterBottomLeft {
	position: absolute;
	bottom: 0;
	width: 50%;
	height: 50%;
	border-bottom-left-radius: 100%;
	background: var(--quarterBottomLeftColor);
}
.quarterBottomRight {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 50%;
	height: 50%;
	border-bottom-right-radius: 100%;
	background: var(--quarterBottomRightColor);
}
</style>

<script>
import chroma from "chroma-js";

import Palette from "color/palette";
import QRCircle from "./QRCircle.vue";
import QRImage from "./QRImage.vue";

export default {
	functional: true,
	props: {
		palette: Palette
	},
	render(createElement, context) {
		const darkestColor = context.props.palette.colors.reduce(
			(prev, current) =>
				prev &&
				chroma(prev.tones[0]).luminance() < chroma(current.tones[0]).luminance()
					? prev
					: current,
			null
		);
		const brightestColor = context.props.palette.colors.reduce(
			(prev, current) =>
				prev &&
				chroma(prev.tones[2]).luminance() > chroma(current.tones[2]).luminance()
					? prev
					: current,
			null
		);

		const circleStyle = {
			"--quarterTopLeftColor": chroma(brightestColor.tones[2]).hex(),
			"--quarterTopRightColor": chroma(brightestColor.tones[0]).hex(),
			"--quarterBottomLeftColor": chroma(brightestColor.tones[2]).hex(),
			"--quarterBottomRightColor": chroma(brightestColor.tones[1]).hex()
		};
		const imageStyle = {
			"--qrColor": chroma(darkestColor.tones[1]).hex()
		};
		return [
			// createElement(QRCircle, { style: circleStyle }),
			createElement(QRImage, { style: imageStyle })
		];
	}
};
</script>