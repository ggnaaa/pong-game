const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 14;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = (canvas.width - BALL_SIZE) / 2;
let ballY = (canvas.height - BALL_SIZE) / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);

// Score
let playerScore = 0;
let aiScore = 0;

// Draw paddles, ball, and net
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y) {
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}

function drawNet() {
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(evt) {
    const rect = canvas.getBoundingClientRect();
    const root = document.documentElement;
    let mouseY = evt.clientY - rect.top - root.scrollTop;
    playerY = mouseY - PADDLE_HEIGHT / 2;

    // Clamp to canvas
    if (playerY < 0) playerY = 0;
    if (playerY + PADDLE_HEIGHT > canvas.height)
        playerY = canvas.height - PADDLE_HEIGHT;
});

// Reset ball to center
function resetBall() {
    ballX = (canvas.width - BALL_SIZE) / 2;
    ballY = (canvas.height - BALL_SIZE) / 2;
    // Alternate serve direction
    ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

// Ball and paddle collision detection
function collision(x, y, w, h, bx, by, bs) {
    return (
        x < bx + bs &&
        x + w > bx &&
        y < by + bs &&
        y + h > by
    );
}

// AI paddle movement (basic tracking)
function updateAI() {
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    let ballCenter = ballY + BALL_SIZE / 2;
    if (aiCenter < ballCenter - 12) {
        aiY += PADDLE_SPEED;
    } else if (aiCenter > ballCenter + 12) {
        aiY -= PADDLE_SPEED;
    }
    // Clamp to canvas
    if (aiY < 0) aiY = 0;
    if (aiY + PADDLE_HEIGHT > canvas.height)
        aiY = canvas.height - PADDLE_HEIGHT;
}

// Main game loop
function update() {
    // Move ball
    ballX += ballVelX;
    ballY += ballVelY;

    // Wall collision
    if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
        ballVelY = -ballVelY;
    }

    // Left paddle collision
    if (collision(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, ballX, ballY, BALL_SIZE)) {
        ballVelX = Math.abs(ballVelX);
        // Add some "spin"
        let deltaY = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ballVelY = deltaY * 0.2;
    }

    // Right paddle collision (AI)
    if (collision(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, ballX, ballY, BALL_SIZE)) {
        ballVelX = -Math.abs(ballVelX);
        let deltaY = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ballVelY = deltaY * 0.2;
    }

    // Score
    if (ballX <= 0) {
        aiScore++;
        resetBall();
    }
    if (ballX + BALL_SIZE >= canvas.width) {
        playerScore++;
        resetBall();
    }

    updateAI();
}

function render() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, "#111");

    // Net
    drawNet();

    // Scores
    drawText(playerScore, canvas.width / 4, 55);
    drawText(aiScore, canvas.width * 3 / 4, 55);

    // Paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");

    // Ball
    drawRect(ballX, ballY, BALL_SIZE, BALL_SIZE, "#fff");
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();