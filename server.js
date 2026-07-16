// ===============================
// WebSocket
// ===============================


const socket = new WebSocket(
    "wss://render.com/docs/troubleshooting-deploys"
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
// 상태
// ===============================


let color =
"#000000";


let size =
5;



let eraser =
false;



let drawing =
false;



let lastX=0;

let lastY=0;





// 현재 그리고 있는 Stroke

let currentStroke=[];




// 내 작업 기록

let myHistory=[];


let myRedo=[];



// 다른 사람 그림

let remoteStrokes=[];







// ===============================
// 위치 변환
// ===============================


function getPos(e){


    let rect =
    canvas.getBoundingClientRect();



    let x,y;



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


function start(e){


    e.preventDefault();


    drawing=true;


    currentStroke=[];



    let p =
    getPos(e);



    lastX=p.x;

    lastY=p.y;



}








// ===============================
// 이동
// ===============================


function move(e){


    if(!drawing)

        return;



    e.preventDefault();



    let p =
    getPos(e);




    let line={


        x1:lastX / canvas.width,

        y1:lastY / canvas.height,


        x2:p.x / canvas.width,

        y2:p.y / canvas.height,


        color:color,


        size:size,


        mode:
        eraser ?
        "erase":
        "draw"


    };





    drawLine(line);



    currentStroke.push(line);



    socket.send(JSON.stringify({

        type:"draw",

        data:line


    }));




    lastX=p.x;

    lastY=p.y;


}








// ===============================
// 종료
// ===============================


function end(){


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
start
);


canvas.addEventListener(
"mousemove",
move
);


canvas.addEventListener(
"mouseup",
end
);



canvas.addEventListener(
"mouseleave",
end
);





canvas.addEventListener(
"touchstart",
start
);


canvas.addEventListener(
"touchmove",
move
);


canvas.addEventListener(
"touchend",
end
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
// 전체 다시 그리기
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
// WebSocket 수신
// ===============================


socket.onmessage=e=>{


    let msg =
    JSON.parse(e.data);





    if(msg.type==="init"){


        remoteStrokes=[];



        msg.drawings.forEach(item=>{


            remoteStrokes.push(
                [
                    item.data
                ]
            );



            drawLine(
                item.data
            );


        });


    }






    if(msg.type==="draw"){


        remoteStrokes.push(

            [
                msg.data
            ]

        );



        drawLine(
            msg.data
        );


    }






    if(msg.type==="clear"){


        myHistory=[];

        myRedo=[];

        remoteStrokes=[];



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


    socket.send(JSON.stringify({

        type:"clear"

    }));


});