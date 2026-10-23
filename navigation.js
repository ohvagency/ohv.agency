
/* OHV - WORK DROPDOWN */

document.addEventListener('DOMContentLoaded', function () {
  const menu = document.querySelector('.nav-work');
  if (!menu) return;

  const trigger = menu.querySelector('.work-trigger');
  const dropdown = menu.querySelector('.work-dropdown');

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  }

  trigger.addEventListener('click', function (event) {
    event.stopPropagation();

    const isOpen = menu.classList.contains('is-open');
    setOpen(!isOpen);
  });

  document.addEventListener('click', function (event) {
    if (!menu.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setOpen(false);
      trigger.focus();
    }
  });

  menu.addEventListener('focusout', function (event) {
    if (!menu.contains(event.relatedTarget)) {
      setOpen(false);
    }
  });

  menu.addEventListener('mouseenter', function () {
    if (window.matchMedia('(hover: hover)').matches) {
      trigger.setAttribute('aria-expanded', 'true');
    }
  });

  menu.addEventListener('mouseleave', function () {
    if (window.matchMedia('(hover: hover)').matches &&
        !menu.classList.contains('is-open')) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
});
