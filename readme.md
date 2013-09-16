Hello Pong
==========

Is a barebones project to learn the Turbulenz API and build process.

It's a more physica version of good ol' pong, truly the "hello world" of game development in my view. Deal with it.

The game is playable at the moment:

-	The game starts with an empty field.
-	Each side of the field can be interacted by players to spawn the paddles.
-	When both paddles are up, the ball is spawned.
-	From here on, it's Pong. Seriously, figure it out.
-	Each players have six lives. Losing a goal reduces lives and shrinks their paddle (heheh).
-	The game runs on a loop if a player wins.

It runs on a browser with a single mouse if you want to play with/against yourself (or fight over the mouse), and also on Android with the Turbulenz player currently under beta test.

In case you do decide to try the Android version, (don't ask me how), please be advised that you can't actually exit the game from Android with the back button yet. Not my fault, there are no keyCodes for Android yet, and I have no idea how to close the app anyway.

Even though there are designs to polish out the game to make it more mechanically interesting and visually pleasant, I have no plans on continuing the project. I _might_ change my (non-existent) plans when there are proper deployment method and I have no other games to test it on.

The rest of this doc has my notes.



## Opinion on Turbulenz

The Turbulenz API is decidedly old-school -- complicated _and_ opinionated despite being modular -- and I honestly don like working with it, yet I do like how awesome the engine is in capability. I'ĺl try writing a few personal comfort-shims if I am to continue using the engine. This is up next, working Lahuan implementations, starting with the high level entity systems.

Turbulenz has absolutely no primitive drawing capability to speak of (hope you like rectangles). I wonder if anyone has built one yet, I'm quite the stickler for 2D minimal pixel-free geometric visuals myself. I don even know if it's possible to draw arbitrary polygons, or heck, triangles, in 2D! Unbelievabubble!

You have to compile Turublenz projects even to test them in plugin-mode which is just a concatenated js file. Yep, welcome to the future of dynamic web-based game development...

Turbulenz' plugin mode is _hella_ strict. You better be testing on it as you work from time to time, or else somewhere down the road you'll be completely stuck with the barest of errors coming from the vastly concatenated source with no sourcemap to navigate it.

Things sometimes just don't work with no warning. I have no idea why my draw2D object has no working draw() and drawSprite() methods yet their properties are defined. The source has clearly defined functions that should load just fine, but nothing in the game. I'm stumped. I fear this isn't a big but another one of Turbulenz' quixotic opinionated initialization gotchas.



## Building with Turbulenz

- Canvas-debug mode. For most of development in the browser. Needs to be rerun with changes.  
	makehtml --mode canvas-debug -t . -o .\build\hellopong.canvas-debug.html main.js template.html

- Canvas release build js and page. Only the first line needs to be reran with changes.  
	maketzjs --mode canvas -t . -o .\build\hellopong.js main.js
	makehtml --mode canvas -t . -o .\build\hellopong.canvas.html --code .\build\hellopong.js main.js template.html

- Plugin-mode release build tzjs and page. Only the first line needs to be reran with changes.
	maketzjs --mode plugin -t . -o .\build\hellopong.tzjs main.js
	makehtml --mode plugin -t . -o .\build\hellopong.plugin.html --code .\build\hellopong.tzjs main.js template.html



## Gameplay

- It's Pong.
- Players will control a paddle each.
- A single ball will bound around the field.
- Lengths of the field are walled off, but the two widths are open.
- Players must keep the ball within the field, failure to do so will mean losing a goal.
- Each lost goal will shrink the losing player's paddle a bit.
- The ball is respawned after each lost goal.
- Until one player loses their paddle, and the game is won by the other player.



## Interface and States

The new interafce is much simpler, and frankly, doesn't need to be any more complicated; this is a learning game, not a polishing game.

When the game is started, it starts at state 0. Follow the list to know more.

- State 0
	- Empty field, and nothing else.
	- Touching either paddle-area will create a paddle.
		- Paddle zoom into field.
		- Paddles cannot be controlled yet.
	- If both paddles are spawned, transition to state 1.
- State 1
	- Ball is spawned.
		- It is spawned at the center, as usual, and the grown to normal size.
		- The ball is shot in a random side.
	- Both paddles can now be controlled now.
	- When ball finishes spawning, transition to State 2.
- State 2
	- Normal game state.
	- Both paddles can continue to be controlled.
	- If ball stalls somewhere inside the field, randomly shoot in a new direction.
	- If ball gows out of field, score a goal.
	- Random obstacle-routines start every given period?
	- When goal is scored, go to State 3.
- State 3
	- Scoring pause.
	- Paddles cannot be controlled again.
	- The side losing the ball is shrunk over time.
		- Only if one side has lost the game, transition to State 4, else continue.
	- After paddle shrinks any remaining obstacles are shrunk and rushed out of the field to the winning side.
	- When obstacles are cleared transition to State 1.
- State 4
	- Final score pause.
	- Paddles cannot be controlled again.
	- The remaining paddle shrinks fully out of existence.
	- Fanfare fireworks blast for the number of hitpoints remaining for winner.
	- When fanfare is finished fading out transition to State 0.



## Visual Features
- The field is always rendered.
	- Preferably, it should be vector.
- Every solid object is white.
- Every particle is yellow.
- Use background clearing alpha after testing.
- If paddles or balls cannot be moved, color them yellow.
	- This means while spawning, the ball will be yellow.
	- And for the paddles it is during scoring winning as well as spawning.
- Ball creates particles as it moves.
	- Particles are squares of various size.
	- The faster it is going, the more particles, or something.
	- May only spawn particles above a speed limit.
- Ball, upon colliding with anything, shakes the screen.
	- The faster it is going, the larger the shake.
	- The shake should be on the normal of the collision.
	- May only shake above a speed limit.
- Ball, upon colliding with anything, creates particles.
	- Particles are thin lines of various size/thickness, never square.
	- Particles are ejected with some impulse that is based on the collision angle.
	- The faster it is going, the larger the impulse and number of particles.
	- May only spawn particles above a speed limit.
- Particles are not physical, they're simple kinetic objects interact with nothing at all.
	- Not even themselves.
- Obstacles are physical, and only interact with the ball.
	- Not even themselves, and definitely not the walls and paddles.
	
	

## Obstacles
-	Obstacles are needed to make a game of "really physical pong" anything but a borefest.
-	They are solid objects that appear in the middle of the playing area with a strict and dance-like pattern.
-	The ball, naturally, is impeded by the obstacles, and players have to work around and with them.
-	At no points should the obstacles create enclosures to trap the ball.
	
	
	
## Roadmap

When Turbulenz does have proper Android support, if you want, finish and release the game. There's a lot of work to do, even if the game is playable. And even that bit is questionably dull without obstacles.

1.	Start with the graphics
	-	Turbulenz has absolutely no primitive drawing capability, so you'll have to use sprites and update them for every entity the old-school way, add those. 
	-	Or better yet, use Pixi just for rendering, and translate between Draw2D-space and Pixi-space, which should be more useful in the long run.
2.	Then implement the flair.
	-	Basic particles. No physics needed, just iterate over a list of particles with a vector, and kill old ones.
3.	And the sounds.
	-	Add simple spawning, collision, goal, and victory effects. 
	-	Collision effects should scale volume with power, and goal effects may get louder the longer the game goes on, maybe?
4.	And then, if you really feel like making the game interesting, implement Obstacles
	-	A system that spawns a number of physics entities following a pattern, updates them, and kills them.
