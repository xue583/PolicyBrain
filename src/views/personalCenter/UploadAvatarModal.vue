<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import defaultAvatar from '@/assets/personalCenter/个人中心@2x.png'

defineOptions({ name: 'UploadAvatarModal' })

const props = defineProps<{ open: boolean }>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const auth = useAuthStore()

const previewUrl = ref('')
const submitting = ref(false)

const close = () => {
  emit('update:open', false)
}

watch(
  () => props.open,
  (open) => {
    if (!open) previewUrl.value = ''
  },
)

const MAX_SIZE = 2 * 1024 * 1024
const ACCEPT_TYPES = ['image/jpeg', 'image/png']

/** 居中裁剪为 180*180，与提示文案约束一致 */
const cropTo180 = (src: string) =>
  new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const size = 180
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas unavailable'))
        return
      }
      const side = Math.min(img.width, img.height)
      const sx = (img.width - side) / 2
      const sy = (img.height - side) / 2
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })

const beforeUpload = async (file: File) => {
  if (!ACCEPT_TYPES.includes(file.type)) {
    message.error('仅支持 JPG、PNG 格式图片')
    return false
  }
  if (file.size > MAX_SIZE) {
    message.error('图片大小不能超过 2M')
    return false
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })
  try {
    previewUrl.value = await cropTo180(dataUrl)
  } catch {
    message.error('图片读取失败，请重新选择')
  }
  return false
}

const confirmUpdate = async () => {
  if (!previewUrl.value) {
    message.warning('请先选择头像图片')
    return
  }
  submitting.value = true
  try {
    await auth.updateProfile({ avatar: previewUrl.value })
    message.success('头像更新成功')
    close()
  } catch {
    // 请求层已统一提示错误
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <a-modal
    :open="open"
    :width="560"
    :footer="null"
    wrap-class-name="upload-avatar-modal"
    @cancel="close"
  >
    <template #title>
      <span class="modal-title">上传头像</span>
    </template>
    <template #closeIcon>
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          stroke-width="1.2"
        />
        <path
          d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        />
      </svg>
    </template>

    <div class="avatar-panel">
      <div class="pick-area">
        <a-upload
          accept=".jpg,.jpeg,.png"
          :show-upload-list="false"
          :before-upload="beforeUpload"
        >
          <button type="button" class="pick-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8.8 4.8c.24-.48.73-.8 1.27-.8h3.86c.54 0 1.03.32 1.27.8L15.8 6H18a2 2 0 0 1 2 2v3.34a1 1 0 0 1-1.3.95 6.5 6.5 0 0 0-8.36 7.02A1 1 0 0 1 9.36 20H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.2l.6-1.2Z"
              />
              <circle cx="12" cy="11.6" r="2.6" fill="#fff" />
              <circle cx="17" cy="16.6" r="4.6" fill="currentColor" />
              <path
                d="M17 14.7v3.8M15.1 16.6h3.8"
                stroke="#fff"
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>
            <span>选择本地图片</span>
          </button>
        </a-upload>
      </div>

      <div class="divider"></div>

      <div class="preview-area">
        <div class="preview-avatar">
          <img :src="previewUrl || defaultAvatar" alt="头像预览" />
        </div>
        <div class="preview-label">
          {{ previewUrl ? '当前选中头像' : '当前默认头像' }}
        </div>
      </div>
    </div>

    <p class="avatar-tip">
      请选择图片上传：大小180*180像素支持JPG、PNG等格式，图片需小于2M
    </p>

    <div class="action-row">
      <a-button
        type="primary"
        class="confirm-btn"
        :loading="submitting"
        @click="confirmUpdate"
      >
        更 新
      </a-button>
    </div>
  </a-modal>
</template>

<style scoped lang="scss">
.upload-avatar-modal :deep(.ant-modal-content) {
  border-radius: 8px;
}

.upload-avatar-modal :deep(.ant-modal-header) {
  margin-bottom: 8px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
}

.upload-avatar-modal :deep(.ant-modal-close) {
  top: 14px;
  right: 16px;
  color: #bfbfbf;

  &:hover {
    color: #999;
  }
}

.avatar-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 32px 0 36px;
}

.pick-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 28px;
  background: #ecf3ff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: var(--pb-primary);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e0edff;
  }
}

.divider {
  width: 1px;
  height: 112px;
  background: #ececec;
}

.preview-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.preview-label {
  font-size: 13px;
  color: #999;
}

.avatar-tip {
  max-width: 400px;
  margin: 0 auto;
  font-size: 13px;
  line-height: 22px;
  color: #333;
  text-align: center;
}

.action-row {
  display: flex;
  justify-content: center;
  padding: 24px 0 8px;
}

.confirm-btn {
  min-width: 112px;
  height: 40px;
  border-radius: 4px;
  font-size: 15px;
}
</style>
