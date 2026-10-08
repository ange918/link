// Tokens du motion design. Les durées sont en secondes pour GSAP.
// Les révélations au scroll sont scrubbées (pas de délai résiduel) :
// les durées ci-dessous servent aux gestes hors scrub (hero, voile, compteur, soufflante).
export const motion = {
  dur: { xs: 0.16, press: 0.12, s: 0.28, m: 0.52, l: 0.9, veil: 0.7, spin: 1.2, fade: 0.15 },
  ease: {
    out: 'expo.out',
    in: 'expo.in',
    inOut: 'expo.inOut',
    linear: 'none',
    dock: 'back.out(1.2)',
  },
  stagger: 0.055,
  staggerCall: 0.07,
  mobile() {
    return window.matchMedia('(max-width: 759px), (pointer: coarse)').matches;
  },
  // Pas de blur sur tactile ou petit écran : le filtre est cher et peu lisible.
  blurOK() {
    return !this.mobile();
  },
  y(px) {
    return this.mobile() ? px * 0.5 : px;
  },
};
