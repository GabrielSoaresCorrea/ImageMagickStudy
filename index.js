const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: '7+' });
const xml2js = require('xml2js');
const svg2img = require('svg2img');
const tinycolor = require("tinycolor2");

const listOfHeight16for9 = [
  1280,
  1366,
  1600,
  1920,
  2560,
  3840
];

const listOfWidth16for9 = [
  720,
  768,
  900,
  1080,
  1440,
  1800,
];

const themesColors = {
  athena: "#D4AF37",
  apollo: '#908429',
  poseidon: "#2D848A",
  zoe: '#102849',
}

const pathSvg = {
  athena: 'Svg/Athena.svg',
  apollo: 'Svg/Apollo.svg',
  poseidon: 'Svg/Poseidon.svg',
  zoe: 'Svg/Zoe.svg'
}

const height = listOfHeight16for9[3];
const width = listOfWidth16for9[3];
const svgMaxSize = width / 4;

const backgroundColor = themesColors.poseidon;
const centerSvg =  pathSvg.poseidon;

const backgroundOutput = 'backgroundOutput.png';
const backgroundTC = tinycolor(backgroundColor);

function changeSvgStroke(strokeColor) {
  // Read the SVG file
  fs.readFile(centerSvg, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // Parse the XML data
    xml2js.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Get the path element and set its stroke attribute to red
      const path = result.svg.path[0];
      // Get the <svg> element from the result object
      const svgElement = result.svg;
      if (path && path.$) {
        path.$.stroke = strokeColor;
        path.$.fill = strokeColor;

        // Modify the attributes of the <svg> element
        svgElement.$.width = svgMaxSize;
        svgElement.$.height = svgMaxSize;
      }

      // Convert the modified XML data back to a string
      const builder = new xml2js.Builder();
      const modifiedData = builder.buildObject(result);

      // Write the modified SVG file
      fs.writeFile(centerSvg, modifiedData, (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log('SVG stroke modificado ');
      });
    });
  });
}

if(backgroundTC.isDark()) {
  changeSvgStroke('#fff');
} else {
  changeSvgStroke('#000');
}

function createDesktopColor(height, width, backgroundColor) {

  gm(height, width, backgroundColor)
  .write(backgroundOutput,
  (err => {
    if(err) throw err;
    console.log('Background Complete');
    passSvgToImg(centerSvg);
  }));

};

function passSvgToImg(pathSvg) {

  svg2img(pathSvg, (err, buffer) => {
    if (err) throw err;
    createTemporaryPng(buffer);
  });
}

function createTemporaryPng(buffer) {
  const tempPng = 'temp.png';
  
  fs.writeFileSync(tempPng, buffer);
  console.log('Temporary png archive created');

  getDimensions(backgroundOutput, tempPng);
};

function getDimensions(colorWallpaper, tempPng) {
  gm(colorWallpaper).size((err, size) => {
    if (err) throw err;
    gm(tempPng)
      .size((err, pngSize) => {
        if (err) throw err;
        createFinalWallpaper(backgroundOutput, tempPng, size, pngSize);
      });
  });
};

function calculateHeightToCenter(wallpaperSize, pngSize) {
  const finalHeight = Math.round((wallpaperSize.height - pngSize.height) / 2);
  return finalHeight;
};

function calculateWidthToCenter(wallpaperSize, pngSize) {
  const finalWidth = Math.round((wallpaperSize.width - pngSize.width) / 2);
  return finalWidth;
};

function createFinalWallpaper(colorWallpaper, tempPng, wallpaperSize, pngSize) {

  const widthCalc = calculateWidthToCenter(wallpaperSize, pngSize);
  const heightCalc = calculateHeightToCenter(wallpaperSize, pngSize);

  gm(colorWallpaper)
    .geometry(`+${widthCalc}+${heightCalc}`)
    .composite(tempPng)
    .write('final wallpaper.png', (err) => {
      if(err) throw err;
      console.log('saved image');
      fs.unlinkSync(tempPng);
      console.log('deleted temporary png file');
    });
};

createDesktopColor(height, width, backgroundColor);
