import { beforeEach, describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../src/App.vue'
import { encryptGuestPayload } from '../src/crypto/guestPayload.js'
import InvitationCard from '../src/components/InvitationCard.vue'
import { buildGoogleCalendarUrl, buildIcsContent } from '../src/utils/calendar.js'
import { getCountdownState } from '../src/utils/countdown.js'
import { weddingConfig } from '../src/config/wedding.js'

beforeEach(() => {
  window.matchMedia = () => ({
    matches: true,
    media: '',
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  })
})

async function openEnvelope(wrapper) {
  await wrapper.find('.envelope-hit').trigger('click')
  // EnvelopeGate emits after setTimeout (0ms when reduced-motion is on)
  await new Promise((resolve) => setTimeout(resolve, 30))
  await flushPromises()
}

describe('App invitation flow', () => {
  it('shows generic invitation without guest param', async () => {
    window.history.pushState({}, '', '/wedding-invitation/')
    const wrapper = mount(App)
    await flushPromises()
    // The envelope itself is the labelled button; the gate shows no button text.
    expect(wrapper.find('.envelope-hit').attributes('aria-label')).toMatch(/افتح|دعوة|Open|invitation/i)
    await openEnvelope(wrapper)
    expect(wrapper.findComponent(InvitationCard).exists()).toBe(true)
  })

  it('decrypts guest payload and sets language/design', async () => {
    const token = await encryptGuestPayload({
      v: 1,
      nameAr: 'سارة',
      nameEn: 'Sara',
      preferredLanguage: 'en',
      designNumber: 4,
    })
    window.history.pushState({}, '', `/wedding-invitation/?guest=${token}`)
    const wrapper = mount(App)
    await flushPromises()
    await openEnvelope(wrapper)
    expect(wrapper.text()).toContain('Sara')
    expect(wrapper.find('.design-4').exists()).toBe(true)
  })

  it('falls back to generic invitation on invalid guest', async () => {
    window.history.pushState({}, '', '/wedding-invitation/?guest=not-a-token')
    const wrapper = mount(App)
    await flushPromises()
    await openEnvelope(wrapper)
    expect(wrapper.text()).not.toContain('not-a-token')
    expect(wrapper.findComponent(InvitationCard).exists()).toBe(true)
  })

  it('toggles language and keeps design', async () => {
    const token = await encryptGuestPayload({
      v: 1,
      nameAr: 'أحمد',
      nameEn: 'Ahmed',
      preferredLanguage: 'ar',
      designNumber: 1,
    })
    window.history.pushState({}, '', `/wedding-invitation/?guest=${token}`)
    const wrapper = mount(App)
    await flushPromises()
    await openEnvelope(wrapper)
    expect(wrapper.find('.design-1').exists()).toBe(true)
    expect(wrapper.text()).toContain('نتشرف بحضور')
    expect(wrapper.text()).toContain('أحمد')
    await wrapper.find('.toolbar button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.design-1').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ahmed')
  })
})

describe('calendar and countdown', () => {
  it('builds google calendar url and ics', () => {
    const url = buildGoogleCalendarUrl('en')
    expect(url).toContain('calendar.google.com')
    expect(url).toContain('action=TEMPLATE')
    const ics = buildIcsContent('en')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('Africa/Cairo')
  })

  it('returns countdown phases', () => {
    const state = getCountdownState(new Date('2020-01-01T00:00:00Z'))
    expect(state.phase).toBe('countdown')
    expect(state.days).toBeGreaterThan(0)
  })

  it('maps url comes from config', () => {
    expect(weddingConfig.mapsUrl).toBe('https://maps.app.goo.gl/LooJcurhwYRrvgpt5')
  })

  it('uses Al-Rimasia venue wording', () => {
    expect(weddingConfig.venueName.ar).toContain('الريماسية')
    expect(weddingConfig.venueAddress.ar).toContain('العبور')
    expect(weddingConfig.wording.ar.greetingPrefix).toBe('نتشرف بحضور')
  })
})

describe('designs', () => {
  it('renders all five design classes', () => {
    for (let n = 1; n <= 5; n += 1) {
      const wrapper = mount(InvitationCard, {
        props: {
          language: 'en',
          designNumber: n,
          guest: { nameAr: 'ضيف', nameEn: 'Guest' },
        },
      })
      expect(wrapper.find(`.design-${n}`).exists()).toBe(true)
    }
  })
})
