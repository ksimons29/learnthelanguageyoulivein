import SwiftUI

struct ReviewQuestionView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var api: APIClient
    @State private var queue: [Card] = []
    @State private var loading = true
    @State private var error: String?
    @State private var showAnswer = false

    var body: some View {
        VStack(spacing: 16) {
            if loading {
                ProgressView("Loading queue...")
            } else if queue.isEmpty {
                Text("You're done for today!")
                    .font(.title2)
                Button("Back to dashboard") { dismiss() }
            } else {
                let card = queue.first!
                Text("Card 1 of \(queue.count)")
                    .foregroundColor(.secondary)
                VStack(alignment: .leading, spacing: 12) {
                    Text(card.context_tag ?? "other").font(.caption).foregroundColor(.secondary)
                    Text(card.phrase)
                        .font(.title2).bold()
                    if showAnswer {
                        ReviewAnswerView(card: card) { grade in
                            Task { await handleGrade(grade: grade) }
                        }
                    }
                }
                if !showAnswer {
                    Button("Show answer") { showAnswer = true }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            if let error = error {
                Text(error).foregroundColor(.red)
            }
        }
        .padding()
        .navigationTitle("Review")
        .onAppear { Task { await loadQueue() } }
    }

    private func loadQueue() async {
        loading = true
        error = nil
        showAnswer = false
        do {
            queue = try await api.fetchReviewQueue()
        } catch {
            self.error = "Could not load queue"
        }
        loading = false
    }

    private func handleGrade(grade: String) async {
        guard let card = queue.first else { return }
        do {
            _ = try await api.submitReview(cardID: card.id, grade: grade)
            queue.removeFirst()
            showAnswer = false
        } catch {
            self.error = "Submit failed"
        }
    }
}
