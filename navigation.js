
/* =====================================
   OHV 공통 네비게이션

   index.html, about.html, services.html 등
   일반 페이지와

   projects/marketing-01.html 등
   하위 폴더 페이지에서 공통으로 사용합니다.
===================================== */

document.addEventListener('DOMContentLoaded', async function () {

  /* 네비게이션을 넣을 영역 */
  const container = document.getElementById('site-navigation');
  if (!container) return;

  try {

    /* =====================================
       01. 저장소 최상위 경로 설정

       현재 OHV GitHub Pages 주소 기준:
       /ohv.agency/

       하위 폴더에서도 같은 navigation.html을
       찾을 수 있도록 절대 경로를 사용합니다.
    ===================================== */

    const basePath = '/ohv.agency/';

    const response = await fetch(basePath + 'navigation.html');

    if (!response.ok) {
      throw new Error('Navigation load failed');
    }

    /* 네비게이션 HTML 삽입 */
    container.innerHTML = await response.text();


    /* =====================================
       02. 네비게이션 링크 경로 보정

       navigation.html에 있는 상대 경로 링크를
       저장소 최상위 경로 기준으로 바꿉니다.

       예: index.html
       → /ohv.agency/index.html

       상세 페이지에서도 올바르게 이동합니다.
    ===================================== */

    container.querySelectorAll('a[href]').forEach(link => {

      const href = link.getAttribute('href');

      /* 외부 링크, #링크, 절대 경로는 변경하지 않습니다 */
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('/') ||
        /^[a-z][a-z0-9+.-]*:/i.test(href)
      ) {
        return;
      }

      link.setAttribute('href', basePath + href.replace(/^\.\//, ''));

    });


    /* =====================================
       03. WORK 드롭다운 기능

       기존 코드 그대로 유지
    ===================================== */

    const menu = container.querySelector('.nav-work');
    const trigger = menu?.querySelector('.work-trigger');

    if (!menu || !trigger) return;

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    }

    /* WORK 버튼 클릭 */
    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      setOpen(!menu.classList.contains('is-open'));
    });

    /* 메뉴 밖 클릭 시 닫기 */
    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) {
        setOpen(false);
      }
    });

    /* ESC 키 누르면 닫기 */
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      }
    });

    /* 키보드 포커스가 메뉴 밖으로 나가면 닫기 */
    menu.addEventListener('focusout', function (event) {
      if (!menu.contains(event.relatedTarget)) {
        setOpen(false);
      }
    });

  } catch (error) {
    console.error('OHV navigation error:', error);
  }

});
