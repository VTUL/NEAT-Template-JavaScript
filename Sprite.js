function Sprite(sheet, x, y, scl, frameWidth, frameHeight) {
    this.sheet = sheet;
    this.scale = scl;
    this.x = x;
    this.y = y;

    this.frameW = frameWidth; // individual frame width
    this.frameH = frameHeight; // individual frame height

    this.frame = 0;
    this.frames = sheet.width / this.frameW; // total number of frames

    this.draw = function() {
        image(
            this.sheet,
            this.x, this.y, this.frameW * this.scale, this.frameH * this.scale, // destination: where and how big to draw
            this.frameW * floor(this.frame), 0,                                  // source: which part of the sheet
            this.frameW, this.frameH                                             // source: frame size
        );

        this.frame += 0.1;
        if (this.frame >= this.frames) {
            this.frame = 0;
        }
    }
}
