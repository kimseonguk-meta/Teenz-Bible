import UIKit
import Capacitor
import FirebaseAuth

private final class TeenzBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        if let pluginClass = NSClassFromString("FirebaseAuthenticationPlugin") as? CAPPlugin.Type {
            bridge?.registerPluginType(pluginClass)
            CAPLog.print("✅ FirebaseAuthenticationPlugin registered after Capacitor bridge load")
        } else {
            CAPLog.print("❌ FirebaseAuthenticationPlugin class is unavailable in the App target")
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
