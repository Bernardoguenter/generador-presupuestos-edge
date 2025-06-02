import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { company_id, preferences } = await req.json();

    if (!preferences || !company_id) {
      throw new Error("El id de la empresa y las preferencias son requeridas");
    }

    const { error: insertError } = await supabase
      .from("company_settings")
      .insert({
        company_id: company_id,
        dollar_quote: preferences.dollar_quote,
        default_markup: preferences.default_markup,
        wharehouse_prices: preferences.wharehouse_prices,
        shed_prices: preferences.shed_prices,
        gate_price: preferences.gate_price,
        gutter_price: preferences.gutter_price,
        km_price: preferences.km_price,
        colored_sheet_difference: preferences.colored_sheet_difference,
        u_profile_difference: preferences.u_profile_difference,
        solid_web_difference: preferences.solid_web_difference,
        IVA_percentage: preferences.IVA_percentage,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        message: "Se han insertado las preferencias",
        company_id,
        preferences,
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
