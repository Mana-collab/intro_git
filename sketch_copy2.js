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


function playerIsAlive(entity) {
  // プレイヤーの位置が生存県内ならtrueを返す
  // 600 は画面の下端
  return entity.y < 600;
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

function blockIsAlive(entity) {
  // ブロックの位置が生存圏内なら true を返す。
  // -100 は適当な値（ブロックが見えなくなる位置であればよい)
  return -100 < entity.x; // ⇒これがtrueならば、ブロックは生存している(見えている)
}


//複数のエンティティを処理する関数

/** 2つのエンティティが衝突していなければfalse, そうでなければtrue */
function entitiesAreColliding(
  entityA, entityB, collisionXDistance, collisionYDistance
) {
  let currentXDistance = abs(entityA.x - entityB.x);
  if (collisionXDistance <= currentXDistance) return false;

  let currentYDistance = abs(entityA.y - entityB.y);
  if (collisionYDistance <= currentYDistance) return false;

  return true;
}

//----ゲーム全体に関わる部分 ----------------------------------------------

/** プレイヤーエンティティ */
let player;

/** ブロックエンティティの配列 */
let blocks;

/** ゲームの状態. "play" か "gameover" を入れるものとする*/
let gameState;

/** ブロックを上下ペアで作成し、`blocks` に追加する */
function addBlockPair() {
  let y = random(-100, 100);
  blocks.push(createBlock(y));  // 上のブロック
  blocks.push(createBlock(y + 600)); // 下のブロック
}

/** ゲームオーバー画面を表示する */
function drawGameoverScreen() {
  background(0, 192);  // 透明度 192 の黒
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER); // 横も縦も、テキストの中央をtext()で指定したx,y座標に揃える
  text("GAME OVER", width / 2, height / 2);  // 画面中央にテキスト表示
}

/** ゲームの初期化・リセット */
function resetGame() {
  // プレイ状態で始まる
  gameState = "play";

  // プレイヤーを作成
  player = createPlayer();

  // ブロックの配列準備
  blocks = [];
}

/** ゲームの更新 */
function updateGame() {
  /** gameover状態なら画面を止める(更新をしない) */
  if (gameState === "gameover") return; // (return??)

  // ブロックの追加と削除
  if (frameCount % 120 === 1) addBlockPair(/** blocks(???) */); // 一定間隔(2秒=120フレームごと)に追加
  blocks = blocks.filter(blockIsAlive); // 生きているブロックだけ残す

  //全エンティティの位置を更新
  updatePosition(player);
  for (let block of blocks) updatePosition(block);

  // プレイヤーに重力を適用
  applyGravity(player);

  // プレイヤーが死んでいたらゲームオーバー状態にする
  if (!playerIsAlive(player)) gameState = "gameover";

  // 衝突判定
  for (let block of blocks) {
    if (entitiesAreColliding(player, block, 20 + 40, 20 + 200)) {
      gameState = "gameover";
      break;
    }
  }
}


/** ゲームの描画 */
function drawGame() {
  // 全エンティティを描画
  background('#FFEBEB');
  drawPlayer(player);
  for (let block of blocks) drawBlock(block);

  // ゲームオーバー状態ならそれ用の画面を表示
  if (gameState === "gameover") drawGameoverScreen();
}

/** マウスボタンが押された時のゲームへの影響 */
function onMousePress() {
  switch (gameState) {
    case "play":
      // プレイ中の状態ならプレイヤーをジャンプさせる
      applyJump(player);
      break;
    case "gameover":
      // ゲームオーバー状態ならリセット
      resetGame();
      break;
  }
}

/**
 switch 文は式を評価して、一連の case 節に対してその式の値を照合し、
 最初に値が一致した case 節の後の文を、break 文に出会うまで実行します。

 一致した case の後にある文も同様に実行します。

 switch 文の default 節には、 case が式の値と一致しない場合にジャンプします。
*/

//----setup/draw 他 ------------------------------------------------------

function setup() {
  createCanvas(800, 600); // 800 x 600 ピクセル。今回このサイズでやっていきます
  rectMode(CENTER); //四角形の基準点を中心に変更　⇒rect(中心のx座標, 中心のy座標, 幅, 高さ)

  resetGame();
}

function draw() {
  updateGame();
  drawGame();
}

function mousePressed() {
  onMousePress();
}