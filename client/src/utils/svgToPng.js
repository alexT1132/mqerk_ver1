/**
 * Convert a live SVG element to a PNG data URL using an offscreen canvas.
 * @param {SVGElement} svgEl
 * @param {{ width?: number, height?: number, background?: string, scale?: number }} opts
 * @returns {Promise<string>} data URL (image/png)
 */
export function svgElementToPngDataUrl(svgEl, opts = {}) {
  return new Promise((resolve, reject) => {
    try {
      if (!svgEl) return resolve('');
      const bbox = svgEl.getBoundingClientRect();
      const width = Math.max(1, Math.floor(opts.width || bbox.width || 800));
      const height = Math.max(1, Math.floor(opts.height || bbox.height || 450));
      const scale = opts.scale || 2; // increase resolution
      const bg = opts.background || '#ffffff';

      // Serialize SVG
      const serializer = new XMLSerializer();
      let svgStr = serializer.serializeToString(svgEl);
      // Ensure xmlns present
      if (!svgStr.match(/^<svg[^>]+xmlns=\"http:\/\/www.w3.org\/2000\/svg\"/)) {
        svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      // Embed styles for better fidelity (basic)
      const style = window.getComputedStyle(svgEl);
      if (style && style.fontFamily) {
        svgStr = svgStr.replace('<svg', `<svg style="font-family:${style.fontFamily};"`);
      }

      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(width * scale);
          canvas.height = Math.floor(height * scale);
          const ctx = canvas.getContext('2d');
          // background
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // draw SVG image scaled to canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } catch (e) { URL.revokeObjectURL(url); reject(e); }
      };
      img.onerror = (e) => { URL.revokeObjectURL(url); resolve(''); };
      img.src = url;
    } catch (err) {
      resolve('');
    }
  });
}
