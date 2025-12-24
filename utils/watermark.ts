
export const applyForensicWatermark = (base64: string, text: string = "GUEST_UNVERIFIED_DATA"): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);

      ctx.drawImage(img, 0, 0);

      const fontSize = Math.floor(img.width / 15);
      ctx.font = `bold ${fontSize}px JetBrains Mono, monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      
      const step = fontSize * 3;
      for (let y = -canvas.height; y < canvas.height; y += step) {
        for (let x = -canvas.width; x < canvas.width; x += step * 2) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();

      // Small constant watermark at bottom
      ctx.font = `${Math.floor(fontSize / 3)}px JetBrains Mono, monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'right';
      ctx.fillText("FORENSIC LABS - GUEST ACCESS", canvas.width - 20, canvas.height - 20);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
};
