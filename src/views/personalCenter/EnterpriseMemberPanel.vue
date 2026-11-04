<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { CrownOutlined, UserAddOutlined } from '@ant-design/icons-vue'
import {
  allocateMembershipSlot,
  type AccountMembership,
  type MembershipSlot,
} from '@/api/membership'

defineOptions({ name: 'EnterpriseMemberPanel' })

const props = defineProps<{
  membership?: AccountMembership | null
  ownerPhone?: string
}>()

const emit = defineEmits<{
  changed: []
}>()

const router = useRouter()
const checkedIds = ref<string[]>([])
const bindSlotId = ref('')
const phoneDraft = ref('')
const binding = ref(false)

const digits = (value?: string | null) => (value ?? '').replace(/\D/g, '')

const stamp = (value: string | null | undefined, pattern: string) => {
  if (!value || value.startsWith('0001') || value.startsWith('1900')) return ''
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(pattern) : ''
}

const expireText = computed(() =>
  stamp(props.membership?.expiresAt, 'YYYY-MM-DD HH:mm:ss'),
)

type SeatRow = MembershipSlot & {
  owner: boolean
  expiresAt: string
}

const batches = computed(() => {
  const list = props.membership?.managedBatches
  return Array.isArray(list) ? list : []
})

const rows = computed<SeatRow[]>(() => {
  const owner = digits(props.ownerPhone)
  const list: SeatRow[] = []
  for (const batch of batches.value) {
    const expiresAt = stamp(batch.order?.expiresAt, 'YYYY-MM-DD HH:mm')
    for (const slot of batch.slots ?? []) {
      if (slot.id == null || slot.id === '') continue
      const holderPhone = (slot.holderPhone ?? '').trim()
      const taken = holderPhone.length > 0
      list.push({
        ...slot,
        holderPhone: taken ? holderPhone : '',
        owner: taken && owner.length > 0 && digits(holderPhone) === owner,
        allocatedAt: taken ? stamp(slot.allocatedAt, 'YYYY-MM-DD') : '',
        expiresAt: taken ? expiresAt : '',
      })
    }
  }
  return [
    ...list.filter((row) => row.owner),
    ...list.filter((row) => !row.owner),
  ]
})

const rowKey = (row: SeatRow) => String(row.id)

const allChecked = computed(
  () =>
    rows.value.length > 0 &&
    rows.value.every((row) => checkedIds.value.includes(rowKey(row))),
)
const someChecked = computed(
  () => checkedIds.value.length > 0 && !allChecked.value,
)

const toggleAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  checkedIds.value = checked ? rows.value.map((row) => rowKey(row)) : []
}

const toggleOne = (id: string, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  checkedIds.value = checked
    ? [...checkedIds.value, id]
    : checkedIds.value.filter((item) => item !== id)
}

watch(rows, (list) => {
  const alive = new Set(list.map((row) => rowKey(row)))
  checkedIds.value = checkedIds.value.filter((id) => alive.has(id))
})

const goOrgPlans = () => {
  void router.push({ name: 'membership', query: { focus: 'org' } })
}

const openBind = (id: string) => {
  bindSlotId.value = id
  phoneDraft.value = ''
}

const closeBind = () => {
  if (binding.value) return
  bindSlotId.value = ''
}

const submitBind = async () => {
  const slotId = bindSlotId.value
  const phone = phoneDraft.value.trim()
  if (!/^1\d{10}$/.test(phone)) {
    message.warning('请输入已注册的11位手机号')
    return
  }
  if (rows.value.some((row) => digits(row.holderPhone) === phone)) {
    message.warning('该手机号已在名额中')
    return
  }
  binding.value = true
  try {
    await allocateMembershipSlot(slotId, phone)
    message.success('绑定成功')
    bindSlotId.value = ''
    emit('changed')
  } catch {
    // 请求拦截器已提示失败原因
  } finally {
    binding.value = false
  }
}

const unbind = () => {
  message.warning('暂不支持解绑')
}
</script>

<template>
  <div class="ent-member">
    <div class="ent-head">
      <span class="ent-name">
        <CrownOutlined />
        企业会员
      </span>
      <span v-if="expireText" class="ent-expire"
        >到期时间：{{ expireText }}</span
      >
      <button type="button" class="ent-renew" @click="goOrgPlans">
        会员续费
      </button>
      <button type="button" class="ent-add" @click="goOrgPlans">
        追加开通
      </button>
    </div>

    <p v-if="!rows.length" class="ent-empty">暂无可分配名额</p>
    <table v-else class="seat-table">
      <thead>
        <tr>
          <th class="col-check">
            <input
              type="checkbox"
              aria-label="全选名额"
              :checked="allChecked"
              :indeterminate.prop="someChecked"
              @change="toggleAll"
            />
          </th>
          <th>绑定账号</th>
          <th>绑定手机号</th>
          <th>到期时间</th>
          <th class="col-action">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="rowKey(row)">
          <td class="col-check">
            <input
              type="checkbox"
              :aria-label="
                row.holderPhone ? `选择 ${row.holderPhone}` : '选择空名额'
              "
              :checked="checkedIds.includes(rowKey(row))"
              @change="toggleOne(rowKey(row), $event)"
            />
          </td>
          <td>
            <div v-if="row.holderPhone" class="seat-main">
              {{ row.holderPhone }}
            </div>
            <span v-if="row.owner" class="seat-tag">主账号</span>
            <div v-else-if="row.allocatedAt" class="seat-sub">
              {{ row.allocatedAt }}加入
            </div>
          </td>
          <td>
            <div v-if="row.holderPhone" class="seat-main">
              {{ row.holderPhone }}
            </div>
            <span v-if="row.owner" class="seat-tag">主账号</span>
            <div v-else-if="row.allocatedAt" class="seat-sub">
              {{ row.allocatedAt }}加入
            </div>
          </td>
          <td>{{ row.expiresAt }}</td>
          <td class="col-action">
            <span v-if="row.owner" class="seat-none">--</span>
            <button
              v-else-if="row.holderPhone"
              type="button"
              class="seat-unbind"
              @click="unbind"
            >
              解绑
            </button>
            <button
              v-else
              type="button"
              class="seat-bind"
              @click="openBind(rowKey(row))"
            >
              <UserAddOutlined />
              绑定
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <a-modal
      :open="Boolean(bindSlotId)"
      :width="420"
      :footer="null"
      title="绑定账号"
      @cancel="closeBind"
    >
      <p class="bind-tip">
        请填写已注册的手机号，绑定后会员时长会叠加到该账号。
      </p>
      <a-input
        v-model:value="phoneDraft"
        :maxlength="11"
        placeholder="请输入手机号"
        @press-enter="submitBind"
      />
      <div class="bind-actions">
        <a-button @click="closeBind">取消</a-button>
        <a-button
          type="primary"
          class="bind-submit"
          :loading="binding"
          @click="submitBind"
        >
          绑定
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.ent-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-bottom: 16px;
}

.ent-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #c4922a;
  font-size: 16px;
  font-weight: 600;
}

.ent-expire {
  color: #8d97a6;
  font-size: 14px;
}

.ent-renew,
.ent-add {
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.ent-renew {
  border: 0;
  background: #3a3028;
  color: #fff;

  &:hover {
    background: #2b241e;
  }
}

.ent-add {
  border: 1px solid #1677ff;
  background: #fff;
  color: #1677ff;

  &:hover {
    background: #f3f8ff;
  }
}

.ent-empty {
  margin: 0;
  padding: 28px 0;
  color: #8d97a6;
  text-align: center;
}

.seat-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
  color: #1f2a37;

  th,
  td {
    padding: 14px 12px;
    border-bottom: 1px solid #edf2f7;
    text-align: left;
    vertical-align: middle;
    word-break: break-all;
  }

  th {
    background: #eaf4ff;
    color: #6d8299;
    font-weight: 500;
  }
}

.col-check {
  width: 52px;
  text-align: center;
}

.col-action {
  width: 110px;
  text-align: right;
}

.seat-main {
  line-height: 22px;
}

.seat-tag {
  display: inline-block;
  margin-top: 4px;
  padding: 0 8px;
  border-radius: 10px;
  background: #f6d98a;
  color: #8a5a12;
  font-size: 12px;
  line-height: 20px;
}

.seat-sub {
  margin-top: 2px;
  color: #b0b8c4;
  font-size: 12px;
  line-height: 18px;
}

.seat-none {
  color: #c5cdd6;
}

.seat-unbind,
.seat-bind {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

.seat-unbind {
  color: #e54545;
}

.seat-bind {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1677ff;
}

.bind-tip {
  margin: 0 0 12px;
  color: #667085;
  font-size: 13px;
}

.bind-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
