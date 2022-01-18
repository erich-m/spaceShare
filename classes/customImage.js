class customImage(){
    constructor(id){
        this.id = id;
    }
    render(x,y,w,h,r){
        rect(x,y,w,h,r);//change to display image from api
        text(this.id,x,y);
    }

}