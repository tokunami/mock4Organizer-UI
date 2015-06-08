function list(data){
	if (!data.query) {
//		$('#groupcount').text('エラーです');
		//仮おき。受け取ったdataオブジェクトが規定型でない場合の処理
		return;
	}

	var listcount = Object.keys(data.list).length;
	if (listcount === 0) {
		//document.querySelector("#groupcount").textContent = ('検索結果はありませんでした');
//		$('#groupcount').text('検索結果はありませんでした');
		return;
	}

	function addth (value, parentId, row, col){
		var label = document.createElement('th');
//		var label = $('<th>');
		label.innerHTML = value;
		if (row) label.rowspan = row;
		if (col) label.colspan = col;
		document.getElementById(parentId).appendChild(label);
	}

//	var authorcount = Object.keys(data.authors).length;
	var indextag = ['representative', 'groupName', 'author', 'file', 'contents'];
	var indextitle = ['代表ページ', 'グループ名', '作成者', 'ファイル', '内容'];


	$('#searchword').text('検索ワード：' + data.query);

	$(document).ready(function (){
		$('#resultlist').dataTable({
			"bFilter": false
		});
	});

	//indextitleをtableのth要素に流し込む
	Object.keys(indextitle).forEach(function (tag_index){
		document.getElementById(indextag[tag_index]).innerHTML = indextitle[tag_index]
	});

	var thumbnailurl = 'pictures';	//http://servername/lds/document
	var slideurl = 'slide';

	//受け取ったdataオブジェクトの各要素のコンテンツを作成し流し込む
	Object.keys(data.list).forEach(function (group_index){
		var listNumber = parseInt(group_index) + 1;
		var list = data.list[group_index];
		var represent;
		
		if (list.represent === true) {
			represent = '★';
		} else {
			represent = '';
		}

		var contents = [
			represent, 
			list.clusterFacet,
			list.登録者名[0],
			'<a href=><img src="' + thumbnailurl + list.path + 'thumb/' + '.png"></a>',
			list.ファイル名 + '<br />Page:' + list.ページ + '<br />' + list.登録日時,
			list.概要
		];

		var newtr = document.getElementById("tbody").insertRow(group_index);
		newtr.id = 'list' + listNumber;

		for (var i = 0; i < 6; i++) {
			var newcell = document.getElementById(newtr.id).insertCell(i);
			newcell.innerHTML = contents[i];	
		}
	});
}