//const imgElement = document.querySelector("#img");
const video = document.querySelector('#webcam');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const canvas = document.querySelector('#outputCanvas');
const canvasA = document.querySelector('#canvasA');
const canvasB = document.querySelector('#canvasB');
const canvasC = document.querySelector('#canvasC');

/* create an object of KNN classifier by using */
let clf = undefined;
let classes = ['A', 'B', 'C'];
let frame = undefined;
let model = undefined;

mobilenet.load().then((loadedModel)=>{
	model = loadedModel;
	document.querySelector("#mobilenetStatus").innerHTML = "mobilenet model is loaded.";
	document.querySelector("#mobilenetStatus").style.display = 'none';
	/* enable the button */
	enableWebcamButton.disabled = false;	
	
	document.getElementById('class-a').addEventListener('click', (e) => addExample(e, 0));
	document.getElementById('class-b').addEventListener('click', (e) => addExample(e, 1));
	document.getElementById('class-c').addEventListener('click', (e) => addExample(e, 2));
	document.getElementById('resetBtn').addEventListener('click', resetKnn);
});

function onKnnReady() {  
	document.querySelector("#knnStatus").innerHTML = "knn model is loaded.";	
	document.querySelector("#knnStatus").style.display = 'none';
	clf = knnClassifier.create();
}
function onOpenCvReady() {
  /* enable the button */
  console.log("OpenCv.js Ready");
}

/* Check if webcam access is supported. */
function getUserMediaSupported() {
	/* Check if both methods exists.*/
	return !!(navigator.mediaDevices &&
	    navigator.mediaDevices.getUserMedia);

}

if (getUserMediaSupported()) {
	enableWebcamButton.addEventListener('click', enableCam);
	disableWebcamButton.addEventListener('click', disableCam);
} else {
	console.warn('getUserMedia() is not supported by your browser');
}

function enableCam(event) {
	/* disable this button once clicked.*/
	event.target.disabled = true;

	/* show the disable webcam button once clicked.*/
	disableWebcamButton.disabled = false;

	/* show the video and canvas elements */
	document.querySelector("#liveView").style.display = "block";

	// getUsermedia parameters to force video but not audio.
	const constraints = {
	video: true
	};

	// Activate the webcam stream.
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
	video.srcObject = stream;
	video.addEventListener('loadeddata', predictCam);
	})
	.catch(function(err){
	console.error('Error accessing media devices.', error);
	});
};

function disableCam(event) {
    event.target.disabled = true;
    enableWebcamButton.disabled = false;

    /* stop streaming */
    video.srcObject.getTracks().forEach(track => {
      track.stop();
    })
  
    /* clean up. some of these statements should be placed in predictCam() */
    video.srcObject = null;
    video.removeEventListener('loadeddata', predictCam);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.querySelector("#liveView").style.display = "none";
}

function predictCam() {
	if (video.srcObject == null) {return;}
	
	let cap = new cv.VideoCapture(video); 
	frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
	cap.read(frame);	
	
	/* KNN classifier */
	if (clf.getNumClasses() > 0) {
		// Get the activation from mobilenet from the webcam.
		const activation = model.infer(video, true);
		// Get the most likely class and confidence from the classifier module.
		clf.predictClass(activation).then((result)=>{
			document.querySelector("#webcamResult").innerHTML = 
			`prediction: ${classes[result.label]}, probability: ${result.confidences[result.label]}`;
		});
    }

	window.requestAnimationFrame(predictCam);
}


let clicks = {0:0, 1:0, 2:0};

function addExample(event, classId) {
  
	clicks[classId] += 1;
	
	switch (classId) {
		case 0:
			event.target.innerHTML = `Add IDLE(${clicks[classId]})`;
			cv.imshow("canvasA", frame);
			break;
		case 1:
			event.target.innerHTML = `Add JUMP(${clicks[classId]})`;
			cv.imshow("canvasB", frame);
			break;
		case 2:
			event.target.innerHTML = `Add DUCK(${clicks[classId]})`;
			cv.imshow("canvasC", frame);
			break;
		default:
	}
	
  	const embedding = model.infer(video, true)
  	clf.addExample(embedding, classId);
}

function clearCanvas(cvs) {
	context = cvs.getContext('2d');
	context.clearRect(0, 0, cvs.width, cvs.height);
}

function resetKnn(event) {
	clicks = {0:0, 1:0, 2:0};
	document.getElementById('class-a').innerHTML = `Add IDLE(${clicks[0]})`;
	document.getElementById('class-b').innerHTML = `Add JUMP(${clicks[1]})`;
	document.getElementById('class-c').innerHTML = `Add DUCK(${clicks[2]})`;
	clf.clearAllClasses();
	
	clearCanvas(canvasA);
	clearCanvas(canvasB);
	clearCanvas(canvasC);
}