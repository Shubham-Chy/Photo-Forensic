
import { ExifData } from "../types";

export const extractExif = async (file: File): Promise<ExifData | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const view = new DataView(buffer);

      if (view.getUint16(0) !== 0xFFD8) {
        // Not a JPEG, EXIF usually only in JPEGs
        return resolve(null);
      }

      let offset = 2;
      const length = view.byteLength;
      let foundExif = false;

      while (offset < length) {
        if (view.getUint16(offset) === 0xFFE1) {
          foundExif = true;
          offset += 4;
          break;
        }
        offset += 2 + view.getUint16(offset + 2);
      }

      if (!foundExif || offset + 6 >= length) return resolve(null);

      // Check for 'Exif\0\0'
      const magic = view.getUint32(offset);
      if (magic !== 0x45786966) return resolve(null);
      
      offset += 6;
      const tiffOffset = offset;
      
      // Endianness
      const littleEndian = view.getUint16(offset) === 0x4949;
      offset += 4;
      
      const ifdOffset = view.getUint32(offset, littleEndian);
      offset = tiffOffset + ifdOffset;

      const exif: ExifData = {};
      const numEntries = view.getUint16(offset, littleEndian);
      offset += 2;

      for (let i = 0; i < numEntries; i++) {
        const tag = view.getUint16(offset, littleEndian);
        const type = view.getUint16(offset + 2, littleEndian);
        const count = view.getUint32(offset + 4, littleEndian);
        const valueOffset = tiffOffset + view.getUint32(offset + 8, littleEndian);

        // Basic string tags
        if (tag === 0x010F) exif.make = getString(view, valueOffset, count);
        if (tag === 0x0110) exif.model = getString(view, valueOffset, count);
        if (tag === 0x0131) exif.software = getString(view, valueOffset, count);
        if (tag === 0x0132) exif.dateTime = getString(view, valueOffset, count);

        offset += 12;
      }

      resolve(Object.keys(exif).length > 0 ? exif : null);
    };
    reader.readAsArrayBuffer(file);
  });
};

const getString = (view: DataView, offset: number, length: number) => {
  let str = "";
  for (let i = 0; i < length; i++) {
    const charCode = view.getUint8(offset + i);
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }
  return str.trim();
};
