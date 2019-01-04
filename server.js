const http = require('http')
const fs = require('fs')
const path = require('path')
const mime = require('mime')
// const io = require('socket.io')(http)

const chatServer = require('./llibs/chat_server')
let cache = {}

function send404 (response) {
  response.writeHead(404, { 'Content-Type': 'text/plain;charset=utf-8' })
  response.write('请求资源不存在')
  response.end()
}

function sendFile (response, filepath, fileContents) {
  response.writeHead(200, { 'Content-Type': mime.getType(path.basename(filepath)) })
  response.end(fileContents)
}

function serveStatic (response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath])
  } else {
    fs.access(absPath, function (err) {
      if (!err) {
        fs.readFile(absPath, function (err, data) {
          if (err) {
            send404(response)
          } else {
            cache[absPath] = data
            sendFile(response, absPath, data)
          }
        })
      } else {
        send404(response)
      }
    })
  }
}

let server = http.createServer(function (requset, response) {
  let filepath = false
  console.log('requset.url:', requset.url)
  if (requset.url === '/') {
    // console.log('加载index.html')
    filepath = 'public/index.html'
  } else {
    filepath = 'public' + requset.url
  }

  let absPath = './' + filepath
  serveStatic(response, cache, absPath)
})

// io.on('connection', function (socket) {
//   console.log('a user connected')
// })

server.listen(8888, function () {
  console.log('server is starting http://127.0.0.1:8888')
})

chatServer.listen(server)
