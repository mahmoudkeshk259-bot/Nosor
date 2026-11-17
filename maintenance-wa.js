/* maintenance-wa.js
 * إرسال بيانات الصيانة للمندوب على واتساب
 * الاستخدام: maintenanceWA(rider, maint)
 *   rider: { name, phone, carNo, iqama, iban }
 *   maint: { type, reason, price }
 */
(function () {
  function pick(o, keys) {
    for (var i = 0; i < keys.length; i++) {
      if (o && o[keys[i]] != null && o[keys[i]] !== '') return o[keys[i]];
    }
    return '-';
  }

  function buildMaintenanceMsg(r, m) {
    return (
      '🔧 *طلب صيانة*\n' +
      'الاسم: ' + pick(r, ['name', 'الاسم']) + '\n' +
      'نوع الصيانة: ' + pick(m, ['type', 'نوع']) + '\n' +
      'السبب: ' + pick(m, ['reason', 'السبب']) + '\n' +
      'السعر: ' + pick(m, ['price', 'السعر']) + ' ريال\n' +
      'رقم السيارة: ' + pick(r, ['carNo', 'plate', 'رقم السيارة']) + '\n' +
      'رقم الإقامة: ' + pick(r, ['iqama', 'iqamaNo', 'رقم الإقامة']) + '\n' +
      'الايبان: ' + pick(r, ['iban', 'IBAN', 'الايبان'])
    );
  }

  function toIntl(phone) {
    var p = String(phone || '').replace(/\D/g, '');
    if (p.indexOf('00') === 0) p = p.slice(2);
    if (p.indexOf('0') === 0) p = '966' + p.slice(1); // رقم سعودي محلي
    return p;
  }

  window.buildMaintenanceMsg = buildMaintenanceMsg;

  window.maintenanceWA = function (r, m) {
    var phone = toIntl(pick(r, ['phone', 'mobile', 'الجوال']));
    var url = 'https://wa.me/' + (phone === '-' ? '' : phone) +
      '?text=' + encodeURIComponent(buildMaintenanceMsg(r, m));
    window.open(url, '_blank');
  };
})();
