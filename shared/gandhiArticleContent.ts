export const GANDHI_PATH = "/gandhi-jayanti-2026";
export const GANDHI_OLD_SLUG = "gandhi-jayanti-2026-speech-essay-quotes-students";

// The uploaded article remains the copy/design source for both the browser and
// crawlable HTML. Apply editorial corrections once in both rendering paths.
export function prepareGandhiArticle(source: string): string {
  return source
    .replaceAll(`/blogs/${GANDHI_OLD_SLUG}`, GANDHI_PATH)
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
/* The site chat launcher occupies the bottom-right corner. */
#totop { bottom:calc(100px + env(safe-area-inset-bottom)); }
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
`;