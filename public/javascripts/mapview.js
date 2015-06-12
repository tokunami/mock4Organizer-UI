var docList = {};
var data = {};

var map = function (originaldata){
//function map(data){
	if (!originaldata || !originaldata.groups || !originaldata.authors) {
		$('#groupcount').text('サーバーエラーです');
		data = null;
		//仮おき。受け取ったdataオブジェクトが規定型でない場合の処理
		return;
	}

	data = originaldata;

	var groupcount = data.groups.length;
	if (groupcount === 0) {
		//document.querySelector("#groupcount").textContent = ('検索結果はありませんでした');
		$('#groupcount').text('検索結果はありませんでした');
		return;
	}

	var authorcount = data.authors.length;
	var indextag = ['groupName', 'pageNum', 'representative', 'author'];
	var indextitle = ['文書グループ名', '関連ページ数', '代表ページ', '作成者'];

	$('#groupcount').text(groupcount + '件の文書グループが見つかりました');

	$(document).ready(function (){
		$('#resulttable').dataTable({
			"bFilter": false
		});
	});

	//indextitleをtableのth要素に流し込む
	Object.keys(indextitle).forEach(function (tag_index){
		document.getElementById(indextag[tag_index]).innerHTML = indextitle[tag_index]
	});
	//authorをauthorcountの数に分割する
	document.getElementById('author').colspan = authorcount;
	//受け取ったdataオブジェクトの各authors要素に対してページ数の合計xを算出し、'名前<br />x件'を流し込む
	Object.keys(data.authors).forEach(function (author_index){	//authorsの数だけ繰り返し
		var sum_page_per_author = 0;
		for (var i = 0; i < groupcount; i++) {	//文書グループの数だけ繰り返し
			var pagecount = data.groups[i].documents[author_index].length;	//その文書グループの中の、author_index番目のdocuments要素の数
			sum_page_per_author = sum_page_per_author + pagecount;
		}
		addth(data.authors[author_index] + '<br />' + sum_page_per_author + '件', 'authorname');
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
			'<a href="' + slideurl + represent.path + '&page=' + represent.pageNum + '" id=""><img src="' + thumbnailurl + represent.path + 'thumb/' + represent.pageNum + '.png"></a>',
			represent.fileName + '<br />Page:' + represent.pageNum + '<br />' + represent.timeStamp + '<br />' + data.authors[represent.author]
		];
		var sum_page_per_group = 0;	//関連ページ数

		for (var i = 0; i < authorcount; i++) {
			var num_of_page = group.documents[i].length;
			contents.push(num_of_page);
			sum_page_per_group = sum_page_per_group + num_of_page;
		}

		contents[2] = sum_page_per_group + '<br /> グループの中身を見る';

		var newtr = document.getElementById("tbody").insertRow(group_index);
		newtr.id = 'group' + groupNumber;

		for (var i = 0; i < 5 + authorcount; i++) {
			var newcell = document.getElementById(newtr.id).insertCell(i);
			newcell.innerHTML = contents[i];	
		}
	});
}

function addth(value, parentId, row, col){
	var label = document.createElement('th');
//	var label = $('<th>');
	label.innerHTML = value;
	if (row) label.rowspan = row;
	if (col) label.colspan = col;
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
	console.log(docList);
	return docList;
}

function initdocList(){
	docList.query = '';
	docList.list = [];
	return docList;
}

function listviewtest(docList){
    var listViewWindow = window.open("/lds2/list.html", "listview");
}
