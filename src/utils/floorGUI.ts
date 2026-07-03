import GUI from 'lil-gui'
import { FloorManager, type TableStatus } from './FloorManager'

/**
 * setupFloorGUI - lil-guiを使ったFloorManagerの設定
 *
 * 使い方:
 * ```typescript
 * const manager = new FloorManager(scene, { ... })
 * const { params, gui } = setupFloorGUI(manager)
 *
 * // アニメーションループ
 * function animate() {
 *   manager.animate(Date.now() * 0.001)
 *   renderer.render(scene, camera)
 * }
 * ```
 *
 * 特徴:
 * - レイアウトプリセット（Small, Medium, Large）
 * - テーブル状態の手動制御
 * - シミュレーションON/OFF
 * - 統計情報の表示
 */
export function setupFloorGUI(manager: FloorManager) {
  const gui = new GUI({ title: '🏢 Floor Manager' })

  // パラメータオブジェクト
  const params = {
    // Layout
    layout: 'Medium',

    // Simulation
    simulationEnabled: true,
    simulationSpeed: 2000,

    // Selected Table Control
    selectedTableId: '',
    selectedStatus: 'EMPTY' as TableStatus,
    selectedGuests: 2,
    selectedSales: 0,
    selectedBottle: 'None',

    // Statistics
    totalTables: 0,
    activeTables: 0,
    totalGuests: 0,
    totalSales: 0,
  }

  // === Layout ===
  const layoutFolder = gui.addFolder('Layout')

  layoutFolder
    .add(params, 'layout', ['Small (10)', 'Medium (20)', 'Large (30+)'])
    .name('Preset')
    .onChange((value: string) => {
      // プリセット適用のロジックはここでは省略
      // 実際の実装では、プリセットに応じてテーブルを配置する
      console.log('Layout preset changed:', value)
    })

  layoutFolder.open()

  // === Simulation ===
  const simFolder = gui.addFolder('Simulation')

  simFolder
    .add(params, 'simulationEnabled')
    .name('Auto Update')

  simFolder
    .add(params, 'simulationSpeed', 500, 5000, 100)
    .name('Speed (ms)')

  simFolder.add(
    {
      'Clear All': () => {
        manager.getAllTables().forEach((table) => {
          table.update({
            status: 'EMPTY',
            guests: 0,
            sales: 0,
            timeMin: 0,
            bottle: 'None',
          })
        })
      },
    },
    'Clear All'
  )

  simFolder.open()

  // === Table Control ===
  const tableFolder = gui.addFolder('Selected Table Control')

  tableFolder
    .add(params, 'selectedTableId')
    .name('Table ID')
    .listen()

  tableFolder
    .add(params, 'selectedStatus', ['EMPTY', 'ACTIVE', 'HOT', 'VIP', 'CHECK', 'SOS'])
    .name('Status')

  tableFolder
    .add(params, 'selectedGuests', 0, 10, 1)
    .name('Guests')

  tableFolder
    .add(params, 'selectedSales', 0, 200000, 5000)
    .name('Sales (¥)')

  tableFolder
    .add(params, 'selectedBottle')
    .name('Bottle')

  tableFolder.add(
    {
      'Apply Changes': () => {
        if (params.selectedTableId) {
          const table = manager.getTable(params.selectedTableId)
          if (table) {
            table.update({
              status: params.selectedStatus,
              guests: params.selectedGuests,
              sales: params.selectedSales,
              bottle: params.selectedBottle,
            })
          }
        }
      },
    },
    'Apply Changes'
  )

  // === Quick Actions ===
  const actionsFolder = gui.addFolder('Quick Actions')

  actionsFolder.add(
    {
      'Random HOT': () => {
        const tables = manager.getAllTables()
        const randomTable = tables[Math.floor(Math.random() * tables.length)]
        randomTable.update({
          status: 'HOT',
          guests: 4,
          sales: 80000,
          timeMin: 60,
          bottle: 'Dom Perignon',
        })
      },
    },
    'Random HOT'
  )

  actionsFolder.add(
    {
      'Random CHECK': () => {
        const tables = manager.getAllTables()
        const activeTables = tables.filter((t) => t.data.status !== 'EMPTY')
        if (activeTables.length > 0) {
          const randomTable = activeTables[Math.floor(Math.random() * activeTables.length)]
          randomTable.update({ status: 'CHECK' })
        }
      },
    },
    'Random CHECK'
  )

  actionsFolder.add(
    {
      'Random SOS': () => {
        const tables = manager.getAllTables()
        const activeTables = tables.filter((t) => t.data.status !== 'EMPTY')
        if (activeTables.length > 0) {
          const randomTable = activeTables[Math.floor(Math.random() * activeTables.length)]
          randomTable.update({ status: 'SOS' })
        }
      },
    },
    'Random SOS'
  )

  // === Statistics ===
  const statsFolder = gui.addFolder('Statistics')

  statsFolder
    .add(params, 'totalTables')
    .name('Total Tables')
    .disable()
    .listen()

  statsFolder
    .add(params, 'activeTables')
    .name('Active Tables')
    .disable()
    .listen()

  statsFolder
    .add(params, 'totalGuests')
    .name('Total Guests')
    .disable()
    .listen()

  statsFolder
    .add(params, 'totalSales')
    .name('Total Sales (¥)')
    .disable()
    .listen()

  statsFolder.open()

  // 統計情報を更新する関数
  const updateStats = () => {
    const stats = manager.getStats()
    params.totalTables = stats.totalTables
    params.activeTables = stats.activeTables
    params.totalGuests = stats.totalGuests
    params.totalSales = stats.totalSales
  }

  // シミュレーションループを開始
  let simulationInterval: number | null = null

  const startSimulation = () => {
    if (simulationInterval !== null) {
      clearInterval(simulationInterval)
    }

    simulationInterval = window.setInterval(() => {
      if (!params.simulationEnabled) return

      // ランダムにテーブルを更新
      const tables = manager.getAllTables()
      if (tables.length === 0) return

      const randomTable = tables[Math.floor(Math.random() * tables.length)]
      const r = Math.random()

      if (r < 0.2) {
        // 空席にする
        randomTable.update({
          status: 'EMPTY',
          guests: 0,
          sales: 0,
          timeMin: 0,
          bottle: 'None',
        })
      } else {
        // 接客中
        let newStatus = randomTable.data.status
        if (newStatus === 'EMPTY') {
          newStatus = randomTable.type === 'VIP' ? 'VIP' : 'ACTIVE'
        }

        const newTimeMin = randomTable.data.timeMin + 5
        let newSales = randomTable.data.sales

        // 売上発生
        if (Math.random() < 0.3) {
          newSales += Math.floor(Math.random() * 20000) + 5000
          if (newSales > 50000 && randomTable.type !== 'VIP') {
            newStatus = 'HOT'
          }
        }

        let newBottle = randomTable.data.bottle
        if (Math.random() < 0.05) {
          const bottles = ['Dom Perignon', 'Armand de Brignac', 'Cristal', 'Salon', 'Krug']
          newBottle = bottles[Math.floor(Math.random() * bottles.length)]
        }

        // SOS/CHECK リクエスト
        if (Math.random() < 0.05) {
          newStatus = Math.random() < 0.5 ? 'SOS' : 'CHECK'
        }

        randomTable.update({
          status: newStatus,
          guests: randomTable.data.guests || Math.floor(Math.random() * 4) + 1,
          timeMin: newTimeMin,
          sales: newSales,
          bottle: newBottle,
        })
      }

      updateStats()
    }, params.simulationSpeed)
  }

  startSimulation()

  // 速度変更時にシミュレーションを再起動
  simFolder.controllers
    .find((c) => c.property === 'simulationSpeed')
    ?.onChange(() => {
      startSimulation()
    })

  return { params, gui, updateStats, stopSimulation: () => {
    if (simulationInterval !== null) {
      clearInterval(simulationInterval)
    }
  } }
}
