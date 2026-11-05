(()=> {
"use strict";
const canvas=document.getElementById("game");
const ctx=canvas && canvas.getContext("2d");
const scoreEl=document.getElementById("score"), bestEl=document.getElementById("best"), coinsEl=document.getElementById("coins");
if(!canvas || !ctx){document.body.insertAdjacentHTML("beforeend","<p style='color:white'>Game could not start: canvas is unavailable.</p>");return;}
const W=900,H=340,GROUND=276;
let state="ready",score=0,best=0,coins=0,speed=6,frame=0,obstacles=[],gems=[],jumping=false,ducking=false;
try{best=Number(localStorage.getItem("gauriBest")||0)||0;}catch(e){}
bestEl.textContent=String(best).padStart(5,"0");
const face=new Image();face.src="./assets/gauri.svg";
const player={x:95,y:GROUND-112,vy:0};
function safeSave(){try{localStorage.setItem("gauriBest",String(best));}catch(e){}}
function updateHud(){scoreEl.textContent=String(Math.floor(score)).padStart(5,"0");coinsEl.textContent=String(coins);}
function start(){state="run";score=0;coins=0;speed=6;frame=0;obstacles=[];gems=[];player.y=GROUND-112;player.vy=0;ducking=false;updateHud();}
function jump(){if(state!=="run"){start();return;}if(player.y>=GROUND-113){player.vy=-15;}}
function drawBackground(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#bdeff0");g.addColorStop(1,"#f4f7d9");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle="rgba(255,255,255,.8)";
 for(let i=0;i<4;i++){let cx=(i*250-frame*1.8%1050+1050)%1050-70,cy=58+(i%2)*32;ctx.beginPath();ctx.arc(cx,cy,18,0,Math.PI*2);ctx.arc(cx+24,cy-7,25,0,Math.PI*2);ctx.arc(cx+50,cy,17,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle="#a6d7bf";ctx.beginPath();ctx.moveTo(0,236);for(let i=0;i<=900;i+=90)ctx.quadraticCurveTo(i+45,207+Math.sin(i*.02)*10,i+90,236);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
 ctx.fillStyle="#344d50";ctx.fillRect(0,GROUND,W,4);ctx.fillStyle="#7fae8d";ctx.fillRect(0,GROUND+4,W,H-GROUND-4);
 ctx.strokeStyle="#d7edc7";for(let i=-(frame*speed%55);i<W;i+=55){ctx.beginPath();ctx.moveTo(i,GROUND+28);ctx.lineTo(i+20,GROUND+28);ctx.stroke();}
}
function drawPlayer(){
 const h=ducking?78:112,w=ducking?112:96,y=ducking?GROUND-h:player.y;
 if(face.complete&&face.naturalWidth){ctx.save();if(ducking){ctx.translate(player.x+w,y);ctx.scale(-1,1);ctx.drawImage(face,0,0,w,h);}else ctx.drawImage(face,player.x,y,w,h);ctx.restore();}
 else {ctx.fillStyle="#18b9b3";ctx.fillRect(player.x+10,y+35,72,75);ctx.fillStyle="#bd805d";ctx.beginPath();ctx.arc(player.x+47,y+27,25,0,Math.PI*2);ctx.fill();ctx.fillStyle="#18233c";ctx.fillRect(player.x+25,y+20,8,6);ctx.fillRect(player.x+55,y+20,8,6);}
}
function drawOverlay(title,subtitle){ctx.fillStyle="rgba(16,32,59,.72)";ctx.fillRect(0,0,W,H);ctx.textAlign="center";ctx.fillStyle="#fff";ctx.font="900 42px system-ui";ctx.fillText(title,W/2,140);ctx.font="600 18px system-ui";ctx.fillStyle="#d5f8f3";ctx.fillText(subtitle,W/2,180);ctx.font="700 14px system-ui";ctx.fillStyle="#c4d6e8";ctx.fillText("Tap the game or press SPACE to play",W/2,218);}
function hit(o){const px=player.x+18,py=player.y+10,pw=62,ph=95,ox=o.x+4,oy=GROUND-o.h+4,ow=o.w-8,oh=o.h-4;return px<ox+ow&&px+pw>ox&&py<oy+oh&&py+ph>oy;}
function loop(){
 requestAnimationFrame(loop);drawBackground();
 if(state==="run"){
  frame++;score+=speed*.08;speed=Math.min(12,6+score/300);
  player.vy+=.72;player.y+=player.vy;if(player.y>GROUND-112){player.y=GROUND-112;player.vy=0;}
  if(frame%Math.max(48,Math.floor(105-speed*3))===0)obstacles.push({x:W+20,w:Math.random()<.7?32:45,h:Math.random()<.7?54:34});
  if(frame%120===0)gems.push({x:W+20,y:GROUND-105-Math.random()*45});
  obstacles.forEach(o=>o.x-=speed);gems.forEach(a=>a.x-=speed);
  obstacles=obstacles.filter(o=>o.x>-60);gems=gems.filter(a=>a.x>-30);
  for(const o of obstacles){if(hit(o)){state="over";if(score>best){best=Math.floor(score);safeSave();bestEl.textContent=String(best).padStart(5,"0");}}}
  for(const a of gems){if(!a.got&&Math.hypot(player.x+48-a.x,player.y+48-a.y)<48){a.got=true;coins++;}}
  gems=gems.filter(a=>!a.got);updateHud();
 }
 for(const o of obstacles){ctx.fillStyle="#267b54";ctx.fillRect(o.x+10,GROUND-o.h,15,o.h);ctx.fillRect(o.x,GROUND-36,18,12);ctx.fillRect(o.x+20,GROUND-46,15,12);}
 for(const a of gems){ctx.fillStyle="#ffbd36";ctx.beginPath();ctx.arc(a.x,a.y,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff0ae";ctx.lineWidth=3;ctx.stroke();}
 drawPlayer();
 if(state==="ready")drawOverlay("READY, GAURI?","Jump over obstacles · Collect shiny coins");
 if(state==="over")drawOverlay("GAME OVER","Score "+Math.floor(score)+" · Coins "+coins+" · Tap to try again");
}
function setDuck(v){if(state==="run")ducking=v;}
document.addEventListener("keydown",e=>{if(["Space","ArrowUp","KeyW"].includes(e.code)){e.preventDefault();jump();}if(["ArrowDown","KeyS"].includes(e.code)){e.preventDefault();setDuck(true);}});
document.addEventListener("keyup",e=>{if(["ArrowDown","KeyS"].includes(e.code))setDuck(false);});
canvas.addEventListener("pointerdown",e=>{e.preventDefault();jump();});
document.getElementById("jump").addEventListener("pointerdown",e=>{e.preventDefault();jump();});
const duckButton=document.getElementById("duck");duckButton.addEventListener("pointerdown",e=>{e.preventDefault();setDuck(true);});
["pointerup","pointerleave","pointercancel"].forEach(k=>duckButton.addEventListener(k,()=>setDuck(false)));
document.getElementById("restart").addEventListener("click",start);
document.getElementById("sound").addEventListener("click",e=>{e.currentTarget.textContent="♫ Sound: Off";});
loop();
})();