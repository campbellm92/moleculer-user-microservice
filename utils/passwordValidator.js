import Validator from "fastest-validator";

const v = new Validator({
  useNewCustomCheckerFunction: true,
  messages: {
    minLength: "Your password must be at least 8 characters in length.",
    oneUppercaseLetter:
      "Your password must contain at least one uppercase letter.",
    oneLowercaseLetter:
      "Your password must contain at least one lowercase letter.",
    oneDigit: "Your password must contain at least one number.",
    oneSpecialCharacter:
      "Your password must contain at least one special character.",
  },
});

const schema = {
  password: {
    type: "string",
    custom: (v, error) => {
      if (!/^.{8,}$/.test(v)) error.push({ type: "minLength" });
      if (!/(?=.*?[A-Z])/.test(v)) error.push({ type: "oneUppercaseLetter" });
      if (!/(?=.*?[a-z])/.test(v)) error.push({ type: "oneLowercaseLetter" });
      if (!/(?=.*?[0-9])/.test(v)) error.push({ type: "oneDigit" });
      if (!/(?=.*?[#?!@$%^&*-])/.test(v))
        error.push({ type: "oneSpecialCharacter" });
    },
  },
};

const validatePassword = v.compile(schema);

// console.log(check({ password: "Foo123!" }));
// console.log(check({ password: "foobar!122!" }));
// console.log(check({ password: "FOOBAR2!" }));
// console.log(check({ password: "Foobar!!" }));
// console.log(check({ password: "Foobar123" }));

export default validatePassword;
