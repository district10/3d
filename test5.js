"use strict";

var container, camera, scene, renderer, controls;
var ball, ballGeometry;

var Config = function() {
    this.clock = new THREE.Clock();
    this.rotY = 0;
    this.t = 0;
    this.step = 0.5;
    this.ballScaleX = 1;
    this.ballScaleY = 1;
    this.ballScaleZ = 1;
    this.ballGeoScaleX = -1;
    this.ballGeoScaleY = 1;
    this.ballGeoScaleZ = 1;
    this.in = function() {
        camera.position.set(0,0,0);
    };
    this.out = function() {
        controls.reset();
    };
    this.rotY = 0;
    this.useNormalMaterial = false;
    this.scale = 1;
    this.showGrid = true;
    this.saveImg = function(){
        var url = config.renderer.domElement.toDataURL("image/png"); // .replace(/^data:image\/[^;]/, 'data:application/octet-stream');
        window.open(url, '_blank');
        window.focus();
    };
};
var config = new Config();
var gui = new dat.GUI();
gui.add(config, 'saveImg').name("导出图片");
gui.add(config, 'showGrid').listen().onChange(function(vis){
    config.ghXZ.visible = config.ghYZ.visible = config.ghXY.visible = vis;
});
gui.add(config, 'rotY').min(0).max(360).step(1).onChange(function(value){
    ball.rotation.y = THREE.Math.degToRad(value);
}).name('Rot Y');
gui.add(config, 'step').min(0.1).max(5).step(0.1);
gui.add(config, 't').listen().name("Time");
gui.add(config, 'in').name("Look inside");
gui.add(config, 'out').name("Go back");
gui.add(config, 'ballScaleX').min(-2).max(2).step(0.1).onChange(function(value){ ball.scale.x = value; });
gui.add(config, 'ballScaleY').min(-2).max(2).step(0.1).onChange(function(value){ ball.scale.y = value; });
gui.add(config, 'ballScaleZ').min(-2).max(2).step(0.1).onChange(function(value){ ball.scale.z = value; });
gui.add(config, 'ballGeoScaleX').min(-2).max(2).step(0.1).onChange(function(value){ ballGeometry.scale.x = value; });
gui.add(config, 'ballGeoScaleY').min(-2).max(2).step(0.1).onChange(function(value){ ballGeometry.scale.y = value; });
gui.add(config, 'ballGeoScaleZ').min(-2).max(2).step(0.1).onChange(function(value){ ballGeometry.scale.z = value; });
gui.add(config, 'useNormalMaterial').onChange(function(use){
    if (use) {
        ball.material = config.material2;
    } else {
        ball.material = config.material1;
    }
});
gui.add(config, 'scale').min(0.2).max(10).step(0.1);

window.addEventListener('load', function() {
    var animate = function(){
        window.requestAnimationFrame( animate );
        controls.update();
        config.t = config.clock.getElapsedTime();
        customUniforms.mixAmount.value = 0.5 * (1.0 + Math.sin(config.t*config.step));
        ball.material.wireframe = (config.t % 10) < (config.useNormalMaterial?3:5);
        config.light.position.copy(camera.position);
        renderer.render(scene, camera);
    };

    scene = new THREE.Scene();

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.position.set(0,100,400);
    camera.lookAt(scene.position);

    config.light = new THREE.PointLight(0xffffff);
    // light.position.set(0,0,0);
    config.light.position.copy(camera.position);
    scene.add(config.light);

    ballGeometry = new THREE.SphereGeometry( 100, 32, 16 );
    ballGeometry.scale(
        config.ballGeoScaleX,
        config.ballGeoScaleY,
        config.ballGeoScaleZ
    );

    var ballTexture = new THREE.TextureLoader().load('pano.jpg');
    // use "this." to create global object
    this.customUniforms = {
        baseTexture: { type: "t", value: ballTexture },
        mixAmount: { type: "f", value: 0.0 }
    };

    // create custom material from the shader code above that is within specially labeled script tags
    var customMaterial = new THREE.ShaderMaterial({
        uniforms: customUniforms,
        vertexShader:   document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        side: THREE.DoubleSide,
        wireframe: true
    });

    var customMaterial2 = new THREE.MeshNormalMaterial();
    config.material1 = customMaterial;
    config.material2 = customMaterial2;

    ball = new THREE.Mesh( ballGeometry, customMaterial );
    ball.scale.set(
        config.ballScaleX,
        config.ballScaleY,
        config.ballScaleZ
    );
    // ball.position.set(0, 65, 0);
    ball.rotation.set(0, -Math.PI / 2, 0);
    scene.add( ball );

    var axisHelper = new THREE.AxisHelper(500);
    scene.add(axisHelper);

    (config.ghXZ = new THREE.GridHelper(300, 10, 0x00ff00, 0x00ff00));
    (config.ghYZ = new THREE.GridHelper(300, 10, 0xff0000, 0xff0000)).rotateZ(-Math.PI/2);
    (config.ghXY = new THREE.GridHelper(300, 10, 0x0000ff, 0x0000ff)).rotateX(Math.PI/2).rotateY(-Math.PI/2);
    scene.add(config.ghXZ).add(config.ghYZ).add(config.ghXY);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });
    config.renderer = renderer;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.minDistance = 5;
    controls.maxDistance = 500;

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }, false);

    animate();

}, false);
