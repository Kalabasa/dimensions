<template>
	<div class="app">
		<div class="boardContainer">
			<Board class="board" :seed="boardMidSeed" :paletteProvider="() => paletteMid" :tiles="tiles" />
			<Board
				class="board"
				:style="{ clipPath: `circle(${circleCool.radius * 100}% at ${circleCool.x * 100}% ${circleCool.y * 100}%)` }"
				:seed="boardCoolSeed"
				:paletteProvider="() => paletteCool"
				:tiles="tiles"
			/>
			<Board
				class="board"
				:style="{ clipPath: `circle(${circleWarm.radius * 100}% at ${circleWarm.x * 100}% ${circleWarm.y * 100}%)` }"
				:seed="boardWarmSeed"
				:paletteProvider="() => paletteWarm"
				:tiles="tiles"
			/>
			<div
				class="board boardMask"
				:style="{ clipPath: `circle(${circleCool.radius * 100}% at ${circleCool.x * 100}% ${circleCool.y * 100}%)` }"
			>
				<Board
					class="board"
					:style="{ clipPath: `circle(${circleWarm.radius * 100}% at ${circleWarm.x * 100}% ${circleWarm.y * 100}%)` }"
					:seed="boardNeutralSeed"
					:paletteProvider="neutralPaletteProvider()"
					:tiles="tiles"
				/>
			</div>
			<QR v-if="!noQr" :palette="paletteNeutral" />
			<div class="texture texture1"></div>
			<div class="texture texture2"></div>
			<div class="texture texture3"></div>
		</div>
	</div>
</template>

<style scoped>
.app {
	background: #888;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100vw;
	height: 100vh;
}
.boardContainer {
	position: relative;
	width: 9in;
	height: 12in;
	box-shadow: 0 8px 4px #0004;
	transform: scale(1.2);
	cursor: pointer;
}
.board {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
}
.texture {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
}
.texture1 {
	background: url("/static/texture.png") 0 0 / 3.5in;
	mix-blend-mode: multiply;
	opacity: 0.8;
}
.texture2 {
	background: url("/static/texture.png") 0 0 / 2in;
	mix-blend-mode: color-burn;
	opacity: 1;
}
.texture3 {
	background: radial-gradient(white, black);
	mix-blend-mode: soft-light;
	opacity: 0.2;
}
</style>

<script>
import seedrandom from "seedrandom";

import Palette from "color/palette";
import BrushTile from "ui/tiles/BrushTile.vue";
import PaperTile from "ui/tiles/PaperTile.vue";
import PencilTile from "ui/tiles/PencilTile.vue";
import PenTile from "ui/tiles/PenTile.vue";
import TabletTile from "ui/tiles/TabletTile.vue";

const tileComponentPool = [
	BrushTile,
	PaperTile,
	PencilTile,
	PenTile,
	TabletTile
];

const urlParams = new URLSearchParams(window.location.search);
const noQrParam = urlParams.get("noqr");
const seedParam = urlParams.get("seed");

const noQr = noQrParam !== null;

const seed = seedParam || Math.random().toString(36);
const random = seedrandom(seed);
console.log(seed);

export default {
	data: () => ({
		tiles: Array.from(Array(6 * 8), () => ({
			component:
				tileComponentPool[Math.floor(random() * tileComponentPool.length)],
			orientation: Math.floor(random() * 8)
		})),
		paletteCool: Palette.generatePalette(
			0x2d475e,
			0x49ad9c,
			0x99c89e,
			0xddd359,
			0xf6e185
		),
		paletteWarm: Palette.generatePalette(
			0x132141,
			0x4d2b52,
			0xbb5b85,
			0xe0e4ad,
			0xf0e0d0
		),
		paletteMid: Palette.generatePalette(
			0x4b5a67,
			0xffd02d,
			0xf8dd85,
			0xf3f5ca,
			0xfafaf9
		),
		paletteNeutral: Palette.generatePalette(
			0x2b2d38,
			0xb8b9c9,
			0xe8e8ee,
			0xaaabb9,
			0xcbced4
		),
		paletteNeutralLight: Palette.generatePalette(
			0xb8b9c9,
			0xe8e8ee,
			0xe8e8ee,
			0xcbced4,
			0xcbced4
		),
		circleCool: noQr
			? (() => {
					const angle = random() * 2 * Math.PI;
					const length = 0.3 + random() * 0.6;
					return {
						radius: 0.3 + random() * 0.6,
						x: 0.5 + Math.cos(angle) * length,
						y: 0.5 + Math.sin(angle) * length
					};
			  })()
			: {
					radius: 0.8,
					x: 1.2,
					y: 0.6
			  },
		circleWarm: noQr
			? (() => {
					const angle = random() * 2 * Math.PI;
					const length = 0.3 + random() * 0.6;
					return {
						radius: 0.3 + random() * 0.6,
						x: 0.5 + Math.cos(angle) * length,
						y: 0.5 + Math.sin(angle) * length
					};
			  })()
			: {
					radius: 1,
					x: 0.4,
					y: -0.15
			  },
		boardMidSeed: random().toString(36),
		boardCoolSeed: random().toString(36),
		boardWarmSeed: random().toString(36),
		boardNeutralSeed: random().toString(36)
	}),
	computed: {
		noQr() {
			return noQr;
		}
	},
	methods: {
		neutralPaletteProvider() {
			return index => {
				const x = index % 6;
				const y = Math.floor(index / 6);

				if (!noQr && Math.abs(x - 2.5) < 0.5001 && Math.abs(y - 3.5) < 0.5001) {
					return this.paletteNeutralLight;
				} else {
					return this.paletteNeutral;
				}
			};
		}
	}
};
</script>
