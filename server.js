const WebSocket = require("ws");
const http = require("http");


// HTTP 서버 생성
const server = http.createServer();


// WebSocket 서버
const wss = new WebSocket.Server({
    server
});



// 접속자 목록
let clients = [];



// 현재 그림 데이터 저장
// 새로 들어온 사람에게 보내기 위해 사용
let drawings = [];





wss.on("connection", socket => {


    console.log("사용자 접속");


    clients.push(socket);



    // 새 사용자에게 기존 그림 전달

    drawings.forEach(data=>{


        socket.send(
            JSON.stringify(data)
        );


    });






    socket.on("message", message => {



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

        clients.forEach(client=>{


            if(
                client.readyState === WebSocket.OPEN
            ){


                client.send(
                    JSON.stringify(data)
                );


            }


        });



    });









    socket.on("close",()=>{


        console.log("사용자 나감");



        clients =
        clients.filter(
            c=>c!==socket
        );



    });



});








const PORT =
process.env.PORT || 8080;




server.listen(PORT,()=>{


    console.log(
        "WebSocket Server Running : "
        + PORT
    );


});