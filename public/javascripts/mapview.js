var docList = {};
var data = {};

$(document).ready(function (){
	$('#resulttable').dataTable({
		"bFilter": false,
		"scrollY": "450px",
		"scrollX": true,
		"scrollCollapse": true,
		"paging": false,
		"aoColumnDefs": [
			{ "bSortable": false, "aTargets": [3]}
		]
	});
});

var map = function (originaldata){
	if (!originaldata || !originaldata.groups || !originaldata.authors) {
		$('#groupcount').text('サーバーエラーです');
		data = null;
		//仮おき。受け取ったdataオブジェクトが規定型でない場合の処理
		return;
	}

	data = originaldata;

	var groupcount = data.groups.length;
	if (groupcount === 0) {
		$('#groupcount').text('検索結果はありませんでした');
		return;
	}
	var qword =	document.getElementById("qwordbox").value;

	var authorcount = data.authors.length;
	var indextag = ['header', 'groupName', 'pageNum', 'representativepage', 'representativetitle'];
	var indextitle = [
		'<div style="height: 8em"></div>',
		'<div style="width: 5em">文書<br>グループ名</div>',
		'<div style="width: 4em">ページ数</div>',
		'<div style="width: 8em">代表ページ</div>',
		'ファイル名'
		];

	var proplists = getEmproProp("登録部門名", data.authors).result;

	$('#groupcount').text(groupcount + '件の文書グループが見つかりました');

	//indextitleをtableのth要素に流し込む
	Object.keys(indextitle).forEach(function (tag_index){
		document.getElementById(indextag[tag_index]).innerHTML = indextitle[tag_index]
	});
	//受け取ったdataオブジェクトの各authors要素に対してページ数の合計xを算出し、'名前<br />x件'を流し込む
	Object.keys(data.authors).forEach(function (author_index){	//authorsの数だけ繰り返し
		var sum_page_per_author = 0;
		for (var i = 0; i < groupcount; i++) {	//文書グループの数だけ繰り返し
			var pagecount = data.groups[i].documents[author_index].length;	//その文書グループの中の、author_index番目のdocuments要素の数
			sum_page_per_author = sum_page_per_author + pagecount;
		}
		addelem('th', 'titlerow', {'myid': 'author' + author_index});
		addelem('div', 'author' + author_index, {'myvalue': data.authors[author_index] + '<br>', 'myclass': "rotateth", 'myid': 'author_div' + author_index});
		addelem('div', 'author_div' + author_index, {'myvalue': proplist[author_index], 'myclass': "department", 'mytitle': proplist[author_index]});
		addelem('a', 'author' + author_index, {'myvalue': '<br>' + sum_page_per_author + '件', 'myhref': "javascript:listview(searchinfobyauthor(" + author_index + "))"});
	});

	var thumbnailurl = 'pictures';	//http://servername/lds/document
	var slideurl = 'slide';

	//受け取ったdataオブジェクトの各groups要素のコンテンツを作成し流し込む
	Object.keys(data.groups).forEach(function (group_index){
		var groupNumber = parseInt(group_index) + 1;
		var group = data.groups[group_index];
		var represent = group.represent;
		
		var contents = [
			groupNumber, 
			group.groupName,
			'',
			'<img src="' + thumbnailurl + represent.path + 'thumb/' + represent.pageNum + '.png">',
			represent.fileName + '<br />Page:' + represent.pageNum + '<br />' + represent.timeStamp + '<br />' + represent.authors[0]
		];

		var links = [
			'',
			'/lds2/knowwho?q=' + qword + ' AND ' + group.groupName + '&amp;Word=t&amp;PowerPoint=t&amp;PDF=t&amp;Text=t&amp;XDW=t',
			'javascript:listview(searchinfobygroup(' + group_index + '))',
			slideurl + represent.path + '&page=' + represent.pageNum,
			''	
			]
		var sum_page_per_group = 0;	//関連ページ数

		for (var i = 0; i < authorcount; i++) {
			var num_of_page = group.documents[i].length;

			if (num_of_page > 0) {
				contents.push(num_of_page);
			} else {
				contents.push('-');
			}
			sum_page_per_group = sum_page_per_group + num_of_page;
		}

		contents[2] = sum_page_per_group;

		var newtr = document.getElementById("tbody").insertRow(group_index);
		newtr.id = 'group' + groupNumber;

		for (var i = 0; i < 5 + authorcount; i++) {
			var newcell = document.getElementById(newtr.id).insertCell(i);
			newcell.id = newtr.id + '-' + i;

			if (i < 5 && links[i] !== '') {
				addelem('a', newcell.id, {'myvalue': contents[i], 'myhref': links[i]});
			} else if (i > 4 && contents[i] !== '-') {
				addelem('a', newcell.id, {'myvalue': contents[i], 'myhref': 'javascript:listview(searchinfo(' + group_index + ',' + (i-5) + '))'});
			} else {
				newcell.innerHTML = contents[i];
			}
			if (i === 1 || i === 4) {
				newcell.className = 'alignleft';
			}
		}

	});
}


function addelem(elem, parentId, options){
	if (elem !== 'th' && elem !== 'div' && elem !== 'a') {
		console.log('err');
		return;
	}
	var label = document.createElement(elem);
	if (options) {
		if (options.myvalue) label.innerHTML = options.myvalue;
		if (options.myclass) label.className = options.myclass;
		if (options.myid) label.id = options.myid;
		if (options.mytitle) label.title = options.mytitle;
		if (options.myhref) label.href = options.myhref;
	}
	document.getElementById(parentId).appendChild(label);
}

function searchinfo(r, c){
	if (!data || !data.groups[r] || !data.groups[r].documents[c]) {
		console.log('wrong argument');
		return;
	}

	if (data.groups[r].documents[c].length === 0) {
		console.log('naide');
		return;
	}

	docList = initdocList();
	var groupName = data.groups[r].groupName;
	var representdid = data.groups[r].represent.pageId;

	var docinfo = Object.keys(data.groups[r].documents[c]).map(function (idx){
		var array = [];
		if (data.groups[r].documents[c][idx] === representdid) {
			array[0] = 'true';
		} else {
			array[0] = 'false';
		}
		array[1] = groupName;
		array[2] = data.groups[r].documents[c][idx];
		return array;
	});

	docList.query = document.getElementById("qwordbox").value;
	docList.list = docinfo;
	return docList;
}


function searchinfobygroup(r) {
	if (!data || !data.groups[r]) {
		console.log('wrong argument');
		return;
	}

	docList = initdocList();

	var groupName = data.groups[r].groupName;
	var representdid = data.groups[r].represent.pageId;

	Object.keys(data.authors).forEach(function (c){
		if (!data.groups[r].documents[c]) {
			console.log('wrong argument');
			return;
		}

		if (data.groups[r].documents[c].length !== 0) {
			var docinfo = Object.keys(data.groups[r].documents[c]).map(function (idx){
				var array = [];

				if (data.groups[r].documents[c][idx] === representdid) {
					array[0] = 'true';
				} else {
					array[0] = 'false';
				}

				array[1] = groupName;
				array[2] = data.groups[r].documents[c][idx];
				return array;
			});
			docList.list = docList.list.concat(docinfo);
		}
	});
	docList.query = document.getElementById("qwordbox").value;
	return docList;
}

function searchinfobyauthor(c) {
	if (!data) {
		console.log('wrong argument');
		return;
	}

	docList = initdocList();

	Object.keys(data.groups).forEach(function (r){
		if (!data.groups[r] || !data.groups[r].documents[c]) {
			console.log('wrong argument');
			return;
		}
		if (!data.groups[r].documents[c]) {
			console.log('naide');
			return;
		}
		var groupName = data.groups[r].groupName;
		var representdid = data.groups[r].represent.pageId;

		if (data.groups[r].documents[c].length !== 0) {
			var docinfo = Object.keys(data.groups[r].documents[c]).map(function (idx){
				var array = [];

				if (data.groups[r].documents[c][idx] === representdid) {
					array[0] = 'true';
				} else {
					array[0] = 'false';
				}

				array[1] = groupName;
				array[2] = data.groups[r].documents[c][idx];
				return array;
			});
			docList.list = docList.list.concat(docinfo);
		}
	});
	docList.query = document.getElementById("qwordbox").value;
	return docList;
}

function initdocList(){
	docList.query = '';
	docList.list = [];
	return docList;
}

function getEmproProp(propname, source){
	ajax_post(
		'',	
		function (res){
			return res;
		},
		JSON.stringify({ "cmd":"emproprop", "arg":{ "property":propname, "emproyee":source }})
	);
}


/****************************************************************
ajax関係
これはjqueryにあるはずだからそっちでおきかえる
****************************************************************/
function ajax_async(url, func, method, message){
    if( method != "GET" && method != "POST" ){
        console.log("Invalid method:"+method);
        return;
    }
    if( !window.JSON ){
        console.log("JSON is disabled.");
        return;
    }

    var server = new XMLHttpRequest();
    server.onreadystatechange = function(){
        var READYSTATE_COMPLETED = 4;
        var HTTP_STATUS_OK = 200;

        if( this.readyState == READYSTATE_COMPLETED
        &&  this.status == HTTP_STATUS_OK ){
            if( this.getResponseHeader('Content-Type').indexOf('application/json') != -1 ){
                func(this.responseText);
            }
        }
    };
    server.open(method, url);
    if( method == "POST" ){ server.send(message); }
    else                  { server.send(null);    }
}

function ajax_get(url, func){
    ajax_async(url, func, "GET", null);
}

function ajax_post(url, func, message){
    ajax_async(url, func, "POST", message);
}
