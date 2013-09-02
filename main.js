TurbulenzEngine = WebGLTurbulenzEngine.create({
    canvas: document.getElementById("canvas")
});

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

physDevice = Physics2DDevice.create();
physDebug = Physics2DDebugDraw.create({
    graphicsDevice : graphicsDevice
});
physDebug.setPhysics2DViewport([0, 0, viewWidth, viewHeight]);



function update() {
	tick();
	if (graphicsDevice.beginFrame()) {
		graphicsDevice.clear([0.067, 0.067, 0.067, 0.5], 1.0);
		draw()
		graphicsDevice.endFrame();
	}
}
TurbulenzEngine.setInterval(update, 1000 / 60);



function tick() {
	
}



function draw() {
	
}
