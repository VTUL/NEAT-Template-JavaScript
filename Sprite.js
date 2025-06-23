function Sprite(sheet, w, h, frameCount) {
    this.sheet = sheet;
    this.w = w; //displayed width
    this.h = h; //displayed height
    this.frameCount = frameCount; //frames in sheet

    this.frameWidth = this.sheet.width / this.frameCount;
    this.frameHeight = this.sheet.height;

    this.frame = 0;

    this.draw = function() {
        image(
            this.sheet,
            0, 0, this.w, this.h,                          
            this.frameWidth * floor(this.frame), 0,         
            this.frameWidth, this.frameHeight               
        );

        //animate
        this.frame += 0.1; 
        if (this.frame >= this.frameCount) {
            this.frame = 0;
        }
    }
}
