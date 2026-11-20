import { defineContentScript } from 'wxt/utils/define-content-script'
import { createMatcher } from '../core/matcher'
import { createTranslator } from '../core/translator'
import type { LocaleBundle, PageKey } from '../core/types'
import zhCN from '../locales/zh-CN/payment-form'
import zhTW from '../locales/zh-TW/payment-form'
import { pageLanguageEnvironment } from '../shared/language-env'
import { resolvePageLocale, type PageLocale } from '../shared/locale'
import { TIME_LANGS } from '../shared/locale-loader'
import { currentFrame, isPaymentFormFrame } from '../shared/payment-form'
import { DEFAULT_SETTINGS, getSettings, isTranslationOn, watchSettings, type Settings } from '../shared/settings'

/** 各语言的付款表单词典：只带这一份，不加载整套语言包 */
const BUNDLES: Readonly<Record<PageLocale, LocaleBundle>> = {
  'zh-CN': [['payment-form', zhCN]],
  'zh-TW': [['payment-form', zhTW]]
}

const PAGES: readonly PageKey[] = ['payment-form']

/** 检查扩展是否失效的间隔（同 content.ts）：停用、卸载后还原表单 */
const INVALIDATION_CHECK_MS = 3000

/**
 * 付款表单脚本：翻译嵌在 github.com 页面里的 Zuora 托管页（信用卡表单）。
 * 不写进清单：「汉化付款表单」开启且有 www.zuora.com 的主机权限时由后台注册到所有框架（见 shared/payment-form.ts）。
 * 不写 matches：匹配地址见 shared/payment-form.ts 的 PAYMENT_FORM_MATCHES。
 * 随设置启停（总开关、汉化开关、汉化付款表单）、切换语言；不用自定义词条、排除路径
 */
export default defineContentScript({
  registration: 'runtime',
  runAt: 'document_start',
  async main(ctx) {
    // 后台向已打开的 GitHub 标签页的所有框架注入：GitHub 自己的框架也会执行到这里
    if (!isPaymentFormFrame(currentFrame(window))) return
    const [settings, languages] = await Promise.all([getSettings().catch(() => DEFAULT_SETTINGS), pageLanguageEnvironment()])
    if (ctx.isInvalid) return
    let locale = resolvePageLocale(settings.language, languages)
    const translator = createTranslator({
      matcher: createMatcher(BUNDLES[locale]),
      host: window,
      resolvePages: () => PAGES,
      timeLang: TIME_LANGS[locale],
      translateTime: false,
      translateTitle: false
    })
    const apply = (next: Settings): void => {
      if (!isTranslationOn(next) || !next.paymentForm) {
        if (translator.active) translator.stop()
        return
      }
      const target = resolvePageLocale(next.language, languages)
      if (target !== locale) {
        locale = target
        translator.setLocale(createMatcher(BUNDLES[target]), TIME_LANGS[target])
      }
      if (!translator.active) translator.start()
    }
    apply(settings)
    const unwatch = watchSettings(apply)
    // 检查由 ctx.setInterval 完成，回调不做事（见 content.ts 的 INVALIDATION_CHECK_MS）
    ctx.setInterval(() => undefined, INVALIDATION_CHECK_MS)
    ctx.onInvalidated(() => {
      // 先还原：扩展失效后调用扩展 API 可能抛错
      translator.stop()
      try {
        unwatch()
      } catch {
        // 上下文已失效，监听随之作废
      }
    })
  }
})
