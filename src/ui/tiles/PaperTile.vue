<template>
	<Tile v-bind="tileProps(paletteMapping)">
		<div class="body"></div>
		<div class="bg"></div>
		<div class="fold"></div>
	</Tile>
</template>

<style scoped>
.body {
	position: absolute;
	width: 100%;
	height: 100%;
	background: var(--bodyColor);
}
.bg {
	position: absolute;
	width: 50%;
	height: 50%;
	background: linear-gradient(-45deg, transparent 50%, var(--bgColor) 50%);
}
.fold {
	position: absolute;
	width: 50%;
	height: 50%;
	border-top-left-radius: 100%;
	border-bottom-right-radius: 100%;
	background: var(--foldColor);
}
</style>

<script>
import tileMixin from "ui/mixins/tileMixin";

export default {
	constants: {
		paletteMapping: {
			bodyColor: true,
			bgColor: true,
			foldColor: true
		}
	},
	mixins: [tileMixin]
};
</script>
