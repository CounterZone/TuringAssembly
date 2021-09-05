class Controller{
  constructor(editor_container="editor_container"){
    this.Automatons={};
    this.Automaton_panel=document.getElementById("automaton_panel");
    this._main=null;
    this.views={};
    this.library={};
    this.labels={};
    this.current_src="_main";
    this.init="";
    this.current_view=null;
    this.paused=false;
    this.step_time=100;
    document.getElementById("editor_container").appendChild(editor);
    this.tape=new Tape_view();
    this.tape.link_to(document.getElementById("tape_container"));
    this.state_container=document.getElementById("state_container");
    this.sh=document.getElementById("sh");
    this.library_panel=document.getElementById("library_panel");
    window.addEventListener('beforeunload',(event)=>{this.save();});
  ace.define('test', [], function(require, exports, module) {
  var oop = require("ace/lib/oop");
  var TextMode = require("ace/mode/text").Mode;
  var test_rules = require("test_rules").test_rules;

  var Mode = function() {
      this.HighlightRules = test_rules;
  };
  oop.inherits(Mode, TextMode);
  exports.Mode = Mode;
  });


  ace.define('test_rules', [], function(require, exports, module) {
  var oop = require("ace/lib/oop");
  var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
  var test_rules = function() {
      var keywordMapper = this.createKeywordMapper({
          "constant.numeric":
              "move|call|reset|write|jump|accept|reject|if",
          "keyword":"automaton|end|init"
      }, "text", true);
      this.$rules = {
          "start": [
              {
                  token: "comment",
                  regex: "//.*"
              },
              {
                  regex:"left|right",
                  token: "constant.language"
              },
              {
                  regex:"\\w+\\b",
                  token: keywordMapper
              },

          ]
      };
      this.normalizeRules();
  };
  oop.inherits(test_rules, TextHighlightRules);
  exports.test_rules = test_rules;
  });
  this.editor=ace.edit("editor");
  this.editor.resize();
  this.editor.session.setMode("test");
  this.editor.setTheme("ace/theme/chrome");
this.load();
  $("#Parse").click(()=>{
    this.clear();
    try{
      if (this.current_src!="+")
      {this.library[this.current_src]=this.editor.getValue();
        var name=this.parse().name;

       if (name!=this.current_src){
         this.library[name]=this.library[this.current_src];
         this.labels[name]=this.labels[this.current_src];
         this.labels[name].textContent=name;
         this.labels[name].onclick=()=>{this.open(name);}
         delete this.library[this.current_src];
         delete this.labels[this.current_src];
         this.current_src=name;
       };
      }
      else{
        var name=this.parse(this.editor.getValue()).name;
        if(this.library[name]!=undefined)throw "Automaton "+ "'" +name +"'"+" already exists.";
        this.library[name]=this.editor.getValue();
        var label=document.createElement("option");
        label.textContent=name;
        this.library_panel.insertBefore(label,this.labels["+"]);
        label.onclick=()=>{this.open(name);}
        this.library["+"]="automaton new_a\nend\n";
      }
  }
    catch(e){this.log("Syntax error.");this.log(e);throw(e);}
    this.get_view("_main");
    this.open_view ("_main");
  });

  $("#Run").click(()=>{
    this.resume();
  });
  $("#Reset").click(()=>{
    this.reset();
  });
  $("#Step").click(async ()=>{
    if (!this.paused)return;
    else   try{
    await this.step();
    }catch(e){
    this.log(e);
    }
  });
  $("#Pause").click(()=>{
    this.pause();
  });
  $("#End").click(()=>{
    this.run_end();
  });
  $("#Delete").click(()=>{
    delete this.library[this.current_src];
    delete this.labels[this.current_src];
  });

  }
  async load(){
    var self=this;
    function add(name,src){
      if (src!=null)self.library[name]=src;
      var label=document.createElement("option");
      self.library_panel.appendChild(label);
      label.onclick=()=>{self.open(name);}
      label.textContent=name;
      self.labels[name]=label;
      return label;
    }

    if(typeof(Storage)!=undefined && window.localStorage.getItem("TuringAssembly.library")!=undefined){
      this.library=$.parseJSON( window.localStorage.getItem("TuringAssembly.library"));
      add("_main",this.library["_main"]).setAttribute("selected",true);
      for (var i in this.library)if (i!="_main" && i!="+")add(i,null);
      add("+",this.library["+"]);

    }
    else{
      add("_main","").setAttribute("selected",true);
    await $.getJSON("https://counterzone.github.io/TuringAssembly/src/builtin.json","",(data)=>{
    $.each(data,(key,value)=>{add(key,value);});
  });
  add("+","automaton new_a\nend\n");
}
this.editor.setValue(this.library["_main"],-1);
  }
open(name){
if (name!=this.current_src){
this.library[this.current_src]=this.editor.getValue();
this.editor.setValue(this.library[name],-1);
this.current_src=name;
}

}
save(){
  this.library[this.current_src]=this.editor.getValue();
  if(typeof(Storage)!=undefined){
    window.localStorage.setItem("TuringAssembly.library",JSON.stringify(this.library));
  }
}
  parse(src=this.library[this.current_src],main=(this.current_src=="_main"),parse_main=true){
    //parse_main: if true,parse main first

    var self=this;
    var str=[""].concat(src.split("\n"));
    var index=0;
    function get_token(){
    const tokens=new Set(["","move","automaton","switch","end","call","reset","write","jump","accept","reject","init"]);
    var token=str[index];
    while(token!=undefined && token.match(/^[ \t]*([/][/].*)?$/)){ // jump empty lines
      index+=1;
      token=str[index];
    }
    if (token==undefined)return null;
    var label=token.trim().split(':');
    if(label[1]!=undefined){
    token=label[1];
    label=label[0];
  }else{label="";}
    token=token.trim().split(/[ ,]+/);
    if(tokens.has(token[0].toLowerCase())){
      token[0]=token[0].toLowerCase();
      if (label!="")token=["#"+label].concat(token);
  for (var i in token)if (token[i]=="\\s")token[i]=" ";
      return token;
    }
    else throw  "line "+index +": Unexpected token "+"'"+token[0]+"'";
  }


    function get_state(state,parent){ // modify the "state" with the token stream. return a blank "next_state"
        var token=get_token();
        if (token[0][0]=="#"){var name=token[0].slice(1,token[0].length);token=token.slice(1,token.length)}
        else var name='_'+index;
        var next_state=new State(null,null);
        state.name=name;
        state.index=index;
        var [write,move]=[null,null];
        var moved=false;
        while(token !=null &&["","move","write","reset","jump","accept","reject"].includes(token[0])){
          if (token[0]==""){}else if (token[0]=="move"){
              if (move==null)
              move=token[1];
              else break;
            }
            else if (token[0]=="write"){
              if (write==null && move==null)
              write=token[1];
              else break;
        }
        else if (token[0]=="reset"){
          if (move==null)
          {move="reset";index+=1;}
          break;
        }else{
          var read=1,target;
            if (token[0]=="jump"){
              target=token[1];
              read=2;
            }
            else if (token[0]=="accept")target="_pop";
            else if (token[0]=="reject")target=null;
          if (token[read]!=undefined &&token[read].match(/if/gi)){
          if (move!=null)break;
          read=token[1+read];
          state.set_link(target,write,move,read);
          }else{
          state.set_link(target,write,move);
          index+=1;
          break;
          }
        }
        index+=1;
        token=get_token();
        }
        parent.register(state);
        if(state.links["dflt"]==null){next_state.prev_link=state.set_link(next_state,write,move);}
        return next_state;
  }
    function get_automaton(main=false,parent=self._main){
      function find_a(A,name){
        while(A.states!=undefined){
          if (A.states[name]!=undefined)
          return A.states[name];
          A=A.parent;
        }
        if(self.library[token[1]]==undefined)throw "line "+index +": Undefined automaton "+"'"+token[1]+"'";
        else{var h=self.parse(self.library[token[1]],false,false);
          self._main.register(h);
          return h;
        }
      }
      var token=get_token();
      if (!main){
      if (token==null || token[0]!="automaton") throw "line "+index +": Not an automaton.";
      var A=new Automaton(token[1],index);
      parent.register(A);
      parent.Start.set_link(A," ","left","#"+A.index);
      index+=1;
      }else{
        var A=new Automaton("_main",0);
        self._main=A;
        parent=A;
      }
      var current_state=new State(null,null);
      A.Start.set_link(current_state,null,"main");
      A.Start.set_link(A.Start," ","left","#"+A.index);
      token=get_token();
      if (token!=null && token[0][0]=="#"){var name=token[0].slice(1,token[0].length);token=token.slice(1,token.length);}
      while(token != null && token[0]!="end"){
           if (["","move","write","reset","accept","jump","reject"].includes(token[0]))
                current_state=get_state(current_state,A);
           else if (token[0]=="call"){
             var call_A=find_a(A,token[1]);

             A.states[call_A.name]=call_A;
             current_state.index=index;
             if (name!=null)current_state.name=name;
             else current_state.name='_'+index;
             A.register(current_state);
             var push1=new State(current_state.name+".p1",index);
             var push2=new State(current_state.name+".p2",index);
             current_state.set_link(push1,null,"stack");
             A.register(push1);
             A.register(push2);
             push1.set_link(push2,"#"+index,"right");
             push2.set_link(call_A,"#"+A.index,"right");

             current_state=new State(null,null);
             A.Start.set_link(current_state," ","main","#"+index);
             index+=1;
           }
           else if (token[0]=="automaton")get_automaton(false,A);
           else  throw "line "+index +": Unexpected token "+"'"+token[0]+"'";
           name=null;
           token=get_token();
           if (token!=null && token[0][0]=="#"){name=token[0].slice(1,token[0].length);token=token.slice(1,token.length);}
         }
         if (token==null && !main){
           throw "line "+A.index +": Unclosed automaton "+"'"+A.name+"'";
         }
         else if (main && token!=null && token[0]=="end"){
           throw "line "+index +": Unexpected token: 'end'";
         }
         if (name!=null){
           var next_state=new State(null,index);
           current_state.name=name;current_state.index=index;
           current_state.set_link(next_state,null,null);
           A.register(current_state);
           current_state=next_state;
         }

         current_state.rename("_pop");
         current_state.set_link(A.Accepted,null,"stack");
         A.Accepted.index=index;
         A.register(current_state);
         for(var s in A.states){
           for (var l in A.states[s].links){
              if (A.states[s].links[l]!=null && typeof(A.states[s].links[l].target)=="string"){
                  if (A.states[A.states[s].links[l].target]==undefined){
                    throw "line "+A.states[s].index+": Undefined label "+"'"+A.states[s].links[l].target+"'";}
                  A.states[s].links[l].target=A.states[A.states[s].links[l].target];
                }
              if (A.states[s].links[l]!=null)  A.states[s].targets.add(A.states[s].links[l].target);
              }
            }
         if (main){
           A.set_link("Accepted",null,null);
       }else{
         A.set_link(parent.Start,null,"left");
         index+=1;
       }
       self.register(A);
       return A;
     }
     function get_init(){
       var token=get_token();
       if (token!=null && token[0]=="init"){
         self.init_tape(token[1]);
         index+=1;
       }
     }
  if(main){
    get_init();
    get_automaton(true);
    this.log("Parsed successfully!");
    return this._main;
  }
    else{
    if (parse_main){
    this.parse(this.library["_main"],true);
    if (this._main.states[this.current_src]==undefined)
    return  get_automaton(false);
    else return this._main.states[this.current_src];
  }
    else return get_automaton(false);

    }


}
log(e){
    this.sh.textContent+=e+'\n';
    this.sh.scrollTop = this.sh.scrollHeight;
}
clear(){
  this.sh.textContent ="";
  this.Automaton_panel.innerHTML="";
  this.Automatons={};
  this.views={};
  this.close_view();
  this.current_view=null;
  this._main=null;
  this.reset();

}
init_tape(s=this.init){
  this.init=s;
  this.tape.set_tape("main",s);
}
register(A){
  if (this.Automatons[A.name]==undefined){
  this.Automatons[A.name]=A;
  var label=document.createElement("label");
  var input=document.createElement("input");
  $(label).addClass("btn btn-secondary btn-sm");
  $(input).attr({"type":"radio","name":"options","id":A.name})
  label.textContent=A.name;
  label.appendChild(input);
  $(label).click(()=>{this.open_view(A.name);});
  this.Automaton_panel.appendChild(label);
}
}

  get_view(name){
    this.views[name]=new Automaton_view(this.Automatons[name]);
  }
  open_view(name){
this.close_view();
if (this.views[name]==undefined)this.get_view(name);
    this.views[name].link_to(this.state_container);
    this.current_view=this.views[name];
    this.current_view.step(0);
  }
  close_view(){
    if (this.current_view!=null)this.current_view.remove_from(this.state_container);
  }
  async run(){
    while (this.paused==false)try{
    await this.step();
  }
  catch(err){
    this.log(err);
  return err;
}
  }
async step(){
  if (this._main==null)throw "No automaton found.";
  try{
    var p=this._main.step(this.tape);
    if (p==null)throw "Rejected!";
    else if (p=="Accepted")throw "Accepted!";
  }
  catch(err){
    throw err;
  }finally{
  await this.current_view.step(this.step_time);
  await this.tape.move_selector(this.step_time);
}


}

async reset(){
this.pause();
this.tape.reset();
this.init_tape();
this.tape.set_tape("stack","");

for (var i in this.Automatons)
  this.Automatons[i].reset();
this.tape._draw_selectors();
await this.tape.move_selector();

if (this.current_view!=null)await this.current_view.step(this.step_time);
}
async run_end(){
this.pause();
  var count=0;
  const max_count=10000;
  try{
    while(count<max_count){
    count+=1;
    if (this._main==null)throw "No automaton found.";
    var p=this._main.step(this.tape);
    if (p==null)throw "Rejected!";
    else if (p=="Accepted")throw "Accepted!";
  }throw "Maximum iterations exceeded.";
}
  catch(err){
    this.log(err);
    return err;
  }
finally{
   await this.tape.move_selector(this.step_time);
   this.current_view.step(this.step_time);
   this.tape._draw_selectors();
}
}
  pause(){
    this.paused=true;
  }
  resume(){
    this.paused=false;
    this.run();
  }

}
