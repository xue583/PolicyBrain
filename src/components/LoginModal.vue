<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { QrcodeOutlined } from "@ant-design/icons-vue";
import frameBg from "../assets/login/header-bg.png";
import closeIcon from "../assets/login/close.png";
import stepAccount from "../assets/login/register/step-account.png";
import stepIdentityActive from "../assets/login/register/step-identity-active.png";
import stepIdentityInactive from "../assets/login/register/step-identity-inactive.png";
import stepAuthActive from "../assets/login/register/step-auth-active.png";
import stepAuthInactive from "../assets/login/register/step-auth-inactive.png";
import vipBanner from "../assets/login/register/vip-banner.png";
import vipBadge from "../assets/login/register/vip-badge.png";
import roleEnterprise from "../assets/login/register/role-enterprise.png";
import roleService from "../assets/login/register/role-service.png";

defineOptions({ name: "LoginModal" });

const open = defineModel<boolean>("open", { default: false });

type AuthTab = "login" | "register";
type AuthMode = "phone" | "qrcode";
type RegisterStep = 1 | 2 | 3;
type IdentityRole = "enterprise" | "service" | "";

const tab = ref<AuthTab>("login");
const mode = ref<AuthMode>("phone");
const registerStep = ref<RegisterStep>(1);
const phone = ref("");
const code = ref("");
const phoneError = ref("");
const countdown = ref(0);
const identity = ref<IdentityRole>("");
const identityError = ref("");
const formError = ref("");

const authForm = reactive({
  companyName: "",
  creditCode: "",
  position: "",
  nickname: "",
  inviteCode: "",
});

let timer: ReturnType<typeof setInterval> | null = null;

const loginTitle = "欢迎登录政策大脑平台";
const registerTitle = "注册政策大脑会员";

const codeBtnText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : "获取验证码",
);

/** a-steps 的 current 从 0 起 */
const stepsCurrent = computed(() => registerStep.value - 1);

const registerSteps = computed(() => [
  {
    title: "1、账户验证",
    icon: stepAccount,
  },
  {
    title: "2、身份选择",
    icon:
      registerStep.value >= 2 ? stepIdentityActive : stepIdentityInactive,
  },
  {
    title: "3、身份认证",
    icon: registerStep.value >= 3 ? stepAuthActive : stepAuthInactive,
  },
]);

const roles = [
  {
    key: "enterprise" as const,
    title: "企业专员",
    desc: "负责所在企业的政策管理与申报",
    icon: roleEnterprise,
  },
  {
    key: "service" as const,
    title: "企服人员",
    desc: "负责所在企业的政策管理与申报",
    icon: roleService,
  },
];

watch(open, (v) => {
  if (v) resetAll();
});

function resetAll() {
  tab.value = "login";
  mode.value = "phone";
  registerStep.value = 1;
  phone.value = "";
  code.value = "";
  phoneError.value = "";
  identity.value = "";
  identityError.value = "";
  formError.value = "";
  authForm.companyName = "";
  authForm.creditCode = "";
  authForm.position = "";
  authForm.nickname = "";
  authForm.inviteCode = "";
}

function close() {
  open.value = false;
}

function switchTab(next: AuthTab) {
  tab.value = next;
  phoneError.value = "";
  identityError.value = "";
  formError.value = "";
  mode.value = "phone";
  registerStep.value = 1;
}

function toggleQr() {
  mode.value = mode.value === "phone" ? "qrcode" : "phone";
  phoneError.value = "";
}

function validatePhone(value: string) {
  if (!value || !/^1\d{10}$/.test(value)) {
    phoneError.value = "请输入正确的11位手机号";
    return false;
  }
  phoneError.value = "";
  return true;
}

function onPhoneBlur() {
  if (phone.value) validatePhone(phone.value);
}

function sendCode() {
  if (countdown.value > 0) return;
  if (!validatePhone(phone.value)) return;
  countdown.value = 60;
  timer && clearInterval(timer);
  timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

function onLoginSubmit() {
  if (!validatePhone(phone.value)) return;
  if (!code.value.trim()) {
    phoneError.value = "请输入短信验证码";
    return;
  }
  close();
}

function goRegisterStep2() {
  if (!validatePhone(phone.value)) return;
  if (!code.value.trim()) {
    phoneError.value = "请输入短信验证码";
    return;
  }
  registerStep.value = 2;
}

function goRegisterStep3() {
  if (!identity.value) {
    identityError.value = "请选择使用身份";
    return;
  }
  identityError.value = "";
  registerStep.value = 3;
}

function submitRegister() {
  if (!authForm.companyName.trim() || !authForm.creditCode.trim()) {
    formError.value = "请填写带 * 的必填信息";
    return;
  }
  formError.value = "";
  close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="login-fade">
      <div v-if="open" class="login-overlay" @click.self="close">
        <div
          class="login-dialog"
          :class="{ 'is-register': tab === 'register' }"
          role="dialog"
          aria-modal="true"
        >
          <button type="button" class="login-close" aria-label="关闭" @click="close">
            <img :src="closeIcon" alt="" />
          </button>

          <div class="login-card">
            <div
              class="login-header"
              :style="{ backgroundImage: `url(${frameBg})` }"
            >
              <button
                type="button"
                class="qr-toggle"
                :title="mode === 'phone' ? '扫码登录' : '手机号登录'"
                @click="toggleQr"
              >
                <span v-if="mode === 'qrcode'" class="qr-toggle-pc">PC</span>
              </button>
            </div>

            <div class="login-body">
              <template v-if="mode === 'phone'">
                <!-- LOGIN -->
                <template v-if="tab === 'login'">
                  <p class="login-welcome">{{ loginTitle }}</p>

                  <div class="login-tabs">
                    <button
                      type="button"
                      class="login-tab active"
                      @click="switchTab('login')"
                    >
                      登录
                    </button>
                    <button
                      type="button"
                      class="login-tab"
                      @click="switchTab('register')"
                    >
                      注册
                    </button>
                  </div>

                  <p v-if="phoneError" class="login-error">{{ phoneError }}</p>
                  <div v-else class="login-error-slot" />

                  <input
                    v-model="phone"
                    class="login-input"
                    type="tel"
                    maxlength="11"
                    placeholder="请输入手机号"
                    @blur="onPhoneBlur"
                  />

                  <div class="login-code-row">
                    <input
                      v-model="code"
                      class="login-input login-input--code"
                      type="text"
                      maxlength="6"
                      placeholder="请输入短信验证码"
                    />
                    <button
                      type="button"
                      class="code-btn"
                      :disabled="countdown > 0"
                      @click="sendCode"
                    >
                      {{ codeBtnText }}
                    </button>
                  </div>

                  <button type="button" class="login-submit" @click="onLoginSubmit">
                    登录账号
                  </button>
                </template>

                <!-- REGISTER -->
                <template v-else>
                  <p class="login-welcome">{{ registerTitle }}</p>

                  <div class="login-tabs">
                    <button
                      type="button"
                      class="login-tab"
                      @click="switchTab('login')"
                    >
                      登录
                    </button>
                    <button type="button" class="login-tab active">注册</button>
                  </div>

                  <a-steps
                    class="reg-steps"
                    label-placement="vertical"
                    :current="stepsCurrent"
                  >
                    <a-step
                      v-for="s in registerSteps"
                      :key="s.title"
                      :title="s.title"
                    >
                      <template #icon>
                        <img
                          class="reg-step-icon"
                          :src="s.icon"
                          :alt="s.title"
                        />
                      </template>
                    </a-step>
                  </a-steps>

                  <!-- Step 1: account -->
                  <template v-if="registerStep === 1">
                    <div
                      class="vip-banner"
                      :style="{ backgroundImage: `url(${vipBanner})` }"
                    >
                      <div class="vip-banner-copy">
                        <div class="vip-banner-title">
                          <span>新用户会员礼遇</span>
                          <img :src="vipBadge" alt="VIP" class="vip-badge" />
                        </div>
                        <p class="vip-banner-desc">
                          完成注册与身份认证，即可获赠3个月VIP
                        </p>
                      </div>
                    </div>

                    <p v-if="phoneError" class="login-error">{{ phoneError }}</p>
                    <div v-else class="login-error-slot" />

                    <input
                      v-model="phone"
                      class="login-input"
                      type="tel"
                      maxlength="11"
                      placeholder="请输入手机号"
                      @blur="onPhoneBlur"
                    />

                    <div class="login-code-row">
                      <input
                        v-model="code"
                        class="login-input login-input--code"
                        type="text"
                        maxlength="6"
                        placeholder="请输入短信验证码"
                      />
                      <button
                        type="button"
                        class="code-btn"
                        :disabled="countdown > 0"
                        @click="sendCode"
                      >
                        {{ codeBtnText }}
                      </button>
                    </div>

                    <button
                      type="button"
                      class="login-submit"
                      @click="goRegisterStep2"
                    >
                      下一步：选择身份
                    </button>
                  </template>

                  <!-- Step 2: identity -->
                  <template v-else-if="registerStep === 2">
                    <div class="identity-head">
                      <h3>您主要如何使用平台？</h3>
                      <p>身份必选，会员价格和核心权益保持一致</p>
                    </div>

                    <p v-if="identityError" class="login-error">
                      {{ identityError }}
                    </p>

                    <div class="identity-list">
                      <button
                        v-for="role in roles"
                        :key="role.key"
                        type="button"
                        class="identity-card"
                        :class="{ selected: identity === role.key }"
                        @click="
                          identity = role.key;
                          identityError = '';
                        "
                      >
                        <img :src="role.icon" :alt="role.title" class="identity-icon" />
                        <div class="identity-meta">
                          <strong>{{ role.title }}</strong>
                          <span>{{ role.desc }}</span>
                        </div>
                        <span class="identity-check" />
                      </button>
                    </div>

                    <div class="reg-actions">
                      <button
                        type="button"
                        class="btn-ghost"
                        @click="registerStep = 1"
                      >
                        上一步：账户验证
                      </button>
                      <button
                        type="button"
                        class="btn-primary"
                        @click="goRegisterStep3"
                      >
                        下一步：身份认证
                      </button>
                    </div>
                  </template>

                  <!-- Step 3: auth form — multi formItem per row -->
                  <template v-else>
                    <div class="auth-head">
                      <h3>企业专业认证资料</h3>
                      <p>带*的信息用于确认服务身份</p>
                    </div>

                    <p v-if="formError" class="login-error">{{ formError }}</p>

                    <div class="auth-form">
                      <div class="form-row">
                        <label class="form-item">
                          <span class="form-label"
                            ><i>*</i>公司名称或简称</span
                          >
                          <input
                            v-model="authForm.companyName"
                            class="form-input"
                            placeholder="请输入内容"
                          />
                        </label>
                      </div>

                      <div class="form-row">
                        <label class="form-item">
                          <span class="form-label"
                            ><i>*</i>统一社会信用代码</span
                          >
                          <input
                            v-model="authForm.creditCode"
                            class="form-input"
                            placeholder="请输入内容"
                          />
                        </label>
                      </div>

                      <div class="form-row form-row--2">
                        <label class="form-item">
                          <span class="form-label">职务</span>
                          <input
                            v-model="authForm.position"
                            class="form-input"
                            placeholder="请输入内容"
                          />
                        </label>
                        <label class="form-item">
                          <span class="form-label">个人昵称</span>
                          <input
                            v-model="authForm.nickname"
                            class="form-input"
                            placeholder="请输入内容"
                          />
                        </label>
                      </div>

                      <div class="form-row">
                        <label class="form-item">
                          <span class="form-label">邀请人邀请码</span>
                          <input
                            v-model="authForm.inviteCode"
                            class="form-input"
                            placeholder="请输入内容"
                          />
                        </label>
                      </div>
                    </div>

                    <div
                      class="vip-banner vip-banner--auth"
                      :style="{ backgroundImage: `url(${vipBanner})` }"
                    >
                      <div class="vip-banner-copy">
                        <div class="vip-banner-title">
                          <span>认证礼遇</span>
                        </div>
                        <p class="vip-banner-desc">
                          提交后自动获赠3个月VIP，后期更有专属工作台板块上线，敬请期待
                        </p>
                      </div>
                    </div>

                    <div class="reg-actions">
                      <button
                        type="button"
                        class="btn-ghost"
                        @click="registerStep = 2"
                      >
                        上一步：身份选择
                      </button>
                      <button
                        type="button"
                        class="btn-primary"
                        @click="submitRegister"
                      >
                        下一步：完成认证并领取VIP
                      </button>
                    </div>
                  </template>
                </template>
              </template>

              <div v-else class="login-qr">
                <p class="login-welcome">
                  微信扫码{{ tab === "login" ? "登录" : "注册" }}
                </p>
                <div class="qr-box">
                  <QrcodeOutlined class="qr-placeholder" />
                </div>
                <p class="qr-hint">打开微信扫一扫，关注「政策大脑」完成认证</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  padding: 24px 16px;
  overflow: auto;
}

.login-dialog {
  position: relative;
  width: 468px;
  max-width: 100%;
  margin: auto;

  &.is-register {
    width: 520px;
  }
}

.login-close {
  position: absolute;
  top: -4px;
  right: -47px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    opacity: 0.85;
  }
}

.login-card {
  position: relative;
  overflow: hidden;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(15, 40, 80, 0.22);
}

.login-header {
  position: relative;
  height: 118px;
  background-color: #eef5ff;
  background-size: 100% auto;
  background-position: top center;
  background-repeat: no-repeat;
}

.qr-toggle {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  width: 72px;
  height: 72px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.qr-toggle-pc {
  position: absolute;
  top: 10px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #1677ff;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1;
}

.login-body {
  padding: 4px 42px 32px;
}

.login-welcome {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
  text-align: center;
  line-height: 1.4;
}

.login-tabs {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 6px;
}

.login-tab {
  position: relative;
  padding: 6px 4px 10px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;

  &.active {
    color: #1677ff;
    font-weight: 600;

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 28px;
      height: 3px;
      border-radius: 2px;
      background: #1677ff;
      transform: translateX(-50%);
    }
  }
}

.login-error,
.login-error-slot {
  min-height: 20px;
  margin: 0 0 8px;
  color: #ff4d4f;
  font-size: 13px;
  line-height: 20px;
}

.login-input {
  display: block;
  width: 100%;
  height: 44px;
  margin-bottom: 14px;
  padding: 0 14px;
  border: none;
  border-radius: 6px;
  background: #f5f6f8;
  color: #333;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #bbb;
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.18);
  }
}

.login-code-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.login-input--code {
  flex: 1;
  margin-bottom: 0;
  min-width: 0;
}

.code-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: #e8f1ff;
  color: #1677ff;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #d6e8ff;
  }

  &:disabled {
    color: #8bb7ff;
    cursor: not-allowed;
  }
}

.login-submit,
.btn-primary {
  display: block;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.28);

  &:hover {
    background: #3c8cff;
  }
}

/* register steps — ant-design-vue Steps */
.reg-steps {
  margin: 16px 0 18px;

  :deep(.ant-steps-item) {
    position: relative;
    flex: 1;
    overflow: visible;
    padding-inline-start: 0 !important;
  }

  /* 关掉 antd 默认连线，避免错位溢出 */
  :deep(.ant-steps-item-tail) {
    display: none !important;
  }

  /* 自绘连线：当前节点右缘 → 下一节点左缘 */
  :deep(.ant-steps-item:not(:last-child)::after) {
    content: "";
    position: absolute;
    top: 14px;
    left: calc(50% + 18px);
    z-index: 0;
    width: calc(100% - 36px);
    border-top: 1px dashed #c5cdd8;
    pointer-events: none;
  }

  :deep(.ant-steps-item-finish:not(:last-child)::after) {
    border-top: 1px solid #1677ff;
  }

  :deep(.ant-steps-item-container) {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  :deep(.ant-steps-item-icon) {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 28px !important;
    height: 28px !important;
    margin: 0 !important;
    margin-inline-start: 0 !important;
    margin-inline-end: 0 !important;
    line-height: 28px !important;
    background: transparent !important;
    border: none !important;
  }

  :deep(.ant-steps-item-custom .ant-steps-item-icon > .ant-steps-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    line-height: 1;
    top: 0;
  }

  :deep(.ant-steps-item-content) {
    display: block !important;
    width: 100% !important;
    margin-top: 8px !important;
    text-align: center;
  }

  :deep(.ant-steps-item-title) {
    display: inline-block;
    padding-inline-end: 0 !important;
    color: #999 !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    white-space: nowrap;
  }

  :deep(.ant-steps-item-title::after) {
    display: none !important;
  }

  :deep(.ant-steps-item-process .ant-steps-item-title),
  :deep(.ant-steps-item-finish .ant-steps-item-title) {
    color: #1677ff !important;
    font-weight: 500;
  }
}

.reg-step-icon {
  display: block;
  width: 28px;
  height: 28px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 50%;
}

/* VIP banner */
.vip-banner {
  position: relative;
  display: flex;
  align-items: center;
  height: 56px;
  margin-bottom: 10px;
  padding: 0 14px 0 80px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
}

.vip-banner-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.vip-banner-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3a2a14;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}

.vip-badge {
  height: 16px;
  width: auto;
  object-fit: contain;
}

.vip-banner-desc {
  margin: 4px 0 0;
  color: #c48a2e;
  font-size: 12px;
  line-height: 1.3;
}

.vip-banner--auth {
  margin-top: 8px;
  margin-bottom: 16px;

  .vip-banner-desc {
    max-width: 92%;
  }
}

/* identity step */
.identity-head {
  margin: 8px 0 14px;
  text-align: center;

  h3 {
    margin: 0 0 6px;
    color: #1a1a1a;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #999;
    font-size: 12px;
  }
}

.identity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.identity-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f5f8fc;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  &.selected {
    border-color: #1677ff;
    background: #f0f6ff;

    .identity-check {
      border-color: #1677ff;
      background: #1677ff;

      &::after {
        opacity: 1;
      }
    }
  }
}

.identity-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex-shrink: 0;
}

.identity-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #1a1a1a;
    font-size: 15px;
    font-weight: 600;
  }

  span {
    color: #999;
    font-size: 12px;
  }
}

.identity-check {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 1.5px solid #c5cdd8;
  border-radius: 50%;
  background: #fff;

  &::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 3px;
    width: 5px;
    height: 9px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    opacity: 0;
    transform: rotate(45deg);
  }
}

.reg-actions {
  display: flex;
  gap: 12px;
}

.btn-ghost {
  flex: 1;
  height: 46px;
  border: 1px solid #1677ff;
  border-radius: 8px;
  background: #fff;
  color: #1677ff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #f0f6ff;
  }
}

.reg-actions .btn-primary {
  flex: 1.2;
  box-shadow: none;
  font-size: 14px;
  padding: 0 8px;
}

/* auth form — multi formItem per row */
.auth-head {
  margin: 4px 0 12px;

  h3 {
    margin: 0 0 6px;
    color: #1a1a1a;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #999;
    font-size: 12px;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;

  &--2 .form-item {
    flex: 1;
    min-width: 0;
  }
}

.form-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.form-label {
  color: #333;
  font-size: 13px;
  line-height: 1.2;

  i {
    margin-right: 2px;
    color: #ff4d4f;
    font-style: normal;
  }
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #bbb;
  }

  &:focus {
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.12);
  }
}

.login-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 16px;
}

.qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  height: 168px;
  margin: 8px 0 16px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  background: #fafbfc;
}

.qr-placeholder {
  font-size: 72px;
  color: #c5cdd8;
}

.qr-hint {
  margin: 0;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.login-fade-enter-active,
.login-fade-leave-active {
  transition: opacity 0.2s ease;

  .login-dialog {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.login-fade-enter-from,
.login-fade-leave-to {
  opacity: 0;

  .login-dialog {
    transform: translateY(8px) scale(0.98);
    opacity: 0;
  }
}

@media (max-width: 560px) {
  .login-dialog,
  .login-dialog.is-register {
    width: 100%;
  }

  .login-body {
    padding: 4px 22px 28px;
  }

  .form-row--2 {
    flex-direction: column;
  }

  .reg-actions {
    flex-direction: column;
  }
}
</style>
