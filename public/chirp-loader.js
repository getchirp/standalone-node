(() => {
  const loadInteraction = () => {
    import("./chirp-logo.js").catch(error => {
      console.error("Chirp logo failed to load:", error);
    });
  };

  if (document.readyState === "complete") {
    loadInteraction();
  } else {
    window.addEventListener("load", loadInteraction, { once: true });
  }
})();
