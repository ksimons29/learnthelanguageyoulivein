import Foundation

struct User: Codable {
    let id: String
    let email: String
    let target_language: String?
    let timezone: String?
    let created_at: String?
}

struct AuthResponse: Codable {
    let user: User
    let token: String
}

struct Card: Codable, Identifiable {
    let id: String
    let phrase: String
    let meaning: String?
    let context_tag: String?
    let created_at: String?
    let updated_at: String?
    let next_review_at: String?
    let interval_days: Int?
    let easiness_factor: Double?
    let repetition: Int?
    let suspended: Bool?
}

struct StatsOverview: Codable {
    let total_cards: Int
    let cards_added_last_7_days: Int
    let due_today: Int
    let reviewed_today: Int
}
