let buttons = [];

let monoSynth;

let fetchedInfo = [];
let previousInfo = [];

let loadingGif;
let currentImage;

let margin = 70;

function setup(){
	createCanvas(windowWidth,windowHeight);

	fetchApi();
	
	buttons[0] = new Button(windowWidth/8,windowHeight/2,windowWidth/3,windowHeight*0.75,10,margin,color('#F52E2E'),70,0,220,0.8);
	buttons[1] = new Button(windowWidth/8*7,windowHeight/2,windowWidth/3,windowHeight*0.75,10,margin,color('#5463FF'),70,0,440,0.8);
	for(let e = 0;e < buttons.length;e++){
		buttons[e].enableButton();
		buttons[e].enableUserControl();
	}
	getAudioContext().suspend();
	monoSynth = new p5.MonoSynth();

	loadingGif = loadImage("assets/loading.gif");
}

function draw(){
	background(155);
	renderFeatures();

	imageMode(CENTER);
	image(loadingGif,windowWidth/2,windowHeight/2);

	if(fetchedInfo[0]){
		let htmlImage = document.getElementsByTagName("img");
		if(htmlImage.length > 0){
			if(htmlImage[0].src != fetchedInfo[1]){
				htmlImage[0].remove();
				currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
			}
		}else{
			currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
		}
		currentImage.hide();
		// currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
		image(currentImage,windowWidth/2,windowHeight/2,windowWidth/2,windowWidth/2);
		noFill();
		stroke(0);
		strokeWeight(5);
		rect(windowWidth/2,windowHeight/2,windowWidth/2,windowWidth/2);
		currentImage.hide();
	}
}

function renderFeatures(){
	for(let i = 0;i < buttons.length;i++){
		buttons[i].render(1,5);
		
		buttons[i].flash(3000,false,fetchApi);
	}
	buttons[0].update(windowWidth/8,windowHeight/2,windowWidth/3,windowHeight*0.75,10,margin);
	buttons[1].update(windowWidth/8*7,windowHeight/2,windowWidth/3,windowHeight*0.75,10,margin);
}

function fetchApi(){
	let url = "https://api.nasa.gov/planetary/apod?date=";
	let apiKey = "eBxUdgb3ndh8ififjjN4O2phAzPODRBBkWcVviy2";
	let currentDate = new Date();
	url += currentDate.getFullYear() + "-" + (currentDate.getUTCMonth() + 1) + "-" + currentDate.getDate() + "&api_key=" + apiKey;

	loadJSON(url,recievedData);
	// console.log(url);

}

function recievedData(data){
	fetchedInfo[0] = true;
	fetchedInfo[1] = data.hdurl;
	fetchedInfo[2] = data.title;
	fetchedInfo[3] = data.explanation;
	fetchedInfo[4] = data.copyright;
	console.log(fetchedInfo);
}

