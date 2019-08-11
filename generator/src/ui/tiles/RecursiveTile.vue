<template>
	<Tile v-bind="tileProps(paletteMapping)">
		<div class="subGrid">
			<template v-for="(tile, index) in tiles">
				<component
					:key="index"
					:is="tile.component"
					:seed="seed"
					:palette="palette"
					:orientation="tile.orientation"
					v-bind="tile.props"
				/>
			</template>
		</div>
	</Tile>
</template>

<script>
import Palette from "color/palette";

export default {
	props: {
		tiles: Array
	}
};
</script>

<style scoped>
.subGrid {
	display: grid;
	grid-template: repeat(2, 1fr) / repeat(2, 1fr);
	position: absolute;
	width: 100%;
	height: 100%;
}
</style>

<script>
import tileMixin from "ui/mixins/tileMixin";

export default {
	props: {
		tiles: Array,
	},
	constants: {
		paletteMapping: {}
	},
	mixins: [tileMixin]
};
</script>
