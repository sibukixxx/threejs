import * as THREE from 'three'

export interface ChampagneTowerParams {
  levels: number
  glassSize: number
  spacing: number
  liquidColor: string
  metalness: number
  roughness: number
  transmission: number
  thickness: number
  clearcoat: number
}

export interface GlassInfo {
  position: THREE.Vector3
  level: number
  indexInLevel: number
}

/**
 * シャンパングラス（クープ型）のジオメトリを作成
 * LatheGeometryを使用して回転体を生成
 */
function createCoupeGlassGeometry(scale: number = 1): THREE.BufferGeometry {
  // クープグラスのプロファイル（断面形状）
  // 原点を中心として、右側の輪郭を定義
  const points: THREE.Vector2[] = []

  // ベース（底面）
  points.push(new THREE.Vector2(0, 0))
  points.push(new THREE.Vector2(0.35 * scale, 0))
  points.push(new THREE.Vector2(0.35 * scale, 0.02 * scale))
  points.push(new THREE.Vector2(0.05 * scale, 0.02 * scale))

  // ステム（脚）
  points.push(new THREE.Vector2(0.05 * scale, 0.35 * scale))

  // ボウル下部への接続
  points.push(new THREE.Vector2(0.08 * scale, 0.38 * scale))

  // ボウル（浅い椀型）- クープグラスの特徴的な形状
  const bowlSegments = 12
  for (let i = 0; i <= bowlSegments; i++) {
    const t = i / bowlSegments
    const angle = (Math.PI / 2) * t
    const r = 0.08 + (0.45 - 0.08) * Math.sin(angle)
    const h = 0.38 + (0.55 - 0.38) * (1 - Math.cos(angle)) * 0.8
    points.push(new THREE.Vector2(r * scale, h * scale))
  }

  // 内側のエッジ（ガラスの厚み）
  points.push(new THREE.Vector2(0.42 * scale, 0.52 * scale))

  const geometry = new THREE.LatheGeometry(points, 32)
  return geometry
}

/**
 * グラス内の液体（シャンパン）のジオメトリを作成
 */
function createLiquidGeometry(scale: number = 1, fillLevel: number = 0.7): THREE.BufferGeometry {
  const points: THREE.Vector2[] = []

  // 液体の形状（ボウル内部に合わせる）
  points.push(new THREE.Vector2(0, 0.40 * scale))

  const bowlSegments = 12
  const maxSegment = Math.floor(bowlSegments * fillLevel)
  for (let i = 0; i <= maxSegment; i++) {
    const t = i / bowlSegments
    const angle = (Math.PI / 2) * t
    const r = 0.06 + (0.40 - 0.06) * Math.sin(angle)
    const h = 0.40 + (0.52 - 0.40) * (1 - Math.cos(angle)) * 0.8
    points.push(new THREE.Vector2(r * scale, h * scale))
  }

  // 液面
  const topT = maxSegment / bowlSegments
  const topAngle = (Math.PI / 2) * topT
  const topH = 0.40 + (0.52 - 0.40) * (1 - Math.cos(topAngle)) * 0.8
  points.push(new THREE.Vector2(0, topH * scale))

  const geometry = new THREE.LatheGeometry(points, 32)
  return geometry
}

/**
 * ChampagneTower - シャンパンタワーを生成するユーティリティクラス
 *
 * 特徴:
 * - 正四角錐状のグラス配置
 * - MeshPhysicalMaterialによるリアルなガラス表現
 * - リアルなクープグラス形状
 * - 段数、サイズ、マテリアルパラメータをカスタマイズ可能
 * - 各グラスの位置情報を保持
 */
export class ChampagneTower {
  private group: THREE.Group
  private glasses: THREE.Group[] = []
  private glassInfos: GlassInfo[] = []
  private params: ChampagneTowerParams
  private glassMaterial: THREE.MeshPhysicalMaterial
  private liquidMaterial: THREE.MeshPhysicalMaterial
  private glassGeometry: THREE.BufferGeometry
  private liquidGeometry: THREE.BufferGeometry

  constructor(params: ChampagneTowerParams) {
    this.params = params
    this.group = new THREE.Group()
    this.glassMaterial = this.createGlassMaterial()
    this.liquidMaterial = this.createLiquidMaterial()
    this.glassGeometry = createCoupeGlassGeometry(params.glassSize)
    this.liquidGeometry = createLiquidGeometry(params.glassSize, 0.8)
    this.buildTower()
  }

  /**
   * ガラスマテリアルの作成（透明なガラス）
   */
  private createGlassMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0,
      roughness: 0.05,
      transmission: 0.95,
      thickness: this.params.thickness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      ior: 1.5,  // ガラスの屈折率
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    })
  }

  /**
   * 液体マテリアルの作成（シャンパン）
   */
  private createLiquidMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.params.liquidColor),
      metalness: this.params.metalness,
      roughness: this.params.roughness,
      transmission: 0.6,
      thickness: this.params.thickness * 0.5,
      clearcoat: this.params.clearcoat,
      ior: 1.33,  // 水の屈折率に近い値
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    })
  }

  /**
   * タワーの構築（正四角錐）
   */
  private buildTower(): void {
    this.clearTower()

    const { levels, spacing, glassSize } = this.params
    // グラスの高さを考慮したスペーシング
    const glassHeight = 0.55 * glassSize

    for (let y = 0; y < levels; y++) {
      const layerSize = y + 1 // レベル1は1個、レベル2は4個（2x2）...
      const offset = (layerSize - 1) * spacing / 2

      for (let x = 0; x < layerSize; x++) {
        for (let z = 0; z < layerSize; z++) {
          // グラスとリキッドを含むグループを作成
          const glassGroup = new THREE.Group()

          // ガラス部分
          const glassMesh = new THREE.Mesh(this.glassGeometry, this.glassMaterial)
          glassMesh.castShadow = true
          glassMesh.receiveShadow = true
          glassGroup.add(glassMesh)

          // 液体部分
          const liquidMesh = new THREE.Mesh(this.liquidGeometry, this.liquidMaterial)
          glassGroup.add(liquidMesh)

          // 位置設定（グラスの高さに基づく）
          const posX = (x * spacing) - offset
          const posY = (levels - 1 - y) * glassHeight
          const posZ = (z * spacing) - offset

          glassGroup.position.set(posX, posY, posZ)

          // グラス情報を記録
          this.glassInfos.push({
            position: new THREE.Vector3(posX, posY, posZ),
            level: y,
            indexInLevel: x * layerSize + z,
          })

          this.glasses.push(glassGroup)
          this.group.add(glassGroup)
        }
      }
    }
  }

  /**
   * 既存のタワーをクリア
   */
  private clearTower(): void {
    this.glasses.forEach(glassGroup => {
      this.group.remove(glassGroup)
    })
    this.glasses = []
    this.glassInfos = []
  }

  /**
   * パラメータを更新してタワーを再構築
   */
  public updateParams(newParams: Partial<ChampagneTowerParams>): void {
    this.params = { ...this.params, ...newParams }

    // 液体マテリアルパラメータの更新
    if (newParams.liquidColor) {
      this.liquidMaterial.color.set(newParams.liquidColor)
    }
    if (newParams.metalness !== undefined) {
      this.liquidMaterial.metalness = newParams.metalness
    }
    if (newParams.roughness !== undefined) {
      this.liquidMaterial.roughness = newParams.roughness
    }
    if (newParams.transmission !== undefined) {
      this.liquidMaterial.transmission = newParams.transmission * 0.6
      this.glassMaterial.transmission = newParams.transmission
    }
    if (newParams.thickness !== undefined) {
      this.liquidMaterial.thickness = newParams.thickness * 0.5
      this.glassMaterial.thickness = newParams.thickness
    }
    if (newParams.clearcoat !== undefined) {
      this.liquidMaterial.clearcoat = newParams.clearcoat
    }

    // 構造的なパラメータが変更された場合は再構築
    if (
      newParams.levels !== undefined ||
      newParams.glassSize !== undefined ||
      newParams.spacing !== undefined
    ) {
      // ジオメトリを再作成
      this.glassGeometry.dispose()
      this.liquidGeometry.dispose()
      this.glassGeometry = createCoupeGlassGeometry(this.params.glassSize)
      this.liquidGeometry = createLiquidGeometry(this.params.glassSize, 0.8)
      this.buildTower()
    }
  }

  /**
   * タワーのグループを取得
   */
  public getGroup(): THREE.Group {
    return this.group
  }

  /**
   * 総グラス数を計算
   */
  public getTotalGlasses(): number {
    return this.glasses.length
  }

  /**
   * グラス情報の配列を取得
   */
  public getGlassInfos(): GlassInfo[] {
    return this.glassInfos
  }

  /**
   * クリーンアップ
   */
  public dispose(): void {
    this.clearTower()
    this.glassMaterial.dispose()
    this.liquidMaterial.dispose()
    this.glassGeometry.dispose()
    this.liquidGeometry.dispose()
  }

  /**
   * タワーを回転させる
   */
  public rotate(deltaY: number): void {
    this.group.rotation.y += deltaY
  }
}
