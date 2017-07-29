//constants
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
//state
var widget = test1;
var currentTextbox = "home";
var mousePos = [0,0];
var keyPress = 0;
var infoToggle = false;

/* =-=-=-=-= WIDGETS =-=-=-=-=
All widgets must include a draw() function and an id string consistent with references in html.
*/



class Test1 {
	constructor(x, y, dx, dy) {
		this.id = 'test1';
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
	}

	draw() {
		ctx.fillStyle="green";
		ctx.fillRect(this.x, this.y, 5, 5);

		this.x += this.dx;
		this.y += this.dy;

		if (this.x > canvas.width) {
			this.x -= canvas.width;
		}
		if (this.x < 0) {
			this.x += canvas.width;
		}
		if (this.y > canvas.height) {
			this.y -= canvas.height;
		}
		if (this.y < 0) {
			this.y += canvas.height
		}
	}
}

class GOL {

	constructor() {

		this.id = 'gol';

		//initial density, as a percentage of empty space
		this.density = .66;

		//cells change color over their lifetime
		this.colors = ["rgb(135, 0, 250)", "rgb(80, 65, 255)", "rgb(30, 125, 250)", 
						//violet, blue4, blue3,
						"rgb(0, 185, 225)", "rgb(20, 230, 200)", "rgb(40, 255, 140)", 
						//blue2, blue1, green,
						"rgb(90, 255, 80)", "rgb(185, 230, 0)", "rgb(230, 190, 0)",
						//yellow-green, yellow,
						"rgb(255, 80, 80)", "rgb(250, 0, 135)", "rgb(225, 0, 200)"];
						//orange, red, pink

		this.max = this.colors.length;

		//Cell size, in px.
		this.size = 9; //

		this.width = Math.floor(canvas.width / this.size);
		this.height = Math.floor(canvas.height / this.size);

		//Initialize random grid
		this.grid = new Array(this.width);
		for(let i = 0; i < this.width; i++) {
			this.grid[i] = new Array(this.height);
		}

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				if (Math.random() > this.density) {
					this.grid[x][y] = 1;
				} else {
					this.grid[x][y] = 0;
				}
			}
		};

		//Preset patterns (or stamps). These are meant to showcase certain GOL phenomena.
		this.spaceship = [[1, 1, 1, 0], [1, 0, 0, 1], [1, 0, 0, 0], [1, 0, 0, 0], [0, 1, 0, 1]];
		this.glider = [[1, 0, 0], [1, 0, 1], [1, 1, 0]]
		this.stamps = [this.spaceship, this.glider];
		this.stamp = this.glider;
		this.clickStamp = this.spaceship;
		this.applyClickStamp = false;

		//Initialize preset patterns on a separate priority grid.
		/*
		this.superGrid = new Array(this.width);
		for(let i = 0; i < this.width; i++) {
			this.superGrid[i] = new Array(this.height);
		}

		for(let i = 0; i < 3; i++) {
			let dx = Math.floor((this.width-25)/3)*(i+1);
			let dy = Math.floor((this.height-25)/3)*(i+1);
			for(let x = 0; x < this.stamp.length; x++) {
				for(let y = 0; y < this.stamp[0].length; y++) {
					this.superGrid[x+dx][y+dy] = this.stamp[x][y] * this.max;
				}
			}
		}
		*/
	}

	whenClicked() {
		this.stamp = true;
	}

	draw() {
		//duplicate grid to write to
		var grid2 = new Array(this.width);
		for(let i = 0; i < this.width; i++) {
			grid2[i] = this.grid[i].slice();
		}

		//traverse cells
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				//sum a 9x9 grid around x, y
				let sum = 0;
				for(let i = -1; i < 2; i++) {
					let dx = x + i;
					if(dx >= this.width || dx < 0) {
						//width boundary check
						sum += 0;
					} else {
						for(let j = -1; j < 2; j++) {
							let dy = y + j;
							if(i == 0 && j == 0) {
								//Do not sum cell in question
								continue;
							} else if(dy >= this.height || dy < 0) {
								//height boundary check
								sum += 0;
							} else {
								//the priority grid effects the normal grid, but not vice versa
								sum += ((this.grid[dx][dy] > 0) ? 1 : 0);
							}
						}
					}
				}

				//determine the fate of the cell at x, y based on sum
				if(sum > 1 && sum < 4) {
					//it lives
					if((this.grid[x][y] < this.max && this.grid[x][y] > 0) || sum == 3 && this.grid[x][y] < this.max) {
						grid2[x][y] = Math.min(this.grid[x][y] + 1, this.max-1);
					}
				} else {
					//it dies
					grid2[x][y] = 0;
				}
			}
		}

		let mx = Math.floor(mousePos[0]/this.size);
		let my = Math.floor(mousePos[1]/this.size);

		mx = Math.min(mx, this.width-1);
		my = Math.min(my, this.height-1);

		let sw = this.clickStamp.length;
		let sh = this.clickStamp[0].length;

		//abiogenerate cells along mouse's path
		/*
		if(this.grid[mx][my] < this.max) {
			grid3[mx][my] = this.max;
		}
		*/

		//draw stamp on click
		if(this.stamp) {
			let dx = Math.min(mx+2, this.width-sw-1);
			let dy = Math.min(my+2, this.height-sh-1);
			console.log("stamp2");
			for(let x = 0; x < sw; x++) {
				for(let y = 0; y < sh; y++) {
					grid2[dx+x][dy+y] = this.clickStamp[x][y];
				}
			}
			this.stamp = false;
		}

		//write next grid
		this.grid = grid2;

		//print cells
		for(let x = 0; x < this.width; x++) {
			for(let y = 0; y < this.height; y++) {
				let ax = x * this.size;
				let ay = y * this.size;
				if(this.grid[x][y] > 0) {
					ctx.fillStyle = this.colors[this.grid[x][y]-1];
					ctx.fillRect(ax, ay, this.size, this.size);
				}
			}
		}
	}

	resize() {

	}

	printGrid() {
		for(let x = 0; x < this.width; x++) {
			for(let y = 0; y < this.height; y++) {
				console.log(String(this.grid[x][y]));
			}
			console.log("\n");
		}
	}

}

/* =-=-=-=-= UTILITY FUNCTIONS =-=-=-=-=
*/

function begin(Target, args) {
	infoOff();
	toBegin = new Target(...args);
	widget = toBegin;
}

function initialize() {

	window.addEventListener('resize', resizeCanvas, false);
	function setPos(evt) {
		mousePos[0] = ((typeof evt.clientX != 'undefined') ? evt.clientX : mousePos[0]);
		mousePos[1] = ((typeof evt.clientY != 'undefined') ? evt.clientY : mousePos[1]);
	}
	window.addEventListener('mousemove', setPos);
	window.addEventListener('keydown', function(evt){keyPress = evt.keyCode; console.log(evt.keyCode);});
	window.addEventListener('click', function(){if(typeof widget.whenClicked() === "function") {widget.whenClicked();}});

	document.getElementById("test2").addEventListener("click", function(){begin(Test1, [canvas.width/2 + 10, canvas.height/2 + 10, 2, 2])});
	document.getElementById("test1").addEventListener("click", function(){begin(Test1, [canvas.width/2 + 10, canvas.height/2 + 10, -2, -2])});
	document.getElementById("gol").addEventListener("click", function(){begin(GOL, [])});
	document.getElementById(currentTextbox).style.display = 'block';

	resizeCanvas();
	//begin(Test1, [canvas.width/2 + 10, canvas.height/2 + 10, 2, 2]);
	begin(GOL, []);
}

function reveal(toReveal) {
	if (toReveal == 'none') {
		box = document.getElementById(currentTextbox);
		box.style.display = 'none';
	} else {
		oldbox = document.getElementById(currentTextbox);
		oldbox.style.display = 'none';
		newbox = document.getElementById(toReveal);
		newbox.style.display = 'block';
		currentTextbox = toReveal;
	}
}

function info() {
	infobox = document.getElementById(widget.id + "Info");
	infobutton = document.getElementById("info");
	if(infoToggle) {
		infobox.style.display = 'none';
		infobutton.style.background = "url('icons/qmark.png')";
		infobutton.style.backgroundSize = 'contain';
		infoToggle = false;
	} else {
		infobox.style.display = 'block';
		infobutton.style.background = "url('icons/qmark-inv.png')";
		infobutton.style.backgroundSize = 'contain';
		infoToggle = true;
	}
}

function infoOff() {
	infobox = document.getElementById(widget.id + "Info");
	infobutton = document.getElementById("info");
	infobox.style.display = 'none';
	infobutton.style.background = "url('icons/qmark.png')";
	infobutton.style.backgroundSize = 'contain';
	infoToggle = false;
	//how about this comment
}

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	widget.draw();
	requestAnimationFrame(draw);
}

initialize();
draw();