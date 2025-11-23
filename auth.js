// FunCoin Authentication System
// This is a demo implementation using localStorage
// For production, use a proper backend with secure database

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
    this.init();
  }

  init() {
    // Check if user is logged in
    const sessionUser = localStorage.getItem("funcoin_session");
    if (sessionUser) {
      this.currentUser = JSON.parse(sessionUser);
      this.updateUIForLoggedInUser();
    }
    this.setupEventListeners();
  }

  // Load users from localStorage
  loadUsers() {
    const users = localStorage.getItem("funcoin_users");
    return users ? JSON.parse(users) : [];
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem("funcoin_users", JSON.stringify(this.users));
  }

  // Simple password hashing (for demo only - use bcrypt in production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Validate email format
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Check password strength
  checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    return {
      score: strength,
      text: strength < 2 ? "Weak" : strength < 4 ? "Medium" : "Strong",
      color: strength < 2 ? "red" : strength < 4 ? "yellow" : "green",
    };
  }

  // Register new user
  register(userData) {
    const { fullName, email, username, password, confirmPassword, agreeTerms } =
      userData;

    // Validation
    if (!fullName || !email || !username || !password || !confirmPassword) {
      return { success: false, message: "All fields are required" };
    }

    if (!this.validateEmail(email)) {
      return { success: false, message: "Invalid email format" };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match" };
    }

    if (password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters",
      };
    }

    if (!agreeTerms) {
      return {
        success: false,
        message: "You must agree to the terms and conditions",
      };
    }

    // Check if user already exists
    if (this.users.find((u) => u.email === email)) {
      return { success: false, message: "Email already registered" };
    }

    if (this.users.find((u) => u.username === username)) {
      return { success: false, message: "Username already taken" };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      username,
      password: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      emailVerified: false,
      twoFactorEnabled: false,
      walletAddress: null,
      profilePicture: null,
      funCoinBalance: 0,
    };

    this.users.push(newUser);
    this.saveUsers();

    // Send verification email (simulated)
    this.sendVerificationEmail(email);

    return {
      success: true,
      message:
        "Registration successful! Please check your email for verification.",
    };
  }

  // Login user
  login(credentials) {
    const { emailOrUsername, password, rememberMe } = credentials;

    if (!emailOrUsername || !password) {
      return {
        success: false,
        message: "Email/Username and password are required",
      };
    }

    // Find user
    const user = this.users.find(
      (u) => u.email === emailOrUsername || u.username === emailOrUsername
    );

    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    // Verify password
    if (user.password !== this.hashPassword(password)) {
      return { success: false, message: "Invalid credentials" };
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return {
        success: false,
        message: "Two-factor authentication required",
        requiresTwoFactor: true,
        userId: user.id,
      };
    }

    // Create session
    const sessionUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
      walletAddress: user.walletAddress,
      profilePicture: user.profilePicture,
      funCoinBalance: user.funCoinBalance,
    };

    this.currentUser = sessionUser;
    localStorage.setItem("funcoin_session", JSON.stringify(sessionUser));

    if (rememberMe) {
      localStorage.setItem("funcoin_remember", "true");
    }

    this.updateUIForLoggedInUser();

    return { success: true, message: "Login successful!" };
  }

  // Verify 2FA code
  verifyTwoFactor(userId, code) {
    // Simulated 2FA verification
    // In production, verify against TOTP or SMS code
    if (code === "123456") {
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        const sessionUser = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
          emailVerified: user.emailVerified,
          walletAddress: user.walletAddress,
          profilePicture: user.profilePicture,
          funCoinBalance: user.funCoinBalance,
        };

        this.currentUser = sessionUser;
        localStorage.setItem("funcoin_session", JSON.stringify(sessionUser));
        this.updateUIForLoggedInUser();

        return {
          success: true,
          message: "Two-factor authentication successful!",
        };
      }
    }
    return { success: false, message: "Invalid verification code" };
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem("funcoin_session");
    localStorage.removeItem("funcoin_remember");
    this.updateUIForLoggedOutUser();
    this.showNotification("Logged out successfully", "success");
  }

  // Social login (simulated)
  socialLogin(provider) {
    // In production, integrate with OAuth providers
    const mockUser = {
      id: Date.now().toString(),
      fullName: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      username: `${provider.toLowerCase()}_user_${Date.now()}`,
      emailVerified: true,
      twoFactorEnabled: false,
      walletAddress: null,
      profilePicture: null,
      funCoinBalance: 100,
      provider: provider,
    };

    this.currentUser = mockUser;
    localStorage.setItem("funcoin_session", JSON.stringify(mockUser));
    this.updateUIForLoggedInUser();
    this.closeModal("loginModal");
    this.showNotification(`Logged in with ${provider}!`, "success");
  }

  // Connect wallet (MetaMask)
  async connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const walletAddress = accounts[0];

        if (this.currentUser) {
          this.currentUser.walletAddress = walletAddress;
          localStorage.setItem(
            "funcoin_session",
            JSON.stringify(this.currentUser)
          );

          // Update user in database
          const userIndex = this.users.findIndex(
            (u) => u.id === this.currentUser.id
          );
          if (userIndex !== -1) {
            this.users[userIndex].walletAddress = walletAddress;
            this.saveUsers();
          }

          this.updateWalletDisplay();
          this.showNotification("Wallet connected successfully!", "success");
        }
      } catch (error) {
        this.showNotification(
          "Failed to connect wallet: " + error.message,
          "error"
        );
      }
    } else {
      this.showNotification(
        "MetaMask is not installed. Please install MetaMask to connect your wallet.",
        "error"
      );
    }
  }

  // Disconnect wallet
  disconnectWallet() {
    if (this.currentUser) {
      this.currentUser.walletAddress = null;
      localStorage.setItem("funcoin_session", JSON.stringify(this.currentUser));

      const userIndex = this.users.findIndex(
        (u) => u.id === this.currentUser.id
      );
      if (userIndex !== -1) {
        this.users[userIndex].walletAddress = null;
        this.saveUsers();
      }

      this.updateWalletDisplay();
      this.showNotification("Wallet disconnected", "success");
    }
  }

  // Send verification email (simulated)
  sendVerificationEmail(email) {
    console.log(`Verification email sent to ${email}`);
    // In production, send actual email via backend
    setTimeout(() => {
      this.showNotification(
        "Verification email sent! Check your inbox.",
        "info"
      );
    }, 1000);
  }

  // Verify email
  verifyEmail(token) {
    // Simulated email verification
    if (this.currentUser) {
      this.currentUser.emailVerified = true;
      localStorage.setItem("funcoin_session", JSON.stringify(this.currentUser));

      const userIndex = this.users.findIndex(
        (u) => u.id === this.currentUser.id
      );
      if (userIndex !== -1) {
        this.users[userIndex].emailVerified = true;
        this.saveUsers();
      }

      this.showNotification("Email verified successfully!", "success");
      this.updateUIForLoggedInUser();
    }
  }

  // Enable 2FA
  enableTwoFactor() {
    if (this.currentUser) {
      this.currentUser.twoFactorEnabled = true;
      localStorage.setItem("funcoin_session", JSON.stringify(this.currentUser));

      const userIndex = this.users.findIndex(
        (u) => u.id === this.currentUser.id
      );
      if (userIndex !== -1) {
        this.users[userIndex].twoFactorEnabled = true;
        this.saveUsers();
      }

      this.showNotification("Two-factor authentication enabled!", "success");
    }
  }

  // Disable 2FA
  disableTwoFactor() {
    if (this.currentUser) {
      this.currentUser.twoFactorEnabled = false;
      localStorage.setItem("funcoin_session", JSON.stringify(this.currentUser));

      const userIndex = this.users.findIndex(
        (u) => u.id === this.currentUser.id
      );
      if (userIndex !== -1) {
        this.users[userIndex].twoFactorEnabled = false;
        this.saveUsers();
      }

      this.showNotification("Two-factor authentication disabled", "success");
    }
  }

  // Update UI for logged in user
  updateUIForLoggedInUser() {
    // Hide login/register buttons
    document
      .querySelectorAll(".auth-logged-out")
      .forEach((el) => el.classList.add("hidden"));

    // Show user profile
    document
      .querySelectorAll(".auth-logged-in")
      .forEach((el) => el.classList.remove("hidden"));

    // Update user info
    if (this.currentUser) {
      document.querySelectorAll(".user-name").forEach((el) => {
        el.textContent = this.currentUser.fullName;
      });
      document.querySelectorAll(".user-email").forEach((el) => {
        el.textContent = this.currentUser.email;
      });
      document.querySelectorAll(".user-username").forEach((el) => {
        el.textContent = "@" + this.currentUser.username;
      });
      document.querySelectorAll(".user-balance").forEach((el) => {
        el.textContent = this.currentUser.funCoinBalance.toLocaleString();
      });

      // Update verification status
      const verificationBadge = document.getElementById("verificationBadge");
      if (verificationBadge) {
        if (this.currentUser.emailVerified) {
          verificationBadge.innerHTML =
            '<span class="text-green-500">✓ Verified</span>';
        } else {
          verificationBadge.innerHTML =
            '<span class="text-yellow-500">⚠ Not Verified</span>';
        }
      }

      // Update 2FA status
      const twoFactorStatus = document.getElementById("twoFactorStatus");
      if (twoFactorStatus) {
        twoFactorStatus.textContent = this.currentUser.twoFactorEnabled
          ? "Enabled"
          : "Disabled";
      }

      this.updateWalletDisplay();
    }

    // Close modals
    this.closeModal("loginModal");
    this.closeModal("registerModal");
  }

  // Update UI for logged out user
  updateUIForLoggedOutUser() {
    document
      .querySelectorAll(".auth-logged-out")
      .forEach((el) => el.classList.remove("hidden"));
    document
      .querySelectorAll(".auth-logged-in")
      .forEach((el) => el.classList.add("hidden"));
  }

  // Update wallet display
  updateWalletDisplay() {
    const walletDisplay = document.getElementById("walletDisplay");
    const walletConnectBtn = document.getElementById("walletConnectBtn");
    const walletDisconnectBtn = document.getElementById("walletDisconnectBtn");

    if (this.currentUser && this.currentUser.walletAddress) {
      if (walletDisplay) {
        const shortAddress =
          this.currentUser.walletAddress.substring(0, 6) +
          "..." +
          this.currentUser.walletAddress.substring(38);
        walletDisplay.textContent = shortAddress;
        walletDisplay.classList.remove("hidden");
      }
      if (walletConnectBtn) walletConnectBtn.classList.add("hidden");
      if (walletDisconnectBtn) walletDisconnectBtn.classList.remove("hidden");
    } else {
      if (walletDisplay) walletDisplay.classList.add("hidden");
      if (walletConnectBtn) walletConnectBtn.classList.remove("hidden");
      if (walletDisconnectBtn) walletDisconnectBtn.classList.add("hidden");
    }
  }

  // Show notification
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate-slide-in ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : type === "warning"
        ? "bg-yellow-500"
        : "bg-blue-500"
    } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("animate-slide-out");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Open modal
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  // Close modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const result = this.login({
          emailOrUsername: formData.get("emailOrUsername"),
          password: formData.get("password"),
          rememberMe: formData.get("rememberMe") === "on",
        });

        if (result.requiresTwoFactor) {
          this.closeModal("loginModal");
          this.openModal("twoFactorModal");
          document.getElementById("twoFactorUserId").value = result.userId;
        } else if (result.success) {
          this.showNotification(result.message, "success");
        } else {
          this.showNotification(result.message, "error");
        }
      });
    }

    // Register form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const result = this.register({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          username: formData.get("username"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
          agreeTerms: formData.get("agreeTerms") === "on",
        });

        if (result.success) {
          this.showNotification(result.message, "success");
          this.closeModal("registerModal");
          registerForm.reset();
        } else {
          this.showNotification(result.message, "error");
        }
      });

      // Password strength indicator
      const passwordInput = registerForm.querySelector(
        'input[name="password"]'
      );
      const strengthIndicator = document.getElementById("passwordStrength");
      if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener("input", (e) => {
          const strength = this.checkPasswordStrength(e.target.value);
          strengthIndicator.textContent = strength.text;
          strengthIndicator.className = `text-sm font-semibold text-${strength.color}-500`;
        });
      }
    }

    // 2FA form
    const twoFactorForm = document.getElementById("twoFactorForm");
    if (twoFactorForm) {
      twoFactorForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(twoFactorForm);
        const result = this.verifyTwoFactor(
          formData.get("userId"),
          formData.get("code")
        );

        if (result.success) {
          this.showNotification(result.message, "success");
          this.closeModal("twoFactorModal");
          twoFactorForm.reset();
        } else {
          this.showNotification(result.message, "error");
        }
      });
    }
  }
}

// Initialize auth system when DOM is loaded
let authSystem;
document.addEventListener("DOMContentLoaded", () => {
  authSystem = new AuthSystem();
});
