//----エンティティ関連の関数 ----------------------------------------------

// 全エンティティ共通
function updatePosition(entity) {
  entity.x += entity.vx;
  entity.y += entity.vy;
}


// プレイヤーエンティティ用
function createPlayer() {
  return {
    x: 200,
    y: 300,
    vx: 0,
    vy: 0
  }
}

function applyGravity(entity) {
  entity.vy += 0.15;
}

function applyJump(entity) {
  entity.vy = -5;
}

function drawPlayer(entity) {
  fill('#ADE4DB');
  stroke('#6DA9E4');
  strokeWeight(5);
  square(entity.x, entity.y, 40, 8);
}

// ブロックエンティティ用

function createBlock(y) {
  return {
    x: 900,
    y,
    vx: -2,
    vy: 0
  }
}

function drawBlock(entity) {
  noStroke();
  fill('#F6BA6F');
  rect(entity.x, entity.y, 80, 400, 8);
}

//----ゲーム全体に関わる部分 ----------------------------------------------



/** プレイヤーエンティティ */
let player;

/** ブロックエンティティ */
let block;



//----setup/draw 他 ------------------------------------------------------

function setup() {
  createCanvas(800, 600); // 800 x 600 ピクセル。今回このサイズでやっていきます
  rectMode(CENTER); //四角形の基準点を中心に変更

  //（ここに初期化処理が入る）
  // プレイヤーを作成
  player = createPlayer();

  // ブロックを作成
  block = createBlock(300);

}

function draw() {
  //（ここにデータ操作処理が入る)
  //プレイヤーの位置を更新
  updatePosition(player);
  updatePosition(block)

  // プレイヤーに重力を適用
  applyGravity(player);
  
  // 全エンティティを描画
  background('#FFEBEB');
  drawBlock(block)
  drawPlayer(player);
}

function mousePressed(){
  //（ここにマウスボタンを押したときの処理が入る）
  applyJump(player);
}