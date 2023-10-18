const {
  MyCustomError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  InvalidRefreshTokenError,
} = require('../../lib/CustomError');

// #########################  正常系  #########################
describe('Error classes', () => {
  describe('MyCustomError', () => {
    it('Test error messageと表記されるべきである', () => {
      const error = new MyCustomError('TestError', 'Test error message', 400);
      expect(error.name).toBe('TestError');
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthenticationError', () => {
    it('authentication errorと表記されるべきである', () => {
      const error = new AuthenticationError('Authentication failed');
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('authorization errorと表記されるべきである', () => {
      const error = new AuthorizationError('Authorization failed');
      expect(error.name).toBe('AuthorizationError');
      expect(error.message).toBe('Authorization failed');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ValidationError', () => {
    it('validation errorと表記されるべきである', () => {
      const error = new ValidationError('Validation failed');
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('InvalidRefreshTokenError', () => {
    it('invalid refresh token errorと表記されるべきである', () => {
      const error = new InvalidRefreshTokenError();
      expect(error.name).toBe('InvalidRefreshTokenError');
      expect(error.message).toBe('invalid refresh token');
      expect(error.statusCode).toBe(401);
    });
  });
});
// #########################  異常系  #########################

