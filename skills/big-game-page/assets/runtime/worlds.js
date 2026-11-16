/* Authored world kits. The industrial level and enemy rigs are never rebuilt. */
(()=>{
 const {T,V,recipe:R}=BGP,world=R.world;
 const rand=(()=>{let s=74291;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296)})();
 function mesh(root,geo,mat,x=0,y=0,z=0){let m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);return m}
 function box(root,mat,x,y,z,w,h,d){return mesh(root,BGP.bevel(w,h,d,Math.min(.035,w/6,h/6,d/6)),mat,x,y,z)}
 function rod(root,mat,a,b,r=.04){a=V(...a);b=V(...b);let m=mesh(root,new T.CylinderGeometry(r,r,a.distanceTo(b),10),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),b.sub(a).normalize());return m}
 function label(i,root,text,x,y,z,w,ry=0){let l=i.mats.label(text,{color:'white',font:'stencil',distress:.08});let m=mesh(root,new T.PlaneGeometry(w,w/l.aspect),l.material,x,y,z);m.rotation.y=ry;return m}
 const sky=world==='harbor'?[[.035,.065,.12],[.19,.27,.37],[.08,.14,.22],[.12,.19,.25]]:world==='moon'?[[.002,.003,.009],[.028,.034,.055],[.015,.02,.033],[.08,.09,.12]]:[[.045,.065,.07],[.12,.15,.15],[.065,.08,.09],[.075,.09,.09]];
 ['zenith','horizon','horizonAway','fog'].forEach((k,n)=>BGP.sky[k].setRGB(...sky[n]));
 BGP.sun.dir.set(world==='moon'?.6:.82,world==='moon'?.34:.39,.25).normalize();
 BGP.sun.color.setRGB(...(world==='harbor'?[.51,.68,1]:world==='moon'?[1,.96,.88]:[.55,.72,.68]));
 BGP.sun.intensity=world==='harbor'?3.6:world==='moon'?7.5:2.4;
 if(world!=='harbor')BGP.setSkyShader(`precision highp float;varying vec3 vDir;uniform vec3 uSunDir,uSunCol,uZen,uHor,uHorAway;uniform float uEnv,uTime,uFlash;void main(){vec3 d=normalize(vDir);float mu=dot(d,uSunDir);vec3 c=mix(uHor,uZen,smoothstep(0.,.45,d.y));c+=uSunCol*smoothstep(.99987,.99995,mu)*22.*(1.-uEnv);gl_FragColor=vec4(c,1.);}`);
 BGP.wrap('render',old=>async i=>{if(world==='moon')i.params.vol='0';let r=await old(i);r.exposure=world==='bunker'?1.16:1.07;r.post.saturation=world==='moon'?.72:.94;r.post.wet=world==='harbor'?1:0;
  if(world==='moon'){Object.assign(r.tune,{volSigma:0,volFarHaze:0,volSunScale:0,flare:.025});r.scene.add(new T.HemisphereLight(0x9eb8dd,0x75736f,1.15))}
  if(world==='bunker'){Object.assign(r.tune,{volSigma:.0016,volFarHaze:.14,flare:0});r.scene.add(new T.HemisphereLight(0x9bb6b2,0x38322a,.7))}
  return r});
 BGP.wrap('level',old=>async i=>{let lev=await old(i);i.mats.uniforms.wet.value=world==='harbor'?1:0;lev.objectives.forEach((o,n)=>o.label=R.objectives[n]);return lev});
 // Suppress maritime ambience for sealed/airless worlds, retaining synthesized actions and machinery.
 if(world!=='harbor')BGP.wrap('audio',old=>i=>{let a=old(i);return a});
 BGP.wrap('ground',old=>async i=>{
  if(world==='harbor')return old(i);
  let root=new T.Group();root.name='big-game-page-'+world+'-ground';i.scene.add(root);
  let mat=i.mats.get(world==='moon'?'concrete':'asphalt').clone();mat.color.set(world==='moon'?0x9096a0:0x4d5554);mat.roughness=.97;
  const floor=new T.PlaneGeometry(1000,1000,120,120);floor.rotateX(-Math.PI/2);
  {let p=floor.attributes.position;for(let n=0;n<p.count;n++){let x=p.getX(n),z=p.getZ(n),fade=BGP.clamp((Math.max(Math.abs(x)-45,Math.abs(z)-38))/38);p.setY(n,(x>30?-1.62:-.055)+(world==='moon'?fade*(4+3*Math.sin(x*.032+z*.052)+2*Math.sin(x*.09-z*.014)):0))}floor.computeVertexNormals()}
  mesh(root,floor,mat);mesh(root,new T.PlaneGeometry(70,60).rotateX(-Math.PI/2),mat,-5,-.006,0);let east=mesh(root,new T.PlaneGeometry(15,64).rotateX(-Math.PI/2),mat,35,-1.61,0);i.physics.addBox([30,-2,-30],[40,-1.6,30],{surface:'concrete',tag:'world-basin'});
  // Preserve a readable worn apron; procedural grilles and marks distinguish the base floor.
  let paving=new T.Group(),steel=i.mats.get('steel_galv'),dark=i.mats.get('steel_dark');
  for(let x=-36;x<27;x+=4){box(paving,mat,x,-.025,6.2,3.95,.04,4.5);if(world==='bunker')for(let z of[4.3,8.1])box(paving,steel,x,.005,z,3.7,.01,.06)}
  for(let z=-28;z<27;z+=4)box(paving,mat,24,-.025,z,5.8,.04,3.95);
  for(let x=-32;x<18;x+=3)for(let z of[5.2,7.2])box(paving,dark,x,-.001,z,.5,.012,.1);
  root.add(BGP.merge(paving));
  return{root,apron:root,sea:null,rain:null,rainLevel:0,isPuddle:()=>false,puddleDepth:()=>-.2,wetnessAt:()=>0,seaHeight:()=>-1.6,setRain(){},setReflections(){},update(){}};
 });
 BGP.wrap('backdrop',old=>async i=>{
  let original=world==='harbor'?await old(i):BGP.crane(i);if(world!=='harbor'&&original.gulls)original.gulls.visible=false;
  let root=new T.Group(),stat=new T.Group();root.name='big-game-page-'+world+'-architecture';i.scene.add(root);
  const m=n=>i.mats.get(n),steel=m('steel_galv'),dark=m('steel_dark'),yellow=m('paint_yellow'),white=m('paint_white');
  const cyan=i.mats.emissive(0x69d4df,3),amber=i.mats.emissive(0xffb85b,3);
  const lights=[];
  function lamp(x,y,z,color,power,range){let l=new T.PointLight(color,power,range,2);l.position.set(x,y,z);root.add(l);lights.push(l);return l}
  function sign(text,x,y,z,w){box(stat,dark,x,y,z-.06,w+.3,.95,.12);label(i,stat,text,x,y,z+.01,w)}
  if(world==='harbor'){
   // Storm lamps, overhead power cables and readable route signs, all procedural.
   for(let [x,z]of[[-28,6.2],[-10,6.2],[10,6.2],[23,-9]]){box(stat,dark,x,3.2,z,.12,6.4,.12);box(stat,steel,x+.65,6.3,z,1.5,.08,.08);box(stat,amber,x+1.25,6.22,z,.5,.07,.3)}
   lamp(-28,5.8,6.2,0xffb86c,34,16);lamp(-3,4,-12,0x7ad9ff,38,19);
   for(let x of[-30,-10,10]){let pts=[];for(let n=0;n<20;n++)pts.push(V(x+n*1.05,7-Math.sin(n/19*Math.PI)*.8,4));mesh(stat,new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.025,6,false),dark)}
   sign('01 / DISABLE ALARM',-4,3.4,8.7,3.5);sign('02 / DATA VAULT',-3.5,6.4,-10.55,4.3);
  }else if(world==='moon'){
   const regolith=new T.MeshStandardMaterial({color:0x73767d,roughness:1});
   for(let k=0;k<110;k++){let ang=rand()*Math.PI*2,r=55+rand()*100,x=Math.cos(ang)*r,z=Math.sin(ang)*r;let geo=new T.DodecahedronGeometry(1,1),a=geo.attributes.position;for(let j=0;j<a.count;j++){let f=.84+rand()*.3;a.setXYZ(j,a.getX(j)*f,a.getY(j)*f,a.getZ(j)*f)}geo.computeVertexNormals();let o=mesh(stat,geo,regolith,x,.1,z);o.scale.set(1+rand()*6,.5+rand()*4,1+rand()*7);o.rotation.y=rand()*6}
   // Six panel arrays, with cells, rails, actuators and feet rather than flat quads.
   let cellmat=new T.MeshStandardMaterial({color:0x193c70,metalness:.6,roughness:.3});
   for(let z=-30;z<=30;z+=12){let g=new T.Group();g.position.set(-50,2.5,z);g.rotation.z=.3;stat.add(g);box(g,steel,0,0,0,9,.14,7);for(let x=-4;x<4;x+=1)for(let zz=-3;zz<3;zz+=1){box(g,cellmat,x+.45,.09,zz+.45,.9,.035,.9);for(let c=-.25;c<.4;c+=.18)box(g,steel,x+.45+c,.114,zz+.45,.008,.006,.88)}rod(stat,steel,[-50,0,z],[-50,2.5,z],.16);rod(stat,steel,[-51,0,z],[-48.5,2.9,z],.08)}
   for(let [x,z]of[[-32,-45],[0,-48],[34,-46]]){let shell=mesh(stat,new T.CylinderGeometry(4.3,4.3,14,40,1,false),white,x,4,z);shell.rotation.z=Math.PI/2;for(let xx=-6;xx<=6;xx+=2){let ring=mesh(stat,new T.TorusGeometry(4.36,.06,8,48),steel,x+xx,4,z);ring.rotation.y=Math.PI/2}for(let xx of[-4,4])box(stat,dark,x+xx,1,z,1.2,2.2,4.6);label(i,stat,'HAB / 0'+(2+Math.round((x+32)/32)),x,4,z+4.35,4)}
   for(let [x,z]of[[-43,25],[43,-25]]){rod(stat,steel,[x,0,z],[x,9,z],.18);let dish=mesh(stat,new T.SphereGeometry(3.3,40,20,0,Math.PI*2,0,Math.PI*.38),white,x,9,z);dish.rotation.z=.5;for(let a=0;a<6;a++){let ang=a*Math.PI/3;rod(stat,dark,[x+Math.cos(ang)*3,9,z+Math.sin(ang)*3],[x,13,z],.045)}}
   sign('SELENE / EVA OPERATIONS',-27,3.4,8.4,5);sign('02 / REACTOR SERVICE',-3.5,6.4,-10.55,4.3);
   // Earth and stars: shader-generated surface, no downloaded texture.
   let earthmat=new T.ShaderMaterial({vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`precision highp float;varying vec3 p;float h(vec3 q){return fract(sin(dot(q,vec3(27.1,81.7,11.3)))*43758.54);}float n(vec3 q){vec3 a=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(mix(h(a),h(a+vec3(1,0,0)),f.x),mix(h(a+vec3(0,1,0)),h(a+vec3(1,1,0)),f.x),f.y),mix(mix(h(a+vec3(0,0,1)),h(a+vec3(1,0,1)),f.x),mix(h(a+vec3(0,1,1)),h(a+1.),f.x),f.y),f.z);}void main(){vec3 d=normalize(p);float land=n(d*4.5)+n(d*11.)*.28;vec3 col=mix(vec3(.015,.10,.32),vec3(.13,.23,.13),smoothstep(.55,.63,land));float c=n(d*17.+1.)*.7+n(d*38.)*.3;col=mix(col,vec3(.85,.91,1.),smoothstep(.52,.7,c));float light=max(.09,dot(d,normalize(vec3(-1.,.7,1.))));gl_FragColor=vec4(col*light*1.5,1.);}`});
   let earth=mesh(root,new T.SphereGeometry(14,64,48),earthmat,100,84,-170);earth.castShadow=false;
   let stars=[],rng=rand;for(let k=0;k<1100;k++){let a=rng()*6.283,h=rng()*.95+.05,rad=Math.sqrt(1-h*h);stars.push(Math.cos(a)*rad*600,h*600,Math.sin(a)*rad*600)}let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(stars,3));root.add(new T.Points(g,new T.PointsMaterial({color:0xbcd7ff,size:.6,sizeAttenuation:true})));
   lamp(-3,4,-12,0xa9d7ff,38,18);
  }else{
   // A full-height underground loading cavern preserves the crane's 30.34 m summit.
   const concrete=m('concrete');box(stat,concrete,0,41,0,103,2,88);
   for(let x of[-47,47])box(stat,concrete,x,20,0,2,42,86);
   for(let z of[-40,40])box(stat,concrete,0,20,z,94,42,2);
   for(let z=-34;z<=34;z+=8){for(let x of[-44,44]){box(stat,dark,x,20,z,1.3,40,1.2);box(stat,yellow,x,1.2,z+1,1.5,2.4,.1);for(let y=6;y<40;y+=8)rod(stat,steel,[x,y,z],[x,y+7,z+7],.12)}box(stat,dark,0,38.5,z,89,1.4,1.2);for(let x=-40;x<40;x+=10){rod(stat,steel,[x,38,z],[x+5,36.1,z],.09);rod(stat,steel,[x+5,36.1,z],[x+10,38,z],.09)}for(let x of[-22,0,22])box(stat,amber,x,37.7,z,5,.16,.35)}
   for(let x of[-42,-40,40,42]){let duct=mesh(stat,new T.CylinderGeometry(.45,.45,76,24),steel,x,12,0);duct.rotation.x=Math.PI/2;for(let z=-36;z<38;z+=3){let flange=mesh(stat,new T.TorusGeometry(.49,.06,8,24),dark,x,12,z);for(let a=0;a<6;a++){let t=a*Math.PI/3;box(stat,steel,x+Math.cos(t)*.56,12+Math.sin(t)*.56,z,.07,.07,.12)}}}
   for(let [x,z]of[[-28,6],[-8,9],[11,10],[24,4],[24,-21]]){box(stat,dark,x,3.3,z,.14,6.6,.14);box(stat,amber,x,6.6,z,1.6,.12,.2)}
   lamp(-28,5,6,0xffaa57,55,21);lamp(-3,5,-17,0x68ded5,70,24);lamp(23,7,6,0xff6841,90,25);
   sign('B09 / EMERGENCY FREIGHT',-27,3.4,8.4,5);sign('FUSE REQUIRED / REACTOR',-3.5,6.4,-10.55,4.6);
   i.scene.environmentIntensity*=1.15;
  }
  // Physical destination with a visible opening on the playable side.
  if(world!=='harbor'){
   box(stat,dark,33,-.8,20,2.7,1.6,4.9);box(stat,white,33,1.8,20,2.5,3.6,4.7);box(stat,dark,31.72,1.8,20,.05,2.9,1.8);for(let z of[18.9,21.1])box(stat,cyan,31.68,1.7,z,.08,2.8,.07);label(i,stat,world==='moon'?'AIRLOCK / 03':'ESCAPE / 09',31.65,3.25,20,2.5,-Math.PI/2);
   i.physics.addBox([31.65,-1.6,17.55],[34.35,3.6,22.45],{surface:'metal',tag:'evac-airlock'});
  }
  root.add(BGP.merge(stat));
  const result={...original,themeRoot:root,themeLights:lights,update(dt){original.update(dt);if(world==='bunker'){let hot=i.bigGamePage?.alarm||0;lights[2].intensity=70+hot*.3+Math.sin(i.time.t*2.4)*7}}};
  return result;
 });
})();
