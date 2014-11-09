var g_appLayer;

var ShootPlaneMobileAppLayer = cc.LayerColor.extend({
    hero:null,
    size:0,
    bulletBatchNode:null,
    enemyBatchNode:null,
    collideRect:[],
    interval:null,
    backgroundSprite:null,
    score:0,
    scoreLabel:null,
    state:"",
    ptmRatio:1,
    _sensitivity:0.5,
    _world:null,
    _gameover:false,
    _ratio:80,
    id:0,

    init:function(id){
        var _self = this;
        this._super();
        this.size = cc.Director.getInstance().getWinSize();
        this._gameover = false;
        this.id = id;
        g_appLayer = this;

        this.setColor(new cc.Color4B(195, 200, 201, 255));
        //box2d world
        this._world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 0) , true);
        
        this.ptmRatio = shootPlaneApp.config.box2dScale;

        //加载plist
        cc.SpriteFrameCache.getInstance().addSpriteFrames("sprite/shoot.plist");
        //texture cache
        var texture = cc.TextureCache.getInstance().addImage("sprite/shoot.png");
    
        //分数
        this.scoreLabel = cc.LabelTTF.create("score: "+this.score, "Arial", 20);
        this.scoreLabel.setPosition(this.size.width-80,this.size.height-50);
        this.scoreLabel.setColor(new cc.Color3B(0,0,0));
        
        //英雄
        this.hero = new HeroSprite();
        this.hero.setPosition(this.size.width/2,this.size.height/4);
        this.hero.scheduleUpdate();

        //add set hero position
        var heroBody = this.hero.getPhysicalBody();
        if(heroBody){
            heroBody.SetPosition(new Box2D.Common.Math.b2Vec2(this.size.width/(2*this.ptmRatio),this.size.height*3/(4*this.ptmRatio)));
        }
        
        this.addChild(this.hero);
        this.addChild(this.scoreLabel);
        this.scheduleUpdate();

        if (sys.capabilities.hasOwnProperty('keyboard'))
            this.setKeyboardEnabled(true);

        if (sys.capabilities.hasOwnProperty('mouse'))
        /*if ('mouse' in sys.capabilities)*/
            this.setMouseEnabled(true);

        if (sys.capabilities.hasOwnProperty('touches')){
        /*if ('touches' in sys.capabilities)*/
            this.setTouchEnabled(true);
        }

        this.state = "playing";

        //方向感应
        /*
        暂时屏蔽
        window.ondevicemotion = function(e){
            _self.onDeviceMotion.call(_self,e);
        }
        */

        //失去焦点的时候，停止产生敌人
        window.onblur = function(){
            window.clearInterval(_self.interval);
            _self.interval = null;
        }
        return true;
    },
    update:function(){
        //侦测碰撞
        //this.checkIsCollide();
        this.removeSprites();
        //跟随主程序的刷新率，这里把interval设置成0
        this._world.Step(0, 0, 0);
        this.updateOffset();
    },

    updateOffset:function(){
        //sync offset
        var curPos = this.hero.getPosition();
        if(curPos.x >= this.size.width-this._ratio){
            if(curPos.y <= this._ratio){
                this.hero.syncPosition("offset|bottomright|"+parseInt(curPos.x-this.size.width+this._ratio)+"|"+parseInt(this._ratio-curPos.y)+"|");
            }
            else if(curPos.y >= this.size.height-this._ratio){
                this.hero.syncPosition("offset|topright|"+parseInt(curPos.x-this.size.width+this._ratio)+"|"+parseInt(curPos.y-this.size.height+this._ratio)+"|");
            }
            else{
                this.hero.syncPosition("offset|right|"+parseInt(curPos.x-this.size.width+this._ratio)+"|0|");
            }
        }
        else if(curPos.x <= this._ratio){
            if(curPos.y <= this._ratio){
                this.hero.syncPosition("offset|bottomleft|"+parseInt(this._ratio-curPos.x)+"|"+parseInt(this._ratio-curPos.y)+"|");
            }
            else if(curPos.y >= this.size.height-this._ratio){
                this.hero.syncPosition("offset|topleft|"+parseInt(this._ratio-curPos.x)+"|"+parseInt(curPos.y-this.size.height+this._ratio)+"|");
            }
            else{
                this.hero.syncPosition("offset|left|"+parseInt(this._ratio-curPos.x)+"|0|");
            }
        }

        if(curPos.y <= this._ratio){
            this.hero.syncPosition("offset|bottom|0|"+parseInt(this._ratio-curPos.y)+"|");
        }
        else if(curPos.y >= this.size.height-this._ratio){
            this.hero.syncPosition("offset|top|0|"+parseInt(curPos.y-this.size.height+this._ratio)+"|");
        }
    },
    
    onTouchesMoved:function (touches, e) {
        this.processEvent(touches[0]);
    },

    onMouseDragged:function (e) {
        this.processEvent(e);
    },

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
});

ShootPlaneMobileAppLayer.prototype.gameOver = function(score){
    this._gameover = true;
    //cc.AudioEngine.getInstance().stopMusic();
    var scene = cc.Scene.create();
    scene.addChild(GameOverLayer.create(score));
    cc.Director.getInstance().replaceScene(cc.TransitionFade.create(0.2, scene));
    this.state = "";
    window.ondevicemotion = null;
    window.clearInterval(this.interval);
    this.interval = null;
}

ShootPlaneMobileAppLayer.prototype.removeSprites = function(){
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

ShootPlaneMobileAppLayer.prototype.updateScore = function(){
    //cc.AudioEngine.getInstance().playEffect("music/achievement.mp3");
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