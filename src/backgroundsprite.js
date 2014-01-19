var BackgroundSprite = cc.Sprite.extend({
	ctor:function(){
		this._super();
		var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames("sprite/shoot_background.plist", "sprite/shoot_background.png");

        this.initWithSpriteFrameName("background.png");
	}
});