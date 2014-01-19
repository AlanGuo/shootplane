var BulletSprite = cc.Sprite.extend({
	bulletBody:null,
	ctor:function(){
		this._super();
		var pFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame("bullet1.png");
        this.initWithSpriteFrame(pFrame);
        this.setScale(0.5);
        this.createPhysicalBody();
        this.flag=+new Date();
	},
	update:function(){
		var pos = this.getPosition();
		pos.y+=15;
		var size = g_appLayer.size;

		if(pos.x>0 && pos.y>0 && pos.x<size.width && pos.y<size.height){
			this.setPosition(pos);
			this.changePosition(pos.x,pos.y);
		}
		else{
			//先清空，优化时可考虑重新利用
			this.removeFromParent();
			g_appLayer._world.DestroyBody(this.bulletBody);
		}
	}
});

BulletSprite.prototype.getPhysicalBody = function(){
	return this.bulletBody;
}

BulletSprite.prototype.changePosition = function(x,y){
	this.setPosition(x,y);
	this.bulletBody.SetPosition(new Box2D.Common.Math.b2Vec2(x/g_appLayer.ptmRatio,(g_appLayer.size.height-y)/g_appLayer.ptmRatio));
}

BulletSprite.prototype.createPhysicalBody = function(){
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
	v = [[ -0.73885 * width/ptmRatio, -0.06941 * height/ptmRatio ], 
	[ -0.19872 * width/ptmRatio, -0.59851 * height/ptmRatio ], 
	[ +0.41856 * width/ptmRatio, -0.03634 * height/ptmRatio ],
    [ -0.12156 * width/ptmRatio, +0.49276 * height/ptmRatio ]];
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

	var bulletBody = g_appLayer._world.CreateBody(bodyDef);
	bulletBody.CreateFixture(fixDef);

	this.bulletBody = bulletBody;
	this.bulletBody.SetUserData(this);
}

BulletSprite.prototype.collideRect=function () {
	var pos = this.getPosition();
	var size = this.getContentSize();
    return cc.rect(pos.x-size.width/2, pos.y-size.height/2, size.width,size.height);
}

BulletSprite.prototype.hurt=function(){
	this.removeFromParent();
	g_appLayer._world.DestroyBody(this.bulletBody);
	return true;
}

BulletSprite.prototype.toString=function(){
	return "bullet";
}

BulletSprite.prototype.getFlag=function(){
	return this.flag;
}