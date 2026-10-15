// macOS GIF encoder using the system ImageIO framework; no npm runtime dependency.
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct Frame: Decodable { let path: String; let delay: Double }
guard CommandLine.arguments.count == 3 else {
    fatalError("Usage: swift encode-demo.swift frames.json output.gif")
}
let frames = try JSONDecoder().decode([Frame].self, from: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))
let output = URL(fileURLWithPath: CommandLine.arguments[2])
guard !frames.isEmpty, let destination = CGImageDestinationCreateWithURL(output as CFURL, UTType.gif.identifier as CFString, frames.count, nil) else {
    fatalError("Cannot create GIF destination")
}
CGImageDestinationSetProperties(destination, [kCGImagePropertyGIFDictionary: [kCGImagePropertyGIFLoopCount: 0]] as CFDictionary)
for frame in frames {
    try autoreleasepool {
        guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: frame.path) as CFURL, nil),
              let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
            throw NSError(domain: "READIT", code: 1, userInfo: [NSLocalizedDescriptionKey: "Cannot read frame: \(frame.path)"])
        }
        CGImageDestinationAddImage(destination, image, [kCGImagePropertyGIFDictionary: [
            kCGImagePropertyGIFDelayTime: frame.delay,
            kCGImagePropertyGIFUnclampedDelayTime: frame.delay
        ]] as CFDictionary)
    }
}
guard CGImageDestinationFinalize(destination),
      let check = CGImageSourceCreateWithURL(output as CFURL, nil),
      CGImageSourceGetCount(check) == frames.count else {
    fatalError("GIF encoding or frame-count verification failed")
}
print("Encoded \(frames.count) frames → \(output.path)")
