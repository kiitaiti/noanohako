# のあのはこ 公式サイト（リニューアル版）

就労継続支援B型事業所「のあのはこ」のホームページ。
Astro（静的生成）＋ microCMS（お知らせ・制作実績の更新）＋ Netlify（ホスティング・フォーム・リダイレクト）。

## 構成

```
src/
  data/site.ts        … 施設名・住所・電話・通所時間・工賃・FAQ など確定情報（単一の情報源）
  data/seed-*.json    … microCMS 未接続時に使うシードデータ（お知らせ・制作実績）
  lib/cms.ts          … microCMS クライアント（未接続時はシードにフォールバック）
  layouts/Base.astro  … 共通レイアウト（meta / OGP / canonical / JSON-LD / GA）
  components/         … ヘッダー・フッター・写真・FAQ・利用の流れ・図解・CTA など
  pages/              … 各ページ（下記）
  scripts/            … フェードイン・カーソル追従・計測イベント
  styles/global.css   … デザイントークンと共通スタイル
  assets/photos/      … 配信用写真（EXIF除去・長辺2400px）※原本は raw-photos/
public/               … robots.txt / favicon / OGP画像 / manifest
netlify.toml          … ビルド設定・旧URLの301リダイレクト・ヘッダー
scripts/verify.mjs    … ビルド後の検証（旧情報混入・リンク切れ・メタ・JSON-LD）
scripts/functional-test.mjs … Playwright による動作検証
docs/                 … 納品ドキュメント
```

## ページ一覧

| URL | 内容 | 主な検索意図 |
|---|---|---|
| `/` | トップ（FV・基本情報・考え方・作業内容・3要素・支援・施設・1日・流れ・FAQ・お知らせ・アクセス） | 町田／相模原市南区 就労継続支援B型 |
| `/service/` | 作業と支援（カフェ中心／クリエイティブ中心／そのほか／支援内容／施設・設備） | 動画編集・クリエイティブ・カフェ ＋ B型 |
| `/guide/` | 利用案内（通所時間・工賃・対象・1日の流れ・利用までの流れ） | 工賃・見学 体験・利用の流れ |
| `/faq/` | よくある質問（FAQPage 構造化データ） | 工賃／通所時間／未経験 |
| `/column/`, `/column/[slug]/` | コラム（microCMS） | — |
| `/works/`, `/works/[slug]/` | 制作実績（microCMS。トップの固定ストリップは `src/data/featured-works.ts`） | — |
| `/access/` | アクセス・施設概要・運営法人 | 町田駅 アクセス |
| `/contact/`, `/contact/thanks/` | お問い合わせ（Netlify Forms）・完了 | 見学 体験 相談 |
| `/privacy/` | プライバシーポリシー | — |
| `/404/` | 404 | — |

## セットアップ

```bash
npm install
cp .env.example .env   # microCMS / GA の値を設定（未設定でもシードデータでビルド可）
npm run dev            # http://localhost:4321
npm run build          # dist/ に静的出力
npm run verify         # ビルド後の検証
```

## 環境変数

| 変数 | 内容 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービスドメイン（`xxxx.microcms.io` の `xxxx`） |
| `MICROCMS_API_KEY` | microCMS API キー（GET 権限） |
| `SITE_URL` | 公開URL（本番 `https://noanohako.jp`。プレビューは netlify.toml が自動設定） |
| `PUBLIC_GA_ID` | GA4 測定ID（`G-XXXXXXX`）。未設定なら計測タグは出力されない |
| `ASTRO_NOINDEX` | `true` で全ページ noindex（プレビュー環境用。netlify.toml が自動設定） |

## Netlify へのデプロイ

1. Netlify で新規サイトを作成し、このリポジトリを接続（Build command: `npm run build` / Publish: `dist`）
2. Site settings → Environment variables に上記の環境変数を設定
3. **Forms** を有効化（Site settings → Forms → Enable form detection）。初回デプロイ後、Forms に `contact` が検出される
4. Forms → Notifications で通知先メールアドレスを設定（送信内容の受け取り先）
5. 独自ドメイン `noanohako.jp` を割り当て、HTTPS を有効化
6. **microCMS Webhook**: microCMS 側の Webhook に Netlify の Build hook URL を登録すると、記事公開時に自動で再ビルドされる

## 更新方法（microCMS）

`docs/microCMS設定.md` を参照。お知らせ・制作実績は microCMS の管理画面から追加・編集できます。
施設情報・通所時間・工賃・FAQ などの確定情報は `src/data/site.ts` で管理しています（変更時は再デプロイ）。
