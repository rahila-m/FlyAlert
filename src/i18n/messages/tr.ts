// Türkçe metinler. `Record<MessageKey, string>` sayesinde en.ts'deki her anahtar
// burada da olmak zorunda; eksik bir çeviri derleme hatası verir.

import type { MessageKey } from './en'

export const tr: Record<MessageKey, string> = {
  // Navigation & layout
  'nav.howItWorks': 'Nasıl çalışır',
  'nav.features': 'Özellikler',
  'nav.airlines': 'Havayolları',
  'nav.faq': 'SSS',
  'nav.main': 'Ana menü',
  'nav.mobile': 'Mobil menü',
  'nav.openMenu': 'Menüyü aç',
  'nav.closeMenu': 'Menüyü kapat',
  'nav.logIn': 'Giriş yap',
  'nav.signUp': 'Ücretsiz kaydol',
  'nav.dashboard': 'Panelim',
  'nav.logOut': 'Çıkış yap',
  'nav.home': 'FlyAlert ana sayfa',

  // Language & currency selector
  'prefs.button': 'Dil ve para birimi',
  'prefs.title': 'Dil ve para birimi',
  'prefs.language': 'Dil',
  'prefs.currency': 'Para birimi',
  'prefs.note': 'Giriş yaptığında hesabına kaydedilir.',

  // Footer
  'footer.tagline': 'Dünya genelinde uçak bileti fiyatlarını takip et, hedef fiyatına düşünce haberin olsun.',
  'footer.product': 'Ürün',
  'footer.account': 'Hesap',
  'footer.signUp': 'Kaydol',
  'footer.rights': '© {year} FlyAlert. Tüm hakları saklıdır.',
  'footer.noTickets': 'FlyAlert bilet satmaz. Biletini her zaman havayolundan ya da satış sitesinden alırsın.',

  // Hero
  'hero.badge': 'Uçak bileti fiyat takibi, artık çok kolay',
  'hero.title1': 'Fiyatları kontrol etmeyi bırak.',
  'hero.title2': 'Ucuz bilet sana gelsin.',
  'hero.subtitle':
    'Dünyanın her yerindeki rotaları takip et, hedef fiyatını belirle, fiyat düştüğü an haberin olsun. Sonra biletini doğrudan havayolundan ya da satış sitesinden al.',
  'hero.point1': '%100 ücretsiz, ücretli plan yok',
  'hero.point2': 'Kredi kartı gerekmez',
  'hero.point3': 'Alarmları istediğin an duraklat ya da sil',

  // Example alert card (illustration)
  'example.label': 'Fiyat alarmı',
  'example.details': 'Gidiş-dönüş · 1 yetişkin · Ekonomi',
  'example.active': 'Aktif',
  'example.current': 'Güncel fiyat',
  'example.target': 'Hedefin',
  'example.notified': 'Fiyat hedefinin altına düştü. Sana haber verdik.',
  'example.disclaimer': 'Örnek gösterim — gerçek uçuş verisi değildir',

  // How it works
  'how.eyebrow': 'Nasıl çalışır',
  'how.title': 'Aramadan tasarrufa dört adım',
  'how.subtitle': 'Bir kez kur, gerisini FlyAlert takip etsin.',
  'how.step1.title': 'Rotanı ara',
  'how.step1.text': 'Kalkış ve varış havalimanlarını, tarihleri ve yolcu sayısını seç.',
  'how.step2.title': 'Hedef fiyat belirle',
  'how.step2.text': 'Beğendiğin yolculuğu seç ve ödemeye razı olduğun fiyatı söyle.',
  'how.step3.title': 'Fiyatları biz izleyelim',
  'how.step3.text': 'FlyAlert fiyatları düzenli aralıklarla kontrol eder ve her değişikliği kaydeder.',
  'how.step4.title': 'Haber al ve satın al',
  'how.step4.text': 'Fiyat hedefine ulaştığında, bilet alma linkiyle birlikte sana haber veririz.',

  // Features
  'features.eyebrow': 'Özellikler',
  'features.title': 'Daha ucuz bilet yakalamak için ihtiyacın olan her şey',
  'features.subtitle': 'Tek bir işi iyi yapan basit araçlar: uçuşlara daha az ödemeni sağlamak.',
  'features.alerts.title': 'Hedef fiyat alarmları',
  'features.alerts.text': 'Fiyat hedefine düştüğü an uygulama içinden haber al. E-posta bildirimleri yakında.',
  'features.history.title': 'Fiyat geçmişi grafikleri',
  'features.history.text': 'Fiyatın zaman içinde nasıl değiştiğini, yalnızca gerçekten kaydettiğimiz fiyatlarla gör.',
  'features.routes.title': 'Dünya çapında rotalar',
  'features.routes.text': 'Dünyanın her yerindeki havalimanları ve şehirler arasında tek yön ya da gidiş-dönüş ara.',
  'features.currency.title': 'Senin dilin ve para birimin',
  'features.currency.text': "FlyAlert'i Türkçe ya da İngilizce kullan, fiyatları istediğin para biriminde gör.",
  'features.noSpam.title': 'Bildirim yağmuru yok',
  'features.noSpam.text': 'Aynı fiyat için iki kez haber vermeyiz. Sadece önemli değişiklikler.',
  'features.book.title': 'Doğrudan kaynaktan al',
  'features.book.text': 'Asla bilet satmayız. Biletini doğrudan havayolundan ya da satış sitesinden alırsın.',

  // Airlines
  'airlines.eyebrow': 'Havayolları',
  'airlines.title': 'Dünyanın dört bir yanından havayollarının fiyatları',
  'airlines.subtitle':
    'Avrupa, Orta Doğu, Asya ve Amerika rotalarında tam hizmet ve düşük maliyetli havayolları.',
  'airlines.more': 've daha fazlası',
  'airlines.note':
    'FlyAlert, her rota ve tarih için yolcuların yakın zamanda bulduğu en ucuz biletleri gösterir; bu yüzden gördüğün havayolları rotaya göre değişir.',

  // FAQ
  'faq.eyebrow': 'SSS',
  'faq.title': 'Sık sorulan sorular',
  'faq.q1': 'FlyAlert bilet satıyor mu?',
  'faq.a1':
    'Hayır. FlyAlert bir fiyat takip aracıdır. Beğendiğin bir bilet bulduğunda, satın alman için seni havayoluna ya da satış sitesine yönlendiririz.',
  'faq.q2': 'FlyAlert ücretsiz mi?',
  'faq.a2':
    'Evet, tamamen. Ücretli plan yok ve kredi kartı gerekmez. FlyAlert, linklerimiz üzerinden bilet aldığında satış sitelerinden aldığımız küçük komisyonlarla ve belki açıkça işaretlenmiş birkaç reklamla finanse edilir. İkisi de ödediğin fiyatı değiştirmez.',
  'faq.q3': 'Fiyatlar ne sıklıkla kontrol ediliyor?',
  'faq.a3':
    'Takip ettiğin yolculukların fiyatlarını düzenli aralıklarla kontrol eder ve her sonucu kaydederiz; böylece fiyatın zaman içinde nasıl değiştiğini görebilirsin.',
  'faq.q4': 'FlyAlert gelecekteki fiyatları tahmin edebilir mi?',
  'faq.a4':
    'Hayır. Sana gerçekten kaydettiğimiz fiyatları gösterir ve düştüklerinde haber veririz. Bir biletin gelecekte ne kadar olacağını bildiğimizi asla iddia etmeyiz.',
  'faq.q5': 'Bildirim yağmuruna tutulur muyum?',
  'faq.a5': 'Hayır. Fiyat hedefine ulaştığında haber verilir ve aynı fiyat için tekrar bildirim göndermeyiz.',
  'faq.q6': 'Hangi diller ve para birimleri destekleniyor?',
  'faq.a6':
    "FlyAlert Türkçe ve İngilizce kullanılabilir. Sayfanın üstündeki seçiciden USD, EUR, GBP, TRY ve AZN dahil on bir para birimi arasından seçim yapabilirsin.",

  // Call to action
  'cta.title': 'Bir sonraki fiyat düşüşünü yakalamaya hazır mısın?',
  'cta.subtitle': 'Ücretsiz hesap oluştur, ilk fiyat alarmını bir dakikadan kısa sürede kur.',
  'cta.button': 'Ücretsiz kaydol',

  // Search form
  'search.formLabel': 'Uçuş arama',
  'search.tripType': 'Yolculuk tipi',
  'search.roundTrip': 'Gidiş-dönüş',
  'search.oneWay': 'Tek yön',
  'search.passengers': 'Yolcular',
  'search.passengerCount': '{count} yolcu',
  'search.passengerCountPlural': '{count} yolcu',
  'search.economy': 'Ekonomi fiyatları',
  'search.from': 'Nereden',
  'search.to': 'Nereye',
  'search.departure': 'Gidiş',
  'search.return': 'Dönüş',
  'search.swap': 'Kalkış ve varışı değiştir',
  'search.submit': 'Ara',
  'search.placeholder': 'Şehir ya da havalimanı',
  'search.noAirports': 'Havalimanı bulunamadı',
  'search.suggestions': '{label} önerileri',
  'search.allAirports': '{city} tüm havalimanları',
  'search.allAirportsShort': 'tüm havalimanları',
  'search.error.origin': 'Listeden bir kalkış havalimanı seç.',
  'search.error.destination': 'Listeden bir varış havalimanı seç.',
  'search.error.sameAirport': 'Varış noktası kalkıştan farklı olmalı.',
  'search.error.departureMissing': 'Bir gidiş tarihi seç.',
  'search.error.invalidDate': 'Geçerli bir tarih gir.',
  'search.error.pastDate': 'Tarih geçmişte olamaz.',
  'search.error.returnMissing': 'Bir dönüş tarihi seç.',
  'search.error.returnBeforeDeparture': 'Dönüş, gidişle aynı gün ya da sonra olmalı.',
  'search.error.passengers': '1 ile {max} arasında yolcu seç.',
}
