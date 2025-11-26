import SwiftUI

struct CardListView: View {
    @EnvironmentObject var api: APIClient
    @State private var cards: [Card] = []
    @State private var loading = true
    @State private var error: String?
    @State private var showAdd = false

    var body: some View {
        List {
            if loading {
                ProgressView()
            }
            ForEach(cards) { card in
                VStack(alignment: .leading, spacing: 4) {
                    Text(card.phrase).font(.headline)
                    Text(card.meaning ?? "").foregroundColor(.secondary)
                    Text(card.context_tag ?? "other").font(.caption).foregroundColor(.secondary)
                }
                .swipeActions {
                    Button(role: .destructive) { Task { await deleteCard(card) } } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
        .navigationTitle("Cards")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showAdd = true }) { Image(systemName: "plus") }
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { Task { await loadCards() } }) { Image(systemName: "arrow.clockwise") }
            }
        }
        .onAppear { Task { await loadCards() } }
        .alert(isPresented: .constant(error != nil)) {
            Alert(title: Text("Error"), message: Text(error ?? ""), dismissButton: .default(Text("OK"), action: { error = nil }))
        }
        .sheet(isPresented: $showAdd) {
            NavigationStack {
                AddEditCardView(onSave: { Task { await loadCards() } })
                    .environmentObject(api)
            }
        }
    }

    private func loadCards() async {
        loading = true
        error = nil
        do {
            cards = try await api.fetchCards()
        } catch {
            self.error = "Could not load cards"
        }
        loading = false
    }

    private func deleteCard(_ card: Card) async {
        do {
            try await api.deleteCard(id: card.id)
            await loadCards()
        } catch {
            self.error = "Delete failed"
        }
    }
}

struct CardListView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack { CardListView().environmentObject(APIClient.shared) }
    }
}
