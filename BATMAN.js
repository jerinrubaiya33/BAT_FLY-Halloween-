// Board setup
let board;
let context;

if (window.innerWidth < 768) { // Mobile
    var boardWidth = 373; // Adjusted width for smaller screens
    var boardHeight = 715; // Adjusted height for smaller screens
} else { // Desktop
    var boardWidth = 540; // Width for desktop
    var boardHeight = 650; // Height for desktop
}

// Doodler
let doodlerWidth = 130;
let doodlerHeight = 80;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
}

// Physics
let velocityX = 0;
let velocityY = 0; // Doodler jump speed
let initialVelocityY;
let gravity;

// Check if it's mobile or desktop, then adjust physics
if (window.innerWidth < 768) { // Mobile
    initialVelocityY = -4.2; // Slower jump speed for mobile
    gravity = 0.2; // Slower gravity for mobile
} else { // Desktop
    initialVelocityY = -6.0; // Original smoother jump speed for desktop
    gravity = 0.3; // Original gravity for desktop
}

// Platforms
let platformArray = [];
let platformWidth = 70;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;
let popupShown = false; // New variable to control popup display
let isOnPlatform = false; // New variable to track platform contact on mobile

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Used for drawing on the board

    // Load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "https://jerinrubaiya33.github.io/Pics/BatR.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function () {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "https://jerinrubaiya33.github.io/Pics/Bat.png";

    platformImg = new Image();
    platformImg.src = "https://jerinrubaiya33.github.io/Pics/p-white.png";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);

    // Mobile controls
    document.addEventListener("touchstart", jumpDoodler); // Tap to jump
    document.addEventListener("touchmove", swipeDoodler); // Swipe to move
    document.addEventListener("keydown", moveDoodler); // For desktop testing
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        if (!popupShown) { // Show popup only once
            showGameOverPopup();
            popupShown = true; // Set to true to prevent further popups
        }
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Doodler movement and position
    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    // Apply gravity
    velocityY += gravity;
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true; // Trigger game over when doodler falls below the board
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Update platforms and check for collisions
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY; // Slide platform down
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY; // Jump
            isOnPlatform = true; // Set to true on collision
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Remove platforms that go out of bounds and add new ones at the top
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    // Update and display score
    updateScore();
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(score, 5, 20);
}


// Touch event to make doodler jump// Add gyro support for mobile
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function(event) {
        // Check the gamma (tilt left or right) value
        let tilt = event.gamma; // Gamma ranges from -90 to 90
        if (tilt > 15) { // Tilt right
            velocityX = 4;
            doodler.img = doodlerRightImg;
        } else if (tilt < -15) { // Tilt left
            velocityX = -4;
            doodler.img = doodlerLeftImg;
        } else { // Neutral tilt
            velocityX = 0;
        }
    });
}

function jumpDoodler(e) {
    if (gameOver) {
        resetGame();
    } else if (isOnPlatform) { // Only jump if doodler is on a platform
        velocityY = initialVelocityY;
        isOnPlatform = false; // Reset after jump
    }
}

// Swipe event to control doodler direction
let startX;
function swipeDoodler(e) {
    if (e.touches.length == 1) {
        let touch = e.touches[0];
        if (!startX) startX = touch.clientX;

        let deltaX = touch.clientX - startX;

        // Check swipe direction
        if (deltaX > 20) { // Swipe right
            velocityX = 4;
            doodler.img = doodlerRightImg;
        } else if (deltaX < -20) { // Swipe left
            velocityX = -4;
            doodler.img = doodlerLeftImg;
        }
    }
}

// Reset startX after each swipe
document.addEventListener("touchend", () => startX = null);

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { // Move right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") { // Move left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    } else if (e.code == "Space" && gameOver) {
        resetGame();
    }
}

function resetGame() {
    doodler = {
        img: doodlerRightImg,
        x: doodlerX,
        y: doodlerY,
        width: doodlerWidth,
        height: doodlerHeight
    }
    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    popupShown = false;
    isOnPlatform = false;
    placePlatforms();
}

// Platform setup functions
function placePlatforms() {
    platformArray = [];

    // Starting platform (centered)
    let platform = {
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    }
    platformArray.push(platform);

    let platformCount, verticalSpacing;

    if (window.innerWidth < 768) { // Mobile version
        platformCount = 8;  // Fewer platforms for mobile
        verticalSpacing = 90;  // Increase vertical spacing for mobile
    } else { // Desktop version
        platformCount = 10;  // Original number of platforms for desktop
        verticalSpacing = 75;  // Original vertical spacing for desktop
    }

    // Create additional platforms at random positions
    for (let i = 0; i < platformCount; i++) {
        let randomX = Math.floor(Math.random() * (boardWidth - platformWidth)); // Random X position
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - verticalSpacing * i - 150, // Adjust the vertical spacing
            width: platformWidth,
            height: platformHeight
        }
        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * (boardWidth - platformWidth)); // Random X position
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight, // Start above the screen
        width: platformWidth,
        height: platformHeight
    }
    platformArray.push(platform);
}

// Detect collision between doodler and platform
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   
           a.x + a.width > b.x &&
           a.y + a.height > b.y &&
           a.y + a.height < b.y + b.height + 5; // Small buffer to smooth jumps
}

// Update score function
function updateScore() {
    let points = Math.floor(50 * Math.random());
    if (velocityY < 0) {
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    } else if (velocityY >= 0) {
        maxScore -= points;
    }
}

// Show game over popup
function showGameOverPopup() {
    // Create popup element
    const gameOverPopup = document.createElement("div");
    gameOverPopup.id = "gameOverPopup";
    
    // Set message based on screen size
    if (window.innerWidth < 768) { // Mobile version
        gameOverPopup.innerText = "Game Over! Start a new game by refreshing the page.";
    }
 else { // Desktop version
        gameOverPopup.innerText = "Game Over! Start a new game by refreshing the page.";
    }

    document.body.appendChild(gameOverPopup);
    gameOverPopup.style.position = "absolute";
    gameOverPopup.style.top = "50%";
    gameOverPopup.style.left = "50%";
    gameOverPopup.style.transform = "translate(-50%, -50%)";
    gameOverPopup.style.fontSize = "20px";
    gameOverPopup.style.padding = "20px";
    gameOverPopup.style.background = "rgba(0,0,0,0.7)";
    gameOverPopup.style.color = "white";
    gameOverPopup.style.borderRadius = "10px";
    gameOverPopup.style.textAlign = "center";
}
// Show game over popup with a restart button
function showGameOverPopup() {
    // Create popup element
    const gameOverPopup = document.createElement("div");
    gameOverPopup.id = "gameOverPopup";
    
    // Set message based on screen size
    if (window.innerWidth < 768) { // Mobile version
        gameOverPopup.innerText = "Game Over! ";
    } else { // Desktop version
        gameOverPopup.innerText = "Game Over! ";
    }

    // Create restart button
    const restartButton = document.createElement("button");
    restartButton.innerText = "Restart";
    restartButton.style.marginTop = "10px";
    restartButton.style.padding = "10px 20px";
    restartButton.style.fontSize = "18px";
    restartButton.style.border = "none";
    restartButton.style.backgroundColor = "red"; // Green button
    restartButton.style.color = "white";
    restartButton.style.borderRadius = "5px";
    restartButton.style.cursor = "pointer";

    // Add click event to restart button
    restartButton.onclick = function () {
        resetGame();
        document.body.removeChild(gameOverPopup); // Remove popup after restarting the game
    }

    // Append restart button to popup
    gameOverPopup.appendChild(restartButton);

    document.body.appendChild(gameOverPopup);
    gameOverPopup.style.position = "absolute";
    gameOverPopup.style.top = "50%";
    gameOverPopup.style.left = "50%";
    gameOverPopup.style.transform = "translate(-50%, -50%)";
    gameOverPopup.style.fontSize = "20px";
    gameOverPopup.style.padding = "20px";
    gameOverPopup.style.background = "rgba(0,0,0,0.7)";
    gameOverPopup.style.color = "white";
    gameOverPopup.style.borderRadius = "10px";
    gameOverPopup.style.textAlign = "center";
}
