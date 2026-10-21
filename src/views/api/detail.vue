<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import DetailPageShell from '@/components/common/DetailPageShell.vue'
import { findApiItem } from '@/views/api/catalog'
import { researchDoc, type ApiField } from '@/views/api/document'

defineOptions({ name: 'ApiDetail' })

interface FieldRow {
  field: ApiField
  depth: number
  key: string
}

const route = useRoute()
const doc = researchDoc
const activeStatus = ref(400)
const expanded = ref(new Set(['query:request']))

const current = computed(() => findApiItem(Number(route.params.id)))
const detailLabel = computed(() => (current.value ? doc.title : '接口详情'))

const isOpen = (key: string) => expanded.value.has(key)

const canExpand = (field: ApiField) => Boolean(field.children?.length)

const toggle = (key: string) => {
  const next = new Set(expanded.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expanded.value = next
}

const flatten = (fields: ApiField[], prefix: string, depth = 0): FieldRow[] => {
  const rows: FieldRow[] = []
  for (const field of fields) {
    const key = `${prefix}:${field.name}`
    rows.push({ field, depth, key })
    if (field.children?.length && expanded.value.has(key)) {
      rows.push(...flatten(field.children, prefix, depth + 1))
    }
  }
  return rows
}

const requestRows = computed(() => flatten(doc.params, 'query'))
const responseRows = computed(() => flatten(doc.responseParams, 'res'))
const responseExample = computed(
  () =>
    doc.responseParams.find((field) => field.example?.length)?.example ?? [],
)

const copyText = async (text: string, success: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success(success)
  } catch {
    message.error('复制失败，请手动选择文本复制')
  }
}

const requiredText = (value?: boolean) =>
  value === undefined ? '' : value ? 'true' : 'false'

const fieldLines = (fields: ApiField[], depth = 0): string[] => {
  const lines: string[] = []
  for (const field of fields) {
    const indent = '  '.repeat(depth)
    lines.push(
      [
        indent,
        '- ',
        field.name,
        field.description ? `：${field.description}` : '',
        '（',
        field.dataType,
        field.required === undefined
          ? ''
          : field.required
            ? '，必填'
            : '，非必填',
        '）',
      ].join(''),
    )
    if (field.children?.length) {
      lines.push(...fieldLines(field.children, depth + 1))
    }
  }
  return lines
}

const copyEndpoint = () => {
  void copyText(`${doc.method} ${doc.path}`, '已复制接口')
}

const copyAddress = () => {
  void copyText(doc.path, '已复制地址')
}

const copyDocument = () => {
  const statusLines = doc.statuses
    .map((item) => `| ${item.code} | ${item.text} | ${item.schema} |`)
    .join('\n')
  const text = [
    `# ${doc.title}`,
    '',
    `**接口地址**: \`${doc.path}\``,
    '',
    `**请求方式**: \`${doc.method}\``,
    '',
    `**请求数据类型**: \`${doc.requestContentType}\``,
    '',
    `**响应数据类型**: \`${doc.responseContentType}\``,
    '',
    '**请求参数**:',
    '',
    ...fieldLines(doc.params),
    '',
    '**响应状态**:',
    '',
    '| 状态码 | 说明 | schema |',
    '| --- | --- | --- |',
    statusLines,
    '',
    '**响应参数**:',
    '',
    ...fieldLines(doc.responseParams),
    '',
  ].join('\n')
  void copyText(text, '已复制文档')
}
</script>

<template>
  <DetailPageShell
    list-label="API接口目录"
    list-route="api"
    :detail-label="detailLabel"
    :empty="current ? '' : '未找到该接口'"
  >
    <article v-if="current" class="doc-card">
      <header class="doc-head">
        <h1>{{ doc.title }}</h1>
        <div class="doc-actions">
          <a-button class="copy-btn" @click="copyEndpoint">复制接口</a-button>
          <a-button class="copy-btn" @click="copyDocument">复制文档</a-button>
          <a-button class="copy-btn" @click="copyAddress">复制地址</a-button>
        </div>
      </header>

      <div class="endpoint">
        <span class="method">{{ doc.method }}</span>
        <span class="path">{{ doc.path }}</span>
      </div>
      <div class="meta-row">
        <span>
          请求数据类型
          <span class="meta-value">{{ doc.requestContentType }}</span>
        </span>
        <span>
          响应数据类型
          <span class="meta-value">{{ doc.responseContentType }}</span>
        </span>
      </div>

      <h2 class="section-title">请求参数</h2>
      <div class="table-wrap">
        <table class="doc-table">
          <colgroup>
            <col class="col-name" />
            <col class="col-desc" />
            <col class="col-type" />
            <col class="col-required" />
            <col class="col-datatype" />
            <col class="col-schema" />
          </colgroup>
          <thead>
            <tr>
              <th>参数名称</th>
              <th>参数说明</th>
              <th>请求类型</th>
              <th>是否必须</th>
              <th>数据类型</th>
              <th>schema</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in requestRows" :key="row.key">
              <td>
                <div
                  class="name-cell"
                  :style="{ paddingLeft: `${row.depth * 18}px` }"
                >
                  <button
                    v-if="canExpand(row.field)"
                    type="button"
                    class="switcher"
                    :aria-expanded="isOpen(row.key)"
                    @click="toggle(row.key)"
                  >
                    {{ isOpen(row.key) ? '−' : '+' }}
                  </button>
                  <span>{{ row.field.name }}</span>
                </div>
              </td>
              <td>{{ row.field.description }}</td>
              <td>{{ row.field.requestType }}</td>
              <td>
                <span
                  v-if="row.field.required !== undefined"
                  :class="row.field.required ? 'req-yes' : 'req-no'"
                >
                  {{ requiredText(row.field.required) }}
                </span>
              </td>
              <td>{{ row.field.dataType }}</td>
              <td>
                <span v-if="row.field.schema" class="schema">
                  {{ row.field.schema }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="section-title">响应状态</h2>
      <div class="table-wrap">
        <table class="doc-table">
          <colgroup>
            <col class="col-status" />
            <col class="col-status-text" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>状态码</th>
              <th>说明</th>
              <th>schema</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in doc.statuses" :key="item.code">
              <td>{{ item.code }}</td>
              <td>{{ item.text }}</td>
              <td>
                <span class="schema">{{ item.schema }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="status-tabs" role="tablist">
        <button
          v-for="item in doc.statuses"
          :key="item.code"
          type="button"
          role="tab"
          :class="{ active: item.code === activeStatus }"
          :aria-selected="item.code === activeStatus"
          @click="activeStatus = item.code"
        >
          {{ item.code }}
        </button>
      </div>

      <h2 class="section-title">响应参数</h2>
      <div class="table-wrap">
        <table class="doc-table">
          <colgroup>
            <col class="col-name" />
            <col class="col-desc-wide" />
            <col class="col-datatype" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>参数名称</th>
              <th>参数说明</th>
              <th>数据类型</th>
              <th>schema</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in responseRows" :key="row.key">
              <td>
                <div
                  class="name-cell"
                  :style="{ paddingLeft: `${row.depth * 18}px` }"
                >
                  <button
                    v-if="canExpand(row.field)"
                    type="button"
                    class="switcher"
                    :aria-expanded="isOpen(row.key)"
                    @click="toggle(row.key)"
                  >
                    {{ isOpen(row.key) ? '−' : '+' }}
                  </button>
                  <span>{{ row.field.name }}</span>
                </div>
              </td>
              <td>{{ row.field.description }}</td>
              <td>{{ row.field.dataType }}</td>
              <td>
                <span v-if="row.field.schema" class="schema">
                  {{ row.field.schema }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 v-if="responseExample.length" class="section-title">响应参数</h2>
      <div v-if="responseExample.length" class="example">
        <div
          v-for="(line, index) in responseExample"
          :key="index"
          class="ex-line"
        >
          <span class="ex-no">{{ index + 1 }}</span>
          <span class="ex-code">
            <span
              v-for="(part, partIndex) in line.tokens"
              :key="partIndex"
              :class="`tok-${part.kind}`"
              >{{ part.text }}</span
            >
          </span>
          <span class="ex-desc">{{ line.desc }}</span>
        </div>
      </div>
    </article>
  </DetailPageShell>
</template>

<style scoped lang="scss">
.doc-card {
  background: #fff;
  border-radius: var(--pb-radius-lg);
  box-shadow: var(--pb-shadow-card);
  padding: 20px 24px 28px;
}

.doc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #1f1f1f;
    line-height: 1.4;
  }
}

.doc-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.copy-btn {
  height: 30px;
  padding: 0 12px;
  border-color: #1677ff;
  border-radius: 4px;
  color: #1677ff;
  font-size: 16px;
  background: #fff;

  &:hover {
    border-color: #4096ff;
    color: #4096ff;
  }
}

.endpoint {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 8px 12px;
  border-radius: 2px;
  background: #f3f8ff;
}

.method {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 3px;
  background: #e6f4ff;
  color: #1677ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.path {
  color: #262626;
  font-size: 14px;
  word-break: break-all;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 40px;
  margin-top: 10px;
  color: #333333;
  font-size: 14px;
  line-height: 1.6;
}

.meta-value {
  margin-left: 8px;
  color: #595959;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 22px 0 12px;
  color: #1f1f1f;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;

  &::before {
    content: '';
    width: 3px;
    height: 22px;
    border-radius: 1px;
    background: #1677ff;
  }
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #e6eef6;
  border-radius: 4px;
}

.doc-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;

  th,
  td {
    padding: 11px 16px;
    border-bottom: 1px solid #eef2f6;
    color: #595959;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: #eaf3fc;
    color: #3a4a5c;
    font-weight: 500;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background: #f7fbff;
  }
}

.col-name {
  width: 18%;
}

.col-desc {
  width: 32%;
}

.col-desc-wide {
  width: 40%;
}

.col-type,
.col-required {
  width: 12%;
}

.col-datatype {
  width: 16%;
}

.col-schema {
  width: 16%;
}

.col-status {
  width: 18%;
}

.col-status-text {
  width: 42%;
}

.name-cell {
  display: flex;
  align-items: center;
  min-height: 22px;
  color: #262626;
}

.switcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  padding: 0;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  color: #595959;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    border-color: #1677ff;
    color: #1677ff;
  }
}

.req-yes {
  color: #f5222d;
}

.req-no {
  color: #8c8c8c;
}

.schema {
  color: #1677ff;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin-top: 12px;
  padding: 0 2px;

  button {
    padding: 0;
    border: none;
    background: transparent;
    color: #595959;
    font-size: 13px;
    line-height: 22px;
    cursor: pointer;

    &.active,
    &:hover {
      color: #1677ff;
    }

    &.active {
      font-weight: 600;
    }
  }
}

.example {
  padding: 8px 0 4px;
  border: 1px solid #e6eef6;
  border-radius: 4px;
  background: #f7f9fc;
}

.ex-line {
  display: grid;
  grid-template-columns: 42px minmax(280px, 1fr) 220px;
  align-items: center;
  min-height: 22px;
  font-size: 13px;
  line-height: 22px;

  &:hover {
    background: #e8f3ff;
  }
}

.ex-no {
  padding-right: 10px;
  color: #c0c4cc;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  text-align: right;
  user-select: none;
}

.ex-code {
  color: #333;
  font-family: Consolas, 'Courier New', monospace;
  white-space: pre;
}

.tok-key {
  color: #a626a4;
}

.tok-str,
.tok-bool {
  color: #c0392b;
}

.tok-num,
.tok-plain {
  color: #333;
}

.ex-desc {
  color: #8c8c8c;
  font-size: 13px;
}

@include below-lg {
  .doc-card {
    padding: 16px;
  }

  .doc-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .ex-line {
    grid-template-columns: 36px minmax(220px, 1fr) 160px;
  }
}
</style>
