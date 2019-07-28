import chroma from 'chroma-js';

import Color from './color';

export default class Palette {
	static generatePalette(
		colorValue1,
		colorValue2,
		colorValue3,
		colorValue4,
		colorValue5
	) {
		const colorValues = [
			colorValue1,
			colorValue2,
			colorValue3,
			colorValue4,
			colorValue5
		];
		const colors = colorValues.map(value => {
			const tones = [
				Math.floor(
					chroma(value)
						.darken(0.2)
						.saturate(0.2)
						.num()
				),
				Math.floor(
					chroma(value)
						.darken(0.1)
						.saturate(0.1)
						.num()
				),
				value,
				Math.floor(
					chroma(value)
						.brighten(0.2)
						.num()
				),
				Math.floor(
					chroma(value)
						.brighten(0.3)
						.num()
				)
			];
			return new Color(2, tones);
		});
		return new Palette(...colors);
	}

	constructor(color1, color2, color3, color4, color5) {
		this.color1 = color1;
		this.color2 = color2;
		this.color3 = color3;
		this.color4 = color4;
		this.color5 = color5;
	}

	get colors() {
		return [this.color1, this.color2, this.color3, this.color4, this.color5];
	}

	getRandomWeightedColor(random = Math.random) {
		const index =
			(random() * random() * this.colors.length +
				random() * this.colors.length +
				random() * this.colors.length) /
			3;
		return this.colors[Math.floor(index)];
	}
}
