const socket = io('/');
const VideoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;
let USER_ID;

// list of participants
const peers = {};

var peer = new Peer(undefined,{
    path:'/peerjs',
    host:'/',
    port:'3030' //coz of nodejs server
    // port:'443' //deployment
});

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo,stream);

    // answering the call
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        });
    });

    socket.on('user-connected',userId => {
        connectToNewUser(userId,stream);
    });

    let text = $('input');

    $('html').keydown(e => {
        if(e.which == 13 && text.val().length !== 0){
            socket.emit('message',text.val());
            text.val('');
        }
    });

    socket.on('createMessage',message => {
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom();
    });

});

peer.on('call',call => {
    navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true
    }).then(stream => {
        // send new connection video to old ones
        call.answer(stream);

        //get old ones in new connections browser
        const video = document.createElement('video');
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream);
        });
    })
    
});

socket.on('user-disconnected',userId=>{
    if(peers[userId])
        peers[userId].close();
})

peer.on('open',id => {
    USER_ID = id;
    socket.emit('join-room',ROOM_ID,id);
});



const connectToNewUser = (userId,stream) => {
    // send ours 
    const call = peer.call(userId, stream);

    // add theirs to our screen i.e. pick the call
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    // when other user leaves
    call.on('close',()=>{
        video.remove();
    })
    
    // add to the list
    peers[userId] = call;
};



const addVideoStream = (video,stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    });
    VideoGrid.append(video);
};


const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } 
    else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.mute_button').innerHTML = html;
}


const playStop = () => {
    // console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo();
    } else {
      setStopVideo();
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.video_button').innerHTML = html;
}
  
const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.video_button').innerHTML = html;
}

const leaveMeeting = () => {
    document.location.href = '/leave';
}
  

$('.chat_button').click(() => {
    $('.main__right').toggle();

    const obj = document.getElementsByClassName('main__right')[0];
    const style = window.getComputedStyle(obj);
    const display = style.getPropertyValue('display');

    if(display==='none')
        document.getElementsByClassName('main__left')[0].style.flex = 1;
    else
    {
        document.getElementsByClassName('main__right__invite')[0].style.display = "none";
        document.getElementsByClassName('main__left')[0].style.flex = 0.8;
        obj.style.display = "flex";
    }
})

$('.invite_button').click(() => {
    $('.main__right__invite').toggle();

    const obj = document.getElementsByClassName('main__right__invite')[0];
    const style = window.getComputedStyle(obj);
    const display = style.getPropertyValue('display');

    if(display==='none')
        document.getElementsByClassName('main__left')[0].style.flex = 1;
    else
    {
        document.getElementsByClassName('main__right')[0].style.display = "none";
        document.getElementsByClassName('main__left')[0].style.flex = 0.8;
        obj.style.display = "flex";
    }
})

document.getElementById('room_id').innerHTML = ROOM_ID;

$("#copyLink").click(() => {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($("#room_id").text()).select();
    document.execCommand("copy");
    $temp.remove();
    $("#copy__message").fadeToggle();
    $("#copy__message").fadeToggle(1500);
});






