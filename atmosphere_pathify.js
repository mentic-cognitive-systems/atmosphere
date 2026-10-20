const ConvertToPath = require('svg-convert-to-path');

async function pathifySVG() {
  try {
    await ConvertToPath.getPath({
      loadAs: '@mosphere_primatives.svg',
      saveAs: '@mosphere_paths.svg' 
    });
    console.log("Success! Text converted to paths.");
  } catch (error) {
    console.error("Conversion failed:", error);
  }
}

pathifySVG();