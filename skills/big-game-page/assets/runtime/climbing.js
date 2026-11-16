/* Climbable crane: solid stairs, safe landing hatches and three continuous ladder traversals. */
(()=>{
 const T=lt,V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),limit=(v,a,b)=>Math.max(a,Math.min(b,v));
 const previousGame=mM;mM=function(i){const game=previousGame(i);if(i.desert)install(i,game);return game};
 function install(i,game){
  const p=i.player,physics=i.physics,root=new T.Group();root.name='crane-access';i.scene.add(root);
  const steel=i.mats.get('steel_galv'),yellow=i.mats.get('paint_yellow'),dark=i.mats.get('steel_dark');
  const c=i.desert.climb={active:null,near:null,cooldown:0,held:false,steps:0,ascents:0,descents:0,summitReached:false,ladders:[],gates:[],boxes:[],log:[]};
  function col(a,b,tag='crane-access'){let v=physics.addBox(a,b,{surface:'metal',tag,noNav:true});c.boxes.push(v);return v}
  function cub(parent,mat,x,y,z,w,h,d){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
  function bar(parent,mat,a,b,r=.025){a=V(...a);b=V(...b);let m=new T.Mesh(new T.CylinderGeometry(r,r,a.distanceTo(b),8),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),b.sub(a).normalize());m.castShadow=m.receiveShadow=true;parent.add(m);return m}
  function rail(a,b,visual=false){let dx=b[0]-a[0],dz=b[2]-a[2],steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.5));for(let n=0;n<steps;n++){let t0=n/steps,t1=(n+1)/steps;col([Math.min(a[0]+dx*t0,a[0]+dx*t1)-.025,a[1]+(b[1]-a[1])*Math.min(t0,t1),Math.min(a[2]+dz*t0,a[2]+dz*t1)-.025],[Math.max(a[0]+dx*t0,a[0]+dx*t1)+.025,a[1]+(b[1]-a[1])*Math.max(t0,t1)+1.08,Math.max(a[2]+dz*t0,a[2]+dz*t1)+.025],'crane-rail')}
   if(visual){for(let h of[.52,1.03])bar(root,yellow,[a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]]);for(let t=0;t<=1;t+=.25){let x=a[0]+dx*t,z=a[2]+dz*t,y=a[1]+(b[1]-a[1])*t;bar(root,yellow,[x,y,z],[x,y+1.05,z])}}
  }
  function sign(text,pos,width=1.3,rotation=0){let l=i.mats.label(text,{color:'black',font:'stencil',distress:.12}),g=new T.Group();cub(g,yellow,0,0,-.02,width,width/l.aspect+.14,.035);let m=new T.Mesh(new T.PlaneGeometry(width-.08,(width-.08)/l.aspect),l.material);g.add(m);g.position.set(...pos);g.rotation.y=rotation;root.add(g)}
  // Remove only the ladder's old solid box; the bogie and all crane columns remain solid.
  for(let b of physics.boxes.slice())if(b.tag==='backdrop'&&Math.abs(b.min.x-18.63)<.001&&Math.abs(b.min.z-6.95)<.001)physics.removeBox(b);
  const heights=[3.6,6.9,10.2,13.5,16.8,20.1];
  function landing(x0,x1,y,west,hatch=false){col([x0,y-.13,6.15],[x1,y,hatch?6.95:7.8]);let edge=west?x0+.03:x1-.03;rail([edge,y,6.18],[edge,y,7.77]);rail([x0,y,7.77],[x1,y,7.77]);rail([x0,y,6.18],[x1,y,6.18],true)}
  function flight(x0,y0,x1,y1,z0,z1){let n=Math.round((y1-y0)/.21),rise=(y1-y0)/n;
   for(let k=1;k<=n;k++){let a=x0+(x1-x0)*(k-1)/n,b=x0+(x1-x0)*k/n,y=y0+rise*k;col([Math.min(a,b),y-rise-.035,z0+.045],[Math.max(a,b),y,z1-.045],'crane-stair')}
   // Match the slope of the existing handrails, keeping the full tread width clear.
   rail([x0,y0,z0+.03],[x1,y1,z0+.03]);rail([x0,y0,z1-.03],[x1,y1,z1-.03]);
  }
  for(let n=0;n<6;n++){let west=n%2===0;landing(west?19.4:26.4,west?20.6:27.6,heights[n],west,n===0);if(n<5)west?flight(20.6,heights[n],26.4,heights[n+1],6.15,6.97):flight(26.4,heights[n],20.6,heights[n+1],6.97,7.8)}
  flight(26.4,20.1,23.4,21.9,6.97,7.8);
  col([22.5,21.75,3.15],[23.4,21.9,7.8]);rail([22.53,21.9,3.2],[22.53,21.9,7.77]);rail([22.53,21.9,7.77],[23.37,21.9,7.77]);rail([23.37,21.9,4.4],[23.37,21.9,6.97]);
  // Widen the machinery-house approach outside its existing boom railing.
  cub(root,steel,25.5,21.84,3.775,6,.12,1.25);col([22.5,21.75,3.15],[28.5,21.9,4.4]);
  rail([23.4,21.9,4.4],[28.5,21.9,4.4],true);rail([28.5,21.9,4.4],[28.5,21.9,3.15],true);
  for(let x of[24,26,28])bar(root,dark,[x,21.75,4.3],[x,21,2.8],.055);
  // Existing machinery house, roof, roof equipment and highest service platform.
  col([20.4,22.8,-2.9],[27.9,26,2.9],'crane-house');col([20.2,26,-3.1],[28.1,26.12,3.1],'crane-roof');
  rail([20.4,26.12,-2.9],[27.9,26.12,-2.9]);rail([20.4,26.12,-2.9],[20.4,26.12,2.9]);rail([27.9,26.12,-2.9],[27.9,26.12,2.9]);rail([20.4,26.12,2.9],[24.65,26.12,2.9]);rail([25.75,26.12,2.9],[27.9,26.12,2.9]);
  col([25.8,26.12,.4],[27.1,26.85,1.8],'crane-vent');for(let x of[22.3,26])col([x-.28,26.12,-1.48],[x+.28,26.83,-.92],'crane-vent');col([23.93,26.12,1.73],[24.27,28.05,2.07],'crane-vent');
  col([26.6,30.19,-2.1],[28.6,30.34,2.1],'crane-summit');rail([26.62,30.34,-2.08],[28.58,30.34,-2.08]);rail([28.58,30.34,-2.08],[28.58,30.34,2.08]);rail([28.58,30.34,2.08],[26.62,30.34,2.08]);rail([26.62,30.34,-2.08],[26.62,30.34,-.8]);rail([26.62,30.34,.3],[26.62,30.34,2.08]);col([27.55,30.34,-.05],[27.65,33.6,.05],'crane-antenna');
  function ladder(id,name,points,aim,away){let path=points.map(q=>V(...q)),lengths=[0];for(let n=1;n<path.length;n++)lengths.push(lengths[n-1]+path[n].distanceTo(path[n-1]));let l={id,name,path,lengths,length:lengths.at(-1),aim:V(...aim),away:V(...away)};c.ladders.push(l);return l}
  const base=ladder('base','首层检修梯',[[19.8,0,7.35],[19.8,3.74,7.35],[19.8,3.74,6.56],[20,3.6,6.56]],[19.35,1.4,7.35],[1,0,0]);
  const roof=ladder('roof','机房屋顶梯',[[25.2,21.9,3.55],[25.2,26.26,3.55],[25.2,26.26,2.25],[25.2,26.12,2.25]],[25.2,23.3,3.09],[0,0,1]);
  const summit=ladder('summit','最高检修平台',[[26.12,26.12,-.25],[26.12,30.48,-.25],[27.15,30.48,-.25],[27.15,30.34,-.25]],[26.57,27.52,-.25],[-1,0,0]);
  function newLadder(l,plane,axis){let y0=l.path[0].y,y1=l.path.at(-1).y;for(let a of[-.29,.29])axis==='z'?bar(root,steel,[plane[0]+a,y0,plane[2]],[plane[0]+a,y1+1.08,plane[2]],.031):bar(root,steel,[plane[0],y0,plane[2]+a],[plane[0],y1+1.08,plane[2]+a],.031);
   for(let y=y0+.24;y<y1;y+=.27)axis==='z'?bar(root,steel,[plane[0]-.29,y,plane[2]],[plane[0]+.29,y,plane[2]],.024):bar(root,steel,[plane[0],y,plane[2]-.29],[plane[0],y,plane[2]+.29],.024);
  }
  newLadder(roof,[25.2,0,3.09],'z');newLadder(summit,[26.57,0,-.25],'x');
  function gate(l,a,b){let parent=new T.Group(),dx=b[0]-a[0],dz=b[2]-a[2];parent.position.set(...a);root.add(parent);for(let h of[.5,1.02])bar(parent,yellow,[0,h,0],[dx,h,dz]);bar(parent,yellow,[dx,0,dz],[dx,1.04,dz]);let collider=col([Math.min(a[0],b[0])-.025,a[1],Math.min(a[2],b[2])-.025],[Math.max(a[0],b[0])+.025,a[1]+1.08,Math.max(a[2],b[2])+.025],'crane-gate');let g={ladder:l,parent,collider};c.gates.push(g);return g}
  gate(base,[19.4,3.6,6.98],[20.6,3.6,6.98]);gate(roof,[24.65,26.12,2.9],[25.75,26.12,2.9]);gate(summit,[26.62,30.34,.3],[26.62,30.34,-.8]);
  sign('检修梯 / 30 m ↑',[19.36,1.65,7.35],.95,Math.PI/2);sign('机房屋顶 ↑',[25.2,23.8,3.12],1.05);sign('最高平台 ↑',[26.54,28,-.25],1.05,-Math.PI/2);sign('30.3 m / 高层检修',[28.55,31.12,1.1],1.3,-Math.PI/2);
  // Batch only fixed steelwork; swing gates retain their live transforms and colliders.
  const movingGates=c.gates.map(g=>g.parent);for(const g of movingGates)g.removeFromParent();
  const staticSteel=By(root);root.clear();root.add(staticSteel,...movingGates);
  physics.build();
  function pointAt(l,s,out){s=limit(s,0,l.length);let n=1;while(n<l.path.length-1&&s>l.lengths[n])n++;let f=(s-l.lengths[n-1])/(l.lengths[n]-l.lengths[n-1]);return out.copy(l.path[n-1]).lerp(l.path[n],f)}
  function findNear(){let best=null,distance=1.15;for(let l of c.ladders)for(let end of[0,1]){let q=end?l.path.at(-1):l.path[0],dist=Math.hypot(q.x-p.pos.x,q.z-p.pos.z);if(Math.abs(q.y-p.pos.y)>.5||dist>distance)continue;let target=end?l.path[1].clone().setY(q.y+1.3):l.aim;let v=target.clone().sub(p.eye);v.y=0;if(v.lengthSq()>.03&&v.normalize().dot(V(p.forward.x,0,p.forward.z).normalize())<.15)continue;best={l,end};distance=dist}return best}
  function start(near){let l=near.l;c.active={l,s:near.end?l.length:0,entry:near.end,align:true,foot:0};p.climbing=true;p.sprinting=false;p.vel.set(0,0,0);i.weapon.setVisible(false);c.log.push({event:'attach',ladder:l.id,from:near.end?'top':'bottom',time:game.run.time});}
  function stop(completed=false,drop=false){let a=c.active;if(!a)return;c.active=null;p.climbing=false;c.cooldown=.4;i.weapon.setVisible(true);p.vel.set(0,0,0);if(drop){p.vel.addScaledVector(a.l.away,1.8);p.vel.y=.4}if(completed){let up=a.s>=a.l.length;if(up)c.ascents++;else c.descents++;c.log.push({event:up?'top-exit':'bottom-exit',ladder:a.l.id,pos:p.pos.toArray(),time:game.run.time});if(up&&a.l===summit){c.summitReached=true;i.hud.message('已抵达最高检修平台 · 30.3 米',4)}else i.hud.message(up?'已踏上平台，可继续移动':'已回到梯底',2)}}
  const move=physics.moveCapsule.bind(physics),temp=V();
  physics.moveCapsule=(pos,vel,dt,...rest)=>{if(pos!==p.pos||!c.active||!p.alive)return move(pos,vel,dt,...rest);let a=c.active,target=pointAt(a.l,a.s,temp);vel.set(0,0,0);
   if(a.align){let distance=pos.distanceTo(target),step=2.2*dt;distance<=step?(pos.copy(target),a.align=false):pos.lerp(target,step/distance)}else{let input=limit(i.input.move.y,-1,1),old=a.s;a.s=limit(a.s+input*2.2*dt,0,a.l.length);pointAt(a.l,a.s,pos);a.foot+=Math.abs(a.s-old);if(a.foot>.42){a.foot=0;i.events.emit('player:step',{surface:'metal',sprint:false,pos:p.pos})}if(input>.1&&a.s>=a.l.length||input<-.1&&a.s<=0)stop(true)}return {onGround:false,surface:'metal',hitWall:false,hitCeil:false};
  };
  const playerUpdate=p.update.bind(p);p.update=dt=>{let active=!!c.active,sprint=i.input.sprint,crouch=i.input.crouch;if(active){i.input.sprint=false;i.input.crouch=false;p.crouching=false}playerUpdate(dt);i.input.sprint=sprint;i.input.crouch=crouch};
  const weaponUpdate=i.weapon.update.bind(i.weapon);i.weapon.update=dt=>{let fire=i.input.fire,ads=i.input.ads;if(c.active){i.input.fire=false;i.input.ads=false}weaponUpdate(dt);i.input.fire=fire;i.input.ads=ads};
  const update=game.update.bind(game);game.update=dt=>{let result=update(dt);if(game.state!=='playing')return result;c.cooldown=Math.max(0,c.cooldown-dt);let down=i.input.down('interact'),press=i.input.pressed('interact')||down&&!c.held;c.held=down;
   if(c.active){if(press||i.input.pressed('jump'))stop(false,true)}else if(c.cooldown===0){c.near=findNear();if(c.near&&press)start(c.near)}else c.near=null;
   for(let g of c.gates){let open=c.active?.l===g.ladder;g.collider.bulletOnly=g.collider.playerOnly=!!open;g.parent.rotation.y+=( (open?-Math.PI/2:0)-g.parent.rotation.y)*Math.min(1,dt*14)}
   let hint=c.active?c.active.l.name:c.near?.l.name;if(hint){let a=c.active;i.hud.setPrompt(hint,a?a.s/a.l.length:0);let label=document.querySelector('.h-plabel');if(label)label.textContent=a?(i.input.touch?'摇杆上下攀爬 · 交互松手':'W 上爬 / S 下爬 · E / 空格松手')+' · '+p.pos.y.toFixed(1)+' m':(i.input.touch?'点交互抓梯':'按 E 抓梯')+' · '+hint+(c.near?.end?' · S 下爬':' · W 上爬，自动跨上平台')}
   if(p.pos.y>20){let el=document.querySelector('.d-zone');if(el)el.textContent=p.pos.y>29?'最高检修平台 · 30.3 m':p.pos.y>25?'起重机机房屋顶':'起重机高层检修道'}return result;
  };
  function resetAccess(clearStats=false){stop();p.climbing=false;c.near=null;c.held=false;c.cooldown=0;for(let g of c.gates){g.collider.bulletOnly=g.collider.playerOnly=false;g.parent.rotation.y=0}if(clearStats){c.summitReached=false;c.ascents=0;c.descents=0;c.log.length=0}}
  // Direct restarts may skip the intro state, so reset at the actual run boundary.
  const startRun=game.start.bind(game);game.start=(...args)=>{resetAccess(true);return startRun(...args)};
  i.events.on('game:state',e=>{if(['intro','title','dead','complete'].includes(e.state))resetAccess(e.state==='intro'||e.state==='title')});
  c.stats=()=>({active:c.active?.l.id||null,position:p.pos.toArray(),ascents:c.ascents,descents:c.descents,summitReached:c.summitReached,log:c.log.slice(),ladders:c.ladders.map(l=>({id:l.id,length:l.length,bottom:l.path[0].toArray(),top:l.path.at(-1).toArray()}))});
 }
})();
