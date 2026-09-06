const { supabase } = require("../db/supabase");

const register = async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide full name, email, and password." });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        error:
          "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY.",
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name.trim(),
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = {
      id: data.user?.id,
      full_name: data.user?.user_metadata?.full_name || full_name.trim(),
      email: data.user?.email || email,
      created_at: data.user?.created_at,
    };

    const token = data.session?.access_token || null;

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({
      error: "Server error during registration.",
      details: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide email and password." });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        error:
          "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY.",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    const user = profile || {
      id: data.user.id,
      full_name: data.user.user_metadata?.full_name || "",
      email: data.user.email,
      created_at: data.user.created_at,
    };

    if (profileError) {
      console.error("Profile lookup failed:", profileError.message);
    }

    return res.status(200).json({
      user,
      token: data.session?.access_token || null,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
};

module.exports = { register, login };
