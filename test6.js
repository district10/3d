"use strict";

var container, camera, scene, renderer, controls;

var Config = function() {
    this.clock = new THREE.Clock();
};
var config = new Config();
var gui = new dat.GUI();

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

    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,0,0);
    scene.add(light);

    (config.ghXZ = new THREE.GridHelper(300, 10, 0x00ff00, 0x00ff00));
    (config.ghYZ = new THREE.GridHelper(300, 10, 0xff0000, 0xff0000)).rotateZ(-Math.PI/2);
    (config.ghXY = new THREE.GridHelper(300, 10, 0x0000ff, 0x0000ff)).rotateX(Math.PI/2).rotateY(-Math.PI/2);
    scene.add(config.ghXZ).add(config.ghYZ).add(config.ghXY);
    scene.add(config.axisHelper = new THREE.AxisHelper(500));

    var geometry = new THREE.PlaneGeometry(100, 100, 2, 2);
    var material = new THREE.MeshBasicMaterial( {
        side: THREE.DoubleSide
      , wireframe: true
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -150;
    scene.add(mesh);
    config.wireMesh = mesh;

    var geometry = new THREE.PlaneGeometry(100, 100, 2, 2);
    var material = new THREE.MeshBasicMaterial( {
        side: THREE.DoubleSide
      , map: new THREE.TextureLoader().load("texture.jpg")
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = +150;
    scene.add(mesh);
    config.mapMesh = mesh;
    // faces&uvs: http://jsoneditoronline.org/?id=e4d00ea65fdbead59c7c0c11bf2e2fa1

    var geometry = new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 );
    // config.geoWire = new THREE.WireframeGeometry(geometry);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide
      , wireframe: true
    }));
    mesh.position.y = 150;
    scene.add(mesh);
    config.boxMesh = mesh;

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

function getFacesUvs(mesh) {
    var faces = mesh.geometry.faces;
    var uvs = mesh.geometry.faceVertexUvs[0];
    return {
        "faces": faces,
        "uvs": uvs
    };
}
