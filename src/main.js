

c=new Controller();
c.load_script(`

init $110$1111$
automaton binary_add
    // input: ($) num1 $ num2 $
    // output [space] ($)sum $
    // () marks the position of the head
  move right
  n1l:
    jump n1l.$ if $
    move right
    jump n1l
  n1l.$:
    write \\s
    move left
    jump n1l.0 if 0
    jump n1l.1 if 1
  n1l.0:
    write $
    move right
    jump n2l.0
  n1l.1:
    write $
    move right
    jump n2l.1
  n2l.0:
    jump n2l.0$ if $
    jump n2l.0$ if O
    jump n2l.0$ if I
    move right
    jump n2l.0
  n2l.0$:
    move left
    jump n2l.0$0 if 0
    jump n2l.0$1 if 1
    jump n2l.0$0 if \\s
  n2l.0$0:
    write O
    jump restart
  n2l.0$1:
    write I
    jump restart
  n2l.1:
    jump n2l.1$ if $
    jump n2l.1$ if O
    jump n2l.1$ if I
    move right
    jump n2l.1
  n2l.1$:
    move left
    jump n2l.1$0 if 0
    jump n2l.1$1 if 1
    jump n2l.1$0 if \\s
  n2l.1$0:
    write I
    jump restart
  n2l.1$1:
    write O
    move left
    jump inc
  inc:
    jump inc.1 if 1
    jump inc.0 if 0
    jump inc.0 if \\s
  inc.0:
    write 1
    jump restart
  inc.1:
    write 0
    move left
    jump inc
  restart: jump restart.$ if $
    move left
    jump restart
  restart.$: move left
    jump ed if $
    move right
    jump n1l.$
  ed:write \\s
  move right
  write \\s
  move right
  ed2:jump ed3 if $
    move right
    jump ed2
  ed3:
    jump ed3.a if \\s
    jump ed3.1 if I
    jump ed3.0 if O
    move left
    jump ed3
  ed3.1: write 1
  jump ed3
  ed3.0: write 0
  jump ed3
  ed3.a:
  write
  write $
end

call binary_add

  `)
