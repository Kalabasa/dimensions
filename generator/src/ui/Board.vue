<template>
	<div
		class="board"
		:style="{
		'grid-template': `repeat(${height}, 1fr) / repeat(${width}, 1fr)`
		}"
	>
		<template v-for="(tile, index) in tiles">
			<component
				:key="index"
				:is="tile.component"
				:seed="seed + index.toString(36)"
				:palette="paletteProvider(index)"
				:orientation="tile.orientation"
				v-bind="tile.props"
			/>
		</template>
	</div>
</template>

<style>
.board {
	display: grid;
}
</style>

<script>
import Palette from "color/palette";

export default {
	props: {
		seed: {
			type: String,
			default: Math.random().toString(36)
		},
		paletteProvider: Function,
		tiles: Array,
		width: {
			type: Number,
			default: 6
		},
		height: {
			type: Number,
			default: 8
		}
	}
};
</script>
