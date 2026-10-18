(function () {
  var storageKey = "portfolio_analytics_opt_out";
  var productionHostname = "nordy-sukmana.vercel.app";
  var params = new URLSearchParams(window.location.search);
  var preference = params.get("analytics");
  var optOutForThisPage = preference === "off";

  function readOptOut() {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch (_error) {
      return false;
    }
  }

  function saveOptOut(enabled) {
    try {
      if (enabled) {
        localStorage.setItem(storageKey, "1");
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (_error) {
      // The current page still respects ?analytics=off when storage is blocked.
    }
  }

  function removePreferenceFromAddressBar() {
    if (preference !== "off" && preference !== "on") {
      return;
    }

    params.delete("analytics");
    var query = params.toString();
    var cleanUrl = window.location.pathname + (query ? "?" + query : "") + window.location.hash;
    window.history.replaceState(null, "", cleanUrl);
  }

  if (preference === "off") {
    saveOptOut(true);
  } else if (preference === "on") {
    saveOptOut(false);
  }

  removePreferenceFromAddressBar();

  var hostname = window.location.hostname.toLowerCase();
  var isLocalDevelopment = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  var isVercelPreview = hostname.endsWith(".vercel.app") && hostname !== productionHostname;
  var referrerHostname = "";

  try {
    referrerHostname = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
  } catch (_error) {
    referrerHostname = "";
  }

  var openedFromVercelDashboard =
    referrerHostname === "vercel.com" || referrerHostname.endsWith(".vercel.com");

  if (openedFromVercelDashboard && preference !== "on") {
    saveOptOut(true);
    optOutForThisPage = true;
  }

  if (optOutForThisPage || readOptOut() || isLocalDevelopment || isVercelPreview) {
    return;
  }

  ["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"].forEach(function (src) {
    if (document.querySelector('script[src="' + src + '"]')) {
      return;
    }

    var script = document.createElement("script");
    script.defer = true;
    script.src = src;
    document.head.appendChild(script);
  });
})();
