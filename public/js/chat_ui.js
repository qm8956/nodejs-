function divEscapedContentElement (message) {
  return $('<div></div>').text(message)
}

function divSystemContentElement (message) {
  return $('<div></div>').html('<i>' + message + '</i>')
}

function processUserInput (chatApp, socket) {
  let message = $('#send-message').val()
  let systemMessage
  console.log('message.chatAt(0)', message.charAt(0))
  if (message.charAt(0) === '/') {
    systemMessage = chatApp.processCommand(message)
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage))
    }
  } else {
    chatApp.sendMessage($('#room').text(), message)
    $('#messages').append(divEscapedContentElement(message))
    $('#messages').scrollTop($('#messages').prop('scrollHeight'))
  }
  $('#send-message').val('')
}
console.log('io', io)
let socket = io.connect()

$(document).ready(function () {
  let chatApp = new Chat(socket)

  socket.on('nameResult', function (result) {
    let message
    if (result.success) {
      message = 'You are new known as ' + result.name + '.'
    } else {
      message = result.message
    }
    $('#messages').append(divSystemContentElement(message))
  })

  socket.on('joinResult', function (result) {
    $('#room').text(result.room)
    $('#messages').append(divSystemContentElement('Room changed.'))
  })

  socket.on('message', function (message) {
    let newElement = $('<div></div>').text(message.text)
    $('#messages').append(newElement)
  })

  socket.on('rooms', function (rooms) {
    $('#room-list').empty()
    for (let room in rooms) {
      room = room.substring(1, room.length)
      if (room !== '') {
        $('#room-list').append(divEscapedContentElement(room))
      }
    }

    $('#room-list div').click(function () {
      chatApp.processCommand('/join ' + $(this).text())
      $('#send-message').focus()
    })
  })

  setInterval(() => {
    socket.emit('rooms')
  }, 1000)

  $('#send-message').focus()

  $('#send-form').submit(function () {
    processUserInput(chatApp, socket)
    return false
  })
})