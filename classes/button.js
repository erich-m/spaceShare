//Button Class to render and flash buttons on screen
class Button {
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
		this.flashColor = color(red(fillColor)-flashColor,green(fillColor)-flashColor,blue(fillColor)-flashColor);
		
		this.flashStatus = false;//is flash on or off
		this.flashTargetTime = 0;//flash to set time
		this.buttonStatus = false;
		this.userControl = false;
	}
	render(s,sW){
		strokeWeight(sW);
		stroke(s);
		if(!this.flashStatus){
			fill(this.c);
		}else{
			fill(this.flashColor);
		}
		rectMode(CENTER);
		rect(this.x,this.y,this.w-3*this.m,this.h-this.m*2,this.r);
		
        fill(0);
        noStroke();
        textSize(this.w*0.05);
        text(this.textParam,this.x,this.y);
	}
	update(x,y,w,h,r,margin){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.r = r;
		
		this.m = margin;
	}
	flash(waitTime,flashControl,updateFunction){
		if(this.buttonStatus){
			if(((mouseIsPressed && this.userControl && this.checkIntersection()) || flashControl) && !this.flashStatus && this.flashTargetTime == 0){
				if(mouseIsPressed){
					this.flashTargetTime = millis() + (500);
				}else{
					this.flashTargetTime = millis() + (1000 * waitTime);
				}
				this.flashStatus = true;
				//console.log(this.id);//impusle output on activation
				this.playSynth();
				if(typeof(updateFunction) == "function"){
					updateFunction(this.id);
				}
			}
			if(this.flashStatus && millis() >= this.flashTargetTime){
				this.flashStatus = false;
				this.flashTargetTime = 0;
			}
		}
	}
	checkIntersection(){
		let outer = {
			left : this.x - (this.w-3*this.m)/2,
			right: this.x + (this.w-3*this.m)/2,
			top  : this.y-(this.h-this.m*2)/2,
			bottom : this.y+(this.h-this.m*2)/2
		}
		let inner = {
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

