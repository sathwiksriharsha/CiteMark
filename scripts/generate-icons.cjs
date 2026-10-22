const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, r, g, b) {
  // Create raw RGBA image data with a rounded border/icon design
  const rowLength = width * 4 + 1; // +1 for filter byte
  const buffer = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowLength;
    buffer[rowStart] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 4;

      // Draw rounded blue badge with a white center bookmark/citation symbol
      const cornerRadius = Math.floor(width * 0.2);
      const isCorner = (
        (x < cornerRadius && y < cornerRadius && Math.hypot(x - cornerRadius, y - cornerRadius) > cornerRadius) ||
        (x >= width - cornerRadius && y < cornerRadius && Math.hypot(x - (width - cornerRadius - 1), y - cornerRadius) > cornerRadius) ||
        (x < cornerRadius && y >= height - cornerRadius && Math.hypot(x - cornerRadius, y - (height - cornerRadius - 1)) > cornerRadius) ||
        (x >= width - cornerRadius && y >= height - cornerRadius && Math.hypot(x - (width - cornerRadius - 1), y - (height - cornerRadius - 1)) > cornerRadius)
      );

      if (isCorner) {
        // Transparent
        buffer[pixelStart] = 0;
        buffer[pixelStart + 1] = 0;
        buffer[pixelStart + 2] = 0;
        buffer[pixelStart + 3] = 0;
        continue;
      }

      // Check if inside inner bookmark symbol
      const isSymbol = (
        x >= Math.floor(width * 0.3) && x <= Math.floor(width * 0.7) &&
        y >= Math.floor(height * 0.25) && y <= Math.floor(height * 0.75) &&
        !(y > Math.floor(height * 0.55) && Math.abs(x - width * 0.5) < (height * 0.75 - y) * 0.6)
      );

      if (isSymbol) {
        // Pure White
        buffer[pixelStart] = 255;
        buffer[pixelStart + 1] = 255;
        buffer[pixelStart + 2] = 255;
        buffer[pixelStart + 3] = 255;
      } else {
        // Deep scholarly blue: #1d4ed8 -> (29, 78, 216)
        buffer[pixelStart] = r;
        buffer[pixelStart + 1] = g;
        buffer[pixelStart + 2] = b;
        buffer[pixelStart + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(buffer);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // Compression method
  ihdrData[11] = 0; // Filter method
  ihdrData[12] = 0; // Interlace method

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

[16, 48, 128, 300].forEach(size => {
  const png = createPNG(size, size, 29, 78, 216);
  const dest = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(dest, png);
  console.log(`Generated ${dest} (${png.length} bytes)`);
});
