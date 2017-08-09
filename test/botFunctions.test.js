const mongoose = require('mongoose'),
      sinon    = require('sinon'),
      chai     = require('chai'),
      expect   = chai.expect,
      Profile  = require('../models/profileModel'),
      foo      = require('../bin/botFunctions');

mongoose.Promise = global.Promise;

describe('testGetOneProfile', function() {

  beforeEach( function() {
    sinon.stub(Profile, 'findOne');
  });

  afterEach( function() {
    Profile.findOne.restore();
  });

  it('should send a response', function() {

    let mock_user_id = 'U5YEHNYBS';

    let expectedModel = {
      user_id: 'U5YEHNYBS',
      user_name: 'gus',
      skills: [ 'JavaScript', 'Node.js', 'Java', 'Fitness', 'Riding', 'backend']
    };

    let expectedResponse = {
      name: 'gus',
      skills: 'JavaScript, Node.js, Java, Fitness, Riding, backend'
    };

    let res = {
      status: sinon.spy(function() { return res; }),
      send: sinon.spy()
    };

    const findOneResult = {
      exec: sinon.stub().resolves(expectedModel)
    }

    Profile.findOne.returns(findOneResult);

    foo.testGetOneProfile(mock_user_id, res);

    expect(res.status.called).to.be.true;
    // sinon.assert.calledWith(res.send, expectedResponse);
  });
});
