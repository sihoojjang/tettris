const WebSocket = require("ws");
const http = require("http");


const server = http.createServer();


const wss = new WebSocket.Server({
    server
});



let clients = [];


// 모든 그림 저장
let drawings = [];


// 사용자 번호
let userCount = 0;





wss.on("connection", socket=>{


    const id = ++userCount;


    socket.userId=id;


    console.log(
        "접속 : USER",
        id
    );



    clients.push(socket);




    // 새 접속자에게 현재 그림 전송

    socket.send(JSON.stringify({

        type:"init",

        drawings:drawings

    }));







    socket.on("message",message=>{


        let data;


        try{

            data=
            JSON.parse(
                message.toString()
            );

        }

        catch{

            return;

        }





        // 그림 추가

        if(data.type==="draw"){


            data.user=id;


            drawings.push(data);


        }






        // 삭제

        if(data.type==="clear"){


            drawings=[];


        }






        // 모두에게 전송

        clients.forEach(client=>{


            if(
                client.readyState===WebSocket.OPEN
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
            "나감 : USER",
            id
        );


    });



});






const PORT =
process.env.PORT || 8080;



server.listen(PORT,()=>{


console.log(
"WebSocket Server Running : "+PORT
);


});