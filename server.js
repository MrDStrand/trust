const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const app=express(); const server=http.createServer(app); const io=new Server(server);
const DATA=process.env.DATA_FILE||path.join(__dirname,'game-data.json');
const HOST_KEY=process.env.HOST_KEY||'change-this-host-key';
const PORT=process.env.PORT||3000;
let game={phase:'waiting',round:1,players:{},history:[],announcement:'',leader:'Daniel Strand'};
try {game=JSON.parse(fs.readFileSync(DATA,'utf8'));}catch{}
function save(){fs.writeFileSync(DATA,JSON.stringify(game,null,2));}
function calculate(){const counts={A:0,B:0,C:0};Object.values(game.players).forEach(p=>{if(p.vote)counts[p.vote]++});const total=Object.keys(game.players).length;const voted=counts.A+counts.B+counts.C;const highest=Math.max(...Object.values(counts));const majority=Object.keys(counts).filter(k=>counts[k]===highest);const pts={};let situation='Waiting for votes';if(voted===total&&total>=2){if(highest===total){situation='Perfect cooperation';for(const p of Object.values(game.players))pts[p.id]=100;}else if(highest===total-1&&majority.length===1){situation='Perfect betrayal';for(const p of Object.values(game.players))pts[p.id]=p.vote===majority[0]?20:200;}else if(majority.length===1&&highest>total/2){situation='Failed betrayal';for(const p of Object.values(game.players))pts[p.id]=p.vote===majority[0]?0:-50;}else{situation='Complete breakdown';for(const p of Object.values(game.players))pts[p.id]=0;}}return {counts,voted,total,points:pts,situation,ready:voted===total&&total>=2};}
function publicState(){const calc=calculate();return {phase:game.phase,round:game.round,leader:game.leader,announcement:game.announcement,players:Object.values(game.players).map(p=>({id:p.id,name:p.name,vote:p.vote,score:p.score,projected:calc.points[p.id]??null})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)),history:game.history,calc};}
function emit(){io.emit('state',publicState());save();}
app.get('/host',(_,res)=>res.sendFile(path.join(__dirname,'public','host.html')));
app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(_,res)=>res.json({ok:true}));
function reply(cb,obj){if(typeof cb==='function')cb(obj);}
function cleanName(name){return String(name||'').trim().replace(/[<>]/g,'').slice(0,35);}
io.on('connection',socket=>{
 socket.emit('state',publicState());
 socket.on('join',({name,id},cb)=>{name=cleanName(name);if(!name)return reply(cb,{error:'Please enter a name.'});const existing=Object.values(game.players).find(p=>p.name.toLowerCase()===name.toLowerCase());if(existing&&existing.id!==id)return reply(cb,{error:'That name is already taken.'});if(id&&game.players[id]){if(game.players[id].name!==name)return reply(cb,{error:'This device is registered under another name.'});socket.data.playerId=id;reply(cb,{ok:true,id});return emit();}if(game.phase!=='waiting'&&game.phase!=='closed')return reply(cb,{error:'Join between rounds, please.'});const newId=crypto.randomUUID();game.players[newId]={id:newId,name,vote:null,score:0};socket.data.playerId=newId;reply(cb,{ok:true,id:newId});emit();});
 socket.on('resume',({id})=>{if(game.players[id])socket.data.playerId=id;socket.emit('state',publicState());});
 socket.on('vote',({option},cb)=>{const id=socket.data.playerId;if(!id||!game.players[id])return reply(cb,{error:'Join first.'});if(game.phase!=='open')return reply(cb,{error:'Voting is closed.'});if(!['A','B','C',null].includes(option))return reply(cb,{error:'Invalid vote.'});game.players[id].vote=option;reply(cb,{ok:true});emit();});
 socket.on('host',({key,action,message},cb)=>{if(key!==HOST_KEY)return reply(cb,{error:'Incorrect host key.'});if(action==='open'){if(game.phase==='open')return reply(cb,{error:'Voting is already open.'});if(game.phase==='closed'){game.round++;for(const p of Object.values(game.players))p.vote=null;}game.phase='open';}else if(action==='close'){if(game.phase!=='open')return reply(cb,{error:'Voting is not open.'});const calc=calculate();const multiplier=game.round===5?2:1;const result={round:game.round,counts:calc.counts,situation:calc.situation,multiplier,awards:[]};for(const p of Object.values(game.players)){const points=(calc.points[p.id]||0)*multiplier;p.score+=points;result.awards.push({name:p.name,vote:p.vote,points});}game.history.unshift(result);game.phase='closed';}else if(action==='announce'){game.announcement=String(message||'').slice(0,240);}else if(action==='remove'){const id=String(message||'');if(game.phase==='open')return reply(cb,{error:'Remove players only between rounds.'});delete game.players[id];}else if(action==='reset'){game={phase:'waiting',round:1,players:{},history:[],announcement:'',leader:'Daniel Strand'};}else return reply(cb,{error:'Unknown action.'});reply(cb,{ok:true});emit();});
});
server.listen(PORT,()=>console.log(`Game running on http://localhost:${PORT}`));
