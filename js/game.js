class ColorGame {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.tiles = new Map();
        this.score = 0;
        this.gridElement = document.querySelector('.grid');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.querySelector('.game-over');
        this.finalScoreElement = document.querySelector('.final-score');
        this.restartButton = document.querySelector('.restart-button');
        this.isAnimating = false;
        
        // 터치 이벤트를 위한 변수들
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchEndX = null;
        this.touchEndY = null;
        
        this.init();
        this.restartButton.addEventListener('click', () => this.restart());
    }

    init() {
        this.gridElement.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.gridElement.appendChild(cell);
            }
        }

        this.addNewTile();
        this.addNewTile();

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 터치 이벤트 리스너 추가
        this.gridElement.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.gridElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = 1;
            this.grid[row][col] = value;

            const tile = Tile.createTileElement(value, row, col);
            this.gridElement.appendChild(tile);
            
            const key = `${row}-${col}`;
            this.tiles.set(key, tile);

            tile.style.scale = '0';
            requestAnimationFrame(() => {
                tile.style.scale = '1';
            });
        }
    }

    async handleKeyPress(event) {
        if (this.isAnimating) return;

        switch(event.key) {
            case 'ArrowLeft':
                await this.moveTiles('left');
                break;
            case 'ArrowRight':
                await this.moveTiles('right');
                break;
            case 'ArrowUp':
                await this.moveTiles('up');
                break;
            case 'ArrowDown':
                await this.moveTiles('down');
                break;
        }
    }

    async moveTiles(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const moves = [];
        const newGrid = Array(4).fill().map(() => Array(4).fill(0));
        let hasChanged = false;

        switch(direction) {
            case 'left':
                for (let i = 0; i < 4; i++) {
                    let targetCol = 0;
                    for (let j = 0; j < 4; j++) {
                        if (this.grid[i][j] !== 0) {
                            if (j !== targetCol) {
                                moves.push({
                                    from: {row: i, col: j},
                                    to: {row: i, col: targetCol},
                                    value: this.grid[i][j]
                                });
                                hasChanged = true;
                            }
                            newGrid[i][targetCol] = this.grid[i][j];
                            targetCol++;
                        }
                    }
                }
                break;

            case 'right':
                for (let i = 0; i < 4; i++) {
                    let targetCol = 3;
                    for (let j = 3; j >= 0; j--) {
                        if (this.grid[i][j] !== 0) {
                            if (j !== targetCol) {
                                moves.push({
                                    from: {row: i, col: j},
                                    to: {row: i, col: targetCol},
                                    value: this.grid[i][j]
                                });
                                hasChanged = true;
                            }
                            newGrid[i][targetCol] = this.grid[i][j];
                            targetCol--;
                        }
                    }
                }
                break;

            case 'up':
                for (let j = 0; j < 4; j++) {
                    let targetRow = 0;
                    for (let i = 0; i < 4; i++) {
                        if (this.grid[i][j] !== 0) {
                            if (i !== targetRow) {
                                moves.push({
                                    from: {row: i, col: j},
                                    to: {row: targetRow, col: j},
                                    value: this.grid[i][j]
                                });
                                hasChanged = true;
                            }
                            newGrid[targetRow][j] = this.grid[i][j];
                            targetRow++;
                        }
                    }
                }
                break;

            case 'down':
                for (let j = 0; j < 4; j++) {
                    let targetRow = 3;
                    for (let i = 3; i >= 0; i--) {
                        if (this.grid[i][j] !== 0) {
                            if (i !== targetRow) {
                                moves.push({
                                    from: {row: i, col: j},
                                    to: {row: targetRow, col: j},
                                    value: this.grid[i][j]
                                });
                                hasChanged = true;
                            }
                            newGrid[targetRow][j] = this.grid[i][j];
                            targetRow--;
                        }
                    }
                }
                break;
        }

        if (hasChanged) {
            await Movement.animateMoves(moves, this.tiles);
            this.grid = newGrid;
        }

        const merged = await Movement.checkAndMergeSameColors(this, direction);
        
        if (hasChanged || merged) {
            this.addNewTile();
        }

        if (this.checkGameOver()) {
            this.gameOver();
        }

        this.isAnimating = false;
    }

    // 터치 시작 핸들러
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    // 터치 종료 핸들러
    handleTouchEnd(event) {
        event.preventDefault();
        if (!this.touchStartX || !this.touchStartY || this.isAnimating) return;
        
        const touch = event.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;

        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        // 최소 스와이프 거리 (픽셀)
        const minSwipeDistance = 30;  

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 수평 스와이프
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.moveTiles('right');
                } else {
                    this.moveTiles('left');
                }
            }
        } else {
            // 수직 스와이프
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    this.moveTiles('down');
                } else {
                    this.moveTiles('up');
                }
            }
        }

        // 터치 좌표 초기화
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchEndX = null;
        this.touchEndY = null;
    }

    checkGameOver() {
        // 빈 셀이 있는지 확인
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // 가로 방향으로 같은 색상이 4개 연속인지 확인
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j <= 0; j++) {
                const current = this.grid[i][j];
                if (current === this.grid[i][j+1] &&
                    current === this.grid[i][j+2] &&
                    current === this.grid[i][j+3]) {
                    return false;
                }
            }
        }

        // 세로 방향으로 같은 색상이 4개 연속인지 확인
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i <= 0; i++) {
                const current = this.grid[i][j];
                if (current === this.grid[i+1][j] &&
                    current === this.grid[i+2][j] &&
                    current === this.grid[i+3][j]) {
                    return false;
                }
            }
        }

        return true;
    }

    gameOver() {
        this.gameOverElement.style.display = 'flex';
        this.finalScoreElement.textContent = this.score;
    }

    restart() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.scoreElement.textContent = '0';
        
        this.tiles.forEach(tile => tile.remove());
        this.tiles.clear();
        
        this.gameOverElement.style.display = 'none';
        
        this.addNewTile();
        this.addNewTile();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new ColorGame();
});
