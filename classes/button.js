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
		if((-this.w/2+this.x <= mouseX && mouseX < (this.w/2+this.x)) && (-this.h/2+this.y <= mouseY && mouseY < (this.h/2+this.y))){//check outer bounds of button
			//set up inner bounds
			let topLeft = [-this.w/2+this.x-this.r,-this.h/2+this.y-this.r];//top left corner of inner bound
			let topRight = [this.w/2+this.x-this.r,-this.h/2+this.y-this.r];//top right corner of inner bound
			let bottomLeft = [-this.w/2+this.x-this.r,this.h/2+this.y-this.r];//bottom left of inner bound
			let bottomRight = [this.x/2+this.x-this.r,this.y/2+this.y-this.r];//bottom right of inner bound
			
			if((topLeft[0] <= mouseX && mouseX <= topRight[0]) || (topLeft[1] <= mouseY && mouseY <= bottomRight[1])){//check inner bounds
				return true;
			}else{
				//check radial bounds
				if(dist(mouseX,mouseY,topLeft[0],topLeft[1]) <= this.r || dist(mouseX,mouseY,topRight[0],topRight[1]) <= this.r || dist(mouseX,mouseY,bottomLeft[0],bottomLeft[1]) <= this.r || dist(mouseX,mouseY,bottomRight[0],bottomRight[1]) <= this.r){
					return true;
				}else{
					return false;
				}
			}
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

