// Initialize Turbulenz engine.
(function() {

TurbulenzEngine = WebGLTurbulenzEngine.create({
    canvas: document.getElementById("canvas")
});

})();

// Initialize scale, graphics, and 2d drawing devices.
(function() {

viewWidth = 20;
viewHeight = 12;

graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
draw2D = Draw2D.create({
	graphicsDevice: graphicsDevice
});
draw2D.configure({
	viewportRectangle: [0, 0, viewWidth, viewHeight],
	scaleMode: 'scale'
});

})();

// Input device.
(function() {

inputDevice = TurbulenzEngine.createInputDevice();

inputDevice.addEventListener('mousedown', function( mouseCode, x, y ) {
	console.log("mousedown "+x+" "+y);
});

inputDevice.addEventListener('mouseover', function( x, y ) {
	console.log("mouseover "+x+" "+y);
});

})();

// Initialize physics.
(function() {
	
physDevice = Physics2DDevice.create();
physDebug = Physics2DDebugDraw.create({
    graphicsDevice : graphicsDevice
});
physDebug.setPhysics2DViewport(draw2D.getViewport());

})();



// Create physics world.
(function() {
	
world = physDevice.createWorld({
	gravity: [ 0, 0 ]
});

})();

// Create ball.
(function() {
	
ball = {
	width: 1,
	height: 1,
	position: [ viewWidth/2, viewHeight/2],
	material: physDevice.createMaterial({
		elasticity : 1
	})
};
ball.shape = physDevice.createCircleShape({
    radius : 0.25,
    origin : [0, 0],
    material: ball.material
});
ball.rigidBody = physDevice.createRigidBody({
	type: 'dynamic',
	shapes: [
		ball.shape
	],
    mass: 10,
	position: ball.position,
	linearDrag: 0,
	bullet: true,
});
world.addRigidBody(ball.rigidBody);
ball.rigidBody.applyImpulse([ ball.rigidBody.getMass()*10, 0 ]);

})();

// Create paddleA.
(function() {
	
paddleA = {
	width: 1,
	height: 3,
	position: [ 1.5, viewHeight/2 ],
	goal: { rigidBody: undefined, constraintA: undefined, constraintA: undefined },
	material: physDevice.createMaterial({
		elasticity : 1
	})
};
paddleA.shape = physDevice.createPolygonShape({
	vertices: physDevice.createBoxVertices(paddleA.width, paddleA.height),
	material: paddleA.material
});
paddleA.rigidBody = physDevice.createRigidBody({
	type: 'dynamic',
	shapes: [
		paddleA.shape
	],
	position: paddleA.position
});
world.addRigidBody(paddleA.rigidBody);


paddleA.goal.rigidBody = physDevice.createRigidBody({
    type: 'kinematic',
    position: [5, 5],
});
world.addRigidBody(paddleA.goal.rigidBody);

inputDevice.addEventListener('mouseover', function( x, y ) {
	
	var oldPosition = paddleA.goal.rigidBody.getPosition();
	var newPosition = draw2D.viewportMap(x, y);
	
	var min = 0.75; var max = 5;
	newPosition[0] = newPosition[0] < min ? min : newPosition[0] > max ? max : newPosition[0];
	
	paddleA.goal.rigidBody.setPosition(newPosition);
	
	var movement = [ newPosition[0]-oldPosition[0], newPosition[1]-oldPosition[1] ];
	var distance = Math.pow( Math.pow(movement[0], 2 ) + Math.pow(movement[1], 2 ), 0.5 );
	var angle = Math.atan2( movement[1], movement[0] );
	var rotationDamp = 10;
	var rotation = paddleA.rigidBody.getRotation() + (angle-paddleA.rigidBody.getRotation())/rotationDamp * distance
	paddleA.rigidBody.setRotation(rotation);
	
});

paddleA.goal.constraintA = physDevice.createPointConstraint({
	bodyA: paddleA.goal.rigidBody,
	bodyB: paddleA.rigidBody,
    anchorA : [0, 1],
    anchorB : [0, 1],
	stiff: false,
	maxForce: 1e5
});
world.addConstraint(paddleA.goal.constraintA);

paddleA.goal.constraintB = physDevice.createPointConstraint({
	bodyA: paddleA.goal.rigidBody,
	bodyB: paddleA.rigidBody,
    anchorA : [0, -1],
    anchorB : [0, -1],
	stiff: false,
	maxForce: 1e5
});
world.addConstraint(paddleA.goal.constraintB);


})();

// Create paddleB.


// Walls.
(function() {

(function() {	
wallA = {
	width: 21,
	height: 1,
	position: [ viewWidth/2, 0 ],
	material: physDevice.createMaterial({
		elasticity : 1
	})
};
wallA.shape = physDevice.createPolygonShape({
	vertices: physDevice.createBoxVertices(wallA.width, wallA.height),
	material: wallA.material
});
wallA.rigidBody = physDevice.createRigidBody({
	type: 'static',
	shapes: [
		wallA.shape
	],
	position: wallA.position
});
world.addRigidBody(wallA.rigidBody);
})();

(function() {
wallB = {
	width: 21,
	height: 1,
	position: [ viewWidth/2, viewHeight ],
	material: physDevice.createMaterial({
		elasticity : 1
	})
};
wallB.shape = physDevice.createPolygonShape({
	vertices: physDevice.createBoxVertices(wallB.width, wallB.height),
	material: wallB.material
});
wallB.rigidBody = physDevice.createRigidBody({
	type: 'static',
	shapes: [
		wallB.shape
	],
	position: wallB.position
});
world.addRigidBody(wallB.rigidBody);
})();

(function() {
wallC = {
	width: 1,
	height: 13,
	position: [ 0, viewHeight/2 ],
	material: physDevice.createMaterial({
		elasticity : 1
	})
};
wallC.shape = physDevice.createPolygonShape({
	vertices: physDevice.createBoxVertices(wallC.width, wallC.height),
	material: wallC.material
});
wallC.rigidBody = physDevice.createRigidBody({
	type: 'static',
	shapes: [
		wallC.shape
	],
	position: wallC.position
});
world.addRigidBody(wallC.rigidBody);
})();

(function() {
wallD = {
	width: 1,
	height: 13,
	position: [ viewWidth, viewHeight/2 ],
	material: physDevice.createMaterial({
		elasticity : 1
	})
};
wallD.shape = physDevice.createPolygonShape({
	vertices: physDevice.createBoxVertices(wallD.width, wallD.height),
	material: wallD.material
});
wallD.rigidBody = physDevice.createRigidBody({
	type: 'static',
	shapes: [
		wallD.shape
	],
	position: wallD.position
});
world.addRigidBody(wallD.rigidBody);
})();

})();



// Create and hook base update function.
function update() {
	tick();
	if (graphicsDevice.beginFrame()) {
		graphicsDevice.clear([0.067, 0.067, 0.067, 0.5], 1.0);
		draw();
		graphicsDevice.endFrame();
	}
}
TurbulenzEngine.setInterval(update, 1000 / 60);



// The tick function.
function tick() {
	world.step(1 / 60);
}



// The render function.
function draw() {
	physDebug.setScreenViewport(draw2D.getScreenSpaceViewport());
	physDebug.begin();
	physDebug.drawWorld(world);
	physDebug.end();	
}
