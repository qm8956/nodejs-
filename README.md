### 学习nodejs实战 第二章代码

1. node 8.9.0
2. npm 5.5.1
2. mime 2.4.0
3. socket.io 2.2.0

代码clone下来后
1. 安装依赖模块
```
  npm install
```
2. 启动
```
  npm start
```

> 代码本身并不复杂，有几个版本问题需要调整

1. fs.exists 使用fs.access代替，其中还有fs.stat，但这是要操作文件使用的，只是判断文件是否存在用fs.access即可
2. io.sockets.manager.rooms用io.sockets.adapter.rooms代替 [查阅地址](https://github.com/socketio/socket.io/issues/1884)

3. io.sockets.clients(room)用io.sockets.adapter.rooms[room][查阅地址](https://github.com/socketio/socket.io/issues/3137)

**没有多人的时候可以打开不同的浏览器测试**