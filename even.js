var EventEmitter = require('events').EventEmitter;
var cEven = new EventEmitter();

cEven.on('hah_event',function(){
	console.log('timer come from hah_event.');
});
setTimeout(function(){cEven.emit('hah_event');},
1000);