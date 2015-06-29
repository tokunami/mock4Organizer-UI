$(document).ready(function (){
	$('#resultlist').dataTable({
		"bFilter": false,
		"scrollY": "520px",
		"scrollCollapse": true,
		"paging": false,
		"order": [],
		"aoColumnDefs": [
			{ "bSortable": false, "aTargets": [0]},
			{ "bSortable": false, "aTargets": [3]}
		]
	});
});

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

	var indextag = ['representative', 'groupName', 'author', 'thumbnail', 'file', 'contents'];
	var indextitle = [
	'<div style="width: 3em">代表<br>ページ</div>',
	'<div style="width: 5em">文書<br>グループ名</div>',
	'<div style="width: 5em">作成者</div>',
	'<div style="width: 8em">サムネイル</div>',
	'<div style="width: 12em">ファイル名',
	'内容'
	];


	$('#searchword').text('検索ワード：' + data.query);

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

		for (var i = 0; i < indextag.length; i++) {
			var newcell = document.getElementById(newtr.id).insertCell(i);
			newcell.innerHTML = contents[i];
			if (i === 1 || i === 4) {
				newcell.className = 'alignleft';
			}
			if (i === 5) {
				newcell.className = 'alignleft';
				newcell.className += ' unselectable';
			}
		}
	});
}