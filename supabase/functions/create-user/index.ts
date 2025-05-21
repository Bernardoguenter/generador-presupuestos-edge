import { createClient } from "jsr:@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generatePassword(length = 12) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => charset[x % charset.length])
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { email, fullName, role, company_id } = await req.json();

    if (!email || !fullName || !role || !company_id) {
      throw new Error("E-mail, nombre, role y compañia son requeridos");
    }

    const password = generatePassword();

    // 1. Crear el usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    // 2. Insertar el usuario en la tabla "users"
    const { error: insertError } = await supabase
      .from("users")
      .insert({
        id: authUser.user.id,
        email,
        fullName,
        role,
        company_id,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        message: "Usuario creado correctamente",
        user: authUser.user,
        password,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    } else {
      return new Response(
        JSON.stringify({ error: "An unknown error occurred" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }
  }
});
