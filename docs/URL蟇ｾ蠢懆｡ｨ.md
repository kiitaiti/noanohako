# URL対応表（旧サイト → 新サイト）

旧サイト（WordPress）の `sitemap.xml` と主要ナビゲーションから把握したURLと、新サイトでの扱いです。
リダイレクトは `netlify.toml` に定義しています（すべて 301／恒久）。
**トップへの一律転送は行っていません。** 内容に対応するページへ個別に転送しています。

| 旧URL | 種別 | 新URL | 理由 |
|---|---|---|---|
| `/` | トップ | `/`（維持） | — |
| `/work/` | WORK PLAN | `/service/` | 旧プラン廃止。作業内容（カフェ中心／クリエイティブ中心）へ |
| `/play/` | PLAY PLAN | `/service/` | 旧プラン廃止。作業内容へ（eスポーツ独立コースは復活させない） |
| `/works/` | 制作実績一覧 | `/works/`（維持） | — |
| `/works/サムネイル制作/` | 制作実績 | `/works/` | 該当実績は新一覧に統合 |
| `/works/vtuber動画切り抜き/` | 制作実績 | `/works/vtuber-video/` | Vtuber動画作成へ |
| `/42/` | お知らせ（tvk紹介） | `/column/tvk-news-link/` | コラムへ（数字IDから意味のあるスラッグへ） |
| `/9/` | お知らせ（サイト公開） | `/column/website-launch/` | 同上 |
| `/category/news/` `/category/info/` | カテゴリ一覧 | `/column/` | コラム一覧へ |
| `/works_tag/*` | タグ一覧 | `/works/` | 制作実績一覧へ |
| `/author/*` | 著者アーカイブ | `/column/` | — |
| `/feed/` | RSS | `/column/` | RSSは未提供 |
| `/news/`, `/news/*`（新サイト旧構成） | — | `/column/`, `/column/*` | 名称変更 |
| `/support/`（新サイト旧構成） | — | `/service/` | 作業内容と統合 |
| `/sitemap.xml`, `/wp-sitemap*.xml` | サイトマップ | `/sitemap-index.xml` | Astro 生成のサイトマップへ |
| `/wp-admin/*`, `/wp-login.php` | 管理画面 | 404 | 転送しない |
| `/#concept` `/#couse` `/#service` `/#qa` `/#company` | ページ内アンカー | `/`（各セクションは残るがアンカーIDは変更） | 旧IDは `about-title` 等に変更。外部から旧アンカーで来てもトップは表示される |

## 新規URL

`/service/`（作業と支援） `/guide/`（利用案内） `/works/` `/column/` `/faq/` `/access/` `/contact/` `/contact/thanks/` `/privacy/`

## 公開後の確認

- Search Console の「ページのインデックス登録」で旧URLが「リダイレクトあり」になっているか
- 旧サイトに存在した他のURL（このリストにない投稿など）があれば、404ログを確認して追加
