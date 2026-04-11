/* ============================================
   Romantic Flower - Mobile Wedding Invitation
   script.js
   ============================================ */

(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function padZero(n) {
    return String(n).padStart(2, '0');
  }

  /* ── Image Auto-Detection ── */
  let galleryImages = [];
  let storyImagesData = [];
  let viewerImages = [];

  // [속도 개선] 기존: 1번→2번→3번 순차 탐색 (27장이면 27번 왕복 대기)
  // 변경: 1~50번을 한꺼번에 병렬 요청 → 결과를 번호 순서대로 정렬
  // 연속 3번 실패 로직 대신, 모든 요청을 동시에 보내고 성공한 것만 추려냄
  function loadImagesFromFolder(folder, maxAttempts = 50) {
    const promises = [];
    for (let i = 1; i <= maxAttempts; i++) {
      const path = `images/${folder}/${i}.jpg`;
      const index = i;
      promises.push(
        new Promise(resolve => {
          const img = new Image();
          img.onload = () => resolve({ index, path });
          img.onerror = () => resolve(null);
          img.src = path;
        })
      );
    }
    return Promise.all(promises).then(results =>
      results
        .filter(Boolean)
        .sort((a, b) => a.index - b.index)
        .map(r => r.path)
    );
  }

  /* ── Meta Tags ── */
  function initMeta() {
    document.title = CONFIG.meta.title;
    const pt = $('#page-title');
    if (pt) pt.textContent = CONFIG.meta.title;
  }

  /* ── Curtain ── */
  function initCurtain() {
    const curtain = $('#curtain');

    if (CONFIG.useCurtain === false) {
      if (curtain) {
        curtain.style.display = 'none';
      }
      initPetals();
      return;
    }

    const names = $('#curtain-names');
    const btn = $('#curtain-open');

    if (names) {
      names.textContent =
        CONFIG.groom.fullName + ' & ' + CONFIG.bride.fullName;
    }

    if (btn) {
      btn.addEventListener('click', () => {
        curtain.classList.add('is-open');
        document.body.style.overflow = '';
        setTimeout(() => curtain.classList.add('is-hidden'), 1400);
        initPetals();
      });
    }

    document.body.style.overflow = 'hidden';
  }

  /* ── Hero ── */
  function initHero() {
    const img = $('#hero-img');
    if (img) img.src = 'images/hero/1.jpg';

    const names = $('#hero-names');
    if (names) {
      names.innerHTML =
        CONFIG.groom.fullName +
        ' <span class="ampersand">&amp;</span> ' +
        CONFIG.bride.fullName;
    }

    const w = CONFIG.wedding;
    const [y, m, d] = w.date.split('-');
    const [hh, mm] = w.time.split(':');
    const ampm = +hh < 12 ? '오전' : '오후';
    const h12 = +hh % 12 || 12;

    const dateEl = $('#hero-date');
    if (dateEl) {
      dateEl.textContent = `${y}년 ${+m}월 ${+d}일 ${w.dayOfWeek} ${ampm} ${h12}시${+mm ? ' ' + +mm + '분' : ''}`;
    }

    const venue = $('#hero-venue');
    if (venue) venue.textContent = w.venue;
  }

  /* ── Countdown ── */
  function initCountdown() {
    const w = CONFIG.wedding;
    const [y, m, d] = w.date.split('-');
    const [hh, mm] = w.time.split(':');
    const target = new Date(+y, +m - 1, +d, +hh, +mm, 0).getTime();

    function update() {
      const now = Date.now();
      let diff = target - now;
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const dEl = $('#cd-days');
      const hEl = $('#cd-hours');
      const mEl = $('#cd-minutes');
      const sEl = $('#cd-seconds');

      if (dEl) dEl.textContent = days;
      if (hEl) hEl.textContent = padZero(hours);
      if (mEl) mEl.textContent = padZero(minutes);
      if (sEl) sEl.textContent = padZero(seconds);
    }

    update();
    setInterval(update, 1000);
  }

  /* ── Greeting ── */
  function initGreeting() {
    const title = $('#greeting-title');
    const text = $('#greeting-text');
    const parents = $('#greeting-parents');

    if (title) title.textContent = CONFIG.greeting.title || '';
    if (text) text.textContent = CONFIG.greeting.content;

    if (parents) {
      const g = CONFIG.groom;
      const b = CONFIG.bride;

      const makeName = (cfg, isDeceased) => {
        return isDeceased
          ? `<span class="deceased">${cfg}</span>`
          : cfg;
      };

      parents.innerHTML = `
        <span class="parent-line">
          ${makeName(g.father, g.fatherDeceased)} &middot; ${makeName(g.mother, g.motherDeceased)}
          <em>의 아들</em> <strong>${g.name}</strong>
        </span>
        <span class="parent-dot">&amp;</span>
        <span class="parent-line">
          ${makeName(b.father, b.fatherDeceased)} &middot; ${makeName(b.mother, b.motherDeceased)}
          <em>의 딸</em> <strong>${b.name}</strong>
        </span>
      `;
    }
  }

  /* ── Calendar ── */
  function initCalendar() {
    const el = $('#calendar');
    if (!el) return;

    const [y, m, d] = CONFIG.wedding.date.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0).getDate();
    const startDow = first.getDay();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    let html = `<div class="calendar__header">${monthNames[m - 1]} ${y}</div>`;
    html += '<div class="calendar__weekdays">';
    ['일', '월', '화', '수', '목', '금', '토'].forEach((wd) => {
      html += `<span class="calendar__weekday">${wd}</span>`;
    });
    html += '</div><div class="calendar__days">';

    for (let i = 0; i < startDow; i++) {
      html += '<span class="calendar__day is-empty"></span>';
    }

    for (let day = 1; day <= lastDay; day++) {
      const cls = day === d ? ' is-today' : '';
      html += `<span class="calendar__day${cls}">${day}</span>`;
    }

    html += '</div>';
    el.innerHTML = html;

    const gBtn = $('#btn-google-cal');
    if (gBtn) {
      gBtn.addEventListener('click', () => {
        const w = CONFIG.wedding;
        const [yy, mm2, dd] = w.date.split('-');
        const [th, tm] = w.time.split(':');
        const start = `${yy}${mm2}${dd}T${th}${tm}00`;
        const endH = padZero(+th + 2);
        const end = `${yy}${mm2}${dd}T${endH}${tm}00`;
        const url =
          `https://calendar.google.com/calendar/render?action=TEMPLATE` +
          `&text=${encodeURIComponent(CONFIG.meta.title)}` +
          `&dates=${start}/${end}` +
          `&location=${encodeURIComponent(w.venue + ' ' + w.address)}` +
          `&details=${encodeURIComponent(CONFIG.meta.description)}`;
        window.open(url, '_blank');
      });
    }

    const iBtn = $('#btn-ics-cal');
    if (iBtn) {
      iBtn.addEventListener('click', () => {
        const w = CONFIG.wedding;
        const [yy, mm2, dd] = w.date.split('-');
        const [th, tm] = w.time.split(':');
        const start = `${yy}${mm2}${dd}T${th}${tm}00`;
        const endH = padZero(+th + 2);
        const end = `${yy}${mm2}${dd}T${endH}${tm}00`;
        const ics = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//WeddingInvitation//EN',
          'BEGIN:VEVENT',
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `SUMMARY:${CONFIG.meta.title}`,
          `LOCATION:${w.venue} ${w.address}`,
          `DESCRIPTION:${CONFIG.meta.description}`,
          'END:VEVENT',
          'END:VCALENDAR',
        ].join('\r\n');

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'wedding.ics';
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }
  }

  /* ── Story ── */
  async function initStory() {
    const title = $('#story-title');
    const text = $('#story-text');
    const container = $('#story-images');
    const section = $('#story');

    if (title) title.textContent = CONFIG.story.title || '';
    if (text) text.textContent = CONFIG.story.content || '';

    if (!container) return;

    const hasStoryText =
      Boolean(CONFIG.story?.title?.trim()) || Boolean(CONFIG.story?.content?.trim());

    container.innerHTML =
      '<div class="section-loading"><span class="section-loading__dot"></span><span class="section-loading__dot"></span><span class="section-loading__dot"></span></div>';

    storyImagesData = await loadImagesFromFolder('story');

    if (!hasStoryText && storyImagesData.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    if (storyImagesData.length > 0) {
      container.innerHTML = storyImagesData
        .map(
          (src, i) => `
          <div class="story__img-card anim-scale-target" data-index="${i}">
            <img src="${src}" alt="우리의 이야기 ${i + 1}" loading="lazy" />
          </div>
          `
        )
        .join('');

      container.addEventListener('click', (e) => {
        const item = e.target.closest('.story__img-card');
        if (item) {
          viewerImages = storyImagesData;
          openViewer(+item.dataset.index);
        }
      });

      observeNewElements(container);
    } else {
      container.innerHTML = '';
    }
  }

  /* ── Gallery ── */
  async function initGallery() {
    const grid = $('#gallery-grid');
    const section = $('#gallery');
    if (!grid) return;

    grid.innerHTML = '<div class="section-loading"><span class="section-loading__dot"></span><span class="section-loading__dot"></span><span class="section-loading__dot"></span></div>';

    galleryImages = await loadImagesFromFolder('gallery');

    if (galleryImages.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    grid.innerHTML = galleryImages
      .map(
        (src, i) => `
      <div class="gallery__item" data-index="${i}">
        <img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy" />
      </div>
    `
      )
      .join('');

    grid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery__item');
      if (item) {
        viewerImages = galleryImages;
        openViewer(+item.dataset.index);
      }
    });

    observeNewElements(grid);
  }

  /* ── Photo Viewer ── */
  /*
   * [버그 수정] 핵심 문제:
   * 기존 코드는 track에 transform: translateX(-N*100%)를 적용했는데,
   * track의 width가 뷰어 전체 width와 같아서 각 slide의 min-width:100%가
   * track 기준으로 계산되어 슬라이드 간 이동이 제대로 동작하지 않았음.
   * → 각 slide를 절대 위치(position:absolute)로 배치하고
   *   window.innerWidth를 기준으로 픽셀 단위 translate 적용으로 수정.
   */
  let viewerIdx = 0;
  let touchStartX = 0;
  let touchDeltaX = 0;
  let isSwiping = false;

  function buildViewerSlides() {
    const track = $('#viewer-track');
    if (!track) return;

    // track을 relative 컨테이너로 설정
    track.style.position = 'relative';
    track.style.width = '100%';
    track.style.height = '100%';

    track.innerHTML = viewerImages
      .map(
        (src, i) => `
      <div class="viewer__slide" data-slide="${i}" style="
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 16px;
        transform: translateX(${i * 100}vw);
        will-change: transform;
      ">
        <img src="${src}" alt="" loading="lazy" style="
          max-width: 100%;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 4px;
          user-select: none;
          -webkit-user-drag: none;
          display: block;
        " />
      </div>
    `
      )
      .join('');
  }

  function openViewer(index) {
    viewerIdx = index;
    const viewer = $('#viewer');
    if (!viewer || viewerImages.length === 0) return;

    buildViewerSlides();

    viewer.classList.add('is-active');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    goToSlide(viewerIdx, false);
  }

  function closeViewer() {
    const viewer = $('#viewer');
    if (!viewer) return;
    // aria-hidden 경고 방지: 닫기 전에 포커스를 viewer 바깥으로 이동
    document.body.focus();
    viewer.classList.remove('is-active');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function goToSlide(idx, animate = true) {
    const track = $('#viewer-track');
    const counter = $('#viewer-counter');
    const total = viewerImages.length;
    if (total === 0 || !track) return;

    if (idx < 0) idx = 0;
    if (idx >= total) idx = total - 1;
    viewerIdx = idx;

    // 각 슬라이드를 개별적으로 이동
    const slides = track.querySelectorAll('.viewer__slide');
    slides.forEach((slide, i) => {
      slide.style.transition = animate ? 'transform 0.3s ease' : 'none';
      slide.style.transform = `translateX(${(i - idx) * 100}vw)`;
    });

    if (counter) {
      counter.textContent = `${idx + 1} / ${total}`;
    }
  }

  function initViewer() {
    const viewer = $('#viewer');
    if (!viewer) return;

    $('#viewer-close')?.addEventListener('click', closeViewer);
    viewer.querySelector('.viewer__backdrop')?.addEventListener('click', closeViewer);
    $('#viewer-prev')?.addEventListener('click', () => goToSlide(viewerIdx - 1));
    $('#viewer-next')?.addEventListener('click', () => goToSlide(viewerIdx + 1));

    document.addEventListener('keydown', (e) => {
      if (!viewer.classList.contains('is-active')) return;
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowLeft') goToSlide(viewerIdx - 1);
      if (e.key === 'ArrowRight') goToSlide(viewerIdx + 1);
    });

    const track = $('#viewer-track');
    if (!track) return;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
      isSwiping = true;
      // 터치 중에는 transition 제거
      const slides = track.querySelectorAll('.viewer__slide');
      slides.forEach(s => s.style.transition = 'none');
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
      const slides = track.querySelectorAll('.viewer__slide');
      slides.forEach((slide, i) => {
        const baseOffset = (i - viewerIdx) * window.innerWidth;
        slide.style.transform = `translateX(${baseOffset + touchDeltaX}px)`;
      });
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;
      const threshold = window.innerWidth * 0.2;
      if (touchDeltaX < -threshold) {
        goToSlide(viewerIdx + 1);
      } else if (touchDeltaX > threshold) {
        goToSlide(viewerIdx - 1);
      } else {
        goToSlide(viewerIdx);
      }
    });
  }

  /* ── Location ── */
  function initLocation() {
    const w = CONFIG.wedding;
    const venue = $('#loc-venue');
    const hall = $('#loc-hall');
    const addr = $('#loc-address');
    const tel = $('#loc-tel');
    const mapImg = $('#loc-map-img');

    if (venue) venue.textContent = w.venue;
    if (hall) hall.textContent = w.hall;
    if (addr) addr.textContent = w.address;

    if (tel) {
      if (w.tel) {
        tel.textContent = `Tel. ${w.tel}`;
        tel.style.display = '';
      } else {
        tel.style.display = 'none';
      }
    }

    if (mapImg) mapImg.src = 'images/location/1.jpg';

    const kakao = $('#btn-kakao-map');
    const naver = $('#btn-naver-map');
    if (kakao) kakao.href = w.mapLinks.kakao;
    if (naver) naver.href = w.mapLinks.naver;

    const copyBtn = $('#btn-copy-address');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyToClipboard(w.address, '주소가 복사되었습니다');
      });
    }
  }

  /* ── Account ── */
  function initAccount() {
    const groomBody = $('#acc-groom-body');
    const brideBody = $('#acc-bride-body');

    if (groomBody) {
      groomBody.innerHTML = renderAccounts(CONFIG.accounts.groom);
    }
    if (brideBody) {
      brideBody.innerHTML = renderAccounts(CONFIG.accounts.bride);
    }

    $$('.accordion__toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const acc = btn.closest('.accordion');
        acc.classList.toggle('is-open');
      });
    });

    document.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.account-item__copy');
      if (copyBtn) {
        const account = copyBtn.dataset.account;
        copyToClipboard(account, '계좌번호가 복사되었습니다');
      }
    });
  }

  function renderAccounts(accounts) {
    return accounts
      .map(
        (acc) => `
      <div class="account-item">
        <div class="account-item__info">
          <p class="account-item__role">${acc.role}</p>
          <p class="account-item__detail">
            <span class="account-item__name">${acc.name}</span>
            ${acc.bank} ${acc.number}
          </p>
        </div>
        <button class="account-item__copy" data-account="${acc.bank} ${acc.number} ${acc.name}">복사</button>
      </div>
    `
      )
      .join('');
  }

  /* ── Toast ── */
  let toastTimer = null;

  function showToast(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  /* ── Clipboard ── */
  function copyToClipboard(text, toastMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(toastMsg);
      }).catch(() => {
        fallbackCopy(text, toastMsg);
      });
    } else {
      fallbackCopy(text, toastMsg);
    }
  }

  function fallbackCopy(text, toastMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(toastMsg);
    } catch (e) {
      showToast('복사에 실패했습니다');
    }
    document.body.removeChild(ta);
  }

  /* ── Scroll Animations ── */
  let scrollObserver = null;

  function initScrollAnimations() {
    // [버그 수정] 갤러리/스토리 로딩 완료 후에 호출되므로 타이밍 문제 없음
    const targets = $$('.anim-target, .gallery__item, .story__img-card');
    if (!targets.length) return;

    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            scrollObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => scrollObserver.observe(el));
  }

  function observeNewElements(container) {
    if (!scrollObserver) return;
    const targets = $$('.gallery__item, .story__img-card', container);
    targets.forEach((el) => scrollObserver.observe(el));
  }

  /* ── Falling Petals ── */
  function initPetals() {
    const canvas = $('#petals-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    const petals = [];
    const PETAL_COUNT = 25;

    const petalColors = [
      'rgba(183, 110, 121, 0.5)',
      'rgba(212, 160, 168, 0.45)',
      'rgba(245, 190, 195, 0.4)',
      'rgba(240, 180, 170, 0.35)',
      'rgba(200, 140, 150, 0.4)',
    ];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createPetal() {
      return {
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.3,
        size: 6 + Math.random() * 10,
        speedY: 0.4 + Math.random() * 0.8,
        speedX: -0.3 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        opacity: 0.3 + Math.random() * 0.4,
      };
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.3, -s * 0.4, s * 0.8, -s * 0.3, s * 0.5, 0);
      ctx.bezierCurveTo(s * 0.8, s * 0.3, s * 0.3, s * 0.4, 0, 0);
      ctx.fill();

      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      petals.forEach((p) => {
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.5;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
        }
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;

        drawPetal(p);
      });
      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push(createPetal());
    }
    animate();
  }

  /* ── Kakao Share ── */
  function initKakaoShare() {
    const btn = $('#btn-kakao-share');
    const share = CONFIG.kakaoShare;

    if (!btn) {
      console.warn('[KakaoShare] 버튼을 찾지 못했습니다.');
      return;
    }

    if (!share || !share.appKey) {
      console.warn('[KakaoShare] kakaoShare 설정 또는 appKey가 없습니다.');
      return;
    }

    btn.addEventListener('click', () => {
      try {
        if (typeof Kakao === 'undefined') {
          alert('카카오 SDK가 아직 로드되지 않았습니다.');
          return;
        }

        if (!Kakao.isInitialized()) {
          Kakao.init(share.appKey);
        }

        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: share.title,
            description: share.description,
            imageUrl: share.imageUrl,
            link: {
              mobileWebUrl: share.webUrl,
              webUrl: share.webUrl,
            },
          },
          buttons: [
            {
              title: '청첩장 보기',
              link: {
                mobileWebUrl: share.webUrl,
                webUrl: share.webUrl,
              },
            },
          ],
        });
      } catch (error) {
        console.error('[KakaoShare] 공유 실패:', error);
        alert('카카오톡 공유 실행 중 문제가 발생했습니다. 도메인 설정과 링크 설정을 확인해주세요.');
      }
    });
  }

  /* ── Init ── */
  async function init() {
    initMeta();
    initCurtain();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();
    initViewer();
    initLocation();
    initAccount();
    initKakaoShare();

    // [버그 수정] 갤러리·스토리 로딩이 완전히 끝난 후 스크롤 애니메이션 초기화
    // 기존: setTimeout(initScrollAnimations, 200) — 로딩 완료 전에 실행될 수 있어 버그
    await Promise.all([
      initStory(),
      initGallery(),
    ]);

    // 모든 이미지 로딩 완료 후 애니메이션 관찰 시작
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();