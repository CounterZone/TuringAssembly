
class Link{
constructor(source,target){
  this.read={}; // [write,move]. here move=null/left/right/reset/{tape_name} write=string
  this.source=source;
  this.target=target;
}
set_link(read,write,move){
  this.read[read]=[write,move];
}

step(tape,c){
  this.source.parent.prev_link=this;
  var write=this.read[c][0];
  var move=this.read[c][1];
if(write!=null)tape.write(write);
if(move=="left")tape.moveleft();
else if(move=="right")tape.moveright();
else if(move=="reset")tape.moveto(0);
else if (move!=null){
  if (tape.tapes[move]==undefined)
  tape.add_tape(move);
  tape.switch(move);
}
}
get_view(container_width=400,bend=false){
    var l=document.createElementNS("http://www.w3.org/2000/svg","g");
    l.bend=bend;
    $(l).attr({"font-size":"10","fill":"gray"});

    l.source=this.source.parent.name+this.source.name;
    l.target=this.target.parent.name+this.target.name;
    if (l.source==l.target)l.direc=3.14;
    l.line=document.createElementNS("http://www.w3.org/2000/svg","path");
    l.appendChild(l.line);
    $(l.line).attr({"stroke-width":1.5,"fill":"transparent", "stroke":"gray","marker-end":"url(#sleep_arrow)"});
    l.line.id=l.source+'-'+l.target;
    var label=document.createElementNS("http://www.w3.org/2000/svg","textPath");
    label.setAttribute("href","#"+l.source+'-'+l.target)
    label.textContent='';
    for (var c in this.read){
    if (this.read.length>1 || c!="dflt")label.textContent+=c;
    if (this.read[c][0]!=null)label.textContent+=":"+this.read[c][0];
    if (this.read[c][1]!=null)label.textContent+=','+this.read[c][1];
    label.textContent+=";";
  }
  if (label.textContent.length>15)label.textContent=label.textContent.slice(0,12)+'...';// TODO

    var text=document.createElementNS("http://www.w3.org/2000/svg","text");
    $(text).attr({ "stroke-width":"0","font-family":"sans-serif"});
    $(label).attr({"baseline-shift":"20%","text-anchor":"middle","startOffset":"50%"})
    text.appendChild(label);
    l.appendChild(text);
    l.paint=function (curve_depth=0.2){
      if (l.direc!=undefined){
        var x1=l.source.x+l.source.radius*Math.sin(l.direc+0.52);
        var y1=l.source.y+l.source.radius*Math.cos(l.direc+0.52);
        var x2=l.source.x+l.source.radius*Math.sin(l.direc-0.52);
        var y2=l.source.y+l.source.radius*Math.cos(l.direc-0.52);
        var px1=l.source.x+l.source.radius*4*Math.sin(l.direc+0.52);
        var py1=l.source.y+l.source.radius*4*Math.cos(l.direc+0.52);
        var px2=l.source.x+l.source.radius*4*Math.sin(l.direc-0.52);
        var py2=l.source.y+l.source.radius*4*Math.cos(l.direc-0.52);
        l.line.setAttribute('d',['M',x1,y1,"C",px1,py1,px2,py2,x2,y2].join(' '));
      }
      else{
        var h=((l.source.y-l.target.y)**2+(l.source.x-l.target.x)**2)**0.5;
        var x1=l.source.x+l.source.radius/h*(l.target.x-l.source.x);
        var y1=l.source.y+l.source.radius/h*(l.target.y-l.source.y);
        var x2=l.target.x-(l.target.radius+5)/h*(l.target.x-l.source.x);
        var y2=l.target.y-(l.target.radius+5)/h*(l.target.y-l.source.y);
    if (l.bend){
          curve_depth*=h;
          var px=(x1+x2)/2-curve_depth*(y1-y2)/h;
          var py=(y1+y2)/2+curve_depth*(x1-x2)/h;
      l.line.setAttribute('d',['M',x1,y1,"Q",px,py,x2,y2].join(' '));
    }
    else l.line.setAttribute('d',['M',x1,y1,x2,y2].join(' '));
}
  }
l.activate=function(duration=100){
  $(l).animate({"font-size":"15","fill":"gray"},duration,"swing");
 return new Promise((resolve)=>{
      $(l.line).animate(
    {"stroke-width":3, "stroke":"black","marker-end":"url(#active_arrow)"}
    ,duration,"swing",
    ()=>{resolve("done")});
    });
}
l.deactivate=function(duration=100){
  $(l).animate({"font-size":"10","fill":"gray"},duration,"swing");
  $(l.line).animate({"stroke-width":1.5, "stroke":"gray","marker-end":"url(#sleep_arrow)"},duration,"swing");
}

  this.view=l;
    return l;
}
}
class State{
constructor(name,index){
  this.targets=new Set();
  this.name=name;
  this.parent={"name":"_"};
  this.index=index;
  this.state_type="State";
  this.links={'dflt':null}; // the key is "read", the value is a link object. dflt means default
}
set_link(target,write,move,read="dflt"){
  var link=new Link(this,target);
    if (typeof(read)=="string"){
      link.set_link(read,write,move);
      this.links[read]= link;
    }
    else for (var i of read){
    link.set_link(i,write,move);
      this.links[i]= link;
    }
return link;
}

step(tape){
    var c=tape.read();
    if (this.links[c]==undefined)c='dflt';
    if(this.links[c]==null)
    return null;
    else{
    this.links[c].step(tape,c);
    return this.links[c].target;
  }
}


rename(name){
  this.name=name;
  if (this.parent.name!="_"){
  this.parent.register(this);
}
}

get_view(radius=15){
  var g=document.createElementNS("http://www.w3.org/2000/svg","g");
  $(g).attr({"id":this.parent.name+this.name,"statetype":this.state_type,"stroke":"black","stroke-width":"1"});
  var textbox=document.createElementNS("http://www.w3.org/2000/svg","text");
  g.text=textbox;
  g.radius=radius;
  $(textbox).attr({"dominant-baseline":"middle","text-anchor":"middle","fill":"black" , "stroke-width":"0","font-size":"10","font-family":"sans-serif","font-weight":"bold"});
  if (this.state_type=="State")if (this.name=="_st" || this.name=="_acc"){
    g.setAttribute("fill","white");
    radius*=1.3;
    var c1=document.createElementNS("http://www.w3.org/2000/svg","circle");
    c1.setAttribute("r",radius.toString());
    g.appendChild(c1);
    var c2=document.createElementNS("http://www.w3.org/2000/svg","circle");

    c2.setAttribute("r",(radius-3).toString());
    g.appendChild(c2);
  }
else{g.setAttribute("fill","white");
  var c1=document.createElementNS("http://www.w3.org/2000/svg","circle");
  c1.setAttribute("r",radius.toString());c1.setAttribute("stroke-width","3");g.appendChild(c1);
}
if (this.name.length>5){
textbox.textContent=this.name.slice(0,3)+"..";
}
else {
  textbox.textContent=this.name;

}
g.appendChild(textbox);
$(g).on("click",function(d){ });

return g;
}
}


class Automaton extends State {
  constructor(name,index){
    super(name,index);
    this.state_type="Automaton"
    this.Start=new State('_st',index);
    this.current_state=this.Start;
    this.prev_link=null;
    this.Accepted=new State('_acc',null);
    this.states={};
    this.register(this.Start);
    this.register(this.Accepted);
  }
  get_view(){
    var g=super.get_view();
    var c1=document.createElementNS("http://www.w3.org/2000/svg","polygon");
    var c2=document.createElementNS("http://www.w3.org/2000/svg","polygon");
   c1.setAttribute("points","15,15 15,-15  -15,-15 -15,15 ");
  g.appendChild(c1);
  g.setAttribute("fill","white");
   c2.setAttribute("points","13,13 13,-13  -13,-13 -13,13 ");
  g.appendChild(c2);
  g.text.textContent=this.name;
  g.appendChild(g.text);
    return g;
  }
  register(state){
    this.states[state.name]=state;
    state.parent=this;
  }
  find_state(name){
    return this.states[name];
  }

reset(){
  this.current_state=this.Start;
  this.prev_link=null;
}
 step(tape){
this.current_state=this.current_state.step(tape);
if  (this.current_state==this.Accepted){this.reset();
   return super.step(tape);}
else if (this.current_state==null) {return null;}
else if (this.name!="_main" && this.current_state.state_type=="Automaton" )
{
  var p= this.current_state;this.reset();return p;}
else{return this;}
}

}





class Automaton_view{
  constructor(A,container_width=500){
    this.automaton=A;
    this.prev=null;
    this.state_panel=document.createElementNS("http://www.w3.org/2000/svg","svg");
    this.state_panel.setAttribute("class","state_panel");
    this.state_panel.setAttribute("width",container_width.toString());
    this.state_panel.setAttribute("height",container_width.toString());
    this.state_panel.innerHTML=` <defs>
          <marker id="sleep_arrow" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6"
              orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="gray"/>
          </marker>
          <marker id="active_arrow" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="6" markerHeight="6"
              orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
    </defs>`;
this.force_simulator=d3.forceSimulation();
this.nodes=[];
this.links=[];

for (var i in this.automaton.states){
var  node=this.automaton.states[i].get_view();
this.nodes[this.automaton.states[i].name]=node;
node.x=Math.random()*200+100;
node.y=Math.random()*200+100;
this.state_panel.appendChild(node);
}
var self=this;
for (var i in this.automaton.states){
  for (var l in this.automaton.states[i].links){
    if (this.automaton.states[i].links[l]!=null){
    this.links.push(this.automaton.states[i].links[l].get_view(container_width,
    this.automaton.states[i].links[l].target.targets.has(this.automaton.states[i])));}
    this.state_panel.appendChild(this.links[this.links.length-1]);

  }
}
this.nodes["_st"].fx=25;
this.nodes["_st"].fy=25;
this.active_state=this.nodes["_st"];
this.nodes["_acc"].fx=container_width-25;
this.nodes["_acc"].fy=container_width-25;

d3.selectAll(Object.values(this.nodes)).call(
d3.drag().on("start", ()=>{this.force_simulator.alphaTarget(0.7).restart();})
.on("drag", function (){
this.fx=d3.event.x;
this.fy=d3.event.y;
})
.on("end", ()=>{this.force_simulator.alphaTarget(0.7).restart();})
);

this.force_simulator.nodes(Object.values(this.nodes));

this.force_simulator.force("link", d3.forceLink(this.links).id((n)=>{return n.id;}).distance(70));
this.force_simulator.force("collition", d3.forceCollide(35));
function draw(){
for (var n in self.nodes){
  self.nodes[n].x=Math.max(Math.min(self.nodes[n].x,container_width-30),30);self.nodes[n].y=Math.max(Math.min(self.nodes[n].y,container_width-30),30);
  self.nodes[n].setAttribute("transform","translate("+self.nodes[n].x+","+self.nodes[n].y+")");
}
for (var i =0;i<self.links.length;i+=1)
self.links[i].paint();
}
var myVar = setInterval(draw, 50);

}

async step(duration=100){
  if (this.active_state!=null)
    this.active_state.setAttribute("stroke","black");
  if (this.active_link!=null)
    this.active_link.view.deactivate(duration);
  this.active_state=this.nodes[this.automaton.current_state.name];
  this.active_link=this.automaton.prev_link;
  this.active_state.setAttribute("stroke","red");
  if (this.active_link!=null)await this.active_link.view.activate(duration);
}


link_to(container){
  container.appendChild(this.state_panel);
}
remove_from(container){
  container.removeChild(this.state_panel);
}
}
