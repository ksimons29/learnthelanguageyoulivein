import SwiftUI

struct AddEditCardView: View {
    @EnvironmentObject var api: APIClient
    @Environment(\.dismiss) var dismiss

    var card: Card?
    var onSave: (() -> Void)?

    @State private var phrase: String = ""
    @State private var meaning: String = ""
    @State private var context: String = "other"
    @State private var error: String?
    @State private var saving = false

    var body: some View {
        Form {
            Section(header: Text("Phrase")) {
                TextField("Target phrase", text: $phrase)
            }
            Section(header: Text("Meaning / translation")) {
                TextField("Optional", text: $meaning)
            }
            Section(header: Text("Context")) {
                Picker("Context", selection: $context) {
                    ForEach(["admin", "work", "social", "transport", "other"], id: \.self) { value in
                        Text(value.capitalized).tag(value)
                    }
                }
                .pickerStyle(.segmented)
            }
            if let error = error {
                Text(error).foregroundColor(.red)
            }
            Button(action: save) {
                if saving { ProgressView() } else { Text("Save") }
            }
            .disabled(phrase.isEmpty || saving)
        }
        .navigationTitle(card == nil ? "Add phrase" : "Edit phrase")
        .onAppear {
            if let card = card {
                phrase = card.phrase
                meaning = card.meaning ?? ""
                context = card.context_tag ?? "other"
            }
        }
    }

    private func save() {
        saving = true
        error = nil
        Task {
            do {
                _ = try await api.createCard(phrase: phrase, meaning: meaning, context: context)
                onSave?()
                dismiss()
            } catch {
                self.error = "Could not save"
            }
            saving = false
        }
    }
}

struct AddEditCardView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack { AddEditCardView().environmentObject(APIClient.shared) }
    }
}
