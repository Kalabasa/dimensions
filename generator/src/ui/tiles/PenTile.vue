<template>
	<Tile v-bind="tileProps(paletteMapping)">
		<div class="body"></div>
		<div class="bgLeft"></div>
		<div class="bgRight"></div>
	</Tile>
</template>

<style scoped>
.body {
	position: absolute;
	width: 100%;
	height: 100%;
	background: var(--bodyColor);
}
.bgLeft {
	position: absolute;
	width: 50%;
	height: 50%;
	border-bottom-right-radius: 100%;
	background: var(--bgLeftColor);
}
.bgRight {
	position: absolute;
	right: 0;
	width: 50%;
	height: 50%;
	border-bottom-left-radius: 100%;
	background: var(--bgRightColor);
}
</style>

<script>
import tileMixin from "ui/mixins/tileMixin";

export default {
	constants: {
		paletteMapping: {
			bodyColor: true,
			bgLeftColor: true,
			bgRightColor: true
		}
	},
	mixins: [tileMixin]
};
</script>
