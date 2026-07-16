const WebSocket = require("ws");
const http = require("http");


const server = http.createServer();


const wss = new WebSocket.Server({
    server: server
});


let players = [];



wss.on("connection", socket => {


    console.log("player connected");


    players.push(socket);



    // 접속 순서로 플레이어 번호 부여
    socket.playerId = players.length;



    socket.send(JSON.stringify({
        type:"connected",
        id:socket.playerId
    }));




    socket.on("message", message => {


        let data;


        try{

            data=JSON.parse(message);

        }
        catch(e){

            return;

        }



        // 나 제외한 상대에게 전달
        players.forEach(player=>{


            if(
                player !== socket &&
                player.readyState === WebSocket.OPEN
            ){

                player.send(JSON.stringify(data));

            }


        });



    });





    socket.on("close",()=>{


        console.log("player disconnected");


        players =
        players.filter(
            p=>p!==socket
        );


    });



});




const PORT =
process.env.PORT || 8080;



server.listen(PORT,()=>{


console.log(
"WebSocket server running : "+PORT
);


});