const canvas= document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
const player1={
	x:150,
	y:330,
	color:"red"
};
const player2={
	x:750,
	y:330,
	color:"blue"
};
let arrows=[];
let isAiming=false;
const gravity=0.15;
let score1=0;
let score2=0;
let health1 = 100;
let health2 = 100;

let gameOver = false;
let mouseX=450;
let mouseY=200;
let player2Angle=Math.PI;
let aiShootTimer=0;
let aiShootInterval=100;
let aiMoveDirection = 1;
let aiMoveSpeed = 2.5;
let aiJumpVelocity=0;
let aiJumpTimer=0;

canvas.addEventListener("mousemove", function(event) {

    const rect=canvas.getBoundingClientRect();

    mouseX=(event.clientX - rect.left) * (canvas.width / rect.width);
    mouseY=(event.clientY - rect.top) * (canvas.height / rect.height);

});
canvas.addEventListener("mousedown", function() {
    isAiming = true;
});

canvas.addEventListener("mouseup", function() {

    if (isAiming) {
        shootArrow();
    }

    isAiming = false;

});
function drawGround() {
    ctx.fillStyle = "#4b7f32";
    ctx.fillRect(0, 400, canvas.width, 50);
}

function drawPlayer(player) {

    // Head
    ctx.beginPath();
    ctx.arc(player.x, player.y - 50, 15, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 35);
    ctx.lineTo(player.x, player.y + 10);
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Left arm
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 25);
    ctx.lineTo(player.x - 25, player.y);
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 25);
    ctx.lineTo(player.x + 25, player.y);
    ctx.stroke();

    // Left leg
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + 10);
    ctx.lineTo(player.x - 20, player.y + 45);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + 10);
    ctx.lineTo(player.x + 20, player.y + 45);
    ctx.stroke();
}
function drawBow(x, y, angle) {

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.arc(0, 0, 25, -Math.PI / 2, Math.PI / 2);

    ctx.strokeStyle = "#713f12";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(0, 25);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}
function getAimAngle() {

    return Math.atan2(
        mouseY - (player1.y - 25),
        mouseX - player1.x
    );

}
function shootArrow() {
    if (gameOver) return;

    let angle = getAimAngle();

    let speed = 12;

    let arrow = {
        x: player1.x + 30,
        y: player1.y - 25,

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,

        owner: 1
    };

    arrows.push(arrow);

}
function shootArrow2() {
    if (gameOver) return;

    let dx = player1.x - player2.x;
    let dy = player1.y - 25 - (player2.y - 25);

    let speed = 12;
    let time = Math.abs(dx) / speed;

    let vx = Math.sign(dx) * speed;

    // Compensate for gravity
    let vy = (dy - gravity * time * (time - 1) / 2) / time;

    let arrow = {
        x: player2.x - 30,
        y: player2.y - 25,
        vx: vx,
        vy: vy,
        owner: 2
    };

    arrows.push(arrow);
}
function checkCollision(arrow) {

    let target = arrow.owner === 1 ? player2 : player1;

    let targetLeft = target.x - 45;
    let targetRight = target.x + 45;

    let targetTop = target.y - 70;
    let targetBottom = target.y + 45;

    return (
        arrow.x >= targetLeft &&
        arrow.x <= targetRight &&
        arrow.y >= targetTop &&
        arrow.y <= targetBottom
    );
}
function drawArrows() {

    arrows.forEach(function(arrow) {

        ctx.save();

        ctx.translate(arrow.x, arrow.y);

        let angle = Math.atan2(arrow.vy, arrow.vx);

        ctx.rotate(angle);

        // Arrow body
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(20, 0);

        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(12, -5);
        ctx.lineTo(12, 5);
        ctx.closePath();

        ctx.fillStyle = "#333333";
        ctx.fill();

        ctx.restore();

    });

}

function updateArrows() {

    if (gameOver) return;

    arrows.forEach(function(arrow) {
        arrow.x += arrow.vx;
        arrow.y += arrow.vy;
        arrow.vy += gravity;
    });

    arrows = arrows.filter(function(arrow) {

        if (checkCollision(arrow)) {

            if (arrow.owner === 1) {

                score1++;
                health2 = Math.max(0, health2 - 10);

                document.getElementById("score1").textContent = score1;
                document.getElementById("health2").style.width = health2 + "%";

                if (health2 === 0) {
                    endGame("Player 1 Wins!");
                }

            } else {

                score2++;
                health1 = Math.max(0, health1 - 10);

                document.getElementById("score2").textContent = score2;
                document.getElementById("health1").style.width = health1 + "%";

                if (health1 === 0) {
                    endGame("Player 2 Wins!");
                }
            }

            return false;
        }

        return arrow.x < canvas.width &&
               arrow.x > 0 &&
               arrow.y > 0 &&
               arrow.y < canvas.height;
    });
}function endGame(message) {

    gameOver = true;

    document.getElementById("gameMessage").textContent =
        message;

}
function drawGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = "#b9e5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    drawGround();

    // Players
    drawPlayer(player1);
    drawPlayer(player2);

    // Bow
    let angle = getAimAngle();

    drawBow(
        player1.x + 25,
        player1.y - 25,
        angle
    );

    let dx = player1.x - player2.x;
    let dy = player1.y - player2.y;

    let time = Math.abs(dx) / 12;

    let vy = (dy - gravity * time * (time - 1) / 2) / time;

    let aiAngle = Math.atan2(vy, dx);

    drawBow(
        player2.x - 25,
        player2.y - 25,
        aiAngle
    );
    // Arrows
    drawArrows();

}

function gameLoop() {

    if (!gameOver) {

        // Move Player 2
        player2.x += aiMoveDirection * aiMoveSpeed;

        if (player2.x >= 850) {
            aiMoveDirection = -1;
        }

        if (player2.x <= 620) {
            aiMoveDirection = 1;
        }

        // Player 2 jumping
        aiJumpTimer++;

        if (aiJumpTimer >= 150 && player2.y >= 330) {
            aiJumpVelocity = -9;
            aiJumpTimer = 0;
        }

        player2.y += aiJumpVelocity;
        aiJumpVelocity += 0.35;

        if (player2.y >= 330) {
            player2.y = 330;
            aiJumpVelocity = 0;
        }

        // Automatic shooting
        aiShootTimer++;

        if (aiShootTimer >= aiShootInterval) {
            shootArrow2();
            aiShootTimer = 0;
        }
    }

    updateArrows();
    drawGame();

    requestAnimationFrame(gameLoop);
}
gameLoop();
// Restart game
document.getElementById("restartBtn").addEventListener("click", function() {

    score1=0;
    score2=0;
    health1 = 100;
    health2 = 100;

    arrows = [];

    gameOver = false;
    player2.y=330;
    aiJumpVelocity=0;
    aiJumpTimer=0;
    aiMoveDirection=1;
    aiShootTimer=0;

    document.getElementById("score1").textContent = 0;
    document.getElementById("score2").textContent = 0;

    document.getElementById("health1").style.width = "100%";
    document.getElementById("health2").style.width = "100%";

    document.getElementById("gameMessage").textContent = "";

});
