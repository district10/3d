"use strict";

var container, camera, scene, renderer, controls;

var Util = {
    "lonlat2xyz": function(lon, lat, radius) {
        var phi = THREE.Math.degToRad(90 - lat);
        var theta = THREE.Math.degToRad(lon);
        return {
            "x": radius * Math.sin(phi) * Math.cos(theta),
            "y": radius * Math.cos(phi),
            "z": radius * Math.sin(phi) * Math.sin(theta)
        };
    }
};

var Config = function() {
    var _this = this;
    this.n = 5;

    this.materialA = new THREE.MeshBasicMaterial( {
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load("texture.jpg"),
    });
    this.materialB = _this.materialA.clone();
    this.materialA.transparent = true;
    this.materialB.transparent = false;
    this.alpha = 0;

    this.wireframe = false;
    this.onWireframeChange = function() {
        config.materialA.wireframe = config.wireframe;
        config.materialB.wireframe = config.wireframe;
    };

    this.point = new THREE.SphereGeometry( 10, 64, 32 );
    this.smallPonit = new THREE.SphereGeometry(  5, 64, 32 );
    this.aMat = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } );
    this.bMat = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
    this.cMat = new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide } );
    this.xMat = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );

    this.A = {
        lon: 0,
        lat: 40,
        mesh: new THREE.Mesh(_this.point, _this.aMat)
    };
    this.B = {
        lon: -25,
        lat: 0,
        mesh: new THREE.Mesh(_this.point, _this.bMat)
    };
    this.C = {
        lon: 25,
        lat: -10,
        mesh: new THREE.Mesh(_this.point, _this.cMat)
    };
    this.onChangeN = function() {
        dualTriMesh.init(
            _this.A.mesh.position,
            _this.B.mesh.position,
            _this.C.mesh.position,
            {
                uv1: { x: 0.5054, y: 0.5947 },
                uv2: { x: 0.4795, y: 0.3896 },
                uv3: { x: 0.5752, y: 0.3852 },
                material: config.materialA
            },
            {
                uv1: { x: 0.4054, y: 0.5947 },
                uv2: { x: 0.3795, y: 0.3896 },
                uv3: { x: 0.4752, y: 0.3852 },
                material: config.materialB
            },
            config.n
        );
    };
    this.update = function (){
        _this.A.mesh.position.copy(Util.lonlat2xyz(_this.A.lon, _this.A.lat, dualTriMesh.radius));
        _this.B.mesh.position.copy(Util.lonlat2xyz(_this.B.lon, _this.B.lat, dualTriMesh.radius));
        _this.C.mesh.position.copy(Util.lonlat2xyz(_this.C.lon, _this.C.lat, dualTriMesh.radius));
        if (dualTriMesh !== undefined) {
            dualTriMesh.update(_this.A.mesh.position, _this.B.mesh.position, _this.C.mesh.position);
        }
    };
};
var config = new Config();

var TriMesh = function(n, radius, useVertexNormals) {
    var _this = this;
    this.n = n;
    this.radius = radius;
    this.group = new THREE.Group();
    this.useVertexNormals = useVertexNormals || false;

    this.index = function(i,j) {
        return parseInt(i*(i+1)/2+j);
    };
    this.bary = function(i,j) {
        var n = _this.n;
        return {
            x: (n-1-i)/(n-1),
            y: (i-j)/(n-1),
            z: j/(n-1)
        };
    };
    this.traverse = function(cb) {
        var n = _this.n;
        var cb = cb || function(){};
        for (var i = 0; i <= n-1; ++i) {
            for (var j = 0; j <= i; ++j) {
                cb(i,j);
            }
        }
    };
    this.a = new THREE.Vector3();
    this.b = new THREE.Vector3();
    this.c = new THREE.Vector3();
    this.uv1 = new THREE.Vector2();
    this.uv2 = new THREE.Vector2();
    this.uv3 = new THREE.Vector2();
    this.position = function(i,j) {
        var b = _this.bary(i,j);
        var v = new THREE.Vector3();
        v.x = b.x*_this.a.x + b.y*_this.b.x + b.z*_this.c.x;
        v.y = b.x*_this.a.y + b.y*_this.b.y + b.z*_this.c.y;
        v.z = b.x*_this.a.z + b.y*_this.b.z + b.z*_this.c.z;
        // todo: use lerp
        return v;
    };
    this.uv = function(i,j) {
        var b = _this.bary(i,j);
        var v = new THREE.Vector2();
        v.x = b.x*_this.uv1.x + b.y*_this.uv2.x + b.z*_this.uv3.x;
        v.y = b.x*_this.uv1.y + b.y*_this.uv2.y + b.z*_this.uv3.y;
        return v;
    };
    this.update = function(a,b,c) {
        var n = _this.n;
        _this.a.copy(a);
        _this.b.copy(b);
        _this.c.copy(c);
        if (_this.group.children.length > 0) {
            var mesh = _this.group.children[0];
            _this.traverse(function(i,j){
                var index = _this.index(i,j);
                mesh.geometry.vertices[index].copy(_this.position(i,j).setLength(_this.radius));
                if (_this.useVertexNormals) {
                    mesh.geometry.vertexNormals[index].copy(mesh.geometry.vertices[index].clone().negate().normalize());
                }
            });
            mesh.geometry.verticesNeedUpdate = true;
            if (_this.useVertexNormals) {
                mesh.geometry.normalsNeedUpdate = true;
            }
        }
    };
    this.init = function(a,b,c, uv1, uv2, uv3, material, n, radius) {
        _this.a.copy(a);
        _this.b.copy(b);
        _this.c.copy(c);
        _this.uv1.copy(uv1);
        _this.uv2.copy(uv2);
        _this.uv3.copy(uv3);
        _this.material = material;
        _this.n = n;
        _this.radius = radius;

        _this.group.children = [];
        var geometry = new THREE.Geometry();
        if (_this.useVertexNormals) {
            geometry.vertexNormals = [];
        }
        _this.traverse(function(i,j){
            var v = _this.position(i,j);
            geometry.vertices.push(v.setLength(_this.radius));
            if (_this.useVertexNormals) {
                geometry.vertexNormals.push(v.clone().negate().normalize());
            }
        });
        geometry.verticesNeedUpdate = true;
        if (_this.useVertexNormals) {
            geometry.normalsNeedUpdate = true;
        }
        geometry.faceVertexUvs[0] = [];
        for (var i = 1; i <= n-1; ++i) {
            for (var j = 0; j < i; ++j) {
                //             A(i-1,j)
                //
                //               /\
                //              /__\
                //
                //         B(i,j)   C(i,j+1)
                var ix = _this.index(i-1,j);
                var iy = _this.index(i,j);
                var iz = _this.index(i,j+1);
                geometry.faces.push( new THREE.Face3(ix,iy,iz) );
                geometry.faceVertexUvs[0].push([
                    _this.uv(i-1,j),
                    _this.uv(i,j),
                    _this.uv(i,j+1)
                ]);
            }
        }
        for (var i = 1; i <= n-2; ++i) {
            for (var j = 0; j < i; ++j) {
                //        B(i,j)   A(i,j+1)
                //              ____
                //              \  /
                //               \/
                //
                //           C(i+1,j+1)
                var ix = _this.index(i,j+1);
                var iy = _this.index(i,j);
                var iz = _this.index(i+1,j+1);
                geometry.faces.push( new THREE.Face3(ix,iy,iz) );
                geometry.faceVertexUvs[0].push([
                    _this.uv(i,j+1),
                    _this.uv(i,j),
                    _this.uv(i+1,j+1)
                ]);
            }
        }

        var mesh = new THREE.Mesh(geometry,material);
        _this.mesh = mesh;
        _this.group.add(mesh);
    };
};

var DualTriMesh = function(n, radius, useVertexNormals) {
    if (n === undefined) { n = 5; }
    if (radius === undefined) { radius = 500; }
    if (useVertexNormals === undefined) { useVertexNormals = false; }
    var _this = this;
    this.n = n;
    this.radius = radius;
    this.group = new THREE.Group();
    this.useVertexNormals = useVertexNormals;

    this.triMesh1 = new TriMesh(_this.n, _this.radius*1.0, _this.useVertexNormals);
    this.triMesh2 = new TriMesh(_this.n, _this.radius*1.2, _this.useVertexNormals);
    this.group.add(_this.triMesh1.group);
    this.group.add(_this.triMesh2.group);
    this.update = function(a,b,c) {
        _this.triMesh1.update(a,b,c);
        _this.triMesh2.update(a,b,c);
    };
    this.init = function(a,b,c, config1, config2, n, radius) {
        if (n === undefined) { n = 5; }
        if (radius === undefined) { radius = 500; }
        _this.n = n;
        _this.radius = radius;
        _this.triMesh1.init(
            a, b, c,
            config1.uv1, config1.uv2, config1.uv3, config1.material,
            _this.n, _this.radius*1.0
        );
        _this.triMesh2.init(
            a, b, c,
            config2.uv1, config2.uv2, config2.uv3, config2.material,
            _this.n, _this.radius*1.2
        );
    };
};

var dualTriMesh = new DualTriMesh(10, 400);
config.update();

var gui = new dat.GUI();

gui.add(config, 'n').min(2).max(20).step(1).onChange(config.onChangeN);
gui.add(config, 'wireframe').listen().onChange(config.onWireframeChange);
gui.add(config, 'alpha').min(0).max(1).step(0.01).listen().onChange(function(){
    config.materialA.opacity = 1-config.alpha;
});
var edit = gui.addFolder("调整 ABC");
edit.add(config.A, 'lon').min(-45).max(45).step(0.1).listen().name("A.lon").onChange(config.update);
edit.add(config.A, 'lat').min(-45).max(45).step(0.1).listen().name("A.lat").onChange(config.update);
edit.add(config.B, 'lon').min(-45).max(45).step(0.1).listen().name("B.lon").onChange(config.update);
edit.add(config.B, 'lat').min(-45).max(45).step(0.1).listen().name("B.lat").onChange(config.update);
edit.add(config.C, 'lon').min(-45).max(45).step(0.1).listen().name("C.lon").onChange(config.update);
edit.add(config.C, 'lat').min(-45).max(45).step(0.1).listen().name("C.lat").onChange(config.update);

window.addEventListener('load', function() {
    var animate = function(){
        window.requestAnimationFrame( animate );
        controls.update();
        renderer.render(scene, camera);
    };

    scene = new THREE.Scene();

    scene.add(dualTriMesh.group);

    scene.add(config.A.mesh);
    scene.add(config.B.mesh);
    scene.add(config.C.mesh);

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100000);
    camera.position.set(0,100,700);
    camera.lookAt(scene.position);

    var light = new THREE.AmbientLight(0xffffff);
    light.position.set(0,0,0);
    scene.add(light);

    scene.add(config.axisHelper = new THREE.AxisHelper(500));

    var geometry = new THREE.SphereGeometry( dualTriMesh.radius*2 || 1000, 64, 32 ); geometry.scale( - 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load( 'pano.jpg' ),
        side: THREE.DoubleSide
    } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    config.sphere = mesh;



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

    config.onChangeN();
    animate();

}, false);
