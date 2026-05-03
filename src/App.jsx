import { useEffect, useRef, useState } from "react";

const vendorScripts = [
  "/js/nouislider.min.js",
  "/js/floating-ui.core.umd.min.js",
  "/js/floating-ui.dom.umd.min.js",
  "/js/index.js",
  "/js/clipboard.min.js",
  "/js/hs-copy-clipboard-helper.js",
  "/js/app.js",
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-managed-src="${src}"]`);

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.managedSrc = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => {
      reject(new Error(`Failed to load ${src}`));
    });
    document.body.append(script);
  });
}

async function loadVendorScripts() {
  for (const src of vendorScripts) {
    await loadScript(src);
  }
}

function initializeThemePickers() {
  const unavailableColorThemes = window.HS_UNAVAILABLE_COLOR_THEMES ?? {};
  const pathname = window.location.pathname;
  const themesDefaults = {
    default: "blue",
    harvest: "amber",
    retro: "fuchsia",
    ocean: "cyan",
    autumn: "yellow",
    moon: "gray",
    bubblegum: "pink",
    cashmere: "mauve",
    olive: "avocado",
  };

  let reducedThemes = [];
  let defaultTheme = "default";
  let defaultFont = "sans";

  for (const [key, value] of Object.entries(unavailableColorThemes)) {
    const { theme, excludes } = value;

    if (!pathname.includes(key)) continue;

    defaultTheme = theme;

    if (Array.isArray(excludes)) {
      reducedThemes = excludes;
    } else {
      if (excludes["*"]) reducedThemes.push(...excludes["*"]);

      for (const [nestedKey, nestedValue] of Object.entries(excludes)) {
        if (nestedKey !== "*" && pathname.includes(nestedKey)) {
          reducedThemes.push(...nestedValue);
        }
      }
    }

    break;
  }

  document
    .querySelectorAll('[data-hs-global-color-theme] input[type="radio"]')
    .forEach((input) => {
      if (reducedThemes.includes(input.value)) {
        input.disabled = true;
        input.closest(".group")?.classList.add("my57n", "rlfos");
      }

      input.addEventListener("change", (event) => {
        const value = event.target.value;
        const html = document.documentElement;
        const brand = themesDefaults[value];

        localStorage.setItem("hs-clipboard-theme", value);
        html.setAttribute("data-theme", `theme-${value}`);
        window.generateVariables?.(value, brand);
      });
    });

  document
    .querySelectorAll('[data-hs-global-brand] input[type="radio"]')
    .forEach((input) => {
      input.addEventListener("change", (event) => {
        const value = event.target.value;
        localStorage.setItem("hs-clipboard-brand", value);
        document.documentElement.setAttribute("data-brand", value);

        const currentTheme =
          localStorage.getItem("hs-clipboard-theme") || defaultTheme;
        window.generateVariables?.(currentTheme, value);
      });
    });

  document
    .querySelectorAll('[data-hs-global-font] input[type="radio"]')
    .forEach((input) => {
      input.addEventListener("change", (event) => {
        const value = event.target.value;
        localStorage.setItem("hs-clipboard-font", value);
        document.documentElement.setAttribute("data-font", value || defaultFont);
      });
    });
}

function initializePageBehaviors() {
  window.HSStaticMethods?.autoInit?.();
  initializeThemePickers();

  const overlayInstance = window.HSOverlay?.getInstance?.("#hs-pro-shnsm", true);
  if (overlayInstance?.element?.on) {
    overlayInstance.element.on("open", () => {
      const carousel = window.HSCarousel?.getInstance?.(
        "#hs-pro-shnsm [data-hs-carousel]",
        true,
      );

      carousel?.element?.recalculateWidth?.();
    });
  }
}

export default function App() {
  const [markup, setMarkup] = useState("");
  const [error, setError] = useState("");
  const initializedRef = useRef(false);

  useEffect(() => {
    window.defaultVariables = { baseUrl: "https://preline.co/pro" };

    fetch("/pages/home.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load storefront markup.");
        }

        return response.text();
      })
      .then((html) => setMarkup(html))
      .catch((fetchError) => setError(fetchError.message));
  }, []);

  useEffect(() => {
    if (!markup || initializedRef.current) return;

    initializedRef.current = true;

    loadVendorScripts()
      .then(() => initializePageBehaviors())
      .catch((scriptError) => setError(scriptError.message));
  }, [markup]);

  if (error) {
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Unable to load storefront</h1>
        <p>{error}</p>
      </main>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
