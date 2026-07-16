const WebSocket = require("ws");
const http = require("http");


const server = http.createServer();


const wss = new WebSocket.Server({
    server
});



let clients = [];



wss.on("connection", socket => {


    console.log("사용자 접속");


    clients.push(socket);



    socket.on("message", message => {



        // 받은 그림 데이터를 모든 사람에게 전달

        clients.forEach(client => {


            if(
                client !== socket &&
                client.readyState === WebSocket.OPEN
            ){

                client.send(message.toString());

            }


        });


    });





    socket.on("close",()=>{


        clients =
        clients.filter(
            c=>c!==socket
        );


        console.log("사용자 나감");


    });



});





const PORT =
process.env.PORT || 8080;



server.listen(PORT,()=>{


    console.log(
        "WebSocket Server Running : "+PORT
    );


});