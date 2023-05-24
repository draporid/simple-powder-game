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

let grid = [];
let currentElement = SAND;
let isMouseDown = false;
let isPaused = false;

const elements = {
    [EMPTY]: { color: 'black' },
    [WALL]: { color: 'gray' },
    [SAND]: { color: 'yellow', fallSpeed: 1 },
    [WATER]: { color: 'blue', fallSpeed: 1, spread: 1 }
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
    const order = [];
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            order.push([x, y]);
        }
    }
    order.sort(() => Math.random() - 0.5);

    for (const [x, y] of order) {
        if (elements[grid[x][y]].fallSpeed) {
            let nx = x;
            let ny = y + elements[grid[x][y]].fallSpeed;

            if (ny >= 0 && ny < gridHeight && nx >= 0 && nx < gridWidth && grid[nx][ny] === EMPTY) {
                grid[nx][ny] = grid[x][y];
                grid[x][y] = EMPTY;
                drawCell(x, y);
                drawCell(nx, ny);
            } else if (ny < gridHeight && grid[x][y] === WATER) {
                const left = x - 1;
                const right = x + 1;
                const waterLeft = left >= 0 && left < gridWidth && grid[left][y] !== WALL && grid[left][ny] === EMPTY;
                const waterRight = right >= 0 && right < gridWidth && grid[right][y] !== WALL && grid[right][ny] === EMPTY;

                if (waterLeft && waterRight) {
                    nx = Math.random() < 0.5 ? left : right;
                } else if (waterLeft) {
                    nx = left;
                } else if (waterRight) {
                    nx = right;
                }

                if (nx !== x) {
                    grid[nx][ny] = grid[x][y];
                    grid[x][y] = EMPTY;
                    drawCell(x, y);
                    drawCell(nx, ny);
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
