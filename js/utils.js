const GameUtils = {
    calculatePosition(row, col) {
        const gridElement = document.querySelector('.grid');
        const gridWidth = gridElement.offsetWidth;
        const gap = 10; // gap 크기
        const padding = 10; // padding 크기
        const cellSize = (gridWidth - (padding * 2) - (gap * 3)) / 4; // 정확한 셀 크기 계산

        return {
            x: padding + (col * (cellSize + gap)),
            y: padding + (row * (cellSize + gap))
        };
    },

    getTileColor(value) {
        const colors = {
            1: '#FFB3BA',
            2: '#FF6B6B',
            3: '#4A90E2',
            4: '#2E5AAC',
            5: '#BAFFC9',
            6: '#42B883',
            7: '#FFE4B5',
            8: '#FF9933'
        };
        return colors[value] || '#cdc1b4';
    },

    getTileScore(level) {
        return Math.pow(2, level) * 10;
    }
};

window.GameUtils = GameUtils;
