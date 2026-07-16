// ===============================
// WebSocket Whiteboard Server
// ===============================


const http = require("http");
const WebSocket = require("ws");




// Render 서버

const server =
http.createServer();





const wss =
new WebSocket.Server({

    server

});






// 현재 그림 저장

let drawings=[];




// 접속자 관리

let clients=[];








wss.on(
"connection",
(socket)=>{


    console.log(
        "client connected"
    );



    clients.push(socket);





    // 새로 접속한 사람에게
    // 현재 그림 전달


    socket.send(JSON.stringify({

        type:"init",

        drawings:drawings


    }));







    socket.on(
    "message",
    (message)=>{


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








        // 그림 저장


        if(data.type==="draw"){


            drawings.push(data);


        }








        // 전체 삭제


        if(data.type==="clear"){


            drawings=[];


        }









        // 모든 사용자에게 전달


        clients.forEach(
        client=>{


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









    socket.on(
    "close",
    ()=>{


        console.log(
            "client disconnected"
        );



        clients =
        clients.filter(
            c=>c!==socket
        );



    });



});









// Render 포트

const PORT =
process.env.PORT || 10000;



server.listen(
PORT,
()=>{


    console.log(
        "server running :",
        PORT
    );


});