const queryParam = 'headingFont';
const previewFonts = ['exo2'];

/**
 * Runs before first paint, so a previewed heading font never flashes the
 * default one first. `?headingFont=exo2` turns the preview on for that page
 * load. Nothing is stored: the attribute lives on <html>, which client side
 * navigation never replaces, so the preview lasts until the next full reload.
 */
const script = `(function () {
  var font = new URLSearchParams(location.search).get('${queryParam}');
  if (${JSON.stringify(previewFonts)}.indexOf(font) !== -1) {
    document.documentElement.setAttribute('data-heading-font', font);
  }
})();`;

export const HeadingFontPreviewScript = () => (
  <script dangerouslySetInnerHTML={{ __html: script }} />
);
