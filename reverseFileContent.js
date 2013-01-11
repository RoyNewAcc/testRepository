//In order to make it more complex, I use fs.open instead of fs.appendFile.
//By Jian hui Chen
//At CDOT
//Jan 9 2013

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
//Result as:
/**
jhchen@tien-desktop:~/nodelab$ ./test_reverFileConent 
Reading file....
Reading file....
Reading file....
Reading file....
Reading file....
Finished reading...,file closed.
Finished writing...,file closed.
Reading file....
Reading file....
Reading file....
Reading file....
Reading file....
Finished reading...,file closed.
Finished writing...,file closed.
*/

var fshandle = require('fs');
var BUFF_SIZE = 1024;
var buffer = new Buffer(BUFF_SIZE);
var readOffset = 0;
var bufContentLength = 0;
var readingSize = 0;//bytes would be read from file on the coming reading step.
var fdReadFile;
var filesize_ReadFile=0;
var fdWriteFile;

/**
 *The method used for locating the beginning position in the source file, 
 *from where to read data into buffer. Cuz, program is reading the source file from bottom to top.
 *It is re-signing 'global' readingSize in case the size of content in the file is less than 
 *BUFF_SIZE.
 *It returns the offset.
 */
getOffset = function() {
	var retOffset = filesize_ReadFile-BUFF_SIZE*(++readOffset);
	readingSize = BUFF_SIZE;
	if(retOffset<=0) {
		readingSize = filesize_ReadFile-BUFF_SIZE*(readOffset-1);
		retOffset = 0;
	}
	return retOffset;
};

/**
 *This method used to reverse content in the 'buf',
 *then copy it to 'global' buffer.
 *@param buf, contains data read from the source file.
 *@param szbuf, length of the data in the buf.
 */
reverseBuffer = function(buf,szbuf) {
	var stmp = new Buffer(1);
    var i = 0;
    var halfsize = szbuf/2;
    buf.copy(buffer,0,0,szbuf);
    while (i<halfsize) {
        stmp[0] = buf[szbuf-i-1];
        buf[szbuf-i-1]=buf[i];
        buf[i]=stmp[0];
        i++;
    };    
    
};
/**
 *This method reads content from source file into buffer 
 *according to readingSize(usually, BUFF_SIZE);
 *because it is reading source file from bottom to top, it call getOffset() 
 *to get the right beginning position in the source file.
 *Then it calls reverseBuffer() to reverse read content.
 *After those, it calls function writeOpenedFile by process.nextTick() to write.....
 */
readOpenedFile = function() {
	if(fdReadFile) {
		var readOffset = getOffset();
		fshandle.read(fdReadFile,buffer,0,readingSize,readOffset,function(err,bytesread,buf) {
			if(err) {
				throw new Error('!Error when reading file...');
			}
			else {
				bufContentLength = bytesread;
				reverseBuffer(buf,bytesread);
				process.nextTick(writeOpenedFile);//try an other way on calling process.nextTick.
				if(bufContentLength<BUFF_SIZE) {//end of file...close the file.
					fshandle.close(fdReadFile);
					console.log('Finished reading...,file closed.');
				}
			}
		});
	}
	else {
		throw new Error('!Error when reading file. file is not opened...');
	};
};
/**
 *This method writes data holding by the 'global' buffer into dest file
 *according its content size(bufContentLength).
 *Here,it writes dest file from begin to end.
 *@fdWriteFile,the handler of dest file.
 */
writeOpenedFile = function() {
	if(fdWriteFile) {
		fshandle.write(fdWriteFile,buffer,0,bufContentLength,null,function(err,written,buf){
			if(err) {
				throw new Error('!Error when writing file...');
				//process.exit(-1);
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
		throw new Error('!Error when writing file. file is not opened...');
	}
}
/**
 *It is the entry method.
 *this method receives two file as source file(reading from),dest file(writing to).
 *It makes sure source file is exsiting and overwrite dest file.
 *It checks source file size, and signs it to filesize_ReadFile.
 *Then,start to read the source file......
 *usage: node reverseFileContent.js sourceFile destFile;
 */
tsMain = function() {
	if(process.argv.length<4) {
		console.log('usage: node reverseFileContent.js sourceFile destFile');
		process.exit(0);
	}
	else {
		//Checking the sourceFile if it exists
		fshandle.exists(process.argv[2],function(ests) {
			if(!ests) {
				console.log('File:%s does not exist.',process.argv[2]);
				process.exit(0);
			}
			//File is there, then lets to reverse it.
			//Checking the dest file if it exists.
			fshandle.open(process.argv[3],'w+',function(err,fd) {
				if(err) {
					throw new Error('!Error when creating file %s ....can\'t open file.', process.argv[3]);
				}
				else {//dest file exists,so delete it.
					fdWriteFile = fd;
					//Opening the source file .
					fshandle.open(process.argv[2],'r',function(err,fd) {
						if(err) {
							throw new Error('!Error when opening file %s ....can\'t open file.', process.argv[2]);
						}
						else {
							fdReadFile = fd;
							//geting source file size then start to read.
							fshandle.lstat(process.argv[2],function(err,stats){
								filesize_ReadFile = stats.size;
								if(!err) {
									readOpenedFile();
								}
								else {
									throw new Error('!Error when geting file %s size...can\'t determine file size.', process.argv[2]);
								}
							});
						}
					});
				}
			});
		});
	}
};

try {
	tsMain();
}
catch(e){
	console.log(e);
	if(fdWriteFile) fshandle.close(fdWriteFile);
	if(fdReadFile) fshandle.close(fdReadFile);
	process.exit(-1);
};