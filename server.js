const express = require('express');
const app = express();
const favicon = require('serve-favicon')
const path = require('path')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4:uuidV4} = require('uuid');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.set('view engine','ejs');
app.use(express.static('public'));
app.use('/peerjs',peerServer);



app.get('/',(req,res)=>{
    res.redirect(`/${uuidV4()}`);
})

app.get('/leave',(req,res)=>{
    res.render('leave');
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room}); //sending to ejs
})




io.on('connection',socket => {
    socket.on('join-room',(roomId,userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected',userId);

        socket.on('message',message => {
            io.to(roomId).emit('createMessage',message);
        });

        socket.on('disconnect',()=>{
            socket.broadcast.to(roomId).emit('user-disconnected',userId);
        })
    })
})


server.listen(process.env.PORT || 3030);