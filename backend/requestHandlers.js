var connectionArray = [];
var connectingPairs = {};
var connetedPairs = [];

var websocket = {
	_sendToAll : function(content,type, except){
		if(!/array/i.test(Object.prototype.toString.call(except))){
			except = [except];
		}
		if(type === "utf-8"){
			for(var i=0,len=connectionArray.length;i<len;i++){
				var conn = connectionArray[i];
				if(except.indexOf(conn)==-1)
					conn.sendUTF(content);
			}
		}
		else if(type === "binary"){
			for(var i=0,len=connectionArray.length;i<len;i++){
				var conn = connectionArray[i];
				if(except.indexOf(conn)==-1)
					conn.sendUTF(content);
			}
		}
	},

	originIsAllowed : function(origin){
		return true;
	},
	reject : function(request){
	},
	accept : function(protocol, connection){
		var _self = this;
		connectionArray.push(connection);
		if(protocol == "echo-protocol-pc"){
			var pair = {};
			pair.pc = connection;
			pair.code = parseInt(Math.random().toFixed(4)*10000);
			//send code back to client
			console.log("generated pair code:"+pair.code);
			pair.pc.sendUTF("pair|"+pair.code);
			connectingPairs[pair.code] = pair;
		}

		connection.on('message', function(message) {
			console.log('Received Message: ' + message.utf8Data);
	        if (message.type === 'utf8') {
	            if(/pair/i.test(message.utf8Data)){
	            	//用于配对的消息
	            	var messageArray = message.utf8Data.split("|");
	            	var code = messageArray[1];
	            	pair = connectingPairs[code];
	            	
	            	if(pair){
	            		var pairCopy = {};
	            		pairCopy.pc = pair.pc;
	            		pairCopy.code = pair.code;

	            		console.log("配对成功");
	            		pairCopy.mobile = connection;
	            		pairCopy.id = messageArray[2];
	            		connetedPairs.push(pairCopy);
	            		pairCopy.pc.sendUTF("status|join|"+pairCopy.id+"|"+messageArray[3]+"|"+messageArray[4]);
	            	}
	            	else{
	            		connection.sendUTF("status|nohostestablished");
	            	}
	            }
	            else if(/gameover/i.test(message.utf8Data)){
	            	var messageArray = message.utf8Data.split("|");
	            	var id = messageArray[3];
	            	var connectedItem = connetedPairs.filter(function(item){
	            		return item.id == id;
	            	});
	            	if(connectedItem && connectedItem[0]){
	            		connectedItem[0].mobile.sendUTF(message.utf8Data);
	            	}
	            }
	            else{
	            	_self._sendToAll(message.utf8Data, "utf-8", connection);
	            }
	        }
	        else if (message.type === 'binary') {
	            //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
	           _self._sendToAll(message.binaryData, "binary", connection);
	        }
	    });

	    connection.on('close', function(reasonCode, description) {
	        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	        connectionArray.splice(connectionArray.indexOf(connection),1);
	    });
	}
}

exports.websocket = websocket;