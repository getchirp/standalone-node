(() => {
const ChirpLogo = (() => {
  const instances = [];

  function setup(root) {
    if (!root || root.dataset.chirpReady) return null;

    const live = root.querySelector('.chirp-logo__live');
    if (!live) return null;

    root.dataset.chirpReady = '1';

    const svg = live.querySelector('svg');
    const sleepEye = live.querySelector('[data-chirp-sleep-eye]');
    const awakeEye = live.querySelector('[data-chirp-awake-eye]');
    const sclera = live.querySelector('[data-chirp-sclera]');
    const pupil = live.querySelector('[data-chirp-pupil]');
    const beakStates = [...live.querySelectorAll('[data-chirp-beak-state]')];
    const beakRoot = live.querySelector('[data-chirp-beak]');
    const notes = live.querySelector('.chirp-logo__notes');

    if (!svg || !sleepEye || !awakeEye || !sclera || !pupil || !beakRoot || !beakStates.length || !notes) {
      delete root.dataset.chirpReady;
      return null;
    }

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let awake = false;
    let blinkTimer = 0;
    let beakTimers = [];

    // The same SVG is rendered asleep from first paint and enhanced in place.

    function scheduleBlink() {
      clearTimeout(blinkTimer);
      blinkTimer = setTimeout(blink, 2800 + Math.random() * 3200);
    }

    function blink() {
      if (!awake || reduced) {
        scheduleBlink();
        return;
      }

      awakeEye.animate(
        [
          { transform: 'scaleY(1)' },
          { transform: 'scaleY(.22)', offset: .48 },
          { transform: 'scaleY(1)' }
        ],
        {
          duration: 150,
          easing: 'ease-in-out'
        }
      );

      scheduleBlink();
    }

    function wake() {
      if (awake) return;
      awake = true;

      if (reduced || typeof awakeEye.animate !== 'function') {
        sleepEye.style.opacity = '0';
        awakeEye.style.opacity = '1';
      } else {
        sleepEye.animate(
          [
            { opacity: 1, transform: 'scaleY(1)' },
            { opacity: .72, transform: 'scaleY(.58)', offset: .42 },
            { opacity: 0, transform: 'scaleY(.18)' }
          ],
          {
            duration: 230,
            easing: 'ease-in',
            fill: 'forwards'
          }
        );

        awakeEye.animate(
          [
            { opacity: 0, transform: 'scaleY(.18)' },
            { opacity: 1, transform: 'scaleY(.62)', offset: .5 },
            { opacity: 1, transform: 'scaleY(1.05)', offset: .78 },
            { opacity: 1, transform: 'scaleY(1)' }
          ],
          {
            duration: 350,
            easing: 'cubic-bezier(.2,.9,.2,1)',
            fill: 'forwards'
          }
        );
      }

      scheduleBlink();
    }

    let trackingFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    function updatePupil() {
      trackingFrame = 0;
      if (!awake) return;

      // Convert the page pointer into the SVG's own coordinate system.
      // This avoids browser differences around CSS transforms on SVG circles.
      const screenPoint = svg.createSVGPoint();
      screenPoint.x = pointerX;
      screenPoint.y = pointerY;

      const matrix = svg.getScreenCTM();
      if (!matrix) return;

      const svgPoint = screenPoint.matrixTransform(matrix.inverse());

      const eyeX = 694;
      const eyeY = 327;
      const dx = svgPoint.x - eyeX;
      const dy = svgPoint.y - eyeY;
      const distance = Math.hypot(dx, dy) || 1;

      // r=34 sclera, r=10 pupil. Keep a small safety margin.
      const maxTravel = 20;
      const travel = Math.min(maxTravel, distance);
      const x = eyeX + (dx / distance) * travel;
      const y = eyeY + (dy / distance) * travel;

      // Setting SVG geometry attributes is reliable in Firefox/Chromium/Safari
      // and remains independent of the final rendered 50x60 CSS size.
      pupil.setAttribute('cx', x.toFixed(2));
      pupil.setAttribute('cy', y.toFixed(2));
    }

    function track(event) {
      if (!awake) return;

      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!trackingFrame) {
        trackingFrame = requestAnimationFrame(updatePupil);
      }
    }

    function renderBeakState(state) {
      beakStates.forEach(group => {
        group.setAttribute(
          'display',
          group.dataset.chirpBeakState === state ? 'inline' : 'none'
        );
      });

      // Use the exact working mockup silhouettes, but optically enlarge
      // only while the beak is open so the shape remains legible at 50×60.
      const hingeX = 790;
      const hingeY = 331;
      const scaleMap = {
        closed: 1,
        slight: 1.08,
        medium: 1.14,
        wide: 1.2
      };
      const scale = scaleMap[state] || 1;

      if (scale === 1) {
        beakRoot.removeAttribute('transform');
      } else {
        beakRoot.setAttribute(
          'transform',
          `translate(${hingeX} ${hingeY}) scale(${scale}) translate(${-hingeX} ${-hingeY})`
        );
      }
    }

    function chirpBeak() {
      // This is the exact state-based beak implementation from the full
      // interactive mockup: four individually drawn silhouettes, not a
      // rotated or morphed single beak.
      beakTimers.forEach(clearTimeout);
      beakTimers = [];

      const sequence = [
        ['slight', 0],
        ['medium', 55],
        ['wide', 110],
        ['wide', 220],
        ['medium', 270],
        ['slight', 315],
        ['closed', 355]
      ];

      sequence.forEach(([state, delay]) => {
        beakTimers.push(
          setTimeout(() => renderBeakState(state), delay)
        );
      });
    }

    function burstNotes() {
      const rootRect = root.getBoundingClientRect();
      const point = svg.createSVGPoint();

      // Exact tip of the closed beak in the source SVG.
      point.x = 844;
      point.y = 333;

      const matrix = svg.getScreenCTM();
      if (!matrix) return;

      const screen = point.matrixTransform(matrix);
      const originX = screen.x - rootRect.left;
      const originY = screen.y - rootRect.top;

      ['♪', '♫', '♬', '♪'].forEach((glyph, index) => {
        const note = document.createElement('span');
        note.className = 'chirp-note';
        note.textContent = glyph;
        note.style.left = `${originX}px`;
        note.style.top = `${originY}px`;
        note.style.fontSize = `${9 + Math.random() * 5}px`;
        note.style.setProperty('--dx', `${9 + Math.random() * 15}px`);
        note.style.setProperty('--dy', `${-10 - Math.random() * 18}px`);
        note.style.setProperty('--rot', `${-16 + Math.random() * 32}deg`);
        note.style.setProperty('--delay', `${90 + index * 38}ms`);
        note.addEventListener('animationend', () => note.remove(), { once: true });
        notes.appendChild(note);
      });
    }

    window.addEventListener('pointermove', track, { passive: true });

    root.addEventListener('click', event => {
      // Preserve normal browser behaviour for modified clicks / new-tab actions.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const href = root.getAttribute('href');
      const target = root.getAttribute('target');

      // If this is ever configured to open another browsing context, do not
      // interfere with the browser's native link behaviour.
      if (!href || (target && target !== '_self')) {
        chirpBeak();
        burstNotes();
        return;
      }

      const destination = new URL(href, window.location.href);
      const current = new URL(window.location.href);

      event.preventDefault();

      chirpBeak();
      burstNotes();

      const sameDocument =
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.hash === current.hash;

      // The final note starts at ~204ms and animates for 620ms. Give the whole
      // burst time to complete before following the link.
      window.setTimeout(() => {
        if (sameDocument) {
          window.location.reload();
        } else {
          window.location.assign(destination.href);
        }
      }, 850);
    });

    const instance = { wake };
    instances.push(instance);
    return instance;
  }

  function setupAll() {
    document.querySelectorAll('[data-chirp-logo]').forEach(setup);
  }

  function wakeAll() {
    instances.forEach(instance => instance.wake());
  }

  return { setup, setupAll, wakeAll };
})();

  const install = () => ChirpLogo.setupAll();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }

  const wake = () => {
    const run = () => ChirpLogo.wakeAll();

    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 700 });
    } else {
      setTimeout(run, 120);
    }
  };

  if (document.readyState === 'complete') {
    wake();
  } else {
    window.addEventListener('load', wake, { once: true });
  }
})();
