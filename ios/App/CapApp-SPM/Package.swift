// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(name: "capacitor-ios", path: "../capacitor-plugins/capacitor-ios"),
        .package(name: "capacitor-camera", path: "../capacitor-plugins/capacitor-camera"),
        .package(name: "capacitor-filesystem", path: "../capacitor-plugins/capacitor-filesystem"),
        .package(name: "capacitor-share", path: "../capacitor-plugins/capacitor-share"),
        .package(name: "capacitor-browser", path: "../capacitor-plugins/capacitor-browser"),
        .package(name: "capacitor-firebase-authentication", path: "../capacitor-plugins/capacitor-firebase-authentication"),
        .package(name: "save-to-photos", path: "../capacitor-plugins/save-to-photos"),
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-ios"),
                .product(name: "Cordova", package: "capacitor-ios"),
                .product(name: "CapacitorCamera", package: "capacitor-camera"),
                .product(name: "CapacitorFilesystem", package: "capacitor-filesystem"),
                .product(name: "CapacitorShare", package: "capacitor-share"),
                .product(name: "CapacitorBrowser", package: "capacitor-browser"),
                .product(name: "CapacitorFirebaseAuthentication", package: "capacitor-firebase-authentication"),
                .product(name: "SaveToPhotos", package: "save-to-photos"),
            ])
    ]
)
