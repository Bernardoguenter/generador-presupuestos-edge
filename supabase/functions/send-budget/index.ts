const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const {
    pdf,
    custsomerEmail,
    customerName,
    companyName,
    companyEmail,
    userEmail,
    userName,
  } = await req.json();

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
        to: custsomerEmail,
        reply_to: [companyEmail, userEmail],
        subject:
          `${customerName} has recibido un presupuesto de ${companyName}`,
        html: `
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <p>Estimado ${customerName}:</p>
          <p>Dada nuestra comunicación previa le hacemos llegar el siguiente presupuesto con nuestra propuesta.</p>
          <div>
            <p>Saludos</p>
            <p>${userName}</p>
            <p>${userEmail}</p>
            <p>${companyName}</p>
          </div>
        </div>`,
        attachments: pdf,
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
