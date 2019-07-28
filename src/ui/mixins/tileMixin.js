import seedrandom from 'seedrandom';

import Palette from 'color/palette';

const tileMixin = {
	created() {
		this._tileMixin_seed = Math.random().toString(36);
	},
	props: {
		orientation: Number,
		palette: Palette
	},
	methods: {
		tileProps(paletteMapping) {
			const random = seedrandom(this._tileMixin_seed);

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
