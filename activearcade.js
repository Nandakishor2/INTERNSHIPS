let myCanvas = document.getElementById('myVideoCanvas');
let myVideo = document.getElementById('myVideo'); // video tag where the audiences video will be shown
let points = []

let c1 = "green",max = 0,min = 0,a=true
let pointer = 0






//pose variables and scoreThreshold
let myDetector;
let myPose;
let scoreThreshold = 0.45
let next = false;
let myStreaming = false, startComparisonVariable = false;

const correctFrames = 10
let correctFrameCount = 0 // joint should be correct over these many frames to proceed
let lx, ly, rx, ry
// canvas and video width and height variables
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)


// audio delay
const jointStepDelay = 1500


let currectSpawnIndex = 0
let gameOver = false



let width = 0.5 * vw
let hostHeight, myHeight, drawingStarted = false

let percentRadius = 0.83



function draw() {

    if (myHeight && myStreaming) {
        detectPoseMine()
    }

}


let loadModels = async () => {
    myDetector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER });
    document.getElementById('pose-controls').style.display = 'flex'

}




let startMyCamera = async (e) => {

    // Get media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (stream) {
            // Link to the video source
            myVideo.srcObject = stream;
            // Play video
            myVideo.play();
        })
        .catch(function (err) {
            console.log(`Error: ${err}`);
        });
    // Play when ready
    myVideo.addEventListener('canplay', function (e) {
        myHeight = myVideo.videoHeight / (myVideo.videoWidth / width);
        myCanvas.setAttribute('width', width);
        myCanvas.setAttribute('height', myHeight);
        myVideo.setAttribute('width', width);
        myVideo.setAttribute('height', myHeight);

        myStreaming = true
    }, false);

}

function evaluate(res){
    if(res<20){
        if(a){
            a=false
            min = 200,max =410
        }
        else{
            a=true
            min = 10,max =200
        }
        pointer= pointer+1
        next = false
        c1 = "green"

    }

    
}

let detectPoseMine = async () => {
    myVideo.setAttribute('width', width);
    myPose = await myDetector.estimatePoses(myVideo, {
        flipHorizontal: false
    })
    const context = myCanvas.getContext('2d');
    if (width && myHeight && myPose[0]) {
        // console.log(myPose[0]);
        myCanvas.width = width;
        myCanvas.height = myHeight;
        context.drawImage(myVideo, 0, 0, width, myHeight);

        for (let i = 0; i < myPose[0].keypoints.length; i++) {
            if (myPose[0]) {
                const context = myCanvas.getContext('2d');
                if(a){
                    rx = myPose[0].keypoints[9].x / myVideo.videoWidth * width;
                    ry = myPose[0].keypoints[9].y / myVideo.videoHeight * myHeight;

                }
                else{
                    rx = myPose[0].keypoints[10].x / myVideo.videoWidth * width;
                    ry = myPose[0].keypoints[10].y / myVideo.videoHeight * myHeight;

                }
                
                context.beginPath();
                context.arc(rx, ry, 30, 0, 2 * Math.PI);
                context.fillStyle = "blue";
                context.fill();
                context.closePath();
                if (!next) {
                    let x = Math.floor((Math.random() * (max-min)+1) + min);
                    let y = Math.floor((Math.random() * 400) + 1);
                    console.log(a,x,y)
                    
                    let p2 = { x: x, y: y }
                    points.push(p2)
                    next = true

                }
                context.beginPath()
                context.arc(points[pointer].x, points[pointer].y, 30, 0, 2 * Math.PI);
                context.fillStyle = c1;
                context.fill();
                context.closePath();
                let p1 = { x: rx, y: ry }
                let res = calculateDistance(p1, {x:points[pointer].x,y:points[pointer].y})
                evaluate(res)



            }

        }
        drawingStarted = true



    }
    myVideo.setAttribute('width', 0);
}



function toRadians(angle) {
    return angle * (Math.PI / 180);
}







function diff(num1, num2) {
    if (num1 > num2) {
        return (num1 - num2);
    } else {
        return (num2 - num1);
    }
};




function calculateDistance(A, B) {
    var deltaX = diff(A.x, B.x);
    var deltaY = diff(A.y, B.y);
    var dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    return (dist);
};


async function wait() {

    await tf.ready();
    // Now we can use the WebGPU backend.
    const tensor = tf.tensor(1);
    console.log(tensor);
}

wait()

loadModels()
document.getElementById('start-my-cam-button').addEventListener('click', startMyCamera)
