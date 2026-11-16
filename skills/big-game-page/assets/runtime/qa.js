/* Visible QA panel, enabled only by ?qa=1. Bot writes INPUTS only; scene inspection is separate. */
(()=>{
if(!new URLSearchParams(location.search).has('qa'))return;
BGP.wrap('game',old=>g=>{let game=old(g);g.game=game;install(g,game);return game});
function install(g,game){
 g.audio.setVolume?.(0); // QA runs are silent; normal play retains the user setting.
  const T=g.THREE,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const input=g.input, originalUpdate=input.update.bind(input), originalDown=input.down.bind(input), originalPressed=input.pressed.bind(input);
  const bot=window.playtest={enabled:false,goal:null,path:[],log:[],fire:false,interact:false,reload:false,stuck:0,prev:g.player.pos.clone(),combat:true,elapsed:0,arrived:false};
  // Test driver only synthesizes controls. Health, ammunition, position, enemies and mission state are never assigned.
  function buildGrid(){let minX=-39,minZ=-29,cell=.4,w=173,h=146,blocked=new Uint8Array(w*h);for(let b of g.physics.boxes){if(b.bulletOnly||b.max.y<=.32||b.min.y>=1.7)continue;let x0=Math.max(0,Math.floor((b.min.x-.34-minX)/cell)),x1=Math.min(w-1,Math.ceil((b.max.x+.34-minX)/cell)),z0=Math.max(0,Math.floor((b.min.z-.34-minZ)/cell)),z1=Math.min(h-1,Math.ceil((b.max.z+.34-minZ)/cell));for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){let xx=minX+(x+.5)*cell,zz=minZ+(z+.5)*cell,dx=Math.max(b.min.x-xx,0,xx-b.max.x),dz=Math.max(b.min.z-zz,0,zz-b.max.z);if(dx*dx+dz*dz<.34*.34)blocked[z*w+x]=1}}return{minX,minZ,cell,w,h,blocked}}
  function route(dest){let grid=buildGrid(),{minX,minZ,cell,w,h,blocked}=grid;let index=p=>clamp(Math.floor((p.z-minZ)/cell),0,h-1)*w+clamp(Math.floor((p.x-minX)/cell),0,w-1),coord=j=>V(minX+(j%w+.5)*cell,0,minZ+(Math.floor(j/w)+.5)*cell),nearest=j=>{if(!blocked[j])return j;for(let r=1;r<8;r++)for(let z=-r;z<=r;z++)for(let x=-r;x<=r;x++){let k=j+z*w+x;if(k>=0&&k<w*h&&!blocked[k])return k}return j};let a=nearest(index(g.player.pos)),b=nearest(index(dest)),cost=new Float64Array(w*h).fill(Infinity),prev=new Int32Array(w*h).fill(-1),done=new Uint8Array(w*h),open=[a];cost[a]=0;let heur=j=>Math.hypot(j%w-b%w,Math.floor(j/w)-Math.floor(b/w));while(open.length){let best=0;for(let k=1;k<open.length;k++)if(cost[open[k]]+heur(open[k])<cost[open[best]]+heur(open[best]))best=k;let cur=open[best];open.splice(best,1);if(done[cur])continue;done[cur]=1;if(cur===b)break;for(let [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){let x=cur%w+dx,z=Math.floor(cur/w)+dz,n=z*w+x;if(x<0||x>=w||z<0||z>=h||blocked[n]||done[n]||dx&&dz&&(blocked[cur+dx]||blocked[cur+dz*w]))continue;let c=cost[cur]+Math.hypot(dx,dz);if(c<cost[n]){cost[n]=c;prev[n]=cur;open.push(n)}}}if(prev[b]<0&&b!==a)return null;let points=[],j=b;while(j!==a){points.unshift(coord(j));j=prev[j]}if(!blocked[index(dest)])points.push(dest.clone());return points}
  function clearLine(a,b){let vec=b.clone().sub(a);vec.y=0;let len=vec.length();vec.normalize();for(let s=0;s<=len;s+=.15){let x=a.x+vec.x*s,z=a.z+vec.z*s;for(let c of g.physics.boxes){if(c.bulletOnly||c.max.y<=.32||c.min.y>=1.7)continue;let dx=Math.max(c.min.x-x,0,x-c.max.x),dz=Math.max(c.min.z-z,0,z-c.max.z);if(dx*dx+dz*dz<.35*.35)return false}}return true}
  bot.go=(x,z,action=null)=>{bot.goal={pos:V(x,0,z),action};bot.path=route(bot.goal.pos);bot.arrived=false;bot.enabled=true;bot.stuck=0;bot.actionT=0;bot.prev.copy(g.player.pos);bot.startTime=g.game.run.time;return bot.path?.length??null};
  bot.stop=()=>{bot.enabled=false;input.move.x=input.move.y=0;input.fire=input.ads=input.sprint=false;bot.fire=bot.interact=bot.reload=false};
  input.down=k=>bot.enabled&&k==='interact'?bot.interact:originalDown(k);
  input.pressed=k=>bot.enabled&&k==='reload'?(bot.reload||originalPressed(k)):originalPressed(k);
  input.update=dt=>{originalUpdate(dt);if(!bot.enabled||g.game.state!=='playing')return;bot.elapsed+=dt;bot.minHP=Math.min(bot.minHP??100,g.player.health);bot.invulnerableDuringPlay=!!bot.invulnerableDuringPlay||g.player.invulnerable;let p=g.player,way=bot.goal?.pos,move=V(),look=null;bot.interact=false;bot.reload=g.weapon.ammo<4&&g.weapon.reserve>0;bot.fire=false;input.ads=false;input.sprint=false;
   if(bot.path?.length){while(bot.path.length>1&&p.pos.distanceTo(bot.path[0])<.44)bot.path.shift();for(let k=Math.min(bot.path.length-1,22);k>0;k--)if(clearLine(p.pos,bot.path[k])){bot.path.splice(0,k);break}way=bot.path[0];move.copy(way).sub(p.pos);move.y=0;if(move.length()>0)move.normalize()}
   let distance=bot.goal?Math.hypot(p.pos.x-bot.goal.pos.x,p.pos.z-bot.goal.pos.z):0;
   if(distance<.42){bot.arrived=true;move.set(0,0,0);if(bot.goal.action){let a=bot.goal.action;look=V(...a.look);bot.interact=true;bot.actionT+=dt;if(bot.actionT>(a.hold||1.2)){bot.log.push({event:a.name||'interact',time:g.game.run.time,pos:p.pos.toArray(),health:p.health,ammo:g.weapon.ammo,reserve:g.weapon.reserve,kills:g.combat.stats.kills,relays:g.game.run.cut});bot.stop()}}else{bot.log.push({event:'arrive',time:g.game.run.time,pos:p.pos.toArray(),health:p.health,kills:g.combat.stats.kills});bot.stop()}}
   if(bot.combat&&!bot.interact){let visible=g.enemies.list.filter(e=>{if(!e.alive||e.empUntil>(g.desert?.time||0))return false;let pos=e.pos.clone().add(V(0,e.type==='hound'?.72:0,0));return pos.distanceTo(p.eye)<40&&g.physics.lineOfSight(p.eye,pos)}).sort((a,b)=>a.pos.distanceToSquared(p.pos)-b.pos.distanceToSquared(p.pos));if(visible.length){let e=visible[0];look=e.pos.clone().add(V(0,e.type==='hound'?.72:0,0));input.ads=true;bot.fire=true;if(p.health<35){move.multiplyScalar(.5)} }}
   if(!look&&way)look=way.clone().setY(p.eye.y);if(look){let dv=look.clone().sub(p.eye),desiredYaw=Math.atan2(-dv.x,-dv.z),desiredPitch=Math.atan2(dv.y,Math.hypot(dv.x,dv.z)),yawDiff=Math.atan2(Math.sin(desiredYaw-p.yaw),Math.cos(desiredYaw-p.yaw));input.look.dx=-clamp(yawDiff,-dt*4,dt*4)/p.lookScale;input.look.dy=-clamp(desiredPitch-p.pitch,-dt*3,dt*3)/p.lookScale;bot.fire=bot.fire&&Math.abs(yawDiff)<.055&&Math.abs(desiredPitch-p.pitch)<.055;}
   input.move.x=move.x*Math.cos(p.yaw)-move.z*Math.sin(p.yaw);input.move.y=-move.x*Math.sin(p.yaw)-move.z*Math.cos(p.yaw);input.fire=bot.fire;input.sprint=!input.ads&&distance>3;input.crouch=false;
   if(p.pos.distanceTo(bot.prev)<.015&&move.length()>.5)bot.stuck+=dt;else bot.stuck=Math.max(0,bot.stuck-dt);bot.prev.copy(p.pos);if(bot.stuck>2){bot.path=route(bot.goal.pos);bot.stuck=0;bot.log.push({event:'replan',pos:p.pos.toArray(),path:bot.path?.length})}
  };
  bot.snapshot=()=>({enabled:bot.enabled,arrived:bot.arrived,path:bot.path?.length,goal:bot.goal,pos:g.player.pos.toArray(),hp:g.player.health,state:g.game.state,ammo:g.weapon.ammo,reserve:g.weapon.reserve,kills:g.combat.stats.kills,relays:g.game.run.cut,time:g.game.run.time,errors:__errors,log:bot.log.slice(-8)});

 const panel=document.createElement('section');panel.className='bgp-qa';panel.setAttribute('aria-label','BigGamePage 验收');
 panel.innerHTML='<div><button data-action="route">跑通关路线</button><button data-action="stop">停止驾驶</button><button data-action="pause">暂停 / 继续</button><button data-action="rules">规则拒绝测试</button><button data-action="climb">登顶并返回</button><button data-action="jump">原地跳跃</button><button data-action="restart">重新开始</button><button data-action="hide">隐藏面板 H</button></div><div><button data-view="yard">堆场机位</button><button data-view="warehouse">仓库机位</button><button data-view="crane">高层机位</button><button data-view="play">游玩机位</button></div><div id="bgp-qa-status">待命：通关路线只合成移动、瞄准、射击和交互输入。</div><details><summary>实时验收记录</summary><pre id="bgp-report"></pre></details>';
 document.getElementById('app').append(panel);
 let sequence=[],step=-1,running=false,last=performance.now(),frames=[],invulnerable=false,reportT=0,jumping=false,jumpStart=0,firstFrame=0;
 const log=[],views={yard:[-20,1.7,5.6,10,2.4,5],warehouse:[-3.5,1.7,-13.8,-3,2,-25],crane:[12,2.2,19,24,18,1]};
 function begin(){g.audio.resume?.();window.__setShot({cam:''});game.start({skipIntro:true});bot.stop();bot.log=[];bot.elapsed=0;bot.minHP=100;bot.invulnerableDuringPlay=false;frames=[];invulnerable=false;log.length=0;step=-1;running=true;firstFrame=performance.now();
  sequence=[
   [-31.5,7.7,{look:[-31.5,1.1,8.75],hold:1.3,name:'supply-1'}],
   [-11,12.4,null],[-14.6,12.4,{look:[-14.6,.74,12.4],hold:1.4,name:'enter-container-and-search'}],[-11,12.4,null],
   [-8.5,8.0,{look:[-8.5,1.1,8.85],hold:1.4,name:'emp-1'}],
   [1.5,6.1,{look:[1.5,1.1,7.5],hold:5.6,name:'objective-A'}],
   [-3.8,-8.5,null],[-3.8,-13.8,null],
   [-6.5,-13.0,{look:[-6.65,1.2,-12],hold:1.5,name:'close-shutter'}],
   [-10.2,-24.7,{look:[-10.2,1.1,-25.75],hold:1.4,name:'supply-2'}],
   [-3.5,-19.6,{look:[-2.2,1.1,-19.7],hold:6.0,name:'objective-B'}],
   [13,-19.5,null],[17,-20,{look:[16.15,1.1,-20],hold:1.4,name:'emp-2'}],
   [20.1,-15.8,{look:[19.25,1.1,-15.8],hold:1.4,name:'supply-3'}],
   [22.9,1.4,{look:[23.7,1.1,2.8],hold:5.6,name:'objective-C'}],
   [29,20,null]];
  // Use actual inherited terminal positions for reliable aim; the approach points stay authored.
  sequence[10][2].look=g.level.objectives[1].pos.clone().add(V(0,1.1,0)).toArray();
  sequence[14][2].look=g.level.objectives[2].pos.clone().add(V(0,1.1,0)).toArray();
 }
 function next(){let prev=sequence[step];if(prev?.[2]?.expect!==undefined){let ok=game.run.cut===prev[2].expect;log.push({event:ok?'PASS-rule':'FAIL-rule',name:prev[2].name,expected:prev[2].expect,actual:game.run.cut});if(!ok){running=false;bot.stop();return}}step++;if(step>=sequence.length){running=false;bot.stop();return}let [x,z,action]=sequence[step];let count=bot.go(x,z,action);log.push({event:'route-step',step,name:action?.name||'walk',path:count,time:game.run.time});if(count===null){running=false;bot.stop();log.push({event:'FAIL-no-path',step})}}
 function geometry(root){let hash=2166136261,tri=0,meshes=0;function bytes(a){let b=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(let v of b)hash=Math.imul(hash^v,16777619)>>>0}root.traverse(m=>{if(!m.isMesh)return;meshes++;let g=m.geometry;tri+=(g.index?g.index.count:g.attributes.position.count)/3;for(let k of Object.keys(g.attributes).sort())bytes(g.attributes[k].array);if(g.index)bytes(g.index.array)});return{hash:hash.toString(16).padStart(8,'0'),triangles:tri,meshes}}
 let geo={dog:geometry(g.enemies.debug.hounds[0].rig.group),drone:geometry(g.enemies.debug.gulls[0].rig.group)};
 // Vertical route synthesizes movement/look/interaction only, through the same controls.
 let climbRun=false,climbStage=-1,climbPlan=[],climbPulse=false,climbStarted=0,maxStep=0,previousPos=g.player.pos.clone(),previousClimb=false;
 const stepsUp=[[26.95,6.9,6.56],[26.95,6.9,7.38],[20.05,10.2,7.38],[20.05,10.2,6.56],[26.95,13.5,6.56],[26.95,13.5,7.38],[20.05,16.8,7.38],[20.05,16.8,6.56],[26.95,20.1,6.56],[26.95,20.1,7.38],[23.0,21.9,7.38],[22.95,21.9,3.8],[25.2,21.9,3.55]];
 function startClimb(){g.audio.resume?.();running=false;bot.stop();window.__setShot({cam:''});game.start({skipIntro:true});bot.combat=true;climbRun=true;climbStage=-1;climbStarted=0;maxStep=0;
  climbPlan=[{kind:'ground',pos:[19.8,0,7.35]},{kind:'attach',look:[19.35,1.4,7.35]},{kind:'ladder',direction:1},...stepsUp.map(pos=>({kind:'walk',pos})),{kind:'attach',look:[25.2,23.3,3.09]},{kind:'ladder',direction:1},{kind:'walk',pos:[26.12,26.12,-.25]},{kind:'attach',look:[26.57,27.52,-.25]},{kind:'ladder',direction:1},{kind:'wait',seconds:1},
  {kind:'attach',look:[26.12,31.64,-.25]},{kind:'ladder',direction:-1},{kind:'walk',pos:[25.2,26.12,2.25]},{kind:'attach',look:[25.2,27.42,3.55]},{kind:'ladder',direction:-1},...stepsUp.slice(0,-1).reverse().map(pos=>({kind:'walk',pos})),{kind:'walk',pos:[20,3.6,6.56]},{kind:'attach',look:[19.8,4.9,7.35]},{kind:'ladder',direction:-1}];
 }
 function advanceClimb(){climbStage++;climbStarted=game.run.time;climbPulse=false;let stage=climbPlan[climbStage];log.push({event:'vertical-stage',stage:climbStage,kind:stage?.kind,pos:g.player.pos.toArray()});if(!stage){climbRun=false;bot.stop();return}if(stage.kind==='ground')bot.go(stage.pos[0],stage.pos[2]);}
 const readDown=g.input.down.bind(g.input);g.input.down=k=>climbRun&&k==='interact'?climbPulse:readDown(k);
 const normalInput=g.input.update.bind(g.input);g.input.update=dt=>{normalInput(dt);if(!climbRun||game.state!=='playing')return;if(climbStage<0)advanceClimb();let stage=climbPlan[climbStage];if(!stage)return;
  let p=g.player,c=g.desert.climb;climbPulse=false;
  if(previousClimb)maxStep=Math.max(maxStep,previousPos.distanceTo(p.pos));previousPos.copy(p.pos);previousClimb=!!c.active;
  if(game.run.time-climbStarted>35){log.push({event:'FAIL-vertical-timeout',stage:climbStage,pos:p.pos.toArray()});climbRun=false;bot.stop();return}
  if(stage.kind==='ground'){if(!bot.enabled)advanceClimb();return}
  g.input.move.x=g.input.move.y=0;g.input.fire=g.input.ads=g.input.sprint=g.input.crouch=false;
  if(stage.kind==='wait'){if(game.run.time-climbStarted>=stage.seconds)advanceClimb();return}
  if(stage.kind==='ladder'){if(!c.active){advanceClimb();return}g.input.move.y=stage.direction;return}
  let look=V(...(stage.look||stage.pos)),delta=look.clone().sub(p.pos),flat=Math.hypot(delta.x,delta.z);
  if(stage.kind==='walk'){look.y+=1.5;if(flat<.065&&Math.abs(delta.y)<.28){advanceClimb();return}let speed=Math.min(1,flat/.8),x=delta.x/(flat||1)*speed,z=delta.z/(flat||1)*speed;g.input.move.x=x*Math.cos(p.yaw)-z*Math.sin(p.yaw);g.input.move.y=-x*Math.sin(p.yaw)-z*Math.cos(p.yaw)}
  let v=look.sub(p.eye),yaw=Math.atan2(-v.x,-v.z),pitch=Math.atan2(v.y,Math.hypot(v.x,v.z)),yd=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw)),pd=pitch-p.pitch;
  g.input.look.dx=-BGP.clamp(yd,-dt*3,dt*3)/p.lookScale;g.input.look.dy=-BGP.clamp(pd,-dt*3,dt*3)/p.lookScale;
  if(stage.kind==='attach'){if(c.active){advanceClimb();return}if(Math.abs(yd)<.05)climbPulse=true}
 };

 const press=g.input.pressed.bind(g.input);g.input.pressed=k=>k==='jump'&&jumping?true:press(k);
 panel.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;let action=b.dataset.action;
  if(action==='rules'){climbRun=false;begin();sequence=[[-3.8,-8.5,null],[-3.8,-13.8,null],[-3.5,-19.6,{look:g.level.objectives[1].pos.clone().add(V(0,1.1,0)).toArray(),hold:5,name:'reject-B-before-A',expect:0}],[1.5,6.1,{look:[1.5,1.1,7.5],hold:6,name:'complete-A',expect:1}],[-3.8,-13.8,null],[-3.5,-19.6,{look:g.level.objectives[1].pos.clone().add(V(0,1.1,0)).toArray(),hold:5,name:'B-without-fuse',expect:BGP.recipe.world==='bunker'?1:2}]];}if(action==='climb')startClimb();if(action==='route'){climbRun=false;begin();}if(action==='stop'){running=false;climbRun=false;bot.stop()}
  if(action==='restart'){running=false;climbRun=false;bot.stop();game.start({skipIntro:true})}
  if(action==='pause'){if(game.state==='paused')game.resume();else game.pause()}
  if(action==='jump'){jumping=true;jumpStart=game.run.time;log.push({event:'jump-input'})}
  if(action==='hide')panel.classList.toggle('hidden');
  if(b.dataset.view){running=false;bot.stop();let v=views[b.dataset.view];window.__setShot({cam:v?v.join(','):''});log.push({event:'inspection-camera',view:b.dataset.view});}
 });
 addEventListener('keydown',e=>{if(e.code==='KeyH')panel.classList.toggle('hidden')});
 const old=game.update.bind(game);game.update=dt=>{let t=performance.now(),ms=t-last;last=t;const result=old(dt);
  if(game.state==='playing'){invulnerable=invulnerable||g.player.invulnerable;if(running&&t-firstFrame>2000&&ms<200)frames.push(ms);if(jumping&&game.run.time-jumpStart>.08)jumping=false;
   if(running&&!bot.enabled)next();if(running&&game.run.time>240){running=false;bot.stop();log.push({event:'FAIL-route-timeout'})}}
  if(game.state==='complete'||game.state==='dead'){running=false;bot.stop()}
  reportT-=dt;if(reportT<=0&&g.bigGamePage){reportT=.5;const sorted=frames.slice().sort((a,b)=>a-b),quant=p=>sorted.length?+sorted[Math.floor((sorted.length-1)*p)].toFixed(2):null;
   const network=performance.getEntriesByType('resource').map(r=>({name:r.name,type:r.initiatorType})).filter(r=>!r.name.startsWith('data:')&&!r.name.startsWith('blob:'));
   const report={recipe:BGP.recipe.id,ready:window.__ready,mode:'input-only route; inspection cameras logged separately',running,step,vertical:{running:climbRun,stage:climbStage,maxStep},position:g.player.pos.toArray(),invulnerableDuringPlay:invulnerable,geometry:geo,originalLevel:g.desert.originalStats,mission:g.bigGamePage.snapshot(),bot:bot.snapshot(),driverLog:log,frameTiming:{samples:sorted.length,medianMs:quant(.5),p95Ms:quant(.95),p99Ms:quant(.99)},render:window.__stats?.(),audioContext:g.audio.ctx?.state||'stub',viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},networkResources:network,errors:window.__errors};
   document.querySelector('#bgp-report').textContent=JSON.stringify(report,null,2);document.querySelector('#bgp-qa-status').textContent=`${game.state} · ${climbRun?'攀爬 '+climbStage:running?'路线 '+(step+1)+'/'+sequence.length:'驾驶停止'} · 作业 ${game.run.cut}/3 · 生命 ${g.player.health.toFixed(0)} · ${g.player.pos.toArray().map(n=>n.toFixed(1)).join(', ')}`;
  }return result;
 };
}
})();
