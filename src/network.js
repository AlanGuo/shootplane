var network = {
	client:null,
	loadingLayer:null,
	init:function(type,layer){
		this.client = new WebSocket("ws://localhost:84/","echo-protocol-"+type);
		this.loadingLayer = layer;
		this.sync();
	},
	sync:function(){
		var self = this;
		this.client.onmessage = function(msg){
		    var received = msg.data.split("|");
	        switch(received[0]){
	            case "hero":
	            	var position = received[1];
	            	//同步hero的坐标
	            	var pos = JSON.parse(position);
	            	g_appLayer.hero.changePosition(pos.x,pos.y);
	            break;
	            case "pair":
	            	if(self.loadingLayer){
	            		self.loadingLayer.showPairCode(received[1]);
	            	}
	            break;
	            case "start":
	            	//收到start之后就开始游戏
		            if(self.loadingLayer){
	            		self.loadingLayer.startGame();
	            	}
	            break;
	        }
		}
	},
	send:function(msg){
		this.client.send(msg);
	}
}