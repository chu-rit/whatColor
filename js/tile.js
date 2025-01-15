class Tile {
    static createTileElement(value, row, col) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (value === 0) {
            tile.style.background = GameUtils.getTileColor(0);
        } else {
            tile.style.backgroundColor = GameUtils.getTileColor(value);
        }
        
        const position = GameUtils.calculatePosition(row, col);
        tile.style.transform = `translate(${position.x}px, ${position.y}px)`;
        
        return tile;
    }
}

window.Tile = Tile;
