import { Jimp } from "jimp";

async function main() {
  try {
    const imagePath = "public/logo.png";
    const image = await Jimp.read(imagePath);

    // Autocrop transparent borders
    image.autocrop();

    await image.write("public/logo.png");
    console.log("Image autocropped and saved to public/logo.png!");
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

main();
