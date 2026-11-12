<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  bindMyEnterprise,
  buildBindEnterprisePayload,
  readBoundEnterpriseId,
} from '@/api/account'
import {
  searchEnterpriseBindOptions,
  type EnterpriseBindOption,
} from '@/api/enterprises'
import { PolicyUserType } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/utils/request'

defineOptions({ name: 'BindEnterpriseModal' })

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  bound: [enterpriseId?: string]
}>()

const auth = useAuthStore()
const creditCode = ref('')
const enterpriseId = ref<string | undefined>(undefined)
const selected = ref<{ value: string; label: string } | undefined>(undefined)
const filledCode = ref('')
const searchKeyword = ref('')
const options = ref<{ value: string; label: string; creditCode: string }[]>([])
const searching = ref(false)
const submitting = ref(false)
const optionById = new Map<string, EnterpriseBindOption>()
let searchTimer = 0

const popupContainer = (trigger: HTMLElement) =>
  trigger.parentElement ?? document.body

const toSelectOption = (item: EnterpriseBindOption) => ({
  value: String(item.id),
  label: item.name,
  creditCode: item.creditCode,
})

const close = () => {
  open.value = false
}

const reset = () => {
  creditCode.value = ''
  enterpriseId.value = undefined
  selected.value = undefined
  filledCode.value = ''
  searchKeyword.value = ''
  options.value = []
  optionById.clear()
  searching.value = false
  submitting.value = false
  window.clearTimeout(searchTimer)
}

watch(open, (visible) => {
  if (visible) reset()
})

onUnmounted(() => {
  window.clearTimeout(searchTimer)
})

const onSearch = (keyword: string) => {
  searchKeyword.value = keyword
  window.clearTimeout(searchTimer)
  const text = keyword.trim()
  if (text.length < 2) {
    searching.value = false
    return
  }
  searchTimer = window.setTimeout(() => {
    void searchEnterprises(text)
  }, 300)
}

const rememberOptions = (items: EnterpriseBindOption[]) => {
  const current = enterpriseId.value
    ? optionById.get(String(enterpriseId.value))
    : undefined
  optionById.clear()
  if (current) optionById.set(String(current.id), current)
  for (const item of items) optionById.set(String(item.id), item)
  const next = items.map(toSelectOption)
  if (current && !items.some((item) => item.id === current.id)) {
    next.unshift(toSelectOption(current))
  }
  options.value = next
}

const searchEnterprises = async (keyword: string) => {
  searching.value = true
  try {
    rememberOptions(await searchEnterpriseBindOptions(keyword))
  } catch {
    rememberOptions([])
  } finally {
    searching.value = false
  }
}

const readSelectId = (value: unknown) => {
  const raw =
    value && typeof value === 'object' && 'value' in value
      ? (value as { value: unknown }).value
      : value
  if (typeof raw !== 'string') return undefined
  const id = raw.trim()
  return /^[1-9]\d*$/.test(id) ? id : undefined
}

const optionText = (option: unknown, key: string) => {
  if (!option || typeof option !== 'object' || Array.isArray(option)) return ''
  const value = (option as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : ''
}

const onEnterpriseChange = (value: unknown, option?: unknown) => {
  const id = readSelectId(value)
  if (!id) {
    if (creditCode.value === filledCode.value) creditCode.value = ''
    filledCode.value = ''
    enterpriseId.value = undefined
    selected.value = undefined
    searchKeyword.value = ''
    return
  }
  const picked = optionById.get(String(id))
  const code = (picked?.creditCode || optionText(option, 'creditCode'))
    .replace(/\s+/g, '')
    .toUpperCase()
  const label =
    picked?.name ||
    optionText(option, 'label') ||
    (value && typeof value === 'object' && 'label' in value
      ? optionText(value, 'label')
      : '')
  enterpriseId.value = id
  selected.value = { value: String(id), label }
  searchKeyword.value = ''
  if (code) {
    creditCode.value = code
    filledCode.value = code
  }
}

const submit = async () => {
  if (submitting.value) return
  const isService =
    Number(auth.user?.identity) === PolicyUserType.EnterpriseService
  const code = creditCode.value.trim()
  // 企业专员走信用代码，认领后才会回填个人资料；企服人员提交企业 Id
  const payload = buildBindEnterprisePayload({
    creditCode: code,
    enterpriseId: isService || !code ? enterpriseId.value : undefined,
  })
  if (!payload) {
    message.warning('请填写统一社会信用代码或选择企业')
    return
  }
  if (payload.creditCode && !/^[0-9A-Z]{18}$/.test(payload.creditCode)) {
    message.warning('请输入 18 位统一社会信用代码')
    return
  }
  submitting.value = true
  try {
    const created = await bindMyEnterprise(payload)
    message.success('绑定成功')
    const id = readBoundEnterpriseId(created) ?? payload.enterpriseId
    close()
    emit('bound', id ?? undefined)
  } catch (err) {
    message.error(
      err instanceof ApiError ? err.message : '绑定失败，请稍后重试',
    )
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <a-modal
    :open="open"
    :width="480"
    :footer="null"
    wrap-class-name="bind-enterprise-modal"
    @cancel="close"
  >
    <template #title>
      <span class="modal-title">绑定企业</span>
    </template>
    <p class="modal-tip">
      选择企业后会回填统一社会信用代码。企业专员按信用代码认领，企服人员按所选企业提交。
    </p>

    <div class="field">
      <span class="field-label">统一社会信用代码</span>
      <a-input
        v-model:value="creditCode"
        class="field-input"
        aria-label="统一社会信用代码"
        placeholder="请输入统一社会信用代码"
        :maxlength="18"
        :disabled="submitting"
        @press-enter="submit"
      />
      <span class="field-hint">
        企业专员推荐此方式，认领后回填个人资料中的公司名称与信用代码。
      </span>
    </div>

    <div class="field">
      <span class="field-label">企业</span>
      <a-select
        :value="selected"
        class="field-input"
        label-in-value
        show-search
        allow-clear
        :filter-option="false"
        :options="options"
        :search-value="searchKeyword"
        :disabled="submitting"
        :get-popup-container="popupContainer"
        placeholder="输入企业名称检索"
        aria-label="企业"
        :not-found-content="searching ? '检索中…' : '请输入至少 2 个字检索'"
        @search="onSearch"
        @change="onEnterpriseChange"
      />
      <span class="field-hint">
        从企业列表选择后，会回填该企业的统一社会信用代码。
      </span>
    </div>

    <div class="action-row">
      <a-button class="cancel-btn" :disabled="submitting" @click="close">
        取消
      </a-button>
      <a-button
        type="primary"
        class="confirm-btn"
        :loading="submitting"
        @click="submit"
      >
        绑定
      </a-button>
    </div>
  </a-modal>
</template>

<style scoped lang="scss">
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
}

.modal-tip {
  margin: 4px 0 0;
  color: var(--pb-sub);
  font-size: 13px;
  line-height: 1.5;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.field-label {
  color: var(--pb-text);
  font-size: 14px;
}

.field-input {
  width: 100%;
}

.field-hint {
  color: #999;
  font-size: 12px;
  line-height: 1.4;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 28px 0 4px;
}

.cancel-btn,
.confirm-btn {
  min-width: 88px;
  height: 36px;
  border-radius: 4px;
}
</style>
