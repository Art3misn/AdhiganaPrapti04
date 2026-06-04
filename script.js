/* =========================
   NAVBAR SCROLL EFFECT
========================= */

const navbar = document.querySelector("nav");

window.addEventListener("scroll", () => {

  if(window.scrollY > 50){

    navbar.style.background = "rgba(0,0,0,.75)";
    navbar.style.backdropFilter = "blur(20px)";
    navbar.style.borderBottom =
    "1px solid rgba(255,255,255,.08)";

  }else{

    navbar.style.background = "rgba(0,0,0,.45)";
    navbar.style.backdropFilter = "blur(18px)";
  }

});

/* =========================
   ACTIVE MENU ON SCROLL
========================= */

const sections =
document.querySelectorAll("section");

const navLinks =
document.querySelectorAll(".menu a");

window.addEventListener("scroll", () => {

  let current = "";

  sections.forEach(section => {

    const sectionTop =
    section.offsetTop - 150;

    const sectionHeight =
    section.clientHeight;

    if(scrollY >= sectionTop){

      current =
      section.getAttribute("id");

    }

  });

  navLinks.forEach(link => {

    link.classList.remove("active");

    if(
      link.getAttribute("href")
      === `#${current}`
    ){
      link.classList.add("active");
    }

  });

});

/* =========================
   SMOOTH FADE ANIMATION
========================= */

const observer =
new IntersectionObserver((entries)=>{

  entries.forEach((entry)=>{

    if(entry.isIntersecting){

      entry.target.classList.add("show");

    }

  });

},{
  threshold:0.15
});

const hiddenElements =
document.querySelectorAll(
  ".stat-box, .feature, .event-card, .gallery-grid img"
);

hiddenElements.forEach((el)=>{

  el.classList.add("hidden");
  observer.observe(el);

});

/* =========================
   COUNTER ANIMATION
========================= */

const counters =
document.querySelectorAll(".stat-box h2");

const speed = 200;

counters.forEach(counter => {

  const animate = () => {

    const value =
    +counter.innerText.replace(/\D/g,'');

    const data =
    +counter.getAttribute("data-target");

    const time =
    data / speed;

    if(value < data){

      counter.innerText =
      Math.ceil(value + time) + "+";

      setTimeout(animate,15);

    }else{

      counter.innerText = data + "+";

    }

  };

  animate();

});

/* =========================
   HERO PARALLAX EFFECT
========================= */

window.addEventListener("mousemove",(e)=>{

  const heroCard =
  document.querySelector(".hero-card");

  let x =
  (window.innerWidth / 2 - e.pageX) / 35;

  let y =
  (window.innerHeight / 2 - e.pageY) / 35;

  heroCard.style.transform =
  `rotateY(${x}deg) rotateX(${-y}deg)`;

});

/* =========================
   RESET HERO POSITION
========================= */

window.addEventListener("mouseleave",()=>{

  const heroCard =
  document.querySelector(".hero-card");

  heroCard.style.transform =
  "rotateY(0deg) rotateX(0deg)";

});

/* =========================
   GLOW EFFECT BUTTON
========================= */

const buttons =
document.querySelectorAll(".btn");

buttons.forEach((button)=>{

  button.addEventListener("mousemove",(e)=>{

    const rect =
    button.getBoundingClientRect();

    const x =
    e.clientX - rect.left;

    const y =
    e.clientY - rect.top;

    button.style.background =
    `radial-gradient(circle at ${x}px ${y}px,
    #8ce9f5,
    #45c1d4)`;

  });

  button.addEventListener("mouseleave",()=>{

    button.style.background =
    "linear-gradient(135deg,#69d7e8,#37bfd6)";

  });

});

/* =========================
   IMAGE HOVER ZOOM
========================= */

const galleryImages =
document.querySelectorAll(".gallery-grid img");

galleryImages.forEach((img)=>{

  img.addEventListener("mousemove",(e)=>{

    const rect =
    img.getBoundingClientRect();

    const x =
    e.clientX - rect.left;

    const y =
    e.clientY - rect.top;

    img.style.transformOrigin =
    `${x}px ${y}px`;

  });

});

/* =========================
   TYPING EFFECT HERO
========================= */

const typingText =
"Solid • Kreatif • Peduli";

const typingElement =
document.querySelector(".hero-card h3");

let index = 0;

function typeEffect(){

  if(index < typingText.length){

    typingElement.innerHTML +=
    typingText.charAt(index);

    index++;

    setTimeout(typeEffect,70);

  }

}

typingElement.innerHTML = "";

typeEffect();

/* =========================
   FLOATING ANIMATION
========================= */

const floating =
document.querySelector(".hero-logo");

let floatY = 0;
let direction = 1;

setInterval(()=>{

  floatY += direction * 0.5;

  if(floatY > 12){
    direction = -1;
  }

  if(floatY < -12){
    direction = 1;
  }

  floating.style.transform =
  `translateY(${floatY}px)`;

},20);

/* =========================
   MOBILE MENU
========================= */

const mobileMenuBtn =
document.querySelector(".mobile-menu");

const mobileNav =
document.querySelector(".menu");

if(mobileMenuBtn){

  mobileMenuBtn.addEventListener("click",()=>{

    mobileNav.classList.toggle("show-menu");

  });

}

/* =========================
   SCROLL TO TOP BUTTON
========================= */

const scrollBtn =
document.createElement("button");

scrollBtn.innerHTML =
'<i class="fa-solid fa-arrow-up"></i>';

document.body.appendChild(scrollBtn);

scrollBtn.style.position = "fixed";
scrollBtn.style.bottom = "30px";
scrollBtn.style.right = "30px";
scrollBtn.style.width = "55px";
scrollBtn.style.height = "55px";
scrollBtn.style.border = "none";
scrollBtn.style.borderRadius = "50%";
scrollBtn.style.background =
"linear-gradient(135deg,#69d7e8,#37bfd6)";
scrollBtn.style.color = "#000";
scrollBtn.style.fontSize = "18px";
scrollBtn.style.cursor = "pointer";
scrollBtn.style.display = "none";
scrollBtn.style.zIndex = "999";
scrollBtn.style.boxShadow =
"0 10px 30px rgba(105,215,232,.25)";

window.addEventListener("scroll",()=>{

  if(window.scrollY > 400){

    scrollBtn.style.display = "block";

  }else{

    scrollBtn.style.display = "none";

  }

});

scrollBtn.addEventListener("click",()=>{

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

});

/* =========================
   PRELOADER
========================= */

window.addEventListener("load",()=>{

  const loader =
  document.createElement("div");

  loader.classList.add("loader");

  loader.innerHTML = `
    <div class="loader-logo">
      <img src="Adhigana prapti.png">
    </div>
  `;

  document.body.appendChild(loader);

  loader.style.position = "fixed";
  loader.style.inset = "0";
  loader.style.background = "#050608";
  loader.style.display = "flex";
  loader.style.alignItems = "center";
  loader.style.justifyContent = "center";
  loader.style.zIndex = "99999";
  loader.style.transition = ".7s";

  setTimeout(()=>{

    loader.style.opacity = "0";

    setTimeout(()=>{

      loader.remove();

    },700);

  },1200);

});

/* =========================
   DYNAMIC YEAR
========================= */

const copyright =
document.querySelector(".copyright");

if(copyright){

  copyright.innerHTML =
  `© ${new Date().getFullYear()}
  Karang Taruna Adhigana Prapti —
  All Rights Reserved`;

}

/* =========================
   CONSOLE CREDIT
========================= */

console.log(`
`);

/* =========================
   EXTRA CSS FROM JS
========================= */

const style =
document.createElement("style");

style.innerHTML = `

.hidden{
  opacity:0;
  transform:translateY(40px);
  transition:all 1s ease;
}

.show{
  opacity:1;
  transform:translateY(0);
}

.active{
  color:#69d7e8 !important;
}

.active::after{
  width:100% !important;
}

.show-menu{
  display:flex !important;
  position:absolute;
  top:92px;
  left:0;
  width:100%;
  background:#0d1017;
  flex-direction:column;
  padding:30px;
  border-top:1px solid rgba(255,255,255,.08);
}

.loader-logo{
  width:140px;
  animation:pulse 1.2s infinite;
}

@keyframes pulse{

  0%{
    transform:scale(1);
    opacity:1;
  }

  50%{
    transform:scale(1.08);
    opacity:.7;
  }

  100%{
    transform:scale(1);
    opacity:1;
  }

}

`;

document.head.appendChild(style);
const track = document.querySelector(".pengurus-track");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentPosition = 0;

nextBtn.addEventListener("click", () => {
    currentPosition -= 285;
    track.style.transform =
      `translateX(${currentPosition}px)`;
});

prevBtn.addEventListener("click", () => {
    currentPosition += 285;

    if(currentPosition > 0){
        currentPosition = 0;
    }

    track.style.transform =
      `translateX(${currentPosition}px)`;
});