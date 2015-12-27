var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var socket = require('socket.io');
var io = socket.listen(server);
var sock_ids = new Array();
var sock_names = new Array();
var color = "#000";
var CanvasData={Lx:0,Ly:0,x:0,y:0};

	app.use('/Public', express.static(__dirname + "/Public"));

/*On connection*/

io.sockets.on('connection', function(client) {

	sock_ids.push(client.id);


	if(sock_ids.length>1){
		io.sockets.socket(sock_ids[0]).emit("getContext",client.id);
	}


/*-----------Connection OK-------------*/



/*-------------------YOUR PLAY GROUND----------------*/
 

 client.on("Start_to_draw",function(lock){
 	var message = (lock)? sock_names[sock_ids.indexOf(client.id)]+" is Drawing..." : "Ready to Draw...";
 	client.broadcast.emit("lock",{lck:lock, msg: message});
 });


 client.on("clonedraw",function(data){
 	CanvasData = data;
 	client.broadcast.emit("draw",data);

 });

 client.on("optionsSet",function(data){
 	if(!data.clear){color = data.color;}
 	client.broadcast.emit("optionsGet",data);
 });

/*-------------------YOUR PLAY GROUND----------------*/



/*---------CHATTERS-----------*/	

	/*On initialize*/

	client.on("initial",function(data){

		var na = sock_ids.indexOf(client.id);
		if(sock_names.indexOf(data.name)>=0){ 

			client.emit("error","Name already Taken"); 

		}else if(na >= 0){
			
			sock_names[na] = data.name;
		

			/*broadcast connected*/


			client.on("setContext",function(data){

				io.sockets.socket(data.cid).emit("Initdraw",{x:CanvasData.x,y:CanvasData.y,ImgData:data.image,color:color});	

			});


			client.emit("joined",{onlineBuddies: sock_names });

			client.broadcast.emit("joined",{onlineBuddies: sock_names });

		}


	});

	/*On disconnection*/
   client.on('disconnect', function() {

   		var dis = sock_ids.indexOf(client.id);

		console.log('Client disconnected...' + sock_ids.splice(dis,1) +"_"+ sock_names.splice(dis,1));

        client.broadcast.emit("disjoined",{onlineBuddies: sock_names });

	});	

});




/*On get request*/

app.get('/', function(request, response) {

	response.sendfile(__dirname + '/Public/DrawSync.html');
});

//current directory
var server_port 8080,
    server_ip_address = '127.0.0.1';
 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + port )
});

