/** Keep in sync with generator config/wedding.json */
export const weddingConfig = {
  brideName: {
    en: 'Asmaa Fathy',
    ar: 'أسماء فتحي',
  },
  groomName: {
    en: 'Wael Osama',
    ar: 'وائل أسامة',
  },
  weddingDate: '2026-11-11',
  weddingTime: '18:00',
  timezone: 'Africa/Cairo',
  venueName: {
    en: 'Al-Rimasia Hall',
    ar: 'قاعة الريماسية',
  },
  venueAddress: {
    en: 'Line 10, Orabi, Obour City',
    ar: 'خط ١٠، عرابي، مدينة العبور',
  },
  mapsUrl: 'https://maps.app.goo.gl/LooJcurhwYRrvgpt5',
  defaultDesignNumber: 1,
  // Ar-Rum 30:21, shown above the envelope. The translation shows in English mode.
  verse: {
    text: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    source: { ar: 'سورة الروم · ٢١', en: 'Ar-Rum · 30:21' },
    translation: 'And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy.',
  },
  wording: {
    en: {
      heading: 'Together with their families',
      and: 'and',
      greetingPrefix: 'Dear',
      message: 'We joyfully invite you to celebrate our wedding day.',
      openEnvelope: 'Open your invitation',
      openLetter: 'Open your invitation',
      whenHeading: 'The date',
      signOff: 'With love,',
      directions: 'Get directions',
      addGoogle: 'Add to Google Calendar',
      downloadIcs: 'Download calendar (.ics)',
      languageToggle: 'العربية',
      countdownLabels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
      countdownTitle: 'Counting down to our day',
      weddingDay: 'Today is the wedding day!',
      afterEvent: 'Thank you for celebrating with us.',
      venueHeading: 'Venue',
    },
    ar: {
      heading: 'بقلوب ملؤها الفرح',
      and: 'و',
      greetingPrefix: 'نتشرف بحضور',
      message: 'يسعدنا دعوتكم لمشاركتنا فرحة زفافنا.',
      openEnvelope: 'افتح دعوتك',
      openLetter: 'افتح رسالتك',
      whenHeading: 'الموعد',
      signOff: 'بكل الحب،',
      directions: 'الاتجاهات',
      addGoogle: 'أضف إلى تقويم Google',
      downloadIcs: 'تحميل ملف التقويم',
      languageToggle: 'English',
      countdownLabels: { days: 'أيام', hours: 'ساعات', minutes: 'دقائق', seconds: 'ثوانٍ' },
      countdownTitle: 'العد التنازلي ليوم فرحنا',
      weddingDay: 'اليوم هو يوم الزفاف!',
      afterEvent: 'شكرًا لمشاركتكم فرحتنا.',
      venueHeading: 'المكان',
    },
  },
}

export function formatCoupleNames(language = 'en') {
  const bride = weddingConfig.brideName?.[language] || weddingConfig.brideName?.en || ''
  const groom = weddingConfig.groomName?.[language] || weddingConfig.groomName?.en || ''
  const and = weddingConfig.wording?.[language]?.and || (language === 'ar' ? 'و' : 'and')
  return { bride, groom, and, display: `${groom} ${and} ${bride}`.trim() }
}

export function guestDisplayName(guest, language) {
  if (!guest) return ''
  if (language === 'ar') return guest.nameAr || guest.name || ''
  return guest.nameEn || guest.name || ''
}

export function formatGreeting(guest, language) {
  const t = weddingConfig.wording[language] || weddingConfig.wording.en
  const name = guestDisplayName(guest, language)
  if (!name) return ''
  if (language === 'ar') return `${t.greetingPrefix} ${name}`
  return `${t.greetingPrefix} ${name}`
}