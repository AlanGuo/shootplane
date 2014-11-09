var GameOverLayer = cc.LayerColor.extend({
    init:function(score){
        var _self = this;
        this._super();
        this.size = cc.Director.getInstance().getWinSize();
        this.setColor(new cc.Color4B(195, 200, 201, 255));

        //cc.SpriteFrameCache.getInstance().addSpriteFrames("sprite/shoot_background.plist");
        //texture cache
        //var texture = cc.TextureCache.getInstance().addImage("sprite/shoot_background.png");

        var scoreLabel = cc.LabelTTF.create(score, "Arial", 20);
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
        network.loadingLayer.startGame(true);
    }
});

GameOverLayer.create = function(score){
    var gl = new GameOverLayer();
    if(gl && gl.init(score))
        return gl;
    else return null;
}