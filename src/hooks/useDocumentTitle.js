import { useEffect } from "react";

const DEFAULT_SUFFIX = "YoStore";

function upsertMeta(attr, key, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

/**
 * Per-route document metadata: unique title, description, and matching
 * Open Graph tags. A client-rendered SPA must set these after mount.
 */
export function useDocumentTitle(title, options = {}) {
    const { description, suffix = DEFAULT_SUFFIX } = options;

    useEffect(() => {
        document.title = title ? `${title} · ${suffix}` : suffix;
        if (description) {
            upsertMeta("name", "description", description);
            upsertMeta("property", "og:title", document.title);
            upsertMeta("property", "og:description", description);
            upsertMeta("property", "og:url", window.location.href);
        }
    }, [title, description, suffix]);
}

export default useDocumentTitle;
