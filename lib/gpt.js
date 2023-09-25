const OpenAI = require('openai');

const openai = new OpenAI();

const CallGpt = async (model, prompt) => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: model,
    temperature: 0,
  });
  console.log(completion.choices[0]);
  console.log(completion.usage);
  return completion;
};

exports.CallGpt = CallGpt;

// https://www.npmjs.com/package/gpt-3-encoder
const { encode } = require('gpt-3-encoder');

const switchModel = (prompt, max_token) => {
  const encoded = encode(prompt);
  // console.log(encoded.length);
  const is_accept = encoded.length < max_token;
  // console.log(is_accept);
  if (is_accept > 0) {
    // console.log('gpt-3.5-turbo');
    return 'gpt-3.5-turbo';
  } else {
    // console.log('gpt-3.5-turbo-16k');
    return 'gpt-3.5-turbo-16k';
  }
};
exports.switchModel = switchModel;
