# PortFolio
## 使用技術
- Node.js 18.17.1
- express 4.18.2
- mongodb 6.10

## プロジェクトの概要
- ポートフォリオサイトのサーバーである。
- フロントエンドからのAPIリクエストに対して、応答する。
- レスポンシブに対応しているため、スマホからでもご利用いただけます。
- [https://dev-okayama.blog/](https://dev-okayama.blog/)で運用中
- [ポートフォリオサイトの作成に関してまとめた記事(AWSやNginxなどについても記載)](https://dev-okayama.blog/project-blog/65213930424edd317304aca6)
- [フロントエンドのGitHubURL](https://github.com/koinunopochi/PortfolioFront)

<img width="960" alt="image" src="https://github.com/koinunopochi/PortfolioFront/assets/124518985/22cad4ff-1952-41fd-bcaf-d78187d0b5cd">


## 機能
- 認証機能（ログイン・ログアウト・roleがadminであるか）
- アクセスログの記録(日時・IP・アクセスURL・HTTP Method)
- ブログ関連機能（作成・削除・更新）
- 問い合わせ機能

## 使用方法
### セットアップ
```
npm install
```
### サーバーの起動
```
node server
```
