const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext('2d');

const gridWidth = 80;
const gridHeight = 60;
const cellSize = 10;

const EMPTY = 0;
const WALL = 1;
const SAND = 2;
const WATER = 3;
const LAVA = 4;
const STEAM = 5;

let grid = [];
let currentElement = SAND;
let isMouseDown = false;
let isPaused = false;

const elements = {
    [EMPTY]: { color: 'black' },
    [WALL]: { color: 'gray' },
    [SAND]: { color: 'yellow', fallSpeed: 1 },
    [WATER]: { color: 'blue', fallSpeed: 1, spread: 1 },
    [LAVA]: { color: 'red', fallSpeed: 1, spread: 1 },
    [STEAM]: { color: 'lightgray', riseSpeed: 1 }
};

function initGrid() {
    for(let x = 0; x < gridWidth; x++) {
        grid[x] = [];
        for(let y = 0; y < gridHeight; y++) {
            grid[x][y] = EMPTY;
        }
    }
}

function drawCell(x, y) {
    offscreenCtx.fillStyle = elements[grid[x][y]].color;
    offscreenCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function updateGrid() {
    for (let y = gridHeight - 1; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            const element = grid[x][y];
            const elProperties = elements[element];
        
            if (elProperties.fallSpeed || elProperties.riseSpeed) {
                let nx = x;
                let ny = y + (elProperties.fallSpeed || -elProperties.riseSpeed);

                if (element === LAVA && grid[nx][ny] === WATER) {
                    grid[nx][ny] = STEAM;
                    grid[x][y] = EMPTY;
                    drawCell(x, y);
                    drawCell(nx, ny);
                    continue;
                }

                if (ny >= 0 && ny < gridHeight && nx >= 0 && nx < gridWidth && grid[nx][ny] === EMPTY) {
                    grid[nx][ny] = element;
                    grid[x][y] = EMPTY;
                    drawCell(x, y);
                    drawCell(nx, ny);
                } else if (elProperties.spread) {
                    // Try to spread out horizontally
                    const directions = [x - 1, x + 1];
                    directions.sort(() => Math.random() - 0.5); // Randomize direction
                    for (let dir of directions) {
                        if (dir >= 0 && dir < gridWidth && grid[dir][y] === EMPTY) {
                            grid[dir][y] = element;
                            grid[x][y] = EMPTY;
                            drawCell(x, y);
                            drawCell(dir, y);
                            break;
                        }
                    }
                }
            }
        }
    }

    ctx.drawImage(offscreenCanvas, 0, 0);
}

canvas.onmousedown = function(event) {
    isMouseDown = true;
    addElement(event);
};

canvas.onmouseup = function() {
    isMouseDown = false;
};

canvas.onmousemove = function(event) {
    if (isMouseDown) {
        addElement(event);
    }
};

function addElement(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        grid[x][y] = currentElement;
        drawCell(x, y);
    }
}

function gameLoop() {
    if (!isPaused) {
        updateGrid();
    }
    requestAnimationFrame(gameLoop);
}

function initGame() {
    offscreenCanvas.width = gridWidth * cellSize;
    offscreenCanvas.height = gridHeight * cellSize;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    initGrid();
    gameLoop();
}

initGame();

function selectElement(element) {
    currentElement = element;
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('btnPause').textContent = isPaused ? 'Play' : 'Pause';
}
