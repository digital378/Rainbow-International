const HEADING_SLOT = "gandhi-heading";
const HEADING_SELECTOR = `.gandhi-jayanti-article > h1[slot="${HEADING_SLOT}"]`;

/**
 * Project the real, document-visible heading into its original hero position.
 * No duplicate or hidden SEO heading: the slot displays this same H1.
 */
export function projectGandhiHeading(hero: string, sourceCss: string) {
  const headings = [...hero.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/g)];
  if (headings.length !== 1) throw new Error("Gandhi hero must contain exactly one H1");
  const original = headings[0][0];
  const heading = original.replace(/<h1\b/, `<h1 slot="${HEADING_SLOT}"`);
  const selectors = [
    ["h1,h2,h3,h4", HEADING_SELECTOR],
    [".hero h1", HEADING_SELECTOR],
    [".hero h1 .t1", `${HEADING_SELECTOR} .t1`],
    [".hero h1 .t1 em", `${HEADING_SELECTOR} .t1 em`],
    [".hero h1 .t2", `${HEADING_SELECTOR} .t2`],
  ];
  // The original H1 is inside a section (UA heading size 1.5em). Keep that
  // size explicitly when it is slotted, including its inherited letter spacing.
  const rules = [`${HEADING_SELECTOR}{display:block;font-size:1.5em;}`];
  for (const [sourceSelector, targetSelector] of selectors) {
    const start = sourceCss.indexOf(`${sourceSelector}{`);
    const end = sourceCss.indexOf("}", start);
    if (start < 0 || end < start) throw new Error(`Missing Gandhi heading style: ${sourceSelector}`);
    const declarations = sourceCss.slice(start + sourceSelector.length + 1, end);
    rules.push(`${targetSelector}{${declarations}}`);
  }
  return {
    hero: hero.replace(original, `<slot name="${HEADING_SLOT}"></slot>`),
    heading,
    css: rules.join("\n"),
  };
}