// Initialize Turbulenz engine.

TurbulenzEngine = WebGLTurbulenzEngine.create({
    canvas: document.getElementById("canvas")
});

// Initialize scale, graphics, and 2d drawing devices.

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

// Initialize physics.

physDevice = Physics2DDevice.create();
physDebug = Physics2DDebugDraw.create({
    graphicsDevice : graphicsDevice
});
physDebug.setPhysics2DViewport([0, 0, viewWidth, viewHeight]);



// Create physics world.

world = physDevice.createWorld({
	gravity: [ 0, 0 ]
});

// Create ball.

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
	position: ball.position,
	linearDrag: 0,
	bullet: true,
});
world.addRigidBody(ball.rigidBody);
ball.rigidBody.applyImpulse([ 5, 0 ]);

// Create paddleA.

paddleA = {
	width: 1,
	height: 3,
	position: [ 1.5, viewHeight/2 ],
	material: physDevice.createMaterial({
		elasticity : 1
	})
};
paddleA.shape = physDevice.createPolygonShape({
	vertices: physDevice.createBoxVertices(paddleA.width, paddleA.height),
	material: paddleA.material
});
paddleA.rigidBody = physDevice.createRigidBody({
	type: 'kinematic',
	shapes: [
		paddleA.shape
	],
	position: paddleA.position
});
world.addRigidBody(paddleA.rigidBody);

// Create paddleA.

paddleB = {
	width: 1,
	height: 3,
	position: [ viewWidth-1.5, viewHeight/2 ],
	material: physDevice.createMaterial({
		elasticity : 1
	})
};
paddleB.shape = physDevice.createPolygonShape({
	vertices: physDevice.createBoxVertices(paddleB.width, paddleB.height),
	material: paddleB.material
});
paddleB.rigidBody = physDevice.createRigidBody({
	type: 'kinematic',
	shapes: [
		paddleB.shape
	],
	position: paddleB.position
});
world.addRigidBody(paddleB.rigidBody);



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
