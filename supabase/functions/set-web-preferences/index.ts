import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
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

    const PREFERENCES_ID = Deno.env.get("PREFERENCES_ID");

    if (PREFERENCES_ID === company_id) {
      const { error: updateError } = await supabase
        .from("preferences_web")
        .update({
          dollar_quote: preferences.dollar_quote,
          default_markup: preferences.default_markup,
          km_price: preferences.km_price,
          colored_sheet_difference: preferences.colored_sheet_difference,
          gate_price: preferences.gate_price,
          gutter_price: preferences.gutter_price,
          iva_percentage: preferences.iva_percentage,
          twisted_iron_column_cost: preferences.twisted_iron_column_cost,
          u_profile_column_cost: preferences.u_profile_column_cost,
          u_profile_cost: preferences.u_profile_cost,
          twisted_iron_cost: preferences.twisted_iron_cost,
          enclousure_cost: preferences.enclousure_cost,
          solid_web_price_list: preferences.solid_web_price_list,
          solid_web_columns_price_list:
            preferences.solid_web_columns_price_list,
          airbase_silos: preferences.airbase_silos,
          feeder_silos: preferences.feeder_silos,
          cone_base_45: preferences.cone_base_45,
          cone_base_55: preferences.cone_base_55,
          fiber_base_cost: preferences.fiber_base_cost,
        })
        .eq("company_id", PREFERENCES_ID)
        .select();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          message: "Se han ACTUALIZADO las preferencias",
          company_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Company ID no coincide con PREFERENCES_ID",
          received: company_id,
          expected: PREFERENCES_ID,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        },
      );
    }
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
