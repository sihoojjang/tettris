// =========================
// 도구 이벤트 강제 연결
// =========================


const colorInput =
document.getElementById("color");


const sizeInput =
document.getElementById("size");


const eraserButton =
document.getElementById("eraser");


const undoButton =
document.getElementById("undo");


const redoButton =
document.getElementById("redo");


const clearButton =
document.getElementById("clear");




// 색 변경

colorInput.addEventListener("input", e=>{


    brushColor =
    e.target.value;


    isEraser=false;


    eraserButton.innerText="지우개";


});




// 크기 변경

sizeInput.addEventListener("input", e=>{


    brushSize =
    Number(e.target.value);


});




// 지우개

eraserButton.addEventListener("click", ()=>{


    isEraser =
    !isEraser;



    eraserButton.innerText =
    isEraser ?
    "펜":
    "지우개";


});




// Undo

undoButton.addEventListener("click", ()=>{


    if(myHistory.length===0)

        return;



    myRedo.push(
        myHistory.pop()
    );



    redraw();


});




// Redo

redoButton.addEventListener("click", ()=>{


    if(myRedo.length===0)

        return;



    myHistory.push(
        myRedo.pop()
    );


    redraw();


});




// 전체삭제

clearButton.addEventListener("click", ()=>{


    socket.send(JSON.stringify({

        type:"clear"

    }));


});