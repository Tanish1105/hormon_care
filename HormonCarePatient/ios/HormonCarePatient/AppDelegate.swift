import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "HormonCarePatient",
      in: window,
      launchOptions: launchOptions
    )

    // Best-effort: blank screenshots / screen recordings (iOS has no FLAG_SECURE).
    window?.makeSecureAgainstCapture()

    return true
  }
}

private extension UIWindow {
  func makeSecureAgainstCapture() {
    let field = UITextField()
    field.isSecureTextEntry = true
    addSubview(field)
    field.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      field.centerXAnchor.constraint(equalTo: centerXAnchor),
      field.centerYAnchor.constraint(equalTo: centerYAnchor),
      field.widthAnchor.constraint(equalToConstant: 0),
      field.heightAnchor.constraint(equalToConstant: 0),
    ])
    layer.superlayer?.addSublayer(field.layer)
    field.layer.sublayers?.last?.addSublayer(layer)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
