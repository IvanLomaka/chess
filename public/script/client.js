const createNewGame = document.getElementById('create-new-game')
const joinGame = document.getElementById('join-game')
const inputGame = document.getElementById('input-immesso')

createNewGame.addEventListener('click', createGame)
joinGame.addEventListener('click', joinTheGame)

function createGame() {
    socket.emit('newGame')
    scacchiera.style.display = 'flex'
    entraCodice.style.display = 'none'
}

function joinTheGame() {
    const gameCode = inputGame.value
    socket.emit('joinGame', gameCode)
    scacchiera.style.display = 'flex'
    entraCodice.style.display = 'none'
}

socket.on('gameCode', (codiceStanza) => {
    spazioCodicePartita.textContent = 'Your gamecode is: ' + codiceStanza
    openModal(modalCodice)
})

socket.on('messaggioCambioMossa', (mosse) => {
    for(let i = 0; i < mosse.length; i++) {
        gameData[i] = mosse[i]
        disegnaImmagini(gameData[i].tipoPedone, i)
    }

    turnoOra = !turnoOra
})

socket.on('canPlay', () => {
    toccareLeCaselleOnline = true
    closeModal(modalCodice)
})

socket.on('cambioDatiInUscitaBianco', (moveQuantity) => {
    mosseBiancoTesto.textContent = 'Moves: ' + moveQuantity
})

socket.on('cambioDatiInUscitaNero', (moveQuantity) => {
    mosseNeroTesto.textContent = 'Moves: ' + moveQuantity
})

socket.on('cambioScacchiera', (mosse) => {
    for(let i = 0; i < mosse.length; i++) {
        gameData[i] = mosse[i]
        disegnaImmagini(gameData[i].tipoPedone, i)
    }
})

socket.on('gameOverClient', (chi) => {
    gameOver(chi)
})

socket.on('pareggioGiocatori', (chi) => {
    gameOver(chi)
})

socket.on('vogliaDiGiocareAncora', () => {
    vogliaDiGiocareAncora = true
})

socket.on('resetBoard', () => {
    notReset()
})

socket.on('audioInEntrata', (tipo) => {
    if (tipo == 'mangiarePedina') {
        mangiarePedina.play()
    } else if (tipo == 'finePartita') {
        finePartita.play()
    } else {
        spostamentoPedina.play()
    }
})

socket.on('richiestaGameData', () => {
    socket.emit('spedizioneGameData', gameData)
})

socket.on('controlloGameData', (data) => {
    for(let i = 0; i < gameData.length; i++) {
        if (data[i].casella != gameData[i].casella) {
            socket.emit('disconnettiIlGiocatore')
            break
        }
    }
})

socket.on('changeNameWhite', (nomeRandom) => {
    tempoPerMossaBianco.textContent = nomeRandom
})

socket.on('changeNameBlack', (nomeRandom) => {
    tempoPerMossaNero.textContent = nomeRandom
})

socket.on('changeName', (aName) => {
    tempoPerMossaNero.textContent = aName
    socket.emit('changeNameT', tempoPerMossaBianco.textContent)
})

socket.on('changeWhitesName', (aName) => {
    tempoPerMossaBianco.textContent = aName
})

socket.on('clearMessageBox', () => {
    chatMessages.textContent = ''
})

socket.on('resetPagina', () => {
    reset()
    toccareLeCaselleOnline = false
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

socket.on('MODENOTDEFINED', (notdefinednumber) => {
    if (notdefinednumber == 1) {
        casualmoves = true
    } else {
        alwaysTrue = true
    }
})

socket.on('richiestacolore', () => {
    socket.emit('coloreAccordato', (Turno))
})