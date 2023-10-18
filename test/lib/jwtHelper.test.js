const jwt = require('jsonwebtoken');
const {
  decodeItem,
  generateKey,
  generateTokens,
} = require('../../lib/jwtHelper');

describe('JWT and Key Utilities', () => {
  describe('decodeItem', () => {
    const SECRET_KEY = 'test-secret-key'; // テスト用のキー
    const validToken = jwt.sign({ email: 'test@example.com' }, SECRET_KEY);
    const invalidToken = 'invalid-token';

    it('正常系', () => {
      const email = decodeItem(validToken,"email", SECRET_KEY);
      expect(email).toBe('test@example.com');
    });
    it('異常系：tokenが間違っている場合', () => {
      expect(() => {
        decodeItem(invalidToken, 'email', SECRET_KEY);
      }).toThrowError('トークンが誤っています。');
    });
    it('異常系：itemが間違っている場合', () => {
      expect(() => {
        decodeItem(validToken, 'username', SECRET_KEY);
      }).toThrowError('itemの値が不正です。');
    });

    it('異常系：トークンがない場合のエラー', () => {
      expect(() => {
        decodeItem();
      }).toThrowError('invalid user');
    });
  });

  describe('generateKey', () => {
    it('正常系：32バイトでkeyが生成される', () => {
      const key = generateKey();
      expect(key).toHaveLength(32*2);
    });
  });

  describe('generateTokens', () => {
    it('指定されたユーザー名で、JWTが作成されるかの確認', () => {
      const { token, refreshToken } = generateTokens('testuser');

      expect(token).toBeDefined();
      expect(refreshToken).toBeDefined();

      const decodedToken = jwt.decode(token);
      const decodedRefreshToken = jwt.decode(refreshToken);

      expect(decodedToken.username).toBe('testuser');
      expect(decodedRefreshToken.username).toBe('testuser');
    });
  });
});
