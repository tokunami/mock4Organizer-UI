function map(data){
	if (!data.groups) {
		$('#groupcount').text('エラーです');
		//仮おき。受け取ったdataオブジェクトが規定型でない場合の処理
		return;
	}

	var groupcount = Object.keys(data.groups).length;
	if (groupcount === 0) {
		//document.querySelector("#groupcount").textContent = ('検索結果はありませんでした');
		$('#groupcount').text('検索結果はありませんでした');
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

	var authorcount = Object.keys(data.authors).length;
	var indextag = ['groupName', 'pageNum', 'representative', 'author'];
	var indextitle = ['文書グループ名', '関連ページ数', '代表ページ', '作成者'];

	$('#groupcount').text(groupcount + '件の文書グループが見つかりました');

	$(document).ready(function (){
		$('#resulttable').dataTable({
			"bFilter": false
		});
	});

	Object.keys(indextitle).forEach(function (tag_index){
		document.getElementById(indextag[tag_index]).innerHTML = indextitle[tag_index];
		//$('#groupName').html('グループ名');
	});

	document.getElementById('author').colspan = authorcount;
//	$('#author').attr('colspan', authorcount);
	
	Object.keys(data.authors).forEach(function (author_index){
		var sum_page_per_author = 0;

		for (var i = 0; i < groupcount; i++) {
			sum_page_per_author = sum_page_per_author + Object.keys(data.groups[i].documents[author_index]).length;
		}
		addth(data.authors[author_index] + '<br />' + sum_page_per_author + '件', 'authorname');
	});

	var thumbnailurl = 'pictures';	//http://servername/lds/document

	Object.keys(data.groups).forEach(function (group_index){
		var groupNumber = parseInt(group_index) + 1;
		var group = data.groups[group_index];
		var represent = group.represent;
		
		var contents = [
			groupNumber, 
			group.groupName,
			'',
			'<a href="" id=""><img src="' + thumbnailurl + represent.path + 'thumb/' + represent.pageNum + '.png"></a>',
			represent.fileName + '<br />Page:' + represent.pageNum + '<br />' + represent.timeStamp + '<br />' + data.authors[represent.author]
		];
		var sum_page_per_group = 0;	//関連ページ数

		for (var i = 0; i < authorcount; i++) {
			var num_of_page = Object.keys(group.documents[i]).length;
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