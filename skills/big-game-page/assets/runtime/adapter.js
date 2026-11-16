/* The only module that knows the inherited core's private symbol names. */
const BGP = {
  recipe: window.BIGGAMEPAGE_RECIPE,
  T: lt,
  V: (x=0,y=0,z=0) => new lt.Vector3(x,y,z),
  clamp: (v,a=0,b=1) => Math.max(a,Math.min(b,v)),
  merge: By, bevel: Wi, crane: i => Eb(i,{only:'crane'}),
  layoutContext: ob, warehouse: ab, atlasLabels: rb, createMenus: pM,
  configureMap(minX,maxX,minZ,maxZ,groundY=0) {
    oi.min.set(minX,groundY,minZ);oi.max.set(maxX,36,maxZ);oi.groundY=groundY;oi.quayX=maxX+100;oi.seaY=groundY;
    Ya=minX;EA=maxX;ol=minZ;SA=maxZ;qt=Math.round((EA-Ya)/Ls);Qs=Math.round((SA-ol)/Ls);
  },
  sun: Mn, sky: en, movement: Mt, sensing: Ui, flow: Yi, radio: _l,
  setJump(apex) { Mt.jumpApex=apex; rC=Math.sqrt(2*Mt.gravity*apex); },
  setVision(degrees) { Ui.sightCone=degrees; BC=Math.cos(degrees*Math.PI/360); },
  setSkyShader(source) { H6=source; },
  wrap(name, decorate) {
    if(name==='level') C1=decorate(C1);
    else if(name==='ground') O1=decorate(O1);
    else if(name==='backdrop') pv=decorate(pv);
    else if(name==='render') Hg=decorate(Hg);
    else if(name==='game') mM=decorate(mM);
    else if(name==='audio') c_=decorate(c_);
    else throw Error('Unknown BigGamePage hook: '+name);
  }
};
window.BigGamePage={version:'0.4.0',name:'BigGamePage · 一页大作',tagline:'Big games. One page.',recipe:BGP.recipe};
