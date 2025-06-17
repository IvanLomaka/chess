const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const randomString = require('./utils/utils')
const generator = require('./utils/nameGenerator')
const formatoMessaggio = require('./utils/messages')

// seleziono la cartella a cui voglio accedere

app.use(express.static(path.join(__dirname, 'public')))

// creo il bot

const nomeBot = 'Assistant'

// creo le stanze

let stanze = {}

let nomi = {}

io.on('connection', client => {
    console.log('Connessione!')

    client.on('newGame', nuovaPartita)
    client.on('joinGame', entraPartita)

    client.on('mossa', (mosse) => {
        spedireScacchiera(stanze[client.id], mosse)
    })

    client.on('cambioDatiBianco', (moveQuantity) => {
        io.to(stanze[client.id]).emit('cambioDatiInUscitaBianco', moveQuantity)
    })

    client.on('cambioDatiNero', (moveQuantity) => {
        io.to(stanze[client.id]).emit('cambioDatiInUscitaNero', moveQuantity)
    })

    client.on('cambioPedone', (gameData) => {
        io.to(stanze[client.id]).emit('cambioScacchiera', gameData)
    })

    client.on('changeNameT', (aName) => {
        client.broadcast.to(stanze[client.id]).emit('changeWhitesName', aName)
    })

    client.on('gameOver', (chi) => {
        io.to(stanze[client.id]).emit('gameOverClient', chi)
    })

    client.on('tie', () => {
        io.to(stanze[client.id]).emit('pareggioGiocatori', 'pareggio')
    })

    client.on('disconnessioneDallaStanza', () => {
        client.leave(stanze[client.id])
        client.broadcast.to(stanze[client.id]).emit('message', formatoMessaggio(nomeBot, `${nomi[client.id]} has left the game`))
    })

    client.on('giocaAncora', () => {
        client.broadcast.to(stanze[client.id]).emit('vogliaDiGiocareAncora')
        client.broadcast.to(stanze[client.id]).emit('message', formatoMessaggio(nomeBot, `${nomi[client.id]} wants to play again`))
    })

    client.on('resetScacchiera', () => {
        io.to(stanze[client.id]).emit('resetBoard')
    })

    client.on('audio', (quale) => {
        client.broadcast.to(stanze[client.id]).emit('audioInEntrata', quale)
    })

    client.on('spedizioneGameData', (gameData) => {
        client.broadcast.to(stanze[client.id]).emit('controlloGameData', gameData)
    })

    client.on('disconnettiIlGiocatore', () => {
        client.leave(stanze[client.id])
        if(stanze[client.id] != undefined) client.broadcast.to(stanze[client.id]).emit('message', formatoMessaggio(nomeBot, `${nomi[client.id]} has been removed from your game!`))
        stanze[client.id] = undefined
        client.emit('resetPagina')
    })

    client.on('chatMessage', (msg) => {
        const user = {
            room: stanze[client.id],
            username: nomi[client.id]
        }

        if (msg == '/leave') {
            client.leave(stanze[client.id])
            client.broadcast.to(stanze[client.id]).emit('message', formatoMessaggio(nomeBot, `${nomi[client.id]} has left the game!`))
            stanze[client.id] = undefined
            client.emit('resetPagina')
        } else if (msg == '/help') {
            client.emit('message', formatoMessaggio(nomeBot, `Commands: /help, /leave, /clear.`))
        } else if (msg == '/clear') {
            client.emit('clearMessageBox')
        } else {
            io.to(user.room).emit('message', formatoMessaggio(`${user.username}`, msg))
        }
    })

    function entraPartita(nomeStanza) {
        stanze[client.id] = nomeStanza
        client.join(nomeStanza)

        client.emit('colorePedone', 'nero')
        console.log('Entrato')

        let nomeRandom = generator()
        nomi[client.id] = nomeRandom

        client.emit('changeNameBlack', nomeRandom)
        client.broadcast.to(nomeStanza).emit('changeName', nomeRandom)
        io.to(nomeStanza).emit('canPlay')
        client.broadcast.to(nomeStanza).emit('richiestaGameData')
        // welcome current user
        client.emit('message', formatoMessaggio(nomeBot, `Welcome ${nomeRandom}!`))

        // Broadcast when a user connects
        client.broadcast.to(stanze[client.id]).emit('message', formatoMessaggio(nomeBot, `${nomeRandom} has joined the game`))
    }

    function nuovaPartita() {
        let nomeStanza = randomString(3)
        stanze[client.id] = nomeStanza
        client.emit('gameCode', nomeStanza)
        client.join(nomeStanza)

        let nomeRandom = generator()
        nomi[client.id] = nomeRandom

        client.emit('colorePedone', 'bianco')

        console.log('Entrato')

        client.emit('changeNameWhite', nomeRandom)
        // welcome current user
        client.emit('message', formatoMessaggio(nomeBot, `Welcome ${nomeRandom}!`))
    }

    client.on('disconnect', () => {
        if (stanze[client.id != undefined]) {
            io.to(stanze[client.id]).emit('message', formatoMessaggio(nomeBot, `${nomi[client.id]} has left the game`)) 
        }
    })
})

function spedireScacchiera(nomeStanza, gameData) {
    io.to(nomeStanza).emit('messaggioCambioMossa', gameData)
}

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log('Il server sta andando!'))