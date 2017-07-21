let assert = require('assert'),
    sinon  = require('sinon'),
    test   = require('./test_api'),
    Profiles =  require('../models/profileModel'),
    repopulateSkills  = require('../bin/jayDbUtils');

describe('jayDbUtils', () => {

  describe('repopulateSkills()', () => {
    it('should exist', () => {
      assert.equal(typeof repopulateSkills, 'function');
    });

    it('should run properly!!', () => {
      // sinon.stub(Profiles, 'save');
      let getAllUsers = sinon.stub();
      let updateDatabase = sinon.stub();
      getAllUsers.yields(null, test.mock_db);
      
      repopulateSkills();

      sinon.assert.calledWith(updateDatabase, test.mock_db);
    });



  });

  

});

