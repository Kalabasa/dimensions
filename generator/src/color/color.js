export default class Color {
	constructor(mainToneIndex, tones) {
		this.mainToneIndex = mainToneIndex;
		this.tones = [...tones];
	}

	get mainTone() {
		return this.tones[this.mainToneIndex];
	}

	getRandomWeightedTone(random = Math.random) {
		const index =
			(random() * this.tones.length + random() * this.tones.length) / 2;
		return this.tones[Math.floor(index)];
	}
}
