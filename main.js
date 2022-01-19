let buttons = [];

let monoSynth;

let fetchedInfo = [];

let loadingGif;
let currentImage;

let margin = 70;

let startDate = new Date();
let today = new Date();

let multiplier = 24*60*60*1000;
let currentDate = new Date();

let dateRange = {
	min : new Date('06/20/1995'),
	max : new Date()
}

let volume = 0.7;
let copiedSource = "";

let likes = {};
let direction = "next";

function setup(){
	createCanvas(windowWidth,windowHeight);
	margin = map(dist(0,0,windowWidth,windowHeight),0,sqrt(sq(windowWidth)+sq(windowHeight)),0,50);
	fetchApi();
	
	buttons[0] = new Button(windowWidth/8,windowHeight/2+windowHeight*0.3,windowWidth/3,windowHeight*0.2,10,margin,color('#DE8A00'),70,0,220,volume,"BACK");
	buttons[1] = new Button(windowWidth/8*7,windowHeight/2+windowHeight*0.3,windowWidth/3,windowHeight*0.2,10,margin,color('#089200'),70,0,440,volume,"NEXT");
	buttons[2] = new Button(windowWidth/8,windowHeight/2,windowWidth/3,windowHeight*0.6,10,margin,color('#F52E2E'),70,0,220,volume,"CLICK TO\nDISLIKE IMAGE");
	buttons[3] = new Button(windowWidth/8*7,windowHeight/2,windowWidth/3,windowHeight*0.6,10,margin,color('#5463FF'),70,0,440,volume,"CLICK TO\nLIKE IMAGE");
	
	for(let e = 0;e < buttons.length;e++){
		buttons[e].enableButton();
		buttons[e].enableUserControl();
	}
	getAudioContext().suspend();
	monoSynth = new p5.MonoSynth();

	loadingGif = loadImage("assets/loading.gif");

	let todaysStamp = today.getTime();
	let startStamp = startDate.getTime();

	let range = todaysStamp - startStamp;
	range = ceil(range / multiplier);
}

function draw(){
	background('#616161');
	renderFeatures();

	imageMode(CENTER);
	image(loadingGif,windowWidth/2,windowHeight/2);

	if(fetchedInfo[0]){
		let htmlImage = document.getElementsByTagName("img");
		if(htmlImage.length > 0){
			
			if(htmlImage[0].src != fetchedInfo[1]){
				if(typeof fetchedInfo[1] == 'undefined'){
					fetchedInfo[0] = false;
					fetchApi();
				}else{
					htmlImage[0].remove();
					currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
				}
			}
		}else{
			currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
		}
		currentImage.hide();
		// currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
		image(currentImage,windowWidth/2,windowHeight/2,windowWidth/2-margin,windowHeight/2);
		noFill();
		strokeWeight(7);

		if(mouseIsPressed && fetchedInfo[0] && windowWidth/4 <= mouseX && mouseX <= windowWidth*0.75 && windowWidth/4 <= mouseY && mouseY <= windowWidth *0.75){
			// console.log(true);
			if(typeof fetchedInfo[1] != 'undefined'){
				navigator.clipboard.writeText(fetchedInfo[1]).then(()=>{
					// console.log("Source Copied");
					if(copiedSource != fetchedInfo[1]){
						copiedSource = fetchedInfo[1];
					}
				}).catch(err=>{
					// console.log("error");
				})
			}
		}
		let likeKey = currentDate.getFullYear() + "-" + currentDate.getUTCMonth() + "-" + currentDate.getUTCDate();
		if(typeof likes[likeKey] == 'undefined'){
			stroke(0);
		}else if(likes[likeKey] == -1){
			stroke('#F52E2E');
		}else if(likes[likeKey] == 1){
			stroke('#5463FF');
		}else{
			stroke(0);
		}
		rect(windowWidth/2,windowHeight/2,windowWidth/2-margin,windowHeight/2);
		currentImage.hide();

		textAlign(CENTER,CENTER);
		
		fill(0);
		noStroke();
		strokeWeight(1);
		textSize(20);
		textStyle(BOLD);
		text(fetchedInfo[2] + ": " + fetchedInfo[5],windowWidth/2,windowHeight/2+windowHeight/4+(windowHeight/2-windowHeight/4)*0.3);
		let explanation = split(fetchedInfo[3],".,");
		textSize(10);
		text(explanation[0],windowWidth/2,windowHeight/2+windowHeight/4+(windowHeight/2-windowHeight/4)*0.45,width-margin);
		if(copiedSource != fetchedInfo[1]){
			// console.log(true);
			textSize(20);
			textStyle(BOLD);
			noStroke();
			fill(0);
			strokeWeight(2);
			text("CLICK IMAGE to SHARE!",windowWidth/2,windowHeight/2+windowHeight/4+(windowHeight/2-windowHeight/4)*0.15);
		}else{
			// console.log(false);
			textSize(20);
			textStyle(BOLD);
			noStroke();
			fill('#1F9E40');
			strokeWeight(2);
			text("COPIED!",windowWidth/2,windowHeight/2+windowHeight/4+(windowHeight/2-windowHeight/4)*0.15);
		}	
	}
}

function renderFeatures(){
	for(let i = 0;i < buttons.length;i++){
		buttons[i].render(1,5);
		if(i == 0){
			direction = "back";
			buttons[i].flash(1000,false,fetchApi);
		}else if(i == 1){
			direction = "next";
			buttons[i].flash(1000,false,fetchApi);
		}else if(i == 2){
			buttons[i].flash(1000,false,disLikeImage);
		}else{
			buttons[i].flash(1000,false,likeImage);
		}
	}
	buttons[0].update(windowWidth/8,windowHeight/2+windowHeight*0.3,windowWidth/3,windowHeight*0.2,10,margin);
	buttons[1].update(windowWidth/8*7,windowHeight/2+windowHeight*0.3,windowWidth/3,windowHeight*0.2,10,margin);
	buttons[2].update(windowWidth/8,windowHeight/2,windowWidth/3,windowHeight*0.6,10,margin);
	buttons[3].update(windowWidth/8*7,windowHeight/2,windowWidth/3,windowHeight*0.6,10,margin);
}

function fetchApi(){
	let url = "https://api.nasa.gov/planetary/apod?date=";
	let apiKey = "eBxUdgb3ndh8ififjjN4O2phAzPODRBBkWcVviy2";
	let timeStamp = currentDate.getTime();
	if(direction == "next"){
		timeStamp = currentDate.getTime();
		timeStamp+=multiplier;
	}else if(direction=="back"){
		timeStamp = currentDate.getTime();
		timeStamp-=multiplier;
	}
	let returnDate = new Date(timeStamp);
	currentDate = returnDate;

	if(currentDate < dateRange.min){
		console.log("Cycle to front");
		currentDate = dateRange.max;
		returnDate = dateRange.max;
	}
	if(currentDate > dateRange.max){
		console.log("cycle to back");
		currentDate = dateRange.min;
		returnDate = dateRange.min;
	}
	url += returnDate.getFullYear() + "-" + (returnDate.getUTCMonth() + 1) + "-" + returnDate.getDate() + "&api_key=" + apiKey;

	loadJSON(url,recievedData);
	console.log(url);
}

function recievedData(data){
	fetchedInfo[0] = true;
	fetchedInfo[1] = data.hdurl;
	fetchedInfo[2] = data.title;
	fetchedInfo[3] = data.explanation;
	fetchedInfo[4] = data.copyright;
	fetchedInfo[5] = data.date;
	console.log(fetchedInfo);
}

function windowResized(){
	resizeCanvas(windowWidth,windowHeight);
	margin = map(dist(0,0,windowWidth,windowHeight),0,sqrt(sq(windowWidth)+sq(windowHeight)),0,50);
}

function mousePressed(){
	if(fetchedInfo[0] && windowWidth/4 <= mouseX && mouseX <= windowWidth*0.75 && windowWidth/4 <= mouseY && mouseY <= windowWidth *0.75){
		console.log(true);
		if(typeof fetchedInfo[1] != 'undefined'){
			navigator.clipboard.writeText(fetchedInfo[1]).then(()=>{
				// console.log("Source Copied");
			}).catch(err=>{
				// console.log("error");
			})
		}
	}
}

function likeImage(){
	let key = currentDate.getFullYear() + "-" + currentDate.getUTCMonth() + "-" + currentDate.getUTCDate();
	if(typeof likes[key] == 'undefined'){
		likes[key] = 1;
	}else if(likes[key] == 1){
		delete likes[key];
	}else if(likes[key] == -1){
		likes[key] = 1;
	}
}
function disLikeImage(){
	let key = currentDate.getFullYear() + "-" + currentDate.getUTCMonth() + "-" + currentDate.getUTCDate();
	if(typeof likes[key] == 'undefined'){
		likes[key] = -1;
	}else if(likes[key] == -1){
		delete likes[key];
	}else if(likes[key] == 1){
		likes[key] = -1;
	}
}