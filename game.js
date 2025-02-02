const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Add background music
const bgMusic = new Audio('./assets/bgmsc.mp3');
bgMusic.loop = true; // Loop the music

// Add arrow sound effect
const arrowSound = new Audio('./assets/arrow.mp3');

// Make the canvas full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Load images
const characterImage = new Image();
characterImage.src = './assets/idle.png';

const runImage = new Image();
runImage.src = './assets/run.png';

const runLeftImage = new Image();
runLeftImage.src = './assets/run2.png';

const jumpImage = new Image();
jumpImage.src = './assets/jump.png';

const attackImage = new Image();
attackImage.src = './assets/attack.png';

const backgroundImage = new Image();
backgroundImage.src = './assets/bg2.gif';

const arrowImage = new Image();
arrowImage.src = './assets/arrow.png';

const heartImage = new Image();
heartImage.src = './assets/hearts.png';

const groundLevelImage = new Image();
groundLevelImage.src = './assets/ground_level.png';

const mudImage = new Image();
mudImage.src = './assets/mud.png';

const platformImage = new Image();
platformImage.src = './assets/platform.png';

const wallImage = new Image();
wallImage.src = './assets/endwall.png';

const infoImage = new Image();
infoImage.src = './infos/info1.png';

const startImage = new Image();
startImage.src = './assets/start.png';

const endImage = new Image();
endImage.src = './assets/end.png';

const aboutImage = new Image();
aboutImage.src = './assets/about.png';

const guideImage = new Image();
guideImage.src = './assets/guide.png';

const arrows = [];

// Load trap images
const trapImages = [];
const trapImageSources = ['./assets/trap1.png', './assets/trap2.png', './assets/trap3.png', './assets/trap4.png'];

trapImageSources.forEach((src, index) => {
    trapImages[index] = new Image();
    trapImages[index].src = src;
});

const infoImages = [
    './infos/info1.png',  // 1st trap
    './infos/info2.png',  // 2nd trap
    './infos/info3.png',  // 4th trap
    './infos/info4.png',  // 5th trap
    './infos/info5.png',  // 7th trap
    './infos/info6.png',  // 9th trap
    './infos/info7.png',  // 10th trap
    './infos/info8.png',  // 12th trap
    './infos/info9.png',  // 13th trap
    './infos/info10.png', // 15th trap
    './infos/info11.png', // 16th trap
    './infos/info12.png', // 17th trap
    './infos/info13.png', // 18th trap
    './infos/info14.png', // 19th trap
    './infos/info15.png'  // 20th trap
];

let currentInfoImage = 0;

// Player object
const player = {
    x: 50,
    y: canvasHeight - 150,
    width: 70,
    height: 85,
    speed: 5,
    dx: 0,
    dy: 0,
    gravity: 0.5,
    jumpStrength: -18,
    grounded: false,
    lives: 5,
    jumpCount: 0,
    maxJumps: 3,
};

let score = 0;
let startTime = Date.now();
let monstersKilled = 0; // Add this variable to track the number of monsters killed

const groundLevel = canvasHeight - 100;

// Platform and trap arrays
const platforms = [
    { x: 0, y: groundLevel, width: 1000000, height: 90 },

];

const traps = []; // Start with an empty array

let lastPlatformX = platforms[platforms.length - 1].x;
let lastTrapX = 0; // Initialize last trap position

let wall = null; // Add a variable to store the wall

let showInfo = false; // Flag to indicate if info image should be shown
let showingAbout = false; // Flag to indicate if about screen is shown
let showingHowToPlay = false; // Flag to indicate if how to play screen is shown

function generatePlatform() {
    const platformWidth = 150;
    const platformHeight = 20;
    const platformX = lastPlatformX + 400;
    const platformY = groundLevel - Math.random() * 300 - 100;
    platforms.push({ x: platformX, y: platformY, width: platformWidth, height: platformHeight });
    lastPlatformX = platformX;
}

function generateTrap() {
    if (traps.length >= 20) return; // Limit the number of traps to 20
    const trapWidth = 60;
    const trapHeight = 60;
    const trapX = lastTrapX + 1000;
    let trapY;
    const trapImageIndex = Math.floor(Math.random() * trapImages.length);
    const trapImage = trapImages[trapImageIndex];
    let dx = 0, dy = 0;

    if (trapImageIndex === 1) { // Trap 2
        // Place trap on a random platform or ground level
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        trapY = platform.y - trapHeight;
        dx = 2; // Set horizontal speed for trap 2
    } else if (trapImageIndex === 2) { // Trap 3
        // Place trap on a random platform or ground level
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        trapY = platform.y - trapHeight;
        dx = 2; // Set horizontal speed for trap 3
    } else if (trapImageIndex === 3) { // Trap 4
        // Place trap randomly within a range and set vertical speed
        trapY = groundLevel - Math.random() * 300 - 50;
        dy = 2; // Set vertical speed for trap 4
    } else {
        // Place trap randomly within a range and set vertical speed
        trapY = groundLevel - Math.random() * 300 - 50;
        dy = 2; // Set vertical speed for trap 1
    }

    traps.push({ x: trapX, y: trapY, width: trapWidth, height: trapHeight, image: trapImage, dx: dx, dy: dy });
    lastTrapX = trapX;
}

function drawPlayer() {
    let image;
    if (player.attacking) {
        image = attackImage;
    } else if (player.dy !== 0) {
        image = jumpImage;
    } else if (player.dx > 0) {
        image = runImage;
    } else if (player.dx < 0) {
        image = runLeftImage;
    } else {
        image = characterImage;
    }
    ctx.drawImage(image, player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        if (platform.y === groundLevel) {
            for (let x = platform.x; x < platform.x + platform.width; x += 50) {
                ctx.drawImage(groundLevelImage, x, platform.y, 50, 50);
                ctx.drawImage(mudImage, x, platform.y + 50, 50, 50); // Draw mud below ground level
            }
        } else {
            for (let x = platform.x; x < platform.x + platform.width; x += 50) {
                ctx.drawImage(platformImage, x, platform.y, 100, platform.height);
            }
        }
    });

    // Draw startImage more to the right, below the first platform
    const firstPlatform = platforms[0];
    if (firstPlatform) {
        ctx.drawImage(startImage, firstPlatform.x + 400, groundLevel - 100, 100, 100);
    }
}

function drawTraps() {
    traps.forEach(trap => {
        ctx.drawImage(trap.image, trap.x, trap.y, trap.width, trap.height);
    });
}

function drawArrows() {
    arrows.forEach(arrow => {
        ctx.drawImage(arrowImage, arrow.x, arrow.y, arrow.width, arrow.height);
    });
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
}

function drawLives() {
    for (let i = 0; i < player.lives; i++) {
        ctx.drawImage(heartImage, 20 + i * 30, 10, 25, 25); // Move hearts to the top
    }
}

function drawScoreAndTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    ctx.fillStyle = 'white'; // Change font color to white
    ctx.font = '20px Arial';
    drawLives(); // Draw the lives first
    ctx.fillText(`Score: ${score}`, 20, 60); // Adjust position to be below hearts
    ctx.fillText(`Time: ${elapsedTime}s`, 20, 90);
    ctx.fillText(`Monster Killed: ${monstersKilled}`, 20, 120); // Update kill count display
}

function clear() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function resetGame() {
    player.x = 50;
    player.y = canvasHeight - 150;
    player.lives = 5;
    player.dx = 0;
    player.dy = 0;
    score = 0;
    startTime = Date.now();
    monstersKilled = 0;
    platforms.length = 0;
    traps.length = 0;
    platforms.push(
        { x: 0, y: groundLevel, width: canvasWidth, height: 20 },
        { x: 200, y: groundLevel - 100, width: 100, height: 20 },
        { x: 400, y: groundLevel - 200, width: 100, height: 20 },
        { x: 600, y: groundLevel - 300, width: 100, height: 20 },
        { x: 800, y: groundLevel - 400, width: 100, height: 20 }
    );
    lastPlatformX = platforms[platforms.length - 1].x;
    lastTrapX = 0; // Reset last trap position
}

let scoreUpdateCounter = 0;

function update() {
    if (player.y + player.height < canvasHeight) {
        player.dy += player.gravity;
    } else {
        player.dy = 0;
        player.grounded = true;
    }

    player.x += player.dx;
    player.y += player.dy;

    let onPlatform = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            player.grounded = true;
            player.dy = 0;
            player.y = platform.y - player.height;
            player.jumpCount = 0;
            onPlatform = true;
        }
    });

    if (!onPlatform && player.y + player.height < canvasHeight) {
        player.dy += player.gravity; // Apply gravity if not on a platform
    }

    traps.forEach(trap => {
        if (trap.dy !== 0) { // Move traps 1 and 4 vertically
            trap.y += trap.dy;
            if (trap.y <= groundLevel - 300 || trap.y >= groundLevel - 50) {
                trap.dy *= -1; // Reverse direction when reaching bounds
            }
        }

        if (trap.dx !== 0) { // Move traps 2 and 3 horizontally
            trap.x += trap.dx;
            if (trap.x <= 0 || trap.x >= canvasWidth - trap.width) {
                trap.dx *= -1; // Reverse direction when reaching bounds
            }
        }

        if (player.x < trap.x + trap.width &&
            player.x + player.width > trap.x &&
            player.y < trap.y + trap.height &&
            player.y + player.height > trap.y) {
            // Player hits a trap
            player.lives -= 1;
            player.x = 50;
            player.y = canvasHeight - 150;
            if (player.lives <= 0) {
                alert("Game Over!");
                resetGame();
            }
        }
    });

    updateArrows();
    checkArrowCollisions();

    // Scroll the background, platforms, and traps to the left as the player moves right
    if (player.dx > 0 && player.x + player.width > canvasWidth / 2 && monstersKilled < 20) {
        player.x = canvasWidth / 2 - player.width;
        platforms.forEach(platform => {
            platform.x -= player.dx;
        });
        traps.forEach(trap => {
            trap.x -= player.dx;
        });
        lastPlatformX -= player.dx;
        lastTrapX -= player.dx;
    }

    // Generate new platforms and traps as the player moves right
    if (monstersKilled < 20) {
        if (player.x + player.width > lastPlatformX - 200) {
            generatePlatform();
        }
        if (player.x + player.width > lastTrapX - 200) {
            generateTrap();
        }
    }

    if (!player.grounded) {
        player.dy += player.gravity;
    } else {
        player.dy = 0;
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvasWidth) player.x = canvasWidth - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvasHeight) player.y = canvasHeight - player.height;

    // Prevent player from passing through the wall
    if (wall && player.x + player.width > wall.x) {
        player.x = wall.x - player.width;
    }

    // Increment score over time, but slower
    scoreUpdateCounter++;
    if (scoreUpdateCounter % 15 === 0) { // Adjust this value to control the speed
        score += 1;
    }

    checkGameEnd();
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function jump() {
    if (player.grounded || player.jumpCount < player.maxJumps) {
        player.dy = player.jumpStrength;
        player.grounded = false;
        player.jumpCount++;
    }
}

function shootArrow() {
    player.attacking = true;
    arrowSound.play(); // Play arrow sound effect
    setTimeout(() => player.attacking = false, 200); // Reset attacking state after 200ms
    const arrow = {
        x: player.x + player.width,
        y: player.y + player.height / 2 - 25, // Adjust to be in the middle of the attack image
        width: 50,
        height: 50,
        speed: 10,
    };
    arrows.push(arrow);
}

function updateArrows() {
    arrows.forEach((arrow, index) => {
        arrow.x += arrow.speed;
        if (arrow.x > canvasWidth) {
            arrows.splice(index, 1);
        }
    });
}

function checkArrowCollisions() {
    arrows.forEach((arrow, arrowIndex) => {
        traps.forEach((trap, trapIndex) => {
            if (arrow.x < trap.x + trap.width &&
                arrow.x + arrow.width > trap.x &&
                arrow.y < trap.y + trap.height &&
                arrow.y + arrow.height > trap.y) {
                traps.splice(trapIndex, 1);
                arrows.splice(arrowIndex, 1);
                score += 100; // Increase score for hitting a trap
                monstersKilled++; // Increment the monsters killed count
                if ([1, 2, 4, 5, 7, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20].includes(monstersKilled)) {
                    currentInfoImage = [1, 2, 4, 5, 7, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20].indexOf(monstersKilled) + 1;
                    showInfo = true; // Show info image when specific traps are killed
                }
            }
        });
    });
    drawScoreAndTimer(); // Update the kill count display
}

function drawWall() {
    if (wall) {
        ctx.drawImage(wallImage, wall.x, wall.y, wall.width, wall.height);
    }
}

function drawEndImage() {
    ctx.drawImage(endImage, canvasWidth / 2 - 150, groundLevel - 100, 100, 100);
}

function checkGameEnd() {
    if (monstersKilled >= 20 && !wall) { // Check if 20 traps have been killed and wall is not created
        wall = { x: lastPlatformX + 200, y: 0, width: 300, height: canvasHeight }; // Add the wall with full height
    }
}

function drawInfo() {
    if (showInfo) {
        const infoImage = new Image();
        infoImage.src = infoImages[currentInfoImage - 1];
        ctx.drawImage(infoImage, 0, 0, canvasWidth, canvasHeight); // Adjust size to match screen size
    }
}

function keyDown(e) {
    if (showInfo) {
        if (e.key === 'Enter') {
            showInfo = false; // Hide info image if Enter key is pressed
        }
        return;
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
        jump();
    } else if (e.key === ' ') {
        e.preventDefault(); // Prevent default action for spacebar
        shootArrow();
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' ||
        e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = 0;
    }
}

document.getElementById('startButton').addEventListener('click', function() {
    // Code to start the game
    bgMusic.play(); // Play background music
    startGame();
});

document.getElementById('aboutButton').addEventListener('click', function() {
    showingAbout = true;
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('aboutButton').style.display = 'none';
    document.getElementById('exitButton').style.display = 'none';
    clear();
    ctx.drawImage(aboutImage, 0, 0, canvasWidth, canvasHeight);
    // Create and display an exit button inside the about screen
    const aboutExitButton = document.createElement('button');
    aboutExitButton.id = 'aboutExitButton';
    aboutExitButton.innerText = 'Exit';
    aboutExitButton.style.position = 'absolute';
    aboutExitButton.style.top = '10px';
    aboutExitButton.style.right = '10px';
    document.body.appendChild(aboutExitButton);
    aboutExitButton.addEventListener('click', function() {
        showingAbout = false;
        document.getElementById('startButton').style.display = 'block';
        document.getElementById('aboutButton').style.display = 'block';
        document.getElementById('exitButton').style.display = 'block';
        document.body.removeChild(aboutExitButton);
        clear();
        drawBackground();
    });
});

document.getElementById('howToPlayButton').addEventListener('click', function() {
    showingHowToPlay = true;
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('aboutButton').style.display = 'none';
    document.getElementById('howToPlayButton').style.display = 'none';
    document.getElementById('exitButton').style.display = 'none';
    document.getElementById('interactiveImage').style.display = 'none'; // Hide the image
    clear();
    ctx.drawImage(guideImage, 0, 0, canvasWidth, canvasHeight);
    // Create and display an exit button inside the how to play screen
    const howToPlayExitButton = document.createElement('button');
    howToPlayExitButton.id = 'howToPlayExitButton';
    howToPlayExitButton.innerText = 'Exit';
    howToPlayExitButton.style.position = 'absolute';
    howToPlayExitButton.style.top = '10px';
    howToPlayExitButton.style.right = '10px';
    document.body.appendChild(howToPlayExitButton);
    howToPlayExitButton.addEventListener('click', function() {
        showingHowToPlay = false;
        document.getElementById('startButton').style.display = 'block';
        document.getElementById('aboutButton').style.display = 'block';
        document.getElementById('howToPlayButton').style.display = 'block';
        document.getElementById('exitButton').style.display = 'block';
        document.getElementById('interactiveImage').style.display = 'block'; // Show the image again
        document.body.removeChild(howToPlayExitButton);
        clear();
        drawBackground();
    });
});

document.getElementById('exitButton').addEventListener('click', function() {
    if (showingAbout) {
        showingAbout = false;
        document.getElementById('startButton').style.display = 'block';
        document.getElementById('aboutButton').style.display = 'block';
        document.getElementById('exitButton').style.display = 'block';
        clear();
        drawBackground();
    } else if (confirm("Are you sure you want to exit the game?")) {
        bgMusic.pause(); // Pause background music
        window.close();
    }
});

function startGame() {
    // Initialize and start the game
    gameLoop();
}

function gameLoop() {
    if (showingAbout || showingHowToPlay) return; // Pause game loop if showing about or how to play screen
    clear();
    drawBackground();
    drawPlayer();
    drawPlatforms();
    drawTraps();
    drawArrows();
    drawWall(); // Draw the wall
    drawScoreAndTimer();
    if (showInfo) {
        drawInfo(); // Draw info image if flag is set
    } else {
        update();
    }
    if (monstersKilled >= 20) {
        drawEndImage(); // Draw end image when game is done
    }
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', function() {
    if (showInfo) {
        showInfo = false; // Hide info image and resume game on click
    }
});
//end-lagos-resume
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);