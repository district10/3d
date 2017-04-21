"use strict";

var container, camera, scene, renderer, controls;

var Config = function() {
    this.clock = new THREE.Clock();
};
var config = new Config();
// var gui = new dat.GUI();

function test(name, geometry) {
    var d = document.createElement( 'div' );
    d.innerHTML = '<br><br>' + name + '<br>';
    d.appendChild( THREE.UVsDebug( geometry ) );
    document.body.appendChild( d );
}


test('new THREE.PlaneGeometry( 100, 100, 1, 1 )', new THREE.PlaneGeometry( 100, 100, 1, 1 ));
test('new THREE.PlaneGeometry( 100, 100, 2, 2 )', new THREE.PlaneGeometry( 100, 100, 2, 2 ));
test('new THREE.PlaneGeometry( 100, 100, 3, 2 )', new THREE.PlaneGeometry( 100, 100, 3, 2 ));
test('new THREE.PlaneGeometry( 100, 100, 5, 4 )', new THREE.PlaneGeometry( 100, 100, 5, 4 ));

test('new THREE.SphereGeometry( 75, 3, 2 )', new THREE.SphereGeometry( 75, 3, 2 ));
test('new THREE.SphereGeometry( 75, 5, 3 )', new THREE.SphereGeometry( 75, 5, 3 ));
test('new THREE.SphereGeometry( 75, 3, 2, Math.PI/6, Math.PI/3, Math.PI/6, Math.PI/3 )',
      new THREE.SphereGeometry( 75, 3, 2, Math.PI/6, Math.PI/3, Math.PI/6, Math.PI/3 ));
/*
test('new THREE.PlaneBufferGeometry( 100, 100, 4, 4 )', new THREE.PlaneBufferGeometry( 100, 100, 4, 4 ));
test('new THREE.IcosahedronGeometry( 30, 1 )', new THREE.IcosahedronGeometry( 30, 1 ));
test('new THREE.OctahedronGeometry( 30, 2 )', new THREE.OctahedronGeometry( 30, 2 ));
test('new THREE.CylinderGeometry( 25, 75, 100, 10, 5 )', new THREE.CylinderGeometry( 25, 75, 100, 10, 5 ));
var points = [];
for ( var i = 0; i < 10; i ++ ) {
    points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 15 + 50, ( i - 5 ) * 2 ) );
}
test('new THREE.LatheGeometry( points, 8 )', new THREE.LatheGeometry( points, 8 ));
test('new THREE.TorusGeometry( 50, 20, 8, 8 )', new THREE.TorusGeometry( 50, 20, 8, 8 ));
test('new THREE.TorusKnotGeometry( 50, 10, 12, 6 )', new THREE.TorusKnotGeometry( 50, 10, 12, 6 ));
*/
