"use strict";

var isDesktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
var container, camera, scene, renderer, controls, sphere;
var isUserInteracting = false;
var lon = 0, lat = 0, phi = 0, theta = 0;
var onPointerDownPointerX = 0, onPointerDownPointerY = 0, onPointerDownLon = 0, onPointerDownLat = 0;

function updateMesh() {
    var e = config.plane.rotAtAnchor;
    var E  = new THREE.Euler( e[0], e[1], e[2], "XYZ" );
    var v = config.plane.anchor.position;
    var T1 = new THREE.Matrix4().makeTranslation( v.x,  v.y,  v.z);
    var T2 = new THREE.Matrix4().makeTranslation(-v.x, -v.y, -v.z);
    var R  = new THREE.Matrix4().makeRotationFromEuler( E );
    T1.multiply(R).multiply(T2);
    config.plane.matrix.identity();
    config.plane.applyMatrix(T1);
}

var Config = function() {
    this.rotX = 0;
    this.rotY = Math.PI;
    this.rotZ = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.groupRotX = 0;
    this.groupRotY = 0;
    this.groupRotZ = 0;
    this.groupTransX = 0;
    this.groupTransY = 0;
    this.groupTransZ = 0;
    this.stop = false;
};
var config = new Config();

window.addEventListener('load', function() {
    var animate = function(){
        window.requestAnimationFrame( animate );

        // config.plane
        if (!config.stop) {
            updateMesh();
        }

        if (isDesktop) {
            if (lon > 360) { lon -= 360; }
            if (lon <   0) { lon += 360; }
            lat = Math.max( - 85, Math.min( 85, lat ) );
            phi = THREE.Math.degToRad( 90 - lat );
            theta = THREE.Math.degToRad( lon );
            camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
            camera.target.y = 500 * Math.cos( phi );
            camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
            camera.lookAt( camera.target );
            debug(JSON.stringify({
                lon: lon,
                lat: lat
            }, null, 4));
        } else {
            controls.update();
        }
        // config.vnh.update();
        renderer.render(scene, camera);
    };
    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3( 0, 0, 0 );
    controls = new THREE.DeviceOrientationControls( camera );
    if (isDesktop) {
        controls.enabled = false;
    }

    scene = new THREE.Scene();

    var gridXZ = new THREE.GridHelper(1000, 100, 0x006600, 0x006600);
	// gridXZ.position.set( 100, 0,100 );
	scene.add(gridXZ);

	/*
	var gridXY = new THREE.GridHelper(1000, 100, 0x006600, 0x006600);
	gridXY.rotation.x = Math.PI/2;
	gridXY.setColors( new THREE.Color(0x000066), new THREE.Color(0x000066) );
	scene.add(gridXY);

	var gridYZ = new THREE.GridHelper(100, 10);
	gridYZ.position.set( 0,100,100 );
	gridYZ.rotation.z = Math.PI/2;
	gridYZ.setColors( new THREE.Color(0x660000), new THREE.Color(0x660000) );
	scene.add(gridYZ);
	*/

    // widthSeg 至少 3，heightSeg 至少 2
    var geometry = new THREE.SphereGeometry( 500, 3, 2, Math.PI/6, Math.PI/3, Math.PI/3, Math.PI/2 );
    geometry.scale( - 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load( 'pano.jpg' ),
    } );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    var geometry = new THREE.SphereGeometry( 400, 16, 8 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff00ff, side: THREE.BackSide, wireframe: true } );
    var mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );

    var geometry = new THREE.PlaneGeometry(200, 150, 4, 3); // 5*4 = 20 verticies
    var material = new THREE.MeshBasicMaterial( {
        side: THREE.DoubleSide // 这样才能两面都能看到
      , map: new THREE.TextureLoader().load( 'texture.jpg' )
    } );
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;

    var group = new THREE.Group();

    var mesh = new THREE.Mesh( geometry, material ); group.add(mesh);
    config.plane = mesh;
    var axisHelper = new THREE.AxisHelper(300); // axisHelper.position.set(0, 0, 1);
    group.add(axisHelper);
    mesh.anchor = axisHelper;
    mesh.rotAtAnchor = [0,0,0];
    config.anchor = axisHelper;

    var ahX = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 40, 0xff0000); group.add(ahX);
    var ahY = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 40, 0x00ff00); group.add(ahY);
    var ahZ = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 40, 0x0000ff); group.add(ahZ);

    group.position.set(100, 100, 200);
    group.rotation.y = Math.PI;

    var spritey = makeTextSprite( "Label.", { fontsize: 32, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0} } );
    spritey.scaleX = spritey.scale.x;
    spritey.scaleY = spritey.scale.y;
    var axisHelper2 = new THREE.AxisHelper(50);
    var spriteyGroup = new THREE.Group();
    spriteyGroup.add(spritey);
    spriteyGroup.add(axisHelper2);
    spriteyGroup.position.set(100, 50, 20);
    spriteyGroup.rotation.x = Math.PI / 6;
	group.add( spriteyGroup );
	config.spritey = spritey;

    var vnh = new THREE.VertexNormalsHelper(mesh, 20, 0xff0000, 20);
    config.vnh = vnh;
    group.add(vnh);

    /*
    var gxz = new THREE.GridHelper(1000, 50, 0x006600, 0x006600);
    var gxy = new THREE.GridHelper(1000, 50, 0x000066, 0x000066); gxy.rotation.x = Math.PI/2;
    var gyz = new THREE.GridHelper(1000, 50, 0x660000, 0x660000); gyz.rotation.z = Math.PI/2;
    scene.add(gxz); scene.add(gxy); scene.add(gyz);
    */

    scene.add( group );
    config.group = group;


    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,0,0);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }, false);

    animate();

    container.addEventListener( 'mousedown', function(event) {
        event.preventDefault();
        isUserInteracting = true;
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
    }, false );
    container.addEventListener( 'mousemove', function(event) {
        if ( isUserInteracting === true ) {
            lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
        }
    }, false );
    container.addEventListener( 'mouseup', function(event) {
        isUserInteracting = false;
    }, false );
    container.addEventListener( 'wheel', function(event) {
        camera.fov += event.deltaY * 0.05;
        camera.updateProjectionMatrix();
    }, false );
}, false);

// dat.gui
var gui = new dat.GUI();
gui.add(config, 'rotY').min(0).max(Math.PI*2).step(Math.PI*2/360.0).onChange(function(value){
    config.group.rotation.y = value;
}).name("RotY");
gui.add(config, 'rotX').min(0).max(Math.PI*2).step(Math.PI*2/360.0).onChange(function(value){
    config.group.rotation.x = value;
}).name("RotX");
gui.add(config, 'rotZ').min(0).max(Math.PI*2).step(Math.PI*2/360.0).onChange(function(value){
    config.group.rotation.z = value;
}).name("RotZ");

gui.add(config, 'groupRotX').min(0).max(360).step(1).listen().onChange(function(value){
    var delta = value/360*2*Math.PI;
    config.plane.rotAtAnchor[0] = delta;
}).name('groupRotX');
gui.add(config, 'groupRotY').min(0).max(360).step(1).listen().onChange(function(value){
    var delta = value/360*2*Math.PI;
    config.plane.rotAtAnchor[1] = delta;
}).name('groupRotY');
gui.add(config, 'groupRotZ').min(0).max(360).step(1).listen().onChange(function(value){
    var delta = value/360*2*Math.PI;
    config.plane.rotAtAnchor[2] = delta;
}).name('groupRotZ');
gui.add(config, 'groupTransX').min(-300).max(300).step(1).onChange(function(value){
    config.anchor.position.x = value;
    config.groupRotX = config.groupRotY = config.groupRotZ = 0; config.plane.rotAtAnchor = [0,0,0];
}).name('groupTransX');
gui.add(config, 'groupTransY').min(-300).max(300).step(1).onChange(function(value){
    config.anchor.position.y = value;
    config.groupRotX = config.groupRotY = config.groupRotZ = 0; config.plane.rotAtAnchor = [0,0,0];
}).name('groupTransY');
gui.add(config, 'groupTransZ').min(-300).max(300).step(1).onChange(function(value){
    config.anchor.position.z = value;
    config.groupRotX = config.groupRotY = config.groupRotZ = 0; config.plane.rotAtAnchor = [0,0,0];
}).name('groupTransZ');

var createSomething = function( klass, args ) {
    var F = function( klass, args ) {
        return klass.apply( this, args );
    };
    F.prototype = klass.prototype;
    return new F( klass, args );
};

// THREE.GeometryUtils.randomPointInTriangle

