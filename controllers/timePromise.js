const timePromise = function(ms, promise, socket){
    let timeOut = new Promise((res,rej)=>{
        let id = setTimeout(()=>{
            try {
                clearTimeout(id);
                socket.close();
                socket.disconnect();
                rej(false);   
            } catch (error) {
                rej(false)
            }
        }, ms)
    });

    return Promise.race([
        promise,
        timeOut
    ]);
};

module.exports = timePromise;