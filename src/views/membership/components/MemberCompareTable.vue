<script setup lang="ts">
import markNone from '@/assets/membership/enterprise/mark-none.png'
import markVip from '@/assets/membership/enterprise/mark-vip.png'
import markSvip from '@/assets/membership/enterprise/mark-svip.png'
import sectionApp from '@/assets/membership/enterprise/section-app.png'

defineOptions({ name: 'MemberCompareTable' })

type CompareMark = 'none' | 'vip' | 'svip'
type CompareCell = { icon?: string; note?: string }
type CompareRow =
  | { kind: 'section'; label: string; img?: string; icon?: string }
  | {
      kind: 'feature'
      label: string
      normal: CompareCell
      vip: CompareCell
      svip: CompareCell
    }

// 单元格内容：会员标记图、文字说明，或留空
type CellSpec = CompareMark | 'declare' | 'limit' | 'empty'

const declareNote = '1次/年(可单独购买)'
const limitNote = '前五条'

const glyphNews =
  'M6 2.5h7.6l4.8 4.8v12.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2zM8 9.5h8v1.6H8zM8 12.9h8v1.6H8zM8 16.3h5v1.6H8z'
const glyphPolicyDb =
  'M4.8 5a7.2 2.5 0 1 0 14.4 0a7.2 2.5 0 1 0-14.4 0zM4.8 7.6v4.4a7.2 2.5 0 0 0 14.4 0V7.6zM4.8 13.6v4.4a7.2 2.5 0 0 0 14.4 0v-4.4z'
const glyphEntDb =
  'M5.5 21V6.5L12 3l6.5 3.5V21H21v1.7H3V21zM7.5 8.5h2v2h-2zM14.5 8.5h2v2h-2zM7.5 12.5h2v2h-2zM14.5 12.5h2v2h-2zM7.5 16.5h2v2h-2zM14.5 16.5h2v2h-2z'
const glyphFileLib =
  'M3 8V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2H3zM3 10h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z'
const glyphExtData =
  'M4 20.5h16v1.8H4zM6.5 20.5V11.5h3.2v9zM10.9 20.5V7h3.2v13.5zM15.3 20.5v-6.1h3.2v6.1z'

const markImages: Record<CompareMark, string> = {
  none: markNone,
  vip: markVip,
  svip: markSvip,
}

const compareCell = (spec: CellSpec): CompareCell => {
  if (spec === 'declare') return { note: declareNote }
  if (spec === 'limit') return { note: limitNote }
  if (spec === 'empty') return {}
  return { icon: markImages[spec] }
}

// 普通会员列固定为灰色不可用，VIP/SVIP 列默认可用，例外情况显式传入
const feature = (
  label: string,
  vip: CellSpec = 'vip',
  svip: CellSpec = 'svip',
): CompareRow => ({
  kind: 'feature',
  label,
  normal: { icon: markImages.none },
  vip: compareCell(vip),
  svip: compareCell(svip),
})

const cellKeys = ['normal', 'vip', 'svip'] as const

const compareRows: CompareRow[] = [
  { kind: 'feature', label: '多账号统一管理', normal: {}, vip: {}, svip: {} },
  { kind: 'section', label: '功能应用', img: sectionApp },
  feature('高级搜索', 'none'),
  feature('数据导出'),
  feature('批量查询'),
  feature('智能申报', 'declare', 'declare'),
  feature('政策汇编'),
  feature('城市对比'),
  feature('政策对比'),
  feature('数据大屏'),
  feature('管理系统(标准版)'),
  feature('匹配政策(企业找政策)'),
  feature('匹配企业(政策找企业)'),
  feature('政策大脑文库上传'),
  feature('政策大脑文库下载'),

  { kind: 'section', label: '政策资讯', icon: glyphNews },
  feature('正文查看'),
  feature('政府原文跳转'),
  feature('政策数据库跳转'),

  { kind: 'section', label: '政策数据库', icon: glyphPolicyDb },
  feature('政策搜索', 'none'),
  feature('政策筛选'),
  feature('关注政策'),
  feature('支持领域'),
  feature('依据文件'),
  feature('依据文件跳转'),
  feature('申报条件'),
  feature('申报入口或材料'),
  feature('最新动态', 'limit'),
  feature('最新动态跳转'),
  feature('支持力度', 'limit'),
  feature('支持力度跳转'),
  feature('公示名单', 'limit'),
  feature('公示名单跳转业务线索'),
  feature('业务线索跳转'),

  { kind: 'section', label: '企业数据库', icon: glyphEntDb },
  feature('企业检索', 'none'),
  feature('企业筛选'),
  feature('企业导出'),
  feature('关注企业'),
  feature('企业获得政策'),
  feature('企业获得政策跳转'),
  feature('企业获得政策筛选'),
  feature('工商信息'),
  feature('股东信息'),
  feature('联系方式'),
  feature('知识产权'),
  feature('资质证书'),
  feature('招投标'),
  feature('经营异常'),
  feature('信息变动'),

  { kind: 'section', label: '政策文件库', icon: glyphFileLib },
  feature('政策文件搜索'),
  feature('政策文件筛选'),
  feature('政策文件原文(截图)'),
  feature('政策文件跳转'),

  { kind: 'section', label: '延伸数据', icon: glyphExtData },
  feature('专利成果'),
  feature('研发平台'),
  feature('研发项目'),
  feature('创业载体'),
]
</script>

<template>
  <section class="compare">
    <h2>会员权益明细对比</h2>
    <div class="compare-table">
      <div class="compare-head">
        <div class="col-label">
          <strong>权益对比</strong>
          <small>升级会员，立领多项特权</small>
        </div>
        <div class="col-normal">
          <strong>普通会员</strong>
          <small>登录即可畅享服务</small>
        </div>
        <div class="col-vip">
          <strong>VIP会员</strong>
          <span class="compare-pill gold">尊享50+项权益</span>
        </div>
        <div class="col-svip">
          <strong>SVIP会员</strong>
          <span class="compare-pill blue">尊享额外价格优惠</span>
        </div>
      </div>
      <div
        v-for="(row, index) in compareRows"
        :key="row.kind === 'section' ? row.label : `${row.label}-${index}`"
        class="compare-row"
        :class="row.kind"
      >
        <template v-if="row.kind === 'section'">
          <div class="compare-section">
            <img v-if="row.img" :src="row.img" alt="" />
            <svg
              v-else
              class="section-glyph"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path :d="row.icon" fill="currentColor" fill-rule="evenodd" />
            </svg>
            {{ row.label }}
          </div>
          <div class="col-normal" />
          <div class="col-vip" />
          <div class="col-svip" />
        </template>
        <template v-else>
          <div class="col-label">{{ row.label }}</div>
          <div v-for="key in cellKeys" :key="key" :class="`col-${key}`">
            <img v-if="row[key].icon" :src="row[key].icon" alt="" />
            <span v-if="row[key].note" class="cell-note">{{
              row[key].note
            }}</span>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.compare {
  margin-top: 24px;
  padding: 36px 28px 28px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(4, 24, 63, 0.16);

  h2 {
    margin: 0 0 28px;
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #1f2a37;
  }
}

.compare-table {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1fr 1fr;
}

.compare-head,
.compare-row {
  display: contents;
}

.compare-head > div,
.compare-row > div {
  min-height: 48px;
  padding: 10px 16px;
  border-top: 1px solid #eef1f6;
  border-left: 1px solid #eef1f6;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  color: #3c4656;
  background: #fff;
}

.compare-head > div:first-child,
.compare-row > div:first-child,
.compare-section {
  border-left: 0;
  justify-content: flex-start;
  text-align: left;
  align-items: center;
}

.compare-head > div {
  min-height: 96px;
  border-top: 0;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  strong {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  }

  small {
    font-size: 12px;
    color: #9aa3af;
  }
}

.compare-head .col-label {
  align-items: flex-start;
  background: #fafdff;
  border-radius: 16px 16px 0 0;

  strong {
    color: #1f2a37;
  }
}

.compare-head .col-normal {
  background: #fafdff;
  border-radius: 16px 16px 0 0;
}

.compare-head .col-vip {
  position: relative;
  color: #d08a2a;
  background: radial-gradient(
    ellipse 90% 80% at 50% 0%,
    #ffd9a0 0%,
    #fff3de 42%,
    #fff 78%
  );
  border-radius: 16px 16px 0 0;
  border-left-color: #f6e6c8;

  strong {
    color: #e0a03a;
  }
}

.compare-head .col-svip {
  color: #3d7cff;
  background: linear-gradient(180deg, #eef5ff 0%, #fff 72%);
  border-radius: 16px 16px 0 0;

  strong {
    color: #3d7cff;
  }
}

.compare-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 2px 12px;
  border-radius: 11px;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;

  &.gold {
    background: linear-gradient(
      90deg,
      rgba(237, 121, 1, 0) 0.68%,
      rgba(237, 121, 1, 0.33) 52.86%,
      rgba(237, 121, 1, 0) 100%
    );
    color: #333333;
  }

  &.blue {
    background: linear-gradient(
      270deg,
      rgba(14, 93, 216, 0) 0%,
      rgba(14, 93, 216, 0.36) 53.48%,
      rgba(14, 93, 216, 0) 100%
    );
    color: #333333;
  }
}

.compare-row > .col-label {
  color: #2a3546;
}

.compare-row.section > div {
  background: #fff;
  border-top-color: #eef1f6;
}

.compare-row > .compare-section {
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #8c4c0b;

  img,
  .section-glyph {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    object-fit: contain;
  }
}

.compare-row img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.cell-note {
  font-size: 13px;
  color: #8b93a0;
}

.compare-row > .col-vip .cell-note {
  color: #c49a4a;
}

.compare-row > .col-svip .cell-note {
  color: #7a8aa0;
}

@include below-lg {
  .compare {
    overflow-x: auto;
  }

  .compare-table {
    min-width: 760px;
  }
}
</style>
