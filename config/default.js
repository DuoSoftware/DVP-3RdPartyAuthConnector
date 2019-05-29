module.exports = {

    "Redis":
        {
            "mode":"instance",//instance, cluster, sentinel
            "ip": "138.197.90.92",
            "port": 6389,
            "user": "duo",
            "password": "DuoS123",
            "sentinels":{
                "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
                "port":16389,
                "name":"redis-cluster"
            }

        },


    "Security":
        {

            "ip" : "45.55.142.207",
            "port": 6389,
            "user": "duo",
            "password": "DuoS123",
            "mode":"instance",//instance, cluster, sentinel
            "sentinels":{
                "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
                "port":16389,
                "name":"redis-cluster"
            }
        },

    "Host":{
        "Ip":"0.0.0.0",
        "Port":"3645",
        "Version":"1.0.0.0"
    },

    "ThirdParty":{
        "AuthUrl":"https://errrr/token",
        "Secret":"dfsfsdf",
        "EventUrl":"gfdgd"
    }
};