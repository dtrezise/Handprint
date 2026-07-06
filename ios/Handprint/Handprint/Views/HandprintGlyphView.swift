import SwiftUI

struct HandprintGlyphView: View {
    let marks: [HandprintMark]
    var activeEventId: String?

    private let basePaths: [Path] = [
        Path { path in path.move(to: CGPoint(x: 118, y: 238)); path.addCurve(to: CGPoint(x: 122, y: 65), control1: CGPoint(x: 94, y: 205), control2: CGPoint(x: 82, y: 108)) },
        Path { path in path.move(to: CGPoint(x: 143, y: 224)); path.addCurve(to: CGPoint(x: 171, y: 30), control1: CGPoint(x: 137, y: 180), control2: CGPoint(x: 145, y: 58)) },
        Path { path in path.move(to: CGPoint(x: 174, y: 220)); path.addCurve(to: CGPoint(x: 254, y: 16), control1: CGPoint(x: 181, y: 172), control2: CGPoint(x: 224, y: 42)) },
        Path { path in path.move(to: CGPoint(x: 204, y: 232)); path.addCurve(to: CGPoint(x: 342, y: 80), control1: CGPoint(x: 226, y: 191), control2: CGPoint(x: 306, y: 91)) },
        Path { path in path.move(to: CGPoint(x: 228, y: 257)); path.addCurve(to: CGPoint(x: 402, y: 193), control1: CGPoint(x: 266, y: 233), control2: CGPoint(x: 364, y: 185)) },
        Path { path in path.move(to: CGPoint(x: 115, y: 239)); path.addCurve(to: CGPoint(x: 293, y: 344), control1: CGPoint(x: 126, y: 281), control2: CGPoint(x: 219, y: 360)) }
    ]

    private let markPaths: [Path] = [
        Path { path in path.move(to: CGPoint(x: 108, y: 228)); path.addCurve(to: CGPoint(x: 226, y: 229), control1: CGPoint(x: 142, y: 217), control2: CGPoint(x: 184, y: 216)) },
        Path { path in path.move(to: CGPoint(x: 121, y: 267)); path.addCurve(to: CGPoint(x: 256, y: 267), control1: CGPoint(x: 161, y: 251), control2: CGPoint(x: 205, y: 250)) },
        Path { path in path.move(to: CGPoint(x: 143, y: 301)); path.addCurve(to: CGPoint(x: 250, y: 309), control1: CGPoint(x: 179, y: 289), control2: CGPoint(x: 216, y: 291)) },
        Path { path in path.move(to: CGPoint(x: 151, y: 194)); path.addCurve(to: CGPoint(x: 219, y: 178), control1: CGPoint(x: 168, y: 181), control2: CGPoint(x: 190, y: 175)) },
        Path { path in path.move(to: CGPoint(x: 181, y: 146)); path.addCurve(to: CGPoint(x: 252, y: 162), control1: CGPoint(x: 203, y: 141), control2: CGPoint(x: 229, y: 146)) }
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Your Handprint")
                        .font(.caption.weight(.semibold))
                        .tracking(1.2)
                        .foregroundStyle(HandprintTheme.tide)
                    Text("Visible impact identity")
                        .font(.headline)
                }
                Spacer()
                Text("\(marks.count) marks")
                    .font(.caption.weight(.bold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(.white, in: Capsule())
            }

            Canvas { context, size in
                let scale = min(size.width / 460, size.height / 380)
                var transform = CGAffineTransform(scaleX: scale, y: scale)
                transform = transform.translatedBy(x: (size.width / scale - 460) / 2, y: 0)

                for path in basePaths {
                    context.stroke(path.applying(transform), with: .color(.black.opacity(0.24)), style: StrokeStyle(lineWidth: 11, lineCap: .round, lineJoin: .round))
                }

                for (index, mark) in marks.enumerated() {
                    let path = markPaths[index % markPaths.count]
                    let active = mark.eventId == activeEventId
                    context.stroke(path.applying(transform), with: .color(mark.category.color.opacity(active ? 1 : 0.82)), style: StrokeStyle(lineWidth: active ? 13 : 8 + mark.weight, lineCap: .round, lineJoin: .round))
                }
            }
            .frame(height: 250)
            .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .handprintCard()
    }
}
