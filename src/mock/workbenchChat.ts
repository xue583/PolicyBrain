/**
 * 工作台历史会话 mock —— 置顶/任务列表的每个菜单对应一份独立聊天数据，
 * 点击侧栏任务即切换到对应会话。文案为合理占位，非设计稿内容。
 */

export interface AiBlock {
  heading?: string
  paragraphs: string[]
}

export interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  text?: string
  blocks?: AiBlock[]
}

export interface ConversationData {
  messages: ChatMessage[]
  suggestions: string[]
}

const conversationMap: Record<string, ConversationData> = {
  开发郑大一附院项目成果系统: {
    messages: [
      {
        id: 1,
        role: 'user',
        text: '郑大一附院项目成果系统这周的开发计划是什么？',
      },
      {
        id: 2,
        role: 'ai',
        blocks: [
          {
            heading: '一、本周开发计划',
            paragraphs: [
              '成果录入模块本周完成表单联调，支持成果类型、完成单位与参与人字段的保存；',
              '审核流转模块完成科室初审与院级复审两级流程的页面开发，并接入消息提醒。',
            ],
          },
          {
            heading: '二、风险与依赖',
            paragraphs: [
              '科研处成果数据接口仍在等院方返回字段确认，可能影响周五联调；',
              '需要信息中心提前开通测试环境的单点登录权限。',
            ],
          },
        ],
      },
    ],
    suggestions: [
      '成果录入模块的接口文档发我一下',
      '把联调环境的问题整理成清单',
    ],
  },

  产投项目展示: {
    messages: [
      { id: 1, role: 'user', text: '产投项目展示页需要突出哪些核心指标？' },
      {
        id: 2,
        role: 'ai',
        blocks: [
          {
            heading: '一、核心展示指标',
            paragraphs: [
              '建议突出在谈项目数、签约项目数与拟投资总额三个总量指标；',
              '按产业方向展示项目分布，重点标注先进制造与新能源类项目。',
            ],
          },
          {
            heading: '二、页面结构建议',
            paragraphs: [
              '顶部放总量指标卡片，中部按产业分类展示项目列表；',
              '每个项目卡片展示投资额、进度阶段与对接责任人。',
            ],
          },
        ],
      },
    ],
    suggestions: ['帮我出一版指标卡片的文案', '项目列表按投资额排序怎么实现'],
  },

  '企业政策大脑1.0需求梳理': {
    messages: [
      { id: 1, role: 'user', text: '企业政策大脑1.0的需求清单梳理到哪了？' },
      {
        id: 2,
        role: 'ai',
        blocks: [
          {
            heading: '一、已完成部分',
            paragraphs: [
              '政策匹配、申报助手两个核心模块的需求已评审通过；',
              '企业画像与消息提醒模块的原型初稿已完成。',
            ],
          },
          {
            heading: '二、待确认事项',
            paragraphs: [
              '政策数据更新频率需要与数据组确认；',
              '企服端与企业端的权限边界待下周例会对齐。',
            ],
          },
        ],
      },
    ],
    suggestions: ['把待确认事项整理成会议议题', '政策匹配模块的评审纪要发一下'],
  },

  视频生成: {
    messages: [
      { id: 1, role: 'user', text: '帮我生成一条30秒的科技政策宣传片脚本' },
      {
        id: 2,
        role: 'ai',
        blocks: [
          {
            heading: '一、脚本分镜',
            paragraphs: [
              '0-10秒：城市航拍，字幕"政策直达，服务上门"；',
              '10-20秒：企业办事场景，突出线上申报一键直达；',
              '20-30秒：政策大脑界面展示与落款。',
            ],
          },
          {
            heading: '二、配音文案',
            paragraphs: [
              '郑州市科技政策一站汇聚，申报进度实时可查，让政策红利精准直达每一家企业。',
            ],
          },
        ],
      },
    ],
    suggestions: ['换成一分钟版本', '生成一条更活泼的版本'],
  },

  管理系统项目: {
    messages: [
      { id: 1, role: 'user', text: '管理系统项目这周有哪些政策申报提醒？' },
      {
        id: 2,
        role: 'ai',
        blocks: [
          {
            heading: '一、本周申报提醒',
            paragraphs: [
              '郑州市工程技术研究中心认定申报将于本周五截止，材料还差审计报告；',
              '高新技术企业重新认定名单已公示，注意跟进备案材料。',
            ],
          },
          {
            heading: '二、处理建议',
            paragraphs: [
              '优先补齐工程中心申报的审计报告，联系财务今天出初稿。',
            ],
          },
        ],
      },
    ],
    suggestions: ['把截止提醒同步到项目群', '看看下周还有哪些申报'],
  },

  '「江苏沃得机电集团有限公司」政策匹配': {
    messages: [
      {
        id: 1,
        role: 'user',
        text: '江苏沃得机电集团有限公司适合申报哪些政策？',
      },
      {
        id: 2,
        role: 'ai',
        blocks: [
          {
            heading: '一、匹配结果',
            paragraphs: [
              '省级专精特新中小企业认定（符合度：高）——企业近两年研发投入达标；',
              '智能制造示范工厂奖补（符合度：中）——需补充智能化改造投入明细。',
            ],
          },
          {
            heading: '二、申报建议',
            paragraphs: [
              '优先申报专精特新认定，窗口期本月底截止；',
              '智改奖补建议下批次再报，先完善佐证材料。',
            ],
          },
        ],
      },
    ],
    suggestions: ['导出这份匹配报告', '专精特新认定的申报条件展开看看'],
  },

  近五年烘培市场超单品月度排名: {
    messages: [
      {
        id: 1,
        role: 'user',
        text: '近五年烘培市场超单品月度排名的趋势是怎样的？',
      },
      {
        id: 2,
        role: 'ai',
        blocks: [
          {
            heading: '一、整体趋势',
            paragraphs: [
              '短保烘焙类超单品连续五年占据月度榜首，市场份额稳步提升；',
              '常温蛋糕类单品排名波动较大，节日营销期间冲榜明显。',
            ],
          },
          {
            heading: '二、关键结论',
            paragraphs: [
              '头部单品集中度逐年提高，建议关注前五名单品的上新节奏。',
            ],
          },
        ],
      },
    ],
    suggestions: ['导出近五年排名明细', '看看咖啡搭配品类的表现'],
  },
}

/** 按任务名取会话数据；未登记的任务返回通用占位会话 */
export const buildConversation = (taskName: string): ConversationData => {
  const known = conversationMap[taskName]
  if (known) return known
  return {
    messages: [
      {
        id: 1,
        role: 'user',
        text: `关于「${taskName}」，帮我整理一下目前的进展`,
      },
      {
        id: 2,
        role: 'ai',
        blocks: [
          {
            heading: '一、当前进展',
            paragraphs: [
              `「${taskName}」相关资料已完成初步梳理，关键节点与责任人已对齐；`,
              '详细进度与待办事项可在任务详情中查看。',
            ],
          },
          {
            heading: '二、下一步建议',
            paragraphs: ['建议先明确本阶段交付物与时间节点，再拆解执行计划。'],
          },
        ],
      },
    ],
    suggestions: ['整理一份任务时间线', '看看还有哪些未完成事项'],
  }
}
