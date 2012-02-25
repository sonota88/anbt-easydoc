// anbt-easydoc.js

/* Template

<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <link  href="prettify.css" type="text/css" rel="stylesheet">
  <script src="prettify.js" type="text/javascript"></script>
  <script src="anbt-easydoc.js" type="text/javascript"></script>
  <style><!-- * { line-height: 150%; } body { padding: 2ex 5%; } --></style>
</head>
<body onload="prettyPrint()">

<pre name="article">
title:
by:
date:
</pre><!--/article-->

</body>
</html>

*/

/* Markup example:

= Heading / 見出し

= h1
== h2
=== h3
==== h4
===== h5
====== h6

= Preformatted text / 整形済みテキスト

  function func(){
    alert(bar);
  }

= Horizontal rule / 水平線

----

= URL

http://google.com/

= Image / 画像

img: image/foo.png

= Blockquote / ブロック引用

q{
quoted paragraph etc.
引用する段落など
}q

= インライン要素

foo *b* bar. // bold
foo _em_ bar. // emphasis
foo +tt+ bar. // teletype

*/

var easyLog = function (){

  function Stack(){
    var stack = [];
    this.push = function(value){ stack.push(value); };
    this.pop = function(){ return stack.pop(); };
    this.last = function(){ return stack[stack.length - 1]; };
    this.length = function(){ return stack.length; };
    this.at = function(n){ return stack[n]; };
  }

  

function Elem(type, content){
  this.type = type;
  this.list = [];
  this.content = content;
}
Elem.prototype = {
  toHtml: function(){
    if( ! this.type ){
      return this.content ? procInline(this.content) : "";
    }

    var attr = "";
    if(this.attr){
      for(var k in this.attr){
        var v = this.attr[k];
        attr += " " + k + "='" + v + "'";
      }
    }

    return "<" + this.type + " "
      + attr
      + " >"
      + this.content
      + "</" + this.type + ">";
  }
};


function isundef(it){
  return typeof it === "undefined";
}


function makeTOC(outline){
  if(typeof outline.children === "undefined"
     || outline === null
     || typeof outline === "string"
    ){
    return "";
  }
  
  var src = "";
  if( ! isundef(outline.title) && outline.title != null ){
    var anchor = "#heading" + outline.index;
    var link = '<a href="' + anchor + '">' + outline.title + '</a>';
    src += "<li>" + link + "</li>\n";
  }


  var kids = outline.children;
  src += "<ul>";
  for(var a=0; a<kids.length; a++){
    var kid = kids[a];
    if(typeof kid === "string"){ continue; }

    var temp = makeTOC(kid);
     if(temp.length > 0){
       src += temp;
     }
  }
  src += "</ul>";

  return src;
}


function makeEMIndex(formatted){
  // Index of emphatic text
  var emReference = "";
  var emphasis = xtag(formatted, "em");
  var emRefElem = null;
  if(emphasis.length > 0){
    for(var a=0;a<emphasis.length; a++){
      var id = "emphasis_" + a;
      emphasis[a].id = id;
      emReference += '<li><a href="#' + id + '">' + emphasis[a].innerHTML + '</a></li>\n';
    }
    emReference = "<ul>" + emReference + "</ul>";
    emReference = "<h1>Index of emphatic texts</h1>" + emReference;

    emRefElem = createElement(
      null, "div"
      , { id: "emphasis_index" }, {}
      , emReference
    );

    // add to TOC
    var temp = createElement(
      document.getElementById("toc").childNodes[0]
      , "li", {}, {}
      , '<a href="#emphasis_index">Index of emphatic texts</a>'
    );
  }
  
  return emRefElem;
}


  ////////////////////////////////
  // utils

  
  function puts(){ console.log(arguments); }


  function xtag( elem, tagName ){
    return elem.getElementsByTagName( tagName );
  }


  function createElement(parent, tagName, attributes, styles, innerHTML){
    var e = document.createElement(tagName);

    if(attributes){
      for(var key in attributes){
        e.setAttribute(key, attributes[key]); }}
    if(styles){
      for(var key in styles){
        e.style[key] = styles[key]; }}
    if(innerHTML){
      e.innerHTML = innerHTML; }
    if(parent){
      parent.appendChild(e); }

    return e;
  }


  function insertAsFirstChild(parent, child){
    parent.insertBefore(child, parent.firstChild);
  }


  function applyCSSRules(rules){
    var headElement = xtag(document, "head")[0];
    var styleElement = document.createElement("style");
    styleElement.type = "text/css";
    headElement.appendChild(styleElement);

    var sheet = styleElement.sheet;
    for(var selector in rules){
      sheet.insertRule(selector + "{" + rules[selector] + "}", sheet.cssRules.length);
    }
  }


  function unshift(first, arr){
    var x = [ first ];
    for(var a=0; a<arr.length; a++){
      x.push(arr[a]);
    }
    return x;
  }


  function strip(str){
    return str.replace( /^[\s\t\n\r\n]+/, "" ).replace( /[\s\t\r\n]+$/, "" );
  }

  ////////////////////////////////


  function applyDefaultCSS(){
    applyCSSRules({
         "*": "line-height: 150%; -moz-border-radius: 3px;"
         , body: "padding: 0; padding-top: 0; margin-top: 0;"
         , "#document_title": "font-size: 150%; font-weight: bold; \
             background-color: #068; color: #fff; \
             margin: 0; margin-bottom: 1ex; padding: 2ex; text-align: center;"
         , "#main_box": "margin: 0 0 0 20%;"
         , "#formatted_body": "margin: 0;"
         , h1: "font-size: 140%; \
             background-color: #444; color: #fff;  padding: 1ex 2ex;"
         , h2: "font-size: 130%; background-color: #ddd; \
             border: solid 1px #aaa;  padding: 1ex;"
         , h3: "font-size: 120%; background-color: #eee;  padding: 1ex;  border: solid 1px #bbb;"
         , h4: "font-size: 110%; border: solid #a00; border-width: 0 0 1px 1ex  ;"
         , h5: "font-size: 105%; border: solid #a00; border-width: 0 0 0   1ex  ;"
         , h6: "font-size: 100%; border: solid #6a0; border-width: 0 0 0   0.5ex;"
         , "#toc": "font-size: 75%; position: fixed; \
             top: 0;left: 0; width: 18%; height: 100%; \
             background-color: #f8f8f8; border: solid 1px #ddd; overflow: auto; padding: 1%;"
         , "#toc ul": "padding-left: 2ex;"
         , "pre.indentBlock": "margin: 1ex 0 1ex 0;  padding: 0.5ex; \
              background-color: #f8fafa;  border: solid 1px #e0e8e8; line-height: 120%; \
              font-size: 90%;"
         , "pre.ul": "margin: 1ex 0 1ex 0;  padding: 0.5ex; \
              background-color: #fafafa;  border: none; line-height: 160%; \
              font-size: 90%;"
         , blockquote: "border: solid 2px #d80; padding: 0 1ex;"
         , "div.box":    "border: solid 1px #888; padding: 0 1ex;"
         , "div.outline": "margin: 0 0 0 2ex; padding: 0 0 0 0ex;"
         , "#formatted_body > div.outline": "margin-left: 0;"
         , "#toc a": "text-decoration: none;"
         , em: "font-style: normal; background-color: #ff0;"
         , tt: "background-color: #ddc;"
         , "#emphasis_index": "margin: 4ex 0 0 0; padding: 2ex; \
             border: solid #000; border-width: 1px 0 0 0;"
         , "a": "color: #004477;"
         , "a:visited": "color: #660000;"
         , "a:hover": "color: #dd0000;"
    });
  }


  function procInline(line){

      if( line.match( /^http:\/\// ) ){
        return '<a href="' + line + '">' + line + '</a>';
      }else if( line.match( /^link:(.+)/ ) ){
        var href = strip(RegExp.$1);
        return '<a href="' + href + '">' + href + '</a>';
      }else if(line.match( /^img: (.+)$/ )){
        var src = strip(RegExp.$1);
        return '<img src="' + RegExp.$1 + '" />';
      }


    var buf = line;
    var result = "";
    c = 0;
    while(buf){
      //console.log( c +": "+buf);
      if(buf.match(/(^| )\*(.+?)\*($| )/)){
        result += RegExp.leftContext ;
        result += " <b>"+RegExp.$2+"</b> " ;
        buf = RegExp.rightContext ;
      }else if(buf.match(/(^| )_(.+?)_($| )/)){
        result += RegExp.leftContext ;
        result += " <em>"+RegExp.$2+"</em> " ;
        buf = RegExp.rightContext ;
      }else if(buf.match(/(^| )\+(.+?)\+($| )/)){
        result += RegExp.leftContext ;
        result += " <tt>"+RegExp.$2+"</tt> " ;
        buf = RegExp.rightContext ;
      }else{
        result += buf;
        break;
      }
      c++ ; if(c>5){ break;}
    }
    return result;
  };
  
  
  function Parser(){
    var stackTOC = new Stack();
    
    
    var line2elem = function(line){
      var elem = new Elem();

      if(line.match( /^----/ )){
        elem.type = "hr";
        elem.content = "";
      }else{
        elem.content = line;
      }

      return elem;
    };

    
    this.procUL = function(lines){
      function getIndent(line){
        var headSpace;
        
        if( line.match(/^( *)- /) ){
          headSpace = RegExp.$1;
          return headSpace.length + 2;

        }else if( line.match(/^( *)/) ){
          headSpace = RegExp.$1;
          return headSpace.length;
        }
        throw "invalid indent";
      }

      var indent = 0; // トップレベルは0

      var temp = [];

      while(true){
        var nextLine = lines[0];
        
        var nextIndent = getIndent(nextLine);
        var isBlankLine = false;
        if( nextIndent === null ){
          isBlankLine = true;
          nextIndent = indent;
        }

        if( indent === nextIndent ){ // 同じレベル
          var line = lines.shift();
          temp.push({ indent: nextIndent, line: line});

        }else{ // 違うレベル
          if(nextIndent === 0){
            // UL終了
            break;
          }else if( nextIndent < indent ){
            var line = lines.shift();
            temp.push({ indent: nextIndent, line: line});
            
          }else if( indent < nextIndent ){
            var line = lines.shift();
            temp.push({ indent: nextIndent, line: line});

          }else{
            throw "must not happen";
          }
        }
        indent = nextIndent;
      }

      // 末尾の空行を削除
      while(true){
        var last = temp.pop();
        if( last.line.match( /^\s*$/ ) ){
          lines = unshift(last.line, lines);
        }else{
          temp.push(last);
          break;
        }
      }

      var elem = new Elem();
      elem.type = "pre";
      elem.attr = {
        "class": "ul"
      };

      elem.content =
        temp
        .map(function(e){
               //return e.indent +":"+ e.line;
               var line = e.line;
               if( line.match(/^( *(- )*)(.+)/) ){
                 return RegExp.$1 + procInline(RegExp.$3);
               }else{
                 return line;
               }
             })
        .join("\n")
      ;

      return {
        elem: elem
        , lines: lines
      };
    };
    
    
    this.procPRE = function(lines){
      function isIndented(line){
        return line.match(/^\s/);
      }

      var indent = 0; // トップレベルは0
      var temp = [];

      while(true){
        var nextLine = lines[0];
        
        if( ! isIndented(nextLine) ){
          break;
        }

        var line = lines.shift();
        temp.push(line);
      }

      var elem = new Elem(
        "pre"
        , temp
        .map(function(e){ return e; })
        .join("\n")
      );
      elem.attr = {
        "class": "indentBlock prettyprint"
      };

      return {
        elem: elem
        , lines: lines
      };
    };
    
    
    this.parseMain = function(lines){
      var node = { list: [] };
      var result = [];
      
      var l = null
      , status = null;
      while(lines.length > 0){
        l = lines.shift();

        if( ! l ){
          var elem = new Elem();
          elem.content = null;
          node.list.push(elem);
          
        }else if( l.match(/^- (.+)/ )){
          var x = this.procUL( unshift(l, lines) );
          var elem = x.elem;
          lines = x.lines;
          node.list.push(elem);
        }else if( l.match(/^\s/ )){
          var x = this.procPRE( unshift(l, lines) );
          var elem = x.elem;
          lines = x.lines;
          node.list.push(elem);
        }else if( l.match( /^b\{-*$/ ) ){
          node.list.push( new Elem(null, '<div class="box">') );
        }else if( l.match( /^\}b-*$/ ) ){
          node.list.push( new Elem(null, "</div>") );
        }else if( l.match( /^q\{-*$/ ) ){
          node.list.push( new Elem(null, "<blockquote>") );
        }else if( l.match( /^\}q-*$/ ) ){
          node.list.push( new Elem(null, "</blockquote>") );
        }else{
          node.list.push( line2elem(l) );
        }
      }

      return { node: node };
    };


    this.parse = function(text){
      var lines =  text.split( "\n" ) ;
   
      var result = this.parseMain( lines );
      return result.node;
    };
  }


  function OutlineParser(){
    this.parse = function(src){
      var lines = src.split("\n");
      var level = 0;
      var oldLevel = level;
      var index = 1;

      var root = {
        title: null
        , parent: null
        , children: []
        , level: level
      };
      var target = root;

      var buf = [];
      while(lines.length > 0){
        var line = lines.shift();

        if(line.match(/^=/)){
          if(buf.length > 0){
            target.children.push(buf.join("\n"));
            buf = [];
          }

          var head = this.procHn(line);
          var diff = head.level - oldLevel;
          oldLevel = head.level;

          if(0 < diff){
            for(var a=0; a<diff; a++){
              target = this.makeBlock(target, null);
            }
            target.title = head.content;
            target.level = head.level;
            target.index = index; index++;
          }else if(diff < 0){
            for(var a=0; a<-diff+1; a++){
              target = target.parent;
            }
            target = this.makeBlock(target, head.content);
            target.level = head.level;
            target.index = index; index++;
          }else{
            target = this.makeBlock(target.parent, head.content);
            target.level = head.level;
            target.index = index; index++;
          }
        }else{
          buf.push(line);
        }
      }
      
      if(buf.length > 0){
        target.children.push(buf.join("\n"));
      }
      
      return root;
    };

    this.procHn = function(line){
      if(line.match(/^(=+)([^=]+)=*$/)){
        return {
          level: RegExp.$1.length
          , content: RegExp.$2
        };
      }else{
        return null;
      }
    };

    this.makeBlock = function(parent, title){
      var block = {
        title: title
        , parent: parent
        , children: []
      };
      parent.children.push(block);
      return block;
    };

    this.toHTMLElement = function(block){
      var elem = createElement(
        null
        , "div"
        , { "class": "outline" }
      );

      if( block.children ){
        if( block.title ){
          var head = createElement(
            elem, "h" + block.level
            , { id: "heading" + block.index }, {}
          );

          var link = createElement(
            head, "a"
            , { href: "#heading" + block.index }, {}
            , "*"
          );
          var title = document.createTextNode(block.title);
          head.appendChild(title);
        }

        for(var a=0; a<block.children.length; a++){
          var kid = block.children[a];
          elem.appendChild(this.toHTMLElement(kid));
        }
      }else{
        var src = block;
        var parser = new Parser();
        var parsed = parser.parse(src);
        var html = markup(parsed);
        elem.innerHTML = html;
      }
      
      return elem;
    };
  }


  function markup(doc){
    var result = "";
    var list = doc.list;

    for(var a=0; a<list.length; a++){
      var elem = list[a];
      var temp = elem.toHtml();
      result += temp;

      if( temp === '<div class="box">'
          || temp === '<blockquote>'
        ){
          //
        }else{
          //result += "<br />";
          result += "\n";
        }
    }

    return result;
  }


  function formatDate(date){
    function fmt(n){
      return "" + (n<10 ? "0" + n : n);
    }

    var y = date.getFullYear();
    var m = date.getMonth()+1;
    var d = date.getDate();
    var h = date.getHours();
    var min = date.getMinutes();
    return y
      + "-" + fmt(m)
      + "-" + fmt(d)
      + " " + fmt(h)
      + ":" + fmt(min);
  }


  function splitPreamble(src){
    var lines = src.split("\n");
    var info = {};
    var preamble_range = 20;
      for(var a=0; a<preamble_range; a++){
        if(!lines[a]){ continue; }
        if(lines[a].match(/^title:(.+)/) ){
          info.title = RegExp.$1;
          delete lines[a];
        }else if(lines[a].match(/^by:(.+)/) ){
          info.by = RegExp.$1;
          delete lines[a];
        }else if(lines[a].match(/^date:(.+)/) ){
          info.date = RegExp.$1;
          delete lines[a];
        }
      }

    var _lines = [];
    for(var a=0; a<lines.length; a++){
      var line = lines[a];
      typeof line !== "undefined" && _lines.push(line);
    }

    return {
      info: info
      , body: _lines.join("\n")
    };
  }


  function makePreamble(info){
    var lines = [];
    info.by && lines.push( "by: " + info.by);
    info.date && lines.push( "date: " + info.date );
    lines.push( "last modified: " + formatDate(new Date(document.lastModified)) );

    var preamble = createElement(
      null, "pre"
      , { "class": "preamble" }, {}
      , lines.join("\n")
    );

    return preamble;
  }


  function getTitle(info){
    var title = "untitled";
    if(info.title){
      title = info.title;
      info.by && (title += " by " + info.by);
      info.date && (title += " (" + info.date + ")");
    }

    return title;
  }

  
  ////////////////////////////////


  function main(){
    var self = this;
    
    var bodyElem = document.body;
    var articleElem  = document.getElementsByName("article")[0];
    var mainBox = createElement(
      null, "div", { id: "main_box" }
    );

    var src = articleElem.innerHTML;
    var article = splitPreamble(src);

    var olParser = new OutlineParser();
    var outline = olParser.parse(article.body);
    var result = olParser.toHTMLElement(outline);
    
    articleElem.style.display = "none";

    var formatted = createElement(
      null, "pre", { id: "formatted_body" }, {}, result.innerHTML
    );

    var formattedSrc = createElement(
      null, "textarea", { id: "formatted_src" }, {}
      , result.innerHTML
    );
    
    // TOC
    var toc = createElement(
      null, "div", { id: "toc" }, {}
      , makeTOC(outline)
    );
    insertAsFirstChild(bodyElem, toc);

    // Page title
    var titleElem = null;
    if(article.info.title){
      titleElem = createElement(
        null, "div"
        , { id: "document_title" }, {}
        , article.info.title
      );
    }

    document.title = getTitle(article.info);

    var emRefElem = makeEMIndex(formatted);
    if(emRefElem){
      insertAsFirstChild(mainBox, emRefElem);
    }
    insertAsFirstChild(mainBox, formattedSrc);
    insertAsFirstChild(mainBox, formatted);
    insertAsFirstChild(mainBox, makePreamble(article.info));

    if(titleElem){
      insertAsFirstChild(mainBox, titleElem);
    }
    insertAsFirstChild(bodyElem, mainBox);
  }

  function test(){
    function puts(){ console.log(arguments); }
    var op = new OutlineParser();
    var x = op.parse( document.getElementById("src").textContent );
    puts(x);
  }
  
  main();

  applyDefaultCSS();
};


window.addEventListener( "load", easyLog, true );
