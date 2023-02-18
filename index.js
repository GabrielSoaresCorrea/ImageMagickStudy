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

const athenaThemeColor = "#D4AF37";
const poseidonThemeColor = "#2D848A";
const apolloThemeColor = '#908429';
const zoeThemeColor = '#102849';

const height = listOfHeight16for9[3];
const width = listOfWidth16for9[3];
const svgMaxSize = width / 4;
const backgroundColor = zoeThemeColor;
const pathSvg =  'zzImagens/Zoe.svg'
const backgroundOutput = 'backgroundOutput.png'

const backgroundTC = tinycolor(backgroundColor);

if(backgroundTC.isDark()) {
  changeSvgStroke('#fff');
} else {
  changeSvgStroke('#000');
}

function changeSvgStroke(strokeColor) {
  // Read the SVG file
  fs.readFile(pathSvg, 'utf-8', (err, data) => {
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
      fs.writeFile(pathSvg, modifiedData, (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log('SVG stroke modificado ');
      });
    });
  });
}



gm(height, width, backgroundColor)
  .write(backgroundOutput, (err) => {

    if(err) console.log(err);
    console.log('background Feito');

    svg2img(pathSvg, (error, buffer) => {

      if (error) console.log(error);
      console.log('svg2img');
      const tempPng = 'temp.png';

      fs.writeFileSync(tempPng, buffer);
      console.log('arquivo png temporario criado');
    
      // Get the dimensions of the input image and the temporary PNG file
      gm(backgroundOutput).size((err, size) => {
        if (err) console.log(err);
        console.log(size)
        gm(tempPng)
        .size((err, pngSize) => {
          if (err) console.log(err);
          console.log(pngSize)
    
          // Calculate the position of the PNG to center it within the input image
          const x = Math.round((size.width - pngSize.width) / 2);
          console.log(x)
          const y = Math.round((size.height - pngSize.height) / 2);
          console.log(y)
          
          // Add the PNG to the image using the -geometry option
          gm(backgroundOutput)
            .geometry(`+${x}+${y}`)
            .composite(tempPng)
            // Write the output image to a file
            .write('output.png', (err) => {
              if (err) console.log(err);
              console.log('Imagem salva');
              // Remove the temporary PNG file
              fs.unlinkSync(tempPng);
              console.log('Arquivo png temporario apagado')
            });
        });
      });
    });
  });
