import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetRequest {
  confirmationPhrase: string;
  adminEmail: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Only POST method allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify admin permissions
    if (user.email !== 'admin@usm.edu.co') {
      console.log('Unauthorized access attempt by:', user.email);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const body: ResetRequest = await req.json();
    
    // Validate confirmation phrase
    const expectedPhrase = 'BORRAR TODO DEFINITIVAMENTE';
    if (body.confirmationPhrase !== expectedPhrase) {
      console.log('Invalid confirmation phrase provided');
      return new Response(
        JSON.stringify({ 
          error: 'Frase de confirmación incorrecta',
          expectedPhrase: expectedPhrase
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate admin email confirmation
    if (body.adminEmail !== user.email) {
      console.log('Admin email confirmation failed');
      return new Response(
        JSON.stringify({ error: 'Confirmación de email de administrador incorrecta' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Starting database reset operation by admin:', user.email);

    // Begin the reset process
    let deletedCount = 0;
    const errors: string[] = [];

    // Delete all convocatorias
    try {
      const { data: convocatorias, error: selectError } = await supabase
        .from('convocatorias')
        .select('id');
      
      if (selectError) {
        console.error('Error selecting convocatorias:', selectError);
        errors.push(`Error al consultar convocatorias: ${selectError.message}`);
      } else if (convocatorias && convocatorias.length > 0) {
        const { error: deleteError } = await supabase
          .from('convocatorias')
          .delete()
          .neq('id', 0); // Delete all records
        
        if (deleteError) {
          console.error('Error deleting convocatorias:', deleteError);
          errors.push(`Error al eliminar convocatorias: ${deleteError.message}`);
        } else {
          deletedCount += convocatorias.length;
          console.log(`Successfully deleted ${convocatorias.length} convocatorias`);
        }
      }
    } catch (error) {
      console.error('Exception deleting convocatorias:', error);
      errors.push(`Excepción al eliminar convocatorias: ${error.message}`);
    }

    // Reset any auto-increment sequences if needed
    try {
      // This would reset the sequence for convocatorias table
      // Note: This is optional since IDs will just continue from where they left off
      console.log('Database reset operation completed');
    } catch (error) {
      console.error('Error resetting sequences:', error);
      errors.push(`Error al resetear secuencias: ${error.message}`);
    }

    // Log the operation
    console.log(`Database reset completed by ${user.email}. Records deleted: ${deletedCount}`);

    if (errors.length > 0) {
      console.log('Reset completed with errors:', errors);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Reset completado con algunos errores',
          deletedCount,
          errors
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Base de datos reseteada completamente',
        deletedCount,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Fatal error in reset-database function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});