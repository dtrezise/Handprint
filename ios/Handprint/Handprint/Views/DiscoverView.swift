import SwiftUI
import UIKit

struct DiscoverView: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var organizationQuery = ""
    @State private var locationText = ""
    @State private var selectedCategory = "All"
    @State private var selectedListingType = "All"
    @State private var selectedRewardMode = "All"
    @State private var distanceMiles = 50.0
    @State private var hasSearched = false
    @State private var isSearching = false
    @State private var searchStatus = "Results wait until you search."
    @State private var appliedFilters: ReachSearchFilters?
    @State private var searchTask: Task<Void, Never>?
    @State private var showingProfileSettings = false
    private var locationSuggestions: [String] {
        KnownCommunity.suggestions(matching: locationText, limit: 5)
            .map(\.label)
            .filter { $0 != locationText }
    }

    private var filteredRecommendations: [Recommendation] {
        guard hasSearched, let filters = appliedFilters else { return [] }
        let normalizedQuery = filters.organizationQuery.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return store.recommendations.filter { recommendation in
            let action = recommendation.action
            let matchesQuery = normalizedQuery.isEmpty ||
                action.title.lowercased().contains(normalizedQuery) ||
                action.organizer.lowercased().contains(normalizedQuery)
            let matchesCategory = filters.category == "All" || action.category.rawValue == filters.category
            let matchesType = filters.listingType == "All" || action.listingTypeValue.label == filters.listingType
            let matchesRewards = filters.rewardMode == "All" ||
                (filters.rewardMode == "Earns rewards" && action.isRewardEligible) ||
                (filters.rewardMode == "Awareness only" && !action.isRewardEligible)
            return matchesQuery && matchesCategory && matchesType && matchesRewards && action.distanceMiles <= filters.distanceMiles
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(eyebrow: "Reach", title: "What can your hands change?", systemImage: "scope")

                    VStack(alignment: .leading, spacing: 12) {
                        DarkField(placeholder: "World Enabler or event", text: $organizationQuery)

                        DarkField(placeholder: "Location", text: $locationText)

                        if !locationSuggestions.isEmpty {
                            FlowLayout(spacing: 8) {
                                ForEach(locationSuggestions, id: \.self) { city in
                                    Button(city) {
                                        locationText = city
                                    }
                                    .font(.caption.weight(.semibold))
                                    .buttonStyle(.bordered)
                                    .tint(HandprintTheme.tide)
                                }
                            }
                        }

                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                            ReachFilterMenu(title: "Cause", value: selectedCategory) {
                                Button("All") { selectedCategory = "All" }
                                ForEach(EventCategory.allCases) { category in
                                    Button(category.rawValue) { selectedCategory = category.rawValue }
                                }
                            }

                            ReachFilterMenu(title: "Distance", value: "\(Int(distanceMiles)) mi") {
                                ForEach([25.0, 50.0, 100.0, 150.0], id: \.self) { distance in
                                    Button("\(Int(distance)) mi") { distanceMiles = distance }
                                }
                            }

                            ReachFilterMenu(title: "Rewards", value: selectedRewardMode) {
                                ForEach(["All", "Earns rewards", "Awareness only"], id: \.self) { mode in
                                    Button(mode) { selectedRewardMode = mode }
                                }
                            }

                            ReachFilterMenu(title: "Type", value: selectedListingType) {
                                Button("All") { selectedListingType = "All" }
                                ForEach(EventListingType.allCases) { type in
                                    Button(type.label) { selectedListingType = type.label }
                                }
                            }
                        }

                        if dynamicTypeSize.isAccessibilitySize {
                            VStack(spacing: 10) { searchActionButtons }
                        } else {
                            HStack(spacing: 10) { searchActionButtons }
                        }

                        Label(searchStatus, systemImage: hasSearched ? "checkmark.circle" : "info.circle")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(HandprintTheme.muted)
                    }
                    .handprintCard()

                    if store.organizationLoadState == .error || store.receiptLoadState == .error {
                        EmptyDiscoverCard(
                            title: "Some details are unavailable",
                            message: "Reach is showing saved information while Handprint reconnects."
                        )
                    }

                    if isSearching {
                        SearchLoadingCard()
                    } else if hasSearched {
                        SearchStatsBar(recommendations: filteredRecommendations)
                    }

                    if isSearching {
                        ForEach(0..<3, id: \.self) { _ in
                            SearchLoadingCard(compact: true)
                        }
                    } else if !hasSearched {
                        EmptyDiscoverCard(
                            title: "Search when ready",
                            message: "Choose a cause, location, distance, reward mode, or World Enabler keyword, then search to refresh results."
                        )
                    } else if filteredRecommendations.isEmpty {
                        EmptyDiscoverCard(
                            title: emptyTitle,
                            message: emptyMessage
                        )
                    } else {
                        ForEach(filteredRecommendations) { recommendation in
                            ActionCard(recommendation: recommendation)
                        }
                    }
                }
                .padding(14)
            }
            .handprintScreenBackground()
            .navigationTitle("Reach")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    ProfileSettingsButton { showingProfileSettings = true }
                }
            }
            .navigationDestination(for: LocalAction.self) { action in
                EventDetailView(action: action)
            }
            .navigationDestination(for: OrganizerImpactProfile.self) { organizer in
                OrganizationHandprintView(organizer: organizer)
            }
            .navigationDestination(for: ImpactReceipt.self) { receipt in
                ImpactReceiptDetailView(receipt: receipt)
            }
            .onAppear {
                if locationText.isEmpty {
                    locationText = store.profile.launchCommunity
                    distanceMiles = store.profile.radiusMiles
                }
            }
            .onChange(of: store.profile.launchCommunity) { _, newValue in
                if !newValue.isEmpty {
                    locationText = newValue
                    searchStatus = "GPS set approximate area to \(newValue)."
                }
            }
            .onDisappear {
                searchTask?.cancel()
            }
            .sheet(isPresented: $showingProfileSettings) {
                ProfileSettingsPage()
                    .environmentObject(store)
            }
        }
        .handprintKeyboardControls()
    }

    @ViewBuilder
    private var searchActionButtons: some View {
        Button {
            locationText = store.profile.launchCommunity
            distanceMiles = store.profile.radiusMiles
            store.requestApproximateLocation()
            searchStatus = "GPS used your saved approximate area."
        } label: {
            Label("GPS", systemImage: "location.fill")
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.bordered)
        .tint(HandprintTheme.tide)

        Button {
            runSearch()
        } label: {
            Label(isSearching ? "Searching" : "Search", systemImage: isSearching ? "arrow.triangle.2.circlepath" : "magnifyingglass")
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.borderedProminent)
        .tint(isSearching ? HandprintTheme.gold : HandprintTheme.moss)
        .accessibilityIdentifier("reach-search-button")

        Button {
            clearSearch()
        } label: {
            Label("Clear", systemImage: "xmark.circle")
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.bordered)
        .tint(clearIsActive ? HandprintTheme.tide : HandprintTheme.muted)
        .disabled(!clearIsActive)
        .accessibilityIdentifier("reach-clear-button")
    }

    private func runSearch() {
        guard !isSearching else { return }
        searchTask?.cancel()
        let filters = ReachSearchFilters(
            organizationQuery: organizationQuery,
            location: locationText.isEmpty ? store.profile.launchCommunity : locationText,
            category: selectedCategory,
            listingType: selectedListingType,
            rewardMode: selectedRewardMode,
            distanceMiles: distanceMiles
        )
        isSearching = true
        searchTask = Task {
            try? await Task.sleep(nanoseconds: 400_000_000)
            guard !Task.isCancelled else { return }
            await MainActor.run {
                appliedFilters = filters
                hasSearched = true
                isSearching = false
                searchStatus = "Showing results for \(filters.location)."
                searchTask = nil
            }
        }
    }

    private func clearSearch() {
        searchTask?.cancel()
        searchTask = nil
        organizationQuery = ""
        locationText = store.profile.launchCommunity
        selectedCategory = "All"
        selectedListingType = "All"
        selectedRewardMode = "All"
        distanceMiles = store.profile.radiusMiles
        hasSearched = false
        isSearching = false
        appliedFilters = nil
        searchStatus = "Results wait until you search."
    }

    private var clearIsActive: Bool {
        hasSearched ||
            !organizationQuery.isEmpty ||
            locationText != store.profile.launchCommunity ||
            selectedCategory != "All" ||
            selectedListingType != "All" ||
            selectedRewardMode != "All" ||
            distanceMiles != store.profile.radiusMiles
    }

    private var emptyTitle: String {
        let category = appliedFilters?.category ?? selectedCategory
        return category == "All" ? "No matching actions" : "No \(category.lowercased()) actions"
    }

    private var emptyMessage: String {
        let filters = appliedFilters ?? ReachSearchFilters(
            organizationQuery: organizationQuery,
            location: locationText,
            category: selectedCategory,
            listingType: selectedListingType,
            rewardMode: selectedRewardMode,
            distanceMiles: distanceMiles
        )
        if filters.rewardMode != "All" {
            return "No \(filters.rewardMode.lowercased()) listings matched. Try all rewards or widen the distance."
        }
        if filters.listingType != "All" {
            return "No \(filters.listingType.lowercased()) listings matched. Try all event types or a broader location."
        }
        if filters.category != "All" {
            return "Try all causes, a larger reach, or a nearby city to find more useful action."
        }
        return "Adjust location, reach, interests, or filters to widen what Handprint can recommend."
    }
}

private struct ReachSearchFilters: Equatable {
    let organizationQuery: String
    let location: String
    let category: String
    let listingType: String
    let rewardMode: String
    let distanceMiles: Double
}

private struct SearchLoadingCard: View {
    var compact = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(HandprintTheme.tide.opacity(0.16))
                    .frame(width: compact ? 44 : 62, height: compact ? 44 : 62)
                VStack(alignment: .leading, spacing: 8) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(.gray.opacity(0.18))
                        .frame(height: 12)
                    RoundedRectangle(cornerRadius: 6)
                        .fill(.gray.opacity(0.12))
                        .frame(width: compact ? 140 : 220, height: 10)
                }
            }
            if !compact {
                Label("Searching within reach", systemImage: "arrow.triangle.2.circlepath")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(HandprintTheme.muted)
            }
        }
        .handprintCard()
    }
}

private struct SyncStateCard: View {
    let title: String
    let state: RemoteCollectionState

    var body: some View {
        switch state {
        case .loading:
            Label("Loading \(title.lowercased())", systemImage: "arrow.triangle.2.circlepath")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(HandprintTheme.muted)
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        case .error:
            Label("\(title) unavailable", systemImage: "wifi.exclamationmark")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(HandprintTheme.coralBright)
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        case .empty:
            Label("No \(title.lowercased()) yet", systemImage: "tray")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(HandprintTheme.muted)
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        case .ready:
            EmptyView()
        }
    }
}

private struct SearchStatsBar: View {
    let recommendations: [Recommendation]

    private var usefulActions: Int {
        recommendations.filter { $0.action.isRewardEligible }.count
    }

    private var trustedHosts: Int {
        Set(recommendations.filter { $0.action.trustTier == .verified || $0.action.trustTier == .anchorPartner }.map(\.action.organizer)).count
    }

    var body: some View {
        FlowLayout(spacing: 8) {
            Label("\(usefulActions) useful", systemImage: "hands.sparkles")
            Label("\(recommendations.count) within reach", systemImage: "mappin.and.ellipse")
            Label("\(trustedHosts) trusted Enablers", systemImage: "checkmark.shield")
        }
        .font(.caption.weight(.semibold))
        .foregroundStyle(HandprintTheme.muted)
        .padding(10)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct ReachFilterMenu<Content: View>: View {
    let title: String
    let value: String
    @ViewBuilder let content: Content

    var body: some View {
        Menu {
            content
        } label: {
            VStack(alignment: .leading, spacing: 4) {
                Text(title.uppercased())
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(HandprintTheme.muted)
                HStack(spacing: 6) {
                    Text(value)
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)
                        .minimumScaleFactor(0.78)
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.up.chevron.down")
                        .font(.caption2.weight(.bold))
                }
            }
            .foregroundStyle(HandprintTheme.tideBright)
            .padding(.horizontal, 12)
            .frame(maxWidth: .infinity, minHeight: 58, alignment: .leading)
            .background(HandprintTheme.tide.opacity(0.12), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(HandprintTheme.tide.opacity(0.35), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

private struct EmptyDiscoverCard: View {
    var title = "No matching actions"
    var message = "Adjust location, reach, interests, or filters to widen what Handprint can recommend."

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: "magnifyingglass")
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(HandprintTheme.muted)
        }
        .handprintCard()
    }
}

private struct ActionCard: View {
    @EnvironmentObject private var store: HandprintStore
    let recommendation: Recommendation

    private var action: LocalAction { recommendation.action }
    private var rsvp: RsvpStatus? { store.rsvps[action.id] }
    private var isJoinable: Bool { action.status == .approved }
    private var organizer: OrganizerImpactProfile? { store.organizer(for: action) }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: action.category.symbolName)
                    .font(.title3)
                    .foregroundStyle(action.category.color)
                    .frame(width: 44, height: 44)
                    .background(action.category.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                VStack(alignment: .leading, spacing: 5) {
                    Text(action.title)
                        .font(.headline)
                        .foregroundStyle(HandprintTheme.ink)
                    Text(action.organizer)
                        .font(.subheadline)
                        .foregroundStyle(HandprintTheme.muted)
                }

            }

            FlowLayout(spacing: 8) {
                StatusPill(action: action)
                ListingPill(action: action)
                Text(action.listingTypeValue.label)
                    .font(.caption.weight(.semibold))
                    .lineLimit(1)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(action.category.color.opacity(0.12), in: Capsule())
                    .foregroundStyle(action.category.color)
            }

            Text(action.summary)
                .font(.subheadline)
                .foregroundStyle(HandprintTheme.muted)

            ReasonChips(reasons: recommendation.reasons)

            VStack(alignment: .leading, spacing: 8) {
                InfoRow(label: action.duration, value: "\(action.startsAt) - \(action.neighborhood) - \(String(format: "%.1f", action.distanceMiles)) mi", systemImage: "calendar")
                HStack(spacing: 10) {
                    Text("Fit \(recommendation.score)")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(HandprintTheme.tideBright)
                    ProgressView(value: Double(max(0, min(100, recommendation.score))), total: 100)
                        .tint(HandprintTheme.tide)
                }
            }

            Button {
                store.setRSVP(.going, for: action)
            } label: {
                Label(rsvp?.label ?? "RSVP", systemImage: rsvp == nil ? "plus" : "checkmark.circle")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(rsvp == nil ? HandprintTheme.moss : HandprintTheme.tide)
            .disabled(!isJoinable)
            .accessibilityIdentifier("action-rsvp-\(action.id)")

            HStack(spacing: 10) {
                NavigationLink(value: action) {
                    Label("Details", systemImage: "info.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                if let organizer {
                    Button {
                        store.toggleFollow(organizer)
                    } label: {
                        Label(organizer.savedByViewer == true ? "Following" : "Follow", systemImage: organizer.savedByViewer == true ? "heart.fill" : "heart")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }
            }
        }
        .handprintCard()
    }
}

private struct EventDetailView: View {
    @EnvironmentObject private var store: HandprintStore
    let action: LocalAction
    @State private var reportReason: EventReportReason = .misleading
    @State private var reportNote = ""
    @State private var didReport = false

    private var recommendation: Recommendation { store.score(action: action) }
    private var rsvp: RsvpStatus? { store.rsvps[action.id] }
    private var isJoinable: Bool { action.status == .approved }
    private var actionShareURL: URL { store.publicURL(path: "actions/\(action.id)") }
    private var organizer: OrganizerImpactProfile? { store.organizer(for: action) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 14) {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: action.category.symbolName)
                            .font(.title2)
                            .foregroundStyle(action.category.color)
                            .frame(width: 52, height: 52)
                            .background(action.category.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                        VStack(alignment: .leading, spacing: 5) {
                            Text(action.title)
                                .font(.title2.bold())
                                .fixedSize(horizontal: false, vertical: true)
                            Text(action.organizer)
                                .font(.subheadline)
                                .foregroundStyle(HandprintTheme.muted)
                        }

                        Spacer()
                    }

                    FlowLayout(spacing: 8) {
                        StatusPill(action: action)
                        ListingPill(action: action)
                        Text(action.listingTypeValue.label)
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(action.category.color.opacity(0.12), in: Capsule())
                            .foregroundStyle(action.category.color)
                    }

                    Text(action.summary)
                        .font(.body)
                        .foregroundStyle(HandprintTheme.muted)

                    ReasonChips(reasons: recommendation.reasons)
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Action details")
                        .font(.headline)
                    InfoRow(label: action.duration, value: action.startsAt, systemImage: "calendar")
                    InfoRow(label: "\(String(format: "%.1f", action.distanceMiles)) mi away", value: action.neighborhood, systemImage: "mappin.and.ellipse")
                    InfoRow(label: "Expected impact", value: action.impact, systemImage: "hands.sparkles")
                    InfoRow(label: action.rewardLabel, value: action.isRewardEligible ? "\(action.pointsValue) points" : "No points", systemImage: "seal")
                }
                .handprintCard()

                if let bridge = action.actionBridge, !bridge.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Action bridge", systemImage: "arrow.triangle.branch")
                            .font(.headline)
                        Text(bridge)
                            .font(.subheadline)
                            .foregroundStyle(HandprintTheme.muted)
                    }
                    .handprintCard()
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("Trust and safety")
                        .font(.headline)
                    Text(action.safetyNote)
                        .font(.subheadline)
                        .foregroundStyle(HandprintTheme.muted)
                    Text(action.reviewNote)
                        .font(.footnote)
                        .foregroundStyle(HandprintTheme.muted)
                }
                .handprintCard()

                if let organizer {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("World Enabler Handprint")
                            .font(.headline)
                        Text(organizer.publicSummary)
                            .font(.subheadline)
                            .foregroundStyle(HandprintTheme.muted)
                        NavigationLink(value: organizer) {
                            Label("Open \(organizer.name)", systemImage: "building.2")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(HandprintTheme.tide)
                    }
                    .handprintCard()
                }

                VStack(spacing: 10) {
                    Button {
                        store.setRSVP(.going, for: action)
                    } label: {
                        Label(rsvp?.label ?? "RSVP", systemImage: rsvp == nil ? "plus" : "checkmark.circle")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(rsvp == nil ? HandprintTheme.moss : HandprintTheme.tide)
                    .disabled(!isJoinable)

                    Button {
                        store.setRSVP(.checkedIn, for: action)
                    } label: {
                        Label("Check in", systemImage: "checkmark.seal")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .disabled(!isJoinable || rsvp == nil)

                    ShareLink(
                        item: actionShareURL,
                        subject: Text(action.title),
                        message: Text("Join me for \(action.title) through Handprint.")
                    ) {
                        Label("Share this action", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Report a concern")
                        .font(.headline)
                    Picker("Reason", selection: $reportReason) {
                        ForEach(EventReportReason.allCases) { reason in
                            Text(reason.rawValue).tag(reason)
                        }
                    }
                    TextField("What should reviewers know?", text: $reportNote, axis: .vertical)
                        .submitLabel(.done)
                        .onSubmit {
                            UIApplication.shared.dismissHandprintKeyboard()
                        }
                        .padding(12)
                        .background(HandprintTheme.field, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                        .handprintKeyboardDismissButton()
                    Button {
                        store.report(action, reason: reportReason, note: reportNote)
                        reportNote = ""
                        didReport = true
                    } label: {
                        Label("Send to review", systemImage: "exclamationmark.shield")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .tint(HandprintTheme.coral)

                    if didReport {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(store.lastReportConfirmation?.message ?? "Sent to the trust queue.")
                                .font(.footnote.weight(.semibold))
                                .foregroundStyle(HandprintTheme.mossBright)
                            Text("You can see report history on your Print page.")
                                .font(.caption)
                                .foregroundStyle(HandprintTheme.muted)
                        }
                    }
                }
                .handprintCard()
            }
            .padding(18)
        }
        .handprintScreenBackground()
        .navigationTitle("Action")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            store.selectedActionId = action.id
        }
        .handprintKeyboardControls()
    }
}
