const checkData = (Object) => {
  if (Object.keys(Object).length > 0) return false || true;
};

const validTitle = (Title) => {
  let correctTitle = ["Mr", "Mrs", "Miss"];
  if (correctTitle.includes(Title)) return false || true;
};

const validString = (String) => {
  if (/\d/.test(String)) return true || false;
};

const validMobileNum = (Mobile) => {
  if (/^[6-9]\d{9}$/.test(Mobile)) return false || true;
};

const validEmail = (Email) => {
  if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(Email))
    return false || true;
};

const validPwd = (Password) => {
  if (
    /"^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,10}$/.test(
      Password
    )
  )
    return false || true;
};

module.exports = {
  checkData,
  validTitle,
  validString,
  validMobileNum,
  validEmail,
  validPwd,
};
