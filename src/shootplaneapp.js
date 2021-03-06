var g_appLayer;

var ShootPlaneAppLayer = cc.LayerColor.extend({
    size:0,
    bulletBatchNode:null,
    enemyBatchNode:null,
    collideRect:[],
    interval:null,
    backgroundSprite:null,
    score:0,
    scoreLabel:null,
    state:"",
    _sensitivity:0.5,
    _world:null,
    _gameover:false,
    ptmRatio:1,
    pairCode:0,
    clients:[],

    init:function(config){
        var _self = this;
        this._super();
        this.size = cc.Director.getInstance().getWinSize();
        g_appLayer = this;
        this._gameover = false;

        this.setColor(new cc.Color4B(195, 200, 201, 255));
        //box2d world
        this._world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 0) , true);
        
        this.ptmRatio = shootPlaneApp.config.box2dScale;
        //this.initDebugDraw();

        //加载plist
        cc.SpriteFrameCache.getInstance().addSpriteFrames("sprite/shoot.plist");
        //texture cache
        var texture = cc.TextureCache.getInstance().addImage("sprite/shoot.png");
        
        //初始化一个Batch节点
        this.bulletBatchNode = cc.SpriteBatchNode.createWithTexture(texture);
        //初始化一个Batch节点
        this.enemyBatchNode = cc.SpriteBatchNode.createWithTexture(texture);

        this.pairCode = config?config.pairCode:0;
        //分数
        this.scoreLabel = cc.LabelTTF.create("score: " + this.score, "Arial", 20);
        this.scoreLabel.setPosition(this.size.width-80,this.size.height-50);
        this.scoreLabel.setColor(new cc.Color3B(0,0,0));
        
        this.addChild(backgroundSpriteList.init(parseInt(this.size.width/180),this.size));
        this.addChild(this.enemyBatchNode);
        this.addChild(this.bulletBatchNode);
        this.addChild(this.scoreLabel);
        this.scheduleUpdate();

        if (sys.capabilities.hasOwnProperty('keyboard'))
            this.setKeyboardEnabled(true);

        if (sys.capabilities.hasOwnProperty('mouse'))
        /*if ('mouse' in sys.capabilities)*/
            this.setMouseEnabled(true);

        //生成敌人
        this.generateEnemy();

        this.state = "playing";

        cc.AudioEngine.getInstance().setEffectsVolume(0.5);
        cc.AudioEngine.getInstance().setMusicVolume(0.5);
        //play music
        cc.AudioEngine.getInstance().playMusic("music/game_music.mp3",true);

        //失去焦点的时候，停止产生敌人
        window.onblur = function(){
            window.clearInterval(_self.interval);
            _self.interval = null;
        }

        window.onfocus = function(){
            if(!_self._gameover && !_self.interval)
                _self.generateEnemy();
        }

        //碰撞侦测初始化
        this.initCollide();
        return true;
    },
    update:function(){
        //侦测碰撞
        //this.checkIsCollide();
        this.removeSprites();
        //跟随主程序的刷新率，这里把interval设置成0
        this._world.Step(0, 0, 0);
    }

    /*
    onKeyDown:function(e){
        if(e == cc.KEY.left || e == cc.KEY.right || e==cc.KEY.up || e==cc.KEY.down){
            this.hero.handleClick(e,this.size);
            this.hero.syncPosition();
        }
        else if(e == cc.KEY.enter){
            //暂停
            window.ondevicemotion = null;
        }
    },
    onDeviceMotion:function(e){
        var ax = e.acceleration.x;
        var ay = e.acceleration.y;
        var az = e.acceleration.z;

        this.hero.acceleration.x = ax*this._sensitivity;
    },
    

    processEvent:function (event) {
        if (this.state == "playing") {
            var delta = event.getDelta();
            var curPos = this.hero.getPosition();
            curPos = cc.pAdd(curPos, delta);
            curPos = cc.pClamp(curPos, cc.POINT_ZERO, cc.p(this.size.width, this.size.height));
            this.hero.setPosition(curPos);
            //box2d world position
            this.hero.heroBody.SetPosition(new Box2D.Common.Math.b2Vec2(curPos.x/this.ptmRatio,
                (this.size.height-curPos.y)/this.ptmRatio));

            this.hero.syncPosition();
        }
    }
    */
});

ShootPlaneAppLayer.prototype.initDebugDraw = function(){
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    var debugDraw = new b2DebugDraw();

    debugDraw.SetSprite(document.getElementById("box2d").getContext("2d"));
    debugDraw.SetDrawScale(shootPlaneApp.config.box2dScale);
    debugDraw.SetFillAlpha(0.8);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit);
    this._world.SetDebugDraw(debugDraw);

    var self = this;
    
    //debug picture
    window.setInterval(function(){
        self._world.DrawDebugData();
    }, 1000 / 120);
}

ShootPlaneAppLayer.prototype.join = function(option){
    var client = this.clients.filter(function(item){
        if(item.id == option.id){
            return item;
        }
    });
    var hero = new HeroSprite();
    hero.setPosition(this.size.width/2,this.size.height/4);
    hero.id = option.id;
    hero.scheduleUpdate();
    this.addChild(hero);
    hero.readyToShoot();

    //add set hero position
    var heroBody = hero.getPhysicalBody();
    if(heroBody){
        heroBody.SetPosition(new Box2D.Common.Math.b2Vec2(this.size.width/(2*this.ptmRatio),this.size.height*3/(4*this.ptmRatio)));
    }

    if(client && client.length){
        client[0] = {id:option.id,score:0,clientSize:option.clientSize,hero:hero}
    }
    else{
        this.clients.push({id:option.id,score:0,clientSize:option.clientSize,hero:hero});
    }
}

ShootPlaneAppLayer.prototype.initCollide = function(){
    var listener = new Box2D.Dynamics.b2ContactListener;
    var _self = this;

    listener.BeginContact = function(contact) {
        var userDataA = contact.GetFixtureA().GetBody().GetUserData();
        var userDataB = contact.GetFixtureB().GetBody().GetUserData();

        //被撞
        if (userDataA.toString() == 'hero' && userDataB.toString() == 'enemy' && !userDataB.dead||
            userDataA.toString() == 'enemy' && userDataB.toString() == 'hero' && !userDataA.dead) {
            _self.collideRect.push(userDataA);
            _self.collideRect.push(userDataB);
        }

        //击中敌机
        if (userDataA.toString() == 'bullet' && userDataB.toString() == 'enemy' ||
            userDataA.toString() == 'enemy' && userDataB.toString() == 'bullet') {
            _self.collideRect.push(userDataA);
            _self.collideRect.push(userDataB);
        }
    }

    this._world.SetContactListener(listener);
}

ShootPlaneAppLayer.prototype.addBullet = function(bulletSprite){
    this.bulletBatchNode.addChild(bulletSprite);
}

ShootPlaneAppLayer.prototype.generateEnemy=function(){
    var _self = this;
    var lastType = 0;

    if(!this.interval){
        this.interval = setInterval(function(){
            var enemy = new EnemySprite(lastType);
            var r = Math.random()*_self.size.width-_self.size.width/2;
            var x = _self.size.width/2+r;
            var y = _self.size.height;
            enemy.setPosition(x,y);
            enemy.scheduleUpdate();

            lastType = enemy.enemyType;

            _self.enemyBatchNode.addChild(enemy);

            var enemyBody = enemy.getPhysicalBody();
            if(enemyBody){
                enemyBody.SetPosition(new Box2D.Common.Math.b2Vec2(x/_self.ptmRatio,(_self.size.height-y)/_self.ptmRatio));
            }

        },1500);
    }
}

ShootPlaneAppLayer.prototype.gameOver = function(hero,score){
    //cc.AudioEngine.getInstance().stopAllEffects();
    var i;
    for(i=0,len=this.clients.length;i<len;i++){
        var client = this.clients[i];
        if(hero.id == client.hero.id){
            break;
        }
    }
    var delClient = this.clients.splice(i,1)[0];

    if(this.clients.length==0){
        this._gameover = true;
        cc.AudioEngine.getInstance().stopMusic();
        var scene = cc.Scene.create();
        scene.addChild(GameOverLayer.create(score));
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(0.2, scene));
        this.state = "";
        window.ondevicemotion = null;
        window.clearInterval(this.interval);
        this.interval = null;
    }
    else{
        //战友挂了一位
        console.log("gameover");
    }

    network.send("status|gameover|"+this.pairCode+"|"+delClient.id+"|"+score);
}

//desprated 使用box2d 侦测碰撞
/*
ShootPlaneAppLayer.prototype.checkIsCollide=function(){
    var bullets = this.bulletBatchNode.getChildren();
    var enemies = this.enemyBatchNode.getChildren();
    var heroRect = this.hero.collideRect();

    for(var i=0,lenb=bullets.length;i<lenb;i++){
        var bulletRect = bullets[i].collideRect();

        for(var j=0,lene=enemies.length;j<lene;j++){
            var enemyRect = enemies[j].collideRect();

            if(cc.rectIntersectsRect(bulletRect,enemyRect)){
                this.collideRect.push(bullets[i]);
                this.collideRect.push(enemies[j]);
            }

            if(!enemies[j].dead && cc.rectIntersectsRect(enemyRect,heroRect)){
                this.collideRect.push(this.hero);
                this.collideRect.push(enemies[j]);
            }
        }
    }
}
*/

ShootPlaneAppLayer.prototype.removeSprites = function(){
    for(var i =0,len=this.collideRect.length;i<len;i++){
        var rem = this.collideRect[i];
        if(!rem.dead && rem.hurt()){
            rem.destroy = true;
        }
    }
    //删除死掉的sprite
    for(var i=this.collideRect.length-1;i>=0;i--){
        var rem = this.collideRect[i];
        if(rem.destroy){
            delete this.collideRect[i];
            this.collideRect.length--;
        }
    }
}

ShootPlaneAppLayer.prototype.updateScore = function(){
    cc.AudioEngine.getInstance().playEffect("music/achievement.mp3");
    this.scoreLabel.setString("score: "+this.score);
}

var ShootPlaneAppScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new LoadingLayer();
        layer.init();
        this.addChild(layer);
    }
});