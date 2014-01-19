var cocos2dApp = cc.Application.extend({
    config:document['ccConfig'],
    ctor:function (scene) {
        this._super();
        this.startScene = scene;
        cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
        cc.initDebugSetting();
        cc.setup(this.config['tag']);
        
        //拉伸全屏
        cc.EGLView.getInstance().setDesignResolutionSize(350,530,cc.RESOLUTION_POLICY.SHOW_ALL);

        cc.Loader.getInstance().initWithResources([
            {type:"png",src:"sprite/shoot_background.png"},
            {type:"plist",src:"sprite/shoot_background.plist"}
        ],function(){
            cc.AppController.shareAppController().didFinishLaunchingWithOptions()
        },this);
    },
    applicationDidFinishLaunching:function () {
        var director = cc.Director.getInstance();
        director.setDisplayStats(this.config['showFPS']);
        director.setAnimationInterval(1.0 / this.config['frameRate']);
        director.runWithScene(new this.startScene());

        return true;
    }
});
var shootPlaneApp = new cocos2dApp(LoadingScene);