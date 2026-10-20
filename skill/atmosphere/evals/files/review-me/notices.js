function dismiss(el) {
  var notice = el.closest('.notice');
  var dark = document.body.getAttribute('data-look') === 'night';
  notice.style.background = dark ? '#1f2937' : '#f3f4f6';
  notice.style.transition = 'opacity 240ms ease';
  notice.classList.add('is-leaving');
  setTimeout(function () { notice.remove(); }, 240);
}
