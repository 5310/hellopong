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
	//console.log("mousedown "+x+" "+y);
});

inputDevice.addEventListener('mouseover', function( x, y ) {
	//console.log("mouseover "+x+" "+y);
});

inputDevice.addEventListener('touchmove', function(touchEvent) {
    //console.log("touchmove");
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
	speedMin: 2,
	speedMax: 5,
	width: 1,
	height: 1,
	mass: 1,
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
    mass: ball.mass,
	position: ball.position,
	linearDrag: 0,
	bullet: true,
});
world.addRigidBody(ball.rigidBody);

ball.spawn = function( side ) {
	ball.rigidBody.setPosition([viewWidth/2, viewHeight/2]);
	ball.rigidBody.setLinearDrag(0);
	ball.rigidBody.setAngularDrag(0);
	ball.rigidBody.setVelocity([0,0]);
	ball.rigidBody.setAngularVelocity(0);
	if ( side !== undefined && side != 0 ) {
		ball.rigidBody.applyImpulse([ ball.mass*10*0.5*side, ball.mass*10*0 ]);
	}
};
ball.spawn(1);

ball.randomizedReflection = function(arbiter) {

	var normal = arbiter.getNormal();
	var normalAngle = Math.atan2(normal[1], normal[0]);

	var strength = ball.mass*2;
	var maxDeviation = Math.PI*0.1;

	var deviationAngle = -1*normalAngle + 2*(Math.random()-0.5)*maxDeviation;
	var deviation = [ Math.cos(deviationAngle)*strength, Math.sin(deviationAngle)*strength ]

	arbiter.bodyA.applyImpulse(deviation);

}
ball.shape.addEventListener('preSolve', ball.randomizedReflection);

ball.dynamicDrag = function() {
	
	var velocity = ball.rigidBody.getVelocity();
	var velocityMagnitude = Math.pow( Math.pow(velocity[0],2)+Math.pow(velocity[1],2), 0.5 );

	if ( ball.speedMin && velocityMagnitude <= ball.speedMin ) {
		ball.rigidBody.setLinearDrag(0.9);
		ball.rigidBody.setAngularDrag(0.9);
		if ( velocityMagnitude <= 0.1 ) {
			//ball.rigidBody.setVelocity([0,0]);
			ball.spawn();
		}
	} else if ( ball.speedMax && velocityMagnitude >= ball.speedMax ) {
		var drag = Math.log(velocityMagnitude*velocityMagnitude)/10;
		ball.rigidBody.setLinearDrag(drag);
		ball.rigidBody.setAngularDrag(drag);
	} else {
		ball.rigidBody.setLinearDrag(0);
		ball.rigidBody.setAngularDrag(0);
		ball.rigidBody.setVelocity([ velocity[0]*1.2, velocity[1]*1.2]);
	}
	
}

})();

// Create paddleA.
(function() {
	
paddleA = {
	health: 6,
	damage: 0,
	width: 0.5,
	height: 3,
	marginMin: 0+0.75,
	marginMax: 0+5,
	rotationSign: 1,
	rotationDamp: 0.1,
	position: [ 0+1.5, viewHeight/2 ],
	mass: 0.5,
	goal: { rigidBody: undefined, constraintA: undefined, constraintA: undefined },
	material: physDevice.createMaterial({
		elasticity : 1000,
		staticFriction: 0,
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
    mass: paddleA.mass,
	position: paddleA.position
});
world.addRigidBody(paddleA.rigidBody);

paddleA.goal.rigidBody = physDevice.createRigidBody({
    type: 'kinematic',
    position: paddleA.position,
});
world.addRigidBody(paddleA.goal.rigidBody);
	
paddleA.move = function( x, y ) {
	
	var oldPosition = paddleA.goal.rigidBody.getPosition();
	var newPosition = draw2D.viewportMap(x, y);

	newPosition[0] = newPosition[0] < paddleA.marginMin ? paddleA.marginMin : newPosition[0] > paddleA.marginMax ? paddleA.marginMax : newPosition[0];
	paddleA.goal.rigidBody.setPosition(newPosition);
	
	var movement = [ newPosition[0]-oldPosition[0], newPosition[1]-oldPosition[1] ];
	var distance = Math.pow( Math.pow(movement[0], 2 ) + Math.pow(movement[1], 2 ), 0.5 );
	var angle = Math.atan2( movement[1], movement[0] );

	var rotation = paddleA.rigidBody.getRotation() + (angle-paddleA.rigidBody.getRotation())*paddleA.rotationDamp * distance * paddleA.rotationSign
	paddleA.rigidBody.setRotation(rotation);
	
};
/*inputDevice.addEventListener('mouseover', function( x, y ) {
	paddleA.move( x, y );
});*/

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

paddleA.addDamage = function() {
	
	paddleA.damage++;
	
	if ( paddleA.damage >= paddleA.health ) {
		return false;
	} else {
		
		var healthRatio = 1 - paddleA.damage/paddleA.health;
		
		//paddleA.rigidBody.shapes[0].scale( 1, healthRatio );
		paddleA.rigidBody.removeShape(paddleA.shape);
		paddleA.shape = physDevice.createPolygonShape({
			vertices: physDevice.createBoxVertices( paddleA.width, paddleA.height*healthRatio ),
			material: paddleA.material
		});
		paddleA.rigidBody.addShape(paddleA.shape);
		
		paddleA.goal.constraintA.setAnchorA([0, 1*healthRatio]);
		paddleA.goal.constraintA.setAnchorB([0, 1*healthRatio]);
		paddleA.goal.constraintB.setAnchorA([0, -1*healthRatio]);
		paddleA.goal.constraintB.setAnchorB([0, -1*healthRatio]);
		
		return true;
		
	}
};

})();

// Create paddleB.
(function() {
	
paddleB = {
	health: 6,
	damage: 0,
	width: 0.5,
	height: 3,
	marginMin: viewWidth-5,
	marginMax: viewWidth-0.75,
	rotationSign: -1,
	rotationDamp: 0.1,
	position: [ viewWidth-1.5, viewHeight/2 ],
	mass: 0.5,
	goal: { rigidBody: undefined, constraintA: undefined, constraintA: undefined },
	material: physDevice.createMaterial({
		elasticity : 1,
		staticFriction: 0,
	})
};
paddleB.shape = physDevice.createPolygonShape({
	vertices: physDevice.createBoxVertices(paddleB.width, paddleB.height),
	material: paddleB.material
});
paddleB.rigidBody = physDevice.createRigidBody({
	type: 'dynamic',
	shapes: [
		paddleB.shape
	],
    mass: paddleB.mass,
	position: paddleB.position
});
world.addRigidBody(paddleB.rigidBody);


paddleB.goal.rigidBody = physDevice.createRigidBody({
    type: 'kinematic',
    position: paddleB.position,
});
world.addRigidBody(paddleB.goal.rigidBody);
	
paddleB.move = function( x, y ) {
	
	var oldPosition = paddleB.goal.rigidBody.getPosition();
	var newPosition = draw2D.viewportMap(x, y);

	newPosition[0] = newPosition[0] < paddleB.marginMin ? paddleB.marginMin : newPosition[0] > paddleB.marginMax ? paddleB.marginMax : newPosition[0];
	paddleB.goal.rigidBody.setPosition(newPosition);
	
	var movement = [ newPosition[0]-oldPosition[0], newPosition[1]-oldPosition[1] ];
	var distance = Math.pow( Math.pow(movement[0], 2 ) + Math.pow(movement[1], 2 ), 0.5 );
	var angle = Math.atan2( movement[1], movement[0] );

	var rotation = paddleB.rigidBody.getRotation() + (angle-paddleB.rigidBody.getRotation())*paddleB.rotationDamp * distance * paddleB.rotationSign
	paddleB.rigidBody.setRotation(rotation);
	
};
/*inputDevice.addEventListener('mouseover', function( x, y ) {
	paddleB.move( x, y );
});*/

paddleB.goal.constraintA = physDevice.createPointConstraint({
	bodyA: paddleB.goal.rigidBody,
	bodyB: paddleB.rigidBody,
    anchorA : [0, 1],
    anchorB : [0, 1],
	stiff: false,
	maxForce: 1e5
});
world.addConstraint(paddleB.goal.constraintA);

paddleB.goal.constraintB = physDevice.createPointConstraint({
	bodyA: paddleB.goal.rigidBody,
	bodyB: paddleB.rigidBody,
    anchorA : [0, -1],
    anchorB : [0, -1],
	stiff: false,
	maxForce: 1e5
});
world.addConstraint(paddleB.goal.constraintB);

paddleB.addDamage = function() {
	
	paddleB.damage++;
	
	if ( paddleB.damage >= paddleB.health ) {
		return false;
	} else {
		
		var healthRatio = 1 - paddleB.damage/paddleB.health;
		
		//paddleB.rigidBody.shapes[0].scale( 1, healthRatio );
		paddleB.rigidBody.removeShape(paddleB.shape);
		paddleB.shape = physDevice.createPolygonShape({
			vertices: physDevice.createBoxVertices( paddleB.width, paddleB.height*healthRatio ),
			material: paddleB.material
		});
		paddleB.rigidBody.addShape(paddleB.shape);
		
		paddleB.goal.constraintA.setAnchorA([0, 1*healthRatio]);
		paddleB.goal.constraintA.setAnchorB([0, 1*healthRatio]);
		paddleB.goal.constraintB.setAnchorA([0, -1*healthRatio]);
		paddleB.goal.constraintB.setAnchorB([0, -1*healthRatio]);
		
		return true;
		
	}
};

})();

// Paddle controls.
(function() {
paddleControl = function ( x, y ) {
	var position = draw2D.viewportMap(x, y);
	if ( position[0] <= 0+7 ) {
		paddleA.move( x, y );
	}
	if ( position[0] >= viewWidth-7 ) {
		paddleB.move( x, y );
	}
};
inputDevice.addEventListener('touchmove', function(touchEvent) {
    var touches = touchEvent.gameTouches;
    for ( var i = 0; i < touches.length; i++ ) {
		var x = touches[i].positionX;
		var y = touches[i].positionY;
		paddleControl( x, y );
	}
});
inputDevice.addEventListener('touchstart', function(touchEvent) {
    var touches = touchEvent.gameTouches;
    for ( var i = 0; i < touches.length; i++ ) {
		var x = touches[i].positionX;
		var y = touches[i].positionY;
		paddleControl( x, y );
	}
});
inputDevice.addEventListener('mouseover', function( x, y ) {
	paddleControl( x, y );
});
})();

// Goaling and stalling.
(function() {
goaling = function() {
	
	var position = ball.rigidBody.getPosition();
	
	if ( position[0] <= 0-1 ) {
		if ( paddleA.addDamage() ) {
			ball.spawn(-1);
		} else {
			ball.spawn();
			
		}
	} else if ( position[0] >= viewWidth+1 ) {
		if ( paddleB.addDamage() ) {
			ball.spawn(1);
		} else {
			ball.spawn();
		}
	}
	
};
})();
	
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
/*
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
*/
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
	
	// Update physics.
	world.step(1 / 60);
	
	// Ball dynamics.
	ball.dynamicDrag();
	
	// Paddle goals.
	goaling();
	
}



// The render function.
function draw() {
	physDebug.setScreenViewport(draw2D.getScreenSpaceViewport());
	physDebug.begin();
	physDebug.drawWorld(world);
	physDebug.end();	
}



// Pan viewport.
function pan( arguments ) {
	
	var viewport = draw2D.getViewport();
	
	if ( arguments.x !== undefined ) {
		var width = viewport[2]-viewport[0];
		viewport[0] = arguments.x;
		viewport[2] = arguments.x + width;
	}
	if ( arguments.y !== undefined ) {
		var height = viewport[3]-viewport[1];
		viewport[1] = arguments.y;
		viewport[3] = arguments.y + width;
	}
	
	viewport[2] = arguments.width !== undefined ? arguments.width : viewport[2];
	viewport[3] = arguments.height !== undefined ? arguments.height : viewport[3];
	
	if ( arguments.dx !== undefined ) {
		for ( var i = 0; i < viewport.length; i+=2 ) {
			viewport[i] -= arguments.dx;
		}
	}
	if ( arguments.dy !== undefined ) {
		for ( var i = 0; i < viewport.length; i+=2 ) {
			viewport[i+1] -= arguments.dy;
		}
	}
	
	draw2D.configure({
		viewportRectangle: viewport,
		scaleMode: 'scale'
	});
	physDebug.setPhysics2DViewport(draw2D.getViewport());
	
}
