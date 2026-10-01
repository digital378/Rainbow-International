export const GANDHI_PATH = "/gandhi-jayanti-2026";
export const GANDHI_OLD_SLUG = "gandhi-jayanti-2026-speech-essay-quotes-students";
export const GANDHI_IMAGE_URL = "https://rainbowinternationalschool.in/images/blog/gandhi-jayanti-2026-cover.jpg";

// The uploaded article remains the copy/design source for both the browser and
// crawlable HTML. Apply editorial corrections once in both rendering paths.
export function prepareGandhiArticle(source: string): string {
  return source
    // Line breaks/block spans are visual separators, not text-node spaces.
    // Keep the same layout while exposing properly separated heading words.
    .replace('<span class="t1">Gandhi<br>', '<span class="t1">Gandhi <br>')
    .replace('Jayanti <em>2026</em></span><span class="t2">', 'Jayanti <em>2026</em></span> <span class="t2">')
    .replaceAll(`/blogs/${GANDHI_OLD_SLUG}`, GANDHI_PATH)
    .replace(
      /<!-- ADD before publishing: <meta property="og:image"[^>]*> -->/,
      `<meta property="og:image" content="${GANDHI_IMAGE_URL}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">`,
    )
    .replace(
      '<meta name="twitter:card" content="summary_large_image">',
      `<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${GANDHI_IMAGE_URL}">`,
    )
    .replace(
      '<meta property="og:title" content="Gandhi Jayanti 2026: Speech, Essay, Quotes, Stories and Activities">',
      '<meta property="og:title" content="Gandhi Jayanti 2026: Speech, Essay, Quotes in Hindi &amp; Marathi">',
    )
    .replace('article:modified_time" content="2026-09-28T09:00:00+05:30"', 'article:modified_time" content="2026-09-30T09:00:00+05:30"')
    .replace('"dateModified": "2026-09-28",', `"dateModified": "2026-09-30",\n   "image": {"@type": "ImageObject", "url": "${GANDHI_IMAGE_URL}", "width": 1200, "height": 630},`)
    .replace(
      'id="wa-top" href="#"',
      `id="wa-top" href="https://wa.me/?text=${encodeURIComponent(`Gandhi Jayanti 2026: speeches, essays and school activities — https://rainbowinternationalschool.in${GANDHI_PATH}`)}"`,
    )
    // Remove the unpopulated gallery and both links that would otherwise jump
    // to a missing section (in the article and the crawlable server response).
    .replace(/<section id="images">[\s\S]*?<\/section>/, "")
    .replace(/<a href="#images">Images<\/a>/, "")
    .replace(/<a class="tile[^"]*" href="#images">[\s\S]*?<\/a>/, "")
    .replace(", mahatma gandhi images", "")
    .replace(
      'Placeholder: add "Reviewed by [name, designation]" and the review date before publishing.',
      "Reviewed by Rainbow International School Team on 29th September, 2026.",
    )
    .replace(
      "Explore more from Rainbow International School: ",
      'Explore more from <a href="https://rainbowinternationalschool.in/">Rainbow International School (RIS)</a> and <a href="https://www.rainbowpreschools.com/" target="_blank" rel="noopener noreferrer">Rainbow Preschool International (RPS)</a>: ',
    );
}

export const GANDHI_LAYOUT_CSS = `
/* Article-specific corrections; shared site chrome stays untouched. */
/* The source article gave body overflow-x:hidden; after scoping body to the
   shadow host, that creates a non-scrolling overflow ancestor and prevents
   the sticky index from following the page scroll. */
:host { overflow:visible; }
.qj { top:var(--gandhi-header-height, 140px); }
/* This page uses the chat launcher's former bottom-right position for Back to top. */
#totop {
  right:20px;
  bottom:calc(20px + env(safe-area-inset-bottom));
  width:56px;
  height:56px;
}
.hero-layout > .hero-details {
  grid-template-columns:minmax(0,1.8fr) minmax(180px,.85fr) minmax(180px,.85fr);
  gap:20px;
  align-items:stretch;
  margin-bottom:28px;
}
.hero-layout > .hero-details > .hero-details,
.hero-layout > .hero-details .cdbox { display:contents; }
.hero-meta-card,.cdcard { height:100%; min-width:0; }
.hero-meta-card .share-row { margin:0; display:flex; flex-wrap:wrap; gap:8px; }
.qj-toggle::after { content:none!important; display:none!important; }
.pr .pr-ic { display:flex; align-items:center; justify-content:center; flex:none; }
.pr .pr-ic svg { display:block; flex:none; margin:auto; }
@media(max-width:960px) {
  .hero-layout > .hero-details { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .hero-meta-card { grid-column:1/-1; }
}
@media(max-width:600px) {
  .hero-layout > .hero-details { grid-template-columns:minmax(0,1fr); gap:14px; }
  .hero-meta-card { grid-column:auto; }
}
@media(max-width:700px) {
  .hero { padding-top:18px; }
  .hero-layout { margin-top:0; gap:28px; }
  .hero-copy .kicker { margin-top:0!important; margin-bottom:16px; }
  .chakra-accent, .hero-art-col::before { display:none; }
  .qj-in { padding:0 20px; }
  .qj-links { display:none; }
  .qj-toggle {
    width:100%;
    min-height:52px;
    padding:0;
    justify-content:space-between;
    text-align:left;
  }
  .qj-toggle::after { content:""!important; display:block!important; }
  .qj-toggle[aria-expanded="true"]::after { transform:rotate(225deg) translateY(-2px); }
  .tocpanel-in { padding:20px 24px 24px; gap:22px; }
}
`;