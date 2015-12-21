const wallpaper = require('wallpaper');
const request = require('request');
const fs = require('fs');
const sizeOf = require('image-size');

var subreddits = "EarthPorn+wallpapers+wallpaper";
var minHeight = 1000;
var minWidth = 1500;
var info;

var checkDims = function(callback) {
	dimensions = sizeOf('wall.jpg');
	if (dimensions.width >= minWidth && dimensions.height >= minHeight) {
		callback(true);
	} else {
		callback(false);
	}
}

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    //console.log('content-type:', res.headers['content-type']);
    //console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var downloadWall = function(image, index) {
	download(image, 'wall.jpg', function() {
    	console.log('Wallpaper downloaded.');
    	checkDims(function(ok) {
    		if(ok) {
    			setTimeout(setWall, 3000);
    		} else {
    			console.log('Wallpaper @ ' + image + " too small.");
    			findWall(info, index+1);
    		}
    	});
    	
    });
}

var setWall = function() {
	wallpaper.set('wall.jpg').then(() => {
	    console.log('Wallpaper Set.');
	});
}

var findWall = function(json, index) {

	if (typeof index === 'undefined') {
		index = 0;
	}

	for (var i = index; i < json.data.children.length; i++) {
		console.log('URL #' + i + ' ' + json.data.children[i].data.url);
		if (json.data.children[i].data.url.indexOf('.jpg') > -1) {
			var image = json.data.children[i].data.url;

			console.log('Wallpaper found at: ' + image);
			downloadWall(image, i);
			break;
		} else if (json.data.children[i].data.url.indexOf('.png') > -1) {
			var image = json.data.children[i].data.url;

			console.log('Wallpaper found at: ' + image);
			downloadWall(image, i);
			break;
		}
	}
}

var getWall = function(options) {

	var url = 'http://reddit.com/r/' + subreddits + '/.json';

	console.log("Contacting reddit servers...");

	request(url, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	    	info = JSON.parse(body)
	    	findWall(info);
	    	
/*
	    console.log('Wallpaper found at: ' + image);

	    download(image, 'wall.jpg', function() {
	    	console.log('Wallpaper downloaded.')
	    	setTimeout(setWall, 3000);
	    });
*/

	    } else {
	    	console.log('Error in JSON request.');
	    }
	});
}

/*

wallpaper.get().then(imagePath => {
    console.log(imagePath); //prints wallpaper path
});

*/

getWall();
