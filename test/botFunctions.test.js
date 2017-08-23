/*jshint esversion:6*/
const mongoose = require('mongoose'),
      sinon    = require('sinon'),
      chai     = require('chai'),
      chaiAsPromised = require('chai-as-promised'),
      Profile  = require('../models/profileModel'),
      foo      = require('../bin/botFunctions');

chai.use(chaiAsPromised);
const expect   = chai.expect;
mongoose.Promise = global.Promise;

describe('testGetOneProfile', function() {

  beforeEach( function() {
    sinon.stub(Profile, 'findOne');
  });

  afterEach( function() {
    Profile.findOne.restore();
  });

  it('testing the original function', function() {

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

    let response = {
      status: sinon.spy( () => response ),
      send: sinon.spy()
    };

    const findOneResult = {
      exec: sinon.stub().resolves(expectedModel)
    };

    Profile.findOne.returns(findOneResult);

    // console.log(Profile.findOne(mock_user_id));
    // console.log(Profile.findOne(mock_user_id).exec());
    // console.log(Profile.findOne(mock_user_id).exec().then( (stuff) => { return stuff; } ));
    // foo.testGetOneProfile(mock_user_id, response);

    expect(Profile.findOne(mock_user_id).exec().then( (stuff) => { return stuff; } )).to.eventually.be.true;
    // expect(response.status.called).to.be.true;
    // sinon.assert.calledWith(res.send, expectedResponse);
  });



  // it('testing the callback function', function() {

  //   let mock_user_id = 'U5YEHNYBS',
  //       expectedModel = {
  //         user_id: 'U5YEHNYBS',
  //         user_name: 'gus',
  //         skills: [ 'JavaScript', 'Node.js', 'Java', 'Fitness', 'Riding', 'backend']
  //       },
  //       expectedResponse = {
  //         name: 'gus',
  //         skills: 'JavaScript\nNode.js\nJava\nFitness\nRiding\nbackend'
  //       },
  //       res = {
  //         status: sinon.spy( () => res ),
  //         send: sinon.spy()
  //       };

  //   Profile.findOne.yields(null, expectedModel);

  //   foo.fetchWithCallback(mock_user_id, foo.conditionTheFetch, res);

  //   expect(res.send.called).to.be.true;
  //   sinon.assert.calledWith(res.send, expectedResponse);
  // });

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
