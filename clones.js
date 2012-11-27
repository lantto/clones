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
	humans: 0,
	
	overlay: {opacity: 0, color: '#000'},
	
	spawnEntity: function(type, x, y, velX, velY, head, leftShoulder, rightShoulder) {
		var entity = new type(x, y, velX, velY, head, leftShoulder, rightShoulder);
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

function Entity(x, y, velX, velY, head, leftShoulder, rightShoulder) {

	this.x = x;
	this.y = y;
	
	this.size = 40;
	this.spriteSize = 80;
	
	this.head = head;
	this.leftShoulder = leftShoulder;
	this.rightShoulder = rightShoulder;
	
	this.opacity = 1;
	this.opacityModifier = 0;
	
	this.velocity = {x: velX, y: velY};
	
	/* this.timeBetweenFrames = 1/fps;
	this.timeSinceLastFrame = this.timeBetweenFrames; */
	
	this.animation = [0, 1, 2, 1, 0, 3, 4, 3];
	this.ticker = 0;
	this.currentFrame = 0;
	
	this.angle = 0;
	
	this.draw = function() {
		
		// ctx.save();
		this.ticker++;
		if (this.ticker > 5) {
			this.currentFrame++;
			this.ticker = 0;
			if (this.currentFrame >= this.animation.length) {
				this.currentFrame = 0;
			}
		}
		
		ctx.save();
		
		ctx.translate(this.x + this.size/2, this.y + this.size/2);
		
		// this.angle = this.velocity.x 

		
		// ctx.rotate(this.velocity.x / this.velocity.y * -1);
		this.angle = (Math.atan2(this.velocity.y, this.velocity.x)) * 180 / Math.PI - 90;
		ctx.rotate(this.angle * Math.PI / 180);
		
		ctx.globalAlpha = this.opacity;
		
		var xy = -(this.spriteSize/2);
		
		ctx.drawImage(ss, 80 * this.animation[this.currentFrame], 240, this.spriteSize, this.spriteSize, xy, xy, this.spriteSize, this.spriteSize);
		ctx.drawImage(ss, 80 * this.leftShoulder, 0, this.spriteSize, this.spriteSize, xy, xy, this.spriteSize, this.spriteSize);
		ctx.drawImage(ss, 80 * this.rightShoulder, 80, this.spriteSize, this.spriteSize, xy, xy, this.spriteSize, this.spriteSize);
		ctx.drawImage(ss, 80 * this.head, 160, this.spriteSize, this.spriteSize, xy, xy, this.spriteSize, this.spriteSize);
		
		ctx.restore();
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
	
	this.speed = 3;
	
	this.kill = function(slow) {
		Game.humans--;
		humans.innerHTML = Game.humans;
		Entity.prototype.kill.call(this);
	}
}

Human.prototype = new Entity;

function Clone() {

	Entity.apply(this, arguments); // pass constructor arguments to parent

	this.hp = 100;
	
	this.speed = 4;
	
	this.update = function () {
		if (Math.random() > 0.995) {
			this.checkCollisions();
		}	
		
		if (Math.random() > 0.999) {
			var velX = this.velocity.x * -1;
			var velY = this.velocity.y * -1;
			Game.spawnEntity(Clone, this.x, this.y, velX, velY, this.head, this.leftShoulder, this.rightShoulder);
			Game.clones++;
			clones.innerHTML = Game.clones;
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
		clones.innerHTML = Game.clones;
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

var clones;
var humans;

var ss = new Image();
ss.src = "spritesheet.png";

function init() {

	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	clones =  document.getElementById('clones');
	humans =  document.getElementById('humans');
	
	Game.area.width = canvas.width;
	Game.area.height = canvas.height;
	Game.clones = 3;
	Game.humans = 25;
	
	clones.innerHTML = Game.clones;
	humans.innerHTML = Game.humans;
	
	for (var i=0; i<Game.clones + Game.humans; i++) {
	
		var x = randomFromTo(0, 880);
		var y = randomFromTo(0, 560);
		
		do {
			var velX = randomFromTo(-1, 1);
			var velY = randomFromTo(-1, 1);
		} while(velX == 0 || velY == 0);
		
		var duplicate;
		
		do {			
			var head = randomFromTo(0, 6);
			var leftShoulder = randomFromTo(0, 6);
			var rightShoulder = randomFromTo(0, 6);
				
			for (i=0; i<Game.entities.length; i++) {
				if (Game.entities[i].head == head && Game.entities[i].leftShoulder == leftShoulder && Game.entities[i].rightShoulder == rightShoulder) {
					duplicate = true;
					break;
				} else {
					duplicate = false;
				}
			}
		} while (duplicate);
		
		if (i<Game.clones) {
			Game.spawnEntity(Clone, x, y, velX, velY, head, leftShoulder, rightShoulder);
		} else {
			Game.spawnEntity(Human, x, y, velX, velY, head, leftShoulder, rightShoulder);
		}
	}
	
    canvas.addEventListener('click', function(e) {
		coords = canvas.relMouseCoords(e);
		canvasX = coords.x;
		canvasY = coords.y;
		for (i=Game.entities.length-1; i>=0; i--) {
			if ((coords.x >= Game.entities[i].x && coords.x <= Game.entities[i].x + Game.entities[i].spriteSize) && (coords.y >= Game.entities[i].y && coords.y <= Game.entities[i].y + Game.entities[i].spriteSize)) {
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
	/* var thisFrame = new Date().getTime();
	var dt = (thisFrame - this.lastFrame)/1000;
	this.lastFrame = thisFrame; */
	
	for (x in Game.entities) {
		Game.entities[x].draw();
	}
}

// GO!

window.onload = init;