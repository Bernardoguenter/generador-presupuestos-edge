const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { email, password } = await req.json();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Calculadora Galpones <noreply@calculadoragalpones.com>",
        to: email,
        subject: "Tu nueva clave de acceso provisoria",
        html: `
        <div>
          <h1>Solicitaste un nuevo password</h1>
          
          <p>Ingresá a tu cuenta con los siguientes datos</p>

          <ul>
            <li>Usuario: ${email}</li>
            <li>Contraseña: ${password}</li>
          </ul>

          <p>Una vez que ingreses se te solicitará cambiar tu contraseña por una personalizada</p>
        </div>`,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : error }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
};

Deno.serve(handler);
