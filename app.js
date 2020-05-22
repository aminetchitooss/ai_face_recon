const video = document.getElementById('video')

function startvideo() {
    navigator.getUserMedia({ video: {} }, streamIt, (err) => document.getElementById('tst').innerHTML = err)
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(() => {
    startvideo()
})

function setValues(pMoodList) {
    let moodGeneral = ''
    let moodValue = 0
    for (const mood of pMoodList) {

        if (mood.value > moodValue) {
            moodValue = mood.value
            moodGeneral = mood.id
        } else if (mood.value == moodValue) {
            moodGeneral += ' ' + mood.id
        }
        $("#" + mood.id).animate({
            'height': mood.value + '%'
        }, 1000);
    }
    document.getElementById('mood').innerHTML = moodGeneral || 'Loading ...'
    document.querySelector('h2').classList.toggle('show');
    setTimeout(() => document.querySelector('h2').classList.toggle('show'), 200);
}

function inittilizeData() {
    const initMoodList = [
        { id: 'happy', value: 56 },
        { id: 'sad', value: 33 },
        { id: 'angry', value: 54 },
        { id: 'surprised', value: 94 },
        { id: 'disgusted', value: 44 },
        { id: 'scared', value: 34 },
    ]
    setValues(initMoodList)
}

function streamIt(stream) {
    video.srcObject = stream
}
function listenToVideo() {
    video.addEventListener('play', () => {
        // const canvas = faceapi.createCanvasFromMedia(video)
        // document.body.append(canvas)
        // const displaySize = { width: video.width, height: video.height }
        // faceapi.matchDimensions(canvas, displaySize)
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            console.log(detections)
            // const resizedDetections = faceapi.resizeResults(detections, displaySize)
            // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            // faceapi.draw.drawDetections(canvas, resizedDetections)
            // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        }, 100)
    })
}
(function () {
    inittilizeData()
    listenToVideo()
})();