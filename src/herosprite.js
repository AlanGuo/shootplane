var HeroSprite = cc.Sprite.extend({
	_hp:1,
	_animateSpeed:0.15,
	_shootSoundId:null,
	speed:0,
	heroBody:null,
	//加速度
	acceleration:{x:0,y:0},

	ctor:function(){
		this._super();
		//spritesheets
		var pFrame1 = cc.SpriteFrameCache.getInstance().getSpriteFrame("hero1.png");
		var pFrame2 = cc.SpriteFrameCache.getInstance().getSpriteFrame("hero2.png");
		this.initWithSpriteFrame(pFrame1);

		var animFrames = new Array(2);
        animFrames[0] = pFrame1;
        animFrames[1] = pFrame2;
        var animation = cc.Animation.create(animFrames, this._animateSpeed);
        var animate = cc.Animate.create(animation);
        this.runAction(cc.RepeatForever.create(animate));

        this.createPhysicalBody();
	},

	stop:function(){
		this.speed = 0;
		this.acceleration.x = 0;
	},

	/*用于加速度控制
	update:function(){
		var x = 0, t = 1;
		var v0 = this.speed;
		var at = this.acceleration.x*t;
		var vt = v0+at;
		this.speed = vt;
		x = (vt*vt-v0*v0)/(2*this.acceleration.x);
		if(x){
			x = Math.round(x*10)/10;
			var curPos = this.getPosition();
			var oldCurPos = cc.pAdd(curPos, {x:x,y:0});
	        //不出边界
	        curPos = cc.pClamp(oldCurPos, cc.POINT_ZERO, cc.p(g_appLayer.size.width, g_appLayer.size.height));
	        this.changePosition(curPos.x,curPos.y);

	        this.syncPosition();
	        
	        if(curPos.x != oldCurPos.x){
	        	this.stop();
	        }
    	}
	},
	*/

	syncPosition:function(type){
		var prefix = type || "hero|";
		var posToSend = this.getPosition();
	    posToSend.x = parseInt(posToSend.x);
	    posToSend.y = parseInt(posToSend.y);
	    network.send(g_appLayer.id+"-"+prefix+JSON.stringify(posToSend));
	},

	handleClick:function(e,size){
		var pos = this.getPosition();
		var _self = this;
		var handles = {
			//左
			37:function(){
				var x= pos.x-5;
				if(x<0) x=0;
				_self.changePosition(x,pos.y);
			},
			//右
			39:function(){
				var x= pos.x+5;
				if(x>size.width) x=size.width;
				_self.changePosition(x,pos.y);
			},
			//上
			40:function(){
				var y= pos.y-5;
				if(y<0) y=0;
				_self.changePosition(pos.x,y);
			},
			//下
			38:function(){
				var y= pos.y+5;
				if(y>size.height) y=size.height;
				_self.changePosition(pos.x,y);
			}
		}
		return handles[e]();
	}
});

HeroSprite.prototype.getPhysicalBody = function(){
	return this.heroBody;
}

HeroSprite.prototype.createPhysicalBody = function(){
	var bodyDef = new Box2D.Dynamics.b2BodyDef;
	bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	//create fixture object
	var fixDef = new Box2D.Dynamics.b2FixtureDef;

	//define basic parameters
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
	fixDef.isSensor = true;

	// canvas width and height in meters
	var ptmRatio = g_appLayer.ptmRatio;
	var width = this.getContentSize().width;
	var height = this.getContentSize().height;

	var v = [[ -0.32353 * width / ptmRatio, -0.15079 * height / ptmRatio ],
			[ +0.00000 * width / ptmRatio, -0.49206 * height / ptmRatio ], 
			[ +0.31373 * width / ptmRatio, -0.14286 * height / ptmRatio ],
	        [ +0.49020 * width / ptmRatio, +0.11111 * height / ptmRatio ],
	        [ +0.33333 * width / ptmRatio, +0.39683 * height / ptmRatio ],
	        [ -0.30392 * width / ptmRatio, +0.39683 * height / ptmRatio ],
	        [ -0.48039 * width / ptmRatio, +0.11111 * height / ptmRatio ]];

	var vecs = [];
	for ( var j = 0; j < v.length; j++) {
	    var tmp = new Box2D.Common.Math.b2Vec2();
	    tmp.Set(v[j][0], v[j][1]);
	    vecs[j] = tmp;
	}

	//define shape
	fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
	fixDef.shape.SetAsArray(vecs, vecs.length);

	var heroBody = g_appLayer._world.CreateBody(bodyDef);
	heroBody.CreateFixture(fixDef);

	this.heroBody = heroBody;
	this.heroBody.SetUserData(this);
}

HeroSprite.prototype.changePosition = function(x,y){
	var curPos = cc.pClamp({x:x,y:y}, cc.POINT_ZERO, cc.p(g_appLayer.size.width, g_appLayer.size.height));
	this.setPosition(curPos.x,curPos.y);
	this.heroBody.SetPosition(new Box2D.Common.Math.b2Vec2(curPos.x/g_appLayer.ptmRatio,(g_appLayer.size.height-curPos.y)/g_appLayer.ptmRatio));
}

HeroSprite.prototype.readyToShoot = function(){
	//后面的时间单位是s
	var _self = this;
	this.schedule(function(){
		_self.shoot();
	},1/6);
}

//发射炮弹
HeroSprite.prototype.shoot = function(){
	var bullet = new BulletSprite();
	var size = g_appLayer.size;
	var originPos = this.getPosition();
	var contentSize = this.getContentSize();
    bullet.setPosition(originPos.x,originPos.y+contentSize.height/2+10);
    bullet.scheduleUpdate();
    var body = bullet.getPhysicalBody();
    var ptmRatio = g_appLayer.ptmRatio;
    if(body){
    	body.SetPosition(new Box2D.Common.Math.b2Vec2(originPos.x/ptmRatio,(g_appLayer.size.height-contentSize.height/2+10)/ptmRatio));
    }
    g_appLayer.addBullet(bullet);

    //开炮声音
    //this._shootSoundId = cc.AudioEngine.getInstance().playEffect("music/bullet.mp3");
}

HeroSprite.prototype.collideRect = function () {
	var pos = this.getPosition();
	var size = this.getContentSize();
    return cc.rect(pos.x-size.width/2, pos.y-size.height/2, size.width,size.height);
}

HeroSprite.prototype.hurt = function(){
	if(this._hp<=1){
		this.destroy();
		return true;
	}
	else{
		this._hp--;
		return false;
	}
}

HeroSprite.prototype.destroy = function(){
	var _self = this;
	var inst = cc.SpriteFrameCache.getInstance();
	var pFrame1 = inst.getSpriteFrame("hero_blowup_n1.png");
	var pFrame2 = inst.getSpriteFrame("hero_blowup_n2.png");
	var pFrame3 = inst.getSpriteFrame("hero_blowup_n3.png");
	var pFrame4 = inst.getSpriteFrame("hero_blowup_n4.png");

	var animFrames = new Array(4);
    animFrames[0] = pFrame1;
    animFrames[1] = pFrame2;
    animFrames[2] = pFrame3;
    animFrames[3] = pFrame4;

    //停止所有动作
    this.stopAllActions();
    //不会再有伤害了
    this.dead = true;
    cc.AudioEngine.getInstance().playEffect("music/game_over.mp3");

    var animation = cc.Animation.create(animFrames,this._animateSpeed);
    var animate = cc.Animate.create(animation);
    this.runAction(cc.Sequence.create(animate,cc.CallFunc.create(function(){
    	g_appLayer._world.DestroyBody(_self.heroBody);
    	_self.removeFromParent();
    	g_appLayer.gameOver(_self,g_appLayer.score);
    }, this)));
}

HeroSprite.prototype.toString = function(){
	return "hero";
}