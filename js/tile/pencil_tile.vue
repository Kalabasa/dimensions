<template>
<Tile>
    <div class="body"></div>
    <div class="tip"></div>
</Tile>
</template>

<style>
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
