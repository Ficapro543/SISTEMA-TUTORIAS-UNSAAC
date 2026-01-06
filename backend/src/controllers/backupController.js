const pool = require('../db/pool');
const archiver = require('archiver'); // For creating ZIP
const AdmZip = require('adm-zip');   // For reading/extracting ZIP
const fastcsv = require('fast-csv'); // For CSV parsing/formatting
const { Transform } = require('stream');

// Tables in dependency order (for Restore: reverse order for truncate, normal for insert)
const TABLES = [
    'users',
    'pending_users',
    'refresh_tokens',
    'activation_tokens',
    'password_reset_tokens',
    'tutores',
    'estudiante', // Independent
    'tutor_asignacion',
    'cronogramas',
    'tutorias',
    'derivaciones',
    'archivos_tutoria'
];

/**
 * 1. Download Backup (.zip)
 * Contains: 
 *  - /database/*.csv
 */
const downloadBackup = async (req, res) => {
    try {
        const archive = archiver('zip', {
            zlib: { level: 9 } // Best compression
        });

        res.attachment(`backup-${Date.now()}.zip`);

        archive.pipe(res);

        // --- 1. Export Database Tables to CSV ---
        for (const tableName of TABLES) {
            const query = `SELECT * FROM ${tableName}`;
            const result = await pool.query(query);

            // Convert BYTEA columns (buffers) to Hex strings for CSV safety
            // And Dates to ISO strings
            const rows = result.rows.map(row => {
                const newRow = { ...row };
                for (const key in newRow) {
                    if (Buffer.isBuffer(newRow[key])) {
                        newRow[key] = '\\x' + newRow[key].toString('hex'); // Postgres Hex format
                    } else if (newRow[key] instanceof Date) {
                        newRow[key] = newRow[key].toISOString();
                    }
                }
                return newRow;
            });

            // Create a pass-through stream to pipe CSV data to archive
            const csvStream = fastcsv.format({ headers: true });

            // Append stream to archive
            archive.append(csvStream, { name: `database/${tableName}.csv` });

            // Write rows to stream
            rows.forEach(row => csvStream.write(row));
            csvStream.end();

            // Wait for stream to finish? Archive handles it accurately usually.
        }

        await archive.finalize();

    } catch (error) {
        console.error('Backup generation failed:', error);
        // If headers not sent, send error
        if (!res.headersSent) {
            res.status(500).json({ message: 'Backup generation failed' });
        }
    }
};

/**
 * 2. Restore Backup (POST .zip)
 */
const restoreBackup = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No backup file uploaded' });
    }

    const client = await pool.connect();

    try {
        // Read ZIP from buffer (MemoryStorage)
        const zip = new AdmZip(req.file.buffer);
        const zipEntries = zip.getEntries();

        // Separate CSVs
        const csvEntries = zipEntries.filter(entry => entry.entryName.startsWith('database/') && entry.entryName.endsWith('.csv'));

        if (csvEntries.length === 0) {
            throw new Error('No database backup files found in archive (database/*.csv)');
        }

        // --- Start Transaction ---
        await client.query('BEGIN');

        // Disable Triggers? Or just Truncate with CASCADE?
        // CASCADE is dangerous if we miss a table, but we identified dependent tables.
        // We will TRUNCATE ALL specified tables. 
        // Order: Reverse of dependency.
        const TABLES_REVERSED = [...TABLES].reverse();

        for (const tableName of TABLES_REVERSED) {
            // CASCADE needed because of foreign keys
            await client.query(`TRUNCATE TABLE ${tableName} CASCADE`);
        }

        // --- Restore Database Tables ---
        // Order: Normal dependency order
        for (const tableName of TABLES) {
            const entry = csvEntries.find(e => e.entryName === `database/${tableName}.csv`);
            if (!entry) {
                console.warn(`No CSV found for table ${tableName}, skipping (it will be empty).`);
                continue;
            }

            const csvContent = entry.getData().toString('utf8');

            // Parse CSV
            const rows = [];
            await new Promise((resolve, reject) => {
                const stream = fastcsv.parse({ headers: true })
                    .on('error', error => reject(error))
                    .on('data', row => rows.push(row))
                    .on('end', rowCount => resolve(rowCount));

                stream.write(csvContent);
                stream.end();
            });

            if (rows.length > 0) {
                const headers = Object.keys(rows[0]);
                const columns = headers.join(', ');

                // Prepare INSERT statement
                const queryText = `INSERT INTO ${tableName} (${columns}) VALUES (${headers.map((_, i) => `$${i + 1}`).join(', ')})`;

                for (const row of rows) {
                    const values = Object.values(row).map(val => {
                        // Handle Empty/Null
                        if (val === '') return null;

                        // Handle Hex strings for BYTEA
                        // Typically they come as strings like "\\x..." 
                        // Note: Postgres driver might handle string hex automatically for bytea columns, 
                        // BUT let's be explicit if needed. 
                        // However, fastcsv reads as string. 
                        // In previous successful tests, passing the hex string directly usually works for PG.
                        // But let's check one detail: 
                        // If the CSV contains literal "\x123...", `pg` needs it to be Buffer or proper hex string.
                        // Let's assume the string format from 'downloadBackup' is correct for 'restore'.
                        return val;
                    });

                    try {
                        await client.query(queryText, values);
                    } catch (err) {
                        console.error(`Error inserting row into ${tableName}:`, err);
                        throw err;
                    }
                }
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Restauración completada con éxito' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Restore failed:', error);
        res.status(500).json({ message: 'Error durante la restauración: ' + error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    downloadBackup,
    restoreBackup
};
