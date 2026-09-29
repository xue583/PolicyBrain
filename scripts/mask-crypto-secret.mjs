/**
 * 生成数据解密密钥的掩码串，用于写入 .env 的 VITE_CRYPTO_KEY / VITE_CRYPTO_IV
 *
 * 用法：
 *   node scripts/mask-crypto-secret.mjs <base64Key> <base64Iv>
 *
 * 算法与 src/utils/crypto.ts 的 maskSecret 保持一致：
 * 明文 Base64 串逐字节与 MASK_SALT 循环异或，结果再 Base64 编码。
 * 修改任一侧的盐值或异或逻辑时，必须同步另一侧（测试中的固定向量会校验一致性）。
 * 环境变量存掩码串而非明文，避免明文密钥被 Vite 静态内联进打包产物。
 */
const MASK_SALT = [0x37, 0x5d, 0x91, 0xc2, 0x6e, 0xa4, 0x08, 0xf3]

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error(
    'Usage: node scripts/mask-crypto-secret.mjs <base64Key> <base64Iv>',
  )
  process.exit(1)
}

for (const plain of args) {
  const raw = Buffer.from(plain, 'base64')
  const size = raw.length
  const hint =
    size === 16
      ? 'AES-128 key or IV'
      : size === 24
        ? 'AES-192 key'
        : size === 32
          ? 'AES-256 key'
          : 'NOT a valid AES key/IV size (expected 16/24/32 bytes)'

  const bytes = Buffer.from(plain, 'utf8')
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] ^= MASK_SALT[i % MASK_SALT.length]
  }
  console.log(`${bytes.toString('base64')}   # ${size} bytes, ${hint}`)
}
