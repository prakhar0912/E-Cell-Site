const body = document.querySelector('body');
const box = document.querySelector('.box');
const next = document.querySelector('.next');
const prev = document.querySelector('.prev');

const zposition = [0,1540,2030,2520];



function touchHandler(event)
{

    console.log('arts')
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init() 
{
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);    
}

init()



//traversal of z-coordinate
i=0;
body.addEventListener('mousewheel', Scrolling);
function Scrolling(e) {
    
    /* if(i>2550){
        body.style.overflowY = 'scroll';
        body.style.overflowX = 'hidden'; 
        body.removeEventListener("mousewheel",Scrolling);
    } */
    if (e.wheelDelta<=0){   
        i += 40;  
        
        TweenLite.to(box,0.5, {
            transform: 'translateZ('+i+'px)'
        });
    }
    else{          
        i-=40;
        TweenLite.to(box,0.5, {
            transform: 'translateZ('+i+'px)'
        });   
    }
    body.style.overflow = 'hidden';
    if(i <= zposition[0]){
        n = 0;
    }
    if(i >= zposition[0] && i < zposition[1]){
        n = 0;
    }
    if(i >= zposition[1] && i < zposition[2]){
        n = 1;
    }
    if(i >= zposition[2] && i < zposition[3]){
        n = 2;
    }
    /* box.style.transform ='translateZ('+i+'px)'; */
/*     console.log(i)
 */}

// E needs


//next button

next.addEventListener('click', ()=>{
    if (n == 3){
        n = -1;
    }
    TweenLite.to(box, 1, {
        transform : 'translateZ('+zposition[++n]+'px)'
    }); 
    i = zposition[n];
}) 

//prev button
prev.addEventListener('click', ()=>{
    if (n == 0){
        n = 4;
    }
    TweenLite.to(box, 1, {
        transform : 'translateZ('+zposition[--n]+'px)'
    }); 
    i = zposition[n];

}) 