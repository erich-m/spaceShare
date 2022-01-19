let buttons = [];//for storing button objects

let monoSynth;//for sound enabling

let fetchedInfo = [];//for storing fetched api data

let loadingGif;//loading screen animation
let logo;//logo image
let currentImage;//current image from api

let margin = 65;//set margins to initial value of 65

//initialize starting and todays date
let startDate = new Date();
let today = new Date();

//set mutliplier for switching between days
let multiplier = 24*60*60*1000;
let currentDate = new Date();//keep track of current date

let dateRange = {//create range of dates allowed for cycling from high to low and vice versa
	min : new Date('06/20/1995'),
	max : new Date()
}

let volume = 0.7;//set volume to 70%
let copiedSource = "";//if the user copies the image source, the source will be stored here
let copiedStatus = false;//copied status determines if the link has been copied or not

let likes = {};//likes object: date strings are keys that are added and removed on likes and dislikes: the likes are the values associated with each date in the object
let direction = "next";//determines the cycle direction to move in based on buttons

function setup(){
	createCanvas(windowWidth,windowHeight);
	margin = map(dist(0,0,windowWidth,windowHeight),0,sqrt(sq(windowWidth)+sq(windowHeight)),0,50);
	fetchApi();//perform initial apifetch for the first image that is shown
	//set up buttton objects
	buttons[0] = new Button(windowWidth/8,windowHeight/2+windowHeight*0.3,windowWidth/3,windowHeight*0.2,30,margin,color('#DE8A00'),70,0,220,volume,"BACK");
	buttons[1] = new Button(windowWidth/8*7,windowHeight/2+windowHeight*0.3,windowWidth/3,windowHeight*0.2,10,margin,color('#089200'),70,0,440,volume,"NEXT");
	buttons[2] = new Button(windowWidth/8,windowHeight/2,windowWidth/3,windowHeight*0.6,10,margin,color('#F52E2E'),70,0,220,volume,"CLICK TO\nDISLIKE IMAGE");
	buttons[3] = new Button(windowWidth/8*7,windowHeight/2,windowWidth/3,windowHeight*0.6,10,margin,color('#5463FF'),70,0,440,volume,"CLICK TO\nLIKE IMAGE");
	//enable all buttons
	for(let e = 0;e < buttons.length;e++){
		buttons[e].enableButton();
		buttons[e].enableUserControl();
	}
	//audio management
	getAudioContext().suspend();
	monoSynth = new p5.MonoSynth();
	//pull the loading image animation to render on screen
	loadingGif = loadImage("assets/loading.gif");
	logo = loadImage("assets/logo.png");
	//get the start and todays timestamps
	let todaysStamp = today.getTime();
	let startStamp = startDate.getTime();
	//calculate the range
	let range = todaysStamp - startStamp;
	range = ceil(range / multiplier);
}

function draw(){
	background('#616161');
	renderFeatures();//render the buttons

	imageMode(CENTER);
	image(loadingGif,windowWidth/2,windowHeight/2);//draw the loading animation

	if(fetchedInfo[0]){//check the status of the first fetch
		let htmlImage = document.getElementsByTagName("img");//get all images by getting element from tag
		if(htmlImage.length > 0){//if there is an image in the html source
			if(htmlImage[0].src != fetchedInfo[1]){//checks to see if the source is different than the one already loaded
				if(typeof fetchedInfo[1] == 'undefined'){//checks to see if the image source is defined
					fetchedInfo[0] = false;//set the status of the fetch to false
					fetchApi();//fetch again until valid source is found
				}else{//if the source is not undefined, remove the current image and create the new image
					htmlImage[0].remove();
					currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
				}
			}
		}else{//if there is no image in the html source, create a new image to render using the fetched data
			if(typeof fetchedInfo[1] == 'undefined'){//checks to see if the image source is defined
				fetchedInfo[0] = false;//set the status of the fetch to false
				fetchApi();//fetch again until valid source is found
			}else{
				currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
			}
		}
		currentImage.hide();//hide the html version of the image
		// currentImage = createImg(fetchedInfo[1],fetchedInfo[2]);
		image(currentImage,windowWidth/2,windowHeight/2,windowWidth/2-margin,windowHeight/2);//display the image with js command
		noFill();
		strokeWeight(7);
		//if the user clicks on the image, the bounding box for the image is checked with the mouse location. the image source is then directly added the the clipboard
		if(mouseIsPressed && fetchedInfo[0] && windowWidth/2-(windowWidth/2-margin)/2<= mouseX && mouseX <= windowWidth/2+(windowWidth/2-margin)/2 && windowHeight/4 <= mouseY && mouseY <= windowHeight*0.75){
			// console.log(true);
			if(typeof fetchedInfo[1] != 'undefined'){
				navigator.clipboard.writeText(fetchedInfo[1]).then(()=>{//writes the source to the clipboard
					// console.log("Source Copied");
					if(copiedSource != fetchedInfo[1]){//if the fetched source and the current copied source are different, set copy to true
						copiedStatus = true;//set copied status to true
					}
				}).catch(err=>{
					// console.log("error");
				})
			}
		}
		let likeKey = currentDate.getFullYear() + "-" + currentDate.getUTCMonth() + "-" + currentDate.getUTCDate();//generates a key for the like object based on a date string
		if(typeof likes[likeKey] == 'undefined'){//checks if the date exists in the object
			stroke(0);
		}else if(likes[likeKey] == -1){//check the value at the key otherwise for a dislike
			stroke('#F52E2E');
		}else if(likes[likeKey] == 1){//check the value at the key otherwise for a like
			stroke('#5463FF');
		}else{//otherwise, set the stroke to 0
			stroke(0);
		}
		rect(windowWidth/2,windowHeight/2,windowWidth/2-margin,windowHeight/2);//draw border around image
		currentImage.hide();
		/* Render Text to display on the screen including title, date, explanation and copied status */
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
		if(!copiedStatus){
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
			fill('#DE8A00');
			strokeWeight(2);
			text("COPIED!",windowWidth/2,windowHeight/2+windowHeight/4+(windowHeight/2-windowHeight/4)*0.15);
		}	
	}
	imageMode(CENTER);
	image(logo,windowWidth/2,windowHeight/8,windowWidth,windowHeight/8);//render the logo at the top of the screen
}
/**renderFeatures performs rendering, flashing and updating of the buttons in the button array
 */
function renderFeatures(){
	for(let i = 0;i < buttons.length;i++){//render and listen for flash requests for the buttons
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
	//consistenly update the buttons in case of new dimensions of window
	buttons[0].update(windowWidth/8,windowHeight/2+windowHeight*0.3,windowWidth/3,windowHeight*0.2,10,margin);
	buttons[1].update(windowWidth/8*7,windowHeight/2+windowHeight*0.3,windowWidth/3,windowHeight*0.2,10,margin);
	buttons[2].update(windowWidth/8,windowHeight/2,windowWidth/3,windowHeight*0.6,30,margin);
	buttons[3].update(windowWidth/8*7,windowHeight/2,windowWidth/3,windowHeight*0.6,10,margin);
}
/* fetchApi is repsonsible for the fetching from the NASA Photo of the Day API
using a stored date as reference, the function selects a new date to pull from
the date is confirmed to be valid */
function fetchApi(){
	copiedStatus = false;
	let url = "https://api.nasa.gov/planetary/apod?date=";
	let apiKey = "eBxUdgb3ndh8ififjjN4O2phAzPODRBBkWcVviy2";
	let timeStamp = currentDate.getTime();
	if(direction == "next"){//if moving forward, add one day to the current day
		timeStamp = currentDate.getTime();
		timeStamp+=multiplier;
	}else if(direction=="back"){//otherwise, subtract one day
		timeStamp = currentDate.getTime();
		timeStamp-=multiplier;
	}
	let returnDate = new Date(timeStamp);
	currentDate = returnDate;

	if(currentDate < dateRange.min){//check the new date to confirm valid range. if not, set to either max or min if put of range to cycle
		// console.log("Cycle to front");
		currentDate = dateRange.max;
		returnDate = dateRange.max;
	}
	if(currentDate > dateRange.max){
		// console.log("cycle to back");
		currentDate = dateRange.min;
		returnDate = dateRange.min;
	}
	//create the full api request url
	url += returnDate.getFullYear() + "-" + (returnDate.getUTCMonth() + 1) + "-" + returnDate.getDate() + "&api_key=" + apiKey;
	//pull the data from the api with recievedData as the callback function
	loadJSON(url,recievedData);
	// console.log(url);
}

function recievedData(data){//the callback function automatically recieves the api data from the loadJSON command. the properties of the data are stored into fetchedInfo accordingly
	fetchedInfo[0] = true;
	fetchedInfo[1] = data.hdurl;
	fetchedInfo[2] = data.title;
	fetchedInfo[3] = data.explanation;
	fetchedInfo[4] = data.copyright;
	fetchedInfo[5] = data.date;
	// console.log(fetchedInfo);
}
//Listens for windowResizing events to readjust windowSize and margins (margins are dependant on windowSize)
function windowResized(){
	resizeCanvas(windowWidth,windowHeight);
	margin = map(dist(0,0,windowWidth,windowHeight),0,sqrt(sq(windowWidth)+sq(windowHeight)),0,50);
}
//function performed by the like image button
//checks the likes object using a key and inverts (or changes the data that is currently stored for the current image)
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
//function performed by the dislike image button
//checks the likes object using a key and inverts (or changes the data that is currently stored for the current image)
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