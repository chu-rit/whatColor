class Movement {
    static async animateMoves(moves, tiles) {
        const promises = moves.map(move => {
            const key = `${move.from.row}-${move.from.col}`;
            const tile = tiles.get(key);
            if (!tile) return Promise.resolve();

            const newPos = GameUtils.calculatePosition(move.to.row, move.to.col);
            tile.style.transform = `translate(${newPos.x}px, ${newPos.y}px)`;

            tiles.delete(key);
            const newKey = `${move.to.row}-${move.to.col}`;
            tiles.set(newKey, tile);

            return new Promise(resolve => {
                tile.addEventListener('transitionend', resolve, {once: true});
            });
        });

        await Promise.all(promises);
    }

    static async checkAndMergeSameColors(game, direction) {
        let merged = false;
        let upgradedPositions = new Set();

        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j <= 0; j++) {
                    const blocks = [
                        game.grid[i][j],
                        game.grid[i][j+1],
                        game.grid[i][j+2],
                        game.grid[i][j+3]
                    ];

                    const firstNonZero = blocks.find(block => block !== 0);
                    if (!firstNonZero) continue;

                    const isValid = blocks.every(block => block === firstNonZero || block === 0);
                    const nonZeroCount = blocks.filter(block => block !== 0).length;
                    
                    if (isValid && nonZeroCount === 4) {
                        let containsUpgraded = false;
                        for (let k = j; k < j + 4; k++) {
                            if (upgradedPositions.has(`${i}-${k}`)) {
                                containsUpgraded = true;
                                break;
                            }
                        }
                        if (containsUpgraded) continue;

                        for (let k = j; k < j + 4; k++) {
                            const key = `${i}-${k}`;
                            const tile = game.tiles.get(key);
                            if (tile) {
                                tile.style.scale = '0';
                                setTimeout(() => tile.remove(), 200);
                                game.tiles.delete(key);
                            }
                        }

                        const nextColor = firstNonZero + 1;
                        const newCol = direction === 'left' ? j : j + 3;

                        game.grid[i][j] = 0;
                        game.grid[i][j+1] = 0;
                        game.grid[i][j+2] = 0;
                        game.grid[i][j+3] = 0;
                        game.grid[i][newCol] = nextColor;

                        const newTile = Tile.createTileElement(nextColor, i, newCol);
                        game.gridElement.appendChild(newTile);
                        game.tiles.set(`${i}-${newCol}`, newTile);

                        upgradedPositions.add(`${i}-${newCol}`);

                        game.score += GameUtils.getTileScore(nextColor);
                        game.scoreElement.textContent = game.score;

                        merged = true;
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }
            }
        } else if (direction === 'up' || direction === 'down') {
            // 세로 방향도 동일한 로직
            for (let j = 0; j < 4; j++) {
                for (let i = 0; i <= 0; i++) {
                    const blocks = [
                        game.grid[i][j],
                        game.grid[i+1][j],
                        game.grid[i+2][j],
                        game.grid[i+3][j]
                    ];

                    const firstNonZero = blocks.find(block => block !== 0);
                    if (!firstNonZero) continue;

                    const isValid = blocks.every(block => block === firstNonZero || block === 0);
                    const nonZeroCount = blocks.filter(block => block !== 0).length;
                    
                    if (isValid && nonZeroCount === 4) {
                        let containsUpgraded = false;
                        for (let k = i; k < i + 4; k++) {
                            if (upgradedPositions.has(`${k}-${j}`)) {
                                containsUpgraded = true;
                                break;
                            }
                        }
                        if (containsUpgraded) continue;

                        for (let k = i; k < i + 4; k++) {
                            const key = `${k}-${j}`;
                            const tile = game.tiles.get(key);
                            if (tile) {
                                tile.style.scale = '0';
                                setTimeout(() => tile.remove(), 200);
                                game.tiles.delete(key);
                            }
                        }

                        const nextColor = firstNonZero + 1;
                        const newRow = direction === 'up' ? i : i + 3;

                        game.grid[i][j] = 0;
                        game.grid[i+1][j] = 0;
                        game.grid[i+2][j] = 0;
                        game.grid[i+3][j] = 0;
                        game.grid[newRow][j] = nextColor;

                        const newTile = Tile.createTileElement(nextColor, newRow, j);
                        game.gridElement.appendChild(newTile);
                        game.tiles.set(`${newRow}-${j}`, newTile);

                        upgradedPositions.add(`${newRow}-${j}`);

                        game.score += GameUtils.getTileScore(nextColor);
                        game.scoreElement.textContent = game.score;

                        merged = true;
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }
            }
        }

        return merged;
    }
}

window.Movement = Movement;
