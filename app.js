var simHttp = require('http');
simHttp.createServer(function(req,res){
	res.writeHeader(200,{'Content-Type': 'text/html'});
	res.write('<h1>I am coming for it.</h1>');
	res.write('<p> Back-end javascript is my lover...</p>');
	res.write('<p> It cowork with c/c++...hah hah</p>');
	}).listen(3000);