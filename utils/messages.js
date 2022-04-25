const moment = require('moment')

function formatoMessaggio(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = formatoMessaggio