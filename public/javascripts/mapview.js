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

	var authorcount = Object.keys(data.authors).length;

	$('#groupcount').text(groupcount + '件の文書グループが見つかりました');
	var indextitle = ['', '文書グループ名', '関連ページ数', '代表ページ', '作成者'];

	$(document).ready(function() {
		$('#resulttable').dataTable({
			"bFilter": false
		});
	});


//	document.getElementById('groupName').innerHTML = 'グループ名';
	$('#groupName').html('グループ名');
	$('#pageNum').html('関連ページ数');
	$('#representative').html('代表ページ');
	$('#author').html('作成者');
	$('#author').attr('colspan', authorcount);
//	document.getElementById('author').colspan = authorcount;

	function addth (value, parentId) {
		var authorlabel = document.createElement('th');
//		var authorlabel = $('<th>');
		authorlabel.innerHTML = value;
		document.getElementById(parentId).appendChild(authorlabel);
	}

	
	
	Object.keys(data.authors).forEach(function (index){
		var sum = 0;
		for (i = 0; i < groupcount; i++) {
			sum = sum + Object.keys(data.groups[i].documents[index]).length;
		}
		addth(data.authors[index] + '<br />' + sum + '件', 'authorname');
	});
	
	Object.keys(data.groups).forEach(function (index){
		var contents = [(parseInt(index) + 1), data.groups[index].groupName, '', data.groups[index].represent.fileName];

		for (var i =0; i < authorcount; i++) {
			contents.push(Object.keys(data.groups[index].documents[i]).length);
		}

		var newtr = document.getElementById("tbody").insertRow(index);
		newtr.id = 'group' + (parseInt(index) + 1);

		for (var i = 0; i < 4 + authorcount; i++) {
				document.getElementById(newtr.id).insertCell(i).innerHTML = contents[i];
			}

	});

}