var assert		= require('assert')
 ,	cheerio		= require('cheerio')
 ,	fs			= require('fs')
 ,	webdriver	= require('selenium-webdriver');


var driver = new webdriver.Builder().
			 usingServer('http://localhost:4444/wd/hub').
			 withCapabilities(webdriver.Capabilities.chrome()).
			 build();

var user   = process.env.USR
  , passwd = process.env.PW;

webdriver.WebDriver.prototype.saveScreenshot = function (filename) {
	filename = filename.replace('|', '_');
	return driver.takeScreenshot().
		then(function (data) {
			fs.writeFile (filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function (err) {
				if (err) throw err;
			});
		});
}

var searchkey = '';

var uri = '';
var uri_search = uri;

function writefile(filename, datasource, callback) {
	fs.writeFile(filename, datasource, function (err) {
		if (err) {
			console.log(filename, err);
			return;
		}
		if (!callback) {
			return;
		}
		callback(null, filename);
	});
}

function takescreenshot(filename) {
	driver.takeScreenshot().then(function (img) {
		writefile(filename, new Buffer(img, 'base64'));
	});
}

before(function (callback) {
	//error handling
	process.on('uncaughtException', function (err) {
		console.log('My error handler...' + err);
		if (driver) {
			//recording screenshot
			takescreenshot('test.png');
		}
	});
	//open start page

	driver.get(uri_search);
	takescreenshot('1_login.png');
	driver.findElement(webdriver.By.name('username')).sendKeys(user);
	driver.findElement(webdriver.By.name('password')).sendKeys(passwd);
	driver.findElement(webdriver.By.className('login-button')).click().then(callback);
});

after(function (callback) {
	driver.quit().then(callback);
});

describe('startpage', function () {
	it ('1_should response startpage', function (callback){
		driver.get(uri_search);
		driver.getPageSource().then(function (source){
			$ = cheerio.load(source);
      assert.equal($('title').text(), 'オーガナイザv1.0');
      assert.equal($('#xlsselector').attr('checked'), undefined);
			assert.equal($('#docselector').attr('checked'), 'checked');
      assert.equal($('#pptselector').attr('checked'), 'checked');
      assert.equal($('#pdfselector').attr('checked'), 'checked');
      assert.equal($('#txtselector').attr('checked'), 'checked');
      assert.equal($('#xdwselector').attr('checked'), 'checked');
		}).then(function (){
      takescreenshot('1_initial.png');
    }).then(callback);
	});
});

// describe('doapage', function () {
// 	it ('2_should response doa page', function (callback) {
// 		driver.get(uri + '/doa');
// 		takescreenshot('2_doa.png');
// 		//ステータスコードの確認
// 		callback();
// 	});
// });

describe('primary search page', function (){
	it ('3-1_should return "Organizing"', function (callback){
		driver.get(uri_search);
		driver.findElement(webdriver.By.name('q')).sendKeys(searchkey);
		driver.findElement(webdriver.By.id('querySubmit')).click();
    driver.getPageSource().then(function (source){
      $ = cheerio.load(source);
      assert.equal($('title').text(), searchkey + 'の検索結果');
      assert.equal($('#groupcount').text(), 'Organizing');
    }).then(function (){
      takescreenshot('3_Organizing.png');
    }).then(function (){
      setTimeout(function(){callback();}, 10000);
    });
	});

  it ('3-2_should return mapview', function (callback){
    driver.getPageSource().then(function (source){
      $ = cheerio.load(source);
      assert.equal($('title').text(), searchkey + 'の検索結果');
      assert.equal($('#qwordbox').val(), searchkey);
      assert.equal($('#groupcount').text(), '10件の文書グループが見つかりました');
      assert.equal($('#resulttable_info').text(), 'Showing 1 to 10 of 10 entries');
    }).then(function (){
      takescreenshot('3_mapview.png');
    }).then(callback);
  });
});

describe('map view', function (){
	it ('5_should work scroll', function (callback){
		// driver.findElement(webdriver.By.linkText('[Open]')).click().then(function () {
		// 	//className('cont radmore-js-section')のstyleのheightが100より大きくなっていることを見ればいいけど指定がむずい
		// 	//driver.findElement(webdriver.By.linkText('[Close]')).click();
		// });
    // ((JavascriptExecutor) driver).executeScript("scroll(0,250);");
    //WebElement scroll = driver.findElement(webdriver.By.id('tbody'));
    //scroll.sendKeys(Keys.PAGE_DOWN);
		//driver.findElement(webdriver.By.linkText('[Close]')).click();
		callback();
	});

  it ('6_should display department', function (callback){
    driver.getPageSource().then(function (source){
      $ = cheerio.load(source);
      assert.equal($('#author_dep0').attr('title'), '');
    }).then(callback);
	});

	it ('7_should work sorting', function (callback){
    var items = ['groupName', 'pageNum', 'representativetitle', 'author0'];
    var i = 1;
    items.forEach(function (item){
      driver.findElement(webdriver.By.id(item)).click().then(function (){
        setTimeout(takescreenshot('7-' + i + '_sortby' + item + '.png'), 1000);
        i++;
      });
    });
		callback();//これ非同期かなあ
	});

  it ('8-0_should execute refine search(preparation)', function (callback){
    driver.findElement(webdriver.By.linkText('組織体制')).click();
    setTimeout(function (){callback();}, 10000);
  });
  it ('8_should execute refine search', function (callback){
    takescreenshot('8_refine search.png');
    callback();
  });
  it ('9_should move primary page', function (callback){
    driver.findElement(webdriver.By.id('qwordbox')).clear();
		driver.findElement(webdriver.By.id('querySubmit')).click();
    driver.getPageSource().then(function (source){
      $ = cheerio.load(source);
      assert.equal($('title').text(), 'オーガナイザv1.0');
      assert.equal($('#xlsselector').attr('checked'), undefined);
			assert.equal($('#docselector').attr('checked'), 'checked');
      assert.equal($('#pptselector').attr('checked'), 'checked');
      assert.equal($('#pdfselector').attr('checked'), 'checked');
      assert.equal($('#txtselector').attr('checked'), 'checked');
      assert.equal($('#xdwselector').attr('checked'), 'checked');
    }).then(function (){
      takescreenshot('9_primary.png');
    }).then(callback);
  });
  it ('10-0_should move listview(preparation)', function (callback){
    var uri_map = 'http://scheduler1.rdh.fujixerox.co.jp:25207/lds2/knowwho?q=%E7%9B%B4%E5%88%97%E5%8C%96&Word=t&PowerPoint=t&PDF=t&Text=t&XDW=t';
    driver.get(uri_map);
    setTimeout(function (){callback();}, 10000);
  });
  it ('10_should move listview', function (callback){
    driver.findElement(webdriver.By.linkText('51')).click().then(function (){
      driver.getAllWindowHandles().then(function (allhandles) {
        driver.switchTo().window(allhandles[1]);
      });
    }).then(function (){
      takescreenshot('10_listview.png');
    }).then(callback);
  });
});

describe ('list view', function (){
  it ('11_should work sorting', function (callback){
    var items = ['groupName', 'author', 'file', 'contents'];
    var i = 1;
    items.forEach(function (item){
      driver.findElement(webdriver.By.id(item)).click().then(function (){
        setTimeout(takescreenshot('11-' + i + '_sortby' + item + '.png'), 2000);
        i++;
      });
    });
    callback();//これ非同期かなあ
  });

  it ('12_should move thumbnail', function (callback){
    //TODO サムネイルのリンクにidわりつける
//    driver.findElement(webdriver.By.linkText('<img src="/lds2/thumb?path=/dcpf3d999/2011/10/24/did067b8b61-77fa-4a85-85cc-4bf88850c78a/&page=7">')).click();
    callback();
  });

});
