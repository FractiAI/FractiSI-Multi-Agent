(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const progress = document.getElementById("progress");
  const notesPanel = document.getElementById("notes-panel");
  const notesBody = document.getElementById("notes-body");
  const notesTime = document.getElementById("notes-time");
  const deck = document.getElementById("deck");
  let i = 0;
  let notesOn = false;

  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    progress.textContent = `${i + 1} / ${slides.length}`;
    const active = slides[i];
    const note = active.querySelector(".notes");
    notesBody.innerHTML = note ? note.innerHTML : "<p>No notes.</p>";
    notesTime.textContent = active.dataset.time
      ? `Budget ${active.dataset.time}`
      : "";
    history.replaceState(null, "", `#${i + 1}`);
    deck.focus({ preventScroll: true });
  }

  function next() { show(i + 1); }
  function prev() { show(i - 1); }

  function toggleNotes() {
    notesOn = !notesOn;
    notesPanel.hidden = !notesOn;
    document.body.classList.toggle("notes-on", notesOn);
    document.getElementById("btn-notes").setAttribute("aria-pressed", String(notesOn));
  }

  document.getElementById("btn-next").addEventListener("click", next);
  document.getElementById("btn-prev").addEventListener("click", prev);
  document.getElementById("btn-notes").addEventListener("click", toggleNotes);

  window.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "A" || tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") {
      if (e.key === " " && tag === "A") return; // let focused links activate
    }
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    } else if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      toggleNotes();
    } else if (e.key === "Home") {
      e.preventDefault();
      show(0);
    } else if (e.key === "End") {
      e.preventDefault();
      show(slides.length - 1);
    } else if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
  });

  let touchX = null;
  deck.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0].screenX;
  }, { passive: true });
  deck.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].screenX - touchX;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchX = null;
  }, { passive: true });

  const hash = Number((location.hash || "").replace("#", ""));
  show(Number.isFinite(hash) && hash >= 1 ? hash - 1 : 0);
})();
