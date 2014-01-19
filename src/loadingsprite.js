var LoadingSprite = cc.Sprite.extend({
        ctor:function(){
                this._super();
        	var cache = cc.SpriteFrameCache.getInstance();
                cache.addSpriteFrames("sprite/shoot_background.plist", "sprite/shoot_background.png");

                var pFrame1 = cc.SpriteFrameCache.getInstance().getSpriteFrame("game_loading1.png");
                var pFrame2 = cc.SpriteFrameCache.getInstance().getSpriteFrame("game_loading2.png");
                var pFrame3 = cc.SpriteFrameCache.getInstance().getSpriteFrame("game_loading3.png");
                var pFrame4 = cc.SpriteFrameCache.getInstance().getSpriteFrame("game_loading4.png");
                var animation = cc.Animation.create([pFrame1,pFrame2,pFrame3,pFrame4],0.25);
                var animate = cc.Animate.create(animation);

                this.init();
                this.runAction(cc.RepeatForever.create(animate));
        }
});