
/* OHV 공통 네비게이션 불러오기 */

document.addEventListener('DOMContentLoaded', async function () {
  const container = document.getElementById('site-navigation');
  if (!container) return;

  try {
    const response = await fetch('navigation.html');
    if (!response.ok) throw new Error('Navigation load failed');

    container.innerHTML = await response.text();

    const menu = container.querySelector('.nav-work');
    const trigger = menu.querySelector('.work-trigger');

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    }

    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      setOpen(!menu.classList.contains('is-open'));
    });

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      }
    });

    menu.addEventListener('focusout', function (event) {
      if (!menu.contains(event.relatedTarget)) setOpen(false);
    });

  } catch (error) {
    console.error('OHV navigation error:', error);
  }
});
