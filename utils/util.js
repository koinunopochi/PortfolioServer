const firstCharUpp = (str) => {
  const str0 = str[0];
  return str0.toUpperCase() + str.slice(1);
};

exports.firstCharUpp = firstCharUpp;
