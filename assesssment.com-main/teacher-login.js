"use strict";

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("emailInput");

const passwordInput =
  document.getElementById(
    "passwordInput"
  );

const rememberInput =
  document.getElementById(
    "rememberInput"
  );

const loginButton =
  document.getElementById(
    "loginButton"
  );

const loginButtonText =
  document.getElementById(
    "loginButtonText"
  );

const loginSpinner =
  document.getElementById(
    "loginSpinner"
  );

const loginMessage =
  document.getElementById(
    "loginMessage"
  );

const togglePasswordButton =
  document.getElementById(
    "togglePasswordButton"
  );


function setLoginMessage(
  message,
  type = "error"
) {
  loginMessage.textContent = message;
  loginMessage.className =
    `login-message ${type}`;
}


function clearLoginMessage() {
  loginMessage.textContent = "";
  loginMessage.className =
    "login-message hidden";
}


function setLoginLoading(isLoading) {
  loginButton.disabled = isLoading;

  loginButtonText.textContent =
    isLoading
      ? "正在驗證帳號……"
      : "登入老師後台";

  loginSpinner.classList.toggle(
    "hidden",
    !isLoading
  );
}


function translateLoginError(error) {
  const message =
    String(error?.message || "")
      .toLowerCase();

  if (
    message.includes(
      "invalid login credentials"
    )
  ) {
    return "Email 或密碼不正確，請重新確認。";
  }

  if (
    message.includes(
      "email not confirmed"
    )
  ) {
    return "此帳號尚未完成 Email 驗證。";
  }

  if (
    message.includes(
      "too many requests"
    )
  ) {
    return "登入嘗試次數過多，請稍後再試。";
  }

  if (
    error?.code ===
      "ACCOUNT_INACTIVE" ||
    error?.code ===
      "ROLE_DENIED" ||
    error?.code ===
      "PROFILE_MISSING"
  ) {
    return error.message;
  }

  return (
    error?.message ||
    "登入失敗，請確認網路與 Supabase 設定。"
  );
}


loginForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();
    clearLoginMessage();

    const email =
      emailInput.value
        .trim()
        .toLowerCase();

    const password =
      passwordInput.value;

    if (!email || !password) {
      setLoginMessage(
        "請輸入 Email 與密碼。"
      );

      return;
    }

    setLoginLoading(true);

    try {
      if (!rememberInput.checked) {
        sessionStorage.setItem(
          "teacher-session-only",
          "true"
        );
      } else {
        sessionStorage.removeItem(
          "teacher-session-only"
        );
      }

      await signInTeacher(
        email,
        password
      );

      setLoginMessage(
        "登入成功，正在開啟老師後台……",
        "success"
      );

      window.location.replace(
        TEACHER_PORTAL_PAGE
      );

    } catch (error) {
      console.error(
        "老師登入失敗：",
        error
      );

      setLoginMessage(
        translateLoginError(error)
      );

      passwordInput.select();

    } finally {
      setLoginLoading(false);
    }
  }
);


togglePasswordButton.addEventListener(
  "click",
  () => {
    const isHidden =
      passwordInput.type ===
      "password";

    passwordInput.type =
      isHidden
        ? "text"
        : "password";

    togglePasswordButton.textContent =
      isHidden
        ? "隱藏"
        : "顯示";

    togglePasswordButton.setAttribute(
      "aria-label",
      isHidden
        ? "隱藏密碼"
        : "顯示密碼"
    );
  }
);


window.addEventListener(
  "DOMContentLoaded",
  async () => {
    const parameters =
      new URLSearchParams(
        window.location.search
      );

    const reason =
      parameters.get("reason");

    const reasonMessages = {
      signin_required:
        "請先登入才能開啟老師後台。",

      profile_missing:
        "找不到此帳號的後台使用者資料。",

      access_denied:
        "此帳號目前沒有老師後台權限。"
    };

    if (reasonMessages[reason]) {
      setLoginMessage(
        reasonMessages[reason]
      );
    }

    try {
      await redirectSignedInTeacher();
    } catch (error) {
      console.warn(
        "登入狀態檢查失敗：",
        error
      );
    }
  }
);
