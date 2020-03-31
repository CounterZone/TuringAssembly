// Require jquery

class Tape{

constructor(){
  this.tapes={};
  this.head={};
  this.current_tape=null;
}
  moveleft(){
    this.head[this.current_tape]-=1;
    if (this.head[this.current_tape]<0)this.head[this.current_tape]=0;
  }
  moveright(){
    this.head[this.current_tape]+=1;
  }
  moveto(n){
    this.head[this.current_tape]=n;
  }
  read(){
    if(this.tapes[this.current_tape][this.head[this.current_tape]]==undefined){return ' ';} // default : space
    else{return this.tapes[this.current_tape][this.head[this.current_tape]]};
  }
  write(char){
    this.tapes[this.current_tape][this.head[this.current_tape]]=char;
  }
  switch(t){
    this.current_tape=t;
  }
  add_tape(name){
    this.tapes[name]=[];
    this.head[name]=0;
  }
  set_tape(name,string){
    this.tapes[name]=string.split('');
  }
  reset(){
    for (var i in this.head)this.head[i]=0;
  }
}


class Tape_view extends Tape{
  constructor(){
    super();
    this.tape_panel=document.createElement("div");
    this.tape_panel.className="tapepanel";
    this.tape_views={};
    this.selectors={};
    this.cells={};
    this.add_tape('main');
    this.add_tape('stack');
    this.switch('main');
    this.paused=false;
  }
  link_to(container){
    container.appendChild(this.tape_panel);
    this._draw_selectors();
  }
  _draw_selectors(){
    for (var i in this.selectors){
      while(this.cells[i].length<5+this.head[i])
          this.add_cell(i);
      this.selectors[i].style.top=(this.cells[i][0].offsetTop+this.tape_views[i].offsetTop-2)+'px';
      this.selectors[i].style.left=(this.cells[i][this.head[i]].offsetLeft-2)+'px';
      this.selectors[i].style.width=($(this.cells[i][this.head[i]]).width()+5)+"px";
      this.selectors[i].style.height=($(this.cells[i][this.head[i]]).height()+4)+"px";
    }
  }

  add_cell(tape,char=' '){
    var cell=document.createElement("div");
    cell.className="tapecell";
    this.tape_views[tape].appendChild(cell);
    cell.id=tape+'_'+this.cells[tape].length;
    cell.textContent=char;
    this.cells[tape][this.cells[tape].length]=cell;
  }
  add_tape(tape_name){
    super.add_tape(tape_name);
    var selector=document.createElement("div");
    selector.className="select_cell";
    selector.textContent=" "
    this.selectors[tape_name]=selector;
    this.tape_panel.appendChild(selector);
    this.tape_views[tape_name]=document.createElement("div");
    this.tape_views[tape_name].id='tape_'+tape_name;
    var name_panel=document.createElement("div");
    name_panel.className="tapename";
    this.tape_views[tape_name].className="single_tape";
    this.tape_views[tape_name].appendChild(name_panel);
    name_panel.textContent=tape_name;
    this.cells[tape_name]=[];
    this.tape_panel.appendChild(this.tape_views[tape_name]);
    for (var i=0;i<28;i+=1){
      this.add_cell(tape_name,'');
    }
    this._draw_selectors();
  }
set_tape(tape,str){
  super.set_tape(tape,str);
  while(this.cells[tape].length<5+this.tapes[tape].length){
      this.add_cell(tape);
  }
  for (var i=0;i<this.tapes[tape].length;i+=1){
  this.cells[tape][i].textContent=this.tapes[tape][i];
  }
  for (var i=this.tapes[tape].length;i<this.cells[tape].length;i+=1){
  this.cells[tape][i].textContent=" ";
  }
  this._draw_selectors();
}
switch(t){
  if (this.current_tape!=null)
  this.selectors[this.current_tape].style.borderColor='black';
  super.switch(t);
  this.selectors[this.current_tape].style.borderColor='red';

}

 move_selector(duration=100){
  while(this.cells[this.current_tape].length<5+this.head[this.current_tape]){
      this.add_cell(this.current_tape);
  }
  var selector=this.selectors[this.current_tape];
  return new Promise((resolve)=>{
    $(selector).animate(
  {left:(this.cells[this.current_tape][this.head[this.current_tape]].offsetLeft-2)+'px',width:$(this.cells[this.current_tape][this.head[this.current_tape]]).width()+5}
  ,duration,"swing",
  ()=>{resolve("done")});
  });

}
write(char){
  super.write(char);
this.cells[this.current_tape][this.head[this.current_tape]].textContent=char;
this._draw_selectors();
}


}
