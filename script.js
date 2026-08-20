/* =========================================================
   Камилла · маникюр в Альметьевске — интерактив
   ========================================================= */
(function () {
  'use strict';

  var PHONE_DIGITS = '79196226009';           // WhatsApp / звонок
  var TELEGRAM = 'https://t.me/sweetie_78045';

  /* Если захотите получать заявки на почту без мессенджера —
     зарегистрируйте бесплатную форму на formspree.io и вставьте адрес сюда.
     Пример: var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxx';         */
  var FORM_ENDPOINT = '';

  // анимация появления включается только если JS работает
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------
     Год в подвале
     --------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Шапка: фон при скролле
     --------------------------------------------------------- */
  var header = document.getElementById('header');
  var onScroll = function () {
    if (window.scrollY > 30) header.classList.add('is-stuck');
    else header.classList.remove('is-stuck');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------------------------------------------------
     Мобильное меню
     --------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeMenu() {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  /* ---------------------------------------------------------
     Плавное появление блоков
     --------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealables.forEach(function (el) { io.observe(el); });

    // страховка: если наблюдатель почему-то не сработал — показываем всё
    setTimeout(function () {
      if (!document.querySelector('.reveal.is-visible')) {
        revealables.forEach(function (el) { el.classList.add('is-visible'); });
      }
    }, 2500);
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Галерея + лайтбокс
     --------------------------------------------------------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var current = 0;

  function showSlide(i) {
    current = (i + items.length) % items.length;
    var item = items[current];
    lbImg.src = item.getAttribute('data-src');
    lbImg.alt = item.getAttribute('data-caption') || 'Работа мастера';
    lbCaption.textContent = item.getAttribute('data-caption') || '';
  }

  function openLightbox(i) {
    showSlide(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () { openLightbox(i); });
  });

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', function (e) {
    e.stopPropagation(); showSlide(current - 1);
  });
  document.getElementById('lbNext').addEventListener('click', function (e) {
    e.stopPropagation(); showSlide(current + 1);
  });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lightbox__frame')) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showSlide(current - 1);
    if (e.key === 'ArrowRight') showSlide(current + 1);
  });

  // свайпы на телефоне
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showSlide(current + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  /* ---------------------------------------------------------
     FAQ: открыт только один пункт
     --------------------------------------------------------- */
  var accItems = document.querySelectorAll('.acc__item');
  accItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      accItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------------------------------------------------------
     Форма записи
     --------------------------------------------------------- */
  var form = document.getElementById('bookingForm');
  var phoneInput = document.getElementById('fPhone');
  var dateInput = document.getElementById('fDate');
  var success = document.getElementById('formSuccess');
  var successText = document.getElementById('successText');
  var submitBtn = document.getElementById('submitBtn');

  // дату раньше сегодняшней выбрать нельзя
  if (dateInput) {
    var today = new Date();
    var iso = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    dateInput.min = iso;
  }

  // маска телефона +7 (___) ___-__-__
  function formatPhone(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    var out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 8) out += '-' + digits.slice(7, 9);
    if (digits.length >= 10) out += '-' + digits.slice(9, 11);
    return out;
  }

  phoneInput.addEventListener('focus', function () {
    if (!phoneInput.value) phoneInput.value = '+7 (';
  });
  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);
  });
  phoneInput.addEventListener('blur', function () {
    if (phoneInput.value.replace(/\D/g, '').length < 2) phoneInput.value = '';
  });

  function setError(input, message) {
    var field = input.closest('.field');
    var box = field.querySelector('.field__error');
    field.classList.toggle('is-error', !!message);
    if (box) box.textContent = message || '';
  }

  function validate() {
    var ok = true;
    var name = document.getElementById('fName');
    if (name.value.trim().length < 2) {
      setError(name, 'Напишите, как к вам обращаться');
      ok = false;
    } else setError(name, '');

    if (phoneInput.value.replace(/\D/g, '').length !== 11) {
      setError(phoneInput, 'Введите номер полностью');
      ok = false;
    } else setError(phoneInput, '');

    return ok;
  }

  function buildMessage() {
    var name = document.getElementById('fName').value.trim();
    var phone = phoneInput.value.trim();
    var service = document.getElementById('fService').value;
    var date = dateInput.value;
    var comment = document.getElementById('fComment').value.trim();

    var lines = [
      'Здравствуйте, Камилла! Хочу записаться на маникюр.',
      '',
      'Имя: ' + name,
      'Телефон: ' + phone,
      'Услуга: ' + service
    ];
    if (date) {
      var d = date.split('-');
      lines.push('Желаемая дата: ' + d[2] + '.' + d[1] + '.' + d[0]);
    }
    if (comment) lines.push('Комментарий: ' + comment);
    lines.push('', '(заявка с сайта)');
    return lines.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!document.getElementById('fAgree').checked) {
      alert('Отметьте согласие на обработку персональных данных.');
      return;
    }
    if (!validate()) {
      var firstError = form.querySelector('.field.is-error input');
      if (firstError) firstError.focus();
      return;
    }

    var message = buildMessage();

    // локальная копия заявки (на случай, если чат не открылся)
    try {
      var saved = JSON.parse(localStorage.getItem('kamilla_requests') || '[]');
      saved.push({ at: new Date().toISOString(), text: message });
      localStorage.setItem('kamilla_requests', JSON.stringify(saved.slice(-20)));
    } catch (err) { /* не критично */ }

    // текст в буфер обмена — удобно вставить в Telegram
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).catch(function () {});
    }

    // отправка на почту, если подключён FORM_ENDPOINT
    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message: message })
      }).catch(function () {});
    }

    submitBtn.textContent = 'Открываю чат…';

    var waUrl = 'https://wa.me/' + PHONE_DIGITS + '?text=' + encodeURIComponent(message);
    var win = window.open(waUrl, '_blank');

    successText.textContent = win
      ? 'Заявка уже вставлена в чат WhatsApp — осталось нажать «Отправить». Текст также скопирован в буфер обмена: его можно вставить в Telegram.'
      : 'Текст заявки скопирован в буфер обмена. Отправьте его в Telegram или позвоните — я отвечу и подтвержу время.';

    success.hidden = false;
    submitBtn.textContent = 'Отправить заявку';
  });

  document.getElementById('resetForm').addEventListener('click', function () {
    form.reset();
    success.hidden = true;
    form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('is-error'); });
    form.querySelectorAll('.field__error').forEach(function (f) { f.textContent = ''; });
    document.getElementById('fAgree').checked = true;
  });

  var successTg = document.getElementById('successTg');
  if (successTg) successTg.href = TELEGRAM;
})();
