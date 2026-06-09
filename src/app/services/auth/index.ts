import login from "./login"
import customerLogin from "./customerLogin"
import me from "./me"
import customerMe from "./customerMe"
import logout from "./logout"
import changePassword from "./changePassword"
import {
  disableMfa,
  getMfaSettings,
  resendMfaEmail,
  sendEmailMfaSetupCode,
  startAuthenticatorSetup,
  verifyAuthenticatorSetup,
  verifyEmailMfaSetup,
  verifyMfaChallenge,
} from "./mfa"

export default {
  login,
  customerLogin,
  me,
  customerMe,
  logout,
  changePassword,
  disableMfa,
  getMfaSettings,
  resendMfaEmail,
  sendEmailMfaSetupCode,
  startAuthenticatorSetup,
  verifyAuthenticatorSetup,
  verifyEmailMfaSetup,
  verifyMfaChallenge,
}
