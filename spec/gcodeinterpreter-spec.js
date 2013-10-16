describe('gcodeinterpreter', function() {
  var subject;
  var millingMachine = {reset: function() {
  }};

  beforeEach(function() {
    subject = GCodeInterpreter(millingMachine);
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

  describe('.stop', function() {
    it('resets the machine', function() {
      spyOn(millingMachine, 'reset');
      subject.stop();
      expect(millingMachine.reset).toHaveBeenCalled();
    });
  });

  describe('.run', function() {
    it('stops after running', function() {
      subject.run();
      var result = subject.isStopped();
      expect(result).toEqual(true);
    });
  });

  describe('.step', function() {
    beforeEach(function() {
      spyOn(millingMachine, 'reset');
      subject.setGCode('');
      subject.step();
    });

    it('resets the machine', function() {
      expect(millingMachine.reset).toHaveBeenCalled();
    });

    it('pauses', function() {
      var result = subject.isStopped();
      expect(result).toEqual(false);
    });

    it('increments line number', function() {
      var result = subject.getCurrentLine();
      expect(result).toEqual(1);
    });

    describe('.step', function() {
      beforeEach(function() {
        subject.step();
      });

      it('is paused', function() {
        var result = subject.isStopped();
        expect(result).toEqual(false);
      });

      it('increments line number', function() {
        var result = subject.getCurrentLine();
        expect(result).toEqual(2);
      });

      describe('.setGCode', function() {
        beforeEach(function() {
          subject.setGCode('');
        });

        it('stops', function() {
          var result = subject.isStopped();
          expect(result).toEqual(true);
        });
      });

      describe('.stop', function() {
        beforeEach(function() {
          subject.stop();
        });

        it('stops', function() {
          var result = subject.isStopped();
          expect(result).toEqual(true);
        });

        describe('.step', function() {
          beforeEach(function() {
            subject.step();
          });

          it('resets line number', function() {
            var result = subject.getCurrentLine();
            expect(result).toEqual(1);
          });
        });
      });
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
