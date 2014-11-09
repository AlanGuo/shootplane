var network = {
	client:null,
	loadingLayer:null,
	offset:{},
	layerSize:null,
	pairCode:0,
	init:function(type,layer, cb){
		this.client = new WebSocket("ws://"+window.location.hostname+":"+window.location.port+"/","echo-protocol-"+type);
		this.loadingLayer = layer;
		this.sync();
		this.client.onopen = cb;
		this.layerSize = layer.size;
	},
	sync:function(){
		var self = this;
		var pos = {x:0,y:0};
		this.client.onmessage = function(msg){
			var info = msg.data.split('-');
			var id = null;
			var received = null;

			if(info.length>1){
				id = info[0];
			}
			
			if(id){
		    	received = info[1].split("|");
		    }
		    else{
		    	//没有id
		    	received = info[0].split("|");
		    }

		    var from = null;

		    if(g_appLayer && g_appLayer.clients && g_appLayer.clients.length){
			    from = g_appLayer.clients.filter(function(item){
			    	if(item.id == id){
			    		return item;
			    	}
			    })[0];
			}

	        switch(received[0]){
	            case "hero":
	            	if(from){
		            	var position = received[1];
		            	var pos = JSON.parse(position);
		            	//同步hero的坐标
		            	var clientSize = from.clientSize;
		            	if(clientSize){
		            		pos.x += self.offset[id].x - clientSize.width/2;
		            		pos.y += self.offset[id].y - clientSize.height/2;
		            	}
		            	from.hero.changePosition(pos.x,pos.y);
		            }
	            break;
	            case "pair":
	            	if(self.loadingLayer){
	            		self.loadingLayer.showPairCode(received[1]);
	            		self.pairCode = received[1];
	            	}
	            break;
	            case "status":
	            	if(received[1] == "gameover"){
	            		g_appLayer.score = received[4];
	            		g_appLayer.gameOver(received[4]);
	            	}
	            	else if(received[1] == "nohostestablished"){
	            		//console.log("no host established");
	            	}
	            	else if(received[1] == "join"){
	            		self.offset[received[2]] = {x:self.layerSize.width/2,y:self.layerSize.height/2};

	            		if(!g_appLayer || g_appLayer.state != "playing"){
	            			//第一个加入游戏或者游戏已结束
		            		self.loadingLayer.startGame({pairCode:self.pairCode});
		            		g_appLayer.join({id:received[2],clientSize:{width:received[3],height:received[4]}});
		            	}
		            	else{
		            		//中途加入游戏
		            		g_appLayer.join({id:received[2],clientSize:{width:received[3],height:received[4]}});
		            	}
	            	}
	            break;
	            case "offset":
		        //如果飞机在屏幕边缘
		        if(from){
			        var clientSize = from.clientSize;
			        if(clientSize){
			        	//同步hero的坐标
			        	var position = received[2];

			            if(received[1] == "left"){
			            	//同步hero的坐标
			            	pos = JSON.parse(received[4]);
			                self.offset[id].x-=(5+received[2]/10|0);
			                if(self.offset[id].x < 0){
			                	self.offset[id].x = 0;
			                }

			                pos.x += self.offset[id].x - clientSize.width/2;
			                pos.y += self.offset[id].y - clientSize.height/2;
			                from.hero.changePosition(pos.x,pos.y);
			            }
			            else if(received[1] == "right"){
			            	pos = JSON.parse(received[4]);
			                self.offset[id].x+=(5+received[2]/10|0);
			                if(self.offset[id].x > self.layerSize.width){
			                	self.offset[id].x = self.layerSize.width;
			                }

			                pos.x += self.offset[id].x - clientSize.width/2;
			                pos.y += self.offset[id].y - clientSize.height/2;
			                from.hero.changePosition(pos.x,pos.y);
			            }
			            else if(received[1] == "top"){
			            	pos = JSON.parse(received[4]);
			            	self.offset[id].y+=(5+received[3]/10|0);
			            	if(self.offset[id].y > self.layerSize.height){
			                	self.offset[id].y = self.layerSize.height;
			                }

			            	pos.x += self.offset[id].x - clientSize.width/2;
			                pos.y += self.offset[id].y - clientSize.height/2;
			                from.hero.changePosition(pos.x,pos.y);
			            }
			            else if(received[1] == "bottom"){
			            	pos = JSON.parse(received[4]);
			            	self.offset[id].y-=(5+received[3]/10|0);
			            	if(self.offset[id].y < 0){
			                	self.offset[id].y = 0;
			                }

			            	pos.x += self.offset[id].x - clientSize.width/2;
			                pos.y += self.offset[id].y - clientSize.height/2;
			                from.hero.changePosition(pos.x,pos.y);
			            }
			            else if(received[1] == "topleft"){
			            	self.offset[id].y-=(5+received[3]/10|0);
			            	self.offset[id].x-=(5+received[2]/10|0);
			            	if(self.offset[id].x < 0){
			                	self.offset[id].x = 0;
			                }
			                if(self.offset[id].y < 0){
			                	self.offset[id].y = 0;
			                }

			            	pos.x += self.offset[id].x - clientSize.width/2;
			                pos.y += self.offset[id].y - clientSize.height/2;
			                from.hero.changePosition(pos.x,pos.y);
			            }
			            else if(received[1] == "topright"){
			            	self.offset[id].y-=(5+received[3]/10|0);
			            	self.offset[id].x+=(5+received[2]/10|0);
			            	if(self.offset[id].x > self.layerSize.width){
			                	self.offset[id].x = self.layerSize.width;
			                }
			                if(self.offset[id].y < 0){
			                	self.offset[id].y = 0;
			                }

			            	pos.x += self.offset[id].x - clientSize.width/2;
			                pos.y += self.offset[id].y - clientSize.height/2;
			                from.hero.changePosition(pos.x,pos.y);
			            }
			            else if(received[1] == "bottomleft"){
			            	self.offset[id].y+=(5+received[3]/10|0);
			            	self.offset[id].x-=(5+received[2]/10|0);

			            	if(self.offset[id].x < 0){
			                	self.offset[id].x = 0;
			                }
			                if(self.offset[id].y > self.layerSize.height){
			                	self.offset[id].y = self.layerSize.height;
			                }

			            	pos.x += self.offset[id].x - clientSize.width/2;
			                pos.y += self.offset[id].y - clientSize.height/2;
			                from.hero.changePosition(pos.x,pos.y);
			            }
			            else if(received[1] == "bottomright"){
			            	self.offset[id].y+=(5+received[3]/10|0);
			            	self.offset[id].x+=(5+received[2]/10|0);

			            	if(self.offset[id].x > self.layerSize.width){
			                	self.offset[id].x = self.layerSize.width;
			                }
			            	if(self.offset[id].y > self.layerSize.height){
			                	self.offset[id].y = self.layerSize.height;
			                }

			            	pos.x += self.offset[id].x - clientSize.width/2;
			                pos.y += self.offset[id].y - clientSize.height/2;
			                from.hero.changePosition(pos.x,pos.y);
			            }
			        }
		            break;
		        }
		    }
		}
	},
	send:function(msg){
		this.client.send(msg);
	}
}