function Wall(mapData) {
  this.rows = mapData.length;
  this.cols = mapData[0].length;

  this.platform = mapData.map(row => row.split('')); // convert string rows to array of characters

  this.getElement = function(r, c) {
    return this.platform[r][c];
  };

  this.setElement = function(r, c, e) {
    this.platform[r][c] = e;
  };

  this.getRows = function() {
    return this.rows;
  };

  this.getColumns = function() {
    return this.cols;
  };
}
