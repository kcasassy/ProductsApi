
let currentMode = "login";

const authForm = document.getElementById("authForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

loginTab.addEventListener("click", () => {
    currentMode = "login";
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    submitBtn.textContent = "Login";
    message.textContent = "";
});

registerTab.addEventListener("click", () => {
    currentMode = "register";
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    submitBtn.textContent = "Register";
    message.textContent = "";
});

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const endpoint = currentMode === "login"
        ? "/api/Auth/login"
        : "/api/Auth/register";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            message.textContent = result.message || result.title || "Something went wrong.";
            return;
        }

        if (currentMode === "register") {
            message.textContent = "Registration successful. You can now log in.";
            return;
        }

        localStorage.setItem("token", result.token);
        window.location.href = "products.html";
    } catch {
        message.textContent = "Unable to connect to the server.";
    }
});
