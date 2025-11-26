import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var api: APIClient
    @State private var stats: StatsOverview?
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Welcome back")
                            .font(.title2).bold()
                        if let stats = stats {
                            Text("You have \(stats.due_today) cards due today.")
                                .foregroundColor(.secondary)
                        }
                    }
                    Spacer()
                    Button("Logout") {
                        api.logout()
                    }
                }

                if let stats = stats {
                    HStack {
                        StatCard(title: "Due today", value: stats.due_today)
                        StatCard(title: "Total", value: stats.total_cards)
                        StatCard(title: "Last 7 days", value: stats.cards_added_last_7_days)
                    }
                } else {
                    ProgressView().padding(.vertical)
                }

                VStack(spacing: 12) {
                    NavigationLink(destination: ReviewQuestionView()) {
                        PrimaryButtonLabel(title: "Start review")
                    }
                    NavigationLink(destination: AddEditCardView()) {
                        SecondaryButtonLabel(title: "Add phrase")
                    }
                    NavigationLink(destination: CardListView()) {
                        SecondaryButtonLabel(title: "View cards")
                    }
                }

                if let error = error {
                    Text(error).foregroundColor(.red)
                }
            }
            .padding()
        }
        .navigationBarBackButtonHidden(true)
        .onAppear { Task { await loadStats() } }
    }

    private func loadStats() async {
        do {
            stats = try await api.fetchStats()
        } catch {
            self.error = "Could not load stats"
        }
    }
}

private struct StatCard: View {
    let title: String
    let value: Int
    var body: some View {
        VStack(alignment: .leading) {
            Text(title).foregroundColor(.secondary)
            Text("\(value)").font(.title).bold()
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

private struct PrimaryButtonLabel: View {
    let title: String
    var body: some View {
        Text(title)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.accentColor)
            .foregroundColor(.white)
            .cornerRadius(10)
    }
}

private struct SecondaryButtonLabel: View {
    let title: String
    var body: some View {
        Text(title)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(10)
    }
}

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack { DashboardView().environmentObject(APIClient.shared) }
    }
}
