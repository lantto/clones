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
	
	level: 1,
	
	over: false,
	victory: false,
	
	gradient: ['#F4EAD5', '#eee'],
	sameShoulders: false,
	
	colors: [['#F4EAD5', '#eee'], ['#257e36', '#b8f85c'], ['#edc036', '#ed8336'], ['#36edde', '#0d90c1'], ['#d61616', '#d69916'], ['#cd1212', '#d95858'], ['#fdff49', '#82b1ff'], ['#cd1212', '#d95858']],
	
	overlay: {opacity: 0, color: 'black'},
	tip: {duration: 0, message: null},
	
	spawnEntity: function(type, x, y, velX, velY, head, leftShoulder, rightShoulder, currentFrame, ticker) {
		var entity = new type(x, y, velX, velY, head, leftShoulder, rightShoulder, currentFrame, ticker);
		this.entities.push(entity);
		return entity;
	},
	
	removeEntity: function(entity) {
		for (var i = 0; i < this.entities.length; i++) {
			if (this.entities[i] == entity) this.entities.splice(i, 1);
		}
	},
	
	clearEntities: function() {
		this.entities = [];
		this.clones = 0;
		this.humans = 0;
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

function Entity(x, y, velX, velY, head, leftShoulder, rightShoulder, currentFrame, ticker) {

	this.x = x;
	this.y = y;
	
	this.size = 40;
	this.spriteSize = 80;
	
	this.dead = false;
	
	this.head = head;
	this.leftShoulder = leftShoulder;
	this.rightShoulder = rightShoulder;
	
	this.opacity = 1;
	this.opacityModifier = 0;
	
	this.velocity = {x: velX, y: velY};
	
	this.speed = Math.abs(this.velocity.x) + Math.abs(this.velocity.y);
	
	/* this.timeBetweenFrames = 1/fps;
	this.timeSinceLastFrame = this.timeBetweenFrames; */
	
	this.animation = [0, 1, 2, 1, 0, 3, 4, 3];
	this.ticker = ticker;
	
	this.nextFrame = 4 / this.speed + 3; 
	this.currentFrame = currentFrame;
	
	this.angle = 0;
	
	this.draw = function() {
		
		// ctx.save();
		this.ticker++;
		if (this.ticker > this.nextFrame) {
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
	this.dead = true;
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
		deathSound.currentTime = 0;
		deathSound.play();
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
	
	this.framesSinceLastClone = 0;
	this.cloneTime = randomFromTo(1500, 2500);
	
	this.update = function () {
		if (Math.random() > 0.995) {
			this.checkCollisions();
		}	
		
		this.cloneTime++;

		if (Math.random() > 0.999 || this.framesSinceLastClone > this.cloneTime) {
			this.framesSinceLastClone = 0;
			var velX = this.velocity.x * -1;
			var velY = this.velocity.y * -1;
			Game.spawnEntity(Clone, this.x, this.y, velX, velY, this.head, this.leftShoulder, this.rightShoulder, this.currentFrame, this.ticker);
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
		killSound.currentTime = 0;
		killSound.play();
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

var introMusic = new Audio("intro.mp3");
var levelMusic = new Audio("level.mp3");
levelMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

var deathSound = new Audio("death.mp3");
var killSound = new Audio("kill.mp3");

var titleScreenLoop;
var transition;

var mainLoop;

function init() {
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	document.getElementById('loading').style.display = 'none';
	document.getElementById('overlay').style.display = 'block';
	
	clones =  document.getElementById('clones');
	humans =  document.getElementById('humans');
	
	play =  document.getElementById('play');
	
	Game.area.width = canvas.width;
	Game.area.height = canvas.height;
	
	titleScreenLoop = setInterval(titleScreenLoop, 1000 / fps);
	
	introMusic.play();
	
	play.addEventListener('click', function(e) {
		document.getElementById('overlay').style.display = 'none';
		clearInterval(titleScreenLoop);
		ctx.globalAlpha = 0;
		transition = setInterval(transition, 1000 / fps);
	}, false);
	
	document.getElementById('next-level').addEventListener('click', function(e) {
		document.getElementById('victory').style.display = 'none';
		Game.overlay.opacity = 0;
		Game.level++;
		document.getElementById('level').innerHTML = '<p>Level: ' + Game.level + '</p>';
		loadLevel(Game.level);
		document.getElementById('score').style.display = 'block';
		Game.victory = false;
	}, false);
	
	document.getElementById('restart').addEventListener('click', function(e) {
		document.getElementById('game-over').style.display = 'none';
		Game.overlay.opacity = 0;
		document.getElementById('level').innerHTML = '<p>Level: ' + Game.level + '</p>'
		loadLevel(1);
		document.getElementById('score').style.display = 'block';
		Game.over = false;
		levelMusic.currentTime = 0;
		levelMusic.volume = 1;
		levelMusic.play();
	}, false);
	
	function hit(e) {
		if (Game.victory == false && Game.over == false) {
			coords = canvas.relMouseCoords(e);
			canvasX = coords.x;
			canvasY = coords.y;
			for (i=Game.entities.length-1; i>=0; i--) {
				if ((coords.x >= Game.entities[i].x && coords.x <= Game.entities[i].x + Game.entities[i].spriteSize) && (coords.y >= Game.entities[i].y && coords.y <= Game.entities[i].y + Game.entities[i].spriteSize)) {
					if (Game.entities[i].dead == false) {
						Game.entities[i].kill();
					}
					if (Game.entities[i] instanceof Human) {
						Game.overlay.color = 'red';
						Game.overlay.opacity = 1;
					}
					
					break;
				}
			}
		}
	}
	
	canvas.addEventListener('click', function(e) {
		hit(e);
	}, false);
	
	document.getElementById('score').addEventListener('click', function(e) {
		hit(e);
	}, false);
	
	document.getElementById('tip').addEventListener('click', function(e) {
		hit(e);
	}, false);
	
	document.getElementById('level').addEventListener('click', function(e) {
		hit(e);
	}, false);
}

var rgb = 0;
var rgbModifier = 1;

function titleScreenLoop () {
	ctx.fillStyle = 'rgb(' + Math.round(rgb / 16) + ', ' + Math.round(rgb / 4) + ', ' + Math.round(rgb / 16) + ')';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (rgb > 35) {
		rgbModifier *= -1;
	}
	
	if (rgb < 0) {
		rgbModifier *= -1;
	}
	
	rgb += rgbModifier;
}

function transition() {
	ctx.fillStyle = '#fff';
	ctx.globalAlpha += 0.0008;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (introMusic.volume < 0.003) {
		introMusic.pause();
		ctx.globalAlpha = 1;
		clearInterval(transition);
		loadLevel(1);
		document.getElementById('score').style.display = 'block';
		document.getElementById('level').style.display = 'block';
		introMusic.pause();
	} else {
		introMusic.volume -= 0.01;
	}
}

function main() {
	gradientSpan = 0.8;
	
	ctx.globalAlpha = 1;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	gradient.addColorStop(0, Game.gradient[0]);
	gradient.addColorStop(gradientSpan, Game.gradient[1]);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	update();
	render();
	
	if (Game.humans <= 0 && Game.over == false && Game.victory == false) {
		Game.over = true;
		document.getElementById('score').style.display = 'none';
		Game.overlay.color = 'black';
		Game.overlay.opacity = 0.001;
	}
	
	if (Game.clones <= 0 && Game.over == false && Game.victory == false) {
		Game.victory = true;
		document.getElementById('score').style.display = 'none';
		Game.overlay.color = 'white';
		Game.overlay.opacity = 0.001;
	}

	if (Game.overlay.opacity > 0) {
		switch (Game.overlay.color) {
			case 'red':
				Game.overlay.opacity -= 0.005;
				if (Game.overlay.opacity < 0) {
					Game.overlay.opacity = 0;
				}
				break;
			case 'black':
				if (levelMusic.volume < 0.003) {
					clearInterval(mainLoop);
					levelMusic.pause();
				} else {
					levelMusic.volume -= 0.001;
				}
				if (Game.overlay.opacity < 1) {
					Game.overlay.opacity += 0.007;
				}
				if (Game.overlay.opacity > 1) {
					Game.overlay.opacity = 1;
					document.getElementById('game-over').style.display = 'block';
					Game.clearEntities();
				}
				break;
			case 'white':
				if (Game.overlay.opacity < 1) {
					Game.overlay.opacity += 0.02;
				}
				if (Game.overlay.opacity > 1) {
					clearInterval(mainLoop);
					Game.overlay.opacity = 1;
					document.getElementById('victory').style.display = 'block';
					Game.clearEntities();
				}
				break;
		}
		ctx.fillStyle = Game.overlay.color;
		ctx.globalAlpha = Game.overlay.opacity;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	if (Game.tip.message != null) {
		Game.tip.duration--;
		if (Game.tip.duration <= 0) {
			Game.tip.duration = 0;
			document.getElementById('tip').style.display = 'none';
			Game.tip.message = null;
		}
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

function loadLevel(level) {

	Game.tip.duration = 0;
	Game.tip.message = null;

	switch (level) {
		case 1:
			Game.gradient = ['#F4EAD5', '#eee'];
			Game.clones = 1;
			Game.humans = 10;
			Game.sameShoulders = true;
			Game.tip.message = 'TIP: There are two ways to detect a clone: when it kills a human and when it clones itself.';
			Game.tip.duration = 500;
			break;
		case 2:
			Game.gradient = ['#257e36', '#b8f85c'];
			Game.clones = 2;
			Game.humans = 12;
			Game.sameShoulders = true;
			Game.tip.message = 'TIP: There can be multiple types of clones but they will never kill each other.';
			document.getElementById('tip').style.textShadow = "0px 0px 0 black";
			Game.tip.duration = 500;
			break;
		case 3:
			document.getElementById('tip').style.display = 'none';
			Game.gradient = ['#edc036', '#ed8336'];
			Game.clones = 5;
			Game.humans = 5;
			// document.getElementById('tip').style.textShadow = "text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white";
			Game.sameShoulders = true;
			break;
		case 4:
			Game.gradient = ['#36edde', '#0d90c1'];
			Game.clones = 3;
			Game.humans = 20;
			Game.sameShoulders = true;

			break;
		case 5:
			Game.gradient = ['#d61616', '#d69916'];
			Game.clones = 3;
			Game.humans = 40;
			Game.sameShoulders = true;
			break;
		case 6:
			Game.gradient = ['#ffe2e2', '#c5f3c0'];
			Game.clones = 2;
			Game.humans = 15;
			Game.sameShoulders = false;
			break;
		case 7:
			Game.gradient = ['#fdff49', '#82b1ff'];
			Game.clones = 3;
			Game.humans = 25;
			Game.sameShoulders = false;
			break;
		case 8:
			Game.gradient = Game.colors[randomFromTo(0, Game.colors.length-1)];
			Game.clones = 7;
			Game.humans = 7;
			Game.sameShoulders = false;
			break;
		case 9:
			Game.gradient = Game.colors[randomFromTo(0, Game.colors.length-1)];
			Game.clones = 4;
			Game.humans = 60;
			Game.sameShoulders = false;
			break;
		default:
			Game.gradient = Game.colors[randomFromTo(0, Game.colors.length-1)];
			Game.clones = Game.level - 6;
			Game.humans = Game.level * 4;
			Game.sameShoulders = false;
	}
	
	if (Game.tip.duration > 0) {
		document.getElementById('tip').style.display = 'block';
		document.getElementById('tip').innerHTML = '<p>' + Game.tip.message + '</p>';
	}
	
	for (var i=0; i<Game.clones + Game.humans; i++) {
	
		var x = randomFromTo(0, 880);
		var y = randomFromTo(0, 560);
		
		var currentFrame = randomFromTo(-1, 6);
		
		do {
			var velX = randomFromTo(-100, 100);
			var velY = randomFromTo(-100, 100);
		} while((velX < 20 && velX > -20) || (velY < 20 && velX > -20));
		
		velX /= 100;
		velY /= 100;
		
		var duplicate;
		
		do {			
			var head = randomFromTo(0, 6);
			if (Game.sameShoulders) {
				var rand = randomFromTo(0, 6)
				var leftShoulder = rand;
				var rightShoulder = rand;
			} else {
				var leftShoulder = randomFromTo(0, 6);
				var rightShoulder = randomFromTo(0, 6);
			}
				
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
			Game.spawnEntity(Clone, x, y, velX, velY, head, leftShoulder, rightShoulder, currentFrame, 0);
		} else {
			Game.spawnEntity(Human, x, y, velX, velY, head, leftShoulder, rightShoulder, currentFrame, 0);
		}
	}
	
	clones.innerHTML = Game.clones;
	humans.innerHTML = Game.humans;

	mainLoop = setInterval(main, 1000 / fps);
	
	levelMusic.play();

}

// GO!

window.onload = init;