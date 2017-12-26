var request = require('request');
var CoinKey = require('coinkey');
var wait=require('wait.for');
var sleep = require('sleep');
var lineReader = require('line-reader');
var keycandidate = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9","a","b","c","d","e","f"];
var keyTemplate = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
var fs = require('fs');
var testKey = CoinKey.fromWif('KxK6EeGrLzyVj9od2fG3eGpQdP8MJPVmQYBKobuD3ZqJLGWUivbx');
var keyIndex ;
var receiveIndex;
var balanceIndex;


wait.launchFiber(main);



function main()
{
	//keyIndex = 16316;

	//keyIndex  = "test";

/*
lineReader.eachLine('randomnames.txt', function(line, last,cb) {
 
	keyIndex  = line;
	var randomKey = CoinKey(new Buffer(StrToHex(keyIndex), 'hex'));
	InspectCoinKey(randomKey,cb);

});*/

	searchIndex = 0;
	receiveIndex = 0;
	balanceIndex = 0;
	
	while(true)
	{
		var randomKey = GenerateARandomCoinKey();

		
		//var randomKey = CoinKey(new Buffer(pad(searchIndex,64), 'hex'));
		//randomKey.compressed = false;
		

		/*
		if(keyIndex%100000 == 0)
			console.log("test:",keyIndex);	

		var lookingName = "1Henry";

		if(randomKey.publicAddress.startsWith(lookingName))
		{
			var resultStr = "------------------------------------------\n";
			resultStr += "private(Wif):"+randomKey.privateWif+"\n";
			resultStr += "private(hex):"+randomKey.privateKey.toString('hex')+"\n";
			resultStr += "public:"+randomKey.publicAddress+"\n";	

			fs.appendFileSync('result_name_'+lookingName+'.txt', resultStr, function(err) {
				
			});

			console.log(resultStr);	
		}*/

		console.log("search:"+searchIndex  + " received:"+receiveIndex + " balanced:"+balanceIndex);
		wait.for(InspectCoinKey,randomKey);
		searchIndex++;
		sleep.sleep(1);
	}
}

function StrToHex(str)
{
	var result = "";

	for(var i = 0 ; i < str.length && i < 32; i++)
	{
		
		result += str.charCodeAt(i).toString(16);
	}

	result = pad(result,64);

	return result;
}


function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function GenerateARandomCoinKey()
{
	var currentSearchKey = keyTemplate;

	for(var i = 0 ; i < 64 ; i ++)
	{
		currentSearchKey = currentSearchKey.replace("A",keycandidate[getRandomInt(0,15)]);
	}

	return CoinKey(new Buffer(currentSearchKey, 'hex'));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function InspectCoinKey(coinkey,callback)
{
	CheckReceive(coinkey,function(result)
	{
		if(result == 0 ){
			console.log("[Empty]"+coinkey.publicAddress);
			if(callback!=null)callback();
		}
		else
		{
			var resultStr = "------------------------------------------\n";
			resultStr += "private(Wif):"+coinkey.privateWif+"\n";
			resultStr += "private(hex):"+coinkey.privateKey.toString('hex')+"\n";
			resultStr += "public:"+coinkey.publicAddress+"\n";		
			resultStr += "received:"+result+"\n";

			receiveIndex++;

			CheckBalance(coinkey,function(resultB)
			{
				resultStr+= "balance:"+resultB+"\n";

			if(resultB>0)
				balanceIndex++;

				
					

				console.log(resultStr);
				fs.appendFile('result.txt', resultStr, function(err) {

				if(callback!=null)callback();
			});
		});
			
		}
		
	});
}

function CheckBalance(coinKey,callback)
{
	var requestStr = "https://blockexplorer.com/api/addr/"+coinKey.publicAddress+"/balance";

	request(requestStr, function (error, response, body) 
	{

		if(body.includes("Code")||body.includes("head")||body.includes("status"))
		{
			console.log("[Pending]:"+coinkey.publicAddress);
			sleep.sleep(1);
			CheckBalance(coinkey,callback);
		}
		else
		{
			callback(body);
		}
	});

}

function CheckReceive(theCoinKey,callback)
{
	var requestStr = "https://blockexplorer.com/api/addr/"+theCoinKey.publicAddress+"/totalReceived";

	request(requestStr, function (error, response, body) 
	{

		if(body.includes("Code")||body.includes("head")||body.includes("status"))
		{
			console.log("[Pending]:"+theCoinKey.publicAddress);
			sleep.sleep(1);
			CheckReceive(theCoinKey,callback);
		}
		else
		{
			callback(body);
		}
	});

}

