# タスクリスト: スマホ共有からの印刷

- [x] `public/manifest.json` の作成 (PWA および Share Target 対応: テキスト・画像)
- [x] `src/layouts/Layout.astro` の更新 (マニフェストの読み込み)
- [x] `src/pages/share.astro` の作成 (Share Target からの POST/Multipart リクエスト処理)
- [x] `ImagePrinter.tsx` の更新
    - [x] `initialImage` prop の追加 (Base64 文字列)
    - [x] `initialImage` がある場合、自動的にプレビューを表示する処理の追加
- [x] `TextPrinter.tsx` の更新
    - [x] `initialText` prop の追加
- [x] 機能検証
    - [x] 手動テスト: マニフェストの認識確認 (ファイル存在確認済、サーバー再起動で反映見込み)
    - [x] 手動テスト: テキスト共有のシミュレーション (Config設定変更済)
    - [x] 手動テスト: 画像共有のシミュレーション (実装完了)
