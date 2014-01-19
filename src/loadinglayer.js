var LoadingLayer = cc.Layer.extend({
	init:function(){
		var _self = this;
        this._super();
        this.size = cc.Director.getInstance().getWinSize();

        var loadingSprite = new LoadingSprite();
        loadingSprite.setPosition(this.size.width/2,this.size.height/2);

        var backgroundSprite = new BackgroundSprite();
        backgroundSprite.setPosition(this.size.width/2,this.size.height/2);

        this.addChild(backgroundSprite);
        this.addChild(loadingSprite);

        //连接服务器
        network.init("pc",this);

        //初始化声音
        
        cc.AudioEngine.getInstance().init("mp3,ogg,wav");
        
        cc.Loader.preload([
        	{type:"effect",src:"music/bullet.mp3"},
            {type:"bgm",src:"music/game_music.mp3"},
            {type:"png",src:"sprite/shoot.png"},
            {type:"plist",src:"sprite/shoot.plist"}
        ],function(){
        });

	},
    replay:function(){
    },
    playSound:function(){
    },
    showPairCode:function(code){
        var pairCode = cc.LabelTTF.create("Pair code: "+code, "Arial", 20);
        pairCode.setColor(new cc.Color3B(0,0,0));
        pairCode.setPosition(this.size.width/2,this.size.height/2+40);
        this.addChild(pairCode);
    },
    startGame:function(){
        var scene = cc.Scene.create();
        var appLayer = new ShootPlaneAppLayer();
        appLayer.init();
        scene.addChild(appLayer);
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(0.2, scene));
    }
});

//for mobile
var MobileLoadingLayer = cc.Layer.extend({
    init:function(){
        var _self = this;
        this._super();
        this.size = cc.Director.getInstance().getWinSize();

        var loadingSprite = new LoadingSprite();
        loadingSprite.setPosition(this.size.width/2,this.size.height/2);

        var backgroundSprite = new BackgroundSprite();
        backgroundSprite.setPosition(this.size.width/2,this.size.height/2);

        this.addChild(backgroundSprite);
        this.addChild(loadingSprite);

        //连接服务器
        network.init("mobile",this);
        var params = window.location.search.replace(/\?/,"").split('&');
        for(var i=0,len=params.length;i<len;i++){
            if(/code/.test(params[i])){
                var keypair = params[i].split('=');
                network.send("pair|"+keypair[1]);
                break;
            }
        }
        
        var scene = cc.Scene.create();
        var appLayer = new ShootPlaneAppLayer(type);
        appLayer.init();
        scene.addChild(appLayer);
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(0.2, scene));
    },
    replay:function(){
    },
    playSound:function(){
    }
});

var LoadingScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        //判断是pc还是移动设备
        var ua = window.navigator.userAgent;
        var layer;
        if(/mobile|android|iphone|ipad|itouch/i.test(ua)){
            //移动设备
            layer = new MobileLoadingLayer();
        }
        else{
            layer = new LoadingLayer();
        }
        layer.init();
        this.addChild(layer);
    }
})

LoadingLayer.create = function(){
	var gl = new GameOverLayer();
    if(gl && gl.init())
        return gl;
    else return null;
}
