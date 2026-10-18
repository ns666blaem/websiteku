(function () {
  'use strict';

  var picker = document.querySelector('[data-language-picker]');
  var trigger = picker && picker.querySelector('.language-picker__trigger');
  var menu = picker && picker.querySelector('.language-picker__menu');
  var label = picker && picker.querySelector('.language-picker__label');
  var googleSelect = null;

  function setOpen(open) {
    if (!picker || !trigger || !menu) return;
    picker.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open) {
      var active = menu.querySelector('[aria-selected="true"]') || menu.querySelector('.language-option');
      if (active) active.focus();
    }
  }

  function setActiveLanguage(value) {
    if (!picker) return;
    picker.querySelectorAll('.language-option').forEach(function (option) {
      var active = option.dataset.lang === value;
      option.setAttribute('aria-selected', String(active));
      if (active && label) label.textContent = option.dataset.label;
    });
  }

  function bindGoogleSelect() {
    var mount = document.getElementById('google_translate_element');
    googleSelect = mount && mount.querySelector('select');
    if (!googleSelect) return false;

    googleSelect.setAttribute('aria-label', 'Pilih bahasa / Select language');
    googleSelect.setAttribute('title', 'Pilih bahasa / Select language');
    setActiveLanguage(googleSelect.value || 'id');
    googleSelect.addEventListener('change', function () {
      setActiveLanguage(googleSelect.value || 'id');
    });
    if (picker) picker.classList.add('is-ready');
    return true;
  }

  if (trigger && menu) {
    trigger.addEventListener('click', function () {
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (event) {
      var option = event.target.closest('.language-option');
      if (!option || !googleSelect) return;
      googleSelect.value = option.dataset.lang;
      googleSelect.dispatchEvent(new Event('change'));
      setActiveLanguage(option.dataset.lang);
      setOpen(false);
      trigger.focus();
    });

    document.addEventListener('click', function (event) {
      if (picker && !picker.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && picker && picker.classList.contains('is-open')) {
        setOpen(false);
        trigger.focus();
      }
    });
  }

  window.googleTranslateElementInit = function () {
    var mount = document.getElementById('google_translate_element');
    if (!mount || !window.google || !google.translate) return;

    new google.translate.TranslateElement({
      pageLanguage: 'id',
      includedLanguages: 'id,en,ms,zh-CN,ja,ko,ar,de,es,fr,nl,pt',
      autoDisplay: false
    }, 'google_translate_element');

    if (!bindGoogleSelect()) {
      var observer = new MutationObserver(function () {
        if (bindGoogleSelect()) observer.disconnect();
      });
      observer.observe(mount, { childList: true, subtree: true });
    }
  };

  var script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  script.onerror = function () {
    if (picker) picker.hidden = true;
  };
  document.head.appendChild(script);
}());
