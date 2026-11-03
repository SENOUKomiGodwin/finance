const supabase = require('../config/database');

class FinancialData {
  static async create({ user_id, file_name, file_type, data, metadata = {} }) {
    const { data: result, error } = await supabase
      .from('financial_data')
      .insert([{ 
        user_id, 
        file_name, 
        file_type, 
        data, 
        metadata 
      }])
      .select('id, user_id, file_name, file_type, created_at')
      .single();

    if (error) throw error;
    return result;
  }

  static async findByUserId(user_id) {
    const { data, error } = await supabase
      .from('financial_data')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('financial_data')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getAll() {
    const { data, error } = await supabase
      .from('financial_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async update(id, { data, metadata }) {
    const { data: result, error } = await supabase
      .from('financial_data')
      .update({ data, metadata, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('financial_data')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  static async filterByDateRange(user_id, start_date, end_date) {
    const { data, error } = await supabase
      .from('financial_data')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', start_date)
      .lte('created_at', end_date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

module.exports = FinancialData;
