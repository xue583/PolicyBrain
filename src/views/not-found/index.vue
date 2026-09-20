<script setup lang="ts">
import { useRouter } from 'vue-router'

defineOptions({ name: 'NotFound' })

const router = useRouter()

const goHome = () => {
  void router.push({ name: 'home' })
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <p class="error-text">抱歉，您访问的页面不存在</p>
      <a-button type="primary" size="large" @click="goHome">返回首页</a-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #1677ff;
  line-height: 1;
  margin: 0 0 16px;
}

.error-text {
  font-size: 18px;
  color: #666;
  margin: 0 0 32px;
}
</style>
