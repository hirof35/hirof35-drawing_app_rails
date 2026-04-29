1. Project Title & Overview
Title: Rails-Fabric Drawing App (Internal Code: Structure-Canvas-v1)
Description: Ruby on RailsとFabric.jsを高度に統合した、永続的描画プラットフォーム。単なるお絵描きツールではなく、フロントエンドのステート（JSON）とバックエンドのデータベース（PostgreSQL）を同期させ、描画プロセスを「構造データ」として管理することに焦点を当てています。

2. Key Features (技術的特徴)
Persistent Canvas: canvas_dataをJSON形式でDB保存。リロード後も即座に構造を復元。

History Management: Undo/Redoスタックの実装による非破壊的な編集環境。

Multi-Format Export: toDataURLを用いたクライアントサイドでのPNG書き出し機能。

Dynamic Tooling: カスタムカラーピッカー、ブラシサイズ制御、消しゴムモードのシームレスな切り替え。

3. Tech Stack (技術スタック)
Backend: Ruby on Rails 8.0 (Modern Rails)

Frontend: JavaScript (Stimulus), Tailwind CSS

Canvas Engine: Fabric.js (Object-oriented canvas library)

Database: PostgreSQL

Asset Pipeline: Propshaft / Importmap

4. Logical Structure (思想・構造)
このプロジェクトは、描画を単なる「ピクセルの集合」ではなく、「オブジェクトの配列（構造体）」として捉えています。

Model: Artworkクラスがキャンバスの状態をtext型で保持。

Controller (Stimulus): キャンバス上のイベント（path:created等）をトリガーに、非同期（fetch）でRailsへ状態をパッチ。

5. Setup / Installation
Bash
git clone https://github.com/hirof35/drawing_app.git
cd drawing_app
bundle install
bin/rails db:prepare
bin/rails s
