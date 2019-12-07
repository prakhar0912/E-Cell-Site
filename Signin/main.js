const image = document.querySelector('#prefCarousel');
const text = document.querySelector('#prefCarouselHeader');

list = ['./img/kitchen.jpg','./img/tv.jpg','./img/home.jpg'];
list2 = ['Kitchen', 'TV', 'House Grid']
n = 0;
image.addEventListener('click', ()=>{
    n++;
    if (n == 3){
        n = 0;
    }
    text.innerHTML = list2[n];
    text.style.color = 'black';
    text.style.fontSize = '3em';
    text.style.position = 'relative';
    text.style.top = '5vh';
    text.style.left = '3vw';
    text.style.zIndex = '900';
    TweenLite.fromTo(image,1,{
        opacity: 0,
        backgroundImage: 'url('+list[n]+')'
    },{
        opacity: 1
    })
    console.log(n);
})