// Privacy Policy and Terms of Use, in English and Turkish.
// Written to describe exactly what the code does today. When a new service or
// kind of data is added (ads, analytics, e-mail…), update these texts too.
// Not legal advice: have a lawyer review before relying on them commercially.

import type { Language } from '../../i18n/locale'
import { LEGAL_CONFIG } from './legal-config'

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  items?: string[]
}

export interface LegalDocument {
  title: string
  intro: string
  sections: LegalSection[]
}

function contact(language: Language): string {
  const missing = language === 'tr' ? '(henüz eklenmedi)' : '(not provided yet)'
  const operator = LEGAL_CONFIG.operator || missing
  const email = LEGAL_CONFIG.contactEmail || missing
  return language === 'tr' ? `İşletmeci: ${operator}. İletişim: ${email}.` : `Operator: ${operator}. Contact: ${email}.`
}

// ---------------------------------------------------------------- Privacy

const privacyEn = (): LegalDocument => ({
  title: 'Privacy Policy',
  intro:
    'This policy explains what data FlyAlert collects, why, who helps us process it, and the rights you have. FlyAlert is free to use and we never sell your data.',
  sections: [
    { heading: '1. Who we are', paragraphs: [`FlyAlert is an independent flight price tracking service. ${contact('en')}`] },
    {
      heading: '2. Data we collect',
      items: [
        'Account: your email address and password. Passwords are stored only as a secure hash by our login provider; we cannot see them.',
        'Preferences: your language and currency.',
        'Price alerts: routes, dates, number of passengers and target prices you set, plus the fares we record when we check them.',
        'Notifications: the in-app notifications we create for you. If you turn on phone/browser notifications, we also store the delivery address and encryption keys your browser gives us, and the language for the messages.',
        'AI assistant: the messages you type and a summary of the fares on your screen are sent to our AI provider to generate an answer. We do not store these conversations.',
        'Technical data: your IP address and browser details appear briefly in our hosting provider’s security and error logs.',
      ],
    },
    {
      heading: '3. Data stored in your browser',
      paragraphs: [
        'We only use storage that is necessary for the site to work: your login session, your language and currency choice, and recently selected airports (for the current visit). We do not use advertising or analytics cookies. If we add them in the future, we will ask for your permission first.',
      ],
    },
    {
      heading: '4. Why we use your data (legal bases)',
      items: [
        'To provide the service you signed up for: accounts, searches, price alerts and notifications (performance of a contract).',
        'To keep the service secure and prevent abuse, e.g. rate limits (legitimate interest).',
        'Phone/browser notifications are only sent if you turn them on; you can turn them off at any time (consent).',
      ],
    },
    {
      heading: '5. Service providers',
      paragraphs: ['We use these providers to run FlyAlert. They process data only to provide their service to us:'],
      items: [
        'Supabase: database and login.',
        'Cloudflare: website hosting, our API, scheduled price checks and the AI assistant (Workers AI).',
        'Travelpayouts / Aviasales: flight prices and city suggestions. While you type a city, your browser connects to their suggestion service, and airline logos load from their image server, so they can see your IP address.',
        'ExchangeRate-API: daily exchange rates (no personal data is sent).',
        'Your browser’s push service (e.g. Google, Apple, Mozilla, Microsoft): delivers phone/browser notifications. Messages are encrypted so the push service cannot read them.',
      ],
    },
    {
      heading: '6. International transfers',
      paragraphs: [
        'Our providers may process data on servers outside your country (for example in the EU or the USA). This is necessary to provide the service.',
      ],
    },
    {
      heading: '7. How long we keep data',
      paragraphs: [
        'We keep your data while your account exists. When you delete your account in Account settings, your profile, alerts, price history, notifications and notification devices are deleted immediately. Providers may keep backups for a limited time before they are overwritten.',
      ],
    },
    {
      heading: '8. Your rights',
      paragraphs: [
        'You can access, correct and delete your data. You can change your preferences and delete your account yourself in Account settings. For other requests (for example a copy of your data or an objection), contact us using the details above. You also have the right to complain to your data protection authority (in Türkiye: the Personal Data Protection Authority, KVKK).',
      ],
    },
    { heading: '9. Children', paragraphs: ['FlyAlert is not intended for children under 16.'] },
    {
      heading: '10. Security',
      paragraphs: [
        'All connections use HTTPS. Database rules make sure each user can only access their own data, and secret keys are kept on the server only.',
      ],
    },
    { heading: '11. Changes', paragraphs: ['If we change this policy, we will update the date at the top of this page.'] },
  ],
})

const privacyTr = (): LegalDocument => ({
  title: 'Gizlilik Politikası',
  intro:
    'Bu politika FlyAlert’in hangi verileri neden topladığını, bu verileri işlerken kimlerden yardım aldığımızı ve haklarını açıklar. FlyAlert ücretsizdir ve verilerini asla satmayız.',
  sections: [
    { heading: '1. Biz kimiz (veri sorumlusu)', paragraphs: [`FlyAlert bağımsız bir uçuş fiyatı takip hizmetidir. ${contact('tr')}`] },
    {
      heading: '2. Topladığımız veriler',
      items: [
        'Hesap: e-posta adresin ve şifren. Şifreler giriş sağlayıcımız tarafından yalnızca güvenli bir özet (hash) olarak saklanır; biz göremeyiz.',
        'Tercihler: dil ve para birimi.',
        'Fiyat alarmları: belirlediğin rotalar, tarihler, yolcu sayısı ve hedef fiyatlar ile bunları kontrol ederken kaydettiğimiz fiyatlar.',
        'Bildirimler: senin için oluşturduğumuz site içi bildirimler. Telefon/tarayıcı bildirimlerini açarsan, tarayıcının verdiği bildirim adresi ve şifreleme anahtarları ile mesaj dili de saklanır.',
        'AI asistan: yazdığın mesajlar ve ekrandaki fiyatların bir özeti, cevap üretmek için yapay zekâ sağlayıcımıza gönderilir. Bu konuşmaları saklamayız.',
        'Teknik veriler: IP adresin ve tarayıcı bilgilerin, barındırma sağlayıcımızın güvenlik ve hata kayıtlarında kısa süre görünür.',
      ],
    },
    {
      heading: '3. Tarayıcında saklananlar',
      paragraphs: [
        'Yalnızca sitenin çalışması için gerekli olanları kullanırız: oturumun (giriş bilgisi), dil ve para birimi seçimin ve son seçtiğin havalimanları (o ziyaret boyunca). Reklam ya da analiz çerezi kullanmıyoruz. İleride eklersek önce senden izin isteyeceğiz.',
      ],
    },
    {
      heading: '4. Verilerini neden kullanıyoruz (hukuki sebepler)',
      items: [
        'Kaydolduğun hizmeti sunmak için: hesap, arama, fiyat alarmları ve bildirimler (sözleşmenin kurulması ve ifası).',
        'Hizmeti güvende tutmak ve kötüye kullanımı önlemek için, örneğin istek sınırları (meşru menfaat).',
        'Telefon/tarayıcı bildirimleri yalnızca sen açarsan gönderilir; istediğin an kapatabilirsin (açık rıza).',
      ],
    },
    {
      heading: '5. Hizmet sağlayıcılar',
      paragraphs: ['FlyAlert’i çalıştırmak için şu sağlayıcıları kullanıyoruz. Verileri yalnızca bize hizmet vermek için işlerler:'],
      items: [
        'Supabase: veritabanı ve giriş sistemi.',
        'Cloudflare: sitenin barındırılması, API’miz, zamanlanmış fiyat kontrolleri ve AI asistan (Workers AI).',
        'Travelpayouts / Aviasales: uçuş fiyatları ve şehir önerileri. Şehir yazarken tarayıcın doğrudan öneri servislerine bağlanır, havayolu logoları da onların görsel sunucusundan yüklenir; bu yüzden IP adresini görebilirler.',
        'ExchangeRate-API: günlük döviz kurları (kişisel veri gönderilmez).',
        'Tarayıcının bildirim servisi (ör. Google, Apple, Mozilla, Microsoft): telefon/tarayıcı bildirimlerini ulaştırır. Mesajlar şifreli olduğu için bu servisler içeriği okuyamaz.',
      ],
    },
    {
      heading: '6. Yurt dışına aktarım',
      paragraphs: [
        'Sağlayıcılarımız verileri Türkiye dışındaki sunucularda (örneğin AB veya ABD) işleyebilir. Bu, hizmetin sunulabilmesi için gereklidir.',
      ],
    },
    {
      heading: '7. Verileri ne kadar saklıyoruz',
      paragraphs: [
        'Verilerini hesabın açık olduğu sürece saklarız. Hesap ayarlarından hesabını sildiğinde profilin, alarmların, fiyat geçmişin, bildirimlerin ve bildirim cihazların hemen silinir. Sağlayıcıların yedekleri, üzerine yazılana kadar sınırlı bir süre kalabilir.',
      ],
    },
    {
      heading: '8. Hakların (KVKK m. 11 ve GDPR)',
      paragraphs: [
        'Verilerine erişebilir, düzeltilmesini ve silinmesini isteyebilirsin. Tercihlerini değiştirmek ve hesabını silmek için Hesap ayarlarını kendin kullanabilirsin. Diğer talepler için (örneğin verilerinin bir kopyası veya itiraz) yukarıdaki iletişim bilgilerinden bize ulaş. Ayrıca Kişisel Verileri Koruma Kurulu’na (KVKK) şikâyette bulunma hakkın vardır.',
      ],
    },
    { heading: '9. Çocuklar', paragraphs: ['FlyAlert 16 yaşından küçükler için tasarlanmamıştır.'] },
    {
      heading: '10. Güvenlik',
      paragraphs: [
        'Tüm bağlantılar HTTPS ile şifrelidir. Veritabanı kuralları her kullanıcının yalnızca kendi verisine erişmesini sağlar; gizli anahtarlar yalnızca sunucuda tutulur.',
      ],
    },
    { heading: '11. Değişiklikler', paragraphs: ['Bu politikayı değiştirirsek sayfanın üstündeki tarihi güncelleriz.'] },
  ],
})

// ---------------------------------------------------------------- Terms

const termsEn = (): LegalDocument => ({
  title: 'Terms of Use',
  intro: 'By using FlyAlert you agree to these terms. Please read them; they are short.',
  sections: [
    { heading: '1. The service', paragraphs: [`FlyAlert is a free service that shows flight fares and alerts you when a fare reaches your target price. We do not sell tickets: bookings are made on airline or travel agency websites, under their own terms. ${contact('en')}`] },
    {
      heading: '2. Prices',
      paragraphs: [
        'Fares come from Travelpayouts / Aviasales and are prices other travelers found recently (cached, not live). They can change or disappear at any time; the final price is the one shown on the booking site. We do not guarantee that a fare is available or correct, and we do not predict future prices.',
      ],
    },
    {
      heading: '3. Alerts and notifications',
      paragraphs: [
        'We check alerts regularly and notify you when a recorded fare is at or below your target. Checks and notifications can be delayed or missed (for example when a provider is down). Do not rely on FlyAlert as your only source for time-critical decisions.',
      ],
    },
    { heading: '4. AI assistant', paragraphs: ['The AI assistant can make mistakes. Its answers are general information, not professional or travel advice. Check important details (visas, baggage, prices) with official sources.'] },
    {
      heading: '5. Your account',
      items: [
        'Use a valid email address and keep your password secret.',
        'Do not misuse the service: no automated scraping, excessive requests, attempts to break security, or use that harms other users.',
        'You can delete your account at any time in Account settings. We may suspend accounts that break these terms.',
      ],
    },
    { heading: '6. How FlyAlert is funded', paragraphs: ['FlyAlert is free. Some links to booking sites are partner (affiliate) links: if you book through them we may earn a commission, at no extra cost to you. We may show clearly marked advertising in the future.'] },
    { heading: '7. Trademarks', paragraphs: ['Airline names and logos belong to their owners and are shown only to identify the airline offering a fare. FlyAlert is not affiliated with or endorsed by any airline.'] },
    { heading: '8. Liability', paragraphs: ['The service is provided “as is”. To the extent permitted by law, we are not liable for losses caused by inaccurate prices, delayed or missed notifications, or decisions made using the service.'] },
    { heading: '9. Changes and governing law', paragraphs: [`We may update these terms; the date at the top shows the latest version. These terms are governed by the laws of ${LEGAL_CONFIG.country || 'the operator’s country (not provided yet)'}.`] },
  ],
})

const termsTr = (): LegalDocument => ({
  title: 'Kullanım Şartları',
  intro: 'FlyAlert’i kullanarak bu şartları kabul etmiş olursun. Lütfen oku; kısa tuttuk.',
  sections: [
    { heading: '1. Hizmet', paragraphs: [`FlyAlert, uçuş fiyatlarını gösteren ve bir fiyat hedefine ulaştığında haber veren ücretsiz bir hizmettir. Bilet satmayız: satın alma, kendi şartlarıyla havayolu ya da seyahat acentesi sitelerinde yapılır. ${contact('tr')}`] },
    {
      heading: '2. Fiyatlar',
      paragraphs: [
        'Fiyatlar Travelpayouts / Aviasales’ten gelir ve diğer yolcuların yakın zamanda bulduğu fiyatlardır (anlık değil, önbellekten). Her an değişebilir ya da kalkabilir; geçerli fiyat satın alma sitesinde gösterilendir. Bir fiyatın mevcut ya da doğru olduğunu garanti etmeyiz ve gelecekteki fiyatları tahmin etmeyiz.',
      ],
    },
    {
      heading: '3. Alarmlar ve bildirimler',
      paragraphs: [
        'Alarmları düzenli olarak kontrol eder, kaydedilen fiyat hedefinde ya da altında olduğunda haber veririz. Kontroller ve bildirimler gecikebilir ya da hiç gelmeyebilir (örneğin bir sağlayıcı çalışmıyorsa). Zaman açısından kritik kararlarda tek kaynağın FlyAlert olmasın.',
      ],
    },
    { heading: '4. AI asistan', paragraphs: ['AI asistan hata yapabilir. Cevapları genel bilgidir; profesyonel ya da seyahat tavsiyesi değildir. Önemli konuları (vize, bagaj, fiyat) resmî kaynaklardan kontrol et.'] },
    {
      heading: '5. Hesabın',
      items: [
        'Geçerli bir e-posta adresi kullan ve şifreni gizli tut.',
        'Hizmeti kötüye kullanma: otomatik veri çekme, aşırı istek, güvenliği aşma girişimi ya da diğer kullanıcılara zarar veren kullanım yasaktır.',
        'Hesabını istediğin an Hesap ayarlarından silebilirsin. Bu şartlara uymayan hesapları askıya alabiliriz.',
      ],
    },
    { heading: '6. FlyAlert nasıl ücretsiz kalıyor', paragraphs: ['FlyAlert ücretsizdir. Satın alma sitelerine giden bazı linkler ortaklık (affiliate) linkleridir: bu linklerden bilet alırsan, sana ek maliyet olmadan komisyon kazanabiliriz. İleride açıkça işaretlenmiş reklamlar gösterebiliriz.'] },
    { heading: '7. Markalar', paragraphs: ['Havayolu adları ve logoları sahiplerine aittir ve yalnızca fiyatı sunan havayolunu tanımlamak için gösterilir. FlyAlert hiçbir havayoluyla bağlantılı değildir ve onlar tarafından desteklenmez.'] },
    { heading: '8. Sorumluluk', paragraphs: ['Hizmet “olduğu gibi” sunulur. Yasaların izin verdiği ölçüde; hatalı fiyatlar, geciken ya da gelmeyen bildirimler veya hizmeti kullanarak verilen kararlardan doğan kayıplardan sorumlu değiliz.'] },
    { heading: '9. Değişiklikler ve uygulanacak hukuk', paragraphs: [`Bu şartları güncelleyebiliriz; en üstteki tarih son sürümü gösterir. Bu şartlar ${LEGAL_CONFIG.country || 'işletmecinin bulunduğu ülke (henüz eklenmedi)'} yasalarına tabidir.`] },
  ],
})

export function getLegalDocument(kind: 'privacy' | 'terms', language: Language): LegalDocument {
  if (kind === 'privacy') return language === 'tr' ? privacyTr() : privacyEn()
  return language === 'tr' ? termsTr() : termsEn()
}
