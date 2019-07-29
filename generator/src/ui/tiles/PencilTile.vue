<template>
	<Tile v-bind="tileProps(paletteMapping)">
		<div class="body"></div>
		<div class="tip"></div>
	</Tile>
</template>

<style scoped>
.body {
	position: absolute;
	width: 100%;
	height: 100%;
	background: var(--bodyColor);
}
.tip {
	position: absolute;
	width: 50%;
	height: 50%;
	border-bottom-right-radius: 100%;
	background: var(--tipColor);
}
</style>

<script>
import tileMixin from "ui/mixins/tileMixin";

export default {
	constants: {
		paletteMapping: {
			bodyColor: true,
			tipColor: true
		}
	},
	mixins: [tileMixin]
};
</script>
