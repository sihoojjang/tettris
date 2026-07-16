const WebSocket = require("ws");
const http = require("http");


const server = http.createServer();


const wss = new WebSocket.Server({
    server
});



let players = [];



wss.on("connection", socket => {


    console.log("접속");


    if(players.length >= 2){

        socket.send(JSON.stringify({
            type:"full"
        }));

        socket.close();

        return;

    }



    players.push(socket);



    let id = players.length;


    socket.id=id;



    socket.send(JSON.stringify({

        type:"player",
        id:id

    }));



    // 두 명 모두 접속하면 시작 알림

    if(players.length===2){

        players.forEach(p=>{

            p.send(JSON.stringify({

                type:"start"

            }));

        });

    }





    socket.on("message", message=>{


        let data;


        try{

            data=JSON.parse(message);

        }
        catch{

            return;

        }



        // 상대에게 전달

        players.forEach(p=>{


            if(
                p!==socket &&
                p.readyState===WebSocket.OPEN
            ){

                p.send(JSON.stringify(data));

            }


        });



    });





    socket.on("close",()=>{


        players =
        players.filter(
            p=>p!==socket
        );


        console.log("나감");


    });



});




const PORT =
process.env.PORT || 8080;



server.listen(PORT,()=>{


console.log(
"Server running on "+PORT
);


});