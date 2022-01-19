/* Button Class: reate and render buttons with animated clicks that can perform functions on click */
class Button {
	
	/**Constructor function repsonsible for defining all the initial properties
	 * @param  {center x position} x
	 * @param  {center y position} y
	 * @param  {width of outer box} w
	 * @param  {height of outer box} h
	 * @param  {radius of corners} r
	 * @param  {margins specify the distance between the outer box and the button itself} margin
	 * @param  {base colour} fillColor
	 * @param  {colour offset to calculate the colour to show when flashed} flashColor
	 * @param  {id for tracking} id
	 * @param  {note of sound to be played on click} note
	 * @param  {volume of sound to be played on click} volume
	 * @param  {text to show on the button} textParam
	 */
	constructor(x,y,w,h,r,margin,fillColor,flashColor,id,note,volume,textParam){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.r = r;
		
		this.m = margin;
		
		this.note = note;
		this.v = volume;
		
		this.id = id;
		
        this.textParam = textParam;
		
		this.c = fillColor;
		this.flashColor = color(red(fillColor)-flashColor,green(fillColor)-flashColor,blue(fillColor)-flashColor);//calculate the flash colour
		
		this.flashStatus = false;//is flash on or off
		this.flashTargetTime = 0;//flash to set time
		this.buttonStatus = false;//set status controls
		this.userControl = false;
	}
	/**the render function displays the button set by its properties
	 * @param  {set the stroke size} s
	 * @param  {set the stroke weight} sW
	 */
	render(s,sW){
		strokeWeight(sW);
		stroke(s);
		if(!this.flashStatus){//if the flash status is not on, render normal color
			fill(this.c);
		}else{
			fill(this.flashColor);//otherwise, render with flash color
		}
		rectMode(CENTER);
		rect(this.x,this.y,this.w-3*this.m,this.h-this.m*2,this.r);//render the button
		
        fill(0);
        noStroke();
        textSize(this.w*0.05);
        text(this.textParam,this.x,this.y);//display text on the button
	}
	/**Update function listens for window Resize events and changes the button properties accordingly
	 * @param  {center x position} x
	 * @param  {center y position} y
	 * @param  {width of outer box} w
	 * @param  {height of outer box} h
	 * @param  {radius of button} r
	 * @param  {margins between the outer box and the button} margin
	 */
	update(x,y,w,h,r,margin){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.r = r;
		
		this.m = margin;
	}
	
	/**Flash is responsible for deciding when to flash, and controlling how long to flash
	 * if the parameters enable flashing, the intersection is checked with the mouse, and a flash time is created based off the time the program has been running for (millis())
	 * once the millis() passes a threshold, the flash is disabled
	 * @param  {specifies the length of time the button is flashed for in milliseconds} waitTime
	 * @param  {allows the program to override the flash if needed} flashControl
	 * @param  {updateFunction is a parameter that allows the button to perform an action upon eligable button activation} updateFunction
	 */
	flash(waitTime,flashControl,updateFunction){
		if(this.buttonStatus){//check the status of the button
			if(((mouseIsPressed && this.userControl && this.checkIntersection()) || flashControl) && !this.flashStatus && this.flashTargetTime == 0){//check the userEnable settings, mouse location, and current flash control statuses
				if(mouseIsPressed){//if the mouse is being pressed
					this.flashTargetTime = millis() + (500);//set default flash target threshold
				}else{
					this.flashTargetTime = millis() + (1000 * waitTime);//set flash target theshold for millis() to exceed
				}
				this.flashStatus = true;//set the current flash status to true
				//console.log(this.id);//impusle output on activation
				this.playSynth();//play sound on activation
				if(typeof(updateFunction) == "function"){//runs the function that was passed as a parameter
					updateFunction(this.id);
				}
			}
			if(this.flashStatus && millis() >= this.flashTargetTime){//if the flash is currently enabled and the millis() has exceeded the current threshold for flashing
				this.flashStatus = false;//disable the flash
				this.flashTargetTime = 0;//reset the target threshold
			}
		}
	}
	/**Check intersection verifies the mouse is within the boundary of the button
	 * since the buttons have rounded corners, the central cross area of the button is confirmed first, and then the distances from the mouse to the corners are measured and confirmed as well
	RXR
	XXX
	RXR
	check x locations first
	then check r locations with distance
	*/
	checkIntersection(){
		let outer = {//define the outer boundary of the button
			left : this.x - (this.w-3*this.m)/2,
			right: this.x + (this.w-3*this.m)/2,
			top  : this.y-(this.h-this.m*2)/2,
			bottom : this.y+(this.h-this.m*2)/2
		}
		let inner = {//define the inner boundary of the button
			left : this.x - (this.w-3*this.m)/2 + this.r,
			right: this.x + (this.w-3*this.m)/2 - this.r,
			top  : this.y-(this.h-this.m*2)/2 + this.r,
			bottom : this.y+(this.h-this.m*2)/2 - this.r
		};
		//check inner cross boundaries
		if((outer.left <= mouseX && mouseX <= outer.right && inner.top <= mouseY && mouseY <= inner.bottom) || (inner.left <= mouseX && mouseX <= inner.right && outer.top <= mouseY && mouseY <= outer.bottom)){//check the outer bounds of the button
			return true;
		}else if((dist(mouseX,mouseY,inner.left,inner.top) <= this.r) || (dist(mouseX,mouseY,inner.right,inner.top) <= this.r) || (dist(mouseX,mouseY,inner.left,inner.bottom) <= this.r) || (dist(mouseX,mouseY,inner.right,inner.bottom) <= this.r)){//check inner corner distances to mouse position
			return true;
		}else{
			return false;
		}
	}
	/* status control functions*/ 
	enableButton(){
		this.buttonStatus = true;
	}
	
	disableButton(){
		this.buttonStatus = false;
	}
	
	enableUserControl(){
		this.userControl = true;
	}
	
	disableUserControl(){
		this.userControl = false;
	}
	playSynth(){
		if(this.v){
			userStartAudio();
			monoSynth.play(this.note,this.v,0,0.25);
		}
	}
	updateVolume(){
		this.v = !this.v;
	}
}

