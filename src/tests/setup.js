import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";

/* RTL has no global `afterEach` under Vitest without `globals: true`. */
afterEach(() => {
    cleanup();
});

/* jsdom does not implement matchMedia (theme + reduced-motion checks). */
if (!window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent: () => false,
    });
}

/* Motion (and lazy image layouts) rely on these observers. */
if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
        constructor(callback) {
            this.callback = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
            return [];
        }
    };
}
if (!window.ResizeObserver) {
    window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
}
if (!window.scrollTo || window.scrollTo.name === "") {
    window.scrollTo = () => {};
}

/* jsdom's crypto often lacks `subtle`; the mock auth repository needs SHA-256. */
if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", {
        value: webcrypto,
        configurable: true,
        writable: true,
    });
}
