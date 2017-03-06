"use strict";

var isDesktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
var container, camera, scene, renderer, controls, sphere;
var isUserInteracting = false;
var lon = 0, lat = 0, phi = 0, theta = 0;
var onPointerDownPointerX = 0, onPointerDownPointerY = 0, onPointerDownLon = 0, onPointerDownLat = 0;

window.addEventListener('load', function() {
    var animate = function(){
        window.requestAnimationFrame( animate );
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

    var geometry = new THREE.SphereGeometry( 500, 16, 8 );
    geometry.scale( - 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load( 'pano.jpg' )
    } );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    var geometry = new THREE.SphereGeometry( 400, 16, 8 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff00ff, side: THREE.BackSide, wireframe: true } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
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
var Config = function() {
    this.pointColor = [255, 255, 255];
    this.W = function() {
    };
    this.A = function() {
    };
    this.S = function() {
    };
    this.D = function() {
    };
};
var config = new Config();
var gui = new dat.GUI();
gui.add(config, 'W').name("W");
gui.add(config, 'A').name("A");
gui.add(config, 'S').name("S");
gui.add(config, 'D').name("D");
gui.addColor(config, 'pointColor').onFinishChange(function(value){
    debug(value);
}).name("Color");
