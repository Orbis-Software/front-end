import login from "./login"
import customerLogin from "./customerLogin"
import me from "./me"
import customerMe from "./customerMe"
import logout from "./logout"
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
  disableMfa,
  getMfaSettings,
  resendMfaEmail,
  sendEmailMfaSetupCode,
  startAuthenticatorSetup,
  verifyAuthenticatorSetup,
  verifyEmailMfaSetup,
  verifyMfaChallenge,
}
