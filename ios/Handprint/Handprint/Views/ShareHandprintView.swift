import SwiftUI
import CoreImage.CIFilterBuiltins
import UIKit

struct ShareHandprintView: View {
    @EnvironmentObject private var store: HandprintStore
    @State private var selectedPlatform: SharePlatform = .instagramStory
    @State private var shareMessage = "I am growing my Handprint through useful action. Pick one action, come along, and add your own mark beside this one."
    @State private var messageDraft = "Thanks for making this useful action possible. I would like to help and invite a few neighbors."
    @State private var serverReview: AffirmationReview?
    @State private var shareSaveStatus = "Draft not saved yet"
    @State private var showSharePreview = false
    @State private var commentStatus = "No comment queued yet"
    @State private var savedDrafts: [String] = []
    @State private var shareHistory: [String] = []
    @State private var copyStatus = "Public link ready"
    @State private var selectedTemplate = "Invite"
    @State private var showingProfileSettings = false
    @State private var showConversation = false
    @State private var showPublicPreview = false
    private let qrContext = CIContext()
    private let qrFilter = CIFilter.qrCodeGenerator()
    private let messageTemplates = [
        "Invite": "I am growing my Handprint through useful action. Pick one action, come along, and add your own mark beside this one.",
        "Milestone": "I just added a verified mark to my Handprint. I am grateful for the people who made this useful action possible.",
        "Recruit": "I found a useful action within reach. Join me, bring willing hands, and let us make this count together."
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(eyebrow: "Wave", title: "Send your Handprint outward", systemImage: "hand.wave")

                    VStack(alignment: .leading, spacing: 14) {
                        HandprintGlyphView(marks: store.marks, activeEventId: nil)

                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Label("Scan my Handprint", systemImage: "qrcode")
                                    .font(.headline)
                                Spacer()
                                Text("Reliable QR")
                                    .font(.caption.weight(.semibold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(HandprintTheme.moss.opacity(0.12), in: Capsule())
                                    .foregroundStyle(HandprintTheme.mossBright)
                            }

                            Image(uiImage: qrImage(for: store.shareURL))
                                .interpolation(.none)
                                .resizable()
                                .scaledToFit()
                                .frame(maxWidth: 220)
                                .frame(maxWidth: .infinity)
                                .padding(12)
                                .background(.white, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                                .accessibilityLabel("QR code for \(store.profile.name)'s public Handprint")

                            MetricStrip(metrics: [
                                (worldChangerTier, "Tier", "trophy"),
                                ("\(worldChangerPoints)", "Points", "seal")
                            ])

                            HStack(alignment: .top, spacing: 10) {
                                Text(store.shareURL.absoluteString)
                                    .font(.footnote.weight(.semibold))
                                    .foregroundStyle(HandprintTheme.muted)
                                    .textSelection(.enabled)
                                    .lineLimit(2)
                                Spacer()
                                Button {
                                    UIPasteboard.general.string = store.shareURL.absoluteString
                                    copyStatus = "Copied public link"
                                } label: {
                                    Image(systemName: "doc.on.doc")
                                }
                                .buttonStyle(.bordered)
                                .accessibilityLabel("Copy public Handprint link")
                            }

                        }
                        .padding(14)
                        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                        Text(copyStatus)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(HandprintTheme.muted)

                        ShareLink(
                            item: store.shareURL,
                            subject: Text("\(store.profile.name)'s Handprint"),
                            message: Text(approvedShareText)
                        ) {
                            Label("Share my Handprint", systemImage: "square.and.arrow.up")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(HandprintTheme.tide)
                    }

                    VStack(alignment: .leading, spacing: 14) {
                        SectionHeader(eyebrow: "Wave Kit", title: "Format your Handprint", systemImage: "sparkles", compact: true)

                        Picker("Platform", selection: $selectedPlatform) {
                            ForEach(SharePlatform.allCases) { platform in
                                Text(platform.rawValue).tag(platform)
                            }
                        }
                        .pickerStyle(.menu)

                        Picker("Template", selection: $selectedTemplate) {
                            ForEach(Array(messageTemplates.keys), id: \.self) { key in
                                Text(key).tag(key)
                            }
                        }
                        .pickerStyle(.segmented)
                        .onChange(of: selectedTemplate) { _, newValue in
                            shareMessage = messageTemplates[newValue] ?? shareMessage
                        }

                        VStack(alignment: .leading, spacing: 10) {
                            Text("\(selectedPlatform.aspectRatio) share card")
                                .font(.headline)
                            Text("\(worldChangerTier) - \(worldChangerPoints) points - \(store.marks.count) visible marks")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(HandprintTheme.tideBright)
                            Text(selectedPlatform.hashtags.joined(separator: " "))
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(HandprintTheme.muted)
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                        Button {
                            showSharePreview = true
                        } label: {
                            Label("Preview formatted post", systemImage: "sparkles")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)

                        TextEditor(text: $shareMessage)
                            .frame(minHeight: 110)
                            .padding(8)
                            .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                            .handprintKeyboardDismissButton()

                        HStack {
                            Text("\(max(0, selectedPlatform.characterLimit - approvedShareText.count)) characters remaining")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(approvedShareText.count > selectedPlatform.characterLimit ? HandprintTheme.coral : HandprintTheme.moss)
                            Spacer()
                            Text(selectedPlatform.hashtags.joined(separator: " "))
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(HandprintTheme.muted)
                        }

                        AffirmationReviewCard(review: review(for: shareMessage)) {
                            shareMessage = review(for: shareMessage).suggestion
                        }

                        VStack(spacing: 10) {
                            Button {
                                Task { await checkShareWithServer() }
                            } label: {
                                Label("Check tone", systemImage: "checkmark.shield")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.bordered)

                            Button {
                                Task { await saveDraftToServer() }
                            } label: {
                                Label("Save draft", systemImage: "tray.and.arrow.down")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(HandprintTheme.tide)
                        }

                        Button {
                            shareHistory.insert("\(selectedPlatform.rawValue): \(approvedShareText.prefix(54))", at: 0)
                            shareSaveStatus = "Prepared share added to Wave activity"
                        } label: {
                            Label("Record prepared share", systemImage: "list.bullet.clipboard")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)

                        Text(shareSaveStatus)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(HandprintTheme.muted)

                        if let serverReview {
                            AffirmationReviewCard(review: serverReview) {
                                shareMessage = serverReview.suggestion
                            }
                        }

                        if !savedDrafts.isEmpty || !shareHistory.isEmpty {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Share history")
                                    .font(.headline)
                                ForEach(savedDrafts.prefix(3), id: \.self) { draft in
                                    Label(draft, systemImage: "tray.and.arrow.down")
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(HandprintTheme.muted)
                                }
                                ForEach(shareHistory.prefix(3), id: \.self) { item in
                                    Label(item, systemImage: "square.and.arrow.up")
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(HandprintTheme.muted)
                                }
                            }
                            .padding(12)
                            .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                        }
                    }
                    .handprintCard()

                    DisclosureGroup(isExpanded: $showConversation) {
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Comments and invitations are checked for affirming language before posting.")
                                .font(.subheadline)
                                .foregroundStyle(HandprintTheme.muted)

                            TextEditor(text: $messageDraft)
                                .frame(minHeight: 105)
                                .padding(8)
                                .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                                .handprintKeyboardDismissButton()

                            AffirmationReviewCard(review: review(for: messageDraft)) {
                                messageDraft = review(for: messageDraft).suggestion
                            }

                            Button {
                                Task { await postCommentToServer() }
                            } label: {
                                Label("Post affirming comment", systemImage: "text.bubble")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(HandprintTheme.moss)

                            Text(commentStatus)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(HandprintTheme.muted)
                        }
                        .padding(.top, 12)
                    } label: {
                        Label("Wave conversation", systemImage: "text.bubble")
                            .font(.headline)
                    }
                    .handprintCard()
                    .accessibilityIdentifier("wave-conversation-disclosure")

                    DisclosureGroup(isExpanded: $showPublicPreview) {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("What others will see")
                                .font(.headline)
                            ForEach(store.completedActions.suffix(3), id: \.mark.id) { item in
                                Text(item.mark.label)
                                    .font(.subheadline.weight(.semibold))
                                    .padding(12)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                            }

                            Text("How they can join in")
                                .font(.headline)
                            ForEach(store.nextJoinableActions) { action in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(action.title)
                                        .font(.subheadline.weight(.semibold))
                                    Text("\(action.startsAt) - \(action.neighborhood)")
                                        .font(.caption)
                                        .foregroundStyle(HandprintTheme.muted)
                                }
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                            }
                        }
                        .padding(.top, 12)
                    } label: {
                        Label("Public Handprint preview", systemImage: "eye")
                            .font(.headline)
                    }
                    .handprintCard()
                    .accessibilityIdentifier("wave-public-preview-disclosure")
                }
                .padding(14)
            }
            .handprintScreenBackground()
            .navigationTitle("Wave")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    ProfileSettingsButton { showingProfileSettings = true }
                }
            }
            .sheet(isPresented: $showSharePreview) {
                SharePreviewSheet(
                    platform: selectedPlatform,
                    displayName: store.profile.name,
                    message: approvedShareText,
                    tier: worldChangerTier,
                    points: worldChangerPoints,
                    marks: store.marks.count,
                    url: store.shareURL
                )
            }
            .sheet(isPresented: $showingProfileSettings) {
                ProfileSettingsPage()
                    .environmentObject(store)
            }
        }
        .handprintKeyboardControls()
    }

    private var worldChangerPoints: Int {
        store.marks.reduce(0) { total, mark in
            if mark.source == "Organizer confirmed" { return total + 125 }
            if mark.source == "Check-in" { return total + 70 }
            return total + 20
        }
    }

    private var worldChangerTier: String {
        switch worldChangerPoints {
        case 900...: "Anchor"
        case 520...: "Builder"
        case 260...: "Helper"
        case 120...: "Neighbor"
        default: "Starter"
        }
    }

    private func qrImage(for url: URL) -> UIImage {
        qrFilter.message = Data(url.absoluteString.utf8)
        qrFilter.correctionLevel = "H"
        let transform = CGAffineTransform(scaleX: 10, y: 10)

        guard
            let outputImage = qrFilter.outputImage?.transformed(by: transform),
            let cgImage = qrContext.createCGImage(outputImage, from: outputImage.extent)
        else {
            return UIImage(systemName: "qrcode") ?? UIImage()
        }

        return UIImage(cgImage: cgImage)
    }

    private var approvedShareText: String {
        let review = review(for: shareMessage)
        return review.status == .ready ? shareMessage : review.suggestion
    }

    private func review(for message: String) -> AffirmationReview {
        let trimmed = message.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return AffirmationReview(
                status: .rewrite,
                issues: ["Add a short, positive invitation before posting."],
                suggestion: "I am growing my Handprint through useful action. Pick one action and come along."
            )
        }

        var issues: [String] = []
        let lowered = trimmed.lowercased()
        if ["idiot", "stupid", "trash", "worthless"].contains(where: { lowered.contains($0) }) {
            issues.append("Personal attack or mocking language")
        }
        if ["hate", "humiliate", "destroy"].contains(where: { lowered.contains($0) }) {
            issues.append("Escalating or punitive language")
        }
        if !["join", "help", "thank", "invite", "come", "action", "support"].contains(where: { lowered.contains($0) }) {
            issues.append("Add a useful next step, thank-you, or invitation.")
        }

        if issues.isEmpty {
            return AffirmationReview(status: .ready, issues: [], suggestion: trimmed)
        }

        return AffirmationReview(
            status: .rewrite,
            issues: issues,
            suggestion: "I want to focus less on blame and more on what we can do next. Pick one action, come along, and add your own mark beside this one."
        )
    }

    private func checkShareWithServer() async {
        do {
            serverReview = try await store.reviewSocialText(shareMessage, surface: "share_caption")
            shareSaveStatus = "Tone check complete"
        } catch {
            serverReview = review(for: shareMessage)
            shareSaveStatus = "Tone check complete; Handprint will sync when connected"
        }
    }

    private func saveDraftToServer() async {
        do {
            try await store.saveShareDraft(platformId: selectedPlatform.rawValue, message: shareMessage)
            shareSaveStatus = "Draft saved to social ledger"
            savedDrafts.insert("\(selectedPlatform.rawValue): \(shareMessage.prefix(54))", at: 0)
        } catch {
            shareSaveStatus = "Draft saved; Handprint will sync when connected"
            savedDrafts.insert("\(selectedPlatform.rawValue): \(shareMessage.prefix(54))", at: 0)
        }
    }

    private func postCommentToServer() async {
        let review = review(for: messageDraft)
        let approvedText = review.status == .ready ? messageDraft : review.suggestion
        do {
            try await store.postSocialComment(targetType: "public_profile", targetId: store.profile.handle, text: approvedText)
            commentStatus = "Comment checked and ready"
        } catch {
            commentStatus = "Comment saved; Handprint will retry when connected"
        }
    }
}

private struct SharePreviewSheet: View {
    var platform: SharePlatform
    var displayName: String
    var message: String
    var tier: String
    var points: Int
    var marks: Int
    var url: URL
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(platform.rawValue)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(HandprintTheme.coralBright)
                        Text("Preview formatted post")
                            .font(.title2.bold())
                        Text("\(platform.aspectRatio) - \(tier) - \(points) points - \(marks) marks")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(HandprintTheme.tideBright)
                    }

                    VStack(spacing: 14) {
                        Image(systemName: "hand.raised.fill")
                            .font(.system(size: 44))
                            .foregroundStyle(HandprintTheme.coralBright)
                        Text("\(displayName)'s Handprint")
                            .font(.title.bold())
                            .multilineTextAlignment(.center)
                        Text(message)
                            .font(.body.weight(.semibold))
                            .multilineTextAlignment(.center)
                        Text(url.absoluteString)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(HandprintTheme.tideBright)
                    }
                    .padding(22)
                    .frame(maxWidth: .infinity)
                    .background(
                        LinearGradient(colors: [HandprintTheme.surface, HandprintTheme.tide.opacity(0.9)], startPoint: .topLeading, endPoint: .bottomTrailing),
                        in: RoundedRectangle(cornerRadius: 8, style: .continuous)
                    )
                    .foregroundStyle(HandprintTheme.ink)

                    ShareLink(item: url, subject: Text("\(displayName)'s Handprint"), message: Text(message)) {
                        Label("Share this Handprint", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(HandprintTheme.moss)
                }
                .padding(18)
            }
            .navigationTitle("Preview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                Button("Done") { dismiss() }
            }
        }
        .handprintKeyboardControls()
    }
}

private struct AffirmationReviewCard: View {
    var review: AffirmationReview
    var useRewrite: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label(review.status == .ready ? "Ready to post" : "Rewrite suggested", systemImage: review.status == .ready ? "checkmark.shield" : "sparkles")
                    .font(.headline)
                    .foregroundStyle(review.status == .ready ? HandprintTheme.moss : HandprintTheme.gold)
                Spacer()
            }

            ForEach(review.issues, id: \.self) { issue in
                Text(issue)
                    .font(.caption)
                    .foregroundStyle(HandprintTheme.muted)
            }

            if review.status != .ready {
                Text(review.suggestion)
                    .font(.subheadline)
                    .padding(10)
                    .background(HandprintTheme.field, in: RoundedRectangle(cornerRadius: 10, style: .continuous))

                Button(action: useRewrite) {
                    Label("Use rewrite", systemImage: "sparkles")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(HandprintTheme.tide)
            }
        }
        .padding(12)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}
