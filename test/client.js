'use strict';
require('should');
var sinon = require('sinon');
var soap = require('soap-js');
var Client = require('../lib/client');
var User = require('../lib/model/user');
var Item = require('../lib/model/item');

describe('Client', function () {
    it('should return user model by user id', function (done) {
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            var doShowUserStub = sinon.stub(soapClient, 'doShowUser');
            doShowUserStub.callsArgWith(1, null, {userId: 1});

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'login',
                password: 'pass'
            });
            client.getUser(1, function (err, user) {
                doShowUserStub.calledOnce.should.equal(true);
                user.should.be.an.instanceOf(User);
                user.id.should.equal(1);
                done();
            });
        });
    });

    it('should login user before getting item data', function (done) {
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            _getDoQuerySysStatusStub(soapClient);
            var doLoginEncStub = _getDoLoginEncStub(soapClient);
            var doShowItemInfoExtStub = sinon.stub(soapClient, 'doShowItemInfoExt');
            doShowItemInfoExtStub.callsArgWith(1, null, {
                itemListInfoExt: {
                    itId: 1,
                    itName: 'Item'
                }
            });

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'testuser',
                password: 'password'
            });

            client.getItem(2, function () {
                doLoginEncStub.calledOnce.should.equal(true);
                doLoginEncStub.calledWith({
                    userLogin: 'testuser',
                    userHashPassword: 'XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg=',
                    countryCode: 1,
                    webapiKey: 'key',
                    localVersion: 123456
                }).should.equal(true);
                done();
            });
        });
    });

    it('should return item model by item id', function (done) {
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            _getDoQuerySysStatusStub(soapClient);
            _getDoLoginEncStub(soapClient);
            var doShowItemInfoExtStub = sinon.stub(soapClient, 'doShowItemInfoExt');
            doShowItemInfoExtStub.callsArgWith(1, null, {
                itemListInfoExt: {itId: 2}
            });

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'testuser',
                password: 'password'
            });

            client.getItem(2, function (err, item) {
                doShowItemInfoExtStub.calledOnce.should.equal(true);
                doShowItemInfoExtStub.calledWith({
                    sessionHandle: 'session1',
                    itemId: 2,
                    getImageUrl: 1
                }).should.equal(true);

                item.should.be.instanceOf(Item);
                item.id.should.be.equal(2);
                done();
            });
        });
    });

    it('should login user before getting category data', function (done) {
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            _getDoQuerySysStatusStub(soapClient);
            var doLoginEncStub = _getDoLoginEncStub(soapClient);
            var doGetCategoryPathStub = sinon.stub(soapClient, 'doGetCategoryPath');
            doGetCategoryPathStub.callsArgWith(1, null, {
                categoryPath: [{
                    item: [{
                        catId: 2,
                        catName: 'Category'
                    }]
                }]
            });

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'testuser',
                password: 'password'
            });

            client.getCategory(2, function () {
                doLoginEncStub.calledOnce.should.equal(true);
                doLoginEncStub.calledWith({
                    userLogin: 'testuser',
                    userHashPassword: 'XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg=',
                    countryCode: 1,
                    webapiKey: 'key',
                    localVersion: 123456
                }).should.equal(true);
                done();
            });
        });
    });

    it('should return category model by category id', function (done) {
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            _getDoQuerySysStatusStub(soapClient);
            _getDoLoginEncStub(soapClient);
            var doGetCategoryPathStub = sinon.stub(soapClient, 'doGetCategoryPath');
            doGetCategoryPathStub.callsArgWith(1, null, {
                categoryPath: [{
                    item: [{
                        catId: 2,
                        catName: 'Category'
                    }]
                }]
            });

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'testuser',
                password: 'password'
            });

            client.getCategory(2, function () {
                doGetCategoryPathStub.calledOnce.should.equal(true);
                doGetCategoryPathStub.calledWith({
                    sessionId: 'session1',
                    categoryId: 2
                }).should.equal(true);
                done();
            });
        });
    });

    it('should emit event when somebody buy using "buy now"', function (done) {
        var clock = sinon.useFakeTimers();
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            _getDoQuerySysStatusStub(soapClient);
            _getDoLoginEncStub(soapClient);
            var doGetSiteJournalStub = sinon.stub(soapClient, 'doGetSiteJournal');
            doGetSiteJournalStub.callsArgWith(1, null, {
                siteJournalArray: [{
                    item: [{
                        rowId: 1,
                        itemId: 2,
                        changeType: 'now'
                    }]
                }]
            });

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'testuser',
                password: 'password'
            });

            client.on('buynow', function (itemId) {
                doGetSiteJournalStub.calledOnce.should.equal(true);
                doGetSiteJournalStub.calledWith({
                    sessionHandle: 'session1',
                    infoType: 1
                }).should.equal(true);

                itemId.should.equal(2);

                done();
            });

            clock.tick(1000);
            clock.restore();
        });
    });

    it('should login only once for two calls', function (done) {
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            _getDoQuerySysStatusStub(soapClient);
            var doLoginEncStub = _getDoLoginEncStub(soapClient);
            var doShowItemInfoExtStub = sinon.stub(soapClient, 'doShowItemInfoExt');
            doShowItemInfoExtStub.callsArgWith(1, null, {itemListInfoExt: {itId: 1, itName: 'Item'}});

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'testuser',
                password: 'password'
            });

            client.getItem(1, function () {
                client.getItem(1, function () {
                    doLoginEncStub.calledOnce.should.equal(true);
                    done();
                });
            });
        });
    });

    it('should login with password hash', function (done) {
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            _getDoQuerySysStatusStub(soapClient);
            var doLoginEncStub = _getDoLoginEncStub(soapClient);
            var doShowItemInfoExtStub = sinon.stub(soapClient, 'doShowItemInfoExt');
            doShowItemInfoExtStub.callsArgWith(1, null, {itemListInfoExt: {itId: 1, itName: 'Item'}});

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'testuser',
                passwordHash: 'passwordHash'
            });

            client.getItem(1, function () {
                doLoginEncStub.calledWith({
                    userLogin: 'testuser',
                    userHashPassword: 'passwordHash',
                    countryCode: 1,
                    webapiKey: 'key',
                    localVersion: 123456
                }).should.equal(true);
                done();
            });
        });
    });

    it('should get sys status before login', function (done) {
        soap.createClient(__dirname + '/webapi.wsdl', function (err, soapClient) {
            var doQuerySysStatusStub = _getDoQuerySysStatusStub(soapClient);
            var doLoginEncStub = _getDoLoginEncStub(soapClient);
            var doShowItemInfoExtStub = sinon.stub(soapClient, 'doShowItemInfoExt');
            doShowItemInfoExtStub.callsArgWith(1, null, {itemListInfoExt: {itId: 1, itName: 'Item'}});

            var client = new Client({
                soapClient: soapClient,
                key: 'key',
                countryId: 1,
                login: 'testuser',
                passwordHash: 'passwordHash'
            });

            client.getItem(1, function () {
                doQuerySysStatusStub.calledOnce.should.be.equal(true);
                doLoginEncStub.calledWith({
                    userLogin: 'testuser',
                    userHashPassword: 'passwordHash',
                    countryCode: 1,
                    webapiKey: 'key',
                    localVersion: 123456
                }).should.equal(true);
                done();
            });
        });
    });

    var _getDoQuerySysStatusStub = function (soapClient) {
        var doQuerySysStatusStub = sinon.stub(soapClient, 'doQuerySysStatus');
        doQuerySysStatusStub.callsArgWith(1, null, {
            info: '1.0.0',
            verKey: 123456
        });
        return doQuerySysStatusStub;
    };

    var _getDoLoginEncStub = function (soapClient) {
        var doLoginEncStub = sinon.stub(soapClient, 'doLoginEnc');
        doLoginEncStub.callsArgWith(1, null, {
            'sessionHandlePart': 'session1',
            'userId': 1
        });
        return doLoginEncStub;
    };
});
