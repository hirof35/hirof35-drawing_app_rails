import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["canvasElement", "brushPreview", "widthDisplay", "toolButton"]
  static values = { id: Number, currentUserId: Number }

  connect() {
    this.initCanvas()
    this.setupHistory()
    this.registerCanvasEvents()
    
    // 初期状態の保存
    this.undoStack.push(JSON.stringify(this.canvas.toJSON()))
    // --- 追加：サーバーからデータを読み込む ---
  this.loadFromServer()
  // connect() 内に追加
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      this.undo();
    }
  });
  }
  // サーバーにあるJSONデータをキャンバスに復元するメソッド
    loadFromServer() {
    // Railsから渡されたIDなどを使ってデータを取得（あるいは既に画面にあるデータを使う）
    // 今回はシンプルに、最初から入っているはずのデータを確認します
    const initialData = this.element.dataset.canvasInitialData // 後述のHTML修正が必要
    
    if (initialData && initialData !== "") {
      this.canvas.loadFromJSON(initialData, () => {
        this.canvas.renderAll()
        this.undoStack.push(initialData) // 復元した状態をUndoの起点にする
        console.log("復元完了")
      })
    }
  }
  initCanvas() {
    this.canvas = new fabric.Canvas(this.canvasElementTarget, {
      isDrawingMode: true,
      width: 800,
      height: 600
    })
    
    this.canvas.freeDrawingBrush.width = 5
    this.canvas.freeDrawingBrush.color = '#000000'
  }

  setupHistory() {
    this.undoStack = []
    this.redoStack = []
  }

  registerCanvasEvents() {
    // パス（線）が描き終わった瞬間に実行される
    this.canvas.on('path:created', () => {
      this.saveStep()
    })
  }

  // ★メソッドを1つに統合！
  saveStep() {
    const json = JSON.stringify(this.canvas.toJSON())
    this.undoStack.push(json)
    this.redoStack = []

    // 通信(this.channel)が生きている時だけ同期する（エラー防止）
    if (this.channel && typeof this.channel.perform === 'function') {
      const objects = this.canvas.getObjects()
      const lastObj = objects[objects.length - 1]
      if (lastObj) {
        this.channel.perform("draw", { 
          type: "draw", 
          obj: lastObj.toJSON(), 
          user_id: this.currentUserIdValue 
        })
      }
    }
    
    console.log("Step saved. Stack size:", this.undoStack.length)
  }

  undo() {
    // スタックに「初期状態」と「描いた後」の最低2つがないと戻れません
    if (this.undoStack.length < 2) {
      console.log("これ以上戻れません");
      return;
    }
  
    // 現在の状態を捨てて、一つ前の状態を取り出す
    this.redoStack.push(this.undoStack.pop());
    const previousState = this.undoStack[this.undoStack.length - 1];
  
    // Fabric.jsに以前の状態を読み込ませる
    this.canvas.loadFromJSON(previousState, () => {
      this.canvas.renderAll();
      console.log("Undo完了");
    });
  }

  async save() {
    const dataURL = this.canvas.toDataURL('image/png')
    const json = JSON.stringify(this.canvas.toJSON())

    await fetch(`/artworks/${this.idValue}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content 
      },
      // JS側の保存処理の一部
body: JSON.stringify({ 
    artwork: { 
      canvas_data: json // ここをマイグレーションで決めた名前に合わせる
    } 
  })
    })
    alert("サーバーに保存しました！")
  }

  // --- ツール切り替え用 ---
  // 太さを変えるメソッド
changeWidth(e) {
    const width = e.target.value
    this.widthDisplayTarget.textContent = width
    this.canvas.freeDrawingBrush.width = parseInt(width, 10)
    
    // プレビューの大きさも変える
    this.brushPreviewTarget.style.width = `${width}px`
    this.brushPreviewTarget.style.height = `${width}px`
  }
  
  // 消しゴム（白ペン）
  setEraser() {
    this.canvas.isDrawingMode = true
    this.canvas.freeDrawingBrush.color = '#ffffff'
    // 現在のスライダーの値を反映
    this.canvas.freeDrawingBrush.width = parseInt(this.widthDisplayTarget.textContent, 10) * 2 // 少し太めにする
  }
  
  // ペン
  setPen() {
    this.canvas.isDrawingMode = true
    this.canvas.freeDrawingBrush.color = '#000000'
    this.canvas.freeDrawingBrush.width = 5
  }
  setColor(e) {
    // ボタンの data-color または カラーピッカーの value から色を取得
    const color = e.target.dataset.color || e.target.value
    
    this.canvas.isDrawingMode = true
    this.canvas.freeDrawingBrush.color = color
    
    // プレビューの色も変える
    this.brushPreviewTarget.style.backgroundColor = color
    
    // ペンが選ばれている状態にする（消しゴム解除）
    console.log("Color changed to:", color)
  }
  // メソッドを追加
download() {
    // 1. キャンバスの内容を画像データ（PNG）に変換
    // ※背景が透明な場合は multiplier で解像度を上げることも可能です
    const dataURL = this.canvas.toDataURL({
      format: 'png',
      quality: 1.0
    })
  
    // 2. 一時的なリンク要素（<a>タグ）を作ってクリックさせる
    const link = document.createElement('a')
    link.download = `artwork-${Date.now()}.png` // ファイル名にタイムスタンプを付与
    link.href = dataURL
    
    // 3. ダウンロード実行
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log("Downloaded as PNG")
  }
}