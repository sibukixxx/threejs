import { create } from 'zustand'
import type { TableData } from '../utils/FloorManager'

interface FloorState {
  // 設定
  floorSize: { w: number; h: number }
  tableRadius: number
  simulationEnabled: boolean
  simulationSpeed: number

  // テーブルデータ
  tables: Map<string, TableData>

  // 選択中のテーブル
  selectedTableId: string | null

  // 統計情報
  stats: {
    totalTables: number
    activeTables: number
    totalGuests: number
    totalSales: number
    vipTables: number
    hotTables: number
  }

  // ライティング
  ambientIntensity: number
  spotlightIntensity: number
  spotlightColor: string

  // アクション
  setFloorSize: (size: { w: number; h: number }) => void
  setTableRadius: (radius: number) => void
  setSimulationEnabled: (enabled: boolean) => void
  setSimulationSpeed: (speed: number) => void
  setSelectedTableId: (id: string | null) => void
  updateTableData: (id: string, data: Partial<Omit<TableData, 'id' | 'position'>>) => void
  addTable: (table: TableData) => void
  removeTable: (id: string) => void
  updateStats: (stats: FloorState['stats']) => void
  setAmbientIntensity: (intensity: number) => void
  setSpotlightIntensity: (intensity: number) => void
  setSpotlightColor: (color: string) => void

  // プリセット
  applyLayoutPreset: (preset: 'small' | 'medium' | 'large') => void

  // シミュレーション制御
  randomUpdateTable: () => void
  clearAllTables: () => void
}

/**
 * FloorManager用のZustandストア
 *
 * 機能:
 * - フロア設定（サイズ、テーブル半径）
 * - テーブルデータの管理
 * - リアルタイムシミュレーション
 * - 統計情報
 * - ライティング制御
 */
export const useFloorStore = create<FloorState>((set, get) => ({
  // 初期設定
  floorSize: { w: 30, h: 20 },
  tableRadius: 0.8,
  simulationEnabled: true,
  simulationSpeed: 2000, // ms

  tables: new Map(),
  selectedTableId: null,

  stats: {
    totalTables: 0,
    activeTables: 0,
    totalGuests: 0,
    totalSales: 0,
    vipTables: 0,
    hotTables: 0,
  },

  // ライティング
  ambientIntensity: 0.3,
  spotlightIntensity: 100,
  spotlightColor: '#ffffff',

  // セッター
  setFloorSize: (size) => set({ floorSize: size }),
  setTableRadius: (radius) => set({ tableRadius: radius }),
  setSimulationEnabled: (enabled) => set({ simulationEnabled: enabled }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setSelectedTableId: (id) => set({ selectedTableId: id }),

  updateTableData: (id, data) => {
    const tables = new Map(get().tables)
    const existing = tables.get(id)
    if (existing) {
      tables.set(id, { ...existing, ...data })
      set({ tables })
    }
  },

  addTable: (table) => {
    const tables = new Map(get().tables)
    tables.set(table.id, table)
    set({ tables })
  },

  removeTable: (id) => {
    const tables = new Map(get().tables)
    tables.delete(id)
    set({ tables })
  },

  updateStats: (stats) => set({ stats }),

  setAmbientIntensity: (intensity) => set({ ambientIntensity: intensity }),
  setSpotlightIntensity: (intensity) => set({ spotlightIntensity: intensity }),
  setSpotlightColor: (color) => set({ spotlightColor: color }),

  // レイアウトプリセット
  applyLayoutPreset: (preset) => {
    const tables = new Map<string, TableData>()

    switch (preset) {
      case 'small':
        // 小規模店舗（10席）
        // VIPエリア
        tables.set('V-1', {
          id: 'V-1',
          type: 'VIP',
          status: 'EMPTY',
          guests: 0,
          timeMin: 0,
          sales: 0,
          bottle: 'None',
          position: { x: -5, z: -5 },
        })
        tables.set('V-2', {
          id: 'V-2',
          type: 'VIP',
          status: 'EMPTY',
          guests: 0,
          timeMin: 0,
          sales: 0,
          bottle: 'None',
          position: { x: 5, z: -5 },
        })

        // 一般エリア
        for (let i = 0; i < 8; i++) {
          const x = (i % 4) * 5 - 7.5
          const z = Math.floor(i / 4) * 5 + 2
          tables.set(`A-${i + 1}`, {
            id: `A-${i + 1}`,
            type: 'NORMAL',
            status: 'EMPTY',
            guests: 0,
            timeMin: 0,
            sales: 0,
            bottle: 'None',
            position: { x, z },
          })
        }
        break

      case 'medium':
        // 中規模店舗（20席）
        // VIPエリア
        for (let i = 0; i < 3; i++) {
          tables.set(`V-${i + 1}`, {
            id: `V-${i + 1}`,
            type: 'VIP',
            status: 'EMPTY',
            guests: 0,
            timeMin: 0,
            sales: 0,
            bottle: 'None',
            position: { x: (i - 1) * 8, z: -5 },
          })
        }

        // 一般エリア
        for (let i = 0; i < 17; i++) {
          const x = (i % 5) * 5 - 10
          const z = Math.floor(i / 5) * 5 + 2
          tables.set(`A-${i + 1}`, {
            id: `A-${i + 1}`,
            type: 'NORMAL',
            status: 'EMPTY',
            guests: 0,
            timeMin: 0,
            sales: 0,
            bottle: 'None',
            position: { x, z },
          })
        }
        break

      case 'large':
        // 大規模店舗（30席以上）
        // VIPエリア（5席）
        for (let i = 0; i < 5; i++) {
          tables.set(`V-${i + 1}`, {
            id: `V-${i + 1}`,
            type: 'VIP',
            status: 'EMPTY',
            guests: 0,
            timeMin: 0,
            sales: 0,
            bottle: 'None',
            position: { x: (i - 2) * 6, z: -6 },
          })
        }

        // 一般エリア（25席）
        for (let i = 0; i < 25; i++) {
          const x = (i % 5) * 5 - 10
          const z = Math.floor(i / 5) * 4 + 1
          tables.set(`A-${i + 1}`, {
            id: `A-${i + 1}`,
            type: 'NORMAL',
            status: 'EMPTY',
            guests: 0,
            timeMin: 0,
            sales: 0,
            bottle: 'None',
            position: { x, z },
          })
        }
        break
    }

    set({ tables })
  },

  // ランダムにテーブルを更新（シミュレーション用）
  randomUpdateTable: () => {
    const tables = new Map(get().tables)
    const tableIds = Array.from(tables.keys())
    if (tableIds.length === 0) return

    const randomId = tableIds[Math.floor(Math.random() * tableIds.length)]
    const table = tables.get(randomId)
    if (!table) return

    const r = Math.random()

    if (r < 0.2) {
      // 空席にする
      table.status = 'EMPTY'
      table.guests = 0
      table.sales = 0
      table.timeMin = 0
      table.bottle = 'None'
    } else {
      // 接客中
      if (table.status === 'EMPTY') {
        table.status = table.type === 'VIP' ? 'VIP' : 'ACTIVE'
        table.guests = Math.floor(Math.random() * 4) + 1
      }

      table.timeMin += 5 // 時間経過

      // 売上発生イベント
      if (Math.random() < 0.3) {
        table.sales += Math.floor(Math.random() * 20000) + 5000
        // 高額になればHOTにする
        if (table.sales > 50000 && table.type !== 'VIP') {
          table.status = 'HOT'
        }
      }

      // ボトル注文
      if (Math.random() < 0.05) {
        const bottles = ['Dom Perignon', 'Armand de Brignac', 'Cristal', 'Salon', 'Krug']
        table.bottle = bottles[Math.floor(Math.random() * bottles.length)]
      }

      // SOS/CHECK リクエスト
      if (Math.random() < 0.05) {
        table.status = Math.random() < 0.5 ? 'SOS' : 'CHECK'
      }
    }

    tables.set(randomId, table)
    set({ tables })
  },

  clearAllTables: () => {
    const tables = new Map(get().tables)
    tables.forEach((table) => {
      table.status = 'EMPTY'
      table.guests = 0
      table.sales = 0
      table.timeMin = 0
      table.bottle = 'None'
    })
    set({ tables })
  },
}))
