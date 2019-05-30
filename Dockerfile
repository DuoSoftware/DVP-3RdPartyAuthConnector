FROM node:9.9.0
ARG VERSION_TAG
RUN git clone -b $VERSION_TAG https://github.com/DuoSoftware/DVP-3RdPartyAuthConnector.git /usr/local/src/3rdpartyauthconnector
RUN cd /usr/local/src/3rdpartyauthconnector;
WORKDIR /usr/local/src/3rdpartyauthconnector
RUN npm install
EXPOSE 3645
CMD [ "node", "/usr/local/src/3rdpartyauthconnector/app.js" ]

