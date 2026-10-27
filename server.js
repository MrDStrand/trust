'use strict';
const express=require('express');
const http=require('http');
const crypto=require('crypto');
const {Server}=require('socket.io');
const app=express(); const server=http.createServer(app); const io=new Server(server);
app.use(express.static(require('path').join(__dirname,'public')));
app.get('/',(_req,res)=>res.redirect('/player.html'));
const hostKey=process.env.HOST_KEY;
if(!hostKey)console.warn('HOST_KEY is not set; GM login is disabled');
const players=new Map(),sessions=new Map(),gmSockets=new Set();
const steps=['Lobby / teams','Assign powers','Voting','Close voting','CHANGE','Double or Nothing','KO','Score round','Next round'];
const game={round:1,step:0,phase:'lobby',mode:'60',deadline:null,secretD:false,votes:{},events:[],finished:false};
const id=()=>crypto.randomBytes(24).toString('hex');
const clean=s=>typeof s==='string'?s.trim().slice(0,30):'';
const teams=()=>({Blue:[...players.values()].filter(p=>p.team==='Blue').reduce((s,p)=>s+p.points,0),Red:[...players.values()].filter(p=>p.team==='Red').reduce((s,p)=>s+p.points,0)});
const roster=()=>[...players.values()].map(p=>({id:p.id,name:p.name,team:p.team,points:p.points,connected:p.sockets.size>0}));
const winners=()=>{const t=teams(),list=roster(),best=Math.max(-Infinity,...list.map(p=>p.points));return {teams:Object.entries(t).filter(([,v])=>v===Math.max(...Object.values(t))).map(([k])=>k),individuals:list.filter(p=>p.points===best).map(p=>p.name),scores:t};};
const publicState=()=>({round:game.round,step:game.step,stepName:steps[game.step],phase:game.phase,mode:game.mode,deadline:game.deadline,teams:teams(),players:roster(),events:game.events.slice(-7),secretD:game.secretD,finished:game.finished,results:game.finished?winners():null});
function gmState(){return {votes:{...game.votes},players:[...players.values()].map(p=>({id:p.id,name:p.name,team:p.team,power:p.power,powerUsed:p.powerUsed,double:p.double,scored:p.scored}))};}
function emit(){io.emit('state',publicState());for(const p of players.values())for(const sid of p.sockets)io.to(sid).emit('private',{id:p.id,token:p.token,power:p.power,powerUsed:p.powerUsed,vote:game.votes[p.id]||null,double:p.double});for(const sid of gmSockets)io.to(sid).emit('gm:private',gmState());}
function note(s){game.events.push(s);if(game.events.length>35)game.events.shift();}
function fail(socket,s){socket.emit('errorMessage',s);}
function gm(socket,fn){if(!gmSockets.has(socket.id))return fail(socket,'Game Master authentication required');fn();}
function player(socket,data,fn){const token=typeof data?.token==='string'?data.token:'';const p=players.get(sessions.get(token));if(!p||p.token!==token||socket.data.playerId!==p.id)return fail(socket,'Reconnect to your player session');fn(p);}
function votingOpen(){return game.phase==='voting'&&(!game.deadline||Date.now()<game.deadline)&&!game.finished;}
function closeVoting(){if(game.phase!=='voting')return;game.step=3;game.phase='closed';game.deadline=null;for(const p of players.values())if(p.power==='SWAP'&&!p.powerUsed){p.power=null;p.powerUsed=false;}note('Voting closed');}
function startRound(){game.round++;game.step=0;game.phase='lobby';game.deadline=null;game.votes={};for(const p of players.values()){p.double=false;p.scored=false;p.power=null;p.powerUsed=false;}note(`Round ${game.round} started`);}
function advance(){if(game.finished)return;if(game.step===8){startRound();return;}if(game.step===2){closeVoting();return;}game.step++;game.phase=['lobby','powers','voting','closed','change','double','ko','scoring','between'][game.step];if(game.step===2){game.votes={};game.deadline=Date.now()+(game.mode==='10'?10000:60000);note('Voting opened');}else game.deadline=null;}
io.on('connection',socket=>{
 socket.emit('state',publicState());
 socket.on('gm:login',({key}={})=>{if(!hostKey||typeof key!=='string')return fail(socket,'Invalid Game Master key');const a=Buffer.from(key),b=Buffer.from(hostKey);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return fail(socket,'Invalid Game Master key');gmSockets.add(socket.id);socket.emit('gm:ok',{steps});socket.emit('gm:private',gmState());});
 socket.on('player:join',({name,team,token}={})=>{let p=players.get(sessions.get(token));if(!p||p.token!==token){if(game.finished||game.phase!=='lobby')return fail(socket,'Joining is available only in the lobby');name=clean(name);if(!name||!['Blue','Red'].includes(team))return fail(socket,'Enter a name and team');if([...players.values()].some(x=>x.name.toLowerCase()===name.toLowerCase()))return fail(socket,'Name already in use');p={id:id(),token:id(),name,team,points:0,power:null,powerUsed:false,double:false,scored:false,sockets:new Set()};players.set(p.id,p);sessions.set(p.token,p.id);note(`${p.name} joined ${team}`);}if(socket.data.playerId&&socket.data.playerId!==p.id){const old=players.get(socket.data.playerId);old?.sockets.delete(socket.id);}p.sockets.add(socket.id);socket.data.playerId=p.id;emit();});
 socket.on('player:vote',data=>player(socket,data,p=>{if(!votingOpen())return fail(socket,'Voting is closed');if(!['A','B','C',...(game.secretD?['D']:[])].includes(data.choice))return fail(socket,'Invalid choice');game.votes[p.id]=data.choice;emit();}));
 socket.on('player:swap',data=>player(socket,data,p=>{if(!votingOpen()||p.power!=='SWAP'||p.powerUsed)return fail(socket,'SWAP is not available');const q=players.get(data.targetId);if(!q||q.id===p.id||q.team===p.team)return fail(socket,'Choose an opposing-team player');[p.team,q.team]=[q.team,p.team];[p.points,q.points]=[q.points,p.points];p.powerUsed=true;note(`${p.name} swapped teams and accumulated points with ${q.name}`);emit();}));
 socket.on('player:double',data=>player(socket,data,p=>{if(game.phase!=='double'||game.finished)return fail(socket,'Double or Nothing is not active');p.double=data.enabled===true;emit();}));
 socket.on('gm:step',()=>gm(socket,()=>{advance();emit();}));
 socket.on('gm:mode',data=>gm(socket,()=>{if(game.phase==='voting')return fail(socket,'Timer cannot change during voting');if(!['10','60'].includes(data?.mode))return fail(socket,'Invalid mode');game.mode=data.mode;emit();}));
 socket.on('gm:secretD',data=>gm(socket,()=>{if(game.phase==='voting')return fail(socket,'Choices cannot change during voting');game.secretD=data?.enabled===true;emit();}));
 socket.on('gm:power',data=>gm(socket,()=>{if(game.finished||['closed','change','double','ko','scoring','between'].includes(game.phase))return fail(socket,'Powers can only be assigned before voting closes');const p=players.get(data?.playerId);if(!p||![null,'SWAP'].includes(data.power))return fail(socket,'Invalid power assignment');p.power=data.power;p.powerUsed=false;emit();}));
 socket.on('gm:score',data=>gm(socket,()=>{if(game.phase!=='scoring'||game.finished)return fail(socket,'Not in scoring phase');const p=players.get(data?.playerId),n=data?.points;if(!p||!Number.isInteger(n)||Math.abs(n)>10000)return fail(socket,'Invalid score');if(p.scored)return fail(socket,'This player was already scored this round');const award=p.double?n*2:n;p.points+=award;p.scored=true;note(`${p.name} scored ${award>=0?'+':''}${award}`);emit();}));
 socket.on('gm:end',()=>gm(socket,()=>{if(game.finished)return;game.finished=true;game.phase='finished';game.deadline=null;note('Game ended by Game Master');emit();}));
 socket.on('gm:reset',()=>gm(socket,()=>{players.clear();sessions.clear();Object.assign(game,{round:1,step:0,phase:'lobby',mode:'60',deadline:null,secretD:false,votes:{},events:[],finished:false});note('New game created');emit();}));
 socket.on('disconnect',()=>{gmSockets.delete(socket.id);const p=players.get(socket.data.playerId);if(p){p.sockets.delete(socket.id);emit();}});
});
setInterval(()=>{if(game.phase==='voting'&&game.deadline&&Date.now()>=game.deadline){closeVoting();emit();}},200);
if(require.main===module)server.listen(process.env.PORT||3000,()=>console.log('Game listening'));
module.exports={server,io,game,players,teams,winners};
