document.getElementById('year').textContent = new Date().getFullYear();

  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12});
    revealEls.forEach(el=>io.observe(el));
  } else {
    revealEls.forEach(el=>el.classList.add('in'));
  }

  // accessible mobile navigation
  const navHeader = document.querySelector('header.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('primary-nav');
  const navMore = navLinks.querySelector('.nav-more');
  const navMoreToggle = navLinks.querySelector('.nav-more-toggle');
  const setMoreMenu = (open) => {
    navMore.classList.toggle('is-open', open);
    navMoreToggle.setAttribute('aria-expanded', String(open));
  };
  const setMenu = (open) => {
    navHeader.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    if (!open) setMoreMenu(false);
  };
  navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  navMoreToggle.addEventListener('click', () => setMoreMenu(navMoreToggle.getAttribute('aria-expanded') !== 'true'));
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      navToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!navHeader.contains(event.target)) setMenu(false);
    else if (!navMore.contains(event.target)) setMoreMenu(false);
  });

  // highlight the section currently being read
  const sectionLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
  const sectionMap = new Map(sectionLinks.map(link => [link.getAttribute('href').slice(1), link]));
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach(link => link.removeAttribute('aria-current'));
      const activeLink = sectionMap.get(visible.target.id);
      activeLink?.setAttribute('aria-current', 'true');
      if (activeLink?.closest('.nav-more-menu')) navMoreToggle.setAttribute('aria-current', 'true');
      else navMoreToggle.removeAttribute('aria-current');
    }, {rootMargin:'-24% 0px -64% 0px', threshold:[0, .25, .6]});
    document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
  }

  // show a quick return control after the visitor has scrolled beyond the opening content
  const backToTop = document.querySelector('.back-to-top');
  const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > Math.max(620, window.innerHeight * .8));
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, {passive:true});
  backToTop.addEventListener('click', event => {
    event.preventDefault();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top:0, behavior:reducedMotion ? 'auto' : 'smooth'});
    document.querySelector('.logo').focus({preventScroll:true});
  });

  // filter the portfolio by category without removing content for visitors without JavaScript
  const portfolioFilter = document.querySelector('[data-portfolio-filter-group]');
  if (portfolioFilter) {
    const filterButtons = [...portfolioFilter.querySelectorAll('[data-portfolio-filter]')];
    const portfolioGroups = [...document.querySelectorAll('[data-portfolio-category]')];
    const filterStatus = portfolioFilter.querySelector('[data-portfolio-filter-status]');

    const applyPortfolioFilter = (category, label) => {
      let visibleCards = 0;
      portfolioGroups.forEach(group => {
        const isVisible = category === 'all' || group.dataset.portfolioCategory === category;
        group.hidden = !isVisible;
        if (isVisible) visibleCards += group.querySelectorAll('.pcard').length;
      });
      filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.portfolioFilter === category)));
      filterStatus.textContent = category === 'all'
        ? `Menampilkan seluruh portfolio, ${visibleCards} karya`
        : `Menampilkan ${visibleCards} karya dalam kategori ${label}`;
    };

    filterButtons.forEach(button => {
      button.addEventListener('click', () => applyPortfolioFilter(button.dataset.portfolioFilter, button.textContent.trim()));
    });
    applyPortfolioFilter('all', 'Semua');
  }
