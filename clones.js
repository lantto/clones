// Utils

function randomFromTo(from, to) {
	return Math.floor(Math.random() * (to - from + 1) + from);
}

function relMouseCoords(event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    } while(currentElement = currentElement.offsetParent);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return { x:canvasX, y:canvasY }
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

// Framework

Game = {
	global: window,
	entities: new Array(),
	area: {width: 0, height: 0},
	clones: 0,
	
	overlay: {opacity: 0, color: '#000'},
	
	spawnEntity: function(type, x, y, velX, velY, shape, color, face) {
		var entity = new type(x, y, velX, velY, shape, color, face);
		this.entities.push(entity);
		return entity;
	},
	
	removeEntity: function(entity) {
		for (var i = 0; i < this.entities.length; i++) {
			if (this.entities[i] == entity) this.entities.splice(i, 1);
		}
	},
	
 	checkCollisions: function() {
		for (i=0; i<this.entities.length; i++) {
			for (j=i+1; j<this.entities.length; j++) {
				if ((this.entities[i].x >= this.entities[j].x - this.entities[i].size && this.entities[i].x <= this.entities[j].x + this.entities[j].size) && (this.entities[i].y >= this.entities[j].y - this.entities[i].size && this.entities[i].y <= this.entities[j].y + this.entities[j].size)) {
					this.entities[i].collide(this.entities[j]);
					this.entities[j].collide(this.entities[i]);
				}
			}
		}
	}
}

function Entity(x, y, velX, velY, shape, color, face) {

	this.x = x;
	this.y = y;
	this.shape = shape;
	this.color = color;
	this.face = face;
	
	this.opacity = 1;
	this.opacityModifier = 0;
	
	this.velocity = {x: velX, y: velY};
	
	this.draw = function() {
		
		// ctx.save();
		
		ctx.globalAlpha = this.opacity;
		
		ctx.fillStyle = this.color;
		ctx.strokeStyle = '#000';
		
		switch(this.shape) {
			case 1:
				ctx.fillRect(this.x, this.y, this.size, this.size);
				ctx.strokeRect(this.x, this.y, this.size, this.size);
				break;
			case 2:
				ctx.beginPath();
				ctx.moveTo(this.x + this.size/3, this.y);
				ctx.lineTo(this.x + this.size/3*2, this.y);
				ctx.lineTo(this.x + this.size, this.y + this.size/3);
				ctx.lineTo(this.x + this.size, this.y + this.size/3*2);
				ctx.lineTo(this.x + this.size/3*2, this.y + this.size);
				ctx.lineTo(this.x + this.size/3, this.y + this.size);
				ctx.lineTo(this.x, this.y + this.size/3*2);
				ctx.lineTo(this.x, this.y + this.size/3);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case 3:
				ctx.beginPath();
				ctx.arc(this.x+this.size/2, this.y+this.size/2, this.size/2, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case 4:
				ctx.beginPath();
				ctx.moveTo(this.x + this.size/2, this.y);
				ctx.lineTo(this.x + this.size, this.y + this.size/2);
				ctx.lineTo(this.x + this.size/2, this.y + this.size);
				ctx.lineTo(this.x, this.y + this.size/2);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
			case 5:
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.x + this.size - 10, this.y + 10);
				ctx.lineTo(this.x + this.size, this.y + this.size);
				ctx.lineTo(this.x + 10, this.y + this.size - 25);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				break;
		}
	
		switch(this.face) {
			case 1:
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.arc(this.x+this.size/2,this.y+this.size/2,10,0,Math.PI*2,true);
				ctx.closePath();
				ctx.stroke();
				break;
			case 2:
				ctx.strokeRect(this.x+this.size/2-8, this.y+this.size/2-8, 16, 16);
				break;
			case 3:
				ctx.beginPath();
				ctx.arc(this.x+this.size/2-4,this.y+this.size/2,2,0,Math.PI*2,true);
				ctx.closePath();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(this.x+this.size/2,this.y+this.size/2,2,0,Math.PI*2,true);
				ctx.closePath();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(this.x+this.size/2+4,this.y+this.size/2,2,0,Math.PI*2,true);
				ctx.closePath();
				ctx.stroke();
				break;
		}
		
		// ctx.restore();
	}

	this.collide = function(entity) {
		// default is no action
	}
}

Entity.prototype.update = function() {
	this.x += this.velocity.x;
	this.y += this.velocity.y;

	if (this.x >= Game.area.width - this.size) {
		this.x = Game.area.width - this.size;
		this.velocity.x *= -1;
	} else if (this.x <= 0) {
		this.x = 0;
		this.velocity.x *= -1;
	}
	
	if (this.y >= Game.area.height - this.size) {
		this.y = Game.area.height - this.size;
		this.velocity.y *= -1;
	} else if (this.y <= 0) {
		this.y = 0;
		this.velocity.y *= -1;
	}
	
	this.opacity -= this.opacityModifier;
	
	if (this.opacity <= 0) {
		Game.removeEntity(this);
	}
}

Entity.prototype.kill = function(slow) {
	if (slow) {
		this.opacityModifier = 0.009;
	} else {
		this.opacityModifier = 0.1;
	}
}

// Game objects (entities)

function Human() {
	
	Entity.apply(this, arguments); // pass constructor arguments to parent
	
	this.hp = 100;
	this.size = 64;
	
	this.speed = 3;
}

Human.prototype = new Entity;

function Clone() {

	Entity.apply(this, arguments); // pass constructor arguments to parent

	this.hp = 100;
	this.size = 64;
	
	this.speed = 4;
	
	this.update = function () {
		if (Math.random() > 0.995) {
			this.checkCollisions();
		}	
		
		if (Math.random() > 0.999) {
			var velX = this.velocity.x * -1;
			var velY = this.velocity.y * -1;
			Game.spawnEntity(Clone, this.x, this.y, velX, velY, this.shape, this.color, this.face);
			Game.clones++;
			score.innerHTML = Game.clones;
		}					
		Entity.prototype.update.call(this);
	}
	
	this.checkCollisions = function () {
		for (i=0; i<Game.entities.length; i++) {
			if ((this.x >= Game.entities[i].x - this.size && this.x <= Game.entities[i].x + Game.entities[i].size) && (this.y >= Game.entities[i].y - this.size && this.y <= Game.entities[i].y + Game.entities[i].size)) {
				if (Game.entities[i] !== this && Game.entities[i] instanceof Human) {
					Game.entities[i].kill(true);
					break;
				}
			}
		}
	}
	
	this.kill = function(slow) {
		Game.clones--;
		score.innerHTML = Game.clones;
		Entity.prototype.kill.call(this);
	}
}

Clone.prototype = new Entity;

// Main game loop

const fps = 60;
var canvas;
var ctx;
var gradientSpan = 0;
var gradientIncrease = 0.001;

var score;

function init() {

	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	score =  document.getElementById('score');
	
	Game.area.width = canvas.width;
	Game.area.height = canvas.height;
	Game.clones = 3;
	
	score.innerHTML = Game.clones;
	
	var colors = new Array();
	colors[0] = "#6FBF4D";
	colors[1] = "#79BD9A";
	colors[2] = "#0B486B";
	colors[3] = "#EDC951";
	colors[4] = "#CC333F";
	colors[5] = "#6A4A3C";
	
	for (var i=0; i<28; i++) {
	
		var x = randomFromTo(0, 928);
		var y = randomFromTo(0, 608);
		
		do {
			var velX = randomFromTo(-1, 1);
			var velY = randomFromTo(-1, 1);
		} while(velX == 0 || velY == 0);
		
		var duplicate;
		
		do {
			var shape = randomFromTo(1, 4);
			var color = randomFromTo(0, 5);
			var face = randomFromTo(1, 2);
			for (i=0; i<Game.entities.length; i++) {
				if (Game.entities[i].shape == shape && Game.entities[i].color == colors[color] && Game.entities[i].face == face) {
					duplicate = true;
					break;
				} else {
					duplicate = false;
				}
			}
		} while (duplicate);
		if (i<Game.clones) {
			Game.spawnEntity(Clone, x, y, velX, velY, shape, colors[color], face);
		} else {
			Game.spawnEntity(Human, x, y, velX, velY, shape, colors[color], face);
		}
	}
	
    canvas.addEventListener('click', function(e) {
		coords = canvas.relMouseCoords(e);
		canvasX = coords.x;
		canvasY = coords.y;
		for (i=Game.entities.length-1; i>=0; i--) {
			if ((coords.x >= Game.entities[i].x && coords.x <= Game.entities[i].x + Game.entities[i].size) && (coords.y >= Game.entities[i].y && coords.y <= Game.entities[i].y + Game.entities[i].size)) {
				Game.entities[i].kill();
				if (Game.entities[i] instanceof Human) {
					Game.overlay.color = 'red';
					Game.overlay.opacity = 1;
				}
				
				break;
			}
		}
    }, false);

	setInterval(main, 1000 / fps);

}

function main() {
	gradientSpan = 0.8;
	/* gradientSpan += gradientIncrease;
	
	if (gradientSpan >= 1) {
		gradientSpan = 1;
		gradientIncrease *= -1;
	} else if (gradientSpan <= 0) {
		gradientSpan = 0;
		gradientIncrease *= -1;
	} */
	
	ctx.globalAlpha = 1;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	gradient.addColorStop(0, '#F4EAD5');
	gradient.addColorStop(gradientSpan, '#fff');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	update();
	render();
	
	if (Game.overlay.opacity > 0) {
		Game.overlay.opacity -= 0.005;
		if (Game.overlay.opacity < 0) {
			Game.overlay.opacity = 0;
		}
		ctx.fillStyle = Game.overlay.color;
		ctx.globalAlpha = Game.overlay.opacity;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
}

function update() {
	for (x in Game.entities) {
		Game.entities[x].update();
	}
}

function render() {
	for (x in Game.entities) {
		Game.entities[x].draw();
	}
}

// GO!

window.onload = init;