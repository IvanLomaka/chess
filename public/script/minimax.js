// aggiungere suoni

const toUserTimeAI = document.getElementById('tempo-di-calcolo')
const evaluatedMoves = document.getElementById('mosse-calcolate')
const buttonDepth = document.getElementsByClassName('depth-bot')

let depth = 3
let iter = 0
let time
let timeStart
let timeStop

for(let i = 0; i < buttonDepth.length; i++) {
    buttonDepth[i].addEventListener('click', changeDepth)
}

function changeDepth(i) {
    depth = eval(i.target.textContent)
    for(let i = 0; i < buttonDepth.length; i++) {
        buttonDepth[i].classList.remove('active')
    }
    buttonDepth[depth - 1].classList.add('active')
}

function mossaPC(spazio) {
    if (finita == true) {gameOver(turno); return}

    for(let i = 0; i < caselleMosse.length; i++) {
        if(caselleMosse[i].id == spazio.target.id) {
            spostamentoFigura(caselleMosse[i], turno)
            nuovoBianco = undefined
            nuovoNero = undefined
            setTimeout(mossaBot, 100)
            return
        }
    }

    if(gameData[spazio.target.id] == false) return

    if (gameData[spazio.target.id].colorePedone == 'bianco') {
        nuovoBianco = undefined
        nuovoNero = undefined
        let figuraCasella = gameData[spazio.target.id].tipoPedone
        mosseFigura(spazio.target.id, figuraCasella)
        return
    }
}

// sistemare qui che può fare roki e cambiare da pedone a regina
function mossaBot() {
    iter = 0
    timeStart = new Date().getTime();

    let mossaPossibile = checkWinner('nero', true)[minimaxRoot(depth, true, 'nero')]

    timeStop = new Date().getTime();
    time = timeStop - timeStart;
    toUserTimeAI.textContent = time + ' ms'
    evaluatedMoves.textContent = iter

    gameData[mossaPossibile.id].casella = true
    gameData[mossaPossibile.id].tipoPedone = mossaPossibile.tipoPedone
    gameData[mossaPossibile.id].colorePedone = 'nero'

    gameData[mossaPossibile.casellaCliccataMossa].casella = false
    gameData[mossaPossibile.casellaCliccataMossa].tipoPedone = ''
    gameData[mossaPossibile.casellaCliccataMossa].colorePedone = ''

    for(let i = 0; i < caselle.length; i++) {
        disegnaImmagini(gameData[i].tipoPedone, i)
    }

    turno = 'bianco'
    Turno = 'nero'
}

function minimaxRoot(depth, isMaximizer, color) {
    let bestMove = -9999
    let bestMoveFound

    if (isMaximizer) {
        turno = 'nero'
        Turno = 'bianco'
    } else {
        turno = 'bianco'
        Turno = 'nero'
    }

    let SPACES_MOVES = checkWinner(turno, true)

    for(let i = 0; i < SPACES_MOVES.length; i++) {
        let backup = JSON.parse(JSON.stringify(gameData))

        mossaFatta(SPACES_MOVES[i].id, SPACES_MOVES[i].casellaCliccataMossa, color)

        let evaluation = minimax(depth - 1, -Infinity, Infinity, !isMaximizer, 'bianco')

        if (evaluation >= bestMove) {
            bestMove = evaluation
            bestMoveFound = i
        }

        gameData = JSON.parse(JSON.stringify(backup))
    }

    return bestMoveFound
}

// usare color!
function minimax(depth, alpha, beta, isMaximizer, color) {
    iter ++

    if (depth === 0) {
        return -boardEvaluation(gameData)
    }

    if (isMaximizer) {
        turno = 'nero'
        Turno = 'bianco'
    } else {
        turno = 'bianco'
        Turno = 'nero'
    }

    let SPACES_MOVES = checkWinner(turno, true)

    if (isMaximizer){
        // MAX
        let bestEvaluation = -Infinity
        for ( let i = 0; i < SPACES_MOVES.length; i++){
            let backup = JSON.parse(JSON.stringify(gameData))

            mossaFatta(SPACES_MOVES[i].id, SPACES_MOVES[i].casellaCliccataMossa, color)
            bestEvaluation = Math.max(bestEvaluation, minimax(depth - 1, alpha, beta, false, 'bianco'))

            gameData = JSON.parse(JSON.stringify(backup));

            alpha = Math.max(alpha, bestEvaluation)
            if (beta <= alpha) {
                return bestEvaluation
            }
        }
        return bestEvaluation
    } else {
        // MINI
        let bestEvaluation = Infinity
        for ( let i= 0; i < SPACES_MOVES.length; i++){
            let backup = JSON.parse(JSON.stringify(gameData))

            mossaFatta(SPACES_MOVES[i].id, SPACES_MOVES[i].casellaCliccataMossa, color)
            bestEvaluation = Math.min(bestEvaluation, minimax(depth - 1, alpha, beta, true, 'nero'))
            gameData = JSON.parse(JSON.stringify(backup));
            
            beta = Math.min(beta, bestEvaluation)
            if (beta <= alpha) {
                return bestEvaluation
            }
        }
        return bestEvaluation
    }
}

function mossaFatta(id, casellaCliccata, turno) {
    gameData[id].casella = true
    gameData[id].tipoPedone = gameData[casellaCliccata].tipoPedone
    gameData[id].colorePedone = turno

    gameData[casellaCliccata].casella = false
    gameData[casellaCliccata].tipoPedone = ''
    gameData[casellaCliccata].colorePedone = ''

    return gameData
}

function boardEvaluation(gameData) {
    let evaluation = 0
    for(let i = 0; i < gameData.length; i++) {
        evaluation = evaluation + pieceEvaluation(gameData[i].tipoPedone, i, gameData[i].colorePedone)
    }

    return evaluation
}

function pieceEvaluation(casella, punto, colore) {
    if(casella === '') {
        return 0
    }

    if (casella == "PB") {
        var evaluationPiece = 124 + evalPB[punto];
    } else if (casella == "PN") {
        var evaluationPiece = 124 + evalPN[punto];
    } else if (casella == "C" || casella == "CN") {
        var evaluationPiece = 781 + evalC[punto];  
    } else if (casella == "A") {
        var evaluationPiece = 825 + evalA[punto];
    } else if (casella == "AN") {
        var evaluationPiece = 825 + evalAN[punto];
    } else if (casella == "T") {
        var evaluationPiece = 1276 + evalT[punto];
    } else if (casella == "TN") {
        var evaluationPiece = 1276 + evalTN[punto];
    } else if (casella == "R" || casella == "RN") {
        var evaluationPiece = 2538 + evalR[punto];
    } else if (casella == "RE") {
        var evaluationPiece = 9000 + evalRE[punto];
    } else if (casella == "REN") {
        var evaluationPiece = 9000 + evalREN[punto];
    }

    if (colore == 'nero') {
        return -evaluationPiece
    } else if (colore == 'bianco') {
        return evaluationPiece
    }
}

function reverseArray(array) {
    return array.slice().reverse();
}

var evalPB = [ 
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
    5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,
    1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0,
    0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5,
    0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0,
    0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5,
    0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5,
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0
];

var evalPN = reverseArray(evalPB);

var evalC = [
    -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0,
    -4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0,
    -3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0,
    -3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0,
    -3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0,
    -3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0,
    -4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0,
    -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0
];

var evalA = [
    -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0,
    -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
    -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0,
    -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0,
    -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0,
    -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
    -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0,
    -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0
];

var evalAN = reverseArray(evalA);

var evalT = [
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
    0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
     0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0
];

var evalTN = reverseArray(evalT);

var evalR = [
    -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0,
    -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
    -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
    -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
    0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
    -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
    -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0,
    -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0
];

var evalRE = [
    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
    -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0,
    -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0,
    2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0,
    2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0
];

var evalREN = reverseArray(evalRE);