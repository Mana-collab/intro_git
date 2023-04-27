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
  entity.vy += 0.25;
}

function applyJump(entity) {
  entity.vy = -5;
}

function drawPlayer(entity) {
  imageMode(CENTER);
  image(playerImg, entity.x, entity.y, 60, 60);
  /*
  fill('#ADE4DB');
  stroke('#6DA9E4');
  strokeWeight(5);
  square(entity.x, entity.y, 40, 8);
  */
}


function playerIsAlive(entity) {
  // プレイヤーの位置が生存圏内ならtrueを返す
  // 600 は画面の下端
  return entity.y < 600;
}

// ブロックエンティティ用

function createBlock(y) {
  return {
    x: 900,
    y,
    vx: -4,
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


// パーティクルエンティティ用

function createParticle(x, y) {
  let direction = random(TWO_PI); // TWO_PI=PIの2倍
  let speed = 2;

  return {
    x,
    y,
    vx: -2 + speed * cos(direction),  // 
    vy: speed * sin(direction),
    life: 1 // = 100%
  };
}


function decreaseLife(particle) {
  particle.life -= 0.02;
}

function drawParticle(particle) {
  noFill();
  stroke(255);
  strokeWeight(2)
  circle(particle.x, particle.y, 8);
}

function particleIsAlive(particle) {
  return particle.life > 0;
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

/** 画像の読み込み */
let playerImg;
let kumoImg;
function preload() {
  playerImg = loadImage('animal_musasabi.png');
  cloudImg = loadImage('kumo.png');
}

/** プレイヤーエンティティ */
let player;

/** ブロックエンティティの配列 */
let blocks;

/** パーティクルエンティティの配列 */
let particle;

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
  strokeWeight(5);
  stroke(255, 100, 0);
  textSize(64);
  textAlign(CENTER, CENTER); // 横も縦も、テキストの中央をtext()で指定したx,y座標に揃える
  text("GAME OVER!", width / 2, height / 2);  // 画面中央にテキスト表示
  textSize(25);
  noStroke();
  text("Click to retry", width / 2, height / 2 + 100);  // 画面中央にテキスト表示
}

/** シェイクの現在の強さ */
let shakeMagnitude;

/** シェイクの減衰に使う係数 */
let shakeDampingFactor;

/** シェイクをリセット */
function resetShake() {
  shakeMagnitude = 0;
  shakeDampingFactor = 0.95;
}

/** シェイクを任意の強さで発動 */
function setShake(magnitude) {
  shakeMagnitude = magnitude;
}

/** シェイクの更新 */
function updateShake() {
  shakeMagnitude *= shakeDampingFactor;  // シェイクの大きさを徐々に減衰
}

/** シェイクを適用。描画処理の前に実行する必要あり */
function applyShake() {
  if (shakeMagnitude < 1) return;

  // shakeMagnitudeの範囲内で、ランダムに画面を揺らす
  translate(
    random(-shakeMagnitude, shakeMagnitude),
    random(-shakeMagnitude, shakeMagnitude)
  );
}

/** ゲームの初期化・リセット */
function resetGame() {
  // プレイ状態で始まる
  gameState = "play";

  // プレイヤーを作成
  player = createPlayer();

  // ブロックの配列準備
  blocks = [];

  // パーティクルの配列準備
  particles = [];  // 複数形なことに注意!

  // シェイクのリセット
  resetShake();
}

/** ゲームの更新 */
function updateGame() {
  /** gameover状態なら画面を止める(更新をしない) */
  if (gameState === "gameover") return; // 単独のreturn⇒関数の実行を中断する

  // ブロックの追加
  if (frameCount % 60 === 1) addBlockPair(/** blocks(?) */); // 一定間隔(1秒=60フレームごと)に追加

  // パーティクルの追加
  particles.push(createParticle(player.x, player.y));  // プレイヤーの位置で作る

  // 死んだエンティティの削除
  blocks = blocks.filter(blockIsAlive); // 生きているブロックだけ残す
  particles = particles.filter(particleIsAlive);  // 生きているパーティクルだけ残す

  //全エンティティの位置を更新
  updatePosition(player);
  for (let block of blocks) updatePosition(block);
  for (let particle of particles) updatePosition(particle);

  // プレイヤーに重力を適用
  applyGravity(player);

  // パーティクルのライフ減少
  for (let particle of particles) decreaseLife(particle);

  // プレイヤーが死んでいたらゲームオーバー状態にする
  if (!playerIsAlive(player)) gameState = "gameover";

  // 衝突判定
  for (let block of blocks) {
    if (entitiesAreColliding(player, block, 30 + 40, 30 + 200)) {
      gameState = "gameover";
      break;
    }
  }

  // 2秒ごとに画面を揺らす(揺れの強さを5に設定する)
  if (frameCount % 120 === 1) setShake(10);

  // シェイクの強さを減衰
  updateShake();

  // シェイクを適用. setShakeで任意のシェイクの強さが設定されない限り画面は揺れない
  applyShake();
}


/** ゲームの描画 */
function drawGame() {
  // 全エンティティを描画
  background('#E0FFFF');

  // 背景
  imageMode(CENTER);
  image(cloudImg, 200, 100, 200, 200);
  image(cloudImg, 600, 200, 200, 200);


  drawPlayer(player);
  for (let block of blocks) drawBlock(block);
  for (particle of particles) drawParticle(particle);

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