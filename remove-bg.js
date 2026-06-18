import { Jimp } from "jimp";

async function main() {
  try {
    const imagePath = "public/logo.png.jpg";
    const image = await Jimp.read(imagePath);

    // Make pixels that are close to white completely transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];

      // If the pixel is very light/white (e.g., > 240 for R, G, B)
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      }
    });

    await image.write("public/logo.png");
    console.log("Background removed and saved as public/logo.png!");
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

main();
