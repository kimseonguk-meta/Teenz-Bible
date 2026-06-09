// swift-tools-version: 5.9
import PackageDescription
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
        .package(name: "CapacitorCommunityAppleSignIn", path: "../capacitor-plugins/capacitor-community-apple-sign-in"),
        .package(name: "CapacitorFirebaseAuthentication", path: "../capacitor-plugins/capacitor-firebase-authentication"),
        .package(name: "CapacitorBrowser", path: "../capacitor-plugins/capacitor-browser"),
        .package(name: "CapacitorCamera", path: "../capacitor-plugins/capacitor-camera"),
        .package(name: "CapacitorFilesystem", path: "../capacitor-plugins/capacitor-filesystem"),
        .package(name: "CapacitorShare", path: "../capacitor-plugins/capacitor-share"),
        .package(name: "SaveToPhotos", path: "../capacitor-plugins/save-to-photos")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCommunityAppleSignIn", package: "CapacitorCommunityAppleSignIn"),
                .product(name: "CapacitorFirebaseAuthentication", package: "CapacitorFirebaseAuthentication"),
                .product(name: "CapacitorBrowser", package: "CapacitorBrowser"),
                .product(name: "CapacitorCamera", package: "CapacitorCamera"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "SaveToPhotosPlugin", package: "SaveToPhotos")
            ]
        )
    ]
)
