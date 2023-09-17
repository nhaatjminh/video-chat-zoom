const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: true });

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on('connection', (socket) => {
    console.log('user connected', socket.id)
    socket.on('on-chat', (data) => {
        io.emit('user-chat', data)
    })
    socket.on('room:join', (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id)
        socketIdToEmailMap.set(socket.id, email)
        io.to(room).emit('user:joined', { email, id: socket.id })
        socket.join(room)
        io.to(socket.id).emit('room:join', data)
    })
    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incomming:call', { from: socket.id, offer })
    })

    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans })
    })

    socket.on('peer:nego:needed', ({ offer, to }) => {
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer })
    })

    socket.on('peer:nego:done', ({to, ans}) => {
        io.to(to).emit('peer:nego:final', { from: socket.id, ans })
    })
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

server.listen(8000, () => {
    console.log('Listening on port 8000')
})

const delay = (timer) => {
    return new Promise(resolve => setTimeout(resolve, timer));
}

// const broadcastBitcoinPrice = async () => {
//     while (true) {
//         const price = 31850 + Math.random() * 400;
//         io.emit('bitcoin-price', {
//             price: parseFloat(price.toFixed(2))
//         })
//         await delay(500)
//     }
// }

// broadcastBitcoinPrice()