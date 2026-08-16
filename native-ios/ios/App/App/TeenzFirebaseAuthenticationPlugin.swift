import AuthenticationServices
import Capacitor
import Foundation
import CryptoKit
import FirebaseCore
import GoogleSignIn
import Security
import UIKit

@objc(TeenzFirebaseAuthenticationPlugin)
public final class TeenzFirebaseAuthenticationPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TeenzFirebaseAuthenticationPlugin"
    public let jsName = "FirebaseAuthentication"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signInWithApple", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signInWithGoogle", returnType: CAPPluginReturnPromise)
    ]

    private var appleCall: CAPPluginCall?
    private var appleNonce: String?

    @objc public func signInWithApple(_ call: CAPPluginCall) {
        guard #available(iOS 13.0, *) else {
            call.reject("Apple Sign In requires iOS 13 or later.")
            return
        }

        let nonce = randomNonce()
        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)

        appleCall = call
        appleNonce = nonce

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    @objc public func signInWithGoogle(_ call: CAPPluginCall) {
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            call.reject("Google client ID is missing from GoogleService-Info.plist.")
            return
        }
        guard let presentingViewController = bridge?.viewController else {
            call.reject("Unable to present the Google sign-in screen.")
            return
        }

        let configuration = GIDConfiguration(clientID: clientID)
        GIDSignIn.sharedInstance.configuration = configuration
        DispatchQueue.main.async {
            GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController, hint: nil, additionalScopes: []) { result, error in
                if let error = error {
                    let code = error.localizedDescription.lowercased().contains("cancel") ? "ERR_CANCELED" : nil
                    call.reject(code == nil ? "Google sign-in failed." : "Sign-in cancelled", code, error)
                    return
                }

                guard let user = result?.user,
                      let idToken = user.idToken?.tokenString else {
                    call.reject("Google did not return an ID token.")
                    return
                }

                call.resolve([
                    "credential": [
                        "idToken": idToken,
                        "accessToken": user.accessToken.tokenString
                    ]
                ])
            }
        }
    }

    private func randomNonce(length: Int = 32) -> String {
        precondition(length > 0)
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            var random: UInt8 = 0
            let status = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
            if status != errSecSuccess {
                fatalError("Unable to generate Apple Sign In nonce. OSStatus: \(status)")
            }
            if Int(random) < charset.count {
                result.append(charset[Int(random)])
                remainingLength -= 1
            }
        }
        return result
    }

    private func sha256(_ input: String) -> String {
        SHA256.hash(data: Data(input.utf8)).map { String(format: "%02x", $0) }.joined()
    }
}

@available(iOS 13.0, *)
extension TeenzFirebaseAuthenticationPlugin: ASAuthorizationControllerDelegate {
    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard let call = appleCall else { return }
        defer {
            appleCall = nil
            appleNonce = nil
        }

        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityTokenData = credential.identityToken,
              let identityToken = String(data: identityTokenData, encoding: .utf8),
              let nonce = appleNonce else {
            call.reject("Apple did not return an identity token.")
            return
        }

        call.resolve([
            "credential": [
                "idToken": identityToken,
                "nonce": nonce
            ]
        ])
    }

    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        guard let call = appleCall else { return }
        appleCall = nil
        appleNonce = nil

        let nsError = error as NSError
        if nsError.code == ASAuthorizationError.canceled.rawValue {
            call.reject("Sign-in cancelled", "1001", error)
        } else {
            call.reject("Apple sign-in failed.", nil, error)
        }
    }
}

@available(iOS 13.0, *)
extension TeenzFirebaseAuthenticationPlugin: ASAuthorizationControllerPresentationContextProviding {
    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        bridge?.webView?.window ?? UIWindow()
    }
}
