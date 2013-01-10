//In order to make it more complex, I use fs.open instead of fs.appendFile.
//By Jian hui Chen
//At CDOT
//Jan 9 2013

//functional:
//Write a simple NodeJS program that loads a text file, 
//reverses its contents (on a per character basis) and saves it to a new location.  
//It should take as command line parameters the name of the input file and the output file.

//Test:
//On the command line
//input: node reverseFileContent.js reverseFileContent rev.txt
//input: node reverseFileContent.js rev.txt bkrevd.txt
//then open file reverseFileContent.js and bkrevd.txt, to compare them...

var fshandle = require('fs');
var buffer = new Buffer(1025);
var readOffset = 0;
var bufContentLength = 0;
var BUFF_SIZE = 1024;
var readingSize = 0;//bytes would be read from file on the coming reading step.
var fdReadFile;
var filesize_ReadFile=0;
var fdWriteFile;
getOffset = function() {
	var retOffset = filesize_ReadFile-BUFF_SIZE*(++readOffset);
	readingSize = BUFF_SIZE;
	if(retOffset<=0) {
		readingSize = filesize_ReadFile-BUFF_SIZE*(readOffset-1);
		retOffset = 0;
	}
	return retOffset;
};

reverseBuffer = function(buf,szbuf) {
	var stmp = new Buffer(szbuf);
    var i = 0;
    while (i<szbuf) {
        stmp[i] = buf[szbuf-i-1];
        i++;
    }    
    stmp.copy(buf,0,0,szbuf);
};

readOpenedFile = function() {
	if(fdReadFile) {
		var readOffset = getOffset();
		fshandle.read(fdReadFile,buffer,0,readingSize,readOffset,function(err,bytesread,buf) {
			if(err) {
				console.log('!Error when reading file...');
				console.log(err);
				//process.trace();
				fshandle.close(fdReadFile);
				fshandle.close(fdWriteFile);
				process.exit(-1);
			}
			else {
				bufContentLength = bytesread;
				reverseBuffer(buf,bytesread);
				//console.log(buffer.toString('ascii', 0, bytesread));
				process.nextTick(writeOpenedFile);//try an other way on calling process.nextTick.
				if(bufContentLength<BUFF_SIZE) {//end of file...close the file.
					fshandle.close(fdReadFile);
					console.log('Finished reading...,file closed.');
				}
			}
		});
	}
	else {
		console.log('!Error when reading file. file is not opened...');
		fshandle.close(fdReadFile);
		fshandle.close(fdWriteFile);
		process.exit(-2);
	};
};

writeOpenedFile = function() {
	if(fdWriteFile) {
		fshandle.write(fdWriteFile,buffer,0,bufContentLength,null,function(err,written,buf){
			if(err) {
				console.log('!Error when writing file...');
				console.log(err);
				//process.trace();
				fshandle.close(fdReadFile);
				fshandle.close(fdWriteFile);
				process.exit(-1);
			}
			else {
				if(bufContentLength<BUFF_SIZE) {
					fshandle.close(fdWriteFile);
					console.log('Finished writing...,file closed.');
				}
				else {
					process.nextTick(function(){
						console.log('Reading file....');
						readOpenedFile();
					});
				}
			}
		});
	}
	else {
		console.log('!Error when writing file. file is not opened...');
		fshandle.close(fdReadFile);
		fshandle.close(fdWriteFile);
		process.exit(-2);
	}
}

tsMain = function() {
	if(process.argv.length<4) {
		console.log('The command line must as:');
		console.log('node reverseFileContent.js readingFileName writingFileName');
		process.exit(0);
	}
	else {
		//Checking the file to be reveresed is existing
		fshandle.exists(process.argv[2],function(ests) {
			if(!ests) {
				console.log('File:%s does not exist.',process.argv[2]);
				process.exit(0);
			}
			//File is there, then lets to reverse it.
			//Checking the writing file if it exists.
			fshandle.open(process.argv[3],'w+',function(err,fd) {
				if(err) {//file to write exists,so delete it.
					console.log('!Error when creating file %s ....', process.argv[3]);
					console.log(err);
					process.exit(0);
				}
				else {
					fdWriteFile = fd;
					//Opening the file to be reversed,then read.
					fshandle.open(process.argv[2],'r',function(err,fd) {
						if(err) {
							console.log('!Error when opening file %s ....', process.argv[2]);
							console.log(err);
							fshandle.close(fdWriteFile);
							process.exit(0);
						}
						else {
							fdReadFile = fd;
							//geting file size then start to read.
							fshandle.lstat(process.argv[2],function(err,stats){
								filesize_ReadFile = stats.size;
								if(!err) {
									readOpenedFile();
								}
								else {
									console.log('!Error when geting file %s size....', process.argv[2]);
									console.log(err);
									fshandle.close(fdWriteFile);
									fshandle.close(fdReadFile);
									process.exit(0);
								}
							});
							
						}
					});
				}
			});
		});
	}
}

tsMain();
