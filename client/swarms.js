var canvas = new Elemental.Canvas("game", fullscreen=true);
var viewport = new Elemental.Viewport(canvas);
var game = new Elemental.Game(viewport);

function RandomPastelColor() {
	var color = Elemental.Helpers.RandomColor();
	color.saturation = 80;
	color.value = 255;
	return color;
}

function RandomPosition(xmin, xmax, ymin, ymax) {
	var xpos = Elemental.Helpers.RandomInt(xmin, xmax);
	var ypos = Elemental.Helpers.RandomInt(ymin, ymax);
	return new Elemental.Vector(xpos, ypos);
}

var background_color = RandomPastelColor();

class Swarm {
	constructor(size, controller) {
		this.swarmers = [];
		this.controller = controller;

		for (var i = 0; i < size; i++) {
			var swarmer = new Elemental.Rigidbody(RandomPosition(-10, 10, -10, 10));
			swarmer.sprite = new Elemental.Sprite.Points([
				new Elemental.Vector(0, 0),
				new Elemental.Vector(10, 0),
				new Elemental.Vector(5, 20)
			], {
				center: new Elemental.Vector(5, 0),
				lineWidth: 0,
				fillColor: RandomPastelColor()
			});
			swarmer.sprite.fillColor.value = 180;
			swarmer.friction = 0.95;
			this.swarmers.push(swarmer);
		}
	}

	frame(game) {
		var parent = this;
		this.swarmers.forEach(function(swarmer) {
			parent.controller(parent, swarmer, game);
		});
	}

	draw(game) {
		this.swarmers.forEach(function(swarmer) {
			swarmer.sprite.rotation = swarmer.rotation;
			game.viewport.drawSprite(swarmer.sprite, swarmer.posn);
		});
	}
}

function UserController(swarm, swarmer, game) {
	var mousePos = game.viewport.canvasToWorld(game.mousePos)
	var angle = Elemental.Helpers.AngleBetween(mousePos, swarmer.posn) - 90;
	swarmer.rotation = angle;

	var toMouse = Elemental.Helpers.StepBetween(mousePos, swarmer.posn);

	if (game.mouseHeld(Elemental.Mousecodes.RIGHT)) toMouse = Elemental.Vector.Multiply(toMouse, -1);
	if (game.mousePressed(Elemental.Mousecodes.LEFT)) toMouse = Elemental.Vector.Multiply(toMouse, 10);

	toMouse = Elemental.Vector.Multiply(toMouse, 1);

	swarmer.addForce(toMouse);

	var repulses = [];
	swarm.swarmers.forEach(function(compare) {
		var dist = Elemental.Helpers.DistanceBetween(swarmer.posn, compare.posn);
		if (dist < 2 && compare != swarmer) {
			var repulse = Elemental.Helpers.StepBetween(swarmer.posn, compare.posn);
			repulse = Elemental.Vector.Multiply(repulse, -5);
			repulses.push(repulse);
		}
	});

	repulses.forEach(function(repulse) {
		swarmer.addForce(repulse);
	});

	swarmer.logic();
}

var swarm = new Swarm(500, UserController);

game.start(function() {
	viewport.drawFill(background_color);

	swarm.frame(game);
	swarm.draw(game);
});
