/* Independent recovery / payload escort controller; no relay-cut controller is called. */
(()=>{
 const {T,V,recipe:R}=BGP;BGP.movement.walk=4.2;BGP.movement.sprint=6.5;BGP.sensing.sightRange=36;BGP.setVision(130);
 BGP.wrap('game',()=>i=>{
  const p=i.player,input=i.input,hud=i.hud,lev=i.level,build=i.freightBuild,mat=build.materials;
  const root=new T.Group();root.name='freight-playables';i.scene.add(root);
  const game={state:'title',run:{time:0,cut:0,allCut:false,relays:[],retries:0},start:()=>start(),pause,resume,update};
  const s=i.freight={phase:'recovery',loaded:[],carrying:null,route:'west',health:R.mechanics.cartHealth,repairs:R.mechanics.repairKits,progress:0,travel:0,escortTime:0,stalls:0,repairUses:0,drops:0,overheats:0,supplyUses:0,visited:new Set(),log:[],minHP:100,minCart:100};
  const menus=BGP.createMenus(i,{deploy(){i.audio.resume?.();input.requestLock();start()},resume(){resume()},restart(){start()},retry(){start()},redeploy(){start()}});game.menus=menus;menus.applySettings();
  if(i.params.qa||i.params.noaudio)i.audio.setVolume?.(0);
  const mesh=(geo,material,parent,x=0,y=0,z=0)=>{let m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m};
  const box=(material,parent,x,y,z,w,h,d)=>build.box(material,x,y,z,w,h,d,parent);
  const label=(text,parent,x,y,z,w,ry=0)=>{let l=i.mats.label(text,{color:'white',font:'stencil',distress:.05}),m=mesh(new T.PlaneGeometry(w,w/l.aspect),l.material,parent,x,y,z);m.rotation.y=ry;m.castShadow=false;return m};
  function coreModel(){let g=new T.Group(),copper=i.mats.get('steel_rust');mesh(new T.CylinderGeometry(.23,.23,.64,32),mat.cyan,g);for(let y of[-.4,.4]){mesh(new T.CylinderGeometry(.32,.32,.14,32),mat.metal,g,0,y,0);for(let a=0;a<8;a++){let t=a*Math.PI/4;mesh(new T.CylinderGeometry(.025,.025,.05,8),mat.dark,g,Math.cos(t)*.27,y+.08,Math.sin(t)*.27)}}for(let a=0;a<8;a++){let t=a*Math.PI/4;build.rod([Math.cos(t)*.28,-.33,Math.sin(t)*.28],[Math.cos(t)*.28,.33,Math.sin(t)*.28],.023,copper,g)}for(let y of[-.28,-.14,0,.14,.28]){let m=mesh(new T.TorusGeometry(.25,.013,8,32),mat.yellow,g,0,y,0);m.rotation.x=Math.PI/2}for(let x of[-.42,.42]){box(mat.dark,g,x,0,0,.06,.54,.11);for(let y of[-.27,.27])box(mat.metal,g,x*.8,y,0,.2,.045,.11)}return g}
  const cores=lev.coreSites.map(c=>{let group=coreModel();group.position.copy(c.pos);root.add(group);return{...c,group,state:'socket',heat:0}});
  const cart=new T.Group();cart.name='payload-transporter';root.add(cart);
  // Original detailed forklift chassis, plus a bolted cargo rack, six articulated-looking wheels and cells.
  let chassis=i.props.build('forklift',{seed:810});chassis.rotation.y=Math.PI;chassis.position.x=.4;cart.add(chassis);
  box(mat.dark,cart,-1.85,.48,0,3.4,.2,2);box(mat.yellow,cart,-1.85,.65,0,3.5,.16,2.05);
  for(let x of[-3.2,-1.9,-.6])for(let z of[-1.05,1.05]){let tire=mesh(new T.CylinderGeometry(.36,.36,.23,28),i.mats.get('rubber'),cart,x,.37,z);tire.rotation.x=Math.PI/2;let hub=mesh(new T.CylinderGeometry(.21,.21,.25,20),mat.metal,cart,x,.37,z);hub.rotation.x=Math.PI/2;for(let a=0;a<6;a++){let ang=a*Math.PI/3;mesh(new T.SphereGeometry(.035,8,6),mat.dark,cart,x+Math.cos(ang)*.15,.37+Math.sin(ang)*.15,z+Math.sign(z)*.14)}}
  for(let x of[-3.4,-.3])for(let z of[-.92,.92]){box(mat.metal,cart,x,1.22,z,.09,1.05,.09);box(mat.yellow,cart,x,.2,z,.16,.12,.2)}
  for(let z of[-.94,.94]){box(mat.metal,cart,-1.85,1.7,z,3.2,.08,.08);box(mat.dark,cart,-1.85,1.07,z,3.2,.06,.06)}
  for(let k=0;k<3;k++){let c=coreModel();c.position.set(-2.85+k,.99,0);c.scale.setScalar(.78);c.visible=false;cart.add(c);cart.userData['cell'+k]=c;}
  label('CARGO / 00',cart,-1.8,1.32,1.01,2.4);
  let beacon=mesh(new T.CylinderGeometry(.1,.1,.18,20),mat.amber,cart,.25,2.48,0);
  const cartCol=i.physics.addBox([-1.4,0,16.3],[1.4,2.2,23.6],{surface:'metal',tag:'transporter',noNav:true});
  let route=lev.routeWest.map(a=>V(a[0],0,a[1])),segment=1,cartPos=V(0,0,20),lastDir=V(0,0,-1),totalLength=0;
  const selector=new T.Group();selector.position.set(5,0,24);root.add(selector);box(mat.dark,selector,0,.8,0,.6,1.6,.5);box(mat.yellow,selector,0,1.7,0,1.4,.65,.2);label('WEST / EAST',selector,0,1.72,.12,1.2);i.physics.addBox([4.3,0,23.7],[5.7,2,24.3],{surface:'metal',tag:'route-console'});
  const supplySites=[[6,26],[-23,-22],[21,-29]],supplies=supplySites.map(([x,z],k)=>{let g=i.props.build('generator',{seed:920+k});g.position.set(x,0,z);root.add(g);label('S / RESUPPLY',g,0,1.7,.6,1.7);i.physics.addBox([x-1.2,0,z-.65],[x+1.2,1.5,z+.65],{surface:'metal',tag:'supply'});return{id:'S'+(k+1),pos:V(x,0,z),ready:0,uses:0}});
  i.physics.build();
  const clearance={west:[],east:[]};for(let name of ['west','east']){let pts=lev.plan.routes[name];for(let k=1;k<pts.length;k++){let [ax,az]=pts[k-1],[bx,bz]=pts[k],len=Math.hypot(bx-ax,bz-az),horizontal=ax!==bx;for(let t=0;t<=len;t+=.5){let x=ax+(bx-ax)*t/len,z=az+(bz-az)*t/len,rx=horizontal?3.65:1.35,rz=horizontal?1.35:3.65;for(let b of i.physics.boxes){if(b===cartCol||b.bulletOnly||b.max.y<=.35||b.min.y>=3.2)continue;if(b.max.x>x-rx&&b.min.x<x+rx&&b.max.z>z-rz&&b.min.z<z+rz){let key=b.tag+':'+b.min.toArray().map(v=>v.toFixed(1)).join(',');if(!clearance[name].includes(key))clearance[name].push(key)}}}}}lev.plan.vehicleClearance=clearance;
  const panel=document.createElement('aside');panel.className='ft-panel';panel.innerHTML='<strong>PAYLOAD / 00</strong><div class="ft-phase"></div><div class="ft-health"><i></i></div><div class="ft-resource"></div><div class="ft-hint"></div>';document.getElementById('ui').append(panel);
  const map=document.createElement('canvas');map.width=map.height=250;map.className='ft-map';map.setAttribute('aria-label','中转站地图');document.getElementById('ui').append(map);let mapLarge=false;
  const summary=document.createElement('div');summary.className='ft-summary';document.querySelector('.m-debrief .m-actions').before(summary);
  document.querySelector('.m-tag').textContent='00';document.querySelector('.m-premise').textContent=R.brief;document.querySelector('.m-note').textContent='Big games. One page. · 独立地图 / 回收搬运 + 载具护送';document.querySelector('.m-debrief .m-h').textContent='交付完成';document.querySelector('.h-relays > span').textContent='载荷';
  document.querySelector('.m-legend').innerHTML='<div>WASD 移动 · 鼠标 / 方向键视角 · 左键射击 · R 换弹</div><div>按住 E 搬运 / 装车 / 操作 · Q 放下核心 · M 地图</div><div>搬运时不能开火或冲刺；靠近运载车才能推进护送。</div>';
  let timer=0,hold=0,heldId='',latched=false,dropRequested=false,uiTime=0,shotPulse=0,frameClock=0,pausedLock=false,arrival=false,stopped=false,repairHold=0;
  const beams=[];
  const director={wave:0,recoverySpawned:0,recoveryBudget:12,maxAlive:6,lastWaveAt:-100,nextAt:32,pending:null,queue:[],milestones:new Set(),escortQueued:new Set(),maxObserved:0};
  const entrySites=[[-23,32,'西南堆场'],[20,41,'东南堆场'],[-22,-34,'西北货道'],[19,-40,'东北货道'],[48,1,'东侧堆场'],[-48,-18,'西侧通道']];
  const record=(event,extra={})=>s.log.push({event,time:+game.run.time.toFixed(3),playerHealth:p.health,position:p.pos.toArray().map(n=>+n.toFixed(3)),...extra});
  function setState(state){const prev=game.state;game.state=state;i.events.emit('game:state',{state,prev});}
  function resetCart(){cartPos.set(0,0,20);lastDir.set(0,0,-1);route=(s.route==='west'?lev.routeWest:lev.routeEast).map(a=>V(a[0],0,a[1]));segment=1;s.travel=0;totalLength=0;for(let k=1;k<route.length;k++)totalLength+=route[k].distanceTo(route[k-1]);updateCartMesh();}
  function updateCartMesh(){cart.position.copy(cartPos);cart.rotation.y=Math.atan2(-lastDir.z,lastDir.x);const c=Math.abs(Math.cos(cart.rotation.y)),v=Math.abs(Math.sin(cart.rotation.y));cartCol.min.set(cartPos.x-3.5*c-1.3*v,0,cartPos.z-3.5*v-1.3*c);cartCol.max.set(cartPos.x+3.5*c+1.3*v,2.2,cartPos.z+3.5*v+1.3*c);for(let k=0;k<3;k++)cart.userData['cell'+k].visible=k<s.loaded.length;}
  function start(){menus.show('none');menus.locationCard(false);i.enemies.clear();i.fx.clear?.();i.combat.reset();i.weapon.reset();p.reset(lev.playerStart);p.enabled=true;input.setGameplay(true);i.weapon.setVisible(true);i.audio.setPaused?.(false);if(i.params.qa||i.params.noaudio)i.audio.setVolume?.(0);game.run.time=0;game.run.cut=0;game.run.allCut=false;
   Object.assign(s,{phase:'recovery',loaded:[],carrying:null,route:'west',health:R.mechanics.cartHealth,repairs:R.mechanics.repairKits,progress:0,travel:0,escortTime:0,stalls:0,repairUses:0,drops:0,overheats:0,supplyUses:0,visited:new Set(),log:[],minHP:100,minCart:100});
   Object.assign(director,{wave:0,recoverySpawned:0,lastWaveAt:-100,nextAt:32,pending:null,queue:[],milestones:new Set(),escortQueued:new Set(),maxObserved:0});mapLarge=false;map.classList.remove('large');
   for(let c of cores){c.state='socket';c.heat=0;c.group.visible=true;c.group.position.copy(c.pos);c.group.scale.setScalar(1);c.group.rotation.set(0,0,0)}
   for(let c of supplies){c.ready=0;c.uses=0}for(let b of beams){root.remove(b.line);b.line.geometry.dispose();b.line.material.dispose()}beams.length=0;
   timer=hold=uiTime=repairHold=shotPulse=0;heldId='';latched=false;dropRequested=false;arrival=false;stopped=false;resetCart();i.physics.build();i.weapon.reserve=R.mechanics.startReserve;hud.reset();hud.show(true);hud.setRelays(0,3);hud.clearRadio();hud.radio(R.brief,10);i.render.post.fade=0;i.render.post.saturation=.93;setState('playing');record('start',{layout:lev.stats.layout});
   i.enemies.spawn('hound',V(-23,0,-12),{state:'patrol',patrolRadius:8});i.enemies.spawn('hound',V(28,0,-12),{state:'patrol',patrolRadius:6});i.enemies.spawn('gull',V(3,9,-32),{state:'patrol',hover:8,patrolRadius:10});markers();
  }
  function pause(){if(game.state!=='playing')return;input.setGameplay(false);input.exitLock();p.enabled=false;hud.show(false);menus.show('paused');i.audio.setPaused?.(true);setState('paused')}
  function resume(){if(game.state!=='paused')return;menus.show('none');input.setGameplay(true);p.enabled=true;hud.show(true);i.audio.setPaused?.(false);input.requestLock();setState('playing')}
  function finish(won,reason){if(game.state!=='playing')return;record(won?'delivered':'failed',{reason,cartHealth:s.health,cargo:s.loaded.length});p.enabled=false;input.setGameplay(false);input.exitLock();hud.setPrompt(null);hud.show(false);s.phase=won?'delivered':'failed';if(won){let q=i.combat.stats;menus.setDebrief({time:game.run.time,accuracy:q.shots?q.hits/q.shots:null,kills:q.kills,retries:0,rating:s.health>70?'完整交付':'险中送达'});summary.textContent=`${s.route==='west'?'西线':'东线'} · 核心 ${s.loaded.length}/3 · 车体 ${Math.ceil(s.health)}% · 维修 ${s.repairUses} 次`;menus.show('complete');setState('complete')}else{menus.setDead({time:game.run.time,relays:s.loaded.length,total:3});document.querySelector('.m-dead .m-h').textContent=reason;menus.show('dead');setState('dead')}}
  i.events.on('player:dead',()=>finish(false,'任务失败 · 操作员倒下'));
  input.onModeChange?.(()=>menus.setLookMode(input.describeMode?.()||''));i.events.on('input:lock',e=>{if(e.locked)pausedLock=true;else if(pausedLock&&game.state==='playing'){pausedLock=false;pause()}});
  addEventListener('keydown',e=>{if(game.state==='title'&&e.code==='Enter'){i.audio.resume?.();start()}if(game.state!=='playing')return;if(e.code==='KeyQ'&&!e.repeat){dropRequested=true;e.preventDefault()}if(e.code==='KeyM'&&!e.repeat){mapLarge=!mapLarge;map.classList.toggle('large',mapLarge);e.preventDefault()}});
  const playerUpdate=p.update.bind(p);p.update=dt=>{const walk=BGP.movement.walk,ads=BGP.movement.ads,sprint=input.sprint;if(s.carrying){BGP.movement.walk=2.65;BGP.movement.ads=2.65;input.sprint=false}playerUpdate(dt);BGP.movement.walk=walk;BGP.movement.ads=ads;input.sprint=sprint};
  const weaponUpdate=i.weapon.update.bind(i.weapon);i.weapon.update=dt=>{let fire=input.fire,ads=input.ads;if(s.carrying)input.fire=input.ads=false;weaponUpdate(dt);input.fire=fire;input.ads=ads};
  function markers(){let a=cores.filter(c=>c.state!=='loaded').map(c=>({id:c.id,short:c.id,label:c.name,pos:c.group.position,kind:'relay'}));a.push({id:'cart',short:'车',label:'运载车',pos:cartPos,kind:'extract'});for(let d of supplies)a.push({id:d.id,short:d.id,label:'补给',pos:d.pos,kind:'supply'});hud.setMarkers(a)}
  function drop(overheat=false){let c=s.carrying;if(!c)return;const f=p.forward.clone();f.y=0;f.normalize();const hit=i.physics.raycast(p.pos.clone().add(V(0,.85,0)),f,.95);let point=p.pos.clone().addScaledVector(f,hit?Math.max(0,Math.min(.6,hit.dist-.34)):.6);point.y=i.physics.groundHeight(point.x,point.z,p.pos.y+.3)+.85;c.group.position.copy(point);c.state='dropped';c.group.rotation.set(0,0,0);s.carrying=null;s.drops++;if(overheat)s.overheats++;i.weapon.setVisible(true);record(overheat?'overheat-drop':'drop',{core:c.id,corePosition:point.toArray()});hud.message(overheat?'核心过热，已释放；冷却后可重新拾取':'已放下核心，可开火或稍后回来取',3);markers()}
  function candidate(){let d=p.pos.distanceTo(cartPos);if(s.carrying&&d<4.35)return{id:'load',name:'装入运载车',time:.6,act(){let c=s.carrying;c.state='loaded';c.group.visible=false;s.loaded.push(c.id);s.carrying=null;i.weapon.setVisible(true);game.run.cut=s.loaded.length;hud.setRelays(s.loaded.length,3);record('load',{core:c.id,loaded:s.loaded.slice()});updateCartMesh();markers();hud.message(s.loaded.length===3?'装载完成：路由台选线，靠近车辆按住 E 出发':'核心装车，继续回收；顺序自由',4)}};
   if(!s.carrying&&s.phase==='recovery'){for(let c of cores)if((c.state==='socket'||c.state==='dropped')&&c.group.position.distanceTo(p.eye)<2.65&&Math.abs(c.group.position.y-p.eye.y)<2&&i.physics.lineOfSight(p.eye,c.group.position)){return{id:'core-'+c.id,name:c.heat>.65?'核心冷却中':'磁吸搬运 '+c.name,time:.65,enabled:c.heat<=.65,act(){s.carrying=c;c.state='carried';i.weapon.setVisible(false);s.visited.add(c.id);record('pickup',{core:c.id});hud.message('搬运中：不能开火 / 冲刺 · Q 放下 · 送回南侧车辆',4);markers()}}}}
   if(!s.carrying&&s.phase==='recovery'&&p.pos.distanceTo(selector.position)<2.4)return{id:'route',name:'切换运输路线 · 当前'+(s.route==='west'?'西线 / 仓库掩护':'东线 / 开阔通道'),time:.5,act(){s.route=s.route==='west'?'east':'west';resetCart();record('route-selected',{route:s.route});hud.message('运输路线：'+(s.route==='west'?'西线，沿西库外墙':'东线，穿过开放堆场'),3)}};
   if(!s.carrying&&s.phase==='recovery'&&d<4.35)return{id:'depart',name:s.loaded.length===3?'启动运输 · '+(s.route==='west'?'西线':'东线'):'还需装载 '+(3-s.loaded.length)+' 枚核心',enabled:s.loaded.length===3,time:.8,act(){s.phase='escort';record('escort-start',{route:s.route});spawnWave(0);hud.warn('护送开始 · 保持距车 8 米以内',4)}};
   if(!s.carrying&&s.phase==='escort'&&d<4.4&&s.health<99)return{id:'repair',name:s.repairs?'维修运载车 · 消耗 1 包':'维修包耗尽',enabled:s.repairs>0,time:2.1,act(){s.health=Math.min(100,s.health+40);s.repairs--;s.repairUses++;record('repair',{health:s.health,remaining:s.repairs});hud.message('车体已修复，剩余维修包 '+s.repairs,3)}};
   if(!s.carrying)for(let v of supplies)if(v.pos.distanceTo(p.pos)<2.8)return{id:v.id,name:game.run.time<v.ready?'补给冷却 '+Math.ceil(v.ready-game.run.time)+' 秒':'补充弹药与医疗',enabled:game.run.time>=v.ready,time:.7,act(){i.weapon.reserve=R.mechanics.reserve;p.heal(45);s.supplyUses++;v.ready=game.run.time+35;v.uses++;record('supply',{id:v.id});hud.message('备用弹药补满 · 医疗 +45',3)}};
   return null;
  }
  function spawnWave(index){
   if(director.escortQueued.has(index))return;director.escortQueued.add(index);
   if(index===0){if(director.pending)record('reinforcement-cancelled',{reason:'escort-transition'});director.pending=null;director.queue=[];director.nextAt=game.run.time;}
   director.queue.push({phase:'escort',reason:'escort-'+index,index,types:['gull','hound']});
  }
  function safeEntry(type,pos){
   const distance=pos.distanceTo(p.pos);if(distance<18)return false;
   if(type==='hound'&&(!i.physics.nav.isWalkable(pos.x,pos.z)||Math.abs(i.physics.groundHeight(pos.x,pos.z,1))>.1))return false;
   const r=type==='hound'?.65:1.05,minY=pos.y+(type==='hound'?.12:-.65),maxY=pos.y+(type==='hound'?1.6:.65);
   if(i.physics.boxes.some(b=>!b.playerOnly&&!b.bulletOnly&&b.min.y<maxY&&b.max.y>minY&&b.min.x<pos.x+r&&b.max.x>pos.x-r&&b.min.z<pos.z+r&&b.max.z>pos.z-r))return false;
   const eye=pos.clone().add(V(0,type==='hound'?.8:0,0)),dir=eye.clone().sub(p.eye).normalize();
   return !(dir.dot(p.forward)>.25&&i.physics.lineOfSight(p.eye,eye));
  }
  function chooseEntry(types){
   let candidates=[];for(let n=0;n<entrySites.length;n++){const [x,z,name]=entrySites[(n+director.wave)%entrySites.length];for(let shift of[0,-3,3]){
    const points=types.map((type,k)=>V(x+shift+k*1.8,type==='gull'?8:0,z));
    if(points.every((q,k)=>safeEntry(types[k],q)))candidates.push({name,points,distance:Math.min(...points.map(q=>q.distanceTo(p.pos)))});
   }}return candidates.sort((a,b)=>a.distance-b.distance)[0]||null;
  }
  function updateDirector(){
   const now=game.run.time,alive=i.enemies.aliveCount();director.maxObserved=Math.max(director.maxObserved,alive);
   if(s.phase==='recovery')for(let id of s.visited)if(!director.milestones.has(id)){director.milestones.add(id);director.nextAt=Math.min(director.nextAt,now+10);record('recovery-alert',{core:id});}
   if(director.pending){const w=director.pending;
    if(now<w.due||alive+w.types.length>director.maxAlive)return;
    if(!w.entry.points.every((q,k)=>safeEntry(w.types[k],q))){const entry=chooseEntry(w.types);if(entry){w.entry=entry;w.due=now+6;hud.warn(entry.name+'发现增援 · 6 秒后接敌',4);record('reinforcement-retarget',{source:entry.name,due:w.due});}return;}
    let spawned=[];for(let k=0;k<w.types.length;k++){const type=w.types[k],pos=w.entry.points[k],distance=pos.distanceTo(p.pos),e=i.enemies.spawn(type,pos,{state:'alert',target:p.pos.clone(),hover:type==='gull'?8:undefined});if(e)spawned.push({type,position:pos.toArray(),distance:+distance.toFixed(2),id:e.id,forwardDot:+pos.clone().add(V(0,type==='hound'?.8:0,0)).sub(p.eye).normalize().dot(p.forward).toFixed(4),lineOfSight:i.physics.lineOfSight(p.eye,pos.clone().add(V(0,type==='hound'?.8:0,0))),groundWalkable:type==='gull'||i.physics.nav.isWalkable(pos.x,pos.z)});}
    if(!spawned.length){w.due=now+3;return;}
    director.wave++;director.lastWaveAt=now;if(w.phase==='recovery')director.recoverySpawned+=spawned.length;
    record(w.phase==='recovery'?'recovery-wave':'escort-wave',{wave:director.wave,index:w.index??null,reason:w.reason,source:w.entry.name,count:spawned.length,spawned,alive:i.enemies.aliveCount(),warningSeconds:+(now-w.warnedAt).toFixed(2)});
    hud.warn('第 '+director.wave+' 波增援抵达 · '+w.entry.name,4);director.pending=null;director.nextAt=now+(s.phase==='recovery'?26:10);director.maxObserved=Math.max(director.maxObserved,i.enemies.aliveCount());return;
   }
   if(now<Math.max(director.nextAt,director.lastWaveAt+(s.phase==='recovery'?26:10))||alive>director.maxAlive-2)return;
   let next=director.queue[0];if(!next&&s.phase==='recovery'&&director.recoverySpawned<director.recoveryBudget){const left=director.recoveryBudget-director.recoverySpawned;next={phase:'recovery',reason:director.milestones.size?'cargo-alarm':'patrol-timer',types:(s.loaded.length>=2?['gull','hound','hound']:['gull','hound']).slice(0,left)};}
   if(!next||alive+next.types.length>director.maxAlive)return;
   const entry=chooseEntry(next.types);if(!entry)return;if(director.queue[0]===next)director.queue.shift();
   director.pending={...next,entry,due:now+6,warnedAt:now};record('reinforcement-warning',{phase:next.phase,source:entry.name,due:now+6,count:next.types.length,reason:next.reason});hud.warn(entry.name+'发现增援 · 6 秒后接敌',5);
  }
  function trace(from,to){const line=new T.Line(new T.BufferGeometry().setFromPoints([from,to]),new T.LineBasicMaterial({color:0xff7953,transparent:true,opacity:.8}));root.add(line);beams.push({line,ttl:.13})}
  function cartVisible(e){let a=e.pos.clone().add(V(0,e.type==='hound'?.7:0,0)),d=cartPos.clone().add(V(0,1,0)).sub(a),len=d.length();let hit=i.physics.raycast(a,d.normalize(),len);return !hit||hit.box===cartCol}
  function updateEscort(dt){s.escortTime+=dt;let dist=p.pos.distanceTo(cartPos),block=dist>8||hold>.05&&heldId==='repair';if(block!==stopped){stopped=block;if(block)s.stalls++;record(block?'escort-stopped':'escort-resumed',{distance:+dist.toFixed(2)})}
   if(!block&&segment<route.length){let delta=route[segment].clone().sub(cartPos),length=delta.length(),step=Math.min(length,2.35*dt);if(length>.001){lastDir.copy(delta).normalize();cartPos.addScaledVector(lastDir,step);s.travel+=step}if(length<.06){segment++;if(segment===2||segment===3)spawnWave(segment-1)}}
   s.progress=Math.min(1,s.travel/totalLength);updateCartMesh();shotPulse-=dt;
   let threats=i.enemies.list.filter(e=>e.alive&&e.pos.distanceTo(cartPos)<19&&cartVisible(e));
   for(let e of threats){let damage=e.type==='hound'&&e.pos.distanceTo(cartPos)<5?2.8:.65;s.health=Math.max(0,s.health-damage*dt)}
   if(shotPulse<=0&&threats.length){shotPulse=.7;let e=threats[0];trace(e.pos.clone().add(V(0,e.type==='hound'?.7:0,0)),cartPos.clone().add(V(0,1,0)));record('cart-hit',{enemies:threats.length,health:+s.health.toFixed(2)})}
   s.minCart=Math.min(s.minCart,s.health);if(s.health<=0)finish(false,'任务失败 · 运载车被毁');else if(segment>=route.length)finish(true,'payload-at-north-terminal');
  }
  function drawMap(){const c=map.getContext('2d'),scale=2.04,at=(x,z)=>[125+x*scale,125+z*scale];c.fillStyle='rgba(8,20,26,.93)';c.fillRect(0,0,250,250);c.strokeStyle='#45616b';c.lineWidth=1;c.strokeRect(12,15,226,220);
   for(let w of lev.plan.warehouses){let a=at(w.min[0],w.min[2]),b=at(w.max[0],w.max[2]);c.fillStyle='#37545e';c.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1])}for(let v of lev.placed)if(v.name.startsWith('container')&&v.y<.1){let q=at(v.x,v.z);c.save();c.translate(...q);c.rotate(-v.yaw);c.fillStyle='#49535b';let length=v.name==='container20'?6.06:12.19;c.fillRect(-length*scale/2,-1.22*scale,length*scale,2.44*scale);c.restore()}for(let st of lev.plan.stairs){c.strokeStyle='#86a5a6';c.beginPath();c.moveTo(...at(st.from[0],st.from[2]));c.lineTo(...at(st.to[0],st.to[2]));c.stroke()}let a=at(-11,-11);c.fillStyle='#020a10';c.fillRect(a[0],a[1],22*scale,22*scale);c.strokeStyle='#5c999c';c.strokeRect(...at(-14,-14),28*scale,28*scale);c.beginPath();c.moveTo(...at(-14,-6));c.lineTo(...at(14,-6));c.stroke();
   for(let [name,line]of Object.entries(lev.plan.routes)){c.strokeStyle=name===s.route?'#efbd71':'#354a54';c.lineWidth=name===s.route?2:1;c.beginPath();line.forEach((p,k)=>k?c.lineTo(...at(...p)):c.moveTo(...at(...p)));c.stroke()}
   c.font='bold 11px monospace';c.textAlign='center';for(let core of cores)if(core.state!=='loaded'){let pos=core.group.position;c.fillStyle='#85e6e1';c.fillText(core.id,...at(pos.x,pos.z))}c.fillStyle='#f4bd69';let q=at(cartPos.x,cartPos.z);c.fillRect(q[0]-3,q[1]-3,6,6);c.fillStyle='white';let v=at(p.pos.x,p.pos.z);c.beginPath();c.arc(...v,3,0,6.28);c.fill();c.strokeStyle='white';c.beginPath();c.moveTo(...v);c.lineTo(v[0]+p.forward.x*9,v[1]+p.forward.z*9);c.stroke();c.fillStyle='#a9bdc5';c.fillText(BGP.i18n.t('N ↑ / M 展开'),125,13);
  }
  function update(dt){frameClock+=dt;panel.hidden=map.hidden=game.state!=='playing';if(game.state==='title'){i.camera.position.set(19+Math.sin(frameClock*.07)*3,9,27);i.camera.lookAt(0,7,0);i.camera.fov=59;i.camera.updateProjectionMatrix();return false}if(game.state==='paused'){if(input.pressed('pause'))resume();return false}if(game.state!=='playing')return false;
   if(input.pressed('pause')){pause();return false}game.run.time+=dt;s.minHP=Math.min(s.minHP,p.health);i.render.post.fade=0;
   if(dropRequested){dropRequested=false;drop()}
   for(let c of cores){if(c.state==='carried'){c.heat+=dt/R.mechanics.carrySeconds;let q=V(-.48,-.58,-1.25).applyQuaternion(i.camera.quaternion).add(i.camera.position);c.group.position.copy(q);c.group.quaternion.copy(i.camera.quaternion);if(c.heat>=1)drop(true)}else if(c.state!=='loaded')c.heat=Math.max(0,c.heat-dt*.09)}
   const action=candidate(),down=input.down('interact');if(!down){hold=0;latched=false;heldId=''}if(action&&action.id!==heldId){hold=0;heldId=action.id}if(action&&down&&!latched&&action.enabled!==false){hold+=dt;if(hold>=action.time){action.act();latched=true;hold=0}}hud.setPrompt(action?.name||null,action?hold/action.time:0);
   if(s.phase==='escort')updateEscort(dt);if(game.state==='playing')updateDirector();for(let k=beams.length-1;k>=0;k--){let b=beams[k];b.ttl-=dt;if(b.ttl<=0){root.remove(b.line);b.line.geometry.dispose();b.line.material.dispose();beams.splice(k,1)}}
   beacon.material=s.phase==='escort'?mat.cyan:mat.amber;uiTime-=dt;if(uiTime<=0){uiTime=.12;hud.setObjective(s.phase==='recovery'?s.carrying?'搬运 '+s.carrying.id+' → 南侧运载车':s.loaded.length===3?'选择路线，启动运输':'回收能源核心 · 顺序自由':stopped?'靠近运载车继续护送':'护送运载车抵达北站');panel.querySelector('.ft-phase').textContent=s.phase==='recovery'?'装载 '+s.loaded.length+'/3 · '+(s.route==='west'?'西线':'东线'):'车体 '+Math.ceil(s.health)+'% · '+Math.round(s.progress*100)+'% 路程';panel.querySelector('.ft-health i').style.width=(s.carrying?s.carrying.heat*100:s.health)+'%';panel.querySelector('.ft-health i').style.background=s.carrying&&s.carrying.heat>.7?'#f29963':'#7bdbd5';panel.querySelector('.ft-resource').textContent=s.carrying?'核心温度 '+Math.round(s.carrying.heat*100)+'% · Q 放下':'维修包 '+s.repairs+' · 备用弹药 '+i.weapon.reserve;panel.querySelector('.ft-hint').textContent=director.pending?director.pending.entry.name+'增援 · '+Math.max(0,Math.ceil(director.pending.due-game.run.time))+' 秒':s.carrying?'Q 放下后战斗 · 警戒第 '+director.wave+' 波':s.phase==='recovery'?'警戒 '+director.wave+' 波 · 在场 '+i.enemies.aliveCount()+' · 回收守备余量 '+(director.recoveryBudget-director.recoverySpawned):'距车 8 米内推进 · 按住 E 维修';drawMap();markers()}
   return game.state==='playing';
  }
  s.snapshot=()=>({state:game.state,phase:s.phase,time:+game.run.time.toFixed(2),loaded:s.loaded.slice(),carrying:s.carrying?.id||null,route:s.route,cartHealth:+s.health.toFixed(2),minCart:+s.minCart.toFixed(2),cartPosition:cartPos.toArray(),progress:s.progress,repairs:s.repairs,repairUses:s.repairUses,stalls:s.stalls,drops:s.drops,overheats:s.overheats,supplyUses:s.supplyUses,minHP:s.minHP,playerHealth:p.health,cores:cores.map(c=>({id:c.id,state:c.state,heat:+c.heat.toFixed(3),position:c.group.position.toArray()})),combat:{...i.combat.stats},director:{wave:director.wave,recoverySpawned:director.recoverySpawned,recoveryBudget:director.recoveryBudget,maxAlive:director.maxAlive,maxObserved:director.maxObserved,alive:i.enemies.aliveCount(),nextAt:director.nextAt,queued:director.queue.length,pending:director.pending?{phase:director.pending.phase,source:director.pending.entry.name,due:director.pending.due}:null},enemies:i.enemies.list.filter(e=>e.alive).map(e=>({id:e.id,type:e.type,position:e.pos.toArray(),mode:e.mode,los:e.los})),events:s.log,layout:lev.plan,level:lev.stats});
  s.director=director;s.cart=cartPos;s.cores=cores;s.supplies=supplies;s.selector=selector.position;s.stopped=()=>stopped;
  p.enabled=false;hud.show(false);i.weapon.setVisible(false);input.setGameplay(false);menus.show('title');updateCartMesh();return game;
 });
})();
