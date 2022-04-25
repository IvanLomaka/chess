// Message from server
socket.on('message', message => {
    outPutMessage(message)

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

// Message submit
chatForm.addEventListener('click', (e) => {
    e.preventDefault()

    // Get message text
    const msg = inputValue.value

    if (msg == '') {
        inputValue.focus()
        return
    }

    // Emit message to server
    socket.emit('chatMessage', msg)

    // Clear input
    inputValue.value = ''
    inputValue.focus()
})

// Output message to DOM
function outPutMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
        <p class="meta">${message.username}<span style="padding-left:5px">${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p>
    `
    document.querySelector('.chat-messages').appendChild(div)
}