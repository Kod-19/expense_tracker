import supabase from "../config/supabase.js";

export const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // 1. Validate required fields
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and full name are required",
      });
    }

    // 2. Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 3. Get the newly created user's ID
    const userId = data.user.id;

    // 4. Create the user's profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name,
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
        full_name,
      },
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
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};