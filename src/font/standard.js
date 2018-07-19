import AFMFont from './afm';
import Courier from './data/Courier.afm';
import CourierBold from './data/Courier-Bold.afm';
import CourierOblique from './data/Courier-Oblique.afm';
import CourierBoldOblique from './data/Courier-BoldOblique.afm';
import Helvetica from './data/Helvetica.afm';
import HelveticaBold from './data/Helvetica-Bold.afm';
import HelveticaOblique from './data/Helvetica-Oblique.afm';
import HelveticaBoldOblique from './data/Helvetica-BoldOblique.afm';
import TimesRoman from './data/Times-Roman.afm';
import TimesBold from './data/Times-Bold.afm';
import TimesItalic from './data/Times-Italic.afm';
import TimesBoldItalic from './data/Times-BoldItalic.afm';

const STANDARD_FONTS = {
  Courier: Courier,
  'Courier-Bold': CourierBold,
  'Courier-Oblique': CourierOblique,
  'Courier-BoldOblique': CourierBoldOblique,
  Helvetica: Helvetica,
  'Helvetica-Bold': HelveticaBold,
  'Helvetica-Oblique': HelveticaOblique,
  'Helvetica-BoldOblique': HelveticaBoldOblique,
  'Times-Roman': TimesRoman,
  'Times-Bold': TimesBold,
  'Times-Italic': TimesItalic,
  'Times-BoldItalic': TimesBoldItalic
};

const createStandardFont = PDFFont => (
  class StandardFont extends PDFFont {
    constructor(document, name, id) {
      super();

      this.document = document;
      this.name = name;
      this.id = id;
      this.font = new AFMFont(STANDARD_FONTS[this.name]);
      this.ascender = this.font.ascender;
      this.descender = this.font.descender;
      this.bbox = this.font.bbox;
      this.lineGap = this.font.lineGap;
    }

    embed() {
      this.dictionary.data = {
        Type: 'Font',
        BaseFont: this.name,
        Subtype: 'Type1',
        Encoding: 'WinAnsiEncoding',
      };

      return this.dictionary.end();
    }

    encode(text) {
      const encoded = this.font.encodeText(text);
      const glyphs = this.font.glyphsForString(`${text}`);
      const advances = this.font.advancesForGlyphs(glyphs);
      const positions = [];

      for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i];
        positions.push({
          xAdvance: advances[i],
          yAdvance: 0,
          xOffset: 0,
          yOffset: 0,
          advanceWidth: this.font.widthOfGlyph(glyph),
        });
      }

      return [encoded, positions];
    }

    encodeGlyphs(glyphs) {
      const res = [];

      for (let glyph of Array.from(glyphs)) {
        res.push(`00${glyph.id.toString(16)}`.slice(-2));
      }

      return res;
    }

    widthOfString(string, size) {
      const glyphs = this.font.glyphsForString(`${string}`);
      const advances = this.font.advancesForGlyphs(glyphs);

      let width = 0;
      for (let advance of Array.from(advances)) {
        width += advance;
      }

      const scale = size / 1000;
      return width * scale;
    }

    static isStandardFont(name) {
      return name in STANDARD_FONTS;
    }
  }
);

export default createStandardFont;
