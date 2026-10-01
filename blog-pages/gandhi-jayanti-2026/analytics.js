// Preserve the existing site's GA4 page/call/WhatsApp events without loading
// the React application. GTM, Ads, Meta and Clarity remain in the site template.
(() => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const measurement = "G-DN4GB6MVJJ";
  const params = new URLSearchParams(location.search);
  if (params.get("utm_source") || params.get("utm_medium") || params.get("gclid")
    || params.get("gad_source") || params.get("fbclid")) {
    let source = params.get("utm_source") || "";
    let medium = params.get("utm_medium") || "";
    if (!source && (params.get("gclid") || params.get("gad_source"))) {
      source = "google";
      medium = medium || "cpc";
    }
    if (!source && params.get("fbclid")) {
      source = "meta";
      medium = medium || "paid_social";
    }
    try {
      sessionStorage.setItem("ris_utm_params", JSON.stringify({
        utm_source: source, utm_medium: medium,
        utm_campaign: params.get("utm_campaign") || params.get("gad_campaignid") || "",
        utm_term: params.get("utm_term") || "", utm_content: params.get("utm_content") || "",
        gclid: params.get("gclid") || "", fbclid: params.get("fbclid") || "",
      }));
    } catch { /* Existing tracking also tolerates disabled session storage. */ }
  }
  window.gtag("event", "page_view", {
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.href,
    send_to: measurement,
  });
  document.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link || !link.closest("header[role=banner], footer")) return;
    if (link.getAttribute("href")?.startsWith("tel:")) {
      const phone = link.getAttribute("href") === "tel:02269105000"
        ? "(022) 69105000" : "+91 82915 68972";
      window.gtag("event", "call_click", {
        phone, source_page: location.pathname, send_to: measurement,
      });
      window.gtag("event", "conversion", {
        send_to: measurement, event_category: "engagement",
        event_label: phone, conversion_name: "call_click",
      });
    }
    if (link.closest("header") && /wa\.me/.test(link.href)) {
      window.gtag("event", "whatsapp_click", {
        source_page: location.pathname, send_to: measurement,
      });
    }
    if (link.matches('footer [data-testid="link-campus-map"]')) {
      window.gtag("event", "directions_click", {
        source_page: location.pathname, send_to: measurement,
      });
    }
  });
})();