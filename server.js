const WebSocket = require("ws");
const http = require("http");


const server = http.createServer();


const wss = new WebSocket.Server({
    server
});



let rooms = [];

let roomId = 1;




function findRoom(){

    for(let room of rooms){

        if(room.players.length < 2){

            return room;

        }

    }


    let newRoom={

        id:roomId++,

        players:[]

    };


    rooms.push(newRoom);


    return newRoom;

}




wss.on("connection",socket=>{


    let room=findRoom();



    room.players.push(socket);



    socket.room=room;



    socket.id=
    room.players.length;



    socket.send(JSON.stringify({

        type:"player",

        id:socket.id,

        room:room.id

    }));




    console.log(
        "Room:",
        room.id,
        "Player:",
        socket.id
    );





    if(room.players.length===2){


        room.players.forEach(p=>{


            p.send(JSON.stringify({

                type:"start"

            }));


        });


    }






    socket.on("message",msg=>{


        let data;


        try{

            data=JSON.parse(msg);

        }
        catch{

            return;

        }





        let room=
        socket.room;



        if(!room)

        return;




        room.players.forEach(p=>{


            if(
                p!==socket &&
                p.readyState===WebSocket.OPEN
            ){


                p.send(
                    JSON.stringify(data)
                );


            }


        });


    });






    socket.on("close",()=>{


        let room=
        socket.room;



        if(!room)

        return;




        room.players=
        room.players.filter(
            p=>p!==socket
        );




        if(room.players.length===0){


            rooms=
            rooms.filter(
                r=>r!==room
            );


        }



    });



});






const PORT =
process.env.PORT || 8080;



server.listen(PORT,()=>{


console.log(
"server running"
);


});