const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: '7+' });
const xml2js = require('xml2js');
const svg2img = require('svg2img');

const height = 2560;
const width = 1080;
const backgroundColor = '#40798C';
const svg = 'zzImagens/home-simple.svg'
const backgroundOutput = 'backgroundOutput.png'

gm(height, width, backgroundColor)
  .write(backgroundOutput, (err) => {

    if(err) console.log(err);
    console.log('background Feito');

    svg2img(svg, (error, buffer) => {

      if (error) console.log(error);
      console.log('svg2img');

      const tempPng = 'temp.png';
      console.log('arquivo png temporario criado');

      fs.writeFileSync(tempPng, buffer);
      console.log('requisição feita');
    
      // Get the dimensions of the input image and the temporary PNG file
      gm(backgroundOutput).size((err, size) => {
        if (err) console.log(err);
        console.log(size)
        gm(tempPng).size((err, pngSize) => {
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
            .write('output.jpg', (err) => {
              if (err) console.log(err);
              console.log('Image saved successfully!');
              // Remove the temporary PNG file
              console.log('Arquivo png temporario apagado')
            });
        });
      });
    });
  });
