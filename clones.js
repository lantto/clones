// Framework

Game = {
	global: window,
	entities: new Array(),
	
	spawnEntity: function(type, x, y) {
		var entity = new type(x, y);
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

function Entity(x, y) {

	this.x = x;
	this.y = y;

	this.xDirection = 1;
	this.yDirection = 1;
	
	this.draw = function() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.size, this.size);
	}
	
	this.kill = function() {
		Game.removeEntity(this);
	}

	this.collide = function(entity) {
		// default is no action
	}
}

Entity.prototype.update = function() {
	this.x += this.speed * this.xDirection;
	this.y += this.speed * this.yDirection;
}

// Game objects (entities)

function Human() {
	
	Entity.apply(this, arguments); // pass constructor arguments to parent

	this.color = "#000";
	this.speed = 0;
	this.hp = 100;
	this.size = 10;
	
}

Human.prototype = new Entity;

function Clone() {

	Entity.apply(this, arguments); // pass constructor arguments to parent

	this.color = "#ff0000";
	this.speed = 1;
	this.xDirection = 0;
	this.hp = 100;
	this.size = 10;
	
	this.update = function () {
		this.checkCollisions();
		Entity.prototype.update.call(this);
	}
	
	this.checkCollisions = function () {
		for (i=0; i<Game.entities.length; i++) {
			if ((this.x >= Game.entities[i].x - this.size && this.x <= Game.entities[i].x + Game.entities[i].size) && (this.y >= Game.entities[i].y - this.size && this.y <= Game.entities[i].y + Game.entities[i].size)) {
				if (Game.entities[i] !== this) {
					// COLLISION
				}
			}
		}
	}
}

Clone.prototype = new Entity;

// Main game loop

var canvas;
var ctx;

function init() {

	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	Game.spawnEntity(Human, 400, 100);
	Game.spawnEntity(Clone, 400, 20);

	setInterval(main, 16);

}

function main() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	update();
	render();
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