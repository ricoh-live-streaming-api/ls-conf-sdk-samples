# recording-player-app

`ls-conf-sdk` を使って録画されたファイルを再生する動画再生専用のサンプルアプリケーションである。

## 動作要件

```shell
$ yarn -v
1.22.4
```

```shell
$ node -v
v20.13.0
```

## ローカル実行手順

### frontend

#### Step1. 設定ファイルの作成

`frontend/config/local.json.sample` をコピーして `frontend/config/local.json` を作成してください。

|項目|説明|
|:--|:--|
|各パラメータ|LSConfのcreate時のカスタマイズ設定を記載します<br>詳細は [RICOH Live Streaming Conference SDK API仕様](https://github.com/ricoh-live-streaming-api/ls-conf-sdk/blob/main/doc/APIReference.md) をご覧ください|

#### Step2. 実行

以下のコマンドを実行すると `http://localhost:3000` でサーバが起動される。

```shell
$ cd frontend # frontend へ移動
$ yarn        # パッケージのインストール
$ yarn start  # ローカル実行(webpackを利用)
...
 ｢wdm｣: Compiled successfully.
```

## 静的ファイルの生成

以下の手順で frontend の静的ファイルを生成できる。

#### Step1. 設定ファイルの作成

ローカル実行時と同様に `frontend/config/local.json` を作成する。

#### Step2. 実行

以下のコマンドを実行すると `frontend/dist/` 下に成果物（静的ファイル）が生成される。

```shell
$ rm -rf dist/* # dist/ 内を一度 clean にする
$ yarn          # パッケージのインストール
$ yarn build    # ビルド
...
 Done in 7.00s.
```

## ls-conf-sdk の更新

ls-conf-sdk を更新する場合、以下の 2 ファイルと`langディレクトリ`を差し替えてください。

- `frontend/`
  - `src/@types/ls-conf-sdk.d.ts`
  - `src/lib/ls-conf-sdk.js`
  - `src/lib/lang/`
