declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = "G-DN4GB6MVJJ";

let lastFormSubmitTime = 0;

export function initGA(): void {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }
  console.log("[GA4] Initialized with ID:", MEASUREMENT_ID);
}

export function trackPageView(url: string): void {
  let retries = 0;
  const fire = () => {
    const title = document.title;
    if ((!title || title === "Rainbow International School - Best CBSE School in Thane West") && retries < 5) {
      retries++;
      setTimeout(fire, 200);
      return;
    }
    window.gtag("event", "page_view", {
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
      send_to: MEASUREMENT_ID,
    });
    console.log("[GA4] Page view:", url, document.title);
  };
  resetFormTracking();
  fire();
}

function slugToEventName(path: string): string {
  if (path === "/" || path === "") return "Home";
  const slug = path.replace(/^\//, "").replace(/\/$/, "");
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("_");
}

export function trackFormSubmit(params: {
  formType?: string;
  parentName?: string;
  studentName?: string;
  phone?: string;
  email?: string;
  grade?: string;
  isHeroForm?: boolean;
}): void {
  const now = Date.now();
  if (now - lastFormSubmitTime < 3000) {
    console.log("[GA4] Form submit deduped (within 3s lock)");
    return;
  }
  lastFormSubmitTime = now;

  const path = window.location.pathname;
  let eventName: string;
  if (params.isHeroForm) {
    eventName = "Home_Instant_Form_Submit";
  } else {
    eventName = slugToEventName(path) + "_Form_Submit";
  }

  const utmParams = getUTMParams();

  window.gtag("event", eventName, {
    page_path: path,
    page_title: document.title,
    form_type: params.formType || "inquiry",
    parent_name: params.parentName || "",
    student_name: params.studentName || "",
    phone: params.phone || "",
    grade: params.grade || "",
    lead_source: utmParams.utm_source || "direct",
    lead_medium: utmParams.utm_medium || "",
    utm_campaign: utmParams.utm_campaign || "",
    utm_term: utmParams.utm_term || "",
    utm_content: utmParams.utm_content || "",
    send_to: MEASUREMENT_ID,
  });
  console.log("[GA4] Form submit:", eventName, params);
}

export function trackCallClick(params: {
  phone: string;
  sourcePage?: string;
}): void {
  window.gtag("event", "call_click", {
    phone: params.phone,
    source_page: params.sourcePage || window.location.pathname,
    send_to: MEASUREMENT_ID,
  });
  console.log("[GA4] Call click:", params.phone);
}

export function trackWhatsAppClick(params?: {
  sourcePage?: string;
}): void {
  window.gtag("event", "whatsapp_click", {
    source_page: params?.sourcePage || window.location.pathname,
    send_to: MEASUREMENT_ID,
  });
  console.log("[GA4] WhatsApp click");
}

export function trackDirectionsClick(params?: {
  sourcePage?: string;
}): void {
  window.gtag("event", "directions_click", {
    source_page: params?.sourcePage || window.location.pathname,
    send_to: MEASUREMENT_ID,
  });
  console.log("[GA4] Directions click");
}

export function trackEvent(
  action: string,
  category?: string,
  label?: string,
  value?: number
): void {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    send_to: MEASUREMENT_ID,
  });
  console.log("[GA4] Event:", action, category, label);
}

export function pushToDataLayer(event: Record<string, any>): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
  console.log("[GA4] DataLayer push:", event);
}

export function getUTMParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_term: params.get("utm_term") || "",
    utm_content: params.get("utm_content") || "",
  };
}

export function getFormTrackingData(formLocation: string) {
  const utm = getUTMParams();
  return {
    pagePath: window.location.href,
    pageTitle: document.title,
    formLocation,
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
    utmCampaign: utm.utm_campaign,
    utmTerm: utm.utm_term,
    utmContent: utm.utm_content,
  };
}

export function resetFormTracking(): void {
  lastFormSubmitTime = 0;
}
