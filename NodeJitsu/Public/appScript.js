  
$(document).ready(function(){

        function downloadCanvas(link, canvasId, filename) {
            link.href = document.getElementById(canvasId).toDataURL();
            link.download = filename;
        }
    
		/*-------------------Connection to socket io----------------------------- */

		var server = io.connect('127.0.0.1:9080'), nameID;

    
		$("#NameTagB").on('click',function(event){			

			nameID = $("#NameTag").val();
            var reg = /^[a-zA-Z]{1,}$/g;

			if(reg.test(nameID)){
				$("#error").html("<p>Logging in...</p>").css("display","block");
				server.emit("initial",{name:nameID});
			}else{
				$("#error").html("<p>Enter valid name</p>").css("display","block");
			}			

		});
		

		server.on("error",function(data){
			 $("#error").html("<p>"+data+"</p>").css("display","block");
		});



		server.on("joined",function(data){
			var ln = data.onlineBuddies.length;			
			document.getElementById('members').innerHTML=" ";
            
			$("#NameAsk").css("display","none");
			$("#error").css("display","none");
			$("#Wrapper").css("display","block");

			for(var i=0; i < ln;i++){
				document.getElementById('members').innerHTML += "<li>"+data.onlineBuddies[i]+"</li>";
			}			

		});


		server.on("disjoined",function(data){

			var ln = data.onlineBuddies.length;

			document.getElementById('members').innerHTML=" ";

			for(var i=0; i < ln;i++){

				document.getElementById('members').innerHTML += "<li>"+data.onlineBuddies[i]+"</li>";

			}

		});


		/*-------------------Connection to socket io----------------------------- */

	(function() {
		var lock = false;
		var canvas = document.querySelector('#paint');
		var ctx = canvas.getContext('2d');
		
		var sketch = document.querySelector('#sketch');
		var sketch_style = getComputedStyle(sketch);
		canvas.width = parseInt(sketch_style.getPropertyValue('width'));
		canvas.height = parseInt(sketch_style.getPropertyValue('height'));

		var mouse = {x: 0, y: 0};
		var last_mouse = {x: 0, y: 0};
		
		/* Mouse Capturing Work */
		canvas.addEventListener('mousemove', function(e) {
			if(!lock){
				last_mouse.x = mouse.x;
				last_mouse.y = mouse.y;
				
				mouse.x = e.pageX - this.offsetLeft;
				mouse.y = e.pageY - this.offsetTop;
			}
			
		}, false);
		

		
		/* Drawing on Paint App */
		ctx.lineWidth = 5;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.strokeStyle = '#000';
		
		canvas.addEventListener('mousedown', function(e) {
			if(!lock){
				canvas.addEventListener('mousemove', onPaint, false);
				server.emit("Start_to_draw",true);
			}

		}, false);

		server.on("lock",function(ldraw){
				lock = ldraw.lck;
				document.getElementById('status').innerHTML = "<h3>"+ldraw.msg+"</h3>";
				document.getElementById('status').style.background= (lock)? "#E0324E" : "#32E09B";
		});
		
		canvas.addEventListener('mouseup', function() {

				canvas.removeEventListener('mousemove', onPaint, false);
				server.emit("Start_to_draw",false);
				

		}, false);
		
		var onPaint = function() {

			ctx.beginPath();
			ctx.moveTo(last_mouse.x,last_mouse.y);
			ctx.lineTo(mouse.x, mouse.y);
			ctx.closePath();
			ctx.stroke();
			if(!lock){
				server.emit("clonedraw",{Lx:last_mouse.x,Ly:last_mouse.y,x:mouse.x,y:mouse.y});
			}
		};

		server.on("draw",function(data){

			last_mouse.x=data.Lx;
			last_mouse.y=data.Ly;
			mouse.x=data.x;
			mouse.y=data.y;

		    onPaint();
	    });

		server.on("Initdraw",function(data){

			last_mouse.x=data.x;
			last_mouse.y=data.y;
			ctx.strokeStyle = data.color;
			var img = new Image();
			img.onload = function(){
			  ctx.drawImage(img,0,0); // Or at whatever offset you like
			};
			img.src = data.ImgData;
            
	    });

	   server.on("getContext",function(id){
	    	var imgData = canvas.toDataURL();
	    	server.emit("setContext",{image:imgData,cid:id});
	    });




  		$("#options .color").on('click',function(){

			var colorVal = $(this).attr("data-color");

			ctx.strokeStyle = colorVal;

			server.emit("optionsSet",{colorSet:true,color:colorVal,clear:false});

		});


		$("#pick").on('click',function(){

			var ColorReg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/g;


			var colorVal = $("#inpColor").val();	

			if(ColorReg.test(colorVal)){
				
				ctx.strokeStyle = colorVal;
				server.emit("optionsSet",{colorSet:true,color:colorVal,clear:false});

				
			}else{
				colorVal="#ffffff";
			}
			$("#preview").css("background",colorVal);

		});

		$("#clearCan").on('click',function(){

			ctx.clearRect(0,0,canvas.width,canvas.height);
			server.emit("optionsSet",{colorSet:false,clear:true});

		});

		$("#saveCan").on("click",function(){
            downloadCanvas(this, 'paint', 'canvas-snapshot-'+ (new Date().toISOString()) +'.png');
		});

		server.on("optionsGet",function(data){

			if(data.colorSet){
				ctx.strokeStyle = data.color;
			}else if(data.clear){
				ctx.clearRect(0,0,canvas.width,canvas.height);
			}

		});



	}());


 		
 });