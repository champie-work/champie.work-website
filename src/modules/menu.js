// Menu-balk onderaan in het midden: geel logo-vak + Menu-knop.
// Wordt door het script zelf op de pagina gezet. Het menu-ontwerp zelf volgt later:
// bij openen krijgt <html> de class "menu-open".

const ICON = '<svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true"><path d="M0 0H18V2H0V0ZM0 6H13V8H0V6ZM0 12H8V14H0V12Z" fill="#0E0E10"/></svg>';

export function initMenu() {
  const nav = document.createElement('nav');
  nav.className = 'cmenu';
  nav.setAttribute('aria-label', 'Menu');
  nav.innerHTML = `<div class="cmenu_logo" aria-hidden="true"></div>
    <button class="cmenu_btn" type="button" aria-expanded="false">${ICON}<span>Menu</span></button>`;
  document.body.appendChild(nav);

  const box = nav.querySelector('.cmenu_logo');
  const btn = nav.querySelector('.cmenu_btn');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open);
  });

  return {
    el: nav,
    setVisible(on) { nav.classList.toggle('is-on', on); },
    // Midden van het gele logo-vak, zonder de pop-animatie meegerekend
    boxCenter() {
      return { x: nav.offsetLeft + box.offsetLeft + box.offsetWidth / 2,
               y: nav.offsetTop + box.offsetTop + box.offsetHeight / 2 };
    },
  };
}
