 const { format} = require('date-fns');
 //uuid helps create a unique id 
 const { v4: uuid} = require('uuid');
 const fs = require('fs');
 const fsPromises = require('fs').promises;
 const path = require('path');

 const logEvents = async (mssg, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${mssg}\n`;

    try {
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
    } catch (error) {
        console.log(error)
    }

 }

const logger =  (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    console.log(`${req.method} ${req.path}`);
    next();
}

module.exports = {logEvents, logger};
