import seedrandom from 'seedrandom';

import Palette from 'color/palette';
import { string } from 'postcss-selector-parser';

const tileMixin = {
	props: {
		seed: {
			type: String,
			default: Math.random().toString(36),
		},
		orientation: Number,
		palette: Palette
	},
	methods: {
		tileProps(paletteMapping) {
			const random = seedrandom(this.seed);

			const style = Object.keys(paletteMapping).reduce((obj, key) => {
				return {
					...obj,
					[`--${key}`]:
						'#' +
						this.palette
							.getRandomWeightedColor(random)
							.getRandomWeightedTone(random)
							.toString(16)
							.padStart(6, '0')
				};
			}, {});

			return {
				style,
				orientation: this.orientation
			};
		}
	}
};

export default tileMixin;
