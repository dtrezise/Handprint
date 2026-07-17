import SwiftUI

struct HandprintProfileView: View {
    @EnvironmentObject private var store: HandprintStore
    @State private var selectedMark: HandprintMark?
    @State private var selectedReceipt: ImpactReceipt?
    @State private var selectedReward: ReachReward?
    @State private var selectedSkill: SkillDetail?
    @State private var showingProfileSettings = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    HandprintGlyphView(marks: store.marks, activeEventId: store.selectedActionId)

                    if let openedHandle = store.openedPublicHandle, openedHandle != store.profile.handle {
                        VStack(alignment: .leading, spacing: 8) {
                            Label("@\(openedHandle)", systemImage: "link")
                                .font(.headline)
                            if let publicProfile = store.loadedPublicProfile {
                                Text(publicProfile.profile.statement)
                                    .font(.subheadline)
                                    .foregroundStyle(HandprintTheme.muted)
                                HStack(spacing: 10) {
                                    ForEach(publicProfile.profile.highlights.prefix(2)) { highlight in
                                        MetricTile(value: highlight.value, label: highlight.label, systemImage: "sparkles")
                                    }
                                }
                                Text("What they are doing next")
                                    .font(.headline)
                                ForEach(publicProfile.nextActions.prefix(2)) { action in
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
                            } else {
                                Text("Loading public Handprint...")
                                    .font(.subheadline)
                                    .foregroundStyle(HandprintTheme.muted)
                            }
                        }
                        .handprintCard()
                    }

                    VStack(alignment: .leading, spacing: 14) {
                        SectionHeader(eyebrow: "World Changer", title: "Identity profile", systemImage: "trophy", compact: true)

                        MetricStrip(metrics: [
                            ("\(worldChangerPoints)", "WC points", "trophy"),
                            (worldChangerTier, "Tier", "seal")
                        ])

                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Progress to Builder")
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                Text("\(min(100, Int((Double(worldChangerPoints) / 520.0) * 100)))%")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(HandprintTheme.muted)
                            }
                            ProgressView(value: min(1, Double(worldChangerPoints) / 520.0))
                                .tint(HandprintTheme.gold)
                            Text("World Enabler-confirmed marks carry more weight than RSVP or awareness-only activity.")
                                .font(.footnote)
                                .foregroundStyle(HandprintTheme.muted)
                        }
                        .padding(12)
                        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                        MetricStrip(metrics: [
                            ("\(store.rsvps.count)", "Active actions", "calendar.badge.checkmark"),
                            ("\(Set(store.marks.map(\.category)).count)", "Categories", "circle.grid.2x2")
                        ])

                        VStack(alignment: .leading, spacing: 10) {
                            Text("Skills and trust")
                                .font(.headline)
                            PillRow(labels: ["Helping hand", "Team spirit", "Willing hands", "Learner"], color: HandprintTheme.moss)
                            FlowLayout(spacing: 8) {
                                ForEach(["Writing", "Mentoring", "Driving", "Reliability"], id: \.self) { skill in
                                    Button {
                                        selectedSkill = SkillDetail(name: skill)
                                    } label: {
                                        Text("\(skill) locked")
                                            .font(.caption.weight(.semibold))
                                            .lineLimit(1)
                                            .padding(.horizontal, 10)
                                            .padding(.vertical, 7)
                                    }
                                    .buttonStyle(.bordered)
                                    .tint(HandprintTheme.muted)
                                }
                            }
                            Text("Vetted skills unlock through confirmed action history, training, legal eligibility, or World Enabler review.")
                                .font(.footnote)
                                .foregroundStyle(HandprintTheme.muted)
                        }
                    }
                    .handprintCard()

                    BadgeGridCard(items: store.completedActions) { mark in
                        selectedMark = mark
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Participation trail")
                            .font(.headline)

                        ForEach(store.completedActions.reversed(), id: \.mark.id) { item in
                            VStack(alignment: .leading, spacing: 5) {
                                Text(item.mark.label)
                                    .font(.subheadline.weight(.semibold))
                                Text("\(item.action?.organizer ?? "Verified World Enabler") - \(displayMarkSource(item.mark.source))")
                                    .font(.caption)
                                    .foregroundStyle(HandprintTheme.muted)
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                        }
                    }
                    .handprintCard()

                    NavigationLink {
                        OrganizeView()
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "hands.sparkles.fill")
                                .font(.title2)
                                .foregroundStyle(HandprintTheme.tideBright)
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Become a World Enabler")
                                    .font(.headline)
                                Text("Turn trusted action into opportunities other people can reach.")
                                    .font(.caption)
                                    .foregroundStyle(HandprintTheme.muted)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(HandprintTheme.muted)
                        }
                    }
                    .buttonStyle(.plain)
                    .handprintCard()

                    ReachRewardsCard(rewards: store.reachRewards) { reward in
                        selectedReward = reward
                    }

                    ImpactReceiptSummaryCard(receipts: store.impactReceipts) { receipt in
                        selectedReceipt = receipt
                    }

                    TrainingCredentialCard(credentials: store.trainingCredentials)

                    if !store.reports.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Report history")
                                .font(.headline)
                            ForEach(store.reports.prefix(5)) { report in
                                VStack(alignment: .leading, spacing: 5) {
                                    Text(report.reason.rawValue)
                                        .font(.subheadline.weight(.semibold))
                                    Text(store.actions.first(where: { $0.id == report.eventId })?.title ?? report.eventId)
                                        .font(.caption)
                                        .foregroundStyle(HandprintTheme.muted)
                                }
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                            }
                        }
                        .handprintCard()
                    }
                }
                .padding(14)
            }
            .handprintScreenBackground()
            .navigationTitle("Print")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    ProfileSettingsButton { showingProfileSettings = true }
                }
            }
        }
        .handprintKeyboardControls()
        .sheet(item: $selectedMark) { mark in
            BadgeDetailSheet(mark: mark, action: store.actions.first(where: { $0.id == mark.eventId }))
        }
        .sheet(item: $selectedReceipt) { receipt in
            ReceiptPraiseSheet(receipt: receipt)
        }
        .sheet(item: $selectedReward) { reward in
            RewardDetailSheet(reward: reward)
        }
        .sheet(item: $selectedSkill) { skill in
            LockedSkillSheet(skill: skill, credentials: store.trainingCredentials)
        }
        .sheet(isPresented: $showingProfileSettings) {
            ProfileSettingsPage()
        }
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
}

struct ProfileSettingsPage: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                ProfileSettingsCard()
                    .padding(18)
            }
            .handprintScreenBackground()
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done", action: dismiss.callAsFunction)
                }
            }
        }
        .handprintKeyboardControls()
    }
}

private struct SkillDetail: Identifiable {
    var id: String { name }
    let name: String
}

private enum ProfileSettingsDestination: String, CaseIterable, Identifiable {
    case account = "Account"
    case avatar = "Avatar"
    case location = "Location"
    case privacy = "Privacy"
    case notifications = "Notifications"
    case rewards = "Rewards"
    case interests = "Interests"
    case skills = "Skills"

    var id: String { rawValue }

    var systemImage: String {
        switch self {
        case .account: "person.text.rectangle"
        case .avatar: "person.crop.circle"
        case .location: "location"
        case .privacy: "lock.shield"
        case .notifications: "bell.badge"
        case .rewards: "gift"
        case .interests: "circle.grid.2x2"
        case .skills: "hand.raised"
        }
    }
}

private struct SkillOption: Identifiable {
    var id: String { name }
    let name: String
    let level: String
    let color: Color
    let locked: Bool
    let unlock: String
}

private let nativeSkillCatalog: [SkillOption] = [
    SkillOption(name: "Helping hand", level: "Entry", color: HandprintTheme.moss, locked: false, unlock: "Available to every new World Changer."),
    SkillOption(name: "Team spirit", level: "Entry", color: HandprintTheme.moss, locked: false, unlock: "Available to every new World Changer."),
    SkillOption(name: "Willing hands", level: "Entry", color: HandprintTheme.moss, locked: false, unlock: "Available to every new World Changer."),
    SkillOption(name: "Learner", level: "Entry", color: HandprintTheme.moss, locked: false, unlock: "Available to every new World Changer."),
    SkillOption(name: "Logistics", level: "Proven", color: HandprintTheme.tide, locked: false, unlock: "Can be strengthened through repeated confirmed setup and coordination work."),
    SkillOption(name: "Welcoming", level: "Proven", color: HandprintTheme.tide, locked: false, unlock: "Good fit for greeting, intake, and neighbor-facing support."),
    SkillOption(name: "Reliability", level: "Earned", color: HandprintTheme.gold, locked: true, unlock: "Unlocks after repeated confirmed attendance and positive World Enabler ratings."),
    SkillOption(name: "Writing", level: "Vetted", color: HandprintTheme.plum, locked: true, unlock: "Requires samples, training, or World Enabler approval for grants and public copy."),
    SkillOption(name: "Mentoring", level: "Vetted", color: HandprintTheme.coral, locked: true, unlock: "Requires youth-safety review or partner approval before recruiting for mentor roles."),
    SkillOption(name: "Driving", level: "Credentialed", color: HandprintTheme.gold, locked: true, unlock: "Requires legal eligibility, insurance, and World Enabler verification.")
]

private struct BadgeGridCard: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    let items: [(mark: HandprintMark, action: LocalAction?)]
    var openMark: (HandprintMark) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Badge grid")
                .font(.headline)
            LazyVGrid(columns: dynamicTypeSize.isAccessibilitySize ? [GridItem(.flexible())] : [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(items.reversed(), id: \.mark.id) { item in
                    Button {
                        openMark(item.mark)
                    } label: {
                        VStack(alignment: .leading, spacing: 8) {
                            Image(systemName: item.mark.category.symbolName)
                                .foregroundStyle(item.mark.category.color)
                                .font(.title2)
                            Text(item.mark.label)
                                .font(.caption.weight(.semibold))
                                .lineLimit(2)
                                .minimumScaleFactor(0.8)
                            Text(displayMarkSource(item.mark.source))
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(HandprintTheme.muted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(12)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct ImpactReceiptSummaryCard: View {
    let receipts: [ImpactReceipt]
    var openReceipt: (ImpactReceipt) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Impact receipts")
                .font(.headline)
            if receipts.isEmpty {
                Text("Receipts appear here after a World Enabler confirms what happened.")
                    .font(.subheadline)
                    .foregroundStyle(HandprintTheme.muted)
            } else {
                ForEach(receipts) { receipt in
                    Button {
                        openReceipt(receipt)
                    } label: {
                        VStack(alignment: .leading, spacing: 5) {
                            Text(receipt.confirmedBy)
                                .font(.caption.weight(.bold))
                                .foregroundStyle(HandprintTheme.tideBright)
                            Text(receipt.title)
                                .font(.subheadline.weight(.semibold))
                                .lineLimit(2)
                            Text(receipt.accomplishment)
                                .font(.caption)
                                .foregroundStyle(HandprintTheme.muted)
                                .lineLimit(3)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(12)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct ProfileSettingsCard: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var activeDestination: ProfileSettingsDestination?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(eyebrow: "Profile", title: "Your Handprint settings", systemImage: "person.crop.circle", compact: true)

            HStack(alignment: .center, spacing: 12) {
                Image(systemName: "person.crop.circle.fill")
                    .font(.system(size: 44))
                    .foregroundStyle(HandprintTheme.tideBright)
                    .frame(width: 56, height: 56)
                    .background(HandprintTheme.tide.opacity(0.14), in: Circle())
                VStack(alignment: .leading, spacing: 3) {
                    Text(store.profile.name)
                        .font(.headline)
                    Text("@\(store.profile.handle) - \(store.worldChangerTier)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(HandprintTheme.muted)
                }
                Spacer()
            }

            LazyVGrid(columns: dynamicTypeSize.isAccessibilitySize ? [GridItem(.flexible())] : [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(ProfileSettingsDestination.allCases) { destination in
                    Button {
                        activeDestination = destination
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: destination.systemImage)
                                .frame(width: 18)
                            Text(destination.rawValue)
                                .fixedSize(horizontal: false, vertical: true)
                            Spacer(minLength: 0)
                        }
                        .font(.caption.weight(.bold))
                        .padding(10)
                        .frame(maxWidth: .infinity)
                        .background(HandprintTheme.field, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                .stroke(HandprintTheme.tideSoft.opacity(0.55), lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("settings-\(destination.id.lowercased())")
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                InfoRow(label: "Default area", value: store.profile.launchCommunity, systemImage: "location")
                InfoRow(label: "Reach", value: "\(Int(store.profile.radiusMiles)) miles", systemImage: "scope")
                InfoRow(label: "Rewards", value: store.rewardsEnabled ? "Active" : "Hidden", systemImage: store.rewardsEnabled ? "gift" : "gift.slash")
            }

            SelectionPanel(
                title: "Interests",
                labels: store.profile.interests.sorted { $0.rawValue < $1.rawValue }.map(\.rawValue),
                empty: "Select interests to shape Reach.",
                color: HandprintTheme.tide,
                selectAction: { activeDestination = .interests },
                clearAction: { store.clearInterests() },
                canClear: !store.profile.interests.isEmpty
            )

            SelectionPanel(
                title: "Skills",
                labels: store.profile.skills.sorted(),
                empty: "Select entry skills now. Vetted skills unlock later.",
                color: HandprintTheme.moss,
                selectAction: { activeDestination = .skills },
                clearAction: { store.clearSkills() },
                canClear: !store.profile.skills.isEmpty
            )
        }
        .handprintCard()
        .sheet(item: $activeDestination) { destination in
            ProfileSettingsDestinationSheet(destination: destination)
        }
    }
}

private struct ProfileSettingsDestinationSheet: View {
    let destination: ProfileSettingsDestination

    var body: some View {
        switch destination {
        case .account:
            AccountSettingsSheet()
        case .avatar:
            AvatarSettingsSheet()
        case .location:
            LocationSettingsSheet()
        case .privacy:
            PrivacySettingsSheet()
        case .notifications:
            NotificationSettingsSheet()
        case .rewards:
            RewardsSettingsSheet()
        case .interests:
            InterestSelectionSheet()
        case .skills:
            SkillSelectionSheet()
        }
    }
}

private struct AccountSettingsSheet: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var handle = ""
    @State private var status = "Use the name you want attached to your public Handprint."

    var body: some View {
        DetailSheetScaffold(title: "Account", done: dismiss.callAsFunction) {
            CompactHeader(title: "Profile identity", subtitle: status, systemImage: "person.text.rectangle")
                .handprintCard()

            VStack(alignment: .leading, spacing: 12) {
                DarkField(placeholder: "Name", text: $name)
                DarkField(placeholder: "Handle", text: $handle)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                Button {
                    store.updateProfileIdentity(name: name, handle: handle)
                    status = "Saved to this account."
                } label: {
                    Label("Save identity", systemImage: "checkmark.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(HandprintTheme.moss)
            }
            .handprintCard()
        }
        .onAppear {
            name = store.profile.name
            handle = store.profile.handle
        }
    }
}

private struct AvatarSettingsSheet: View {
    @Environment(\.dismiss) private var dismiss
    @AppStorage("handprint.avatar.symbol") private var avatarSymbol = "person.crop.circle.fill"
    @AppStorage("handprint.avatar.skin") private var avatarSkin = "Tide"

    private let avatarSymbols = ["person.crop.circle.fill", "figure.wave", "hands.sparkles", "hand.raised.fill"]
    private let skins = ["Tide", "Moss", "Gold", "Coral"]

    var body: some View {
        DetailSheetScaffold(title: "Avatar", done: dismiss.callAsFunction) {
            CompactHeader(title: "Avatar and rank skins", subtitle: "Choose your current profile symbol and view rank styling.", systemImage: avatarSymbol)
                .handprintCard()

            VStack(alignment: .leading, spacing: 12) {
                Text("Icon")
                    .font(.headline)
                FlowLayout(spacing: 10) {
                    ForEach(avatarSymbols, id: \.self) { symbol in
                        Button {
                            avatarSymbol = symbol
                        } label: {
                            Image(systemName: symbol)
                                .font(.title2)
                                .frame(width: 46, height: 46)
                                .background(avatarSymbol == symbol ? avatarColor.opacity(0.24) : HandprintTheme.field, in: Circle())
                                .foregroundStyle(avatarSymbol == symbol ? avatarColor : HandprintTheme.muted)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Choose avatar icon \(symbol)")
                        .accessibilityAddTraits(avatarSymbol == symbol ? .isSelected : [])
                    }
                }

                Text("Skin")
                    .font(.headline)
                Picker("Skin", selection: $avatarSkin) {
                    ForEach(skins, id: \.self) { skin in
                        Text(skin).tag(skin)
                    }
                }
                .pickerStyle(.segmented)
            }
            .handprintCard()
        }
    }

    private var avatarColor: Color {
        switch avatarSkin {
        case "Moss": HandprintTheme.moss
        case "Gold": HandprintTheme.gold
        case "Coral": HandprintTheme.coral
        default: HandprintTheme.tide
        }
    }
}

private struct LocationSettingsSheet: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dismiss) private var dismiss

    private var locationBinding: Binding<String> {
        Binding(
            get: { store.profile.launchCommunity },
            set: { store.updateProfileSettings(location: $0) }
        )
    }

    private var radiusBinding: Binding<Double> {
        Binding(
            get: { store.profile.radiusMiles },
            set: { store.updateProfileSettings(radiusMiles: $0) }
        )
    }

    private var suggestions: [KnownCommunity] {
        KnownCommunity.suggestions(matching: store.profile.launchCommunity, limit: 6)
    }

    var body: some View {
        DetailSheetScaffold(title: "Location", done: dismiss.callAsFunction) {
            CompactHeader(title: "Default search area", subtitle: store.syncStatus, systemImage: "location")
                .handprintCard()

            VStack(alignment: .leading, spacing: 12) {
                DarkField(placeholder: "Default location", text: locationBinding)

                if !suggestions.isEmpty {
                    FlowLayout(spacing: 8) {
                        ForEach(suggestions) { community in
                            Button {
                                store.updateProfileSettings(location: community.label)
                            } label: {
                                SelectionPill(
                                    label: community.label,
                                    color: HandprintTheme.tide,
                                    isSelected: store.profile.launchCommunity == community.label
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Default reach")
                            .font(.subheadline.weight(.semibold))
                        Spacer()
                        Text("\(Int(store.profile.radiusMiles)) miles")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(HandprintTheme.muted)
                    }
                    Slider(value: radiusBinding, in: 10...150, step: 5)
                        .tint(HandprintTheme.tide)
                }

                Button {
                    store.requestApproximateLocation()
                } label: {
                    Label("Use nearest city from GPS", systemImage: "location.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(HandprintTheme.tide)
            }
            .handprintCard()
        }
    }
}

private struct PrivacySettingsSheet: View {
    @Environment(\.dismiss) private var dismiss
    @AppStorage("handprint.privacy.publicProfile") private var publicProfile = true
    @AppStorage("handprint.privacy.showBadges") private var showBadges = true
    @AppStorage("handprint.privacy.showReceipts") private var showReceipts = true
    @AppStorage("handprint.privacy.allowHandshakeDiscovery") private var allowShakeDiscovery = true

    var body: some View {
        DetailSheetScaffold(title: "Privacy", done: dismiss.callAsFunction) {
            CompactHeader(title: "Visibility controls", subtitle: "Defaults favor visible affirmation while still giving the user control.", systemImage: "lock.shield")
                .handprintCard()
            VStack(alignment: .leading, spacing: 12) {
                Toggle("Public World Changer page", isOn: $publicProfile)
                Toggle("Show badges by default", isOn: $showBadges)
                Toggle("Show impact receipts", isOn: $showReceipts)
                Toggle("Allow nearby Shake discovery", isOn: $allowShakeDiscovery)
            }
            .font(.subheadline.weight(.semibold))
            .handprintCard()
        }
    }
}

private struct NotificationSettingsSheet: View {
    @Environment(\.dismiss) private var dismiss
    @AppStorage("handprint.notifications.savedEvents") private var savedEvents = true
    @AppStorage("handprint.notifications.followedWorldEnablers") private var followedWorldEnablers = true
    @AppStorage("handprint.notifications.rewardMilestones") private var rewardMilestones = true
    @AppStorage("handprint.notifications.reviewUpdates") private var reviewUpdates = true

    var body: some View {
        DetailSheetScaffold(title: "Notifications", done: dismiss.callAsFunction) {
            CompactHeader(title: "Helpful nudges", subtitle: "Choose which Handprint reminders are useful to you.", systemImage: "bell.badge")
                .handprintCard()
            VStack(alignment: .leading, spacing: 12) {
                Toggle("Saved event reminders", isOn: $savedEvents)
                Toggle("Followed World Enabler updates", isOn: $followedWorldEnablers)
                Toggle("Reward milestone alerts", isOn: $rewardMilestones)
                Toggle("Review and receipt updates", isOn: $reviewUpdates)
            }
            .font(.subheadline.weight(.semibold))
            .handprintCard()
        }
    }
}

private struct RewardsSettingsSheet: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dismiss) private var dismiss

    private var rewardsBinding: Binding<Bool> {
        Binding(
            get: { store.rewardsEnabled },
            set: { store.updateProfileSettings(rewardsEnabled: $0) }
        )
    }

    var body: some View {
        DetailSheetScaffold(title: "Rewards", done: dismiss.callAsFunction) {
            CompactHeader(title: "Earned rewards", subtitle: "This hides reward prompts without deleting anything already earned.", systemImage: "gift")
                .handprintCard()

            VStack(alignment: .leading, spacing: 12) {
                Toggle("Earned rewards active", isOn: rewardsBinding)
                    .font(.subheadline.weight(.semibold))
                ForEach(store.reachRewards.prefix(3)) { reward in
                    InfoRow(label: reward.tier, value: reward.title, systemImage: "gift")
                }
            }
            .handprintCard()
        }
    }
}

private struct SelectionPanel: View {
    let title: String
    let labels: [String]
    let empty: String
    let color: Color
    var selectAction: () -> Void
    var clearAction: () -> Void
    var canClear: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(title)
                    .font(.headline)
                Spacer()
                Button("Select", action: selectAction)
                    .font(.caption.weight(.bold))
                    .buttonStyle(.bordered)
                    .tint(color)
                Button("Clear", action: clearAction)
                    .font(.caption.weight(.bold))
                    .buttonStyle(.bordered)
                    .tint(canClear ? HandprintTheme.tide : HandprintTheme.muted)
                    .disabled(!canClear)
            }

            if labels.isEmpty {
                Text(empty)
                    .font(.subheadline)
                    .foregroundStyle(HandprintTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                PillRow(labels: labels, color: color)
            }
        }
        .padding(12)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct InterestSelectionSheet: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        DetailSheetScaffold(title: "Select Interests", done: { dismiss() }) {
            CompactHeader(title: "Choose the causes you want in Reach", subtitle: "These stay organized around approved Handprint categories.", systemImage: "circle.grid.2x2")
                .handprintCard()

            FlowLayout(spacing: 10) {
                ForEach(EventCategory.allCases) { category in
                    Button {
                        store.toggleInterest(category)
                    } label: {
                        SelectionPill(
                            label: category.rawValue,
                            color: category.color,
                            isSelected: store.profile.interests.contains(category)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .handprintCard()
        }
    }
}

private struct SkillSelectionSheet: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        DetailSheetScaffold(title: "Select Skills", done: { dismiss() }) {
            CompactHeader(title: "Add skills you can offer", subtitle: "Entry skills are available now. Vetted skills explain how they unlock.", systemImage: "hand.raised")
                .handprintCard()

            VStack(alignment: .leading, spacing: 12) {
                ForEach(nativeSkillCatalog) { skill in
                    Button {
                        guard !skill.locked else { return }
                        store.toggleSkill(skill.name)
                    } label: {
                        HStack(alignment: .top, spacing: 10) {
                            SelectionPill(
                                label: skill.name,
                                color: skill.color,
                                isSelected: store.profile.skills.contains(skill.name),
                                isLocked: skill.locked
                            )
                            VStack(alignment: .leading, spacing: 3) {
                                Text(skill.level)
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(skill.color)
                                Text(skill.unlock)
                                    .font(.caption)
                                    .foregroundStyle(HandprintTheme.muted)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            Spacer(minLength: 0)
                        }
                    }
                    .buttonStyle(.plain)
                    .disabled(skill.locked)
                }
            }
            .handprintCard()
        }
    }
}

private struct ReachRewardsCard: View {
    let rewards: [ReachReward]
    var openReward: (ReachReward) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Reach Rewards")
                .font(.headline)
            Text("Rewards should expand what a World Changer can do next, not just hand out prizes.")
                .font(.subheadline)
                .foregroundStyle(HandprintTheme.muted)

            ForEach(rewards.prefix(4)) { reward in
                Button {
                    openReward(reward)
                } label: {
                    VStack(alignment: .leading, spacing: 5) {
                        HStack(alignment: .top) {
                            Text(reward.tier)
                                .font(.caption.weight(.bold))
                                .foregroundStyle(HandprintTheme.tideBright)
                            Spacer()
                            Text(reward.status)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(HandprintTheme.muted)
                                .multilineTextAlignment(.trailing)
                        }
                        Text(reward.title)
                            .font(.subheadline.weight(.semibold))
                            .lineLimit(2)
                        Text(reward.description)
                            .font(.caption)
                            .foregroundStyle(HandprintTheme.muted)
                            .lineLimit(3)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(12)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct TrainingCredentialCard: View {
    @EnvironmentObject private var store: HandprintStore
    let credentials: [TrainingCredential]
    @State private var selectedCredential: TrainingCredential?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Training credentials")
                .font(.headline)
            ForEach(credentials) { credential in
                Button {
                    selectedCredential = credential
                } label: {
                    InfoRow(label: credential.uploadState, value: "\(credential.title) - \(credential.provider)", systemImage: "checkmark.shield")
                }
                .buttonStyle(.plain)
            }
        }
        .padding(12)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .sheet(item: $selectedCredential) { credential in
            CredentialActionSheet(credential: credential)
                .environmentObject(store)
        }
    }
}

private struct CredentialActionSheet: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dismiss) private var dismiss
    let credential: TrainingCredential

    var body: some View {
        DetailSheetScaffold(title: "Credential", done: { dismiss() }) {
            CompactHeader(title: credential.title, subtitle: credential.provider, systemImage: "checkmark.shield")
                .handprintCard()
            InfoRow(label: "Current status", value: "\(credential.uploadState) - \(credential.status)", systemImage: "clock")
            InfoRow(label: "Unlock", value: credential.leadershipUnlock, systemImage: "lock.open")
            InfoRow(label: "Evidence", value: credential.evidenceLabel, systemImage: "doc")

            Button {
                store.updateCredential(credential, uploadState: "Uploaded", status: "In review", confidence: "User-submitted")
                dismiss()
            } label: {
                Label("Mark evidence uploaded", systemImage: "tray.and.arrow.up")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(HandprintTheme.tide)

            Button {
                store.updateCredential(credential, uploadState: "Verified", status: "Verified", confidence: "Partner-issued")
                dismiss()
            } label: {
                Label("Verified mark", systemImage: "checkmark.seal")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .tint(HandprintTheme.moss)
        }
    }
}

private struct BadgeDetailSheet: View {
    let mark: HandprintMark
    let action: LocalAction?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        DetailSheetScaffold(title: "Badge detail", done: dismiss.callAsFunction) {
            CompactHeader(title: mark.label, subtitle: action?.organizer ?? "Verified World Enabler", systemImage: mark.category.symbolName)
                .handprintCard()
            InfoRow(label: "Verification", value: displayMarkSource(mark.source), systemImage: "checkmark.seal")
            InfoRow(label: "Cause", value: mark.category.rawValue, systemImage: "circle.grid.2x2")
            InfoRow(label: "Evidence", value: "This badge links to the event, World Enabler, and impact evidence when available.", systemImage: "doc.badge.checkmark")
        }
    }
}

private struct ReceiptPraiseSheet: View {
    let receipt: ImpactReceipt
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        DetailSheetScaffold(title: "Impact receipt", done: dismiss.callAsFunction) {
            CompactHeader(title: receipt.title, subtitle: "A mark that mattered", systemImage: "doc.badge.checkmark")
                .handprintCard()
            InfoRow(label: "Accomplishment", value: receipt.accomplishment, systemImage: "hands.sparkles")
            InfoRow(label: "Confirmed by", value: receipt.confirmedBy, systemImage: "building.2")
            InfoRow(label: "Evidence", value: receipt.evidence, systemImage: "checkmark.seal")
        }
    }
}

private struct RewardDetailSheet: View {
    let reward: ReachReward
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        DetailSheetScaffold(title: "Reach Reward", done: dismiss.callAsFunction) {
            CompactHeader(title: reward.title, subtitle: "\(reward.tier) - \(reward.category)", systemImage: "gift")
                .handprintCard()
            InfoRow(label: "Status", value: reward.status, systemImage: "clock")
            InfoRow(label: "Requirement", value: reward.requirement, systemImage: "checkmark.seal")
            InfoRow(label: "Purpose", value: reward.description, systemImage: "arrow.up.forward")
        }
    }
}

private struct LockedSkillSheet: View {
    let skill: SkillDetail
    let credentials: [TrainingCredential]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        DetailSheetScaffold(title: "Locked skill", done: dismiss.callAsFunction) {
            CompactHeader(title: skill.name, subtitle: "Earned or vetted before recruitment", systemImage: "lock.shield")
                .handprintCard()
            InfoRow(label: "Why locked", value: "Higher-trust skills should be earned through verified action, training, legal eligibility, or World Enabler review.", systemImage: "checkmark.shield")
            ForEach(credentials.prefix(2)) { credential in
                InfoRow(label: credential.uploadState, value: "\(credential.title): \(credential.leadershipUnlock)", systemImage: "doc")
            }
        }
    }
}

private struct DetailSheetScaffold<Content: View>: View {
    let title: String
    var done: () -> Void
    @ViewBuilder var content: Content

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    content
                }
                .padding(18)
            }
            .handprintScreenBackground()
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                Button("Done", action: done)
            }
        }
        .handprintKeyboardControls()
    }
}
