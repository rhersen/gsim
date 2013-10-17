describe('gcodeinterpreter', function() {
  var subject;
  var millingMachine = {
    reset: function() {
    },
    millFromTo: function() {
    }
  };

  beforeEach(function() {
    subject = GCodeInterpreter(millingMachine);
    subject.setTools([1, 2, 3]);
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
    beforeEach(function() {
      spyOn(millingMachine, 'millFromTo');
    });

    it('stops after running', function() {
      subject.run();
      var result = subject.isStopped();
      expect(result).toEqual(true);
    });

    it('throws if start char is not valid', function() {
      subject.setGCode('r');

      try {
        subject.run();
        this.fail(Error('expected exception'));
      } catch (e) {
        expect(e).toMatch(/invalid/i);
      }
    });

    it('handles g1', function() {
      subject.setGCode('g0 x0 y0 z10\nm6 t2\ng1 x-4 y-8 z-10');
      subject.run();
      expect(millingMachine.millFromTo).toHaveBeenCalledWith({ x: -4, y: -8, z: -10 }, { g: 1, x: -4, y: -8, z: -10, t: 2 }, 2);
    });

    it('trims input lines', function() {
      subject.setGCode(' g0 x0 y0 z10\t\n m6 t2 \n\n g1 x-4 y-8 z-10 ');
      subject.run();
      expect(millingMachine.millFromTo).toHaveBeenCalledWith({ x: -4, y: -8, z: -10 }, { g: 1, x: -4, y: -8, z: -10, t: 2 }, 2);
    });

    it('throws if m6 has no t', function() {
      subject.setGCode('g0 x0 y0 z10\nm6');

      try {
        subject.run();
        this.fail(Error('expected exception'));
      } catch (e) {
        expect(e).toMatch(/missing t/i);
      }
    });

    it('throws if g has no y', function() {
      subject.setGCode('g0 x0 z10');

      try {
        subject.run();
        this.fail(Error('expected exception'));
      } catch (e) {
        expect(e).toMatch(/missing x, y/i);
      }
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

        it('sets current line to zero', function() {
          var result = subject.getCurrentLine();
          expect(result).toEqual(0);
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

          it('increments line number', function() {
            var result = subject.getCurrentLine();
            expect(result).toEqual(1);
          });
        });
      });
    });
  });

  describe('.setGCode', function() {
    beforeEach(function() {
      subject.setGCode('');
    });

    it('sets current line to zero', function() {
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
