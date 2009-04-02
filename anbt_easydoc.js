// anbt_easydoc.js

/* Template

<html>
<head>
  <link  href="prettify.css" type="text/css" rel="stylesheet">
  <script type="text/javascript" src="prettify.js"></script>
  <script type="text/javascript" src="anbt_easydoc.js"></script>
  <title>document title</title>
</head>
<body onload="prettyPrint()">

<pre name="logFragment">
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

*/


var easyLog = function (){
  function applyDefaultCSS(){
    var ss = document.createElement("style");
    ss.innerHTML = ' \
      * { line-height: 150%; } \
      body{ width: 76%; margin-left: 20%; padding: 2%; padding-top: 0; margin-top: 0; } \
      pre.indentBlock {  margin: 1ex 0 1ex 4ex;  padding: 0.5ex; \
        background-color: #f0f8f8;  border: solid 1px #a0b8b8; line-height: 120%; \
      } \
      p.document_title { font-size: 150%; font-weight: bold; background-color: #068; color: #fff; margin: 0; margin-bottom: 1ex; padding: 2ex; text-align: center; } \
      h1, h2, h3, h4, h5, h6, pre { margin: 0; } \
      h1 {  text-align: center;  border: solid #444;  border-width: 0.3ex 0;  padding: 2ex; } \
      h2 {  background-color: #ddd;  border: solid 2px #bbb;  padding: 1ex; } \
      h3 {  background-color: #eee;  padding: 1ex; } \
      h4 { border: solid #a00; border-width: 0 0 1px 1ex  ; } \
      h5 { border: solid #a00; border-width: 0 0 0   1ex  ; } \
      h6 { border: solid #6a0; border-width: 0 0 0   0.5ex; } \
      #toc { font-size: 75%; position: fixed; top: 0;left: 0; width: 18%; height: 100%; \
        background-color: #eee; border: solid 1px #ccc; overflow: auto; padding: 1%; \
      } \
      #toc ul { padding-left: 2ex; } \
    ';
  
    document.getElementsByTagName("head")[0].appendChild(ss);
  }

	var indentLine, indentLineOld;

	var tocStack = [];

	var days = document.getElementsByName("logFragment")
	//console.log(days);

	for( a=0; a<days.length; a++ ){
	  d = days[a];
	  var result = '';
	  
	  // 行ごとに処理
	  var lines = [];
	  lines = d.innerHTML.split( "\n" )
	  for( b=0; b<lines.length; b++){
	  	l = lines[b]

      if(l.match(/^\s/)){
        indentLine = true;
      }else{
        indentLine = false;
      }
      
      if( indentLineOld == false && indentLine == true ){
				result += '<pre class="indentBlock prettyprint">'
			}
			if( indentLineOld == true && indentLine == false ){
				result += '</pre>'
			}

			if( indentLine ){ l = l.replace( /^\s/, '' ); }

			if(l.match(/^----/)){ 
			  l = "<hr />"
			}else if( l.match( /^http\:\/\// ) ){
				l = "<a href='"+ l +"'>"+ l +"</a>"
			}else if( l.match( /^img:(.+)$/ ) ){
				l = '<img src="' + RegExp.$1 + '" />'
			}

			if(       l.match( /^q\{-*$/ ) ){
				l = "<blockquote>";
			}else if( l.match( /^\}q-*$/ ) ){
				l = "</blockquote>";
      }

      var hLevel = null;
      var hTitle = null;
      if      (l.match(/^======(.+)$/)){ hLevel = 6; hTitle = RegExp.$1;
      }else if(l.match(/^=====(.+)$/ )){ hLevel = 5; hTitle = RegExp.$1;
      }else if(l.match(/^====(.+)$/  )){ hLevel = 4; hTitle = RegExp.$1;
      }else if(l.match(/^===(.+)$/   )){ hLevel = 3; hTitle = RegExp.$1;
      }else if(l.match(/^==(.+)$/    )){ hLevel = 2; hTitle = RegExp.$1;
      }else if(l.match(/^=(.+)$/     )){ hLevel = 1; hTitle = RegExp.$1;
      }
      if(hLevel){
        hId = "heading" + tocStack.length;
        l = '<h' + hLevel + ' id=' + hId + '>'
        l += '<a href="#' + hId + '">*</a>'
        l += hTitle
        l += '</h' + hLevel + '>\n'
        tocStack.push(
          { "level": hLevel, "title": hTitle, "id": hId }
        )
      }

			result += l
			result += "\n"
			
			indentLineOld = indentLine;
	  }
		//  alert( result );
	  d.style.display = "none";
	  formatted = document.createElement("pre");
	  formatted.innerHTML = result;
	  document.getElementsByTagName("body")[0].insertBefore(formatted, null);
	  
	} // end fragment
	
	// TOC
	var toc = document.createElement("div");
	toc.id = "TOC";
	var levelOld = 0;
	var levelNow = 0;
	var result = "";
	
	for(var a=0; a<tocStack.length; a++){
	  levelNow = tocStack[a].level;
	  
	  if(levelOld < levelNow){
	    for(var b=levelNow - levelOld; b>0; b--){
    	  result += "<ul>";
  	  }
	  }
	  if(levelOld > levelNow){
	    for(var b=levelOld - levelNow; b>0; b--){
    	  result += "</ul>\n";
  	  }
	  }
	  
	  result += '<li><a href="#' + tocStack[a].id + '">' + levelNow + ": ";
	  result += tocStack[a].title;
	  result += '</a></li>\n';
	  
	  levelOld = levelNow;
	}
	for(var b=levelOld; b>0; b--){
    result += "</ul>\n";
  }
	
	toc.innerHTML = result;
	
	var bodyElem = document.getElementsByTagName("body")[0]
	bodyElem.insertBefore(toc, bodyElem.firstChild);
	
	// Page title
	console.log(document.title);
	var titleP = document.createElement("p");
	titleP.setAttribute("class", "document_title");
	titleP.innerHTML = document.title;
	bodyElem.insertBefore(titleP, bodyElem.firstChild);
	
	applyDefaultCSS();
}

window.addEventListener( "load", easyLog, true );
