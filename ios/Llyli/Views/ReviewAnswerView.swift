import SwiftUI

struct ReviewAnswerView: View {
    let card: Card
    var onGrade: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(card.meaning ?? "No meaning yet")
                .font(.title3)
            HStack {
                GradeButton(title: "Again", color: .red) { onGrade("again") }
                GradeButton(title: "Hard", color: .orange) { onGrade("hard") }
                GradeButton(title: "Good", color: .blue) { onGrade("good") }
                GradeButton(title: "Easy", color: .green) { onGrade("easy") }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

private struct GradeButton: View {
    let title: String
    let color: Color
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .frame(maxWidth: .infinity)
                .padding(8)
                .background(color.opacity(0.1))
                .foregroundColor(color)
                .cornerRadius(8)
        }
    }
}

struct ReviewAnswerView_Previews: PreviewProvider {
    static var previews: some View {
        let sample = Card(id: "1", phrase: "hola", meaning: "hello", context_tag: "social", created_at: nil, updated_at: nil, next_review_at: nil, interval_days: 0, easiness_factor: 2.5, repetition: 0, suspended: false)
        ReviewAnswerView(card: sample, onGrade: { _ in })
    }
}
