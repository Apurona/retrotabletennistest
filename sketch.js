// --- ゲーム定数と変数 ---
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

// パドルの設定
const PADDLE_WIDTH = 10;
const INITIAL_PADDLE_HEIGHT = 80; // 基準となるパドルの高さ
const PADDLE_COLOR = 'rgb(255, 255, 0)'; // 黄色

// プレイヤーパドル (左側)
let playerPaddleY;
const PLAYER_X = 20;

// CPUパドル (右側)
let cpuPaddleY;
const CPU_X = CANVAS_WIDTH - PADDLE_WIDTH - 20;
let cpuSpeed = 4; // CPUの追跡速度

// ボールの設定
const BALL_SIZE = 10;
const BALL_COLOR = 'rgb(255, 0, 0)'; // 赤色
let ballX, ballY;
let ballSpeedX, ballSpeedY;
const INITIAL_BALL_SPEED = 5;

// スコア設定
let playerScore = 0;
let cpuScore = 0;
// --- 変更点 1: クリア点数をランダムにする ---
let MAX_SCORE = 3; // setupまたはstartGameで初期化されます

let gameActive = false; 

// 背景色
const DUSTY_BLUE = '#6A8A9E';
const DUSTY_GREEN = '#8FB9AA';

/**
 * setup() は一度だけ実行されます。
 */
function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    noStroke(); 
    
    // パドルの初期位置 (初期の高さを使用)
    playerPaddleY = CANVAS_HEIGHT / 2 - INITIAL_PADDLE_HEIGHT / 2;
    cpuPaddleY = CANVAS_HEIGHT / 2 - INITIAL_PADDLE_HEIGHT / 2;
    
    // ゲーム開始前の初期化
    resetGame();
}

/**
 * resetGame() はゲームの初回起動時やリスタートが必要な場合に呼ばれる関数です。
 * ただし、今回の要件ではリスタートがないため、初回起動時のみ使用します。
 */
function resetGame() {
    playerScore = 0;
    cpuScore = 0;
    // クリア点数を2から5の間でランダムに設定
    MAX_SCORE = floor(random(2, 6)); 
    gameActive = false; 
    resetBall(); 
}

/**
 * resetBall() はボールを中央に戻します。
 * ゲームの状態に応じて速度を設定します。
 */
function resetBall() {
    ballX = CANVAS_WIDTH / 2;
    ballY = CANVAS_HEIGHT / 2;
    
    if (gameActive) {
        // ゲーム中の得点後のリセット: ランダムな方向へ進む
        let directionX = random() > 0.5 ? 1 : -1;
        let directionY = random(-1, 1);
        
        ballSpeedX = INITIAL_BALL_SPEED * directionX;
        ballSpeedY = INITIAL_BALL_SPEED * directionY;
    } else {
        // ゲーム開始前や終了後: 速度をゼロにする
        ballSpeedX = 0;
        ballSpeedY = 0;
    }
}

/**
 * startGame() はクリック/タップでゲームをスタートさせる時に呼び出されます。
 */
function startGame() {
    gameActive = true;
    
    // スコアとクリア点数は resetGame() で設定済み
    
    // ランダムな方向に速度を設定してボールを動かし始める
    let directionX = random() > 0.5 ? 1 : -1;
    let directionY = random(-1, 1);
    
    ballSpeedX = INITIAL_BALL_SPEED * directionX;
    ballSpeedY = INITIAL_BALL_SPEED * directionY;

    // ボールを中央に再配置
    ballX = CANVAS_WIDTH / 2;
    ballY = CANVAS_HEIGHT / 2;
}

/**
 * draw() は毎フレーム実行されます。
 */
function draw() {
    drawBackground(); 

    // --- 変更点 2: 動的にパドル高さを計算 ---
    const playerPaddleHeight = INITIAL_PADDLE_HEIGHT * (1 + cpuScore * 0.2);
    const cpuPaddleHeight = INITIAL_PADDLE_HEIGHT * (1 - cpuScore * 0.2);

    if (gameActive) {
        // パドルの移動には現在の高さを考慮
        movePaddles(playerPaddleHeight, cpuPaddleHeight); 
        moveBall();
        checkScore();
    }
    
    // 描画には動的な高さを使用
    drawPaddles(playerPaddleHeight, cpuPaddleHeight);
    drawBall();
    drawCenterLine();
    drawScores();
    drawStatusMessage();
}

// --- 描画関数 ---

function drawBackground() {
    fill(DUSTY_BLUE);
    rect(0, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    fill(DUSTY_GREEN);
    rect(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
}

function drawCenterLine() {
    stroke(0); 
    strokeWeight(2); 
    for (let y = 0; y < CANVAS_HEIGHT; y += 15) {
        line(CANVAS_WIDTH / 2, y, CANVAS_WIDTH / 2, y + 5);
    }
    noStroke(); 
}

/**
 * プレイヤーとCPUのパドルを描画します。
 * @param {number} pHeight プレイヤーパドルの現在の高さ
 * @param {number} cHeight CPUパドルの現在の高さ
 */
function drawPaddles(pHeight, cHeight) {
    fill(PADDLE_COLOR); 
    // プレイヤーパドル (左側)
    rect(PLAYER_X, playerPaddleY, PADDLE_WIDTH, pHeight);
    // CPUパドル (右側)
    rect(CPU_X, cpuPaddleY, PADDLE_WIDTH, cHeight);
}

function drawBall() {
    fill(BALL_COLOR);
    ellipse(ballX, ballY, BALL_SIZE, BALL_SIZE);
}

function drawScores() {
    fill(0); 
    textSize(32);
    textAlign(CENTER, TOP);
    text(playerScore, CANVAS_WIDTH / 4, 10);
    text(cpuScore, CANVAS_WIDTH * 3 / 4, 10);
    
   
}

/**
 * ゲームの状態に応じたメッセージ（開始待ち、WIN/GAMEOVER）を表示します。
 */
function drawStatusMessage() {
    if (gameActive) return; 

    fill(0); 
    textAlign(CENTER, CENTER);
    
    let message = "Click or Tap to Start";
    
    if (playerScore === MAX_SCORE) {
        message = `tennis (Goal: ${MAX_SCORE})`; // WINの時は目標点数を表示
    } else if (cpuScore === MAX_SCORE) {
        message = `GAMEOVER! (Goal: ${MAX_SCORE})`; // GAMEOVERの時は目標点数を表示
    }

    textSize(64);
    text(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    // 最初のスタート時のみ補助メッセージを追加
    if (playerScore === 0 && cpuScore === 0) {
        textSize(20);
        text("Click or Tap Anywhere to Begin", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    } 
}

// --- ロジック関数 ---

/**
 * パドルの移動ロジック
 * @param {number} pHeight プレイヤーパドルの現在の高さ
 * @param {number} cHeight CPUパドルの現在の高さ
 */
function movePaddles(pHeight, cHeight) {
    // プレイヤーパドル (マウスカーソルのY座標に追従)
    // プレイヤーのパドル高さ pHeight を使用して制限
    playerPaddleY = constrain(mouseY - pHeight / 2, 0, CANVAS_HEIGHT - pHeight);
    
    // CPUパドル (ボールの動きを追跡)
    let targetY = ballY - cHeight / 2; // CPUのパドル高さ cHeight を使用
    let dy = targetY - cpuPaddleY; 
    
    if (abs(dy) > cpuSpeed) {
        cpuPaddleY += (dy > 0 ? cpuSpeed : -cpuSpeed);
    } else {
        cpuPaddleY = targetY;
    }
    
    // CPUのパドル高さ cHeight を使用して制限
    cpuPaddleY = constrain(cpuPaddleY, 0, CANVAS_HEIGHT - cHeight);
}

function moveBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // 壁との衝突判定 (上下)
    if (ballY - BALL_SIZE / 2 < 0 || ballY + BALL_SIZE / 2 > CANVAS_HEIGHT) {
        ballSpeedY *= -1; 
    }
    
    // 動的なパドル高さを取得 (衝突判定にも使用)
    const playerPaddleHeight = INITIAL_PADDLE_HEIGHT * (1 + cpuScore * 0.1);
    const cpuPaddleHeight = INITIAL_PADDLE_HEIGHT * (1 + playerScore * 0.1);

    // パドルとの衝突判定 (プレイヤー)
    if (ballX - BALL_SIZE / 2 < PLAYER_X + PADDLE_WIDTH && 
        ballY > playerPaddleY && ballY < playerPaddleY + playerPaddleHeight && // 動的な高さを使用
        ballX > PLAYER_X) { 
        
        ballSpeedX *= -1; 
        let hitPoint = ballY - (playerPaddleY + playerPaddleHeight / 2); // 動的な高さを使用
        ballSpeedY = hitPoint * 0.15; 
    }
    
    // パドルとの衝突判定 (CPU)
    if (ballX + BALL_SIZE / 2 > CPU_X && 
        ballY > cpuPaddleY && ballY < cpuPaddleY + cpuPaddleHeight && // 動的な高さを使用
        ballX < CPU_X + PADDLE_WIDTH) { 
        
        ballSpeedX *= -1; 
        let hitPoint = ballY - (cpuPaddleY + cpuPaddleHeight / 2); // 動的な高さを使用
        ballSpeedY = hitPoint * 0.15; 
    }
}

/**
 * スコアリングをチェックし、ボールをリセットし、ゲーム終了を判定します。
 */
function checkScore() {
    let scoreUpdated = false;
    
    // ボールが左側の境界を越えた (CPUが得点)
    if (ballX - BALL_SIZE / 2 < 0) {
        cpuScore++;
        resetBall(); 
        scoreUpdated = true;
    }
    
    // ボールが右側の境界を越えた (プレイヤーが得点)
    if (ballX + BALL_SIZE / 2 > CANVAS_WIDTH) {
        playerScore++;
        resetBall(); 
        scoreUpdated = true;
    }
    
    // ゲーム終了判定 (勝敗が決まったら gameActive = false にする)
    if (playerScore >= MAX_SCORE || cpuScore >= MAX_SCORE) {
        gameActive = false;
        // ボールを中央で停止
        ballSpeedX = 0;
        ballSpeedY = 0;
    }
}

/**
 * マウス/タップ操作でゲーム開始のみを処理します。
 */
function mousePressed() {
    // ゲームがまだ一度も始まっていない（スコアが0）場合のみ startGame() を実行
    if (!gameActive && playerScore === 0 && cpuScore === 0) {
        // ゲームスタート前にクリア点数などを再設定
        resetGame();
        startGame();
    }
}