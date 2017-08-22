/*jshint esversion:6*/
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

  // it('should send a response', function() {

  //   let mock_user_id = 'U5YEHNYBS';

  //   let expectedModel = {
  //     user_id: 'U5YEHNYBS',
  //     user_name: 'gus',
  //     skills: [ 'JavaScript', 'Node.js', 'Java', 'Fitness', 'Riding', 'backend']
  //   };

  //   let expectedResponse = {
  //     name: 'gus',
  //     skills: 'JavaScript, Node.js, Java, Fitness, Riding, backend'
  //   };

  //   let res = {
  //     status: sinon.spy( () => res ),
  //     send: sinon.spy()
  //   };

  //   const findOneResult = {
  //     exec: sinon.stub().resolves(expectedModel)
  //   };

  //   Profile.findOne.returns(findOneResult);

  //   foo.testGetOneProfile(mock_user_id, res);

  //   expect(res.status.called).to.be.true;
  //   // sinon.assert.calledWith(res.send, expectedResponse);
  // });



  it('testing the callback function', function() {

    let mock_user_id = 'U5YEHNYBS';

    let expectedModel = {
      user_id: 'U5YEHNYBS',
      user_name: 'gus',
      skills: [ 'JavaScript', 'Node.js', 'Java', 'Fitness', 'Riding', 'backend']
    };

    let expectedResponse = {
      name: 'gus',
      skills: 'JavaScript\nNode.js\nJava\nFitness\nRiding\nbackend'
    };

    let callback = sinon.spy();

    let res = {
      status: sinon.spy( () => res ),
      send: sinon.spy()
    };

    Profile.findOne.yields(null, expectedModel);

    foo.fetchWithCallback(mock_user_id, foo.conditionTheFetch, res);

    expect(res.send.called).to.be.true;
    sinon.assert.calledWith(res.send, expectedResponse);
  });

/*
  // this one works
  it('testing the _callback function', function() {
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
      status: sinon.spy( () => res ),
      send: sinon.spy()
    };

    Profile.findOne.yields(null, expectedModel);
    foo._fetchWithCallback(mock_user_id, res);
    console.log(res);
    // note, res.status.called = false!!
    expect(res.send.called).to.be.true;
  });
*/
});
