<template>
  <ul class="switches">
    <li>
      <UiSwitch
        :label="t('translation')"
        :checked="settings.translation"
        :disabled="!ready"
        data-test="translation"
        @change="save({ translation: $event })"
      />
    </li>
    <li>
      <UiSwitch
        :label="t('paymentForm')"
        :checked="paymentFormEnabled"
        :disabled="!paymentFormReady"
        data-test="payment-form"
        @change="togglePaymentForm"
      >
        <UiHelpTip :label="t('helpAbout', { name: t('paymentForm') })" :text="t('paymentFormHelp')" />
      </UiSwitch>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import UiHelpTip from '../../components/ui/UiHelpTip.vue'
  import UiSwitch from '../../components/ui/UiSwitch.vue'
  import { useI18n } from '../../components/ui-preferences'
  import { usePaymentForm } from './usePaymentForm'
  import { useSettingsSave } from './useSettingsSave'

  /**
   * 汉化开关（汉化设置标签页顶部）：关闭时不翻译页面，其他功能照常。
   * 汉化付款表单（信用卡表单所在的 www.zuora.com 托管页）：默认开启，旁边的问号说明只翻译文字（见 usePaymentForm）
   */
  const { t } = useI18n()
  const { settings, ready, save } = useSettingsSave()
  const { enabled: paymentFormEnabled, ready: paymentFormReady, toggle: togglePaymentForm } = usePaymentForm()
</script>
