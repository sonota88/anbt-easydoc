// anbt_easydoc.js

/* Template

<html>
<head>
  <link  href="prettify.css" type="text/css" rel="stylesheet">
  <script type="text/javascript" src="prettify.js"></script>
  <script type="text/javascript" src="anbt_easydoc.js"></script>
  <style><!-- * { line-height: 150%; } body { padding: 2ex 5%; } --></style>
  <title>document title</title>
</head>
<body onload="prettyPrint()">

<pre name="content">
</pre>

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
  function applyDefaultCSS(){
    var css = document.createElement("style");
    css.innerHTML = ' \
      * { line-height: 150%; } \
      //body{ width: 76%; margin-left: 20%; padding: 2%; padding-top: 0; margin-top: 0; } \
      body{ width: 80%; margin-left: 20%; padding: 0; padding-top: 0; margin-top: 0; } \
      pre.indentBlock {  margin: 1ex 0 1ex 4ex;  padding: 0.5ex; \
        background-color: #f0f8f8;  border: solid 1px #a0b8b8; line-height: 120%; \
      } \
      p.document_title { font-size: 150%; font-weight: bold; background-color: #068; color: #fff; margin: 0; margin-bottom: 1ex; padding: 2ex; text-align: center; } \
      h1, h2, h3, h4, h5, h6, pre { margin: 0; padding: 0 1ex; } \
      h1 { font-size: 140%; text-align: center;  border: solid #444;  border-width: 0.3ex 0;  padding: 2ex; } \
      h2 { font-size: 130%; background-color: #ddd;  border: solid 2px #bbb;  padding: 1ex; } \
      h3 { font-size: 120%; background-color: #eee;  padding: 1ex; } \
      h4 { font-size: 110%; border: solid #a00; border-width: 0 0 1px 1ex  ; } \
      h5 { font-size: 105%; border: solid #a00; border-width: 0 0 0   1ex  ; } \
      h6 { font-size: 100%; border: solid #6a0; border-width: 0 0 0   0.5ex; } \
      #toc { font-size: 75%; position: fixed; top: 0;left: 0; width: 18%; height: 100%; \
        background-color: #eee; border: solid 1px #ccc; overflow: auto; padding: 1%; \
      } \
      #toc ul { padding-left: 2ex; } \
      blockquote { border: solid 2px #d80; padding: 0 1ex; } \
      div.outline{ padding: 0 0 0 2ex; } \
      em { font-style: normal; background-color: #ff0; } \
      tt { background-color: #ddc; } \
      #emphasis_index { margin: 4ex 0 0 0; padding: 2ex; border: solid #000; border-width: 1px 0 0 0; } \
    ';
  
    document.getElementsByTagName("head")[0].appendChild(css);
  }


  function headingTag(hLevel, hId, hTitle){
    //return '<h' + hLevel + ' id="' + hId + '"><a href="#' + hId + '">*</a>' + hLevel +': '+ hTitle + '</h' + hLevel + '>';
    return '<h' + hLevel + ' id="' + hId + '"><a href="#' + hId + '">*</a>' + hTitle + '</h' + hLevel + '>';
  }


  function Stack(){
    var stack = [];
    this.push = function(value){ stack.push(value); };
    this.pop = function(){ return stack.pop(); };
    this.last = function(){ return stack[stack.length - 1]; };
    this.length = function(){ return stack.length; };
    this.at = function(n){ return stack[n]; };
  }

  
  function Parser(){
    var stackTOC = new Stack();
    
    
    var procInline = function(line){
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
    }
    
    
    this.parse = function(text){
      var result = "";
      var lines = text.split( "\n" )
      for( b=0; b<lines.length; b++){
        l = lines[b]
        status = null;
    
        if(l.match(/^\s/)){ indentLine = true;  status = "pre";
        }else{              indentLine = false;
        }
        
        if( indentLineOld == false && indentLine == true ){
          result += '<pre class="indentBlock prettyprint">'
        }
        if( indentLineOld == true && indentLine == false ){
          result += '</pre>'
        }
    
        if(l.match(/^----/)){ 
          l = "<hr />"
          status = "hr";
        }else if( l.match( /^https?\:\/\// ) ){
          l = "<a href='"+ l +"'>"+ l +"</a>";
          status = "a";
        }else if( l.match( /^link:/ ) ){
          l = "<a href='"+ RegExp.rightContext +"'>"+ RegExp.rightContext +"</a>";
          status = "a";
        }else if( l.match( /^img:(.+)$/ ) ){
          l = '<img src="' + RegExp.$1 + '" />'
          status = "img";
        }
    
        if(       l.match( /^q\{-*$/ ) ){ l = "<blockquote>";
        }else if( l.match( /^\}q-*$/ ) ){ l = "</blockquote>";
        }
    
        var hLevel = null;
        var hTitle = null;
        if      (l.match(/^======(.+?)=*$/)){ hLevel = 6; hTitle = RegExp.$1;
        }else if(l.match(/^=====(.+?)=*$/ )){ hLevel = 5; hTitle = RegExp.$1;
        }else if(l.match(/^====(.+?)=*$/  )){ hLevel = 4; hTitle = RegExp.$1;
        }else if(l.match(/^===(.+?)=*$/   )){ hLevel = 3; hTitle = RegExp.$1;
        }else if(l.match(/^==(.+?)=*$/    )){ hLevel = 2; hTitle = RegExp.$1;
        }else if(l.match(/^=(.+?)=*$/     )){ hLevel = 1; hTitle = RegExp.$1;
        }
        if(hLevel){
          hId = "heading" + stackTOC.length();
          if(outlineLevel < hLevel){
            for(var c=( - outlineLevel + hLevel); c>0; c--){
              result += outlineBeginTag;
            }
            result += headingTag(hLevel, hId, hTitle);
          }else if(outlineLevel > hLevel){
            for(var c=(outlineLevel - hLevel); c>=0; c--){
              result += outlineEndTag;
            }
            result += outlineBeginTag;
            result += headingTag(hLevel, hId, hTitle);
          }else if(outlineLevel == hLevel){
            result += outlineEndTag;
            result += outlineBeginTag;
            result += headingTag(hLevel, hId, hTitle);
          }
    
          stackTOC.push(
            { "level": hLevel, "title": hTitle, "id": hId }
          )
          status = "heading";
          outlineLevel = hLevel;
        }
        
        if(status == null){
          l = procInline(l);
        }
    
        if(status != "heading"){ 
          if( indentLine ){ l = l.replace( /^\s/, '' ); }
          result += l;
        }
        if(status != "heading" && status != "hr"){
          result += "\n"; 
        }
        
        indentLineOld = indentLine;
      }
      for(var b=outlineLevel; b>=0; b--){
        result += '</div>';
      }
      
      return result;
    }
    
    
    this.makeTOC = function(){
      var levelOld = 0;
      var levelNow = 0;
      var result = "";
      
      for(var a=0; a<stackTOC.length(); a++){
        levelNow = stackTOC.at(a).level;
        
        if(levelOld < levelNow){
          for(var b=levelNow - levelOld; b>0; b--){
            result += '<ul id="toc_list">';
          }
        }
        if(levelOld > levelNow){
          for(var b=levelOld - levelNow; b>0; b--){
            result += "</ul>\n";
          }
        }
        
        result += '<li><a href="#' + stackTOC.at(a).id + '">';
        result += stackTOC.at(a).title;
        result += '</a></li>\n';
        
        levelOld = levelNow;
      }
      for(var b=levelOld; b>0; b--){
        result += "</ul>\n";
      }
      
      return result;
    }
  }


  /////////////////////////////////////////////////////////////////////////////////
	var indentLine, indentLineOld;
	var outlineLevel = 0;
	var outlineBeginTag = '<div class="outline">';
	var outlineEndTag   = '</div>';
	
	var bodyElem = document.getElementsByTagName("body")[0]
	var content  = document.getElementsByName("content")[0];

	var parser = new Parser();
  var result = parser.parse(content.innerHTML);

  content.style.display = "none";
  formatted = document.createElement("pre");
  formatted.id = "formatted_body";
  formatted.innerHTML = result;
  //document.getElementsByTagName("body")[0].insertBefore(formatted, null);
	
  var toc = document.createElement("div");
  toc.id = "TOC";
	toc.innerHTML = parser.makeTOC();
	bodyElem.insertBefore(toc, bodyElem.firstChild);
	
	// Page title
	var titleP = document.createElement("p");
	titleP.setAttribute("class", "document_title");
	titleP.innerHTML = document.title;

  // Index of emphatic text
  var emReference = "";
  var emphasis = formatted.getElementsByTagName("em");
  var emRefElem = null;
  if(emphasis.length > 0){
    for(var a=0;a<emphasis.length; a++){
      var id = "emphasis_" + a;
      emphasis[a].id = id;
      emReference += '<li><a href="#' + id + '">' + emphasis[a].innerHTML + '</a></li>\n'
    }
    emReference = "<ul>" + emReference + "</ul>";
    emReference = "<h1>Index of emphatic texts</h1>" + emReference;
    
    emRefElem = document.createElement("div");
    emRefElem.id = "emphasis_index";
    emRefElem.innerHTML = emReference;
    
    // add to TOC
    var temp = document.createElement("li");
    temp.innerHTML = '<a href="#emphasis_index">Index of emphatic texts</a>';
    document.getElementById("toc_list").appendChild(temp);
	}
	
  if(emRefElem){
    bodyElem.insertBefore(emRefElem, bodyElem.firstChild);
  }
  bodyElem.insertBefore(formatted, bodyElem.firstChild);
  bodyElem.insertBefore(titleP, bodyElem.firstChild);

	applyDefaultCSS();
}


if(navigator.userAgent.indexOf("MSIE") == -1){
  window.addEventListener( "load", easyLog, true );
}
