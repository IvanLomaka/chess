const caselle = document.querySelectorAll('[data-casella]')
const imageCasella = document.querySelectorAll('[data-immagine]')
const primaColonna = [0, 8, 16, 24, 32, 40, 48, 56]
const secondaColonna = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57]
const settimaColonna = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63]
const ottavaColonna = [7, 15, 23, 31, 39, 47, 55, 63]
const primaRiga = [0, 1, 2, 3, 4, 5, 6, 7]
const ottavaRiga = [56, 57, 58, 59, 60, 61, 62, 63]
const schermataPrincipale = document.getElementById('pagina-principale')
const scacchiera = document.getElementById('scacchiera')
const newGame = document.getElementById('new-game')
const settings = document.getElementById('settings')
const opzioni = document.getElementById('opzioni')
const opzioniScacchi = document.getElementById('opzioni-scacchi')
const entraCodice = document.getElementById('immissione-codice')
const spazioCodicePartita = document.getElementById('codice-partita')
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const inputValue = document.getElementById('msg')
const inGameChat = document.getElementById('in-game-chat')
const inGameStats = document.getElementById('in-game-stats')
const AIStats = document.getElementById('ai-stats') 
const raccoglitore = document.getElementById('raccoglitore')
const tempoPerMossaBianco = document.getElementById('tempo-per-mossa-bianco')
const tempoPerMossaNero = document.getElementById('tempo-per-mossa-nero')
const toSchermataPrincipale = document.getElementById('indietro-schermata-principale')
var tipoPedoni = 'classico'
var tempoLimite = 600
var chiaro = 'bianco'
var scuro = 'blu'
var turno = 'bianco'
var avversario = 'amico'
var mangiarePedina = new Audio('../audio/mangiarePedone.mp3')
var spostamentoPedina = new Audio('../audio/spostamentoPedina.mp3')
var finePartita = new Audio('../audio/finePartita.mp3')
let gameStatsShow = true
let gameChatShow = false
let AIstatsShow = false
let finita = false
let nuovoBianco
let nuovoNero
let replayPartitaAttuale = []
let replayPartiteTotali = []
opzioniScacchi.style.display = 'none'
opzioni.style.display = 'none'
AIStats.style.display = 'none'
scacchiera.style.display = 'none'
entraCodice.style.display = 'none'
inGameChat.style.display = 'none'
let alwaysTrue = false
let casualmoves = false
let caosEnabled = false
let turnoOra = true
let turnoOnline
var vogliaDiGiocareAncora = false
var toccareLeCaselleOnline = false
const socket = io()

function mossaControAmico(spazio) {
    if (toccareLeCaselleOnline == false) {
        openModal(modalCodice) 
        return
    }
    if (finita == true) {gameOver(turno); return}
    if (alwaysTrue == false) if (turnoOra == false) return

    for(let i = 0; i < caselleMosse.length; i++) {
        if(caselleMosse[i].id == spazio.target.id) {
            spostamentoFigura(caselleMosse[i], turno)
            nuovoBianco = undefined
            nuovoNero = undefined
            return
        }
    }

    if(gameData[spazio.target.id] == false) return

    if (turno == 'nero') {
        if (gameData[spazio.target.id].colorePedone == 'nero') {
            nuovoBianco = undefined
            nuovoNero = undefined
            let figuraCasella = gameData[spazio.target.id].tipoPedone
            mosseFigura(spazio.target.id, figuraCasella)
            return
        }
    }

    if (turno == 'bianco') {
        if (gameData[spazio.target.id].colorePedone == 'bianco') {
            nuovoBianco = undefined
            nuovoNero = undefined
            let figuraCasella = gameData[spazio.target.id].tipoPedone
            mosseFigura(spazio.target.id, figuraCasella)
            return
        }
    }
}

socket.on('colorePedone', (coloreGiocatore) => {
    turno = coloreGiocatore
    if (turno == 'bianco') {
        turnoOnline = 'bianco'
        Turno = 'nero'
    } else {
        turnoOnline = 'nero'
        Turno = 'bianco'
        turnoOra = false
    }
})

function spostamentoFiguraOnline(spazio, colore) {
    if (colore == 'bianco') {
        turno = 'nero'
        Turno = 'bianco'
        mosseBianco ++
        mosseBiancoTesto.textContent = 'Moves: ' + mosseBianco
        socket.emit('cambioDatiBianco', mosseBianco)
        if (spazio.eat == true) {
            socket.emit('audio', 'mangiarePedina')
            socket.emit('mossa', gameData)
            mangiarePedina.play()
        } else {
            socket.emit('audio', 'spostamentoPedina')
            socket.emit('mossa', gameData)
            spostamentoPedina.play()
        }
        if (scacco(Turno) && checkWinner(turno)) { 
            gameOver(turno);
            turno = 'bianco'
            Turno = 'nero'
            socket.emit('audio', 'finePartita')
            socket.emit('gameOver', Turno)
            return
        }
        if (checkWinner(turno) || checkTie()) {
            turno = 'bianco'
            Turno = 'nero'
            socket.emit('audio', 'finePartita')
            if (alwaysTrue == true) {
                gameOver(turno);
                socket.emit('gameOver', Turno)
                return
            }
            gameOver('pareggio')
            socket.emit('tie')
            return
        }
        turno = 'bianco'
        Turno = 'nero'
        return
    } else {
        turno = 'bianco'
        Turno = 'nero'
        mosseNero ++
        mosseNeroTesto.textContent = 'Moves: ' + mosseNero
        socket.emit('cambioDatiNero', mosseNero)
        if (spazio.eat == true) {
            socket.emit('audio', 'mangiarePedina')
            socket.emit('mossa', gameData)
            mangiarePedina.play()
        } else {
            socket.emit('audio', 'spostamentoPedina')
            socket.emit('mossa', gameData)
            spostamentoPedina.play()
        }
        if (scacco(Turno) && checkWinner(turno)) { 
            gameOver(turno); 
            turno = 'nero'
            Turno = 'bianco'
            socket.emit('audio', 'finePartita')
            socket.emit('gameOver', Turno)
            return 
        }
        if (checkWinner(turno) || checkTie()) {
            turno = 'nero'
            Turno = 'bianco'
            socket.emit('audio', 'finePartita')
            if (alwaysTrue == true) {
                gameOver(turno);
                socket.emit('gameOver', Turno)
                return
            }
            gameOver('pareggio')
            socket.emit('tie')
            return
        }
        turno = 'nero'
        Turno = 'bianco'
        return
    }
}

var casellaCliccataMossa = undefined
var caselleMosse = []
let gameData = new Array(64)

for(let i = 0; i < gameData.length; i++) {
    let data = {}
    gameData[i] = data
}

let table = [
    ['TN','CN','AN','RN','REN','AN','CN','TN'],
    ['PN','PN','PN','PN','PN','PN','PN','PN'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['PB','PB','PB','PB','PB','PB','PB','PB'],
    ['T','C','A','R','RE','A','C','T']
]

/*
let table = [
    ['REN','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','T','','','','','',''],
    ['','T','','','RE','','',''],
]*/

function avvio() {
    var numero = 0

    for(let j = 0; j < table.length; j++) {
        for(let i = 0; i < table[j].length; i++) {
            gameData[numero].tipoPedone = table[j][i]
            numero ++
        }
    }

    let number = 0

    for(let j = 0; j < table.length; j++) {
        for(let i = 0; i < table[j].length; i++) {
            if(table[j][i] != ''){
                gameData[number].casella = true
                disegnaImmagini(gameData[number].tipoPedone, number)
                if (number < 16) {
                    gameData[number].colorePedone = 'nero'
                }

                if (number > 47) {
                    gameData[number].colorePedone = 'bianco'
                }

                number ++
            }

            if(table[j][i] == '') {
                gameData[number].casella = false
                number ++
            }
        }
    }

    if(avversario == 'amico') {
        for(let i = 0; i < caselle.length; i++) {
            caselle[i].addEventListener('click', mossa)
        }
    }

    if(avversario == 'PC') {
        AIstatsShow = true
        AIStats.style.display = 'flex'
        gameStatsShow = false
        inGameStats.style.display = 'none'
        for(let i = 0; i < caselle.length; i++) {
            caselle[i].addEventListener('click', mossaPC)
        }
    }

    if(avversario == 'online') {
        for(let i = 0; i < caselle.length; i++) {
            caselle[i].addEventListener('click', mossaControAmico)
        }
    }
}

function disegnaImmagini(figuraCasella, casella) {
    tutteImmagini(figuraCasella, casella, imageCasella, tipoPedoni)
}

function mossa(spazio) {
    if (finita == true) {gameOver(turno); return}

    for(let i = 0; i < caselleMosse.length; i++) {
        if(caselleMosse[i].id == spazio.target.id) {
            spostamentoFigura(caselleMosse[i], turno)
            nuovoBianco = undefined
            nuovoNero = undefined
            return
        }
    }

    if(gameData[spazio.target.id] == false) return

    if (turno == 'nero') {
        if (gameData[spazio.target.id].colorePedone == 'nero') {
            nuovoBianco = undefined
            nuovoNero = undefined
            let figuraCasella = gameData[spazio.target.id].tipoPedone
            mosseFigura(spazio.target.id, figuraCasella)
            return
        }
    }

    if (turno == 'bianco') {
        if (gameData[spazio.target.id].colorePedone == 'bianco') {
            nuovoBianco = undefined
            nuovoNero = undefined
            let figuraCasella = gameData[spazio.target.id].tipoPedone
            mosseFigura(spazio.target.id, figuraCasella)
            return
        }
    }
}

function mosseFigura(casellaCliccata, figuraCasella) {
    switch (figuraCasella) {
        case 'PB':
            mossePedoneBianco(casellaCliccata, 'no')
            break;
        case 'PN':
            mossePedoneNero(casellaCliccata, 'no')
            break;
        case 'RE':
            mosseRe(casellaCliccata, 'no')
            break
        case 'T':
            mosseTorre(casellaCliccata, 'no')
            break
        case 'R':
            mosseRegina(casellaCliccata, 'no')
            break
        case 'A':
            mosseAlfiere(casellaCliccata, 'no')
            break
        case 'C':
            mosseCavallo(casellaCliccata, 'no')
            break
        case 'REN':
            mosseRe(casellaCliccata, 'no')
            break
        case 'TN':
            mosseTorre(casellaCliccata, 'no')
            break
        case 'RN':
            mosseRegina(casellaCliccata, 'no')
            break
        case 'AN':
            mosseAlfiere(casellaCliccata, 'no')
            break
        case 'CN':
            mosseCavallo(casellaCliccata, 'no')
            break
        default:
        break;
    }
}

let index

function displaMosse(mosse) {
    coloroTabella()
    caselleMosse = []
    for(let i = 0; i < mosse.length; i++) {
        index = mosse[i].id
        caselle[index].classList.remove(gameData[index].coloreCasella)
        if (mosse[i].eat == false) {
            if (gameData[index].coloreCasella == scuro) {
                caselle[index].className = 'spostamento-caselle-blu'
            }
            if (gameData[index].coloreCasella == chiaro) {
                caselle[index].className = 'spostamento-caselle-bianco'
            }
        } else {
            if (mosse[i].eat == true) {
                caselle[index].className = 'spostamento-caselle-rosso'
            }
        }
        caselleMosse.push(mosse[i])
    }
    caselle[casellaCliccataMossa].className = 'casella-cliccata'
}

function spostamentoSalva(spostamento, lascia, colore) {
    var testo = gameData[lascia].tipoPedone
    gameData[lascia].casella = false
    gameData[spostamento].casella = true
    gameData[spostamento].tipoPedone = testo
    gameData[lascia].tipoPedone = ''
    gameData[lascia].colorePedone = undefined
    gameData[spostamento].colorePedone = colore
    imageCasella[lascia].src = 'images/trasparente.png'
}

var trasformato
var spazioTrasformazione

function spostamentoFigura(spazio, colore) {
    if (spazio.eat == true) {
        mangiarePedina.play()
    } else {
        spostamentoPedina.play()
    }
    if (casualmoves == true) {
        let unArray = []
        for(let i = 0; i < gameData.length; i++) {
            if (gameData[i].tipoPedone == '') {
                unArray.push(i)
            }
            let r = Math.floor(Math.random() * unArray.length) + 1
            spazio.id = unArray[r]
        }
    }
    if (gameData[casellaCliccataMossa].tipoPedone == 'T') {
        if (torreBiancaDestraPrimaMossa == 0 && casellaCliccataMossa == 63) {
            torreBiancaDestraPrimaMossa = 1
        }
        if (torreBiancaSinistraPrimaMossa == 0 && casellaCliccataMossa == 56) {
            torreBiancaSinistraPrimaMossa = 1
        }
    }
    if (gameData[casellaCliccataMossa].tipoPedone == 'TN') {
        if (torreNeraDestraPrimaMossa == 0 && casellaCliccataMossa == 7) {
            torreNeraDestraPrimaMossa = 1
        }
        if (torreNeraSinistraPrimaMossa == 0 && casellaCliccataMossa == 0) {
            torreNeraSinistraPrimaMossa = 1
        }
    }
    if (gameData[casellaCliccataMossa].tipoPedone == 'RE') {
        mosseReBianco = 1
    }
    if (gameData[casellaCliccataMossa].tipoPedone == 'REN') {
        mosseReNero = 1
    }
    if (spazio.roki != undefined && turno == 'bianco') {
        if (spazio.roki == 'destra') {
            spostamentoSalva(61, 63, colore)
        }
        if (spazio.roki == 'sinistra') {
            spostamentoSalva(59, 56, colore)
        }
    }
    if (spazio.roki != undefined && turno == 'nero') {
        if (spazio.roki == 'destra') {
            spostamentoSalva(5, 7, colore)
        }
        if (spazio.roki == 'sinistra') {
            spostamentoSalva(3, 0, colore)
        }
    }

    spostamentoSalva(spazio.id, casellaCliccataMossa, colore)

    if (nuovoBianco == true && turno == 'bianco') {
        spazioTrasformazione = spazio.id
        openModal(modalBianchi)
    }

    if (nuovoNero != undefined && turno == 'nero') {
        spazioTrasformazione = spazio.id
        openModal(modalNeri)
    }

    for(let i = 0; i < caselle.length; i++) {
        disegnaImmagini(gameData[i].tipoPedone, i)
    }

    coloroTabella()
    caselleMosse = []

    if (avversario == 'online') {
        spostamentoFiguraOnline(spazio, colore)
        return
    }

    if (colore == 'bianco') {
        updateTurnoBianco()
        turno = 'nero'
        Turno = 'bianco'
        if (scacco(Turno) && checkWinner(turno)) {
            finePartita.play();
            gameOver(turno);
            return
        }
        if (checkWinner(turno) || checkTie()) {
            finePartita.play();
            gameOver('pareggio')
            return
        }
    } else {
        updateTurnoNero()
        turno = 'bianco'
        Turno = 'nero'
        if (scacco(Turno) && checkWinner(turno)) {
            finePartita.play();
            gameOver(turno);
            return
        }
        if (checkWinner(turno) || checkTie()) {
            finePartita.play();
            gameOver('pareggio');
            return
        }
    }
}

function salvaSpazio(casellaCliccata, turno, casellaC) {
    let move = {}
    if (turno == 'bianco') {
        if (casellaCliccata == 0 || casellaCliccata == 1 || casellaCliccata == 2 || casellaCliccata == 3 || casellaCliccata == 4 || casellaCliccata == 5 || casellaCliccata == 6 || casellaCliccata == 7) {
            nuovoBianco = true
        }
    }

    if (turno == 'nero') {
        if (casellaCliccata == 56 || casellaCliccata == 57 || casellaCliccata == 58 || casellaCliccata == 59 || casellaCliccata == 60 || casellaCliccata == 61 || casellaCliccata == 62 || casellaCliccata == 63) {
            nuovoNero = true
        }
    }

    move.id = casellaCliccata
    move.eat = false
    move.tipoPedone = gameData[casellaC].tipoPedone
    move.casellaCliccataMossa = casellaC

    return move
}

function mossePedoneBianco(casellaCliccata, mosseLegal) {
    let casellaC = casellaCliccata
    let mosse = []
    let backup = casellaCliccata
    casellaCliccataMossa = casellaCliccata
    let mosseEat = []

    casellaCliccata = casellaCliccata - 8
    for(let i = 0; i < primaRiga.length; i++) {
        if(casellaCliccata == primaRiga[i]) {
            nuovoBianco = true
        }
    }
    if (casellaCliccata > 63 || casellaCliccata < 0) return mosse
    if (gameData[casellaCliccata].casella == false) {
        mosse.push(salvaSpazio(casellaCliccata, 'bianco', casellaC))
        if(casellaCliccata <= 47 && casellaCliccata >= 40) {
            casellaCliccata = casellaCliccata - 8
            if (gameData[casellaCliccata].casella == false) {
                mosse.push(salvaSpazio(casellaCliccata, 'bianco', casellaC))
            }
        }
    }

    casellaCliccata = backup

    mosseEat = mosseEat.concat(checkSpazi(casellaCliccata, 1, primaColonna, -7))

    mosseEat = mosseEat.concat(checkSpazi(casellaCliccata, 1, ottavaColonna, -9))
    for(let i = 0; i < mosseEat.length; i++) {
        if (mosseEat[i].eat == true) {
            mosse.push(mosseEat[i])
        }
    }

    if (mosseLegal != undefined) {
        mosse = mosseLegali(turno, mosse, backup, undefined)
    }

    if (mosseLegal == undefined || mosseLegal == 'si') {
        return mosse
    }

    displaMosse(mosse)
    return mosse
}

function mossePedoneNero(casellaCliccata, mosseLegal) {
    let casellaC = casellaCliccata
    let mosse = []
    let backup = casellaCliccata
    casellaCliccataMossa = casellaCliccata
    let mosseEat = []

    casellaCliccata = eval(casellaCliccata) + 8
    for(let i = 0; i < ottavaRiga.length; i++) {
        if(casellaCliccata == ottavaRiga[i]) {
            nuovoNero = true
        }
    }
    if (casellaCliccata > 63 || casellaCliccata < 0) return mosse
    if (gameData[casellaCliccata].casella == false) {
        mosse.push(salvaSpazio(casellaCliccata, 'nero', casellaC))
        if(casellaCliccata <= 23 && casellaCliccata >= 16) {
            casellaCliccata = eval(casellaCliccata) + 8
            if (gameData[casellaCliccata].casella == false) {
                mosse.push(salvaSpazio(casellaCliccata, 'nero', casellaC))
            }
        }
    }

    casellaCliccata = backup

    mosseEat = mosseEat.concat(checkSpazi(casellaCliccata, 1, ottavaColonna, 7))

    mosseEat = mosseEat.concat(checkSpazi(casellaCliccata, 1, primaColonna, 9))
    for(let i = 0; i < mosseEat.length; i++) {
        if (mosseEat[i].eat == true) {
            mosse.push(mosseEat[i])
        }
    }

    if (mosseLegal != undefined) {
        mosse = mosseLegali(turno, mosse, backup, undefined)
    }

    if (mosseLegal == undefined || mosseLegal == 'si') {
        return mosse
    }

    displaMosse(mosse)
    return mosse
}

let Turno = 'nero'

function checkSpazi(casellaCliccata, volteLoop, gliIf, quantoOperazione) {
    let casellaC = casellaCliccata
    let mosse = []
    let casello = gameData[casellaCliccata].colorePedone

    for (let i = 0; i < volteLoop; i++) {
        let vero = false
        casellaCliccata = eval(casellaCliccata) + eval(quantoOperazione)
        if(gliIf !== undefined) {
            for(let i = 0; i < gliIf.length; i++) {
                if(casellaCliccata == gliIf[i]) vero = true
            }
        }
        if (vero == true) break
        if (casellaCliccata > 63 || casellaCliccata < 0) break
        if (gameData[casellaCliccata].casella == false) {
            let move = {}
            move.id = casellaCliccata
            move.eat = false
            move.tipoPedone = gameData[casellaC].tipoPedone
            move.casellaCliccataMossa = casellaC
            mosse.push(move)
        } else {
            if (gameData[casellaCliccata].casella == true) {
                if (gameData[casellaCliccata].colorePedone != casello) {
                    let move = {}
                    move.id = casellaCliccata
                    move.eat = true
                    move.tipoPedone = gameData[casellaC].tipoPedone
                    move.casellaCliccataMossa = casellaC
                    mosse.push(move)
                    break
                } else {
                    break
                }
            }
        }
    }

    return mosse
}

let torreBiancaSinistraPrimaMossa = 0
let torreBiancaDestraPrimaMossa = 0
let torreNeraSinistraPrimaMossa = 0
let torreNeraDestraPrimaMossa = 0

function mosseTorre(casellaCliccata, mosseLegal) {
    let mosse = []
    casellaCliccataMossa = casellaCliccata

    mosse = mosse.concat(checkSpazi(casellaCliccata, 8, undefined, -8))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 8, undefined, 8))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 8, ottavaColonna, -1))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 8, primaColonna, 1))

    if (mosseLegal != undefined) {
        mosse = mosseLegali(turno, mosse, casellaCliccata, undefined)
    }

    if (mosseLegal == undefined || mosseLegal == 'si') {
        return mosse
    }

    displaMosse(mosse)
    return mosse
}

let mosseReBianco = 0
let mosseReNero = 0

function mosseRe(casellaCliccata, mosseLegal) {
    let mosse = []
    let RE

    if (scacco(Turno) == false) {
        if (mosseLegal != undefined) {
            if (turno == 'bianco') {
                if (torreBiancaDestraPrimaMossa == 0 && mosseReBianco == 0 && gameData[63].tipoPedone == 'T') {
                    if (gameData[62].casella == false && gameData[61].casella == false) {
                        let move = {}
                        move.id = 62
                        move.eat = false
                        move.roki = 'destra'
    
                        mosse.push(move)
                    }
                }
                if (torreBiancaSinistraPrimaMossa == 0 && mosseReBianco == 0 && gameData[56].tipoPedone == 'T') {
                    if (gameData[57].casella == false && gameData[58].casella == false && gameData[59].casella == false) {
                        let move = {}
                        move.id = 58
                        move.eat = false
                        move.roki = 'sinistra'
    
                        mosse.push(move)
                    }
                }
            }
    
            if (turno == 'nero') {
                if (torreNeraDestraPrimaMossa == 0 && mosseReNero == 0 && gameData[7].tipoPedone == 'TN') {
                    if (gameData[6].casella == false && gameData[5].casella == false) {
                        let move = {}
                        move.id = 6
                        move.eat = false
                        move.roki = 'destra'
    
                        mosse.push(move)
                    }
                }
                if (torreNeraSinistraPrimaMossa == 0 && mosseReNero == 0 && gameData[0].tipoPedone == 'TN') {
                    if (gameData[1].casella == false && gameData[2].casella == false && gameData[3].casella == false) {
                        let move = {}
                        move.id = 2
                        move.eat = false
                        move.roki = 'sinistra'
    
                        mosse.push(move)
                    }
                }
            }
        }
    }

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, undefined, 8))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, undefined, -8))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, ottavaColonna, -1))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, primaColonna, 1))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, primaColonna, -7))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, ottavaColonna, -9))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, ottavaColonna, 7))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, primaColonna, 9))

    if (turno == 'bianco') {
        RE = 'RE'
    } else {
        RE = 'REN'
    }

    casellaCliccataMossa = casellaCliccata
    if (mosseLegal != undefined) {
        mosse = mosseLegali(turno, mosse, casellaCliccata, RE)

        for(let i = 0; i < gameData.length; i++) {
            if (gameData[i].colorePedone != turno) {
                if (gameData[i].tipoPedone == 'RE' || gameData[i].tipoPedone == 'REN') {
                    let mosseIllegali = []
                    mosseIllegali = mosseIllegali.concat(notVicinoRe(i))
                    for (let i = 0; i < mosseIllegali.length; i++) {
                        for (let j = 0; j < mosse.length; j++) {
                            if (mosse[j] == undefined) break
                            if (mosseIllegali[i] == mosse[j].id) {
                                delete mosse[j]
                                break
                            }
                        }
                    }

                    for (let i = 0; i < mosse.length; i++) {
                        for (let j = 0; j < mosseIllegali.length; j++) {
                            if (mosse[i] == undefined) break
                            if (mosseIllegali[j] == mosse[i].id) {
                                delete mosse[i]
                                break
                            }
                        }
                    }
                }
            }
        }

        let notUndefined = []
        for (let i = 0; i < mosse.length; i++) {
            if (mosse[i] != undefined) {
                notUndefined.push(mosse[i])
            }
        }
        mosse = []
        mosse = mosse.concat(notUndefined)
    }

    if (mosseLegal == undefined || mosseLegal == 'si') {
        return mosse
    }

    displaMosse(mosse)
    return mosse
}

function mosseRegina(casellaCliccata, mosseLegal) {
    let mosse = []
    casellaCliccataMossa = casellaCliccata

    mosse = mosse.concat(mosseAlfiere(casellaCliccata, mosseLegal))

    mosse = mosse.concat(mosseTorre(casellaCliccata, mosseLegal))

    if (mosseLegal == undefined || mosseLegal == 'si') {
        return mosse
    }

    displaMosse(mosse)
    return mosse
}

function mosseCavallo(casellaCliccata, mosseLegal) {
    let mosse = []
    casellaCliccataMossa = casellaCliccata

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, secondaColonna, -6))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, settimaColonna, -10))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, primaColonna, -15))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, ottavaColonna, -17))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, settimaColonna, 6))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, secondaColonna, 10))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, ottavaColonna, 15))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 1, primaColonna, 17))
    
    if (mosseLegal != undefined) {
        mosse = mosseLegali(turno, mosse, casellaCliccata, undefined)
    }

    if (mosseLegal == undefined || mosseLegal == 'si') {
        return mosse
    }
    displaMosse(mosse)
    return mosse
}

function mosseAlfiere(casellaCliccata, mosseLegal) {
    let mosse = []
    casellaCliccataMossa = casellaCliccata

    mosse = mosse.concat(checkSpazi(casellaCliccata, 8, primaColonna, -7))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 8, ottavaColonna, -9))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 8, ottavaColonna, 7))

    mosse = mosse.concat(checkSpazi(casellaCliccata, 8, primaColonna, 9))

    if (mosseLegal != undefined) {
        mosse = mosseLegali(turno, mosse, casellaCliccata, undefined)
    }

    if (mosseLegal == undefined || mosseLegal == 'si') {
        return mosse
    }

    displaMosse(mosse)
    return mosse
}

function mosseLegali(turno, mosse, casellaCliccata, RE) {
    let mosseLegalii = []
    let casellone = casellaCliccataMossa
    let t
    gameData[casellone].casella = false
    for(let i = 0; i < mosse.length; i++){

        if (RE != undefined) {
            t = gameData[mosse[i].id].tipoPedone
            gameData[mosse[i].id].tipoPedone = RE
            gameData[casellone].tipoPedone = ''
        }

        gameData[mosse[i].id].casella = true
        gameData[mosse[i].id].colorePedone = turno

        if (scacco(Turno) == false) {
            mosseLegalii.push(mosse[i])
        }


        if (mosse[i].eat != true) {
            gameData[mosse[i].id].casella = false
            // gameData[mosse[i].id].colorePedone = Turno
        }

        if (RE != undefined) {
            gameData[mosse[i].id].tipoPedone = t
            gameData[casellone].tipoPedone = RE
        }

        gameData[mosse[i].id].colorePedone = Turno
    }
    casellaCliccataMossa = casellaCliccata
    gameData[casellone].casella = true

    return mosseLegalii
}

function notVicinoRe(casellaCliccata) {
    let mosse = []
    mosse.push(eval(casellaCliccata) + 8)
    mosse.push(eval(casellaCliccata) - 8)
    let piùUno = eval(casellaCliccata) + 1
    let menoUno = eval(casellaCliccata) - 1
    let menoSette = eval(casellaCliccata) - 7
    let piùSette = eval(casellaCliccata) + 7
    let menoNove = eval(casellaCliccata) - 9
    let piùNove = eval(casellaCliccata) + 9
    let vero = false
    for(let i = 0; i < primaColonna.length; i++) {
        if(piùUno == primaColonna[i]) vero = true
    }
    if (vero == false) {
        mosse.push(piùUno)
        mosse.push(menoSette)
        mosse.push(piùNove)
    }

    let falso = false
    for(let i = 0; i < ottavaColonna.length; i++) {
        if(menoUno == ottavaColonna[i]) falso = true
    }
    if (falso == false) {
        mosse.push(menoUno)
        mosse.push(piùSette)
        mosse.push(menoNove)
    }

    return mosse
}

var volte = 0

function scacco(turno) {
    let mosseSottoAttacco = []
    let RE
    for(let i = 0; i < gameData.length; i++) {
        if (gameData[i].colorePedone != turno) {
            if (gameData[i].tipoPedone == 'RE' || gameData[i].tipoPedone == 'REN') {
                RE = i
                break
            }
        }
    }

    for(let i = 0; i < gameData.length; i++) {
        volte ++
        if (gameData[i].colorePedone == turno) {
            switch (gameData[i].tipoPedone) {
                case 'PB':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mossePedoneBianco(i, undefined))
                    break;
                case 'PN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mossePedoneNero(i, undefined))
                    break;
                case 'RE':
                    //mosseSottoAttacco = mosseSottoAttacco.concat(mosseTorre(i, undefined, undefined, gameData))
                    break
                case 'T':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseTorre(i, undefined))
                    break
                case 'R':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseRegina(i, undefined))
                    break
                case 'A':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseAlfiere(i, undefined))
                    break
                case 'C':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseCavallo(i, undefined))
                    break
                case 'REN':
                    //mosseSottoAttacco = mosseSottoAttacco.concat(mosseRe(i, undefined, mosseV))
                    break
                case 'TN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseTorre(i, undefined))
                    break
                case 'RN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseRegina(i, undefined))
                    break
                case 'AN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseAlfiere(i, undefined))
                    break
                case 'CN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseCavallo(i, undefined))
                    break
                default:
                    break;
            }
        }
    }

    let mossePericolo = []

    for (let i = 0; i < mosseSottoAttacco.length; i++){
        if (mosseSottoAttacco[i].eat == true) {
            mossePericolo.push(mosseSottoAttacco[i])
        }
    }

    // console.log(mossePericolo)
    for (let i = 0; i < mossePericolo.length; i++){
        if (mossePericolo[i].id == RE) {
            return true
        }
    }

    // coloroTabella()
    return false
}

function checkWinner(turno, incerto) {
    let mosseSottoAttacco = []
    let re
    for(let i = 0; i < gameData.length; i++) {
        if (gameData[i].colorePedone == turno) {
            if (gameData[i].tipoPedone == 'RE' || gameData[i].tipoPedone == 'REN') {
                re = i
                mosseSottoAttacco = mosseSottoAttacco.concat(mosseRe(i, 'si'))
                break
            }
        }
    }

    for(let i = 0; i < gameData.length; i++) {
        if (gameData[i].colorePedone == turno) {
            switch (gameData[i].tipoPedone) {
                case 'PB':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mossePedoneBianco(i, 'si'))
                    break;
                case 'PN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mossePedoneNero(i, 'si'))
                    break;
                case 'RE':
                    // mosseSottoAttacco = mosseSottoAttacco.concat(mosseRe(i, undefined, mosseV, 'si'))
                    break
                case 'T':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseTorre(i, 'si'))
                    break
                case 'R':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseRegina(i, 'si'))
                    break
                case 'A':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseAlfiere(i, 'si'))
                    break
                case 'C':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseCavallo(i, 'si'))
                    break
                case 'REN':
                    // mosseSottoAttacco = mosseSottoAttacco.concat(mosseRe(i, undefined, mosseV))
                    break
                case 'TN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseTorre(i, 'si'))
                    break
                case 'RN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseRegina(i, 'si'))
                    break
                case 'AN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseAlfiere(i, 'si'))
                    break
                case 'CN':
                    mosseSottoAttacco = mosseSottoAttacco.concat(mosseCavallo(i, 'si'))
                    break
                default:
                    break;
            }
        }
    }

    if (incerto == true) {
        return mosseSottoAttacco
    }

    if (mosseSottoAttacco.length == 0) {
        return true
    }

    // coloroTabella()
    return false
}

function checkTie() {
    let tie = []
    for (let i = 0; i < gameData.length; i++) {
        if (gameData[i].tipoPedone != '') {
            tie.push(gameData[i].tipoPedone)
        }
    }
    if (tie.length == 2) return true

    return false
}

var pareggiTotali = 0
var mosseNero = 0
var mosseBianco = 0
var vittorieNero = 0
var vittorieBianco = 0
var mosseBiancoTesto = document.getElementById('mosse-bianco')
var mosseNeroTesto = document.getElementById('mosse-nero')
var tempoRestanteNero = document.getElementById('tempo-restante-nero')
var tempoRestanteBianco = document.getElementById('tempo-restante-bianco')
var b
var n

function updateTurnoBianco() {
    mosseBianco ++
    mosseBiancoTesto.textContent = 'Moves: ' + mosseBianco
    clearInterval(b)
    avvioTimerNero()
}

function updateTurnoNero() {
    mosseNero ++
    mosseNeroTesto.textContent = 'Moves: ' + mosseNero
    clearInterval(n)
    avvioTimerBianco()
}

function avvioTimerNero() {
    timerNero()
    n = setInterval(timerNero, 1000)
}

var minutoNero = 10
var secondoNero = 00

function timerNero() {
    if (tempoLimite == Infinity) return
    if (secondoNero == 00 && minutoNero == 00) gameOver(turno)
    if (secondoNero == 00) {
        minutoNero -- 
        secondoNero = 59
    } else {
        if (secondoNero < 10) {
            tempoRestanteNero.textContent = minutoNero + ':' + '0' + secondoNero + ''
            secondoNero --
        } else {
            tempoRestanteNero.textContent = minutoNero + ':' + secondoNero + ''
            secondoNero --
        }
    }
}

function avvioTimerBianco() {
    timerBianco()
    b = setInterval(timerBianco, 1000)
}

var minutoBianco = 10
var secondoBianco = 00

function timerBianco() {
    if (tempoLimite == Infinity) return
    if (secondoBianco == 00 && minutoBianco == 00) gameOver(turno)
    if (secondoBianco == 00) {
        minutoBianco -- 
        secondoBianco = 59
    } else {
        if (secondoBianco < 10) {
            tempoRestanteBianco.textContent = minutoBianco + ':' + '0' + secondoBianco + ''
            secondoBianco --
        } else {
            tempoRestanteBianco.textContent = minutoBianco + ':' + secondoBianco + ''
            secondoBianco --
        }
    }
}

var risultati = document.getElementById('risultati')
var ties = document.querySelectorAll('[data-pareggi]')
var whites = document.getElementById('vittorie-bianco')
var blacks = document.getElementById('vittorie-nero')

function gameOver(chi) {
    clearInterval(b)
    clearInterval(n)
    if (chi == 'nero') {
        risultati.textContent = 'White won!'
        if (finita != true) {
            vittorieBianco ++
        }
    }
    if (chi == 'bianco') {
        risultati.textContent = 'Black won!'
        if (finita != true) {
            vittorieNero ++
        }
    }
    if (chi == 'pareggio') {
        risultati.textContent = 'Tie!'
        if (finita != true) {
            pareggiTotali ++
        }
    }
    for (let i = 0; i < ties.length; i++) {
        ties[i].textContent = 'Ties: ' + pareggiTotali 
    }
    whites.textContent = 'Wins: ' + vittorieBianco
    blacks.textContent = 'Wins: ' + vittorieNero
    finita = true
    openModal(modalFinePartita)
}

function coloroTabella() {
    var coloreCasella = 1
    var volteColorate = 0
    var Il = 0

    for(let i = 0; i < caselle.length; i++){
        colorare(i)
    }

    function colorare(casella) {
        cambioCasella()

        if(coloreCasella == 1) {
            gameData[Il].coloreCasella = chiaro
            Il ++
            caselle[casella].className = chiaro // bianco
            coloreCasella = 0
            volteColorate ++
            return
        }

        if (coloreCasella == 0) {
            gameData[Il].coloreCasella = scuro
            Il ++
            caselle[casella].className = scuro // blu
            coloreCasella = 1
            volteColorate ++
            return
        }
    }

    function cambioCasella() {
        if (volteColorate == 8) {
            if(coloreCasella === 0) {
                volteColorate = 0
                coloreCasella = 1
                return
            }
    
            if(coloreCasella === 1) {
                volteColorate = 0
                coloreCasella = 0
                return
            }
        }
    }
}

coloroTabella()

newGame.addEventListener('click', button => {
    document.title = 'Chess - New game'
    opzioniScacchi.style.display = 'flex'
    schermataPrincipale.style.display = 'none'
})

settings.addEventListener('click', button => {
    document.title = 'Chess - Settings'
    schermataPrincipale.style.display = 'none'
    opzioni.style.display = 'flex'
})

const caselleDiverse = document.querySelectorAll('[data-casellone]')
const notImmagini = document.querySelectorAll('[data-imgFake]')
const CLASSIC = document.getElementById('classico')
const BLUE = document.getElementById('blu')
const RED = document.getElementById('rosso')
const pieceClassic = document.getElementById('piece-classic')
const piece1k = document.getElementById('piece-1k')
const pieceKaneo = document.getElementById('piece-kaneo')
const sec60 = document.getElementById('60sec')
const sec180 = document.getElementById('3mins')
const sec600 = document.getElementById('10mins')
const infinito = document.getElementById('infinite-time')
const indietro = document.getElementById('back')
const salva = document.getElementById('salva')
var notChiaro = 'bianco'
var notScuro = 'blu'
var notTipoPedoni = 'classico'
var notTempoLimite = 600

function notColoroTabella() {
    var coloreCasella = 1
    var volteColorate = 0
    var Il = 0
    
    for(let i = 0; i < caselle.length; i++){
        colorare(i)
    }

    function colorare(casella) {
        cambioCasella()

        if(coloreCasella == 1) {
            Il ++
            caselleDiverse[casella].className = notChiaro // bianco
            coloreCasella = 0
            volteColorate ++
            return
        }

        if (coloreCasella == 0) {
            Il ++
            caselleDiverse[casella].className = notScuro // blu
            coloreCasella = 1
            volteColorate ++
            return
        }
    }

    function cambioCasella() {
        if (volteColorate == 8) {
            if(coloreCasella === 0) {
                volteColorate = 0
                coloreCasella = 1
                return
            }
    
            if(coloreCasella === 1) {
                volteColorate = 0
                coloreCasella = 0
                return
            }
        }
    }
}

notColoroTabella()

function notDisegnaImmagini() {
    let gameData = new Array(64)
    for(let i = 0; i < gameData.length; i++) {
        let data = {}
        gameData[i] = data
    }

    let table = [
        ['TN','CN','AN','RN','REN','AN','CN','TN'],
        ['PN','PN','PN','PN','PN','PN','PN','PN'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['PB','PB','PB','PB','PB','PB','PB','PB'],
        ['T','C','A','R','RE','A','C','T']
    ]

    var numero = 0

    for(let j = 0; j < table.length; j++) {
        for(let i = 0; i < table[j].length; i++) {
            gameData[numero].tipoPedone = table[j][i]
            notDisegnaImmaginii(gameData[numero].tipoPedone, numero)
            numero ++
        }
    }
}

function tutteImmagini(figuraCasella, casella, doveColorare, tipo) {
    switch (figuraCasella) {
        case 'PB':
            doveColorare[casella].src = 'images/' + tipo + 'PB.png'
            break;
        case 'PN':
            doveColorare[casella].src = 'images/' + tipo + 'PN.png'
            break;
        case 'RE':
            doveColorare[casella].src = 'images/' + tipo + 'RE.png'
            break;
        case 'T':
            doveColorare[casella].src = 'images/' + tipo + 'T.png'
            break;
        case 'R':
            doveColorare[casella].src = 'images/' + tipo + 'R.png'
            break;
        case 'A':
            doveColorare[casella].src = 'images/' + tipo + 'A.png'
            break;
        case 'C':
            doveColorare[casella].src = 'images/' + tipo + 'C.png'
            break;
        case 'REN':
            doveColorare[casella].src = 'images/' + tipo + 'REN.png'
            break;
        case 'TN':
            doveColorare[casella].src = 'images/' + tipo + 'TN.png'
            break;
        case 'RN':
            doveColorare[casella].src = 'images/' + tipo + 'RN.png'
            break;
        case 'AN':
            doveColorare[casella].src = 'images/' + tipo + 'AN.png'
            break;
        case 'CN':
            doveColorare[casella].src = 'images/' + tipo + 'CN.png'
            break;
        default:
            doveColorare[casella].src = 'images/trasparente.png'
            return
    }
}

function notDisegnaImmaginii(figuraCasella, casella) {
    tutteImmagini(figuraCasella, casella, notImmagini, notTipoPedoni)
}

notDisegnaImmagini()

CLASSIC.addEventListener('click', button => {
    colori(CLASSIC, BLUE, RED, RED)
    notScuro = 'nero'
    notChiaro = 'bianco'
    notColoroTabella()
})

BLUE.addEventListener('click', button => {
    colori(BLUE, RED, RED, CLASSIC)
    notScuro = 'blu'
    notChiaro = 'bianco'
    notColoroTabella()
})

RED.addEventListener('click', button => {
    colori(RED, BLUE, BLUE, CLASSIC)
    notScuro = 'rosso'
    notChiaro = 'giallo'
    notColoroTabella()
})

pieceClassic.addEventListener('click', button => {
    colori(pieceClassic, pieceKaneo, piece1k, pieceKaneo)
    notTipoPedoni = 'classico'
    notDisegnaImmagini()
})

piece1k.addEventListener('click', button => {
    colori(piece1k, pieceClassic, pieceKaneo, pieceClassic)
    notTipoPedoni = '1k'
    notDisegnaImmagini()
})

pieceKaneo.addEventListener('click', button => {
    colori(pieceKaneo, pieceClassic, piece1k, pieceClassic)
    notTipoPedoni = 'kaneo'
    notDisegnaImmagini()
})

sec60.addEventListener('click', button => {
    colori(sec60, infinito, sec180, sec600)
    notTempoLimite = 60
})

sec180.addEventListener('click', button => {
    colori(sec180, infinito, sec60, sec600)
    notTempoLimite = 180
})

sec600.addEventListener('click', button => {
    colori(sec600, infinito, sec60, sec180)
    notTempoLimite = 600
})

infinito.addEventListener('click', button => {
    colori(infinito, sec600, sec60, sec180)
    notTempoLimite = Infinity
})

function colori(a, b, c, d) {
    a.classList.add('active')
    b.classList.remove('active')
    c.classList.remove('active')
    d.classList.remove('active')
}

indietro.addEventListener('click', button => {
    document.title = 'Chess - Home'
    schermataPrincipale.style.display = 'flex'
    opzioni.style.display = 'none'
})

salva.addEventListener('click', button => {
    document.title = 'Chess - Home'
    schermataPrincipale.style.display = 'flex'
    opzioni.style.display = 'none'
    chiaro = notChiaro
    scuro = notScuro
    tempoLimite = notTempoLimite
    tipoPedoni = notTipoPedoni
    coloroTabella()
    secondiInMinuti()
    disegna(imagiBianchi, immaginiDiCambioBianchi)
    disegna(imagiNeri, immaginiDiCambioNeri)
})

toSchermataPrincipale.addEventListener('click', () => {
    schermataPrincipale.style.display = 'flex'
    opzioniScacchi.style.display = 'none'
})

const playOffline = document.getElementById('offline')
const playVSpc = document.getElementById('contro-pc')
const playOnline = document.getElementById('multiplayer')

playOffline.addEventListener('click', button => {
    document.title = 'Chess - Offline'
    avversario = 'amico'
    scacchiera.style.display = 'flex'
    opzioniScacchi.style.display = 'none'
    avvio()
})

playVSpc.addEventListener('click', button => {
    document.title = 'Chess - VS computer'
    avversario = 'PC'
    scacchiera.style.display = 'flex'
    opzioniScacchi.style.display = 'none'
    tempoLimite = Infinity
    avvio()
})

playOnline.addEventListener('click', button => {
    document.title = 'Chess - Online'
    avversario = 'online'
    entraCodice.style.display = 'flex'
    opzioniScacchi.style.display = 'none'
    gameStatsShow = false
    gameChatShow = true
    inGameChat.style.display = 'block'
    inGameStats.style.display = 'none'
    tempoLimite = Infinity
    avvio()
})

function secondiInMinuti() {
    if (tempoLimite == 60) {
        minutoNero = minutoBianco = 00
        secondoNero = secondoBianco = 60
        tempoRestanteNero.textContent = minutoNero + ':' + secondoNero + ''
        tempoRestanteBianco.textContent = minutoBianco + ':' + secondoBianco + ''
    }
    if (tempoLimite == 180) {
        minutoNero = minutoBianco = 03
        secondoNero = secondoBianco = 00
        tempoRestanteNero.textContent = minutoNero + ':' + '0' + secondoNero + ''
        tempoRestanteBianco.textContent = minutoBianco + ':' + '0' + secondoBianco + ''
    }
    if (tempoLimite == 600) {
        minutoNero = minutoBianco = 10
        secondoNero = secondoBianco = 00
        tempoRestanteNero.textContent = minutoNero + ':' + '0' + secondoNero + ''
        tempoRestanteBianco.textContent = minutoBianco + ':' + '0' + secondoBianco + ''
    }
}

secondiInMinuti()

let imagiBianchi = new Array(4)
imagiBianchi[0] = 'R'
imagiBianchi[1] = 'T'
imagiBianchi[2] = 'C'
imagiBianchi[3] = 'A'
const immaginiDiCambioBianchi = document.querySelectorAll('[data-nuovaFiguraBianchi]')

function disegna(imgs, arrayimgs) {
    for (let i = 0; i < imgs.length; i++) {
        tutteImmagini(imgs[i], i, arrayimgs, tipoPedoni)
    }
}

disegna(imagiBianchi, immaginiDiCambioBianchi)

immaginiDiCambioBianchi.forEach(button => {
    button.addEventListener('click', trasformazioneBianchi)
});

function trasformazioneBianchi(spazio) {
    gameData[spazioTrasformazione].tipoPedone = spazio.target.id
    for(let i = 0; i < caselle.length; i++) {
        disegnaImmagini(gameData[i].tipoPedone, i)
    }
    closeModal(modalBianchi)
    socket.emit('cambioPedone', gameData)
}

let imagiNeri = new Array(4)
imagiNeri[0] = 'RN'
imagiNeri[1] = 'TN'
imagiNeri[2] = 'CN'
imagiNeri[3] = 'AN'
const immaginiDiCambioNeri = document.querySelectorAll('[data-nuovaFiguraNeri]')

immaginiDiCambioNeri.forEach(button => {
    button.addEventListener('click', trasformazioneNeri)
});

disegna(imagiNeri, immaginiDiCambioNeri)

function trasformazioneNeri(spazio) {
    gameData[spazioTrasformazione].tipoPedone = spazio.target.id
    for(let i = 0; i < caselle.length; i++) {
        disegnaImmagini(gameData[i].tipoPedone, i)
    }
    closeModal(modalNeri)
    socket.emit('cambioPedone', gameData)
}

raccoglitore.addEventListener('contextmenu', (e) => {
    if (avversario == 'amico') return
    e.preventDefault()
    if (avversario == 'online') {
        if (gameStatsShow == true) {
            gameStatsShow = false
            gameChatShow = true
            inGameChat.style.display = 'block'
            inGameStats.style.display = 'none'
        } else {
            gameStatsShow = true
            gameChatShow = false
            inGameChat.style.display = 'none'
            inGameStats.style.display = 'block'
        }
        return
    }

    if (avversario == 'PC') {
        if (gameStatsShow == true) {
            gameStatsShow = false
            AIstatsShow = true
            AIStats.style.display = 'block'
            inGameStats.style.display = 'none'
        } else {
            gameStatsShow = true
            AIstatsShow = false
            AIStats.style.display = 'none'
            inGameStats.style.display = 'block'
        }
        return
    }
})

// Cambio pedone

const closeModalButtons = document.querySelectorAll('[data-close-button]')
const closeModalCodice = document.getElementById('close-button-code')

const modalBianchi = document.getElementById('modal-bianchi')
const modalNeri = document.getElementById('modal-neri')
const modalFinePartita = document.getElementById('modal-fine-partita')
const modalCodice = document.getElementById('modal-codice')

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeModal(modalFinePartita)
    })
})

closeModalCodice.addEventListener('click', () => {
    closeModal(modalCodice)
})

function openModal(modal) {
    if (modal == null) return
    modal.classList.add('active')
}

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
}

const giocaAncora = document.getElementById('bottone-per-gioca-ancora')
const bottoneSchermataPrincipale = document.getElementById('bottone-per-schermata-principale')

bottoneSchermataPrincipale.addEventListener('click', button => {
    if (avversario == 'online') {
        socket.emit('disconnessioneDallaStanza')
        vogliaDiGiocareAncora = false
    }
    toccareLeCaselleOnline = false
    reset()
    schermataPrincipale.style.display = 'flex'
    scacchiera.style.display = 'none'
    closeModal(modalFinePartita)
    pareggiTotali = 0
    vittorieNero = 0
    vittorieBianco = 0
    for (let i = 0; i < ties.length; i++) {
        ties[i].textContent = 'Ties: ' + pareggiTotali 
    }
    whites.textContent = 'Wins: ' + vittorieBianco
    blacks.textContent = 'Wins: ' + vittorieNero
})

giocaAncora.addEventListener('click', button => {
    if (avversario == 'online') {
        turno = turnoOnline
        if (turno == 'bianco') {
            Turno = 'nero'
            turnoOra = true
        } else {
            Turno = 'bianco'
            turnoOra = false
        }
        if (vogliaDiGiocareAncora == false) {
            socket.emit('giocaAncora')
            closeModal(modalFinePartita)
            return
        }
        socket.emit('resetScacchiera')
    }
    notReset()
    closeModal(modalFinePartita)
})

function reset() {
    table = [
        ['TN','CN','AN','RN','REN','AN','CN','TN'],
        ['PN','PN','PN','PN','PN','PN','PN','PN'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['PB','PB','PB','PB','PB','PB','PB','PB'],
        ['T','C','A','R','RE','A','C','T']
    ]

    casellaCliccataMossa = undefined
    caselleMosse = []
    gameData = new Array(64)

    for(let i = 0; i < gameData.length; i++) {
        let data = {}
        gameData[i] = data
    }

    casualmoves = false
    alwaysTrue = false
    finita = false
    trasformato = undefined
    spazioTrasformazione = undefined
    nuovoBianco = undefined
    nuovoNero = undefined
    torreBiancaSinistraPrimaMossa = 0
    torreBiancaDestraPrimaMossa = 0
    torreNeraSinistraPrimaMossa = 0
    torreNeraDestraPrimaMossa = 0
    mosseReBianco = 0
    mosseReNero = 0
    mosseNero = 0
    mosseBianco = 0
    mosseBiancoTesto.textContent = 'Moves: ' + mosseBianco
    mosseNeroTesto.textContent = 'Moves: ' + mosseNero
    turno = 'bianco'
    secondiInMinuti()
    gameStatsShow = true
    gameChatShow = false
    AIstatsShow = false
    AIStats.style.display = 'none'
    inGameChat.style.display = 'none'
    inGameStats.style.display = 'block'
    tempoRestanteBianco.textContent = minutoBianco + ':' + '0' + secondoBianco + ''
    tempoRestanteNero.textContent = minutoNero + ':' + '0' + secondoNero + ''
    togliTutteImg()
    
    if(avversario == 'amico') {
        for(let i = 0; i < caselle.length; i++) {
            caselle[i].removeEventListener('click', mossa)
        }
    }

    if(avversario == 'PC') {
        for(let i = 0; i < caselle.length; i++) {
            caselle[i].removeEventListener('click', mossaPC)
        }
    }

    if(avversario == 'online') {
        for(let i = 0; i < caselle.length; i++) {
            caselle[i].removeEventListener('click', mossaControAmico)
        }
    }
}

function togliTutteImg() {
    for (let i = 0; i < imageCasella.length; i++) {
        imageCasella[i].src = 'images/trasparente.png'
    }
}

function notReset() {
    table = [
        ['TN','CN','AN','RN','REN','AN','CN','TN'],
        ['PN','PN','PN','PN','PN','PN','PN','PN'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['PB','PB','PB','PB','PB','PB','PB','PB'],
        ['T','C','A','R','RE','A','C','T']
    ]

    casellaCliccataMossa = undefined
    caselleMosse = []
    gameData = new Array(64)

    for(let i = 0; i < gameData.length; i++) {
        let data = {}
        gameData[i] = data
    }

    casualmoves = false
    alwaysTrue = false
    finita = false
    trasformato = undefined
    spazioTrasformazione = undefined
    nuovoBianco = undefined
    nuovoNero = undefined
    torreBiancaSinistraPrimaMossa = 0
    torreBiancaDestraPrimaMossa = 0
    torreNeraSinistraPrimaMossa = 0
    torreNeraDestraPrimaMossa = 0
    mosseReBianco = 0
    mosseReNero = 0
    mosseNero = 0
    mosseBianco = 0
    mosseBiancoTesto.textContent = 'Moves: ' + mosseBianco
    mosseNeroTesto.textContent = 'Moves: ' + mosseNero
    turno = 'bianco'
    secondiInMinuti()
    tempoRestanteBianco.textContent = minutoBianco + ':' + '0' + secondoBianco + ''
    tempoRestanteNero.textContent = minutoNero + ':' + '0' + secondoNero + ''
    togliTutteImg()

    if (avversario == 'online') {
        turno = turnoOnline
    }

    vogliaDiGiocareAncora = false
    avvio()
}