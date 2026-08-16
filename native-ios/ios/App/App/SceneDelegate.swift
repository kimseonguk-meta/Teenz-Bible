import UIKit
import Capacitor
import FirebaseAuth
import GoogleSignIn

private final class TeenzBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        if bridge?.plugin(withName: "FirebaseAuthentication") != nil {
            CAPLog.print("✅ Teenz FirebaseAuthentication bridge registered")
        } else {
            CAPLog.print("❌ Teenz FirebaseAuthentication bridge is unavailable")
        }
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = TeenzBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        // With UIScene lifecycle enabled, OAuth callbacks arrive here instead of AppDelegate.
        for context in URLContexts {
            if GIDSignIn.sharedInstance.handle(context.url) {
                return
            }
            if Auth.auth().canHandle(context.url) {
                return
            }
        }
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
