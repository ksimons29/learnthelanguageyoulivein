import SwiftUI

struct LoginView: View {
    @EnvironmentObject var api: APIClient
    @State private var email = ""
    @State private var password = ""
    @State private var error: String?
    @State private var loading = false

    var body: some View {
        VStack(spacing: 16) {
            Text("Llyli")
                .font(.largeTitle).bold()
            Text("Log in to review your phrases")
                .foregroundColor(.secondary)
            TextField("Email", text: $email)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)
            SecureField("Password", text: $password)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)
            if let error = error {
                Text(error).foregroundColor(.red).font(.footnote)
            }
            Button(action: login) {
                if loading {
                    ProgressView()
                } else {
                    Text("Log in")
                        .frame(maxWidth: .infinity)
                }
            }
            .disabled(loading || email.isEmpty || password.isEmpty)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.accentColor)
            .foregroundColor(.white)
            .cornerRadius(10)
        }
        .padding()
    }

    private func login() {
        loading = true
        error = nil
        Task {
            do {
                _ = try await api.login(email: email, password: password)
            } catch {
                self.error = "Login failed"
            }
            loading = false
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView().environmentObject(APIClient.shared)
    }
}
