//==============================================================================
// Author: Nergal
// Date: 2015-11-17
//==============================================================================

function Game() {
    this.container;
    this.scene;
    this.camera;
    this.renderer;
    this.stats;
    this.clock;
    this.controls;

    // Scene settings
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.viewAngle = 10;
    this.aspect = this.screenWidth/this.screenHeight;
    this.near = 10;
    this.far = 3000;
    this.invMaxFps = 1/60;
    this.frameDelta = 0;

    // Procedurally generated stuff
    this.proc = undefined;
    this.rollOverMesh = undefined;
    this.isShiftDown = 0;
    this.isADown = 0;
    this.raycaster = 0;
    this.mouse = 0;

    // Object arrays
    this.objects = [];
    this.world = undefined;
    this.phys = undefined;

    // Modes
    this.mode = "edit"; // play / edit

    // Should be in player later...
    this.player = undefined;
    this.keyboard = 0;
    this.box = 0;
    this.inputTime = 0;

    //==========================================================
    // InitScene
    //==========================================================
    Game.prototype.initScene = function() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(20, this.aspect, this.near, this.far);
        this.scene.add(this.camera);
    };

    //==========================================================
    // Init other stuff
    //==========================================================
    Game.prototype.Init = function(mapId) {
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 100;
        $('#container').append( this.stats.domElement );

        this.initScene();

        this.renderer = new THREE.WebGLRenderer( {antialias: true} );
        this.renderer.setSize(this.screenWidth, this.screenHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container = document.getElementById('container');
        this.container.appendChild(this.renderer.domElement);

        this.scene.fog = new THREE.Fog( 0xFF99AA, 100, 3000);
        this.renderer.setClearColor(0xFFA1C1, 1);

        THREEx.WindowResize(this.renderer, this.camera);

       var ambientLight = new THREE.AmbientLight( 0xEEB1C6 );
       this.scene.add( ambientLight );


       var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
       hemiLight.color.setHSL( 0.6, 1, 0.6 );
       hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
       hemiLight.position.set( 0, 500, 0 );
       game.scene.add( hemiLight );

        var dirLight = new THREE.DirectionalLight( 0x999999, 0.4 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( 23, 23, 10 );
        dirLight.position.multiplyScalar( 10 );
        game.scene.add( dirLight );

        //dirLight.castShadow = false;
        dirLight.castShadow = true;

        dirLight.shadowMapWidth = 512;
        dirLight.shadowMapHeight = 512; // 2048

        var d = 150;

        dirLight.shadowCameraLeft = -d;
        dirLight.shadowCameraRight = d;
        dirLight.shadowCameraTop = d;
        dirLight.shadowCameraBottom = -d;

        dirLight.shadowCameraFar = 3500;
        dirLight.shadowBias = -0.0001;
        dirLight.shadowDarkness = 0.45; 



        // Voxel paint
        var rollOverGeo = new THREE.BoxGeometry( 1, 1, 1 );
        var rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, opacity: 0.5, transparent: true } );
        this.rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
        this.scene.add( this.rollOverMesh );

        this.world = new World();
        console.log("World init...");
        this.world.Init();


       

        this.phys = new Phys();
        this.phys.Init();

        this.player = new Player();

        this.proc = new Proc();

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        $('#editor').append("<br><span id='key1'>1: None</span> | <span id='key2'>2: Block</span> | <span id='key3'>3: Eraser</span> | <span id='key4'>4: Free Draw </span> | <span id='key5'>5: Explode</span><br><br>");

        // Load world
        var vox = new Vox();
        // No weapons
        vox.LoadModel("objects/player_stand.vox", function(t, name, chunk){game.player.standChunk = chunk; game.player.shootChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_jump.vox", function(t, name, chunk){game.player.jumpChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_run1.vox", function(t, name, chunk){game.player.run1Chunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_run2.vox", function(t, name, chunk){game.player.run2Chunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_fall.vox", function(t, name, chunk){game.player.fallChunk = chunk;}, "Player", TYPE_OBJECT);

        // Rocket launcher
        vox.LoadModel("objects/player_stand_rocket.vox", function(t, name, chunk){game.player.standRocketChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_jump_rocket.vox", function(t, name, chunk){game.player.jumpRocketChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_run1_rocket.vox", function(t, name, chunk){game.player.run1RocketChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_run2_rocket.vox", function(t, name, chunk){game.player.run2RocketChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_shoot_rocket.vox", function(t, name, chunk){game.player.shootRocketChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_fall_rocket.vox", function(t, name, chunk){game.player.fallRocketChunk = chunk;}, "Player", TYPE_OBJECT);
        
        // Shutgun
        vox.LoadModel("objects/player_stand_shotgun.vox", function(t, name, chunk){game.player.standShotgunChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_jump_shotgun.vox", function(t, name, chunk){game.player.jumpShotgunChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_run1_shotgun.vox", function(t, name, chunk){game.player.run1ShotgunChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_run2_shotgun.vox", function(t, name, chunk){game.player.run2ShotgunChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_shoot_shotgun.vox", function(t, name, chunk){game.player.shootShotgunChunk = chunk;}, "Player", TYPE_OBJECT);
        vox.LoadModel("objects/player_fall_shotgun.vox", function(t, name, chunk){game.player.fallShotgunChunk = chunk;}, "Player", TYPE_OBJECT);

        vox.LoadModel("maps/monu9_test2.vox", function(name){game.player.Init("test");}, "Map1", TYPE_MAP);

        this.animate();
    };
    
    Game.prototype.onWindowResize = function() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    };

    Game.prototype.getDistance = function(v1, v2) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;
        return Math.sqrt(dx*dx+dy*dy+dz*dz);
    };

    //==========================================================
    // Render
    //==========================================================
    Game.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    //==========================================================
    // Animate
    //==========================================================
    Game.prototype.animate = function() {
        this.animId = requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.update();
    };

    //==========================================================
    // Update
    //==========================================================
    Game.prototype.update = function() {
        var delta = this.clock.getDelta(),
        time = this.clock.getElapsedTime() * 10;

        this.frameDelta += delta;

        while(this.frameDelta >= this.invMaxFps) {
            this.player.Draw(time,this.invMaxFps);
            this.phys.Draw(time, this.invMaxFps);
            this.frameDelta -= this.invMaxFps;
            this.world.Draw(time,delta);  
            
            // Test waterfall
            if((game.world.blocks[98][67][83] >> 8) != 0) {
                if(Math.random() > 0.5) {
                    var block = game.phys.Get();
                    if(block != undefined) {
                        block.gravity = 1;
                        var r = 15;
                        var g = 169;
                        var b = 189;
                        if(lfsr.rand()>0.5) {
                            r = 36;
                            g = 152;
                            b = 229;
                        }
                        block.Create(86+lfsr.rand()*5,
                                     65,
                                     92,
                                     r, 
                                     g,
                                     b,
                                     -1, 10, PHYS_SMOKE, 1);

                    }
                }
                // Test fountain
                if(Math.random() > 0.7) {
                    var block = game.phys.Get();
                    if(block != undefined) {
                        block.gravity = 1;
                        var r = 15;
                        var g = 169;
                        var b = 189;
                        if(lfsr.rand()>0.5) {
                            r = 255;
                            g = 255;
                            b = 255;
                        }
                        block.Create(85+lfsr.rand()*7,
                                     36,
                                     90+lfsr.rand()*5,
                                     r, 
                                     g,
                                     b,
                                     0.5, 5, PHYS_SMOKE, 1);

                    }
                }
            }

        }	
        this.stats.update();
    };

    Game.prototype.rand = function(min, max, n) {
        var r, n = n||0;
        if (min < 0) r = min + Math.random() * (Math.abs(min)+max);
        else r = min + Math.random() * max;
        return r.toFixed(n)*1;
    };
}


function Objects () {
    this.type = 0;
    this.hp = 0;
    this.weapon = WEAPON_SHOTGUN;
    this.chunk = undefined;

    Objects.prototype.Init = function(name, position, chunk) {
        this.name = name;
        this.hp = MAX_HP;

        chunk.dirty = true;
        chunk.fromX = 1000; // just some large value 
        chunk.fromZ = 1000;
        chunk.fromY = 1000;
        chunk.type = 1; // 0 = world, 1 = object;
        chunk.blockList = new Array();

        for(var q = 0; q < chunk.blockList.length; q++) {
            var b = chunk.blockList[q];
            if(b.x < chunk.fromX) {
                chunk.fromX = b.x;
            }
            if(b.x > chunk.toX) {
                chunk.toX = b.x;
            }
            if(b.y > chunk.toY) {
                chunk.toY = b.y;
            }
            if(b.y < chunk.fromY) {
                chunk.fromY = b.y;
            }
            if(b.z < chunk.fromZ) {
                chunk.fromZ = b.z;
            }
            if(b.z > chunk.toZ) {
                chunk.toZ = b.z;
            }
        }
        // Increase area to view all voxels for mesh creation
        chunk.fromX--;
        chunk.fromY--;
        chunk.fromZ--;
        chunk.toX++;
        chunk.toY++;
        chunk.toZ++;
        game.world.RebuildChunk(chunk);
        game.phys.CreateMeshBlock(chunk);
        this.chunk = chunk;
    };

    Objects.prototype.Draw = function(time, delta) {
        this.CheckKeyPress();

    };

    Objects.prototype.Hit = function(x,y,z, dmg) {
        this.hp -= dmg;
    };
    
}

//==============================================================================
// Author: Nergal
// Date: 2015-11-17
//==============================================================================
// TBD: enum
const PHYS_REGULAR = 0;
const PHYS_SMOKE = 1;
const PHYS_MISSILE = 2;
const PHYS_SNOW = 3;
const PHYS_GRENADE = 4;
const PHYS_DIE = 5;
const PHYS_SHOT = 6;

function MeshBlock() {
    this.mesh = undefined;
    this.helper = undefined;
    this.gravity = 19.82;
    this.mass = 1;
    this.airDensity = 1.2;
    this.e = -0.2;
    this.area = 0.1;
    this.active = 1;
    this.chunk = undefined;

    this.bounces_orig = 2;
    this.bounces = this.bounces_orig;
    this.avg_ay = -2;
    this.vy = 0;
    this.remove = 0;

    MeshBlock.prototype.Draw = function(time, delta) {
        this.mesh.updateMatrixWorld();
        for (var i = 0; i < this.chunk.blockList.length; i+=this.off) {
            var b = this.chunk.blockList[i];
            var vector = new THREE.Vector3(b.x,b.y,b.z);
            vector.applyMatrix4( this.mesh.matrixWorld );
            var xi = vector.x + game.world.blockSize*8 | 0;
            var yi = vector.y | 0;
            var zi = vector.z + game.world.blockSize*8 | 0;

            if(game.world.IsWithinWorld(xi,yi,zi)) {
                if((game.world.blocks[xi][yi][zi] >> 8) != 0) {
                    game.world.PlaceObject(xi,yi,zi, this.chunk);
                    this.active = 0;
                    this.remove = 1;
                    return;
                }
            }
            if(yi <= 0) {
                game.world.PlaceObject(xi,0,zi, this.chunk);
                this.remove = 1;
                this.active = 0;
                return;
            }   
        }
        
        var fy = this.mass*this.gravity;
        fy += -1 * 0.5 * this.airDensity * this.area * this.vy * this.vy;
        var dy = this.vy * delta + (0.5 * this.avg_ay * delta * delta);

        this.mesh.position.y += dy * 10;
        var new_ay = fy / this.mass;
        this.avg_ay = 0.5 * (new_ay + this.avg_ay);
        this.vy -= this.avg_ay * delta;
    };

    MeshBlock.prototype.Create = function(chunk) {
        this.mesh = chunk.mesh;
        this.mesh.chunk = chunk;
        this.chunk = chunk;
        this.active = 1;
        this.off = 1;
        if(this.chunk.blockList.length > 100) {
            this.off = this.chunk.blockList.length/500 | 0;
            if(this.off < 1) {
                this.off = 1;
            }
        }
       //for(var i = 0; i < chunk.blockList.length; i+=this.off) {
       //    var b = chunk.blockList[i];
       //    var m = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xFF00FF, wireframe: true}));
       //    m.position.set(b.x, b.y, b.z);
       //    //m.visible = false;
       //    this.mesh.add(m);
       //}
    };
}


function PhysBlock(){
   this.life = 0;
   this.mesh = undefined;
   this.color = '0xFFFFFF';
   this.active = 0;
   this.gravity = 9.82;
   this.e = -0.3; // restitution
   this.mass = 0.1; // kg
   this.airDensity = 1.2;
   this.drag = -5.95;
   this.area = 1/1000;
   this.vy = 0;
   this.avg_ay = 0;

   this.vx = 0;
   this.vz = 0;
   this.avg_ax = 0;
   this.avg_az = 0;

   this.bounces = 0;
   this.bounces_orig = 0;
   this.fx_ = 0;
   this.fz_ = 0;
   this.type = PHYS_REGULAR;
   this.ray = undefined;


   PhysBlock.prototype.Init = function() {
        var geo = new THREE.BoxGeometry(
            game.world.blockSize,
            game.world.blockSize,
            game.world.blockSize);

        var mat = new THREE.MeshLambertMaterial();
        this.mesh = new THREE.Mesh(geo, mat);
        game.scene.add(this.mesh);
        this.mesh.visible = false;
        this.mesh.castShadow = true;
        this.bounces_orig = (1+lfsr.rand()+2) | 0;
        //this.fx_ = lfsr.rand()-0.5;
        //this.fz_ = lfsr.rand()-0.5;

        this.fx_ = Math.random()-0.5;
        this.fz_ = Math.random()-0.5;
   };

   PhysBlock.prototype.Create = function(x,y,z,r, g, b, power, life, type, bounces, mass) {
       this.type = type? type: PHYS_REGULAR;
       if(this.type != PHYS_MISSILE && this.type != PHYS_SNOW && this.type != PHYS_GRENADE && this.type != PHYS_SHOT) {
           this.life = life? lfsr.rand()*life: lfsr.rand()*3;
       } else {
           this.life = life;
       }
       this.mass = mass? mass: 0.1; // TBD: orig
       this.bounces = bounces? bounces: this.bounces_orig;
       this.avg_ay = 0;
       this.avg_ax = 0;
       this.avg_az = 0;

       if(this.type == PHYS_MISSILE || this.type == PHYS_GRENADE || this.type == PHYS_SHOT) {
           // Extract direction vector
           var pos = new THREE.Vector3(0,2,50);
           var gpos = pos.applyMatrix4(game.player.mesh.matrix);
           var dir = pos.sub(game.player.mesh.position);
           this.ray = new THREE.Raycaster(gpos, dir.clone().normalize());
           this.vx = power+this.ray.ray.direction.x;
           this.vy = power;
           this.vz = power+this.ray.ray.direction.z;
       } else {
           this.vx = power;
           this.vy = power;
           this.vz = power;
       }

       var col = game.world.rgbToHex(r, g,b);
       this.mesh.material.color.setHex(col);
       this.mesh.material.needsUpdate = true;
       this.mesh.position.set(x,y,z);
       this.mesh.visible = true;
       this.mesh.scale.set(1,1,1);
   };

   PhysBlock.prototype.Draw = function(time, delta) {
       this.life -= delta;
       if(this.life <= 0 || this.bounces == 0 || this.mesh.position.y < -5) {
           if(this.type == PHYS_MISSILE) {
                var x = this.mesh.position.x+game.world.blockSize*8 | 0;
                var y = this.mesh.position.y | 0;
                var z = this.mesh.position.z+game.world.blockSize*8 | 0;
                //if(game.world.IsWithinWorld(x,y,z)) {
                    game.world.Explode(x, y, z, 8, 0);
                //}
           } else if(this.type == PHYS_GRENADE) {
                var x = this.mesh.position.x+game.world.blockSize*8 | 0;
                var y = this.mesh.position.y | 0;
                var z = this.mesh.position.z+game.world.blockSize*8 | 0;
                if(game.world.IsWithinWorld(x,y,z)) {
                    game.world.Explode(x, y, z, 15, 0); 
                }
           } else if(this.type == PHYS_SHOT) {
                var x = this.mesh.position.x+game.world.blockSize*8 | 0;
                var y = this.mesh.position.y | 0;
                var z = this.mesh.position.z+game.world.blockSize*8 | 0;
                if(game.world.IsWithinWorld(x,y,z)) {
                    game.world.Explode(x, y, z, 2, 0); 
                }
           } else if(this.type == PHYS_SNOW) {
               var x = this.mesh.position.x+game.world.blockSize*8 | 0;
               var y = this.mesh.position.y-3 | 0;
               var z = this.mesh.position.z+game.world.blockSize*8 | 0;
               if(game.world.IsWithinWorld(x,y,z)) {
                   game.world.blocks[x][y][z] = 255 << 24 | 255 << 16 | 255 << 8;
                   game.world.GetChunk(x, z).dirty = true;
                   game.world.RebuildDirtyChunks();
               }
           }
           this.mesh.visible = false;
           this.active = 0;
           this.life = 0;
           return;
       }
       
       var x = this.mesh.position.x+game.world.blockSize*8 | 0;
       var y = this.mesh.position.y | 0;
       var z = this.mesh.position.z+game.world.blockSize*8 | 0;

       var fy = this.mass*this.gravity;
       var fx, fz;
       if(this.type == PHYS_MISSILE) { 
           fx = this.mass*this.gravity; //*this.ray.ray.direction.x;
           fz = this.mass*this.gravity; //*this.ray.ray.direction.z;
       } else {
           fx = this.mass*this.gravity * lfsr.rand()-0.5;
           fz = this.mass*this.gravity * lfsr.rand()-0.5;
       }
           
       fy += -1 * 0.5 * this.airDensity * this.area * this.vy * this.vy;
       fx += -1 * 0.5 * this.airDensity * this.area * this.vx * this.vx;
       fz += -1 * 0.5 * this.airDensity * this.area * this.vz * this.vz;

       var dy = this.vy * delta + (0.5 * this.avg_ay * delta * delta);
       var dx = this.vx * delta + (0.5 * this.avg_ax * delta * delta);
       var dz = this.vz * delta + (0.5 * this.avg_az * delta * delta);

       if(this.type == PHYS_REGULAR || this.type == PHYS_DIE) {
           this.mesh.position.x += dx * 10*this.fx_;
           this.mesh.position.z += dz * 10*this.fz_;
           this.mesh.position.y += dy * 10;
       } else if(this.type == PHYS_SMOKE) {
           this.mesh.position.y += dy * 10;
           this.mesh.position.x += Math.sin(dx)*this.fx_;
           this.mesh.position.z += Math.sin(dz)*this.fz_;
       } else if(this.type == PHYS_SNOW) {
           this.mesh.position.y += dy * 10;
           this.mesh.position.x += Math.sin(dx)*this.fx_;
           this.mesh.position.z += Math.sin(dz)*this.fz_;
       } else if(this.type == PHYS_SHOT) {
           this.mesh.position.x += dx * 10*this.ray.ray.direction.x;
           this.mesh.position.z += dz * 10*this.ray.ray.direction.z;
       } else if(this.type == PHYS_MISSILE) {
           this.mesh.position.x += dx * 10*this.ray.ray.direction.x;
           this.mesh.position.z += dz * 10*this.ray.ray.direction.z;
           var smoke = game.phys.Get();
           if(smoke != undefined) {
               // Random colors
               smoke.gravity = -2;
               smoke.Create(this.mesh.position.x,
                            this.mesh.position.y,
                            this.mesh.position.z,
                            230,
                            230,
                            230,
                            lfsr.rand()*1, 1, PHYS_SMOKE);

           }
       } else if(this.type == PHYS_GRENADE) {
           this.mesh.position.x += dx * 10*this.ray.ray.direction.x;
           this.mesh.position.z += dz * 10*this.ray.ray.direction.z;
           this.mesh.position.y += dy * 20;
           if(lfsr.rand()>0.7) {
               var smoke = game.phys.Get();
               if(smoke != undefined) {
                   // Random colors
                   smoke.gravity = -2;
                   var r = 200;
                   var g = (100+lfsr.rand()*155) | 0;
                   var b = 0;
                   smoke.Create(this.mesh.position.x,
                                this.mesh.position.y,
                                this.mesh.position.z,
                                r,
                                g,
                                b,
                                lfsr.rand()*1, 0.5, PHYS_SMOKE);

               }
           }
       }
       

       var new_ay = fy / this.mass;
       this.avg_ay = 0.5 * (new_ay + this.avg_ay);
       this.vy -= this.avg_ay * delta;

       var new_ax = fx / this.mass;
       this.avg_ax = 0.5 * (new_ax + this.avg_ax);
       this.vx -= this.avg_ax * delta;

       var new_az = fz / this.mass;
       this.avg_az = 0.5 * (new_az + this.avg_az);
       this.vz -= this.avg_az * delta;
       
       this.mesh.rotation.set(this.vx, this.vy, this.vz);

       if(this.type == PHYS_MISSILE || this.type == PHYS_SHOT) {
            if(game.world.IsWithinWorld(x,y,z)) {
                for(var x1 = -1; x1 < 2; x1++) {
                    for(var z1 = -1; z1 < 2; z1++) {
                        if(game.world.IsWithinWorld(x+x1,y,z+z1)) {
                            if((game.world.blocks[x+x1][y][z+z1] >> 8) != 0) {
                                this.life = 0;
                                return;
                            }
                        }
                    }
                }
            }
       } else if(this.type == PHYS_GRENADE) {
           var x = this.mesh.position.x | 0;
           var y = this.mesh.position.y | 0;
           var z = this.mesh.position.z | 0;
            if(game.world.IsWithinWorld(x,y,z)) {
                for(var x1 = 0; x1 < 2; x1++) {
                    for(var z1 = 0; z1 < 2; z1++) {
                        for(var y1 = 0; y1 < 2; y1++) {
                            if(game.world.IsWithinWorld(x+x1,y+y1,z+z1)) {
                                if(this.mesh.position.y <= 0 && this.vy < 0 ) {
                                    this.bounces--;
                                    this.vy *= this.e*1.5;
                                    return;
                                }
                                if((game.world.blocks[x+x1][y+y1][z+z1] >> 8) != 0) {
                                    if(this.vy < 0 ) {
                                        this.bounces--;
                                        this.vy *= this.e*1.5;
                                    }
                                    if(this.vx < 0 ) {
                                        this.bounces--;
                                        this.vx *= this.e*2;
                                        this.ray.ray.direction.x *= -1;
                                    } else {
                                        this.bounces--;
                                        this.ray.ray.direction.x *= -1;
                                        this.vx *= -this.e*2;
                                    }

                                    if(this.vz < 0 ) {
                                        this.bounces--;
                                        this.vz *= this.e*2;
                                        this.ray.ray.direction.z *= -1;
                                    } else {
                                        this.bounces--;
                                        this.ray.ray.direction.z *= -1;
                                        this.vz *= -this.e*2;
                                    }

                                }
                            }
                        }
                    }
                }
            }
       } else if(this.type == PHYS_DIE) {
           if(game.world.IsWithinWorld(x,y,z)) {
               if((game.world.blocks[x][y][z] >> 8) != 0 && this.vy < 0) {
                   this.mesh.position.y+=game.world.blockSize*4; 
                   this.mesh.rotation.set(0,0,0);
                   this.vy *= this.e; 
                   this.bounces--;
               }
           }

       } else {
           if(game.world.IsWithinWorld(x,y,z)) {
               if((game.world.blocks[x][y][z] >> 8) != 0 && game.world.IsBlockHidden(x,y,z)) {
                   this.mesh.visible = false;
                   this.active = 0;
                   this.life = 0;
                   this.bounces--;
               } else if((game.world.blocks[x][y][z] >> 8) != 0 && this.vx < 0) {
                   //this.mesh.position.x -= game.world.blockSize; 
                   this.mesh.rotation.set(0,0,0);
                   this.vx *= this.e;
                   this.bounces--;
               } else if((game.world.blocks[x][y][z] >> 8) != 0 && this.vz < 0) {
                   //this.mesh.position.z -= game.world.blockSize*8; 
                   this.mesh.rotation.set(0,0,0);
                   this.vz *= this.e; 
                   this.bounces--;
               } else if((game.world.blocks[x][y][z] >> 8) != 0 && this.vy < 0) {
                   this.mesh.position.y = y+game.world.blockSize*4; 
                   this.mesh.rotation.set(0,0,0);
                   this.vy *= this.e; 
                   this.bounces--;
               }
           }
       }
    };
};

function Phys() {
    this.blocks = new Array();
    this.meshes = new Array(); // TBD: Change name, actually chunks.
    this.size = 1500; // pool size for blocks.
    this.pos = 0;
    this.neg = 0;

    Phys.prototype.Init = function() {
        var b;
        for(var i = 0; i < this.size; i++) {
            b = new PhysBlock();
            b.Init();
            this.blocks.push(b);
        }
    };

    Phys.prototype.Draw = function(time, delta) {
        for(var i = 0; i < this.blocks.length; i++) {
            if(this.blocks[i].active == 1) {
                this.blocks[i].Draw(time,delta);
            }
        }
        for(var i = 0; i < this.meshes.length; i++) {
            if(this.meshes[i].remove == 1) {
                game.scene.remove(this.meshes[i].mesh);
                this.meshes.splice(i,1);
            } else {
                if(this.meshes[i].active == 1) {
                    this.meshes[i].Draw(time, delta);
                } else {
                    //game.scene.remove(this.meshes[i].mesh);
                    this.meshes.splice(i, 1);
                }
            }
        }
    };

    Phys.prototype.CreateMeshBlock = function(chunk) {
        var mb = new MeshBlock();
        mb.Create(chunk);
        this.meshes.push(mb);
    };

    Phys.prototype.Get = function() {
        for(var i = 0; i < this.blocks.length; i++) {
            if(this.blocks[i].active == 0) {
                this.blocks[i].active = 1;
                this.blocks[i].gravity = 9.82; // Reset gravity
                return this.blocks[i];
            }
        }
        return undefined;
    };

    Phys.prototype.Stats = function() {
        var free = 0;
        for(var i = 0; i < this.blocks.length; i++) {
            if(this.blocks[i].active == 0) {
                free++;
            }
        }
        return {"free": free, "total": this.size};
        
    };

}


const WEAPON_ROCKET = 0;
const WEAPON_SHOTGUN = 1;
const WEAPON_NONE = 2;

const MAX_HP = 100;

const MODEL_STAND = 0;
const MODEL_JUMP  = 1;
const MODEL_RUN1 = 2;
const MODEL_RUN2 = 3;
const MODEL_SHOOT = 4;
const MODEL_FALL = 5;
const MOVE_FORWARD = 0;
const MOVE_BACKWARD = 1;
const MOVE_LEFT = 2;
const MOVE_RIGHT = 3;
const MOVE_UP = 4;
const MOVE_DOWN = 5;

function Player () {
    this.name = "John Doe";
    this.hp = 0;
    this.weapon = WEAPON_ROCKET;
    this.rotateAngle = 0;
    this.moveDistance = 0;
    // TBD: Make array of these with constants for lookup
    this.run1Chunk = undefined;
    this.run2Chunk = undefined;
    this.run1RocketChunk = undefined;
    this.run2RocketChunk = undefined;
    this.run1ShotgunChunk = undefined;
    this.run2ShotgunChunk = undefined;
    this.jumpChunk = undefined;
    this.jumpRocketChunk = undefined;
    this.jumpShotgunChunk = undefined;
    this.standChunk = undefined;
    this.standRocketChunk = undefined;
    this.standShotgunChunk = undefined;
    this.fallChunk = undefined;
    this.fallRocketChunk = undefined;
    this.fallShotgunChunk = undefined;
    this.shootChunk = undefined;
    this.shootRocketChunk = undefined;
    this.shootShotgunChunk = undefined;
    
    this.mesh = undefined;
    this.chunk = undefined;
    this.currentModel = MODEL_STAND;
    this.runTime = 0;
    this.jumpTime = 0;
    this.cameraAttached = false;
    this.camera = new THREE.Object3D();
    this.mass = 4;
    this.area = 1;
    this.vy = 1;
    this.avg_ay = 1;
    this.gravity = 9.82;
    this.airDensity = 1.2;
    this.jumping = false;
    this.sampleObjectsTime = 0;
    this.keyboard = new THREEx.KeyboardState();
    this.shooting = false;

    // Camera
    this.attachedCamera = false;
    this.cameraObj = undefined;

    // CD props
    this.canWalkLeft = true;
    this.canWalkRight = true;
    this.canWalkForward = true;
    this.canWalkBackward = true;
    this.canJump = true;
    this.canFall = true;

    Player.prototype.Init = function(name) {
        this.AddBindings();
        this.name = name;
        this.hp = MAX_HP;

//        var chunks = [this.standChunk, this.run1Chunk, this.run2Chunk, this.jumpChunk, this.fallChunk, this.shootChunk];
        var chunks = [
            this.run1Chunk,
            this.run2Chunk,
            this.run1RocketChunk,
            this.run2RocketChunk, 
            this.run1ShotgunChunk,
            this.run2ShotgunChunk,
            this.jumpChunk,
            this.jumpRocketChunk,
            this.jumpShotgunChunk,
            this.standChunk,
            this.standRocketChunk,
            this.standShotgunChunk, 
            this.fallChunk,
            this.fallRocketChunk,
            this.fallShotgunChunk,
            this.shootChunk,
            this.shootRocketChunk,
            this.shootShotgunChunk
        ]; 
        for(var i = 0; i < chunks.length; i++) {
            var mesh = chunks[i].mesh;
            mesh.position.set(0,0,0);
            mesh.rotation.set(0,0,0);
            mesh.geometry.center();
            mesh.geometry.verticesNeedUpdate = true;
        }
        this.SwitchModel(MODEL_STAND);
        this.mesh.position.set(153,21, 55);

        this.cameraObj = new THREE.Object3D();
        this.cameraObj.add(game.camera);
        
        this.attachedCamera = true;
        game.camera.position.set(0, 400, 0);
        game.camera.lookAt(this.cameraObj);
        game.camera.rotation.set(-1.57, 0, 0),
        game.camera.quaternion.set(-0.7, 0, 0, 0.7);
        this.cameraObj.rotation.set(Math.PI/1.5, 0, -Math.PI);
        this.weapon = WEAPON_SHOTGUN;

    };

    Player.prototype.SwitchModel = function(model) {
        if(this.shooting) {
            return;
        }
        if(this.currentModel == model && this.mesh != undefined) {
            return;
        }

        var pos, rot;
        if(this.mesh != undefined) {
            this.mesh.remove(this.cameraObj);
            this.mesh.visible = false;
            pos = this.mesh.position;
            rot = this.mesh.rotation;
        } else {
            pos = new THREE.Vector3(0,0,0);
            rot = new THREE.Vector3(0,0,0);
        }

        switch(model) { 
            case MODEL_JUMP:
                switch(this.weapon) {
                case WEAPON_SHOTGUN:
                    this.mesh = this.jumpShotgunChunk.mesh;
                    this.chunk = this.jumpShotgunChunk;
                    break;
                case WEAPON_ROCKET:
                    this.mesh = this.jumpRocketChunk.mesh;
                    this.chunk = this.jumpRocketChunk;
                    break;
                case WEAPON_NONE:
                    this.mesh = this.jumpChunk.mesh;
                    this.chunk = this.jumpChunk;
                break;
            }
            break;
            case MODEL_STAND:
                switch(this.weapon) {
                case WEAPON_SHOTGUN:
                    this.mesh = this.standShotgunChunk.mesh;
                    this.chunk = this.standShotgunChunk;
                break;
                case WEAPON_ROCKET:
                    this.mesh = this.standRocketChunk.mesh;
                    this.chunk = this.standRocketChunk;
                break;
                case WEAPON_NONE:
                    this.mesh = this.standChunk.mesh;
                    this.chunk = this.standChunk;
                break;
            }
            break;
            case MODEL_RUN1:
                switch(this.weapon) {
                case WEAPON_SHOTGUN:
                    this.mesh = this.run1ShotgunChunk.mesh;
                    this.chunk = this.run1ShotgunChunk;
                break;
                case WEAPON_ROCKET:
                    this.mesh = this.run1RocketChunk.mesh;
                    this.chunk = this.run1RocketChunk;
                break;
                case WEAPON_NONE:
                    this.mesh = this.run1Chunk.mesh;
                    this.chunk = this.run1Chunk;
                break;
            }
            break;
            case MODEL_RUN2:
                switch(this.weapon) {
                case WEAPON_SHOTGUN:
                    this.mesh = this.run2ShotgunChunk.mesh;
                    this.chunk = this.run2ShotgunChunk;
                break;
                case WEAPON_ROCKET:
                    this.mesh = this.run2RocketChunk.mesh;
                    this.chunk = this.run2RocketChunk;
                break;
                case WEAPON_NONE:
                this.mesh = this.run2Chunk.mesh;
                this.chunk = this.run2Chunk;
                break;
            }
            break;
            case MODEL_SHOOT:
                switch(this.weapon) {
                case WEAPON_SHOTGUN:
                    this.mesh = this.shootShotgunChunk.mesh;
                this.chunk = this.shootShotgunChunk;
                break;
                case WEAPON_ROCKET:
                    this.mesh = this.shootRocketChunk.mesh;
                this.chunk = this.shootRocketChunk;
                break;
                case WEAPON_NONE:
                    this.mesh = this.shootChunk.mesh;
                this.chunk = this.shootChunk;
                break;
            }
            break;
            case MODEL_FALL:
                switch(this.weapon) {
                case WEAPON_SHOTGUN:
                    this.mesh = this.fallShotgunChunk.mesh;
                this.chunk = this.fallShotgunChunk;
                break;
                case WEAPON_ROCKET:
                    this.mesh = this.fallRocketChunk.mesh;
                this.chunk = this.fallRocketChunk;
                break;
                case WEAPON_NONE:
                    this.mesh = this.fallChunk.mesh;
                this.chunk = this.fallChunk;
                break;
            }
            break;
            default:
                this.mesh = this.standChunk.mesh;
                this.chunk = this.standChunk;
        }
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.rotation.set(rot.x, rot.y, rot.z);
        this.currentModel = model;
        this.mesh.updateMatrixWorld();
        this.mesh.add(this.cameraObj);
        this.mesh.visible = true;
    };

    Player.prototype.AddBindings = function() {
        $(document).mouseup(this.OnMouseUp.bind(this));
	    $(document).mousemove(this.OnMouseMove.bind(this));
	    $(document).mousedown(this.OnMouseDown.bind(this));
//	    $(document).keydown(this.KeyDown.bind(this));
    };

    
    Player.prototype.RemoveBindings = function() {
        $(document).unbind('mouseup');
	    $(document).unbind('mousemove');
        $(document).unbind('mousedown');
    };

    Player.prototype.OnMouseMove = function(jevent) {
        var event = jevent.originalEvent; 
        var movementX = event.movementX || event.mozMovementX  ||0;
        var movementZ = event.movementZ || event.mozMovementZ  || 0;
        var x = movementX*0.001;
        var z = movementZ*0.001;

        if(this.mesh != undefined) {
            var axis = new THREE.Vector3(0,1,0);
            var rotObjectMatrix = new THREE.Matrix4();
            rotObjectMatrix.makeRotationAxis(axis.normalize(), -(Math.PI/2)*x);
            this.mesh.matrix.multiply(rotObjectMatrix);
            this.mesh.rotation.setFromRotationMatrix(this.mesh.matrix);
        }
    };

    Player.prototype.OnMouseDown = function(event) {
        if(this.dead) {
            return;
        }
        var mouseButton = event.keyCode || event.which;
        if(mouseButton != 1) {
            return;
        }
        this.SwitchModel(MODEL_SHOOT);
        this.shooting = true;
    };

    Player.prototype.OnMouseUp = function(event) {
        if(this.dead) {
            return;
        }
        var mouseButton = event.keyCode || event.which;
        if(mouseButton == 1) {
            switch(this.weapon) {
                case WEAPON_ROCKET:
                    this.CreateMissile();
                    break;
                case WEAPON_SHOTGUN:
                    this.CreateShot();
                    break;
            }
            this.shooting = false;
        } else if(mouseButton == 3) {
            this.CreateGrenade();
        }
    };

    Player.prototype.CreateGrenade = function() {
        var block = game.phys.Get();

        var pos = new THREE.Vector3(3,2,5);
        var gpos = pos.applyMatrix4(this.mesh.matrix);
                                                          
        if(block != undefined) {
            block.Create(gpos.x,
                         gpos.y,
                         gpos.z,
                         0, // R 
                         66, // G
                         0, // B
                         5, // force 
                         4, // life,
                         PHYS_GRENADE,
                         1000, // bounces
                         0.1 // mass
                        );
           block.mesh.scale.set(1.5,1.5,1.5);
        }


    };

    Player.prototype.CreateShot = function() {

        var pos1 = new THREE.Vector3(3,0,3);
        var gpos1 = pos1.applyMatrix4(this.mesh.matrix);

        var pos2 = new THREE.Vector3(-3,0,3);
        var gpos2 = pos2.applyMatrix4(this.mesh.matrix);

        for(var i = 0; i < 10; i++) {
            var smoke = game.phys.Get();
            var color = 150+lfsr.rand()*105 | 0;
            if(smoke != undefined) {
                smoke.gravity = -1;
                smoke.Create(gpos1.x,
                             gpos1.y+1,
                             gpos1.z,
                             color,
                             color,
                             color,
                             lfsr.rand()*1, 1, PHYS_SMOKE);

            }
            var smoke2 = game.phys.Get();
            var color = 150+lfsr.rand()*105 | 0;
            if(smoke2 != undefined) {
                smoke2.gravity = -1;
                smoke2.Create(gpos2.x,
                              gpos2.y+1,
                              gpos2.z,
                              color,
                              color,
                              color,
                              lfsr.rand()*1, 1, PHYS_SMOKE);

            }
        }
        for(var i = 0; i < 10; i++) {
            var block2 = game.phys.Get();
            if(block2 != undefined) {
                block2.Create(gpos1.x+(2-lfsr.rand()*4),
                             gpos1.y+(2-lfsr.rand()*4),
                             gpos1.z+(2-lfsr.rand()*4),
                             0, // R 
                             0, // G
                             0, // B
                             20, // force 
                             0.5, // life,
                             PHYS_SHOT,
                             1 // bounces
                             );
                block2.mesh.scale.set(0.5,0.5,0.5);
            }
            var block = game.phys.Get();
            if(block!= undefined) {
                block.Create(gpos2.x+(2-lfsr.rand()*4),
                             gpos2.y+(2-lfsr.rand()*4),
                             gpos2.z+(2-lfsr.rand()*4),
                             0, // R 
                             0, // G
                             0, // B
                             20, // force 
                             0.5, // life,
                             PHYS_SHOT,
                             1 // bounces
                            );
                block.mesh.scale.set(0.5,0.5,0.5);
            }
        }
    };

    Player.prototype.CreateMissile = function() {
        var block = game.phys.Get();

        var pos = new THREE.Vector3(3,2,5);
        var gpos = pos.applyMatrix4(this.mesh.matrix);
                                                          
        if(block != undefined) {
            for(var i = 0; i < 20; i++) {
                var smoke = game.phys.Get();
                var color = 150+lfsr.rand()*105 | 0;
                if(smoke != undefined) {
                    smoke.gravity = -1;
                    smoke.Create(gpos.x,
                                 gpos.y+1,
                                 gpos.z,
                                 color,
                                 color,
                                 color,
                                 lfsr.rand()*1, 1, PHYS_SMOKE);

                }
            }
            block.Create(gpos.x,
                         gpos.y,
                         gpos.z,
                         0xff, // R 
                         0x8c, // G
                         0, // B
                         20, // force 
                         1, // life,
                         PHYS_MISSILE,
                         1 // bounces
                        );
        }
    };

    // TBD: Might only have one weapon?
    Player.prototype.ChangeWeapon = function(weapon_id) {
        this.weapon = weapon_id;
    };

    Player.prototype.CanMove = function(type) {
        //this.mesh.updateMatrixWorld();
        for (var i = 0; i < this.chunk.blockList.length; i+=2) {
            var b = this.chunk.blockList[i];

            if(type == MOVE_FORWARD && b.z < 11) {
                continue;
            } else if(type == MOVE_BACKWARD && b.z > 7) {
                continue;
            } else if(type == MOVE_LEFT && b.x < 10) {
                continue;
            } else if(type == MOVE_RIGHT && b.x > 5) {
                continue;
            } else if(type == MOVE_UP && (b.x < 6  || b.x > 7 || b.z > 9 )) {
                continue;
            } else if(type == MOVE_DOWN && b.y-3 > 2) {
                continue;
            }
            var lvector = new THREE.Vector3(b.x-7,b.y-10,b.z-10);
            var vector = lvector.applyMatrix4( this.mesh.matrix );
            var xi = vector.x| 0;
            var yi = vector.y| 0;
            var zi = vector.z| 0;
            xi+=7;
            zi+=10;

            // Keep head down
            if(type == MOVE_UP) {
                yi+=2; 
            }

            if(game.world.IsWithinWorld(xi,yi,zi)) {
                if((game.world.blocks[xi][yi][zi] >> 8) != 0) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    };

    Player.prototype.KeyDown = function() {
        if(this.keyboard.pressed("1")) {
            this.weapon = WEAPON_ROCKET;
        }
        if(this.keyboard.pressed("2")) {
            this.weapon = WEAPON_SHOTGUN;
        }
        if(this.keyboard.pressed("3")) {
            this.weapon = WEAPON_NONE;
        }
        if(this.keyboard.pressed("K")) {
            this.Die();
        }
        if(this.keyboard.pressed("n")) {
            this.mesh.position.x+=5;
        }
        if(this.keyboard.pressed("m")) {
            this.mesh.position.x-=5;
        }
        if(this.keyboard.pressed("p")) {
            console.log(this.mesh.position);
        }

        if(this.keyboard.pressed("W") && this.canWalkForward) {
            this.mesh.translateZ( this.moveDistance );
            
            if(!this.CanMove(MOVE_FORWARD)) {
                this.mesh.translateZ(-this.moveDistance);
            }

            this.Run();
        }
        if(this.keyboard.pressed("S") && this.canWalkBackward) {
            this.mesh.translateZ( -this.moveDistance );

            if(!this.CanMove(MOVE_BACKWARD)) {
                this.mesh.translateZ(this.moveDistance);
            }
            this.Run();
        }
        if(this.keyboard.pressed("A") && this.canWalkLeft) {
            this.mesh.translateX( this.moveDistance );

            if(!this.CanMove(MOVE_LEFT)) {
                this.mesh.translateX(-this.moveDistance);
            }
            this.Run();
        }
        if(this.keyboard.pressed("D") && this.canWalkRight) {
            this.mesh.translateX( -this.moveDistance );

            if(!this.CanMove(MOVE_RIGHT)) {
                this.mesh.translateX(this.moveDistance);
            }
            this.Run();
        }
        if(this.keyboard.pressed("space")) {
            this.jumpTime = 0;
            this.mesh.translateY( this.moveDistance );
            var x = Math.round(this.mesh.position.x+6);
            var y = Math.round(this.mesh.position.y+3);
            var z = Math.round(this.mesh.position.z+6);
            if(!this.CanMove(MOVE_UP)) {
                this.mesh.translateY(-this.moveDistance);
            }
            this.SwitchModel(MODEL_JUMP);
            this.jumping = true;
            this.canFall = true;
            var pos1 = new THREE.Vector3(-1,-3,-3);
            var gpos1 = pos1.applyMatrix4(this.mesh.matrix);
            var pos2 = new THREE.Vector3(1,-3,-3);
            var gpos2 = pos2.applyMatrix4(this.mesh.matrix);
            for(var i = 0; i < 5; i++) {
                var smoke1 = game.phys.Get();
                var smoke2 = game.phys.Get();
                if(smoke1 != undefined) {
                    smoke1.gravity = -1;
                    smoke1.Create(gpos1.x,
                                  gpos1.y+1,
                                  gpos1.z,
                                  255,
                                  255,
                                  255,
                                  -lfsr.rand()*10, 0.2, PHYS_SMOKE);
                }
                if(smoke2 != undefined) {
                    smoke2.gravity = -1;
                    smoke2.Create(gpos2.x,
                                  gpos2.y+1,
                                  gpos2.z,
                                  255,
                                  255,
                                  255,
                                  -lfsr.rand()*10, 0.2, PHYS_SMOKE);
                }
            }
        }
    };

    Player.prototype.KeyUp = function() {
        if(this.keyboard.pressed("space")) {
           // this.jumping = false;
        }
    };

    Player.prototype.Run = function() {
        if(this.runTime > 0.2) {
            if(this.currentModel == MODEL_RUN2) {
                this.SwitchModel(MODEL_RUN1);
            } else {
                this.SwitchModel(MODEL_RUN2);
            }
            this.runTime = 0;
        }
    };

    Player.prototype.Draw = function(time, delta) {
        if(this.mesh == undefined) {
            return;
        }
        this.KeyDown();
        this.KeyUp();

        // Smoke when falling
        if(this.currentModel == MODEL_FALL) {
            if(lfsr.rand() > 0.8) {
                var pos1 = new THREE.Vector3(-1,-2,-4);
                var gpos1 = pos1.applyMatrix4(this.mesh.matrix);
                var smoke1 = game.phys.Get();
                if(smoke1 != undefined) {
                    smoke1.gravity = -1;
                    smoke1.Create(gpos1.x,
                                  gpos1.y+1,
                                  gpos1.z,
                                  255,
                                  255,
                                  255,
                                  -lfsr.rand()*10, 0.2, PHYS_SMOKE);
                }
            }

            if(lfsr.rand() > 0.8) {
                var smoke2 = game.phys.Get();
                var pos2 = new THREE.Vector3(1,-2,-4);
                var gpos2 = pos2.applyMatrix4(this.mesh.matrix);
                if(smoke2 != undefined) {
                    smoke2.gravity = -1;
                    smoke2.Create(gpos2.x,
                                  gpos2.y+1,
                                  gpos2.z,
                                  255,
                                  255,
                                  255,
                                  -lfsr.rand()*10, 0.2, PHYS_SMOKE);
                }
            }
        }

        this.rotateAngle = (Math.PI / 1.5) * delta ;
        this.moveDistance = 70 * delta;
        this.runTime += delta;
        this.jumpTime += delta;

        if(this.runTime > 0.25 && this.currentModel != MODEL_JUMP && this.currentModel != MODEL_FALL) {
            this.SwitchModel(MODEL_STAND);
        }
        if(this.jumpTime > 0.1) {
            this.jumping = false;
        }
        var x = Math.round(this.mesh.position.x+6+2);
        var y = Math.round(this.mesh.position.y-7);
        var z = Math.round(this.mesh.position.z+6+2);

        for(var x1 = x; x1 < x+4; x1++) {
            for(var z1 = z; z1 < z+4; z1++) {
                if(game.world.IsWithinWorld(x1,y,z1)) {
                    if(game.world.blocks[x1][y][z1] == 0) {
                        this.canFall = true;
                    }
                }
            }
        }


        if(this.mesh != undefined && this.jumping != true && this.canFall) {
            //this.SwitchModel(MODEL_FALL);
            var fy = this.mass*this.gravity;
            fy += -1 * 0.5 * this.airDensity * this.area * this.vy * this.vy;
            var dy = this.vy * delta + (0.5 * this.avg_ay * delta * delta);

            //var wy = Math.floor(y+(dy));
            this.mesh.translateY(-dy*100);
            var new_ay = fy / this.mass;
            this.avg_ay = 0.5 * (new_ay + this.avg_ay);
            for(var x1 = x; x1 < x+4; x1++) {
                for(var z1 = z; z1 < z+4; z1++) {
                    if(game.world.IsWithinWorld(x1,y,z1)) {
                        if(game.world.blocks[x1][y][z1] != 0) {
                            if(this.currentModel == MODEL_FALL) {
                                this.SwitchModel(MODEL_STAND);
                            }
                            this.mesh.translateY(dy*100);
                            this.canFall = false;
                            return;
                        }
                    } else {
                        this.canFall = false;
                        this.SwitchModel(MODEL_STAND);
                        this.vy -= this.avg_ay * delta;
                        return;
                    }
                }
            }
            this.SwitchModel(MODEL_FALL);
        } else {
            if(this.currentModel == MODEL_FALL) {
                this.SwitchModel(MODEL_STAND);
            }
        }

    };

    Player.prototype.Die = function() {
        // Explode player.
        console.log("Player died.");
        for (var i = 0; i < this.chunk.blockList.length; i+=3) {
            var bl = this.chunk.blockList[i];
            var lvector = new THREE.Vector3(bl.x-7,bl.y-10,bl.z-10);
            var vector = lvector.applyMatrix4( this.mesh.matrix );
            var xi = vector.x| 0;
            var yi = vector.y| 0;
            var zi = vector.z| 0;
            xi+=7;
            zi+=10;
            var block = game.phys.Get();
            if(block != undefined) {
                r = bl.color[0];
                g = bl.color[1];
                b = bl.color[2];
                block.Create(vector.x, 
                             vector.y, 
                             vector.z, 
                             r,
                             g,
                             b,
                             lfsr.rand()*5, 3, PHYS_DIE);
            }
        }
        this.mesh.visible=false;

    };

    Player.prototype.Spawn = function(x,y,z) {
        // Box of blocks -> remove all but the ones in mesh.

    };
}


function Proc() {
    this.worldSize = 0;
    this.worldSpace = 0;
    this.landHeight = 4;

    this.currentType = 0;

    this.addBuffer = [];
    this.lastBuffer = [];
    this.freeDraw = [];

    Proc.prototype.DrawType = function(x, y, z) {
        switch(this.currentType) {
            case 2: // block 
             this.Block(x, y, z, 0);
             break;
            case 3: // Remove
             this.Block(x, y, z, 1);
             break;
            case 4: // Free Draw
             this.FreeDrawBlock();
             break;
            case 5: // Explode
                game.world.Explode(x,y,z, 10, false);
             break;
            case 6: // Explode w/o haning blocks
                game.world.Explode(x,y,z, 10, true);
             break;
        }
        //game.world.RebuildDirtyChunks();
    };

    Proc.prototype.FreeDrawock = function() {
       var from = this.freeaw.pop();
       var to = this.freeDr.pop();
       var height = $('#heit').text();
       var color = $('#colo').text();

       var fx,tx,fz,tz;
       if(from.x < to.x) {
           fx = to.x;
           tx = from.x;
       } else {
           fx = from.x;
           tx = to.x;
       }
       if(from.z < to.z) {
           fz = to.z;
           tz = from.z;
       } else {
           fz = from.z;
           tz = to.z;
       }

       for(var x = tx; x < fx; x++) {
           for(var z = tz; z < fz; z++) {
               for(var y = 0; y < height; y++) {
                    this.Add(x, y, z, color);
                    this.lastBuffer.push(new THREE.Vector3(x,y,z));
               }
           }
       }
    };

    Proc.prototype.Add = function(x,y,z,color) {
        game.world.AddBlock(x,y,z, color);
        this.addBuffer.push(new THREE.Vector3(x,y,z));
    };

    Proc.prototype.UndoLast = function() {
        var blockPos;
        while((blockPos = this.lastBuffer.pop()) != undefined) {
            game.world.RemoveBlock(blockPos.x, blockPos.y, blockPos.z);
            this.addBuffer.pop();
        }
        game.world.RebuildDirtyChunks();
    };

    Proc.prototype.Undo = function() {
        var blockPos = this.addBuffer.pop();
        if(blockPos != undefined) {
            game.world.RemoveBlock(blockPos.x, blockPos.y, blockPos.z);
            this.lastBuffer.pop();
            game.world.RebuildDirtyChunks();
        }
    };

    Proc.prototype.Remove = function(x, y, z) {
        // TBD: Clean up undo buffers
        game.world.RemoveBlock(x, y, z);
    };

    Proc.prototype.Block = function(posX, posY, posZ, type) {
        var width = $('#width').text();
        var height = $('#height').text();
        var color = $('#color2').text();
        
        this.lastBuffer = [];

        if(width == 1) {
            for(var y = 0; y < height; y++) {
                if(type == 0) {
                    this.Add(posX, posY+y, posZ, color);
                    this.lastBuffer.push(new THREE.Vector3(posX, posY+y, posZ));
                } else {
                    this.Remove(posX, posY+y, posZ);
                }
            }
        } else {
            for(var x = posX-width/2; x < posX+width/2; x++) {
                for(var z = posZ-width/2; z < posZ+width/2; z++) {
                    for(var y = 0; y < height; y++) {
                        if(type == 0) {
                            this.Add(x, posY+y, z, color);
                            this.lastBuffer.push(new THREE.Vector3(x, posY+y, z));
                        } else {
                            this.Remove(x, posY+y, z);
                        }
                    }
                }
            }
        }
    };

    Proc.prototype.Mushroom = function() {
        var pos = this.GetRandomPoint();
        var stemHeight = this.landHeight;
        var base = stemHeight+8;
        for (var z = 0; z < base; z++) {
            for (var y = base-1; y > base/2; y--) {
                for (var x = 0; x < base; x++){
                    if (Math.sqrt( (x-base/2)*(x-base/2) + (y-base/2)*(y-base/2) + (z-base/2)*(z-base/2)) <= base/2)
                        {
                            game.world.AddBlock(pos.x+x, y, pos.z+z, Math.random()>0.9? 8: 10);
                        }
                }
            }
        }
        var stemMin = 2;
        var stemMax = 6;
        for(var y = 0; y < stemHeight; y++) {
            if(stemMax > stemMin) {
                stemMax--;
            }
            for(var x = 0; x < stemMax; x++) {
                for(var z = 0; z < stemMax; z++) {
                    game.world.AddBlock(pos.x+x+(base/stemMax), stemHeight+y, pos.z+z+(base/stemMax), 8);
                }
            }
        }
    };



    Proc.prototype.GetRandomPoint = function() {
        return new THREE.Vector3(Math.round(Math.random()*game.world.worldSize),0,
                                 Math.round(Math.random()*game.world.worldSize));
    };

    Proc.prototype.Init = function(worldSize) {
        this.worldSize = worldSize;

        this.worldSpace = new Array(worldSize);
        for(var x = 0; x < this.worldSpace.length; x++) {
            this.worldSpace[x] = new Array(worldSize);
            for(var z = 0; z < this.worldSpace[x].length; z++) {
                this.worldSpace[x][z] = 0;
            }
        }
    };

    Proc.prototype.CheckFreeSpace = function(x_,z_,size) {
        for(var x = x_ - size/2; x < x_+size/2; x++) {
            for(var z = z_ - size/2; z < z_+size/2; z++) {
                if(this.worldSpace[x][z] != 0) {
                    return 0;
                }
            }
            if(fail) {
                return 0;
            }
        }
        return 1;
    };

    Proc.prototype.Tree = function() {
        var height = Math.round(Math.random()*game.world.chunkHeight);
        var width = 3+Math.round(Math.random()*10);
        var pos = this.GetRandomPoint();

        for(var y = this.landHeight; y < this.landHeight+height; y++) {
            if(width > 3) { 
                width--;
            }
            for(var x = 0; x < width; x++) {
                for(var z = 0; z < width; z++) {
                    var offset = Math.round(Math.sin(y));
                    game.world.AddBlock(pos.x+x+offset, y, pos.z+z+offset, 7);
                }
            }
        }


        //DrawSphere(_x, top, _z, 40, 12, 40, 26571);
    };

   // Proc.prototype.Block = function(size, height) {
   //     var pos = this.GetRandomPoint();
   //     for(var x = 0; x < size; x++) {
   //         for(var z = 0; z < size; z++) {
   //             for(var y = this.landHeight; y < this.landHeight+height; y++) {
   //                 game.world.AddBlock(pos.x+x, y, pos.z+z, 5);
   //             }
   //         }
   //     }
   // };

    Proc.prototype.GetRand = function(min,max) {
        return Math.round(min+Math.random()*(max-min));
    };

    Proc.prototype.Rock = function() {
        var pos = this.GetRandomPoint();
        var w1 = this.GetRand(10,40);
        var w2 = this.GetRand(10,40);
        var h = this.GetRand(this.landHeight+5, game.world.chunkHeight);
        var drawMax = 0;
        var low1 = this.GetRand(1,w1/this.GetRand(3,6));
        var low2 = this.GetRand(1,w2/this.GetRand(3,6));
        
        var debRange = 5;
        for(var x = -debRange; x < w1+debRange; x++) {
            for(var z = -debRange; z < w2+debRange; z++) {
                if(Math.random()>0.9) {
                    game.world.AddBlock(pos.x+x, this.landHeight, pos.z+z, Math.random()>0.5? 0: 1);
                }
            }
        }

        for(var x = 0; x < w1; x++) {
            for(var z = 0; z < w2; z++) {
                drawMax = 0;
                if((x < low1 || z < low2 || x > w1 - low1 || z > w2 - low2)) {
                    drawMax = this.GetRand(2,h);
                    
                } else {
                    drawMax = h;
                }
                
                for(var y = this.landHeight; y < drawMax; y++) {
                    if(y > drawMax-2) {
                        Math.random()>0.9? false: game.world.AddBlock(pos.x+x, y, pos.z+z, Math.random()>0.9? 2: 3);
                    } else if(y < this.landHeight+4) {
                        Math.random()<0.5? game.world.AddBlock(pos.x+x, y, pos.z+z, Math.random()>0.9? 11: 12): 
                                           game.world.AddBlock(pos.x+x, y, pos.z+z, Math.random()>0.9? 0: 1);
                    } else {
                        Math.random()>0.1? game.world.AddBlock(pos.x+x, y, pos.z+z, Math.random()>0.9? 11: 12): false;
                        if(Math.random()>0.95) {
                            game.world.AddBlock(pos.x+x, y+2, pos.z+z, Math.random()>0.9? 2: 11);
                        }
                    }
                }
            }
        }
    };


    Proc.prototype.Flower3 = function() {
        var pos = this.GetRandomPoint();
        var maxZ = 1+Math.round(Math.random()*2);
        var zCurrent = 0;
        for(var x = 0; x < maxZ+2; x++) {
            for(var z = 0; z < zCurrent; z++) {
                game.world.AddBlock(pos.x+x, this.landHeight+1, pos.z+z, 5);
                game.world.AddBlock(pos.x+x, this.landHeight+1, pos.z-z, 5);
                game.world.AddBlock(pos.x+(maxZ+1)*2-x, this.landHeight+1, pos.z-z, 5);
                game.world.AddBlock(pos.x+(maxZ+1)*2-x, this.landHeight+1, pos.z+z, 5);
            }
            zCurrent++;
        }
        var y = this.landHeight;
        var height = y+6+Math.round(Math.random()*4);
        for(var h = y; h < height; h++) {
            // stem
            game.world.AddBlock(pos.x+maxZ+1, h, pos.z, 5);
            // Pistil
            if(h%2) {
                if(Math.random()>0.5) {
                    game.world.AddBlock(pos.x+maxZ+1, h, pos.z+1, 6);
                    game.world.AddBlock(pos.x+maxZ+2, h, pos.z, 10);
                } else {
                    game.world.AddBlock(pos.x+maxZ+1, h, pos.z-1, 6);
                    game.world.AddBlock(pos.x+maxZ, h, pos.z, 10);
                }
            }
        }
        game.world.AddBlock(pos.x+maxZ+1, height, pos.z, Math.random()>0.5? 10: 6);
    };

    Proc.prototype.Flower2 = function() {
        var pos = this.GetRandomPoint();
        var maxZ = 1+Math.round(Math.random()*2);
        var zCurrent = 0;
        for(var x = 0; x < maxZ+2; x++) {
            for(var z = 0; z < zCurrent; z++) {
                game.world.AddBlock(pos.x+x, this.landHeight, pos.z+z, 5);
                game.world.AddBlock(pos.x+x, this.landHeight, pos.z-z, 5);
                game.world.AddBlock(pos.x+(maxZ+1)*2-x, this.landHeight, pos.z-z, 5);
                game.world.AddBlock(pos.x+(maxZ+1)*2-x, this.landHeight, pos.z+z, 5);
            }
            zCurrent++;
        }
        // Stem
        var y = this.landHeight;
        var height = y+1+Math.round(Math.random()*4);
        for(var h = y+1; h < height; h++) {
            game.world.AddBlock(pos.x+maxZ+1, h, pos.z, 5);
        }
        // Pistil
        game.world.AddBlock(pos.x+maxZ+1, height, pos.z+1, 8);
        game.world.AddBlock(pos.x+maxZ+1, height, pos.z-1, 8);
        game.world.AddBlock(pos.x+maxZ+2, height, pos.z, 8);
        game.world.AddBlock(pos.x+maxZ, height, pos.z, 8);

        game.world.AddBlock(pos.x+maxZ+1, height, pos.z, Math.random()>0.5? 6: 9);
    };

    Proc.prototype.Flower1 = function() {
        var height = this.GetRand(2,4);
        var pos = this.GetRandomPoint();
        for(var y = this.landHeight; y < this.landHeight+height; y++) {
            game.world.AddBlock(pos.x, y, pos.z, 4);
        }
        game.world.AddBlock(pos.x, y, pos.z, 6);
    };

    Proc.prototype.Grass = function() {
        var pos = this.GetRandomPoint();
        var maxY = 2+Math.round(Math.random()*2);
        var yCurrent = 0;
        for(var x = 0; x < maxY+2; x++) {
            for(var y = 0; y < yCurrent; y++) {
                game.world.AddBlock(pos.x+x, this.landHeight+y, pos.z, 5);
                game.world.AddBlock(pos.x+(maxY+1)*2-x, this.landHeight+y, pos.z, 5);
            }
            yCurrent++;
        }
    };

    Proc.prototype.Land = function(size) {
        var color = 0;
        for(var y = 0; y < this.landHeight; y++) { 
            for(var x = 0; x < size; x++) {
                for(var z = 0; z < size; z++) {
                    var pattern = Math.random()*10 > 9? true: false;
                    if(y == this.landHeight-1) {
                        if(pattern) {
                            color = 2;
                        } else {
                            color = 3;
                        }
                    } else {
                        color = 0;
                    }
                    game.world.AddBlock(x,y,z, color);
                }
            }
        }
    };
};


// https://en.wikipedia.org/wiki/Linear_feedback_shift_register
var lfsr = (function(){
  var max = Math.pow(2, 16),
      period = 0,
      seed, out;
  return {
    setSeed : function(val) {
      out = seed = val || Math.round(Math.random() * max);
    },
    rand : function() {
      var bit;
      // From http://en.wikipedia.org/wiki/Linear_feedback_shift_register
      bit  = ((out >> 0) ^ (out >> 2) ^ (out >> 3) ^ (out >> 5) ) & 1;
      out =  (out >> 1) | (bit << 15);
      period++;
      return out / max;
    }
  };
}());

// Set seed
lfsr.setSeed();


//==============================================================================
// Author: Nergal
// http://webgl.nu
// Date: 2014-11-17
//==============================================================================
const TYPE_OBJECT = 0;
const TYPE_MAP = 1;

function VoxelData() {
    this.x;
    this.y;
    this.z;
    this.color;

    VoxelData.prototype.Create = function(buffer, i, subSample) {
        this.x = (subSample? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF);
        this.y = (subSample? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF);
        this.z = (subSample? buffer[i] & 0xFF / 2 : buffer[i++] & 0xFF);
        this.color = buffer[i] & 0xFF;
    };
}
VoxelData.prototype = new VoxelData();
VoxelData.prototype.constructor = VoxelData;

function Vox() {
    var voxColors = [0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff, 0xff00ffff, 0xffffccff, 0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff, 0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff,
        0xff6699ff, 0xff3399ff, 0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff, 0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff, 0xff0033ff, 0xffff00ff,
        0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff, 0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc, 0xff66ffcc, 0xff33ffcc, 0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc,
        0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc, 0xff0099cc, 0xffff66cc, 0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc, 0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc,
        0xff6633cc, 0xff3333cc, 0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc, 0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99, 0xff00ff99, 0xffffcc99,
        0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99, 0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999, 0xff669999, 0xff339999, 0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699,
        0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399, 0xff003399, 0xffff0099, 0xffcc0099, 0xff990099, 0xff660099, 0xff330099, 0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66,
        0xff66ff66, 0xff33ff66, 0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66, 0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966, 0xff009966, 0xffff6666,
        0xffcc6666, 0xff996666, 0xff666666, 0xff336666, 0xff006666, 0xffff3366, 0xffcc3366, 0xff993366, 0xff663366, 0xff333366, 0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066,
        0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33, 0xff00ff33, 0xffffcc33, 0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33, 0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933,
        0xff669933, 0xff339933, 0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633, 0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333, 0xff003333, 0xffff0033,
        0xffcc0033, 0xff990033, 0xff660033, 0xff330033, 0xff000033, 0xffffff00, 0xffccff00, 0xff99ff00, 0xff66ff00, 0xff33ff00, 0xff00ff00, 0xffffcc00, 0xffcccc00, 0xff99cc00, 0xff66cc00, 0xff33cc00,
        0xff00cc00, 0xffff9900, 0xffcc9900, 0xff999900, 0xff669900, 0xff339900, 0xff009900, 0xffff6600, 0xffcc6600, 0xff996600, 0xff666600, 0xff336600, 0xff006600, 0xffff3300, 0xffcc3300, 0xff993300,
        0xff663300, 0xff333300, 0xff003300, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000, 0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077, 0xff000055, 0xff000044,
        0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00, 0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700, 0xff005500, 0xff004400, 0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000,
        0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000, 0xffeeeeee, 0xffdddddd, 0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777, 0xff555555, 0xff444444, 0xff222222, 0xff111111];


    Vox.prototype.readInt = function(buffer, from) {
        return buffer[from]| (buffer[from+1] << 8) |  (buffer[from+2] << 16) | (buffer[from+3] << 24);
    };

    Vox.prototype.LoadModel = function(filename, loadptr, name, type) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", filename, true);
        oReq.responseType = "arraybuffer";

        var chunk = 0;
        if(type == TYPE_OBJECT) {
            chunk = new Chunk();
            chunk.type = 1; // TBD: OBJECT ( MAGIC NUMBER)
            chunk.blockList = new Array();
        }

        var that = this;
        oReq.onload = function (oEvent) {
            var colors = [];
            var colors2 = undefined;
            var voxelData = [];

            console.log("Loaded model: "+oReq.responseURL);
            var arrayBuffer = oReq.response;
            if (arrayBuffer) {
                var buffer = new Uint8Array(arrayBuffer);
                var voxId = that.readInt(buffer, 0);
                var version = that.readInt(buffer, 4);
                // TBD: Check version to support
                var i = 8;
                while(i < buffer.length) {
                    var subSample = false;
                    var sizex = 0, sizey = 0, sizez = 0;
                    var id = String.fromCharCode(parseInt(buffer[i++]))+
                             String.fromCharCode(parseInt(buffer[i++]))+
                             String.fromCharCode(parseInt(buffer[i++]))+
                             String.fromCharCode(parseInt(buffer[i++]));

                    var chunkSize = that.readInt(buffer, i) & 0xFF;
                    i += 4;
                    var childChunks = that.readInt(buffer, i) & 0xFF;
                    i += 4;

                    if(id == "SIZE") {
                        sizex = that.readInt(buffer, i) & 0xFF;
                        i += 4;
                        sizey = that.readInt(buffer, i) & 0xFF;
                        i += 4;
                        sizez = that.readInt(buffer, i) & 0xFF;
                        i += 4;
                        if (sizex > 32 || sizey > 32) {
                            subSample = true;
                        }
                        i += chunkSize - 4 * 3;
                    } else if (id == "XYZI") {
                        var numVoxels = Math.abs(that.readInt(buffer, i));
                        i += 4;
                        voxelData = new Array(numVoxels);
                        for (var n = 0; n < voxelData.length; n++) {;
                            voxelData[n] = new VoxelData();
                            voxelData[n].Create(buffer, i, subSample); // Read 4 bytes
                            i += 4;
                        }
                    } else if (id == "RGBA") {
                        colors2 = new Array(256);
                        for (var n = 0; n < 256; n++) {
                            var r = buffer[i++] & 0xFF;
                            var g = buffer[i++] & 0xFF;
                            var b = buffer[i++] & 0xFF;
                            var a = buffer[i++] & 0xFF;
                            colors2[n] = {'r': r, 'g': g, 'b': b, 'a': a};
                        }
                    } else {
                        i += chunkSize;
                    }
                }
                if (voxelData == null || voxelData.length == 0) {
                    return null;
                }

                for (var n = 0; n < voxelData.length; n++) {
                    if(colors2 == undefined) {
                        var c = voxColors[Math.abs(voxelData[n].color-1)];
                        var cRGBA = {
                            b: (c & 0xff0000) >> 16, 
                            g: (c & 0x00ff00) >> 8, 
                            r: (c & 0x0000ff),
                            a: 1
                        };
                      // for(var x = (voxelData[n].x*size)-size; x < (voxelData[n].x*size)+size; x++) {
                      //     game.world.AddBlock(x, voxelData[n].z*size, voxelData[n].y*size, [cRGBA.r,cRGBA.g,cRGBA.b]);
                      //     for(var z = (voxelData[n].z*size)-size; z < (voxelData[n].z*size)+size; z++) {
                      //         game.world.AddBlock(voxelData[n].x*size, z, voxelData[n].y*size, [cRGBA.r,cRGBA.g,cRGBA.b]);
                      //         for(var y = (voxelData[n].y*size)-size; y < (voxelData[n].y*size)+size; y++) {
                      //             game.world.AddBlock(voxelData[n].x*size, voxelData[n].z*size, y, [cRGBA.r,cRGBA.g,cRGBA.b]);
                      //             game.world.AddBlock(voxelData[n].x*size, z, y, [cRGBA.r,cRGBA.g,cRGBA.b]);
                      //             game.world.AddBlock(x, z, y, [cRGBA.r,cRGBA.g,cRGBA.b]);
                      //         }
                      //     }
                      // }
                      // game.world.AddBlock(voxelData[n].x*size, voxelData[n].z*size, voxelData[n].y*size, [cRGBA.r,cRGBA.g,cRGBA.b]);
                   //       game.world.AddBlock(voxelData[n].x, voxelData[n].z, voxelData[n].y, [cRGBA.r,cRGBA.g,cRGBA.b]);
                    } else {
                        var color = colors2[Math.abs(voxelData[n].color-1)];
                       // for(var x = (voxelData[n].x*size)-size; x < (voxelData[n].x*size)+size; x++) {
                       //     game.world.AddBlock(x, voxelData[n].z*size, voxelData[n].y*size, [color.r,color.g,color.b]);
                       //     for(var z = (voxelData[n].z*size)-size; z < (voxelData[n].z*size)+size; z++) {
                       //         game.world.AddBlock(voxelData[n].x*size, z, voxelData[n].y*size, [color.r,color.g,color.b]);
                       //         for(var y = (voxelData[n].y*size)-size; y < (voxelData[n].y*size)+size; y++) {
                       //             game.world.AddBlock(voxelData[n].x*size, voxelData[n].z*size, y, [color.r,color.g,color.b]);
                       //             game.world.AddBlock(voxelData[n].x*size, z, y, [color.r,color.g,color.b]);
                       //             game.world.AddBlock(x, z, y, [color.r,color.g,color.b]);
                       //         }
                       //     }
                       // }
                        //game.world.AddBlock(voxelData[n].x*size, voxelData[n].z*size, voxelData[n].y*size, [color.r,color.g,color.b]);

                        //game.world.AddBlock(voxelData[n].x, voxelData[n].z, 100-voxelData[n].y, [color.r,color.g,color.b]);
                        var x = voxelData[n].x;
                        var y = voxelData[n].y;
                        var z = voxelData[n].z;
                        if(type == TYPE_MAP) {
                            for(var x1 =x *2+1; x1 < x*2+3; x1++) {
                                for(var z1 = z*2+1; z1 < z*2+3; z1++) {
                                    for(var y1 = y*2+1; y1 < y*2+3; y1++) {
                                        game.world.AddBlock(x1,z1, 200-y1, [color.r,color.g,color.b]); // TBD: 200 just for this map size.
                                    }
                                }
                            }
                        } else if(type == TYPE_OBJECT) {
                           var b = new Object();
                           b.x = x+5;
                           b.y = y+10;
                           b.z = z+5;
                           b.color = [color.r, color.g, color.b];
                          // b.val = (color.r & 0xFF) << 24 | (color.g & 0xFF) << 16 | (color.b & 0xFF) << 8;
                           game.world.AddBlock(x+5,z+5,y+10, [color.r,color.g,color.b]); 
                           chunk.blockList.push(b);
                        }
                    }
                }
                if(type == TYPE_OBJECT) {
                    chunk.dirty = true;
                    chunk.fromX = 1000; // just some large value 
                    chunk.fromZ = 1000;
                    chunk.fromY = 1000;
                    chunk.type = CHUNK_OBJECT; 

                    for(var q = 0; q < chunk.blockList.length; q++) {
                        var b = chunk.blockList[q];
                        b.val = game.world.blocks[b.x][b.y][b.z];
                        if(b.x < chunk.fromX) {
                            chunk.fromX = b.x;
                        }
                        if(b.x > chunk.toX) {
                            chunk.toX = b.x;
                        }
                        if(b.y > chunk.toY) {
                            chunk.toY = b.y;
                        }
                        if(b.y < chunk.fromY) {
                            chunk.fromY = b.y;
                        }
                        if(b.z < chunk.fromZ) {
                            chunk.fromZ = b.z;
                        }
                        if(b.z > chunk.toZ) {
                            chunk.toZ = b.z;
                        }
                    }
                    // Increase area to view all voxels for mesh creation
                    chunk.fromX-=2;
                    chunk.fromY-=6;
                    chunk.fromZ-=2;
                    chunk.toX+=2;
                    chunk.toY+=4;
                    chunk.toZ+=8;
                    game.world.RebuildChunk(chunk);
                    chunk.mesh.visible = false;

                    loadptr(that, name, chunk);
                } else {
                    game.world.RebuildDirtyChunks(1);
                    loadptr(that, name);
                }
            }
        };

        oReq.send(null);
    };
}
Vox.prototype = new Vox();
Vox.prototype.constructor = Vox;


//==============================================================================
// Author: Nergal
// Date: 2015-11-10
//==============================================================================
const CHUNK_WORLD = 0;
const CHUNK_OBJECT = 1;
const CHUNK_FF = 2;
// Binary string to decimal conversion
String.prototype.bin = function () {
    return parseInt(this, 2);
};

// Decimal to binary string conversion
Number.prototype.bin = function () {
    var sign = (this < 0 ? "-" : "");
    var result = Math.abs(this).toString(2);
    while(result.length < 32) {
        result = "0" + result;
    }
    return sign + result;
}

function Chunk() {
    this.mesh = undefined;
    this.blocks = 0;
    this.triangles = 0;
    this.dirty = false;
    this.fromX = 0;
    this.fromY = 0;
    this.fromZ = 0;
    this.toX = 0;
    this.toY = 0;
    this.toZ = 0;
    this.x = 0;
    this.y = 0; 
    this.z = 0;
    this.type = 0; // 0 = world, 1 = object
    this.blockList = 0;
};


function World() {
    this.worldSize = 192;
    this.chunkBase = 16;
    this.worldDivBase = this.worldSize/this.chunkBase;
    this.chunkHeight = 160;
    this.blocks = 0;
    this.blockSize = 1;
    this.material = 0;
    this.chunks = undefined;
    this.plane = 0; // bottom ground

    this.ffTime = 0;

    this.last = 0; // Used for flood fill

    this.floodFill = new Array();

    // Debug stuff
    this.wireframe = false;
    this.showChunks = false;


    World.prototype.Init = function() {

        // Initiate blocks
        this.blocks = new Array();
        for(var x = 0; x < this.worldSize; x++) {
            this.blocks[x] = new Array();
            for(var y = 0; y < this.chunkHeight; y++) {
                this.blocks[x][y] = new Array();
                for(var z = 0; z < this.worldSize; z++) {
                    this.blocks[x][y][z] = 0;
                }
            }
        }

        this.chunks = new Array(this.worldDivBase);
        for (var x = 0; x < this.worldDivBase; x++) {
            this.chunks[x] = new Array(this.worldDivBase);
            for (var z = 0; z < this.worldDivBase; z++) {
                this.chunks[x][z] = new Chunk();
                this.chunks[x][z].type = 0; // world
                this.chunks[x][z].fromY = 0;
                this.chunks[x][z].toY = this.chunkHeight;
                this.chunks[x][z].fromX = x*this.blockSize*this.chunkBase;
                this.chunks[x][z].toX = x*this.blockSize*this.chunkBase + this.chunkBase;
                this.chunks[x][z].fromZ = z*this.blockSize*this.chunkBase;
                this.chunks[x][z].toZ = z*this.blockSize*this.chunkBase + this.chunkBase;
                this.chunks[x][z].x = x;
                this.chunks[x][z].z = z;
                if(this.showChunks) {
                    var mat = new THREE.MeshBasicMaterial({color: 0xAA4444, wireframe: true});
                    var geo = new THREE.BoxGeometry(
                        this.chunkBase*this.blockSize,
                        this.chunkHeight*this.blockSize,
                        this.chunkBase*this.blockSize
                    );

                    var mesh = new THREE.Mesh(geo, mat);
                    mesh.position.x = x*this.blockSize*this.chunkBase + this.chunkBase*this.blockSize/2;
                    mesh.position.z = z*this.blockSize*this.chunkBase + this.chunkBase*this.blockSize/2;
                    mesh.position.y = this.blockSize*this.chunkHeight/2;
                    game.scene.add(mesh);
                }
            }
        }

        // Add ground plate
        // TOP
        var col = 0x444444;
        var geo = new THREE.BoxGeometry(this.blockSize*this.worldSize - 2, 1, this.blockSize*this.worldSize-7);
        var mat = new THREE.MeshBasicMaterial({color: col});
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((this.worldSize/2-this.chunkBase/2), -1/2+1, this.worldSize/2-this.chunkBase/2 + 2);
        mesh.receiveShadow = true;
        game.scene.add(mesh);
        // base
        var geo = new THREE.BoxGeometry(this.blockSize*this.worldSize - 2, 1000, this.blockSize*this.worldSize-7);
        var mat = new THREE.MeshBasicMaterial({color: col});
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((this.worldSize/2-this.chunkBase/2), -1000/2, this.worldSize/2-this.chunkBase/2 + 2);
        game.scene.add(mesh);

        this.RebuildMaterial(false);
    };

    World.prototype.RebuildMaterial = function(wireframe) {
        this.wireframe = wireframe;
        this.material = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors, wireframe: this.wireframe});
//this.material = new THREE.MeshPhongMaterial( {
//					color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
//			side: THREE.SingleSide, vertexColors: THREE.VertexColors
//} );
        
    };

    World.prototype.PlaceObject = function(x,y,z, chunk) {
        for (var i = 0; i < chunk.blockList.length; i++) {
            chunk.mesh.updateMatrixWorld();
            var b = chunk.blockList[i];
            var vector = new THREE.Vector3(b.x,b.y,b.z);
            vector.applyMatrix4( chunk.mesh.matrixWorld );
            var xi = vector.x+game.world.blockSize*8 | 0;
            var yi = vector.y | 0;
            var zi = vector.z+game.world.blockSize*8 | 0;
            // TBD: Solves some issues with placement.
            if(yi <= 0) {
                yi = 1; 
            }
            if(this.IsWithinWorld(xi,yi,zi)) {
                this.blocks[xi][yi][zi] = b.val;
                // If player is hit by object, kill him (if the object is larger than 200 blocks)
                if(chunk.blockList.length > 200) {
                    var px = (game.player.mesh.position.x+this.blockSize*8)|0;
                    var py = (game.player.mesh.position.y+this.blockSize*8)|0;
                    var pz = (game.player.mesh.position.z+this.blockSize*8)|0;
                    if(px == xi && py == yi && pz == zi) {
                        game.player.Die();
                    }
                }
                this.GetChunk(xi, zi).dirty = true;
            }
        }
        this.RebuildDirtyChunks();
    };

    World.prototype.IsWithinWorld = function(x,y,z) {
            if(x > 0 && x < game.world.worldSize - 1 &&
               y > 0 && y < game.world.chunkHeight - 1 &&
               z > 4 && z < game.world.worldSize - 1) {
                return true;
            }
            return false;
    };

    World.prototype.Explode = function(x,y,z, power, onlyExplode) {
        // Remove blocks.
        this.exploded = 1;
        var pow = power*power;
        var blockList = new Array();
        for(var rx = x+power; rx >= x-power; rx--) {
            for(var rz = z+power; rz >= z-power; rz--) {
                for(var ry = y+power; ry >= y-power; ry--) {
                    val = (rx-x)*(rx-x)+(ry-y)*(ry-y)+(rz-z)*(rz-z);
                    if(val <= pow) {
                        this.RemoveBlock(rx,ry,rz);

                        // TBD: Temp solution for player death...
                        var px = (game.player.mesh.position.x+this.blockSize*8)|0;
                        var py = (game.player.mesh.position.y-this.blockSize*8)|0;
                        var pz = (game.player.mesh.position.z+this.blockSize*8)|0;
                        if(px == rx && py == ry && pz == rz) {
                            game.player.Die();
                        }
                    } else if(val > pow)  {
                        if(this.IsWithinWorld(rx,ry,rz)) {
                            if((this.blocks[rx][ry][rz] >> 8) != 0) {
                                blockList.push(new THREE.Vector3(rx, ry, rz));
                               // this.blocks[rx][ry][rz] = (Math.round(Math.random()*225) & 0xFF) << 24 | (255 & 0xFF) << 16 | (255 & 0xFF) << 8;
                            }
                        }
                    }
                    if(val <= pow/10) {
                        this.ExplosionBlock(rx,ry,rz);
                        if(lfsr.rand()>0.8) {
                            this.SmokeBlock(rx,ry,rz);
                        }
                    }
                }
            }
        }
        this.RebuildDirtyChunks();
        if(!onlyExplode) {
            this.floodFill.push(blockList);
//            this.RemoveHangingBlocks(blockList);
        }
    };

    World.prototype.DrawStats = function() {
       var vblocks = 0,blocks = 0;
       var vtriangles = 0, triangles = 0;
       var vchunks=0, chunks = 0;
       for(var x = 0; x < this.chunks.length; x++) {
           for(var z = 0; z < this.chunks.length; z++) {
               if(this.chunks[x][z].mesh != undefined) {
                   if(this.chunks[x][z].mesh.visible) {
                       vblocks += this.chunks[x][z].blocks;
                       vtriangles += this.chunks[x][z].triangles;
                       vchunks++;
                   }
                   blocks += this.chunks[x][z].blocks;
                   triangles += this.chunks[x][z].triangles;
                   chunks++;                  
               }
           }
       }
       // TBD: This should not be here...
       var phys_stat = game.phys.Stats();
       $('#blockstats').html("[Total] Blocks: "+blocks + " Triangles: "+triangles+  " Chunks: "+chunks+"<br>"+
                            "[Visible] Blocks: "+vblocks + " Triangles: "+vtriangles + " Chunks: "+vchunks+"<br>"+
                            "[Particle Engine] Free: "+phys_stat.free+ "/"+phys_stat.total);
                
    }; 


    World.prototype.RebuildDirtyChunks = function(buildAll) {
        for(var x = 0; x < this.chunks.length; x++) {
            for(var z = 0; z < this.chunks.length; z++) {
                if(buildAll == 1 || this.chunks[x][z].dirty == true) {
                    this.RebuildChunk(this.chunks[x][z]);
                    //this.RebuildChunk(this.chunks[x][z].fromX, this.chunks[x][z].fromZ);
                }
            }
        }
    };

    World.prototype.Draw = function(time, delta) {
        if((this.ffTime+=delta) > 0.1) {
            if(this.floodFill.length > 0 && this.exploded != 1) {
                this.RemoveHangingBlocks(this.floodFill.pop());
            }
            this.ffTime = 0;
        }
       this.DrawStats();
       this.exploded = 0;
    };

    World.prototype.componentToHex = function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    World.prototype.rgbToHex = function(r, g, b) {
        if(r < 0) r = 0;
        if(g < 0) g = 0;
        var hex = this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        return parseInt('0x'+hex.substring(0, 6));
    };

    World.prototype.GetChunk = function(x,z) {
        var posx = parseInt(x  / (this.chunkBase));
        var posz = parseInt(z  / (this.chunkBase));
        if(posx < 0 || posz < 0 ) {
            return undefined;
        }
        return this.chunks[posx][posz];
    };


    World.prototype.RemoveHangingBlocks = function(blocks) {
        var newChunks = new Array();
        var removeBlocks = new Array();
        var all = new Array();
        for(var i = 0; i < blocks.length; i++) {
            var p = blocks[i];
            //this.blocks[p.x][p.y][p.z] = (25 & 0xFF) << 24 | (255 & 0xFF) << 16 | (0 & 0xFF) << 8 | this.blocks[p.x][p.y][p.z] & 0xFF;
            var ff = this.FloodFill(p);
            all.push(ff.all);
            if(ff.result != true) {
                if(ff.vals.length == 0) {
                    continue;
                }
                //if(ff.vals.length <= ) {
                //    removeBlocks.push(ff);
                //} else {
                    newChunks.push(ff);
                //}
            }
        }

        for(var m = 0; m < newChunks.length; m++) {
            var ff = newChunks[m];
            // Create chunk 
            var chunk = new Chunk();
            chunk.dirty = true;
            chunk.fromX = 5000; // just some large value > world.
            chunk.fromZ = 5000;
            chunk.fromY = 5000;
            chunk.type = CHUNK_FF;
            chunk.blockList = new Array();

            for(var q = 0; q < ff.vals.length; q++) {
                var b = ff.vals[q];
                // we need to reset the values before we set the value in the blockList for the mesh.
                this.blocks[b.x][b.y][b.z] &= ~(1 << 5);
                this.blocks[b.x][b.y][b.z] &= ~(1 << 6);
                b.val = this.blocks[b.x][b.y][b.z]; 
                // Then set it back so that we can use it in RebuildChunk
                this.blocks[b.x][b.y][b.z] |= 0x20;
                chunk.blockList.push(b);

                this.GetChunk(b.x, b.z).dirty = true;
                //this.blocks[b.x][b.y][b.z] = (5 & 0xFF) << 24 | (0 & 0xFF) << 16 | (255 & 0xFF) << 8 | this.blocks[b.x][b.y][b.z] & 0xFF;
                if(b.x < chunk.fromX) {
                    chunk.fromX = b.x;
                }
                if(b.x > chunk.toX) {
                    chunk.toX = b.x;
                }
                if(b.y > chunk.toY) {
                    chunk.toY = b.y;
                }
                if(b.y < chunk.fromY) {
                    chunk.fromY = b.y;
                }
                if(b.z < chunk.fromZ) {
                    chunk.fromZ = b.z;
                }
                if(b.z > chunk.toZ) {
                    chunk.toZ = b.z;
                }
            }
            // Increase area to view all voxels for mesh creation
            chunk.fromX--;
            chunk.fromY--;
            chunk.fromZ--;
            chunk.toX++;
            chunk.toY++;
            chunk.toZ++;
            this.RebuildChunk(chunk);
            game.phys.CreateMeshBlock(chunk);
        }

        for(var m = 0; m < removeBlocks.length; m++) {
            var ff = removeBlocks[m];
            // Remove parts that are very small.
            for(var q = 0; q < ff.vals.length; q++) {
                var b = ff.vals[q];
    //            this.blocks[b.x][b.y][b.z] = 0;
                this.RemoveBlock(b.x,b.y,b.z);
  //              this.blocks[b.x][b.y][b.z] = (5 & 0xFF) << 24 | (255 & 0xFF) << 16 | (2 & 0xFF) << 8 | this.blocks[b.x][b.y][b.z] & 0xFF;
//                this.GetChunk(b.x, b.z).dirty = true;
            }
        }

        // Clears AFTER we have built the chunks where 0x20/0x40 are used.
        for(var i = 0; i < all.length; i++) {
            for(var n = 0; n < all[i].length; n++){
                var b = all[i][n];
                this.blocks[b.x][b.y][b.z] &= ~(1 << 5);
                this.blocks[b.x][b.y][b.z] &= ~(1 << 6);
            }
        }
        this.RebuildDirtyChunks();

    };

    World.prototype.IsBlockHidden = function(x,y,z) {
        if((this.blocks[x][y][z] >> 8) == 0) {
            return true;
        }

        var left = 0, right = 0, above = 0,front = 0, back = 0, below = 0;
        if(y > 0) {
            if((this.blocks[x][y-1][z] >> 8) != 0) {
              below = 1;
            }
        }
        if(z > 0){
            if((this.blocks[x][y][z-1] >> 8) != 0) {
                back = 1;
            }
        }
        if(x > 0) {
            if((this.blocks[x-1][y][z] >> 8) != 0) {
                left = 1;
            }
        }
        if(x < this.worldSize-1) {
            if((this.blocks[x+1][y][z] >> 8) != 0) {
                right = 1;
            }
        }
        if(y < this.chunkHeight-1) {
            if((this.blocks[x][y+1][z] >> 8) != 0) {
                above = 1;   
            }
        }
        if(z < this.worldSize - 1){
            if((this.blocks[x][y][z+1] >> 8) != 0) {
                front = 1;
            }
        }

        if( front == 1 && left == 1 && right == 1 && above == 1 && back == 1 && below == 1) {
            return true;
        }
        return false;
    };

    World.prototype.FloodFill = function(start) {
       // var COLOR1 = lfsr.rand()*255;
       // var COLOR2 = lfsr.rand()*255;
       // var COLOR3 = lfsr.rand()*255;
        var curr = 0x20;
        var stack = new Array();
        var result = new Array();    
        stack.push(start);
        var all = new Array();

        if((start & curr ) != 0) {
            return {"result": true, "vals": result, "all": all};
        }

        while(stack.length != 0) {
            var b = stack.pop();
            all.push(b);
            if(!this.IsWithinWorld(b.x,b.y,b.z)) {
                continue;
            }
            if((this.blocks[b.x][b.y][b.z] >> 8) == 0) {
                continue;
            }

            // If we reach a 0x40 block we know that it leads to ground already.
            // so we can skip searching since we know it leads to ground from here.
            if((this.blocks[b.x][b.y][b.z] & 0x40) != 0) {
                return {"result": true, "vals": result, "all": all};
            }

            if((this.blocks[b.x][b.y][b.z] & curr) != 0) {
               continue;
            }
            if(b.y <= 4) {
                this.blocks[b.x][b.y][b.z] |= curr;
                this.blocks[start.x][start.y][start.z] |= 0x40;
                return {"result": true, "vals": result, "all": all};
            }

            result.push(b);
            //this.blocks[b.x][b.y][b.z] = (COLOR1 & 0xFF) << 24 | (COLOR2 & 0xFF) << 16 | (COLOR3 & 0xFF) << 8 | this.blocks[b.x][b.y][b.z] & 0xFF;
            this.blocks[b.x][b.y][b.z] |= curr;

            stack.push(new THREE.Vector3(b.x, b.y+1, b.z)); 
            stack.push(new THREE.Vector3(b.x, b.y, b.z+1)); 
            stack.push(new THREE.Vector3(b.x+1, b.y, b.z)); 
            stack.push(new THREE.Vector3(b.x, b.y, b.z-1)); 
            stack.push(new THREE.Vector3(b.x-1, b.y, b.z)); 
            stack.push(new THREE.Vector3(b.x, b.y-1, b.z)); 
        }

        this.blocks[start.x][start.y][start.z] |= 0x40;
        return {"result": false, "vals": result, "all": all};
    };

    World.prototype.SmokeBlock = function(x,y,z) {
        var block = game.phys.Get();
        if(block != undefined) {
            // Random colors
            var color = lfsr.rand()*155 | 0;
            var r = color;
            var g = color;
            var b = color;
            block.gravity = -2;
            block.Create(x-this.blockSize*8,
                         y+this.blockSize,
                         z-this.blockSize*8,
                         r,
                         g,
                         b,
                         lfsr.rand()*1, 2, PHYS_SMOKE);

        }
    };

    World.prototype.ExplosionBlock = function(x,y,z) {
        var block = game.phys.Get();
        if(block != undefined) {
            // Random colors
            var r = 255;
            var g = 100+(lfsr.rand()*155 | 0);
            var b = 0;
            block.Create(x-this.blockSize*8,
                         y+this.blockSize,
                         z-this.blockSize*8,
                         r,
                         g,
                         b,
                         lfsr.rand()*4, 0.3);
        }
    };

    World.prototype.RemoveBlock = function(x,y,z) {
        if(x < 0 || y < 0 || z < 0 || x > this.worldSize-1 || y > this.chunkHeight-1 || z > this.worldSize-1) {
            return;
        }
        if(this.blocks[x][y][z] == 0) {
            return;
        }

        var chunk = this.GetChunk(x,z);
        if(chunk != undefined) {
            chunk.blocks--;
            chunk.dirty = true;

            var block = game.phys.Get();
            if(block != undefined) {
            if(lfsr.rand() < 0.25) {
                    var r = (this.blocks[x][y][z] >>  24) & 0xFF;
                    var g = (this.blocks[x][y][z] >> 16 ) & 0xFF;
                    var b = (this.blocks[x][y][z] >> 8 ) & 0xFF;
                    block.Create(x-this.blockSize*8,
                                 y+this.blockSize,
                                 z-this.blockSize*8,
                                 r,
                                 g,
                                 b,
                                 3);
                }
            }
           this.blocks[x][y][z] = 0;
        }
    };

    World.prototype.AddBlock = function(x, y, z, color) {
        var size = 1/this.blockSize;

        if(x < 0 || y < 0 || z < 0 || x > this.worldSize-1 || y > this.chunkHeight-1 || z > this.worldSize-1) {
            return;
        }

        var chunk = this.GetChunk(x,z);
        if(this.blocks[x][y][z] == 0) {
            chunk.blocks += size;
            this.blocks[x][y][z] = (color[0] & 0xFF) << 24 | (color[1] & 0xFF) << 16 | (color[2] & 0xFF) << 8 | 0 & 0xFF;
            chunk.dirty = true;
        }
    };


    World.prototype.SameColor = function(block1, block2) {
        if( ((block1 >> 8) & 0xFFFFFF) == ((block2 >> 8) & 0xFFFFFF) && block1 != 0 && block2 != 0) {
            return true;
        }
        return false;
    };

    // Given world position
    World.prototype.RebuildChunk = function(chunk) {
        var sides = 0;

        var vertices = [];
        var colors = [];
        
        // Block structure
        // BLOCK: [R-color][G-color][B-color][0][00][back_left_right_above_front]
        //           8bit    8bit     8it    1bit(unused)  2bit(floodfill)     5bit(faces)

        // Reset faces
        for(var x = chunk.fromX; x < chunk.toX; x++) {
            for(var y = chunk.fromY; y < chunk.toY; y++) {
                for(var z = chunk.fromZ; z < chunk.toZ; z++) {
                    if(this.blocks[x][y][z] != 0) {
                        // TBD: Hmmm...should work with a AND op? Need some brain to this whine.
                        this.blocks[x][y][z] &= ~(1 << 0)
                        this.blocks[x][y][z] &= ~(1 << 1)
                        this.blocks[x][y][z] &= ~(1 << 2)
                        this.blocks[x][y][z] &= ~(1 << 3)
                        this.blocks[x][y][z] &= ~(1 << 4)
                        //this.blocks[x][y][z] = this.blocks[x][y][z] & 0xFFFFF8;
                    }
                }
            }
        }

        for(var x = chunk.fromX; x < chunk.toX; x++) {
            for(var y = chunk.fromY; y < chunk.toY; y++) {
                for(var z = chunk.fromZ; z < chunk.toZ; z++) {
                    if(chunk.type == CHUNK_FF) {
                        // make sure we only use blocks that we should build as mesh. (floodfill only)
                        if((this.blocks[x][y][z] & 0x20) == 0 && (this.blocks[x][y][z] & 0x40) == 0) {
                            continue;
                        }
                    }
                    if(this.blocks[x][y][z] == 0) {
                        continue; // Skip empty blocks
                    }
                    // Check if hidden
                    var left = 0, right = 0, above = 0,front = 0, back = 0; 
                    if(z > 0){
                        if(this.blocks[x][y][z-1] != 0) {
                            back = 1;
                            this.blocks[x][y][z] = this.blocks[x][y][z] | 0x10;
                        }
                    }
                    if(x > 0) {
                        if(this.blocks[x-1][y][z] != 0) {
                            left = 1;
                            this.blocks[x][y][z] = this.blocks[x][y][z] | 0x8;
                        }
                    }
                    if(x < this.worldSize-1) {
                        if(this.blocks[x+1][y][z] != 0) {
                            right = 1;
                            this.blocks[x][y][z] = this.blocks[x][y][z] | 0x4;
                        }
                    }
                    if(y < chunk.toY-1) {
                        if(this.blocks[x][y+1][z] != 0) {
                            above = 1;   
                            this.blocks[x][y][z] = this.blocks[x][y][z] | 0x2;
                        }
                    }
                    if(z < this.worldSize - 1){
                        if(this.blocks[x][y][z+1] != 0) {
                            front = 1;
                            this.blocks[x][y][z] = this.blocks[x][y][z] | 0x1;
                        }
                    }

                    if( front == 1 && left == 1 && right == 1 && above == 1 && back == 1) {
                        // If we are building a standalone mesh, remove invisible 
                        if(chunk.type == CHUNK_OBJECT || chunk.type == CHUNK_FF) {
                            this.blocks[x][y][z] = 0; 
                        }

                        continue; // block is hidden
                    }
                    // Draw block
                    if(!above) {
                        // Get above (0010)
                        if((this.blocks[x][y][z] & 0x2) == 0) {
                            var maxX = 0;
                            var maxZ = 0;
                            var end = 0;

                            for(var x_ = x; x_ < chunk.toX; x_++) {
                                // Check not drawn + same color
                                if((this.blocks[x_][y][z] & 0x2) == 0 && this.SameColor(this.blocks[x_][y][z], this.blocks[x][y][z])) {
                                    maxX++;
                                } else {
                                    break;
                                }
                                var tmpZ = 0;
                                for(var z_ = z; z_ < chunk.toZ; z_++) {
                                    if((this.blocks[x_][y][z_] & 0x2) == 0 && this.SameColor(this.blocks[x_][y][z_], this.blocks[x][y][z])) {
                                        tmpZ++;
                                    } else {
                                        break;
                                    }
                                }
                                if(tmpZ < maxZ || maxZ == 0) {
                                    maxZ = tmpZ;
                                }
                            }
                            for(var x_ = x; x_ < x+maxX; x_++) {
                                for(var z_ = z; z_ < z+maxZ; z_++) {
                                  this.blocks[x_][y][z_] = this.blocks[x_][y][z_] | 0x2;
                                }
                            }
                            maxX--;
                            maxZ--;

                            vertices.push([x*this.blockSize + (this.blockSize*maxX), y*this.blockSize, z*this.blockSize+(this.blockSize*maxZ)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize+(this.blockSize*maxZ)]);

                            vertices.push([x*this.blockSize+(this.blockSize*maxX), y*this.blockSize, z*this.blockSize+(this.blockSize*maxZ)]);
                            vertices.push([x*this.blockSize+(this.blockSize*maxX), y*this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize, z*this.blockSize-this.blockSize]);

                            sides += 6;
                            for(var n = 0; n < 6; n++) {
                                colors.push([((this.blocks[x][y][z] >> 24) & 0xFF),
                                            ((this.blocks[x][y][z] >> 16) & 0xFF), 
                                            ((this.blocks[x][y][z] >> 8) & 0xFF)
                                ]);
                            }
                        }
                    }
                    if(!back) { 
                        // back  10000
                        if((this.blocks[x][y][z] & 0x10) == 0) {
                            var maxX = 0;
                            var maxY = 0;

                            for(var x_ = x; x_ < chunk.toX; x_++) {
                                // Check not drawn + same color
                                if((this.blocks[x_][y][z] & 0x10) == 0 && this.SameColor(this.blocks[x_][y][z], this.blocks[x][y][z])) {
                                    maxX++;
                                } else {
                                    break;
                                }
                                var tmpY = 0;
                                for(var y_ = y; y_ < chunk.toY; y_++) {
                                    if((this.blocks[x_][y_][z] & 0x10) == 0 && this.SameColor(this.blocks[x_][y_][z], this.blocks[x][y][z])) {
                                        tmpY++;
                                    } else {
                                        break;
                                    }
                                }
                                if(tmpY < maxY || maxY == 0) {
                                    maxY = tmpY;
                                }
                            }
                            for(var x_ = x; x_ < x+maxX; x_++) {
                                for(var y_ = y; y_ < y+maxY; y_++) {
                                    this.blocks[x_][y_][z] = this.blocks[x_][y_][z] | 0x10;
                                }
                            }
                            maxX--;
                            maxY--;
                            vertices.push([x*this.blockSize+(this.blockSize*maxX), y*this.blockSize+(this.blockSize*maxY), z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize+(this.blockSize*maxX), y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            
                            vertices.push([x*this.blockSize+(this.blockSize*maxX), y*this.blockSize+(this.blockSize*maxY), z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize-this.blockSize]);

                            sides += 6;
                            for(var n = 0; n < 6; n++) {
                                colors.push([((this.blocks[x][y][z] >> 24) & 0xFF),
                                            ((this.blocks[x][y][z] >> 16) & 0xFF), 
                                            ((this.blocks[x][y][z] >> 8) & 0xFF)
                                ]);
                            }
                        }
                    }
                    if(!front) { 
                        // front 0001
                        if((this.blocks[x][y][z] & 0x1) == 0) {
                            var maxX = 0;
                            var maxY = 0;

                            for(var x_ = x; x_ < chunk.toX; x_++) {
                                // Check not drawn + same color
                                if((this.blocks[x_][y][z] & 0x1) == 0 && this.SameColor(this.blocks[x_][y][z], this.blocks[x][y][z])) {
                                    maxX++;
                                } else {
                                    break;
                                }
                                var tmpY = 0;
                                for(var y_ = y; y_ < chunk.toY; y_++) {
                                    if((this.blocks[x_][y_][z] & 0x1) == 0 && this.SameColor(this.blocks[x_][y_][z], this.blocks[x][y][z])) {
                                        tmpY++;
                                    } else {
                                        break;
                                    }
                                }
                                if(tmpY < maxY || maxY == 0) {
                                    maxY = tmpY;
                                }
                            }
                            for(var x_ = x; x_ < x+maxX; x_++) {
                                for(var y_ = y; y_ < y+maxY; y_++) {
                                    this.blocks[x_][y_][z] = this.blocks[x_][y_][z] | 0x1;
                                }
                            }
                            maxX--;
                            maxY--;

                            vertices.push([x*this.blockSize+(this.blockSize*maxX), y*this.blockSize+(this.blockSize*maxY), z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize]);
                            vertices.push([x*this.blockSize+(this.blockSize*maxX), y*this.blockSize-this.blockSize, z*this.blockSize]);

                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize]);
                            vertices.push([x*this.blockSize+(this.blockSize*maxX), y*this.blockSize-this.blockSize, z*this.blockSize]);
                            sides += 6;
                            for(var n = 0; n < 6; n++) {
                                colors.push([((this.blocks[x][y][z] >> 24) & 0xFF),
                                            ((this.blocks[x][y][z] >> 16) & 0xFF), 
                                            ((this.blocks[x][y][z] >> 8) & 0xFF)
                                ]);
                            }
                        }
                    }
                    if(!left) {
                        if((this.blocks[x][y][z] & 0x8) == 0) {
                            var maxZ = 0;
                            var maxY = 0;

                            for(var z_ = z; z_ < chunk.toZ; z_++) {
                                // Check not drawn + same color
                                if((this.blocks[x][y][z_] & 0x8) == 0 && this.SameColor(this.blocks[x][y][z_], this.blocks[x][y][z])) {
                                    maxZ++;
                                } else {
                                    break;
                                }
                                var tmpY = 0;
                                for(var y_ = y; y_ < chunk.toY; y_++) {
                                    if((this.blocks[x][y_][z_] & 0x8) == 0 && this.SameColor(this.blocks[x][y_][z_], this.blocks[x][y][z])) {
                                        tmpY++;
                                    } else {
                                        break;
                                    }
                                }
                                if(tmpY < maxY || maxY == 0) {
                                    maxY = tmpY;
                                }
                            }
                            for(var z_ = z; z_ < z+maxZ; z_++) {
                                for(var y_ = y; y_ < y+maxY; y_++) {
                                    this.blocks[x][y_][z_] = this.blocks[x][y_][z_] | 0x8;
                                }
                            }
                            maxZ--;
                            maxY--;

                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize+(this.blockSize*maxZ)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize+(this.blockSize*maxZ)]);

                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize+(this.blockSize*maxZ)]);
                            vertices.push([x*this.blockSize-this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize-this.blockSize]);

                            sides += 6;
                            for(var n = 0; n < 6; n++) {
                                colors.push([((this.blocks[x][y][z] >> 24) & 0xFF),
                                            ((this.blocks[x][y][z] >> 16) & 0xFF), 
                                            ((this.blocks[x][y][z] >> 8) & 0xFF)
                                ]);
                            }
                        }
                    }
                    if(!right) {
                        if((this.blocks[x][y][z] & 0x4) == 0) {
                            var maxZ = 0;
                            var maxY = 0;

                            for(var z_ = z; z_ < chunk.toZ; z_++) {
                                // Check not drawn + same color
                                if((this.blocks[x][y][z_] & 0x4) == 0 && this.SameColor(this.blocks[x][y][z_], this.blocks[x][y][z])) {
                                    maxZ++;
                                } else {
                                    break;
                                }
                                var tmpY = 0;
                                for(var y_ = y; y_ < chunk.toY; y_++) {
                                    if((this.blocks[x][y_][z_] & 0x4) == 0 && this.SameColor(this.blocks[x][y_][z_], this.blocks[x][y][z])) {
                                        tmpY++;
                                    } else {
                                        break;
                                    }
                                }
                                if(tmpY < maxY || maxY == 0) {
                                    maxY = tmpY;
                                }
                            }
                            for(var z_ = z; z_ < z+maxZ; z_++) {
                                for(var y_ = y; y_ < y+maxY; y_++) {
                                    this.blocks[x][y_][z_] = this.blocks[x][y_][z_] | 0x4;
                                }
                            }
                            maxZ--;
                            maxY--;
                            
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize+(this.blockSize*maxZ)]);
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize+(this.blockSize*maxZ)]);

                            vertices.push([x*this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize+(this.blockSize*maxZ)]);
                            vertices.push([x*this.blockSize, y*this.blockSize-this.blockSize, z*this.blockSize-this.blockSize]);
                            vertices.push([x*this.blockSize, y*this.blockSize+(this.blockSize*maxY), z*this.blockSize-this.blockSize]);
                            
                            sides += 6;
                            for(var n = 0; n < 6; n++) {
                                colors.push([((this.blocks[x][y][z] >> 24) & 0xFF),
                                            ((this.blocks[x][y][z] >> 16) & 0xFF), 
                                            ((this.blocks[x][y][z] >> 8) & 0xFF)
                                ]);
                            }
                        }
                    } 

                    if(chunk.type == CHUNK_OBJECT || chunk.type == CHUNK_FF ) { 
                        this.blocks[x][y][z] = 0; 
                    }
                }
            }
        }
        chunk.triangles = vertices.length/3;

        // Draw chunk
        var geometry = new THREE.BufferGeometry();
        var v = new THREE.BufferAttribute( new Float32Array( vertices.length * 3), 3 );
        for ( var i = 0; i < vertices.length; i++ ) {
            v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
        }
        geometry.addAttribute( 'position', v );

        var c = new THREE.BufferAttribute(new Float32Array( colors.length * 3), 3 );
        for ( var i = 0; i < colors.length; i++ ) {
            c.setXYZW( i, colors[i][0]/255, colors[i][1]/255, colors[i][2]/255, 1);
        }
        geometry.addAttribute( 'color', c );

        geometry.computeVertexNormals();
        geometry.computeFaceNormals();

        geometry.computeBoundingBox();

        game.scene.remove(chunk.mesh);
        chunk.mesh = new THREE.Mesh( geometry, this.material);

        chunk.mesh.position.set(
            (chunk.fromX/this.chunkBase)-this.chunkBase/2 - this.blockSize*(chunk.fromX/this.chunkBase), 
            this.blockSize,
            (chunk.fromZ/this.chunkBase)-this.chunkBase/2 - this.blockSize*(chunk.fromZ/this.chunkBase)
        );

        chunk.mesh.receiveShadow = true;
        chunk.mesh.castShadow = true;
        chunk.dirty = false;
        game.scene.add( chunk.mesh );
        chunk.mesh.visible = true;
    };
}



