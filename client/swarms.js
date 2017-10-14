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
	constructor(posn) {
		this.rigid = new Elemental.Rigidbody();
		this.rigid.posn = posn;
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

	draw(game) {
		game.viewport.drawSprite(this.sprite, this.rigid.posn);
	}

	frame(game) {
		var mousePos = game.viewport.canvasToWorld(game.mousePos)
		var angle = Elemental.Helpers.AngleBetween(mousePos, this.rigid.posn) - 90;
		this.sprite.rotation = angle;

		var toMouse = Elemental.Helpers.StepBetween(mousePos, this.rigid.posn);
		if (game.mouseHeld(Elemental.Mousecodes.RIGHT)) toMouse = Elemental.Vector.Multiply(toMouse, -1);
		if (game.mousePressed(Elemental.Mousecodes.LEFT)) toMouse = Elemental.Vector.Multiply(toMouse, 10);

		this.rigid.addForce(toMouse);

		var parent = this;
		var repulses = [];
		swarmers.forEach(function(swarmer) {
			var dist = Elemental.Helpers.DistanceBetween(parent.rigid.posn, swarmer.rigid.posn);
			if (dist < 2 && parent != swarmer) {
				var repulse = Elemental.Helpers.StepBetween(parent.rigid.posn, swarmer.rigid.posn);
				repulse = Elemental.Vector.Multiply(repulse, -5);
				repulses.push(repulse);
			}
		});

		repulses.forEach(function(repulse) {
			parent.rigid.addForce(repulse);
		})

		this.rigid.logic();
	}
}

var swarmers = [];

for(var i = 0; i < 600; i++){
	swarmers.push(new Swarmer(RandomPosition(-300, 300, -300, 300)));
}


game.start(function() {
	viewport.drawFill(background);

	swarmers.forEach(function(swarmer) {
		swarmer.frame(game);
		swarmer.draw(game);
	});
});
