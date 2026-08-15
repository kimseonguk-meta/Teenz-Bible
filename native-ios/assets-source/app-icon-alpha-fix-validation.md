# iOS App Icon Alpha Fix Validation

The original `AppIcon-512@2x.png` was a 1024 × 1024 RGBA PNG. Apple rejected the TestFlight upload because the large iOS App Icon contained an alpha channel.

The source artwork is retained as `teenz-bible-app-icon-source.png`. It was flattened onto the Teenz Bible dark-brown surface (`#17120d`) and regenerated as the active asset-catalog file, `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.

Validation result: the replacement is a 1024 × 1024 PNG in **RGB** mode, with no alpha channel. The existing gold Bible, cross, TTB lettering, and lightning artwork remain visually intact, while the formerly transparent areas are now filled by an opaque brand-compatible background.
