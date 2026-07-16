// ===============================
// WebSocket
// ===============================


// 여기에 Render 주소 입력
const socket = new WebSocket(
    "wss://tettris-rkjv.onrender.com"
);



socket.onopen = ()=>{

    console.log(
        "WebSocket 연결 성공"
    );

};



socket.onerror = error=>{

    console.log(
        "WebSocket 오류",
        error
    );

};



socket.onclose = ()=>{

    console.log(
        "WebSocket 연결 종료"
    );

};






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







// ===============================
// 상태
// ===============================


let color="#000000";


let size=5;


let eraser=false;


let drawing=false;



let lastX=0;


let lastY=0;





// 현재 선

let currentStroke=[];



// 내 기록

let myHistory=[];


let myRedo=[];



// 다른 사람 기록

let remoteStrokes=[];








// ===============================
// 좌표 계산
// ===============================


function getPos(e){


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
    getPos(e);



    lastX=pos.x;

    lastY=pos.y;



}








// ===============================
// 이동
// ===============================


function moveDraw(e){


    if(!drawing)

        return;



    e.preventDefault();



    let pos =
    getPos(e);




    let line={


        x1:lastX / canvas.width,


        y1:lastY / canvas.height,


        x2:pos.x / canvas.width,


        y2:pos.y / canvas.height,


        color:color,


        size:size,


        mode:
        eraser ?
        "erase":
        "draw"


    };





    drawLine(line);



    currentStroke.push(line);





    if(socket.readyState===WebSocket.OPEN){


        socket.send(JSON.stringify({

            type:"draw",

            data:line


        }));


    }





    lastX=pos.x;

    lastY=pos.y;



}








// ===============================
// 종료
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







// 마우스

canvas.addEventListener(
"mousedown",
startDraw
);


canvas.addEventListener(
"mousemove",
moveDraw
);


canvas.addEventListener(
"mouseup",
endDraw
);


canvas.addEventListener(
"mouseleave",
endDraw
);






// 터치

canvas.addEventListener(
"touchstart",
startDraw,
{passive:false}
);


canvas.addEventListener(
"touchmove",
moveDraw,
{passive:false}
);


canvas.addEventListener(
"touchend",
endDraw
);
// ===============================
// 선 그리기
// ===============================


function drawLine(line){


    ctx.lineWidth =
    line.size;


    ctx.lineCap =
    "round";



    if(line.mode==="erase"){


        ctx.globalCompositeOperation =
        "destination-out";


    }
    else{


        ctx.globalCompositeOperation =
        "source-over";


        ctx.strokeStyle =
        line.color;


    }



    ctx.beginPath();



    ctx.moveTo(

        line.x1 * canvas.width,

        line.y1 * canvas.height

    );



    ctx.lineTo(

        line.x2 * canvas.width,

        line.y2 * canvas.height

    );



    ctx.stroke();



    ctx.globalCompositeOperation =
    "source-over";


}








// ===============================
// 다시 그리기
// ===============================


function redraw(){


    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );




    remoteStrokes.forEach(stroke=>{


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





    // 접속했을 때 기존 그림

    if(msg.type==="init"){


        remoteStrokes=[];



        msg.drawings.forEach(item=>{


            remoteStrokes.push([

                item.data

            ]);



            drawLine(
                item.data
            );


        });


    }







    // 다른 사람 그림

    if(msg.type==="draw"){


        remoteStrokes.push([

            msg.data

        ]);



        drawLine(
            msg.data
        );


    }






    // 전체 삭제

    if(msg.type==="clear"){


        remoteStrokes=[];

        myHistory=[];

        myRedo=[];



        ctx.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );


    }


};










// ===============================
// 색 변경
// ===============================


document
.getElementById("color")
.addEventListener(
"input",
e=>{


    color =
    e.target.value;



    eraser=false;



    document
    .getElementById("eraser")
    .innerText="지우개";


});










// ===============================
// 크기 변경
// ===============================


document
.getElementById("size")
.addEventListener(
"input",
e=>{


    size =
    Number(e.target.value);


});









// ===============================
// 지우개
// ===============================


document
.getElementById("eraser")
.addEventListener(
"click",
()=>{


    eraser =
    !eraser;



    document
    .getElementById("eraser")
    .innerText =
    eraser ?
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


    if(socket.readyState===WebSocket.OPEN){


        socket.send(JSON.stringify({

            type:"clear"

        }));


    }


});

resizeCanvas();