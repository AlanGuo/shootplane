var EnemySprite = cc.Sprite.extend({
	_hp:0,
	enemyType:1,
	hitAnimate:null,
	dead:false,
	enemyBody:null,
	ctor:function(lastType){
		this._super();
		var _self = this;

		var enemyType = 1;
		this._hp = 1;
		var r;
		do{
			r = Math.random();
		}
		while(lastType == 3 && r>0.8)
		
		if(r>0.5 && r<=0.8){
			enemyType = 2;
			this._hp = 4;
		}
		else if(lastType!=3){
			enemyType = 3;
			this._hp = 6;
		}

		this.enemyType = enemyType;
		var pFrame1 = cc.SpriteFrameCache.getInstance().getSpriteFrame("enemy"+(enemyType==3?enemyType+"_n1":enemyType)+".png");
        this.initWithSpriteFrame(pFrame1);
        var pFrame2 = cc.SpriteFrameCache.getInstance().getSpriteFrame("enemy3_n2.png");

        if(enemyType == 3){
        	//自身动画
	        var animFrames = new Array(2);
	        animFrames[0] = pFrame1;
	        animFrames[1] = pFrame2;
	        var animation = cc.Animation.create(animFrames, 0.14);
	        var animate = cc.Animate.create(animation);
	        this.runAction(cc.RepeatForever.create(animate));

	        cc.AudioEngine.getInstance().playEffect("music/big_spaceship_flying.mp3");
    	}

    	if(this.enemyType > 1){
			var pFrame1 = cc.SpriteFrameCache.getInstance().getSpriteFrame("enemy"+this.enemyType+"_hit.png");
			var pFrame2 = cc.SpriteFrameCache.getInstance().getSpriteFrame("enemy"+this.enemyType+(this.enemyType==3?"_n1.png":".png"));
			var animFrames = new Array(2);
			animFrames[0] = pFrame1;
			animFrames[1] = pFrame2;
			var animation = cc.Animation.create(animFrames,0.08);
		    var animate = cc.Animate.create(animation);
		    this.hitAnimate = cc.Sequence.create(animate);
		}

		this.createPhysicalBody();
	},
	update:function(){
		var pos = this.getPosition();
		pos.y-=3;
		var size = g_appLayer.size;

		if(pos.x>0 && pos.y>0 && pos.x<size.width && pos.y<size.height){
			this.changePosition(pos.x,pos.y);
		}
		else{
			//先清空，优化时可考虑重新利用
			this.removeFromParent();
			g_appLayer._world.DestroyBody(this.enemyBody);
		}		
	}
});

EnemySprite.prototype.changePosition = function(x,y){
	this.setPosition(x,y);
	this.enemyBody.SetPosition(new Box2D.Common.Math.b2Vec2(x/g_appLayer.ptmRatio,(g_appLayer.size.height-y)/g_appLayer.ptmRatio));
}

EnemySprite.prototype.getPhysicalBody = function(){
	return this.enemyBody;
}

EnemySprite.prototype.createPhysicalBody = function(){
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
	var ptmRatio = shootPlaneApp.config.box2dScale;
	var width = this.getContentSize().width;
	var height = this.getContentSize().height;

	var v = 0;
	var type = this.enemyType;
	switch(type){
		case 1:
			v = [ [ -0.40351 * width/ptmRatio, -0.11628 * height/ptmRatio ], 
			[ -0.33333 * width/ptmRatio, -0.37209 * height/ptmRatio ], 
			[ +0.29825 * width/ptmRatio, -0.41860 * height/ptmRatio ],
	        [ +0.42105 * width/ptmRatio, -0.09302 * height/ptmRatio ],
	        [ +0.00000 * width/ptmRatio, +0.46512 * height/ptmRatio ]];
		break;
		case 2:
			v = [ [ -0.52174 * width/ptmRatio, -0.21212 * height/ptmRatio ], 
			[ -0.01449 * width/ptmRatio, -0.47475 * height/ptmRatio ], 
			[ +0.44928 * width/ptmRatio, -0.19192 * height/ptmRatio ],
	        [ +0.47826 * width/ptmRatio, +0.06061 * height/ptmRatio ],
	        [ +0.08696 * width/ptmRatio, +0.39394 * height/ptmRatio ],
	        [ -0.11594 * width/ptmRatio, +0.39394 * height/ptmRatio ],
	        [ -0.49275 * width/ptmRatio, +0.13131 * height/ptmRatio ]];
		break;
		case 3:
			v = [ [ -0.37396 * width/ptmRatio, -0.49690 * height/ptmRatio ], 
			[ +0.35740 * width/ptmRatio, -0.49225 * height/ptmRatio ], 
			[ +0.47811 * width/ptmRatio, +0.27519 * height/ptmRatio ],
	        [ +0.24379 * width/ptmRatio, +0.42868 * height/ptmRatio ],
	        [ -0.23195 * width/ptmRatio, +0.43333 * height/ptmRatio ],
	        [ -0.49467 * width/ptmRatio, +0.27054 * height/ptmRatio ]];
		break;
	}
	// vector defining shape of the snail, coordinates determined using Andengine Vertex Helper tool

	var vecs = [];
	for ( var j = 0; j < v.length; j++) {
	    var tmp = new Box2D.Common.Math.b2Vec2();
	    tmp.Set(v[j][0], v[j][1]);
	    vecs[j] = tmp;
	}

	//define shape
	fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
	fixDef.shape.SetAsArray(vecs, vecs.length);

	var enemyBody = g_appLayer._world.CreateBody(bodyDef);
	enemyBody.CreateFixture(fixDef);

	this.enemyBody = enemyBody;
	this.enemyBody.SetUserData(this);
}

EnemySprite.prototype.collideRect=function () {
	var pos = this.getPosition();
	var size = this.getContentSize();
    return cc.rect(pos.x-size.width/2, pos.y-size.height/2, size.width,size.height);
}

EnemySprite.prototype.hurt = function(){
	if(this._hp==0){
		this.destroy();
		return true;
	}
	else{
		this._hp--;
		//击中动画
		if(this.enemyType > 1){
		    this.runAction(this.hitAnimate);
		}
		return false;
	}
}

EnemySprite.prototype.destroy = function(){
	var _self = this;
	var inst = cc.SpriteFrameCache.getInstance();
	var pFrame1 = inst.getSpriteFrame("enemy"+this.enemyType+"_down1.png");
	var pFrame2 = inst.getSpriteFrame("enemy"+this.enemyType+"_down2.png");
	var pFrame3 = inst.getSpriteFrame("enemy"+this.enemyType+"_down3.png");
	var pFrame4 = inst.getSpriteFrame("enemy"+this.enemyType+"_down4.png");

	var scores = {
		"1":10,
		"2":100,
		"3":1000
	}

	g_appLayer.score += scores[this.enemyType];
	g_appLayer.updateScore();

	var animFrames = null;
	var speed = 0.12;

	if(this.enemyType == 3){
		//大飞机
		animFrames = new Array(6);
		animFrames[4] = inst.getSpriteFrame("enemy"+this.enemyType+"_down5.png");
    	animFrames[5] = inst.getSpriteFrame("enemy"+this.enemyType+"_down6.png");
    	speed = 0.2;
	}
	else{
		animFrames = new Array(4);
	}
    animFrames[0] = pFrame1;
    animFrames[1] = pFrame2;
    animFrames[2] = pFrame3;
    animFrames[3] = pFrame4;

    //停止所有动作
    this.stopAllActions();
    //不会再有伤害了
    this.dead = true;
    //播放音效
    cc.AudioEngine.getInstance().playEffect("music/enemy"+this.enemyType+"_down.mp3");

    var animation = cc.Animation.create(animFrames,speed);
    var animate = cc.Animate.create(animation);
    this.runAction(cc.Sequence.create(animate,cc.CallFunc.create(function(){
    	_self.removeFromParent();
    	g_appLayer._world.DestroyBody(_self.enemyBody);
    }, this)));
}

EnemySprite.prototype.toString=function(){
	return "enemy";
}