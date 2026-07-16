const http = require("http");
const WebSocket = require("ws");



const server =
http.createServer();



const wss =
new WebSocket.Server({
    server
});



// 저장된 그림 데이터

let drawings=[];



// 접속자 목록

let clients=[];






wss.on("connection",socket=>{


    console.log(
        "client connected"
    );



    clients.push(socket);



    // 새 사용자에게 기존 그림 전달

    socket.send(JSON.stringify({

        type:"init",

        drawings:drawings

    }));







    socket.on("message",message=>{


        let data;



        try{


            data =
            JSON.parse(
                message.toString()
            );


        }

        catch(e){

            return;

        }






        // 그림 추가

        if(data.type==="draw"){


            drawings.push(data);



        }







        // 전체 삭제

        if(data.type==="clear"){


            drawings=[];


        }







        // 모든 사용자에게 전달

        clients.forEach(client=>{


            if(
                client.readyState ===
                WebSocket.OPEN
            ){


                client.send(

                    JSON.stringify(data)

                );


            }


        });



    });








    socket.on("close",()=>{


        clients =
        clients.filter(
            c=>c!==socket
        );



        console.log(
            "client disconnected"
        );



    });



});






const PORT =
process.env.PORT || 8080;



server.listen(PORT,()=>{


    console.log(
        "server running",
        PORT
    );


});