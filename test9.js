"use strict";

var container, camera, scene, renderer, controls;
var raycaster = new THREE.Raycaster();

var dot = new THREE.SphereGeometry(1, 32, 16);

var materials = [
    new THREE.MeshBasicMaterial({color: new THREE.Color(1.0, 0.0, 0.0) }),
    new THREE.MeshBasicMaterial({color: new THREE.Color(0.0, 1.0, 0.0) }),
    new THREE.MeshBasicMaterial({color: new THREE.Color(0.0, 0.0, 1.0) }),
    new THREE.MeshBasicMaterial({color: new THREE.Color(1.1, 1.0, 1.0) }),
    new THREE.MeshBasicMaterial({color: new THREE.Color(0.0, 1.0, 1.0) }),
    new THREE.MeshBasicMaterial({color: new THREE.Color(1.0, 0.0, 1.0) }),
    new THREE.MeshBasicMaterial({color: new THREE.Color(1.0, 1.0, 0.0) }),
    new THREE.MeshBasicMaterial({color: new THREE.Color(1.0, 0.5, 0.0) })
];


/*
var origin = raycaster.ray.origin.copy(mesh.position);
raycaster.ray.direction.copy(direction).sub(origin).normalize();
var hit = raycaster.intersectObjects([mesh], true);
*/

var Config = function() {
    this.clock = new THREE.Clock();
    this.showGrid = false;
};
var config = new Config();
var gui = new dat.GUI();

var toggleGrid = function(show) {
    [config.ghXZ, config.ghYZ, config.ghXY, config.axisHelper].forEach(function(grid){
        if (grid) { grid.visible = show || false; }
    });
};
gui.add(config, 'showGrid').listen().name("显示格网").onChange(toggleGrid);

window.addEventListener('load', function() {
    var animate = function(){
        window.requestAnimationFrame( animate );
        controls.update();
        renderer.render(scene, camera);
    };

    scene = new THREE.Scene();

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.position.set(0,100,400);
	camera.lookAt(scene.position);

    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    (config.ghXZ = new THREE.GridHelper(300, 10, 0x00ff00, 0x00ff00));
    (config.ghYZ = new THREE.GridHelper(300, 10, 0xff0000, 0xff0000)).rotateZ(-Math.PI/2);
    (config.ghXY = new THREE.GridHelper(300, 10, 0x0000ff, 0x0000ff)).rotateX(Math.PI/2).rotateY(-Math.PI/2);
    scene.add(config.ghXZ).add(config.ghYZ).add(config.ghXY);
    scene.add(config.axisHelper = new THREE.AxisHelper(500));
    toggleGrid(false);

    var geometry = new THREE.SphereGeometry(50, 32, 16); geometry.scale( - 1, 1, 1 );
    // var material1 = new THREE.MeshNormalMaterial();
    var material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('pano.jpg'),
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    config.sphere = mesh;

    var mesh = new THREE.Mesh(dot, materials[1]);
    mesh.position.set(0, 50, 0);
    scene.add(mesh);
    config.dot = mesh;

    var geometry = new THREE.BoxGeometry(400, 300, 200, 1, 1, 1);
    var material1 = new THREE.MeshBasicMaterial({wireframe: true, color: 0xffffff});
    var mesh = new THREE.Mesh(geometry, material1);
    scene.add(mesh);
    config.box = mesh;

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

function greatCircleFunction(P, Q) {
    var angle = P.angleTo(Q);
    return function(t) {
        var X = new THREE.Vector3().addVectors(
            P.clone().multiplyScalar(Math.sin( (1 - t) * angle )),
            Q.clone().multiplyScalar(Math.sin(      t  * angle )))
            .divideScalar( Math.sin(angle) );
        return X;
    };
}

function createSphereArc(P,Q) {
    var sphereArc = new THREE.Curve();
    sphereArc.getPoint = greatCircleFunction(P,Q);
    return sphereArc;
}

function drawCurve(curve, color) {
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices = curve.getPoints(100);
    lineGeometry.computeLineDistances();
    var lineMaterial = new THREE.LineBasicMaterial();
    lineMaterial.color = color;
    var line = new THREE.Line( lineGeometry, lineMaterial );
    scene.add(line);
}

function drawLine(P,Q, color, dashed) {
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push( P, Q );
    lineGeometry.computeLineDistances();
    if ( dashed === undefined || !dashed )
        var lineMaterial = new THREE.LineBasicMaterial();
    else // dashed = true
        var lineMaterial = new THREE.LineDashedMaterial( { dashSize: 2, gapSize: 2 } );
    lineMaterial.color = color;
    var line = new THREE.Line( lineGeometry, lineMaterial );
    scene.add(line);
}

// draw a ray from point to origin and return point of intersection with mesh
function projectOntoMesh(point, mesh) {
    var origin = point.clone();
    var direction = point.clone().multiplyScalar(-1);
    var ray = new THREE.Raycaster( origin, direction.normalize() );
    var intersection = ray.intersectObject( mesh );
    if ( intersection.length > 0 )
        return intersection[ 0 ].point;
    else
    // console.log( "No intersection?" );
        return null;
}

var getCorner = function(name) {
    switch (name) {
        case "P1": case 1: return config.box.geometry.vertices[1];
        case "P2": case 2: return config.box.geometry.vertices[4];
        case "P3": case 3: return config.box.geometry.vertices[5];
        case "P4": case 4: return config.box.geometry.vertices[0];
        case "P5": case 5: return config.box.geometry.vertices[3];
        case "P6": case 6: return config.box.geometry.vertices[6];
        case "P7": case 7: return config.box.geometry.vertices[7];
        case "P8": case 8: return config.box.geometry.vertices[2];
        default:  return new THREE.Vector3();
    }
};
