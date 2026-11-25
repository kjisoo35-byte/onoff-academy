/* Both panel and schematic use the same oriented branches and terminal coordinates.
   The ideal switch represents the sensor output. The powered sensing branch is independent. */
window.SampleCircuit = (() => {
  const rect = (x,y,w,h,fill,r=4,stroke='none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
  const line = (d,color,width=3,extra='') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  const label = (x,y,value,size=14,color='#eff6fc',anchor='start') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="650" text-anchor="${anchor}">${value}</text>`;
  const pin = (x,y) => `<circle cx="${x}" cy="${y}" r="4" stroke="#e5ecf2" stroke-width="1.5" fill="#213647"/>`;
  const defs = `<defs>
  <linearGradient id="metal" x2="0.16" y2="1"><stop stop-color="#c6d2d9"/><stop offset=".19" stop-color="#e9edf0"/><stop offset=".56" stop-color="#96a8b5"/><stop offset="1" stop-color="#798d9d"/></linearGradient>
  <linearGradient id="module" x2=".7" y2="1"><stop stop-color="#4b626c"/><stop offset=".48" stop-color="#273f4a"/><stop offset="1" stop-color="#152e3b"/></linearGradient>
  <pattern id="slots" width="9" height="12" patternUnits="userSpaceOnUse"><path d="M3 2v8" stroke="#627886" stroke-width="4"/></pattern>
  <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0v16" fill="none" stroke="#355062" stroke-width=".7"/></pattern></defs>`;
  function frame(description, body, view='0 0 480 360') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" role="img" aria-label="${description}">${defs}${body}</svg>`;
  }
  const copper='#bc744c', blue='#6ebaff', black='#111e29', current='#d9ff65';
  // Lamps, conductor insulation and moving current marks are independent visual channels.
  // This powered, normally-open NPN model drives every sensor and PLC indicator.
  function indicators(detected) {
    return {power:true, output:detected, input:detected};
  }
  function lampDot(kind,detected,x,y,r=6) {
    const on=indicators(detected)[kind];
    const color={power:'#22bd57',output:'#ff8519',input:'#ffc139'}[kind];
    return `<g transform="translate(${x} ${y})" data-led="${kind}" data-lit="${on}">
      <circle r="${r+2}" fill="#314351" stroke="#acb9bf" stroke-width="1"/>
      <circle r="${r}" fill="${on?color:'#495661'}"/>
      ${on?`<circle cx="${-r*.25}" cy="${-r*.3}" r="${r*.32}" fill="#fff8db"/>`:''}</g>`;
  }
  function sensorLamps(x,y,on,dark=false,spacing=44) {
    const print=dark?'#f4f8fa':'#263848';
    return lampDot('power',on,x,y)+label(x+9,y+4,'PWR',11,print)+
      lampDot('output',on,x+spacing,y)+label(x+spacing+9,y+4,'OUT',11,print);
  }
  const powerArrow=(x,y,angle)=>`<g data-power-arrow transform="translate(${x} ${y}) rotate(${angle})"><g class="power-chevron">
    ${line('M-4 -3l4 3 -4 3m4 -6l4 3 -4 3','#165338',4.8)}${line('M-4 -3l4 3 -4 3m4 -6l4 3 -4 3','#e6fff1',1.8)}</g></g>`;

  const branches = [
    {id:'feed', d:'M64 121V158H200V80H268', color:copper, group:'distribution'},
    {id:'load', d:'M268 80H295V106H308l4 -6 6 12 6 -12 6 12 6 -12 5 6H386V147',color:'#bfced5',group:'plc'},
    {id:'out', d:'M386 147V189H130V247q7 7 0 14V275H240q8 -8 16 0H337',color:black,group:'black'},
    {id:'switch', d:'M337 275V297',color:'#d2e0e6',group:'sensor'},
    {id:'emitter', d:'M337 297V308H262V296',color:'#bfced5',group:'sensor'},
    {id:'return', d:'M262 296H112V261q-8 -7 0 -14V165q-8 -7 0 -14V121',color:blue,group:'blue'}
  ];
  const supplyBranch = 'M64 158V254H220';
  const supplyReturn = 'M248 267V296H262';
  // Orientation follows the SVG path from the positive supply to the zero-volt return.
  const currentArrow=(x,y,angle)=>`<path data-current-arrow transform="translate(${x} ${y}) rotate(${angle})" d="M-5 -4L3 0l-8 4 2 -4z" fill="${current}" stroke="#35553b" stroke-width=".8"/>`;
  const powerEdge='#649a94';
  const arrows = [[158,158,0],[239,80,0],[386,168,90],[238,189,180],[280,275,0],[222,296,180],[112,175,-90]];
  function cabinet() {
    let rail='';
    for(const y of [62,182]) rail+=rect(12,y,450,13,'url(#metal)',2)+rect(16,y+3,442,6,'url(#slots)',1);
    return rect(7,8,466,344,'#3c525f',8,'#728490')+rail+
      rect(12,207,450,13,'#526976',1)+rect(12,207,450,13,'url(#slots)',1);
  }
  const selectable = (id,svg) => `<g data-pick="${id}">${svg}</g>`;
  function panel({on=false,mode='panel',pick='',allowPick=false,wirePicking=true,cutaway=false,stage=0}) {
    const physical=mode==='panel';
    const dev=physical?'url(#module)':'#1b3549';
    const body=[];
    body.push(rect(0,0,480,360,'#162e40',0),rect(0,0,480,360,'url(#grid)',0));
    if(physical) body.push(cabinet());
    let vents='';
    for(let i=0;i<8;i++) vents+=rect(33+i*12,42,7,18,'#41515d',2);
    const psu=rect(23,29,138,94,physical?'url(#metal)':dev,5,'#a6bdca')+(physical?vents:'')+
      label(35,physical?79:65,'DC POWER',16,physical?'#152c40':'#fff')+label(35,physical?95:86,'SUPPLY',12,physical?'#324a5a':'#d6e6f1')+
      rect(34,100,113,21,'#263d4a',2)+label(64,115,'+24V',13,'#ffcc9d','middle')+label(112,115,'0V',13,'#b2d9ff','middle');
    const plc=rect(263,29,171,119,dev,5,'#9eafb8')+(physical?rect(268,34,160,9,'url(#slots)',1):'')+
      label(274,63,'PLC 입력모듈',16)+label(270,74,'COM',11)+label(311,130,'입력회로',13)+
      lampDot('input',on,385,57)+label(399,63,on?'ON':'OFF',14)+label(396,143,'X0',13);
    const shell=rect(181,219,210,100,'url(#metal)',12,'#a9bdc9')+rect(184,223,198,92,'#263d49',8)+rect(384,235,11,68,'#b77847',3);
    const sensorFace=label(187,235,'센서',14)+sensorLamps(293,233,on,true)+
      '<g data-power="sensor">'+rect(220,245,56,22,'#305446',3,'#76a18e')+label(248,260,'전원부',13,'#fff','middle')+'</g>'+
      rect(280,245,47,22,'#375260',4)+label(303,261,'감지부',12,'#fff','middle')+
      line('M327 256h11v11','#bcd4e2',1.8,'stroke-dasharray="2 4"')+
      label(305,294,'NPN',12,'#fff','middle')+label(344,291,on?'닫힘':'열림',12);
    const caseOutline=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#1d3546" stroke="#96b1c0" stroke-dasharray="5 3"/>`;
    const schematicSupply=caseOutline(23,29,138,94)+label(35,55,'DC 전원',16)+
      line('M64 121V90h13m32 0h3v31','#e7f1f6',2)+line('M78 76v28m8 -21v14m7 -21v28m8 -21v14','#e7f1f6',2)+label(42,111,'+',15)+label(125,111,'−',15);
    const schematicPlc=caseOutline(263,29,171,119)+label(274,58,'PLC',17)+lampDot('input',on,328,53)+label(342,58,on?'X0 ON':'X0 OFF',15,on?'#deefef':'#ebf4f9')+label(270,74,'COM',11)+label(310,130,'입력회로',13)+label(396,143,'X0',13);
    const schematicSensor=caseOutline(181,219,210,100);
    const thread=Array.from({length:4},(_,i)=>line('M'+(376+i*2)+' 249l-3 12','#9eacb6',1.2)+line('M'+(376+i*2)+' 299l-3 11','#9eacb6',1.2)).join('');
    body.push(selectable('supply',physical?psu:schematicSupply),selectable('plc',physical?plc:schematicPlc),selectable('sensor',(physical?shell+thread:schematicSensor)+sensorFace));
    const targetX=on?399:435;
    body.push(`<g data-target="${on?'near':'far'}">${rect(targetX,254,28,49,physical?'url(#metal)':'#78909f',3,'#bac8cd')}${label(targetX+14,324,'물체',12,'#fff','middle')}</g>`);
    if(['supply','plc','sensor','terminal','duct'].includes(pick)){
      const [x,y,w,h]={supply:[22,28,140,96],plc:[262,28,173,121],sensor:[180,218,213,103],terminal:[134,140,56,33],duct:[12,207,450,13]}[pick];
      body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="#edf4fa" stroke-width="2"/>`);
    }
    if(!cutaway){
      body.push(selectable('terminal',rect(136,144,51,26,'#60808a',3,'#aabac2')+label(144,142,'단자대',13)),
        label(68,244,'갈색',14,'#ffcc9d'),label(80,314,'청색',14,'#bcddff'),label(282,179,'흑색 OUT',13,'#f4fbff'));
      if(physical) body.push(label(12,203,'덕트',11,'#dbe7ec'));
    }
    const drawWire=(d,c,selected=false,powered=false)=>{
      const casing=selected?'#f1f3f5':powered?powerEdge:'#82939d';
      return line(d,casing,selected?10:7,selected?'data-wire-highlight':'')+line(d,c,4.5);
    };
    // The supply branch passes through the sensor electronics in either detection state.
    body.push('<g data-supply-leg="brown">'+drawWire(supplyBranch,copper,['brown','supply','terminal'].includes(pick),true)+'</g>',
      '<g data-supply-leg="blue">'+drawWire(supplyReturn,blue,pick==='blue',true)+'</g>');
    const crossovers={out:'M130 247q7 7 0 14M240 275q8 -8 16 0',return:'M112 261q-8 -7 0 -14M112 165q-8 -7 0 -14'};
    branches.forEach(b=>{
      const d=b.id==='switch'&&!on?'M337 275l-13 16':b.d;
      const selected=pick===b.group||(['terminal','plc'].includes(pick)&&b.id==='feed')||(pick==='supply'&&b.id==='feed');
      if(crossovers[b.id])body.push(line(crossovers[b.id],'#263c4b',11));
      body.push(`<g data-edge="${b.id}">${drawWire(d,b.color,selected,b.id==='return')}</g>`);
      if(b.id==='feed')body.push(drawWire('M64 121V158',copper,pick==='supply',true));
    });
    if(on){
      body.push('<g data-current="input" pointer-events="none">');
      for(const b of branches) {
        if(crossovers[b.id]){
          const jumps=crossovers[b.id];
          body.push(line(jumps,'#263c4b',11),drawWire(jumps,b.color,pick===b.group,b.id==='return'));
        }
        body.push(line(b.d,current,2.2,`data-flow="${b.id}"`));
      }
      for(const [x,y,r] of arrows) body.push(currentArrow(x,y,r));
      if(mode==='flow') body.push(line(branches[2].d,'#efffc1',2,'class="pulse" stroke-dasharray="3 13"'));
      body.push('</g>');
    }
    body.push(powerArrow(64,212,90),powerArrow(96,254,0),powerArrow(248,287,90),powerArrow(209,296,180),powerArrow(112,201,-90));
    for(const [x,y] of [[64,121],[112,121],[64,158],[150,158],[175,158],[268,80],[386,147],[337,275],[337,297],[262,296]])body.push(pin(x,y));
    if(cutaway){
      const areas=[[172,237,222,85],[220,255,110,34],[333,250,46,49]];
      const [x,y,w,h]=areas[stage];body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="#8ddce9" stroke-width="2" stroke-dasharray="4 3"/>`);
    }
    if(pick==='black')body.push('<circle cx="386" cy="147" r="8" fill="none" stroke="#fafafa" stroke-width="1.8" stroke-dasharray="4 2"/>');
    if(allowPick){
      const hit=(id,x,y,w,h)=>selectable(id,rect(x,y,w,h,'transparent'));
      body.push(hit('duct',12,204,440,18),hit('supply',25,30,135,94),hit('plc',265,30,168,118),hit('sensor',181,219,210,100),hit('terminal',135,140,52,31));
      if(wirePicking)body.push(selectable('black',line(branches[2].d,'transparent',15)),selectable('blue',line(branches[5].d,'transparent',13)),selectable('brown',line(supplyBranch,'transparent',13)));
    }
    const desc=`교육용 ${physical?'제어반 구성도':'회로도'}. 갈색 +24V와 청색 0V가 센서 전원을 유지한다. 녹색 PWR은 계속 점등. OUT과 X0 표시등은 감지할 때 함께 점등. COM은 +24V. 감지 ${on?'ON, X0에서 흑색선과 닫힌 NPN을 거쳐 0V로 입력 전류가 흐른다':'OFF, NPN이 열려 입력 경로가 끊기고 X0는 OFF다'}.`;
    return frame(desc,body.join(''),cutaway?'154 218 320 125':undefined);
  }
  function lamp(on){
    const loop='M112 119V83H207',contact=on?'M207 83H259':'M207 83l44 -31',rest='M259 83H367V142',back='M367 200V265H112V183';
    let s=rect(0,0,480,360,'#183246',0)+rect(0,0,480,360,'url(#grid)',0);
    [loop,contact,rest,back].forEach(d=>s+=line(d,on?current:'#c2d5df',5));
    s+=line('M112 119v21m-24 0h48m-37 13h26m-13 0v30','#eff7fb',4)+label(65,145,'+',20)+label(67,167,'−',20)+label(53,212,'배터리',17);
    s+=pin(207,83)+pin(259,83)+label(226,117,on?'스위치 닫힘':'스위치 열림',17,'#fff','middle');
    s+=`<circle cx="367" cy="171" r="29" fill="${on?'#fee286':'#2a4354'}" stroke="#e4ecf0" stroke-width="3"/>`+line('M349 152l36 38m0 -38l-36 38',on?'#9f6618':'#94a9b4',3)+label(367,236,on?'전구 ON':'전구 OFF',17,'#fff','middle');
    if(on)s+=line('M164 76l10 7 -10 7m109 168l-10 7 10 7',current,3,'data-current="lamp"');
    return frame(on?'스위치가 닫혀 전류가 흐르고 전구가 켜짐':'배터리 양단 전압은 유지되고 스위치가 열려 전구가 꺼짐',s);
  }
  // Three lenses on the same normally-open sensor. Selecting a lens never operates the switch.
  function guide(step, on) {
    const ink = '#173b50', muted = '#486575', teal = '#006b62';
    const word = (x,y,s,size=16,color=ink) => label(x,y,s,size,color,'middle');
    const box = (x,y,w,h,fill='#fff') => rect(x,y,w,h,fill,12,'#a9c6cd');
    const unit = (x,y,s) => rect(x-28,y-15,56,30,'#e0edef',8)+word(x,y+6,s,16);
    let diagram, description;
    if (step===1) {
      diagram = box(95,29,170,137)+word(128,57,'센서',18)+sensorLamps(168,50,on)+
        '<g data-power="sensor">'+rect(119,82,122,48,'#dbefea',8)+word(180,112,'내부 전원회로',16,teal)+'</g>'+
        line('M62 106H119','#a95e38',4)+line('M241 106H299','#307ca7',4)+
        powerArrow(83,106,0)+powerArrow(281,106,0)+unit(36,106,'+24V')+unit(325,106,'0V')+
        word(78,140,'갈색',15,muted)+word(282,140,'청색',15,muted);
      description='갈색 +24V에서 센서 내부 전원회로를 거쳐 청색 0V로 이어지는 전원 경로.';
    } else if (step===2) {
      const targetX=on?242:301;
      const blade=on?'M101 112H165':'M101 112L153 89';
      diagram=box(37,-19,192,157)+sensorLamps(77,-4,on)+word(118,59,'센서 내부',18)+
        line('M8 27H80',copper,4)+rect(80,15,76,24,'#deebdf',6)+word(118,32,'전원부',15,ink)+
        line('M156 27H192V112',blue,4)+word(20,16,'+24V',12)+powerArrow(60,27,0)+powerArrow(192,77,90)+
        word(120,80,'NPN 출력 스위치',15,muted)+
        rect(221,47,12,59,'#688f98',4)+rect(targetX,54,39,46,'#627887',6)+
        word(targetX+19,123,'물체',15,muted)+
        line('M74 159V112H101',black,4)+line('M165 112H192V159','#367ba6',4)+
        line(blade,ink,3,'data-guide-switch')+pin(101,112)+pin(165,112)+
        word(74,182,'흑색 OUT',16)+word(191,182,'청색 0V',16);
      description=on?'물체 감지. 센서 내부 NPN 스위치가 닫혀 흑색 출력과 0V가 연결됨.':'감지 해제. 센서 내부 NPN 스위치가 열려 흑색 출력과 0V 사이가 끊김.';
    } else {
      const segments=[
        ['feed','M61 61H104'],['load','M104 61H305'],['out','M305 61V149H246'],
        ['switch',on?'M246 149H184':'M246 149L195 133'],['emitter','M184 149H131'],['return','M131 149H61']
      ];
      const wires=segments.map(([id,d])=>line(d,({feed:copper,out:black,return:blue})[id]||muted,5.5,`data-guide-edge="${id}"`)).join('');
      const active=on?`<g data-current="input">${segments.map(([id,d])=>line(d,current,3,`data-guide-flow="${id}"`)).join('')}${[[80,61,0],[233,61,0],[305,99,90],[270,149,180],[99,149,180]].map(([x,y,r])=>currentArrow(x,y,r)).join('')}</g>`:'';
      diagram=box(88,12,239,73)+box(90,92,175,94)+
        word(189,34,'PLC 입력모듈',18)+lampDot('input',on,240,77,4.5)+word(209,126,'내부 NPN',15)+
        line('M68 61V106H95',copper,4)+rect(95,96,54,21,'#deebdf',5)+word(122,111,'전원부',13)+
        line('M149 106h8v24h-38v19',blue,4)+sensorLamps(113,173,on)+
        powerArrow(68,86,90)+powerArrow(135,130,180)+
        wires+active+pin(68,61)+pin(104,61)+pin(119,149)+pin(246,149)+pin(184,149)+
        unit(34,61,'+24V')+unit(34,149,'0V')+
        rect(142,47,85,28,'#def0ec',6)+word(184,66,'입력회로',15,teal)+
        word(104,80,'COM',14)+word(277,81,on?'X0 ON':'X0 OFF',15,on?teal:ink)+word(332,123,'흑색',14,muted)+
        word(193,201,on?'스위치 닫힘':'스위치 열림',14,muted);
      description=on?'입력 전류가 +24V, COM, 입력회로, X0, 흑색 출력, 닫힌 NPN, 0V 순서로 흘러 X0 ON.':'NPN이 열려 PLC 입력 경로가 끊긴 상태. 전류 화살표가 없고 X0 OFF.';
    }
    return frame(description,rect(0,-25,360,239,'#f1f7f7',0)+diagram,step===2?'0 -25 360 219':'0 0 360 209');
  }
  const ink='#193e50', mint='#006558';
  const note=(x,y,t,size=16,color=ink)=>label(x,y,t,size,color,'middle');

  function sensorInterior(stage,on=false) {
    const accent='#08776f', neutral='#a2b9be';
    const regions=[
      {x:36,w:82,name:'전원부',glyph:line('M40 107h14',copper,3)+rect(54,95,45,24,'#deebdf',5,'#8da99e')+note(77,111,'DC',14)+line('M99 107h15',blue,3)+powerArrow(47,107,0)+powerArrow(107,107,0)},
      {x:128,w:82,name:'감지부',glyph:line('M154 98q17 10 0 20m9 -25q24 15 0 30',ink,3)},
      {x:220,w:91,name:'NPN 출력',glyph:line(on?'M235 113h57':'M235 113h10l23 -14m5 14h19',ink,3)+pin(245,113)+pin(273,113)}
    ];
    let body=rect(0,0,360,192,'#eff6f5',0)+rect(16,30,321,132,'#fff',17,stage===0?accent:neutral)+
      rect(327,72,10,52,'#638e96',3)+note(112,59,'3선식 센서',19)+sensorLamps(212,52,on);
    for(const [i,r] of regions.entries()){
      const selected=stage===1?i<2:stage===2&&i===2;
      body+=`<g data-region="${i}" data-selected="${selected}">${rect(r.x,76,r.w,71,selected?'#ccede6':'#f0f4f4',8,selected?accent:neutral)}${r.glyph}${note(r.x+r.w/2,139,r.name,15)}</g>`;
    }
    if(stage===2){
      body+=line('M235 113h-7v51h-24v10',black,3)+line('M292 113h12v61','#367ba6',3)+
        note(204,189,'흑색 OUT',13)+note(304,189,'청색 0V',13);
    }
    if(stage===0)body+='<rect x="16" y="30" width="321" height="132" rx="17" fill="none" stroke="#08776f" stroke-width="3"/>';
    return frame(['한 센서의 외형과 내부 세 기능','같은 센서 내부의 전원부와 감지부 선택','센서 내부 NPN 출력 스위치 선택'][stage],body,'0 0 360 192');
  }

  function commonGroup(){
    const rows=[45,92,139];
    let body=rect(0,0,360,172,'#eff6f5',6)+note(54,75,'COM',18)+note(54,119,'+24V',16)+
      line('M29 92H112M112 45V139',copper,3);
    for(const [i,y] of rows.entries()){
      body+=`<g data-input-example="X${i}">${line('M112 '+y+'H136',copper,3)}${line('M232 '+y+'H271',ink,3)}${pin(112,y)}${rect(136,y-14,96,28,'#fff',6,'#9bbcbf')}${note(184,y+5,'입력회로',15)}${pin(271,y)}${note(302,y+6,'X'+i,18)}</g>`;
    }
    return frame('COM +24V에서 세 갈래로 나뉘어 각각의 입력회로를 거쳐 X0, X1, X2로 이어집니다.',body,'0 0 360 172');
  }

  function review(on,reveal=true) {
    const target=on?256:317;
    const blade=on?'M215 151V185':'M215 151l-15 26';
    const input=[
      ['feed','M42 54H83'],['load','M83 54H215'],['out','M215 54V151'],
      ['switch',blade],['emitter','M215 185V205H146'],['return','M146 205H42']
    ];
    let body=rect(0,0,360,239,'#eff6f5',0)+rect(76,15,170,72,'#fff',10,'#aac1c5')+
      note(148,39,'PLC 입력모듈',17)+lampDot('input',on,147,75,4.5)+rect(65,111,183,108,'#fff',13,'#8fafb6')+
      rect(241,128,8,62,'#62868f',3)+note(117,132,'3선식 센서',16)+
      `<g data-target="${on?'near':'far'}">${rect(target,137,32,43,'#637f8c',5)}${note(target+16,199,'물체',14)}</g>`;
    // Independent powered branch, including a load inside the device, to the shared return node.
    body+='<g data-power="sensor">'+line('M42 54V151H82',copper,4)+rect(82,141,54,20,'#ccede2',4,'#70a695')+
      note(109,156,'전원부',13,mint)+line('M136 151H146V205H42','#367ba6',4)+'</g>';
    body+=sensorLamps(82,193,on,false,81);
    for(const [id,d] of input){
      const wireColor={feed:copper,out:black,return:'#367ba6'}[id]||ink;
      body+=line(d,wireColor,['feed','return','out'].includes(id)?5.5:4,`data-review-edge="${id}"`);
    }
    if(on){
      body+='<g data-current="input">'+input.map(([id,d])=>line(d,current,2.7,`data-review-flow="${id}"`)).join('');
      for(const [x,y,r] of [[63,54,0],[215,99,90],[186,205,180],[83,205,180]]){
        body+=currentArrow(x,y,r);
      }
      body+='</g>';
    }
    body+=rect(104,44,65,21,'#daebe7',4)+note(136,60,'입력회로',13)+note(88,80,'COM',14)+
      note(181,80,on?'X0 ON':'X0 OFF',14)+note(237,104,'흑색',13)+note(25,41,'+24V',14)+
      note(25,227,'0V',15)+note(22,130,'갈색',13)+note(75,229,'청색',13);
    body+=powerArrow(42,99,90)+powerArrow(66,151,0)+powerArrow(146,180,90)+powerArrow(114,205,180);
    body+=pin(42,54)+pin(83,54)+pin(42,205)+pin(146,205)+pin(215,151)+pin(215,185);
    if(reveal)body+=note(192,234,on?'NPN 닫힘':'NPN 열림',14,mint);
    else body+=rect(171,141,62,49,'#e7eff0',5,'#aabfc1')+note(202,171,'출력부',14);
    const output=reveal?(on?'NPN 닫힘. X0 ON.':'NPN 열림. X0 OFF.'):'X0 OFF. 출력부는 응답 후 공개.';
    return frame('녹색 전원등은 켜져 있고 주황 출력등과 노란 입력등은 '+(on?'켜져':'꺼져')+' 있습니다. 물체가 '+(on?'가까이':'멀리')+' 있음. '+output,body,'0 0 360 239');
  }

  return {panel,lamp,guide,sensorInterior,commonGroup,review,indicators};
})();