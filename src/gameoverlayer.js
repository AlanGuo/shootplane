var GameOverLayer = cc.Layer.extend({
    init:function(){
        var _self = this;
        this._super();
        this.size = cc.Director.getInstance().getWinSize();
        
        cc.SpriteFrameCache.getInstance().addSpriteFrames("sprite/shoot_background.plist");
        //texture cache
        var texture = cc.TextureCache.getInstance().addImage("sprite/shoot_background.png");

        //game object
        var backgroundSprite = cc.Sprite.createWithSpriteFrameName("gameover.png");
        backgroundSprite.setPosition(this.size.width/2,this.size.height/2);

        this.addChild(backgroundSprite);

        var scoreLabel = cc.LabelTTF.create(g_appLayer.score, "Arial", 20);
        scoreLabel.setPosition(this.size.width/2,this.size.height/2+50);
        scoreLabel.setColor(new cc.Color3B(0,0,0));

        this.addChild(scoreLabel);

        var menuItem1 = new cc.MenuItemFont.create("Play Again",this.replay,this);
        menuItem1.setColor(new cc.Color3B(0,0,0));
        menuItem1.setPosition(new cc.Point(this.size.width/2,this.size.height/2));
        var menu = cc.Menu.create(menuItem1);
        menu.setPosition(new cc.Point(0,0));
        this.addChild(menu);

        return true;
    },

    replay : function(){
        var scene = cc.Scene.create();
        var appLayer = new ShootPlaneAppLayer();
        appLayer.init();
        scene.addChild(appLayer);
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(0.2, scene));
    }
});

GameOverLayer.create = function(){
    var gl = new GameOverLayer();
    if(gl && gl.init())
        return gl;
    else return null;
}