import Foundation

@MainActor
final class APIClient: ObservableObject {
    static let shared = APIClient()
    @Published var token: String? {
        didSet {
            if let token = token {
                UserDefaults.standard.set(token, forKey: "llyli_token")
            } else {
                UserDefaults.standard.removeObject(forKey: "llyli_token")
            }
        }
    }

    /// Update this to your machine's IP when testing on iPhone (e.g. http://192.168.0.10:5000)
    var baseURL = URL(string: "http://localhost:5000")!

    private init() {
        token = UserDefaults.standard.string(forKey: "llyli_token")
    }

    private func url(for path: String) -> URL {
        let cleaned = path.hasPrefix("/") ? String(path.dropFirst()) : path
        return baseURL.appendingPathComponent(cleaned)
    }

    private func makeRequest(path: String, method: String = "GET", body: Data? = nil) -> URLRequest {
        let url = url(for: path)
        var request = URLRequest(url: url)
        request.httpMethod = method
        if let body = body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        return request
    }

    private func send<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw NSError(domain: "API", code: (response as? HTTPURLResponse)?.statusCode ?? -1, userInfo: nil)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    func login(email: String, password: String) async throws -> User {
        let payload = try JSONSerialization.data(withJSONObject: ["email": email, "password": password])
        let req = makeRequest(path: "api/auth/login", method: "POST", body: payload)
        let auth: AuthResponse = try await send(req)
        token = auth.token
        return auth.user
    }

    func fetchStats() async throws -> StatsOverview {
        let req = makeRequest(path: "api/stats/overview")
        return try await send(req)
    }

    func fetchCards() async throws -> [Card] {
        let req = makeRequest(path: "api/cards")
        return try await send(req)
    }

    func createCard(phrase: String, meaning: String, context: String) async throws -> Card {
        let payload = try JSONSerialization.data(withJSONObject: [
            "phrase": phrase,
            "meaning": meaning,
            "context_tag": context
        ])
        let req = makeRequest(path: "api/cards", method: "POST", body: payload)
        return try await send(req)
    }

    func deleteCard(id: String) async throws {
        let req = makeRequest(path: "api/cards/\(id)", method: "DELETE")
        let (_, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw NSError(domain: "API", code: (response as? HTTPURLResponse)?.statusCode ?? -1, userInfo: nil)
        }
    }

    func fetchReviewQueue() async throws -> [Card] {
        let req = makeRequest(path: "api/review/queue")
        return try await send(req)
    }

    func submitReview(cardID: String, grade: String) async throws -> Card {
        let payload = try JSONSerialization.data(withJSONObject: ["card_id": cardID, "grade": grade])
        let req = makeRequest(path: "api/review/submit", method: "POST", body: payload)
        return try await send(req)
    }

    func logout() {
        token = nil
    }
}
