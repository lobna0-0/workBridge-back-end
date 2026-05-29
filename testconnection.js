const supabase = require('./config/supabase');

async function testConnection() {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.log("Connection Error:", error.message);
  } else {
    console.log("Supabase Connected Successfully");
    console.log(data);
  }
}

testConnection();