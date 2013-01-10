var mfilehandle = require('fs');
mfilehandle.readFile('app.js','utf-8', function(err,data){
	if(err)
		console.log('Fail to read file \'app.js\'.');
	else{
		console.log(data);
		console.log('.....reversed....')
		var len = data.length;
		console.log('length:%d',len);
		var res='';
		for(i=len-1;i>=0;i--)
		 res+=data[i];
		 console.log(res);
	}
});
console.log('end');