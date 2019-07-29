<template>
	<div class="container">
    <div class="quarterTopLeft"></div>
    <div class="quarterTopRight"></div>
    <div class="quarterBottomLeft"></div>
    <div class="quarterBottomRight"></div>
	</div>
</template>

<style scoped>
.container {
	position: absolute;
	top: 50%;
	left: 50%;
	width: calc(1.5in + 0.6px);
	height: calc(1.5in + 0.6px);
	transform: translate(-50%, -50%);
	mix-blend-mode: lighten;
}
.quarterTopLeft {
	position: absolute;
	width: 50%;
	height: 50%;
	border-top-left-radius: 100%;
	background: var(--quarterTopLeftColor);
}
.quarterTopRight {
	position: absolute;
	right: 0;
	width: 50%;
	height: 50%;
	border-top-right-radius: 100%;
	background: var(--quarterTopRightColor);
}
.quarterBottomLeft {
	position: absolute;
	bottom: 0;
	width: 50%;
	height: 50%;
	border-bottom-left-radius: 100%;
	background: var(--quarterBottomLeftColor);
}
.quarterBottomRight {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 50%;
	height: 50%;
	border-bottom-right-radius: 100%;
	background: var(--quarterBottomRightColor);
}
</style>
