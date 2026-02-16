function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255, 48, 190)
}

function draw() {


//   if (mouseIsPressed === true) {
//   fill(0);
// } else {
//   fill(255);
// }

//white circles drawn at mouse position
    stroke(242, 63, 190)
    strokeWeight(12)
    line(mouseX+4,mouseY+4,mouseX,mouseY);

    strokeWeight(2)
    stroke(255, 137, 87)
//orange
    line(mouseX+4, mouseY+8, windowWidth/1.7,windowHeight/1.7,0,0);

    strokeWeight(12)
    line(mouseX+4,mouseY+4,mouseX+4,mouseY+4);

//pink
    stroke(242, 63, 149)
    strokeWeight(1)
    line(mouseX,mouseY, windowWidth/1.7,windowHeight/1.7,0,0);
    strokeWeight(8)
    stroke(255, 0, 0)
    line(mouseX+2,mouseY+2,mouseX+2,mouseY+2);

//same as bg
    stroke(81, 232, 243)
    strokeWeight(2)
    line(600,windowHeight,windowWidth/1.7,mouseY,0,0);
    strokeWeight(4)
// stroke(255, 255, 255)
    line(mouseX,mouseY,mouseX,mouseY);
}