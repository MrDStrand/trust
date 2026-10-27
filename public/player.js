'use strict';
const socket=io(),$=id=>document.getElementById(id);let state=null,me=null,token=localStorage.getItem('dtyt-token')||'';
const say=s=>{$('status').textContent=s;};
socket.on('connect',()=>{if(token)socket.emit('player:join',{token});});socket.on('errorMessage',say);
socket.on('private',p=>{me=p;token=p.token;localStorage.setItem('dtyt-token',token);$('join').classList.add('hidden');render();});
socket.on('state',s=>{state=s;render();});
$('joinBtn').onclick=()=>socket.emit('player:join',{name:$('name').value,team:$('team').value});
$('swap').onclick=()=>{if(confirm('Use your one-time SWAP power?'))socket.emit('player:swap',{token,targetId:$('target').value});};
$('doubleBox').onchange=()=>socket.emit('player:double',{token,enabled:$('doubleBox').checked});
function render(){if(!state)return;const p=state.players.find(x=>x.id===me?.id);$('round').textContent=`Round ${state.round} · ${state.stepName}`;$('blue').textContent=state.teams.Blue;$('red').textContent=state.teams.Red;$('mine').textContent=p?.points??'—';$('myteam').textContent=p?.team??'—';$('join').classList.toggle('hidden',!!me||state.phase!=='lobby');$('phase').textContent=state.finished?'GAME OVER':state.phase.toUpperCase();
 $('players').replaceChildren(...state.players.map(x=>{const d=document.createElement('div');d.textContent=`${x.name} · ${x.team} · ${x.points}`;return d;}));
 $('voting').classList.toggle('hidden',!me||state.phase!=='voting');$('choices').replaceChildren(...(state.secretD?['A','B','C','D']:['A','B','C']).map(c=>{const b=document.createElement('button');b.textContent=c+(me?.vote===c?' ✓':'');b.classList.toggle('selected',me?.vote===c);b.onclick=()=>socket.emit('player:vote',{token,choice:c});return b;}));
 const targets=state.players.filter(x=>x.id!==me?.id&&x.team!==p?.team);$('target').replaceChildren(...targets.map(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.name;return o;}));$('power').classList.toggle('hidden',!me||me.power!=='SWAP'||me.powerUsed||state.phase!=='voting');$('swap').disabled=!targets.length;
 $('double').classList.toggle('hidden',!me||state.phase!=='double');$('doubleBox').checked=!!me?.double;
 $('events').replaceChildren(...state.events.map(s=>{const d=document.createElement('div');d.textContent=s;return d;}));
 const r=state.results;$('results').classList.toggle('hidden',!r);if(r)$('results').textContent=`Winning team: ${r.teams.join(' & ')} · Individual winner: ${r.individuals.join(' & ')||'None'}`;tick();}
function tick(){if(!state)return;const n=state.deadline?Math.max(0,Math.ceil((state.deadline-Date.now())/1000)):null;$('timer').textContent=n===null?'':`${n}s`;}
setInterval(tick,200);
