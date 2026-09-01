<script setup lang="ts">
import { DownloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import stepDownloadIcon from '../../assets/export/download.png'
import stepUploadIcon from '../../assets/export/upload-icon.png'
import stepExportIcon from '../../assets/export/export-icon.png'
import stepArrowIcon from '../../assets/export/step-arrow.png'
import upload3dIcon from '../../assets/export/upload.png'

defineOptions({ name: 'ExportBatchQueryPanel' })

const emit = defineEmits<{
  downloadTemplate: []
  uploaded: [fileName: string]
}>()

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!['xls', 'xlsx', 'csv'].includes(ext)) {
    message.error('仅支持 Excel 格式（.xls / .xlsx）')
    return false
  }
  if (file.size > 5 * 1024 * 1024) {
    message.error('文件大小不能超过 5MB')
    return false
  }
  emit('uploaded', file.name)
  message.success('名单已上传，已匹配查询结果')
  return false
}
</script>

<template>
  <div class="batch-panel">
    <div class="batch-steps">
      <div class="step">
        <img class="step-icon" :src="stepDownloadIcon" alt="" />
        <div class="step-copy">
          <strong>第一步：下载Excel模板</strong>
          <p>下载标准模板，按照模板格式填入企业名称</p>
          <a-button
            type="primary"
            ghost
            size="small"
            @click.stop="emit('downloadTemplate')"
          >
            <DownloadOutlined />
            下载模板
          </a-button>
        </div>
        <img class="step-arrow" :src="stepArrowIcon" alt="" />
      </div>
      <div class="step">
        <img class="step-icon" :src="stepUploadIcon" alt="" />
        <div class="step-copy">
          <strong>第二步：上传企业名单</strong>
          <p>上传填写好的Excel文件进行批量查询</p>
        </div>
        <img class="step-arrow" :src="stepArrowIcon" alt="" />
      </div>
      <div class="step">
        <img class="step-icon" :src="stepExportIcon" alt="" />
        <div class="step-copy">
          <strong>第三步：导出查询结果</strong>
          <p>查看查询结果并一键导出Excel</p>
        </div>
      </div>
    </div>

    <a-upload-dragger
      class="upload-zone"
      accept=".xls,.xlsx,.csv"
      :max-count="1"
      :show-upload-list="true"
      :before-upload="beforeUpload"
    >
      <img class="upload-visual" :src="upload3dIcon" alt="" />
      <p class="upload-title">将文件拖拽到此处或 <em>点击上传</em></p>
      <p class="upload-sub">下载Excel示例文件并填充企业名录信息</p>
      <p class="upload-hint">
        文件大小不超过5M · 仅支持Excel格式(.xls/.xlsx) · 单次查询限500家企业
      </p>
      <a-button type="primary" class="pick-btn">选择文件</a-button>
    </a-upload-dragger>

    <slot />
  </div>
</template>

<style scoped lang="scss">
.batch-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.batch-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 24px 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.06);
}

.step {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 8px 28px;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: -22px;
    bottom: 16px;
    height: 167px;
    right: 0;
    width: 1px;
    border-right: 1px solid #d8d8d8;
  }
}

.step-icon {
  height: 109px;
  flex-shrink: 0;
  object-fit: contain;
}

.step-arrow {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 1;
  width: 20px;
  height: 20px;
  transform: translate(50%, -50%);
  background: #fff;
  object-fit: contain;
}

.step-copy {
  min-width: 0;
  padding-top: 2px;

  strong {
    display: block;
    margin-bottom: 6px;
    font-size: 18px;
    font-weight: 600;
    line-height: 22px;
    color: #262626;
  }

  p {
    margin: 0 0 10px;
    font-size: 14px;
    line-height: 20px;
    color: #333333;
  }
}

.upload-zone {
  padding: 48px 24px 40px;
  background: #f7fbff;
  border: 1px dashed #91caff !important;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.04);

  :deep(.ant-upload-drag) {
    background: transparent;
    border: none;
  }

  :deep(.ant-upload-btn) {
    padding: 0;
  }
}

.upload-visual {
  display: block;
  width: 222px;
  height: auto;
  margin: 0 auto 16px;
  object-fit: contain;
}

.upload-title {
  margin: 0 0 15px;
  font-size: 24px;
  color: #262626;

  em {
    font-style: normal;
    color: var(--pb-primary);
    font-weight: 600;
  }
}

.upload-sub,
.upload-hint {
  margin: 0;
  font-size: 24px;
  line-height: 20px;
  color: #8c8c8c;
}

.upload-hint {
  margin-top: 15px;
  font-size: 24px;
}

.pick-btn {
  margin-top: 31px;
  height: 36px;
  padding-inline: 28px;
  border-radius: 6px;
}

@include below-lg {
  .batch-steps {
    grid-template-columns: 1fr;
  }

  .step-arrow,
  .step:not(:last-child)::after {
    display: none;
  }
}
</style>
