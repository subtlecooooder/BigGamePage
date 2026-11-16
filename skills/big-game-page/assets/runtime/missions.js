/* Reusable mission policy: ordered objectives + one pressure mechanic per recipe. */
(()=>{
 const {T,V,recipe:R}=BGP,mode=R.world;
 Object.assign(BGP.flow,{cutSeconds:mode==='moon'?3.4:2.6,maxAlive:mode==='bunker'?6:7,patrol:{gull:mode==='bunker'?1:2,hound:mode==='moon'?1:2},waves:mode==='harbor'?[{gull:0,hound:0},{gull:1,hound:1},{gull:2,hound:1}]:mode==='moon'?[{gull:1,hound:0},{gull:1,hound:1},{gull:1,hound:1}]:[{gull:0,hound:1},{gull:1,hound:2},{gull:1,hound:2}],pursuitExtra:3});
 BGP.setVision(mode==='harbor'?105:150);BGP.sensing.sightRange=mode==='harbor'?25:32;BGP.sensing.hearRadius=mode==='harbor'?30:38;
 if(mode==='moon'){BGP.movement.gravity=6;BGP.movement.accelAir=5.5;BGP.setJump(2.25)}
 BGP.radio.intro=R.brief;BGP.radio.contact=mode==='harbor'?'警戒上升：蹲伏绕过视野，用集装箱与仓库阻断视线。':'自动守卫已锁定。用 EMP 争取操作时间。';
 BGP.radio.cut=['第一项完成。按导航继续下一项。','第二项完成。防御系统开始加派守卫。'];BGP.radio.all='三项作业完成。前往东侧撤离区。';BGP.radio.done=R.title+'：行动完成。';
 BGP.wrap('game',old=>i=>{
  let game=old(i),p=i.player;
  let s=i.bigGamePage={world:mode,oxygen:100,alarm:0,maxAlarm:0,detections:0,detected:false,quiet:0,fuse:false,fuseUsed:false,flashlight:true,battery:100,recharges:0,log:[],minOxygen:100,minHP:100,jumpMax:0,elapsed:0,missionBlocked:'',worldRules:R.mechanics};
  BGP.needsSupply=ctx=>mode==='moon'&&ctx.bigGamePage.oxygen<99||mode==='bunker'&&ctx.bigGamePage.battery<99;
  BGP.onSupply=(ctx,device)=>{s.oxygen=100;s.battery=100;s.recharges++;log('supply',{id:device.id});};
  function log(event,extra={}){s.log.push({event,time:+game.run.time.toFixed(2),position:p.pos.toArray().map(v=>+v.toFixed(3)),...extra})}
  let status=document.createElement('aside');status.className='bgp-status';document.getElementById('ui').append(status);
  status.innerHTML='<strong>'+R.subtitle+'</strong><div class="bgp-pressure"></div><div class="bgp-meter"><i></i></div><div class="bgp-next"></div><small class="bgp-hint"></small>';
  let summary=document.createElement('aside');summary.className='bgp-summary';summary.hidden=true;document.querySelector('.m-debrief .m-actions').before(summary);
  document.querySelector('.m-debrief .m-h').textContent='行动完成';
  document.querySelector('.m-debrief .m-k').textContent=R.subtitle+' · 行动简报';
  document.querySelector('.h-relays > span').textContent=mode==='moon'?'修复':'作业';
  let premise=document.querySelector('.m-premise');if(premise)premise.textContent=R.brief;
  document.querySelectorAll('.m-about').forEach(el=>el.textContent='BigGamePage · 一页大作。Big games. One page. WASD 移动，鼠标转向，左键射击，R 换弹，按住 E 交互，C 蹲伏，Shift 冲刺。梯子 E 抓取，W/S 上下。'+R.brief);
  const objective=i.hud.setObjective.bind(i.hud);
  i.hud.setObjective=()=>objective(game.run.allCut?'前往东侧撤离区':R.objectives[Math.min(game.run.cut,2)]);
  const prompt=i.hud.setPrompt.bind(i.hud);
  i.hud.setPrompt=(text,progress)=>{if(text?.startsWith('切断中继')){let ix='ABC'.indexOf(text.slice(-1));text=s.missionBlocked||R.objectives[ix]||text}if(mode==='moon'&&text?.includes('弹药与医疗'))text='补满氧气 / 弹药 / 医疗';return prompt(text,progress)};
  // A policy gate in front of the existing hold-to-interact input, not a shortcut to completion.
  const down=i.input.down.bind(i.input);
  i.input.down=k=>{if(k!=='interact'||!down(k))return down(k);const index=nearObjective();if(index>=0&&blocked(index))return false;return true};
  function nearObjective(){return game.run.relays.findIndex(r=>!r.cut&&r.o.pos.distanceTo(p.pos)<2.2)}
  function blocked(index){if(index!==game.run.cut)return '先完成：'+R.objectives[game.run.cut];if(mode==='harbor'&&index===1&&s.alarm>80)return '警戒过高：先躲进掩体';if(mode==='bunker'&&index===1&&!s.fuse)return '缺少保险芯：前往敞开的红色集装箱';return ''}
  // Real stealth sensing uses sight cone, occlusion and longer confirmation while crouching.
  const ctx=i.enemies.debug.ctx,think=ctx.think.bind(ctx);
  ctx.think=(enemy,dt,delay)=>{
   if(mode!=='harbor')return think(enemy,dt,delay);
   const range=BGP.sensing.sightRange;
   BGP.sensing.sightRange=p.crouching?14:25;
   think(enemy,dt,p.crouching?2.2:1.15);
   BGP.sensing.sightRange=range;
  };
  i.events.on('weapon:fire',()=>{if(game.state==='playing'&&mode==='harbor')s.alarm=Math.min(100,s.alarm+6)});
  i.events.on('enemy:alert',e=>{if(game.state==='playing'){s.alarm=Math.min(100,s.alarm+12);log('enemy-alert',{noise:!!e.noise})}});
  let fuseRoot=null,fusePos=V(-14.6,.74,12.4),fuseT=0,flash=null,target=null;
  if(mode==='bunker'){
   fuseRoot=new T.Group();fuseRoot.position.copy(fusePos);i.scene.add(fuseRoot);
   const copper=new T.MeshStandardMaterial({color:0xc58e4c,metalness:.85,roughness:.33}),core=i.mats.emissive(0x77eed6,2);
   for(let x of[-.31,.31]){let cap=new T.Mesh(new T.CylinderGeometry(.14,.14,.16,24),copper);cap.rotation.z=Math.PI/2;cap.position.x=x;fuseRoot.add(cap)}
   let coil=new T.Mesh(new T.CylinderGeometry(.09,.09,.5,20),core);coil.rotation.z=Math.PI/2;fuseRoot.add(coil);
   for(let x=-.22;x<.25;x+=.05){let ring=new T.Mesh(new T.TorusGeometry(.11,.014,6,24),copper);ring.rotation.y=Math.PI/2;ring.position.x=x;fuseRoot.add(ring)}
   let l=i.mats.label('FUSE / 保险芯',{color:'white',font:'stencil'}),sign=new T.Mesh(new T.PlaneGeometry(1.15,1.15/l.aspect),l.material);sign.position.y=.55;fuseRoot.add(sign);
   flash=new T.SpotLight(0xc7e7e0,28,28,.44,.65,1.8);target=new T.Object3D();i.scene.add(flash,target);flash.target=target;
   addEventListener('keydown',e=>{if(e.code==='KeyL'&&game.state==='playing'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat){s.flashlight=!s.flashlight;log('flashlight',{on:s.flashlight})}}},true);
  }
  i.events.on('objective:done',e=>{log('objective',{id:e.id,index:e.index});if(mode==='harbor'&&e.index===1)s.alarm=Math.max(0,s.alarm-40);if(mode==='moon'){s.oxygen=Math.min(100,s.oxygen+12);i.hud.message('密封回路修复：回收氧气 +12',3)}if(mode==='bunker'&&e.index===2){s.fuse=false;s.fuseUsed=true;s.alarm=80;i.hud.message('保险芯已装入，通风恢复；守卫开始追踪',4)}});
  function resetMission(){
   Object.assign(s,{oxygen:100,alarm:0,maxAlarm:0,detections:0,detected:false,quiet:0,fuse:false,fuseUsed:false,flashlight:true,battery:100,recharges:0,minOxygen:100,minHP:100,elapsed:0,jumpMax:0,warnedOxygen:false,missionBlocked:''});s.log=[];fuseT=0;wasGround=true;launchY=0;uiT=0;if(fuseRoot)fuseRoot.visible=true;i.weapon.reserve=R.mechanics.startReserve;summary.hidden=true;
   i.hud.clearRadio();i.hud.radio(R.brief,8);log('start');
  }
  const startRun=game.start.bind(game);game.start=(...args)=>{const result=startRun(...args);resetMission();return result};
  i.events.on('game:state',e=>{
   if(e.state==='intro'||e.state==='playing'&&e.prev!=='paused')resetMission();
   if(e.state==='complete'){log('complete');summary.innerHTML='<b>'+R.title+' · 行动完成</b><br>'+Math.round(game.run.time)+' 秒 · '+i.combat.stats.kills+' 台守卫 · 补给 '+s.recharges+' 次<br>'+(mode==='harbor'?'最高警戒 '+Math.round(s.maxAlarm)+'% · 暴露 '+s.detections+' 次':mode==='moon'?'最低氧气 '+Math.round(s.minOxygen)+'% · 低重力最高离地 '+s.jumpMax.toFixed(2)+' m':'保险芯已装入 · 电池余量 '+Math.round(s.battery)+'%');setTimeout(()=>{if(game.state==='complete')summary.hidden=false},3400)}
   if(e.state==='title'||e.state==='dead')summary.hidden=true;
  });
  const update=game.update.bind(game);let uiT=0,wasGround=true,launchY=0;
  game.update=dt=>{
   if(game.state==='playing'){let n=nearObjective();s.missionBlocked=n<0?'':blocked(n)}
   let result=update(dt);status.hidden=game.state!=='playing';if(game.state!=='playing')return result;
   s.elapsed+=dt;s.minHP=Math.min(s.minHP,p.health);
   if(wasGround&&!p.onGround)launchY=p.pos.y;if(!p.onGround&&!p.climbing)s.jumpMax=Math.max(s.jumpMax,p.pos.y-launchY);wasGround=p.onGround;
   if(mode==='moon'){
    s.oxygen=Math.max(0,s.oxygen-dt*(p.sprinting?1.5:.9));s.minOxygen=Math.min(s.minOxygen,s.oxygen);
    if(s.oxygen<=0)p.damage(12*dt);if(s.oxygen<22&&!s.warnedOxygen){s.warnedOxygen=true;i.hud.warn('氧气不足，前往 S 补给柜按住 E',5)}if(s.oxygen>50)s.warnedOxygen=false;
   }else if(mode==='harbor'){
    let visible=i.enemies.list.some(e=>e.alive&&e.los&&e.empUntil<=i.desert.time);
    if(visible){s.alarm=Math.min(100,s.alarm+dt*9);s.quiet=0;if(!s.detected){s.detections++;s.detected=true;log('detected')}}else{s.quiet+=dt;s.alarm=Math.max(0,s.alarm-dt*(game.run.cut?8:4));if(s.quiet>2)s.detected=false}
    s.maxAlarm=Math.max(s.maxAlarm,s.alarm);
    // At high alarm the player must break sight before accessing protected data.
    if(s.alarm>80&&game.run.cut===1){let r=game.run.relays[1];if(r&&!r.cut){r.t=0;s.missionBlocked='警戒过高：躲进掩体等待降至 80% 以下'}}
   }else{
    if(s.flashlight&&s.battery>0)s.battery=Math.max(0,s.battery-dt*.17);
    flash.intensity=s.flashlight&&s.battery>0?34:0;flash.position.copy(p.eye);target.position.copy(p.eye).addScaledVector(p.forward,8);
    if(fuseRoot.visible){fuseRoot.rotation.y=Math.sin(i.time.t*.7)*.3;if(fusePos.distanceTo(p.eye)<2.5){prompt('拿取保险芯 · 修复仓库电源',fuseT/.65);if(down('interact')){fuseT+=dt;if(fuseT>=.65){s.fuse=true;fuseRoot.visible=false;log('fuse-pickup');i.hud.message('取得保险芯。前往仓库 B 接入主电源。',4)}}else fuseT=0}}
   }
   uiT-=dt;if(uiT<=0){uiT=.15;let value=mode==='moon'?s.oxygen:mode==='harbor'?s.alarm:s.battery;
    status.querySelector('.bgp-pressure').textContent=mode==='moon'?'O₂ 氧气 '+Math.ceil(value)+'%':mode==='harbor'?'警戒 '+Math.round(value)+'% · '+(s.detected?'已暴露':'保持隐蔽'):'电池 '+Math.ceil(value)+'% · 保险芯 '+(s.fuse?'已携带':s.fuseUsed?'已安装':'未取得');
    status.querySelector('.bgp-meter i').style.width=value+'%';status.querySelector('.bgp-pressure').classList.toggle('danger',mode==='harbor'?value>65:value<25);
    status.querySelector('.bgp-next').textContent=game.run.allCut?'→ 东侧撤离区':R.objectives[game.run.cut];
    status.querySelector('.bgp-hint').textContent=mode==='harbor'?'C 蹲伏降低侦测 · 开枪会提高警戒':mode==='moon'?'S 补给柜恢复氧气 · 冲刺加快耗氧':'L 手电开关 · 保险芯在红色开放箱内';
   }
   return result;
  };
  s.snapshot=()=>({world:mode,state:game.state,time:+game.run.time.toFixed(2),objectives:game.run.cut,health:p.health,oxygen:+s.oxygen.toFixed(2),minOxygen:+s.minOxygen.toFixed(2),maxAlarm:+s.maxAlarm.toFixed(2),detections:s.detections,fuse:s.fuse,fuseUsed:s.fuseUsed,battery:+s.battery.toFixed(2),flashlight:s.flashlight,recharges:s.recharges,jumpMax:+s.jumpMax.toFixed(2),minHP:s.minHP,combat:{...i.combat.stats},devices:i.desert.stats(),climb:i.desert.climb.stats(),events:s.log});
  return game;
 });
})();
