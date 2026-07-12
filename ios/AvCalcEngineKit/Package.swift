// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "AvCalcEngineKit",
    platforms: [.iOS(.v13)],
    products: [
        .library(name: "AvCalcEngineKit", targets: ["AvCalcEngineKit"]),
    ],
    targets: [
        .target(name: "AvCalcEngineKit"),
        .testTarget(name: "AvCalcEngineKitTests", dependencies: ["AvCalcEngineKit"]),
    ]
)
