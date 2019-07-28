<template>
	<div class="app">
		<div class="boardContainer">
			<Board class="board boardGray" :palette="paletteYellow" :tiles="tiles" />
			<Board
				class="board boardCyan"
				:style="{ clipPath: `circle(${circleCyan.radius * 100}% at ${circleCyan.x * 100}% ${circleCyan.y * 100}%)` }"
				:palette="paletteCyan"
				:tiles="tiles"
			/>
			<Board
				class="board boardRed"
				:style="{ clipPath: `circle(${circleRed.radius * 100}% at ${circleRed.x * 100}% ${circleRed.y * 100}%)` }"
				:palette="paletteRed"
				:tiles="tiles"
			/>
			<div
				class="board boardMask"
				:style="{ clipPath: `circle(${circleCyan.radius * 100}% at ${circleCyan.x * 100}% ${circleCyan.y * 100}%)` }"
			>
				<Board
					class="board boardFull"
					:style="{ clipPath: `circle(${circleRed.radius * 100}% at ${circleRed.x * 100}% ${circleRed.y * 100}%)` }"
					:palette="paletteGray"
					:tiles="tiles"
				/>
			</div>
			<div class="texture texture1"></div>
			<div class="texture texture2"></div>
		</div>
	</div>
</template>

<style>
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
	box-shadow: 0 8px 16px #0004;
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
	background: url("/static/texture.png") 0 0 / 7in;
	mix-blend-mode: multiply;
	opacity: 0.8;
}
.texture2 {
	background: url("/static/texture.png") 0 0 / 4in;
	mix-blend-mode: color-burn;
	opacity: 1;
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

const random = seedrandom(Math.random().toString(36));

export default {
	data: () => ({
		tiles: Array.from(Array(6 * 8), () => ({
			component:
				tileComponentPool[Math.floor(random() * tileComponentPool.length)],
			orientation: Math.floor(random() * 8)
		})),
		paletteFull: Palette.generatePalette(
			0x316570,
			0x48bbba,
			0xd37d85,
			0xe1db97,
			0xe3e5e5
		),
		paletteCyan: Palette.generatePalette(
			0x273842,
			0x28a3a3,
			0x48bbba,
			0xcbcbcb,
			0xd9ddda
		),
		paletteRed: Palette.generatePalette(
			0x692c37,
			0xae3e48,
			0xc07279,
			0xcacaca,
			0xe6e4dd
		),
		paletteYellow: Palette.generatePalette(
			0x656747,
			0xa8af72,
			0xd3b97f,
			0xe1d897,
			0xe5e5e3
		),
		paletteGray: Palette.generatePalette(
			0x2d2f39,
			0x9898a1,
			0xe8e8ee,
			0x7a7a82,
			0xcbced4
		),
		circleCyan: {
			radius: 0.8,
			x: 1.1,
			y: 0.6
		},
		circleRed: {
			radius: 1,
			x: 0.3,
			y: -0.15
		}
	})
};
</script>
