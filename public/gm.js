'use strict';
const socket=io(),$=id=>document.getElementById(id);let authorized=false,state=null,steps=[],privateData=null;
const say=s=>{$('status').textContent=s;};socket.on('errorMessage',say);
$('login').onclick=()=>socket.emit('gm:login',{key:$('key').value});
socket.on('gm:ok',d=>{authorized=true;steps=d.steps;$('controls').classList.remove('hidden');$('key').value='';render();});
socket.on('gm:private',d=>{privateData=d;render();});socket.on('state',s=>{state=s;render();});
socket.on('disconnect',()=>{authorized=false;$('controls').classList.add('hidden');privateData=null;});
$('next').onclick=()=>socket.emit('gm:step');$('mode').onchange=()=>socket.emit('gm:mode',{mode:$('mode').value});$('secretD').onchange=()=>socket.emit('gm:secretD',{enabled:$('secretD').checked});
$('end').onclick=()=>{if(confirm('End the game and announce final winners?'))socket.emit('gm:end');};
$('reset').onclick=()=>{if(confirm('Delete ALL players and scores and start a new game?'))socket.emit('gm:reset');};
function render(){if(!authorized||!state)return;$('round').textContent=`Round ${state.round} · ${state.phase}`;$('mode').value=state.mode;$('secretD').checked=state.secretD;$('next').disabled=state.finished;$('end').disabled=state.finished;
 $('steps').replaceChildren(...steps.map((s,i)=>{const li=document.createElement('li');li.textContent=`${i+1}. ${s}`;if(i===state.step)li.className='active';return li;}));
 $('teams').textContent=`Blue ${state.teams.Blue} · Red ${state.teams.Red}`;
 $('players').replaceChildren(...state.players.map(p=>{const row=document.createElement('div');row.className='gm-player';const label=document.createElement('span');label.textContent=`${p.name} (${p.team}) · ${p.points} pts`;const power=document.createElement('button');power.textContent='Give SWAP';power.onclick=()=>socket.emit('gm:power',{playerId:p.id,power:'SWAP'});const clear=document.createElement('button');clear.textContent='Clear';clear.onclick=()=>socket.emit('gm:power',{playerId:p.id,power:null});const input=document.createElement('input');input.type='number';input.value='0';input.min='-10000';input.max='10000';input.className='points-input';const score=document.createElement('button');score.textContent='Score';score.disabled=state.phase!=='scoring'||!!privateData?.players.find(x=>x.id===p.id)?.scored;score.onclick=()=>socket.emit('gm:score',{playerId:p.id,points:Number(input.value)});row.append(label,power,clear,input,score);return row;}));
 const votes=privateData?.votes||{};$('votes').textContent=state.players.map(p=>`${p.name}: ${votes[p.id]||'—'}`).join(' · ')||'No players';const r=state.results;$('results').textContent=r?`Winning team: ${r.teams.join(' & ')} · Individual winner: ${r.individuals.join(' & ')||'None'}`:'';
}
