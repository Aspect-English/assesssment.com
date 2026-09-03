"use strict";

const TEACHER_LOGIN_PAGE = "teacher-login.html";
const TEACHER_PORTAL_PAGE = "teacher.html";

function redirectToLogin(reason = "") {
  const query = reason
    ? `?reason=${encodeURIComponent(reason)}`
    : "";

  window.location.replace(
    `${TEACHER_LOGIN_PAGE}${query}`
  );
}

async function getCurrentSession() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

async function getCurrentProfile(userId) {
  const { data, error } =
    await supabaseClient
      .from("profiles")
      .select(
        [
          "id",
          "email",
          "display_name",
          "role",
          "status"
        ].join(",")
      )
      .eq("id", userId)
      .single();

  if (error) {
    throw error;
  }

  return data;
}

async function requireTeacherAccess() {
  const session =
    await getCurrentSession();

  if (!session?.user) {
    redirectToLogin(
      "signin_required"
    );

    return null;
  }

  try {
    const profile =
      await getCurrentProfile(
        session.user.id
      );

    console.log(
      "老師後台權限檢查：",
      {
        authUserId:
          session.user.id,

        authEmail:
          session.user.email,

        profileId:
          profile?.id,

        profileEmail:
          profile?.email,

        role:
          profile?.role,

        status:
          profile?.status
      }
    );

    if (!profile) {
      console.warn(
        "找不到老師 profile：",
        session.user.id
      );

      await supabaseClient.auth
        .signOut();

      redirectToLogin(
        "profile_missing"
      );

      return null;
    }

    const role =
      String(
        profile.role || ""
      )
        .trim()
        .toLowerCase();

    const status =
      String(
        profile.status || ""
      )
        .trim()
        .toLowerCase();

    const allowedRoles = [
      "teacher",
      "admin"
    ];

    const hasTeacherAccess =
      status === "active" &&
      allowedRoles.includes(
        role
      );

    console.log(
      "老師後台權限結果：",
      {
        role,
        status,
        hasTeacherAccess
      }
    );

    if (!hasTeacherAccess) {
      console.warn(
        "老師後台權限不足：",
        {
          role,
          status,
          email:
            profile.email
        }
      );

      await supabaseClient.auth
        .signOut();

      redirectToLogin(
        "access_denied"
      );

      return null;
    }

    return {
      session,
      user:
        session.user,
      profile: {
        ...profile,
        role,
        status
      }
    };

  } catch (error) {
    console.error(
      "老師後台權限檢查失敗：",
      error
    );

    await supabaseClient.auth
      .signOut();

    redirectToLogin(
      "profile_missing"
    );

    return null;
  }
}

async function signInTeacher(
  email,
  password
) {
  const { data, error } =
    await supabaseClient.auth
      .signInWithPassword({
        email,
        password
      });

  if (error) {
    throw error;
  }

  let profile;

  try {
    profile = await getCurrentProfile(
      data.user.id
    );
  } catch (error) {
    await supabaseClient.auth.signOut();

    const profileError = new Error(
      "登入帳號尚未建立後台使用者資料。"
    );

    profileError.code =
      "PROFILE_MISSING";

    throw profileError;
  }

  if (profile.status !== "active") {
    await supabaseClient.auth.signOut();

    const inactiveError = new Error(
      "此帳號目前已停用，請聯絡管理員。"
    );

    inactiveError.code =
      "ACCOUNT_INACTIVE";

    throw inactiveError;
  }

  if (
    !["teacher", "admin"].includes(
      profile.role
    )
  ) {
    await supabaseClient.auth.signOut();

    const roleError = new Error(
      "此帳號沒有老師後台權限。"
    );

    roleError.code =
      "ROLE_DENIED";

    throw roleError;
  }

  return {
    ...data,
    profile
  };
}

async function signOutTeacher() {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    throw error;
  }

  window.location.replace(
    TEACHER_LOGIN_PAGE
  );
}

async function redirectSignedInTeacher() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return false;
  }

  try {
    const profile =
      await getCurrentProfile(
        session.user.id
      );

    if (
      profile.status === "active" &&
      ["teacher", "admin"].includes(
        profile.role
      )
    ) {
      window.location.replace(
        TEACHER_PORTAL_PAGE
      );

      return true;
    }
  } catch (error) {
    console.warn(
      "既有登入狀態檢查失敗：",
      error
    );
  }

  return false;
}
