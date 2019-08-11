import chroma from 'chroma-js';

import Palette from "color/palette";

export function generatePaletteSet() {
  const mainScale = chroma.scale([
    chroma.blend(chroma.random(), chroma.temperature(15000), 'overlay'),
    chroma.blend(chroma.random(), chroma.temperature(1000), 'overlay')
  ]).mode('lch');

  const coolScale = chroma.scale([
    chroma.blend(mainScale(0).darken(1.2), 'black', 'overlay'),
    mainScale(0),
    mainScale(0.25),
    chroma.blend(mainScale(0.4).brighten(1.6), 'white', 'overlay'),
  ]).mode('lch');

  const warmScale = chroma.scale([
    chroma.blend(mainScale(1).darken(1.2), 'black', 'overlay'),
    mainScale(1),
    mainScale(0.75),
    chroma.blend(mainScale(0.6).brighten(1.6), 'white', 'overlay'),
  ]).mode('lch');

  const midScale = chroma.scale([
    chroma.blend(mainScale(0.25), 'black', 'overlay'),
    mainScale(0.5),
    mainScale(0.5).desaturate(1.5).brighten(2),
    chroma.blend(mainScale(0.75), 'white', 'overlay'),
  ]).mode('lch');

  const neutralScale = chroma.scale([
    mainScale(0.5).desaturate(4).darken(2),
    mainScale(0.5).desaturate(2 + Math.random() * 2).brighten(2),
    mainScale(0.5).desaturate(2 + Math.random() * 2).brighten(2),
    mainScale(0.5).desaturate(4).brighten(2.5),
  ]).mode('lch');

  const paletteCool = Palette.generatePalette(
    ...coolScale.colors(5, 'num').map(Math.floor)
  );
  const paletteWarm = Palette.generatePalette(
    ...warmScale.colors(5, 'num').map(Math.floor)
  );
  const paletteMid = Palette.generatePalette(
    ...midScale.colors(5, 'num').map(Math.floor)
  );
  const paletteNeutral = Palette.generatePalette(
    ...neutralScale.colors(5, 'num').map(Math.floor)
  );

	return {
		cool: paletteCool,
		warm: paletteWarm,
		mid: paletteMid,
		neutral: paletteNeutral
	};
}
