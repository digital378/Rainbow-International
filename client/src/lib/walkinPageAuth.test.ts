import assert from "node:assert/strict";
import { test } from "node:test";
import { forgetPageSession, restorePageSession, signInPage } from "./walkinPageAuth";

test("page sessions stay separate and restore through the server check", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    },
  });
  globalThis.fetch = async (input, init) => {
    if (String(input) === "/api/walkin/page-session") {
      assert.equal(JSON.parse(String(init?.body)).scope, "leads");
      return new Response(JSON.stringify({ ok: true, token: "test-scoped-session" }), { status: 200 });
    }
    assert.equal(String(input), "/api/walkin/page-session?scope=leads");
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer test-scoped-session");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  try {
    assert.equal(await signInPage("leads", "test-only-code"), "test-scoped-session");
    assert.equal(await restorePageSession("leads"), "test-scoped-session");
    assert.equal(await restorePageSession("panel"), null);
    forgetPageSession("leads");
    assert.equal(await restorePageSession("leads"), null);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, "sessionStorage", originalStorage);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
});