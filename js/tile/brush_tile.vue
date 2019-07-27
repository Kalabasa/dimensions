<template>
<Tile>
    <div class="bgBottom"></div>
    <div class="bgTop"></div>
    <div class="brush"></div>
    <div class="bgTail"></div>
</Tile>
</template>

<style>
.bgBottom {
    position: absolute;
    width: 50%;
    height: 50%;
    background: var(--bgBottomColor);
}
.bgTop {
    position: absolute;
    right: 0;
    width: 50%;
    height: 50%;
    background: var(--bgTopColor);
}
.brush {
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 50%;
    border-top-right-radius: 50%;
    background: var(--brushColor);
}
.bgTail {
    position: absolute;
    bottom: 0;
    width: 50%;
    height: 50%;
    border-top-right-radius: 50%;
    background: var(--bgTailColor);
}
</style>
