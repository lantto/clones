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
	}
}

function Entity(x, y) {

	this.x = x;
	this.y = y;

	this.xDirection = 1;
	this.yDirection = 1;
	
	this.update = function() {
		this.x += this.speed * this.xDirection;
		this.y += this.speed * this.yDirection;
	}
	
	this.draw = function() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.size, this.size);
	}
	
	this.kill = function() {
		Game.removeEntity(this);
	}
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