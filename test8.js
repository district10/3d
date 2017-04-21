"use strict";

var container, camera, scene, renderer, controls;

var Config = function() {
    this.clock = new THREE.Clock();
    this.x = 0;
};
var config = new Config();
var gui = new dat.GUI();

var tween = new TWEEN.Tween(config).to({ x: 100000}, 10000).start();

window.addEventListener('load', function() {
    var animate = function(time){
        window.requestAnimationFrame( animate );
        TWEEN.update(time);

        var t = config.clock.getElapsedTime();
        config.customUniforms.mixAmount.value = 0.5 * (1.0 + Math.sin(t));

        controls.update();
        renderer.render(scene, camera);
    };

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.position.set(0,100,400);
	camera.lookAt(scene.position);

    // var light = new THREE.PointLight(0xffffff); light.position.set(0,0,0); scene.add(light);

    /*
    (config.ghXZ = new THREE.GridHelper(300, 10, 0x00ff00, 0x00ff00));
    (config.ghYZ = new THREE.GridHelper(300, 10, 0xff0000, 0xff0000)).rotateZ(-Math.PI/2);
    (config.ghXY = new THREE.GridHelper(300, 10, 0x0000ff, 0x0000ff)).rotateX(Math.PI/2).rotateY(-Math.PI/2);
    scene.add(config.ghXZ).add(config.ghYZ).add(config.ghXY);
    scene.add(config.axisHelper = new THREE.AxisHelper(500));
    */

    this.ballGeometry = new THREE.SphereGeometry( 200, 32, 16 );
    ballGeometry.scale(-1,1,1);
    this.vertices = ballGeometry.vertices;

    this.buffergeometry = new THREE.BufferGeometry();
    this.position = new THREE.Float32BufferAttribute( vertices.length * 3, 3 ).copyVector3sArray( vertices );
    buffergeometry.addAttribute( 'position', position );

    var endPositions = new Float32Array( vertices.length * 3 );
    for ( var i = 0; i < vertices.length; i ++ ) {
        var vertex = vertices[i];
        vertex.y = 0;
        vertex.toArray(endPositions, i * 3);
    }
    buffergeometry.addAttribute( 'endPosition', new THREE.BufferAttribute( endPositions, 3 ) );

	config.ballTexture = new THREE.TextureLoader().load("pano.jpg");
	config.ballTexture.wrapS = config.ballTexture.wrapT = THREE.RepeatWrapping;
	config.customUniforms = {
		// baseTexture: { type: "t", value: config.ballTexture },
		mixAmount: { type: "f", value: 0.0 }
	};

	this.customMaterial = new THREE.ShaderMaterial({
	    //uniforms: config.customUniforms,
		vertexShader: document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        side: THREE.DoubleSide
	});
    config.material = customMaterial;

	this.ball = new THREE.Mesh( buffergeometry, customMaterial );
	ball.position.set(0, 0, 0);
	scene.add( ball );

	config.ball = ball;

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }, false);

    animate();

}, false);
