import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import { Hero } from "../client/src/components/home/Hero";

const expected = "Best CBSE School in Thane Nursery to Class 12";

describe("homepage heading text", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("has real spaces between visually separated lines", () => {
    // This test runner uses classic JSX; the application's Vite build uses
    // the automatic runtime. Supply React only in this isolated test.
    vi.stubGlobal("React", React);
    const document = new DOMParser().parseFromString(renderToStaticMarkup(React.createElement(Hero)), "text/html");
    expect(document.querySelector("h1")?.textContent).toBe(expected);
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.querySelector("h1")?.querySelectorAll("br")).toHaveLength(2);
  });

  it("uses the same heading in crawler-rendered HTML", () => {
    const source = fs.readFileSync("server/ssrHome.ts", "utf8");
    const heading = source.match(/<h1>[\s\S]*?<\/h1>/)?.[0];
    expect(heading).toBeDefined();
    const document = new DOMParser().parseFromString(heading!, "text/html");
    expect(document.querySelector("h1")?.textContent).toBe(expected);
  });
});