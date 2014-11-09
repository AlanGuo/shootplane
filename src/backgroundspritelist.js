var backgroundSpriteList = {
	init:function(num,size){
		var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames("sprite/rocks_texture.plist", "sprite/rocks_texture.png");
        var texture = cc.TextureCache.getInstance().addImage("sprite/rocks_texture.png");

        this.batchNode = cc.SpriteBatchNode.createWithTexture(texture);
        
        this.smallRocks(size);
        this.random(num,size);

        return this.batchNode;
	},
	random:function(num,size){
		for(var sizeStep = 0;sizeStep<size.width;sizeStep+=180){
			var v = parseInt(Math.random()*10+1);
			var x = parseInt(Math.random()*180+sizeStep+1);
			var y = parseInt(Math.random()*size.height+1);
			var sprite = cc.Sprite.createWithSpriteFrameName("rocks-"+v+".png");
			var elemSize = sprite.getContentSize();
			sprite.setPosition(x,y);

			this.batchNode.addChild(sprite);
		}
	},
	smallRocks:function(size){
		var texture_small = cc.TextureCache.getInstance().addImage("sprite/small.png");
		var sprite_small = cc.Sprite.createWithTexture(texture_small);
		var contentSize = sprite_small.getContentSize();

		for(var y=0;y<size.height/contentSize.height;y++){
			for(var x=0;x<size.width/contentSize.width;x++){
				sprite_small = cc.Sprite.createWithTexture(texture_small);
				sprite_small.setPosition(x*contentSize.width,size.height-y*contentSize.height);
				this.batchNode.addChild(sprite_small);
			}
		}
	}
}