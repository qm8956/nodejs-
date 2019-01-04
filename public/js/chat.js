let Chat = function (socket) {
  this.socket = socket
}

Chat.prototype.sendMessage = function (room, text) {
  console.log('room', room, 'text', text)
  this.socket.emit('message', {
    room: room,
    text: text
  })
}

Chat.prototype.changeRoom = function (room) {
  this.socket.emit('join', {
    newRoom: room
  })
}
// 处理聊天命令，只能处理两个命令
Chat.prototype.processCommand = function (command) {
  let words = command.split(' ')
  command = words[0].substring(1, words[0].length).toLowerCase()
  let message = false

  switch (command) {
    case 'join':
      words.shift()
      let room = words.join(' ')
      this.changeRoom(room)
      break
    case 'nick':
      words.shift()
      let name = words.join(' ')
      this.socket.emit('nameAttempt', name)
      break
    default:
      message = 'Unrecogized command .'
      break
  }

  return message
}
