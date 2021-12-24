const socket = io();

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

const myFace = document.getElementById("myFace");
const peersStream = document.getElementById("peersStream");

const videoBtn = document.getElementById("video");
const audioBtn = document.getElementById("audio");
const haulBtn = document.getElementById("haul");
const muteBtn = document.getElementById("mute");
const camerasSelect = document.getElementById("cameras");
const micsSelect = document.getElementById("mics");

const welcomeForm = welcome.querySelector("form");

let myStream;
let roomName;
let myPeerConnection;
let video = true;
let audio = true;
let cameraDeviceId, audioDeviceId;

call.hidden = true;

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia(true);
    makeConnection();
}

function woomEmit(event, data, done) {
    socket.emit("woom", {
        eventName: event,
        data: data
    }, done);
}

function addOption(value, label, parent, select) {
    const option = document.createElement("option");
    option.value = value;
    option.innerText = label;
    if (select) {
        option.selected = true;
    }
    parent.appendChild(option);
}

function paintOptions(devices, currentDevice, select, screen) {
    devices.forEach((device) => {
        addOption(device.deviceId, device.label, select, device.deviceId === currentDevice);
    });
    if (screen) {
        addOption("screen", "screen", select, currentDevice === "screen");
    }
}

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const mics = devices.filter((device) => device.kind === "audioinput");
        const currentCamera = myStream.getVideoTracks()[0];
        const currentMic = myStream.getAudioTracks()[0];
        paintOptions(cameras, currentCamera, camerasSelect, true);
        paintOptions(mics, currentMic, micsSelect);
    } catch (err) {
        console.log(err);
    }
}

async function getMedia(first) {
    const constraints = {
        video: video,
        audio: audio,
    };
    if (cameraDeviceId && cameraDeviceId !== "screen") {
        constraints.video = { deviceId: { exact: cameraDeviceId } };
    }
    if (audioDeviceId) {
        constraints.audio = { deviceId: { exact: audioDeviceId } };
    } else if (!audio) {
        constraints.audio = { facingMode: "user" };
    }
    try {
        let stream;
        if (cameraDeviceId === "screen") {
            stream = await navigator.mediaDevices.getDisplayMedia();
        } else {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        }
        myStream = stream;
        myFace.srcObject = stream;
        if (first) {
            await getCameras();
        }
        myFace.play();
    } catch (err) {
        console.log(err);
    }
}

function handleVideoClick() {
    if (!video) {
        video = true;
        videoBtn.innerText = "Video On ⭕";
    } else {
        video = false;
        videoBtn.innerText = "Video Off ❌";
    }
    myStream
        .getVideoTracks()
        .forEach((track) => {track.enabled = video});
}
function handleAudioClick() {
    if (!audio) {
        audio = true;
        audioBtn.innerText = "Audio On ⭕";
    } else {
        audio = false;
        audioBtn.innerText = "Audio Off ❌";
    }
    myStream
        .getAudioTracks()
        .forEach((track) => {track.enabled = audio});
}

function handleHaulClick() {
    myFace.muted = !myFace.muted;
    if (myFace.muted) {
        haulBtn.innerText = "Remove Hauling ⭕";
    } else {
        haulBtn.innerText = "Remove Hauling ❌";
    }
}
function handleMuteClick() {
    peersStream.muted = !peersStream.muted;
    if (peersStream.muted) {
        muteBtn.innerText = "Mute ⭕";
    } else {
        muteBtn.innerText = "Mute ❌";
    }
}

async function handleCameraChange() {
    cameraDeviceId = camerasSelect.value;
    await getMedia();
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
            .getSenders()
            .find((sender) => sender.track.kind === "video");
        await videoSender.replaceTrack(videoTrack).then(() => {
            myStream
                .getVideoTracks()
                .forEach((track) => {track.enabled = video});
        });
    }
}
async function handleMicChange() {
    audioDeviceId = micsSelect.value;
    await getMedia();
    if (myPeerConnection) {
        const audioTrack = myStream.getAudioTracks()[0];
        const audioSender = myPeerConnection
            .getSenders()
            .find((sender) => sender.track.kind === "audio");
        await audioSender.replaceTrack(audioTrack).then(() => {
            myStream
                .getAudioTracks()
                .forEach((track) => {track.enabled = audio});
        });
    }
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    woomEmit("enter_room", {
        roomName: input.value + "#woom",
    }, () => {
        roomName = undefined;
        welcome.hidden = false;
        call.hidden = true;
        alert("Sorry, The room is full.");
        location.reload();
    });
    roomName = input.value + "#woom";
    input.value = "";
}

videoBtn.addEventListener("click", handleVideoClick);
audioBtn.addEventListener("click", handleAudioClick);

haulBtn.addEventListener("click", handleHaulClick);
muteBtn.addEventListener("click", handleMuteClick);

camerasSelect.addEventListener("input", handleCameraChange);
micsSelect.addEventListener("input", handleMicChange);

welcome.addEventListener("submit", handleWelcomeSubmit);

socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    await myPeerConnection.setLocalDescription(offer);
    woomEmit("offer", {
        offer: offer,
        roomName: roomName
    });
});

socket.on("offer", async (offer) => {
    await myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    await myPeerConnection.setLocalDescription(answer);
    woomEmit("answer", {
        answer: answer,
        roomName: roomName
    });
});

socket.on("answer", async (answer) => {
    await myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", async (ice) => {
    await myPeerConnection.addIceCandidate(ice);
});

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, myStream);
    });
}

function handleIce(data) {
    woomEmit("ice", {
        ice: data.candidate,
        roomName: roomName
    });
}

function handleAddStream(data) {
    peersStream.srcObject = data.stream;
    peersStream.play();
}
