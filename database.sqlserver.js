var config = {
    server: '10.51.13.180',
    options: {
        encrypt: false,
        database: "dataven_i2",
        rowCollectionOnRequestCompletion: true,
        rowCollectionOnDone: true
     },
     authentication: {
         type: "default",
         options: {
             userName: "sa",
             password: "SPq32019*."
         }
     }
};

module.exports = config;