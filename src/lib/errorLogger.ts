import { supabase } from '../lib/supabase'

export const logError = async (
  action: string,
  error: any,
  context?: { userId?: string; userEmail?: string; page?: string; details?: any }
) => {
  const message = error?.message || String(error) || 'Unknown error'
  console.error(`[${action}]`, message, error)

  try {
    await supabase.from('error_logs').insert([{
      user_id: context?.userId || null,
      user_email: context?.userEmail || null,
      page: context?.page || window.location.pathname,
      action,
      error_message: message,
      error_details: context?.details ? JSON.stringify(context.details) : null,
    }])
  } catch {
    // silently fail — don't crash on logging error
  }
}
