# Three.js Gemini Automation

Geminiを使ってThree.jsシーンを量産するための包括的なプロジェクトテンプレート。

**5つのデモシーンを提供**:
1. **Floor Manager** 🏢 - ナイトクラブ/キャバクラの卓管理3Dマップ
2. **Champagne Tower** 🍾 - シャンパンタワーシミュレーター
3. **Glitter Demo** ✨ - 化粧品のラメ・パール感シミュレーター
4. **Subsurface Scattering Demo** - 美容系製品のマテリアル
5. **Vanning Simulator** 🚢 - コンテナ積載最適化シミュレーター

## 🎯 プロジェクトの目的

このプロジェクトは、**Gemini AIを活用してThree.jsシーンを効率的に量産する**ための戦略を実装したものです。

### デモシーン1: Floor Manager 🏢
ナイトクラブ・キャバクラ・ラウンジなどの接客業向けリアルタイム卓管理3Dマップ。黒服（運営スタッフ）が「神の視点」でフロア全体を把握し、瞬時に指示を出せるシステム。ヒートマップで各テーブルの状態（VIP、HOT、CHECK、SOS）を色分け表示。滞在時間・売上をリアルタイム可視化し、POS連携やWebSocket対応で実運用可能。

### デモシーン2: Champagne Tower 🍾
イベント・ウェディング・パーティーで使用されるシャンパンタワーを3Dで可視化。MeshPhysicalMaterialを活用したリアルなガラス表現と、段数・マテリアルパラメータの動的制御が可能。4つのプリセット（Classic Gold、Rose Pink、Champagne Beige、Crystal Clear）で様々な演出をシミュレーション。

### デモシーン3: Glitter Material ✨
化粧品・美容分野で需要の高い**「きらめき（ラメ・パール感）」**を表現するカスタムシェーダー。画像では伝わらない「視点を動かしたときのキラキラ感」をGLSLで実現。口紅、アイシャドウ、ネイルなどのバーチャル試着やECサイトに最適。

### デモシーン4: Subsurface Scattering
美容系製品（スキンケア、コスメ、ボディケアなど）のビジュアライゼーションに特化。肌や半透明素材の質感を表現するカスタムシェーダーを実装。

### デモシーン5: Vanning Simulator 🚢
貿易実務におけるコンテナ積載の最適化をリアルタイムで可視化。複数のアルゴリズム（Simple Stacking、Pallet Loading、Optimized Packing）で積載方法を比較できます。

## 🚀 Geminiを使った量産戦略

### 1. Base Sceneのテンプレート化

カメラ、照明（Studio Lighting）、レンダラー、OrbitControlsなどの基本設定を記述したボイラープレートを用意。

- **カメラ**: 美容系に適したFOV 50°の設定
- **Studio Lighting**: 3点照明システム（Key、Fill、Back Light）
- **レンダラー**: ACESFilmic Tone Mapping、高品質アンチエイリアス
- **OrbitControls**: スムーズなダンピング設定

### 2. シェーダー生成の自動化

美容系で必須となる複雑なマテリアル（Subsurface Scatteringなど）をテンプレート化。

- **Subsurface Scattering**: 肌、石鹸、ワックスなどの半透明素材
- **プリセット**: 肌、ワックス、クリームの3種類
- **リアルタイム調整**: UIから即座にパラメータを変更可能

### 3. UIと3Dの連携ロジック

ReactとThree.jsのCanvas内のオブジェクトを連動させるState管理。

- **React Three Fiber**: 宣言的なThree.jsコンポーネント
- **Zustand**: 軽量なステート管理
- **Leva**: デバッグUIではなく、プロダクションレベルのコントロールパネル

## 📦 セットアップ

### 必要要件

- Node.js 18+
- npm or yarn or pnpm

### インストール

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ビルド
npm run build
```

### Admin System (管理システム)

シーン管理、認証、セキュリティ機能を提供する管理システムを搭載。

```bash
# Admin server起動
npm run dev:admin

# Admin UI
# ブラウザで admin/client/index.html を開く
```

**主な機能**:
- 🔐 JWT認証
- 🛡️ IP whitelist
- 🎨 Modern glassmorphism UI
- 📊 リアルタイムシステム統計
- 🎬 シーン有効化/無効化

詳細は [Admin System Documentation](docs/ADMIN_SYSTEM.md) を参照。

## 🏗️ プロジェクト構造

```
threejs/
├── src/
│   ├── templates/          # Base Sceneテンプレート
│   │   ├── BaseScene.ts    # カメラ、レンダラー、OrbitControls
│   │   ├── StudioLighting.ts  # 3点照明システム
│   │   └── config.ts       # 設定ファイル
│   ├── shaders/            # GLSLシェーダー
│   │   ├── subsurface.vert # Vertex Shader
│   │   ├── subsurface.frag # Fragment Shader
│   │   └── SubsurfaceMaterial.ts  # ShaderMaterialラッパー
│   ├── components/         # React Three Fiberコンポーネント
│   │   ├── Scene.tsx       # Subsurfaceシーン
│   │   ├── VanningScene.tsx # Vanningシーン
│   │   ├── SubsurfaceSphere.tsx  # サブサーフェスオブジェクト
│   │   ├── VanningSimulatorComponent.tsx  # Vanningコンポーネント
│   │   └── StudioLights.tsx  # 照明コンポーネント
│   ├── ui/                 # UIコンポーネント
│   │   ├── ControlPanel.tsx  # Subsurface用パネル
│   │   └── VanningControlPanel.tsx  # Vanning用パネル
│   ├── store/              # ステート管理
│   │   ├── appStore.ts     # アプリケーション全体のストア
│   │   ├── sceneStore.ts   # Subsurface用ストア
│   │   └── vanningStore.ts # Vanning用ストア
│   ├── utils/              # ユーティリティ
│   │   ├── VanningSimulator.ts  # Vanningシミュレーター本体
│   │   └── loadingStrategies.ts # 積載アルゴリズム
│   ├── App.tsx             # メインアプリケーション
│   └── main.tsx            # エントリーポイント
├── docs/                   # ドキュメント
│   ├── ARCHITECTURE.md     # アーキテクチャ
│   ├── GEMINI_WORKFLOW.md  # Geminiワークフロー
│   └── VANNING_SIMULATOR.md # Vanningシミュレーターガイド
├── public/                 # 静的ファイル
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 使い方

### 1. Base Sceneの使用

```typescript
import { BaseScene } from '@/templates/BaseScene'

// コンテナ要素
const container = document.getElementById('canvas-container')!

// Base Sceneを作成
const scene = new BaseScene(container, {
  camera: {
    fov: 50,
    position: [0, 0, 5]
  },
  lighting: {
    keyLight: { intensity: 1.2 }
  }
})

// アニメーションを開始
scene.start((delta) => {
  // カスタム更新処理
})
```

### 2. Subsurface Scatteringマテリアル

```typescript
import { SubsurfaceMaterial, createSkinMaterial } from '@/shaders/SubsurfaceMaterial'

// プリセットを使用
const skinMaterial = createSkinMaterial()

// カスタム設定
const customMaterial = new SubsurfaceMaterial({
  baseColor: new THREE.Color(0xffd4b8),
  subsurfaceColor: new THREE.Color(0xff6b6b),
  subsurfaceIntensity: 0.6
})

// メッシュに適用
const mesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  skinMaterial
)
```

### 3. React Three Fiberとの統合

```tsx
import { Canvas } from '@react-three/fiber'
import { SubsurfaceSphere } from '@/components/SubsurfaceSphere'
import { StudioLights } from '@/components/StudioLights'

function App() {
  return (
    <Canvas>
      <StudioLights />
      <SubsurfaceSphere />
    </Canvas>
  )
}
```

## 🤖 Geminiとの連携方法

このプロジェクトは、Geminiに以下のようなプロンプトを投げることで、シーンを量産できるように設計されています。

### 例1: 新しいマテリアルの作成

```
Three.jsで「真珠のような光沢」を持つShaderMaterialを書いて。
subsurface.vert と subsurface.frag を参考に、
真珠特有のイリデッセンス（虹色の輝き）を追加してください。
```

### 例2: 新しいシーンの作成

```
BaseSceneテンプレートを使って、
化粧品ボトルを3つ並べたプロダクトショーケースを作成してください。
それぞれのボトルにはSubsurfaceMaterialの異なるプリセットを適用し、
ゆっくり回転させてください。
```

### 例3: UIパネルの拡張

```
ControlPanel.tsxに、以下のコントロールを追加してください:
- カメラの位置を変更するスライダー
- 背景にHDRI環境マップを読み込むボタン
- シーンをスクリーンショット保存するボタン
```

詳細なワークフローは [docs/GEMINI_WORKFLOW.md](docs/GEMINI_WORKFLOW.md) を参照してください。

## 📚 技術スタック

- **Three.js**: 3Dグラフィックスライブラリ
- **React**: UIフレームワーク
- **React Three Fiber**: ReactでThree.jsを使うためのレンダラー
- **@react-three/drei**: 便利なヘルパー（OrbitControlsなど）
- **Zustand**: 軽量ステート管理
- **Leva**: React統合GUIコントロールパネル（本番アプリ向け）
- **lil-gui**: 軽量GUIライブラリ（プロトタイピング向け）
- **TypeScript**: 型安全性
- **Vite**: 高速ビルドツール
- **vite-plugin-glsl**: GLSLシェーダーのインポート

### UI ライブラリの使い分け

このプロジェクトでは、2つのGUIライブラリを提供しています：

| | Leva | lil-gui |
|---|---|---|
| **用途** | 本番アプリ、React統合 | プロトタイピング、クライアント確認 |
| **セットアップ** | Zustand + React hooks | 数行で完了 |
| **デザイン** | モダンでカスタマイズ可能 | 開発者向けシンプルUI |
| **React** | 必須 | 不要 |

**推奨ワークフロー**:
1. **プロトタイプ段階**: lil-gui でパラメータと機能を決定
2. **本番アプリ化**: Leva または カスタムUIに置き換え

詳細は [docs/LIL_GUI_GUIDE.md](docs/LIL_GUI_GUIDE.md) を参照してください。

## 🏢 Floor Manager の使い方

Floor Manager（フロアマネージャー）は、ナイトクラブ・キャバクラ・ラウンジなどの接客業で、黒服（運営スタッフ）がフロア全体を3Dで把握し、リアルタイムに指示を出せる卓管理システムです。

### 基本的な使い方

1. **シーン選択パネルで「Floor Manager」を選択**

2. **レイアウトプリセットを選択**
   - **Small (10 tables)**: 小規模バー・プライベートラウンジ
   - **Medium (20 tables)**: 中規模クラブ・キャバクラ
   - **Large (30+ tables)**: 大規模ナイトクラブ・イベント会場

3. **テーブル状態をリアルタイム監視**
   - 🔴 **HOT**: 高額オーダー発生中 → すぐにケア
   - 🟡 **VIP**: VIP客滞在中 → 特別対応
   - 🟢 **ACTIVE**: 通常稼働中
   - 🟠 **CHECK**: 会計要請 → レジ担当に通知
   - 🔴 **SOS** (点滅): トラブル発生 → 即座に対応

4. **テーブルをクリックして詳細確認**
   - 滞在時間、来客人数、累計売上、ボトル名
   - 「CHECK」「SOS」「Clear Table」ボタンで指示送信

5. **シミュレーション機能**
   - Auto Simulation ON で自動的にテーブル状態が更新
   - Update Interval で更新速度を調整

### 実務での活用例

**フロア監視**: 黒服がiPadで3Dマップを確認しながら巡回
→ HOT（赤）のテーブルを発見したら、すぐにアイス・グラス補充

**売上最大化**: VIPテーブルの滞在時間を監視
→ 延長交渉のタイミングを把握し、ボトルを提案

**トラブル対応**: SOS（赤点滅）を検知
→ 即座に現場に駆けつけ、トラブル解決

**POS連携**: レジシステムと連携して売上をリアルタイム反映
→ 統計情報で総売上・総来客数を把握

詳細は [docs/FLOOR_MANAGER.md](docs/FLOOR_MANAGER.md) を参照してください。

## 🚢 Vanning Simulator の使い方

Vanning Simulator（バンニング・シミュレーター）は、コンテナに貨物を積載する際の最適化をリアルタイムで可視化するツールです。

### 基本的な使い方

1. **シーン選択パネルで「Vanning Simulator」を選択**

2. **コンテナを選択**
   - プリセット: 20ft、40ft、40ft High Cube、カスタム
   - 手動設定: 幅・高さ・奥行きをスライダーで調整

3. **貨物を設定**
   - プリセット: 小型、中型、大型、カスタム
   - 手動設定: 寸法と隙間を調整

4. **アルゴリズムを選択**
   - **Simple Stacking**: 高速だが利用率は低め
   - **Pallet Loading**: 実務に近い積載方法
   - **Optimized Packing**: 最も効率的（貨物を回転させて試行）

5. **統計情報を確認**
   - 積載数、容積利用率、重心位置
   - 警告メッセージがあれば対応

### 実務での活用例

**見積もり**: 「このサイズの製品を1000個輸送したい」
→ コンテナ数を計算

**最適化**: 容積利用率を上げてコストを削減
→ アルゴリズムや貨物サイズを調整

**安全性**: 重量物の転倒リスクを確認
→ 重心位置をチェック

詳細は [docs/VANNING_SIMULATOR.md](docs/VANNING_SIMULATOR.md) を参照してください。

## 🍾 Champagne Tower の使い方

Champagne Tower（シャンパンタワー）は、イベントやパーティーでの演出を3Dで可視化し、事前にシミュレーションできるツールです。

### 基本的な使い方

1. **シーン選択パネルで「Champagne Tower」を選択**

2. **タワーの構造を設定**
   - **Levels**: タワーの段数（1〜10段）
   - **Glass Size**: 各グラスのサイズ
   - **Spacing**: グラス間の間隔

3. **マテリアルを調整**
   - **Liquid Color**: シャンパンの色
   - **Transmission**: ガラスの透過率
   - **Clearcoat**: ガラスの光沢感

4. **プリセットを試す**
   - **Classic Gold**: 伝統的なゴールドシャンパン
   - **Rose Pink**: ロゼワイン向けピンク
   - **Champagne Beige**: 自然なシャンパンベージュ
   - **Crystal Clear**: 空グラスやクリスタル表現

5. **ライティングを調整**
   - 2つのポイントライト（メイン＋アクセント）で演出を変更
   - 会場の照明条件をシミュレーション

### 実務での活用例

**イベント企画**: 「5段タワーに必要なグラス数は？」
→ Statistics で総グラス数を確認（5段 = 55個）

**会場シミュレーション**: 照明の色と強度を調整して、実際の会場に近い見た目を確認

**提案資料作成**: プリセットを切り替えて、クライアントに複数パターンを提示

詳細は [docs/CHAMPAGNE_TOWER.md](docs/CHAMPAGNE_TOWER.md) を参照してください。

## 🎓 学習リソース

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/)
- [Subsurface Scattering Theory](https://en.wikipedia.org/wiki/Subsurface_scattering)
- [Studio Lighting Techniques](https://en.wikipedia.org/wiki/Three-point_lighting)

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issue、Pull Requestを歓迎します。

---

**Geminiを活用して、美しいThree.jsシーンを効率的に量産しましょう！** 🚀
