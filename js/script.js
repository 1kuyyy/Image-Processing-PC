const navbarNav = document.querySelector(".navbar-nav");

// Ketika Mengklik list
document.querySelector("#list").onclick = () => {
  navbarNav.classList.toggle("active");
};

// Klik diluar untuk menghilangkan Navbar
const list = document.querySelector("#list");
document.addEventListener("click", function (e) {
  if (!list.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});

// Image Processing
const upload = document.getElementById("upload");
const originalCanvas = document.getElementById("originalCanvas");
const processedCanvas = document.getElementById("processedCanvas");
const originalCtx = originalCanvas.getContext("2d");
const processedCtx = processedCanvas.getContext("2d");

let image = new Image();
/* Upload gambar dengan ukuran sesuai gambar asli */
upload.addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    image.onload = function () {
      originalCanvas.width = image.width;
      originalCanvas.height = image.height;
      processedCanvas.width = image.width;
      processedCanvas.height = image.height;
      originalCtx.drawImage(image, 0, 0);
      processedCtx.drawImage(image, 0, 0);
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

/* Reset gambar Ke keadaan asli */
function ResetImage() {
  processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
  processedCtx.drawImage(originalCanvas, 0, 0);
}

/* Grayscale -> Mengatur R, G, B ke nilai rata-rata (abu-abu) */
function Grayscale() {
  const imageData = processedCtx.getImageData(
    0,
    0,
    processedCanvas.width,
    processedCanvas.height
  );
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg;
  }
  processedCtx.putImageData(imageData, 0, 0);
}

/* Biner -> Mengubah gambar menjadi hitam(0) - putih(255) jika rata-rata (127) */
function Biner() {
  const imageData = processedCtx.getImageData(
    0,
    0,
    processedCanvas.width,
    processedCanvas.height
  );
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const binary = avg > 127 ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = binary;
  }
  processedCtx.putImageData(imageData, 0, 0);
}

/* Brightness -> Mengubah tingkat terang gambar dengan cara menambahkan atau mengurangi nilai RGB dari setiap piksel */
function Brightness(value) {
  const imageData = processedCtx.getImageData(
    0,
    0,
    processedCanvas.width,
    processedCanvas.height
  );
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + value));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value));
  }
  processedCtx.putImageData(imageData, 0, 0);
}

/* Contrast -> Memodifikasi jarak kontras piksel ke nilai tengah (128) */
function Contrast(factor) {
  const imageData = processedCtx.getImageData(
    0,
    0,
    processedCanvas.width,
    processedCanvas.height
  );
  const data = imageData.data;
  const midpoint = 128;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = truncate(midpoint + factor * (data[i] - midpoint));
    data[i + 1] = truncate(midpoint + factor * (data[i + 1] - midpoint));
    data[i + 2] = truncate(midpoint + factor * (data[i + 2] - midpoint));
  }
  processedCtx.putImageData(imageData, 0, 0);
}

function truncate(value) {
  return Math.max(0, Math.min(255, value));
}

/* Filter */
function Filter(type) {
  const imageData = processedCtx.getImageData(
    0,
    0,
    processedCanvas.width,
    processedCanvas.height
  );
  const width = processedCanvas.width;
  const height = processedCanvas.height;
  const srcData = imageData.data;
  const dstData = new Uint8ClampedArray(srcData);

  /* Konvolusi -> Mengaplikasikan kernel ke area piksel, untuk meningkatkan ketajaman gambar */
  function setKonvolusi(kernel) {
    const kernelSize = kernel.length;
    const offset = Math.floor(kernelSize / 2);
    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        let r = 0,
          g = 0,
          b = 0;

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = x + kx - offset;
            const py = y + ky - offset;
            const index = (py * width + px) * 4;
            const weight = kernel[ky][kx];

            r += srcData[index] * weight;
            g += srcData[index + 1] * weight;
            b += srcData[index + 2] * weight;
          }
        }

        const i = (y * width + x) * 4;
        dstData[i] = Math.min(Math.max(r, 0), 255);
        dstData[i + 1] = Math.min(Math.max(g, 0), 255);
        dstData[i + 2] = Math.min(Math.max(b, 0), 255);
      }
    }
  }

  /* rerata -> Mengambil rata-rata dari 3x3 piksel tetangganya */
  if (type === "rerata") {
    const kernel = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ];
    const kernelSize = 3;
    const kernelSum = 9;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0,
          g = 0,
          b = 0;

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = x + kx - 1;
            const py = y + ky - 1;
            const index = (py * width + px) * 4;
            const weight = kernel[ky][kx];
            r += srcData[index] * weight;
            g += srcData[index + 1] * weight;
            b += srcData[index + 2] * weight;
          }
        }

        const i = (y * width + x) * 4;
        dstData[i] = r / kernelSum;
        dstData[i + 1] = g / kernelSum;
        dstData[i + 2] = b / kernelSum;
      }
    }

    /* median -> Mengambil nilai median dari 3x3 piksel tetangganya*/
  } else if (type === "median") {
    const kernelSize = 3;
    const offset = Math.floor(kernelSize / 2);

    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        let rValues = [],
          gValues = [],
          bValues = [];

        for (let ky = -offset; ky <= offset; ky++) {
          for (let kx = -offset; kx <= offset; kx++) {
            const px = x + kx;
            const py = y + ky;
            const index = (py * width + px) * 4;
            rValues.push(srcData[index]);
            gValues.push(srcData[index + 1]);
            bValues.push(srcData[index + 2]);
          }
        }

        rValues.sort((a, b) => a - b);
        gValues.sort((a, b) => a - b);
        bValues.sort((a, b) => a - b);

        const medianIdx = Math.floor(rValues.length / 2);
        const i = (y * width + x) * 4;
        dstData[i] = rValues[medianIdx];
        dstData[i + 1] = gValues[medianIdx];
        dstData[i + 2] = bValues[medianIdx];
      }
    }

    /* Batas -> Menghitung gradien/perubahan intensitas batas tepi */
  } else if (type === "roberts") {
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const iX = ((y + 1) * width + (x + 1)) * 4;
        const iY = ((y + 1) * width + x) * 4;
        const iXY = (y * width + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const gx = srcData[i] - srcData[iX];
          const gy = srcData[iY] - srcData[iXY];
          dstData[i + c] = Math.sqrt(gx * gx + gy * gy);
        }
      }
    }

    /* Konvolusi kernel sharpen*/
  } else if (type === "konvolusi") {
    const sharpen = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ];
    setKonvolusi(sharpen);
  }
  imageData.data.set(dstData);
  processedCtx.putImageData(imageData, 0, 0);
}

/* Geometri -> Mengubah posisi piksel */
function Geometri(type, options = {}) {
  const imageData = processedCtx.getImageData(
    0,
    0,
    processedCanvas.width,
    processedCanvas.height
  );
  const width = processedCanvas.width;
  const height = processedCanvas.height;
  const srcData = imageData.data;

  const output = processedCtx.createImageData(width, height);
  const dstData = output.data;

  function getPixel(x, y) {
    const i = (y * width + x) * 4;
    return [srcData[i], srcData[i + 1], srcData[i + 2], srcData[i + 3]];
  }

  function setPixel(x, y, rgba) {
    const i = (y * width + x) * 4;
    dstData[i] = rgba[0];
    dstData[i + 1] = rgba[1];
    dstData[i + 2] = rgba[2];
    dstData[i + 3] = rgba[3];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let srcX = x,
        srcY = y;
      /* Translasi */
      if (type === "translasi") {
        srcX = x - (options.dx || 0);
        srcY = y - (options.dy || 0);
        /* Scaling */
      } else if (type === "scaling") {
        srcX = Math.floor(x / (options.sx || 1));
        srcY = Math.floor(y / (options.sy || 1));
        /* Rotasi */
      } else if (type === "rotasi") {
        const angle = ((options.angle || 0) * Math.PI) / 180;
        const cx = width / 2;
        const cy = height / 2;
        const dx = x - cx;
        const dy = y - cy;
        srcX = Math.round(cx + dx * Math.cos(-angle) - dy * Math.sin(-angle));
        srcY = Math.round(cy + dx * Math.sin(-angle) + dy * Math.cos(-angle));
      }

      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const pixel = getPixel(srcX, srcY);
        setPixel(x, y, pixel);
      }
    }
  }

  processedCtx.putImageData(output, 0, 0);
}
