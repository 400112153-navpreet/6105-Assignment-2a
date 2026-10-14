/* Urban Bloom Florist – alpha prototype JavaScript
   Features: 1) mobile navigation toggle  2) product/occasion filter
             3) FAQ accordion  4) enquiry form validation and prefill */
(function () {
  'use strict';

  // 1. Mobile navigation toggle
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('site-nav');
  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var open = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // 2. Product filter by occasion
  var filterBar = document.querySelector('.filter-bar');
  var cards = document.querySelectorAll('[data-occasions]');
  if (filterBar && cards.length) {
    var buttons = filterBar.querySelectorAll('.filter-btn');
    var count = document.getElementById('result-count');
    var empty = document.getElementById('empty-note');

    var applyFilter = function (value) {
      var shown = 0;
      cards.forEach(function (card) {
        var tags = card.getAttribute('data-occasions').split(' ');
        var match = value === 'all' || tags.indexOf(value) !== -1;
        card.hidden = !match;
        if (match) { shown++; }
      });
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === value));
      });
      if (count) { count.textContent = 'Showing ' + shown + ' of ' + cards.length + ' arrangements'; }
      if (empty) { empty.hidden = shown !== 0; }
    };

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); });
    });

    // Allow links such as products.html?occasion=birthday
    var wanted = new URLSearchParams(window.location.search).get('occasion');
    var valid = Array.prototype.some.call(buttons, function (b) { return b.getAttribute('data-filter') === wanted; });
    applyFilter(valid ? wanted : 'all');
  }

  // 3. FAQ accordion
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = expanded;
    });
  });

  // 4. Enquiry form: validation, prefill and confirmation (no server in this prototype)
  var form = document.getElementById('enquiry-form');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var product = params.get('product');
    var type = params.get('type');
    if (type && form.elements.enquiryType) { form.elements.enquiryType.value = type; }
    if (product && form.elements.message && !form.elements.message.value) {
      form.elements.message.value = 'I would like to know more about: ' + product + '.';
    }

    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, such as name@example.com.'; },
      phone: function (v) { return v.trim() === '' || /^[0-9 +()-]{7,16}$/.test(v.trim()) ? '' : 'Enter a phone number using digits only, or leave it blank.'; },
      enquiryType: function (v) { return v ? '' : 'Choose what your enquiry is about.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Tell us a little more (at least 10 characters).'; }
    };

    var check = function (field) {
      var wrap = field.closest('.field');
      var msg = rules[field.name](field.value);
      wrap.classList.toggle('invalid', msg !== '');
      field.setAttribute('aria-invalid', String(msg !== ''));
      wrap.querySelector('.error').textContent = msg;
      return msg === '';
    };

    Object.keys(rules).forEach(function (name) {
      var f = form.elements[name];
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('invalid')) { check(f); } });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var f = form.elements[name];
        if (!check(f) && !firstBad) { firstBad = f; }
      });
      if (firstBad) { firstBad.focus(); return; }
      var ok = document.getElementById('form-success');
      ok.hidden = false;
      ok.querySelector('strong').textContent = 'Thank you, ' + form.elements.name.value.trim() + '.';
      form.reset();
      ok.focus();
    });
  }
}());
