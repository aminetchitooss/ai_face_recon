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

function setValues(pMoodList, pIntervalAnim) {
    let moodGeneral = ''
    let moodValue = 0
    for (const mood of pMoodList) {

        if (mood.value > moodValue) {
            moodValue = mood.value
            moodGeneral = mood.id
        } else if (mood.value == moodValue && mood.value !== 0) {
            moodGeneral += ' / ' + mood.id
        }
        $("#" + mood.id).animate({
            'height': mood.value * 100 + '%'
        }, pIntervalAnim);
    }
    document.getElementById('mood').innerHTML = moodGeneral || 'Loading ...'
    document.querySelector('h2').classList.toggle('show');
    setTimeout(() => document.querySelector('h2').classList.toggle('show'), 200);
}

function inittilizeData() {
    const initMoodList = [
        { id: 'happy', value: 0.3 },
        { id: 'sad', value: 0.5 },
        { id: 'angry', value: 0.6 },
        { id: 'surprised', value: 0.3 },
        { id: 'disgusted', value: 0.4 },
        { id: 'scared', value: 0.1 },
    ]
    setValues(initMoodList)
}

function streamIt(stream) {
    video.srcObject = stream
}
function listenToVideo() {
    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)
        const displaySize = { width: video.videoWidth, height: video.videoHeight }
        faceapi.matchDimensions(canvas, displaySize)
        const intervalAnim = 400
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            if (detections.length > 0)
                setValues([
                    { id: 'happy', value: detections[0].expressions.happy },
                    { id: 'sad', value: detections[0].expressions.sad },
                    { id: 'angry', value: detections[0].expressions.angry },
                    { id: 'surprised', value: detections[0].expressions.surprised },
                    { id: 'disgusted', value: detections[0].expressions.disgusted },
                    { id: 'scared', value: detections[0].expressions.fearful }
                ], intervalAnim)
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        }, intervalAnim + 100)
    })
}
(function () {
    // inittilizeData()
    listenToVideo()
})();