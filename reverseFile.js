//By Jian hui Chen
//At CDOT
//Jan 16 2013

//functional:
//Write a simple NodeJS program that loads a text file, 
//reverses its contents (on a per character basis) and saves it to a new location.  
//It should take as command line parameters the name of the input file and the output file.

//Test:
//1.reverse file1 to file2
//2.reverse file2 to file3
//3.compare file1 to file3 -->they must be same....
//So =======>
//On the command line
//node reverseFileContent.js reverseFileContent.js rev.txt
//node reverseFileContent.js rev.txt bkrevd.txt
//diff reverseFileContent.js bkrevd.txt
//....>
//Or 
//download test_reverFileConent
//chmod 775 test_reverFileConent
//run test_reverFileConent
//


var fshandle = require('fs');
/**
 *This method used to reverse content in the 'buf',
 *@param buf, contains data read from the source file.
 *@param szbuf, length of the data in the buf.
 */
reverseBuffer = function(buf) {
	var szbuf = buf.length;
	if(szbuf>1){
		var stmp = buf[0];
	    var i = 0;
	    var halfsize = szbuf/2;
	    while (i<halfsize) {
	        stmp = buf[szbuf-i-1];
	        buf[szbuf-i-1]=buf[i];
	        buf[i]=stmp;
	        i++;
	    };
	}  
};

/**
 *It is the entry method.
 *this method receives two file as source file(reading from),dest file(writing to).
 *It makes sure source file is exsiting and overwrite dest file.
 *Then,start to read the source file......
 *usage: node reverseFileContent.js sourceFile destFile;
 */
tsMain = function() {
	if(process.argv.length<4) 	throw new Error('usage: node reverseFileContent.js sourceFile destFile');
	fshandle.open(process.argv[3],'w+',function(err,fd) {
		if(err) throw err;
		//dest file exists,so delete and close it.
		fshandle.close(fd,function(){
			fshandle.readFile(process.argv[2],function(err,buf) {
				if(err) throw err;
				reverseBuffer(buf);
				fshandle.writeFile(process.argv[3],buf,function(){
					if(err) throw err;
					console.log('Done!');
				});//write
			});//read
		});//close
	});//open
};

try {
	tsMain();
}
catch(e){
	console.log(e);
	process.exit(-1);
};