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
const creator = 'Lomaka Ivan'

// creo le stanze

let stanze = {}

let nomi = {}

// array insulti

const insultiArray = [
    'Il tuo cervello è come l\'isola di piter pan ... non c\'è <3',
    'Ti informo che da oggi puoi comprare a soli 18 euro il kit d\'espansione del tuo cervello. Prova anche tu il piacere di formulare frasi e pensieri corretti.',
    'Sei utile come la forchetta per mangiare il brodo.',
    'Sei bella come il sole. Inguardabile.',
    'Se il lunedì fosse una persona, quella persona saresti tu.'
]

const insultArray = [
    'Your brain is like peter pan\'s island ... there is no <3',
    'I inform you that from today you can buy your brain expansion kit for only 18 euros. Feel the pleasure of formulating correct sentences and thoughts.',
    'You are as useful as the fork for eating broth.',
    'You are beautiful as the sun. Unwatchable.',
    'If Monday was a person, that person would be you.'
]

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

    client.on('coloreAccordato', (chi) => {
        io.to(stanze[client.id]).emit('gameOverClient', chi)
    })

    client.on('chatMessage', (msg) => {
        const user = {
            room: stanze[client.id],
            username: nomi[client.id]
        }

        if (msg.charAt(0) == '/') {
            comandi(msg)
            return
        } else {
            io.to(user.room).emit('message', formatoMessaggio(`${user.username}`, msg))
        }
    })

    function comandi(msg) {
        switch (msg) {
            case '/leave':
                client.leave(stanze[client.id])
                client.broadcast.to(stanze[client.id]).emit('message', formatoMessaggio(nomeBot, `${nomi[client.id]} has left the game!`))
                stanze[client.id] = undefined
                client.emit('resetPagina')
                break
            case '/help':
                client.emit('message', formatoMessaggio(nomeBot, `Commands: /help, /leave, /clear, /creator. <br>There are more secret commands that are waiting to be discovered`))
                break
            case '/clear':
                client.emit('clearMessageBox')
                break
            case '/insult':
                let insultRandomNumber = Math.floor(Math.random() * insultArray.length)
                io.to(stanze[client.id]).emit('message', formatoMessaggio(creator, `From ${nomi[client.id]}<br>${insultArray[insultRandomNumber]}`))
                break
            case '/insulto':
                let insultiRandomNumber = Math.floor(Math.random() * insultiArray.length)
                io.to(stanze[client.id]).emit('message', formatoMessaggio(creator, `Da ${nomi[client.id]}<br>${insultiArray[insultiRandomNumber]}`))
                break
            case '/creator':
                io.to(stanze[client.id]).emit('message', formatoMessaggio(creator, `Hey I'm Lomaka Ivan and I'm the creator of this website!<br>Check out my github projects<br>https://github.com/IvanLomaka/`))
                break
            case '/hacks':
                client.emit('message', formatoMessaggio(nomeBot, `Commands: !hacks, !madness, !letmewin.`))
                break
            case '/madness':
                let randomNumber = Math.floor(Math.random() * 2) + 1
                io.to(stanze[client.id]).emit('message', formatoMessaggio(nomeBot, `Caos enabled`))
                if (randomNumber == 2) {
                    client.emit('message', formatoMessaggio(nomeBot, `Win the game by eating all the opponent's chess figures!`))
                    client.emit('MODENOTDEFINED', 2)
                } else {
                    client.emit('message', formatoMessaggio(nomeBot, 'Now your opponet will do random moves!'))
                    client.broadcast.to(stanze[client.id]).emit('MODENOTDEFINED', 1)
                }
                break
            case '/letmewin':
                client.emit('richiestacolore')
                break
            default:
                break
        }
    }

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
        let nomeStanza = randomString(5)
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