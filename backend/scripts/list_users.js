require('dotenv').config();
const pool = require('../src/db/pool');

(async () => {
  try {
    console.log('\n🔍 CONSULTANDO USUARIOS...\n');
    
    // Consulta principal de usuarios
    const usersQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.roles,
        u.is_active,
        u.created_at,
        t.cubiculo
      FROM users u
      LEFT JOIN tutores t ON u.id = t.user_id
      ORDER BY u.created_at DESC
    `;
    
    const result = await pool.query(usersQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ No hay usuarios registrados.\n');
    } else {
      console.log(`📊 Total de usuarios: ${result.rows.length}\n`);
      console.log('═'.repeat(80));
      
      result.rows.forEach((u, i) => {
        console.log(`\n${i + 1}. ${u.first_name} ${u.last_name}`);
        console.log(`   📧 Email: ${u.email}`);
        console.log(`   👤 Roles: ${u.roles.join(', ')}`);
        console.log(`   ✓ Activo: ${u.is_active ? '✅ Sí' : '❌ No'}`);
        if (u.cubiculo) {
          console.log(`   🏢 Cubículo: ${u.cubiculo}`);
        }
        console.log(`   📅 Creado: ${new Date(u.created_at).toLocaleString('es-ES')}`);
        console.log(`   🆔 ID: ${u.id}`);
      });
      
      console.log('\n' + '═'.repeat(80));
      
      // Estadísticas
      const activeCount = result.rows.filter(u => u.is_active).length;
      const inactiveCount = result.rows.length - activeCount;
      
      const roleStats = {};
      result.rows.forEach(u => {
        u.roles.forEach(role => {
          roleStats[role] = (roleStats[role] || 0) + 1;
        });
      });
      
      console.log('\n📈 ESTADÍSTICAS:');
      console.log(`   Usuarios activos: ${activeCount}`);
      console.log(`   Usuarios inactivos: ${inactiveCount}`);
      console.log('\n📊 POR ROL:');
      Object.entries(roleStats).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });
    }
    
    // Usuarios pendientes
    console.log('\n' + '═'.repeat(80));
    console.log('\n🕐 USUARIOS PENDIENTES DE APROBACIÓN:\n');
    
    const pendingQuery = `
      SELECT id, first_name, last_name, email, roles, created_at
      FROM pending_users
      ORDER BY created_at DESC
    `;
    
    const pendingResult = await pool.query(pendingQuery);
    
    if (pendingResult.rows.length === 0) {
      console.log('✅ No hay usuarios pendientes.\n');
    } else {
      console.log(`📊 Total pendientes: ${pendingResult.rows.length}\n`);
      
      pendingResult.rows.forEach((u, i) => {
        console.log(`${i + 1}. ${u.first_name} ${u.last_name}`);
        console.log(`   📧 Email: ${u.email}`);
        console.log(`   👤 Roles solicitados: ${u.roles.join(', ')}`);
        console.log(`   📅 Solicitado: ${new Date(u.created_at).toLocaleString('es-ES')}`);
        console.log('');
      });
    }
    
    await pool.end();
    console.log('✅ Consulta completada.\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
})();
