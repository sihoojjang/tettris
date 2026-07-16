// ===============================
// WebSocket
// ===============================


const socket = new WebSocket(
    "wss://YOUR_RENDER_SERVER_ADDRESS"
);



// ===============================
// Canvas
// ===============================


const canvas =
document.getElementById("canvas");


const ctx =
canvas.getContext("2d");



const toolbar =
document.getElementById("toolbar");



function resizeCanvas(){


    canvas.width =
    window.innerWidth;



    canvas.height =
    window.innerHeight -
    toolbar.offsetHeight;



    redraw();


}



window.addEventListener(
"resize",
resizeCanvas
);



resizeCanvas();





// ===============================
// 도구 상태
// ===============================


let brushColor="#000000";


let brushSize=5;


let isEraser=false;





// ===============================
// 기록
// ===============================


// 내 그림

let myHistory=[];


// 다시 그릴 그림

let myRedo=[];



// 다른 사람 그림

let remoteHistory=[];



// 현재 그리고 있는 선

let currentStroke=[];



let drawing=false;


let lastX=0;

let lastY=0;







// ===============================
// 위치 계산
// ===============================


function getPosition(e){


    const rect =
    canvas.getBoundingClientRect();



    let x;
    let y;



    if(e.touches){


        x=e.touches[0].clientX;

        y=e.touches[0].clientY;


    }

    else{


        x=e.clientX;

        y=e.clientY;


    }



    return {


        x:x-rect.left,

        y:y-rect.top


    };

}





// ===============================
// 그리기 시작
// ===============================


function startDraw(e){


    e.preventDefault();



    drawing=true;



    currentStroke=[];



    let pos =
    getPosition(e);



    lastX=pos.x;

    lastY=pos.y;



}







// ===============================
// 그리는 중
// ===============================


function drawingMove(e){


    if(!drawing)

        return;



    e.preventDefault();



    let pos =
    getPosition(e);




    let data={


        x1:lastX/canvas.width,

        y1:lastY/canvas.height,


        x2:pos.x/canvas.width,

        y2:pos.y/canvas.height,


        color:brushColor,


        size:brushSize,


        mode:
        isEraser?
        "erase":
        "draw"


    };





    drawLine(data);



    currentStroke.push(data);



    socket.send(JSON.stringify({

        type:"draw",

        data:data


    }));





    lastX=pos.x;

    lastY=pos.y;



}






// ===============================
// 그리기 종료
// ===============================


function endDraw(){


    if(!drawing)

        return;



    drawing=false;




    if(currentStroke.length>0){


        myHistory.push(
            currentStroke
        );


        myRedo=[];


    }




    currentStroke=[];



}





canvas.addEventListener(
"mousedown",
startDraw
);


canvas.addEventListener(
"mousemove",
drawingMove
);


canvas.addEventListener(
"mouseup",
endDraw
);



canvas.addEventListener(
"mouseleave",
endDraw
);





canvas.addEventListener(
"touchstart",
startDraw
);


canvas.addEventListener(
"touchmove",
drawingMove
);


canvas.addEventListener(
"touchend",
endDraw
);
// ===============================
// 실제 그리기
// ===============================


function drawLine(data){


    ctx.lineWidth =
    data.size;


    ctx.lineCap =
    "round";



    if(data.mode==="erase"){


        ctx.globalCompositeOperation =
        "destination-out";


    }

    else{


        ctx.globalCompositeOperation =
        "source-over";


        ctx.strokeStyle =
        data.color;


    }




    ctx.beginPath();



    ctx.moveTo(

        data.x1 * canvas.width,

        data.y1 * canvas.height

    );



    ctx.lineTo(

        data.x2 * canvas.width,

        data.y2 * canvas.height

    );



    ctx.stroke();



    ctx.globalCompositeOperation =
    "source-over";


}







// ===============================
// 전체 다시 그리기
// ===============================


function redraw(){


    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );




    remoteHistory.forEach(stroke=>{


        stroke.forEach(line=>{


            drawLine(line);


        });


    });





    myHistory.forEach(stroke=>{


        stroke.forEach(line=>{


            drawLine(line);


        });


    });



}









// ===============================
// 서버 데이터 받기
// ===============================


socket.onmessage=e=>{


    const msg =
    JSON.parse(e.data);





    // 처음 접속했을 때 기존 그림 받기

    if(msg.type==="init"){


        remoteHistory=[];



        msg.drawings.forEach(item=>{


            remoteHistory.push([

                item.data

            ]);



            drawLine(
                item.data
            );


        });


    }






    // 다른 사람이 그린 그림

    if(msg.type==="draw"){



        remoteHistory.push([

            msg.data

        ]);



        drawLine(
            msg.data
        );


    }







    // 전체 삭제

    if(msg.type==="clear"){


        myHistory=[];

        myRedo=[];

        remoteHistory=[];



        ctx.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );


    }



};








// ===============================
// 도구
// ===============================


document
.getElementById("color")
.addEventListener(
"input",
e=>{


    brushColor =
    e.target.value;


    isEraser=false;



    document
    .getElementById("eraser")
    .innerText="지우개";


});





document
.getElementById("size")
.addEventListener(
"input",
e=>{


    brushSize =
    Number(e.target.value);


});






document
.getElementById("eraser")
.addEventListener(
"click",
()=>{


    isEraser =
    !isEraser;



    document
    .getElementById("eraser")
    .innerText =
    isEraser?
    "펜":
    "지우개";



});








// ===============================
// Undo
// ===============================


document
.getElementById("undo")
.addEventListener(
"click",
()=>{


    if(myHistory.length===0)

        return;



    myRedo.push(

        myHistory.pop()

    );



    redraw();



});







// ===============================
// Redo
// ===============================


document
.getElementById("redo")
.addEventListener(
"click",
()=>{


    if(myRedo.length===0)

        return;



    myHistory.push(

        myRedo.pop()

    );



    redraw();



});







// ===============================
// 전체 삭제
// ===============================


document
.getElementById("clear")
.addEventListener(
"click",
()=>{


    socket.send(JSON.stringify({

        type:"clear"

    }));



});