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
let MAX_SCORE = 3; 

let gameActive = false; 

// 背景色
const DUSTY_BLUE = '#6A8A9E';
const DUSTY_GREEN = '#8FB9AA';

/**
 * setup() は一度だけ実行されます。
 */
function setup() {
    // --- 修正点 1: キャンバスにIDを設定 ---
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.id('myCanvas'); 
    // --- 修正点 1 終わり ---
    
    noStroke(); 
    
    // パドルの初期位置
    playerPaddleY = CANVAS_HEIGHT / 2 - INITIAL_PADDLE_HEIGHT / 2;
    cpuPaddleY = CANVAS_HEIGHT / 2 - INITIAL_PADDLE_HEIGHT / 2;
    
    // ゲーム開始前の初期化
    resetGame();

    // --- 修正点 4: グローバルなキーボードリスナーを設定 ---
    // ブラウザ全体でキー入力を監視するため、Web環境でも確実に動作します。
    document.addEventListener('keydown', handleGlobalKey);
}

/**
 * グローバルなキーボードイベントハンドラ (Pキーの強制勝利用)
 */
function handleGlobalKey(event) {
    // Pキー (プレイヤー勝利デバッグ)
    if (event.key === 'p' || event.key === 'P') {
        // ゲームがアクティブな時のみ実行
        if (gameActive) {
            // プレイヤーのスコアを強制的にMAX_SCOREに設定し、勝利判定をトリガー
            playerScore = MAX_SCORE;
            gameActive = false;
            
            // ボールも停止させる
            ballSpeedX = 0;
            ballSpeedY = 0;
            
            console.log("Debug: Player Forced Win triggered by 'P' key.");
        }
    }
}

/**
 * resetGame() はゲームの初回起動時のみ使用します。
 */
function resetGame() {
    playerScore = 0;
    cpuScore = 0;
    MAX_SCORE = floor(random(2, 6)); 
    gameActive = false; 
    resetBall(); 
}

/**
 * resetBall() はボールを中央に戻します。
 */
function resetBall() {
    ballX = CANVAS_WIDTH / 2;
    ballY = CANVAS_HEIGHT / 2;
    
    if (gameActive) {
        let directionX = random() > 0.5 ? 1 : -1;
        let directionY = random(-1, 1);
        
        ballSpeedX = INITIAL_BALL_SPEED * directionX;
        ballSpeedY = INITIAL_BALL_SPEED * directionY;
    } else {
        ballSpeedX = 0;
        ballSpeedY = 0;
    }
}

/**
 * startGame() はクリック/タップでゲームをスタートさせる時に呼び出されます。
 */
function startGame() {
    gameActive = true;
    
    let directionX = random() > 0.5 ? 1 : -1;
    let directionY = random(-1, 1);
    
    ballSpeedX = INITIAL_BALL_SPEED * directionX;
    ballSpeedY = INITIAL_BALL_SPEED * directionY;

    ballX = CANVAS_WIDTH / 2;
    ballY = CANVAS_HEIGHT / 2;
}

/**
 * draw() は毎フレーム実行されます。
 */
function draw() {
    drawBackground(); 

    // --- パドル高さを計算 (既存のコードを維持) ---
    const playerPaddleHeight = INITIAL_PADDLE_HEIGHT * (1 + cpuScore * 0.2);
    // 最小値を INITIAL_PADDLE_HEIGHT * 0.2 に制限する処理を追加 (推奨)
    let cpuPaddleHeight = INITIAL_PADDLE_HEIGHT * (1 - playerScore * 0.2);
    cpuPaddleHeight = max(cpuPaddleHeight, INITIAL_PADDLE_HEIGHT * 0.2);

    if (gameActive) {
        movePaddles(playerPaddleHeight, cpuPaddleHeight); 
        moveBall();
        checkScore();
    }
    
    drawPaddles(playerPaddleHeight, cpuPaddleHeight);
    drawBall();
    drawCenterLine();
    drawScores();
    drawStatusMessage();
}

// --- 描画関数 (変更なし) ---

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

function drawPaddles(pHeight, cHeight) {
    fill(PADDLE_COLOR); 
    rect(PLAYER_X, playerPaddleY, PADDLE_WIDTH, pHeight);
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
    
    // プレイヤーにクリア点数を見せない (スコア0の場合のみヒントを表示)
    if (playerScore === 0 && cpuScore === 0) {
        textSize(14);
        fill(0);
        text(`Goal: ?? points (2-5)`, CANVAS_WIDTH / 2, 10);
    }
}

function drawStatusMessage() {
    if (gameActive) return; 

    fill(0); 
    textAlign(CENTER, CENTER);
    
    let message = "Click or Tap to Start";
    
    if (playerScore === MAX_SCORE) {
        message = `WIN! (Goal: ${MAX_SCORE})`; 
    } else if (cpuScore === MAX_SCORE) {
        message = `GAMEOVER! (Goal: ${MAX_SCORE})`;
    }

    textSize(64);
    text(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    if (playerScore === 0 && cpuScore === 0) {
        textSize(20);
        text("Click or Tap Anywhere to Begin", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    } 
}

// --- ロジック関数 (変更なし) ---

function movePaddles(pHeight, cHeight) {
    playerPaddleY = constrain(mouseY - pHeight / 2, 0, CANVAS_HEIGHT - pHeight);
    
    let targetY = ballY - cHeight / 2; 
    let dy = targetY - cpuPaddleY; 
    
    if (abs(dy) > cpuSpeed) {
        cpuPaddleY += (dy > 0 ? cpuSpeed : -cpuSpeed);
    } else {
        cpuPaddleY = targetY;
    }
    
    cpuPaddleY = constrain(cpuPaddleY, 0, CANVAS_HEIGHT - cHeight);
}

function moveBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    if (ballY - BALL_SIZE / 2 < 0 || ballY + BALL_SIZE / 2 > CANVAS_HEIGHT) {
        ballSpeedY *= -1; 
    }
    
    // draw()から動的な高さを再計算
    const playerPaddleHeight = INITIAL_PADDLE_HEIGHT * (1 + cpuScore * 0.2);
    let cpuPaddleHeight = INITIAL_PADDLE_HEIGHT * (1 - playerScore * 0.2);
    cpuPaddleHeight = max(cpuPaddleHeight, INITIAL_PADDLE_HEIGHT * 0.2);

    // パドルとの衝突判定 (プレイヤー)
    if (ballX - BALL_SIZE / 2 < PLAYER_X + PADDLE_WIDTH && 
        ballY > playerPaddleY && ballY < playerPaddleY + playerPaddleHeight && 
        ballX > PLAYER_X) { 
        
        ballSpeedX *= -1; 
        let hitPoint = ballY - (playerPaddleY + playerPaddleHeight / 2); 
        ballSpeedY = hitPoint * 0.15; 
    }
    
    // パドルとの衝突判定 (CPU)
    if (ballX + BALL_SIZE / 2 > CPU_X && 
        ballY > cpuPaddleY && ballY < cpuPaddleY + cpuPaddleHeight && 
        ballX < CPU_X + PADDLE_WIDTH) { 
        
        ballSpeedX *= -1; 
        let hitPoint = ballY - (cpuPaddleY + cpuPaddleHeight / 2); 
        ballSpeedY = hitPoint * 0.15; 
    }
}

function checkScore() {
    if (ballX - BALL_SIZE / 2 < 0) {
        cpuScore++;
        resetBall(); 
    }
    
    if (ballX + BALL_SIZE / 2 > CANVAS_WIDTH) {
        playerScore++;
        resetBall(); 
    }
    
    if (playerScore >= MAX_SCORE || cpuScore >= MAX_SCORE) {
        gameActive = false;
        ballSpeedX = 0;
        ballSpeedY = 0;
    }
}

/**
 * マウス/タップ操作でゲーム開始のみを処理します。
 */
function mousePressed() {
    if (!gameActive && playerScore === 0 && cpuScore === 0) {
        // --- 修正点 2: クリック時にキャンバスにフォーカスを当てる ---
        const canvasElement = document.getElementById('myCanvas');
        if (canvasElement) {
            canvasElement.focus();
        }
        // --- 修正点 2 終わり ---
        
        resetGame();
        startGame();
    }
}

// --- 修正点 3: p5.jsのkeyPressed関数は削除しました ---