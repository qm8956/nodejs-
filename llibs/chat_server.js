const socketio = require('socket.io')

let io
let guestNumber = 1
let nickNames = {}
let nameUsed = []
let currentRoom = {}

function assignGuestName (socket, guestNumber, nickNames, nameUsed) {
  let name = 'Guest' + guestNumber
  nickNames[socket.id] = name
  socket.emit('nameResult', {
    success: true,
    name: name
  })

  nameUsed.push(name)
  return guestNumber + 1
}

function joinRoom (socket, room) {
  socket.join(room)
  currentRoom[socket.id] = room
  socket.emit('joinResult', { room: room })
  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + ' has joined ' + room + '-'
  })
  // let userInRoom = io.sockets.clients(room)
  let userInRoom = io.sockets.adapter.rooms[room]
  // console.log('userInRoom', userInRoom)
  if (userInRoom.length > 1) {
    let userInRoomSummary = 'User currently in ' + room + ': '
    for (let index in userInRoom) {
      let userSocketId = userInRoom[index].id
      if (userSocketId !== socket.id) {
        if (index > 0) {
          userInRoomSummary += ', '
        }
        userInRoomSummary += nickNames[userSocketId]
      }
    }
    userInRoomSummary += '-'
    socket.emit('message', { text: userInRoomSummary })
  }
}

function handleMessageBroadcasting (socket, nickNames) {
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    })
  })
}

function handleNameChangeAttempts (socket, nickNames, nameUsed) {
  socket.on('nameAttempt', function (name) {
    if (name.indexOf('Guest') === 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest" .'
      })
    } else {
      if (nameUsed.indexOf(name) === -1) {
        let previousName = nickNames[socket.id]
        let previousNameIndex = nameUsed.indexOf(previousName)
        nameUsed.push(name)
        nickNames[socket.id] = name
        delete nameUsed[previousNameIndex]
        socket.emit('nameResult', {
          success: true,
          name: name
        })
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + ' is now known as ' + name + '.'
        })
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use .'
        })
      }
    }
  })
}

function handleRoomJoining (socket) {
  socket.on('join', function (room) {
    socket.leave(currentRoom[socket.id])
    joinRoom(socket, room.newRoom)
  })
}

function handlerClientDisconnection (socket, nickNames, nameUsed) {
  socket.on('disconnect', function () {
    let nameIndex = nameUsed.indexOf(nickNames[socket.id])
    delete nameUsed[nameIndex]
    delete nickNames[socket.id]
  })
}

exports.listen = function (server) {
  // console.log('server:', server)
  io = socketio.listen(server)
  // console.log('io:', io)
  io.set('log level', 1)
  io.sockets.on('connection', function (socket) {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, nameUsed)
    joinRoom(socket, 'Lobby')
    // 处理用户的消息，更名，以及聊天室的创建和变更
    handleMessageBroadcasting(socket, nickNames)
    // 处理用户的更名
    handleNameChangeAttempts(socket, nickNames, nameUsed)
    // 处理加入房间
    handleRoomJoining(socket)
    // 用户发出请求时，向其提供已经被占用的聊天室的列表
    socket.on('rooms', function () {
      // socket.emit('rooms', io.sockets.manager.rooms)
      socket.emit('rooms', io.sockets.adapter.rooms)
    })
    // 定义用户断开连接后的清除逻辑
    handlerClientDisconnection(socket, nickNames, nameUsed)
  })
}
