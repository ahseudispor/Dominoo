// Elementos químicos disponíveis
const elements = [
    { symbol: 'H', electrons: 1, color: '#3b82f6' },   // Azul
    { symbol: 'Li', electrons: 1, color: '#3b82f6' },  // Azul
    { symbol: 'Be', electrons: 2, color: '#ef4444' },  // Vermelho
    { symbol: 'C', electrons: 4, color: '#8b5cf6' },   // Roxo
    { symbol: 'N', electrons: 5, color: '#ef4444' },   // Vermelho
    { symbol: 'O', electrons: 6, color: '#3b82f6' },   // Azul
    { symbol: 'F', electrons: 7, color: '#10b981' }    // Verde
];

// Estado do jogo
let gameState = {
    playerHand: [],
    cpuHand: [],
    buyPile: [],
    board: [],
    currentPlayer: 'player',
    selectedPiece: null,
    scores: { player: 0, cpu: 0 }
};

// Criar todas as 28 peças
function createPieces() {
    const pieces = [];
    let id = 0;
    
    for (let i = 0; i < elements.length; i++) {
        for (let j = i; j < elements.length; j++) {
            pieces.push({
                id: id++,
                left: elements[i],
                right: elements[j]
            });
        }
    }
    
    return pieces;
}

// Embaralhar array
function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Iniciar jogo
function initGame() {
    const allPieces = createPieces();
    const shuffled = shuffle(allPieces);
    
    gameState.playerHand = shuffled.slice(0, 7);
    gameState.cpuHand = shuffled.slice(7, 14);
    gameState.buyPile = shuffled.slice(14);
    gameState.board = [];
    gameState.currentPlayer = 'player';
    gameState.selectedPiece = null;
    gameState.scores = { player: 0, cpu: 0 };
    
    updateUI();
    setMessage('Seu turno! Clique em uma peça');
}

// Verificar se peça pode conectar
function canConnect(piece, side) {
    if (gameState.board.length === 0) return true;
    
    const boardPiece = side === 'left' ? gameState.board[0] : gameState.board[gameState.board.length - 1];
    const connectPoint = side === 'left' ? boardPiece.left : boardPiece.right;
    
    return piece.left.symbol === connectPoint.symbol || piece.right.symbol === connectPoint.symbol;
}

// Verificar regra do octeto
function checkOctet(elem1, elem2) {
    return elem1.electrons + elem2.electrons === 8;
}

// Jogar peça
function playPiece(piece, side) {
    if (gameState.currentPlayer !== 'player' || !gameState.selectedPiece) return;
    
    // Primeira jogada
    if (gameState.board.length === 0) {
        gameState.board.push(piece);
        gameState.playerHand = gameState.playerHand.filter(p => p.id !== piece.id);
        gameState.selectedPiece = null;
        
        if (checkWin('player')) return;
        
        gameState.currentPlayer = 'cpu';
        updateUI();
        setTimeout(cpuTurn, 1000);
        return;
    }
    
    // Verificar conexão
    if (!canConnect(piece, side)) {
        setMessage('Essa peça não conecta aqui!');
        return;
    }
    
    const boardPiece = side === 'left' ? gameState.board[0] : gameState.board[gameState.board.length - 1];
    const connectPoint = side === 'left' ? boardPiece.left : boardPiece.right;
    
    let orientedPiece = { ...piece };
    
    if (side === 'left') {
        if (piece.right.symbol !== connectPoint.symbol) {
            orientedPiece = { ...piece, left: piece.right, right: piece.left };
        }
        
        if (checkOctet(orientedPiece.right, connectPoint)) {
            gameState.scores.player += 10;
            setMessage('Octeto completo! +10 pontos!');
        }
        
        gameState.board.unshift(orientedPiece);
    } else {
        if (piece.left.symbol !== connectPoint.symbol) {
            orientedPiece = { ...piece, left: piece.right, right: piece.left };
        }
        
        if (checkOctet(orientedPiece.left, connectPoint)) {
            gameState.scores.player += 10;
            setMessage('Octeto completo! +10 pontos!');
        }
        
        gameState.board.push(orientedPiece);
    }
    
    gameState.playerHand = gameState.playerHand.filter(p => p.id !== piece.id);
    gameState.selectedPiece = null;
    
    if (checkWin('player')) return;
    
    gameState.currentPlayer = 'cpu';
    updateUI();
    setTimeout(cpuTurn, 1000);
}

// Turno do computador
function cpuTurn() {
    setMessage('Turno do computador...');
    
    let played = false;
    
    for (let piece of gameState.cpuHand) {
        // Primeira jogada
        if (gameState.board.length === 0) {
            gameState.board.push(piece);
            gameState.cpuHand = gameState.cpuHand.filter(p => p.id !== piece.id);
            played = true;
            break;
        }
        
        // Tentar jogar na direita
        if (canConnect(piece, 'right')) {
            const lastPiece = gameState.board[gameState.board.length - 1];
            let orientedPiece = { ...piece };
            
            if (piece.left.symbol !== lastPiece.right.symbol) {
                orientedPiece = { ...piece, left: piece.right, right: piece.left };
            }
            
            if (checkOctet(orientedPiece.left, lastPiece.right)) {
                gameState.scores.cpu += 10;
            }
            
            gameState.board.push(orientedPiece);
            gameState.cpuHand = gameState.cpuHand.filter(p => p.id !== piece.id);
            played = true;
            break;
        }
        
        // Tentar jogar na esquerda
        if (canConnect(piece, 'left')) {
            const firstPiece = gameState.board[0];
            let orientedPiece = { ...piece };
            
            if (piece.right.symbol !== firstPiece.left.symbol) {
                orientedPiece = { ...piece, left: piece.right, right: piece.left };
            }
            
            if (checkOctet(orientedPiece.right, firstPiece.left)) {
                gameState.scores.cpu += 10;
            }
            
            gameState.board.unshift(orientedPiece);
            gameState.cpuHand = gameState.cpuHand.filter(p => p.id !== piece.id);
            played = true;
            break;
        }
    }
    
    // Comprar se não jogou
    if (!played && gameState.buyPile.length > 0) {
        const newPiece = gameState.buyPile.shift();
        gameState.cpuHand.push(newPiece);
        setMessage('Computador comprou uma peça');
    } else if (!played) {
        setMessage('Computador passou a vez');
    }
    
    if (checkWin('cpu')) return;
    
    gameState.currentPlayer = 'player';
    updateUI();
    setMessage('Seu turno!');
}

// Comprar peça
function buyPiece() {
    if (gameState.currentPlayer !== 'player' || gameState.buyPile.length === 0) return;
    
    const newPiece = gameState.buyPile.shift();
    gameState.playerHand.push(newPiece);
    setMessage('Você comprou uma peça!');
    updateUI();
}

// Verificar vitória
function checkWin(player) {
    const hand = player === 'player' ? gameState.playerHand : gameState.cpuHand;
    
    if (hand.length === 0) {
        setMessage(`${player === 'player' ? 'Você' : 'Computador'} venceu!`);
        gameState.currentPlayer = 'none';
        updateUI();
        return true;
    }
    
    return false;
}

// Criar elemento de peça de dominó
function createDominoPieceElement(piece, isCPU = false, onClick = null, horizontal = false) {
    const pieceDiv = document.createElement('div');
    pieceDiv.className = 'domino-piece';
    
    if (isCPU) {
        pieceDiv.classList.add('cpu-piece');
    }
    
    if (horizontal) {
        pieceDiv.classList.add('horizontal');
    }
    
    if (gameState.selectedPiece?.id === piece.id) {
        pieceDiv.classList.add('selected');
    }
    
    if (onClick) {
        pieceDiv.onclick = onClick;
    }
    
    // Lado esquerdo/superior
    const leftHalf = document.createElement('div');
    leftHalf.className = 'domino-half';
    
    const leftSymbol = document.createElement('div');
    leftSymbol.className = 'element-symbol';
    leftSymbol.textContent = piece.left.symbol;
    
    const leftElectrons = document.createElement('div');
    leftElectrons.className = 'electrons';
    for (let i = 0; i < piece.left.electrons; i++) {
        const electron = document.createElement('div');
        electron.className = 'electron';
        electron.style.backgroundColor = piece.left.color;
        leftElectrons.appendChild(electron);
    }
    
    leftHalf.appendChild(leftSymbol);
    leftHalf.appendChild(leftElectrons);
    
    // Lado direito/inferior
    const rightHalf = document.createElement('div');
    rightHalf.className = 'domino-half';
    
    const rightSymbol = document.createElement('div');
    rightSymbol.className = 'element-symbol';
    rightSymbol.textContent = piece.right.symbol;
    
    const rightElectrons = document.createElement('div');
    rightElectrons.className = 'electrons';
    for (let i = 0; i < piece.right.electrons; i++) {
        const electron = document.createElement('div');
        electron.className = 'electron';
        electron.style.backgroundColor = piece.right.color;
        rightElectrons.appendChild(electron);
    }
    
    rightHalf.appendChild(rightSymbol);
    rightHalf.appendChild(rightElectrons);
    
    pieceDiv.appendChild(leftHalf);
    pieceDiv.appendChild(rightHalf);
    
    return pieceDiv;
}

// Atualizar interface
function updateUI() {
    // Atualizar pontuações
    document.getElementById('playerScore').textContent = gameState.scores.player;
    document.getElementById('cpuScore').textContent = gameState.scores.cpu;
    document.getElementById('playerPieces').textContent = gameState.playerHand.length;
    document.getElementById('cpuPieces').textContent = gameState.cpuHand.length;
    document.getElementById('cpuHandCount').textContent = gameState.cpuHand.length;
    document.getElementById('buyPileCount').textContent = gameState.buyPile.length;
    
    // Atualizar mão do CPU - PEÇAS VERTICAIS
    const cpuHandDiv = document.getElementById('cpuHand');
    cpuHandDiv.innerHTML = '';
    gameState.cpuHand.forEach(() => {
        const placeholder = document.createElement('div');
        placeholder.className = 'domino-piece cpu-piece';
        cpuHandDiv.appendChild(placeholder);
    });
    
    // Atualizar mão do jogador - PEÇAS VERTICAIS
    const playerHandDiv = document.getElementById('playerHand');
    playerHandDiv.innerHTML = '';
    gameState.playerHand.forEach(piece => {
        const pieceElement = createDominoPieceElement(piece, false, () => {
            if (gameState.currentPlayer === 'player') {
                gameState.selectedPiece = piece;
                
                if (gameState.board.length === 0) {
                    playPiece(piece, 'left');
                } else {
                    setMessage('Escolha qual lado do tabuleiro jogar (← ou →)');
                    updateUI();
                }
            }
        }, false);
        playerHandDiv.appendChild(pieceElement);
    });
    
    // Atualizar tabuleiro - Estilo Dominó Real
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    
    if (gameState.board.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-board';
        emptyMsg.textContent = 'Clique em uma peça sua para começar';
        boardDiv.appendChild(emptyMsg);
    } else {
        // Botão esquerda
        if (gameState.selectedPiece) {
            const leftBtn = document.createElement('button');
            leftBtn.className = 'side-btn';
            leftBtn.textContent = '←';
            leftBtn.onclick = () => playPiece(gameState.selectedPiece, 'left');
            boardDiv.appendChild(leftBtn);
        }
        
        // Peças do tabuleiro - PEÇAS HORIZONTAIS dispostas como dominó real
        gameState.board.forEach(piece => {
            const pieceElement = createDominoPieceElement(piece, false, null, true);
            boardDiv.appendChild(pieceElement);
        });
        
        // Botão direita
        if (gameState.selectedPiece) {
            const rightBtn = document.createElement('button');
            rightBtn.className = 'side-btn';
            rightBtn.textContent = '→';
            rightBtn.onclick = () => playPiece(gameState.selectedPiece, 'right');
            boardDiv.appendChild(rightBtn);
        }
    }
    
    // Atualizar botão de comprar
    const buyBtn = document.getElementById('buyBtn');
    buyBtn.disabled = gameState.buyPile.length === 0 || gameState.currentPlayer !== 'player';
}

// Definir mensagem
function setMessage(msg) {
    document.getElementById('message').textContent = msg;
}

// Event listeners
document.getElementById('resetBtn').addEventListener('click', initGame);
document.getElementById('buyBtn').addEventListener('click', buyPiece);
document.getElementById('instructionsBtn').addEventListener('click', () => {
    document.getElementById('instructionsModal').classList.remove('hidden');
});
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('instructionsModal').classList.add('hidden');
});
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('instructionsModal').classList.add('hidden');
});

// Iniciar jogo ao carregar
initGame();