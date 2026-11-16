/* A genuinely new authored level. Only the asset/warehouse factories are reused. */
(()=>{
 const {T,V}=BGP;if(!new URLSearchParams(location.search).has('show'))BGP.configureMap(-58,58,-56,56,-4);
 BGP.sun.dir.set(.55,.46,.38).normalize();BGP.sun.color.setRGB(1,.83,.62);BGP.sun.intensity=5.7;
 BGP.sky.zenith.setRGB(.045,.095,.15);BGP.sky.horizon.setRGB(.48,.55,.59);BGP.sky.horizonAway.setRGB(.18,.27,.34);BGP.sky.fog.setRGB(.25,.32,.36);
 BGP.wrap('render',old=>async i=>{let r=await old(i);r.exposure=1.04;r.post.saturation=.93;r.post.wet=0;Object.assign(r.tune,{volSigma:.0022,volFarHaze:.18,flare:.06});r.scene.add(new T.HemisphereLight(0xb0c9de,0x57442d,.75));return r});
 BGP.wrap('level',()=>async i=>{
  const root=new T.Group();root.name='switchyard-zero';i.scene.add(root);
  const ctx=BGP.layoutContext(i),stat=ctx.staticRoot,dyn=ctx.dynRoot;root.add(stat,dyn);
  const interiors=[],skylights=[],lights=[],updaters=[],placed=ctx.placed,footprints=[];
  const metal=i.mats.get('steel_galv'),dark=i.mats.get('steel_dark'),yellow=i.mats.get('paint_yellow'),concrete=i.mats.get('concrete'),diamond=i.mats.get('diamond_plate');
  const cyan=i.mats.emissive(0x7ee4df,3),amber=i.mats.emissive(0xffbd70,3);
  const mesh=(geo,mat,x=0,y=0,z=0,parent=stat)=>{let m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m};
  const box=(mat,x,y,z,w,h,d,parent=stat)=>mesh(BGP.bevel(w,h,d,Math.min(.025,h*.2,w*.2,d*.2)),mat,x,y,z,parent);
  const col=(a,b,tag='freight',opts={})=>i.physics.addBox(a,b,{surface:'metal',tag,...opts});
  const rod=(a,b,r=.035,mat=metal,parent=stat)=>{a=V(...a);b=V(...b);let m=mesh(new T.CylinderGeometry(r,r,a.distanceTo(b),10),mat,0,0,0,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),b.sub(a).normalize());return m};
  // Player guards span the openings; bullets and AI sight intersect only real metal.
  // Finite cylinders also keep sloping handrails from becoming large diagonal AABBs.
  const railSolids=[],railInfo={posts:0,stairPosts:0,guards:0};
  function solidRod(a,b,r=.03,material=yellow,tag='rail-metal'){
   rod(a,b,r,material);const start=V(...a),axis=V(...b).sub(start),length=axis.length();axis.divideScalar(length);
   const min=V(...a).min(V(...b)).addScalar(-r),max=V(...a).max(V(...b)).addScalar(r);
   railSolids.push({a:start,axis,length,r,min,max,bounds:new T.Box3(min,max),tag,surface:'metal'});
  }
  const nativeRaycast=i.physics.raycast.bind(i.physics),queryRay=new T.Ray(),offset=V(),radial=V(),direction=V(),hitPoint=V();
  i.physics.raycast=(origin,dir,far=500)=>{
   let best=nativeRaycast(origin,dir,far),limit=best?.dist??far;queryRay.set(origin,dir);
   for(const c of railSolids){if(!queryRay.intersectsBox(c.bounds))continue;
    offset.copy(origin).sub(c.a);const along=offset.dot(c.axis),speed=dir.dot(c.axis);
    radial.copy(offset).addScaledVector(c.axis,-along);direction.copy(dir).addScaledVector(c.axis,-speed);
    const A=direction.lengthSq(),B=2*radial.dot(direction),C=radial.lengthSq()-c.r*c.r;
    let t=Infinity,cap=0,disc=B*B-4*A*C;
    if(A>1e-12&&disc>=0)for(const q of[(-B-Math.sqrt(disc))/(2*A),(-B+Math.sqrt(disc))/(2*A)]){const y=along+q*speed;if(q>1e-5&&q<t&&y>=0&&y<=c.length)t=q;}
    if(Math.abs(speed)>1e-9)for(const end of[0,c.length]){const q=(end-along)/speed;if(q<=1e-5||q>=t)continue;hitPoint.copy(radial).addScaledVector(direction,q);if(hitPoint.lengthSq()<=c.r*c.r){t=q;cap=end===0?-1:1;}}
    if(t<limit){const point=origin.clone().addScaledVector(dir,t),normal=cap?c.axis.clone().multiplyScalar(cap):point.clone().sub(c.a).addScaledVector(c.axis,-(along+t*speed)).normalize();best={dist:t,point,normal,surface:'metal',box:c};limit=t;}
   }return best;
  };
  const sign=(text,x,y,z,w=3,ry=0)=>{let g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;stat.add(g);let l=i.mats.label(text,{color:'white',font:'stencil',distress:.09});box(dark,0,0,-.04,w+.2,w/l.aspect+.18,.08,g);let m=mesh(new T.PlaneGeometry(w,w/l.aspect),l.material,0,0,.008,g);m.castShadow=false;return g};
  function floor(x0,z0,x1,z1,y=0){box(concrete,(x0+x1)/2,y-.16,(z0+z1)/2,x1-x0,.32,z1-z0);col([x0,y-.32,z0],[x1,y,z1],'apron',{surface:'concrete'});}
  // Continuous outer apron, a real four-metre service well and a narrow centre island.
  floor(-56,-54,-11,54);floor(11,-54,56,54);floor(-11,-54,11,-11);floor(-11,11,11,54);floor(-4,-4,4,4);
  box(concrete,0,-4.1,0,22,.2,22);for(let x of[-11,11]){box(concrete,x,-2,0,.4,4,22);col([x-.2,-4,-11],[x+.2,0,11],'well-wall',{surface:'concrete'})}
  box(concrete,0,-2,-11,22,4,.4);col([-11,-4,-11.2],[11,0,-10.8],'well-wall',{surface:'concrete'});
  for(let [a,b]of[[-11,-8.6],[-6.4,11]]){box(concrete,(a+b)/2,-2,11,b-a,4,.4);col([a,-4,10.8],[b,0,11.2],'well-wall',{surface:'concrete'})}
  for(let x of[-10,10])for(let z=-9;z<=9;z+=3){rod([x,-3.8,z],[x,-.2,z],.08);box(yellow,x,-.1,z,.5,.15,.5)}
  function rails(a,b,exclude=[],stair=false){
   let intervals=[[0,1]];for(let [lo,hi]of exclude)intervals=intervals.flatMap(([u,v])=>hi<=u||lo>=v?[[u,v]]:[[u,Math.max(u,lo)],[Math.min(v,hi),v]].filter(([x,y])=>y-x>.001));
   const lerp=t=>a.map((v,n)=>v+(b[n]-v)*t);
   for(let [u,v]of intervals){let start=lerp(u),end=lerp(v),num=Math.ceil(Math.hypot(end[0]-start[0],end[2]-start[2])/1.3);
    for(let h of[.55,1.08])solidRod([start[0],start[1]+h,start[2]],[end[0],end[1]+h,end[2]],.03);
    for(let k=0;k<=num;k++){let p=lerp(u+(v-u)*k/num);solidRod(p,[p[0],p[1]+1.1,p[2]],.037);railInfo.posts++;if(stair)railInfo.stairPosts++;
     box(dark,p[0],p[1]+.025,p[2],.18,.05,.18);col([p[0]-.09,p[1],p[2]-.09],[p[0]+.09,p[1]+.05,p[2]+.09],'rail-foot',{bulletOnly:true,noNav:true});
     for(let dx of[-.055,.055])for(let dz of[-.055,.055])mesh(new T.CylinderGeometry(.016,.016,.025,6),metal,p[0]+dx,p[1]+.058,p[2]+dz);
     if(k<num){let q=lerp(u+(v-u)*(k+1)/num);col([Math.min(p[0],q[0])-.037,Math.min(p[1],q[1]),Math.min(p[2],q[2])-.037],[Math.max(p[0],q[0])+.037,Math.max(p[1],q[1])+1.1,Math.max(p[2],q[2])+.037],'rail-guard',{noNav:true,playerOnly:true});railInfo.guards++;}
    }
   }
  }
  for(let x of[-11,11])rails([x,0,-11],[x,0,11]);for(let z of[-11,11])rails([-11,0,z],[11,0,z],z===11?[[.1,.22]]:[]);
  // A real stairway lets a fallen player leave the service well without a teleport.
  for(let k=1;k<=40;k++){let z=-9+(k-.5)*20.5/40,y=-4+k*.1;box(diamond,-7.5,y-.07,z,1.65,.14,20.5/40);col([-8.325,y-.2,z-20.5/80],[-6.675,y,z+20.5/80],'well-stair',{noNav:true})}sign('SERVICE WELL / EXIT',-7.5,1.8,12,2.3);
  // Two full detailed warehouses relocated and rotated into separate wings.
  function warehouse(cx,cz,rot,label){const w=BGP.layoutContext(i),start=i.physics.boxes.length,wh=BGP.warehouse(w);let mat=new T.Matrix4().makeTranslation(cx,0,cz).multiply(new T.Matrix4().makeRotationY(rot)).multiply(new T.Matrix4().makeTranslation(2,0,19.5));w.staticRoot.applyMatrix4(mat);w.dynRoot.applyMatrix4(mat);stat.add(w.staticRoot);dyn.add(w.dynRoot);root.updateMatrixWorld(true);
   for(let b of i.physics.boxes.slice(start)){let bb=new T.Box3(b.min.clone(),b.max.clone()).applyMatrix4(mat);b.min.copy(bb.min);b.max.copy(bb.max);b.tag='warehouse-'+label}
   for(let p of w.placed){let v=V(p.x,p.y,p.z).applyMatrix4(mat);placed.push({...p,x:v.x,y:v.y,z:v.z,yaw:p.yaw+rot})}
   const bb=new T.Box3(V(-16,0,-28),V(12,9.5,-11)).applyMatrix4(mat);interiors.push(bb);footprints.push({kind:'warehouse',label,min:bb.min.toArray(),max:bb.max.toArray()});
   for(let l of wh.lights){dyn.attach(l);l.intensity=26;lights.push(l)}
   for(let s of wh.skylights){let v=V(s.x,s.y,s.z).applyMatrix4(mat);skylights.push({...s,x:v.x,y:v.y,z:v.z,w:Math.abs(Math.sin(rot))>.5?s.d:s.w,d:Math.abs(Math.sin(rot))>.5?s.w:s.d})}
   updaters.push(wh.update,...w.updaters);
  }
  warehouse(-36,0,Math.PI/2,'WEST');warehouse(35,-34,-Math.PI/2,'NORTH-EAST');
  sign('WEST / RECOVERY HALL',-27.15,6.6,1.5,6,Math.PI/2);sign('NORTH / COLD STORAGE',26.1,6.6,-35.5,6,-Math.PI/2);
  // Forty-six containers are distributed in separate depots rather than inherited rows.
  let seed=500;const colors=['teal','orange','blue','grey','red','white'];
  for(let side of[-1,1])for(let z of[25,32,39,46])for(let level=0;level<3;level++){let x=side*39;ctx.place('container40',x,z,0,{seed:seed++,color:colors[(level+(z/7|0))%6],wear:.48},level*2.59)}
  for(let x of[-47,-39,-31,-23])for(let level=0;level<3;level++)ctx.place('container20',x,-39,Math.PI/2,{seed:seed++,color:colors[level+1]},level*2.59);
  for(let x of[30,38,46])for(let z of[-5,8]){ctx.place('container20',x,z,Math.PI/2,{seed:seed++,color:z===8?'orange':'green',doors:z===8?1:0,wear:.65},0);if(z===-5)ctx.place('container20',x,z,Math.PI/2,{seed:seed++,color:'white'},2.59)}
  // Open long container forms a traversable service tunnel to the south-east depot.
  ctx.place('container40',25,33,Math.PI/2,{seed:seed++,color:'red',doors:1},0);
  sign('02 / OPEN ENERGY CARGO',38,3.6,3.9,6);
  // Dense cargo clusters sit outside the authored routes, not as route-blocking random scatter.
  const types=['pallet_stack','crate_stack','barrel','ibc_tote','cable_reel','generator','gas_cylinders','toolbox_cart','tarp_cargo','pipe_stack','cardboard_boxes','tire_stack'];
  const clusters=[[-47,-22],[-41,-25],[-32,-25],[-24,-29],[-26,30],[-17,35],[-9,38],[8,38],[18,39],[47,-18],[47,-10],[48,17],[32,14],[-48,17],[7,-31],[-12,-32]];
  for(let k=0;k<clusters.length;k++){let [x,z]=clusters[k];for(let a=0;a<3;a++)for(let b=0;b<3;b++){let type=types[(k*5+a*3+b)%types.length];ctx.place(type,x+(a-1)*2.2,z+(b-1)*2.2,(k+a)%4*Math.PI/2,{seed:seed++,color:colors[(k+b)%6]},0)}}
  for(let [x,z]of[[-22,25],[22,25],[-22,-22],[20,-25],[-48,-45],[48,43]])ctx.place('light_mast',x,z,0,{seed:seed++});
  for(let [x,z,yaw]of[[-31,19,0],[34,19,Math.PI/2],[-23,-25,.1],[23,-28,Math.PI]])ctx.place('forklift',x,z,yaw,{seed:seed++});
  // Upper pedestrian ring and cross-well inspection bridge. Ground freight uses a separate loop.
  function deck(x,z,w,d,y=4.8){box(diamond,x,y-.1,z,w,.2,d);col([x-w/2,y-.2,z-d/2],[x+w/2,y,z+d/2],'upper-deck',{noNav:true})}
  deck(-14,0,2.4,30.4);deck(14,0,2.4,30.4);deck(0,-14,28,2.4);deck(0,14,28,2.4);deck(0,-6,28,2.4);deck(0,-8,4.8,4);rails([-2.4,4.8,-10],[2.4,4.8,-10]);for(let x of[-2.4,2.4])rails([x,4.8,-10],[x,4.8,-7.2]);
  // Shared openings generate BOTH the visible gap and its collision gap.
  for(let side of[-1,1]){rails([side*15.2,4.8,-15.2],[side*15.2,4.8,12.9]);for(let [a,b]of[[-12.8,-7.2],[-4.8,12.8]])rails([side*12.8,4.8,a],[side*12.8,4.8,b]);}
  for(let z of[-15.2,15.2])rails([-15.2,4.8,z],[15.2,4.8,z]);
  for(let z of[-12.8,12.8])rails([-12.8,4.8,z],[12.8,4.8,z]);
  for(let [a,b]of[[-12.8,-2.4],[2.4,12.8]])rails([a,4.8,-7.2],[b,4.8,-7.2]);rails([-12.8,4.8,-4.8],[12.8,4.8,-4.8]);
  for(let x of[-14,14])for(let z of[-14,-6,5,14]){box(dark,x,2.25,z,.28,4.5,.28);box(concrete,x,.2,z,.85,.4,.85);col([x-.14,.4,z-.14],[x+.14,4.5,z+.14],'support-column');col([x-.425,0,z-.425],[x+.425,.4,z+.425],'support-base',{surface:'concrete'});solidRod([x,1,z],[x,4.4,z+2],.07,metal,'support-brace');}
  function stairs(side){let x0=side*23,x1=side*15.25,z=14,n=24;
   for(let k=1;k<=n;k++){let a=x0+(x1-x0)*(k-1)/n,b=x0+(x1-x0)*k/n,y=k*.2;box(diamond,(a+b)/2,y-.05,z,Math.abs(b-a),.1,2.05);col([Math.min(a,b),y-.21,z-1.01],[Math.max(a,b),y,z+1.01],'stairs',{noNav:true});}
   for(let zz of[z-1.1,z+1.1]){solidRod([x0,.03,zz],[x1,4.63,zz],.1,dark,'stair-stringer');rails([x0,.14,zz],[x1,4.74,zz],[],true);box(dark,x0,.06,zz,.5,.12,.45);}
   footprints.push({kind:'stairs',from:[x0,0,z],to:[x1,4.8,z]});
  }
  stairs(-1);stairs(1);
  sign('03 / UPPER TRANSFER',0,6.4,-7.15,5);sign('PEDESTRIAN ACCESS',22.8,2.6,14,2.8,Math.PI/2);
  // Central turbine and a new overhead transfer gantry define the skyline.
  for(let y of[-2.8,-.2,2.4,5,7.6,10.2]){let ring=mesh(new T.TorusGeometry(3.7,.11,10,72),y<0?dark:metal,0,y,0);ring.rotation.x=Math.PI/2;for(let a=0;a<12;a++){let th=a*Math.PI/6;box(yellow,Math.cos(th)*3.82,y,Math.sin(th)*3.82,.12,.24,.12)}}
  mesh(new T.CylinderGeometry(3.5,3.5,13,72,2),i.mats.get('steel_worn'),0,3,0);col([-3.5,-4,-3.5],[3.5,9.5,3.5],'turbine');
  for(let a=0;a<24;a++){let th=a*Math.PI/12;rod([Math.cos(th)*3.58,-3,Math.sin(th)*3.58],[Math.cos(th)*3.58,9.4,Math.sin(th)*3.58],.055,a%3?metal:yellow)}
  for(let x of[-9,9])for(let z of[-9,9]){box(dark,x,8,z,.7,24,.7);box(concrete,x,-3.7,z,1.2,.6,1.2);col([x-.35,-4,z-.35],[x+.35,20,z+.35],'gantry-column');for(let y=2;y<20;y+=3){box(metal,x,y,z,.9,.12,.9);for(let s of[-1,1])box(yellow,x+s*.36,y+.2,z,.1,.2,.1)}}
  for(let z of[-9,9]){box(dark,0,19.8,z,20,1.2,.7);for(let x=-9;x<9;x+=3){rod([x,19.2,z],[x+3,17.7,z],.09);rod([x+3,17.7,z],[x+3,19.2,z],.09)}}
  for(let x of[-9,9]){box(yellow,x,20.7,0,.65,.6,21);for(let z=-9;z<9;z+=3){rod([x,20.3,z],[x,18.5,z+3],.1)}}
  box(yellow,0,21,2.2,18,.7,1.6);box(dark,2,20.3,2.2,2.4,.6,2.3);for(let x of[1.5,2.5])rod([x,20,2.2],[x,12,2.2],.035,dark);box(yellow,2,11.8,2.2,2.2,.4,1.1);
  sign('NODE / 00',0,17.5,9.5,7);
  // Freight rail loop and north exit: two different cover profiles and shared destination.
  const routeWest=[[0,20],[-25,20],[-25,-17],[0,-17],[0,-46]],routeEast=[[0,20],[25,20],[25,-17],[0,-17],[0,-46]];
  for(let route of[routeWest,routeEast])for(let k=1;k<route.length;k++){let a=route[k-1],b=route[k],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;for(let off of[-.7,.7])rod([a[0]+nx*off,.018,a[1]+nz*off],[b[0]+nx*off,.018,b[1]+nz*off],.035,dark);for(let t=0;t<len;t+=1.2){let x=a[0]+dx*t/len,z=a[1]+dz*t/len;box(metal,x,.008,z,Math.abs(nx)*1.65+.12,.025,Math.abs(nz)*1.65+.12)}}
  for(let x of[-5,5]){box(concrete,x,4.5,-46,1.3,9,2);box(yellow,x,1,-44.9,1.35,2,.1);box(cyan,x,5,-44.85,.12,5,.08);col([x-.7,0,-47],[x+.7,9,-45],'exit-column')}
  box(dark,0,8.5,-46,11,1.2,2);sign('NORTH TERMINAL / TRANSFER',0,8.5,-44.9,8);
  for(let x of[-55,55]){box(concrete,x,2,0,1,4,109);col([x-.5,-1,-54.5],[x+.5,4,54.5],'boundary')}
  for(let z of[-54,54]){box(concrete,0,2,z,110,4,1);col([-55,-1,z-.5],[55,4,z+.5],'boundary')}
  // The route's three interactive cores are genuinely in different spatial situations.
  const coreSites=[{id:'W',name:'西库 / 稳压核心',pos:V(-36,1.1,0),foot:V(-36,.03,0)},{id:'E',name:'东箱 / 储能核心',pos:V(38,.9,8),foot:V(38,0,8)},{id:'U',name:'高架 / 冷却核心',pos:V(0,5.75,-8.3),foot:V(0,4.8,-8.3)}];
  for(let c of coreSites){box(dark,c.pos.x,c.foot.y+.36,c.pos.z,.95,.72,.95);box(yellow,c.pos.x,c.foot.y+.74,c.pos.z,1.06,.1,1.06);col([c.pos.x-.5,c.foot.y,c.pos.z-.5],[c.pos.x+.5,c.foot.y+.79,c.pos.z+.5],'core-pedestal')}
  // Finalize original detailed mesh batches and preserve animated fan groups.
  root.updateMatrixWorld(true);let moving=[];stat.traverse(o=>{if(o.userData?.noMerge&&!moving.some(p=>{for(let q=o.parent;q;q=q.parent)if(q===p)return true;return false}))moving.push(o)});for(let o of moving)dyn.attach(o);
  let atlas=BGP.atlasLabels(stat);let merged=BGP.merge(stat);root.remove(stat);root.add(merged);let tris=0,meshes=0;merged.traverse(m=>{if(m.isMesh){meshes++;tris+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3}});
  const originalBuild=i.physics.build.bind(i.physics);i.physics.build=()=>{originalBuild();let grid=i.physics.nav._grid();for(let z=0;z<grid.h;z++)for(let x=0;x<grid.w;x++){let px=grid.minX+(x+.5)*grid.cell,pz=grid.minZ+(z+.5)*grid.cell;if((Math.abs(px)<11.45&&Math.abs(pz)<11.45)||(Math.abs(px)>13&&Math.abs(px)<23.45&&pz>12.7&&pz<15.3))grid.blocked[z*grid.w+x]=1;}};
  i.physics.build();
  const plan={bounds:[-58,-56,58,56],well:{min:[-11,-11],max:[11,11],depth:4},upper:{height:4.8,ring:[[-14,-14],[14,-14],[14,14],[-14,14]],bridge:[[-14,-6],[14,-6]]},warehouses:footprints.filter(f=>f.kind==='warehouse'),stairs:footprints.filter(f=>f.kind==='stairs'),cores:coreSites.map(c=>({id:c.id,position:c.pos.toArray()})),routes:{west:routeWest,east:routeEast},spawn:[0,0,28],exit:[0,0,-46]};
  const lev={root,playerStart:{pos:V(0,0,28),yaw:0},objectives:[],extraction:{pos:V(0,0,-46),radius:3},enemySpawns:[],zones:[{name:'hub',min:[-23,-23],max:[23,23]}],interiorBoxes:interiors,cinematicPath:[{pos:[19,9,27],look:[0,7,0]},{pos:[-13,6.4,-6],look:[8,10,2]}],coverPoints:[V(-23,0,1),V(24,0,8),V(-23,0,-22),V(23,0,-21)],skylights,shedLights:lights,placed,stats:{containers:placed.filter(p=>p.name.startsWith('container')).length,props:placed.length,tris:Math.round(tris),meshes,labelsAtlased:atlas.count,warehouses:2,layout:'new square freight loop + separate elevated pedestrian ring'},coreSites,routeWest,routeEast,plan,groundSurfaceAt:(x,z)=>Math.abs(x)<16&&Math.abs(z)<16?'metal':'concrete',update(dt){atlas.update(dt);for(let u of [...updaters,...ctx.updaters])u(dt)}};
  plan.railCollision={...railInfo,metalCylinders:railSolids.length,policy:'player guards + finite metal cylinders; no bullet wall in gaps'};
  i.freightBuild={mesh,box,rod,sign,root,stat:merged,dyn,materials:{metal,dark,yellow,cyan,amber,concrete}};return lev;
 });
 BGP.wrap('ground',()=>async i=>{let root=new T.Group();root.name='freight-ground';i.scene.add(root);let mat=i.mats.get('asphalt').clone();mat.roughness=.96;mat.color.set(0x727779);let m=new T.Mesh(new T.PlaneGeometry(1500,1500),mat);m.rotation.x=-Math.PI/2;m.position.y=-4.02;m.receiveShadow=true;root.add(m);return{root,apron:root,sea:null,rain:null,rainLevel:0,isPuddle:()=>false,puddleDepth:()=>-10,wetnessAt:()=>0,seaHeight:()=>-4,setRain(){},setReflections(){},update(){}}});
 const noise=`float dh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float dn(vec2 p){vec2 a=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(dh(a),dh(a+vec2(1,0)),f.x),mix(dh(a+vec2(0,1)),dh(a+1.),f.x),f.y);}float df(vec2 p){return dn(p)*.57+dn(p*2.07)*.28+dn(p*4.17)*.15;}`;
 function rockMat(){let m=new T.MeshStandardMaterial({color:0xffffff,roughness:1,vertexColors:true});m.name='stratified-sandstone';m.onBeforeCompile=s=>{s.vertexShader='varying vec3 dRock;\n'+s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\ndRock=(modelMatrix*vec4(transformed,1.)).xyz;');s.fragmentShader='varying vec3 dRock;\n'+noise+`\nfloat drh(vec3 p){float warp=df(p.xz*.12)*2.;float strata=sin(p.y*2.1+warp);return df(vec2(p.x+p.z*.7,p.y)*2.1)*.15+strata*.10+df(vec2(p.x*.7+p.z*.5,p.y*.16))*.5;}\n`+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 p=dRock;float macro=df(p.xz*.11+vec2(p.y*.03));float wav=df(p.xz*.13)*2.6;float strata=.5+.5*sin(p.y*1.4+wav);float seams=pow(.5+.5*sin(p.y*3.8+wav*.8),16.);float wash=df(vec2((p.x+p.z*.71)*.35,p.y*.055));float chips=df(vec2(p.x+p.z*.4,p.y)*3.);vec3 stone=mix(vec3(.20,.17,.13),vec3(.55,.46,.33),macro*.5+strata*.24+wash*.26);stone*=.8+chips*.34;stone*=1.-seams*.19;stone=mix(stone,vec3(.62,.47,.30),smoothstep(.65,.9,wash)*.24);diffuseColor.rgb*=stone;`);s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition),r1=cross(dy,normal),r2=cross(normal,dx);float det=dot(dx,r1),height=drh(dRock);normal=normalize(max(abs(det),.000001)*normal-sign(det)*(dFdx(height)*r1+dFdy(height)*r2)*.7);`)};return m}

 BGP.wrap('backdrop',()=>async i=>{let stat=new T.Group(),rock=rockMat();stat.name='quarry-escarpment';
  // Eroded sandstone mesas, with wide flat crowns and irregular stratified flanks.
  for(let [x,z,rx,rz,h]of[[-120,-115,49,36,45],[32,-165,77,32,57],[150,-100,53,42,48],[165,55,55,48,43],[-120,100,53,40,39],[40,190,90,39,52],[-230,-15,70,54,60],[270,130,50,70,71]]){
   let geo=new T.CylinderGeometry(1,1,1,128,40,false),a=geo.attributes.position,cols=[];
   for(let k=0;k<a.count;k++){let xx=a.getX(k),yy=a.getY(k)+.5,zz=a.getZ(k),theta=Math.atan2(zz,xx),shelf=1+Math.floor((1-yy)*9)*.022,erosion=1+Math.sin(theta*7+x)*.065+Math.sin(theta*17+z)*.032+Math.sin(theta*37+x)*.014;let taper=(1-.35*yy)*shelf*erosion;taper+=Math.sin(yy*57+x)*.008+Math.sin(theta*21+yy*2)*.017*(1-yy);a.setXYZ(k,x+xx*rx*taper,yy*h-3+Math.sin(theta*8)*.65+Math.sin(theta*19)*.3,z+zz*rz*taper);let band=.92+.06*Math.sin(yy*42+h)+.02*Math.sin(theta*21);cols.push(band,band*.98,band*.95)}geo.setAttribute('color',new T.Float32BufferAttribute(cols,3));geo.computeVertexNormals();let m=new T.Mesh(geo,rock);m.receiveShadow=true;stat.add(m);
  }

let root=BGP.merge(stat);i.scene.add(root);return{root,stats:{mesas:8},update(){}}});
})();
