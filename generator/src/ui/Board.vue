<template>
	<div class="board">
		<template v-for="(tile, index) in tiles">
			<component
				:key="index"
				:is="tile.component"
				:seed="seed + index.toString(36)"
				:palette="paletteProvider(index)"
				:orientation="tile.orientation"
			/>
		</template>
	</div>
</template>

<style>
.board {
	display: grid;
	grid-template: repeat(8, 1fr) / repeat(6, 1fr);
}
</style>

<script>
import Palette from "color/palette";

export default {
	props: {
		seed: {
			type: String,
			default: Math.random().toString(36),
		},
		paletteProvider: Function,
		tiles: Array
	}
};
</script>
