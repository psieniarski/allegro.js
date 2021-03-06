'use strict';
require('should');
var sinon = require('sinon');
var Item = require('../../lib/model/item');
var User = require('../../lib/model/user');

describe('Item model', function () {
    it('should require client', function () {
        (function () {
            new Item({itId: 1});
        }).should.throwError('Client instance required');
    });

    it('should return basic info (id, name, location, image, status)', function () {
        var item = new Item({
            itemListInfoExt: {
                itId: 1,
                itName: 'test item',
                itLocation: 'Poznan',
                itIsNewUsed: 1
            },
            itemImgList: [{item: [null, null, {imageUrl: 'imageurl'}]}]
        }, {});

        item.id.should.equal(1);
        item.name.should.equal('test item');
        item.location.should.equal('Poznan');
        item.mainImage.should.equal('imageurl');
        item.isNew.should.equal(true);
        item.isUsed.should.equal(false);
    });

    it('should return user object on getting seller', function (done) {
        var client = {
            getUser: function () {
            }
        };
        var clientStub = sinon.stub(client, 'getUser');
        clientStub.callsArgWith(1, null, new User({
            userId: 2
        }));

        var item = new Item({
            itemListInfoExt: {
                itId: 1,
                itSellerId: 2
            }
        }, client);

        item.getSeller(function (err, user) {
            clientStub.calledOnce.should.equal(true);
            clientStub.calledWith(2).should.equal(true);
            user.should.be.instanceOf(User);
            done();
        });
    });
});
