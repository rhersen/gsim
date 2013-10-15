describe('gcodeinterpreter', function() {
  var subject;

  beforeEach(function() {
    subject = GCodeInterpreter();
  });

  it('returns an object', function() {
    var result = typeof subject;
    expect(result).toEqual('object');
  });

  describe('.isStopped', function() {
    it('is stopped initially', function() {
      var result = subject.isStopped();
      expect(result).toEqual(true);
    });
  });

  describe('.setGCode', function() {
    it('sets current line to zero', function() {
      subject.setGCode('');
      var result = subject.getCurrentLine();
      expect(result).toEqual(0);
    });
  });

  describe('.pause', function() {
    it('is not implemented', function() {
      try {
        subject.pause();
        this.fail(Error('expected exception'));
      } catch (e) {
        expect(e).toMatch(/not implemented/);
      }
    });
  });
});
