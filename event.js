"use strict";

document.ondragstart = function(){return false;};

function changeColor(id, font_color) {
    document.getElementById(id).style.color = font_color;
}

var elem = document.getElementById("hoge");
     
elem.addEventListener("click", function () {
    alert('アラートを実行してます!');
});

document.getElementById('outer').addEventListener('click', function () {alert('outer'); },true);

document.getElementById('inner').addEventListener('click', function () {alert('inner'); });

document.getElementById('outer2').addEventListener('click', function () {alert('outer'); },false);

document.getElementById('inner2').addEventListener('click', function () {alert('inner'); });


//-------------------------------------------------
//スクロールでタイトル欄縮小機能
//メモ貼り付け機能との兼用で、誤差が出てしまうので、今回は除外。

/*const header =  document.getElementById('00');

function init() {
// 縮小の割合(小さいほど速く縮小)
var px_change  = 500;
// スクロールのイベントハンドラ登録
window.addEventListener('scroll', function(e){
console.log("y="+window.pageYOffset);

header.style.padding =  String(15*(1-(2*window.pageYOffset/px_change)))+"% 500%";
header.style.fontSize = String(120*(1-(2*window.pageYOffset/px_change)))+"px";
    
    
console.log(String(15*(1-(2*window.pageYOffset/px_change)))+"% 500%");
console.log(String(120*(1-(2*window.pageYOffset/px_change)))+"px");    
});
}

//DOMが完成したら初期化。
document.addEventListener("DOMContentLoaded", init);*/

//---------------------------------------------------
//クリックしたらインクリメントするようなやつ

/*const counter = document.getElementById('counter')     
counter.addEventListener('click',inc_count);
document.addEventListener("DOMContentLoaded", inc_count);

function inc_count() {
const url = "http://www.isc.meiji.ac.jp/~ee47125/Final/counter.cgi";

console.log("実行->"+url);
    function ajaxGetPromise(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET",url);
            xhr.onreadystatechange = function (){
                if(xhr.readyState === 4){//非同期通信の完了
                    if((200 <= xhr.status && xhr.status < 300)){//成功
                        resolve(xhr.responseText);
                    }else{//失敗
                        reject("リクエスト失敗"+String(xhr.status));
                    }
                 }
            };
            xhr.send(null);
        });
    }

const p = ajaxGetPromise(url);
p.then(//成功
    (result)=>{
     const counter_obj = JSON.parse(result);
     counter.innerText  = counter_obj.count;
    }
).catch(//失敗
    (result)=>{console.log(result);}
);
}*/

//-------------------------------------------------
//めも貼り付け機能
//mode必要
//0-->初期状態。ボタンクリックでメモ生成、id付与、表示、mode1へ。
//1-->マウスに追従。ダブルクリックで保存し、mode2へ。
//2-->メモを絶対位置で固定化(スクロールに追従)。書き込みができるように。その度に非同期通信で共通JSONを更新。
let nowNote;
let mode = 0;
//let id_count = 0;//非同期処理で同期する必要あり-->乱数15桁生成で対応
let pageX,pageY;
let display_note_list = [];
let body = document.getElementById('body');
let isAllowUpdate = true;
let SERVER_URL = "http://syunyooo.webcrow.jp/MemoPage/"//通信先の基幹URL

document.addEventListener("DOMContentLoaded", function(e){
    body.appendChild(genGUI());
    read_note(e);
    //mode0
    //ボタンクリックで、
    document.getElementById('gen_note').addEventListener('click',put_note);
});

window.addEventListener('scroll', function(e){//スクロール値の更新
pageX = window.pageXOffset;
pageY = window.pageYOffset;
    
/*const base_point = body.getBoundingClientRect();
console.log("base:("+base_point.left+","+base_point.top+")");
console.log("offset:("+body.offsetLeft+","+body.offsetTop+")");

const base_point_2 = getRect(body);
console.log("base2:("+base_point_2.left+","+base_point_2.top+")");
*/
});

//Webに残っているnote全部消すやつ
//document.getElementById('clear_note').addEventListener('click',clear_note);

function clear_note(e){//Webサーバにあるnote.txtの中身を初期化
    const url = SERVER_URL+"note.cgi?mode=clear";
        console.log("実行->"+url)
        function ajaxGetPromise(url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET",url);
                xhr.onreadystatechange = function (){
                    if(xhr.readyState === 4){//非同期通信の完了
                        if((200 <= xhr.status && xhr.status < 300)){//成功
                            resolve(xhr.responseText);
                        }else{//失敗
                            reject("リクエスト失敗"+String(xhr.status));
                        }
                    }
                };
                xhr.send(null);
            });
        }
        const p = ajaxGetPromise(url);
        p.then(//成功
        (result)=>{
            console.log(result);
            make_note(JSON.parse(result));
        }
        ).catch(//失敗
        (result)=>{console.log(result);}
        );
}



//読み込みから、画面への反映。
//時間制。
//document.getElementById('read_note').addEventListener('click',read_note);
window.setInterval(function(e){
    console.log("isAollowUpdate:"+isAllowUpdate);
    if(isAllowUpdate){read_note(e);}
    console.log("display_list:"+display_note_list);
}, 5000);


function read_note(e){//webサーバにある共有noteからの読み込み。
    const url = SERVER_URL+"note.cgi";
        console.log("読み込み実行->"+url);
        function ajaxGetPromise(url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET",url);
                xhr.onreadystatechange = function (){
                    if(xhr.readyState === 4){//非同期通信の完了
                        if((200 <= xhr.status && xhr.status < 300)){//成功
                            resolve(xhr.responseText);
                            
                            let pop = document.getElementById("network_pop");
                            if (pop != null){//ポップ削除
                                pop.parentNode.removeChild(pop);
                            }
                            
                        }else{//失敗
                            
                            let pop = document.getElementById("network_pop");
                            if (pop == null){//ポップ表示
                                make_network_pop();
                            }
                            
                            reject("リクエスト失敗"+String(xhr.status));
                        }
                    }
                };
                xhr.send(null);
            });
        }
        const p = ajaxGetPromise(url);
        p.then(//成功
        (result)=>{
            console.log(result);
            make_note(JSON.parse(result));
        }
        ).catch(//失敗(メモ情報が不正、通信が不安定？)
        (result)=>{console.log(result);
                   console.log(result.name);
                   //console.log(result.prototype.number);
                   // 「OK」時の処理開始 ＋ 確認ダイアログの表示
                    if(result.name == "SyntaxError"){
                        if(window.confirm('メモ情報が不正の可能性があります。初期化しますか？')){
                            clear_note();
                        }
                        // 「キャンセル」時の処理開始
                        else{   
                            
                        }
                    }
                   
                    
                }
        );
}

function make_network_pop(){//ネットワークが通じていないエラーポップ
    let pop = document.createElement("p");
    pop.id = "network_pop";
    pop.style.display="block";
    pop.style.position = "fixed";
    pop.style.backgroundColor = "rgba(149,236,255,0.9)";
    
    //pop.style.width = "300px";
    //pop.style.height = "40px";
    
    pop.style.right = "35%";
    pop.style.bottom = "10px";
    
    pop.style.textAlign = "center";
    pop.style.paddingLeft = "15px"
    pop.style.paddingRight = "15px"
    pop.style.paddingTop = "10px"
    pop.style.paddingBottom = "10px"
    
    pop.innerHTML = "ネットワーク接続が不安定です";
    
    //let title_label = document.createElement("p");
    //title_label.style.position= "absolute";
    //title_label.style.top = "20px";
    //title_label.style.left = "30px";
    //title_label.innerHTML = "ネットワーク接続が不安定です";
    //pop.appendChild(title_label);

    body.appendChild(pop);
}




function make_note(notes){//read_notesで読み込んだメモを生成。
    console.log("めも生成");
    let note_list = notes.notes;
    
    for(let i = 0; i < display_note_list.length; i++){//現在表示されているnoteを全消去
        console.log("display_list["+i+"].id = "+display_note_list[i].id);
        body.removeChild(display_note_list[i]);
    }
    display_note_list = [];
    
    //let max_id_count = 0;
    
    //帰ってきたメモを全て生成。
    for (let i = 0; i < note_list.length; i++){
        let note = gen_note("absolute");
        body.appendChild(note);
        
        note.id = note_list[i].id;
        
        note.style.left=note_list[i].left;
        note.style.top =note_list[i].top;
        
        let note_input = note.children[1];
        note_input.value = note_list[i].text;
        
        let note_date = note.children[2];
        note_date.innerHTML = note_list[i].update;
        //console.log(note_list[i].update);
        
        display_note_list.push(note);   
        
        note_input.onchange = function(e){
            console.log("maked note was changed : " + note_input.value);
            save_note(note);
        }
        note_input.onfocus = function(e){
            isAllowUpdate = false;
            console.log("focus at input");
        }
        note_input.onblur = function(e){
            console.log("blur at input");
            isAllowUpdate = true;
        }
        
        let close_btm = note.children[3];
        close_btm.onclick = function(e){//削除機能登録
            console.log(display_note_list);
            //配列からも削除
            for(let i=0;i<display_note_list.length;i++){
                console.log("display_list["+i+"].id = "+display_note_list[i].id);
                if(display_note_list[i].id == note.id){
                    console.log("display_list["+i+"].id is note.id");
                    display_note_list.splice(i,1);
                }
                console.log(display_note_list);
                
            }
            
            
            //表示を削除。
            note.parentNode.removeChild(note);
            
            //webサーバからも削除
            delete_note(note);
        }
        
        draggable(note);
    }
}


function put_note(e){//メモ生成、id付与、表示、mode1へ。
    let nowNote = gen_note("fixed");
    body.appendChild(nowNote);
    mode = 1;
    isAllowUpdate = false;
    
    display_note_list.push(nowNote);
}

//メモ要素生成、返す。そのposition(fixed,absoluteなど)指定あり。
function gen_note(position){
    nowNote = document.createElement("p");
    nowNote.id = random_hash();
    nowNote.className = "note";
    nowNote.style.display="block";
    nowNote.style.position = position;
    
    let note_img = document.createElement("img");
    note_img.src = "images/note.png";
    note_img.style.width = "200px";
    note_img.style.height = "200px";
    note_img.alt = "めも";
    note_img.style.display = "block";
    nowNote.appendChild(note_img);
    
    let note_textarea = document.createElement("textarea");
    note_textarea.style.position= "absolute";
    note_textarea.style.display = "block";
    note_textarea.style.top = "70px";
    note_textarea.style.left = "20px";
    note_textarea.style.width = "158px";
    note_textarea.style.height = "95px";
    note_textarea.style.backgroundColor = "transparent";
    note_textarea.style.border = "none";
    nowNote.appendChild(note_textarea);
    
    let date_label = document.createElement("p");
    date_label.style.position= "absolute";
    date_label.style.bottom = "1px";
    date_label.style.left = "70px";
    date_label.innerHTML = "not registed";
    nowNote.appendChild(date_label);
    
    let close_btm = document.createElement("img");
    close_btm.style.position= "absolute";
    close_btm.src = "images/close.png";
    close_btm.alt = "close";
    close_btm.style.width = "8px";
    close_btm.style.height = "8px";
    close_btm.style.bottom = "15px";
    close_btm.style.left = "176px";
    nowNote.appendChild(close_btm); 
    
    return nowNote;
}



function random_hash(){//乱数生成-->idとする。
    // 生成する文字列の長さ
    var l = 15;
    // 生成する文字列に含める文字セット
    var c = "abcdefghijklmnopqrstuvwxyz0123456789";
    var cl = c.length;
    var r = "";
    for(var i=0; i<l; i++){
        r += c[Math.floor(Math.random()*cl)];
    } 
    return r;
}

//mode1
//メモ移動系
document.addEventListener('mousemove',mouse_follow);
function mouse_follow(e){
    if(mode === 1){//マウス追従。
        console.log("-----mode1-----");
        nowNote.style.left = (e.clientX-30) + "px"; // X表示位置 
        nowNote.style.top = (e.clientY-30) + "px";  // Y表示位置 
        console.log("相対位置　left:"+nowNote.style.left+" top:"+nowNote.style.top);
    }
}

//mode1
//ダブルクリックで固定、入力受け付け、mode2へ
document.addEventListener('dblclick' ,function(e){
    if(mode === 1){
        draggable(nowNote);
        nowNote.style.position="absolute";
        //px単位での座標
        let tg_point = getPoint((pageX+e.clientX-20),(pageY+e.clientY-20));
        console.log("dbclick->相対位置 left:"+nowNote.style.left+" top:"+nowNote.style.top);
        console.log("tg_point("+tg_point.left+","+tg_point.top+")");
        
        //bodyにおける%に変換
        console.log();
        
        tg_point = transePoint(tg_point,body);
        
        //nowNote.style.left=(pageX+e.clientX-30) + "px";
        //nowNote.style.top =(pageY+e.clientY-30) + "px";
        
        nowNote.style.left= tg_point.left;
        nowNote.style.top= tg_point.top;
        
        console.log("絶対位置　left:"+nowNote.style.left+" top:"+nowNote.style.top);
        mode = 2;
        isAllowUpdate = true;
        save_note(nowNote);
        
        //このテキストエリアに関して、変更があれば、Webにセーブ
        //メモの保存
        //CGIにより、id
        //座標(left,top)、入力内容(text)、モード(mode)をWebサーバに保存。
        //ここでいうモードは
        //write-->保存のみ
        //read-->保存されているnoteの読み込み
        //に対応。
        let note_input = nowNote.children[1];
        note_input.onchange = function(e){
            console.log("note was changed : " + note_input.value);
            save_note(note_input.parentNode);
        }
        note_input.onfocus = function(e){
            isAllowUpdate = false;
            console.log("focus at input");
        }
        note_input.onblur = function(e){
            console.log("blur at input");
            isAllowUpdate = true;
        }
        
        
        //削除ボタン
        let close_btm = nowNote.children[3];
        close_btm.onclick = function(e){
            console.log("close btm clicked:"+close_btm.parentNode.id);
            
            //配列からも削除
            for(let i=0;i<display_note_list.length;i++){
                if(display_note_list[i].id == close_btm.parentNode.id){
                    console.log("display_list["+i+"].id is note.id");
                    display_note_list.splice(i,1);
                }
            }
            
            //表示を削除。
            close_btm.parentNode.parentNode.removeChild(close_btm.parentNode);
            
            //webサーバからも削除
            delete_note(close_btm.parentNode);
        }
        
        }
});

function save_note(note){
        const url = SERVER_URL+"note.cgi";
        const note_input = note.children[1];
        console.log("格納実行->"+url);
        function ajaxGetPromise(url) {
            return new Promise((resolve, reject) => {
                const send_data = "id="+note.id+"&left="+note.style.left+"&top="+note.style.top+"&text="+encodeURIComponent(note_input.value)+"&mode=write";
                console.log("POST->("+send_data+")");
                const xhr = new XMLHttpRequest();
                xhr.open("POST",url,true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.onreadystatechange = function (){
                    if(xhr.readyState === 4){//非同期通信の完了
                        if((200 <= xhr.status && xhr.status < 300)){//成功
                        resolve(xhr.responseText);
                        }else{//失敗
                            reject("リクエスト失敗"+String(xhr.status));
                        }
                }
            };
                xhr.send(send_data);
        });
        }
        const p = ajaxGetPromise(url);
        p.then(//成功
            (result)=>{
                console.log(result);
                update_date(note,JSON.parse(result));
            }
        ).catch(//失敗
            (result)=>{console.log(result);}
        );
    }

//メモの日時表示を変更する。
function update_date(note,notes){
    let note_list = notes.notes;
    
    //帰ってきたメモ達から目的のメモ情報を取得し、その表示を変更する。
    for (let i = 0; i < note_list.length; i++){
        if(note.id == note_list[i].id){
            let note_date = note.children[2];
            note_date.innerHTML = note_list[i].update;
        }   
    }
    
}


//引数targetをドラッグ可能DOMとして登録する関数
function draggable(target) {
    
    //移動中は一番前面(zIndex最大)で出て欲しいので、一旦保存。
    const zIndex = target.style.zIndex;
    let tg_rec = [];
    
    //マウス押下で、(マウス移動追従)&(マウス解除->マウス移動追従解除)
    target.onmousedown = function(e){
        console.log("onmousedown at "+target.id);
        let st = getPoint(e.offsetX+2,e.offsetY+13);
        tg_rec = [];
        target.style.zIndex = Number.MAX_VALUE;
        
        let isMouseMoved = false;
        window.onmousemove = function(e){
            follow(e,st);
            isMouseMoved = true;
            isAllowUpdate = false;
        }
        target.onmouseup = function(e){
            window.onmousemove = null;
            target.style.zIndex = zIndex;
            if(isMouseMoved){
            console.log("dragged");
            isAllowUpdate = true;
            save_note(target);
            isMouseMoved = false;
            }
        }
    }
    
    function follow(e,st) {
        target.style.left= (parseFloat(transeLeft(pageX+e.clientX-st.left,body)))+"%";
        target.style.top = (parseFloat(transeTop (pageY+e.clientY-st.top,body)))+"%";
        console.log("drag -> 絶対位置　left:"+target.style.left+" top:"+target.style.top);
        console.log("drag -> mouse　  left:"+e.clientX+" top:"+e.clientY);
        console.log("drag -> st    　left:"+st.left+" top:"+st.top);
    }
    
}

//left,topのオブジェクトで返す。
function getPoint(left,top){
    return {"left":left,"top":top};
}

//baseにおけるpoint(left px,top px)の座標を%で返す。
function transePoint(point,base){
    return getPoint(transeLeft(point.left,base),transeTop(point.top,base));
}

//baseにおける(left px)の座標を%で返す。
function transeLeft(left,base){
    let rel_left = 100*((left-GetLeft(base))/(base.offsetWidth))+"%";
    return rel_left;
}

//baseにおける(top px)の座標を%で返す。
function transeTop(top,base){
    let rel_top = 100*((top-GetTop(base))/(base.offsetHeight))+"%";
    return rel_top;
}

//その要素のページ上の座標を返す(割と正確)。
function getRect(oj){
    return {"left":GetLeft(oj),"top":GetTop(oj)}
}

//その要素のページ上のleftを返す。
function GetLeft(oj){
    var px = 0;
    while(oj){
        px += oj.offsetLeft;
        oj = oj.offsetParent;
        if(oj){
        px += parseFloat(get_style(oj,"margin-left"));
        //console.log(oj+","+parseFloat(get_style(oj,"margin-left")));
        }
    }
    return px;
}

//その要素のページ上のtopを返す。
function GetTop(oj){
    var px = 0;
    while(oj){
        px += oj.offsetTop;
        oj = oj.offsetParent;
        if(oj){
        px += parseFloat(get_style(oj,"margin-top"));
        //console.log(oj+","+parseFloat(get_style(oj,"margin-top")));
        }
    }
    return px;
}

//objにおいて、cssスタイルシートで設定された値を返す
function get_style(obj,styletype){
    let mt;
    if( obj.currentStyle ) { //IE or Opera  
        if( styletype.indexOf( "-" ) != -1 ) styletype = styletype.camelize();  
            mt =  obj.currentStyle[ styletype ];  
    } else if ( getComputedStyle ) { //Mozilla or Opera or Safari  
        mt = document.defaultView.getComputedStyle(obj, '' ).getPropertyValue( styletype );  
    } 
    return mt;
}


//webサーバ上から引数のノートを消す。
function delete_note(note){
    const url = SERVER_URL+"note.cgi?mode=delete&id="+note.id;
        console.log("削除実行->"+url)
        function ajaxGetPromise(url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET",url);
                xhr.onreadystatechange = function (){
                    if(xhr.readyState === 4){//非同期通信の完了
                        if((200 <= xhr.status && xhr.status < 300)){//成功
                            resolve(xhr.responseText);
                        }else{//失敗
                            reject("リクエスト失敗"+String(xhr.status));
                        }
                    }
                };
                xhr.send(null);
            });
        }
        const p = ajaxGetPromise(url);
        p.then(//成功
        (result)=>{
            console.log(result);
        }
        ).catch(//失敗
            (result)=>{console.log(result);}
        );
}

function genGUI(){
    let GUI = document.createElement("div");
    GUI.style.position = "fixed";
    GUI.style.right    = "0px";
    GUI.style.bottom   = "0px";
    
    let gen_note_btm = document.createElement("p");
    gen_note_btm.id = "gen_note";
    gen_note_btm.style.position = "absolute";
    gen_note_btm.style.right = "10px";
    gen_note_btm.style.bottom = "0px";
    GUI.appendChild(gen_note_btm);
    
    let img = document.createElement("img");
    img.src = "images/notes.png";
    img.alt = "メモ帳";
    img.width = "200";
    img.height = "200";
    img.style.zIndex = "10001";
    gen_note_btm.appendChild(img);
    
    let label =  document.createElement("span");
    label.style.position = "absolute";
    label.style.top = "90px";
    label.style.left = "60px";
    label.style.width = "150px";
    label.style.height = "100px";
    label.style.backgroundColor = "transparent";
    label.style.border = "none";
    label.style.zIndex = "10002";
    label.innerHTML = "click here";
    gen_note_btm.appendChild(label);
    
    return GUI;
}






//キーコマンド用

document.addEventListener("keydown",onKeyDown,false);
document.addEventListener("keyup",onKeyUp,false);
//キー押下状態の判別フラグ
let KeyState = new Array();

 //キーボードが押されたときの処理
function onKeyDown(evt) {
    //console.log("キー押下"+evt.keyCode);
 //キーコードを判別する
 switch(evt.keyCode){
     case 13:
     KeyState[0] = true;
     break;
     case 16:
     KeyState[1] = true;
     break;
 }
}

 //キーボードが離されたときの処理
function onKeyUp(evt) {
    //console.log("キー離脱"+evt.keyCode);
 //キーコードを判別する
 switch(evt.keyCode){
     case 13:
     KeyState[0] = false;
     break;
     case 16:
     KeyState[1] = false;
     break;
 }
}


