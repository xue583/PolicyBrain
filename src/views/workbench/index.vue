<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  BankFilled,
  BulbFilled,
  EditFilled,
  FlagFilled,
  QuestionCircleFilled,
  SafetyCertificateFilled,
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import DeclareList from './DeclareList.vue'
import DeclareDetail from './DeclareDetail.vue'
import TransformList from './TransformList.vue'
import type { DeclarePolicy } from '@/mock/declare'
import robotImg from '@/assets/home/robot.png'
import bubbleIcon from '@/assets/workbench/wb-bubble.png'
import chevronDownIcon from '@/assets/workbench/wb-chevron-down.png'
import chevronRightIcon from '@/assets/workbench/wb-chevron-right.png'
import copyIcon from '@/assets/workbench/wb-copy.png'
import declareIcon from '@/assets/workbench/wb-declare.png'
import deleteIcon from '@/assets/workbench/wb-delete.png'
import dislikeIcon from '@/assets/workbench/wb-dislike.png'
import editIcon from '@/assets/workbench/wb-edit.png'
import filterIcon from '@/assets/workbench/wb-filter.png'
import financeIcon from '@/assets/workbench/wb-finance.png'
import industryIcon from '@/assets/workbench/wb-industry.png'
import likeIcon from '@/assets/workbench/wb-like.png'
import manageIcon from '@/assets/workbench/wb-manage.png'
import newChatIcon from '@/assets/workbench/wb-newchat.png'
import pinIcon from '@/assets/workbench/wb-pin.png'
import quotaIcon from '@/assets/workbench/wb-quota.png'
import regenerateIcon from '@/assets/workbench/wb-regenerate.png'
import sendIcon from '@/assets/workbench/wb-send.png'
import taskDocIcon from '@/assets/workbench/wb-task-doc.png'
import transformIcon from '@/assets/workbench/wb-transform.png'

defineOptions({ name: 'WorkbenchPage' })

const authStore = useAuthStore()

/** 企业身份(1)看企业视角，企服身份(2)看企服视角 */
const role = computed<'enterprise' | 'service'>(() =>
  Number(authStore.user?.identity) === 2 ? 'service' : 'enterprise',
)

const mainView = ref<'chat' | 'declare-list' | 'declare-detail' | 'transform'>(
  'chat',
)
const selectedPolicy = ref<DeclarePolicy | null>(null)

const openDetail = (policy: DeclarePolicy) => {
  selectedPolicy.value = policy
  mainView.value = 'declare-detail'
}

interface TaskItem {
  id: number
  name: string
  icon?: 'bubble' | 'doc'
}

interface AiBlock {
  heading?: string
  paragraphs: string[]
}

interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  text?: string
  blocks?: AiBlock[]
}

const sideMenus = [
  { key: 'new-chat', label: '新建对话', icon: bubbleIcon },
  { key: 'declare', label: '政策申报', icon: declareIcon },
  { key: 'transform', label: '成果转化', icon: transformIcon },
  { key: 'industry', label: '产业数据', icon: industryIcon },
  { key: 'finance', label: '科技金融', icon: financeIcon },
  { key: 'manage', label: '企业管理', icon: manageIcon },
]

let taskSeed = 0
const nextTaskId = () => ++taskSeed

const initialPinnedTasks = (): TaskItem[] => [
  { id: nextTaskId(), name: '开发郑大一附院项目成果系统' },
  { id: nextTaskId(), name: '产投项目展示' },
  { id: nextTaskId(), name: '企业政策大脑1.0需求梳理' },
]

const initialTasks = (): TaskItem[] => [
  { id: nextTaskId(), name: '视频生成', icon: 'bubble' },
  { id: nextTaskId(), name: '管理系统项目', icon: 'doc' },
  {
    id: nextTaskId(),
    name: '「江苏沃得机电集团有限公司」政策匹配',
    icon: 'doc',
  },
  { id: nextTaskId(), name: '近五年烘培市场超单品月度排名', icon: 'bubble' },
]

const initialMessages = (): ChatMessage[] => [
  { id: 1, role: 'user', text: '杭州市西湖区有什么最新政策吗?' },
  {
    id: 2,
    role: 'ai',
    blocks: [
      {
        paragraphs: ['以下是杭州市西湖区近期最新政策动态整理：'],
      },
      {
        heading: '一、推动经济高质量发展综合性政策基地',
        paragraphs: [
          '西湖区已落实杭州市政府印发的《推动经济高质量发展若干政策(2026年版)》，该政策共计48条，内容覆盖教育科技人才一体化发展、先进制造业升级、数字经济创新等多个核心领域，针对西湖区重点产业发展、企业创新投入、人才引进培育等方面提供系统性政策支持，目前相关解读文件已公开，辖区企业可对应政策条款申请相关扶持。',
        ],
      },
      {
        heading: '二、碳达峰碳中和与建筑业专项扶持资金启动',
        paragraphs: [
          '西湖区公示下达了2026年第一批碳达峰碳中和专项奖补资金，同时启动了2025年度西湖区建筑业发展专项资金申报工作，对符合条件的绿色低碳项目、建筑业企业给予资金奖补，支持辖区产业绿色转型与建筑业高质量发展，相关申报通知可在西湖区政府官网查询。',
        ],
      },
    ],
  },
]

const initialSuggestions = (): string[] => [
  '西湖区企业能申请哪些奖补资金？',
  '碳达峰碳中和专项奖补怎么申报？',
]

/** 欢迎页推荐问题 */
const recommendedQuestions = [
  {
    icon: QuestionCircleFilled,
    color: '#ff9c2e',
    text: '2026年高新技术企业申报条件是什么？',
  },
  {
    icon: BulbFilled,
    color: '#52c41a',
    text: '如何申报郑州市工程技术研究中心？',
  },
  {
    icon: BankFilled,
    color: '#2f7bf5',
    text: '郑州市对人工智能企业有什么补贴？',
  },
  {
    icon: FlagFilled,
    color: '#2f7bf5',
    text: '郑州市专精特新企业有哪些扶持政策？',
  },
  {
    icon: EditFilled,
    color: '#ff9c2e',
    text: '河南省最新的科技创新政策有哪些？',
  },
  {
    icon: SafetyCertificateFilled,
    color: '#52c41a',
    text: '企业如何申报绿色工厂？',
  },
]

const pinnedTasks = ref<TaskItem[]>(initialPinnedTasks())
const tasks = ref<TaskItem[]>(initialTasks())
/** 初始为空 → 欢迎页；点击任务或发送消息后进入会话 */
const messages = ref<ChatMessage[]>([])
const suggestions = ref<string[]>(initialSuggestions())

const inConversation = computed(() => messages.value.length > 0)

const activeTaskId = ref<number | null>(pinnedTasks.value[0]?.id ?? null)
/** 侧栏高亮跟随主区视图，避免点击态与视图脱节 */
const activeMenu = computed(() => {
  if (mainView.value === 'chat') return 'new-chat'
  if (mainView.value === 'transform') return 'transform'
  return 'declare'
})
const topic = ref('话题任务名称')
const quotaTotal = 20
const quotaLeft = ref(quotaTotal)
const inputText = ref('')

const scrollRef = ref<HTMLElement | null>(null)

const renameOpen = ref(false)
const renameValue = ref('')
const renameTarget = ref<TaskItem | null>(null)

const scrollToBottom = () => {
  void nextTick(() => {
    const el = scrollRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

const resetConversation = () => {
  messages.value = []
  suggestions.value = initialSuggestions()
  quotaLeft.value = quotaTotal
  inputText.value = ''
}

/** 点击置顶/任务列表 → 打开对应会话记录 */
const onTaskClick = (task: TaskItem) => {
  activeTaskId.value = task.id
  messages.value = initialMessages()
  suggestions.value = initialSuggestions()
  mainView.value = 'chat'
  scrollToBottom()
}

const onMenuClick = (key: string) => {
  if (key === 'declare') {
    mainView.value = 'declare-list'
    return
  }
  if (key === 'transform') {
    mainView.value = 'transform'
    return
  }
  mainView.value = 'chat'
  if (key === 'new-chat') resetConversation()
}

const sendText = (raw: string) => {
  const text = raw.trim()
  if (!text) return
  messages.value.push({ id: Date.now(), role: 'user', text })
  inputText.value = ''
  if (quotaLeft.value > 0) quotaLeft.value -= 1
  scrollToBottom()
}

const onSend = () => {
  sendText(inputText.value)
}

const onSuggestionClick = (text: string) => {
  suggestions.value = suggestions.value.filter((s) => s !== text)
  sendText(text)
}

const onCopy = async (msg: ChatMessage) => {
  const content = (msg.blocks ?? [])
    .map((block) =>
      [block.heading, ...block.paragraphs].filter(Boolean).join('\n'),
    )
    .join('\n\n')
  try {
    await navigator.clipboard.writeText(content)
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败，请手动选择文本复制')
  }
}

const openRename = (task: TaskItem) => {
  renameTarget.value = task
  renameValue.value = task.name
  renameOpen.value = true
}

const confirmRename = () => {
  const name = renameValue.value.trim()
  if (renameTarget.value && name) {
    renameTarget.value.name = name
  }
  renameOpen.value = false
}

const onPinTask = (task: TaskItem) => {
  const inTasks = tasks.value.indexOf(task)
  if (inTasks > -1) tasks.value.splice(inTasks, 1)
  const inPinned = pinnedTasks.value.indexOf(task)
  if (inPinned > -1) pinnedTasks.value.splice(inPinned, 1)
  pinnedTasks.value.unshift(task)
}

const onDeleteTask = (task: TaskItem) => {
  const pinnedIndex = pinnedTasks.value.indexOf(task)
  if (pinnedIndex > -1) pinnedTasks.value.splice(pinnedIndex, 1)
  const taskIndex = tasks.value.indexOf(task)
  if (taskIndex > -1) tasks.value.splice(taskIndex, 1)
}

const onMenuAction = (task: TaskItem, action: string) => {
  if (action === 'pin') onPinTask(task)
  if (action === 'rename') openRename(task)
  if (action === 'delete') onDeleteTask(task)
}

const taskRowIcon = (task: TaskItem) =>
  task.icon === 'doc' ? taskDocIcon : bubbleIcon
</script>

<template>
  <div class="workbench">
    <aside class="workbench-side">
      <h1 class="side-title">工作台</h1>

      <nav class="side-nav">
        <a
          v-for="menu in sideMenus"
          :key="menu.key"
          class="side-nav-item"
          :class="{ 'is-active': activeMenu === menu.key }"
          @click="onMenuClick(menu.key)"
        >
          <img :src="menu.icon" alt="" class="nav-icon" />
          <span>{{ menu.label }}</span>
        </a>
      </nav>

      <div class="side-section">
        <div class="section-head">
          <span class="section-label">置顶</span>
          <img :src="chevronDownIcon" alt="" class="section-chevron" />
        </div>
        <div
          v-for="task in pinnedTasks"
          :key="task.id"
          class="task-row"
          :class="{ 'is-active': activeTaskId === task.id }"
          @click="onTaskClick(task)"
        >
          <img :src="pinIcon" alt="" class="task-icon" />
          <span class="task-name">{{ task.name }}</span>
          <a-dropdown trigger="['click']" placement="bottomRight">
            <span class="task-more" @click.stop>⋮</span>
            <template #overlay>
              <a-menu
                class="task-menu"
                @click="
                  ({ key }: { key: string | number }) =>
                    onMenuAction(task, String(key))
                "
              >
                <a-menu-item key="pin">
                  <img :src="pinIcon" alt="" class="menu-icon" />
                  <span>置顶任务</span>
                </a-menu-item>
                <a-menu-item key="rename">
                  <img :src="editIcon" alt="" class="menu-icon" />
                  <span>重命名</span>
                </a-menu-item>
                <a-menu-item key="delete" class="is-danger">
                  <img :src="deleteIcon" alt="" class="menu-icon" />
                  <span>删除任务</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>

      <div class="side-section">
        <div class="section-head">
          <span class="section-label">任务列表</span>
          <img :src="chevronDownIcon" alt="" class="section-chevron" />
          <span class="section-tools">
            <img :src="editIcon" alt="编辑" class="tool-icon" />
            <img :src="filterIcon" alt="筛选" class="tool-icon" />
          </span>
        </div>
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-row"
          :class="{ 'is-active': activeTaskId === task.id }"
          @click="onTaskClick(task)"
        >
          <img :src="taskRowIcon(task)" alt="" class="task-icon" />
          <span class="task-name">{{ task.name }}</span>
          <a-dropdown trigger="['click']" placement="bottomRight">
            <span class="task-more" @click.stop>⋮</span>
            <template #overlay>
              <a-menu
                class="task-menu"
                @click="
                  ({ key }: { key: string | number }) =>
                    onMenuAction(task, String(key))
                "
              >
                <a-menu-item key="pin">
                  <img :src="pinIcon" alt="" class="menu-icon" />
                  <span>置顶任务</span>
                </a-menu-item>
                <a-menu-item key="rename">
                  <img :src="editIcon" alt="" class="menu-icon" />
                  <span>重命名</span>
                </a-menu-item>
                <a-menu-item key="delete" class="is-danger">
                  <img :src="deleteIcon" alt="" class="menu-icon" />
                  <span>删除任务</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </aside>

    <main class="workbench-main">
      <template v-if="mainView === 'chat'">
        <div
          ref="scrollRef"
          class="chat-scroll"
          :class="{ 'is-welcome': !inConversation }"
        >
          <div v-if="inConversation" class="chat-column">
            <a-dropdown trigger="['click']">
              <button type="button" class="topic-chip">
                <span>{{ topic }}</span>
                <img :src="chevronDownIcon" alt="" class="topic-chevron" />
              </button>
              <template #overlay>
                <a-menu>
                  <a-menu-item
                    v-for="t in [...pinnedTasks, ...tasks]"
                    :key="t.id"
                    @click="topic = t.name"
                  >
                    {{ t.name }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

            <template v-for="msg in messages" :key="msg.id">
              <div v-if="msg.role === 'user'" class="msg-user">
                {{ msg.text }}
              </div>
              <div v-else class="msg-ai">
                <img :src="robotImg" alt="" class="ai-avatar" />
                <div class="ai-card">
                  <div class="ai-content">
                    <template v-for="(block, i) in msg.blocks" :key="i">
                      <h3 v-if="block.heading" class="ai-heading">
                        {{ block.heading }}
                      </h3>
                      <p v-for="(p, j) in block.paragraphs" :key="`${i}-${j}`">
                        {{ p }}
                      </p>
                    </template>
                  </div>
                  <div class="ai-actions">
                    <a class="action-btn" @click="onCopy(msg)">
                      <img :src="copyIcon" alt="" class="action-icon" />
                      <span>复制</span>
                    </a>
                    <a class="action-btn">
                      <img :src="regenerateIcon" alt="" class="action-icon" />
                      <span>重新生成</span>
                    </a>
                    <span class="action-feedback">
                      <a class="feedback-btn">
                        <img :src="likeIcon" alt="赞同" class="feedback-icon" />
                      </a>
                      <a class="feedback-btn">
                        <img
                          :src="dislikeIcon"
                          alt="反对"
                          class="feedback-icon"
                        />
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <div v-if="suggestions.length" class="msg-suggestions">
              <button
                v-for="text in suggestions"
                :key="text"
                type="button"
                class="suggestion-btn"
                @click="onSuggestionClick(text)"
              >
                <span>{{ text }}</span>
                <img :src="chevronRightIcon" alt="" class="suggestion-arrow" />
              </button>
            </div>
          </div>

          <div v-else class="welcome">
            <div class="welcome-hero">
              <img :src="robotImg" alt="" class="welcome-avatar" />
              <h1 class="welcome-title">小通AI 智答</h1>
              <p class="welcome-sub">
                基于郑州市政策数据库，为您提供智能政策咨询与申报指导
              </p>
            </div>
            <div class="welcome-panel">
              <h3 class="welcome-label">推荐问题</h3>
              <div class="recommend-grid">
                <button
                  v-for="q in recommendedQuestions"
                  :key="q.text"
                  type="button"
                  class="recommend-chip"
                  @click="sendText(q.text)"
                >
                  <component
                    :is="q.icon"
                    class="chip-q-icon"
                    :style="{ color: q.color }"
                  />
                  <span>{{ q.text }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-footer">
          <div
            class="chat-footer-inner"
            :class="{ 'is-narrow': !inConversation }"
          >
            <button
              v-if="inConversation"
              type="button"
              class="new-chat-btn"
              @click="resetConversation"
            >
              <img :src="newChatIcon" alt="" class="new-chat-icon" />
              <span>新建对话</span>
            </button>
            <div class="chat-input">
              <a-textarea
                v-model:value="inputText"
                placeholder="输入问题或任务"
                :auto-size="{ minRows: 1, maxRows: 4 }"
                :bordered="false"
                class="chat-textarea"
                @keydown.enter.exact.prevent="onSend"
              />
              <div class="input-toolbar">
                <span class="quota">
                  <img :src="quotaIcon" alt="" class="quota-icon" />
                  <span>剩余{{ quotaLeft }}/{{ quotaTotal }}次</span>
                </span>
                <a
                  class="send-btn"
                  :class="{ 'is-disabled': !inputText.trim() }"
                  @click="onSend"
                >
                  <img :src="sendIcon" alt="发送" class="send-icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </template>

      <DeclareList
        v-else-if="mainView === 'declare-list'"
        :role="role"
        @select="openDetail"
      />
      <DeclareDetail
        v-else-if="mainView === 'declare-detail' && selectedPolicy"
        :policy="selectedPolicy"
        :role="role"
        @back="mainView = 'declare-list'"
      />
      <TransformList v-else-if="mainView === 'transform'" />
    </main>

    <a-modal
      v-model:open="renameOpen"
      title="重命名任务"
      :width="420"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmRename"
    >
      <a-input v-model:value="renameValue" placeholder="请输入任务名称" />
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.workbench {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #eff3fa;
}

.workbench-side {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 280px;
  padding-bottom: 24px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #eef0f4;
}

.side-title {
  margin: 0;
  padding: 20px 0;
  color: var(--pb-primary);
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid var(--pb-line);
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 12px 8px;
}

.side-nav-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  color: #333;
  font-size: 15px;
  line-height: 1.4;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
    background: #f5f8fd;
  }

  &.is-active {
    color: #fff;
    background: var(--pb-primary);

    .nav-icon {
      filter: brightness(0) invert(1);
    }
  }
}

.nav-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.side-section {
  margin-top: 20px;
  padding: 0 12px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  margin-bottom: 8px;
}

.section-label {
  color: var(--pb-muted);
  font-size: 13px;
  line-height: 1;
}

.section-chevron {
  width: 12px;
  height: 12px;
  object-fit: contain;
  opacity: 0.7;
}

.section-tools {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.tool-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  cursor: pointer;

  &:hover {
    opacity: 0.75;
  }
}

.task-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover,
  &.is-active {
    background: #eef2f9;
  }
}

.task-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.task-name {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.task-more {
  flex-shrink: 0;
  padding: 0 4px;
  margin-left: auto;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s ease;

  &:hover {
    color: var(--pb-primary);
  }
}

.task-row:hover .task-more,
.task-row.is-active .task-more {
  opacity: 1;
}

.task-menu {
  .menu-icon {
    width: 15px;
    height: 15px;
    margin-right: 8px;
    vertical-align: -2px;
  }

  &.ant-menu .ant-menu-item.is-danger {
    color: #ff4d4f;
  }
}

.workbench-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.chat-column {
  display: flex;
  flex-direction: column;
  max-width: 860px;
  margin: 0 auto;
}

.chat-scroll.is-welcome {
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(
      720px 420px at 12% 8%,
      rgba(208, 227, 252, 0.8),
      transparent 62%
    ),
    radial-gradient(
      640px 400px at 88% 14%,
      rgba(203, 224, 251, 0.7),
      transparent 60%
    ),
    radial-gradient(
      900px 460px at 50% 112%,
      rgba(216, 232, 253, 0.9),
      transparent 66%
    ),
    linear-gradient(180deg, #edf3fd 0%, #f3f7fd 55%, #eff3fa 100%);
}

.welcome {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.welcome-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 72px;
}

.welcome-avatar {
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.welcome-title {
  margin: 12px 0 0;
  font-size: 26px;
  font-weight: 600;
  background: linear-gradient(0deg, #2151a2 0%, #2fabe0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.welcome-sub {
  margin: 12px 0 0;
  color: #666;
  font-size: 14px;
}

.welcome-panel {
  margin-top: 46px;
}

.welcome-label {
  margin: 0 0 14px;
  color: #1f1f1f;
  font-size: 15px;
  font-weight: 600;
}

.recommend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.recommend-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  color: #333;
  font-size: 11.5px;
  white-space: nowrap;
  background: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(31, 56, 88, 0.06);
  cursor: pointer;
  transition:
    color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: var(--pb-primary);
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.12);
  }
}

.chip-q-icon {
  flex-shrink: 0;
  font-size: 13px;
}

.topic-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: center;
  margin-bottom: 28px;
  padding: 9px 16px;
  color: #333;
  font-size: 14px;
  background: #e7ebf2;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #dfe5ee;
  }
}

.topic-chevron {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.msg-user {
  align-self: flex-end;
  max-width: 62%;
  margin-bottom: 24px;
  padding: 11px 16px;
  color: #1f1f1f;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  background: #cfe2fc;
  border-radius: 8px;
}

.msg-ai {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
}

.ai-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.ai-card {
  min-width: 0;
  padding: 18px 22px;
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--pb-shadow-card);
}

.ai-content {
  color: #333;
  font-size: 15px;
  line-height: 1.9;

  p {
    margin: 0 0 8px;
  }

  .ai-heading {
    margin: 14px 0 8px;
    color: #1f1f1f;
    font-size: 15px;
    font-weight: 600;

    &:first-child {
      margin-top: 0;
    }
  }

  p:last-child {
    margin-bottom: 0;
  }
}

.ai-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 16px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    color: var(--pb-primary);
  }
}

.action-icon {
  width: 15px;
  height: 15px;
  object-fit: contain;
}

.action-feedback {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
}

.feedback-btn {
  display: inline-flex;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.feedback-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.msg-suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.suggestion-btn {
  display: inline-flex;
  align-items: center;
  gap: 24px;
  padding: 12px 18px;
  color: #333;
  font-size: 14px;
  text-align: left;
  background: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: var(--pb-shadow-card);
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f7faff;
  }
}

.suggestion-arrow {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.chat-footer {
  padding: 8px 32px 24px;
}

.chat-footer-inner {
  max-width: 860px;
  margin: 0 auto;

  &.is-narrow {
    max-width: 620px;
  }
}

.new-chat-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 18px;
  color: #333;
  font-size: 14px;
  background: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: var(--pb-shadow-card);
  cursor: pointer;

  &:hover {
    background: #f7faff;
  }
}

.new-chat-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.chat-input {
  padding: 14px 18px 10px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(31, 56, 88, 0.06);
}

.chat-textarea {
  padding: 0;
  font-size: 15px;
  line-height: 1.6;
}

.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.quota {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--pb-primary);
  font-size: 15px;
}

.quota-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.send-btn {
  display: inline-flex;
  cursor: pointer;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
}

.send-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

@include below-lg {
  .workbench-side {
    display: none;
  }

  .chat-scroll,
  .chat-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
