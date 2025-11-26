import SwiftUI

@main
struct LlyliApp: App {
    @StateObject private var api = APIClient.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(api)
        }
    }
}

struct RootView: View {
    @EnvironmentObject var api: APIClient

    var body: some View {
        NavigationStack {
            if api.token == nil {
                LoginView()
            } else {
                DashboardView()
            }
        }
    }
}
