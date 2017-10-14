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

var background = RandomPastelColor();

class Swarmer {
	constructor() {
		this.rigid = new Elemental.Rigidbody(Elemental.Vector.Empty);
		this.rigid.friction = 0.95;

		this.sprite = new Elemental.Sprite.Points([
			new Elemental.Vector(0, 0),
			new Elemental.Vector(10, 0),
			new Elemental.Vector(5, 20)
		], {
			center: new Elemental.Vector(5, 0),
			lineWidth: 0,
			fillColor: RandomPastelColor()
		});
		this.sprite.fillColor.value = 180;
	}
}

class Swarm {
	constructor(size) {
		this.swarmers = [];

		for (var i = 0; i < size; i++) {
			var swarmer = new Swarmer();
			console.log(swarmer.rigid.velocity);
			this.swarmers.push(swarmer);
		}
	}

	frame(game) {
		// console.log(this.swarmers[0].rigid.posn);
		var parent = this;
		this.swarmers.forEach(function(swarmer) {
			var mousePos = game.viewport.canvasToWorld(game.mousePos)
			var angle = Elemental.Helpers.AngleBetween(mousePos, swarmer.rigid.posn) - 90;
			swarmer.sprite.rotation = angle;

			var toMouse = Elemental.Helpers.StepBetween(mousePos, swarmer.rigid.posn);

			if (game.mouseHeld(Elemental.Mousecodes.RIGHT)) toMouse = Elemental.Vector.Multiply(toMouse, -1);
			if (game.mousePressed(Elemental.Mousecodes.LEFT)) toMouse = Elemental.Vector.Multiply(toMouse, 10);

			toMouse = Elemental.Vector.Multiply(toMouse, 1);

			swarmer.rigid.addForce(toMouse);

			var repulses = [];
			parent.swarmers.forEach(function(compare) {
				debugger;
				console.log(compare, repulses);
				var dist = Elemental.Helpers.DistanceBetween(swarmer.rigid.posn, compare.rigid.posn);
				if (dist < 2 && parent != swarmer) {
					console.log(swarmer.rigid.posn, compare.rigid.posn);
					var repulse = Elemental.Helpers.StepBetween(swarmer.rigid.posn, compare.rigid.posn);
					repulse = Elemental.Vector.Multiply(repulse, -5);
					repulses.push(repulse);
				}
			});

			repulses.forEach(function(repulse) {
				console.log(repulse);
				debugger;
				swarmer.rigid.addForce(repulse);
			});

			swarmer.rigid.logic();
		});
	}

	draw(game) {
		this.swarmers.forEach(function(swarmer) {
			game.viewport.drawSprite(swarmer.sprite, swarmer.rigid.posn);
		});
	}
}

var swarm = new Swarm(10);

game.start(function() {
	viewport.drawFill(background);

	swarm.frame(game);
	swarm.draw(game);
});
