import SwiftUI

struct OrganizeView: View {
    @EnvironmentObject private var store: HandprintStore
    @State private var draft = OrganizerDraft()
    @State private var submitted = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Action title", text: $draft.title)
                    TextField("Organizer", text: $draft.organizer)
                    TextField("Contact email", text: $draft.contactEmail)
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                    TextField("Neighborhood", text: $draft.neighborhood)
                    TextField("Location name", text: $draft.locationName)
                    TextField("Starts at", text: $draft.startsAt)
                    TextField("Duration", text: $draft.duration)
                    Stepper("Capacity: \(draft.capacity)", value: $draft.capacity, in: 1...500)
                    Picker("Category", selection: $draft.category) {
                        ForEach(EventCategory.allCases) { category in
                            Text(category.rawValue).tag(category)
                        }
                    }
                    TextField("Skills needed", text: $draft.skills)
                } header: {
                    Text("Local action")
                }

                Section {
                    TextEditor(text: $draft.summary)
                        .frame(minHeight: 120)
                } header: {
                    Text("What should participants expect?")
                }

                Section {
                    TextEditor(text: $draft.safetyNote)
                        .frame(minHeight: 90)
                } header: {
                    Text("Safety and trust notes")
                } footer: {
                    Text("Youth, medical, fundraising, campaign, and school-related actions are escalated for extra review in the pilot.")
                }

                Section {
                    Toggle("I can verify this organizer and the listing is accurate.", isOn: $draft.termsAccepted)
                } header: {
                    Text("Organizer attestation")
                }

                Section {
                    Button {
                        store.submit(draft)
                        draft = OrganizerDraft()
                        submitted = true
                    } label: {
                        Label("Submit for review", systemImage: "paperplane")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(HandprintTheme.ink)
                    .disabled(!draft.isSubmittable)

                    if submitted {
                        Text("Submitted to the trust queue.")
                            .font(.footnote)
                            .foregroundStyle(HandprintTheme.moss)
                    }
                }
            }
            .navigationTitle("Organize")
        }
    }
}
