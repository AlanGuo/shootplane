var LoadingLayer = cc.LayerColor.extend({
	init:function(){
		var _self = this;
        this._super();

        this.size = cc.Director.getInstance().getWinSize();

        var loadingSprite = new LoadingSprite();
        loadingSprite.setPosition(this.size.width/2,this.size.height/2);

        this.setColor(new cc.Color4B(195, 200, 201, 255));
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
        var text = window.location.href+"?code="+code;
        var fragment = document.createDocumentFragment();

        var wrapperDiv = document.createElement("div");
        wrapperDiv.id = "connection_div";
        var div = document.createElement("div");
        div.innerHTML = "手机扫描二维码开始游戏";
        wrapperDiv.appendChild(div);

        var img = document.createElement("img");
        img.src= "http://qr.liantu.com/api.php?text="+text;
        img.setAttribute("style","width:150px;margin-top:10px");
        wrapperDiv.setAttribute("style","position:absolute;left:44%;top:22%;text-align:center");
        wrapperDiv.appendChild(img);

        document.body.appendChild(wrapperDiv);
    },
    startGame:function(config){
        var div = document.getElementById("connection_div");
        if(div){
            //移动二维码到屏幕右上角
            //document.body.removeChild(div);
            div.setAttribute("style","position:absolute;bottom:5%;right:5%;text-align:center;opacity:0.6");
        }
        
        var scene = cc.Scene.create();

        var appLayer = new ShootPlaneAppLayer();
        var app = g_appLayer || {};
        appLayer.init(config || app.config);
        scene.addChild(appLayer);
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(0.2, scene));
    }
});

//for mobile
var MobileLoadingLayer = cc.LayerColor.extend({
    init:function(){
        var self = this;
        this._super();
        this.size = cc.Director.getInstance().getWinSize();

        var loadingSprite = new LoadingSprite();
        loadingSprite.setPosition(this.size.width/2,this.size.height/2);

        this.setColor(new cc.Color4B(195, 200, 201, 255));
        this.addChild(loadingSprite);

        var id = parseInt(Math.random()*10000);

        //连接服务器
        network.init("mobile",this,function(){
            var params = window.location.search.replace(/\?/,"").split('&');
            for(var i=0,len=params.length;i<len;i++){
                if(/code/.test(params[i])){
                    var keypair = params[i].split('=');
                    network.send("pair|"+keypair[1]+"|"+id+"|"+self.size.width+"|"+self.size.height);
                    break;
                }
            }
        });
        
        cc.Loader.preload([
            {type:"png",src:"sprite/shoot.png"},
            {type:"plist",src:"sprite/shoot.plist"}
        ],function(){
            self.startGame(false,id);
        });
    },
    replay:function(){
    },
    playSound:function(){
    },
    startGame:function(restart,id){
        var scene = cc.Scene.create();
        if(g_appLayer){
            id = g_appLayer.id;
        }
        var appLayer = new ShootPlaneMobileAppLayer();
        appLayer.init(id);
        scene.addChild(appLayer);
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(0.2, scene));

        if(restart){
            network.send("status|join|"+appLayer.id+"|"+this.size.width+"|"+this.size.height);
        }

        appLayer.hero.syncPosition();
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
