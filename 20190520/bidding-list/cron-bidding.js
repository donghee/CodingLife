var cron = require('node-cron');

//execute every 1 min
//cron.schedule('*/1 * * * *', function(){
//execute every 6 am
cron.schedule('0 6 * * *', function(){
    var shell = require('./child_helper');

    var commandList = [
        "node etri-ebid-bidding.js",
        "sleep 60",
        "node g2b-bidding.js",
    ]

    shell.series(commandList , function(err){
        console.log('done')
    });
});
