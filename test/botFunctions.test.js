const mongoose = require('mongoose'),
      sinon    = require('sinon'),
      chai     = require('chai'),
      expect   = chai.expect,
      Profile  = require('../models/profileModel'),
      botFun   = require('../bin/botFunctions');


mongoose.Promise = global.Promise;

describe('Bot Functions', () => {
  describe('module', () => {
    it('should exist', () => {
      expect(botFun).to.exist;
    });
  });

  describe('whoIs()', () => {
    beforeEach( () => {
      sinon.stub(Profile, 'findOne');
    });

    afterEach( () => {
      Profile.findOne.restore();
    });

    it('should exist', () => {
      expect(botFun.whoIs).to.exist;
    });
    
    it('should be a function', () => {
      expect(botFun.whoIs).to.be.a('function');
    });

    it('should fetch a god damn profile', () => {
      let expected_models = sample_profiles;
      let res = sinon.spy();
      let mockPostBody = {
        user_id : 'dummy',
        user_name : 'dummy',
        team_id : 'dummy',
        postText : '<@U5YUAK7K5|mmadden>'
      }
      Profile.findOne.yields(expected_models[1]);

      botFun.whoIs(mockPostBody, res);
      sinon.assert.calledWith(res, 'attachments');
      
    });
  // it('fetchAllProfiles should fetch all the profiles',  () => {
  //   let expectedModels = sample_profiles;
  //   let callback = sinon.stub();
  //   Profile.find.yields(null, expectedModels);
  //   util.fetchAllProfiles(callback);
  //   sinon.assert.calledWith(callback, expectedModels);
  // });
  });
});

/*__________________________ Standards __________________________*/

let sample_profiles = [ {
	team_id: 'T3BC1RPPH',
	team_domain: 'chingucentral',
	channel_id: 'D5Z65BS3E',
	channel_name: 'directmessage',
	user_id: 'U5YEHNYBS',
	user_name: 'linus-br',
	postText: 'Javascript, NodeJS, Java, Fitness, Riding, backend',
	timestamp: 'Tue Jun 27 2017 17:58:47 GMT+0000 (UTC)',
	__v: 0,
	skills: [ 'JavaScript', 'Node.js', 'Java', 'Fitness', 'Riding', 'backend']
},
{
	team_id: 'T3BC1RPPH',
	team_domain: 'chingucentral',
	channel_id: 'D5ZRL3L4F',
	channel_name: 'directmessage',
	user_id: 'U5YUAK7K5',
	user_name: 'mmadden',
	postText: 'php, js, react, css, html',
	timestamp: 'Sat Jun 24 2017 14:31:28 GMT+0000 (UTC)',
	__v: 0,
	skills: [ 'PHP', 'JavaScript', 'ReactJS', 'CSS', 'HTML' ]
} ];
