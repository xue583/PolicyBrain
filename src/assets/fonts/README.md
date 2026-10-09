# 站点字体

来源：设计稿交付字体包（微信文件 `设计稿应用字体/字体/`），三个字体均可免费商用。

| 文件                                                       | 字体                | 用途                                | 处理                                             |
| ---------------------------------------------------------- | ------------------- | ----------------------------------- | ------------------------------------------------ |
| `alibaba-puhuiti-2.0-{regular,medium,semibold,bold}.woff2` | 阿里巴巴普惠体 2.0  | 全站正文/UI（`--pb-font-body`）     | 子集化（GB2312 + ASCII）+ woff2，原始 TTF 各 8MB |
| `alimama-shuheiti-bold.woff2`                              | 阿里妈妈数黑体 Bold | 展示型标题（`--pb-font-display`）   | 官方 woff2 直拷                                  |
| `dingtalk-jinbuti.woff2`                                   | 钉钉进步体          | 标语/营销文案（`--pb-font-slogan`） | TTF → woff2 全量                                 |

@font-face 定义在 `src/styles/fonts.scss`，字体变量在 `src/style.css` 的 `:root`。

重新生成子集：解压字体包后用 `fonttools subset <ttf> --text-file=<GB2312+ASCII 字符集> --flavor=woff2 --layout-features='*' --no-hinting`。
