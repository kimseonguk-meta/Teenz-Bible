// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.3.4"),
        .package(name: "CapacitorFirebaseAuthentication", path: "../../../node_modules/.pnpm/@capacitor-firebase+authentication@8.2.0_@capacitor+core@8.3.4_firebase@12.13.0/node_modules/@capacitor-firebase/authentication"),
        .package(name: "CapacitorCamera", path: "../../../node_modules/.pnpm/@capacitor+camera@8.2.0_@capacitor+core@8.3.4/node_modules/@capacitor/camera"),
        .package(name: "CapgoCapacitorYoutubePlayer", path: "../../../node_modules/.pnpm/@capgo+capacitor-youtube-player@8.2.5_@capacitor+core@8.3.4/node_modules/@capgo/capacitor-youtube-player")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorFirebaseAuthentication", package: "CapacitorFirebaseAuthentication"),
                .product(name: "CapacitorCamera", package: "CapacitorCamera"),
                .product(name: "CapgoCapacitorYoutubePlayer", package: "CapgoCapacitorYoutubePlayer")
            ]
        )
    ]
)
