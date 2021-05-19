# oauth.desktopsample.final

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/c795f06c1c5b416f92d8ba8d4257ff3c)](https://www.codacy.com/gh/gary-archer/oauth.desktopsample.final/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.desktopsample.final&amp;utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.desktopsample.final/badge.svg)](https://snyk.io/test/github/gary-archer/oauth.desktopsample.final)

### Overview

* The final desktop code sample using OAuth and Open Id Connect, referenced in my blog at https://authguidance.com
* **The goal of this sample is to implement Open Id Connect desktop logins with best usability and reliability**

### Details

* See the [Final Desktop Sample Overview](https://authguidance.com/2018/01/26/final-desktop-sample-overview/) for a feature overview and how to run the code

### Programming Languages

* Electron, TypeScript and ReactJS are used to implement the Cross Platform Desktop App

### Desktop Middleware Used

* The [AppAuth-JS Library](https://github.com/openid/AppAuth-JS/blob/master/README.md) is used to implement the Authorization Code Flow (PKCE)
* The [keytar](https://github.com/atom/node-keytar) library is used by the Desktop App for secure storage of OAuth tokens
* A Private URI Scheme is used by the system browser to return to the app after login

### Hosting
* AWS API Gateway is used to host the Desktop App's OAuth Secured API
* AWS Cognito is used as the default Authorization Server for the UI and API
