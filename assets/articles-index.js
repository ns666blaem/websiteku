(() => {
  const browser = document.querySelector('[data-articles-browser]');
  if (!browser) return;

  const search = browser.querySelector('[data-article-search]');
  const buttons = [...browser.querySelectorAll('[data-article-filter]')];
  const cards = [...browser.querySelectorAll('[data-article-card]')];
  const status = browser.querySelector('[data-articles-status]');
  const empty = browser.querySelector('[data-articles-empty]');
  let activeCategory = 'all';

  const normalize = value => value.toLocaleLowerCase('id').trim();
  const update = () => {
    const query = normalize(search.value);
    let visibleCount = 0;
    cards.forEach(card => {
      const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      const matchesQuery = !query || normalize(card.dataset.search).includes(query);
      const isVisible = matchesCategory && matchesQuery;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    status.textContent = query || activeCategory !== 'all'
      ? `Menampilkan ${visibleCount} artikel yang sesuai`
      : `Menampilkan semua ${visibleCount} artikel`;
    empty.hidden = visibleCount !== 0;
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.articleFilter;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      update();
    });
  });
  search.addEventListener('input', update);
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape' && search.value) {
      search.value = '';
      update();
    }
  });
  update();
})();
