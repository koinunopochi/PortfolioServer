class MyCustomError extends Error {
  constructor(name,message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
  }
}
exports.MyCustomError = MyCustomError;

// 認証エラーを作成
class AuthenticationError extends MyCustomError {
  constructor(message) {
    super('AuthenticationError', message, 401);
  }
}
exports.AuthenticationError = AuthenticationError;

// 認証情報がない場合のエラーを作成
class AuthorizationError extends MyCustomError {
  constructor(message) {
    super('AuthorizationError', message, 403);
  }
}
exports.AuthorizationError = AuthorizationError;

// バリデーションエラーを作成
class ValidationError extends MyCustomError {
  constructor(message) {
    super('ValidationError', message, 400);
  }
}
exports.ValidationError = ValidationError;