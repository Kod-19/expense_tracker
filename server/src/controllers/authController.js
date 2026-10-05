import supabase, { supabaseAdmin } from "../config/supabase.js";

const buildSessionResponse = (session) => {
  if (!session) {
    return null;
  }

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
  };
};

export const register = async (req, res) => {
  try {
    const { email, password, full_name: fullName } = req.body;

    // 1. Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and full name are required",
      });
    }

    // 2. Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        message: "Registration failed",
      });
    }

    // 3. Get the newly created user's ID
    const userId = data.user.id;

    // 4. Create the user's profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName,
      });

    if (profileError) {
      return res.status(500).json({
        success: false,
        message: "User created, but profile creation failed",
      });
    }

    // 5. Return success
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: userId,
        email: data.user.email,
        full_name: fullName,
      },
      session: buildSessionResponse(data.session),
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    // 3. Return authenticated user and token
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: data.user,
      session: buildSessionResponse(data.session),
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const refreshSession = async (req, res) => {
  try {
    const { refresh_token: refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Session refreshed successfully",
      user: data.user,
      session: buildSessionResponse(data.session),
    });
  } catch (error) {
    console.error("Refresh session error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: "Supabase service role key is required to revoke sessions",
      });
    }

    const { error } = await supabaseAdmin.auth.admin.signOut(token);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
