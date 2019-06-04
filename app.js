process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
let restify = require('restify');
let config = require('config');
let messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
let logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
let jwt = require('restify-jwt');
let request = require('request');
let uuidv1 = require('uuid/v1');

let secret = require('dvp-common/Authentication/Secret.js');
let authorization = require('dvp-common/Authentication/Authorization.js');

let hostIp = config.Host.Ip;
let hostPort = config.Host.Port;
let hostVersion = config.Host.Version;


let server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

let token = null;



restify.CORS.ALLOW_HEADERS.push('authorization');
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
//server.use(restify.urlEncodedBodyParser());

/*server.use(jwt({secret: secret.Secret,
    getToken: function fromHeaderOrQuerystring (req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0].toLowerCase() === 'bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.params && req.params.Authorization) {
            return req.params.Authorization;
        }
        return null;
    }}));*/

async function RequestToken(uuid){

    return new Promise(function(resolve, reject){

        let url = config.ThirdParty.AuthUrl;
        let secret = config.ThirdParty.Secret;

        let options = {
            url: url,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + secret
            },
            body: 'grant_type=client_credentials'
        };

        request.post(options, function (error, response, body)
        {
            if (!error && response.statusCode >= 200 && response.statusCode <= 299)
            {
                if(response.body){
                    let resp = JSON.parse(response.body);
                    token = resp.access_token;

                    logger.info('[DVP-3RdPartyAuthConnector.RequestToken] - [%s] - TOKEN GENERATION SUCCESS - Token : %s', uuid, resp.access_token);

                    resolve(token);
                }else{
                    logger.error('[DVP-3RdPartyAuthConnector.RequestToken] - [%s] - ERROR GETTING TOKEN', uuid, new Error('No response body'));
                    resolve(null);
                }

            }
            else
            {
                logger.error('[DVP-3RdPartyAuthConnector.RequestToken] - [%s] - ERROR GETTING TOKEN', uuid, error);
                resolve(null);
            }
        });

    });
}

async function PostEvent(uuid, payload){

    return new Promise(function(resolve, reject){

        let url = config.ThirdParty.EventUrl;

        let options = {
            url: url,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer  ' + token
            },
            body: payload
        };

        let resp = {
            Error: null, Result: null
        };

        request.post(options, function (error, response, body)
        {
            if (!error && response.statusCode >= 200 && response.statusCode <= 299)
            {
                //callback(null, url);
                resp.Result = body;
                logger.info('[DVP-3RdPartyAuthConnector.PostEvent] - [%s] - THIRD PARTY URL RETURNED : %s', uuid, JSON.stringify(body));
                resolve(resp);

            }
            else
            {
                resp.Error = error;
                logger.error('[DVP-3RdPartyAuthConnector.PostEvent] - [%s] - ERROR CALLING THIRD PARTY URL', uuid, error);
                resolve(resp);
            }
        });

    });
}

async function Connector(req, res, next){

    let uuid = uuidv1();

    logger.debug('[DVP-3RdPartyAuthConnector.Connector] - [%s] - METHOD CALL : %s', uuid, req.body);

    if(!token)
    {
        let tokenResult = await RequestToken(uuid);

        if(tokenResult){
            let postResult = await PostEvent(uuid, req.body);
            res.end('{}');
        }
        else{
            res.end('{}');
        }


    }
    else{
        let postResult = await PostEvent(uuid, req.body);

        if(postResult.Error){
            let tokenResult = await RequestToken(uuid);

            if(tokenResult){
                let postResult = await PostEvent(uuid, req.body);
                res.end('{}');
            }
            else{
                res.end('{}');
            }

        }else{
            res.end('{}');
        }
    }

    next();

}



server.post('/DVP/API/:version/Connector', Connector);


function Crossdomain(req,res,next){


    var xml='<?xml version=""1.0""?><!DOCTYPE cross-domain-policy SYSTEM ""http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd""> <cross-domain-policy>    <allow-access-from domain=""*"" />        </cross-domain-policy>';

    var xml='<?xml version="1.0"?>\n';

    xml+= '<!DOCTYPE cross-domain-policy SYSTEM "/xml/dtds/cross-domain-policy.dtd">\n';
    xml+='';
    xml+=' \n';
    xml+='\n';
    xml+='';
    req.setEncoding('utf8');
    res.end(xml);

}

function Clientaccesspolicy(req,res,next){


    var xml='<?xml version="1.0" encoding="utf-8" ?>       <access-policy>        <cross-domain-access>        <policy>        <allow-from http-request-headers="*">        <domain uri="*"/>        </allow-from>        <grant-to>        <resource include-subpaths="true" path="/"/>        </grant-to>        </policy>        </cross-domain-access>        </access-policy>';
    req.setEncoding('utf8');
    res.end(xml);

}

server.get("/crossdomain.xml",Crossdomain);
server.get("/clientaccesspolicy.xml",Clientaccesspolicy);

server.listen(hostPort, hostIp, function () {
    console.log('%s listening at %s', server.name, server.url);
});